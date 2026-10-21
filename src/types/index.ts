export type Role = 'admin' | 'pengawas' | 'kepsek' | 'guru';

export interface School {
  id: string;
  npsn: string;
  name: string;
  address: string;
  principalName: string;
  accreditation: 'A' | 'B' | 'C' | 'Belum Terakreditasi';
  createdAt: string;
  createdBy: string;
}

export interface UserProfile {
  uid: string;
  username?: string;
  password?: string;
  email: string;
  displayName: string;
  role: Role;
  schoolId?: string;
  schoolName?: string;
  nip?: string;
  phone?: string;
  subject?: string;
  approvalStatus?: 'approved' | 'pending' | 'rejected';
  createdAt: string;
  updatedAt?: string;
}

// 1. Telaah Perencanaan Pembelajaran Item (22 items from official instrument PDF)
export interface TelaahItem {
  id: number;
  category: string;
  aspect: string;
  isOptional?: boolean;
}

// 2. Observasi Kelas Item (Categories with Ya / Tidak + Catatan)
export interface ObservasiItemDef {
  id: string;
  category: string;
  aspect: string;
}

// Supervision document structure
export interface Supervision {
  id: string;
  schoolId: string;
  schoolName: string;
  teacherId: string;
  teacherName: string;
  teacherNip: string;
  subject: string;
  classGrade: string; // e.g. "Fase E / Kelas X-A"
  semester: 'Ganjil' | 'Genap';
  schoolYear: string; // e.g. "2025/2026"
  lessonTitle: string;
  status: 'draft' | 'submitted' | 'in_progress' | 'completed';
  supervisorId: string;
  supervisorName: string;
  supervisorRole: Role;
  createdAt: string;
  updatedAt: string;
  isNewSupervision?: boolean;

  // A. Perangkat Ajar & Drive Links
  perangkatAjar: {
    driveLinks: {
      cpTpAtpUrl: string;
      modulAjarUrl: string;
      bahanAjarUrl?: string;
      asesmenUrl?: string;
    };
    submittedAt?: string;
    telaahScores: Record<number, number | 'NA'>; // 0, 1, 2 or 'NA'
    telaahComments: Record<number, string>;
    telaahSummary: {
      totalScore: number;
      maxPossibleScore: number;
      finalScore: number; // 0 - 100
      predicate: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Perbaikan';
    };
    feedback: {
      kelebihan: string;
      perbaikan: string;
      rekomendasi: string;
    };
    reviewedAt?: string;
    reviewedBy?: string;
    revisi?: {
      modulAjarRevisiUrl?: string;
      catatanRevisiGuru?: string;
      revisiSubmittedAt?: string;
      revisiStatus?: 'belum_diunggah' | 'sudah_diunggah' | 'disetujui';
      revisiFeedback?: string;
    };
  };

  // B. Pra-Observasi
  praObservasi: {
    interviewDurationMinutes: number;
    q1_kd_indikator: string;
    q2_metode: string;
    q3_alat_bahan: string;
    q4_tahapan: string;
    q5_persiapan: string;
    q6_materi_sulit: string;
    q7_target_kompetensi: string;
    q8_perhatian_khusus: string;
    supervisorNotes: string;
    completedAt?: string;
  };

  // C. Observasi Kelas (25 Aspek Sesuai PDF Halaman 9-13, Skala 0, 1, 2)
  observasiKelas: {
    items: Record<string, { status?: 'Ya' | 'Tidak'; score?: number; note: string }>;
    totalYa?: number;
    totalAspek: number;
    totalSkor?: number;
    score: number; // percentage (0 - 100)
    predicate: string;
    feedbackNotes?: string;
    feedback?: {
      kelebihan?: string;
      peningkatan?: string;
      rekomendasi?: string;
    };
    completedAt?: string;
  };

  // D. Pasca-Observasi
  pascaObservasi: {
    q1_kesan: string;
    q2_sesuai_rencana: string;
    q3_hal_memuaskan: string;
    q4_hal_kurang: string;
    q5_ketercapaian_tujuan: string;
    q6_kesulitan_siswa: string;
    q7_alternatif_solusi: string;
    q8_rencana_tindak_lanjut: string;
    q9_pengembangan_diri: string;
    generalImpression: string;
    recommendations: string;
    completedAt?: string;
  };

  // E. Evaluasi 1 Tahun Pelajaran
  evaluasiTahunan: {
    hasilBelajar: { evidence: string; note: string; score: number };
    administrasi: { evidence: string; note: string; score: number };
    pengembanganDiri: { evidence: string; note: string; score: number };
    kedisiplinan: { evidence: string; note: string; score: number };
    rekomendasi: { notes: string; tindakLanjut: string; score: number };
    finalAverageScore: number;
    finalGrade: string;
    summaryNotes: string;
    completedAt?: string;
  };

  // F. Data Supervisi Setelah Ada Perbaikan (Tahap Uji SAMBUNG)
  perangkatAjarPerbaikan?: {
    driveLinks?: {
      cpTpAtpUrl?: string;
      modulAjarUrl?: string;
      bahanAjarUrl?: string;
      asesmenUrl?: string;
    };
    submittedAt?: string;
    telaahScores?: Record<number, number | 'NA'>;
    telaahComments?: Record<number, string>;
    telaahSummary?: {
      totalScore: number;
      maxPossibleScore: number;
      finalScore: number;
      predicate: string;
    };
    feedback?: {
      kelebihan: string;
      perbaikan: string;
      rekomendasi: string;
    };
    catatanRevisiGuru?: string;
    reviewedAt?: string;
    reviewedBy?: string;
  };

  praObservasiPerbaikan?: {
    interviewDurationMinutes: number;
    q1_kd_indikator: string;
    q2_metode: string;
    q3_alat_bahan: string;
    q4_tahapan: string;
    q5_persiapan: string;
    q6_materi_sulit: string;
    q7_target_kompetensi: string;
    q8_perhatian_khusus: string;
    supervisorNotes: string;
    completedAt?: string;
  };

  observasiKelasPerbaikan?: {
    items: Record<string, { status?: 'Ya' | 'Tidak'; score?: number; note: string }>;
    totalYa?: number;
    totalAspek: number;
    totalSkor?: number;
    score: number;
    predicate: string;
    feedbackNotes?: string;
    feedback?: {
      kelebihan?: string;
      peningkatan?: string;
      rekomendasi?: string;
    };
    completedAt?: string;
  };

  pascaObservasiPerbaikan?: {
    q1_kesan: string;
    q2_sesuai_rencana: string;
    q3_hal_memuaskan: string;
    q4_hal_kurang: string;
    q5_ketercapaian_tujuan: string;
    q6_kesulitan_siswa: string;
    q7_alternatif_solusi: string;
    q8_rencana_tindak_lanjut: string;
    q9_pengembangan_diri: string;
    generalImpression: string;
    recommendations: string;
    completedAt?: string;
  };

  // G. Instrumen Strategi SAMBUNG (Sistem Informasi Pengawasan, Pendampingan, dan Evaluasi Guru SMA)
  sambung?: SambungData;
}

// ==========================================
// TIPE DATA LENGKAP STRATEGI SAMBUNG
// ==========================================

export interface SambungAspekPemetaan {
  id: number;
  aspek: string;
  kondisiAwal: string;
  bukti: string;
  kebutuhanPembinaan: string;
  isPrioritas?: boolean;
}

export interface SambungKegiatanAksi {
  id: number;
  fokusIndikator?: 'peranGuru' | 'aktivitasMurid' | 'konteksNyata' | 'refleksiMurid' | string;
  kegiatanPembinaan: string;
  indikatorKeberhasilan: string;
  waktu: string;
  penanggungJawab: string;
}

export interface SambungCoachingData {
  tujuan: string; // Pengalaman belajar seperti apa yang ingin diciptakan untuk murid?
  realitas: string; // Apa yang sudah berjalan baik? Bagaimana kita tahu murid benar-benar belajar?
  opsi: string; // Apa yang membuat pembelajaran bermakna bagi murid? Apa yang bisa dicoba?
  komitmen: string; // Langkah kecil apa yang akan dicoba? Dukungan apa yang dibutuhkan? Kapan kita tinjau?
}

// Instrumen Resmi MAKNAI: Coaching dan Refleksi Pasca Observasi (10 Pertanyaan sesuai PDF Pengawas)
export interface SambungMaknaiPertanyaanList {
  q1?: string; // Kesan setelah menyajikan pembelajaran (keterlibatan & antusiasme murid)
  q2?: string; // Kesesuaian proses dengan rencana (memahami, mengaplikasi, merefleksi)
  q3?: string; // Hal-hal memuaskan (murid aktif, menemukan makna, senang belajar)
  q4?: string; // Ketercapaian tujuan & bukti penilaian selama proses belajar
  q5?: string; // Kesulitan murid & tanggapan terhadap perbedaan kemampuan (diferensiasi)
  q6?: string; // Murid menilai proses dan hasil belajar melalui refleksi & umpan balik guru
  q7?: string; // Kesulitan Saudara dalam melaksanakan pembelajaran
  q8?: string; // Alternatif lain mengatasi kesulitan
  q9?: string; // Identifikasi hal mantap & perlu ditingkatkan (butir observasi bernilai 0 atau 1)
  q10?: string; // Rencana pertemuan berikutnya untuk memperkuat Pembelajaran Mendalam
  [key: string]: string | undefined;
}

export interface SambungMaknaiData {
  tanggal: string;
  pertanyaanList?: SambungMaknaiPertanyaanList;
  kesanUmum?: string;
  saranMasukan?: string;
  coaching?: SambungCoachingData;
}

export interface SambungSiklusBerdayakan {
  siklus: number;
  rancanganDanUjiCoba: string; // Rancangan dan hasil uji coba pada murid
  refleksi: string; // Refleksi (berhasil / belum, mengapa)
  perbaikanBerikutnya: string; // Perbaikan berikutnya
}

export interface SambungBerdayakanData {
  rppPerbaikanUrl?: string;
  rppPerbaikanTitle?: string;
  tanggalTelaah?: string;
  namaPenelaah?: string;
  telaahScores?: Record<number, number | 'NA'>;
  telaahComments?: Record<number, string>;
  telaahSummary?: {
    totalScore: number;
    maxPossibleScore: number;
    finalScore: number;
    predicate: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Perbaikan';
    kategoriDeskripsi?: string;
  };
  feedback?: {
    kelebihan: string;
    perbaikan: string;
    rekomendasi: string;
  };
  catatanRefleksiGuru?: string;
  siklusList: SambungSiklusBerdayakan[];
}

export interface SambungObservasiIndikator {
  id: number;
  indikator: string;
  dimensi: string;
  score: 0 | 1 | 2 | 3 | 4;
  catatan: string;
}

export interface SambungAngketMuridItem {
  id: number;
  pernyataan: string;
  skorRataRata: number; // 1 to 4
  persentaseSetuju: number; // % murid memilih 3 atau 4
}

// ==========================================
// INSTRUMEN RESMI TAHAP U • UJI
// Sesuai Dokumen Pengawas Pembina Kusnandar, M.Si
// ==========================================

export interface SambungUjiPraObservasi {
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  q6: string;
  q7: string;
  q8: string;
  supervisorNotes?: string;
  completedAt?: string;
}

export interface SambungUjiObservasiPelaksanaan {
  tanggal?: string;
  hariTanggal?: string;
  kelas?: string;
  items: Record<string, { score: number; note: string }>;
  totalSkor: number; // max 50
  maxPossibleScore: number; // 50
  persentaseCapaian: number; // 0-100%
  predicate: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Perbaikan';
  kategoriMakna?: string;
  feedback: {
    kelebihan: string;
    perbaikan: string;
    rekomendasi: string;
  };
  completedAt?: string;
}

export interface SambungUjiPascaObservasi {
  pertanyaanList: {
    q1: string;
    q2: string;
    q3: string;
    q4: string;
    q5: string;
    q6: string;
    q7: string;
    q8: string;
    q9: string;
    q10: string;
  };
  kesanUmum: string;
  saranMasukan: string;
  completedAt?: string;
}

export interface SambungUjiKesimpulanTransformasi {
  peranGuru: string;
  aktivitasMurid: string;
  konteksNyata: string;
  refleksiMurid: string;
}

export interface SambungUjiData {
  praObservasi?: SambungUjiPraObservasi;
  observasiPelaksanaan?: SambungUjiObservasiPelaksanaan;
  pascaObservasi?: SambungUjiPascaObservasi;
  kesimpulanUji?: SambungUjiKesimpulanTransformasi;
  // Field pendukung kompatibilitas:
  u1_observasi: {
    tanggal: string;
    hariTanggal: string;
    tahapObservasi: 'awal' | 'siklus' | 'akhir';
    kelas: string;
    indikatorList: SambungObservasiIndikator[];
    totalSkor: number;
    persentaseCapaian: number;
    apaYangDialamiMurid: string;
    kekuatanDanRekomendasi: string;
  };
  u2_angketMurid: {
    kodeMuridKelas: string;
    tanggal: string;
    jumlahResponden: number;
    items: SambungAngketMuridItem[];
    halPalingBermakna: string;
    kesulitanMurid: string;
  };
  matriksAfter?: SambungMatriksPerubahan;
}

export interface SambungBeforeAfterItem {
  aspek: string;
  sebelumSambung: string;
  setelahSambung: string;
  buktiKode?: string;
}

export interface SambungMatriksPerubahan {
  peranGuru: string;
  aktivitasMurid: string;
  konteksNyata: string;
  refleksiMurid: string;
}

export interface SambungDataDampakItem {
  indikator: string;
  awal: string;
  akhir: string; // Setelah SAMBUNG
  selisih?: string;
  sumber?: string;
  makna?: string;
  deskripsiPenilaian?: string; // Informasi deskriptif spesifik hasil penilaian guru
  buktiKegiatan?: string; // Bukti keterlaksanaan kegiatan di kelas guru
}

export interface SambungTindakLanjutItem {
  id: number;
  temuanSupervisi: string;
  tindakLanjut: string;
  penanggungJawab: string;
  waktu: string;
  hasil: string;
}

export interface SambungPengimbasanItem {
  id: number;
  praktikBaik: string;
  sasaran: string;
  bentuk: string; // MGMP, berbagi, publikasi
  waktu: string;
}

export interface SambungRtlNyatakanItem {
  id: number;
  indikator: string; // Aspek/Indikator dari Hasil Nyatakan & Kesimpulan Uji
  hasilNyatakan: string; // Deskripsi temuan Before vs After di Tahap Nyatakan & Kesimpulan Uji
  rencanaTindakLanjut: string; // Aksi tindak lanjut konkret guru
  mitraKolaborasi: string; // Kombel internal SMA, MGMP Kabupaten, KS, Pengawas Kusnandar, M.Si
  waktuPelaksanaan: string; // Linimasa pelaksanaan
  buktiKeberhasilan: string; // Bukti fisik / indikator ketercapaian
  rekomendasiSupervisi: string; // Rekomendasi keberlanjutan Pengawas Kusnandar, M.Si & KS
}

export interface SambungKesimpulanAlurSambung {
  selidikiBaseline: string; // Rangkuman S: Temuan telaah awal & baseline guru
  amatiObservasi: string; // Rangkuman A: Hasil observasi kelas awal & fokus prioritas
  maknaiCoaching: string; // Rangkuman M: Kesepakatan dialog coaching supervisor & komitmen guru
  berdayakanModul: string; // Rangkuman B: Desain modul ajar perbaikan berorientasi deep learning
  ujiPembuktian: string; // Rangkuman U: Pembuktian lapangan observasi 25 aspek, pra/pasca & suara murid
  nyatakanDampak: string; // Rangkuman N: Data dampak nyata Before vs After
  gerakkanKomitmen: string; // Rangkuman G: Rencana tindak lanjut & komitmen pengimbasan
  catatanPengawas: string; // Catatan resmi Pengawas Pembina Kusnandar, M.Si
  dukunganKepalaSekolah?: string; // Dukungan fasilitas & kebijakan kepala sekolah
}

export interface SambungData {
  // S - SELIDIKI
  selidiki: {
    tanggal: string;
    items: SambungAspekPemetaan[];
    catatanPrioritas?: string;
    matriksBefore?: SambungMatriksPerubahan;
  };
  // A - AMATI (Memilih fokus perbaikan dari empat indikator di Kesimpulan Selidiki)
  arahkan: {
    fokusIndikatorTerpilih?: ('peranGuru' | 'aktivitasMurid' | 'konteksNyata' | 'refleksiMurid' | string)[];
    analisisKesimpulanSelidiki?: {
      peranGuru?: string;
      aktivitasMurid?: string;
      konteksNyata?: string;
      refleksiMurid?: string;
    };
    targetPerbaikan?: {
      peranGuru?: string;
      aktivitasMurid?: string;
      konteksNyata?: string;
      refleksiMurid?: string;
    };
    alasanFokusPerbaikan?: string;
    periode: string;
    fokusPerubahan: string; // satu kalimat: berdasarkan kebutuhan, realistis, terukur, berdampak pada murid
    kegiatan: SambungKegiatanAksi[];
    tandaTangan?: {
      pengawas: string; // Kusnandar, M.Si
      kepalaSekolah: string;
      guru: string;
      tanggalDisepakati: string;
    };
  };
  // M - MAKNAI (Coaching dan Refleksi Pasca Observasi - 10 Pertanyaan)
  maknai: SambungMaknaiData;
  // B - BERDAYAKAN (Input RPP Perbaikan, Telaah Kembali Secara Otomatis, Siklus)
  berdayakan: SambungBerdayakanData;
  // U - UJI (Instrumen Resmi Pengawas: Pra-Observasi, Observasi 25 Aspek, Pasca-Observasi, Angket Murid, Kesimpulan Uji)
  uji: SambungUjiData;
  // N - NYATAKAN
  nyatakan: {
    beforeAfter: SambungBeforeAfterItem[];
    dataDampak: SambungDataDampakItem[];
  };
  // G - GERAKKAN (Buatkan Rencana Tindak Lanjut dari Hasil Nyatakan & Kesimpulan)
  gerakkan: {
    tindakLanjut: SambungTindakLanjutItem[];
    pengimbasan: SambungPengimbasanItem[];
    rtlNyatakan?: SambungRtlNyatakanItem[];
    kesimpulanAlurSambung?: SambungKesimpulanAlurSambung;
  };
  lastUpdated?: string;
}
