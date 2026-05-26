import React, { useState, useEffect, useRef } from "react";
import { theme } from "../styles/theme";
import { LoggerPanel, LogEntry } from "../components/LoggerPanel";
import { ElevatorSystemStatus, ElevatorDirection, ElevatorState } from "shared-types";
import { ArrowUp, ArrowDown, Disc, CircleDot, Play } from "lucide-react";

/**
 * ElevatorDashboard
 * Interactive simulator for 3 Look-scheduled elevator cabins.
 */
export const ElevatorDashboard: React.FC = () => {
  const [status, setStatus] = useState<ElevatorSystemStatus | null>(null);
  const [selectedFloor, setSelectedFloor] = useState(0);
  const [direction, setDirection] = useState<ElevatorDirection>(ElevatorDirection.UP);
  const [selectedElevator, setSelectedElevator] = useState("elevator-1");
  const [cabinFloor, setCabinFloor] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const prevStates = useRef<Record<string, { floor: number; state: ElevatorState }>>({});

  const addLog = (message: string, type: "info" | "success" | "warning" | "error" = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [{ timestamp, type, message }, ...prev]);
  };

  const fetchStatus = async (initial = false) => {
    try {
      const res = await fetch("/api/elevator/status");
      if (!res.ok) throw new Error("Failed to fetch elevator status.");
      const data: ElevatorSystemStatus = await res.json();
      setStatus(data);

      if (initial) {
        addLog("Elevator Controller online. Monitoring active shafts.", "info");
      }

      // Check for state changes to log them
      data.elevators.forEach((el) => {
        const prev = prevStates.current[el.id];
        if (prev) {
          if (prev.floor !== el.currentFloor) {
            addLog(`${el.id} moved to floor ${el.currentFloor}.`, "info");
          }
          if (prev.state !== el.state) {
            if (el.state === ElevatorState.DOOR_OPEN) {
              addLog(`${el.id} opened doors at floor ${el.currentFloor}.`, "success");
            } else if (el.state === ElevatorState.DOOR_CLOSING) {
              addLog(`${el.id} is closing doors.`, "info");
            } else if (el.state === ElevatorState.MOVING) {
              addLog(`${el.id} is moving ${el.direction}.`, "info");
            } else if (el.state === ElevatorState.IDLE) {
              addLog(`${el.id} is now IDLE.`, "info");
            }
          }
        }
        prevStates.current[el.id] = { floor: el.currentFloor, state: el.state };
      });
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStatus(true);
    // Poll the backend status every 1 second to update the visualization
    const interval = setInterval(() => {
      fetchStatus();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleExternalCall = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/elevator/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          floor: selectedFloor,
          isInternal: false,
          direction
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Request failed.");

      addLog(`Corridor call triggered: Floor ${selectedFloor} going ${direction}. Assisting cabin dispatched.`, "info");
      fetchStatus();
    } catch (err: any) {
      addLog(`Request failed: ${err.message}`, "error");
    }
  };

  const handleInternalCall = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/elevator/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          floor: cabinFloor,
          isInternal: true,
          elevatorId: selectedElevator
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cabin call failed.");

      addLog(`Cabin button pressed inside ${selectedElevator} for Floor ${cabinFloor}.`, "info");
      fetchStatus();
    } catch (err: any) {
      addLog(`Request failed: ${err.message}`, "error");
    }
  };

  const floors = Array.from({ length: 11 }, (_, i) => 10 - i); // Floors 10 down to 0

  const getCabinStyles = (currentFloor: number, elFloor: number, state: ElevatorState) => {
    const isHere = currentFloor === elFloor;
    let bgColor = "transparent";
    let border = "none";
    let glow = "none";

    if (isHere) {
      if (state === ElevatorState.DOOR_OPEN) {
        bgColor = "rgba(16, 185, 129, 0.25)";
        border = `2px solid ${theme.colors.success}`;
        glow = theme.shadows.glowSuccess;
      } else if (state === ElevatorState.DOOR_CLOSING) {
        bgColor = "rgba(245, 158, 11, 0.25)";
        border = `2px solid ${theme.colors.warning}`;
        glow = theme.shadows.glowSuccess;
      } else {
        bgColor = "rgba(99, 102, 241, 0.25)";
        border = `2px solid ${theme.colors.primary}`;
        glow = theme.shadows.glowPrimary;
      }
    }

    return {
      flex: 1,
      height: "44px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: bgColor,
      border,
      borderRadius: "6px",
      boxShadow: glow,
      transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)"
    };
  };

  const styles = {
    container: {
      display: "grid",
      gridTemplateColumns: "1fr 340px",
      gap: "24px",
      animation: "fadeIn 0.4s ease"
    },
    mainSection: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "24px"
    },
    sidebar: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "24px"
    },
    panel: {
      backgroundColor: theme.colors.bgCard,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: "16px",
      padding: "20px",
      boxShadow: theme.shadows.md
    },
    panelTitle: {
      fontSize: "16px",
      fontWeight: 700,
      color: theme.colors.textPrimary,
      marginBottom: "16px",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    },
    form: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "12px"
    },
    inputGroup: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "6px"
    },
    label: {
      fontSize: "12px",
      fontWeight: 600,
      color: theme.colors.textSecondary
    },
    select: {
      backgroundColor: theme.colors.bgInput,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: "8px",
      padding: "10px 12px",
      color: "#fff",
      fontSize: "14px",
      outline: "none",
      cursor: "pointer"
    },
    btn: (color: string) => ({
      backgroundColor: color,
      border: "none",
      color: "#fff",
      padding: "11px",
      borderRadius: "8px",
      fontWeight: 600,
      fontSize: "14px",
      cursor: "pointer",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "6px",
      marginTop: "8px",
      transition: theme.transitions.fast
    }),
    visualization: {
      display: "flex",
      gap: "16px",
      minHeight: "550px"
    },
    floorLabels: {
      display: "flex",
      flexDirection: "column" as const,
      justifyContent: "space-between",
      width: "50px",
      padding: "4px 0",
      fontSize: "12px",
      fontWeight: 700,
      color: theme.colors.textSecondary,
      fontFamily: "monospace"
    },
    shaftGrid: {
      flex: 1,
      display: "flex",
      gap: "16px"
    },
    shaft: {
      flex: 1,
      backgroundColor: theme.colors.bgCardSolid,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: "10px",
      padding: "4px",
      display: "flex",
      flexDirection: "column" as const,
      justifyContent: "space-between"
    },
    shaftHeader: {
      textAlign: "center" as const,
      fontSize: "13px",
      fontWeight: 700,
      color: theme.colors.textPrimary,
      padding: "6px 0",
      borderBottom: `1px solid ${theme.colors.border}`,
      display: "flex",
      flexDirection: "column" as const,
      gap: "4px"
    },
    shaftBody: {
      flex: 1,
      display: "flex",
      flexDirection: "column" as const,
      justifyContent: "space-between",
      padding: "8px 0",
      gap: "4px"
    },
    cell: {
      height: "44px",
      borderBottom: "1px dashed rgba(255, 255, 255, 0.03)",
      display: "flex",
      alignItems: "center",
      padding: "0 4px"
    },
    cabinText: {
      fontSize: "11px",
      fontWeight: 800,
      display: "flex",
      alignItems: "center",
      gap: "2px"
    },
    requestBadge: {
      backgroundColor: "rgba(6, 182, 212, 0.15)",
      border: `1px solid ${theme.colors.secondary}`,
      color: theme.colors.secondary,
      padding: "2px 8px",
      borderRadius: "10px",
      fontSize: "11px",
      display: "inline-flex",
      alignItems: "center",
      gap: "4px"
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.mainSection}>
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>Elevator Shafts & Movement Monitor</h2>
          <div style={styles.visualization}>
            {/* Floor number sidebar labels */}
            <div style={styles.floorLabels}>
              {floors.map((f) => (
                <div key={f} style={{ height: "44px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  F{f}
                </div>
              ))}
            </div>

            <div style={styles.shaftGrid}>
              {status?.elevators.map((el) => (
                <div key={el.id} style={styles.shaft}>
                  <div style={styles.shaftHeader}>
                    <span>Cabin {el.id.split("-")[1]}</span>
                    <span style={{ fontSize: "10px", fontWeight: 400, color: theme.colors.textSecondary }}>
                      {el.state === ElevatorState.IDLE
                        ? "IDLE"
                        : `${el.state} ${el.direction !== ElevatorDirection.IDLE ? `(${el.direction})` : ""}`}
                    </span>
                  </div>
                  <div style={styles.shaftBody}>
                    {floors.map((floor) => {
                      const isHere = el.currentFloor === floor;
                      return (
                        <div key={floor} style={styles.cell}>
                          <div style={getCabinStyles(floor, el.currentFloor, el.state)}>
                            {isHere && (
                              <span
                                style={{
                                  ...styles.cabinText,
                                  color:
                                    el.state === ElevatorState.DOOR_OPEN
                                      ? theme.colors.success
                                      : el.state === ElevatorState.DOOR_CLOSING
                                      ? theme.colors.warning
                                      : theme.colors.primaryLight
                                }}
                              >
                                {el.state === ElevatorState.DOOR_OPEN && "🚪 OPEN"}
                                {el.state === ElevatorState.DOOR_CLOSING && "🚪 WAIT"}
                                {el.state === ElevatorState.MOVING && (
                                  <>
                                    {el.direction === ElevatorDirection.UP ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                                    MOVING
                                  </>
                                )}
                                {el.state === ElevatorState.STOPPED && "STOPPED"}
                                {el.state === ElevatorState.IDLE && "IDLE"}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div
                    style={{
                      borderTop: `1px solid ${theme.colors.border}`,
                      padding: "8px 0",
                      fontSize: "10px",
                      color: theme.colors.textSecondary,
                      textAlign: "center"
                    }}
                  >
                    Queue: {el.targetFloors.length > 0 ? el.targetFloors.join(", ") : "Empty"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <LoggerPanel logs={logs} onClear={() => setLogs([])} />
      </div>

      <div style={styles.sidebar}>
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>Corridor Call (External)</h2>
          <form style={styles.form} onSubmit={handleExternalCall}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Calling Floor</label>
              <select
                style={styles.select}
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(parseInt(e.target.value, 10))}
              >
                {Array.from({ length: 11 }, (_, i) => (
                  <option key={i} value={i}>
                    Floor {i}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Direction</label>
              <select
                style={styles.select}
                value={direction}
                onChange={(e) => setDirection(e.target.value as ElevatorDirection)}
              >
                <option value={ElevatorDirection.UP}>UP</option>
                <option value={ElevatorDirection.DOWN}>DOWN</option>
              </select>
            </div>
            <button
              style={styles.btn(theme.colors.primary)}
              type="submit"
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.colors.primaryHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.colors.primary; }}
            >
              <Play size={14} /> Request Cabin
            </button>
          </form>
        </div>

        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>Inside Cabin (Internal)</h2>
          <form style={styles.form} onSubmit={handleInternalCall}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Select Elevator</label>
              <select
                style={styles.select}
                value={selectedElevator}
                onChange={(e) => setSelectedElevator(e.target.value)}
              >
                <option value="elevator-1">Cabin 1</option>
                <option value="elevator-2">Cabin 2</option>
                <option value="elevator-3">Cabin 3</option>
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Destination Floor</label>
              <select
                style={styles.select}
                value={cabinFloor}
                onChange={(e) => setCabinFloor(parseInt(e.target.value, 10))}
              >
                {Array.from({ length: 11 }, (_, i) => (
                  <option key={i} value={i}>
                    Floor {i}
                  </option>
                ))}
              </select>
            </div>
            <button
              style={styles.btn(theme.colors.secondary)}
              type="submit"
              onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.15)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = "none"; }}
            >
              <CircleDot size={14} /> Press Floor Button
            </button>
          </form>
        </div>

        {status && status.pendingExternalRequests.length > 0 && (
          <div style={styles.panel}>
            <h2 style={styles.panelTitle}>Pending Dispatch Queue</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {status.pendingExternalRequests.map((req) => (
                <div key={req.id} style={styles.requestBadge}>
                  <Disc size={12} />
                  <span>Floor {req.floor} ({req.direction})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
