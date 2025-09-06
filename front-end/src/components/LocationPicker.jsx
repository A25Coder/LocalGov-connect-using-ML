import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Leaflet ke default marker icon ki problem aati hai, use aese theek karte hain
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


function LocationMarker({ onPositionChange }) {
    const [position, setPosition] = useState(null);

    // useMapEvents hook map par hone wale events (jaise click) ko sunta hai
    useMapEvents({
        click(e) {
            // Jaise hi user map par click karta hai
            const newPos = e.latlng;
            setPosition(newPos); // Marker ki position set karte hain
            onPositionChange(newPos); // Parent component (Post.jsx) ko nayi position bhejte hain
        },
    });

    // Agar position select nahi hui hai to kuch nahi dikhana
    if (position === null) {
        return null;
    }

    // Agar position select ho gayi hai, to wahan par Marker dikhana
    return <Marker position={position}></Marker>;
}

// Yeh hamara main component hai jise hum Post.jsx me use karenge
function LocationPicker({ onPositionChange }) {
    // Virar, India ke coordinates
    const virarPosition = [19.46, 72.82];

    return (
        <div style={{ height: '300px', width: '100%', marginBottom: '15px' }}>
            <p><strong>Select issue location on the map:</strong></p>
            <MapContainer center={virarPosition} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationMarker onPositionChange={onPositionChange} />
            </MapContainer>
        </div>
    );
}

export default LocationPicker;