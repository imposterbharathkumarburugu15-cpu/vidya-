package com.example.vidyadwaar.data.repository

import com.example.vidyadwaar.data.api.ApiClient
import com.example.vidyadwaar.data.model.*
import com.example.vidyadwaar.data.session.SessionManager
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject

class StudentRepository(
    private val sessionManager: SessionManager,
    private val apiClient: ApiClient
) {

    private fun <T> parseError(response: retrofit2.Response<T>): String {
        return try {
            val errorBody = response.errorBody()?.string()
            if (!errorBody.isNullOrBlank()) {
                val json = JSONObject(errorBody)
                json.optString("detail", json.optString("title", "Error code ${response.code()}"))
            } else {
                "Server returned status code ${response.code()}"
            }
        } catch (_: Exception) {
            "HTTP ${response.code()}: ${response.message()}"
        }
    }

    suspend fun login(apaarId: String, dob: String): Result<LoginResponse> {
        return try {
            val response = apiClient.getService().login(StudentLoginRequest(apaarId.trim(), dob.trim()))
            if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                sessionManager.saveSession(body.accessToken, body.role, body.displayName)
                Result.success(body)
            } else {
                Result.failure(Exception(parseError(response)))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getProfile(): Result<StudentProfile> {
        return try {
            val response = apiClient.getService().getProfile()
            if (response.isSuccessful && response.body() != null) {
                val profile = response.body()!!
                profile.apaarMasked?.let { sessionManager.saveMaskedApaar(it) }
                Result.success(profile)
            } else {
                Result.failure(Exception(parseError(response)))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getGrievances(recordType: String? = null): Result<List<GrievanceOut>> {
        return try {
            val response = apiClient.getService().getGrievances(recordType)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(parseError(response)))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun submitCorrection(request: CorrectionRequestIn): Result<GrievanceOut> {
        return try {
            val response = apiClient.getService().submitCorrection(request)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(parseError(response)))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun submitGrievance(request: GrievanceSubmitIn): Result<GrievanceOut> {
        return try {
            val response = apiClient.getService().submitGrievance(request)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(parseError(response)))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun uploadEvidence(
        grievanceId: Long,
        filename: String,
        mimeType: String,
        bytes: ByteArray,
        category: String
    ): Result<EvidenceOut> {
        return try {
            val mediaType = mimeType.toMediaTypeOrNull()
            val fileRequestBody = bytes.toRequestBody(mediaType)
            val filePart = MultipartBody.Part.createFormData("file", filename, fileRequestBody)
            val categoryBody = category.toRequestBody("text/plain".toMediaTypeOrNull())

            val response = apiClient.getService().uploadEvidence(grievanceId, filePart, categoryBody)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(parseError(response)))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getAccessLog(): Result<List<AccessLogEntry>> {
        return try {
            val response = apiClient.getService().getAccessLog()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(parseError(response)))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getCredentials(enrolmentId: Long? = null): Result<List<CredentialOut>> {
        return try {
            val response = apiClient.getService().getCredentials(enrolmentId)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(parseError(response)))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getConsents(): Result<List<ConsentOut>> {
        return try {
            val response = apiClient.getService().getConsents()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(parseError(response)))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun denyConsent(consentId: Long): Result<ConsentOut> {
        return try {
            val response = apiClient.getService().denyConsent(consentId)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(parseError(response)))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun logout() {
        sessionManager.clearSession()
    }

    fun isLoggedIn(): Boolean = sessionManager.isLoggedIn()

    fun getSessionManager(): SessionManager = sessionManager

    fun updateServerUrl(newUrl: String) {
        sessionManager.setBaseUrl(newUrl)
        apiClient.invalidate()
    }
}
