package com.margelo.nitro.sharedtransition

import android.graphics.Bitmap
import android.graphics.Canvas
import android.view.View
import android.view.ViewGroup
import androidx.annotation.Keep
import com.facebook.proguard.annotations.DoNotStrip
import com.facebook.react.bridge.ReactApplicationContext
import com.margelo.nitro.core.Promise
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream

/**
 * Native module for shared element transitions on Android
 *
 * Provides Fabric-safe APIs for:
 * - View snapshot capture using View.draw()
 * - Precise layout measurement
 * - Element registration and tracking
 *
 * Does NOT use deprecated APIs (UIManager, findNodeHandle).
 */
@DoNotStrip
@Keep
class HybridSharedTransitionModule(
    private val context: ReactApplicationContext
) : HybridSharedTransitionModuleSpec() {

    // Registered elements by nativeID
    private val registeredElements = mutableMapOf<String, String>()

    // Cached snapshots by nativeID
    private val cachedSnapshots = mutableMapOf<String, String>()

    override fun captureSnapshot(nativeId: String): Promise<SnapshotData> {
        return Promise.async {
            withContext(Dispatchers.Main) {
                val view = findViewByNativeID(nativeId)
                    ?: throw Exception("View not found: $nativeId")

                // Create bitmap from view
                val bitmap = Bitmap.createBitmap(
                    view.width,
                    view.height,
                    Bitmap.Config.ARGB_8888
                )
                val canvas = Canvas(bitmap)
                view.draw(canvas)

                // Save to temporary file
                val safeNativeId = nativeId.replace("/", "_")
                val fileName = "snapshot_${safeNativeId}_${System.currentTimeMillis()}.png"
                val file = File(context.cacheDir, fileName)

                withContext(Dispatchers.IO) {
                    FileOutputStream(file).use { out ->
                        bitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
                    }
                }

                val uri = "file://${file.absolutePath}"
                cachedSnapshots[nativeId] = uri

                SnapshotData(
                    uri = uri,
                    width = view.width.toDouble(),
                    height = view.height.toDouble()
                )
            }
        }
    }

    override fun measureLayout(nativeId: String): Promise<NativeLayout> {
        return Promise.async {
            withContext(Dispatchers.Main) {
                val view = findViewByNativeID(nativeId)
                    ?: throw Exception("View not found: $nativeId")

                // Get position in parent
                val x = view.left.toDouble()
                val y = view.top.toDouble()

                // Get position on screen (screen-relative)
                val location = IntArray(2)
                view.getLocationOnScreen(location)

                NativeLayout(
                    x = x,
                    y = y,
                    width = view.width.toDouble(),
                    height = view.height.toDouble(),
                    pageX = location[0].toDouble(),
                    pageY = location[1].toDouble()
                )
            }
        }
    }

    override fun registerElement(nativeId: String, transitionId: String) {
        registeredElements[nativeId] = transitionId
    }

    override fun unregisterElement(nativeId: String) {
        registeredElements.remove(nativeId)
        // Clean up cached snapshot
        cachedSnapshots[nativeId]?.let { uri ->
            if (uri.startsWith("file://")) {
                File(uri.removePrefix("file://")).delete()
            }
        }
        cachedSnapshots.remove(nativeId)
    }

    override fun prepareTransition(
        sourceNativeId: String,
        targetNativeId: String
    ): Promise<PreparedTransition> {
        return Promise.async {
            // Capture and measure source
            val sourceSnapshot = captureSnapshot(sourceNativeId).await()
            val sourceLayout = measureLayout(sourceNativeId).await()

            // Capture and measure target
            val targetSnapshot = captureSnapshot(targetNativeId).await()
            val targetLayout = measureLayout(targetNativeId).await()

            PreparedTransition(
                source = TransitionElement(
                    snapshot = sourceSnapshot,
                    layout = sourceLayout
                ),
                target = TransitionElement(
                    snapshot = targetSnapshot,
                    layout = targetLayout
                )
            )
        }
    }

    override fun cleanup() {
        // Remove cached snapshot files
        cachedSnapshots.values.forEach { uri ->
            if (uri.startsWith("file://")) {
                File(uri.removePrefix("file://")).delete()
            }
        }
        cachedSnapshots.clear()
    }

    /**
     * Find a view by its nativeID prop (Fabric-safe)
     */
    private fun findViewByNativeID(nativeId: String): View? {
        val activity = context.currentActivity ?: return null
        val rootView = activity.window.decorView.rootView as? ViewGroup ?: return null
        return findViewRecursive(rootView, nativeId)
    }

    /**
     * Recursive view search by tag (React Native uses tag for nativeID in Fabric)
     */
    private fun findViewRecursive(viewGroup: ViewGroup, nativeId: String): View? {
        for (i in 0 until viewGroup.childCount) {
            val child = viewGroup.getChildAt(i)

            // Check if this view has the nativeID as tag
            val tag = child.tag
            if (tag == nativeId) {
                return child
            }

            // Check content description (sometimes used for accessibility)
            if (child.contentDescription == nativeId) {
                return child
            }

            // Try to get nativeID from React Native's internal property
            try {
                val nativeIdField = child.javaClass.getDeclaredField("mNativeId")
                nativeIdField.isAccessible = true
                val viewNativeId = nativeIdField.get(child) as? String
                if (viewNativeId == nativeId) {
                    return child
                }
            } catch (_: Exception) {
                // Field doesn't exist or can't be accessed
            }

            // Search recursively in child ViewGroups
            if (child is ViewGroup) {
                val found = findViewRecursive(child, nativeId)
                if (found != null) {
                    return found
                }
            }
        }
        return null
    }
}
