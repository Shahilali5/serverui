"use client";

import { Desktop } from "@/src/components/desktop/Desktop";
import { AppearanceEffects } from "@/src/lib/appearance";
import { RuntimeProvider } from "@/src/lib/runtime";
import { SessionProvider } from "@/src/lib/session";
import { ThemeProvider } from "@/src/lib/theme";
import { WallpaperProvider } from "@/src/lib/wallpaper";
import { AutoUpdaterProvider } from "@/src/lib/updater";
import { AuthProvider, useAuth } from "@/src/lib/auth";
import { LoginScreen } from "@/src/components/auth/LoginScreen";

export function AppShell() {
  return (
    <ThemeProvider>
      <AppearanceEffects />
      <AuthProvider>
        <AutoUpdaterProvider>
          <WallpaperProvider>
            <RuntimeProvider>
              <SessionProvider>
                <AppScreens />
              </SessionProvider>
            </RuntimeProvider>
          </WallpaperProvider>
        </AutoUpdaterProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppScreens() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="h-dvh w-full">
      <Desktop />
    </div>
  );
}
