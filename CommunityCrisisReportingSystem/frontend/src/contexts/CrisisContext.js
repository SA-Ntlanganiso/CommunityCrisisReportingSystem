import React, { createContext, useState, useContext } from 'react';

const CrisisContext = createContext();

export const CrisisProvider = ({ children }) => {
  const [crisisReports, setCrisisReports] = useState(() => {
    try {
      const savedCrises = JSON.parse(localStorage.getItem('crisisReports'));
      return savedCrises || [];
    } catch (e) {
      console.error("Error loading crisis data:", e);
      return [];
    }
  });

  const addCrisisReport = (newReport) => {
    const updatedReports = [newReport, ...crisisReports];
    setCrisisReports(updatedReports);
    localStorage.setItem('crisisReports', JSON.stringify(updatedReports));
  };

  const updateCrisisReport = (id, updates) => {
    const updatedReports = crisisReports.map(report => 
      report.id === id ? { ...report, ...updates } : report
    );
    setCrisisReports(updatedReports);
    localStorage.setItem('crisisReports', JSON.stringify(updatedReports));
  };

  const respondToCrisis = (crisisId) => {
    const updatedReports = crisisReports.map(report => 
      report.id === crisisId 
        ? { ...report, responders: (report.responders || 0) + 1 } 
        : report
    );
    setCrisisReports(updatedReports);
    localStorage.setItem('crisisReports', JSON.stringify(updatedReports));
  };

  return (
    <CrisisContext.Provider value={{ 
      crisisReports, 
      addCrisisReport,
      updateCrisisReport,
      respondToCrisis
    }}>
      {children}
    </CrisisContext.Provider>
  );
};

export const useCrisisContext = () => useContext(CrisisContext);