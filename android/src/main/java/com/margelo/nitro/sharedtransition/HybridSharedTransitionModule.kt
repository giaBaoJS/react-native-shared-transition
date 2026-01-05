package com.margelo.nitro.sharedtransition

import android.graphics.Bitmap
import android.graphics.Canvas
import android.os.Handler
import android.os.Looper
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
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
 * - Precise layout measurement in screen coordinates
 * - Element visibility control
 *
 * Uses modern Android APIs:
 * - View.draw() for snapshot capture
 * - No deprecated UIManager/findNodeHandle APIs
 */
@DoNotStrip
@Keep
class HybridSharedTransitionModule(
    private val context: ReactApplicationContext
) : HybridSharedTransitionModuleSpec() {

    // Cached snapshots by nativeID (URI -> file path)
    private val cachedSnapshots = mutableMapOf<String, String>()

    // Hidden elements by nativeID
    private val hiddenElements = mutableSetOf<String>()

    // Clone views by view tag
    private val cloneViews = mutableMapOf<Int, View>()

    // Counter for clone view tags
    private var cloneViewTagCounter = 1000

    // Main thread handler
    private val mainHandler = Handler(Looper.getMainLooper())

    override fun measureNode(nativeId: String): Promise<SharedElementNodeData> {
        return Promise.async {
            withContext(Dispatchers.Main) {
                val view = findViewByNativeID(nativeId)
                    ?: throw Exception("View not found: $nativeId")

                // Get position on screen (screen-relative)
                val location = IntArray(2)
                view.getLocationOnScreen(location)

                // Detect content type
                val contentType = detectContentType(view)

                // Capture snapshot
                val snapshotUri = captureSnapshotSync(view, nativeId)

                val layout = SharedElementLayout(
                    x = location[0].toDouble(),
                    y = location[1].toDouble(),
                    width = view.width.toDouble(),
                    height = view.height.toDouble()
                )

                SharedElementNodeData(
                    layout = layout,
                    contentType = contentType,
                    snapshotUri = snapshotUri
                )
            }
        }
    }

    override fun captureSnapshot(nativeId: String): Promise<String> {
        return Promise.async {
            withContext(Dispatchers.Main) {
                val view = findViewByNativeID(nativeId)
                    ?: throw Exception("View not found: $nativeId")

                captureSnapshotSync(view, nativeId)
            }
        }
    }

    override fun prepareTransition(
        startNodeId: String,
        endNodeId: String,
        config: TransitionConfig
    ): Promise<PreparedTransitionData> {
        return Promise.async {
            withContext(Dispatchers.Main) {
                val startView = findViewByNativeID(startNodeId)
                    ?: throw Exception("Start view not found: $startNodeId")

                val endView = findViewByNativeID(endNodeId)
                    ?: throw Exception("End view not found: $endNodeId")

                // Get screen locations
                val startLocation = IntArray(2)
                val endLocation = IntArray(2)
                startView.getLocationOnScreen(startLocation)
                endView.getLocationOnScreen(endLocation)

                // Capture snapshots
                val startSnapshotUri = captureSnapshotSync(startView, startNodeId)
                val endSnapshotUri = captureSnapshotSync(endView, endNodeId)

                // Detect content types
                val startContentType = detectContentType(startView)
                val endContentType = detectContentType(endView)

                val startLayout = SharedElementLayout(
                    x = startLocation[0].toDouble(),
                    y = startLocation[1].toDouble(),
                    width = startView.width.toDouble(),
                    height = startView.height.toDouble()
                )

                val endLayout = SharedElementLayout(
                    x = endLocation[0].toDouble(),
                    y = endLocation[1].toDouble(),
                    width = endView.width.toDouble(),
                    height = endView.height.toDouble()
                )

                PreparedTransitionData(
                    startLayout = startLayout,
                    endLayout = endLayout,
                    startSnapshotUri = startSnapshotUri,
                    endSnapshotUri = endSnapshotUri,
                    startContentType = startContentType,
                    endContentType = endContentType
                )
            }
        }
    }

    override fun createCloneView(nativeId: String): Promise<Double> {
        return Promise.async {
            withContext(Dispatchers.Main) {
                val originalView = findViewByNativeID(nativeId)
                    ?: throw Exception("View not found: $nativeId")

                val activity = context.currentActivity
                    ?: throw Exception("No activity available")

                // Create bitmap of the view
                val bitmap = Bitmap.createBitmap(
                    originalView.width,
                    originalView.height,
                    Bitmap.Config.ARGB_8888
                )
                val canvas = Canvas(bitmap)
                originalView.draw(canvas)

                // Create ImageView with the bitmap
                val cloneView = ImageView(context).apply {
                    setImageBitmap(bitmap)
                    scaleType = ImageView.ScaleType.FIT_XY
                }

                // Position in screen coordinates
                val location = IntArray(2)
                originalView.getLocationOnScreen(location)

                // Get decoration view for overlay
                val decorView = activity.window.decorView as ViewGroup

                // Add to decoration view
                val layoutParams = ViewGroup.LayoutParams(
                    originalView.width,
                    originalView.height
                )
                decorView.addView(cloneView, layoutParams)

                // Position the clone
                cloneView.x = location[0].toFloat()
                cloneView.y = location[1].toFloat()

                // Generate tag
                val viewTag = cloneViewTagCounter++
                cloneViews[viewTag] = cloneView

                viewTag.toDouble()
            }
        }
    }

    override fun destroyCloneView(viewTag: Double) {
        val tag = viewTag.toInt()

        mainHandler.post {
            cloneViews[tag]?.let { cloneView ->
                (cloneView.parent as? ViewGroup)?.removeView(cloneView)
                cloneViews.remove(tag)
            }
        }
    }

    override fun setNodeHidden(nativeId: String, hidden: Boolean) {
        mainHandler.post {
            findViewByNativeID(nativeId)?.let { view ->
                view.visibility = if (hidden) View.INVISIBLE else View.VISIBLE

                if (hidden) {
                    hiddenElements.add(nativeId)
                } else {
                    hiddenElements.remove(nativeId)
                }
            }
        }
    }

    override fun cleanup() {
        mainHandler.post {
            // Remove all cached snapshots
            cachedSnapshots.values.forEach { uri ->
                if (uri.startsWith("file://")) {
                    File(uri.removePrefix("file://")).delete()
                }
            }
            cachedSnapshots.clear()

            // Show all hidden elements
            hiddenElements.forEach { nativeId ->
                findViewByNativeID(nativeId)?.visibility = View.VISIBLE
            }
            hiddenElements.clear()

            // Remove all clone views
            cloneViews.values.forEach { view ->
                (view.parent as? ViewGroup)?.removeView(view)
            }
            cloneViews.clear()
        }
    }

    // =========================================================================
    // Private Helpers
    // =========================================================================

    /**
     * Capture snapshot synchronously (must be called on main thread)
     */
    private fun captureSnapshotSync(view: View, nativeId: String): String {
        // Check cache
        cachedSnapshots[nativeId]?.let { return it }

        // Ensure view has valid size
        if (view.width <= 0 || view.height <= 0) {
            throw Exception("View has zero size")
        }

        // Create bitmap
        val bitmap = Bitmap.createBitmap(
            view.width,
            view.height,
            Bitmap.Config.ARGB_8888
        )

        // Draw view to canvas
        val canvas = Canvas(bitmap)
        view.draw(canvas)

        // Save to file
        val safeNativeId = nativeId.replace("/", "_").replace(":", "_")
        val fileName = "shared_transition_${safeNativeId}_${System.currentTimeMillis()}.png"
        val file = File(context.cacheDir, fileName)

        FileOutputStream(file).use { out ->
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
        }

        val uri = "file://${file.absolutePath}"
        cachedSnapshots[nativeId] = uri

        return uri
    }

    /**
     * Detect the content type of a view
     */
    private fun detectContentType(view: View): SharedElementContentType {
        // Check if it's an ImageView
        if (view is ImageView) {
            return SharedElementContentType.IMAGE
        }

        // Check if it contains an ImageView as direct child
        if (view is ViewGroup) {
            for (i in 0 until view.childCount) {
                if (view.getChildAt(i) is ImageView) {
                    return SharedElementContentType.IMAGE
                }
            }
        }

        // Default to snapshot
        return SharedElementContentType.SNAPSHOT
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
     * Recursive view search
     */
    private fun findViewRecursive(viewGroup: ViewGroup, nativeId: String): View? {
        for (i in 0 until viewGroup.childCount) {
            val child = viewGroup.getChildAt(i)

            // Check tag (React Native uses this for nativeID in Fabric)
            if (child.tag == nativeId) {
                return child
            }

            // Check content description (fallback)
            if (child.contentDescription == nativeId) {
                return child
            }

            // Try to access nativeID via reflection (for compatibility)
            try {
                val methods = child.javaClass.methods
                val getNativeId = methods.find { it.name == "getNativeId" }
                val viewNativeId = getNativeId?.invoke(child) as? String
                if (viewNativeId == nativeId) {
                    return child
                }
            } catch (_: Exception) {
                // Ignore reflection errors
            }

            // Search recursively
            if (child is ViewGroup) {
                findViewRecursive(child, nativeId)?.let { return it }
            }
        }
        return null
    }
}
