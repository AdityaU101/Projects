import React, { useState } from "react";
import "./App.css";

function App() {
  const [url, setUrl] = useState("");
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    if (!url.trim()) {
      setError("Please enter a valid PR URL");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pr_url: url }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const j = await res.json();
      setJobId(j.job_id);
      pollStatus(j.job_id);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const pollStatus = async (id) => {
    try {
      const r = await fetch(`http://localhost:8000/status/${id}`);
      if (!r.ok) {
        throw new Error(`Status check failed: ${r.status}`);
      }

      const d = await r.json();
      setStatus(d);

      if (d.status !== "done" && d.status !== "failed") {
        setTimeout(() => pollStatus(id), 1500);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>PR Code Review Assistant</h1>
      <p className="subtitle">Analyze pull requests with AI-powered suggestions</p>

      <div className="input-section">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && submit()}
          placeholder="https://github.com/owner/repo/pull/123"
          className="url-input"
          disabled={loading}
        />
        <button onClick={submit} disabled={loading} className="submit-btn">
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {error && <div className="error-box">{error}</div>}

      {jobId && (
        <div className="result-section">
          <h3>Job #{jobId}</h3>
          <div className="status-badge" data-status={status?.status}>
            {status?.status || "Pending"}
          </div>

          {status?.result && (
            <div className="result-box">
              <h4>Analysis Results:</h4>
              <pre>{status.result}</pre>
            </div>
          )}

          {status?.status === "failed" && (
            <div className="error-box">Analysis failed. Try another PR.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
