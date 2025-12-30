package com.margelo.nitro.sharedtransition

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
        // Native modules are handled by Nitro Modules, not standard RN modules
        return null
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        return ReactModuleInfoProvider { HashMap() }
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        // View managers are handled by Nitro Modules autolinking
        return emptyList()
    }

    companion object {
        init {
            // Load native library
            System.loadLibrary("sharedtransition")
        }
    }
}
