import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../contexts/AuthContext';
import { useCrisisContext } from '../contexts/CrisisContext';
import './ReportCrisis.css';

// Location Picker Component
const LocationPicker = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });
  return null;
};

const ReportCrisis = () => {
  const { currentUser } = useAuth();
  const { addCrisisReport } = useCrisisContext();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'FIRE',
    address: '',
    useCurrentLocation: false,
    location: { lat: -25.7479, lng: 28.2293 }, // Default to Emalahleni
    locationSource: 'default' // 'default', 'city', 'map', 'current', 'manual'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [geocodingError, setGeocodingError] = useState(null);

  // South African city coordinates with proper distinct locations
  const southAfricanCities = {
    emalahleni: { lat: -25.7479, lng: 28.2293, name: 'Emalahleni, Mpumalanga' },
    pretoria: { lat: -25.7313, lng: 28.2184, name: 'Pretoria, Gauteng' },
    johannesburg: { lat: -26.2041, lng: 28.0473, name: 'Johannesburg, Gauteng' }
  };
  
  // Enhanced reverse geocoding function
  const reverseGeocode = async (location) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&zoom=16&addressdetails=1`
      );
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      const address = data.address || {};
      let displayName = '';
      
      // Build a more readable address
      if (address.road) displayName += `${address.road}, `;
      if (address.suburb) displayName += `${address.suburb}, `;
      if (address.city) displayName += `${address.city}, `;
      if (address.state) displayName += `${address.state}`;
      
      return displayName || data.display_name || 'Selected Location';
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      setGeocodingError('Could not determine address for this location');
      return 'Selected Location';
    }
  };

  // Enhanced current location handler
  const handleCurrentLocation = async (useCurrent) => {
    setFormData(prev => ({ ...prev, useCurrentLocation: useCurrent }));
    
    if (useCurrent) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          });
        });
        
        const location = { 
          lat: position.coords.latitude, 
          lng: position.coords.longitude 
        };
        
        const address = await reverseGeocode(location);
        
        setFormData(prev => ({ 
          ...prev, 
          location,
          address,
          locationSource: 'current'
        }));
      } catch (error) {
        setError("Could not access your location. Please select a location on the map.");
        setFormData(prev => ({ ...prev, useCurrentLocation: false }));
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    
    if (name === 'address' && value) {
      setFormData(prev => ({ 
        ...prev, 
        location: null, 
        useCurrentLocation: false,
        locationSource: 'manual'
      }));
    }
  };

  // Enhanced location selection with reverse geocoding
  const handleLocationSelect = async (location) => {
    const address = await reverseGeocode(location);
    setFormData({ 
      ...formData, 
      location, 
      useCurrentLocation: false, 
      address,
      locationSource: 'map'
    });
  };

  // Enhanced city selection
  const handleCitySelect = (city) => {
    setFormData({
      ...formData,
      location: { lat: city.lat, lng: city.lng },
      address: city.name,
      useCurrentLocation: false,
      locationSource: 'city'
    });
  };
  const getSeverityFromDescription = (description) => {
    const keywords = description.toLowerCase();
    if (/urgent|emergency|severe|critical|life-threatening/.test(keywords)) return 'HIGH';
    if (/important|significant|moderate/.test(keywords)) return 'MEDIUM';
    return 'LOW';
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
  
    try {
      // Validate required fields
      if (!formData.title.trim()) throw new Error('Title is required');
      if (!formData.description.trim()) throw new Error('Description is required');
      if (!formData.location) throw new Error('Location is required');
  
      // Convert reporterId to number or null
      const reporterId = currentUser?.id ? Number(currentUser.id) : null;
  
      const crisisData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        status: 'PENDING',
        severity: getSeverityFromDescription(formData.description),
        latitude: formData.location.lat,
        longitude: formData.location.lng,
        address: formData.address || 'Location not specified',
        reporterId: reporterId, 
        reporterName: currentUser?.firstName || 'Anonymous',
        responders: 0,
        reportTime: new Date().toISOString()
      };
  
      const response = await fetch('http://localhost:8281/api/crisis-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(crisisData)
      });
  
      let responseData;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }
  
      if (!response.ok) {
        throw new Error(typeof responseData === 'object' 
          ? responseData.message || responseData.error 
          : responseData);
      }
  
      const savedReport = responseData;
      addCrisisReport(savedReport);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      console.error('Submission error:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const mapCenter = formData.location || southAfricanCities.emalahleni;

  const markerIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    shadowSize: [41, 41]
  });

  if (success) return (
    <div className="report-success">
      <h2>Report Submitted Successfully!</h2>
      <p>Your crisis report has been received and will be reviewed by our response team.</p>
      <p>Redirecting to dashboard...</p>
    </div>
  );

  return (
    <div className="report-crisis-container">
      <div className="report-header">
        <button className="back-button" onClick={() => navigate(-1)}>Back</button>
        <h2>Report a Crisis</h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title*</label>
          <input 
            id="title"
            name="title" 
            value={formData.title} 
            onChange={handleChange} 
            placeholder="Brief title of the crisis" 
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description*</label>
          <textarea 
            id="description"
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            placeholder="Detailed description of the crisis" 
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category*</label>
          <select 
            id="category"
            name="category" 
            value={formData.category} 
            onChange={handleChange}
          >
            <option value="FIRE">Fire</option>
            <option value="FLOOD">Flood</option>
            <option value="MEDICAL">Medical Emergency</option>
            <option value="CRIME">Crime</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Location Selection</label>
          <div className="location-options">
            <div className="city-buttons">
              <button 
                type="button"
                className={`city-button ${formData.locationSource === 'city' && formData.address === southAfricanCities.emalahleni.name ? 'active' : ''}`}
                onClick={() => handleCitySelect(southAfricanCities.emalahleni)}
              >
                Emalahleni
              </button>
              <button 
                type="button"
                className={`city-button ${formData.locationSource === 'city' && formData.address === southAfricanCities.pretoria.name ? 'active' : ''}`}
                onClick={() => handleCitySelect(southAfricanCities.pretoria)}
              >
                Pretoria
              </button>
              <button 
                type="button"
                className={`city-button ${formData.locationSource === 'city' && formData.address === southAfricanCities.johannesburg.name ? 'active' : ''}`}
                onClick={() => handleCitySelect(southAfricanCities.johannesburg)}
              >
                Johannesburg
              </button>
            </div>
            
            <div className="current-location">
              <label className="current-location-label">
                <input 
                  type="checkbox" 
                  name="useCurrentLocation" 
                  checked={formData.useCurrentLocation} 
                  onChange={(e) => handleCurrentLocation(e.target.checked)} 
                />
                <span>Use my current location</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="address">Address</label>
          <input 
            id="address"
            name="address" 
            value={formData.address} 
            onChange={handleChange} 
            placeholder="Or enter exact address" 
          />
        </div>
        
        <div className="location-feedback">
          {formData.location && (
            <>
              <p><strong>Selected Location:</strong> {formData.address || 'No address available'}</p>
              <p><strong>Coordinates:</strong> {formData.location.lat.toFixed(6)}, {formData.location.lng.toFixed(6)}</p>
              {formData.locationSource === 'current' && (
                <p className="location-source">(Using your current location)</p>
              )}
              {formData.locationSource === 'city' && (
                <p className="location-source">(Selected from city list)</p>
              )}
              {formData.locationSource === 'map' && (
                <p className="location-source">(Selected on map)</p>
              )}
            </>
          )}
          {geocodingError && <p className="geocoding-error">{geocodingError}</p>}
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button 
          type="submit" 
          className="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner"></span>
              Submitting...
            </>
          ) : (
            'Submit Report'
          )}
        </button>
      </form>
    </div>
  );
};

export default ReportCrisis;