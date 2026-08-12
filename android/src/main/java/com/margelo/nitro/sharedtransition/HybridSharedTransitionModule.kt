package com.margelo.nitro.sharedtransition

import android.app.Activity
import android.app.Application
import android.graphics.Bitmap
import android.graphics.Canvas
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.View
import android.view.ViewGroup
import androidx.annotation.Keep
import com.facebook.proguard.annotations.DoNotStrip
import com.margelo.nitro.core.Promise
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import java.lang.ref.WeakReference

/**
 * Native module for shared element transitions on Android.
 *
 * All view work happens on the main thread (Nitro promises run on a background
 * dispatcher, so view access is wrapped in withContext(Dispatchers.Main)).
 *
 * Views are found by the `nativeID` prop, which React Native stores as the
 * `view_tag_native_id` view tag.
 */
@DoNotStrip
@Keep
class HybridSharedTransitionModule : HybridSharedTransitionModuleSpec() {

  /** Files written by captureSnapshot, removed on cleanup() (main thread only) */
  private val snapshotFiles = mutableListOf<File>()

  /** nativeIDs currently hidden through setNodeHidden (main thread only) */
  private val hiddenNodes = mutableSetOf<String>()

  private val mainHandler = Handler(Looper.getMainLooper())

  override fun measureNode(nativeId: String): Promise<MeasuredFrame> {
    return Promise.async {
      withContext(Dispatchers.Main) {
        val view = findView(nativeId)
          ?: throw IllegalStateException("View not found for nativeID \"$nativeId\"")
        if (!view.isAttachedToWindow) {
          throw IllegalStateException("View \"$nativeId\" is not attached to a window")
        }
        val location = IntArray(2)
        view.getLocationInWindow(location)

        // getLocationInWindow() is relative to the Activity window, which
        // includes the status bar strip. The overlay, however, is positioned
        // inside React Native's root view — a child of android.R.id.content,
        // which sits *below* the status bar unless the host app made it
        // translucent. Reporting raw window coordinates therefore offsets every
        // overlay downward by the status bar height on a default setup.
        // Subtracting the content root's own origin makes the returned frame
        // content-relative, which matches where the overlay actually lives and
        // is a no-op when the status bar is translucent.
        val origin = IntArray(2)
        ActivityHolder.currentActivity
          ?.findViewById<View>(android.R.id.content)
          ?.getLocationInWindow(origin)

        val density = view.resources.displayMetrics.density
        MeasuredFrame(
          x = (location[0] - origin[0]) / density.toDouble(),
          y = (location[1] - origin[1]) / density.toDouble(),
          width = view.width / density.toDouble(),
          height = view.height / density.toDouble()
        )
      }
    }
  }

  override fun captureSnapshot(nativeId: String): Promise<SnapshotResult> {
    return Promise.async {
      val (bitmap, width, height) = withContext(Dispatchers.Main) {
        val view = findView(nativeId)
          ?: throw IllegalStateException("View not found for nativeID \"$nativeId\"")
        if (view.width <= 0 || view.height <= 0) {
          throw IllegalStateException("View \"$nativeId\" has zero size")
        }
        val bitmap = Bitmap.createBitmap(view.width, view.height, Bitmap.Config.ARGB_8888)
        view.draw(Canvas(bitmap))
        val density = view.resources.displayMetrics.density
        Triple(
          bitmap,
          view.width / density.toDouble(),
          view.height / density.toDouble()
        )
      }

      // File I/O off the main thread. The bitmap is recycled in a finally block:
      // a full-screen ARGB_8888 bitmap is several megabytes, and every escape
      // route out of this block (no activity, disk full, permission denied)
      // would otherwise leak it.
      try {
        val cacheDir = ActivityHolder.currentActivity?.cacheDir
          ?: throw IllegalStateException("No activity available for cache directory")
        val safeId = nativeId.replace(Regex("[^A-Za-z0-9_-]"), "_")
        val file = File(cacheDir, "shared_transition_${safeId}_${System.currentTimeMillis()}.png")
        withContext(Dispatchers.IO) {
          FileOutputStream(file).use { out ->
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
          }
        }

        withContext(Dispatchers.Main) {
          snapshotFiles.add(file)
        }

        SnapshotResult(
          uri = "file://${file.absolutePath}",
          width = width,
          height = height
        )
      } finally {
        bitmap.recycle()
      }
    }
  }

  override fun setNodeHidden(nativeId: String, hidden: Boolean) {
    mainHandler.post {
      if (hidden) hiddenNodes.add(nativeId) else hiddenNodes.remove(nativeId)
      // Use alpha instead of visibility: visibility changes can conflict
      // with Fabric prop updates and trigger layout.
      findView(nativeId)?.alpha = if (hidden) 0f else 1f
    }
  }

  override fun cleanup() {
    mainHandler.post {
      hiddenNodes.forEach { nativeId ->
        findView(nativeId)?.alpha = 1f
      }
      hiddenNodes.clear()

      val files = snapshotFiles.toList()
      snapshotFiles.clear()
      Thread {
        files.forEach { it.delete() }
      }.start()
    }
  }

  // ===========================================================================
  // View lookup
  // ===========================================================================

  private fun findView(nativeId: String): View? {
    val activity = ActivityHolder.currentActivity ?: return null
    val root = activity.window?.decorView as? ViewGroup ?: return null
    return findViewRecursive(root, nativeId)
  }

  private fun findViewRecursive(group: ViewGroup, nativeId: String): View? {
    for (i in 0 until group.childCount) {
      val child = group.getChildAt(i)

      // React Native stores nativeID as the view_tag_native_id tag.
      if (child.getTag(com.facebook.react.R.id.view_tag_native_id) == nativeId) {
        return child
      }
      // testID fallback (plain view tag on Android).
      if (child.tag == nativeId) {
        return child
      }
      if (child is ViewGroup) {
        findViewRecursive(child, nativeId)?.let { return it }
      }
    }
    return null
  }

  companion object {
    @Suppress("unused")
    private const val TAG = "SharedTransitionModule"
  }
}

/**
 * Static holder for the current Activity.
 * Populated by [SharedTransitionInitProvider] before Application.onCreate().
 */
@DoNotStrip
@Keep
object ActivityHolder {
  // Written from the main thread by the lifecycle callbacks, but read from the
  // Promise.async coroutine (a background thread), so both need @Volatile for
  // the reader to be guaranteed a non-stale value.
  @Volatile private var activityRef: WeakReference<Activity>? = null
  @Volatile private var isInitialized = false

  val currentActivity: Activity?
    get() = activityRef?.get()

  // The ContentProvider and SharedTransitionPackage can both reach this.
  @Synchronized
  fun init(application: Application) {
    if (isInitialized) return
    isInitialized = true

    application.registerActivityLifecycleCallbacks(object :
      Application.ActivityLifecycleCallbacks {
      override fun onActivityCreated(activity: Activity, savedInstanceState: Bundle?) {
        activityRef = WeakReference(activity)
      }

      override fun onActivityStarted(activity: Activity) {
        activityRef = WeakReference(activity)
      }

      override fun onActivityResumed(activity: Activity) {
        activityRef = WeakReference(activity)
      }

      override fun onActivityPaused(activity: Activity) {}
      override fun onActivityStopped(activity: Activity) {}
      override fun onActivitySaveInstanceState(activity: Activity, outState: Bundle) {}
      override fun onActivityDestroyed(activity: Activity) {
        if (activityRef?.get() === activity) {
          activityRef = null
        }
      }
    })
  }
}
