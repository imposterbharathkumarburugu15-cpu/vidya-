package com.example.vidyadwaar

import android.app.Application
import com.example.vidyadwaar.data.api.ApiClient
import com.example.vidyadwaar.data.repository.StudentRepository
import com.example.vidyadwaar.data.session.SessionManager

class VidyadwaarApp : Application() {

    lateinit var sessionManager: SessionManager
        private set

    lateinit var apiClient: ApiClient
        private set

    lateinit var studentRepository: StudentRepository
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this

        sessionManager = SessionManager(applicationContext)
        apiClient = ApiClient(sessionManager)
        studentRepository = StudentRepository(sessionManager, apiClient)
    }

    companion object {
        lateinit var instance: VidyadwaarApp
            private set
    }
}
