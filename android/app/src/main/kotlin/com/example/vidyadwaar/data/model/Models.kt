package com.example.vidyadwaar.data.model

import com.google.gson.annotations.SerializedName

// --- Authentication ---

data class StudentLoginRequest(
    @SerializedName("apaar_id") val apaarId: String,
    @SerializedName("dob") val dob: String // YYYY-MM-DD
)

data class LoginResponse(
    @SerializedName("access_token") val accessToken: String,
    @SerializedName("token_type") val tokenType: String = "bearer",
    @SerializedName("role") val role: String,
    @SerializedName("institution_id") val institutionId: String? = null,
    @SerializedName("display_name") val displayName: String = ""
)

// --- Student Academic Profile & Enrolments ---

data class StudentEnrolment(
    @SerializedName("id") val id: Long? = null,
    @SerializedName("programme") val programme: String,
    @SerializedName("institution") val institution: String,
    @SerializedName("institution_id") val institutionId: String? = null,
    @SerializedName("academic_year") val academicYear: String,
    @SerializedName("status") val status: String,
    @SerializedName("institution_student_id") val institutionStudentId: String,
    @SerializedName("category_code") val categoryCode: String? = null,
    @SerializedName("is_supernumerary") val isSupernumerary: Boolean? = null
)

data class StudentProfile(
    @SerializedName("apaar_masked") val apaarMasked: String?,
    @SerializedName("provisional_id") val provisionalId: String?,
    @SerializedName("apaar_status") val apaarStatus: String,
    @SerializedName("enrolments") val enrolments: List<StudentEnrolment> = emptyList(),
    @SerializedName("passkey_cooldown_until") val passkeyCooldownUntil: String? = null,
    @SerializedName("viewer") val viewer: String = "student"
)

// --- Audit & Access Transparency (D6) ---

data class AccessLogEntry(
    @SerializedName("ts") val timestamp: String,
    @SerializedName("actor") val actor: String,
    @SerializedName("role") val role: String,
    @SerializedName("action") val action: String,
    @SerializedName("reason") val reason: String? = null,
    @SerializedName("entity") val entity: String,
    @SerializedName("entity_id") val entityId: String? = null
)

// --- Grievances, Corrections, and Evidence ---

data class EvidenceOut(
    @SerializedName("id") val id: Long,
    @SerializedName("case_id") val caseId: Long? = null,
    @SerializedName("grievance_id") val grievanceId: Long? = null,
    @SerializedName("category") val category: String,
    @SerializedName("filename") val filename: String,
    @SerializedName("media_type") val mediaType: String,
    @SerializedName("file_size") val fileSize: Long,
    @SerializedName("sha256_digest") val sha256Digest: String,
    @SerializedName("status") val status: String,
    @SerializedName("verification_notes") val verificationNotes: String? = null,
    @SerializedName("uploaded_by") val uploadedBy: String,
    @SerializedName("uploaded_at") val uploadedAt: String
)

data class GrievanceResponseOut(
    @SerializedName("id") val id: Long,
    @SerializedName("grievance_id") val grievanceId: Long,
    @SerializedName("responder_id") val responderId: String,
    @SerializedName("responder_role") val responderRole: String,
    @SerializedName("message") val message: String,
    @SerializedName("visibility") val visibility: String,
    @SerializedName("created_at") val createdAt: String
)

data class GrievanceOut(
    @SerializedName("id") val id: Long,
    @SerializedName("student_id") val studentId: Long,
    @SerializedName("case_id") val caseId: Long? = null,
    @SerializedName("enrolment_id") val enrolmentId: Long? = null,
    @SerializedName("institution_id") val institutionId: String? = null,
    @SerializedName("record_type") val recordType: String = "grievance",
    @SerializedName("category") val category: String,
    @SerializedName("subject") val subject: String,
    @SerializedName("description") val description: String,
    @SerializedName("proposed_changes") val proposedChanges: Map<String, Any> = emptyMap(),
    @SerializedName("current_values") val currentValues: Map<String, Any> = emptyMap(),
    @SerializedName("status") val status: String,
    @SerializedName("assigned_to") val assignedTo: String? = null,
    @SerializedName("resolution_summary") val resolutionSummary: String? = null,
    @SerializedName("review_decision") val reviewDecision: String? = null,
    @SerializedName("reviewed_by") val reviewedBy: String? = null,
    @SerializedName("reviewed_at") val reviewedAt: String? = null,
    @SerializedName("applied_at") val appliedAt: String? = null,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String,
    @SerializedName("resolved_at") val resolvedAt: String? = null,
    @SerializedName("responses") val responses: List<GrievanceResponseOut> = emptyList(),
    @SerializedName("evidence") val evidence: List<EvidenceOut> = emptyList()
)

data class CorrectionRequestIn(
    @SerializedName("category") val category: String,
    @SerializedName("subject") val subject: String,
    @SerializedName("description") val description: String,
    @SerializedName("enrolment_id") val enrolmentId: Long? = null,
    @SerializedName("case_id") val caseId: Long? = null,
    @SerializedName("institution_id") val institutionId: String? = null,
    @SerializedName("proposed_changes") val proposedChanges: Map<String, Any> = emptyMap()
)

data class GrievanceSubmitIn(
    @SerializedName("category") val category: String,
    @SerializedName("subject") val subject: String,
    @SerializedName("description") val description: String,
    @SerializedName("enrolment_id") val enrolmentId: Long? = null,
    @SerializedName("case_id") val caseId: Long? = null,
    @SerializedName("institution_id") val institutionId: String? = null,
    @SerializedName("record_type") val recordType: String = "grievance",
    @SerializedName("proposed_changes") val proposedChanges: Map<String, Any> = emptyMap()
)

// --- Verifiable Credentials (W3C VC 2.0) ---

data class CredentialStatusFlags(
    @SerializedName("revocation") val revocation: Boolean = false,
    @SerializedName("suspension") val suspension: Boolean = false
)

data class CredentialOut(
    @SerializedName("id") val id: String,
    @SerializedName("type") val type: String,
    @SerializedName("issuer_did") val issuerDid: String,
    @SerializedName("issued_at") val issuedAt: String,
    @SerializedName("status") val status: CredentialStatusFlags? = null,
    @SerializedName("credential") val credential: Map<String, Any>? = null
)

// --- Data Consents ---

data class ConsentOut(
    @SerializedName("id") val id: Long,
    @SerializedName("requester") val requester: String,
    @SerializedName("purpose") val purpose: String,
    @SerializedName("fields") val fields: List<String> = emptyList(),
    @SerializedName("status") val status: String,
    @SerializedName("granted_by") val grantedBy: String? = null,
    @SerializedName("requested_at") val requestedAt: String,
    @SerializedName("expires_at") val expiresAt: String,
    @SerializedName("credential_id") val credentialId: String? = null
)
