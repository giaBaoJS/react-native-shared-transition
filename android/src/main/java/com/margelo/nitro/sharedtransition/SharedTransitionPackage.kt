package com.margelo.nitro.sharedtransition

import android.app.Application
import android.util.Log
import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager

/**
 * React Native Package for SharedTransition library
 *
 * Registers native modules and view managers with React Native.
 * Uses Nitro Modules for native module implementation.
 */
class SharedTransitionPackage : BaseReactPackage() {

    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
        // Initialize ActivityHolder with the current activity
        try {
            val application = reactContext.applicationContext as? Application
            if (application != null) {
                ActivityHolder.init(application)
                Log.d(TAG, "ActivityHolder initialized with Application")
            }

            // Also set current activity directly
            reactContext.currentActivity?.let {
                ActivityHolder.setCurrentActivity(it)
                Log.d(TAG, "ActivityHolder set current activity: ${it.javaClass.simpleName}")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to initialize ActivityHolder", e)
        }

        // Native modules are handled by Nitro Modules, not standard RN modules
        return null
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        return ReactModuleInfoProvider { HashMap() }
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        // Initialize ActivityHolder here as well (createViewManagers is often called early)
        try {
            val application = reactContext.applicationContext as? Application
            if (application != null) {
                ActivityHolder.init(application)
            }
            reactContext.currentActivity?.let {
                ActivityHolder.setCurrentActivity(it)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to initialize ActivityHolder in createViewManagers", e)
        }

        // View managers are handled by Nitro Modules autolinking
        return emptyList()
    }

    companion object {
        private const val TAG = "SharedTransitionPackage"

        init {
            // Load native library
            try {
                System.loadLibrary("sharedtransition")
                Log.d(TAG, "Native library loaded successfully")
            } catch (e: UnsatisfiedLinkError) {
                Log.e(TAG, "Failed to load native library", e)
            }
        }
    }
}
