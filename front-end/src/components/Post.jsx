// src/components/Post.jsx

import { useState } from 'react';
import LocationPicker from './LocationPicker';
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

// ✅ session ko prop ke roop mein accept karna
export default function Post({ session }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Roads & Potholes');
  const [imageFile, setImageFile] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Login check
    if (!session?.user) {
      setError('You must be logged in to post an issue.');
      return;
    }

    if (!title || !description || !category || !location) {
      setError('Please fill all required fields and select a location.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const user = session.user;

      // ✅ Profile fetch
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (profileError) throw new Error('Could not fetch user profile.');

      const authorName = profileData?.full_name || 'Anonymous';

      // ✅ Agar image upload hai
      let imageUrl = null;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}_${Date.now()}.${fileExt}`;
        const imagePath = `public/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(imagePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(imagePath);

        imageUrl = urlData.publicUrl;
      }

      // ✅ Insert into DB
      const { error: insertError } = await supabase.from('civic_issues').insert({
        user_id: user.id,
        author_name: authorName,
        title,
        description,
        category,
        image_url: imageUrl,
        latitude: location.lat,
        longitude: location.lng,
        status: 'Pending'
      });

      if (insertError) throw insertError;

      // ✅ Reset form
      setSuccess(true);
      setTitle('');
      setDescription('');
      setImageFile(null);
      setLocation(null);
      if (document.getElementById('photo-input')) {
        document.getElementById('photo-input').value = '';
      }

    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message || 'An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} noValidate>
        <h2>Report an Issue</h2>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">✅ Issue submitted successfully!</p>}

        <div className="form-group">
          <label htmlFor="title-input">Issue Title</label>
          <input
            id="title-input"
            type="text"
            placeholder="e.g., Large pothole on Main Street"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
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

        {/* === Location Picker === */}
        <div className="form-group">
          <LocationPicker onPositionChange={(pos) => setLocation(pos)} />
          {location && (
            <p
              style={{
                fontSize: '0.9rem',
                color: 'green',
                textAlign: 'center',
                marginTop: '5px'
              }}
            >
              📍 Location Selected: Lat: {location.lat.toFixed(4)}, Lng:{' '}
              {location.lng.toFixed(4)}
            </p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="description-input">Describe the Issue</label>
          <textarea
            id="description-input"
            placeholder="Provide more details here..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="photo-input">Add a Photo (Optional)</label>
          <input
            id="photo-input"
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Submitting...' : 'Submit Issue'}
        </button>
      </form>
    </div>
  );
}
