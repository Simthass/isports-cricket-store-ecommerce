"use client";

import React, { createContext, useContext } from "react";

export interface SiteSettingsType {
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string[];
  logo: string;
  favicon: string;
  phone: string;
  email: string;
  address: string;
  whatsappNumber: string;
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
  tiktok: string;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  sessionTimeoutHours: number;
  singleDeviceOnly: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsType | null>(null);

export function SiteSettingsProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings: SiteSettingsType;
}) {
  return (
    <SiteSettingsContext.Provider value={initialSettings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error("useSiteSettings must be used within SiteSettingsProvider");
  }
  return context;
}
