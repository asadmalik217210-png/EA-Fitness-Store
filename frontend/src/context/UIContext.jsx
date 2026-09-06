import { createContext, useContext, useState } from 'react';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  function toast(message, type = 'info') {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }

  return <UIContext.Provider value={{ toasts, toast }}>{children}</UIContext.Provider>;
}

export function useUI() {
  return useContext(UIContext);
}
