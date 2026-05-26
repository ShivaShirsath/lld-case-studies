import React, { useState, useEffect } from "react";
import { theme } from "../styles/theme";
import { LoggerPanel, LogEntry } from "../components/LoggerPanel";
import { VehicleType, ParkingSlotType, ParkingFloor, Ticket } from "shared-types";
import { Play, LogOut, Info, AlertTriangle } from "lucide-react";

/**
 * ParkingLotDashboard
 * Renders the interactive visualization of floors and slots.
 */
export const ParkingLotDashboard: React.FC = () => {
  const [floors, setFloors] = useState<ParkingFloor[]>([]);
  const [licensePlate, setLicensePlate] = useState("");
  const [vehicleType, setVehicleType] = useState<VehicleType>(VehicleType.CAR);
  const [slotType, setSlotType] = useState<ParkingSlotType>(ParkingSlotType.MEDIUM);
  const [exitPlate, setExitPlate] = useState("");
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (message: string, type: "info" | "success" | "warning" | "error" = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [{ timestamp, type, message }, ...prev]);
  };

  const fetchState = async () => {
    try {
      const res = await fetch("/api/parking/floors");
      if (!res.ok) throw new Error("Failed to fetch parking lot layout.");
      const data = await res.json();
      setFloors(data);
    } catch (err: any) {
      addLog(err.message, "error");
    }
  };

  useEffect(() => {
    fetchState();
    addLog("Parking Lot Simulator initialized.", "info");
  }, []);

  const handlePark = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setTicket(null);

    if (!licensePlate.trim()) {
      setError("License plate is required.");
      return;
    }

    try {
      const res = await fetch("/api/parking/park", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licensePlate, vehicleType, slotType })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to park vehicle.");

      setSuccess(`Vehicle ${licensePlate} parked successfully.`);
      addLog(`Vehicle ${licensePlate} (${vehicleType}) successfully parked in slot ${data.slotId} on Floor ${data.floorId.split("-")[1]}.`, "success");
      setLicensePlate("");
      fetchState();
    } catch (err: any) {
      setError(err.message);
      addLog(`Parking failed: ${err.message}`, "error");
    }
  };

  const handleExit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setTicket(null);

    if (!exitPlate.trim()) {
      setError("Exit license plate is required.");
      return;
    }

    try {
      const res = await fetch("/api/parking/exit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licensePlate: exitPlate })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to process exit.");

      setTicket(data);
      setSuccess(`Vehicle ${exitPlate} exited. Total Fee calculated.`);
      addLog(`Vehicle ${exitPlate} checked out from slot ${data.slotId}. Fee: $${data.fee.toFixed(2)} (Simulated stay).`, "success");
      setExitPlate("");
      fetchState();
    } catch (err: any) {
      setError(err.message);
      addLog(`Checkout failed: ${err.message}`, "error");
    }
  };

  const slotColors: Record<ParkingSlotType, string> = {
    [ParkingSlotType.SMALL]: "#eab308", // Yellow
    [ParkingSlotType.MEDIUM]: "#3b82f6", // Blue
    [ParkingSlotType.LARGE]: "#a855f7", // Purple
    [ParkingSlotType.EV]: "#10b981"    // Emerald green
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
    input: {
      backgroundColor: theme.colors.bgInput,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: "8px",
      padding: "10px 12px",
      color: "#fff",
      fontSize: "14px",
      outline: "none",
      transition: theme.transitions.fast
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
    alert: (type: "error" | "success" | "info") => {
      let bg = "rgba(239, 68, 68, 0.1)";
      let border = theme.colors.danger;
      let text = theme.colors.danger;

      if (type === "success") {
        bg = "rgba(16, 185, 129, 0.1)";
        border = theme.colors.success;
        text = theme.colors.success;
      } else if (type === "info") {
        bg = "rgba(99, 102, 241, 0.1)";
        border = theme.colors.primary;
        text = theme.colors.primaryLight;
      }

      return {
        backgroundColor: bg,
        border: `1px solid ${border}`,
        color: text,
        borderRadius: "8px",
        padding: "12px",
        fontSize: "13px",
        display: "flex",
        alignItems: "flex-start",
        gap: "8px"
      };
    },
    floorCard: {
      backgroundColor: theme.colors.bgCardSolid,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: "14px",
      padding: "18px",
      display: "flex",
      flexDirection: "column" as const,
      gap: "12px"
    },
    floorHeader: {
      fontSize: "14px",
      fontWeight: 700,
      color: theme.colors.textPrimary,
      borderBottom: `1px solid ${theme.colors.border}`,
      paddingBottom: "8px",
      display: "flex",
      justifyContent: "space-between"
    },
    slotGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
      gap: "12px"
    },
    slotBox: (slot: any) => {
      const baseBorder = `1px solid ${slotColors[slot.type as ParkingSlotType]}30`;
      const activeBorder = `2px solid ${slotColors[slot.type as ParkingSlotType]}`;
      return {
        backgroundColor: slot.isOccupied ? "rgba(30, 41, 59, 0.9)" : "rgba(22, 28, 45, 0.3)",
        border: slot.isOccupied ? activeBorder : baseBorder,
        borderRadius: "8px",
        padding: "12px",
        display: "flex",
        flexDirection: "column" as const,
        gap: "4px",
        minHeight: "85px",
        position: "relative" as const,
        boxShadow: slot.isOccupied ? `0 0 10px ${slotColors[slot.type as ParkingSlotType]}20` : "none"
      };
    },
    slotId: {
      fontSize: "10px",
      fontWeight: 600,
      color: theme.colors.textMuted
    },
    slotBadge: (type: ParkingSlotType) => ({
      alignSelf: "flex-start",
      fontSize: "9px",
      fontWeight: 700,
      backgroundColor: `${slotColors[type]}15`,
      color: slotColors[type],
      padding: "2px 6px",
      borderRadius: "10px",
      textTransform: "uppercase" as const
    }),
    occupiedText: {
      fontSize: "12px",
      fontWeight: 700,
      color: "#fff",
      marginTop: "4px"
    },
    vacantText: {
      fontSize: "11px",
      color: theme.colors.textMuted,
      fontStyle: "italic",
      marginTop: "4px"
    },
    receiptGrid: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "8px",
      fontSize: "13px",
      color: theme.colors.textSecondary,
      marginTop: "8px"
    },
    receiptRow: {
      display: "flex",
      justifyContent: "space-between"
    },
    receiptVal: {
      fontWeight: 600,
      color: theme.colors.textPrimary
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.mainSection}>
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>
            <Info size={18} color={theme.colors.primaryLight} />
            Parking Floors Grid Layout
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {floors.map((floor) => (
              <div key={floor.id} style={styles.floorCard}>
                <div style={styles.floorHeader}>
                  <span>Floor {floor.floorNumber}</span>
                  <span style={{ color: theme.colors.textSecondary, fontWeight: 400 }}>
                    Slots occupied: {floor.slots.filter(s => s.isOccupied).length} / {floor.slots.length}
                  </span>
                </div>
                <div style={styles.slotGrid}>
                  {floor.slots.map((slot) => (
                    <div key={slot.id} style={styles.slotBox(slot)}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={styles.slotId}>{slot.id.split("-").pop()}</span>
                        <span style={styles.slotBadge(slot.type as ParkingSlotType)}>
                          {slot.type}
                        </span>
                      </div>
                      {slot.isOccupied && slot.currentVehicle ? (
                        <div>
                          <div style={styles.occupiedText}>🚗 {slot.currentVehicle.licensePlate}</div>
                          <div style={{ fontSize: "9px", color: theme.colors.textSecondary }}>
                            Type: {slot.currentVehicle.type}
                          </div>
                        </div>
                      ) : (
                        <div style={styles.vacantText}>Vacant Slot</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <LoggerPanel logs={logs} onClear={() => setLogs([])} />
      </div>

      <div style={styles.sidebar}>
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>Park Vehicle</h2>
          <form style={styles.form} onSubmit={handlePark}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>License Plate</label>
              <input
                style={styles.input}
                type="text"
                placeholder="e.g. MH-12-AB-1234"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Vehicle Type</label>
              <select
                style={styles.select}
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as VehicleType)}
              >
                <option value={VehicleType.CAR}>Car</option>
                <option value={VehicleType.MOTORCYCLE}>Motorcycle</option>
                <option value={VehicleType.TRUCK}>Truck</option>
                <option value={VehicleType.EV}>EV (Electric Vehicle)</option>
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Preferred Slot size</label>
              <select
                style={styles.select}
                value={slotType}
                onChange={(e) => setSlotType(e.target.value as ParkingSlotType)}
              >
                <option value={ParkingSlotType.SMALL}>Small (Motorcycles)</option>
                <option value={ParkingSlotType.MEDIUM}>Medium (Cars)</option>
                <option value={ParkingSlotType.LARGE}>Large (Trucks)</option>
                <option value={ParkingSlotType.EV}>EV Charger Space</option>
              </select>
            </div>
            <button
              style={styles.btn(theme.colors.primary)}
              type="submit"
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.colors.primaryHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.colors.primary; }}
            >
              <Play size={14} /> Park Vehicle
            </button>
          </form>
        </div>

        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>Checkout & Invoice</h2>
          <form style={styles.form} onSubmit={handleExit}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>License Plate</label>
              <input
                style={styles.input}
                type="text"
                placeholder="e.g. MH-12-AB-1234"
                value={exitPlate}
                onChange={(e) => setExitPlate(e.target.value)}
              />
            </div>
            <button
              style={styles.btn(theme.colors.secondary)}
              type="submit"
              onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.15)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = "none"; }}
            >
              <LogOut size={14} /> Process Exit
            </button>
          </form>
        </div>

        {error && (
          <div style={styles.alert("error")}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && !ticket && (
          <div style={styles.alert("success")}>
            <span>{success}</span>
          </div>
        )}

        {ticket && (
          <div style={styles.panel}>
            <h2 style={{ ...styles.panelTitle, color: theme.colors.success }}>
              Receipt Generated
            </h2>
            <div style={styles.receiptGrid}>
              <div style={styles.receiptRow}>
                <span>Ticket ID:</span>
                <span style={styles.receiptVal}>{ticket.id.split("-")[1]}</span>
              </div>
              <div style={styles.receiptRow}>
                <span>License Plate:</span>
                <span style={styles.receiptVal}>{ticket.vehicle.licensePlate}</span>
              </div>
              <div style={styles.receiptRow}>
                <span>Vehicle Type:</span>
                <span style={styles.receiptVal}>{ticket.vehicle.type}</span>
              </div>
              <div style={styles.receiptRow}>
                <span>Slot Vacated:</span>
                <span style={styles.receiptVal}>{ticket.slotId.split("-").pop()}</span>
              </div>
              <div style={{ borderBottom: `1px solid ${theme.colors.border}`, margin: "8px 0" }}></div>
              <div style={styles.receiptRow}>
                <span style={{ fontWeight: 700, color: "#fff" }}>Total Fee Charged:</span>
                <span style={{ ...styles.receiptVal, color: theme.colors.success, fontSize: "16px" }}>
                  ${ticket.fee?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
