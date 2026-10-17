import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { WallpaperProvider } from "@/src/lib/wallpaper";
import { AutoUpdaterProvider } from "@/src/lib/updater";
import { SettingsApp } from "./SettingsApp";

describe("SettingsApp", () => {
  afterEach(() => {
    delete document.documentElement.dataset.theme;
    localStorage.removeItem("serverui-wallpaper");
    localStorage.removeItem("serverui-wallpaper-light");
  });

  it("shows the General tab and allows navigation between Wallpapers and Updates", async () => {
    render(
      <AutoUpdaterProvider>
        <WallpaperProvider>
          <SettingsApp />
        </WallpaperProvider>
      </AutoUpdaterProvider>,
    );

    expect(screen.getByRole("button", { name: /General/i })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("heading", { name: "General" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Desktop Theme" })).toBeInTheDocument();

    // Navigate to Wallpapers tab
    const wallpaperNavBtn = screen.getByRole("button", { name: /Wallpapers/i });
    await userEvent.click(wallpaperNavBtn);

    expect(screen.getByRole("heading", { name: "Wallpapers" })).toBeInTheDocument();
    expect(screen.getByText(/Built-in Wallpapers \(10 Free\)/i)).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Crescent Cosmos" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Valley Twilight" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Nordic Aurora" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Monterey Wave" })).toBeInTheDocument();

    // Navigate to Updates tab
    const updatesNavBtn = screen.getByRole("button", { name: /Updates/i });
    await userEvent.click(updatesNavBtn);

    expect(screen.getByRole("heading", { name: "Software Updates" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Check for Updates/i })).toBeInTheDocument();
    expect(screen.getByText(/Automatic Update Checks/i)).toBeInTheDocument();
  });

  it("loads 10 light wallpapers when light theme is active", async () => {
    document.documentElement.dataset.theme = "light";
    render(
      <AutoUpdaterProvider>
        <WallpaperProvider>
          <SettingsApp payload={{ cwd: "wallpaper" }} />
        </WallpaperProvider>
      </AutoUpdaterProvider>,
    );

    expect(screen.getByRole("heading", { name: "Wallpapers" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Sunrise Valley" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Nordic Fjord" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Alpine Snow" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Emerald Stream" })).toBeInTheDocument();
  });
});
