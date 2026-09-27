import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

const PlanContext = createContext(null);

export function PlanProvider({ children }) {
  const [info, setInfo] = useState(null);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const data = await api.me();
      setInfo(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  const setTier = useCallback(async (tier) => {
    const data = await api.setTier(tier);
    setInfo((prev) => ({ ...prev, ...data }));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <PlanContext.Provider value={{ info, error, refresh, setTier }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error('usePlan must be used inside PlanProvider');
  return ctx;
}
