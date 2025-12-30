package com.margelo.nitro.sharedtransition

import android.animation.ObjectAnimator
import android.graphics.BitmapFactory
import android.os.Handler
import android.os.Looper
import android.util.Base64
import android.view.View
import android.widget.FrameLayout
import android.widget.ImageView
import androidx.annotation.Keep
import com.facebook.proguard.annotations.DoNotStrip
import com.facebook.react.uimanager.ThemedReactContext
import com.margelo.nitro.core.Promise
import com.margelo.nitro.core.resolve
import java.net.URL
import kotlin.coroutines.resume
import kotlin.coroutines.suspendCoroutine

/**
 * Native view for rendering captured snapshots during transitions
 *
 * Displays snapshot images captured from SharedElements during
 * the transition animation. The actual animation is controlled
 * by Reanimated through transform styles on this view's container.
 */
@DoNotStrip
@Keep
class HybridSnapshotView(
    private val context: ThemedReactContext
) : HybridSnapshotViewSpec() {

    private val mainHandler = Handler(Looper.getMainLooper())

    // View hierarchy
    private val containerView = FrameLayout(context)
    private val imageView = ImageView(context)

    override val view: View = containerView

    // Props
    private var _snapshotUri: String = ""
    override var snapshotUri: String
        get() = _snapshotUri
        set(value) {
            _snapshotUri = value
            loadSnapshot()
        }

    private var _snapshotWidth: Double = 0.0
    override var snapshotWidth: Double
        get() = _snapshotWidth
        set(value) {
            _snapshotWidth = value
            updateLayout()
        }

    private var _snapshotHeight: Double = 0.0
    override var snapshotHeight: Double
        get() = _snapshotHeight
        set(value) {
            _snapshotHeight = value
            updateLayout()
        }

    private var _resizeMode: ResizeMode = ResizeMode.COVER
    override var resizeMode: ResizeMode
        get() = _resizeMode
        set(value) {
            _resizeMode = value
            updateScaleType()
        }

    init {
        setupViews()
    }

    private fun setupViews() {
        containerView.clipChildren = true
        imageView.scaleType = ImageView.ScaleType.CENTER_CROP

        containerView.addView(
            imageView,
            FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
        )
    }

    override fun fadeOut(duration: Double): Promise<Unit> {
        return Promise.async {
            suspendCoroutine { continuation ->
                mainHandler.post {
                    val animator = ObjectAnimator.ofFloat(containerView, "alpha", 1f, 0f)
                    animator.duration = duration.toLong()
                    animator.addListener(object : android.animation.AnimatorListenerAdapter() {
                        override fun onAnimationEnd(animation: android.animation.Animator) {
                            continuation.resume(Unit)
                        }
                    })
                    animator.start()
                }
            }
        }
    }

    private fun loadSnapshot() {
        if (_snapshotUri.isEmpty()) {
            imageView.setImageBitmap(null)
            return
        }

        Thread {
            try {
                val bitmap = when {
                    _snapshotUri.startsWith("file://") -> {
                        val path = _snapshotUri.removePrefix("file://")
                        BitmapFactory.decodeFile(path)
                    }
                    _snapshotUri.startsWith("data:") -> {
                        // Handle base64 data URI
                        val base64Part = _snapshotUri.substringAfter(";base64,")
                        val bytes = Base64.decode(base64Part, Base64.DEFAULT)
                        BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                    }
                    else -> {
                        // Try as URL
                        val url = URL(_snapshotUri)
                        BitmapFactory.decodeStream(url.openStream())
                    }
                }

                // Update on main thread
                mainHandler.post {
                    imageView.setImageBitmap(bitmap)
                }
            } catch (e: Exception) {
                // Failed to load snapshot
                e.printStackTrace()
            }
        }.start()
    }

    private fun updateLayout() {
        val params = imageView.layoutParams as? FrameLayout.LayoutParams
        params?.width = _snapshotWidth.toInt()
        params?.height = _snapshotHeight.toInt()
        imageView.layoutParams = params
    }

    private fun updateScaleType() {
        imageView.scaleType = when (_resizeMode) {
            ResizeMode.CONTAIN -> ImageView.ScaleType.FIT_CENTER
            ResizeMode.STRETCH -> ImageView.ScaleType.FIT_XY
            ResizeMode.COVER -> ImageView.ScaleType.CENTER_CROP
        }
    }
}
