import { useState } from "react";
import { theme } from "./styles/theme";
import { Overview } from "./pages/Overview";
import { ParkingLotDashboard } from "./pages/ParkingLotDashboard";
import { ElevatorDashboard } from "./pages/ElevatorDashboard";
import { MovieBookingDashboard } from "./pages/MovieBookingDashboard";
import { ATMDashboard } from "./pages/ATMDashboard";
import { Layers, Car, Disc, Film, Landmark, Home } from "lucide-react";

/**
 * App Shell
 * Coordinates active tab layouts, branding navigation, and sticky headers.
 */
export default function App() {
  const [activeTab, setActiveTab] = useState<"overview" | "parking" | "elevator" | "movie" | "atm">("overview");

  const styles = {
    app: {
      backgroundColor: theme.colors.bgDark,
      color: theme.colors.textPrimary,
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column" as const
    },
    header: {
      backgroundColor: theme.colors.bgCardSolid,
      borderBottom: `1px solid ${theme.colors.border}`,
      position: "sticky" as const,
      top: 0,
      zIndex: 100,
      padding: "0 24px"
    },
    headerInner: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      height: "64px",
      maxWidth: "1200px",
      margin: "0 auto",
      width: "100%"
    },
    logo: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontSize: "17px",
      fontWeight: 800,
      color: "#fff",
      cursor: "pointer"
    },
    logoIcon: {
      color: theme.colors.primaryLight
    },
    nav: {
      display: "flex",
      gap: "6px"
    },
    navBtn: (isActive: boolean, tabColor: string) => ({
      backgroundColor: isActive ? `${tabColor}15` : "transparent",
      border: "none",
      color: isActive ? "#fff" : theme.colors.textSecondary,
      padding: "8px 16px",
      borderRadius: "8px",
      fontWeight: 600,
      fontSize: "13px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      transition: theme.transitions.fast,
      borderBottom: isActive ? `2px solid ${tabColor}` : "2px solid transparent"
    }),
    main: {
      flex: 1,
      maxWidth: "1200px",
      margin: "0 auto",
      width: "100%",
      padding: "32px 24px",
      boxSizing: "border-box" as const
    },
    footer: {
      borderTop: `1px solid ${theme.colors.border}`,
      padding: "24px",
      textAlign: "center" as const,
      color: theme.colors.textMuted,
      fontSize: "13px",
      backgroundColor: theme.colors.bgDark
    }
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo} onClick={() => setActiveTab("overview")}>
            <Layers style={styles.logoIcon} size={20} />
            <span>LLD Case Studies</span>
          </div>
          <nav style={styles.nav}>
            <button
              style={styles.navBtn(activeTab === "overview", theme.colors.primary)}
              onClick={() => setActiveTab("overview")}
            >
              <Home size={14} /> Overview
            </button>
            <button
              style={styles.navBtn(activeTab === "parking", theme.colors.primary)}
              onClick={() => setActiveTab("parking")}
            >
              <Car size={14} /> Parking Lot
            </button>
            <button
              style={styles.navBtn(activeTab === "elevator", theme.colors.secondary)}
              onClick={() => setActiveTab("elevator")}
            >
              <Disc size={14} /> Elevators
            </button>
            <button
              style={styles.navBtn(activeTab === "movie", theme.colors.accent)}
              onClick={() => setActiveTab("movie")}
            >
              <Film size={14} /> Movie Booking
            </button>
            <button
              style={styles.navBtn(activeTab === "atm", theme.colors.success)}
              onClick={() => setActiveTab("atm")}
            >
              <Landmark size={14} /> ATM System
            </button>
          </nav>
        </div>
      </header>

      <main style={styles.main}>
        {activeTab === "overview" && <Overview onNavigate={(tab) => setActiveTab(tab)} />}
        {activeTab === "parking" && <ParkingLotDashboard />}
        {activeTab === "elevator" && <ElevatorDashboard />}
        {activeTab === "movie" && <MovieBookingDashboard />}
        {activeTab === "atm" && <ATMDashboard />}
      </main>

      <footer style={styles.footer}>
        © {new Date().getFullYear()} LLD Case Studies Project. All rights reserved.
      </footer>
    </div>
  );
}
