import { useState } from "react";
import {
  Video,
  Settings,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Layers,
  Smartphone,
  Globe,
  Info,
  PhoneCall,
  PhoneOff
} from "lucide-react";
import DailyCall from "./components/DailyCall";
import "./App.css";

export default function App() {
  const [inCall, setInCall] = useState(false);
  const [roomType, setRoomType] = useState("demo"); // "demo" or "custom"
  const [customUrl, setCustomUrl] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const demoUrl = "https://demo.daily.co/hello";
  const activeUrl = roomType === "demo" ? demoUrl : customUrl;

  const startCall = (e) => {
    e.preventDefault();
    if (roomType === "custom" && !customUrl.trim()) {
      setErrorMsg("Please enter a valid Custom Room URL.");
      return;
    }
    setErrorMsg("");
    setLoading(true);
    setInCall(true);
  };

  const leaveCall = () => {
    setInCall(false);
    setLoading(false);
  };

  const handleJoined = () => {
    setLoading(false);
  };

  const handleCallError = (err) => {
    console.error("Daily Call Error:", err);
    setErrorMsg(`Call error: ${err?.errorMsg || "Unknown error occurred"}`);
    setInCall(false);
    setLoading(false);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="brand-section">
          <Video className="logo-icon" size={32} />
          <span className="brand-name">WinSpeak Call Hub</span>
        </div>
        <div className="status-badge">
          <div className="status-indicator" />
          <span>Daily prebuilt active</span>
        </div>
      </header>

      {/* Main Grid */}
      <main className="dashboard-grid">
        {/* Controls Column */}
        <div className="sidebar-panel">
          {/* Join Call Settings */}
          <div className="card">
            <div className="card-title">
              <Settings size={20} className="logo-icon" />
              <span>Call Settings</span>
            </div>
            <form onSubmit={startCall}>
              <div className="form-group">
                <span className="form-label">Select Room Mode</span>
                <div className="radio-group">
                  <div
                    className={`radio-card ${roomType === "demo" ? "active" : ""}`}
                    onClick={() => {
                      if (!inCall) setRoomType("demo");
                    }}
                  >
                    <input
                      type="radio"
                      name="roomType"
                      checked={roomType === "demo"}
                      readOnly
                    />
                    <span>Demo Room</span>
                  </div>
                  <div
                    className={`radio-card ${roomType === "custom" ? "active" : ""}`}
                    onClick={() => {
                      if (!inCall) setRoomType("custom");
                    }}
                  >
                    <input
                      type="radio"
                      name="roomType"
                      checked={roomType === "custom"}
                      readOnly
                    />
                    <span>Custom Room</span>
                  </div>
                </div>
              </div>

              {roomType === "custom" && (
                <div className="form-group">
                  <label className="form-label" htmlFor="custom-url">Room URL</label>
                  <div className="input-wrapper">
                    <Globe className="input-icon" size={16} />
                    <input
                      id="custom-url"
                      type="url"
                      className="form-input"
                      placeholder="https://your-subdomain.daily.co/room"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      disabled={inCall}
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="join-token">
                  Join Token <span style={{ opacity: 0.5 }}>(Optional)</span>
                </label>
                <div className="input-wrapper">
                  <ShieldCheck className="input-icon" size={16} />
                  <input
                    id="join-token"
                    type="password"
                    className="form-input"
                    placeholder="Enter room join token..."
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    disabled={inCall}
                  />
                </div>
              </div>

              {errorMsg && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "var(--danger)",
                    fontSize: "0.85rem",
                    marginBottom: "1rem",
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    padding: "0.75rem",
                    borderRadius: "10px"
                  }}
                >
                  <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {inCall ? (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={leaveCall}
                >
                  <PhoneOff size={18} />
                  <span>Leave Video Call</span>
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  <PhoneCall size={18} />
                  <span>{loading ? "Connecting..." : "Start Video Call"}</span>
                </button>
              )}
            </form>
          </div>

          {/* Setup Architecture Panel */}
          <div className="card">
            <div className="card-title">
              <Layers size={20} style={{ color: "var(--secondary)" }} />
              <span>WinSpeak Architecture</span>
            </div>
            <div className="architecture-list">
              <div className="arch-item">
                <Globe className="arch-icon" size={18} />
                <div>
                  <div className="arch-title">Web Channel</div>
                  <div className="arch-desc">
                    Uses <code>@daily-co/daily-js</code> directly embedded in a standard React iframe frame.
                  </div>
                </div>
              </div>
              <div className="arch-item">
                <Smartphone className="arch-icon" size={18} />
                <div>
                  <div className="arch-title">Mobile Channel</div>
                  <div className="arch-desc">
                    React Native WebView loads the Prebuilt room directly, allowing identical experience on iOS/Android.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Test Guidelines */}
          <div className="card">
            <div className="card-title">
              <Info size={20} style={{ color: "var(--primary)" }} />
              <span>Permission Tips</span>
            </div>
            <ul className="tips-list">
              <li>WebRTC demands HTTPS or localhost to initialize camera and microphone resources safely.</li>
              <li>Always check and click "Allow camera and microphone access" in the iframe prompt.</li>
              <li>Testing doesn't require backend tokens when using demo rooms.</li>
            </ul>
          </div>
        </div>

        {/* Call Content Column */}
        <div className="call-container">
          <div className="call-wrapper-card">
            {inCall ? (
              <DailyCall
                url={activeUrl}
                token={token}
                onLeave={leaveCall}
                onJoined={handleJoined}
                onError={handleCallError}
              />
            ) : (
              <div className="placeholder-view">
                <div className="placeholder-icon-wrapper">
                  <Video size={40} />
                </div>
                <h2 className="placeholder-title">Ready for connection</h2>
                <p className="placeholder-desc">
                  Select a room mode on the left panel and click <strong>Start Video Call</strong> to test the video call iframe wrapper.
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 1rem",
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "10px",
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)"
                  }}
                >
                  <CheckCircle size={14} style={{ color: "var(--success)" }} />
                  <span>Targeting: <code style={{ fontSize: "12px", background: "none", padding: 0 }}>{activeUrl}</code></span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>WinSpeak Call Center — Daily.co Integration Demo Project</p>
      </footer>
    </div>
  );
}
