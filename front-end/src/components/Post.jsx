// src/components/Post.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../css/Post.css';

const categories = [
  { name: 'Roads & Potholes', icon: '🛣️' },
  { name: 'Waste Management', icon: '🗑️' },
  { name: 'Water & Sewage', icon: '💧' },
  { name: 'Electricity & Lights', icon: '💡' },
  { name: 'Public Parks', icon: '🌳' },
  { name: 'Other', icon: '❓' }
];

export default function Post() {
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Roads & Potholes');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // ... useEffect ka code waisa hi rahega ...
  }, []);

  const handleSubmit = async (e) => {
    // ... handleSubmit ka code waisa hi rahega ...
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <h2>Report an Issue</h2>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">✅ Issue submitted successfully!</p>}
        
        <div className="form-group">
          <label htmlFor="title-input">Issue Title</label>
          <input id="title-input" type="text" placeholder="e.g., Large pothole on Main Street" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        
        <div className="form-group">
          <label>Category</label>
          <div className="category-grid">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat.name}
                className={`category-card ${category === cat.name ? 'active' : ''}`}
                onClick={() => setCategory(cat.name)}
              >
                <span className="category-icon">{cat.icon}</span>
                <span className="category-name">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description-input">Describe the Issue</label>
          <textarea id="description-input" placeholder="Provide details like location, size, etc." value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        
        <div className="form-group">
          <label htmlFor="photo-input">Add a Photo (Optional)</label>
          <input id="photo-input" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Submitting...' : 'Submit Issue'}
        </button>
      </form>
    </div>
  );
}