// src/components/IssueDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import CommentSection from './CommentSection'; // Aapke paas pehle se hai
// Is page ke liye alag CSS banayenge
import '../css/IssueDetailPage.css';

const IssueDetailPage = ({ session }) => {
    const { issueId } = useParams(); // URL se issue ki ID nikalna
    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIssue = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('civic_issues')
                .select('*')
                .eq('id', issueId)
                .single(); // Sirf ek issue fetch karna

            if (data) setIssue(data);
            setLoading(false);
        };
        fetchIssue();
    }, [issueId]);

    if (loading) return <p>Loading issue details...</p>;
    if (!issue) return <p>Issue not found. <Link to="/">Go Home</Link></p>;

    return (
        <div className="issue-detail-container">
            <Link to="/" className="back-link">← Back to Home</Link>
            <h1 className="detail-title">{issue.title}</h1>
            <div className="detail-meta">
                <span>By: {issue.author_name || 'Anonymous'}</span>
                <span>Status: <span className={`status-badge status-${issue.status?.toLowerCase()}`}>{issue.status}</span></span>
            </div>
            {issue.image_url && <img src={issue.image_url} alt={issue.title} className="detail-image" />}
            <p className="detail-description">{issue.description}</p>
            <hr />
            <div className="detail-comments">
                <h3>Comments</h3>
                {session ? <CommentSection issueId={issue.id} session={session} /> : <p>Please log in to view and post comments.</p>}
            </div>
        </div>
    );
};

export default IssueDetailPage;