import React from "react";

interface State { error: Error | null }

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("App crash:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: "100dvh", backgroundColor: "#F5F3EE", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "system-ui, sans-serif" }}>
          <p style={{ fontSize: 28, marginBottom: 8 }}>😵</p>
          <p style={{ fontSize: 16, fontWeight: 600, color: "#1C1B19", marginBottom: 6 }}>Oups, une erreur est survenue</p>
          <p style={{ fontSize: 12, color: "#8B8578", textAlign: "center", marginBottom: 16, wordBreak: "break-word", maxWidth: 300 }}>
            {this.state.error.message}
          </p>
          <button onClick={() => { this.setState({ error: null }); window.location.hash = "#/home"; window.location.reload(); }}
            style={{ padding: "12px 24px", backgroundColor: "#B8973E", color: "#1C1B19", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            Recharger l'application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
