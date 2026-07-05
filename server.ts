import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { initializeApp as initializeAdminApp } from "firebase-admin/app";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";
import { DEFAULT_ALUMNI } from "./src/data/defaultAlumni";

const ALUMNI_FILE = path.join(process.cwd(), "alumni-db.json");
const SETTINGS_FILE = path.join(process.cwd(), "settings-db.json");
const CONFIG_FILE = path.join(process.cwd(), "firebase-applet-config.json");

let adminDb: any = null;
let useFirebase = false;

// Initialize Firebase Admin SDK in server-side
if (fs.existsSync(CONFIG_FILE)) {
  try {
    const firebaseConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
    if (firebaseConfig.projectId && firebaseConfig.firestoreDatabaseId) {
      const adminApp = initializeAdminApp({
        projectId: firebaseConfig.projectId
      });
      adminDb = getAdminFirestore(adminApp, firebaseConfig.firestoreDatabaseId);
      useFirebase = true;
      console.log("Firebase Admin SDK initialized successfully with database ID: " + firebaseConfig.firestoreDatabaseId);
    }
  } catch (err) {
    console.error("Failed to initialize Firebase Admin SDK in server.ts:", err);
  }
}

// Helper to initialize files if they don't exist
function initDatabase() {
  try {
    if (!fs.existsSync(ALUMNI_FILE)) {
      console.log("Initializing alumni database with default alumni data...");
      fs.writeFileSync(ALUMNI_FILE, JSON.stringify(DEFAULT_ALUMNI, null, 2), "utf-8");
    }
    if (!fs.existsSync(SETTINGS_FILE)) {
      console.log("Initializing settings database...");
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify({ sheetUrl: "", customLogo: null }, null, 2), "utf-8");
    }
  } catch (error) {
    console.error("Failed to initialize JSON databases:", error);
  }
}

initDatabase();

// Firebase persistent sync getters/setters
async function getAlumniFromDb(): Promise<any[]> {
  if (useFirebase && adminDb) {
    try {
      const docRef = adminDb.collection("app_state").doc("alumni");
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        const data = docSnap.data();
        if (data && Array.isArray(data.list)) {
          console.log(`Fetched ${data.list.length} alumni from Firestore.`);
          return data.list;
        }
      } else {
        // First-time setup on Firestore: write the defaults
        let initialData = DEFAULT_ALUMNI;
        if (fs.existsSync(ALUMNI_FILE)) {
          try {
            initialData = JSON.parse(fs.readFileSync(ALUMNI_FILE, "utf-8"));
          } catch (e) {}
        }
        await docRef.set({ list: initialData });
        console.log("Initialized Firestore app_state/alumni with initial data.");
        return initialData;
      }
    } catch (err: any) {
      // In development environment, permission_denied might happen. Keep it clean and readable.
      if (err?.code === 7) {
        console.log("Firestore permission denied (dev environment fallback to local JSON DB).");
      } else {
        console.error("Failed to get alumni from Firestore, using local fallback:", err?.message || err);
      }
    }
  }

  // Local JSON fallback
  try {
    if (fs.existsSync(ALUMNI_FILE)) {
      const fileContent = fs.readFileSync(ALUMNI_FILE, "utf-8");
      return JSON.parse(fileContent);
    }
  } catch (e) {
    console.error("Failed to read local ALUMNI_FILE:", e);
  }
  return DEFAULT_ALUMNI;
}

async function saveAlumniToDb(alumni: any[]): Promise<boolean> {
  // First, save locally
  try {
    fs.writeFileSync(ALUMNI_FILE, JSON.stringify(alumni, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write alumni locally:", err);
  }

  // Then, save to Firestore if enabled
  if (useFirebase && adminDb) {
    try {
      const docRef = adminDb.collection("app_state").doc("alumni");
      await docRef.set({ list: alumni });
      console.log(`Saved ${alumni.length} alumni to Firestore.`);
      return true;
    } catch (err: any) {
      if (err?.code === 7) {
        console.log("Firestore permission denied during save (dev fallback saved locally).");
      } else {
        console.error("Failed to save alumni to Firestore:", err?.message || err);
      }
    }
  }
  return false;
}

async function getSettingsFromDb(): Promise<{
  sheetUrl: string;
  masterKampusSheetUrl: string;
  customLogo: string | null;
  schoolName: string;
  appTitle: string;
  welcomeTitle: string;
  welcomeNarrative: string;
  footerText: string;
  masterKampus: any[];
}> {
  const defaults = {
    sheetUrl: "",
    masterKampusSheetUrl: "",
    customLogo: null as string | null,
    schoolName: "MBS Ki Bagus Hadikusumo",
    appTitle: "Database Sebaran Alumni",
    welcomeTitle: "Assalamu'alaikum Warahmatullahi Wabarakatuh",
    welcomeNarrative: "Selamat datang di Portal Sebaran Alumni MBS Ki Bagus Hadikusumo. Panel ini memetakan perkembangan, studi lanjut, pengabdian, dan kiprah alumni di masyarakat.",
    footerText: "© 2026 MBS Ki Bagus Hadikusumo Alumni Hub",
    masterKampus: [] as any[]
  };

  if (useFirebase && adminDb) {
    try {
      const docRef = adminDb.collection("app_state").doc("settings");
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        const data = docSnap.data();
        return {
          sheetUrl: data?.sheetUrl || defaults.sheetUrl,
          masterKampusSheetUrl: data?.masterKampusSheetUrl || defaults.masterKampusSheetUrl,
          customLogo: data?.customLogo !== undefined ? data.customLogo : defaults.customLogo,
          schoolName: data?.schoolName || defaults.schoolName,
          appTitle: data?.appTitle || defaults.appTitle,
          welcomeTitle: data?.welcomeTitle || defaults.welcomeTitle,
          welcomeNarrative: data?.welcomeNarrative || defaults.welcomeNarrative,
          footerText: data?.footerText || defaults.footerText,
          masterKampus: data?.masterKampus !== undefined ? data.masterKampus : defaults.masterKampus
        };
      } else {
        // Initialize Firestore config document
        let initialSettings = { ...defaults };
        if (fs.existsSync(SETTINGS_FILE)) {
          try {
            const fileContent = fs.readFileSync(SETTINGS_FILE, "utf-8");
            initialSettings = { ...defaults, ...JSON.parse(fileContent) };
          } catch (e) {}
        }
        await docRef.set(initialSettings);
        console.log("Initialized Firestore app_state/settings with initial settings.");
        return initialSettings;
      }
    } catch (err: any) {
      if (err?.code === 7) {
        // Handled silently
      } else {
        console.error("Failed to get settings from Firestore, using local fallback:", err?.message || err);
      }
    }
  }

  // Local JSON fallback
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const fileContent = fs.readFileSync(SETTINGS_FILE, "utf-8");
      const fileData = JSON.parse(fileContent);
      return { ...defaults, ...fileData };
    }
  } catch (e) {
    console.error("Failed to read local SETTINGS_FILE:", e);
  }
  return defaults;
}

async function saveSettingsToDb(settings: {
  sheetUrl?: string;
  masterKampusSheetUrl?: string;
  customLogo?: string | null;
  schoolName?: string;
  appTitle?: string;
  welcomeTitle?: string;
  welcomeNarrative?: string;
  footerText?: string;
  masterKampus?: any[];
}): Promise<any> {
  const defaults = {
    sheetUrl: "",
    masterKampusSheetUrl: "",
    customLogo: null as string | null,
    schoolName: "MBS Ki Bagus Hadikusumo",
    appTitle: "Database Sebaran Alumni",
    welcomeTitle: "Assalamu'alaikum Warahmatullahi Wabarakatuh",
    welcomeNarrative: "Selamat datang di Portal Sebaran Alumni MBS Ki Bagus Hadikusumo. Panel ini memetakan perkembangan, studi lanjut, pengabdian, dan kiprah alumni di masyarakat.",
    footerText: "© 2026 MBS Ki Bagus Hadikusumo Alumni Hub",
    masterKampus: [] as any[]
  };

  let currentSettings = { ...defaults };

  try {
    currentSettings = await getSettingsFromDb();
  } catch (e) {}

  if (settings.sheetUrl !== undefined) {
    currentSettings.sheetUrl = settings.sheetUrl;
  }
  if (settings.masterKampusSheetUrl !== undefined) {
    currentSettings.masterKampusSheetUrl = settings.masterKampusSheetUrl;
  }
  if (settings.customLogo !== undefined) {
    currentSettings.customLogo = settings.customLogo;
  }
  if (settings.schoolName !== undefined) {
    currentSettings.schoolName = settings.schoolName;
  }
  if (settings.appTitle !== undefined) {
    currentSettings.appTitle = settings.appTitle;
  }
  if (settings.welcomeTitle !== undefined) {
    currentSettings.welcomeTitle = settings.welcomeTitle;
  }
  if (settings.welcomeNarrative !== undefined) {
    currentSettings.welcomeNarrative = settings.welcomeNarrative;
  }
  if (settings.footerText !== undefined) {
    currentSettings.footerText = settings.footerText;
  }
  if (settings.masterKampus !== undefined) {
    currentSettings.masterKampus = settings.masterKampus;
  }

  // Save local
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(currentSettings, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save settings locally:", err);
  }

  // Save Firestore
  if (useFirebase && adminDb) {
    try {
      const docRef = adminDb.collection("app_state").doc("settings");
      await docRef.set(currentSettings);
      console.log("Saved settings to Firestore:", currentSettings);
    } catch (err: any) {
      if (err?.code === 7) {
        console.log("Firestore permission denied during save settings.");
      } else {
        console.error("Failed to save settings to Firestore:", err?.message || err);
      }
    }
  }

  return currentSettings;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));

  // API to get all alumni
  app.get("/api/alumni", async (req, res) => {
    try {
      const alumni = await getAlumniFromDb();
      return res.json({ alumni });
    } catch (error: any) {
      console.error("Error reading alumni db:", error);
      res.status(500).json({ error: "Gagal membaca database alumni" });
    }
  });

  // API to save all alumni
  app.post("/api/alumni", async (req, res) => {
    try {
      const { alumni } = req.body;
      if (!Array.isArray(alumni)) {
        return res.status(400).json({ error: "Format data alumni tidak valid" });
      }
      await saveAlumniToDb(alumni);
      res.json({ success: true, count: alumni.length });
    } catch (error: any) {
      console.error("Error writing alumni db:", error);
      res.status(500).json({ error: "Gagal menyimpan database alumni" });
    }
  });

  // API to get settings (sheetUrl and customLogo)
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await getSettingsFromDb();
      return res.json(settings);
    } catch (error: any) {
      console.error("Error reading settings db:", error);
      res.status(500).json({ error: "Gagal membaca database pengaturan" });
    }
  });

  // API to save settings
  app.post("/api/settings", async (req, res) => {
    try {
      const { sheetUrl, masterKampusSheetUrl, customLogo, schoolName, appTitle, welcomeTitle, welcomeNarrative, footerText, masterKampus } = req.body;
      const settings = await saveSettingsToDb({ sheetUrl, masterKampusSheetUrl, customLogo, schoolName, appTitle, welcomeTitle, welcomeNarrative, footerText, masterKampus });
      res.json({ success: true, settings });
    } catch (error: any) {
      console.error("Error writing settings db:", error);
      res.status(500).json({ error: "Gagal menyimpan database pengaturan" });
    }
  });

  // API Route to fetch/proxy google sheets CSV
  app.post("/api/fetch-sheet", async (req, res) => {
    try {
      const { sheetUrl, masterKampusSheetUrl, accessToken } = req.body;
      if (!sheetUrl) {
        return res.status(400).json({ error: "URL Google Sheet tidak boleh kosong" });
      }

      // Convert normal google sheet URL to export-CSV format
      const regex = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
      const match = sheetUrl.match(regex);
      if (!match) {
        return res.status(400).json({ error: "Format URL Google Sheet tidak valid. Pastikan link di-copy dari address bar browser" });
      }

      const sheetId = match[1];
      
      // Also check if user has a specific gid (worksheet)
      let gid = "0";
      const gidRegex = /[#?&]gid=([0-9]+)/;
      const gidMatch = sheetUrl.match(gidRegex);
      if (gidMatch) {
        gid = gidMatch[1];
      }

      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
      
      console.log(`Fetching spreadsheet ID: ${sheetId}, gid: ${gid} ${accessToken ? 'with OAuth token' : 'without token'}`);
      
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      const response = await fetch(csvUrl, { headers });
      if (!response.ok) {
        throw new Error(`Gagal mengambil data dari Google. Status: ${response.status} ${response.statusText}. Pastikan spreadsheet telah diatur publik atau hubungkan akun Google Anda dengan izin akses file.`);
      }

      const csvText = await response.text();

      // Attempt to fetch Master_Kampus sheet
      let masterKampusCsv = "";
      if (masterKampusSheetUrl) {
        const mkMatch = masterKampusSheetUrl.match(regex);
        if (mkMatch) {
          const mkSheetId = mkMatch[1];
          let mkGid = "0";
          const mkGidMatch = masterKampusSheetUrl.match(gidRegex);
          if (mkGidMatch) {
            mkGid = mkGidMatch[1];
          }
          const mkCsvUrl = `https://docs.google.com/spreadsheets/d/${mkSheetId}/export?format=csv&gid=${mkGid}`;
          try {
            console.log(`Fetching Master_Kampus from custom URL ID: ${mkSheetId}, gid: ${mkGid}`);
            const mkResponse = await fetch(mkCsvUrl, { headers });
            if (mkResponse.ok) {
              masterKampusCsv = await mkResponse.text();
              console.log("Successfully fetched Master_Kampus CSV from custom URL");
            } else {
              console.warn(`Failed to fetch custom URL for Master_Kampus. Status: ${mkResponse.status}`);
            }
          } catch (err) {
            console.error("Error fetching Master_Kampus from custom URL:", err);
          }
        }
      } else {
        try {
          const masterUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&sheet=Master_Kampus`;
          const masterResponse = await fetch(masterUrl, { headers });
          if (masterResponse.ok) {
            masterKampusCsv = await masterResponse.text();
            console.log("Successfully fetched Master_Kampus CSV (fallback)");
          }
        } catch (err) {
          console.warn("Failed to fetch Master_Kampus (it might not exist yet):", err);
        }
      }

      res.json({ csvText, masterKampusCsv });
    } catch (error: any) {
      console.error("Error fetching Google Sheet:", error);
      res.status(500).json({ error: error.message || "Gagal menghubungi server Google. Pastikan Sheet Anda telah dibagikan atau hubungkan akun Google dengan izin akses file." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
