// src/components/Post.jsx
import { useState } from 'react'
import { supabase } from '../supabaseClient'
import '../css/Post.css' // Assuming you have some styles for this component



export default function Post() {
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { data, error } = await supabase
      .from('civic_issues')
      .insert([{ name, title, description }])

    if (error) {
      console.error('Insert error:', error)
    } else {
      setSuccess(true)
      setName('')
      setTitle('')
      setDescription('')
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ padding: '1rem' }}>
      <h2>Report an Issue</h2>
      <input
        type="text"
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Issue Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Describe the issue"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button type="submit">Submit</button>
      {success && <p>✅ Issue submitted!</p>}
    </form>
  )
}