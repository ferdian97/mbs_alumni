/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, GraduationCap, MapPin, Building2, PhoneCall, Calendar, FilterX, HelpCircle, Briefcase, Award, Sparkles, SlidersHorizontal, Check, Instagram, Linkedin, Image, Camera, X, ExternalLink, Share2, Copy } from 'lucide-react';
import { Alumnus, FilterState, getDirectImageUrl } from '../types';

interface AlumniListViewProps {
  alumni: Alumnus[];
  isAdmin: boolean;
  onEdit?: (alumnus: Alumnus) => void;
  onDelete?: (id: string) => void;
  schoolName: string;
}

export default function AlumniListView({ alumni, isAdmin, onEdit, onDelete, schoolName }: AlumniListViewProps) {
  // Selected Alumnus state for detailed modal view
  const [selectedAlumnus, setSelectedAlumnus] = useState<Alumnus | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Local filter states
  const [filters, setFilters] = useState<FilterState>({
    angkatan: 'All',
    gender: 'All',
    kampus: 'All',
    jurusan: 'All',
    search: '',
  });

  const [showAdvanceFilters, setShowAdvanceFilters] = useState(false);

  // Derive filter options dynamically from existing data
  const angkatanOptions = useMemo(() => {
    const list = alumni.map((a) => a.angkatan);
    return ['All', ...Array.from(new Set(list))].sort((a, b) => {
      const yearA = parseInt(a.match(/\d{4}/)?.[0] || '0', 10);
      const yearB = parseInt(b.match(/\d{4}/)?.[0] || '0', 10);
      return yearA - yearB;
    });
  }, [alumni]);

  const kampusOptions = useMemo(() => {
    const list: string[] = [];
    alumni.forEach((a) => {
      if (a.kampusInstansi) list.push(a.kampusInstansi);
      if (a.kampusInstansi2) list.push(a.kampusInstansi2);
      if (a.kampusInstansi3) list.push(a.kampusInstansi3);
    });
    return ['All', ...Array.from(new Set(list))].sort();
  }, [alumni]);

  const jurusanOptions = useMemo(() => {
    const list: string[] = [];
    alumni.forEach((a) => {
      if (a.prodiJabatan) {
        a.prodiJabatan.split('/').forEach((part) => {
          const trimmed = part.trim();
          if (trimmed) list.push(trimmed);
        });
      }
      if (a.prodiJabatan2) {
        a.prodiJabatan2.split('/').forEach((part) => {
          const trimmed = part.trim();
          if (trimmed) list.push(trimmed);
        });
      }
      if (a.prodiJabatan3) {
        a.prodiJabatan3.split('/').forEach((part) => {
          const trimmed = part.trim();
          if (trimmed) list.push(trimmed);
        });
      }
    });
    const unique = Array.from(new Set(list)).sort((a, b) => a.localeCompare(b));
    return ['All', ...unique];
  }, [alumni]);

  // Reset filters
  const resetFilters = () => {
    setFilters({
      angkatan: 'All',
      gender: 'All',
      kampus: 'All',
      jurusan: 'All',
      search: '',
    });
  };

  // Copy Profile Text format helper
  const handleCopyProfile = () => {
    if (!selectedAlumnus) return;
    const text = `Profil Alumni ${schoolName} Hub:\nNama: ${selectedAlumnus.name}\nAngkatan: ${selectedAlumnus.angkatan}\nStatus: ${selectedAlumnus.status}\nInstansi 1: ${selectedAlumnus.kampusInstansi || '-'} (${selectedAlumnus.prodiJabatan || '-'})\n` +
      (selectedAlumnus.kampusInstansi2 ? `Instansi 2: ${selectedAlumnus.kampusInstansi2} (${selectedAlumnus.prodiJabatan2 || '-'})\n` : '') +
      (selectedAlumnus.kampusInstansi3 ? `Instansi 3: ${selectedAlumnus.kampusInstansi3} (${selectedAlumnus.prodiJabatan3 || '-'})\n` : '') +
      `Kota: ${selectedAlumnus.kota || '-'}\nKontak: ${selectedAlumnus.kontak || '-'}`;
    
    navigator.clipboard.writeText(text);
    setCopiedId(selectedAlumnus.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered Alumni List
  const filteredAlumni = useMemo(() => {
    return alumni.filter((alumnus) => {
      // Search term
      const searchLower = filters.search.toLowerCase();
      const matchSearch =
        filters.search === '' ||
        alumnus.name.toLowerCase().includes(searchLower) ||
        alumnus.kampusInstansi.toLowerCase().includes(searchLower) ||
        alumnus.prodiJabatan.toLowerCase().includes(searchLower) ||
        (alumnus.kampusInstansi2 && alumnus.kampusInstansi2.toLowerCase().includes(searchLower)) ||
        (alumnus.prodiJabatan2 && alumnus.prodiJabatan2.toLowerCase().includes(searchLower)) ||
        (alumnus.kampusInstansi3 && alumnus.kampusInstansi3.toLowerCase().includes(searchLower)) ||
        (alumnus.prodiJabatan3 && alumnus.prodiJabatan3.toLowerCase().includes(searchLower)) ||
        alumnus.kota.toLowerCase().includes(searchLower);

      // Angkatan filter
      const matchAngkatan = filters.angkatan === 'All' || alumnus.angkatan === filters.angkatan;

      // Gender filter
      const matchGender = filters.gender === 'All' || alumnus.gender === filters.gender;

      // Campus filter
      const matchKampus =
        filters.kampus === 'All' ||
        alumnus.kampusInstansi === filters.kampus ||
        alumnus.kampusInstansi2 === filters.kampus ||
        alumnus.kampusInstansi3 === filters.kampus;

      // Jurusan filter
      const matchJurusan =
        filters.jurusan === 'All' ||
        (alumnus.prodiJabatan && alumnus.prodiJabatan.split('/').map(p => p.trim().toLowerCase()).includes(filters.jurusan.toLowerCase())) ||
        (alumnus.prodiJabatan2 && alumnus.prodiJabatan2.split('/').map(p => p.trim().toLowerCase()).includes(filters.jurusan.toLowerCase())) ||
        (alumnus.prodiJabatan3 && alumnus.prodiJabatan3.split('/').map(p => p.trim().toLowerCase()).includes(filters.jurusan.toLowerCase()));

      return matchSearch && matchAngkatan && matchGender && matchKampus && matchJurusan;
    });
  }, [alumni, filters]);

  // Animation layout variants
  const listVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 120 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
  };

  return (
    <div className="space-y-5 pb-24" id="directory-section">
      {/* Search & Filter Header Card */}
      <div className="bg-slate-900/60 border border-slate-800 backdrop-blur rounded-2xl p-4 shadow-sm space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Cari nama, jurusan, kampus, atau kota..."
            className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition-all duration-200"
            id="search-alumni-input"
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ ...filters, search: '' })}
              className="absolute right-3 top-2.5 bg-slate-800 text-slate-400 hover:text-slate-100 px-1.5 py-0.5 rounded-md text-xs transition-colors cursor-pointer"
            >
              ×
            </button>
          )}
        </div>

        {/* Dropdown Filters row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Angkatan graduation filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Angkatan</label>
            <div className="relative">
              <select
                value={filters.angkatan}
                onChange={(e) => setFilters({ ...filters, angkatan: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs rounded-xl py-2.5 px-3 appearance-none focus:border-emerald-500 outline-none transition-all duration-200"
                id="filter-angkatan-select"
              >
                <option value="All">Semua Angkatan (All)</option>
                {angkatanOptions.filter(o => o !== 'All').map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-3.5 pointer-events-none w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-slate-500" />
            </div>
          </div>

          {/* Gender Filter with custom symbols */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Gender</label>
            <div className="relative">
              <select
                value={filters.gender}
                onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs rounded-xl py-2.5 px-3 appearance-none focus:border-emerald-500 outline-none transition-all duration-200"
                id="filter-gender-select"
              >
                <option value="All">Semua Gender (All)</option>
                <option value="Laki-laki">♂ Laki-laki</option>
                <option value="Perempuan">♀ Perempuan</option>
              </select>
              <div className="absolute right-3 top-3.5 pointer-events-none w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-slate-500" />
            </div>
          </div>

          {/* Campus Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Kampus / Instansi</label>
            <div className="relative">
              <select
                value={filters.kampus}
                onChange={(e) => setFilters({ ...filters, kampus: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs rounded-xl py-2.5 px-3 appearance-none focus:border-emerald-500 outline-none transition-all duration-200"
                id="filter-campus-select"
              >
                <option value="All">Semua Kampus (All)</option>
                {kampusOptions.filter(o => o !== 'All').map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-3.5 pointer-events-none w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-slate-500" />
            </div>
          </div>

          {/* Jurusan Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Jurusan / Prodi</label>
            <div className="relative">
              <select
                value={filters.jurusan}
                onChange={(e) => setFilters({ ...filters, jurusan: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs rounded-xl py-2.5 px-3 appearance-none focus:border-emerald-500 outline-none transition-all duration-200"
                id="filter-jurusan-select"
              >
                <option value="All">Semua Jurusan (All)</option>
                {jurusanOptions.filter(o => o !== 'All').map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-3.5 pointer-events-none w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-slate-500" />
            </div>
          </div>
        </div>

        {/* Clear Filters Button & Counter */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <span className="text-slate-400 font-mono">
            Ditemukan: <span className="text-emerald-400 font-bold">{filteredAlumni.length}</span> alumni
          </span>
          {(filters.angkatan !== 'All' || filters.gender !== 'All' || filters.kampus !== 'All' || filters.jurusan !== 'All' || filters.search !== '') && (
            <button
              onClick={resetFilters}
              className="text-slate-400 hover:text-rose-400 flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-slate-950 hover:bg-slate-950/80 border border-slate-800 transition-colors"
              id="clear-filters-btn"
            >
              <FilterX className="h-3.5 w-3.5" />
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Alumni Cards Stack */}
      <AnimatePresence mode="popLayout">
        {filteredAlumni.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-900/40 border border-slate-850 rounded-2xl p-12 text-center"
          >
            <div className="mx-auto h-12 w-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-300">Data Alumni Tidak Ditemukan</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Cobalah untuk merubah parameter pencarian atau menyetel ulang filter dropdown yang Anda pilih.
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-xl text-xs font-semibold border border-emerald-500/30 transition-all duration-300"
            >
              Reset Semua Filter
            </button>
          </motion.div>
        ) : (
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            id="alumni-cards-grid"
          >
            {filteredAlumni.map((alumnus) => {
              // Status Styling
              let statusColor = 'bg-slate-500/10 text-slate-400 border-slate-800';
              if (alumnus.status === 'Kuliah') {
                statusColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
              } else if (alumnus.status === 'Bekerja') {
                statusColor = 'bg-teal-500/10 text-teal-400 border-teal-500/20';
              } else if (alumnus.status === 'Wirausaha') {
                statusColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
              } else if (alumnus.status === 'Mengabdi') {
                statusColor = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
              }

              // Gender badge configuration
              const isMale = alumnus.gender === 'Laki-laki';

              return (
                <motion.div
                  key={alumnus.id}
                  variants={cardVariants}
                  layoutId={`alumni-card-${alumnus.id}`}
                  onClick={() => setSelectedAlumnus(alumnus)}
                  className="bg-slate-900/60 border border-slate-850 hover:border-slate-750 backdrop-blur rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden cursor-pointer hover:scale-[1.01] active:scale-[0.99] hover:bg-slate-900/80"
                >
                  {/* Subtle color highlight per status on card top boundary */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${
                    alumnus.status === 'Kuliah' ? 'bg-emerald-500' :
                    alumnus.status === 'Bekerja' ? 'bg-teal-500' :
                    alumnus.status === 'Wirausaha' ? 'bg-amber-500' :
                    alumnus.status === 'Mengabdi' ? 'bg-indigo-500' : 'bg-slate-500'
                  }`} />

                  {/* Top Information Row */}
                  <div className="space-y-3">
                    <div className="flex gap-4 items-start">
                      {/* Avatar/Photo Column */}
                      <div className="shrink-0">
                        {alumnus.foto ? (
                          <div className="relative group/photo">
                            <img
                              src={getDirectImageUrl(alumnus.foto)}
                              alt={alumnus.name}
                              className="h-16 w-16 rounded-xl object-cover border border-slate-800 shadow-md transition-transform duration-300 group-hover/photo:scale-105"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        ) : (
                          <div className={`h-16 w-16 rounded-xl border flex flex-col items-center justify-center text-sm font-bold shadow-sm ${
                            isMale 
                              ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
                              : 'bg-pink-500/10 border-pink-500/20 text-pink-400'
                          }`}>
                            {alumnus.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Name and Status Column */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            {/* Name with Gender Icon Badge */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-sm font-bold text-white tracking-tight group-hover:text-emerald-400 transition-colors duration-200 truncate">
                                {alumnus.name}
                              </h4>
                              
                              {/* Male/Female emblem */}
                              {isMale ? (
                                <span className="inline-flex items-center justify-center bg-blue-500/15 border border-blue-500/30 text-blue-400 h-5 w-5 rounded-full text-[10px] font-bold" title="Laki-laki">
                                  ♂
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center bg-pink-500/15 border border-pink-500/30 text-pink-400 h-5 w-5 rounded-full text-[10px] font-bold" title="Perempuan">
                                  ♀
                                </span>
                              )}
                            </div>

                            {/* Angkatan & Graduation Year label */}
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                              <Calendar className="h-3 w-3 text-slate-500 shrink-0" />
                              {alumnus.angkatan}
                            </span>
                          </div>

                          {/* Status Tag */}
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border shrink-0 ${statusColor}`}>
                            {alumnus.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Placements info */}
                    <div className="space-y-2 pt-2 border-t border-slate-850/80 text-xs">
                      {/* Campus or Workplace - Option 1 */}
                      <div className="flex items-start gap-2">
                        <Building2 className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-slate-300 font-medium leading-tight flex items-center flex-wrap gap-1">
                            {alumnus.kampusInstansi || '-'}
                            {alumnus.pendidikanStatus && (
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border ${
                                alumnus.pendidikanStatus === 'Completed'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              }`}>
                                {alumnus.pendidikanStatus}
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {alumnus.prodiJabatan || '-'}
                          </p>
                        </div>
                      </div>

                      {/* Campus or Workplace - Option 2 */}
                      {alumnus.kampusInstansi2 && (
                        <div className="flex items-start gap-2 pt-1 border-t border-slate-850/30">
                          <Building2 className="h-4 w-4 text-slate-600 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-slate-300 font-medium leading-tight flex items-center flex-wrap gap-1">
                              {alumnus.kampusInstansi2}
                              {alumnus.pendidikanStatus2 && (
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border ${
                                  alumnus.pendidikanStatus2 === 'Completed'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                }`}>
                                  {alumnus.pendidikanStatus2}
                                </span>
                              )}
                            </p>
                            {alumnus.prodiJabatan2 && (
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                {alumnus.prodiJabatan2}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Campus or Workplace - Option 3 */}
                      {alumnus.kampusInstansi3 && (
                        <div className="flex items-start gap-2 pt-1 border-t border-slate-850/30">
                          <Building2 className="h-4 w-4 text-slate-600 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-slate-300 font-medium leading-tight flex items-center flex-wrap gap-1">
                              {alumnus.kampusInstansi3}
                              {alumnus.pendidikanStatus3 && (
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border ${
                                  alumnus.pendidikanStatus3 === 'Completed'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                }`}>
                                  {alumnus.pendidikanStatus3}
                                </span>
                              )}
                            </p>
                            {alumnus.prodiJabatan3 && (
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                {alumnus.prodiJabatan3}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Location & Contact row */}
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                          <span className="text-slate-300 font-medium truncate">{alumnus.kota}</span>
                        </div>

                        {alumnus.kontak && (
                          <div className="flex items-center gap-1.5 min-w-0 text-emerald-400 hover:text-emerald-300 transition-colors">
                            <PhoneCall className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                            <span className="font-mono truncate">{alumnus.kontak}</span>
                          </div>
                        )}
                      </div>

                      {/* Social Media Links */}
                      {(alumnus.instagram || alumnus.linkedin) && (
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-850/40">
                          {alumnus.instagram && (
                            <a
                              href={`https://instagram.com/${alumnus.instagram.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-[10px] text-pink-400 hover:text-pink-300 transition-colors bg-pink-500/10 px-2 py-0.5 rounded-lg border border-pink-500/10"
                            >
                              <Instagram className="h-3 w-3" />
                              <span className="font-medium truncate max-w-[120px]">{alumnus.instagram}</span>
                            </a>
                          )}
                          {alumnus.linkedin && (
                            <a
                              href={alumnus.linkedin.startsWith('http') ? alumnus.linkedin : `https://linkedin.com/in/${alumnus.linkedin}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/10"
                            >
                              <Linkedin className="h-3 w-3" />
                              <span className="font-medium truncate max-w-[120px]">LinkedIn</span>
                            </a>
                          )}
                        </div>
                      )}

                      {/* Foto Keterangan Quote */}
                      {alumnus.fotoKeterangan && (
                        <div className="mt-2 text-[11px] text-slate-400 italic bg-slate-950/40 p-2 rounded-lg border border-slate-850/50 flex items-start gap-1">
                          <span className="text-emerald-400 font-serif text-xs leading-none">“</span>
                          <p className="line-clamp-2 leading-normal">{alumnus.fotoKeterangan}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Admin Specific Actions */}
                  {isAdmin && onEdit && onDelete && (
                    <div className="flex items-center justify-end gap-2 pt-3 mt-4 border-t border-slate-850">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(alumnus);
                        }}
                        className="bg-slate-850 hover:bg-slate-750 text-slate-200 border border-slate-750 hover:border-slate-650 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Yakin ingin menghapus alumni "${alumnus.name}"?`)) {
                            onDelete(alumnus.id);
                          }
                        }}
                        className="bg-rose-950/30 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-900/50 hover:border-rose-500 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detailed Profile Modal */}
      {createPortal(
        <AnimatePresence>
          {selectedAlumnus && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
              {/* Backdrop with elegant blur */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedAlumnus(null)}
                className="fixed inset-0 bg-slate-950/85 backdrop-blur-md cursor-pointer"
              />

              {/* Modal Body Card with a modern slate-glass design */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl z-[10000] flex flex-col max-h-[85vh] sm:max-h-[90vh]"
              >
              {/* Cover Status Glow Banner */}
              <div className={`absolute top-0 left-0 right-0 h-32 opacity-40 pointer-events-none blur-2xl ${
                selectedAlumnus.status === 'Kuliah' ? 'bg-emerald-500/25' :
                selectedAlumnus.status === 'Bekerja' ? 'bg-teal-500/25' :
                selectedAlumnus.status === 'Wirausaha' ? 'bg-amber-500/25' :
                selectedAlumnus.status === 'Mengabdi' ? 'bg-indigo-500/25' : 'bg-slate-500/25'
              }`} />

              {/* Close Button */}
              <button
                onClick={() => setSelectedAlumnus(null)}
                className="absolute top-4 right-4 bg-slate-950/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-400 hover:text-white p-2 rounded-xl transition-all duration-200 z-20"
                title="Tutup"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Scrollable Content Container */}
              <div className="overflow-y-auto flex-1 p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 z-10 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                {/* Header Profile Row */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 pt-4">
                  {/* Big Photo Container */}
                  <div className="shrink-0">
                    {selectedAlumnus.foto ? (
                      <div className="relative group/modal-photo">
                        <img
                          src={getDirectImageUrl(selectedAlumnus.foto)}
                          alt={selectedAlumnus.name}
                          className="h-28 w-28 md:h-32 md:w-32 rounded-2xl object-cover border-2 border-slate-700 shadow-xl"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-slate-950/10 rounded-2xl group-hover/modal-photo:bg-transparent transition-colors duration-200" />
                      </div>
                    ) : (
                      <div className={`h-28 w-28 md:h-32 md:w-32 rounded-2xl border-2 flex flex-col items-center justify-center text-3xl font-extrabold shadow-xl ${
                        selectedAlumnus.gender === 'Laki-laki'
                          ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
                          : 'bg-pink-500/10 border-pink-500/30 text-pink-400'
                      }`}>
                        {selectedAlumnus.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Name, Angkatan & Status Header */}
                  <div className="min-w-0 flex-1 text-center md:text-left space-y-2.5">
                    <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                      <h3 className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight">
                        {selectedAlumnus.name}
                      </h3>
                      {selectedAlumnus.gender === 'Laki-laki' ? (
                        <span className="inline-flex items-center justify-center bg-blue-500/15 border border-blue-500/35 text-blue-400 h-6 w-6 rounded-full text-xs font-bold" title="Laki-laki">
                          ♂
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center bg-pink-500/15 border border-pink-500/35 text-pink-400 h-6 w-6 rounded-full text-xs font-bold" title="Perempuan">
                          ♀
                        </span>
                      )}
                    </div>

                    {/* Meta rows */}
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1.5 bg-slate-950/40 border border-slate-850 px-2.5 py-1 rounded-lg">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        {selectedAlumnus.angkatan}
                      </span>
                      {selectedAlumnus.kota && (
                        <span className="inline-flex items-center gap-1.5 bg-slate-950/40 border border-slate-850 px-2.5 py-1 rounded-lg">
                          <MapPin className="h-3.5 w-3.5 text-slate-500" />
                          {selectedAlumnus.kota}
                        </span>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="flex justify-center md:justify-start pt-1">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                        selectedAlumnus.status === 'Kuliah' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        selectedAlumnus.status === 'Bekerja' ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' :
                        selectedAlumnus.status === 'Wirausaha' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        selectedAlumnus.status === 'Mengabdi' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        Status: {selectedAlumnus.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Kesan & Pesan / Quote */}
                {selectedAlumnus.fotoKeterangan && (
                  <div className="bg-slate-950/45 border border-slate-850/80 p-5 rounded-2xl relative overflow-hidden group">
                    <div className="absolute -top-4 -right-2 p-4 opacity-5 pointer-events-none font-serif text-9xl text-emerald-400">“</div>
                    <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block mb-1">Kesan &amp; Pesan</span>
                    <p className="text-slate-200 italic leading-relaxed text-sm relative z-10">
                      “{selectedAlumnus.fotoKeterangan}”
                    </p>
                  </div>
                )}

                {/* Timeline Pendidikan & Karir */}
                <div className="bg-slate-950/20 border border-slate-850/60 p-5 rounded-2xl space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-emerald-400" />
                    Riwayat Studi &amp; Karir
                  </h4>
                  <div className="space-y-6 relative border-l border-slate-800/80 pl-4 ml-2 pt-1">
                    {/* Option 1 */}
                    {selectedAlumnus.kampusInstansi && (
                      <div className="relative">
                        <div className="absolute -left-[21px] top-1 bg-emerald-500 h-2.5 w-2.5 rounded-full border border-slate-900 ring-4 ring-emerald-500/15" />
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Opsi 1 (Utama)</span>
                          {selectedAlumnus.pendidikanStatus && (
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border ${
                              selectedAlumnus.pendidikanStatus === 'Completed'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}>
                              {selectedAlumnus.pendidikanStatus}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-white mt-1">{selectedAlumnus.kampusInstansi}</p>
                        {selectedAlumnus.prodiJabatan && (
                          <p className="text-xs text-slate-400 mt-0.5">{selectedAlumnus.prodiJabatan}</p>
                        )}
                      </div>
                    )}

                    {/* Option 2 */}
                    {selectedAlumnus.kampusInstansi2 && (
                      <div className="relative">
                        <div className="absolute -left-[21px] top-1 bg-blue-500 h-2.5 w-2.5 rounded-full border border-slate-900 ring-4 ring-blue-500/15" />
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Opsi 2</span>
                          {selectedAlumnus.pendidikanStatus2 && (
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border ${
                              selectedAlumnus.pendidikanStatus2 === 'Completed'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}>
                              {selectedAlumnus.pendidikanStatus2}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-white mt-1">{selectedAlumnus.kampusInstansi2}</p>
                        {selectedAlumnus.prodiJabatan2 && (
                          <p className="text-xs text-slate-400 mt-0.5">{selectedAlumnus.prodiJabatan2}</p>
                        )}
                      </div>
                    )}

                    {/* Option 3 */}
                    {selectedAlumnus.kampusInstansi3 && (
                      <div className="relative">
                        <div className="absolute -left-[21px] top-1 bg-purple-500 h-2.5 w-2.5 rounded-full border border-slate-900 ring-4 ring-purple-500/15" />
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Opsi 3</span>
                          {selectedAlumnus.pendidikanStatus3 && (
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border ${
                              selectedAlumnus.pendidikanStatus3 === 'Completed'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}>
                              {selectedAlumnus.pendidikanStatus3}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-white mt-1">{selectedAlumnus.kampusInstansi3}</p>
                        {selectedAlumnus.prodiJabatan3 && (
                          <p className="text-xs text-slate-400 mt-0.5">{selectedAlumnus.prodiJabatan3}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Hubungi & Social Media Media Pills */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-2">Kontak &amp; Sosial Media</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Phone/WhatsApp */}
                    {selectedAlumnus.kontak && (
                      <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex items-center justify-between gap-3 group">
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase block mb-0.5">WhatsApp / No. HP</span>
                          <span className="text-xs font-mono text-white block truncate">{selectedAlumnus.kontak}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Direct WA Chat icon */}
                          {/^[0-9+-\s]+$/.test(selectedAlumnus.kontak.replace(/\s+/g, '')) && (
                            <a
                              href={`https://wa.me/${selectedAlumnus.kontak.replace(/[^0-9]/g, '').replace(/^0/, '62')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/20 text-emerald-400 p-2 rounded-lg transition-all"
                              title="Hubungi di WhatsApp"
                            >
                              <PhoneCall className="h-3.5 w-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(selectedAlumnus.kontak);
                              setCopiedId('kontak');
                              setTimeout(() => setCopiedId(null), 1500);
                            }}
                            className="bg-slate-850 hover:bg-slate-750 border border-slate-750 hover:border-slate-650 text-slate-300 p-2 rounded-lg transition-all"
                            title="Salin Kontak"
                          >
                            {copiedId === 'kontak' ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Instagram */}
                    {selectedAlumnus.instagram && (
                      <a
                        href={`https://instagram.com/${selectedAlumnus.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-slate-950/40 border border-slate-850 hover:border-pink-500/30 p-4 rounded-xl flex items-center justify-between gap-3 group transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase block mb-0.5">Instagram</span>
                          <span className="text-xs text-white font-medium block truncate">{selectedAlumnus.instagram}</span>
                        </div>
                        <div className="bg-pink-500/10 text-pink-400 p-2 rounded-lg border border-pink-500/10 shrink-0 group-hover:bg-pink-500/20 transition-all">
                          <Instagram className="h-3.5 w-3.5" />
                        </div>
                      </a>
                    )}

                    {/* LinkedIn */}
                    {selectedAlumnus.linkedin && (
                      <a
                        href={selectedAlumnus.linkedin.startsWith('http') ? selectedAlumnus.linkedin : `https://linkedin.com/in/${selectedAlumnus.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-slate-950/40 border border-slate-850 hover:border-blue-500/30 p-4 rounded-xl flex items-center justify-between gap-3 group transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase block mb-0.5">LinkedIn</span>
                          <span className="text-xs text-white font-medium block truncate">Tampilkan Profil</span>
                        </div>
                        <div className="bg-blue-500/10 text-blue-400 p-2 rounded-lg border border-blue-500/10 shrink-0 group-hover:bg-blue-500/20 transition-all">
                          <Linkedin className="h-3.5 w-3.5" />
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 sm:p-6 bg-slate-950/50 border-t border-slate-850 flex items-center justify-between gap-3 z-10">
                <button
                  onClick={handleCopyProfile}
                  className="inline-flex items-center gap-2 bg-slate-850 hover:bg-slate-750 text-slate-300 border border-slate-750 hover:border-slate-650 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200"
                >
                  {copiedId === selectedAlumnus.id ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      Tersalin!
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4" />
                      Bagikan Profil
                    </>
                  )}
                </button>

                <button
                  onClick={() => setSelectedAlumnus(null)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 shadow-lg shadow-emerald-500/15 hover:shadow-emerald-500/25"
                >
                  Tutup
                </button>
              </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
