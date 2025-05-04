// src/main/resources/static/js/ReportForm.js
import React, { useState } from 'react';
import axios from 'axios';

const ReportForm = ({ onReportCreated }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    useAddress: false,
    address: '',
    latitude: '',
    longitude: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const response = await axios.post('/api/crisis', {
        title: form.title,
        description: form.description,
        category: form.category,
        address: form.useAddress ? form.address : null,
        latitude: form.useAddress ? null : parseFloat(form.latitude),
        longitude: form.useAddress ? null : parseFloat(form.longitude)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      onReportCreated(response.data);
    } catch (error) {
      console.error('Error submitting report:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Title"
        value={form.title}
        onChange={(e) => setForm({...form, title: e.target.value})}
        required
      />
      
      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({...form, description: e.target.value})}
        required
      />
      
      <select
        value={form.category}
        onChange={(e) => setForm({...form, category: e.target.value})}
        required
      >
        <option value="">Select Category</option>
        <option value="NATURAL_DISASTER">Natural Disaster</option>
        <option value="ACCIDENT">Accident</option>
        <option value="CRIME">Crime</option>
      </select>
      
      <label>
        <input
          type="checkbox"
          checked={form.useAddress}
          onChange={(e) => setForm({...form, useAddress: e.target.checked})}
        />
        Use Address Instead of Coordinates
      </label>
      
      {form.useAddress ? (
        <input
          type="text"
          placeholder="Full Address"
          value={form.address}
          onChange={(e) => setForm({...form, address: e.target.value})}
          required
        />
      ) : (
        <>
          <input
            type="number"
            step="any"
            placeholder="Latitude"
            value={form.latitude}
            onChange={(e) => setForm({...form, latitude: e.target.value})}
            required
          />
          <input
            type="number"
            step="any"
            placeholder="Longitude"
            value={form.longitude}
            onChange={(e) => setForm({...form, longitude: e.target.value})}
            required
          />
        </>
      )}
      
      <button type="submit">Submit Report</button>
    </form>
  );
};

export default ReportForm;