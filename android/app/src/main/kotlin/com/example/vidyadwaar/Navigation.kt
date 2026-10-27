package com.example.vidyadwaar

import androidx.compose.runtime.Composable
import androidx.navigation3.runtime.entryProvider
import androidx.navigation3.runtime.rememberNavBackStack
import androidx.navigation3.ui.NavDisplay
import com.example.vidyadwaar.ui.accesslog.AccessLogScreen
import com.example.vidyadwaar.ui.auth.LoginScreen
import com.example.vidyadwaar.ui.auth.SplashScreen
import com.example.vidyadwaar.ui.consents.ConsentsScreen
import com.example.vidyadwaar.ui.corrections.CorrectionsScreen
import com.example.vidyadwaar.ui.credentials.CredentialsScreen
import com.example.vidyadwaar.ui.disputes.DisputesScreen
import com.example.vidyadwaar.ui.home.HomeScreen
import com.example.vidyadwaar.ui.profile.ProfileScreen
import com.example.vidyadwaar.ui.settings.SettingsScreen

@Composable
fun MainNavigation() {
    val backStack = rememberNavBackStack(SplashKey)

    NavDisplay(
        backStack = backStack,
        onBack = { backStack.removeLastOrNull() },
        entryProvider = entryProvider {
            entry<SplashKey> {
                SplashScreen(
                    onNavigateToHome = {
                        backStack.clear()
                        backStack.add(HomeKey)
                    },
                    onNavigateToLogin = {
                        backStack.clear()
                        backStack.add(LoginKey)
                    }
                )
            }

            entry<LoginKey> {
                LoginScreen(
                    onLoginSuccess = {
                        backStack.clear()
                        backStack.add(HomeKey)
                    },
                    onOpenSettings = {
                        backStack.add(SettingsKey)
                    }
                )
            }

            entry<HomeKey> {
                HomeScreen(
                    onNavigateToProfile = { backStack.add(ProfileKey) },
                    onNavigateToCorrections = { backStack.add(CorrectionsKey) },
                    onNavigateToDisputes = { backStack.add(DisputesKey) },
                    onNavigateToCredentials = { backStack.add(CredentialsKey) },
                    onNavigateToConsents = { backStack.add(ConsentsKey) },
                    onNavigateToAccessLog = { backStack.add(AccessLogKey) },
                    onNavigateToSettings = { backStack.add(SettingsKey) },
                    onLogout = {
                        backStack.clear()
                        backStack.add(LoginKey)
                    }
                )
            }

            entry<ProfileKey> {
                ProfileScreen(onNavigateBack = { backStack.removeLastOrNull() })
            }

            entry<CorrectionsKey> {
                CorrectionsScreen(onNavigateBack = { backStack.removeLastOrNull() })
            }

            entry<DisputesKey> {
                DisputesScreen(onNavigateBack = { backStack.removeLastOrNull() })
            }

            entry<CredentialsKey> {
                CredentialsScreen(onNavigateBack = { backStack.removeLastOrNull() })
            }

            entry<ConsentsKey> {
                ConsentsScreen(onNavigateBack = { backStack.removeLastOrNull() })
            }

            entry<AccessLogKey> {
                AccessLogScreen(onNavigateBack = { backStack.removeLastOrNull() })
            }

            entry<SettingsKey> {
                SettingsScreen(
                    onNavigateBack = { backStack.removeLastOrNull() },
                    onLogout = {
                        backStack.clear()
                        backStack.add(LoginKey)
                    }
                )
            }
        }
    )
}
