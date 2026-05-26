import React from "react";
import { theme } from "../styles/theme";
import { Layers, ShieldAlert, Zap, GitFork, Server, HelpCircle } from "lucide-react";

interface OverviewProps {
  onNavigate: (tab: "parking" | "elevator" | "movie" | "atm") => void;
}

/**
 * Overview Component
 * Presents LLD concepts, SOLID principles, patterns, and interactive navigators.
 */
export const Overview: React.FC<OverviewProps> = ({ onNavigate }) => {
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "32px",
      animation: "fadeIn 0.5s ease"
    },
    hero: {
      background: `linear-gradient(135deg, ${theme.colors.bgCardSolid} 0%, rgba(99, 102, 241, 0.08) 100%)`,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: "20px",
      padding: "48px 32px",
      textAlign: "center" as const,
      position: "relative" as const,
      overflow: "hidden" as const
    },
    heroTitle: {
      fontSize: "36px",
      fontWeight: 800,
      color: theme.colors.textPrimary,
      marginBottom: "12px",
      background: `linear-gradient(90deg, #fff 0%, ${theme.colors.primaryLight} 100%)`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent"
    },
    heroSubtitle: {
      fontSize: "16px",
      color: theme.colors.textSecondary,
      maxWidth: "700px",
      margin: "0 auto 24px auto",
      lineHeight: "1.6"
    },
    tagContainer: {
      display: "flex",
      justifyContent: "center",
      gap: "12px",
      flexWrap: "wrap" as const
    },
    tag: {
      backgroundColor: "rgba(99, 102, 241, 0.15)",
      border: `1px solid ${theme.colors.primary}`,
      color: theme.colors.primaryLight,
      padding: "6px 14px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: 600
    },
    sectionTitle: {
      fontSize: "20px",
      fontWeight: 700,
      color: theme.colors.textPrimary,
      display: "flex",
      alignItems: "center",
      gap: "8px"
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
      gap: "24px"
    },
    card: {
      backgroundColor: theme.colors.bgCard,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: "16px",
      padding: "24px",
      display: "flex",
      flexDirection: "column" as const,
      justifyContent: "space-between",
      transition: theme.transitions.default,
      cursor: "pointer",
      boxShadow: theme.shadows.md
    },
    cardHeader: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "16px"
    },
    cardIconWrapper: (color: string) => ({
      width: "44px",
      height: "44px",
      borderRadius: "10px",
      backgroundColor: `${color}15`,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      color,
      border: `1px solid ${color}30`
    }),
    cardTitle: {
      fontSize: "18px",
      fontWeight: 700,
      color: theme.colors.textPrimary
    },
    cardBody: {
      fontSize: "14px",
      color: theme.colors.textSecondary,
      lineHeight: "1.6",
      marginBottom: "20px"
    },
    metaList: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "8px",
      marginBottom: "24px",
      fontSize: "13px"
    },
    metaItem: {
      display: "flex",
      alignItems: "flex-start",
      gap: "6px"
    },
    metaLabel: {
      fontWeight: 600,
      color: theme.colors.textPrimary,
      flexShrink: 0
    },
    metaValue: {
      color: theme.colors.textSecondary
    },
    btn: (color: string) => ({
      backgroundColor: color,
      border: "none",
      color: "#fff",
      padding: "10px 16px",
      borderRadius: "8px",
      fontWeight: 600,
      fontSize: "13px",
      cursor: "pointer",
      textAlign: "center" as const,
      transition: theme.transitions.fast,
      boxShadow: `0 4px 10px ${color}20`
    }),
    architectureSection: {
      backgroundColor: theme.colors.bgCardSolid,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: "16px",
      padding: "24px",
      display: "flex",
      flexDirection: "column" as const,
      gap: "20px"
    },
    archGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "20px"
    },
    archCell: {
      border: `1px solid ${theme.colors.border}`,
      borderRadius: "12px",
      padding: "16px",
      display: "flex",
      flexDirection: "column" as const,
      gap: "8px"
    },
    archIcon: {
      color: theme.colors.primaryLight,
      marginBottom: "4px"
    },
    archTitle: {
      fontSize: "14px",
      fontWeight: 600,
      color: theme.colors.textPrimary
    },
    archText: {
      fontSize: "13px",
      color: theme.colors.textSecondary,
      lineHeight: "1.5"
    }
  };

  const systems = [
    {
      id: "parking" as const,
      title: "Parking Lot System",
      color: theme.colors.primary,
      desc: "Manages slot allocations across multiple floors and vehicle types (Small, Medium, Large, EV). Utilizes clean algorithm switching and ticketing.",
      patterns: "Strategy Pattern (Slot Allocator), Factory Pattern (Vehicle, Slot Creation)",
      solid: "Open-Closed Principle (swappable strategies), Dependency Inversion (repository/strategy abstractions)",
      demo: "Park motorcycles, cars, trucks, check dynamic slots, exit vehicles and see scaled fees."
    },
    {
      id: "elevator" as const,
      title: "Elevator System",
      color: theme.colors.secondary,
      desc: "Simulates multiple elevators responding to internal destination buttons and external corridor pickups. Implements automatic background movement.",
      patterns: "State Pattern (Cabin Motion States), Strategy Pattern (LOOK/SCAN Dispatcher)",
      solid: "Single Responsibility (Elevator cabin states separated from scheduler routing)",
      demo: "Trigger floor requests, view cabins animate floors, see scheduler choose optimal cabins."
    },
    {
      id: "movie" as const,
      title: "Movie Ticket Booking",
      color: theme.colors.accent,
      desc: "Handles cinema show listings, dynamic seat layouts, transactional holds, and seat locks. Prevents duplicate seat selections.",
      patterns: "State Pattern (Seat/Booking status flows), Lock Registry pattern (concurrency management)",
      solid: "Interface Segregation (Clean booking/payment segregations), Single Responsibility",
      demo: "Select seats, lock them with 2-minute timeouts, simulate payments, verify double-booking prevention."
    },
    {
      id: "atm" as const,
      title: "ATM System",
      color: theme.colors.success,
      desc: "Simulates card insertions, PIN verifications, balance checking, deposits, and cash dispensing via denomination chains.",
      patterns: "State Pattern (ATM UI screens), Chain of Responsibility (Greedy $100 -> $50 -> $20 -> $10 Dispenser)",
      solid: "Liskov Substitution (State handlers are fully interchangeable)",
      demo: "Insert cards, type PINs, deposit funds, withdraw cash, see ATM break cash into correct denominations."
    }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Low Level Design Case Studies</h1>
        <p style={styles.heroSubtitle}>
          An interview-quality, production-style project demonstrating clean architecture, solid modeling,
          concurrency control, and design patterns in TypeScript, React, and Node.js.
        </p>
        <div style={styles.tagContainer}>
          <span style={styles.tag}>SOLID Principles</span>
          <span style={styles.tag}>State Pattern</span>
          <span style={styles.tag}>Strategy Pattern</span>
          <span style={styles.tag}>Chain of Responsibility</span>
          <span style={styles.tag}>Lock Registry (Concurrency)</span>
          <span style={styles.tag}>Layered Architecture</span>
        </div>
      </div>

      <div>
        <h2 style={styles.sectionTitle}>
          <Zap size={20} color={theme.colors.primaryLight} />
          Select an LLD Module Simulation
        </h2>
        <div style={{ ...styles.grid, marginTop: "16px" }}>
          {systems.map((sys) => (
            <div
              key={sys.id}
              style={styles.card}
              onClick={() => onNavigate(sys.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = sys.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = theme.colors.border;
              }}
            >
              <div>
                <div style={styles.cardHeader}>
                  <div style={styles.cardIconWrapper(sys.color)}>
                    <GitFork size={20} />
                  </div>
                  <h3 style={styles.cardTitle}>{sys.title}</h3>
                </div>
                <p style={styles.cardBody}>{sys.desc}</p>
                <div style={styles.metaList}>
                  <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>Design Patterns:</span>
                    <span style={styles.metaValue}>{sys.patterns}</span>
                  </div>
                  <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>SOLID Concepts:</span>
                    <span style={styles.metaValue}>{sys.solid}</span>
                  </div>
                  <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>Simulation:</span>
                    <span style={styles.metaValue}>{sys.demo}</span>
                  </div>
                </div>
              </div>
              <button
                style={styles.btn(sys.color)}
                onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.15)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.filter = "none"; }}
              >
                Launch Simulator
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.architectureSection}>
        <h2 style={styles.sectionTitle}>
          <Layers size={20} color={theme.colors.primaryLight} />
          Layered Architecture & SOLID Highlights
        </h2>
        <div style={styles.archGrid}>
          <div style={styles.archCell}>
            <Server size={24} style={styles.archIcon} />
            <h4 style={styles.archTitle}>Clean Layering</h4>
            <p style={styles.archText}>
              Decoupled Controller → Service → Repository flows. Data interfaces reside in a shared types package
              preventing dependency leaks.
            </p>
          </div>
          <div style={styles.archCell}>
            <GitFork size={24} style={styles.archIcon} />
            <h4 style={styles.archTitle}>Composition Over Inheritance</h4>
            <p style={styles.archText}>
              We avoid deep inheritance trees. Pricing strategies and schedulers are injected, keeping entity logic lean
              and testable.
            </p>
          </div>
          <div style={styles.archCell}>
            <ShieldAlert size={24} style={styles.archIcon} />
            <h4 style={styles.archTitle}>Custom Exceptions</h4>
            <p style={styles.archText}>
              Custom domain exceptions map directly to HTTP statuses (400, 404, 409) caught by a global Express middleware
              layer.
            </p>
          </div>
          <div style={styles.archCell}>
            <HelpCircle size={24} style={styles.archIcon} />
            <h4 style={styles.archTitle}>Mock Database Repos</h4>
            <p style={styles.archText}>
              In-memory repositories simulate db transactions, guaranteeing clean state mutation flows while staying completely swappable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
