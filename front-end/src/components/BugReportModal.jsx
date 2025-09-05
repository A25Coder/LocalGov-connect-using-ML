// src/components/BugReportModal.jsx
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const BugReportModal = ({ session, onClose }) => {
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('bug_reports').insert({
      description,
      user_id: session.user.id,
    });

    if (error) {
      setMessage('Error submitting report. Please try again.');
    } else {
      setMessage('✅ Thank you! Your report has been submitted.');
      setDescription('');
      setTimeout(onClose, 2000);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Report a Bug</h3>
        <p>Found something that's not working right? Let us know!</p>
        <form onSubmit={handleSubmit}>
          <textarea
            className="modal-input"
            rows="4"
            placeholder="Please describe the bug in detail..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Submit</button>
          </div>
        </form>
        {message && <p style={{ textAlign: 'center', marginTop: '1rem' }}>{message}</p>}
      </div>
    </div>
  );
};

export default BugReportModal;