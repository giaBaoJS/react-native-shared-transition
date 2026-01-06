package com.margelo.nitro.sharedtransition

import android.app.Application
import android.content.ContentProvider
import android.content.ContentValues
import android.database.Cursor
import android.net.Uri
import android.util.Log

/**
 * ContentProvider used to automatically initialize SharedTransition
 * when the app starts. This ensures ActivityHolder is set up before
 * any Nitro Module methods are called.
 *
 * ContentProviders are initialized before Application.onCreate(),
 * making them perfect for early initialization.
 */
class SharedTransitionInitProvider : ContentProvider() {

    companion object {
        private const val TAG = "SharedTransitionInit"
    }

    override fun onCreate(): Boolean {
        Log.d(TAG, "SharedTransitionInitProvider onCreate")

        try {
            val appContext = context?.applicationContext
            if (appContext is Application) {
                ActivityHolder.init(appContext)
                Log.d(TAG, "ActivityHolder initialized from ContentProvider")
            } else {
                Log.w(TAG, "Could not get Application context")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to initialize ActivityHolder", e)
        }

        return true
    }

    // Required ContentProvider methods (not used)
    override fun query(
        uri: Uri,
        projection: Array<out String>?,
        selection: String?,
        selectionArgs: Array<out String>?,
        sortOrder: String?
    ): Cursor? = null

    override fun getType(uri: Uri): String? = null

    override fun insert(uri: Uri, values: ContentValues?): Uri? = null

    override fun delete(uri: Uri, selection: String?, selectionArgs: Array<out String>?): Int = 0

    override fun update(
        uri: Uri,
        values: ContentValues?,
        selection: String?,
        selectionArgs: Array<out String>?
    ): Int = 0
}
