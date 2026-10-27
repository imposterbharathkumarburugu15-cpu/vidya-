package com.example.vidyadwaar.ui.consents

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
import androidx.compose.ui.unit.sp
import com.example.vidyadwaar.VidyadwaarApp
import com.example.vidyadwaar.data.model.ConsentOut
import com.example.vidyadwaar.ui.components.*
import com.example.vidyadwaar.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun ConsentsScreen(
    onNavigateBack: () -> Unit
) {
    val repository = VidyadwaarApp.instance.studentRepository
    val scope = rememberCoroutineScope()

    var consents by remember { mutableStateOf<List<ConsentOut>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var actionMessage by remember { mutableStateOf<String?>(null) }

    fun loadData() {
        isLoading = true
        errorMessage = null
        scope.launch {
            val result = repository.getConsents()
            isLoading = false
            result.onSuccess {
                consents = it
            }.onFailure {
                errorMessage = it.message ?: "Failed to retrieve data consents."
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
                title = "Data Consents",
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
            isLoading -> LoadingView("Querying data consent authorizations...")
            errorMessage != null -> ErrorView(message = errorMessage!!, onRetry = { loadData() })
            else -> {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding)
                        .padding(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    item {
                        Spacer(modifier = Modifier.height(4.dp))
                        // Consent Policy Banner
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = VidyadwaarSky.copy(alpha = 0.12f),
                            border = androidx.compose.foundation.BorderStroke(1.dp, VidyadwaarSky.copy(alpha = 0.4f))
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(14.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                Icon(Icons.Default.PrivacyTip, contentDescription = null, tint = VidyadwaarSky, modifier = Modifier.size(24.dp))
                                Column {
                                    Text(
                                        text = "Student Consent & Privacy Control",
                                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                        color = VidyadwaarSky
                                    )
                                    Text(
                                        text = "Third-party employers or agencies can only view the specific attributes you authorize.",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = VidyadwaarTextSecondary
                                    )
                                }
                            }
                        }
                    }

                    if (actionMessage != null) {
                        item {
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = VidyadwaarEmerald.copy(alpha = 0.15f),
                                border = androidx.compose.foundation.BorderStroke(1.dp, VidyadwaarEmerald)
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Icon(Icons.Default.Check, contentDescription = null, tint = VidyadwaarEmerald)
                                    Text(actionMessage!!, color = VidyadwaarEmerald, style = MaterialTheme.typography.bodySmall)
                                }
                            }
                        }
                    }

                    item {
                        Text(
                            text = "Consent Requests (${consents.size})",
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                            color = VidyadwaarGold
                        )
                    }

                    if (consents.isEmpty()) {
                        item {
                            EmptyStateView(
                                icon = Icons.Default.FactCheck,
                                title = "No Consent Requests",
                                description = "There are no pending or recorded third-party verification consent requests."
                            )
                        }
                    } else {
                        items(consents) { consentItem ->
                            ConsentCard(
                                consent = consentItem,
                                onDeny = {
                                    scope.launch {
                                        val res = repository.denyConsent(consentItem.id)
                                        res.onSuccess {
                                            actionMessage = "Consent request #${consentItem.id} has been denied."
                                            loadData()
                                        }.onFailure {
                                            errorMessage = it.message ?: "Failed to deny consent request."
                                        }
                                    }
                                }
                            )
                        }
                    }

                    item { Spacer(modifier = Modifier.height(24.dp)) }
                }
            }
        }
    }
}

@Composable
fun ConsentCard(
    consent: ConsentOut,
    onDeny: () -> Unit
) {
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
                    text = consent.requester,
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = VidyadwaarTextPrimary
                )
                StatusChip(status = consent.status)
            }

            Text(
                text = "Purpose: ${consent.purpose}",
                style = MaterialTheme.typography.bodyMedium,
                color = VidyadwaarGoldLight
            )

            HorizontalDivider(color = VidyadwaarBorder.copy(alpha = 0.5f))

            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = "REQUESTED FIELDS",
                    style = MaterialTheme.typography.labelSmall,
                    color = VidyadwaarTextMuted
                )
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    consent.fields.forEach { field ->
                        Surface(
                            shape = RoundedCornerShape(4.dp),
                            color = VidyadwaarDeepNavy
                        ) {
                            Text(
                                text = field,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                                color = VidyadwaarSky
                            )
                        }
                    }
                }
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Expires: ${consent.expiresAt.take(10)}",
                    style = MaterialTheme.typography.labelSmall,
                    color = VidyadwaarTextMuted
                )

                if (consent.status == "pending") {
                    OutlinedButton(
                        onClick = onDeny,
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = VidyadwaarRose)
                    ) {
                        Icon(Icons.Default.Close, contentDescription = null, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Deny", fontSize = 12.sp)
                    }
                }
            }
        }
    }
}
