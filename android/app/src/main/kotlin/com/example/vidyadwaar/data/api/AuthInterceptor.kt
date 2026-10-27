package com.example.vidyadwaar.data.api

import com.example.vidyadwaar.data.session.SessionManager
import okhttp3.Interceptor
import okhttp3.Response

class AuthInterceptor(private val sessionManager: SessionManager) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val original = chain.request()
        val builder = original.newBuilder()
            .header("Accept", "application/json")

        val token = sessionManager.getToken()
        if (!token.isNullOrBlank()) {
            builder.header("Authorization", "Bearer $token")
        }

        val response = chain.proceed(builder.build())

        // Handle expired session / 401 Unauthorized
        if (response.code == 401 && !token.isNullOrBlank()) {
            sessionManager.clearSession()
        }

        return response
    }
}
