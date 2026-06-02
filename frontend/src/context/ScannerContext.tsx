import React, { createContext, useContext, useState } from 'react';

export interface SocialResult {
  site: string;
  url: string;
  category: string;
  username: string;
  status: number | string; 
}

interface ScannerContextType {
  stagedProfiles: Record<string, SocialResult>;
  toggleProfile: (profile: SocialResult) => void;
  removeProfile: (username: string, site: string) => void;
  clearStage: () => void;
}

const ScannerContext = createContext<ScannerContextType | undefined>(undefined);

export const ScannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stagedProfiles, setStagedProfiles] = useState<Record<string, SocialResult>>({});

  const toggleProfile = (profile: SocialResult) => {
    // uses the compositekey to have the PRY button unique across all usernames
    const compositeKey = `${profile.username}-${profile.site}`;

    setStagedProfiles((prev) => {
      const copy = { ...prev };
      if (copy[compositeKey]) {
        delete copy[compositeKey];
      } else {
        copy[compositeKey] = profile;
      }
      return copy;
    });
  };

  const removeProfile = (username: string, site: string) => {
    const compositeKey = `${username}-${site}`;
    setStagedProfiles((prev) => {
      const copy = { ...prev };
      delete copy[compositeKey];
      return copy;
    });
  };

  const clearStage = () => setStagedProfiles({});

  return (
    <ScannerContext.Provider value={{ stagedProfiles, toggleProfile, removeProfile, clearStage }}>
      {children}
    </ScannerContext.Provider>
  );
};

export const useScanner = () => {
  const context = useContext(ScannerContext);
  if (!context) throw new Error('useScanner must be used within a ScannerProvider');
  return context;
};