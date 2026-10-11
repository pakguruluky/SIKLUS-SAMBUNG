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

  // C. Observasi Kelas
  observasiKelas: {
    items: Record<string, { status: 'Ya' | 'Tidak'; note: string }>;
    totalYa: number;
    totalAspek: number;
    score: number; // (Total "Ya" / Total Aspek) * 100
    predicate: string;
    feedbackNotes: string;
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
    items: Record<string, { status: 'Ya' | 'Tidak'; note: string }>;
    totalYa: number;
    totalAspek: number;
    score: number;
    predicate: string;
    feedbackNotes: string;
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

export interface SambungSiklusBerdayakan {
  siklus: number;
  rancanganDanUjiCoba: string; // Rancangan dan hasil uji coba pada murid
  refleksi: string; // Refleksi (berhasil / belum, mengapa)
  perbaikanBerikutnya: string; // Perbaikan berikutnya
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
  // A - ARAHKAN
  arahkan: {
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
  // M - MAKNAI
  maknai: {
    tanggal: string;
    coaching: SambungCoachingData;
  };
  // B - BERDAYAKAN
  berdayakan: {
    siklusList: SambungSiklusBerdayakan[];
  };
  // U - UJI
  uji: {
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
  };
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
