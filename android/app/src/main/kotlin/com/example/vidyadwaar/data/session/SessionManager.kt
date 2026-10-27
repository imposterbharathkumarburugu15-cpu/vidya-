package com.example.vidyadwaar.data.session

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.example.vidyadwaar.BuildConfig

class SessionManager(context: Context) {

    private val prefs: SharedPreferences = try {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()

        EncryptedSharedPreferences.create(
            context,
            "vidyadwaar_secure_session",
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    } catch (e: Exception) {
        Log.w("SessionManager", "EncryptedSharedPreferences fallback to standard: ${e.message}")
        context.getSharedPreferences("vidyadwaar_session_fallback", Context.MODE_PRIVATE)
    }

    companion object {
        private const val KEY_TOKEN = "jwt_token"
        private const val KEY_ROLE = "user_role"
        private const val KEY_DISPLAY_NAME = "display_name"
        private const val KEY_APAAR_MASKED = "apaar_masked"
        private const val KEY_SERVER_URL = "custom_server_url"
    }

    fun saveSession(token: String, role: String, displayName: String) {
        prefs.edit()
            .putString(KEY_TOKEN, token)
            .putString(KEY_ROLE, role)
            .putString(KEY_DISPLAY_NAME, displayName)
            .apply()
    }

    fun saveMaskedApaar(masked: String) {
        prefs.edit().putString(KEY_APAAR_MASKED, masked).apply()
    }

    fun getMaskedApaar(): String? = prefs.getString(KEY_APAAR_MASKED, null)

    fun getToken(): String? = prefs.getString(KEY_TOKEN, null)

    fun getRole(): String? = prefs.getString(KEY_ROLE, null)

    fun getDisplayName(): String? = prefs.getString(KEY_DISPLAY_NAME, null)

    fun isLoggedIn(): Boolean = !getToken().isNullOrBlank()

    fun clearSession() {
        prefs.edit()
            .remove(KEY_TOKEN)
            .remove(KEY_ROLE)
            .remove(KEY_DISPLAY_NAME)
            .remove(KEY_APAAR_MASKED)
            .apply()
    }

    fun getBaseUrl(): String {
        val custom = prefs.getString(KEY_SERVER_URL, null)
        if (!custom.isNullOrBlank()) {
            return if (custom.endsWith("/")) custom else "$custom/"
        }
        return BuildConfig.DEFAULT_BASE_URL
    }

    fun setBaseUrl(url: String) {
        val clean = if (url.endsWith("/")) url else "$url/"
        prefs.edit().putString(KEY_SERVER_URL, clean).apply()
    }

    fun resetBaseUrl() {
        prefs.edit().remove(KEY_SERVER_URL).apply()
    }
}
