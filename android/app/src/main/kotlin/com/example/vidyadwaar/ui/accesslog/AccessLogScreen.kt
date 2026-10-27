package com.example.vidyadwaar.ui.accesslog

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
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.vidyadwaar.VidyadwaarApp
import com.example.vidyadwaar.data.model.AccessLogEntry
import com.example.vidyadwaar.ui.components.*
import com.example.vidyadwaar.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun AccessLogScreen(
    onNavigateBack: () -> Unit
) {
    val repository = VidyadwaarApp.instance.studentRepository
    val scope = rememberCoroutineScope()

    var logs by remember { mutableStateOf<List<AccessLogEntry>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    fun loadData() {
        isLoading = true
        errorMessage = null
        scope.launch {
            val result = repository.getAccessLog()
            isLoading = false
            result.onSuccess {
                logs = it
            }.onFailure {
                errorMessage = it.message ?: "Failed to retrieve access audit trail."
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
                title = "Access Transparency (D6)",
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
            isLoading -> LoadingView("Loading immutable access audit logs...")
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
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = VidyadwaarGold.copy(alpha = 0.12f),
                            border = androidx.compose.foundation.BorderStroke(1.dp, VidyadwaarGold.copy(alpha = 0.4f))
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(14.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                Icon(Icons.Default.Security, contentDescription = null, tint = VidyadwaarGold, modifier = Modifier.size(24.dp))
                                Column {
                                    Text(
                                        text = "Section D6 Regulatory Transparency",
                                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                        color = VidyadwaarGold
                                    )
                                    Text(
                                        text = "Complete unalterable log of every query, verification, unmasking, or export of your record.",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = VidyadwaarTextSecondary
                                    )
                                }
                            }
                        }
                    }

                    item {
                        Text(
                            text = "Recorded Audit Events (${logs.size})",
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                            color = VidyadwaarGold
                        )
                    }

                    if (logs.isEmpty()) {
                        item {
                            EmptyStateView(
                                icon = Icons.Default.HistoryEdu,
                                title = "No Access Records Found",
                                description = "No institutional or regulator access has been recorded for your academic record."
                            )
                        }
                    } else {
                        items(logs) { entry ->
                            AccessLogCard(entry = entry)
                        }
                    }

                    item { Spacer(modifier = Modifier.height(24.dp)) }
                }
            }
        }
    }
}

@Composable
fun AccessLogCard(entry: AccessLogEntry) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = VidyadwaarSurface)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = entry.action.uppercase(),
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                    color = VidyadwaarGold
                )
                Surface(
                    shape = RoundedCornerShape(4.dp),
                    color = VidyadwaarDeepNavy
                ) {
                    Text(
                        text = entry.role.uppercase(),
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = VidyadwaarSky
                    )
                }
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Actor: ${entry.actor}",
                    style = MaterialTheme.typography.bodySmall,
                    color = VidyadwaarTextPrimary
                )
                Text(
                    text = "Entity: ${entry.entity} ${if (!entry.entityId.isNullOrBlank()) "#${entry.entityId}" else ""}",
                    style = MaterialTheme.typography.bodySmall,
                    color = VidyadwaarTextSecondary
                )
            }

            if (!entry.reason.isNullOrBlank()) {
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = VidyadwaarCard,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "Reason: ${entry.reason}",
                        modifier = Modifier.padding(8.dp),
                        style = MaterialTheme.typography.bodySmall,
                        color = VidyadwaarTextMuted
                    )
                }
            }

            Text(
                text = entry.timestamp,
                style = MaterialTheme.typography.labelSmall.copy(fontFamily = FontFamily.Monospace),
                color = VidyadwaarTextMuted
            )
        }
    }
}
