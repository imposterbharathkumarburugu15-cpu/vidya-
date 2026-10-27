package com.example.vidyadwaar.ui.home

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.vidyadwaar.VidyadwaarApp
import com.example.vidyadwaar.data.model.StudentEnrolment
import com.example.vidyadwaar.data.model.StudentProfile
import com.example.vidyadwaar.ui.components.*
import com.example.vidyadwaar.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun HomeScreen(
    onNavigateToProfile: () -> Unit,
    onNavigateToCorrections: () -> Unit,
    onNavigateToDisputes: () -> Unit,
    onNavigateToCredentials: () -> Unit,
    onNavigateToConsents: () -> Unit,
    onNavigateToAccessLog: () -> Unit,
    onNavigateToSettings: () -> Unit,
    onLogout: () -> Unit
) {
    val repository = VidyadwaarApp.instance.studentRepository
    val sessionManager = repository.getSessionManager()
    val scope = rememberCoroutineScope()

    var profile by remember { mutableStateOf<StudentProfile?>(null) }
    var isLoading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var showLogoutDialog by remember { mutableStateOf(false) }

    fun loadData() {
        isLoading = true
        errorMessage = null
        scope.launch {
            val result = repository.getProfile()
            isLoading = false
            result.onSuccess {
                profile = it
            }.onFailure { error ->
                errorMessage = error.message ?: "Failed to load academic records."
            }
        }
    }

    LaunchedEffect(Unit) {
        loadData()
    }

    if (showLogoutDialog) {
        AlertDialog(
            onDismissRequest = { showLogoutDialog = false },
            title = { Text("Confirm Sign-Out") },
            text = { Text("Are you sure you want to log out? Your secure cryptographic session will be cleared from this device.") },
            confirmButton = {
                TextButton(
                    onClick = {
                        showLogoutDialog = false
                        repository.logout()
                        onLogout()
                    }
                ) {
                    Text("Sign Out", color = VidyadwaarRose, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showLogoutDialog = false }) {
                    Text("Cancel", color = VidyadwaarTextSecondary)
                }
            },
            containerColor = VidyadwaarSurface,
            titleContentColor = VidyadwaarTextPrimary,
            textContentColor = VidyadwaarTextSecondary
        )
    }

    Scaffold(
        containerColor = VidyadwaarDeepNavy,
        topBar = {
            VidyadwaarTopBar(
                title = "Vidyadwaar Student",
                actions = {
                    IconButton(onClick = { loadData() }) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "Refresh",
                            tint = VidyadwaarGold
                        )
                    }
                    IconButton(onClick = onNavigateToSettings) {
                        Icon(
                            imageVector = Icons.Default.Settings,
                            contentDescription = "Settings",
                            tint = VidyadwaarGold
                        )
                    }
                    IconButton(onClick = { showLogoutDialog = true }) {
                        Icon(
                            imageVector = Icons.Default.Logout,
                            contentDescription = "Logout",
                            tint = VidyadwaarRose
                        )
                    }
                }
            )
        }
    ) { padding ->
        when {
            isLoading -> {
                LoadingView("Retrieving official student academic records...")
            }
            errorMessage != null -> {
                ErrorView(
                    message = errorMessage!!,
                    onRetry = { loadData() }
                )
            }
            profile != null -> {
                val data = profile!!
                val displayName = sessionManager.getDisplayName() ?: "Student"

                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding)
                        .padding(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    item {
                        Spacer(modifier = Modifier.height(4.dp))
                        // Digital Identity Card
                        ApaarCard(
                            maskedApaar = data.apaarMasked ?: sessionManager.getMaskedApaar() ?: "XXXX-XXXX-XXXX",
                            status = data.apaarStatus,
                            studentName = displayName,
                            provisionalId = data.provisionalId
                        )
                    }

                    // Verification / Discrepancy Alert Banner
                    item {
                        val hasPending = data.enrolments.any { it.status != "enrolled" && it.status != "completed" }
                        if (hasPending) {
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = VidyadwaarAmber.copy(alpha = 0.15f),
                                border = androidx.compose.foundation.BorderStroke(1.dp, VidyadwaarAmber.copy(alpha = 0.5f))
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(16.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.WarningAmber,
                                        contentDescription = null,
                                        tint = VidyadwaarAmber,
                                        modifier = Modifier.size(28.dp)
                                    )
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = "Verification Action Required",
                                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                            color = VidyadwaarAmber
                                        )
                                        Text(
                                            text = "One or more enrolments require discrepancy review or supporting documentation.",
                                            style = MaterialTheme.typography.bodySmall,
                                            color = VidyadwaarTextSecondary
                                        )
                                    }
                                }
                            }
                        }
                    }

                    // Quick Actions Grid
                    item {
                        Text(
                            text = "Services & Verification",
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                            color = VidyadwaarGold
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                ServiceActionCard(
                                    title = "Academic Profile",
                                    subtitle = "Programmes & Details",
                                    icon = Icons.Default.Person,
                                    accentColor = VidyadwaarSky,
                                    modifier = Modifier.weight(1f),
                                    onClick = onNavigateToProfile
                                )
                                ServiceActionCard(
                                    title = "Corrections",
                                    subtitle = "Update Record & Diff",
                                    icon = Icons.Default.EditNote,
                                    accentColor = VidyadwaarGold,
                                    modifier = Modifier.weight(1f),
                                    onClick = onNavigateToCorrections
                                )
                            }
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                ServiceActionCard(
                                    title = "Disputes",
                                    subtitle = "Contest Duplicate Flags",
                                    icon = Icons.Default.Gavel,
                                    accentColor = VidyadwaarRose,
                                    modifier = Modifier.weight(1f),
                                    onClick = onNavigateToDisputes
                                )
                                ServiceActionCard(
                                    title = "Credentials",
                                    subtitle = "W3C VC Wallet",
                                    icon = Icons.Default.VerifiedUser,
                                    accentColor = VidyadwaarEmerald,
                                    modifier = Modifier.weight(1f),
                                    onClick = onNavigateToCredentials
                                )
                            }
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                ServiceActionCard(
                                    title = "Data Consents",
                                    subtitle = "Third-Party Access",
                                    icon = Icons.Default.FactCheck,
                                    accentColor = VidyadwaarSky,
                                    modifier = Modifier.weight(1f),
                                    onClick = onNavigateToConsents
                                )
                                ServiceActionCard(
                                    title = "Access Audit (D6)",
                                    subtitle = "Transparency Trail",
                                    icon = Icons.Default.HistoryEdu,
                                    accentColor = VidyadwaarGoldLight,
                                    modifier = Modifier.weight(1f),
                                    onClick = onNavigateToAccessLog
                                )
                            }
                        }
                    }

                    // Enrolment Records Section
                    item {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Registered Enrolments (${data.enrolments.size})",
                                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                color = VidyadwaarGold
                            )
                        }
                    }

                    if (data.enrolments.isEmpty()) {
                        item {
                            EmptyStateView(
                                icon = Icons.Default.School,
                                title = "No Active Enrolments",
                                description = "No institution has registered an active enrolment for this APAAR ID."
                            )
                        }
                    } else {
                        items(data.enrolments) { enrolment ->
                            EnrolmentItemCard(enrolment = enrolment)
                        }
                    }

                    item {
                        Spacer(modifier = Modifier.height(24.dp))
                    }
                }
            }
        }
    }
}

@Composable
fun ServiceActionCard(
    title: String,
    subtitle: String,
    icon: ImageVector,
    accentColor: androidx.compose.ui.graphics.Color,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Card(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .clickable(onClick = onClick),
        colors = CardDefaults.cardColors(containerColor = VidyadwaarSurface)
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(accentColor.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = accentColor,
                    modifier = Modifier.size(20.dp)
                )
            }
            Text(
                text = title,
                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                color = VidyadwaarTextPrimary
            )
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                color = VidyadwaarTextMuted
            )
        }
    }
}

@Composable
fun EnrolmentItemCard(enrolment: StudentEnrolment) {
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
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = enrolment.programme,
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = VidyadwaarTextPrimary
                    )
                    Text(
                        text = enrolment.institution,
                        style = MaterialTheme.typography.bodyMedium,
                        color = VidyadwaarGoldLight
                    )
                }
                StatusChip(status = enrolment.status)
            }

            HorizontalDivider(color = VidyadwaarBorder.copy(alpha = 0.5f))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        text = "ROLL NUMBER",
                        style = MaterialTheme.typography.labelSmall,
                        color = VidyadwaarTextMuted
                    )
                    Text(
                        text = enrolment.institutionStudentId,
                        style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                        color = VidyadwaarTextPrimary
                    )
                }
                Column {
                    Text(
                        text = "ACADEMIC YEAR",
                        style = MaterialTheme.typography.labelSmall,
                        color = VidyadwaarTextMuted
                    )
                    Text(
                        text = enrolment.academicYear,
                        style = MaterialTheme.typography.bodyMedium,
                        color = VidyadwaarTextPrimary
                    )
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = "SEAT CATEGORY",
                        style = MaterialTheme.typography.labelSmall,
                        color = VidyadwaarTextMuted
                    )
                    Text(
                        text = enrolment.categoryCode ?: "REGULAR",
                        style = MaterialTheme.typography.bodyMedium,
                        color = VidyadwaarSky
                    )
                }
            }
        }
    }
}
