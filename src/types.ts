/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Alumnus {
  id: string;
  name: string;
  angkatan: string; // e.g., "Angkatan 1 (2018)"
  tahunLulus: number; // e.g., 2018
  gender: 'Laki-laki' | 'Perempuan';
  status: 'Kuliah' | 'Bekerja' | 'Wirausaha' | 'Mengabdi' | 'Lainnya';
  kampusInstansi: string; // e.g., "Universitas Gadjah Mada"
  prodiJabatan: string; // e.g., "Teknik Informatika"
  kota: string; // e.g., "Yogyakarta"
  kontak: string; // e.g., "081234567890" or "@instagram"
  foto?: string; // Base64 image data or URL link
  fotoKeterangan?: string; // Short caption or description of the photo/moment
  instagram?: string; // @username
  linkedin?: string; // profile URL or name
  createdAt: string;
  
  // New education status and optional second/third education options
  pendidikanStatus?: 'Ongoing' | 'Completed' | '';
  kampusInstansi2?: string;
  prodiJabatan2?: string;
  pendidikanStatus2?: 'Ongoing' | 'Completed' | '';
  kampusInstansi3?: string;
  prodiJabatan3?: string;
  pendidikanStatus3?: 'Ongoing' | 'Completed' | '';
  kategoriKampus?: 'PTN' | 'PTS' | 'PTLN' | 'PTMA' | 'Kedinasan' | '';
  kategoriKampus2?: 'PTN' | 'PTS' | 'PTLN' | 'PTMA' | 'Kedinasan' | '';
  kategoriKampus3?: 'PTN' | 'PTS' | 'PTLN' | 'PTMA' | 'Kedinasan' | '';
}

export type UserRole = 'Guest' | 'Admin';

export interface FilterState {
  angkatan: string; // "All" or exact angkatan name
  gender: string; // "All", "Laki-laki", "Perempuan"
  kampus: string; // "All" or exact campus name
  jurusan: string; // "All" or exact major name
  search: string;
}

export type ActiveTab = 'dashboard' | 'directory' | 'admin-panel';

/**
 * Normalizes image URLs, specifically converting Google Drive viewer/sharing URLs
 * into direct, raw image download endpoints (using lh3.googleusercontent.com)
 * so that they render perfectly inside <img> tags.
 */
export function getDirectImageUrl(url: string | undefined): string {
  if (!url) return '';
  if (url.startsWith('data:')) return url;

  // Match patterns:
  // - drive.google.com/file/d/FILE_ID/view...
  // - drive.google.com/open?id=FILE_ID
  // - drive.google.com/uc?id=FILE_ID
  // - docs.google.com/file/d/FILE_ID/...
  const driveFileRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const driveOpenRegex = /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/;
  const driveUcRegex = /drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/;
  const docsRegex = /docs\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;

  let fileId = '';
  const match1 = url.match(driveFileRegex);
  const match2 = url.match(driveOpenRegex);
  const match3 = url.match(driveUcRegex);
  const match4 = url.match(docsRegex);

  if (match1) fileId = match1[1];
  else if (match2) fileId = match2[1];
  else if (match3) fileId = match3[1];
  else if (match4) fileId = match4[1];

  if (fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  return url;
}

