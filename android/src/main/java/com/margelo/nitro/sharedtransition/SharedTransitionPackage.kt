package com.margelo.nitro.sharedtransition

import android.app.Application
import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager

/**
 * React Native package for the SharedTransition library.
 *
 * The actual native module is registered through Nitro Modules autolinking —
 * this package only makes sure [ActivityHolder] is initialized as a backstop
 * for setups where [SharedTransitionInitProvider] did not run.
 */
class SharedTransitionPackage : BaseReactPackage() {

  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
    ensureActivityHolder(reactContext)
    return null
  }

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
    return ReactModuleInfoProvider { HashMap() }
  }

  override fun createViewManagers(
    reactContext: ReactApplicationContext
  ): List<ViewManager<*, *>> {
    ensureActivityHolder(reactContext)
    return emptyList()
  }

  private fun ensureActivityHolder(reactContext: ReactApplicationContext) {
    (reactContext.applicationContext as? Application)?.let { ActivityHolder.init(it) }
  }
}
