package com.example.vidyadwaar.data.api

import com.example.vidyadwaar.data.session.SessionManager
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

class ApiClient(private val sessionManager: SessionManager) {

    private var currentBaseUrl: String? = null
    private var cachedService: VidyadwaarApiService? = null

    fun getService(): VidyadwaarApiService {
        val baseUrl = sessionManager.getBaseUrl()
        if (cachedService != null && currentBaseUrl == baseUrl) {
            return cachedService!!
        }

        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BASIC
        }

        val okHttpClient = OkHttpClient.Builder()
            .addInterceptor(AuthInterceptor(sessionManager))
            .addInterceptor(logging)
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(20, TimeUnit.SECONDS)
            .writeTimeout(20, TimeUnit.SECONDS)
            .build()

        val retrofit = Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        val service = retrofit.create(VidyadwaarApiService::class.java)
        cachedService = service
        currentBaseUrl = baseUrl
        return service
    }

    fun invalidate() {
        cachedService = null
        currentBaseUrl = null
    }
}
