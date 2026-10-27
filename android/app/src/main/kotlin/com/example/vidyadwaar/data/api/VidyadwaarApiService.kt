package com.example.vidyadwaar.data.api

import com.example.vidyadwaar.data.model.*
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.*

interface VidyadwaarApiService {

    @POST("v1/auth/student-login")
    suspend fun login(
        @Body body: StudentLoginRequest
    ): Response<LoginResponse>

    @GET("v1/students/me")
    suspend fun getProfile(): Response<StudentProfile>

    @GET("v1/students/me/grievances")
    suspend fun getGrievances(
        @Query("record_type") recordType: String? = null
    ): Response<List<GrievanceOut>>

    @POST("v1/students/me/corrections")
    suspend fun submitCorrection(
        @Body body: CorrectionRequestIn
    ): Response<GrievanceOut>

    @POST("v1/students/me/grievances")
    suspend fun submitGrievance(
        @Body body: GrievanceSubmitIn
    ): Response<GrievanceOut>

    @Multipart
    @POST("v1/students/me/grievances/{id}/evidence")
    suspend fun uploadEvidence(
        @Path("id") grievanceId: Long,
        @Part file: MultipartBody.Part,
        @Part("category") category: RequestBody
    ): Response<EvidenceOut>

    @GET("v1/students/me/access-log")
    suspend fun getAccessLog(): Response<List<AccessLogEntry>>

    @GET("v1/credentials")
    suspend fun getCredentials(
        @Query("enrolment_id") enrolmentId: Long? = null
    ): Response<List<CredentialOut>>

    @GET("v1/consents")
    suspend fun getConsents(): Response<List<ConsentOut>>

    @POST("v1/consents/{id}/deny")
    suspend fun denyConsent(
        @Path("id") id: Long
    ): Response<ConsentOut>
}
