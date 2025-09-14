import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";
import "../css/GovDashboard.css";

const GovDashboard = ({ session, profile }) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      if (!session || !profile?.gov_category) return;

      const { data, error } = await supabase
        .from("civic_issues")
        .select("id, title, description, status, created_at")
        .eq("category", profile.gov_category) // ✅ filter by gov_category
        .order("created_at", { ascending: false });

      if (!error) setIssues(data);
      setLoading(false);
    };

    fetchIssues();
  }, [session, profile]);

  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from("civic_issues")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      setIssues((prev) =>
        prev.map((issue) =>
          issue.id === id ? { ...issue, status: newStatus } : issue
        )
      );
    }
  };

  if (loading) return <p style={{ textAlign: "center", padding: "2rem" }}>Loading issues...</p>;

  return (
    <div className="issue-feed-container">
      <h2>Government Dashboard ({profile?.gov_category})</h2>
      {issues.length === 0 ? (
        <p style={{ textAlign: "center", padding: "2rem" }}>No issues found</p>
      ) : (
        issues.map((issue) => (
          <div key={issue.id} className="post-card">
            <h3 className="issue-title">{issue.title}</h3>
            <p className="issue-description">{issue.description}</p>

            <p className="issue-status">
              <strong>Status:</strong>{" "}
              <span
                className={`status-text ${
                  issue.status === "Pending"
                    ? "status-pending"
                    : issue.status === "In Progress"
                    ? "status-inprogress"
                    : "status-resolved"
                }`}
              >
                {issue.status === "Pending" && "⏳ Pending"}
                {issue.status === "In Progress" && "🚧 In Progress"}
                {issue.status === "Resolved" && "✅ Resolved"}
              </span>
            </p>

            <div className="status-buttons">
              <button
                className="btn-inprogress"
                onClick={() => updateStatus(issue.id, "In Progress")}
              >
                Mark In Progress
              </button>
              <button
                className="btn-resolved"
                onClick={() => updateStatus(issue.id, "Resolved")}
              >
                Mark Resolved
              </button>
            </div>

            <Link to={`/issue/${issue.id}`} className="view-details-link">
              View Details
            </Link>
          </div>
        ))
      )}
    </div>
  );
};

export default GovDashboard;
