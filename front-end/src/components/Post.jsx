import { useState } from 'react'
import { supabase } from '../supabaseClient'
import '../css/Post.css'

export default function Post() {
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Example categories — replace icons with any if you use FontAwesome or similar
  const categories = [
    { id: 'road', name: 'Road', icon: '🛣️' },
    { id: 'water', name: 'Water', icon: '💧' },
    { id: 'electricity', name: 'Electricity', icon: '💡' },
    { id: 'sanitation', name: 'Sanitation', icon: '🚮' },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !title || !description || !category) {
      setError('Please fill in all fields and select a category.')
      return
    }

    const { data, error } = await supabase
      .from('civic_issues')
      .insert([{ name, title, description, category }])

    if (error) {
      console.error('Insert error:', error)
      setError('Failed to submit issue. Please try again.')
      setSuccess(false)
    } else {
      setSuccess(true)
      setError('')
      setName('')
      setTitle('')
      setDescription('')
      setCategory('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2>Report an Issue</h2>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">✅ Issue submitted!</p>}

      <div className="form-group">
        <label>Your Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Issue Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Select Category</label>
        <div className="category-grid">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`category-card ${category === cat.id ? 'active' : ''}`}
              onClick={() => setCategory(cat.id)}
            >
              <div className="category-icon">{cat.icon}</div>
              <div className="category-name">{cat.name}</div>
            </div>
          ))}
        </div>
      </div>

      <button type="submit" className="submit-btn">
        Submit
      </button>
    </form>
  )
}
