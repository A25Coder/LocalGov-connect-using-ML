import { useState } from "react";
import { supabase } from "../supabaseClient";

const API_URL = "http://127.0.0.1:8000"; // FastAPI backend

export default function Post() {
  const [textInput, setTextInput] = useState("");
  const [imageInput, setImageInput] = useState(null);
  const [textResult, setTextResult] = useState(null);
  const [imageResult, setImageResult] = useState(null);

  // ---------- TEXT PREDICTION ----------
  const handleTextSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/predict-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textInput }),
      });

      if (!res.ok) throw new Error("Text request failed");
      const data = await res.json();
      setTextResult(data.result);

      // Insert into Supabase
      const severity = data.result?.severity?.toLowerCase();
      const table = severity === "high" ? "level3" : "level2";

      const { error } = await supabase.from(table).insert([
        {
          title: "Text Issue",
          description: textInput,
          severity: severity,
        },
      ]);

      if (error) console.error("Supabase insert error:", error.message);
      else console.log(`✅ Inserted into ${table} successfully!`);
    } catch (err) {
      console.error(err);
      setTextResult({ severity: "error", message: err.message });
    }
  };

  // ---------- IMAGE PREDICTION ----------
  const handleImageSubmit = async (e) => {
    e.preventDefault();
    if (!imageInput) return;

    try {
      // 1️⃣ Upload to Supabase storage
      const fileName = `public/${Date.now()}_${imageInput.name}`;
      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(fileName, imageInput);

      if (uploadError) {
        console.error("Supabase upload error:", uploadError.message);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("images")
        .getPublicUrl(fileName);

      const imageUrl = publicUrlData.publicUrl;
      console.log("✅ Uploaded image:", imageUrl);

      // 2️⃣ Send URL to FastAPI
      const res = await fetch(`${API_URL}/predict-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: imageUrl }),
      });

      if (!res.ok) throw new Error("Image request failed");
      const data = await res.json();
      setImageResult(data.result);

      // 3️⃣ Save ML result in Supabase
      const severity = data.result?.severity?.toLowerCase();
      const table = severity === "high" ? "level3" : "level2";

      const { error } = await supabase.from(table).insert([
        {
          title: "Image Issue",
          description: imageUrl,
          severity: severity,
        },
      ]);

      if (error) console.error("Supabase insert error:", error.message);
      else console.log(`✅ Inserted image issue into ${table} successfully!`);
    } catch (err) {
      console.error(err);
      setImageResult({ severity: "error", message: err.message });
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Post Issue</h2>

      {/* ---------- TEXT FORM ---------- */}
      <form onSubmit={handleTextSubmit}>
        <textarea
          placeholder="Enter your issue..."
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          rows={4}
          cols={50}
        />
        <br />
        <button type="submit">Classify Text</button>
      </form>
      {textResult && (
        <div style={{ marginTop: "10px" }}>
          <strong>Text Classification Result:</strong>
          <pre>{JSON.stringify(textResult, null, 2)}</pre>
        </div>
      )}

      <hr />

      {/* ---------- IMAGE FORM ---------- */}
      <form onSubmit={handleImageSubmit}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageInput(e.target.files[0])}
        />
        <br />
        <button type="submit">Classify Image</button>
      </form>
      {imageResult && (
        <div style={{ marginTop: "10px" }}>
          <strong>Image Classification Result:</strong>
          <pre>{JSON.stringify(imageResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
