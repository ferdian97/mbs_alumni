/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Users, GraduationCap, Briefcase, Award, TrendingUp, Sparkles, Building2, User } from 'lucide-react';
import { Alumnus } from '../types';
import { DEFAULT_MASTER_KAMPUS, MasterKampusItem } from '../data/defaultMasterKampus';

interface DashboardViewProps {
  alumni: Alumnus[];
  welcomeTitle: string;
  welcomeNarrative: string;
  masterKampus?: MasterKampusItem[];
}

export function getKampusCategory(kampus: string, userCategory?: string): 'PTN' | 'PTS' | 'PTLN' | 'PTMA' | 'Kedinasan' | '' {
  if (userCategory) {
    const uc = userCategory.trim().toUpperCase();
    if (uc === 'PTN' || uc === 'PTS' || uc === 'PTLN' || uc === 'PTMA') {
      return uc as 'PTN' | 'PTS' | 'PTLN' | 'PTMA';
    }
    if (uc === 'KEDINASAN') {
      return 'Kedinasan';
    }
  }
  return '';
}

export function standardizeKampus(kampus: string): string {
  return kampus ? kampus.trim() : '';
}

export function getStandardizedMasterKampusName(inputName: string, activeMasterKampus: MasterKampusItem[]): { officialName: string, category: 'PTN' | 'PTS' | 'PTLN' | 'PTMA' | 'Kedinasan' | '' } {
  const cleanInput = inputName.trim().toLowerCase();
  if (!cleanInput) return { officialName: inputName, category: '' };

  // 1. Try exact match (case insensitive)
  let found = activeMasterKampus.find(item => item.Nama_Kampus.trim().toLowerCase() === cleanInput);
  if (found) {
    return { officialName: found.Nama_Kampus, category: found.Kategori_Kampus };
  }

  // 2. Try clean match (removing common words like "universitas", "institut", "univ.", "univ", etc.)
  const cleanString = (str: string) => {
    return str.toLowerCase()
      .replace(/\b(universitas|universintas|univeristas|univrsitas|univesitas|univresitas|institut|politeknik|akademi|sekolah tinggi|univ\.|univ|inst\.|poltek|uin)\b/gi, '')
      .replace(/[^a-z0-9]/gi, '')
      .trim();
  };

  const cleanInputSanitized = cleanString(cleanInput);
  if (cleanInputSanitized) {
    found = activeMasterKampus.find(item => cleanString(item.Nama_Kampus) === cleanInputSanitized);
    if (found) {
      return { officialName: found.Nama_Kampus, category: found.Kategori_Kampus };
    }
  }

  // 3. Match known abbreviations / aliases
  const aliasMap: Record<string, string> = {
    'gadjah mada': 'UGM',
    'gajah mada': 'UGM',
    'indonesia': 'UI',
    'brawijaya': 'Universitas Brawijaya',
    'padjadjaran': 'UnPad',
    'hasanuddin': 'Univ. Hasanuddin',
    'diponegoro': 'UNDIP',
    'sebelas maret': 'UNS',
    'pendidikan indonesia': 'UPI',
    'airlangga': 'UNAIR',
    'hasanudin': 'Univ. Hasanuddin',
    'islam indonesia': 'UII',
    'muhammadiyah yogyakarta': 'UMY',
    'muhammadiyah jakarta': 'UMJ',
    'muhammadiyah prof': 'UHAMKA',
    'syarif hidayatullah': 'UIN Jakarta',
    'sunan kalijaga': 'UIN Yogyakarta',
    'sunan gunung djati': 'UIN Bandung',
    'walisongo': 'UIN Semarang',
    'mahasiswa stan': 'PKN STAN',
    'pkn stan': 'PKN STAN',
    'sekolah tinggi akuntansi negara': 'PKN STAN',
    'stis': 'Politeknik Statistika STIS',
    'statistika stis': 'Politeknik Statistika STIS',
    'tni': 'TNI AD',
    'militer': 'TNI AD',
    'angkatan darat': 'TNI AD',
  };

  for (const [alias, official] of Object.entries(aliasMap)) {
    if (cleanInput.includes(alias)) {
      const matchItem = activeMasterKampus.find(item => item.Nama_Kampus.toLowerCase() === official.toLowerCase());
      if (matchItem) {
        return { officialName: matchItem.Nama_Kampus, category: matchItem.Kategori_Kampus };
      }
    }
  }

  // 4. Acronym check: e.g. "Universitas Islam Indonesia" -> "UII"
  const getAcronym = (str: string) => {
    const words = str.toLowerCase()
      .replace(/\b(dan|ke|di|dari|of|the|and)\b/g, '')
      .split(/\s+/)
      .filter(w => w.length > 0);
    return words.map(w => w[0]).join('');
  };

  const inputAcronym = getAcronym(inputName);
  if (inputAcronym.length >= 3) {
    found = activeMasterKampus.find(item => item.Nama_Kampus.toLowerCase() === inputAcronym);
    if (found) {
      return { officialName: found.Nama_Kampus, category: found.Kategori_Kampus };
    }
  }

  // 5. Reverse acronym check: e.g. input is "UII" and item is "Universitas Islam Indonesia"
  found = activeMasterKampus.find(item => {
    const itemAcronym = getAcronym(item.Nama_Kampus);
    return itemAcronym.length >= 3 && itemAcronym === cleanInput;
  });
  if (found) {
    return { officialName: found.Nama_Kampus, category: found.Kategori_Kampus };
  }

  // 6. Substring check with cleaned strings
  found = activeMasterKampus.find(item => {
    const itemClean = cleanString(item.Nama_Kampus);
    const inputClean = cleanString(inputName);
    return itemClean.length > 3 && inputClean.length > 3 && (inputClean.includes(itemClean) || itemClean.includes(inputClean));
  });
  if (found) {
    return { officialName: found.Nama_Kampus, category: found.Kategori_Kampus };
  }

  return { officialName: inputName, category: '' };
}

export default function DashboardView({ alumni, welcomeTitle, welcomeNarrative, masterKampus }: DashboardViewProps) {
  // Calculations
  const totalAlumni = alumni.length;

  const countByGender = (gender: 'Laki-laki' | 'Perempuan') => {
    return alumni.filter((a) => a.gender === gender).length;
  };

  const lakiCount = countByGender('Laki-laki');
  const ceweCount = countByGender('Perempuan');
  const lakiPercentage = totalAlumni > 0 ? Math.round((lakiCount / totalAlumni) * 100) : 0;
  const cewePercentage = totalAlumni > 0 ? Math.round((ceweCount / totalAlumni) * 100) : 0;

  // Status counts
  const statusCounts = alumni.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statuses: ('Kuliah' | 'Bekerja' | 'Wirausaha' | 'Mengabdi' | 'Lainnya')[] = [
    'Kuliah',
    'Bekerja',
    'Wirausaha',
    'Mengabdi',
    'Lainnya',
  ];

  const activeMasterKampus = masterKampus && masterKampus.length > 0 ? masterKampus : DEFAULT_MASTER_KAMPUS;

  // Categorized Campus Calculations
  const allCampusCounts: Record<string, number> = {};

  const ptnCounts: Record<string, number> = {};
  const ptsCounts: Record<string, number> = {};
  const ptlnCounts: Record<string, number> = {};
  const ptmaCounts: Record<string, number> = {};
  const kedinasanCounts: Record<string, number> = {};

  alumni.forEach((curr) => {
    const processCamp = (kampus: string | undefined, userCat?: 'PTN' | 'PTS' | 'PTLN' | 'PTMA' | 'Kedinasan' | '') => {
      if (!kampus) return;
      const parts = kampus.split('/');
      parts.forEach((part) => {
        const rawName = part.trim();
        if (!rawName) return;

        // Use our smart, fuzzy matching function to map the typed name to the official Master Kampus name
        const { officialName, category: matchedCategory } = getStandardizedMasterKampusName(rawName, activeMasterKampus);
        
        let category = getKampusCategory(rawName, userCat);
        if (!category) {
          category = matchedCategory;
        }

        // Fallback category if none was found or matched
        if (!category) {
          category = 'PTS';
        }

        // Keep a unified map of all campus counts to prevent category mismatch losses
        allCampusCounts[officialName] = (allCampusCounts[officialName] || 0) + 1;

        if (category === 'PTN') {
          ptnCounts[officialName] = (ptnCounts[officialName] || 0) + 1;
        } else if (category === 'PTS') {
          ptsCounts[officialName] = (ptsCounts[officialName] || 0) + 1;
        } else if (category === 'PTLN') {
          ptlnCounts[officialName] = (ptlnCounts[officialName] || 0) + 1;
        } else if (category === 'PTMA') {
          ptmaCounts[officialName] = (ptmaCounts[officialName] || 0) + 1;
        } else if (category === 'Kedinasan') {
          kedinasanCounts[officialName] = (kedinasanCounts[officialName] || 0) + 1;
        }
      });
    };

    // Primary campus slot - process if 'Kuliah', or if it matches a known master campus (for Bekerja/Mengabdi etc.)
    if (curr.kampusInstansi) {
      if (curr.status === 'Kuliah') {
        processCamp(curr.kampusInstansi, curr.kategoriKampus);
      } else {
        const { officialName, category } = getStandardizedMasterKampusName(curr.kampusInstansi, activeMasterKampus);
        if (category || curr.kategoriKampus) {
          processCamp(curr.kampusInstansi, curr.kategoriKampus || category);
        }
      }
    }

    if (curr.kampusInstansi2) {
      processCamp(curr.kampusInstansi2, curr.kategoriKampus2);
    }
    if (curr.kampusInstansi3) {
      processCamp(curr.kampusInstansi3, curr.kategoriKampus3);
    }
  });

  const getCategorizedMasterList = (category: 'PTN' | 'PTS' | 'PTLN' | 'PTMA' | 'Kedinasan', accumulatedCounts: Record<string, number>) => {
    const masterItems = activeMasterKampus
      .filter((item) => item.Kategori_Kampus === category)
      .sort((a, b) => a.Urutan - b.Urutan);

    return masterItems.map((item) => {
      const targetLower = item.Nama_Kampus.trim().toLowerCase();
      let count = 0;
      
      // Look up in our consolidated allCampusCounts first to ensure robustness against category mismatches
      Object.entries(allCampusCounts).forEach(([k, v]) => {
        if (k.toLowerCase() === targetLower) {
          count += v;
        }
      });
      
      return [item.Nama_Kampus, count] as [string, number];
    });
  };

  const topPTN = getCategorizedMasterList('PTN', ptnCounts);
  const topPTS = getCategorizedMasterList('PTS', ptsCounts);
  const topPTLN = getCategorizedMasterList('PTLN', ptlnCounts);
  const topPTMA = getCategorizedMasterList('PTMA', ptmaCounts);
  const topKedinasan = getCategorizedMasterList('Kedinasan', kedinasanCounts);

  const totalPTN = topPTN.reduce((a, b) => a + b[1], 0);
  const totalPTS = topPTS.reduce((a, b) => a + b[1], 0);
  const totalPTLN = topPTLN.reduce((a, b) => a + b[1], 0);
  const totalPTMA = topPTMA.reduce((a, b) => a + b[1], 0);
  const totalKedinasan = topKedinasan.reduce((a, b) => a + b[1], 0);
  const totalContinuing = totalPTN + totalPTS + totalPTLN + totalPTMA + totalKedinasan;

  // Jurusan ranking
  const jurusanCounts = alumni.reduce((acc, curr) => {
    const processMajor = (majorStr: string | undefined) => {
      if (!majorStr) return;
      const parts = majorStr.split('/');
      parts.forEach((part) => {
        let cleaned = part.trim();
        if (!cleaned) return;
        
        // Clean prefixes case-insensitively
        cleaned = cleaned.replace(/^(S1|S-1|D3|D-3|D4|D-4|S2|S3)\s+/gi, '');
        
        // Expand common abbreviations
        cleaned = cleaned.replace(/^Pend\.\s+/gi, 'Pendidikan ');
        cleaned = cleaned.replace(/^Pend\s+/gi, 'Pendidikan ');
        cleaned = cleaned.replace(/^B\.\s+/gi, 'Bahasa ');
        cleaned = cleaned.replace(/\bHub\.\s+/gi, 'Hubungan ');
        
        // Standardize capitalization (Title Case)
        cleaned = cleaned.toLowerCase()
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
          
        if (cleaned) {
          acc[cleaned] = (acc[cleaned] || 0) + 1;
        }
      });
    };

    processMajor(curr.prodiJabatan);
    processMajor(curr.prodiJabatan2);
    processMajor(curr.prodiJabatan3);
    
    return acc;
  }, {} as Record<string, number>);

  const topJurusan = Object.entries(jurusanCounts)
    .filter(([name]) => name.trim() !== '' && name.toLowerCase() !== 'lainnya' && name.toLowerCase() !== 'tidak bekerja')
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);

  // Angkatan counts
  const angkatanCounts = alumni.reduce((acc, curr) => {
    acc[curr.angkatan] = (acc[curr.angkatan] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Sort angkatan logically: newest (highest number) first, oldest (lowest number) last
  const sortedAngkatan = Object.entries(angkatanCounts).sort((a, b) => {
    const numA = parseInt(a[0].match(/\d+/)?.[0] || '0', 10);
    const numB = parseInt(b[0].match(/\d+/)?.[0] || '0', 10);
    if (numA !== numB) {
      return numB - numA;
    }
    return b[0].localeCompare(a[0]);
  });

  // Stagger animation helpers
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-20"
      id="dashboard-container"
    >
      {/* Overview Banner */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-br from-emerald-950 to-teal-900 border border-emerald-800 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg"
      >
        <div className="absolute top-[-30%] right-[-10%] w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight">{welcomeTitle}</h2>
            <p className="text-emerald-200 text-sm max-w-xl">
              {welcomeNarrative}
            </p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-400/20 px-4 py-3 rounded-2xl flex items-center gap-3 shrink-0">
            <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-300">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-emerald-300 font-mono">Total Terdata</p>
              <h3 className="text-2xl font-black font-mono tracking-tight text-white">{totalAlumni} <span className="text-xs font-normal text-emerald-300">Alumni</span></h3>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Gender Breakdown */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-900/60 border border-slate-800/80 backdrop-blur rounded-2xl p-5 shadow-sm space-y-4"
          id="stat-gender-ratio"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Proporsi Gender</h3>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">Ratio</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Laki-laki */}
            <div className="bg-slate-950/50 border border-slate-800/60 p-3 rounded-xl flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                ♂
              </div>
              <div>
                <p className="text-xs text-slate-400">Laki-laki</p>
                <h4 className="text-lg font-bold text-white font-mono">{lakiCount} <span className="text-xs font-normal text-slate-500">({lakiPercentage}%)</span></h4>
              </div>
            </div>

            {/* Perempuan */}
            <div className="bg-slate-950/50 border border-slate-800/60 p-3 rounded-xl flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center font-bold">
                ♀
              </div>
              <div>
                <p className="text-xs text-slate-400">Perempuan</p>
                <h4 className="text-lg font-bold text-white font-mono">{ceweCount} <span className="text-xs font-normal text-slate-500">({cewePercentage}%)</span></h4>
              </div>
            </div>
          </div>

          {/* Visual Bar */}
          <div className="space-y-1">
            <div className="h-3 w-full bg-slate-950 border border-slate-800 rounded-full overflow-hidden flex">
              <div
                className="bg-blue-500 transition-all duration-500"
                style={{ width: `${lakiPercentage}%` }}
              />
              <div
                className="bg-pink-500 transition-all duration-500"
                style={{ width: `${cewePercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Laki-laki ({lakiPercentage}%)</span>
              <span>Perempuan ({cewePercentage}%)</span>
            </div>
          </div>
        </motion.div>

        {/* Activity Status Distribution */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-900/60 border border-slate-800/80 backdrop-blur rounded-2xl p-5 shadow-sm space-y-4 md:col-span-1 lg:col-span-2"
          id="stat-status-dist"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Aktivitas Utama Alumni</h3>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">Status</span>
          </div>

          <div className="space-y-3">
            {statuses.map((status) => {
              const count = statusCounts[status] || 0;
              const percent = totalAlumni > 0 ? Math.round((count / totalAlumni) * 100) : 0;

              // Color classes
              let barColor = 'bg-slate-400';
              let iconBg = 'bg-slate-500/10 text-slate-400';
              let IconComponent = Sparkles;

              if (status === 'Kuliah') {
                barColor = 'bg-emerald-500';
                iconBg = 'bg-emerald-500/10 text-emerald-400';
                IconComponent = GraduationCap;
              } else if (status === 'Bekerja') {
                barColor = 'bg-teal-500';
                iconBg = 'bg-teal-500/10 text-teal-400';
                IconComponent = Briefcase;
              } else if (status === 'Wirausaha') {
                barColor = 'bg-amber-500';
                iconBg = 'bg-amber-500/10 text-amber-400';
                IconComponent = TrendingUp;
              } else if (status === 'Mengabdi') {
                barColor = 'bg-indigo-500';
                iconBg = 'bg-indigo-500/10 text-indigo-400';
                IconComponent = Award;
              }

              return (
                <div key={status} className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${iconBg} shrink-0`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1 text-xs">
                      <span className="font-medium text-slate-300">{status}</span>
                      <span className="text-slate-400 font-mono">{count} Alumni <span className="text-slate-500">({percent}%)</span></span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 border border-slate-850 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} rounded-full transition-all duration-500`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Angkatan Progression (Full-Width) */}
      <div className="grid grid-cols-1 gap-6">
        {/* Angkatan Progression */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-900/60 border border-slate-800/80 backdrop-blur rounded-2xl p-5 shadow-sm space-y-4"
          id="stat-angkatan-growth"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Perkembangan per Angkatan</h3>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">Angkatan</span>
          </div>

          {sortedAngkatan.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              Belum ada data perkembangan alumni.
            </div>
          ) : (
            <div className="space-y-3 max-h-[385px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              {sortedAngkatan.map(([name, count]) => {
                const maxCount = Math.max(...Object.values(angkatanCounts), 1);
                const percent = Math.round((count / maxCount) * 100);
                return (
                  <div key={name} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 truncate pr-2">{name}</span>
                      <span className="text-slate-400 font-mono font-bold shrink-0">{count} <span className="text-[10px] text-slate-500 font-normal">Santri</span></span>
                    </div>
                    <div className="h-3 w-full bg-slate-950 border border-slate-850 rounded-full overflow-hidden flex items-center pr-2">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Full-width 3-Column Categorized Campuses Section */}
      <div className="space-y-6">
        <div className="border-t border-slate-800/40 my-2" />
        
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wider">
            <Building2 className="h-5 w-5 text-emerald-500 animate-pulse" />
            Kategori Kampus Terfavorit (Studi Lanjut)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-5 gap-5">
          {/* PTN Panel */}
          <motion.div
            variants={itemVariants}
            className="bg-slate-900/60 border border-slate-800/80 backdrop-blur rounded-2xl p-5 shadow-sm space-y-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shrink-0">
                  <Building2 className="h-4 w-4" />
                </span>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider truncate">PTN</h4>
              </div>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-lg border border-emerald-500/20 font-bold font-mono shrink-0">
                {totalPTN} Alumni
              </span>
            </div>

            {/* Interactive Proportion Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Rasio Kategori</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {totalContinuing > 0 ? Math.round((totalPTN / totalContinuing) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-950 border border-slate-850 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${totalContinuing > 0 ? (totalPTN / totalContinuing) * 100 : 0}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-emerald-500 rounded-full"
                />
              </div>
            </div>

            {/* Top List */}
            <div className="space-y-3">
              <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Daftar Kampus PTN</h5>
              {topPTN.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">Belum ada data kampus PTN.</div>
              ) : (
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                  {topPTN.map(([campus, count], idx) => {
                    const maxCount = Math.max(...topPTN.map(c => c[1]), 1);
                    const widthPercent = Math.round((count / maxCount) * 100);
                    return (
                      <div key={campus} className="space-y-1 group pr-0.5">
                        <div className="flex items-center justify-between text-xs gap-2">
                          <span className="text-slate-300 font-semibold flex items-center gap-1.5 min-w-0 flex-1">
                            <span className="text-[10px] text-emerald-500/70 font-mono font-bold shrink-0">#{idx+1}</span>
                            <span className="truncate" title={campus}>{campus}</span>
                          </span>
                          <span className="text-slate-400 font-mono font-bold shrink-0">{count} Alumni</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${widthPercent}%` }}
                            transition={{ duration: 0.5, delay: Math.min(idx * 0.02, 0.5) }}
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full group-hover:from-emerald-400 group-hover:to-teal-300 transition-colors"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

          {/* PTS Panel */}
          <motion.div
            variants={itemVariants}
            className="bg-slate-900/60 border border-slate-800/80 backdrop-blur rounded-2xl p-5 shadow-sm space-y-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 shrink-0">
                  <Building2 className="h-4 w-4" />
                </span>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider truncate">PTS</h4>
              </div>
              <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-lg border border-indigo-500/20 font-bold font-mono shrink-0">
                {totalPTS} Alumni
              </span>
            </div>

            {/* Interactive Proportion Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Rasio Kategori</span>
                <span className="font-mono text-indigo-400 font-bold">
                  {totalContinuing > 0 ? Math.round((totalPTS / totalContinuing) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-950 border border-slate-850 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${totalContinuing > 0 ? (totalPTS / totalContinuing) * 100 : 0}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-indigo-500 rounded-full"
                />
              </div>
            </div>

            {/* Top List */}
            <div className="space-y-3">
              <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Daftar Kampus PTS</h5>
              {topPTS.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">Belum ada data kampus PTS.</div>
              ) : (
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                  {topPTS.map(([campus, count], idx) => {
                    const maxCount = Math.max(...topPTS.map(c => c[1]), 1);
                    const widthPercent = Math.round((count / maxCount) * 100);
                    return (
                      <div key={campus} className="space-y-1 group pr-0.5">
                        <div className="flex items-center justify-between text-xs gap-2">
                          <span className="text-slate-300 font-semibold flex items-center gap-1.5 min-w-0 flex-1">
                            <span className="text-[10px] text-indigo-500/70 font-mono font-bold shrink-0">#{idx+1}</span>
                            <span className="truncate" title={campus}>{campus}</span>
                          </span>
                          <span className="text-slate-400 font-mono font-bold shrink-0">{count} Alumni</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${widthPercent}%` }}
                            transition={{ duration: 0.5, delay: Math.min(idx * 0.02, 0.5) }}
                            className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full group-hover:from-indigo-400 group-hover:to-sky-300 transition-colors"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

          {/* PTLN Panel */}
          <motion.div
            variants={itemVariants}
            className="bg-slate-900/60 border border-slate-800/80 backdrop-blur rounded-2xl p-5 shadow-sm space-y-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/25 shrink-0">
                  <Building2 className="h-4 w-4" />
                </span>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider truncate">PTLN</h4>
              </div>
              <span className="text-xs bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded-lg border border-amber-500/20 font-bold font-mono shrink-0">
                {totalPTLN} Alumni
              </span>
            </div>

            {/* Interactive Proportion Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Rasio Kategori</span>
                <span className="font-mono text-amber-400 font-bold">
                  {totalContinuing > 0 ? Math.round((totalPTLN / totalContinuing) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-950 border border-slate-850 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${totalContinuing > 0 ? (totalPTLN / totalContinuing) * 100 : 0}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-amber-500 rounded-full"
                />
              </div>
            </div>

            {/* Top List */}
            <div className="space-y-3">
              <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Daftar Kampus PTLN</h5>
              {topPTLN.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">Belum ada data kampus PTLN (Luar Negeri).</div>
              ) : (
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                  {topPTLN.map(([campus, count], idx) => {
                    const maxCount = Math.max(...topPTLN.map(c => c[1]), 1);
                    const widthPercent = Math.round((count / maxCount) * 100);
                    return (
                      <div key={campus} className="space-y-1 group pr-0.5">
                        <div className="flex items-center justify-between text-xs gap-2">
                          <span className="text-slate-300 font-semibold flex items-center gap-1.5 min-w-0 flex-1">
                            <span className="text-[10px] text-amber-500/70 font-mono font-bold shrink-0">#{idx+1}</span>
                            <span className="truncate" title={campus}>{campus}</span>
                          </span>
                          <span className="text-slate-400 font-mono font-bold shrink-0">{count} Alumni</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${widthPercent}%` }}
                            transition={{ duration: 0.5, delay: Math.min(idx * 0.02, 0.5) }}
                            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full group-hover:from-amber-400 group-hover:to-yellow-300 transition-colors"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

          {/* PTMA Panel */}
          <motion.div
            variants={itemVariants}
            className="bg-slate-900/60 border border-slate-800/80 backdrop-blur rounded-2xl p-5 shadow-sm space-y-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/25 shrink-0">
                  <Building2 className="h-4 w-4" />
                </span>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider truncate">PTMA</h4>
              </div>
              <span className="text-xs bg-teal-500/10 text-teal-400 px-2.5 py-0.5 rounded-lg border border-teal-500/20 font-bold font-mono shrink-0">
                {totalPTMA} Alumni
              </span>
            </div>

            {/* Interactive Proportion Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Rasio Kategori</span>
                <span className="font-mono text-teal-400 font-bold">
                  {totalContinuing > 0 ? Math.round((totalPTMA / totalContinuing) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-950 border border-slate-850 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${totalContinuing > 0 ? (totalPTMA / totalContinuing) * 100 : 0}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-teal-500 rounded-full"
                />
              </div>
            </div>

            {/* Top List */}
            <div className="space-y-3">
              <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Daftar Kampus PTMA</h5>
              {topPTMA.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">Belum ada data kampus PTMA.</div>
              ) : (
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                  {topPTMA.map(([campus, count], idx) => {
                    const maxCount = Math.max(...topPTMA.map(c => c[1]), 1);
                    const widthPercent = Math.round((count / maxCount) * 100);
                    return (
                      <div key={campus} className="space-y-1 group pr-0.5">
                        <div className="flex items-center justify-between text-xs gap-2">
                          <span className="text-slate-300 font-semibold flex items-center gap-1.5 min-w-0 flex-1">
                            <span className="text-[10px] text-teal-500/70 font-mono font-bold shrink-0">#{idx+1}</span>
                            <span className="truncate" title={campus}>{campus}</span>
                          </span>
                          <span className="text-slate-400 font-mono font-bold shrink-0">{count} Alumni</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${widthPercent}%` }}
                            transition={{ duration: 0.5, delay: Math.min(idx * 0.02, 0.5) }}
                            className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full group-hover:from-teal-400 group-hover:to-cyan-300 transition-colors"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

          {/* Kedinasan Panel */}
          <motion.div
            variants={itemVariants}
            className="bg-slate-900/60 border border-slate-800/80 backdrop-blur rounded-2xl p-5 shadow-sm space-y-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/25 shrink-0">
                  <Building2 className="h-4 w-4" />
                </span>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider truncate">Kedinasan</h4>
              </div>
              <span className="text-xs bg-violet-500/10 text-violet-400 px-2.5 py-0.5 rounded-lg border border-violet-500/20 font-bold font-mono shrink-0">
                {totalKedinasan} Alumni
              </span>
            </div>

            {/* Interactive Proportion Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Rasio Kategori</span>
                <span className="font-mono text-violet-400 font-bold">
                  {totalContinuing > 0 ? Math.round((totalKedinasan / totalContinuing) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-950 border border-slate-850 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${totalContinuing > 0 ? (totalKedinasan / totalContinuing) * 100 : 0}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-violet-500 rounded-full"
                />
              </div>
            </div>

            {/* Top List */}
            <div className="space-y-3">
              <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Daftar Kampus Kedinasan</h5>
              {topKedinasan.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">Belum ada data kampus Kedinasan.</div>
              ) : (
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                  {topKedinasan.map(([campus, count], idx) => {
                    const maxCount = Math.max(...topKedinasan.map(c => c[1]), 1);
                    const widthPercent = Math.round((count / maxCount) * 100);
                    return (
                      <div key={campus} className="space-y-1 group pr-0.5">
                        <div className="flex items-center justify-between text-xs gap-2">
                          <span className="text-slate-300 font-semibold flex items-center gap-1.5 min-w-0 flex-1">
                            <span className="text-[10px] text-violet-500/70 font-mono font-bold shrink-0">#{idx+1}</span>
                            <span className="truncate" title={campus}>{campus}</span>
                          </span>
                          <span className="text-slate-400 font-mono font-bold shrink-0">{count} Alumni</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${widthPercent}%` }}
                            transition={{ duration: 0.5, delay: Math.min(idx * 0.02, 0.5) }}
                            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-400 rounded-full group-hover:from-violet-400 group-hover:to-fuchsia-300 transition-colors"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
