// src/components/Post.jsx
import { useState } from "react";
import LocationPicker from "./LocationPicker";
import { supabase } from "../supabaseClient";
import "../css/Post.css";

// Helper function to map severity to a user-friendly label and CSS class
const getSeverityInfo = (severity) => {
  switch (severity) {
    case 'high':
      return { label: 'Critical', className: 'severity-high' };
    case 'medium':
      return { label: 'Needs Attention', className: 'severity-medium' };
    default:
      return { label: 'Minor', className: 'severity-low' };
  }
};

// Categories including Nature and Other
const categories = [
  { id: "road", name: "Roads & Potholes", icon: "🛣️" },
  { id: "water", name: "Water", icon: "💧" },
  { id: "electricity", name: "Electricity", icon: "💡" },
  { id: "sanitation", name: "Sanitation", icon: "🚮" },
  { id: "nature", name: "Nature", icon: "🌳" },
  { id: "other", name: "Other", icon: "📝" },
];

export default function Post({ session }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("road");
  const [imageFile, setImageFile] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [lastSubmittedPost, setLastSubmittedPost] = useState(null);

  const API_URL = "http://127.0.0.1:8000"; // FastAPI backend

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!session?.user) {
      setError("⚠️ You must be logged in to post an issue.");
      return;
    }
    if (!title || !description || !category || !location) {
      setError("⚠️ Please fill all required fields and select a location.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    setLastSubmittedPost(null);

    try {
      const user = session.user;

      // Get author's full name from Supabase profiles table
      let authorName = user.email; // fallback
      try {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        if (!profileError && profile?.full_name) {
          authorName = profile.full_name;
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }

      let imageUrl = null;
      if (imageFile) {
        const fileName = `public/${Date.now()}_${imageFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("images")
          .getPublicUrl(fileName);

        imageUrl = publicUrlData.publicUrl;
      }

      // Predict text severity
      const textRes = await fetch(`${API_URL}/predict-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `${title} ${description}` }),
      });

      if (!textRes.ok) throw new Error("Text classification failed");
      const textData = await textRes.json();

      let imageData = null;
      if (imageUrl) {
        const imgRes = await fetch(`${API_URL}/predict-image`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image_url: imageUrl }),
        });

        if (imgRes.ok) {
          imageData = await imgRes.json();
        }
      }

      const severity =
        textData.result?.severity?.toLowerCase() ||
        imageData?.result?.severity?.toLowerCase() ||
        "low";

      // Insert into Supabase
      const { error: insertError } = await supabase
        .from("civic_issues")
        .insert([
          {
            title,
            description,
            category,
            severity,
            status: 'Pending',
            image_url: imageUrl,
            latitude: location.lat,
            longitude: location.lng,
            user_id: user.id,
            author_name: authorName,
          },
        ]);

      if (insertError) throw insertError;

      // Set last submitted post for preview
      setLastSubmittedPost({
        title,
        author_name: authorName,
        image_url: imageUrl,
        severity,
      });

      setSuccess(true);

      // Reset form
      setTitle("");
      setDescription("");
      setImageFile(null);
      setLocation(null);
      setCategory("road");
      if (document.getElementById("photo-input")) {
        document.getElementById("photo-input").value = "";
      }
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.message || "❌ An error occurred during submission.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (setter) => (e) => {
    if (success) setSuccess(false);
    if (lastSubmittedPost) setLastSubmittedPost(null);
    setter(e.target.value);
  };

  const handleCategoryChange = (catId) => {
    if (success) setSuccess(false);
    if (lastSubmittedPost) setLastSubmittedPost(null);
    setCategory(catId);
  };

  return (
    <div className="form-container">
      {success && lastSubmittedPost ? (
        <div className="submitted-post-preview">
          <h3>✅ Issue Submitted Successfully!</h3>
          <p>Your post is now live in the main feed.</p>
          <div className="post-card-preview">
            {/* Severity badge on top */}
            <div
              className={`severity-badge-top ${getSeverityInfo(lastSubmittedPost.severity).className}`}
            >
              {getSeverityInfo(lastSubmittedPost.severity).label}
            </div>

            {lastSubmittedPost.image_url && (
              <img
                src={lastSubmittedPost.image_url}
                alt={lastSubmittedPost.title}
                className="post-image-preview"
              />
            )}
            <div className="post-content-preview">
              <div className="post-header-preview">
                <h4>{lastSubmittedPost.title}</h4>
              </div>
              <p className="post-author-preview">By: {lastSubmittedPost.author_name}</p>
              <p className="post-timestamp-preview">Just now</p>
            </div>
          </div>
          <button onClick={() => setSuccess(false)} className="post-another-btn">
            Report Another Issue
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <h2>Report an Issue</h2>
          {error && <p className="error-message">{error}</p>}

          <div className="form-group">
            <label htmlFor="title-input">Issue Title</label>
            <input
              id="title-input"
              type="text"
              placeholder="e.g., Large pothole on Main Street"
              value={title}
              onChange={handleFormChange(setTitle)}
              required
            />
          </div>

          <div className="form-group">
            <label>Select Category</label>
            <div className="category-grid">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  className={`category-card ${category === cat.id ? "active" : ""}`}
                  onClick={() => handleCategoryChange(cat.id)}
                >
                  <span className="category-icon">{cat.icon}</span>
                  <span className="category-name">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <LocationPicker onPositionChange={(pos) => setLocation(pos)} />
            {location && (
              <p className="location-info">
                📍 Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description-input">Describe the Issue</label>
            <textarea
              id="description-input"
              placeholder="Provide more details here..."
              value={description}
              onChange={handleFormChange(setDescription)}
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
            {loading ? "Submitting..." : "Submit Issue"}
          </button>
        </form>
      )}
    </div>
  );
}
