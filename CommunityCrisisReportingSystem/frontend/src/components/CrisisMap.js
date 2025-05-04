import React, { useState, useEffect, useMemo } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { useAuth } from '../contexts/AuthContext';
import './CrisisMap.css';

const CrisisMap = () => {
  const { currentUser } = useAuth();
  const [selectedCrisis, setSelectedCrisis] = useState(null);
  const [center, setCenter] = useState({ lat: 40.7128, lng: -74.0060 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize crises from localStorage or empty array
  const [crises, setCrises] = useState(() => {
    try {
      const savedCrises = JSON.parse(localStorage.getItem('crisisReports')) || [];
      return savedCrises.map(crisis => ({
        ...crisis,
        // Ensure location data is properly formatted
        latitude: crisis.latitude || (crisis.location ? crisis.location[0] : null),
        longitude: crisis.longitude || (crisis.location ? crisis.location[1] : null)
      })).filter(c => c.latitude && c.longitude); // Only include crises with valid coordinates
    } catch (e) {
      console.error("Error loading crisis data:", e);
      return [];
    }
  });

  // Google Maps API key (should be in environment variables in production)
  const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "AIzaSyAIaweXO5YUOdwrKAAQshi6ViZ7ypqzOkg";

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey,
    libraries: ['places'],
    version: 'weekly'
  });

  // Handle localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const savedCrises = JSON.parse(localStorage.getItem('crisisReports')) || [];
        setCrises(savedCrises);
      } catch (e) {
        console.error("Error handling storage change:", e);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCenter(userLocation);
          setLoading(false);
        },
        () => {
          console.log("Geolocation permission denied, using default location");
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }
  }, []);

  const mapContainerStyle = useMemo(() => ({
    width: '100%',
    height: '80vh'
  }), []);

  const handleRespond = (crisisId) => {
    // Update the crisis in local storage
    const updatedCrises = crises.map(crisis => 
      crisis.id === crisisId 
        ? { ...crisis, responders: (crisis.responders || 0) + 1 }
        : crisis
    );
    
    setCrises(updatedCrises);
    localStorage.setItem('crisisReports', JSON.stringify(updatedCrises));
    
    // Update selected crisis if it's the one being responded to
    if (selectedCrisis?.id === crisisId) {
      setSelectedCrisis(prev => ({
        ...prev,
        responders: (prev.responders || 0) + 1
      }));
    }
    
    alert(`Responding to crisis ${crisisId}`);
  };

  const getMarkerIcon = (severity) => {
    const severityLevel = severity?.toLowerCase() || 'default';
    const icons = {
      high: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
      medium: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
      low: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
      default: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
    };
    return icons[severityLevel] || icons.default;
  };
  const handleSubmit = async (crisisData) => {
    try {
        const response = await fetch("http://localhost:8281/api/crisis-reports", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(crisisData)
        });

        if (!response.ok) {
            throw new Error("Failed to submit crisis report");
        }

        alert("Crisis report submitted successfully!");
    } catch (error) {
        console.error("Error submitting crisis report:", error);
    }
};

  if (loadError) return <div className="error">Error loading Google Maps</div>;
  if (!isLoaded || loading) return <div className="loading-map">Loading map...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="crisis-map-container">
      <h2>Crisis Map</h2>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={12}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          disableDefaultUI: true,
          zoomControl: true
        }}
      >
        {crises.map(crisis => (
          crisis.latitude && crisis.longitude && (
            <Marker
              key={crisis.id}
              position={{ lat: crisis.latitude, lng: crisis.longitude }}
              onClick={() => setSelectedCrisis(crisis)}
              icon={{
                url: getMarkerIcon(crisis.severity),
                scaledSize: new window.google.maps.Size(32, 32)
              }}
            />
          )
        ))}

        {selectedCrisis && (
          <InfoWindow
            position={{ 
              lat: selectedCrisis.latitude, 
              lng: selectedCrisis.longitude 
            }}
            onCloseClick={() => setSelectedCrisis(null)}
          >
            <div className="info-window">
              <h3>{selectedCrisis.title}</h3>
              <p><strong>Status:</strong> {selectedCrisis.status || 'Unknown'}</p>
              <p><strong>Category:</strong> {selectedCrisis.category || 'Unknown'}</p>
              <p><strong>Severity:</strong> {selectedCrisis.severity || 'Unknown'}</p>
              <p>{selectedCrisis.description || 'No description provided'}</p>
              
              {(selectedCrisis.reporterName || selectedCrisis.reporterId) && (
                <p><em>Reported by: {selectedCrisis.reporterName || selectedCrisis.reporterId}</em></p>
              )}
              
              {currentUser?.role === 'RESPONDER' && (
                <button 
                  className="respond-button"
                  onClick={() => handleRespond(selectedCrisis.id)}
                >
                  Respond ({selectedCrisis.responders || 0})
                </button>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default React.memo(CrisisMap);