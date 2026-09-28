export type Role = 'admin' | 'kepsek' | 'guru';

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
}
