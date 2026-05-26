import React from "react";
import { theme } from "../styles/theme";

export interface LogEntry {
  timestamp: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
}

interface LoggerPanelProps {
  logs: LogEntry[];
  onClear: () => void;
  title?: string;
}

/**
 * LoggerPanel
 * Renders a terminal-style component displaying real-time events.
 * Implements strict type checking and custom styling hooks.
 */
export const LoggerPanel: React.FC<LoggerPanelProps> = ({
  logs,
  onClear,
  title = "Simulation Activity logs"
}) => {
  const styles = {
    container: {
      backgroundColor: theme.colors.bgCardSolid,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: "12px",
      padding: "16px",
      display: "flex",
      flexDirection: "column" as const,
      height: "300px",
      maxHeight: "300px",
      boxShadow: theme.shadows.md
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "12px",
      borderBottom: `1px solid ${theme.colors.border}`,
      paddingBottom: "8px"
    },
    title: {
      fontSize: "13px",
      fontWeight: 600,
      color: theme.colors.textPrimary,
      textTransform: "uppercase" as const,
      letterSpacing: "0.05em"
    },
    clearButton: {
      background: "none",
      border: "none",
      color: theme.colors.textMuted,
      fontSize: "11px",
      cursor: "pointer",
      padding: "2px 6px",
      borderRadius: "4px",
      transition: theme.transitions.fast
    },
    list: {
      flex: 1,
      overflowY: "auto" as const,
      fontFamily: "monospace, monospace",
      fontSize: "12px",
      display: "flex",
      flexDirection: "column" as const,
      gap: "6px",
      paddingRight: "4px"
    },
    row: {
      display: "flex",
      alignItems: "flex-start",
      gap: "8px",
      lineHeight: "1.4"
    },
    timestamp: {
      color: theme.colors.textMuted,
      flexShrink: 0
    },
    badge: (type: "info" | "success" | "warning" | "error") => {
      let color = theme.colors.primaryLight;
      if (type === "success") color = theme.colors.success;
      if (type === "warning") color = theme.colors.warning;
      if (type === "error") color = theme.colors.danger;

      return {
        color,
        fontWeight: 700,
        flexShrink: 0
      };
    },
    text: {
      color: theme.colors.textSecondary,
      wordBreak: "break-word" as const
    },
    empty: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flex: 1,
      color: theme.colors.textMuted,
      fontSize: "12px",
      fontStyle: "italic"
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>{title}</span>
        <button
          style={styles.clearButton}
          onClick={onClear}
          onMouseEnter={(e) => { e.currentTarget.style.color = theme.colors.textPrimary; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = theme.colors.textMuted; }}
        >
          Clear Logs
        </button>
      </div>

      {logs.length === 0 ? (
        <div style={styles.empty}>No logs recorded. Trigger a simulation action above.</div>
      ) : (
        <div style={styles.list}>
          {logs.map((log, i) => (
            <div key={i} style={styles.row}>
              <span style={styles.timestamp}>[{log.timestamp}]</span>
              <span style={styles.badge(log.type)}>{log.type.toUpperCase()}:</span>
              <span style={styles.text}>{log.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
