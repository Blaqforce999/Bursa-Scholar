'use client';

import { createContext, useContext, useState } from 'react';
import { AssistantPanel } from '@/components/app/AssistantPanel';

type AssistantContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const AssistantContext = createContext<AssistantContextValue | null>(null);

export function useAssistant() {
  const context = useContext(AssistantContext);
  if (!context) throw new Error('useAssistant must be used within AssistantProvider');
  return context;
}

type AssistantProviderProps = {
  // required props first
  children: React.ReactNode;
  // optional props after
  firstName?: string | null;
};

/**
 * Hosts the Ask Bursa overlay at the (app) layout level so both the nav
 * rail's "Ask" item and any in-page "Ask Bursa" button can open the same
 * panel without prop-drilling or a state library.
 */
export function AssistantProvider({ children, firstName }: AssistantProviderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AssistantContext.Provider value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}>
      {children}
      <AssistantPanel isOpen={isOpen} onClose={() => setIsOpen(false)} firstName={firstName ?? null} />
    </AssistantContext.Provider>
  );
}
