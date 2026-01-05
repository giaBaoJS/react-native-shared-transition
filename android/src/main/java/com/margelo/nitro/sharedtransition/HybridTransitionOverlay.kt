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
import java.net.URL
import kotlin.coroutines.resume
import kotlin.coroutines.suspendCoroutine

/**
 * Native view for rendering transition overlays
 *
 * Displays snapshot images during shared element transitions.
 * Position/scale animations are controlled via Reanimated transforms.
 *
 * Features:
 * - Efficient image loading from file/data URIs
 * - Native fade animations
 * - Multiple resize modes
 */
@DoNotStrip
@Keep
class HybridTransitionOverlay(
    private val context: ThemedReactContext
) : HybridTransitionOverlaySpec() {

    private val mainHandler = Handler(Looper.getMainLooper())

    // View hierarchy
    private val containerView = FrameLayout(context)
    private val imageView = ImageView(context)

    override val view: View = containerView

    // Props backing fields
    private var _snapshotUri: String = ""
    private var _snapshotWidth: Double = 0.0
    private var _snapshotHeight: Double = 0.0
    private var _resizeMode: OverlayResizeMode = OverlayResizeMode.STRETCH
    private var _opacity: Double = 1.0

    override var snapshotUri: String
        get() = _snapshotUri
        set(value) {
            _snapshotUri = value
            loadSnapshot()
        }

    override var snapshotWidth: Double
        get() = _snapshotWidth
        set(value) {
            _snapshotWidth = value
            updateLayout()
        }

    override var snapshotHeight: Double
        get() = _snapshotHeight
        set(value) {
            _snapshotHeight = value
            updateLayout()
        }

    override var resizeMode: OverlayResizeMode
        get() = _resizeMode
        set(value) {
            _resizeMode = value
            updateScaleType()
        }

    override var opacity: Double
        get() = _opacity
        set(value) {
            _opacity = value
            containerView.alpha = value.toFloat()
        }

    init {
        setupViews()
    }

    private fun setupViews() {
        containerView.clipChildren = true
        containerView.clipToPadding = true

        imageView.scaleType = ImageView.ScaleType.FIT_XY

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
                    val animator = ObjectAnimator.ofFloat(containerView, "alpha", containerView.alpha, 0f)
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

    override fun updateSnapshot(uri: String) {
        this.snapshotUri = uri
    }

    private fun loadSnapshot() {
        if (_snapshotUri.isEmpty()) {
            imageView.setImageBitmap(null)
            return
        }

        // Load on background thread
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
                // Log error but don't crash
                android.util.Log.e("TransitionOverlay", "Failed to load snapshot: ${e.message}")
            }
        }.start()
    }

    private fun updateLayout() {
        if (_snapshotWidth > 0 && _snapshotHeight > 0) {
            val params = imageView.layoutParams as? FrameLayout.LayoutParams
                ?: FrameLayout.LayoutParams(
                    FrameLayout.LayoutParams.MATCH_PARENT,
                    FrameLayout.LayoutParams.MATCH_PARENT
                )
            params.width = _snapshotWidth.toInt()
            params.height = _snapshotHeight.toInt()
            imageView.layoutParams = params
        }
    }

    private fun updateScaleType() {
        imageView.scaleType = when (_resizeMode) {
            OverlayResizeMode.CONTAIN -> ImageView.ScaleType.FIT_CENTER
            OverlayResizeMode.COVER -> ImageView.ScaleType.CENTER_CROP
            OverlayResizeMode.STRETCH -> ImageView.ScaleType.FIT_XY
        }
    }
}
