// src/components/MapView.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { supabase } from '../supabaseClient';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Leaflet ke default marker icon ko theek karne ke liye
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MapView = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const position = [19.45, 72.8]; // Default position (Virar area)

  useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('civic_issues')
        .select('id, title, latitude, longitude')
        .not('latitude', 'is', null);

      if (error) {
        console.error('Error fetching issues for map:', error);
      } else {
        setIssues(data);
      }
      setLoading(false);
    };
    fetchIssues();
  }, []);

  if (loading) return <p>Loading map...</p>;

  return (
    <MapContainer center={position} zoom={13} style={{ height: 'calc(100vh - 150px)', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {issues.map(issue => (
        <Marker key={issue.id} position={[issue.latitude, issue.longitude]}>
          <Popup>
            {issue.title}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;
