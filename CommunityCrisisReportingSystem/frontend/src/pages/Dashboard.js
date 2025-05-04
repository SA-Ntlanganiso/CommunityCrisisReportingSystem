import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';
import 'leaflet/dist/leaflet.css';

// MapController component remains the same
const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 14);
    }
  }, [center, map]);
  return null;
};

// New MapView component
const MapView = ({ mapCenter, userLocation, crisisReports, setSelectedCrisis, handleRespondToCrisis, currentUser }) => {
  const [mapKey, setMapKey] = useState(Date.now());

  const getCrisisIcon = (category, severity) => {
    const colors = {
      FIRE: '#FF4500',
      FLOOD: '#4682B4',
      MEDICAL: '#FF0000',
      CRIME: '#8B0000',
      default: '#FFA500'
    };
    
    return new L.DivIcon({
      className: `crisis-marker ${severity.toLowerCase()}`,
      html: `<div style="background-color: ${colors[category] || colors.default}; 
             width: 30px; height: 30px; border-radius: 50%; 
             display: flex; justify-content: center; align-items: center; 
             color: white; font-weight: bold;">!</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  };

  return (
    <MapContainer
      key={mapKey}
      center={mapCenter}
      zoom={14}
      style={{ height: 'calc(100% - 50px)', width: '100%' }}
      zoomControl={false}
    >
      <MapController center={mapCenter} />
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      
      {userLocation && (
        <>
          <Marker 
            position={userLocation} 
            icon={new L.DivIcon({
              className: 'user-location-marker',
              html: '<div style="background-color: #4169E1; border: 2px solid white; width: 16px; height: 16px; border-radius: 50%;"></div>',
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            })}
          >
            <Popup>Your current location</Popup>
          </Marker>
          <Circle 
            center={userLocation}
            radius={500}
            pathOptions={{ color: '#4169E1', fillColor: '#4169E1', fillOpacity: 0.1 }}
          />
        </>
      )}
      
      {crisisReports.map(crisis => (
        <Marker 
          key={crisis.id} 
          position={crisis.location}
          icon={getCrisisIcon(crisis.category, crisis.severity)}
          eventHandlers={{
            click: () => {
              setSelectedCrisis(crisis);
            }
          }}
        >
          <Popup>
            <div className="crisis-popup">
              <h3>{crisis.title}</h3>
              <p>{crisis.category} - {crisis.status}</p>
              <p>{crisis.description}</p>
              {currentUser?.role === 'RESPONDER' && (
                <button 
                  onClick={() => handleRespondToCrisis(crisis.id)}
                  className="popup-respond-button"
                >
                  Respond
                </button>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

// Helper function to format time
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'Just now';
  
  const reportDate = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now - reportDate) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
};

const DEFAULT_CRISES = [
  {
    id: 1,
    title: 'Building Fire at TUT Emalahleni',
    description: 'Fire outbreak in the computer lab building',
    category: 'FIRE',
    status: 'ACTIVE',
    severity: 'HIGH',
    latitude: -25.7479,
    longitude: 29.2293,
    address: 'Tshwane University of Technology, Emalahleni Campus',
    reportTime: new Date().toISOString(),
    reporterId: 4,
    reporterName: 'Thabo Mbeki',
    responders: 2
  },
];

const CITY_COORDINATES = {
  'Johannesburg': [-26.2041, 28.0473],
  'Witbank/Emalahleni': [-25.8707, 29.2131],
  'Pretoria': [-25.7461, 28.1881]
};

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [mapCenter, setMapCenter] = useState([-25.8707, 29.2131]);
  const [selectedCity, setSelectedCity] = useState('Witbank/Emalahleni');
  const [userLocation, setUserLocation] = useState(null);
  const [crisisReports, setCrisisReports] = useState([]);
  const [selectedCrisis, setSelectedCrisis] = useState(null);
  const [viewMode, setViewMode] = useState('map');
  const [loading, setLoading] = useState(true);

  const transformCrisisData = (data) => {
    return data.map(report => ({
      ...report,
      location: [report.latitude, report.longitude],
      reportTime: report.reportTime ? formatTimeAgo(report.reportTime) : 'Just now',
      status: report.status?.charAt(0).toUpperCase() + report.status?.slice(1).toLowerCase() || 'Pending'
    }));
  };

  const handleCityChange = (city) => {
    setSelectedCity(city);
    setMapCenter(CITY_COORDINATES[city]);
  };
  
  useEffect(() => {
    const fetchCrisisReports = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8281/api/crisis-reports', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const reports = await response.json();
          const transformed = transformCrisisData(reports);
          setCrisisReports(transformed);
          localStorage.setItem('crisisReports', JSON.stringify(transformed));
          
          if (transformed.length > 0 && !selectedCrisis) {
            setSelectedCrisis(transformed[0]);
          }
        } else {
          const transformed = transformCrisisData(DEFAULT_CRISES);
          setCrisisReports(transformed);
        }
      } catch (error) {
        console.error('Failed to fetch crisis reports:', error);
        const transformed = transformCrisisData(DEFAULT_CRISES);
        setCrisisReports(transformed);
      } finally {
        setLoading(false);
      }
    };

    fetchCrisisReports();
  }, [selectedCrisis]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = [position.coords.latitude, position.coords.longitude];
        setUserLocation(loc);
        setMapCenter(loc);
      },
      (error) => {
        console.error("Location access denied", error);
      }
    );
  }, []);

  const goToReportCrisis = () => navigate('/report');

  const handleRespondToCrisis = async (crisisId) => {
    try {
      const response = await fetch(`http://localhost:8281/api/crisis-reports/${crisisId}/respond`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const updatedReport = await response.json();
        const transformed = transformCrisisData([updatedReport])[0];
        
        setCrisisReports(prev => 
          prev.map(report => 
            report.id === transformed.id ? transformed : report
          )
        );
        
        if (selectedCrisis?.id === crisisId) {
          setSelectedCrisis(transformed);
        }
      }
    } catch (error) {
      console.error('Error responding to crisis:', error);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading crisis data...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <button className="back-button">← Home</button>
          <div className="user-badge">
            {currentUser?.role || 'CITIZEN'}
          </div>
        </div>
        
        <div className="crisis-info">
          <h2>Community Crisis Dashboard</h2>
          <div className="status-indicator">
            <span className="active-status">Active Crisis Reports: {crisisReports.filter(c => c.status === 'Active').length}</span>
            <span className="update-time">Last update: Just now</span>
          </div>
          
          {selectedCrisis && (
            <div className="crisis-detail-card">
              <div className="crisis-header">
                <h3>{selectedCrisis.title}</h3>
                <span className={`crisis-status ${selectedCrisis.status.toLowerCase()}`}>
                  {selectedCrisis.status}
                </span>
              </div>
              
              <div className="crisis-category">
                Category: <span className={selectedCrisis.category.toLowerCase()}>{selectedCrisis.category}</span>
              </div>
              
              <p className="crisis-description">{selectedCrisis.description}</p>
              
              <div className="crisis-meta">
                <div className="meta-item">
                  <label>Location</label>
                  <div className="address-box">{selectedCrisis.address}</div>
                </div>
                <div className="meta-item">
                  <label>Reported</label>
                  <div className="reporter-box">
                    <span className="reporter-name">By: {selectedCrisis.reporterName || `User ${selectedCrisis.reporterId}`}</span>
                    <span className="report-time">{selectedCrisis.reportTime}</span>
                  </div>
                </div>
              </div>
              
              <div className="crisis-severity">
                <h4>Severity Level</h4>
                <div className="severity-bar">
                  <div 
                    className={`severity-indicator ${selectedCrisis.severity.toLowerCase()}`}
                    style={{ 
                      width: selectedCrisis.severity === 'HIGH' ? '100%' : 
                             selectedCrisis.severity === 'MEDIUM' ? '66%' : '33%' 
                    }}
                  ></div>
                </div>
                <div className="severity-labels">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
              </div>
              
              <div className="responder-info">
                <h4>Response Status</h4>
                <div className="responder-count">
                  <span className="responder-label">Active Responders:</span>
                  <span className="responder-number">{selectedCrisis.responders || 0}</span>
                </div>
                
                {currentUser?.role === 'RESPONDER' && (
                  <button 
                    className="respond-button"
                    onClick={() => handleRespondToCrisis(selectedCrisis.id)}
                  >
                    Respond to Crisis
                  </button>
                )}
              </div>
            </div>
          )}
          
          {currentUser?.role === 'CITIZEN' && (
            <button 
              className="report-crisis-button" 
              onClick={goToReportCrisis}
            >
              Report New Crisis
            </button>
          )}
        </div>
      </div>
      
      <div className="map-section">
        <div className="view-controls">
          <div className="city-tabs">
            <button 
              className={selectedCity === 'Johannesburg' ? 'active' : ''} 
              onClick={() => handleCityChange('Johannesburg')}
            >
              Johannesburg
            </button>
            <button 
              className={selectedCity === 'Witbank/Emalahleni' ? 'active' : ''} 
              onClick={() => handleCityChange('Witbank/Emalahleni')}
            >
              Witbank/Emalahleni
            </button>
              <button 
              className={selectedCity === 'Pretoria' ? 'active' : ''} 
              onClick={() => handleCityChange('Pretoria')}
            >
              Pretoria
            </button>
          </div>
          
          <div className="view-toggle">
            <button 
              className={viewMode === 'map' ? 'active' : ''} 
              onClick={() => setViewMode('map')}
            >
              Map View
            </button>
            <button 
              className={viewMode === 'list' ? 'active' : ''} 
              onClick={() => setViewMode('list')}
            >
              List View
            </button>
          </div>
        </div>
        
        {viewMode === 'map' ? (
          <MapView 
            mapCenter={mapCenter}
            userLocation={userLocation}
            crisisReports={crisisReports}
            setSelectedCrisis={setSelectedCrisis}
            handleRespondToCrisis={handleRespondToCrisis}
            currentUser={currentUser}
          />
        ) : (
          <div className="crisis-list-view">
            <h3>Recent Crisis Reports</h3>
            {crisisReports.length > 0 ? (
              crisisReports.map(crisis => (
                <div 
                  key={crisis.id} 
                  className={`crisis-list-item ${selectedCrisis?.id === crisis.id ? 'selected' : ''}`}
                  onClick={() => setSelectedCrisis(crisis)}
                >
                  <div className={`crisis-indicator ${crisis.category.toLowerCase()}`}></div>
                  <div className="crisis-list-content">
                    <div className="crisis-list-header">
                      <h4>{crisis.title}</h4>
                      <span className={`status-badge ${crisis.status.toLowerCase()}`}>
                        {crisis.status}
                      </span>
                    </div>
                    <p className="crisis-list-description">{crisis.description}</p>
                    <div className="crisis-list-footer">
                      <span className="crisis-address">{crisis.address}</span>
                      <span className="crisis-time">{crisis.reportTime}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-crises">No crisis reports available</p>
            )}
          </div>
        )}
        
        <div className="report-shortcut">
          {currentUser?.role === 'CITIZEN' && (
            <button 
              className="floating-report-button" 
              onClick={goToReportCrisis}
            >
              +
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;