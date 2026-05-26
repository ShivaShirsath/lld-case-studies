import React, { useState, useEffect } from "react";
import { theme } from "../styles/theme";
import { LoggerPanel, LogEntry } from "../components/LoggerPanel";
import { ATMStatus, ATMStateName, ATMTransaction } from "shared-types";
import { Landmark, ArrowDownLeft, ArrowUpRight, ShieldCheck, KeyRound, AlertTriangle } from "lucide-react";

/**
 * ATMDashboard
 * Renders the physical-like ATM console screen, keypad, cash drawer, and logs.
 */
export const ATMDashboard: React.FC = () => {
  const [status, setStatus] = useState<ATMStatus | null>(null);
  const [transactions, setTransactions] = useState<ATMTransaction[]>([]);
  const [cardNumberInput, setCardNumberInput] = useState("123456789");
  const [pinInput, setPinInput] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (message: string, type: "info" | "success" | "warning" | "error" = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [{ timestamp, type, message }, ...prev]);
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/atm/status");
      if (!res.ok) throw new Error("Failed to fetch ATM status.");
      const data = await res.json();
      setStatus(data);
    } catch (err: any) {
      addLog(err.message, "error");
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/atm/transactions");
      if (!res.ok) throw new Error("Failed to fetch ATM transactions.");
      const data = await res.json();
      setTransactions(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchTransactions();
    addLog("ATM Terminal boot successful. Ready for transactions.", "info");
  }, []);

  const handleInsertCard = async () => {
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/atm/insert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardNumber: cardNumberInput })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Card insertion failed.");

      setSuccess("Card accepted. Please enter PIN.");
      addLog(`Debit Card ${cardNumberInput} inserted. Verification pending.`, "info");
      setPinInput("");
      fetchStatus();
    } catch (err: any) {
      setError(err.message);
      addLog(`Card Insertion failed: ${err.message}`, "error");
    }
  };

  const handleEnterPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!pinInput) {
      setError("PIN is required.");
      return;
    }

    try {
      const res = await fetch("/api/atm/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinInput })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "PIN validation failed.");

      setSuccess("Authentication success. Welcome!");
      addLog(`PIN verified for Card. Session established.`, "success");
      setPinInput("");
      fetchStatus();
    } catch (err: any) {
      setError(err.message);
      addLog(`PIN entry failed: ${err.message}`, "error");
      fetchStatus(); // Refresh status to check if blocked
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!amountInput) {
      setError("Amount is required.");
      return;
    }

    try {
      const res = await fetch("/api/atm/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountInput })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Withdrawal failed.");

      setSuccess("Cash Dispensed! Take your bills.");
      addLog(`Dispensed $${amountInput} successfully.`, "success");
      setAmountInput("");
      fetchStatus();
      fetchTransactions();
    } catch (err: any) {
      setError(err.message);
      addLog(`Withdrawal failed: ${err.message}`, "error");
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!amountInput) {
      setError("Amount is required.");
      return;
    }

    try {
      const res = await fetch("/api/atm/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountInput })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Deposit failed.");

      setSuccess("Deposit accepted and credited to your account.");
      addLog(`Deposited $${amountInput} successfully. Inventory refilled.`, "success");
      setAmountInput("");
      fetchStatus();
      fetchTransactions();
    } catch (err: any) {
      setError(err.message);
      addLog(`Deposit failed: ${err.message}`, "error");
    }
  };

  const handleCheckBalance = async () => {
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/atm/balance");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to check balance.");

      setSuccess(`Your Account Balance is: $${data.balance.toFixed(2)}`);
      addLog(`Inquired balance: $${data.balance.toFixed(2)}.`, "info");
      fetchTransactions();
    } catch (err: any) {
      setError(err.message);
      addLog(`Balance Check failed: ${err.message}`, "error");
    }
  };

  const handleEject = async () => {
    setError(null);
    setSuccess(null);
    try {
      await fetch("/api/atm/eject", { method: "POST" });
      setSuccess("Card ejected. Thank you for using our ATM.");
      addLog("Card ejected. ATM session terminated.", "info");
      fetchStatus();
    } catch (err: any) {
      console.error(err);
    }
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
    console: {
      backgroundColor: "#080c14",
      border: "3px solid #1e293b",
      borderRadius: "12px",
      padding: "24px",
      minHeight: "260px",
      display: "flex",
      flexDirection: "column" as const,
      justifyContent: "space-between",
      fontFamily: "monospace",
      boxShadow: "inset 0 0 20px rgba(0, 0, 0, 0.8)",
      position: "relative" as const
    },
    consoleHeader: {
      color: theme.colors.success,
      fontSize: "14px",
      fontWeight: 700,
      borderBottom: "1px solid rgba(16, 185, 129, 0.2)",
      paddingBottom: "8px",
      display: "flex",
      justifyContent: "space-between"
    },
    consoleScreen: {
      color: theme.colors.textPrimary,
      fontSize: "13px",
      textAlign: "center" as const,
      margin: "24px 0",
      lineHeight: "1.6"
    },
    consoleFooter: {
      fontSize: "11px",
      color: theme.colors.textMuted,
      display: "flex",
      justifyContent: "space-between",
      borderTop: "1px solid rgba(16, 185, 129, 0.1)",
      paddingTop: "8px"
    },
    atmStatusGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "16px",
      marginTop: "16px"
    },
    atmStatusItem: {
      backgroundColor: theme.colors.bgCardSolid,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: "10px",
      padding: "12px"
    },
    inventoryList: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: "12px",
      color: theme.colors.textSecondary,
      marginTop: "8px"
    },
    billsBadge: {
      backgroundColor: "rgba(16, 185, 129, 0.1)",
      color: theme.colors.success,
      padding: "2px 6px",
      borderRadius: "6px",
      fontWeight: 700
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
    btnGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "12px"
    },
    txRow: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: "12px",
      color: theme.colors.textSecondary,
      borderBottom: "1px solid rgba(255,255,255,0.03)",
      padding: "8px 0"
    }
  };

  const getScreenMessage = () => {
    if (!status) return "LOADING ATM TERMINAL...";
    switch (status.currentState) {
      case ATMStateName.IDLE:
        return "WELCOME TO LLD TRUST BANK.\nPLEASE INSERT CARD TO BEGIN.";
      case ATMStateName.CARD_INSERTED:
        return `CARD ACCEPTED.\nHOLDER: ${status.cardHolderName || "CARD DETECTED"}\n\nPLEASE ENTER PIN CODE:`;
      case ATMStateName.PIN_VERIFIED:
        return `HELLO, ${status.cardHolderName || "CUSTOMER"}\n\nSELECT TRANSACTION TO PROCEED.`;
      case ATMStateName.OUT_OF_CASH:
        return "OUT OF CASH INVENTORY.\nUNDER SERVICE MAINTENANCE.";
      default:
        return "WELCOME TO LLD TRUST BANK.";
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.mainSection}>
        {/* Physical style ATM console screen */}
        <div style={styles.console}>
          <div style={styles.consoleHeader}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Landmark size={14} /> LLD TRUST BANK
            </span>
            <span style={{ color: theme.colors.textMuted }}>SYS-OK</span>
          </div>

          <div style={styles.consoleScreen}>
            {getScreenMessage().split("\n").map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>

          <div style={styles.consoleFooter}>
            <span>State: {status?.currentState}</span>
            <span>ATM Cash: ${status?.totalCash.toFixed(2)}</span>
          </div>
        </div>

        {/* ATM Vault parameters */}
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>Dispenser Cash Drawer Inventory</h2>
          <div style={styles.atmStatusGrid}>
            <div style={styles.atmStatusItem}>
              <div style={styles.label}>Vault Status</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginTop: "4px" }}>
                ${status?.totalCash.toFixed(2)}
              </div>
            </div>
            <div style={styles.atmStatusItem}>
              <div style={styles.label}>Active Account</div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginTop: "8px" }}>
                {status?.activeAccountNumber || "No active session"}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "16px" }}>
            <span style={styles.label}>Bills Inventory</span>
            <div style={styles.inventoryList}>
              <span>$100 Bills: <strong style={styles.billsBadge}>{status?.cashInventory[100]}</strong></span>
              <span>$50 Bills: <strong style={styles.billsBadge}>{status?.cashInventory[50]}</strong></span>
              <span>$20 Bills: <strong style={styles.billsBadge}>{status?.cashInventory[20]}</strong></span>
              <span>$10 Bills: <strong style={styles.billsBadge}>{status?.cashInventory[10]}</strong></span>
            </div>
          </div>
        </div>

        <LoggerPanel logs={logs} onClear={() => setLogs([])} />
      </div>

      <div style={styles.sidebar}>
        {/* State 1: Idle (Card insertion simulation) */}
        {status?.currentState === ATMStateName.IDLE && (
          <div style={styles.panel}>
            <h2 style={styles.panelTitle}>Insert Debit Card</h2>
            <div style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Debit Card Selection</label>
                <select
                  style={styles.select}
                  value={cardNumberInput}
                  onChange={(e) => setCardNumberInput(e.target.value)}
                >
                  <option value="123456789">Shiva Ram (Card: 123456789 | PIN: 1234)</option>
                  <option value="987654321">Jane Doe (Card: 987654321 | PIN: 4321)</option>
                  <option value="555555555">Invalid Card (Unrecognized by bank)</option>
                </select>
              </div>
              <button
                style={styles.btn(theme.colors.primary)}
                onClick={handleInsertCard}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.colors.primaryHover; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.colors.primary; }}
              >
                Insert Selected Card
              </button>
            </div>
          </div>
        )}

        {/* State 2: Card inserted, awaiting PIN entry */}
        {status?.currentState === ATMStateName.CARD_INSERTED && (
          <div style={styles.panel}>
            <h2 style={styles.panelTitle}>
              <KeyRound size={16} /> Enter PIN Code
            </h2>
            <form style={styles.form} onSubmit={handleEnterPin}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Keypad Input (4 Digits)</label>
                <input
                  style={styles.input}
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                />
              </div>
              <div style={styles.btnGrid}>
                <button
                  style={styles.btn(theme.colors.danger)}
                  type="button"
                  onClick={handleEject}
                >
                  Cancel/Eject
                </button>
                <button
                  style={styles.btn(theme.colors.success)}
                  type="submit"
                >
                  Submit PIN
                </button>
              </div>
            </form>
          </div>
        )}

        {/* State 3: PIN verified, transaction screen */}
        {status?.currentState === ATMStateName.PIN_VERIFIED && (
          <div style={styles.panel}>
            <h2 style={styles.panelTitle}>ATM Operations</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Balance Enquiry */}
              <button
                style={styles.btn(theme.colors.primary)}
                onClick={handleCheckBalance}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.colors.primaryHover; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.colors.primary; }}
              >
                <ShieldCheck size={14} /> Check Balance
              </button>

              {/* Cash Adjustments Form */}
              <form style={styles.form}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Transaction Amount ($)</label>
                  <input
                    style={styles.input}
                    type="number"
                    placeholder="Multiple of $10"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                  />
                </div>
                <div style={styles.btnGrid}>
                  <button
                    style={styles.btn(theme.colors.danger)}
                    type="button"
                    onClick={handleWithdraw}
                  >
                    <ArrowDownLeft size={14} /> Withdraw
                  </button>
                  <button
                    style={styles.btn(theme.colors.success)}
                    type="button"
                    onClick={handleDeposit}
                  >
                    <ArrowUpRight size={14} /> Deposit
                  </button>
                </div>
              </form>

              {/* Session Termination */}
              <button
                style={{ ...styles.btn(theme.colors.textMuted), marginTop: "16px" }}
                onClick={handleEject}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = theme.colors.textMuted; }}
              >
                Finish / Eject Card
              </button>
            </div>
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

        {/* Mini Ledger of Transactions */}
        {transactions.length > 0 && (
          <div style={styles.panel}>
            <h2 style={styles.panelTitle}>Account Transaction Log</h2>
            <div style={{ display: "flex", flexDirection: "column", maxHeight: "180px", overflowY: "auto" }}>
              {transactions.slice(0, 5).map((tx) => (
                <div key={tx.id} style={styles.txRow}>
                  <div>
                    <span style={{ fontWeight: 700, color: tx.type === "WITHDRAW" ? theme.colors.danger : theme.colors.success }}>
                      {tx.type}
                    </span>
                    <div style={{ fontSize: "10px", color: theme.colors.textMuted }}>{tx.notes}</div>
                  </div>
                  <span style={{ fontWeight: 700, color: "#fff" }}>
                    {tx.amount ? `$${tx.amount}` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
