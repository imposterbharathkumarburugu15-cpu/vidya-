package com.example.vidyadwaar.ui.settings

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.vidyadwaar.BuildConfig
import com.example.vidyadwaar.VidyadwaarApp
import com.example.vidyadwaar.ui.components.VidyadwaarTopBar
import com.example.vidyadwaar.ui.theme.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.net.HttpURLConnection
import java.net.URL

@Composable
fun SettingsScreen(
    onNavigateBack: () -> Unit,
    onLogout: () -> Unit
) {
    val repository = VidyadwaarApp.instance.studentRepository
    val sessionManager = repository.getSessionManager()
    val scope = rememberCoroutineScope()

    var serverUrl by remember { mutableStateOf(sessionManager.getBaseUrl()) }
    var connectionStatus by remember { mutableStateOf<String?>(null) }
    var isTestingConnection by remember { mutableStateOf(false) }
    var isSuccess by remember { mutableStateOf(false) }

    Scaffold(
        containerColor = VidyadwaarDeepNavy,
        topBar = {
            VidyadwaarTopBar(
                title = "Settings & Environment",
                canNavigateBack = true,
                onNavigateBack = onNavigateBack
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Server Endpoint Configuration
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
                        text = "Vidyadwaar Backend Configuration",
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                        color = VidyadwaarGold
                    )
                    Text(
                        text = "Specify the backend gateway URL for local emulation, network testing, or production.",
                        style = MaterialTheme.typography.bodySmall,
                        color = VidyadwaarTextSecondary
                    )

                    OutlinedTextField(
                        value = serverUrl,
                        onValueChange = {
                            serverUrl = it
                            connectionStatus = null
                        },
                        label = { Text("Server Base URL") },
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

                    // Presets
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = {
                                serverUrl = "http://10.0.2.2:8000/"
                                repository.updateServerUrl("http://10.0.2.2:8000/")
                            },
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Emulator (10.0.2.2)")
                        }
                        OutlinedButton(
                            onClick = {
                                serverUrl = "http://127.0.0.1:8000/"
                                repository.updateServerUrl("http://127.0.0.1:8000/")
                            },
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Localhost")
                        }
                    }

                    // Test Connection Button
                    Button(
                        onClick = {
                            repository.updateServerUrl(serverUrl)
                            isTestingConnection = true
                            connectionStatus = null
                            scope.launch {
                                val ok = withContext(Dispatchers.IO) {
                                    try {
                                        val url = URL(if (serverUrl.endsWith("/")) "${serverUrl}docs" else "$serverUrl/docs")
                                        val conn = url.openConnection() as HttpURLConnection
                                        conn.connectTimeout = 4000
                                        conn.readTimeout = 4000
                                        conn.requestMethod = "GET"
                                        val code = conn.responseCode
                                        conn.disconnect()
                                        code in 200..399
                                    } catch (_: Exception) {
                                        false
                                    }
                                }
                                isTestingConnection = false
                                isSuccess = ok
                                connectionStatus = if (ok) "Backend connected successfully!" else "Could not reach server. Verify backend is running on $serverUrl"
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = VidyadwaarGold)
                    ) {
                        if (isTestingConnection) {
                            CircularProgressIndicator(modifier = Modifier.size(18.dp), color = VidyadwaarDeepNavy)
                        } else {
                            Icon(Icons.Default.NetworkCheck, contentDescription = null, tint = VidyadwaarDeepNavy)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Test Connectivity", color = VidyadwaarDeepNavy, fontWeight = FontWeight.Bold)
                        }
                    }

                    if (connectionStatus != null) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = if (isSuccess) VidyadwaarEmerald.copy(alpha = 0.15f) else VidyadwaarRose.copy(alpha = 0.15f),
                            border = androidx.compose.foundation.BorderStroke(1.dp, if (isSuccess) VidyadwaarEmerald else VidyadwaarRose)
                        ) {
                            Row(
                                modifier = Modifier.padding(10.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(
                                    imageVector = if (isSuccess) Icons.Default.CheckCircle else Icons.Default.ErrorOutline,
                                    contentDescription = null,
                                    tint = if (isSuccess) VidyadwaarEmerald else VidyadwaarRose
                                )
                                Text(
                                    text = connectionStatus!!,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = if (isSuccess) VidyadwaarEmerald else VidyadwaarRose
                                )
                            }
                        }
                    }
                }
            }

            // Security & Architecture Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = VidyadwaarSurface)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Text(
                        text = "Security & Integrity Controls",
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                        color = VidyadwaarGold
                    )
                    Text("• Session Store: EncryptedSharedPreferences (AES-256 SIV/GCM)", style = MaterialTheme.typography.bodySmall, color = VidyadwaarTextSecondary)
                    Text("• Authorization: Server-Side Row-Level Security (PostgreSQL RLS)", style = MaterialTheme.typography.bodySmall, color = VidyadwaarTextSecondary)
                    Text("• Zero Secrets in APK: No DB passwords or privileged roles embedded", style = MaterialTheme.typography.bodySmall, color = VidyadwaarTextSecondary)
                    Text("• Target Platform: Android 15 (API 35/36) | Jetpack Compose", style = MaterialTheme.typography.bodySmall, color = VidyadwaarTextSecondary)
                }
            }

            // Session Information & Sign Out
            if (repository.isLoggedIn()) {
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
                            text = "Active Session",
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                            color = VidyadwaarGold
                        )
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Masked APAAR:", style = MaterialTheme.typography.bodySmall, color = VidyadwaarTextMuted)
                            Text(sessionManager.getMaskedApaar() ?: "XXXX-XXXX-XXXX", style = MaterialTheme.typography.bodySmall.copy(fontFamily = FontFamily.Monospace), color = VidyadwaarTextPrimary)
                        }
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Active Role:", style = MaterialTheme.typography.bodySmall, color = VidyadwaarTextMuted)
                            Text(sessionManager.getRole() ?: "student", style = MaterialTheme.typography.bodySmall, color = VidyadwaarSky)
                        }

                        Button(
                            onClick = {
                                repository.logout()
                                onLogout()
                            },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(containerColor = VidyadwaarRose)
                        ) {
                            Icon(Icons.Default.Logout, contentDescription = null, tint = VidyadwaarTextPrimary)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Sign Out & Destroy Local Session", color = VidyadwaarTextPrimary, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}
