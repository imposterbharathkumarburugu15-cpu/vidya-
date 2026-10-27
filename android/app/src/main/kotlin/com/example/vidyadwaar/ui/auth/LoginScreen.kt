package com.example.vidyadwaar.ui.auth

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.vidyadwaar.VidyadwaarApp
import com.example.vidyadwaar.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    onLoginSuccess: () -> Unit,
    onOpenSettings: () -> Unit
) {
    val repository = VidyadwaarApp.instance.studentRepository
    val scope = rememberCoroutineScope()

    var apaarId by remember { mutableStateOf("") }
    var dob by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var showDemoHelper by remember { mutableStateOf(false) }

    val isApaarValid = apaarId.trim().length == 12 && apaarId.trim().all { it.isDigit() }
    val isDobValid = Regex("^\\d{4}-\\d{2}-\\d{2}$").matches(dob.trim())
    val canSubmit = isApaarValid && isDobValid && !isLoading

    Scaffold(
        containerColor = VidyadwaarDeepNavy,
        topBar = {
            TopAppBar(
                title = { },
                actions = {
                    IconButton(onClick = onOpenSettings) {
                        Icon(
                            imageVector = Icons.Default.Settings,
                            contentDescription = "Server Settings",
                            tint = VidyadwaarGold
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.Transparent)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp, vertical = 12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Vidyadwaar Approved Banner Logo
            Image(
                painter = androidx.compose.ui.res.painterResource(id = com.example.vidyadwaar.R.drawable.vidyadwaar_logo),
                contentDescription = "Vidyadwaar Logo",
                modifier = Modifier
                    .fillMaxWidth()
                    .height(90.dp)
                    .padding(horizontal = 8.dp),
                contentScale = androidx.compose.ui.layout.ContentScale.Fit
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Login Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = VidyadwaarSurface)
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Text(
                        text = "Student Portal Sign-In",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = VidyadwaarTextPrimary
                    )

                    Text(
                        text = "Authenticate with your 12-digit APAAR ID and registered date of birth.",
                        style = MaterialTheme.typography.bodySmall,
                        color = VidyadwaarTextSecondary
                    )

                    // Error Banner
                    if (errorMessage != null) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = VidyadwaarRose.copy(alpha = 0.15f),
                            border = androidx.compose.foundation.BorderStroke(1.dp, VidyadwaarRose.copy(alpha = 0.5f))
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.ErrorOutline,
                                    contentDescription = null,
                                    tint = VidyadwaarRose,
                                    modifier = Modifier.size(18.dp)
                                )
                                Text(
                                    text = errorMessage!!,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = VidyadwaarRose
                                )
                            }
                        }
                    }

                    // APAAR ID Input
                    OutlinedTextField(
                        value = apaarId,
                        onValueChange = {
                            if (it.length <= 12 && it.all { char -> char.isDigit() }) {
                                apaarId = it
                                errorMessage = null
                            }
                        },
                        label = { Text("APAAR ID (12 digits)") },
                        placeholder = { Text("e.g. 100000000001") },
                        leadingIcon = {
                            Icon(Icons.Default.Badge, contentDescription = null, tint = VidyadwaarGold)
                        },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = VidyadwaarGold,
                            unfocusedBorderColor = VidyadwaarBorder,
                            focusedTextColor = VidyadwaarTextPrimary,
                            unfocusedTextColor = VidyadwaarTextPrimary,
                            focusedLabelColor = VidyadwaarGold,
                            unfocusedLabelColor = VidyadwaarTextMuted
                        )
                    )

                    // DOB Input
                    OutlinedTextField(
                        value = dob,
                        onValueChange = {
                            dob = it
                            errorMessage = null
                        },
                        label = { Text("Date of Birth (YYYY-MM-DD)") },
                        placeholder = { Text("2003-05-15") },
                        leadingIcon = {
                            Icon(Icons.Default.CalendarToday, contentDescription = null, tint = VidyadwaarGold)
                        },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = VidyadwaarGold,
                            unfocusedBorderColor = VidyadwaarBorder,
                            focusedTextColor = VidyadwaarTextPrimary,
                            unfocusedTextColor = VidyadwaarTextPrimary,
                            focusedLabelColor = VidyadwaarGold,
                            unfocusedLabelColor = VidyadwaarTextMuted
                        )
                    )

                    // Sign-In Button
                    Button(
                        onClick = {
                            if (!canSubmit) return@Button
                            isLoading = true
                            errorMessage = null
                            scope.launch {
                                val result = repository.login(apaarId, dob)
                                isLoading = false
                                result.onSuccess {
                                    onLoginSuccess()
                                }.onFailure { error ->
                                    errorMessage = error.message ?: "Authentication failed. Check your APAAR ID and DOB."
                                }
                            }
                        },
                        enabled = canSubmit,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = VidyadwaarGold,
                            disabledContainerColor = VidyadwaarBorder
                        )
                    ) {
                        if (isLoading) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(20.dp),
                                color = VidyadwaarDeepNavy,
                                strokeWidth = 2.dp
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Verifying Identity...",
                                color = VidyadwaarDeepNavy,
                                fontWeight = FontWeight.Bold
                            )
                        } else {
                            Icon(
                                imageVector = Icons.Default.LockOpen,
                                contentDescription = null,
                                tint = if (canSubmit) VidyadwaarDeepNavy else VidyadwaarTextMuted,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Secure Sign-In",
                                color = if (canSubmit) VidyadwaarDeepNavy else VidyadwaarTextMuted,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    // Demo Quick-Fill Helper
                    TextButton(
                        onClick = { showDemoHelper = !showDemoHelper },
                        modifier = Modifier.align(Alignment.CenterHorizontally)
                    ) {
                        Icon(
                            imageVector = if (showDemoHelper) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                            contentDescription = null,
                            tint = VidyadwaarSky,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "Test Account Presets",
                            color = VidyadwaarSky,
                            style = MaterialTheme.typography.labelMedium
                        )
                    }

                    if (showDemoHelper) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(VidyadwaarDeepNavy, RoundedCornerShape(8.dp))
                                .padding(12.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Text(
                                text = "Synthetic Demo Credentials:",
                                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                color = VidyadwaarGold
                            )
                            Button(
                                onClick = {
                                    apaarId = "100000000001"
                                    dob = "2003-05-15"
                                    errorMessage = null
                                },
                                modifier = Modifier.fillMaxWidth(),
                                colors = ButtonDefaults.buttonColors(containerColor = VidyadwaarCard)
                            ) {
                                Text(
                                    text = "Fill: 100000000001 (DOB: 2003-05-15)",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = VidyadwaarTextPrimary
                                )
                            }
                            Button(
                                onClick = {
                                    apaarId = "100000000002"
                                    dob = "2002-11-20"
                                    errorMessage = null
                                },
                                modifier = Modifier.fillMaxWidth(),
                                colors = ButtonDefaults.buttonColors(containerColor = VidyadwaarCard)
                            ) {
                                Text(
                                    text = "Fill: 100000000002 (DOB: 2002-11-20)",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = VidyadwaarTextPrimary
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Security Notice
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Security,
                    contentDescription = null,
                    tint = VidyadwaarEmerald,
                    modifier = Modifier.size(16.dp)
                )
                Text(
                    text = "End-to-End Cryptographic & RLS Protection",
                    style = MaterialTheme.typography.labelSmall,
                    color = VidyadwaarTextMuted
                )
            }
            Text(
                text = "Backend derives student identity server-side. No sensitive credentials stored unencrypted.",
                style = MaterialTheme.typography.bodySmall,
                color = VidyadwaarTextMuted.copy(alpha = 0.7f),
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(top = 4.dp)
            )
        }
    }
}
