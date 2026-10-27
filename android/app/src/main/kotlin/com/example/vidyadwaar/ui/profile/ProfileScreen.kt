package com.example.vidyadwaar.ui.profile

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.vidyadwaar.VidyadwaarApp
import com.example.vidyadwaar.data.model.StudentEnrolment
import com.example.vidyadwaar.data.model.StudentProfile
import com.example.vidyadwaar.ui.components.*
import com.example.vidyadwaar.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun ProfileScreen(
    onNavigateBack: () -> Unit
) {
    val repository = VidyadwaarApp.instance.studentRepository
    val scope = rememberCoroutineScope()

    var profile by remember { mutableStateOf<StudentProfile?>(null) }
    var isLoading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    fun loadData() {
        isLoading = true
        errorMessage = null
        scope.launch {
            val result = repository.getProfile()
            isLoading = false
            result.onSuccess { profile = it }
                .onFailure { errorMessage = it.message ?: "Failed to retrieve student profile." }
        }
    }

    LaunchedEffect(Unit) {
        loadData()
    }

    Scaffold(
        containerColor = VidyadwaarDeepNavy,
        topBar = {
            VidyadwaarTopBar(
                title = "Academic Identity",
                canNavigateBack = true,
                onNavigateBack = onNavigateBack,
                actions = {
                    IconButton(onClick = { loadData() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh", tint = VidyadwaarGold)
                    }
                }
            )
        }
    ) { padding ->
        when {
            isLoading -> LoadingView("Fetching verified academic identity...")
            errorMessage != null -> ErrorView(message = errorMessage!!, onRetry = { loadData() })
            profile != null -> {
                val data = profile!!
                val displayName = repository.getSessionManager().getDisplayName() ?: "Registered Student"

                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding)
                        .padding(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    item {
                        Spacer(modifier = Modifier.height(4.dp))
                        ApaarCard(
                            maskedApaar = data.apaarMasked ?: "XXXX-XXXX-XXXX",
                            status = data.apaarStatus,
                            studentName = displayName,
                            provisionalId = data.provisionalId
                        )
                    }

                    // Identity & Authorization Scope
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = VidyadwaarSurface)
                        ) {
                            Column(
                                modifier = Modifier.padding(16.dp),
                                verticalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                Text(
                                    text = "Identity Verification Parameters",
                                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                    color = VidyadwaarGold
                                )

                                ProfileFieldRow(label = "Full Name", value = displayName)
                                ProfileFieldRow(label = "Masked APAAR ID", value = data.apaarMasked ?: "N/A")
                                ProfileFieldRow(label = "Identity Status", value = data.apaarStatus.uppercase())
                                ProfileFieldRow(label = "Role / Scope", value = data.viewer.uppercase())
                                if (!data.provisionalId.isNullOrBlank()) {
                                    ProfileFieldRow(label = "Provisional Identifier", value = data.provisionalId)
                                }
                                if (!data.passkeyCooldownUntil.isNullOrBlank()) {
                                    ProfileFieldRow(
                                        label = "Passkey Cooldown Active",
                                        value = "Until ${data.passkeyCooldownUntil}",
                                        valueColor = VidyadwaarAmber
                                    )
                                }
                            }
                        }
                    }

                    // Detailed Enrolments List
                    item {
                        Text(
                            text = "Institutional Enrolments (${data.enrolments.size})",
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                            color = VidyadwaarGold
                        )
                    }

                    if (data.enrolments.isEmpty()) {
                        item {
                            EmptyStateView(
                                title = "No Enrolments Found",
                                description = "No academic records are linked to your APAAR identifier."
                            )
                        }
                    } else {
                        items(data.enrolments) { enrolment ->
                            DetailedEnrolmentCard(enrolment = enrolment)
                        }
                    }

                    item { Spacer(modifier = Modifier.height(24.dp)) }
                }
            }
        }
    }
}

@Composable
fun ProfileFieldRow(
    label: String,
    value: String,
    valueColor: androidx.compose.ui.graphics.Color = VidyadwaarTextPrimary
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = VidyadwaarTextMuted
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
            color = valueColor
        )
    }
}

@Composable
fun DetailedEnrolmentCard(enrolment: StudentEnrolment) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = VidyadwaarSurface)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = enrolment.programme,
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = VidyadwaarTextPrimary
                )
                StatusChip(status = enrolment.status)
            }

            HorizontalDivider(color = VidyadwaarBorder.copy(alpha = 0.5f))

            ProfileFieldRow(label = "Institution", value = enrolment.institution)
            if (!enrolment.institutionId.isNullOrBlank()) {
                ProfileFieldRow(label = "Institution AICTE Code", value = enrolment.institutionId)
            }
            ProfileFieldRow(label = "College Roll Number", value = enrolment.institutionStudentId)
            ProfileFieldRow(label = "Academic Year", value = enrolment.academicYear)
            ProfileFieldRow(label = "Seat Category", value = enrolment.categoryCode ?: "REGULAR")
            ProfileFieldRow(
                label = "Supernumerary Seat",
                value = if (enrolment.isSupernumerary == true) "YES" else "NO"
            )
        }
    }
}
