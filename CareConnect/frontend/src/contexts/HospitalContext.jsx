import { createContext, useState, useCallback } from 'react';

export const HospitalContext = createContext(null);

export function HospitalProvider({ children }) {
  const [activeRequests, setActiveRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const addRequest = useCallback((request) => {
    setActiveRequests((prev) => [request, ...prev]);
  }, []);

  const value = { activeRequests, setActiveRequests, addRequest, selectedRequest, setSelectedRequest };

  return <HospitalContext.Provider value={value}>{children}</HospitalContext.Provider>;
}
