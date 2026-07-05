/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Download,
  Upload,
  UserPlus,
  RefreshCw,
  Sliders,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  X,
  FileText,
  Instagram,
  Linkedin,
  Image,
  Camera,
  Link2,
  Unlink,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  GraduationCap
} from 'lucide-react';
import { Alumnus, getDirectImageUrl } from '../types';
import { LIST_ANGKATAN, LIST_STATUS } from '../data/defaultAlumni';
import { googleSignIn, googleSignOut, initAuth } from '../lib/firebaseAuth';
import { MasterKampusItem } from '../data/defaultMasterKampus';

interface AdminControlsProps {
  alumni: Alumnus[];
  onAddAlumnus: (alumnus: Omit<Alumnus, 'id' | 'createdAt'>) => void;
  onUpdateAlumnus: (alumnus: Alumnus) => void;
  onBulkImport: (alumniList: Omit<Alumnus, 'id' | 'createdAt'>[]) => void;
  onClearAll: () => void;
  onResetSeeds: () => void;
  editingAlumnus: Alumnus | null;
  setEditingAlumnus: (alumnus: Alumnus | null) => void;
  sheetUrl: string;
  onSheetUrlChange: (url: string) => void;
  masterKampusSheetUrl: string;
  onMasterKampusSheetUrlChange: (url: string) => void;
  logo: string | null;
  onLogoUpload: (logoBase64: string) => void;
  onLogoReset: () => void;
  schoolName: string;
  appTitle: string;
  welcomeTitle: string;
  welcomeNarrative: string;
  footerText: string;
  onUpdateNarrativeSettings: (updates: {
    schoolName?: string;
    appTitle?: string;
    welcomeTitle?: string;
    welcomeNarrative?: string;
    footerText?: string;
    masterKampus?: MasterKampusItem[];
  }) => Promise<void>;
  masterKampus: MasterKampusItem[];
}

export default function AdminControls({
  alumni,
  onAddAlumnus,
  onUpdateAlumnus,
  onBulkImport,
  onClearAll,
  onResetSeeds,
  editingAlumnus,
  setEditingAlumnus,
  sheetUrl: propSheetUrl,
  onSheetUrlChange,
  masterKampusSheetUrl: propMasterKampusSheetUrl,
  onMasterKampusSheetUrlChange,
  logo,
  onLogoUpload,
  onLogoReset,
  schoolName,
  appTitle,
  welcomeTitle,
  welcomeNarrative,
  footerText,
  onUpdateNarrativeSettings,
  masterKampus,
}: AdminControlsProps) {
  // Narrative custom settings states
  const [inputSchoolName, setInputSchoolName] = useState(schoolName);
  const [inputAppTitle, setInputAppTitle] = useState(appTitle);
  const [inputWelcomeTitle, setInputWelcomeTitle] = useState(welcomeTitle);
  const [inputWelcomeNarrative, setInputWelcomeNarrative] = useState(welcomeNarrative);
  const [inputFooterText, setInputFooterText] = useState(footerText);
  const [isSavingNarrative, setIsSavingNarrative] = useState(false);

  React.useEffect(() => {
    setInputSchoolName(schoolName);
  }, [schoolName]);
  React.useEffect(() => {
    setInputAppTitle(appTitle);
  }, [appTitle]);
  React.useEffect(() => {
    setInputWelcomeTitle(welcomeTitle);
  }, [welcomeTitle]);
  React.useEffect(() => {
    setInputWelcomeNarrative(welcomeNarrative);
  }, [welcomeNarrative]);
  React.useEffect(() => {
    setInputFooterText(footerText);
  }, [footerText]);

  const handleSaveNarratives = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingNarrative(true);
    try {
      await onUpdateNarrativeSettings({
        schoolName: inputSchoolName,
        appTitle: inputAppTitle,
        welcomeTitle: inputWelcomeTitle,
        welcomeNarrative: inputWelcomeNarrative,
        footerText: inputFooterText
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingNarrative(false);
    }
  };

  // Single form states
  const [formName, setFormName] = useState('');
  const [formAngkatan, setFormAngkatan] = useState('Angkatan 1 (2018)');
  const [formGender, setFormGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [formStatus, setFormStatus] = useState<'Kuliah' | 'Bekerja' | 'Wirausaha' | 'Mengabdi' | 'Lainnya'>('Kuliah');
  const [formKampus, setFormKampus] = useState('');
  const [formProdi, setFormProdi] = useState('');
  const [formKota, setFormKota] = useState('');
  const [formKontak, setFormKontak] = useState('');
  const [formFoto, setFormFoto] = useState('');
  const [formFotoKeterangan, setFormFotoKeterangan] = useState('');
  const [formInstagram, setFormInstagram] = useState('');
  const [formLinkedin, setFormLinkedin] = useState('');

  // Extended education fields states
  const [formPendidikanStatus, setFormPendidikanStatus] = useState<'Ongoing' | 'Completed' | ''>('');
  const [formKampus2, setFormKampus2] = useState('');
  const [formProdi2, setFormProdi2] = useState('');
  const [formPendidikanStatus2, setFormPendidikanStatus2] = useState<'Ongoing' | 'Completed' | ''>('');
  const [formKampus3, setFormKampus3] = useState('');
  const [formProdi3, setFormProdi3] = useState('');
  const [formPendidikanStatus3, setFormPendidikanStatus3] = useState<'Ongoing' | 'Completed' | ''>('');
  const [formKategoriKampus, setFormKategoriKampus] = useState<'PTN' | 'PTS' | 'PTLN' | 'PTMA' | ''>('');
  const [formKategoriKampus2, setFormKategoriKampus2] = useState<'PTN' | 'PTS' | 'PTLN' | 'PTMA' | ''>('');
  const [formKategoriKampus3, setFormKategoriKampus3] = useState<'PTN' | 'PTS' | 'PTLN' | 'PTMA' | ''>('');

  // Bulk import states
  const [showImportPanel, setShowImportPanel] = useState(false);
  const [pastedData, setPastedData] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [importLog, setImportLog] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  const [sheetUrl, setSheetUrl] = useState(propSheetUrl || '');
  const [masterKampusSheetUrl, setMasterKampusSheetUrl] = useState(propMasterKampusSheetUrl || '');
  const [logoInputUrl, setLogoInputUrl] = useState(logo && !logo.startsWith('data:') ? logo : '');

  React.useEffect(() => {
    if (propSheetUrl !== undefined) {
      setSheetUrl(propSheetUrl);
    }
  }, [propSheetUrl]);

  React.useEffect(() => {
    if (propMasterKampusSheetUrl !== undefined) {
      setMasterKampusSheetUrl(propMasterKampusSheetUrl);
    }
  }, [propMasterKampusSheetUrl]);

  React.useEffect(() => {
    if (logo && !logo.startsWith('data:')) {
      setLogoInputUrl(logo);
    } else if (!logo) {
      setLogoInputUrl('');
    }
  }, [logo]);

  const [isSyncingSheet, setIsSyncingSheet] = useState(false);
  const [isPushingSheet, setIsPushingSheet] = useState(false);

  // Google Auth & Sheets API States
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);

  // Subscribe to Firebase Auth state for Google account access token
  React.useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Default values for dropdown overrides in bulk import ("import masal per filter dropdown yg pilih")
  const [overrideAngkatan, setOverrideAngkatan] = useState('Default (Sesuai Spreadsheet/CSV)');
  const [overrideGender, setOverrideGender] = useState('Default (Sesuai Spreadsheet/CSV)');
  const [overrideStatus, setOverrideStatus] = useState('Default (Sesuai Spreadsheet/CSV)');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync edit form if alumnus is supplied
  React.useEffect(() => {
    if (editingAlumnus) {
      setFormName(editingAlumnus.name);
      setFormAngkatan(editingAlumnus.angkatan);
      setFormGender(editingAlumnus.gender);
      setFormStatus(editingAlumnus.status);
      setFormKampus(editingAlumnus.kampusInstansi);
      setFormProdi(editingAlumnus.prodiJabatan);
      setFormKota(editingAlumnus.kota);
      setFormKontak(editingAlumnus.kontak || '');
      setFormFoto(editingAlumnus.foto || '');
      setFormFotoKeterangan(editingAlumnus.fotoKeterangan || '');
      setFormInstagram(editingAlumnus.instagram || '');
      setFormLinkedin(editingAlumnus.linkedin || '');
      
      // Extended fields
      setFormPendidikanStatus(editingAlumnus.pendidikanStatus || '');
      setFormKampus2(editingAlumnus.kampusInstansi2 || '');
      setFormProdi2(editingAlumnus.prodiJabatan2 || '');
      setFormPendidikanStatus2(editingAlumnus.pendidikanStatus2 || '');
      setFormKampus3(editingAlumnus.kampusInstansi3 || '');
      setFormProdi3(editingAlumnus.prodiJabatan3 || '');
      setFormPendidikanStatus3(editingAlumnus.pendidikanStatus3 || '');
      setFormKategoriKampus(editingAlumnus.kategoriKampus || '');
      setFormKategoriKampus2(editingAlumnus.kategoriKampus2 || '');
      setFormKategoriKampus3(editingAlumnus.kategoriKampus3 || '');
    } else {
      resetForm();
    }
  }, [editingAlumnus]);

  const resetForm = () => {
    setFormName('');
    setFormAngkatan('Angkatan 1 (2018)');
    setFormGender('Laki-laki');
    setFormStatus('Kuliah');
    setFormKampus('');
    setFormProdi('');
    setFormKota('');
    setFormKontak('');
    setFormFoto('');
    setFormFotoKeterangan('');
    setFormInstagram('');
    setFormLinkedin('');
    
    // Extended fields
    setFormPendidikanStatus('');
    setFormKampus2('');
    setFormProdi2('');
    setFormPendidikanStatus2('');
    setFormKampus3('');
    setFormProdi3('');
    setFormPendidikanStatus3('');
    setFormKategoriKampus('');
    setFormKategoriKampus2('');
    setFormKategoriKampus3('');
    setEditingAlumnus(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    // Derive graduation year from selected Angkatan name
    const yearMatch = formAngkatan.match(/\d{4}/);
    const tahunLulus = yearMatch ? parseInt(yearMatch[0], 10) : 2026;

    const data = {
      name: formName.trim(),
      angkatan: formAngkatan,
      tahunLulus,
      gender: formGender,
      status: formStatus,
      kampusInstansi: formKampus.trim(),
      prodiJabatan: formProdi.trim(),
      kota: formKota.trim(),
      kontak: formKontak.trim(),
      foto: formFoto.trim(),
      fotoKeterangan: formFotoKeterangan.trim(),
      instagram: formInstagram.trim(),
      linkedin: formLinkedin.trim(),
      
      // Extended fields
      pendidikanStatus: formPendidikanStatus,
      kampusInstansi2: formKampus2.trim(),
      prodiJabatan2: formProdi2.trim(),
      pendidikanStatus2: formPendidikanStatus2,
      kampusInstansi3: formKampus3.trim(),
      prodiJabatan3: formProdi3.trim(),
      pendidikanStatus3: formPendidikanStatus3,
      kategoriKampus: formKategoriKampus,
      kategoriKampus2: formKategoriKampus2,
      kategoriKampus3: formKategoriKampus3,
    };

    if (editingAlumnus) {
      onUpdateAlumnus({
        ...editingAlumnus,
        ...data,
      });
      setImportLog({ type: 'success', message: `Berhasil memperbarui data: ${formName}` });
    } else {
      onAddAlumnus(data);
      setImportLog({ type: 'success', message: `Berhasil menambahkan alumni baru: ${formName}` });
    }
    resetForm();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Google Sign-In helper
  const handleConnectGoogle = async () => {
    try {
      setImportLog(null);
      const res = await googleSignIn();
      if (res) {
        setImportLog({
          type: 'success',
          message: `Berhasil menghubungkan Google: ${res.user.displayName || res.user.email}`
        });
      }
    } catch (err: any) {
      setImportLog({ type: 'error', message: `Gagal menghubungkan Google: ${err.message || err}` });
    }
  };

  // Google Sign-Out helper
  const handleDisconnectGoogle = async () => {
    try {
      setImportLog(null);
      await googleSignOut();
      setImportLog({ type: 'success', message: 'Koneksi akun Google berhasil diputus.' });
    } catch (err: any) {
      setImportLog({ type: 'error', message: `Gagal memutuskan koneksi Google: ${err.message || err}` });
    }
  };

  // Sync Google Sheet by URL via backend proxy (uses user access token if connected for private sheets)
  const handleSyncGoogleSheet = async () => {
    if (!sheetUrl.trim()) {
      setImportLog({ type: 'error', message: 'Silakan masukkan URL Google Sheet terlebih dahulu!' });
      return;
    }

    onSheetUrlChange(sheetUrl);
    if (onMasterKampusSheetUrlChange) {
      onMasterKampusSheetUrlChange(masterKampusSheetUrl);
    }

    setIsSyncingSheet(true);
    setImportLog(null);

    try {
      const response = await fetch('/api/fetch-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetUrl, masterKampusSheetUrl, accessToken: googleToken })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengambil data Google Sheet. Pastikan link sudah publik atau Anda telah menghubungkan akun Google.');
      }

      if (data.csvText) {
        processCSVRawText(data.csvText);
      } else {
        throw new Error('Server mengembalikan data kosong.');
      }

      // Automatically sync Master_Kampus if returned by server
      if (data.masterKampusCsv) {
        try {
          const mkLines = data.masterKampusCsv.split(/\r?\n/);
          const parsedMaster: MasterKampusItem[] = [];
          
          let colUrutan = 0;
          let colNama = 1;
          let colKat = 2;
          
          if (mkLines.length > 0) {
            const firstLine = mkLines[0].toLowerCase();
            const delimiter = firstLine.includes('\t') ? '\t' : ',';
            const headers = firstLine.split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
            
            headers.forEach((h, idx) => {
              if (h.includes('kategori')) colKat = idx;
              else if (h.includes('urutan')) colUrutan = idx;
              else if (h.includes('nama') || h.includes('kampus') || h.includes('instansi')) colNama = idx;
            });

            console.log(`[Master_Kampus Sync] Detected columns - Nama: ${colNama}, Urutan: ${colUrutan}, Kategori: ${colKat}`);
            
            for (let i = 1; i < mkLines.length; i++) {
              const line = mkLines[i].trim();
              if (!line) continue;
              
              let parts: string[] = [];
              let insideQuote = false;
              let entry = '';
              for (let charIndex = 0; charIndex < line.length; charIndex++) {
                const char = line[charIndex];
                if (char === '"') {
                  insideQuote = !insideQuote;
                } else if (char === delimiter && !insideQuote) {
                  parts.push(entry.trim().replace(/^"|"$/g, ''));
                  entry = '';
                } else {
                  entry += char;
                }
              }
              parts.push(entry.trim().replace(/^"|"$/g, ''));
              
              if (parts.length > Math.max(colUrutan, colNama, colKat)) {
                const urutanRaw = parts[colUrutan];
                const namaKampus = parts[colNama];
                const kategoriRaw = parts[colKat];
                
                if (namaKampus && namaKampus.trim() !== '') {
                  let mappedKategori: any = (kategoriRaw || '').trim();
                  const katUpper = mappedKategori.toUpperCase();
                  if (katUpper === 'PTN') mappedKategori = 'PTN';
                  else if (katUpper === 'PTS') mappedKategori = 'PTS';
                  else if (katUpper === 'PTLN') mappedKategori = 'PTLN';
                  else if (katUpper === 'PTMA' || katUpper === 'PTM') mappedKategori = 'PTMA';
                  else if (katUpper === 'KEDINASAN') mappedKategori = 'Kedinasan';
                  else mappedKategori = 'PTS'; // fallback
                  
                  parsedMaster.push({
                    Urutan: parseInt(urutanRaw, 10) || i,
                    Nama_Kampus: namaKampus.trim(),
                    Kategori_Kampus: mappedKategori
                  });
                }
              }
            }
            console.log(`[Master_Kampus Sync] Parsed ${parsedMaster.length} campus items successfully.`, parsedMaster.slice(0, 5));
          }
          
          if (parsedMaster.length > 0) {
            await onUpdateNarrativeSettings({ masterKampus: parsedMaster });
            setImportLog(prev => ({
              type: 'success',
              message: prev && prev.type === 'success' 
                ? `${prev.message} Serta berhasil memperbarui ${parsedMaster.length} daftar Master_Kampus!`
                : `Berhasil menyinkronkan data alumni & ${parsedMaster.length} daftar Master_Kampus!`
            }));
          }
        } catch (mkErr: any) {
          console.error("Gagal memproses Master_Kampus sheet:", mkErr);
        }
      }
    } catch (err: any) {
      setImportLog({ type: 'error', message: err.message || 'Gagal sinkronisasi Google Sheet' });
    } finally {
      setIsSyncingSheet(false);
    }
  };

  // Push current app database to the connected Google Sheet
  const handlePushToGoogleSheet = async () => {
    if (!sheetUrl.trim()) {
      setImportLog({ type: 'error', message: 'Silakan masukkan URL Google Sheet terlebih dahulu!' });
      return;
    }
    if (!googleToken) {
      setImportLog({ type: 'error', message: 'Silakan hubungkan akun Google Anda terlebih dahulu di bawah!' });
      return;
    }

    const confirmPush = window.confirm(
      `Apakah Anda yakin ingin mengirim ${alumni.length} data alumni dari aplikasi ke Google Sheet Anda? Ini akan menggantikan isi spreadsheet terpilih.`
    );
    if (!confirmPush) return;

    setIsPushingSheet(true);
    setImportLog(null);

    try {
      // Extract spreadsheet ID from URL
      const regex = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
      const match = sheetUrl.match(regex);
      if (!match) {
        throw new Error('Format URL Google Sheet tidak valid. Pastikan link di-copy dari address bar browser.');
      }
      const spreadsheetId = match[1];

      // Get sheet gid/name if specified
      let gid = '0';
      const gidRegex = /[#?&]gid=([0-9]+)/;
      const gidMatch = sheetUrl.match(gidRegex);
      if (gidMatch) {
        gid = gidMatch[1];
      }

      // 1. Get sheet title by gid using Sheets metadata API
      let sheetName = 'Sheet1';
      try {
        const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
          headers: { Authorization: `Bearer ${googleToken}` }
        });
        if (metaRes.ok) {
          const meta = await metaRes.json();
          const targetSheet = meta.sheets?.find((s: any) => String(s.properties?.sheetId) === gid);
          if (targetSheet) {
            sheetName = targetSheet.properties.title;
          } else if (meta.sheets?.[0]) {
            sheetName = meta.sheets[0].properties.title;
          }
        }
      } catch (e) {
        console.warn('Failed to retrieve sheet name dynamically, defaulting to Sheet1:', e);
      }

      // 2. Format values
      const values = [
        [
          'Nama',
          'Angkatan',
          'Gender',
          'Status',
          'Kampus_Instansi',
          'Jurusan_Pekerjaan',
          'Kota',
          'Kontak_Utama',
          'Foto',
          'Foto_Keterangan',
          'Instagram',
          'LinkedIn',
          'Pendidikan_Status',
          'Kampus_Instansi_2',
          'Jurusan_Pekerjaan_2',
          'Pendidikan_Status_2',
          'Kampus_Instansi_3',
          'Jurusan_Pekerjaan_3',
          'Pendidikan_Status_3'
        ],
        ...alumni.map((a) => [
          a.name || '',
          a.angkatan || '',
          a.gender || '',
          a.status || '',
          a.kampusInstansi || '',
          a.prodiJabatan || '',
          a.kota || '',
          a.kontak || '',
          a.foto || '',
          a.fotoKeterangan || '',
          a.instagram || '',
          a.linkedin || '',
          a.pendidikanStatus || '',
          a.kampusInstansi2 || '',
          a.prodiJabatan2 || '',
          a.pendidikanStatus2 || '',
          a.kampusInstansi3 || '',
          a.prodiJabatan3 || '',
          a.pendidikanStatus3 || ''
        ])
      ];

      // 3. Clear range first to prevent trailing old data (up to S columns)
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${encodeURIComponent(sheetName)}'!A1:S5000:clear`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${googleToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // 4. Update values (up to S columns)
      const updateResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${encodeURIComponent(
          sheetName
        )}'!A1:S${values.length}?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${googleToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ values })
        }
      );

      if (!updateResponse.ok) {
        const errData = await updateResponse.json();
        throw new Error(errData.error?.message || 'Gagal mengirim data ke Google Sheets API.');
      }

      setImportLog({
        type: 'success',
        message: `Sukses mengekspor & menyinkronkan ${alumni.length} data alumni ke Google Sheet (Tab: "${sheetName}")!`
      });
    } catch (err: any) {
      console.error('Error pushing to sheet:', err);
      setImportLog({ type: 'error', message: err.message || 'Gagal mengirim data ke Google Sheet.' });
    } finally {
      setIsPushingSheet(false);
    }
  };

  // Mass Export to CSV
  const handleExportCSV = () => {
    if (alumni.length === 0) {
      alert('Tidak ada data untuk diekspor!');
      return;
    }

    const headers = [
      'Nama', 
      'Angkatan', 
      'Gender', 
      'Status', 
      'Kampus_Instansi', 
      'Jurusan_Pekerjaan', 
      'Kota', 
      'Kontak_Utama',
      'Foto',
      'Foto_Keterangan',
      'Instagram',
      'LinkedIn',
      'Pendidikan_Status',
      'Kampus_Instansi_2',
      'Jurusan_Pekerjaan_2',
      'Pendidikan_Status_2',
      'Kampus_Instansi_3',
      'Jurusan_Pekerjaan_3',
      'Pendidikan_Status_3',
      'Kategori_Kampus',
      'Kategori_Kampus_2',
      'Kategori_Kampus_3'
    ];
    
    const rows = alumni.map((a) => [
      a.name.replace(/"/g, '""'),
      a.angkatan.replace(/"/g, '""'),
      a.gender,
      a.status,
      a.kampusInstansi.replace(/"/g, '""'),
      a.prodiJabatan.replace(/"/g, '""'),
      a.kota.replace(/"/g, '""'),
      (a.kontak || '').replace(/"/g, '""'),
      (a.foto || '').replace(/"/g, '""'),
      (a.fotoKeterangan || '').replace(/"/g, '""'),
      (a.instagram || '').replace(/"/g, '""'),
      (a.linkedin || '').replace(/"/g, '""'),
      (a.pendidikanStatus || '').replace(/"/g, '""'),
      (a.kampusInstansi2 || '').replace(/"/g, '""'),
      (a.prodiJabatan2 || '').replace(/"/g, '""'),
      (a.pendidikanStatus2 || '').replace(/"/g, '""'),
      (a.kampusInstansi3 || '').replace(/"/g, '""'),
      (a.prodiJabatan3 || '').replace(/"/g, '""'),
      (a.pendidikanStatus3 || '').replace(/"/g, '""'),
      a.kategoriKampus || '',
      a.kategoriKampus2 || '',
      a.kategoriKampus3 || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'sebaran_alumni_mbs.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Process text or file CSV parser
  const processCSVRawText = (text: string) => {
    if (!text.trim()) {
      setImportLog({ type: 'error', message: 'Teks CSV/Spreadsheet kosong!' });
      return;
    }

    try {
      const lines = text.split(/\r?\n/);
      const parsedAlumni: Omit<Alumnus, 'id' | 'createdAt'>[] = [];
      let skippedCount = 0;

      // Check if first line contains headers (e.g. name or nama)
      const firstLineLower = lines[0].toLowerCase();
      const hasHeaders = firstLineLower.includes('nama') || firstLineLower.includes('name') || firstLineLower.includes('angkatan');
      const startIndex = hasHeaders ? 1 : 0;

      let colIndices = {
        name: 0,
        angkatan: 1,
        gender: 2,
        status: 3,
        kampusInstansi: 4,
        prodiJabatan: 5,
        kota: 6,
        kontak: 7,
        foto: 8,
        fotoKeterangan: 9,
        instagram: 10,
        linkedin: 11,
        pendidikanStatus: -1,
        kampusInstansi2: -1,
        prodiJabatan2: -1,
        pendidikanStatus2: -1,
        kampusInstansi3: -1,
        prodiJabatan3: -1,
        pendidikanStatus3: -1,
        kategoriKampus: -1,
        kategoriKampus2: -1,
        kategoriKampus3: -1,
      };

      if (hasHeaders) {
        // Split headers line using the delimiter of the first line
        const headerLine = lines[0];
        const delimiter = headerLine.includes('\t') ? '\t' : ',';
        const headers: string[] = [];
        let insideQuote = false;
        let entry = '';
        for (let charIndex = 0; charIndex < headerLine.length; charIndex++) {
          const char = headerLine[charIndex];
          if (char === '"') {
            insideQuote = !insideQuote;
          } else if (char === delimiter && !insideQuote) {
            headers.push(entry.trim().toLowerCase().replace(/^"|"$/g, ''));
            entry = '';
          } else {
            entry += char;
          }
        }
        headers.push(entry.trim().toLowerCase().replace(/^"|"$/g, ''));

        // Map column indices with extremely robust clean normalisation
        headers.forEach((rawHeader, idx) => {
          const header = rawHeader.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
          
          if (header === 'nama' || header === 'name') {
            colIndices.name = idx;
          } else if (header === 'angkatan') {
            colIndices.angkatan = idx;
          } else if (header.includes('gender') || header.includes('kelamin') || header === 'jeniskelamin') {
            colIndices.gender = idx;
          } else if (header === 'status') {
            colIndices.status = idx;
          } else if (header === 'kampusinstansi' || header === 'kampus' || header === 'instansi' || header === 'institusi' || header === 'kampusorinstansi') {
            colIndices.kampusInstansi = idx;
          } else if (header === 'jurusanpekerjaan' || header === 'prodi' || header === 'jurusan' || header === 'pekerjaan' || header === 'prodijabatan' || header === 'jabatan' || header === 'prodiataujabatan') {
            colIndices.prodiJabatan = idx;
          } else if (header === 'kota') {
            colIndices.kota = idx;
          } else if (header === 'kontak' || header.includes('kontak') || header.includes('hp') || header.includes('telp') || header === 'nohp' || header === 'telepon') {
            colIndices.kontak = idx;
          } else if (header === 'urlfoto' || header === 'foto' || header === 'linkfoto') {
            colIndices.foto = idx;
          } else if (header === 'keteranganfoto' || header === 'fotoketerangan') {
            colIndices.fotoKeterangan = idx;
          } else if (header === 'sosmed' || header === 'instagram' || header === 'instagramuser' || header === 'usernameinstagram') {
            colIndices.instagram = idx;
          } else if (header === 'linkedinurl' || header === 'linkedin' || header === 'profilelinkedin') {
            colIndices.linkedin = idx;
          }
          
          // New education fields - Option 1 status
          else if (header === 'pendidikanstatus' || header === 'statuspendidikan' || header === 'statuspendidikan1' || header === 'pendidikanstatus1') {
            colIndices.pendidikanStatus = idx;
          }
          // Option 2
          else if (header === 'kampusinstansi2' || header === 'kampus2' || header === 'instansi2' || header === 'institusi2') {
            colIndices.kampusInstansi2 = idx;
          } else if (header === 'jurusanpekerjaan2' || header === 'prodi2' || header === 'jurusan2' || header === 'prodijabatan2' || header === 'jabatan2' || header === 'pekerjaan2') {
            colIndices.prodiJabatan2 = idx;
          } else if (header === 'pendidikanstatus2' || header === 'statuspendidikan2') {
            colIndices.pendidikanStatus2 = idx;
          }
          // Option 3
          else if (header === 'kampusinstansi3' || header === 'kampus3' || header === 'instansi3' || header === 'institusi3') {
            colIndices.kampusInstansi3 = idx;
          } else if (header === 'jurusanpekerjaan3' || header === 'prodi3' || header === 'jurusan3' || header === 'prodijabatan3' || header === 'jabatan3' || header === 'pekerjaan3') {
            colIndices.prodiJabatan3 = idx;
          } else if (header === 'pendidikanstatus3' || header === 'statuspendidikan3') {
            colIndices.pendidikanStatus3 = idx;
          }
          // Kategori Kampus
          else if (header === 'kategorikampus' || header === 'kategorikampus1' || header === 'kampuskategori' || header === 'kategorikampusinstansi') {
            colIndices.kategoriKampus = idx;
          }
          else if (header === 'kategorikampus2' || header === 'kampuskategori2' || header === 'kategorikampusinstansi2') {
            colIndices.kategoriKampus2 = idx;
          }
          else if (header === 'kategorikampus3' || header === 'kampuskategori3' || header === 'kategorikampusinstansi3') {
            colIndices.kategoriKampus3 = idx;
          }
        });
      }

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Split by comma or tab (Excel copy-paste uses tabs)
        const delimiter = line.includes('\t') ? '\t' : ',';
        
        // Custom simple CSV splitter that respects quotes
        let parts: string[] = [];
        let insideQuote = false;
        let entry = '';
        
        for (let charIndex = 0; charIndex < line.length; charIndex++) {
          const char = line[charIndex];
          if (char === '"') {
            insideQuote = !insideQuote;
          } else if (char === delimiter && !insideQuote) {
            parts.push(entry.trim().replace(/^"|"$/g, ''));
            entry = '';
          } else {
            entry += char;
          }
        }
        parts.push(entry.trim().replace(/^"|"$/g, ''));

        // Basic clean parts
        const name = parts[colIndices.name];
        if (!name) {
          skippedCount++;
          continue;
        }

        // Apply fallback overrides selected in the import dropdown panel
        const rawAngkatan = parts[colIndices.angkatan] || '';
        let finalAngkatan = '';
        if (overrideAngkatan !== 'Default (Sesuai Spreadsheet/CSV)') {
          finalAngkatan = overrideAngkatan;
        } else {
          finalAngkatan = rawAngkatan || 'Angkatan 1 (2018)';
        }

        const rawGender = parts[colIndices.gender] || '';
        let finalGender: 'Laki-laki' | 'Perempuan' = 'Laki-laki';
        if (overrideGender !== 'Default (Sesuai Spreadsheet/CSV)') {
          finalGender = overrideGender as 'Laki-laki' | 'Perempuan';
        } else {
          const checkGen = rawGender.toLowerCase();
          if (checkGen.includes('p') || checkGen.includes('fem') || checkGen.includes('cew') || checkGen.includes('wanita') || checkGen === 'perempuan') {
            finalGender = 'Perempuan';
          } else {
            finalGender = 'Laki-laki';
          }
        }

        const rawStatus = parts[colIndices.status] || '';
        let finalStatus: 'Kuliah' | 'Bekerja' | 'Wirausaha' | 'Mengabdi' | 'Lainnya' = 'Kuliah';
        if (overrideStatus !== 'Default (Sesuai Spreadsheet/CSV)') {
          finalStatus = overrideStatus as any;
        } else {
          const checkSt = rawStatus.toLowerCase();
          if (checkSt.includes('kuliah') || checkSt.includes('studi') || checkSt.includes('mahasiswa')) {
            finalStatus = 'Kuliah';
          } else if (checkSt.includes('kerja') || checkSt.includes('karyawan') || checkSt.includes('pegawai')) {
            finalStatus = 'Bekerja';
          } else if (checkSt.includes('usaha') || checkSt.includes('wira') || checkSt.includes('bisnis')) {
            finalStatus = 'Wirausaha';
          } else if (checkSt.includes('abdi') || checkSt.includes('ustadz') || checkSt.includes('gabd') || checkSt.includes('mengabdi')) {
            finalStatus = 'Mengabdi';
          } else {
            finalStatus = 'Lainnya';
          }
        }

        const kampusInstansi = parts[colIndices.kampusInstansi] || '';
        const prodiJabatan = parts[colIndices.prodiJabatan] || '';
        const kota = parts[colIndices.kota] || 'Yogyakarta';
        const kontak = parts[colIndices.kontak] || '';
        const foto = parts[colIndices.foto] || '';
        const fotoKeterangan = colIndices.fotoKeterangan !== -1 ? (parts[colIndices.fotoKeterangan] || '') : '';
        const instagram = parts[colIndices.instagram] || '';
        const linkedin = parts[colIndices.linkedin] || '';

        // Extended fields mapping
        const rawPendidikanStatus = colIndices.pendidikanStatus !== -1 ? (parts[colIndices.pendidikanStatus] || '') : '';
        let pendidikanStatus: 'Ongoing' | 'Completed' | '' = '';
        if (rawPendidikanStatus.toLowerCase().includes('ongoing') || rawPendidikanStatus.toLowerCase().includes('jalan') || rawPendidikanStatus.toLowerCase().includes('aktif')) {
          pendidikanStatus = 'Ongoing';
        } else if (rawPendidikanStatus.toLowerCase().includes('complete') || rawPendidikanStatus.toLowerCase().includes('selesai') || rawPendidikanStatus.toLowerCase().includes('lulus')) {
          pendidikanStatus = 'Completed';
        }

        const kampusInstansi2 = colIndices.kampusInstansi2 !== -1 ? (parts[colIndices.kampusInstansi2] || '') : '';
        const prodiJabatan2 = colIndices.prodiJabatan2 !== -1 ? (parts[colIndices.prodiJabatan2] || '') : '';
        
        const rawPendidikanStatus2 = colIndices.pendidikanStatus2 !== -1 ? (parts[colIndices.pendidikanStatus2] || '') : '';
        let pendidikanStatus2: 'Ongoing' | 'Completed' | '' = '';
        if (rawPendidikanStatus2.toLowerCase().includes('ongoing') || rawPendidikanStatus2.toLowerCase().includes('jalan') || rawPendidikanStatus2.toLowerCase().includes('aktif')) {
          pendidikanStatus2 = 'Ongoing';
        } else if (rawPendidikanStatus2.toLowerCase().includes('complete') || rawPendidikanStatus2.toLowerCase().includes('selesai') || rawPendidikanStatus2.toLowerCase().includes('lulus')) {
          pendidikanStatus2 = 'Completed';
        }

        const kampusInstansi3 = colIndices.kampusInstansi3 !== -1 ? (parts[colIndices.kampusInstansi3] || '') : '';
        const prodiJabatan3 = colIndices.prodiJabatan3 !== -1 ? (parts[colIndices.prodiJabatan3] || '') : '';
        
        const rawPendidikanStatus3 = colIndices.pendidikanStatus3 !== -1 ? (parts[colIndices.pendidikanStatus3] || '') : '';
        let pendidikanStatus3: 'Ongoing' | 'Completed' | '' = '';
        if (rawPendidikanStatus3.toLowerCase().includes('ongoing') || rawPendidikanStatus3.toLowerCase().includes('jalan') || rawPendidikanStatus3.toLowerCase().includes('aktif')) {
          pendidikanStatus3 = 'Ongoing';
        } else if (rawPendidikanStatus3.toLowerCase().includes('complete') || rawPendidikanStatus3.toLowerCase().includes('selesai') || rawPendidikanStatus3.toLowerCase().includes('lulus')) {
          pendidikanStatus3 = 'Completed';
        }

        const rawKategoriKampus = colIndices.kategoriKampus !== -1 ? (parts[colIndices.kategoriKampus] || '') : '';
        const rawKategoriKampus2 = colIndices.kategoriKampus2 !== -1 ? (parts[colIndices.kategoriKampus2] || '') : '';
        const rawKategoriKampus3 = colIndices.kategoriKampus3 !== -1 ? (parts[colIndices.kategoriKampus3] || '') : '';

        const cleanKategori = (val: string): 'PTN' | 'PTS' | 'PTLN' | 'PTMA' | 'Kedinasan' | '' => {
          const u = val.trim().toUpperCase();
          if (u === 'PTN' || u === 'PTS' || u === 'PTLN' || u === 'PTMA') return u as any;
          if (u === 'KEDINASAN') return 'Kedinasan';
          return '';
        };

        const kategoriKampus = cleanKategori(rawKategoriKampus);
        const kategoriKampus2 = cleanKategori(rawKategoriKampus2);
        const kategoriKampus3 = cleanKategori(rawKategoriKampus3);

        const yearMatch = finalAngkatan.match(/\d{4}/);
        const tahunLulus = yearMatch ? parseInt(yearMatch[0], 10) : 2026;

        parsedAlumni.push({
          name,
          angkatan: finalAngkatan,
          tahunLulus,
          gender: finalGender,
          status: finalStatus,
          kampusInstansi,
          prodiJabatan,
          kota,
          kontak,
          foto: foto ? foto.trim() : undefined,
          fotoKeterangan: fotoKeterangan ? fotoKeterangan.trim() : undefined,
          instagram: instagram ? instagram.trim() : undefined,
          linkedin: linkedin ? linkedin.trim() : undefined,
          
          pendidikanStatus,
          kampusInstansi2,
          prodiJabatan2,
          pendidikanStatus2,
          kampusInstansi3,
          prodiJabatan3,
          pendidikanStatus3,
          kategoriKampus,
          kategoriKampus2,
          kategoriKampus3
        });
      }

      if (parsedAlumni.length > 0) {
        onBulkImport(parsedAlumni);
        setImportLog({
          type: 'success',
          message: `Sukses mengimpor ${parsedAlumni.length} data alumni! ${skippedCount ? `(Dilewati: ${skippedCount})` : ''}`,
        });
        setPastedData('');
        setShowImportPanel(false);
      } else {
        setImportLog({ type: 'error', message: 'Tidak ada baris data valid yang berhasil diproses. Periksa baris data Anda.' });
      }
    } catch (err) {
      setImportLog({ type: 'error', message: `Gagal mengurai spreadsheet: ${(err as Error).message}` });
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      parseCSVFile(file);
    }
  };

  const parseCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processCSVRawText(text);
    };
    reader.readAsText(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      parseCSVFile(file);
    }
  };

  return (
    <div className="space-y-6 pb-24" id="admin-panel-section">
      {/* Action Logs Alert */}
      {importLog && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl text-xs flex items-start gap-2.5 shadow border ${
            importLog.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}
        >
          {importLog.type === 'success' ? (
            <CheckCircle className="h-4.5 w-4.5 shrink-0" />
          ) : (
            <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
          )}
          <div className="flex-1">
            <p className="font-semibold">{importLog.type === 'success' ? 'Sukses' : 'Kesalahan'}</p>
            <p className="mt-0.5">{importLog.message}</p>
          </div>
          <button onClick={() => setImportLog(null)} className="text-slate-400 hover:text-white shrink-0">
            ×
          </button>
        </motion.div>
      )}

      {/* Main Grid: Form and Spreadsheet/Mass Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Add/Edit Single Alumnus (Span 7) */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-850 backdrop-blur rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-850 pb-3">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">
                {editingAlumnus ? 'Edit Data Alumni' : 'Tambah Alumni Individu'}
              </h3>
            </div>
            {editingAlumnus && (
              <button
                onClick={resetForm}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium px-2 py-1 rounded bg-rose-500/10 border border-rose-500/10"
              >
                Batal Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Nama Lengkap Santri
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Contoh: Muhammad Ferdian"
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-xl py-2.5 px-3 text-xs outline-none transition-all duration-200"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Angkatan */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Angkatan (Lulus)
                </label>
                <select
                  value={formAngkatan}
                  onChange={(e) => setFormAngkatan(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs rounded-xl py-2.5 px-3 appearance-none focus:border-emerald-500 outline-none transition-all duration-200"
                >
                  {LIST_ANGKATAN.map((opt) => (
                    <option key={opt.name} value={opt.name}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gender */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormGender('Laki-laki')}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all ${
                      formGender === 'Laki-laki'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    ♂ Laki-laki
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormGender('Perempuan')}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all ${
                      formGender === 'Perempuan'
                        ? 'bg-pink-600/20 border-pink-500 text-pink-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    ♀ Perempuan
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Status */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Aktivitas Utama saat Ini
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs rounded-xl py-2.5 px-3 appearance-none focus:border-emerald-500 outline-none transition-all duration-200"
                >
                  {LIST_STATUS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Kota */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Kota Domisili Sekarang
                </label>
                <input
                  type="text"
                  value={formKota}
                  onChange={(e) => setFormKota(e.target.value)}
                  placeholder="Contoh: Yogyakarta, Jakarta"
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-xl py-2.5 px-3 text-xs outline-none transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Kampus, Prodi, & Status Pendidikan (Maksimal 3 Pilihan) */}
            <div className="space-y-4 border border-slate-800 bg-slate-950/40 p-4 rounded-2xl">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Data Riwayat Pendidikan & Pekerjaan (Maks. 3)
              </h4>

              {/* Opsi 1: Pendidikan Utama */}
              <div className="space-y-3 p-3 bg-slate-950/60 border border-slate-900 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Opsi 1 (Utama)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400 block">Kampus / Instansi</label>
                    <input
                      type="text"
                      value={formKampus}
                      onChange={(e) => setFormKampus(e.target.value)}
                      placeholder="Contoh: Universitas Gadjah Mada"
                      className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg py-2 px-2.5 text-xs outline-none transition-all duration-200"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400 block">Jurusan / Jabatan</label>
                    <input
                      type="text"
                      value={formProdi}
                      onChange={(e) => setFormProdi(e.target.value)}
                      placeholder="Contoh: Teknik Informatika"
                      className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg py-2 px-2.5 text-xs outline-none transition-all duration-200"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400 block">Status Pendidikan</label>
                    <select
                      value={formPendidikanStatus}
                      onChange={(e) => setFormPendidikanStatus(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs rounded-lg py-2 px-2.5 outline-none transition-all duration-200"
                    >
                      <option value="">Belum Ditentukan / Tidak Ada</option>
                      <option value="Ongoing">Ongoing (Sedang Berjalan)</option>
                      <option value="Completed">Completed (Selesai / Lulus)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400 block">Kategori Kampus (PTN/PTS/PTLN/PTMA)</label>
                    <select
                      value={formKategoriKampus}
                      onChange={(e) => setFormKategoriKampus(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs rounded-lg py-2 px-2.5 outline-none transition-all duration-200"
                    >
                      <option value="">Deteksi Otomatis (Default)</option>
                      <option value="PTN">PTN (Perguruan Tinggi Negeri)</option>
                      <option value="PTS">PTS (Perguruan Tinggi Swasta)</option>
                      <option value="PTLN">PTLN (Luar Negeri)</option>
                      <option value="PTMA">PTMA (Muhammadiyah / 'Aisyiyah)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Opsi 2: Pendidikan Tambahan */}
              <div className="space-y-3 p-3 bg-slate-950/60 border border-slate-900 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Opsi 2 (Tambahan - Opsional)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400 block">Kampus / Instansi 2</label>
                    <input
                      type="text"
                      value={formKampus2}
                      onChange={(e) => setFormKampus2(e.target.value)}
                      placeholder="Contoh: Universitas Muhammadiyah Yogyakarta"
                      className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg py-2 px-2.5 text-xs outline-none transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400 block">Jurusan / Jabatan 2</label>
                    <input
                      type="text"
                      value={formProdi2}
                      onChange={(e) => setFormProdi2(e.target.value)}
                      placeholder="Contoh: Magister Hubungan Internasional"
                      className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg py-2 px-2.5 text-xs outline-none transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400 block">Status Pendidikan 2</label>
                    <select
                      value={formPendidikanStatus2}
                      onChange={(e) => setFormPendidikanStatus2(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs rounded-lg py-2 px-2.5 outline-none transition-all duration-200"
                    >
                      <option value="">Belum Ditentukan / Tidak Ada</option>
                      <option value="Ongoing">Ongoing (Sedang Berjalan)</option>
                      <option value="Completed">Completed (Selesai / Lulus)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400 block">Kategori Kampus 2 (PTN/PTS/PTLN/PTMA)</label>
                    <select
                      value={formKategoriKampus2}
                      onChange={(e) => setFormKategoriKampus2(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs rounded-lg py-2 px-2.5 outline-none transition-all duration-200"
                    >
                      <option value="">Deteksi Otomatis (Default)</option>
                      <option value="PTN">PTN (Perguruan Tinggi Negeri)</option>
                      <option value="PTS">PTS (Perguruan Tinggi Swasta)</option>
                      <option value="PTLN">PTLN (Luar Negeri)</option>
                      <option value="PTMA">PTMA (Muhammadiyah / 'Aisyiyah)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Opsi 3: Pendidikan Tambahan */}
              <div className="space-y-3 p-3 bg-slate-950/60 border border-slate-900 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Opsi 3 (Tambahan - Opsional)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400 block">Kampus / Instansi 3</label>
                    <input
                      type="text"
                      value={formKampus3}
                      onChange={(e) => setFormKampus3(e.target.value)}
                      placeholder="Contoh: Lembaga Pelatihan / Sertifikasi"
                      className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg py-2 px-2.5 text-xs outline-none transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400 block">Jurusan / Jabatan 3</label>
                    <input
                      type="text"
                      value={formProdi3}
                      onChange={(e) => setFormProdi3(e.target.value)}
                      placeholder="Contoh: Digital Marketing Certificate"
                      className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg py-2 px-2.5 text-xs outline-none transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400 block">Status Pendidikan 3</label>
                    <select
                      value={formPendidikanStatus3}
                      onChange={(e) => setFormPendidikanStatus3(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs rounded-lg py-2 px-2.5 outline-none transition-all duration-200"
                    >
                      <option value="">Belum Ditentukan / Tidak Ada</option>
                      <option value="Ongoing">Ongoing (Sedang Berjalan)</option>
                      <option value="Completed">Completed (Selesai / Lulus)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400 block">Kategori Kampus 3 (PTN/PTS/PTLN/PTMA)</label>
                    <select
                      value={formKategoriKampus3}
                      onChange={(e) => setFormKategoriKampus3(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs rounded-lg py-2 px-2.5 outline-none transition-all duration-200"
                    >
                      <option value="">Deteksi Otomatis (Default)</option>
                      <option value="PTN">PTN (Perguruan Tinggi Negeri)</option>
                      <option value="PTS">PTS (Perguruan Tinggi Swasta)</option>
                      <option value="PTLN">PTLN (Luar Negeri)</option>
                      <option value="PTMA">PTMA (Muhammadiyah / 'Aisyiyah)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Kontak */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Kontak Utama (No. WA / Email / Lainnya)
              </label>
              <input
                type="text"
                value={formKontak}
                onChange={(e) => setFormKontak(e.target.value)}
                placeholder="Contoh: 08123456789 atau m_ferdiian@example.com"
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-xl py-2.5 px-3 text-xs outline-none transition-all duration-200"
              />
            </div>

            {/* Sosmed Khusus */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 block">
                  <Instagram className="h-3.5 w-3.5 text-pink-400" /> Instagram Username
                </label>
                <input
                  type="text"
                  value={formInstagram}
                  onChange={(e) => setFormInstagram(e.target.value)}
                  placeholder="Contoh: @m_ferdiian"
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-xl py-2.5 px-3 text-xs outline-none transition-all duration-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 block">
                  <Linkedin className="h-3.5 w-3.5 text-blue-400" /> LinkedIn Profile
                </label>
                <input
                  type="text"
                  value={formLinkedin}
                  onChange={(e) => setFormLinkedin(e.target.value)}
                  placeholder="Contoh: linkedin.com/in/nama-profil"
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-xl py-2.5 px-3 text-xs outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Foto Alumni & Keterangan */}
            <div className="space-y-3 p-4 bg-slate-950/40 border border-slate-850/60 rounded-xl">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 block">
                <Camera className="h-4 w-4 text-emerald-400" /> Foto Alumni & Keterangan Foto
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                {/* File picker & URL option */}
                <div className="sm:col-span-8 space-y-2">
                  <div className="flex gap-2">
                    <label className="flex-1 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 rounded-xl py-2 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors duration-200">
                      <Upload className="h-3.5 w-3.5 text-emerald-400" /> Upload Foto (JPG/PNG)
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormFoto(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    {formFoto && (
                      <button
                        type="button"
                        onClick={() => setFormFoto('')}
                        className="bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold px-3 rounded-xl transition-colors duration-200"
                      >
                        Hapus Foto
                      </button>
                    )}
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-[10px]">
                      URL:
                    </div>
                    <input
                      type="text"
                      value={formFoto.startsWith('data:') ? '' : formFoto}
                      onChange={(e) => setFormFoto(e.target.value)}
                      placeholder="Atau tempel link URL foto langsung di sini..."
                      className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-xl py-2 px-3 pl-11 text-xs outline-none transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Live Preview circle/thumbnail */}
                <div className="sm:col-span-4 flex justify-center">
                  {formFoto ? (
                    <div className="relative">
                      <img
                        src={getDirectImageUrl(formFoto)}
                        alt="Preview Alumni"
                        className="h-16 w-16 rounded-full object-cover border border-slate-700 shadow-md"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full text-[8px] font-bold">
                        Aktif
                      </span>
                    </div>
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-slate-500">
                      <Image className="h-5 w-5 mb-0.5" />
                      <span className="text-[8px] text-slate-500">No Photo</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Keterangan Foto */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Keterangan Foto (Contoh: "Foto wisuda bersama keluarga" atau "Saat magang")
                </label>
                <input
                  type="text"
                  value={formFotoKeterangan}
                  onChange={(e) => setFormFotoKeterangan(e.target.value)}
                  placeholder="Cerita singkat atau status foto ini..."
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-xl py-2 px-3 text-xs outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl py-3 px-4 flex items-center justify-center gap-2 shadow-lg transition-all duration-200 hover:shadow-emerald-900/15"
              id="submit-alumnus-form"
            >
              {editingAlumnus ? <CheckCircle className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editingAlumnus ? 'Simpan Perubahan' : 'Simpan Data Alumni'}
            </button>
          </form>
        </div>

        {/* Right column: Spreadsheet Import/Export/Operations (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Export / Bulk Setup Card */}
          <div className="bg-slate-900/60 border border-slate-850 backdrop-blur rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
              <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">Integrasi Spreadsheet & File</h3>
            </div>

            <p className="text-slate-400 text-xs">
              Alat bantu impor masal data alumni langsung dari tabel Excel atau Google Sheets. Data bisa diimpor dalam hitungan detik.
            </p>

            <div className="space-y-3 pt-2">
              {/* Toggle Import Panel */}
              <button
                onClick={() => {
                  setShowImportPanel(!showImportPanel);
                  setImportLog(null);
                }}
                className="w-full bg-slate-950 hover:bg-slate-850 text-slate-200 border border-slate-800 rounded-xl py-2.5 px-4 flex items-center justify-center gap-2 text-xs font-semibold transition-colors duration-200"
                id="toggle-import-panel"
              >
                <Upload className="h-4 w-4 text-emerald-400" />
                {showImportPanel ? 'Tutup Panel Impor' : 'Impor Masal Excel/CSV'}
              </button>

              {/* Mass Export */}
              <button
                onClick={handleExportCSV}
                className="w-full bg-slate-950 hover:bg-slate-850 text-slate-200 border border-slate-800 rounded-xl py-2.5 px-4 flex items-center justify-center gap-2 text-xs font-semibold transition-colors duration-200"
                id="export-alumni-csv"
              >
                <Download className="h-4 w-4 text-emerald-400" />
                Ekspor Semua ke CSV (Excel)
              </button>
            </div>
          </div>

          {/* Database Admin Actions */}
          <div className="bg-slate-900/60 border border-slate-850 backdrop-blur rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pemeliharaan Database</h4>

            <div className="grid grid-cols-2 gap-3">
              {/* Reset to Seeds */}
              <button
                onClick={() => {
                  if (confirm('Apakah Anda ingin memulihkan database ke data awal bawaan MBS?')) {
                    onResetSeeds();
                    setImportLog({ type: 'success', message: 'Sukses memulihkan data awal bawaan MBS!' });
                  }
                }}
                className="bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-750 text-slate-300 p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center transition-all duration-200 group"
                id="reset-seeds-btn"
              >
                <RefreshCw className="h-4.5 w-4.5 text-emerald-500 group-hover:rotate-180 transition-transform duration-500" />
                <span className="text-[10px] font-semibold leading-tight">Pulihkan Data Bawaan</span>
              </button>

              {/* Clear database */}
              <button
                onClick={() => {
                  if (confirm('PERINGATAN: Yakin ingin mengosongkan seluruh data sebaran alumni di database?')) {
                    onClearAll();
                    setImportLog({ type: 'success', message: 'Seluruh database berhasil dikosongkan!' });
                  }
                }}
                className="bg-slate-950 hover:bg-rose-950/20 border border-slate-800 hover:border-rose-900/30 text-slate-300 hover:text-rose-400 p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center transition-all duration-200"
                id="clear-database-btn"
              >
                <Trash2 className="h-4.5 w-4.5 text-rose-500" />
                <span className="text-[10px] font-semibold leading-tight">Kosongkan Database</span>
              </button>
            </div>
          </div>

          {/* Logo Settings Card (Only accessible in Admin panel) */}
          <div className="bg-slate-900/60 border border-slate-850 backdrop-blur rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
              <Camera className="h-5 w-5 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">Pengaturan Logo Hub</h3>
            </div>
            
            <p className="text-slate-400 text-xs leading-relaxed">
              Unggah file logo atau tautkan link URL gambar langsung untuk mengubah logo utama sekolah/pondok di header aplikasi dan layar login.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-950/40 border border-slate-850 rounded-xl">
              {/* Logo Preview */}
              <div className="relative group shrink-0">
                {logo ? (
                  <div className="relative h-20 w-20 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-2 shadow-inner">
                    <img
                      src={getDirectImageUrl(logo)}
                      alt="Logo MBS"
                      className="max-h-full max-w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="h-20 w-20 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shrink-0 shadow-md">
                    <GraduationCap className="h-10 w-10" />
                  </div>
                )}
              </div>

              {/* Logo Actions / File selector */}
              <div className="flex-1 w-full space-y-2.5">
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-xl text-xs cursor-pointer shadow-md transition-colors duration-200">
                    <Upload className="h-3.5 w-3.5" />
                    Unggah File Logo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            onLogoUpload(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>

                  {logo && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Apakah Anda yakin ingin menghapus logo kustom dan kembali ke logo bawaan?')) {
                          onLogoReset();
                        }
                      }}
                      className="inline-flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold px-3 py-2 rounded-xl text-xs transition-colors duration-200"
                    >
                      <X className="h-3.5 w-3.5" />
                      Kembali ke Default
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Format gambar yang disarankan: PNG, JPG, JPEG atau SVG transparan dengan tinggi minimal 100px.
                </p>
              </div>
            </div>

            {/* Logo Link URL input */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Atau Tautkan Tautan URL Link Gambar Langsung
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={logoInputUrl}
                  onChange={(e) => setLogoInputUrl(e.target.value)}
                  placeholder="Atau tempel link URL foto langsung / link Google Drive..."
                  className="flex-1 bg-slate-900 border border-slate-800 focus:border-emerald-500 text-slate-100 rounded-xl py-2 px-3 text-xs outline-none transition-all duration-200"
                  id="logo-url-input-field"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (logoInputUrl.trim()) {
                      onLogoUpload(logoInputUrl.trim());
                    }
                  }}
                  disabled={!logoInputUrl.trim()}
                  className="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900/40 text-slate-200 disabled:text-slate-600 px-3.5 rounded-xl text-xs font-bold border border-slate-700 disabled:border-slate-850 transition-all shrink-0 cursor-pointer disabled:cursor-not-allowed"
                >
                  Simpan Tautan
                </button>
              </div>
            </div>
          </div>

          {/* Narratives Settings Card */}
          <div className="bg-slate-900/60 border border-slate-850 backdrop-blur rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
              <Sliders className="h-5 w-5 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">Pengaturan Nama & Narasi</h3>
            </div>
            
            <p className="text-slate-400 text-xs leading-relaxed">
              Sesuaikan nama sekolah, judul aplikasi, teks salam, deskripsi sambutan, dan teks hak cipta kaki. Sistem akan menyesuaikan teks secara instan.
            </p>

            <form onSubmit={handleSaveNarratives} className="space-y-3.5">
              {/* Nama Sekolah */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Nama Sekolah / Pondok
                </label>
                <input
                  type="text"
                  value={inputSchoolName}
                  onChange={(e) => setInputSchoolName(e.target.value)}
                  placeholder="Contoh: MBS Ki Bagus Hadikusumo"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 rounded-xl py-2 px-3 text-xs outline-none transition-all duration-200"
                />
              </div>

              {/* Judul Aplikasi */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Judul Aplikasi (Sub-Header)
                </label>
                <input
                  type="text"
                  value={inputAppTitle}
                  onChange={(e) => setInputAppTitle(e.target.value)}
                  placeholder="Contoh: Database Sebaran Alumni"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 rounded-xl py-2 px-3 text-xs outline-none transition-all duration-200"
                />
              </div>

              {/* Salam Sambutan */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Judul Salam Sambutan
                </label>
                <input
                  type="text"
                  value={inputWelcomeTitle}
                  onChange={(e) => setInputWelcomeTitle(e.target.value)}
                  placeholder="Contoh: Assalamu'alaikum Warahmatullahi Wabarakatuh"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 rounded-xl py-2 px-3 text-xs outline-none transition-all duration-200"
                />
              </div>

              {/* Deskripsi Sambutan */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Narasi/Deskripsi Sambutan Utama
                </label>
                <textarea
                  value={inputWelcomeNarrative}
                  onChange={(e) => setInputWelcomeNarrative(e.target.value)}
                  placeholder="Deskripsi sambutan di dashboard..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 rounded-xl py-2 px-3 text-xs outline-none transition-all duration-200 resize-y"
                />
              </div>

              {/* Teks Hak Cipta Kaki */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Teks Copyright Footer
                </label>
                <input
                  type="text"
                  value={inputFooterText}
                  onChange={(e) => setInputFooterText(e.target.value)}
                  placeholder="Contoh: © 2026 MBS Ki Bagus Hadikusumo Alumni Hub"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 rounded-xl py-2 px-3 text-xs outline-none transition-all duration-200"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingNarrative}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-850 text-white disabled:text-slate-500 font-bold rounded-xl py-2 px-4 text-xs transition-colors flex items-center justify-center gap-1.5 mt-2"
              >
                <Sliders className="h-3.5 w-3.5" />
                {isSavingNarrative ? 'Menyimpan...' : 'Simpan Narasi & Teks'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Slide down Bulk Import Modal / Panel */}
      <AnimatePresence>
        {showImportPanel && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5"
            id="bulk-import-container"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">Impor Masal Data Alumni</h3>
              </div>
              <button
                onClick={() => setShowImportPanel(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Info / Columns Order */}
            <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2">
              <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-emerald-400" />
                Panduan Struktur Kolom / Spreadsheet
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Format kolom spreadsheet harus diurutkan secara berurutan sebagai berikut. Jika di-copy langsung dari Google Sheets/Excel, sistem akan otomatis mengenalinya:
              </p>
              <div className="p-2 bg-slate-900 border border-slate-850 rounded-lg text-[10px] font-mono text-emerald-400 overflow-x-auto whitespace-nowrap">
                Nama | Angkatan | Gender | Status | Kampus_Instansi | Jurusan_Pekerjaan | Kota | Kontak Utama | URL_Foto | Keterangan_Foto | Instagram_User | LinkedIn_URL
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                * Contoh baris lengkap: <code className="text-slate-300">Muhammad Ferdian, Angkatan 1 (2018), Laki-laki, Kuliah, UMY, Hubungan Internasional, Yogyakarta, 08123456789, https://linkfoto.com/foto.jpg, Foto wisuda, @m_ferdiian, linkedin.com/in/mferdian</code>
              </p>
            </div>

            {/* "import masal per filter dropdown yg pilih" requested */}
            <div className="bg-slate-950/80 border border-slate-850/80 p-4 rounded-xl space-y-3">
              <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-emerald-400" />
                Setelan Override (Otomatis Terapkan Dropdown Terpilih)
              </h4>
              <p className="text-[11px] text-slate-400">
                Pilih opsi di bawah untuk memaksa menerapkan nilai yang seragam pada semua data yang Anda impor saat ini, berguna jika file Anda tidak memiliki kolom lengkap:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Override Angkatan */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 block uppercase font-mono">Angkatan</label>
                  <select
                    value={overrideAngkatan}
                    onChange={(e) => setOverrideAngkatan(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg py-2 px-2.5 outline-none"
                    id="import-override-angkatan"
                  >
                    <option value="Default (Sesuai Spreadsheet/CSV)">Gunakan isi tabel</option>
                    {LIST_ANGKATAN.map(a => (
                      <option key={a.name} value={a.name}>{a.name}</option>
                    ))}
                  </select>
                </div>

                {/* Override Gender */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 block uppercase font-mono">Gender</label>
                  <select
                    value={overrideGender}
                    onChange={(e) => setOverrideGender(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg py-2 px-2.5 outline-none"
                    id="import-override-gender"
                  >
                    <option value="Default (Sesuai Spreadsheet/CSV)">Gunakan isi tabel</option>
                    <option value="Laki-laki">♂ Laki-laki</option>
                    <option value="Perempuan">♀ Perempuan</option>
                  </select>
                </div>

                {/* Override Status */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 block uppercase font-mono">Status</label>
                  <select
                    value={overrideStatus}
                    onChange={(e) => setOverrideStatus(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg py-2 px-2.5 outline-none"
                    id="import-override-status"
                  >
                    <option value="Default (Sesuai Spreadsheet/CSV)">Gunakan isi tabel</option>
                    {LIST_STATUS.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Google Sheets Live Link Integration */}
            <div className="bg-slate-950/60 border border-slate-850/70 p-5 rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-850/60 pb-3">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Sinkronisasi Google Sheets
                  </h4>
                </div>
                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                  Google API v4
                </span>
              </div>

              {/* Step 1: Google Account connection */}
              <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {googleUser ? (
                  <>
                    <div className="flex items-center gap-2.5">
                      {googleUser.photoURL ? (
                        <img
                          src={googleUser.photoURL}
                          alt={googleUser.displayName || ''}
                          className="h-8 w-8 rounded-full border border-emerald-500/30"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold font-mono">
                          {googleUser.email ? googleUser.email[0].toUpperCase() : 'G'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate leading-snug">
                          {googleUser.displayName || 'Akun Terhubung'}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {googleUser.email}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleDisconnectGoogle}
                      className="text-[10px] font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1.5 rounded-lg border border-rose-500/20 transition-all flex items-center justify-center gap-1 shrink-0"
                    >
                      <Unlink className="h-3.5 w-3.5" />
                      Putuskan Akun
                    </button>
                  </>
                ) : (
                  <>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-200">Koneksi Google Sheets</p>
                      <p className="text-[10px] text-slate-400">Hubungkan untuk sinkronisasi dokumen privat.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleConnectGoogle}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-md shrink-0"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      Hubungkan Akun Google
                    </button>
                  </>
                )}
              </div>

              {/* Step 2: Spreadsheet URL input */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Tautan URL Spreadsheet Google (Utama / Alumni)
                  </label>
                  <input
                    type="text"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    onBlur={() => onSheetUrlChange(sheetUrl)}
                    placeholder="Contoh: https://docs.google.com/spreadsheets/d/1A-bcD_EfG/edit#gid=0"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-slate-100 rounded-xl py-2 px-3 text-xs outline-none transition-all duration-200"
                    id="google-sheet-url-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Tautan URL Spreadsheet Google Kedua (Khusus Master_Kampus)
                  </label>
                  <input
                    type="text"
                    value={masterKampusSheetUrl}
                    onChange={(e) => setMasterKampusSheetUrl(e.target.value)}
                    onBlur={() => onMasterKampusSheetUrlChange(masterKampusSheetUrl)}
                    placeholder="Contoh: https://docs.google.com/spreadsheets/d/1peIJJjARi66kAmQczZOtaMr_5R04fNdiC8ivcLFB-ew/edit#gid=0"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-violet-500 text-slate-100 rounded-xl py-2 px-3 text-xs outline-none transition-all duration-200"
                    id="google-master-kampus-url-input"
                  />
                  <p className="text-[10px] text-slate-500 leading-tight">
                    {googleUser ? (
                      <span className="text-emerald-400 font-medium">✓ Terhubung. Anda bisa menarik atau menulis ke spreadsheet privat / publik.</span>
                    ) : (
                      <span>* Catatan: Jika tidak terhubung ke Google, kedua spreadsheet harus diatur publik ("Siapa saja yang memiliki link dapat melihat").</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Step 3: Interactive Sync Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* PULL (Tarik) Button */}
                <button
                  type="button"
                  onClick={handleSyncGoogleSheet}
                  disabled={isSyncingSheet || !sheetUrl.trim()}
                  className="w-full bg-slate-900 hover:bg-slate-850 disabled:bg-slate-900/40 text-white disabled:text-slate-600 border border-slate-800 disabled:border-slate-850 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                  id="sync-sheet-btn"
                >
                  <ArrowDownLeft className={`h-4 w-4 text-teal-400 ${isSyncingSheet ? 'animate-bounce' : ''}`} />
                  {isSyncingSheet ? 'Menarik data...' : 'Tarik Data ke Aplikasi'}
                </button>

                {/* PUSH (Kirim) Button */}
                <button
                  type="button"
                  onClick={handlePushToGoogleSheet}
                  disabled={isPushingSheet || !sheetUrl.trim() || !googleToken}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-900/40 text-white disabled:text-slate-600 disabled:border-slate-850 font-bold rounded-xl py-2.5 px-3 text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                  id="push-sheet-btn"
                  title={!googleToken ? 'Hubungkan akun Google Anda terlebih dahulu untuk mengaktifkan penulisan spreadsheet' : 'Ekspor data aplikasi ini ke Google Sheet Anda'}
                >
                  <ArrowUpRight className={`h-4 w-4 text-emerald-100 ${isPushingSheet ? 'animate-bounce' : ''}`} />
                  {isPushingSheet ? 'Mengirim data...' : 'Kirim Data ke Sheet'}
                </button>
              </div>
            </div>

            {/* Visual drag-and-drop or copy-paste container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* File Uploader */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer ${
                  isDragging ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-800 bg-slate-950/40 hover:bg-slate-950/60'
                }`}
                onClick={() => fileInputRef.current?.click()}
                id="drop-csv-area"
              >
                <Upload className="h-8 w-8 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                <p className="text-xs font-semibold text-slate-300">Tarik & Letakkan File CSV</p>
                <p className="text-[10px] text-slate-500">Atau klik untuk memilih file dari komputer Anda</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".csv,.txt"
                  className="hidden"
                />
              </div>

              {/* Text Area copy paste */}
              <div className="space-y-2">
                <textarea
                  value={pastedData}
                  onChange={(e) => setPastedData(e.target.value)}
                  placeholder="Atau tempel (paste) baris tabel Excel / Google Sheets di sini..."
                  className="w-full h-28 bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 p-3 text-xs rounded-xl outline-none resize-none font-mono"
                  id="paste-csv-textarea"
                />
                <button
                  onClick={() => processCSVRawText(pastedData)}
                  disabled={!pastedData.trim()}
                  className="w-full bg-emerald-600 disabled:bg-slate-850 text-white disabled:text-slate-500 font-bold rounded-xl py-2 px-4 text-xs transition-colors flex items-center justify-center gap-1.5"
                  id="submit-pasted-import"
                >
                  <Plus className="h-4.5 w-4.5" />
                  Impor Teks yang Ditempel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
