/**
 * Theme design tokens
 * Avoids plain default colors in favor of premium gradients, neon glows, and glassmorphism.
 */
export const theme = {
  colors: {
    bgDark: "#090d16",
    bgCard: "rgba(22, 28, 45, 0.7)",
    bgCardSolid: "#161c2d",
    bgInput: "#1e2640",
    textPrimary: "#f8fafc",
    textSecondary: "#94a3b8",
    textMuted: "#64748b",
    primary: "#6366f1",      // Indigo
    primaryLight: "#818cf8",
    primaryHover: "#4f46e5",
    secondary: "#06b6d4",    // Cyan
    accent: "#ec4899",       // Pink
    success: "#10b981",      // Emerald
    warning: "#f59e0b",      // Amber
    danger: "#ef4444",       // Red
    border: "#1e293b",
    glassBg: "rgba(15, 23, 42, 0.6)",
    glassBorder: "rgba(255, 255, 255, 0.04)"
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    glowPrimary: "0 0 15px rgba(99, 102, 241, 0.3)",
    glowSuccess: "0 0 15px rgba(16, 185, 129, 0.3)",
    glowDanger: "0 0 15px rgba(239, 68, 68, 0.3)",
    glowSecondary: "0 0 15px rgba(6, 182, 212, 0.3)"
  },
  transitions: {
    fast: "all 0.15s ease",
    default: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
  }
};
