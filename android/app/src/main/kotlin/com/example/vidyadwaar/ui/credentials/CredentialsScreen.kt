package com.example.vidyadwaar.ui.credentials

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
import com.example.vidyadwaar.data.model.CredentialOut
import com.example.vidyadwaar.ui.components.*
import com.example.vidyadwaar.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun CredentialsScreen(
    onNavigateBack: () -> Unit
) {
    val repository = VidyadwaarApp.instance.studentRepository
    val scope = rememberCoroutineScope()

    var credentials by remember { mutableStateOf<List<CredentialOut>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    fun loadData() {
        isLoading = true
        errorMessage = null
        scope.launch {
            val result = repository.getCredentials()
            isLoading = false
            result.onSuccess {
                credentials = it
            }.onFailure {
                errorMessage = it.message ?: "Failed to retrieve issued verifiable credentials."
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
                title = "Verifiable Credentials",
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
            isLoading -> LoadingView("Querying W3C Verifiable Credentials...")
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
                        // Cryptographic Assurance Banner
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = VidyadwaarEmerald.copy(alpha = 0.12f),
                            border = androidx.compose.foundation.BorderStroke(1.dp, VidyadwaarEmerald.copy(alpha = 0.4f))
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(14.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                Icon(Icons.Default.Verified, contentDescription = null, tint = VidyadwaarEmerald, modifier = Modifier.size(24.dp))
                                Column {
                                    Text(
                                        text = "W3C Verifiable Credentials 2.0",
                                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                        color = VidyadwaarEmerald
                                    )
                                    Text(
                                        text = "Signed via eddsa-jcs-2022 with Bitstring Status List revocation checking.",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = VidyadwaarTextSecondary
                                    )
                                }
                            }
                        }
                    }

                    item {
                        Text(
                            text = "Issued Student Credentials (${credentials.size})",
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                            color = VidyadwaarGold
                        )
                    }

                    if (credentials.isEmpty()) {
                        item {
                            EmptyStateView(
                                icon = Icons.Default.VerifiedUser,
                                title = "No Credentials Issued Yet",
                                description = "Verifiable enrolment and degree credentials are issued by your institution upon active verification."
                            )
                        }
                    } else {
                        items(credentials) { cred ->
                            CredentialItemCard(cred = cred)
                        }
                    }

                    item { Spacer(modifier = Modifier.height(24.dp)) }
                }
            }
        }
    }
}

@Composable
fun CredentialItemCard(cred: CredentialOut) {
    val isRevoked = cred.status?.revocation == true
    val isSuspended = cred.status?.suspension == true
    val statusLabel = when {
        isRevoked -> "REVOKED"
        isSuspended -> "SUSPENDED"
        else -> "VALID"
    }

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
                    text = cred.type,
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = VidyadwaarTextPrimary
                )
                StatusChip(status = statusLabel)
            }

            HorizontalDivider(color = VidyadwaarBorder.copy(alpha = 0.5f))

            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = "CREDENTIAL ID",
                    style = MaterialTheme.typography.labelSmall,
                    color = VidyadwaarTextMuted
                )
                Text(
                    text = cred.id,
                    style = MaterialTheme.typography.bodySmall.copy(fontFamily = FontFamily.Monospace),
                    color = VidyadwaarSky
                )
            }

            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = "ISSUER DID",
                    style = MaterialTheme.typography.labelSmall,
                    color = VidyadwaarTextMuted
                )
                Text(
                    text = cred.issuerDid,
                    style = MaterialTheme.typography.bodySmall.copy(fontFamily = FontFamily.Monospace),
                    color = VidyadwaarTextPrimary
                )
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Issued: ${cred.issuedAt.take(10)}",
                    style = MaterialTheme.typography.labelSmall,
                    color = VidyadwaarTextMuted
                )
                Text(
                    text = "Status: Bitstring List",
                    style = MaterialTheme.typography.labelSmall,
                    color = VidyadwaarGoldLight
                )
            }
        }
    }
}
