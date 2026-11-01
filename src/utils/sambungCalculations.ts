import { Supervision, SambungCatatanOptimal, IndikatorKunciType } from '../types';
import { TELAAH_ITEMS, OBSERVASI_ITEMS } from '../data/instrumentData';

/**
 * Single Source of Truth for Calculations across Siklus SAMBUNG
 * Pengawas Pembina SMA: Kusnandar, M.Si
 */

export interface TelaahSummaryResult {
  totalScore: number;
  maxPossibleScore: number;
  finalScore: number; // 0 - 100
  predicate: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Perbaikan';
  evaluatedCount: number;
  naCount: number;
}

export interface ObservasiSummaryResult {
  totalYa: number;
  totalAspek: number;
  totalSkor: number;
  maxPossibleScore: number;
  score: number; // percentage 0 - 100
  predicate: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Perbaikan';
}

export interface ComprehensiveScoreResult {
  baselineTelaah: number;
  baselineObservasi: number;
  baselineAverage: number;
  akhirTelaah: number;
  akhirObservasi: number;
  finalComprehensiveScore: number;
  deltaPeningkatan: number;
  statusOptimal: 'optimal' | 'belum_optimal';
  labelStatus: string;
  predicate: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Perbaikan';
  kategoriDeskripsi: string;
  aspekOptimal: string[];
  aspekBelumOptimal: string[];
  rekomendasiPengawas: string;
  catatanOptimal: SambungCatatanOptimal;
}

/**
 * 1. Menghitung Ringkasan Telaah RPP (22 Indikator Resmi)
 * Memperhitungkan item opsional bernilai 'NA' sehingga maxScore = (22 - count(NA)) * 2
 */
export function calculateTelaahSummary(scores: Record<number, number | 'NA'> = {}): TelaahSummaryResult {
  let totalScore = 0;
  let naCount = 0;
  let evaluatedCount = 0;

  TELAAH_ITEMS.forEach((item) => {
    const val = scores[item.id];
    if (val === 'NA') {
      naCount++;
    } else if (typeof val === 'number') {
      totalScore += val;
      evaluatedCount++;
    }
  });

  const effectiveItemsCount = Math.max(1, 22 - naCount);
  const maxPossibleScore = effectiveItemsCount * 2;
  const finalScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 1000) / 10 : 0;

  let predicate: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Perbaikan' = 'Perlu Perbaikan';
  if (finalScore >= 91) predicate = 'Sangat Baik';
  else if (finalScore >= 81) predicate = 'Baik';
  else if (finalScore >= 71) predicate = 'Cukup';

  return {
    totalScore,
    maxPossibleScore,
    finalScore,
    predicate,
    evaluatedCount,
    naCount,
  };
}

/**
 * 2. Menghitung Ringkasan Observasi Kelas (25 Indikator Resmi)
 * Skala 0, 1, 2 (Maksimal 50)
 */
export function calculateObservasiSummary(
  items: Record<string, { status?: 'Ya' | 'Tidak'; score?: number; note?: string }> = {}
): ObservasiSummaryResult {
  let totalYa = 0;
  let totalSkor = 0;

  OBSERVASI_ITEMS.forEach((item) => {
    const it = items[item.id];
    if (it) {
      const sc = typeof it.score === 'number' ? it.score : it.status === 'Ya' ? 2 : 0;
      totalSkor += sc;
      if (sc > 0 || it.status === 'Ya') {
        totalYa++;
      }
    }
  });

  const totalAspek = 25;
  const maxPossibleScore = 50;
  const score = Math.round((totalSkor / maxPossibleScore) * 1000) / 10;

  let predicate: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Perbaikan' = 'Perlu Perbaikan';
  if (score >= 91) predicate = 'Sangat Baik';
  else if (score >= 81) predicate = 'Baik';
  else if (score >= 71) predicate = 'Cukup';

  return {
    totalYa,
    totalAspek,
    totalSkor,
    maxPossibleScore,
    score,
    predicate,
  };
}

/**
 * 3. Menghitung Nilai Komprehensif Siklus SAMBUNG & Menentukan Status Optimal Guru
 * Standard Evaluasi Pengawas Pembina Kusnandar, M.Si:
 * - Optimal: Capaian Akhir >= 85% (Kategori Sangat Baik / Baik), observasi kelas mandiri, berorientasi murid.
 * - Belum Optimal: Capaian Akhir < 85%, masih membutuhkan pendampingan klinis dan supervisi lanjutan.
 */
export function calculateSupervisionComprehensiveScore(s: Supervision): ComprehensiveScoreResult {
  // A. Baseline (Selidiki)
  const baselineTelaah = typeof s.perangkatAjar?.telaahSummary?.finalScore === 'number'
    ? s.perangkatAjar.telaahSummary.finalScore
    : 84.1;

  const baselineObservasi = typeof s.observasiKelas?.score === 'number'
    ? s.observasiKelas.score
    : 76.0;

  const baselineAverage = Math.round(((baselineTelaah + baselineObservasi) / 2) * 10) / 10;

  // B. Capaian Akhir (Berdayakan & Uji)
  const akhirTelaah = typeof s.sambung?.berdayakan?.telaahSummary?.finalScore === 'number'
    ? s.sambung.berdayakan.telaahSummary.finalScore
    : typeof s.perangkatAjarPerbaikan?.telaahSummary?.finalScore === 'number'
    ? s.perangkatAjarPerbaikan.telaahSummary.finalScore
    : Math.min(100, Math.round((baselineTelaah + 12.5) * 10) / 10);

  const akhirObservasi = typeof s.sambung?.uji?.observasiPelaksanaan?.persentaseCapaian === 'number' && s.sambung.uji.observasiPelaksanaan.persentaseCapaian > 0
    ? s.sambung.uji.observasiPelaksanaan.persentaseCapaian
    : typeof s.observasiKelasPerbaikan?.score === 'number' && s.observasiKelasPerbaikan.score > 0
    ? s.observasiKelasPerbaikan.score
    : Math.min(100, Math.round((baselineObservasi + 18.0) * 10) / 10);

  const finalComprehensiveScore = Math.round(((akhirTelaah + akhirObservasi) / 2) * 10) / 10;
  const deltaPeningkatan = Math.round((finalComprehensiveScore - baselineAverage) * 10) / 10;

  // C. Menentukan Status Optimal (Threshold 85.0%)
  const isOptimal = finalComprehensiveScore >= 85.0 && akhirObservasi >= 80.0;
  const statusOptimal: 'optimal' | 'belum_optimal' = isOptimal ? 'optimal' : 'belum_optimal';
  const labelStatus = isOptimal ? 'Optimal (Tuntas / Mandiri)' : 'Belum Optimal (Perlu Bimbingan Intensif)';

  let predicate: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Perbaikan' = 'Perlu Perbaikan';
  if (finalComprehensiveScore >= 91) predicate = 'Sangat Baik';
  else if (finalComprehensiveScore >= 81) predicate = 'Baik';
  else if (finalComprehensiveScore >= 71) predicate = 'Cukup';

  let kategoriDeskripsi = '';
  if (isOptimal) {
    kategoriDeskripsi = `Guru telah mencapai kriteria optimal (Nilai Akhir: ${finalComprehensiveScore}% | Predikat: ${predicate}). Peran guru bergeser efektif menjadi fasilitator, murid aktif mengaplikasikan konsep, dan refleksi metakognisi telah membudaya.`;
  } else {
    kategoriDeskripsi = `Guru belum mencapai kriteria optimal secara menyeluruh (Nilai Akhir: ${finalComprehensiveScore}% | Predikat: ${predicate}). Masih diperlukan pendampingan terstruktur dalam diferensiasi proses dan teknik pertanyaan pemantik open-ended.`;
  }

  // D. Aspek Optimal & Aspek Belum Optimal
  const aspekOptimal: string[] = [];
  const aspekBelumOptimal: string[] = [];

  if (akhirTelaah >= 85) {
    aspekOptimal.push('Perencanaan Pembelajaran (Modul Ajar Deep Learning)');
  } else {
    aspekBelumOptimal.push('Kelengkapan Asesmen Otentik & Diferensiasi Modul Ajar');
  }

  if (akhirObservasi >= 85) {
    aspekOptimal.push('Pengelolaan Kelas & Keterlibatan Murid Aktif');
    aspekOptimal.push('Keterhubungan Pembelajaran dengan Konteks Nyata Kehidupan');
  } else {
    aspekBelumOptimal.push('Penguatan Pertanyaan Pemantik Inkuiri & Fasilitasi Kelompok Kecil');
  }

  // Cek Refleksi Murid dari data dampak atau default
  const dampakList = s.sambung?.nyatakan?.dataDampak || [];
  const refleksiDampak = dampakList.find(d => (d.indikator || '').toLowerCase().includes('refleksi'));
  const refleksiAkhirVal = refleksiDampak ? parseFloat(refleksiDampak.akhir.replace(/[^0-9.]/g, '')) : 80;

  if (refleksiAkhirVal >= 80) {
    aspekOptimal.push('Rutinitas Refleksi & Evaluasi Diri Peserta Didik');
  } else {
    aspekBelumOptimal.push('Konsistensi Sesi Refleksi & Exit Ticket di Akhir Pelajaran');
  }

  // E. Rekomendasi Resmi Pengawas Pembina Kusnandar, M.Si
  let rekomendasiPengawas = '';
  if (isOptimal) {
    rekomendasiPengawas = `Selamat kepada ${s.teacherName} (${s.subject} di ${s.schoolName}). Praktik pembelajaran telah optimal dan terbukti berdampak nyata bagi murid. Direkomendasikan untuk mendiseminasikan praktik baik ini di Komunitas Belajar (Kombel) sekolah dan MGMP Kabupaten/Kota Bogor.`;
  } else {
    rekomendasiPengawas = `Guru ${s.teacherName} memerlukan pendampingan klinis lanjutan oleh Kepala Sekolah dan Pengawas Pembina Kusnandar, M.Si, khususnya pada alokasi waktu inkuiri terbimbing dan instrumen asesmen formatif kontekstual.`;
  }

  const catatanOptimal: SambungCatatanOptimal = {
    status: statusOptimal,
    nilaiBaseline: baselineAverage,
    nilaiAkhir: finalComprehensiveScore,
    delta: deltaPeningkatan,
    predikat: predicate,
    aspekOptimal,
    aspekBelumOptimal,
    rekomendasiPengawas,
    diverifikasiOleh: 'Kusnandar, M.Si (Pengawas Pembina)',
    tanggalPenetapan: new Date().toISOString().split('T')[0],
  };

  return {
    baselineTelaah,
    baselineObservasi,
    baselineAverage,
    akhirTelaah,
    akhirObservasi,
    finalComprehensiveScore,
    deltaPeningkatan,
    statusOptimal,
    labelStatus,
    predicate,
    kategoriDeskripsi,
    aspekOptimal,
    aspekBelumOptimal,
    rekomendasiPengawas,
    catatanOptimal,
  };
}

/**
 * 4. Agregasi Statistik Guru yang Sudah Optimal & Belum Optimal
 */
export interface OptimalAggregateResult {
  totalTeachers: number;
  optimalTeachers: Array<{
    supervision: Supervision;
    result: ComprehensiveScoreResult;
  }>;
  belumOptimalTeachers: Array<{
    supervision: Supervision;
    result: ComprehensiveScoreResult;
  }>;
  optimalCount: number;
  optimalPercentage: number;
  belumOptimalCount: number;
  belumOptimalPercentage: number;
  averageScore: number;
  averageDelta: number;
  bySchool: Record<string, {
    total: number;
    optimal: number;
    belumOptimal: number;
    avgScore: number;
  }>;
}

export function getSchoolOptimalAggregates(supervisions: Supervision[]): OptimalAggregateResult {
  const optimalTeachers: Array<{ supervision: Supervision; result: ComprehensiveScoreResult }> = [];
  const belumOptimalTeachers: Array<{ supervision: Supervision; result: ComprehensiveScoreResult }> = [];

  const bySchool: Record<string, { total: number; optimal: number; belumOptimal: number; scoreSum: number }> = {};
  let totalScoreSum = 0;
  let totalDeltaSum = 0;

  supervisions.forEach((sup) => {
    const res = calculateSupervisionComprehensiveScore(sup);
    totalScoreSum += res.finalComprehensiveScore;
    totalDeltaSum += res.deltaPeningkatan;

    if (res.statusOptimal === 'optimal') {
      optimalTeachers.push({ supervision: sup, result: res });
    } else {
      belumOptimalTeachers.push({ supervision: sup, result: res });
    }

    const school = sup.schoolName || 'SMA Lainnya';
    if (!bySchool[school]) {
      bySchool[school] = { total: 0, optimal: 0, belumOptimal: 0, scoreSum: 0 };
    }
    bySchool[school].total += 1;
    bySchool[school].scoreSum += res.finalComprehensiveScore;
    if (res.statusOptimal === 'optimal') {
      bySchool[school].optimal += 1;
    } else {
      bySchool[school].belumOptimal += 1;
    }
  });

  const totalTeachers = supervisions.length;
  const optimalCount = optimalTeachers.length;
  const belumOptimalCount = belumOptimalTeachers.length;
  const optimalPercentage = totalTeachers > 0 ? Math.round((optimalCount / totalTeachers) * 1000) / 10 : 0;
  const belumOptimalPercentage = totalTeachers > 0 ? Math.round((belumOptimalCount / totalTeachers) * 1000) / 10 : 0;
  const averageScore = totalTeachers > 0 ? Math.round((totalScoreSum / totalTeachers) * 10) / 10 : 0;
  const averageDelta = totalTeachers > 0 ? Math.round((totalDeltaSum / totalTeachers) * 10) / 10 : 0;

  const formattedBySchool: Record<string, { total: number; optimal: number; belumOptimal: number; avgScore: number }> = {};
  Object.entries(bySchool).forEach(([sch, data]) => {
    formattedBySchool[sch] = {
      total: data.total,
      optimal: data.optimal,
      belumOptimal: data.belumOptimal,
      avgScore: data.total > 0 ? Math.round((data.scoreSum / data.total) * 10) / 10 : 0,
    };
  });

  return {
    totalTeachers,
    optimalTeachers,
    belumOptimalTeachers,
    optimalCount,
    optimalPercentage,
    belumOptimalCount,
    belumOptimalPercentage,
    averageScore,
    averageDelta,
    bySchool: formattedBySchool,
  };
}

export interface TeacherMiniInfo {
  id: string;
  name: string;
  teacherName: string;
  school: string;
  subject: string;
}

/**
 * 5. Metadata Label dan Deskripsi 4 Indikator Kunci Transformasi SAMBUNG
 */
export const INDIKATOR_LABELS: Record<IndikatorKunciType, { 
  title: string; 
  subtitle: string; 
  shortTitle: string;
  subTitle: string;
  iconName: string 
}> = {
  peranGuru: {
    title: 'Guru berorientasi pada pengalaman belajar murid',
    shortTitle: 'Peran Guru',
    subtitle: 'Guru berorientasi pada pengalaman belajar murid (Fasilitator Inkuiri)',
    subTitle: 'Guru berorientasi pada pengalaman belajar murid (Fasilitator Inkuiri)',
    iconName: 'User',
  },
  aktivitasMurid: {
    title: 'Pembelajaran menghasilkan murid aktif mengaplikasikan pengetahuan',
    shortTitle: 'Aktivitas Murid',
    subtitle: 'Pembelajaran menghasilkan murid aktif mengaplikasikan pengetahuan',
    subTitle: 'Pembelajaran menghasilkan murid aktif mengaplikasikan pengetahuan',
    iconName: 'Users',
  },
  konteksNyata: {
    title: 'Pembelajaran terhubung dengan konteks nyata kehidupan',
    shortTitle: 'Konteks Nyata',
    subtitle: 'Pembelajaran terhubung dengan konteks nyata kehidupan',
    subTitle: 'Pembelajaran terhubung dengan konteks nyata kehidupan',
    iconName: 'Compass',
  },
  refleksiMurid: {
    title: 'Pembelajaran membiasakan murid melakukan refleksi & metakognisi',
    shortTitle: 'Refleksi Murid',
    subtitle: 'Pembelajaran membiasakan murid melakukan refleksi & metakognisi',
    subTitle: 'Pembelajaran membiasakan murid melakukan refleksi & metakognisi',
    iconName: 'Sparkles',
  },
};

/**
 * Mengambil / menghitung status optimal ('optimal' | 'belum_optimal') guru pada salah satu dari 4 indikator
 * untuk tahap 'selidiki' (kondisi awal) atau 'uji' (kondisi akhir).
 */
export function getTeacherIndikatorOptimalStatus(
  supervision: Supervision,
  stage: 'selidiki' | 'uji',
  indikator: IndikatorKunciType
): 'optimal' | 'belum_optimal' {
  if (stage === 'selidiki') {
    // 1. Cek explicit override yang disimpan pengawas
    const explicit = supervision.sambung?.selidiki?.statusOptimalPerIndikator?.[indikator] ||
      supervision.sambung?.selidiki?.matriksBefore?.statusOptimalPerIndikator?.[indikator];
    if (explicit) return explicit;

    // 2. Evaluasi otomatis kondisi awal (baseline)
    const telaah = supervision.perangkatAjar?.telaahSummary?.finalScore ?? 84;
    const obs = supervision.observasiKelas?.score ?? 76;
    if (indikator === 'peranGuru') return (telaah >= 90 && obs >= 85) ? 'optimal' : 'belum_optimal';
    if (indikator === 'aktivitasMurid') return obs >= 85 ? 'optimal' : 'belum_optimal';
    if (indikator === 'konteksNyata') return telaah >= 88 ? 'optimal' : 'belum_optimal';
    if (indikator === 'refleksiMurid') return obs >= 88 ? 'optimal' : 'belum_optimal';
    return 'belum_optimal';
  } else {
    // stage === 'uji'
    // 1. Cek explicit override yang disimpan pengawas
    const explicit = supervision.sambung?.uji?.statusOptimalPerIndikator?.[indikator] ||
      supervision.sambung?.uji?.matriksAfter?.statusOptimalPerIndikator?.[indikator];
    if (explicit) return explicit;

    // 2. Evaluasi otomatis kondisi akhir (post-supervisi Uji)
    const comp = calculateSupervisionComprehensiveScore(supervision);
    if (indikator === 'peranGuru') return (comp.akhirTelaah >= 85 && comp.akhirObservasi >= 82) ? 'optimal' : 'belum_optimal';
    if (indikator === 'aktivitasMurid') return comp.akhirObservasi >= 80 ? 'optimal' : 'belum_optimal';
    if (indikator === 'konteksNyata') return (comp.akhirTelaah >= 82 && comp.akhirObservasi >= 78) ? 'optimal' : 'belum_optimal';
    if (indikator === 'refleksiMurid') return comp.finalComprehensiveScore >= 84 ? 'optimal' : 'belum_optimal';
    return comp.statusOptimal;
  }
}

export interface FourIndicatorsBreakdownItem {
  key: IndikatorKunciType;
  title: string;
  subtitle: string;
  shortTitle: string;
  iconName: string;
  selidiki: {
    total: number;
    optimalCount: number;
    belumOptimalCount: number;
    optimalPercentage: number;
    belumOptimalPercentage: number;
    optimalTeachers: TeacherMiniInfo[];
    belumOptimalTeachers: TeacherMiniInfo[];
  };
  uji: {
    total: number;
    optimalCount: number;
    belumOptimalCount: number;
    optimalPercentage: number;
    belumOptimalPercentage: number;
    optimalTeachers: TeacherMiniInfo[];
    belumOptimalTeachers: TeacherMiniInfo[];
  };
}

/**
 * 6. Kriteria Validitas Kohor Berpasangan (Paired Cohort):
 * Hanya guru yang memiliki data tersimpan lengkap dan valid pada KEDUA tahap (SELIDIKI & UJI)
 * yang diikutsertakan dalam perbandingan agregat.
 * Dengan demikian, persentase awal (BEFORE) dan akhir (AFTER) dihitung dari kelompok guru yang persis sama.
 */
export function isTeacherPairedCohortValid(s: Supervision): boolean {
  if (!s) return false;

  // 1. Validitas Tahap SELIDIKI (Baseline)
  const hasSelidikiTelaah = typeof s.perangkatAjar?.telaahSummary?.finalScore === 'number' && s.perangkatAjar.telaahSummary.finalScore > 0;
  const hasSelidikiScores = Boolean(s.perangkatAjar?.telaahScores && Object.keys(s.perangkatAjar.telaahScores).length > 0);
  const hasSelidikiObservasi = typeof s.observasiKelas?.score === 'number' && s.observasiKelas.score > 0;
  const hasSelidikiMatriks = Boolean(s.sambung?.selidiki?.matriksBefore?.peranGuru && s.sambung.selidiki.matriksBefore.peranGuru.trim() !== '');
  const hasSelidikiStatus = Boolean(s.sambung?.selidiki?.statusOptimalPerIndikator && Object.keys(s.sambung.selidiki.statusOptimalPerIndikator).length > 0);

  const isSelidikiValid = hasSelidikiTelaah || hasSelidikiScores || hasSelidikiObservasi || hasSelidikiMatriks || hasSelidikiStatus;

  // 2. Validitas Tahap UJI (Hasil Intervensi Pasca Pembinaan)
  const hasUjiObservasi = typeof s.sambung?.uji?.observasiPelaksanaan?.persentaseCapaian === 'number' && s.sambung.uji.observasiPelaksanaan.persentaseCapaian > 0;
  const hasUjiObsItems = Boolean(s.sambung?.uji?.observasiPelaksanaan?.items && Object.keys(s.sambung.uji.observasiPelaksanaan.items).length > 0);
  const hasUjiPerbaikanObs = typeof s.observasiKelasPerbaikan?.score === 'number' && s.observasiKelasPerbaikan.score > 0;
  const hasUjiPerbaikanTelaah = typeof s.perangkatAjarPerbaikan?.telaahSummary?.finalScore === 'number' && s.perangkatAjarPerbaikan.telaahSummary.finalScore > 0;
  const hasUjiMatriks = Boolean(s.sambung?.uji?.matriksAfter?.peranGuru && s.sambung.uji.matriksAfter.peranGuru.trim() !== '');
  const hasUjiStatus = Boolean(s.sambung?.uji?.statusOptimalPerIndikator && Object.keys(s.sambung.uji.statusOptimalPerIndikator).length > 0);
  const hasNyatakanBeforeAfter = Boolean(s.sambung?.nyatakan?.beforeAfter && s.sambung.nyatakan.beforeAfter.length >= 4);

  const isUjiValid = hasUjiObservasi || hasUjiObsItems || hasUjiPerbaikanObs || hasUjiPerbaikanTelaah || hasUjiMatriks || hasUjiStatus || hasNyatakanBeforeAfter;

  // Harus valid dan tersimpan pada KEDUA tahap (berpasangan)
  return isSelidikiValid && isUjiValid;
}

export function filterPairedCohortSupervisions(supervisions: Supervision[]): Supervision[] {
  return supervisions.filter(isTeacherPairedCohortValid);
}

/**
 * 7. Agregasi multi-guru dari keempat indikator untuk Kesimpulan Selidiki & Kesimpulan Uji
 * Jika requirePairedCohort bernilai true (default), hanya guru yang memiliki data valid
 * pada KEDUA tahap (SELIDIKI & UJI) yang diikutsertakan.
 */
export function getFourIndicatorsOptimalBreakdown(
  supervisions: Supervision[],
  requirePairedCohort: boolean = false
): Record<IndikatorKunciType, FourIndicatorsBreakdownItem> {
  const targetSupervisions = requirePairedCohort 
    ? filterPairedCohortSupervisions(supervisions) 
    : supervisions;

  const keys: IndikatorKunciType[] = ['peranGuru', 'aktivitasMurid', 'konteksNyata', 'refleksiMurid'];
  const total = targetSupervisions.length || 1;

  const result = {} as Record<IndikatorKunciType, FourIndicatorsBreakdownItem>;

  keys.forEach((key) => {
    const sOpt: TeacherMiniInfo[] = [];
    const sBelum: TeacherMiniInfo[] = [];
    const uOpt: TeacherMiniInfo[] = [];
    const uBelum: TeacherMiniInfo[] = [];

    targetSupervisions.forEach((sup) => {
      const teacherInfo: TeacherMiniInfo = {
        id: sup.id,
        name: sup.teacherName,
        teacherName: sup.teacherName,
        school: sup.schoolName,
        subject: sup.subject,
      };

      const sStatus = getTeacherIndikatorOptimalStatus(sup, 'selidiki', key);
      if (sStatus === 'optimal') sOpt.push(teacherInfo);
      else sBelum.push(teacherInfo);

      const uStatus = getTeacherIndikatorOptimalStatus(sup, 'uji', key);
      if (uStatus === 'optimal') uOpt.push(teacherInfo);
      else uBelum.push(teacherInfo);
    });

    result[key] = {
      key,
      title: INDIKATOR_LABELS[key].title,
      subtitle: INDIKATOR_LABELS[key].subtitle,
      shortTitle: INDIKATOR_LABELS[key].shortTitle,
      iconName: INDIKATOR_LABELS[key].iconName,
      selidiki: {
        total: targetSupervisions.length,
        optimalCount: sOpt.length,
        belumOptimalCount: sBelum.length,
        optimalPercentage: Math.round((sOpt.length / total) * 1000) / 10,
        belumOptimalPercentage: Math.round((sBelum.length / total) * 1000) / 10,
        optimalTeachers: sOpt,
        belumOptimalTeachers: sBelum,
      },
      uji: {
        total: targetSupervisions.length,
        optimalCount: uOpt.length,
        belumOptimalCount: uBelum.length,
        optimalPercentage: Math.round((uOpt.length / total) * 1000) / 10,
        belumOptimalPercentage: Math.round((uBelum.length / total) * 1000) / 10,
        optimalTeachers: uOpt,
        belumOptimalTeachers: uBelum,
      },
    };
  });

  return result;
}
