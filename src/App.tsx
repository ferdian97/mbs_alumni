/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  LogOut,
  Sparkles,
  BookOpen,
  User,
  ShieldCheck,
  Check,
  Upload,
  UserCheck,
  Sun,
  Moon,
  Lock
} from 'lucide-react';

import { Alumnus, UserRole, ActiveTab } from './types';
import { DEFAULT_ALUMNI } from './data/defaultAlumni';
import { DEFAULT_MASTER_KAMPUS, MasterKampusItem } from './data/defaultMasterKampus';
import LoginScreen from './components/LoginScreen';
import DashboardView from './components/DashboardView';
import AlumniListView from './components/AlumniListView';
import AdminControls from './components/AdminControls';

export default function App() {
  // --- Persistent States ---
  // Pure in-memory state for authentication so that refreshing the page or leaving the app returns to login screen
  const [userRole, setUserRole] = useState<UserRole | null>('Guest');

  const [alumni, setAlumni] = useState<Alumnus[]>(() => {
    const saved = localStorage.getItem('mbs_alumni_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved alumni data, resetting to defaults.', e);
      }
    }
    return DEFAULT_ALUMNI;
  });

  const [customLogo, setCustomLogo] = useState<string | null>(() => {
    return localStorage.getItem('mbs_alumni_logo');
  });

  const [masterKampus, setMasterKampus] = useState<MasterKampusItem[]>(() => {
    const saved = localStorage.getItem('mbs_master_kampus');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_MASTER_KAMPUS;
  });

  const [sheetUrl, setSheetUrl] = useState('');
  const [masterKampusSheetUrl, setMasterKampusSheetUrl] = useState('');
  const [schoolName, setSchoolName] = useState('MBS Ki Bagus Hadikusumo');
  const [appTitle, setAppTitle] = useState('Database Sebaran Alumni');
  const [welcomeTitle, setWelcomeTitle] = useState("Assalamu'alaikum Warahmatullahi Wabarakatuh");
  const [welcomeNarrative, setWelcomeNarrative] = useState("Selamat datang di Portal Sebaran Alumni MBS Ki Bagus Hadikusumo. Panel ini memetakan perkembangan, studi lanjut, pengabdian, dan kiprah alumni di masyarakat.");
  const [footerText, setFooterText] = useState('© 2026 MBS Ki Bagus Hadikusumo Alumni Hub');

  // Theme Management
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('mbs_alumni_theme') as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('mbs_alumni_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // --- UI States ---
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [editingAlumnus, setEditingAlumnus] = useState<Alumnus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isLocalChange = useRef(false);

  // Scroll to top whenever tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // Load initial data from the server on mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        const alumniRes = await fetch('/api/alumni');
        if (alumniRes.ok) {
          const alumniData = await alumniRes.json();
          if (alumniData.alumni && Array.isArray(alumniData.alumni)) {
            isLocalChange.current = false;
            setAlumni(alumniData.alumni);
          }
        }

        const settingsRes = await fetch('/api/settings');
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          if (settingsData.customLogo !== undefined) {
            setCustomLogo(settingsData.customLogo);
            if (settingsData.customLogo) {
              localStorage.setItem('mbs_alumni_logo', settingsData.customLogo);
            } else {
              localStorage.removeItem('mbs_alumni_logo');
            }
          }
          if (settingsData.sheetUrl !== undefined) {
            setSheetUrl(settingsData.sheetUrl);
          }
          if (settingsData.masterKampusSheetUrl !== undefined) {
            setMasterKampusSheetUrl(settingsData.masterKampusSheetUrl);
          }
          if (settingsData.schoolName) {
            setSchoolName(settingsData.schoolName);
          }
          if (settingsData.appTitle) {
            setAppTitle(settingsData.appTitle);
          }
          if (settingsData.welcomeTitle) {
            setWelcomeTitle(settingsData.welcomeTitle);
          }
          if (settingsData.welcomeNarrative) {
            setWelcomeNarrative(settingsData.welcomeNarrative);
          }
          if (settingsData.footerText) {
            setFooterText(settingsData.footerText);
          }
          if (settingsData.masterKampus && Array.isArray(settingsData.masterKampus) && settingsData.masterKampus.length > 0) {
            setMasterKampus(settingsData.masterKampus);
            localStorage.setItem('mbs_master_kampus', JSON.stringify(settingsData.masterKampus));
          }
        }
      } catch (error) {
        console.error("Failed to load initial data from server:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // Sync state to local storage and server on changes (only after loading has finished to avoid overwriting database)
  useEffect(() => {
    localStorage.setItem('mbs_alumni_data', JSON.stringify(alumni));
    
    if (!isLoading && isLocalChange.current) {
      // Sync to server in background
      async function syncToServer() {
        try {
          await fetch('/api/alumni', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ alumni })
          });
        } catch (e) {
          console.error("Failed to sync alumni database to server:", e);
        }
      }
      syncToServer();
      isLocalChange.current = false; // Reset the local change flag
    }
  }, [alumni, isLoading]);

  // Sync spreadsheet URL changes to server settings
  const handleSheetUrlChange = async (newUrl: string) => {
    setSheetUrl(newUrl);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetUrl: newUrl })
      });
    } catch (e) {
      console.error("Failed to sync sheetUrl to server:", e);
    }
  };

  const handleMasterKampusSheetUrlChange = async (newUrl: string) => {
    setMasterKampusSheetUrl(newUrl);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ masterKampusSheetUrl: newUrl })
      });
    } catch (e) {
      console.error("Failed to sync masterKampusSheetUrl to server:", e);
    }
  };

  const handleUpdateNarrativeSettings = async (updates: {
    schoolName?: string;
    appTitle?: string;
    welcomeTitle?: string;
    welcomeNarrative?: string;
    footerText?: string;
    masterKampus?: MasterKampusItem[];
  }) => {
    if (updates.schoolName !== undefined) setSchoolName(updates.schoolName);
    if (updates.appTitle !== undefined) setAppTitle(updates.appTitle);
    if (updates.welcomeTitle !== undefined) setWelcomeTitle(updates.welcomeTitle);
    if (updates.welcomeNarrative !== undefined) setWelcomeNarrative(updates.welcomeNarrative);
    if (updates.footerText !== undefined) setFooterText(updates.footerText);
    if (updates.masterKampus !== undefined) {
      setMasterKampus(updates.masterKampus);
      localStorage.setItem('mbs_master_kampus', JSON.stringify(updates.masterKampus));
    }

    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (e) {
      console.error("Failed to sync narrative settings to server:", e);
    }
  };

  // Poll for updates every 3 seconds to keep different devices in perfect sync
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    async function pollAlumniAndSettings() {
      try {
        const alumniRes = await fetch('/api/alumni');
        if (alumniRes.ok) {
          const alumniData = await alumniRes.json();
          if (alumniData.alumni && Array.isArray(alumniData.alumni)) {
            // Check if different to avoid unnecessary state triggers
            setAlumni((prev) => {
              if (JSON.stringify(prev) !== JSON.stringify(alumniData.alumni)) {
                isLocalChange.current = false;
                return alumniData.alumni;
              }
              return prev;
            });
          }
        }

        const settingsRes = await fetch('/api/settings');
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          if (settingsData.customLogo !== undefined) {
            setCustomLogo((prev) => {
              if (prev !== settingsData.customLogo) {
                if (settingsData.customLogo) {
                  localStorage.setItem('mbs_alumni_logo', settingsData.customLogo);
                } else {
                  localStorage.removeItem('mbs_alumni_logo');
                }
                return settingsData.customLogo;
              }
              return prev;
            });
          }
          if (settingsData.sheetUrl !== undefined) {
            setSheetUrl((prev) => prev !== settingsData.sheetUrl ? settingsData.sheetUrl : prev);
          }
          if (settingsData.masterKampusSheetUrl !== undefined) {
            setMasterKampusSheetUrl((prev) => prev !== settingsData.masterKampusSheetUrl ? settingsData.masterKampusSheetUrl : prev);
          }
          if (settingsData.schoolName !== undefined) {
            setSchoolName((prev) => prev !== settingsData.schoolName ? settingsData.schoolName : prev);
          }
          if (settingsData.appTitle !== undefined) {
            setAppTitle((prev) => prev !== settingsData.appTitle ? settingsData.appTitle : prev);
          }
          if (settingsData.welcomeTitle !== undefined) {
            setWelcomeTitle((prev) => prev !== settingsData.welcomeTitle ? settingsData.welcomeTitle : prev);
          }
          if (settingsData.welcomeNarrative !== undefined) {
            setWelcomeNarrative((prev) => prev !== settingsData.welcomeNarrative ? settingsData.welcomeNarrative : prev);
          }
          if (settingsData.footerText !== undefined) {
            setFooterText((prev) => prev !== settingsData.footerText ? settingsData.footerText : prev);
          }
          if (settingsData.masterKampus !== undefined && Array.isArray(settingsData.masterKampus) && settingsData.masterKampus.length > 0) {
            setMasterKampus((prev) => {
              if (JSON.stringify(prev) !== JSON.stringify(settingsData.masterKampus)) {
                localStorage.setItem('mbs_master_kampus', JSON.stringify(settingsData.masterKampus));
                return settingsData.masterKampus;
              }
              return prev;
            });
          }
        }
      } catch (err) {
        console.error("Failed to poll data from server:", err);
      }
    }

    if (!isLoading) {
      intervalId = setInterval(pollAlumniAndSettings, 3000); // Poll every 3 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isLoading]);

  // --- Auth Handlers ---
  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUserRole(null);
    setEditingAlumnus(null);
    setActiveTab('dashboard');
  };

  // --- Logo Handlers ---
  const handleLogoUpload = async (logoBase64: string) => {
    setCustomLogo(logoBase64);
    localStorage.setItem('mbs_alumni_logo', logoBase64);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customLogo: logoBase64 })
      });
    } catch (e) {
      console.error("Failed to sync logo setting to server:", e);
    }
  };

  const handleLogoReset = async () => {
    setCustomLogo(null);
    localStorage.removeItem('mbs_alumni_logo');
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customLogo: null })
      });
    } catch (e) {
      console.error("Failed to reset logo setting on server:", e);
    }
  };

  // --- Alumni CRUD Handlers ---
  const handleAddAlumnus = (newData: Omit<Alumnus, 'id' | 'createdAt'>) => {
    const newAlumnus: Alumnus = {
      ...newData,
      id: `alumni_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
    };
    isLocalChange.current = true;
    setAlumni((prev) => [newAlumnus, ...prev]);
  };

  const handleUpdateAlumnus = (updatedAlumnus: Alumnus) => {
    isLocalChange.current = true;
    setAlumni((prev) =>
      prev.map((item) => (item.id === updatedAlumnus.id ? updatedAlumnus : item))
    );
  };

  const handleDeleteAlumnus = (id: string) => {
    isLocalChange.current = true;
    setAlumni((prev) => prev.filter((item) => item.id !== id));
  };

  const handleBulkImport = (newList: Omit<Alumnus, 'id' | 'createdAt'>[]) => {
    isLocalChange.current = true;
    setAlumni((prev) => {
      const merged = [...prev];
      
      newList.forEach((newItem, idx) => {
        const normalizedNewName = newItem.name.trim().toLowerCase();
        const existingIdx = merged.findIndex(
          (item) => item.name.trim().toLowerCase() === normalizedNewName
        );

        if (existingIdx !== -1) {
          // If already exists, update details but preserve id and createdAt
          merged[existingIdx] = {
            ...merged[existingIdx],
            ...newItem,
          };
        } else {
          // If it doesn't exist, append as a new alumnus
          merged.unshift({
            ...newItem,
            id: `bulk_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 4)}`,
            createdAt: new Date().toISOString(),
          });
        }
      });

      return merged;
    });
  };

  const handleClearAll = () => {
    isLocalChange.current = true;
    setAlumni([]);
  };

  const handleResetSeeds = () => {
    isLocalChange.current = true;
    setAlumni(DEFAULT_ALUMNI);
  };

  // Handle edit request from the directory cards
  const triggerEditAlumnus = (item: Alumnus) => {
    setEditingAlumnus(item);
    setActiveTab('admin-panel'); // Shift view to admin form
  };

  // Render Loading screen during startup to keep data perfectly synchronized
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-6 font-sans relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-teal-500/10 blur-[120px] pointer-events-none" />
        <div className="z-10 flex flex-col items-center space-y-4 text-center">
          <div className="h-12 w-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mb-2" />
          <h2 className="text-lg font-semibold tracking-tight text-emerald-400">Menghubungkan Database...</h2>
          <p className="text-sm text-slate-400 max-w-xs">
            Sinkronisasi data alumni dengan server utama agar terintegrasi di semua perangkat.
          </p>
        </div>
      </div>
    );
  }

  // Render Login screen if not authenticated
  if (!userRole) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        logo={customLogo}
        schoolName={schoolName}
        appTitle={appTitle}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-x-hidden font-sans">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-full bg-emerald-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-full bg-teal-600/5 blur-[120px] pointer-events-none" />

      {/* Main Container framed beautifully for mobile-first with desktop fluid limits */}
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-6 py-4 flex flex-col z-10">
        
        {/* Floating Header */}
        <motion.header
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/60 border border-slate-850 backdrop-blur-md rounded-2xl p-3 sm:p-4 flex items-center justify-between mb-6 shadow-lg gap-2"
          id="main-app-header"
        >
          {/* Logo & School Name */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {customLogo ? (
              <img
                src={customLogo}
                alt="Logo MBS"
                className="h-9 sm:h-11 w-auto object-contain shrink-0"
                referrerPolicy="no-referrer"
                id="header-custom-logo"
              />
            ) : (
              <div className="h-9 sm:h-11 w-9 sm:w-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shrink-0 shadow-md">
                <BookOpen className="h-4.5 sm:h-5.5 w-4.5 sm:w-5.5" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h1 className="text-xs sm:text-sm font-black tracking-tight text-slate-100 uppercase truncate">
                {schoolName}
              </h1>
              <p className="text-[9px] sm:text-[10px] text-emerald-400 font-bold uppercase tracking-wider font-mono truncate">
                {appTitle}
              </p>
            </div>
          </div>

          {/* User Status / Logout Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Role Badge */}
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border flex items-center gap-1 ${
              userRole === 'Admin'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-slate-800/40 text-slate-300 border-slate-800'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${userRole === 'Admin' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
              <span className="hidden xs:inline-block">{userRole === 'Admin' ? 'Admin' : 'Guest'}</span>
            </span>

            {/* Theme Toggle */}
            <button
              onClick={handleToggleTheme}
              className="p-1.5 sm:p-2 hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/20 text-slate-400 hover:text-emerald-400 rounded-xl transition-all duration-200 cursor-pointer shrink-0"
              title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
              id="theme-toggle-button"
            >
              {theme === 'dark' ? <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
            </button>

            {/* Admin Login / Logout Trigger */}
            {userRole === 'Admin' ? (
              <button
                onClick={handleLogout}
                className="p-1.5 sm:p-2 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl transition-colors duration-200 cursor-pointer shrink-0"
                title="Keluar Admin"
                id="logout-button"
              >
                <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            ) : (
              <button
                onClick={() => setUserRole(null)}
                className="px-2.5 py-1.5 hover:bg-amber-500/10 border border-slate-800 hover:border-amber-500/20 text-slate-400 hover:text-amber-400 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1 shrink-0"
                title="Masuk sebagai Administrator"
                id="admin-login-button"
              >
                <Lock className="h-3.5 w-3.5 text-amber-500 animate-pulse shrink-0" />
                <span className="text-[10px] font-bold tracking-tight text-slate-300">Admin</span>
              </button>
            )}
          </div>
        </motion.header>

        {/* Tab Content Canvas with animated transitions */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {activeTab === 'dashboard' && (
                <DashboardView
                  alumni={alumni}
                  welcomeTitle={welcomeTitle}
                  welcomeNarrative={welcomeNarrative}
                  masterKampus={masterKampus}
                />
              )}
              
              {activeTab === 'directory' && (
                <AlumniListView
                  alumni={alumni}
                  isAdmin={userRole === 'Admin'}
                  onEdit={triggerEditAlumnus}
                  onDelete={handleDeleteAlumnus}
                  schoolName={schoolName}
                />
              )}

              {activeTab === 'admin-panel' && userRole === 'Admin' && (
                <AdminControls
                  alumni={alumni}
                  onAddAlumnus={handleAddAlumnus}
                  onUpdateAlumnus={handleUpdateAlumnus}
                  onBulkImport={handleBulkImport}
                  onClearAll={handleClearAll}
                  onResetSeeds={handleResetSeeds}
                  editingAlumnus={editingAlumnus}
                  setEditingAlumnus={setEditingAlumnus}
                  sheetUrl={sheetUrl}
                  onSheetUrlChange={handleSheetUrlChange}
                  masterKampusSheetUrl={masterKampusSheetUrl}
                  onMasterKampusSheetUrlChange={handleMasterKampusSheetUrlChange}
                  logo={customLogo}
                  onLogoUpload={handleLogoUpload}
                  onLogoReset={handleLogoReset}
                  schoolName={schoolName}
                  appTitle={appTitle}
                  welcomeTitle={welcomeTitle}
                  welcomeNarrative={welcomeNarrative}
                  footerText={footerText}
                  onUpdateNarrativeSettings={handleUpdateNarrativeSettings}
                  masterKampus={masterKampus}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer info & developer credentials */}
        <footer className="mt-auto pt-8 pb-20 text-center text-[10px] text-slate-600 font-mono tracking-wider">
          <p>{footerText}</p>
          <p className="mt-1 text-slate-400 font-semibold">Developed by Muhamad Ferdian</p>
        </footer>

        {/* Bottom Floating Navigation (First Mobile Native Pattern) */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-slate-900/90 border border-slate-800 backdrop-blur-lg p-1.5 rounded-2xl shadow-2xl flex items-center justify-around z-50">
          {/* Dashboard */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-300 ${
              activeTab === 'dashboard'
                ? 'text-emerald-400 bg-emerald-500/5'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            id="nav-tab-dashboard"
          >
            <LayoutDashboard className="h-4.5 w-4.5 mb-1" />
            <span className="text-[10px] font-bold tracking-tight">Dashboard</span>
          </button>

          {/* Directory */}
          <button
            onClick={() => setActiveTab('directory')}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-300 ${
              activeTab === 'directory'
                ? 'text-emerald-400 bg-emerald-500/5'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            id="nav-tab-directory"
          >
            <Users className="h-4.5 w-4.5 mb-1" />
            <span className="text-[10px] font-bold tracking-tight">Direktori</span>
          </button>

          {/* Admin Panel (Conditionally accessible/visible only to Admin) */}
          {userRole === 'Admin' ? (
            <button
              onClick={() => setActiveTab('admin-panel')}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-300 ${
                activeTab === 'admin-panel'
                  ? 'text-emerald-400 bg-emerald-500/5 font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              id="nav-tab-admin"
            >
              <ShieldAlert className="h-4.5 w-4.5 mb-1 text-amber-500" />
              <span className="text-[10px] font-bold tracking-tight">Kelola Data</span>
            </button>
          ) : (
            <button
              onClick={() => setUserRole(null)}
              className="flex flex-col items-center justify-center py-2 px-3 text-slate-500 hover:text-amber-500 transition-all duration-300 cursor-pointer"
              title="Masuk sebagai Administrator"
              id="nav-tab-admin-login"
            >
              <ShieldCheck className="h-4.5 w-4.5 mb-1 opacity-60" />
              <span className="text-[10px] font-bold tracking-tight">Kelola Data</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
