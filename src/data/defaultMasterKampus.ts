/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MasterKampusItem {
  Nama_Kampus: string;
  Urutan: number;
  Kategori_Kampus: 'PTN' | 'PTS' | 'PTLN' | 'PTMA' | 'Kedinasan';
}

export const DEFAULT_MASTER_KAMPUS: MasterKampusItem[] = [
  // PTN
  { Nama_Kampus: "ITB", Urutan: 1, Kategori_Kampus: "PTN" },
  { Nama_Kampus: "UI", Urutan: 2, Kategori_Kampus: "PTN" },
  { Nama_Kampus: "UGM", Urutan: 3, Kategori_Kampus: "PTN" },
  { Nama_Kampus: "IPB", Urutan: 4, Kategori_Kampus: "PTN" },
  { Nama_Kampus: "ITS Surabaya", Urutan: 5, Kategori_Kampus: "PTN" },
  { Nama_Kampus: "UnPad", Urutan: 6, Kategori_Kampus: "PTN" },
  { Nama_Kampus: "Universitas Brawijaya", Urutan: 7, Kategori_Kampus: "PTN" },
  { Nama_Kampus: "Univ. Brawijaya", Urutan: 8, Kategori_Kampus: "PTN" },
  { Nama_Kampus: "UNDIP", Urutan: 9, Kategori_Kampus: "PTN" },
  { Nama_Kampus: "Univ. Hasanuddin", Urutan: 10, Kategori_Kampus: "PTN" },
  { Nama_Kampus: "Universitas Negeri Yogyakarta", Urutan: 11, Kategori_Kampus: "PTN" },
  { Nama_Kampus: "UNY", Urutan: 12, Kategori_Kampus: "PTN" },
  { Nama_Kampus: "Universitas Negeri Malang", Urutan: 13, Kategori_Kampus: "PTN" },
  { Nama_Kampus: "Univ. Negeri Malang", Urutan: 14, Kategori_Kampus: "PTN" },
  { Nama_Kampus: "UPI", Urutan: 15, Kategori_Kampus: "PTN" },
  { Nama_Kampus: "Universitas Andalas", Urutan: 16, Kategori_Kampus: "PTN" },
  { Nama_Kampus: "Universitas Jendral Soedirman", Urutan: 17, Kategori_Kampus: "PTN" },
  { Nama_Kampus: "UIN Jakarta", Urutan: 18, Kategori_Kampus: "PTN" },
  { Nama_Kampus: "UIN Bandung", Urutan: 19, Kategori_Kampus: "PTN" },
  { Nama_Kampus: "UIN Malang", Urutan: 20, Kategori_Kampus: "PTN" },
  { Nama_Kampus: "UIN Yogyakarta", Urutan: 21, Kategori_Kampus: "PTN" },
  { Nama_Kampus: "UIN Semarang", Urutan: 22, Kategori_Kampus: "PTN" },
  { Nama_Kampus: "UNJ", Urutan: 23, Kategori_Kampus: "PTN" },
  { Nama_Kampus: "Universitas Negeri Semarang", Urutan: 24, Kategori_Kampus: "PTN" },
  { Nama_Kampus: "Universitas Mataram", Urutan: 25, Kategori_Kampus: "PTN" },
  { Nama_Kampus: "UNTIRTA", Urutan: 26, Kategori_Kampus: "PTN" },
  { Nama_Kampus: "UNSIKA", Urutan: 27, Kategori_Kampus: "PTN" },
  { Nama_Kampus: "UT Pondok Cabe", Urutan: 28, Kategori_Kampus: "PTN" },
  { Nama_Kampus: "UT Banjarmasin", Urutan: 29, Kategori_Kampus: "PTN" },

  // PTS
  { Nama_Kampus: "Universitas Bina Nusantara", Urutan: 1, Kategori_Kampus: "PTS" },
  { Nama_Kampus: "Universitas Telkom", Urutan: 2, Kategori_Kampus: "PTS" },
  { Nama_Kampus: "UII", Urutan: 3, Kategori_Kampus: "PTS" },
  { Nama_Kampus: "Universitas Gunadarma", Urutan: 4, Kategori_Kampus: "PTS" },
  { Nama_Kampus: "Universitas Pancasila", Urutan: 5, Kategori_Kampus: "PTS" },
  { Nama_Kampus: "Universitas Pertamina", Urutan: 6, Kategori_Kampus: "PTS" },
  { Nama_Kampus: "UEU", Urutan: 7, Kategori_Kampus: "PTS" },
  { Nama_Kampus: "Universitas Pembangunan Jaya", Urutan: 8, Kategori_Kampus: "PTS" },
  { Nama_Kampus: "Institut Teknologi Indonesia", Urutan: 9, Kategori_Kampus: "PTS" },
  { Nama_Kampus: "Universitas Telkom Surabaya", Urutan: 10, Kategori_Kampus: "PTS" },
  { Nama_Kampus: "UMMI", Urutan: 11, Kategori_Kampus: "PTS" },
  { Nama_Kampus: "Universitas Binawan", Urutan: 12, Kategori_Kampus: "PTS" },
  { Nama_Kampus: "UnPam", Urutan: 13, Kategori_Kampus: "PTS" },
  { Nama_Kampus: "Politeknik Sahid", Urutan: 14, Kategori_Kampus: "PTS" },
  { Nama_Kampus: "STIKES RS Husada", Urutan: 15, Kategori_Kampus: "PTS" },
  { Nama_Kampus: "STIKes WDH", Urutan: 16, Kategori_Kampus: "PTS" },
  { Nama_Kampus: "STAIM Klaten", Urutan: 17, Kategori_Kampus: "PTS" },
  { Nama_Kampus: "Universitas Insan Cita Indonesia", Urutan: 18, Kategori_Kampus: "PTS" },
  { Nama_Kampus: "IBM Bekasi", Urutan: 19, Kategori_Kampus: "PTS" },
  { Nama_Kampus: "Budi Mulia Dua Culinary School", Urutan: 20, Kategori_Kampus: "PTS" },
  { Nama_Kampus: "STIM Budi Bakti", Urutan: 21, Kategori_Kampus: "PTS" },

  // PTLN
  { Nama_Kampus: "Al Azhar Kairo Mesir", Urutan: 1, Kategori_Kampus: "PTLN" },
  { Nama_Kampus: "Universitas Yarmouk Yordania", Urutan: 2, Kategori_Kampus: "PTLN" },
  { Nama_Kampus: "Darul Hadits Al Hassania Maroko", Urutan: 3, Kategori_Kampus: "PTLN" },
  { Nama_Kampus: "Libya", Urutan: 4, Kategori_Kampus: "PTLN" },
  { Nama_Kampus: "Jepang", Urutan: 5, Kategori_Kampus: "PTLN" },

  // PTMA
  { Nama_Kampus: "UMY", Urutan: 1, Kategori_Kampus: "PTMA" },
  { Nama_Kampus: "UHAMKA", Urutan: 2, Kategori_Kampus: "PTMA" },
  { Nama_Kampus: "UMJ", Urutan: 3, Kategori_Kampus: "PTMA" },
  { Nama_Kampus: "UM Purwokerto", Urutan: 4, Kategori_Kampus: "PTMA" },
  { Nama_Kampus: "Universitas Aisyiyah", Urutan: 5, Kategori_Kampus: "PTMA" },
  { Nama_Kampus: "UMT", Urutan: 6, Kategori_Kampus: "PTMA" },
  { Nama_Kampus: "STT Muhammadiyah", Urutan: 7, Kategori_Kampus: "PTMA" },
  { Nama_Kampus: "PUTM", Urutan: 8, Kategori_Kampus: "PTMA" },
  { Nama_Kampus: "UM Klaten", Urutan: 9, Kategori_Kampus: "PTMA" },

  // Kedinasan
  { Nama_Kampus: "TNI AD", Urutan: 1, Kategori_Kampus: "Kedinasan" },
  { Nama_Kampus: "PKN STAN", Urutan: 2, Kategori_Kampus: "Kedinasan" },
  { Nama_Kampus: "IPDN", Urutan: 3, Kategori_Kampus: "Kedinasan" },
  { Nama_Kampus: "Politeknik Statistika STIS", Urutan: 4, Kategori_Kampus: "Kedinasan" },
  { Nama_Kampus: "Poltekip", Urutan: 5, Kategori_Kampus: "Kedinasan" },
  { Nama_Kampus: "Poltekim", Urutan: 6, Kategori_Kampus: "Kedinasan" },
  { Nama_Kampus: "STMKG", Urutan: 7, Kategori_Kampus: "Kedinasan" },
  { Nama_Kampus: "STIN", Urutan: 8, Kategori_Kampus: "Kedinasan" }
];
