package com.example.vidyadwaar.ui.disputes

import androidx.compose.foundation.background
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
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.vidyadwaar.VidyadwaarApp
import com.example.vidyadwaar.data.model.GrievanceOut
import com.example.vidyadwaar.data.model.GrievanceSubmitIn
import com.example.vidyadwaar.data.model.StudentEnrolment
import com.example.vidyadwaar.ui.components.*
import com.example.vidyadwaar.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DisputesScreen(
    onNavigateBack: () -> Unit
) {
    val repository = VidyadwaarApp.instance.studentRepository
    val scope = rememberCoroutineScope()

    var selectedTab by remember { mutableIntStateOf(0) }
    var grievances by remember { mutableStateOf<List<GrievanceOut>>(emptyList()) }
    var enrolments by remember { mutableStateOf<List<StudentEnrolment>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    // Dispute Submission Form
    var selectedEnrolment by remember { mutableStateOf<StudentEnrolment?>(null) }
    var disputeCategory by remember { mutableStateOf("duplicate_enrolment_dispute") }
    var subject by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
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

            val result = repository.getGrievances("grievance")
            isLoading = false
            result.onSuccess {
                grievances = it
            }.onFailure {
                errorMessage = it.message ?: "Failed to load dispute records."
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
                title = "Disputes & Integrity Appeals",
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
                            "My Disputes (${grievances.size})",
                            fontWeight = if (selectedTab == 0) FontWeight.Bold else FontWeight.Normal
                        )
                    }
                )
                Tab(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    text = {
                        Text(
                            "File Dispute",
                            fontWeight = if (selectedTab == 1) FontWeight.Bold else FontWeight.Normal
                        )
                    }
                )
            }

            when {
                isLoading -> LoadingView("Fetching dispute history...")
                errorMessage != null -> ErrorView(message = errorMessage!!, onRetry = { loadData() })
                selectedTab == 0 -> {
                    if (grievances.isEmpty()) {
                        EmptyStateView(
                            icon = Icons.Default.Gavel,
                            title = "No Disputes Filed",
                            description = "You have no active disputes or grievance appeals recorded.",
                            actionButton = {
                                Button(
                                    onClick = { selectedTab = 1 },
                                    colors = ButtonDefaults.buttonColors(containerColor = VidyadwaarGold)
                                ) {
                                    Text("File Dispute", color = VidyadwaarDeepNavy, fontWeight = FontWeight.Bold)
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
                            items(grievances) { item ->
                                DisputeCard(item = item)
                            }
                        }
                    }
                }
                selectedTab == 1 -> {
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
                                        text = "Contest Duplicate Flag or Resolution",
                                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                        color = VidyadwaarGold
                                    )
                                    Text(
                                        text = "If an institution has flagged a duplicate enrolment or an administrative decision requires appeal, submit your dispute here.",
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

                                    // Category selector
                                    Text("Dispute Category", style = MaterialTheme.typography.labelSmall, color = VidyadwaarTextMuted)
                                    val categories = listOf(
                                        "duplicate_enrolment_dispute" to "Duplicate Enrolment Contest",
                                        "status_discrepancy" to "Status Discrepancy",
                                        "admission_cancellation_appeal" to "Cancellation Appeal"
                                    )
                                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                        categories.forEach { (catKey, label) ->
                                            FilterChip(
                                                selected = disputeCategory == catKey,
                                                onClick = { disputeCategory = catKey },
                                                label = { Text(label, fontSize = 12.sp) }
                                            )
                                        }
                                    }

                                    // Subject Input
                                    OutlinedTextField(
                                        value = subject,
                                        onValueChange = { subject = it },
                                        label = { Text("Dispute Subject") },
                                        placeholder = { Text("e.g. Appeal against dual enrolment notice") },
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

                                    // Description Input
                                    OutlinedTextField(
                                        value = description,
                                        onValueChange = { description = it },
                                        label = { Text("Detailed Explanation & Facts") },
                                        placeholder = { Text("State your claim with dates and institution communication (min 10 characters)") },
                                        minLines = 4,
                                        modifier = Modifier.fillMaxWidth(),
                                        colors = OutlinedTextFieldDefaults.colors(
                                            focusedBorderColor = VidyadwaarGold,
                                            unfocusedBorderColor = VidyadwaarBorder,
                                            focusedTextColor = VidyadwaarTextPrimary,
                                            unfocusedTextColor = VidyadwaarTextPrimary,
                                            focusedLabelColor = VidyadwaarGold
                                        )
                                    )

                                    val isFormValid = subject.trim().length >= 5 && description.trim().length >= 10

                                    Button(
                                        onClick = {
                                            if (!isFormValid || isSubmitting) return@Button
                                            isSubmitting = true
                                            submitSuccessMessage = null
                                            submitErrorMessage = null

                                            scope.launch {
                                                val req = GrievanceSubmitIn(
                                                    category = disputeCategory,
                                                    subject = subject.trim(),
                                                    description = description.trim(),
                                                    enrolmentId = selectedEnrolment?.id,
                                                    institutionId = selectedEnrolment?.institutionId,
                                                    recordType = "grievance"
                                                )
                                                val res = repository.submitGrievance(req)
                                                isSubmitting = false
                                                res.onSuccess {
                                                    submitSuccessMessage = "Dispute filed successfully (Case ID #${it.id}). Institution notified."
                                                    subject = ""
                                                    description = ""
                                                    loadData()
                                                    selectedTab = 0
                                                }.onFailure { err ->
                                                    submitErrorMessage = err.message ?: "Failed to file dispute."
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
                                            Text("Submit Official Dispute", color = VidyadwaarDeepNavy, fontWeight = FontWeight.Bold)
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
fun DisputeCard(item: GrievanceOut) {
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

            // Attached Evidence with SHA-256 Digest
            if (item.evidence.isNotEmpty()) {
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = VidyadwaarDeepNavy,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(
                            text = "ATTACHED EVIDENCE DOCUMENTS (${item.evidence.size})",
                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                            color = VidyadwaarGold
                        )
                        item.evidence.forEach { ev ->
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(ev.filename, style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold), color = VidyadwaarTextPrimary)
                                    Text(
                                        "SHA-256: ${ev.sha256Digest.take(16)}...",
                                        style = MaterialTheme.typography.labelSmall.copy(fontFamily = FontFamily.Monospace),
                                        color = VidyadwaarEmerald
                                    )
                                }
                                StatusChip(status = ev.status)
                            }
                        }
                    }
                }
            }

            // Resolution / Reviewer notes
            if (!item.resolutionSummary.isNullOrBlank()) {
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = VidyadwaarCard,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(
                            text = "Official Resolution Note:",
                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                            color = VidyadwaarGold
                        )
                        Text(
                            text = item.resolutionSummary,
                            style = MaterialTheme.typography.bodySmall,
                            color = VidyadwaarTextSecondary
                        )
                    }
                }
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Dispute Case #${item.id}",
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
