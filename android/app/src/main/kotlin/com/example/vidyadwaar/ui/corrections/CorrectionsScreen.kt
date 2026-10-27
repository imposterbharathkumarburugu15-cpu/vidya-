package com.example.vidyadwaar.ui.corrections

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.vidyadwaar.VidyadwaarApp
import com.example.vidyadwaar.data.model.CorrectionRequestIn
import com.example.vidyadwaar.data.model.GrievanceOut
import com.example.vidyadwaar.data.model.StudentEnrolment
import com.example.vidyadwaar.ui.components.*
import com.example.vidyadwaar.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CorrectionsScreen(
    onNavigateBack: () -> Unit
) {
    val repository = VidyadwaarApp.instance.studentRepository
    val scope = rememberCoroutineScope()

    var selectedTab by remember { mutableIntStateOf(0) }
    var corrections by remember { mutableStateOf<List<GrievanceOut>>(emptyList()) }
    var enrolments by remember { mutableStateOf<List<StudentEnrolment>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    // Form State
    var selectedEnrolment by remember { mutableStateOf<StudentEnrolment?>(null) }
    var selectedField by remember { mutableStateOf("student_name") }
    var proposedValue by remember { mutableStateOf("") }
    var reasonDescription by remember { mutableStateOf("") }
    var isSubmitting by remember { mutableStateOf(false) }
    var submitSuccessMessage by remember { mutableStateOf<String?>(null) }
    var submitErrorMessage by remember { mutableStateOf<String?>(null) }

    fun loadData() {
        isLoading = true
        errorMessage = null
        scope.launch {
            val profileRes = repository.getProfile()
            profileRes.onSuccess {
                enrolments = it.enrolments
                if (selectedEnrolment == null && it.enrolments.isNotEmpty()) {
                    selectedEnrolment = it.enrolments.first()
                }
            }

            val result = repository.getGrievances("correction_request")
            isLoading = false
            result.onSuccess {
                corrections = it
            }.onFailure {
                errorMessage = it.message ?: "Failed to load correction requests."
            }
        }
    }

    LaunchedEffect(Unit) {
        loadData()
    }

    Scaffold(
        containerColor = VidyadwaarDeepNavy,
        topBar = {
            VidyadwaarTopBar(
                title = "Correction Requests",
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
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // Tab Selector
            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = VidyadwaarSurface,
                contentColor = VidyadwaarGold
            ) {
                Tab(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    text = {
                        Text(
                            "My Requests (${corrections.size})",
                            fontWeight = if (selectedTab == 0) FontWeight.Bold else FontWeight.Normal
                        )
                    }
                )
                Tab(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    text = {
                        Text(
                            "New Request",
                            fontWeight = if (selectedTab == 1) FontWeight.Bold else FontWeight.Normal
                        )
                    }
                )
            }

            when {
                isLoading -> LoadingView("Loading correction requests...")
                errorMessage != null -> ErrorView(message = errorMessage!!, onRetry = { loadData() })
                selectedTab == 0 -> {
                    // List of Existing Correction Requests
                    if (corrections.isEmpty()) {
                        EmptyStateView(
                            icon = Icons.Default.EditNote,
                            title = "No Correction Requests",
                            description = "You have not submitted any academic record correction requests yet.",
                            actionButton = {
                                Button(
                                    onClick = { selectedTab = 1 },
                                    colors = ButtonDefaults.buttonColors(containerColor = VidyadwaarGold)
                                ) {
                                    Text("Submit Correction", color = VidyadwaarDeepNavy, fontWeight = FontWeight.Bold)
                                }
                            }
                        )
                    } else {
                        LazyColumn(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(16.dp)
                        ) {
                            items(corrections) { item ->
                                CorrectionItemCard(item = item)
                            }
                        }
                    }
                }
                selectedTab == 1 -> {
                    // New Correction Request Form
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        item {
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(12.dp),
                                colors = CardDefaults.cardColors(containerColor = VidyadwaarSurface)
                            ) {
                                Column(
                                    modifier = Modifier.padding(16.dp),
                                    verticalArrangement = Arrangement.spacedBy(14.dp)
                                ) {
                                    Text(
                                        text = "Submit Record Correction",
                                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                        color = VidyadwaarGold
                                    )
                                    Text(
                                        text = "Request a formal review of your academic enrolment parameters. Every request is audited and requires institutional verification.",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = VidyadwaarTextSecondary
                                    )

                                    if (submitSuccessMessage != null) {
                                        Surface(
                                            shape = RoundedCornerShape(8.dp),
                                            color = VidyadwaarEmerald.copy(alpha = 0.15f),
                                            border = androidx.compose.foundation.BorderStroke(1.dp, VidyadwaarEmerald)
                                        ) {
                                            Row(
                                                modifier = Modifier.padding(12.dp),
                                                verticalAlignment = Alignment.CenterVertically,
                                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                                            ) {
                                                Icon(Icons.Default.CheckCircle, contentDescription = null, tint = VidyadwaarEmerald)
                                                Text(submitSuccessMessage!!, color = VidyadwaarEmerald, style = MaterialTheme.typography.bodySmall)
                                            }
                                        }
                                    }

                                    if (submitErrorMessage != null) {
                                        Surface(
                                            shape = RoundedCornerShape(8.dp),
                                            color = VidyadwaarRose.copy(alpha = 0.15f),
                                            border = androidx.compose.foundation.BorderStroke(1.dp, VidyadwaarRose)
                                        ) {
                                            Row(
                                                modifier = Modifier.padding(12.dp),
                                                verticalAlignment = Alignment.CenterVertically,
                                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                                            ) {
                                                Icon(Icons.Default.ErrorOutline, contentDescription = null, tint = VidyadwaarRose)
                                                Text(submitErrorMessage!!, color = VidyadwaarRose, style = MaterialTheme.typography.bodySmall)
                                            }
                                        }
                                    }

                                    // Enrolment Selector
                                    Text("Target Academic Enrolment", style = MaterialTheme.typography.labelSmall, color = VidyadwaarTextMuted)
                                    if (enrolments.isEmpty()) {
                                        Text("No enrolment records available.", color = VidyadwaarTextSecondary, style = MaterialTheme.typography.bodySmall)
                                    } else {
                                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                            enrolments.forEach { enr ->
                                                val isSelected = selectedEnrolment?.id == enr.id
                                                Surface(
                                                    shape = RoundedCornerShape(8.dp),
                                                    color = if (isSelected) VidyadwaarGold.copy(alpha = 0.15f) else VidyadwaarCard,
                                                    border = androidx.compose.foundation.BorderStroke(
                                                        1.dp,
                                                        if (isSelected) VidyadwaarGold else VidyadwaarBorder
                                                    ),
                                                    onClick = { selectedEnrolment = enr }
                                                ) {
                                                    Row(
                                                        modifier = Modifier
                                                            .fillMaxWidth()
                                                            .padding(12.dp),
                                                        horizontalArrangement = Arrangement.SpaceBetween,
                                                        verticalAlignment = Alignment.CenterVertically
                                                    ) {
                                                        Column {
                                                            Text(enr.programme, style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold), color = VidyadwaarTextPrimary)
                                                            Text(enr.institution, style = MaterialTheme.typography.bodySmall, color = VidyadwaarTextMuted)
                                                        }
                                                        if (isSelected) {
                                                            Icon(Icons.Default.CheckCircle, contentDescription = "Selected", tint = VidyadwaarGold)
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }

                                    // Field to correct selector
                                    Text("Parameter to Correct", style = MaterialTheme.typography.labelSmall, color = VidyadwaarTextMuted)
                                    val fieldOptions = listOf(
                                        "student_name" to "Legal Student Name",
                                        "dob" to "Date of Birth (YYYY-MM-DD)",
                                        "category_code" to "Seat Category (e.g. REGULAR, OBC, SC)",
                                        "institution_student_id" to "College Roll ID"
                                    )
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        fieldOptions.take(2).forEach { (fieldKey, label) ->
                                            FilterChip(
                                                selected = selectedField == fieldKey,
                                                onClick = { selectedField = fieldKey },
                                                label = { Text(label, fontSize = 11.sp) },
                                                modifier = Modifier.weight(1f)
                                            )
                                        }
                                    }
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        fieldOptions.drop(2).forEach { (fieldKey, label) ->
                                            FilterChip(
                                                selected = selectedField == fieldKey,
                                                onClick = { selectedField = fieldKey },
                                                label = { Text(label, fontSize = 11.sp) },
                                                modifier = Modifier.weight(1f)
                                            )
                                        }
                                    }

                                    // Proposed Value Input
                                    OutlinedTextField(
                                        value = proposedValue,
                                        onValueChange = { proposedValue = it },
                                        label = { Text("Proposed Correct Value") },
                                        placeholder = { Text("Enter updated parameter value") },
                                        singleLine = true,
                                        modifier = Modifier.fillMaxWidth(),
                                        colors = OutlinedTextFieldDefaults.colors(
                                            focusedBorderColor = VidyadwaarGold,
                                            unfocusedBorderColor = VidyadwaarBorder,
                                            focusedTextColor = VidyadwaarTextPrimary,
                                            unfocusedTextColor = VidyadwaarTextPrimary,
                                            focusedLabelColor = VidyadwaarGold
                                        )
                                    )

                                    // Description / Justification
                                    OutlinedTextField(
                                        value = reasonDescription,
                                        onValueChange = { reasonDescription = it },
                                        label = { Text("Justification & Discrepancy Reason") },
                                        placeholder = { Text("Provide complete details for review (min 10 characters)") },
                                        minLines = 3,
                                        modifier = Modifier.fillMaxWidth(),
                                        colors = OutlinedTextFieldDefaults.colors(
                                            focusedBorderColor = VidyadwaarGold,
                                            unfocusedBorderColor = VidyadwaarBorder,
                                            focusedTextColor = VidyadwaarTextPrimary,
                                            unfocusedTextColor = VidyadwaarTextPrimary,
                                            focusedLabelColor = VidyadwaarGold
                                        )
                                    )

                                    val isFormValid = proposedValue.isNotBlank() && reasonDescription.trim().length >= 10 && selectedEnrolment != null

                                    // Submit Button
                                    Button(
                                        onClick = {
                                            if (!isFormValid || isSubmitting) return@Button
                                            isSubmitting = true
                                            submitSuccessMessage = null
                                            submitErrorMessage = null

                                            scope.launch {
                                                val req = CorrectionRequestIn(
                                                    category = selectedField,
                                                    subject = "Correction Request for ${selectedField.replace('_', ' ').replaceFirstChar { it.uppercase() }}",
                                                    description = reasonDescription.trim(),
                                                    enrolmentId = selectedEnrolment?.id,
                                                    institutionId = selectedEnrolment?.institutionId,
                                                    proposedChanges = mapOf(selectedField to proposedValue.trim())
                                                )
                                                val result = repository.submitCorrection(req)
                                                isSubmitting = false
                                                result.onSuccess {
                                                    submitSuccessMessage = "Correction request submitted successfully (ID: ${it.id}). Switched to review queue."
                                                    proposedValue = ""
                                                    reasonDescription = ""
                                                    loadData()
                                                    selectedTab = 0
                                                }.onFailure { err ->
                                                    submitErrorMessage = err.message ?: "Submission failed. Please check input requirements."
                                                }
                                            }
                                        },
                                        enabled = isFormValid && !isSubmitting,
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .height(48.dp),
                                        colors = ButtonDefaults.buttonColors(
                                            containerColor = VidyadwaarGold,
                                            disabledContainerColor = VidyadwaarBorder
                                        )
                                    ) {
                                        if (isSubmitting) {
                                            CircularProgressIndicator(modifier = Modifier.size(20.dp), color = VidyadwaarDeepNavy)
                                        } else {
                                            Icon(Icons.Default.Send, contentDescription = null, tint = VidyadwaarDeepNavy)
                                            Spacer(modifier = Modifier.width(8.dp))
                                            Text("Submit for Verification", color = VidyadwaarDeepNavy, fontWeight = FontWeight.Bold)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun CorrectionItemCard(item: GrievanceOut) {
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
                    text = item.subject,
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = VidyadwaarTextPrimary
                )
                StatusChip(status = item.status)
            }

            Text(
                text = item.description,
                style = MaterialTheme.typography.bodySmall,
                color = VidyadwaarTextSecondary
            )

            // Side-by-Side Comparison of Proposed vs Baseline Values
            if (item.proposedChanges.isNotEmpty()) {
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = VidyadwaarDeepNavy,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(
                            text = "PROPOSED PARAMETER DIFF",
                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                            color = VidyadwaarGold
                        )
                        item.proposedChanges.forEach { (key, newVal) ->
                            val currentVal = item.currentValues[key] ?: "None"
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text("Current:", style = MaterialTheme.typography.labelSmall, color = VidyadwaarTextMuted)
                                    Text(
                                        "$currentVal",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = VidyadwaarRose
                                    )
                                }
                                Icon(Icons.Default.ArrowForward, contentDescription = null, tint = VidyadwaarGold, modifier = Modifier.size(16.dp))
                                Column(modifier = Modifier.weight(1f), horizontalAlignment = Alignment.End) {
                                    Text("Proposed:", style = MaterialTheme.typography.labelSmall, color = VidyadwaarTextMuted)
                                    Text(
                                        "$newVal",
                                        style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold),
                                        color = VidyadwaarEmerald
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // Review Determination Info
            if (!item.reviewDecision.isNullOrBlank()) {
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = VidyadwaarCard,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(
                            text = "Review Determination: ${item.reviewDecision.uppercase()}",
                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                            color = if (item.reviewDecision == "approved") VidyadwaarEmerald else VidyadwaarRose
                        )
                        if (!item.resolutionSummary.isNullOrBlank()) {
                            Text(
                                text = item.resolutionSummary,
                                style = MaterialTheme.typography.bodySmall,
                                color = VidyadwaarTextSecondary
                            )
                        }
                    }
                }
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Request ID: #${item.id}",
                    style = MaterialTheme.typography.labelSmall,
                    color = VidyadwaarTextMuted
                )
                Text(
                    text = item.createdAt.take(10),
                    style = MaterialTheme.typography.labelSmall,
                    color = VidyadwaarTextMuted
                )
            }
        }
    }
}
