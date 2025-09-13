import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";
import "../css/IssueFeed.css";

const GovDashboard = ({ session, profile }) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      if (!session || !profile?.gov_category) return;

      const { data, error } = await supabase
        .from("civic_issues")
        .select("id, title, description, status, created_at")
        .eq("category", profile.gov_category)   // ✅ filter by gov_category
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

  if (loading) return <p>Loading issues...</p>;

  return (
    <div className="issue-feed-container">
      <h2>Government Dashboard ({profile?.gov_category})</h2>
      {issues.length === 0 && <p>No issues found</p>}

      {issues.map((issue) => (
        <div key={issue.id} className="post-card">
          <h3>{issue.title}</h3>
          <p>{issue.description}</p>
          <p><strong>Status:</strong> {issue.status}</p>
          <div className="status-buttons">
            <button onClick={() => updateStatus(issue.id, "In Progress")}>In Progress</button>
            <button onClick={() => updateStatus(issue.id, "Resolved")}>Resolved</button>
          </div>
          <Link to={`/issue/${issue.id}`}>View Details</Link>
        </div>
      ))}
    </div>
  );
};

export default GovDashboard;
