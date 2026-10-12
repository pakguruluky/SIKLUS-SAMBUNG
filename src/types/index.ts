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
  score: 1 | 2 | 3 | 4;
  catatan: string;
}

export interface SambungAngketMuridItem {
  id: number;
  pernyataan: string;
  skorRataRata: number; // 1 to 4
  persentaseSetuju: number; // % murid memilih 3 atau 4
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
export interface SambungUjiData {
  // 1. Pra Observasi Uji (8 Pertanyaan Sesuai PDF Hal 1)
  praObservasi?: {
    tanggal?: string;
    interviewDurationMinutes?: number;
    answers: Record<string, string>; // q1 to q8
    supervisorNotes?: string;
  };

  // 2. Observasi Pelaksanaan Pembelajaran Uji (25 Aspek Sesuai PDF Hal 2-5)
  observasiPelaksanaan?: {
    tanggal?: string;
    hariTanggal?: string;
    kelas?: string;
    scores: Record<string, number>; // '1' to '25', skala 0, 1, 2
    comments: Record<string, string>; // '1' to '25'
    totalScore: number; // max 50
    finalScore: number; // 0 - 100
    predicate: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Perbaikan';
    feedback: {
      kelebihan: string;
      perbaikan: string;
      rekomendasi: string;
    };
  };

  // 3. Coaching dan Refleksi Pasca Observasi Uji (10 Pertanyaan Sesuai PDF Hal 6-7)
  pascaObservasi?: {
    tanggal?: string;
    answers: Record<string, string>; // q1 to q10
    kesanUmum?: string;
    saranMasukan?: string;
  };

  // 4. Kesimpulan Uji (4 Indikator Transformasi Pembelajaran Sesuai PDF Hal 7)
  kesimpulanUji?: {
    pengalamanBelajarMurid: string; // Guru berorientasi pada pengalaman belajar murid
    aplikasiPengetahuan: string;    // Pembelajaran menghasilkan murid aktif mengaplikasikan pengetahuan
    konteksNyata: string;           // Pembelajaran terhubung dengan konteks nyata
    refleksiMurid: string;          // Pembelajaran membiasakan murid melakukan refleksi
  };

  // Kompatibilitas U-1, U-2, dan matriks
  u1_observasi: {
    tanggal: string;
    hariTanggal: string;
    tahapObservasi: 'awal' | 'siklus' | 'akhir';
    kelas: string;
    indikatorList: SambungObservasiIndikator[];
    totalSkor: number; // max 40
    persentaseCapaian: number; // totalSkor / 40 * 100
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
  // U - UJI (Pra Observasi, Observasi Pelaksanaan 25 Aspek, Pasca Observasi 10 Pertanyaan, Kesimpulan Uji 4 Indikator)
  uji: SambungUjiData;
  // N - NYATAKAN
  nyatakan: {
    beforeAfter: SambungBeforeAfterItem[];
    dataDampak: SambungDataDampakItem[];
  };
  // G - GERAKKAN
  gerakkan: {
    tindakLanjut: SambungTindakLanjutItem[];
    pengimbasan: SambungPengimbasanItem[];
  };
  lastUpdated?: string;
}
