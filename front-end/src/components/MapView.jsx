// src/components/MapView.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { supabase } from '../supabaseClient';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '../css/MapView.css'; // Styling ke liye CSS file import ki

// --- Leaflet Icon Fix (Marker ko sahi se dikhane ke liye) ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
// --- End of Icon Fix ---

export default function MapView() {
    // Step 1: Zaroori states define karna
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Virar area ka default map position
    const position = [19.46, 72.82]; 

    // Step 2: Supabase se saara data fetch karna
    useEffect(() => {
        const fetchIssues = async () => {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('civic_issues') // Aapka table name
                .select('id, title, category, latitude, longitude') // Category bhi select kiya
                .not('latitude', 'is', null); // Sirf woh issues jinki location hai

            if (error) {
                console.error('Error fetching issues for map:', error);
                // User ko dikhane ke liye error set karna
                setError('Could not fetch issues data. Please check your connection or try again later.');
            } else {
                setIssues(data);
            }
            setLoading(false);
        };
        fetchIssues();
    }, []); // Yeh useEffect sirf ek baar chalega

    // Step 3: Loading state handle karna
    if (loading) {
        return <div className="map-feedback"><h2>🗺️ Loading Map...</h2></div>;
    }

    // Step 4: Error state handle karna
    if (error) {
        return <div className="map-feedback error"><h2>😞 {error}</h2></div>;
    }

    // Step 5: Map aur markers ko render karna
    return (
        <div className="map-page-container">
            <h1>Reported Issues in Your Area</h1>
            <div className="map-wrapper">
                <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {issues.map(issue => (
                        <Marker key={issue.id} position={[issue.latitude, issue.longitude]}>
                            <Popup>
                                <h3>{issue.title}</h3>
                                <p><strong>Category:</strong> {issue.category || 'N/A'}</p>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};