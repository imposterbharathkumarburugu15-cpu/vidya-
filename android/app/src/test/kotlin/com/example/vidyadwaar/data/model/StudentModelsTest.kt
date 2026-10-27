package com.example.vidyadwaar.data.model

import com.google.gson.Gson
import org.junit.Assert.*
import org.junit.Test

class StudentModelsTest {

    private val gson = Gson()

    @Test
    fun testStudentLoginRequestSerialization() {
        val req = StudentLoginRequest(apaarId = "100000000001", dob = "2003-05-15")
        val json = gson.toJson(req)
        assertTrue(json.contains("\"apaar_id\":\"100000000001\""))
        assertTrue(json.contains("\"dob\":\"2003-05-15\""))
    }

    @Test
    fun testLoginResponseDeserialization() {
        val json = """
            {
                "access_token": "mock-jwt-token-12345",
                "token_type": "bearer",
                "role": "student",
                "institution_id": "INST-A",
                "display_name": "Aarav Sharma"
            }
        """.trimIndent()

        val res = gson.fromJson(json, LoginResponse::class.java)
        assertEquals("mock-jwt-token-12345", res.accessToken)
        assertEquals("bearer", res.tokenType)
        assertEquals("student", res.role)
        assertEquals("INST-A", res.institutionId)
        assertEquals("Aarav Sharma", res.displayName)
    }

    @Test
    fun testStudentProfileDeserialization() {
        val json = """
            {
                "apaar_masked": "XXXX-XXXX-0001",
                "provisional_id": null,
                "apaar_status": "verified",
                "enrolments": [
                    {
                        "id": 101,
                        "programme": "B.Tech Computer Science and Engineering",
                        "institution": "National Institute of Technology",
                        "institution_id": "INST-NIT-01",
                        "academic_year": "2024-2025",
                        "status": "enrolled",
                        "institution_student_id": "CSE2024-042",
                        "category_code": "REGULAR",
                        "is_supernumerary": false
                    }
                ],
                "passkey_cooldown_until": null,
                "viewer": "student"
            }
        """.trimIndent()

        val profile = gson.fromJson(json, StudentProfile::class.java)
        assertEquals("XXXX-XXXX-0001", profile.apaarMasked)
        assertEquals("verified", profile.apaarStatus)
        assertEquals(1, profile.enrolments.size)

        val enr = profile.enrolments.first()
        assertEquals(101L, enr.id)
        assertEquals("B.Tech Computer Science and Engineering", enr.programme)
        assertEquals("INST-NIT-01", enr.institutionId)
        assertEquals("enrolled", enr.status)
        assertEquals("REGULAR", enr.categoryCode)
        assertEquals(false, enr.isSupernumerary)
    }

    @Test
    fun testCorrectionRequestInSerialization() {
        val req = CorrectionRequestIn(
            category = "student_name",
            subject = "Legal Name Correction Request",
            description = "Name spelled as Aarav S on official marksheet instead of Aarav Sharma",
            enrolmentId = 101L,
            institutionId = "INST-NIT-01",
            proposedChanges = mapOf("student_name" to "Aarav Sharma")
        )

        val json = gson.toJson(req)
        assertTrue(json.contains("\"category\":\"student_name\""))
        assertTrue(json.contains("\"enrolment_id\":101"))
        assertTrue(json.contains("\"Aarav Sharma\""))
    }

    @Test
    fun testGrievanceOutDeserialization() {
        val json = """
            {
                "id": 501,
                "student_id": 1,
                "case_id": null,
                "enrolment_id": 101,
                "institution_id": "INST-NIT-01",
                "record_type": "correction_request",
                "category": "student_name",
                "subject": "Name correction",
                "description": "Correct spelling to Aarav Sharma",
                "proposed_changes": {"student_name": "Aarav Sharma"},
                "current_values": {"student_name": "Aarav S"},
                "status": "under_review",
                "created_at": "2026-10-27T10:00:00Z",
                "updated_at": "2026-10-27T10:05:00Z",
                "evidence": [
                    {
                        "id": 901,
                        "category": "aadhaar_card",
                        "filename": "aadhaar.pdf",
                        "media_type": "application/pdf",
                        "file_size": 204850,
                        "sha256_digest": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                        "status": "verified",
                        "uploaded_by": "student:1",
                        "uploaded_at": "2026-10-27T10:01:00Z"
                    }
                ]
            }
        """.trimIndent()

        val grievance = gson.fromJson(json, GrievanceOut::class.java)
        assertEquals(501L, grievance.id)
        assertEquals("under_review", grievance.status)
        assertEquals("Aarav Sharma", grievance.proposedChanges["student_name"])
        assertEquals("Aarav S", grievance.currentValues["student_name"])
        assertEquals(1, grievance.evidence.size)

        val ev = grievance.evidence.first()
        assertEquals(901L, ev.id)
        assertEquals("aadhaar.pdf", ev.filename)
        assertEquals("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", ev.sha256Digest)
    }

    @Test
    fun testCredentialOutDeserialization() {
        val json = """
            {
                "id": "urn:uuid:f47ac10b-58cc-4372-a567-0e02b2c3d479",
                "type": "EnrolmentCredential",
                "issuer_did": "did:web:aicte-india.org",
                "issued_at": "2026-10-20T12:00:00Z",
                "status": {
                    "revocation": false,
                    "suspension": false
                }
            }
        """.trimIndent()

        val cred = gson.fromJson(json, CredentialOut::class.java)
        assertEquals("EnrolmentCredential", cred.type)
        assertEquals("did:web:aicte-india.org", cred.issuerDid)
        assertNotNull(cred.status)
        assertFalse(cred.status!!.revocation)
        assertFalse(cred.status!!.suspension)
    }

    @Test
    fun testAccessLogEntryDeserialization() {
        val json = """
            {
                "ts": "2026-10-27T08:30:00Z",
                "actor": "inst-a-registrar",
                "role": "institution_admin",
                "action": "enrolment.read",
                "reason": "Semester registration verification",
                "entity": "enrolment",
                "entity_id": "101"
            }
        """.trimIndent()

        val log = gson.fromJson(json, AccessLogEntry::class.java)
        assertEquals("inst-a-registrar", log.actor)
        assertEquals("institution_admin", log.role)
        assertEquals("enrolment.read", log.action)
        assertEquals("Semester registration verification", log.reason)
    }

    @Test
    fun testApaarIdValidationRules() {
        val validApaar = "100000000001"
        assertTrue(validApaar.length == 12 && validApaar.all { it.isDigit() })

        val shortApaar = "1000001"
        assertFalse(shortApaar.length == 12 && shortApaar.all { it.isDigit() })

        val alphaApaar = "10000000000A"
        assertFalse(alphaApaar.length == 12 && alphaApaar.all { it.isDigit() })
    }

    @Test
    fun testDobValidationRules() {
        val dobRegex = Regex("^\\d{4}-\\d{2}-\\d{2}$")
        assertTrue(dobRegex.matches("2003-05-15"))
        assertTrue(dobRegex.matches("1999-12-31"))

        assertFalse(dobRegex.matches("15-05-2003"))
        assertFalse(dobRegex.matches("2003/05/15"))
        assertFalse(dobRegex.matches("invalid-dob"))
    }
}
