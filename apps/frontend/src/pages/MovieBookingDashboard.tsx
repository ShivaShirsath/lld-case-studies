import React, { useState, useEffect } from "react";
import { theme } from "../styles/theme";
import { LoggerPanel, LogEntry } from "../components/LoggerPanel";
import { Show, Booking, SeatStatus } from "shared-types";
import { Armchair, CreditCard, Lock, Users, AlertTriangle } from "lucide-react";

/**
 * MovieBookingDashboard
 * Simulates concurrent bookings, seat hold locking, and payment confirmations.
 */
export const MovieBookingDashboard: React.FC = () => {
  const [currentUser, setCurrentUser] = useState("user-1");
  const [userName, setUserName] = useState("Shiva Ram");
  const [shows, setShows] = useState<Show[]>([]);
  const [selectedShowId, setSelectedShowId] = useState("");
  const [currentShow, setCurrentShow] = useState<Show | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (message: string, type: "info" | "success" | "warning" | "error" = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [{ timestamp, type, message }, ...prev]);
  };

  const handleUserChange = (val: string) => {
    setCurrentUser(val);
    const name = val === "user-1" ? "Shiva Ram" : "Alice Smith";
    setUserName(name);
    setSelectedSeats([]);
    addLog(`Switched simulator view to: ${name}.`, "info");
  };

  const loadCatalog = async () => {
    try {
      const resMovies = await fetch("/api/movie/movies");
      await resMovies.json(); // verify response

      const resShows = await fetch("/api/movie/shows");
      const dataShows: Show[] = await resShows.json();
      setShows(dataShows);

      if (dataShows.length > 0) {
        setSelectedShowId(dataShows[0].id);
      }
    } catch (err: any) {
      addLog("Failed to fetch cinema catalog.", "error");
    }
  };

  const fetchShowDetails = async () => {
    if (!selectedShowId) return;
    try {
      const res = await fetch(`/api/movie/shows/${selectedShowId}?userId=${currentUser}`);
      if (!res.ok) throw new Error("Failed to load show seats.");
      const data = await res.json();
      setCurrentShow(data);
    } catch (err: any) {
      addLog(err.message, "error");
    }
  };

  useEffect(() => {
    loadCatalog();
    addLog("Movie Booking Simulator initialized.", "info");
  }, []);

  useEffect(() => {
    fetchShowDetails();
    setActiveBooking(null);
    setSelectedSeats([]);
    setError(null);
    setSuccess(null);
  }, [selectedShowId, currentUser]);

  // Handle Seat Hold countdown timer
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      setCountdown(null);
      setActiveBooking(null);
      setError("Reservation hold expired. Seats released.");
      addLog("Seat hold expired. Seats automatically unlocked.", "warning");
      fetchShowDetails();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const toggleSeat = (seatId: string, status: SeatStatus) => {
    if (status === SeatStatus.BOOKED || status === SeatStatus.LOCKED) return;
    if (activeBooking) return; // Cannot add seats once holding

    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((id) => id !== seatId) : [...prev, seatId]
    );
  };

  const handleAcquireLock = async () => {
    setError(null);
    setSuccess(null);
    if (selectedSeats.length === 0) {
      setError("Please select at least one seat.");
      return;
    }

    try {
      const res = await fetch("/api/movie/lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser,
          showId: selectedShowId,
          seatIds: selectedSeats
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to secure seat hold.");

      setActiveBooking(data);
      setCountdown(120); // 2 minutes (120 seconds) hold
      setSuccess("Seats held successfully! Complete payment before timer expires.");
      addLog(`${userName} secured seat locks for: ${selectedSeats.join(", ")} (120s timer started).`, "success");
      fetchShowDetails();
    } catch (err: any) {
      setError(err.message);
      addLog(`Hold failed: ${err.message}`, "error");
    }
  };

  const handleConfirmPayment = async () => {
    if (!activeBooking) return;
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/movie/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: activeBooking.id,
          paymentMethod: "CREDIT_CARD"
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Payment processing failed.");

      setSuccess("Payment confirmed! Tickets issued successfully.");
      addLog(`Payment authorized for Booking ${data.id.split("-")[1]}. Status: ${data.status}. Receipt ID: ${data.paymentId}`, "success");
      setActiveBooking(null);
      setCountdown(null);
      setSelectedSeats([]);
      fetchShowDetails();
    } catch (err: any) {
      setError(err.message);
      addLog(`Checkout failed: ${err.message}`, "error");
    }
  };

  const getSeatStyles = (seatId: string, status: SeatStatus) => {
    const isSelected = selectedSeats.includes(seatId);
    let bg = "rgba(22, 28, 45, 0.5)";
    let border = `1px solid ${theme.colors.border}`;
    let cursor = "pointer";

    if (status === SeatStatus.BOOKED) {
      bg = theme.colors.danger;
      border = `1px solid ${theme.colors.danger}`;
      cursor = "not-allowed";
    } else if (status === SeatStatus.LOCKED) {
      bg = theme.colors.warning;
      border = `1px solid ${theme.colors.warning}`;
      cursor = "not-allowed";
    } else if (isSelected) {
      bg = theme.colors.primary;
      border = `1px solid ${theme.colors.primaryLight}`;
    }

    return {
      width: "36px",
      height: "36px",
      borderRadius: "6px",
      backgroundColor: bg,
      border,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      cursor,
      color: isSelected || status !== SeatStatus.AVAILABLE ? "#fff" : theme.colors.textSecondary,
      transition: theme.transitions.fast
    };
  };

  const formatTimer = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
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
    theaterScreen: {
      width: "80%",
      margin: "0 auto 32px auto",
      height: "6px",
      backgroundColor: theme.colors.border,
      borderRadius: "20px",
      boxShadow: "0 4px 20px rgba(99, 102, 241, 0.4)",
      position: "relative" as const,
      textAlign: "center" as const
    },
    screenText: {
      position: "absolute" as const,
      top: "10px",
      left: "50%",
      transform: "translateX(-50%)",
      fontSize: "10px",
      color: theme.colors.textMuted,
      textTransform: "uppercase" as const,
      letterSpacing: "0.15em"
    },
    seatLayoutGrid: {
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      gap: "12px",
      margin: "24px 0"
    },
    row: {
      display: "flex",
      gap: "12px",
      alignItems: "center"
    },
    rowLabel: {
      width: "20px",
      fontSize: "12px",
      fontWeight: 700,
      color: theme.colors.textMuted,
      textAlign: "center" as const
    },
    legend: {
      display: "flex",
      justifyContent: "center",
      gap: "20px",
      fontSize: "12px",
      color: theme.colors.textSecondary,
      flexWrap: "wrap" as const,
      marginTop: "16px",
      borderTop: `1px solid ${theme.colors.border}`,
      paddingTop: "16px"
    },
    legendItem: {
      display: "flex",
      alignItems: "center",
      gap: "6px"
    },
    legendBox: (bg: string) => ({
      width: "14px",
      height: "14px",
      borderRadius: "3px",
      backgroundColor: bg
    }),
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
    alert: (type: "error" | "success" | "info") => {
      let bg = "rgba(239, 68, 68, 0.1)";
      let border = theme.colors.danger;
      let text = theme.colors.danger;

      if (type === "success") {
        bg = "rgba(16, 185, 129, 0.1)";
        border = theme.colors.success;
        text = theme.colors.success;
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
    timerBadge: {
      backgroundColor: "rgba(245, 158, 11, 0.15)",
      border: `1px solid ${theme.colors.warning}`,
      color: theme.colors.warning,
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "13px",
      fontWeight: 700,
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      alignSelf: "center",
      margin: "8px 0"
    }
  };

  const renderSeatMap = () => {
    if (!currentShow) return null;
    const rows = ["A", "B", "C", "D", "E"];
    const cols = [1, 2, 3, 4, 5, 6, 7, 8];

    return (
      <div style={styles.seatLayoutGrid}>
        {rows.map((row) => (
          <div key={row} style={styles.row}>
            <span style={styles.rowLabel}>{row}</span>
            {cols.map((col) => {
              const seatId = `${row}${col}`;
              const cell = currentShow.seatMap[seatId];
              return (
                <div
                  key={seatId}
                  style={getSeatStyles(seatId, cell.status)}
                  onClick={() => toggleSeat(seatId, cell.status)}
                  title={`${seatId} (${cell.seat.type}) - $${cell.seat.basePrice}`}
                >
                  <Armchair size={16} />
                </div>
              );
            })}
            <span style={styles.rowLabel}>{row}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.mainSection}>
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>Cinema Hall Seat Matrix</h2>
          <div style={styles.theaterScreen}>
            <div style={styles.screenText}>Cinema Screen This Side</div>
          </div>
          {renderSeatMap()}
          <div style={styles.legend}>
            <div style={styles.legendItem}>
              <div style={styles.legendBox("rgba(22, 28, 45, 0.5)")}></div>
              <span>Available (Normal)</span>
            </div>
            <div style={styles.legendItem}>
              <div style={{ ...styles.legendBox("rgba(22, 28, 45, 0.5)"), border: `2px solid ${theme.colors.secondary}` }}></div>
              <span>Available (Premium)</span>
            </div>
            <div style={styles.legendItem}>
              <div style={{ ...styles.legendBox("rgba(22, 28, 45, 0.5)"), border: `2px solid ${theme.colors.warning}` }}></div>
              <span>Available (Gold)</span>
            </div>
            <div style={styles.legendItem}>
              <div style={styles.legendBox(theme.colors.primary)}></div>
              <span>Selected</span>
            </div>
            <div style={styles.legendItem}>
              <div style={styles.legendBox(theme.colors.warning)}></div>
              <span>Held/Locked</span>
            </div>
            <div style={styles.legendItem}>
              <div style={styles.legendBox(theme.colors.danger)}></div>
              <span>Booked</span>
            </div>
          </div>
        </div>
        <LoggerPanel logs={logs} onClear={() => setLogs([])} />
      </div>

      <div style={styles.sidebar}>
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>
            <Users size={18} color={theme.colors.primaryLight} />
            Simulator User Context
          </h2>
          <div style={styles.inputGroup}>
            <select
              style={styles.select}
              value={currentUser}
              onChange={(e) => handleUserChange(e.target.value)}
            >
              <option value="user-1">Customer A (Shiva Ram)</option>
              <option value="user-2">Customer B (Alice Smith)</option>
            </select>
          </div>
        </div>

        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>Select Show</h2>
          <div style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Movie & Showtime</label>
              <select
                style={styles.select}
                value={selectedShowId}
                onChange={(e) => setSelectedShowId(e.target.value)}
              >
                {shows.map((show) => (
                  <option key={show.id} value={show.id}>
                    {show.movie.title} - {new Date(show.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>Seat Hold Action</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ fontSize: "13px", color: theme.colors.textSecondary }}>
              Selected Seats: <strong style={{ color: "#fff" }}>{selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"}</strong>
            </div>
            <button
              style={styles.btn(theme.colors.primary)}
              onClick={handleAcquireLock}
              disabled={activeBooking !== null}
              onMouseEnter={(e) => { if (activeBooking === null) e.currentTarget.style.backgroundColor = theme.colors.primaryHover; }}
              onMouseLeave={(e) => { if (activeBooking === null) e.currentTarget.style.backgroundColor = theme.colors.primary; }}
            >
              <Lock size={14} /> Lock Seats for 120s
            </button>
          </div>
        </div>

        {countdown !== null && activeBooking && (
          <div style={{ ...styles.panel, textAlign: "center" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>Hold Expiration Countdown</h3>
            <div style={styles.timerBadge}>
              <span>⏱️</span>
              <span>{formatTimer(countdown)}</span>
            </div>
            <div style={{ fontSize: "13px", color: theme.colors.textSecondary, marginBottom: "12px" }}>
              Total Amount: <strong>${activeBooking.totalAmount.toFixed(2)}</strong>
            </div>
            <button
              style={styles.btn(theme.colors.success)}
              onClick={handleConfirmPayment}
              onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.15)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = "none"; }}
            >
              <CreditCard size={14} /> Pay & Confirm Seats
            </button>
          </div>
        )}

        {error && (
          <div style={styles.alert("error")}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={styles.alert("success")}>
            <span>{success}</span>
          </div>
        )}
      </div>
    </div>
  );
};
