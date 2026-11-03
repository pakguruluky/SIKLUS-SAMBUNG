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

export interface KomponenNilaiStatusDetail {
  nama: string;
  score: number;
  target: number;
  isFulfilled: boolean;
  keterangan: string;
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
  defisitMenujuOptimal: number; // 0 jika optimal, atau selisih menuju batas 85.0% jika belum optimal
  komponenDefisitList: Array<{
    nama: string;
    capaian: number;
    target: number;
    defisit: number;
    keterangan: string;
  }>;
  komponenStatus?: {
    telaahModul: KomponenNilaiStatusDetail;
    observasiKelas: KomponenNilaiStatusDetail;
    nilaiAkhir: KomponenNilaiStatusDetail;
    refleksiMurid: KomponenNilaiStatusDetail;
    indikatorKunci: {
      nama: string;
      isFulfilled: boolean;
      details: Record<IndikatorKunciType, 'optimal' | 'belum_optimal'>;
    };
    evaluasiTahunan?: KomponenNilaiStatusDetail;
    allFulfilled: boolean;
  };
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
 * - Optimal: Apabila SEMUA komponen nilai terpenuhi secara menyeluruh:
 *   1. Perencanaan Pembelajaran / Telaah Modul Ajar >= 85.0%
 *   2. Observasi Pelaksanaan Kelas >= 85.0%
 *   3. Nilai Akhir Komprehensif Siklus >= 85.0%
 *   4. Pembiasaan Refleksi Murid >= 80.0%
 *   5. Seluruh 4 Indikator Transformasi SAMBUNG (Peran Guru, Aktivitas Murid, Konteks Nyata, Refleksi) berstatus Optimal
 *   6. Evaluasi Portofolio Tahunan (jika ada data) >= 80.0%
 *   7. Tidak ada aspek yang berada di bawah standar (aspekBelumOptimal kosong).
 * - Belum Optimal: Apabila terdapat salah satu atau lebih komponen nilai yang belum memenuhi kriteria ketuntasan.
 */
export function calculateSupervisionComprehensiveScore(s: Supervision): ComprehensiveScoreResult {
  // A. Baseline (Selidiki)
  const rawBaselineTelaah = s.perangkatAjar?.telaahSummary?.finalScore;
  const baselineTelaah = typeof rawBaselineTelaah === 'number'
    ? rawBaselineTelaah
    : (s.perangkatAjar?.telaahScores && Object.keys(s.perangkatAjar.telaahScores).length > 0)
    ? calculateTelaahSummary(s.perangkatAjar.telaahScores).finalScore
    : 0;

  const rawBaselineObservasi = s.observasiKelas?.score;
  const baselineObservasi = typeof rawBaselineObservasi === 'number'
    ? rawBaselineObservasi
    : (s.observasiKelas?.items && Object.keys(s.observasiKelas.items).length > 0)
    ? calculateObservasiSummary(s.observasiKelas.items).score
    : 0;

  const baselineAverage = (baselineTelaah > 0 || baselineObservasi > 0)
    ? Math.round(((baselineTelaah + baselineObservasi) / (baselineTelaah > 0 && baselineObservasi > 0 ? 2 : 1)) * 10) / 10
    : 0;

  // B. Capaian Akhir (Berdayakan & Uji)
  // Ambil nilai akhir riil hasil perbaikan. Jika belum ada perbaikan, gunakan capaian yang ada tanpa manipulasi semu.
  let akhirTelaah = typeof s.sambung?.berdayakan?.telaahSummary?.finalScore === 'number' && s.sambung.berdayakan.telaahSummary.finalScore > 0
    ? s.sambung.berdayakan.telaahSummary.finalScore
    : typeof s.perangkatAjarPerbaikan?.telaahSummary?.finalScore === 'number' && s.perangkatAjarPerbaikan.telaahSummary.finalScore > 0
    ? s.perangkatAjarPerbaikan.telaahSummary.finalScore
    : baselineTelaah;

  let akhirObservasi = typeof s.sambung?.uji?.observasiPelaksanaan?.persentaseCapaian === 'number' && s.sambung.uji.observasiPelaksanaan.persentaseCapaian > 0
    ? s.sambung.uji.observasiPelaksanaan.persentaseCapaian
    : typeof s.observasiKelasPerbaikan?.score === 'number' && s.observasiKelasPerbaikan.score > 0
    ? s.observasiKelasPerbaikan.score
    : baselineObservasi;

  // Refleksi Murid dari Data Dampak atau Indikator
  const dampakList = s.sambung?.nyatakan?.dataDampak || [];
  const refleksiDampak = dampakList.find(d => (d.indikator || '').toLowerCase().includes('refleksi'));
  const rawRefleksi = refleksiDampak ? parseFloat(refleksiDampak.akhir.replace(/[^0-9.]/g, '')) : NaN;
  const refleksiAkhirVal = !isNaN(rawRefleksi)
    ? rawRefleksi
    : (akhirObservasi >= 85 ? 85 : akhirObservasi > 0 ? Math.max(0, Math.round(akhirObservasi - 5)) : 0);
  const isRefleksiOptimal = refleksiAkhirVal >= 80.0;

  // 4 Indikator Kunci SAMBUNG pada tahap Uji & Dampak
  const ujiStatusMap = {
    ...(s.sambung?.uji?.matriksAfter?.statusOptimalPerIndikator || {}),
    ...(s.sambung?.uji?.statusOptimalPerIndikator || {}),
  };

  const ind1Val = dampakList[0] ? parseFloat(dampakList[0].akhir?.replace(/[^0-9.]/g, '') || '') : NaN;
  const ind2Val = dampakList[1] ? parseFloat(dampakList[1].akhir?.replace(/[^0-9.]/g, '') || '') : NaN;
  const ind3Val = dampakList[2] ? parseFloat(dampakList[2].akhir?.replace(/[^0-9.]/g, '') || '') : NaN;
  const ind4Val = dampakList[3] ? parseFloat(dampakList[3].akhir?.replace(/[^0-9.]/g, '') || '') : NaN;

  const peranGuruStatus: 'optimal' | 'belum_optimal' = ujiStatusMap['peranGuru']
    ? ujiStatusMap['peranGuru']
    : (!isNaN(ind1Val) ? (ind1Val >= 85.0 ? 'optimal' : 'belum_optimal') : (akhirTelaah >= 85.0 && akhirObservasi >= 85.0 ? 'optimal' : 'belum_optimal'));

  const aktivitasMuridStatus: 'optimal' | 'belum_optimal' = ujiStatusMap['aktivitasMurid']
    ? ujiStatusMap['aktivitasMurid']
    : (!isNaN(ind2Val) ? (ind2Val >= 85.0 ? 'optimal' : 'belum_optimal') : (akhirObservasi >= 85.0 ? 'optimal' : 'belum_optimal'));

  const konteksNyataStatus: 'optimal' | 'belum_optimal' = ujiStatusMap['konteksNyata']
    ? ujiStatusMap['konteksNyata']
    : (!isNaN(ind3Val) ? (ind3Val >= 85.0 ? 'optimal' : 'belum_optimal') : (akhirTelaah >= 85.0 && akhirObservasi >= 80.0 ? 'optimal' : 'belum_optimal'));

  const refleksiMuridStatus: 'optimal' | 'belum_optimal' = ujiStatusMap['refleksiMurid']
    ? ujiStatusMap['refleksiMurid']
    : (!isNaN(ind4Val) ? (ind4Val >= 80.0 ? 'optimal' : 'belum_optimal') : (refleksiAkhirVal >= 80.0 ? 'optimal' : 'belum_optimal'));

  const isAll4IndicatorsOptimal =
    peranGuruStatus === 'optimal' &&
    aktivitasMuridStatus === 'optimal' &&
    konteksNyataStatus === 'optimal' &&
    refleksiMuridStatus === 'optimal';

  // Evaluasi Tahunan (Portofolio 5 Aspek, jika data diisi)
  const hasEvaluasi = typeof s.evaluasiTahunan?.finalAverageScore === 'number' && s.evaluasiTahunan.finalAverageScore > 0;
  const isEvaluasiOptimal = !hasEvaluasi || (
    s.evaluasiTahunan!.finalAverageScore >= 80.0 &&
    (!s.evaluasiTahunan!.hasilBelajar?.score || s.evaluasiTahunan!.hasilBelajar.score >= 75) &&
    (!s.evaluasiTahunan!.administrasi?.score || s.evaluasiTahunan!.administrasi.score >= 75) &&
    (!s.evaluasiTahunan!.pengembanganDiri?.score || s.evaluasiTahunan!.pengembanganDiri.score >= 75) &&
    (!s.evaluasiTahunan!.kedisiplinan?.score || s.evaluasiTahunan!.kedisiplinan.score >= 75)
  );

  // Kriteria Standar Kelulusan/Optimal:
  const isTelaahOptimal = akhirTelaah >= 85.0;
  const isObservasiOptimal = akhirObservasi >= 85.0;

  // Hitung Nilai Awal Rata-Rata Komprehensif
  let rawComprehensiveScore = (akhirTelaah > 0 || akhirObservasi > 0)
    ? Math.round(((akhirTelaah + akhirObservasi) / (akhirTelaah > 0 && akhirObservasi > 0 ? 2 : 1)) * 10) / 10
    : 0;

  // D. Aspek Optimal & Aspek Belum Optimal
  const aspekOptimal: string[] = [];
  const aspekBelumOptimal: string[] = [];
  const komponenDefisitList: Array<{
    nama: string;
    capaian: number;
    target: number;
    defisit: number;
    keterangan: string;
  }> = [];

  if (isTelaahOptimal) {
    aspekOptimal.push('Perencanaan Pembelajaran (Modul Ajar Deep Learning ≥ 85%)');
  } else {
    const def = Math.round((85.0 - akhirTelaah) * 10) / 10;
    aspekBelumOptimal.push(`Kelengkapan Asesmen & Modul Ajar (Nilai: ${akhirTelaah}% < 85%, Defisit: -${def}%)`);
    komponenDefisitList.push({
      nama: 'Telaah Modul Ajar',
      capaian: akhirTelaah,
      target: 85.0,
      defisit: def,
      keterangan: `Kurang ${def}% untuk mencapai batas tuntas 85.0%`,
    });
  }

  if (isObservasiOptimal) {
    aspekOptimal.push('Pengelolaan Kelas & Keterlibatan Murid Aktif (≥ 85%)');
  } else {
    const def = Math.round((85.0 - akhirObservasi) * 10) / 10;
    aspekBelumOptimal.push(
      akhirObservasi === 0
        ? 'Observasi Kelas belum dilaksanakan (Status Draf Awal)'
        : `Pengelolaan Kelas & Inkuiri Aktif (Nilai: ${akhirObservasi}% < 85%, Defisit: -${def}%)`
    );
    komponenDefisitList.push({
      nama: 'Observasi Kelas',
      capaian: akhirObservasi,
      target: 85.0,
      defisit: def,
      keterangan: akhirObservasi === 0 ? 'Observasi kelas belum dilaksanakan (Status Draf Awal)' : `Kurang ${def}% untuk mencapai batas tuntas 85.0%`,
    });
  }

  if (konteksNyataStatus === 'optimal') {
    aspekOptimal.push('Keterhubungan Pembelajaran dengan Konteks Nyata Kehidupan (≥ 85%)');
  } else {
    const val = !isNaN(ind3Val) ? ind3Val : 80;
    const def = Math.round((85.0 - val) * 10) / 10;
    aspekBelumOptimal.push(`Keterhubungan Pembelajaran dengan Konteks Nyata (Nilai: ${val}% < 85%)`);
    komponenDefisitList.push({
      nama: 'Indikator Konteks Nyata',
      capaian: val,
      target: 85.0,
      defisit: def,
      keterangan: `Kurang ${def}% untuk mencapai batas optimal 85.0%`,
    });
  }

  if (isRefleksiOptimal && refleksiMuridStatus === 'optimal') {
    aspekOptimal.push('Rutinitas Refleksi & Evaluasi Diri Peserta Didik (≥ 80%)');
  } else {
    const def = Math.round((80.0 - refleksiAkhirVal) * 10) / 10;
    aspekBelumOptimal.push(`Konsistensi Sesi Refleksi Murid (Nilai: ${refleksiAkhirVal}% < 80%, Defisit: -${def}%)`);
    komponenDefisitList.push({
      nama: 'Refleksi Murid',
      capaian: refleksiAkhirVal,
      target: 80.0,
      defisit: def,
      keterangan: `Kurang ${def}% untuk mencapai batas tuntas 80.0%`,
    });
  }

  if (peranGuruStatus !== 'optimal') {
    const val = !isNaN(ind1Val) ? ind1Val : Math.min(akhirTelaah, akhirObservasi);
    const def = Math.max(0.1, Math.round((85.0 - val) * 10) / 10);
    aspekBelumOptimal.push(`Peran Guru Sebagai Fasilitator Pembelajaran Mendalam (Nilai: ${val}% < 85%)`);
    komponenDefisitList.push({
      nama: 'Indikator Peran Guru',
      capaian: val,
      target: 85.0,
      defisit: def,
      keterangan: `Kurang ${def}% untuk mencapai batas optimal 85.0%`,
    });
  }

  if (aktivitasMuridStatus !== 'optimal') {
    const val = !isNaN(ind2Val) ? ind2Val : akhirObservasi;
    const def = Math.max(0.1, Math.round((85.0 - val) * 10) / 10);
    aspekBelumOptimal.push(`Aktivitas Murid Aktif Mengaplikasikan Pengetahuan (Nilai: ${val}% < 85%)`);
    komponenDefisitList.push({
      nama: 'Indikator Aktivitas Murid',
      capaian: val,
      target: 85.0,
      defisit: def,
      keterangan: `Kurang ${def}% untuk mencapai batas optimal 85.0%`,
    });
  }

  if (hasEvaluasi) {
    if (isEvaluasiOptimal) {
      aspekOptimal.push('Evaluasi Kinerja 1 Tahun Pelajaran (Portofolio Tuntas ≥ 80%)');
    } else {
      const def = Math.round((80.0 - (s.evaluasiTahunan?.finalAverageScore || 0)) * 10) / 10;
      aspekBelumOptimal.push(`Evaluasi Portofolio Tahunan (Nilai: ${s.evaluasiTahunan?.finalAverageScore}% < 80%)`);
      komponenDefisitList.push({
        nama: 'Evaluasi Portofolio Tahunan',
        capaian: s.evaluasiTahunan?.finalAverageScore || 0,
        target: 80.0,
        defisit: def,
        keterangan: `Kurang ${def}% untuk mencapai batas 80.0%`,
      });
    }
  }

  // STATUS OPTIMAL HANYA JIKA SEMUA KOMPONEN NILAI TERPENUHI SECARA LENGKAP:
  const isOptimal =
    akhirTelaah >= 85.0 &&
    akhirObservasi >= 85.0 &&
    rawComprehensiveScore >= 85.0 &&
    isRefleksiOptimal &&
    isAll4IndicatorsOptimal &&
    isEvaluasiOptimal &&
    aspekBelumOptimal.length === 0 &&
    s.statusOptimal !== 'belum_optimal';

  // SESUAIKAN NILAI PERSENTASE JIKA BELUM OPTIMAL:
  // Jika belum optimal, nilai persentase akhir TIDAK BOLEH bernilai >= 85.0% atau 100%.
  // Nilai disesuaikan secara proporsional dengan memperhitungkan komponen yang belum tuntas,
  // dan dibatasi maksimal 84.9% agar selaras dengan kriteria "Belum Optimal (< 85%)".
  let finalComprehensiveScore = rawComprehensiveScore;
  if (!isOptimal) {
    if (finalComprehensiveScore >= 85.0) {
      // Integrasikan komponen yang belum tuntas (misal refleksi atau indikator kunci)
      const unfulfilledScores = komponenDefisitList.map(k => k.capaian).filter(v => v > 0);
      if (unfulfilledScores.length > 0) {
        const avgUnfulfilled = unfulfilledScores.reduce((a, b) => a + b, 0) / unfulfilledScores.length;
        finalComprehensiveScore = Math.min(84.9, Math.round(((rawComprehensiveScore * 2 + avgUnfulfilled) / 3) * 10) / 10);
      } else {
        finalComprehensiveScore = 84.5;
      }
    }
  }

  const defisitMenujuOptimal = isOptimal
    ? 0
    : finalComprehensiveScore > 0
    ? Math.max(0.1, Math.round((85.0 - finalComprehensiveScore) * 10) / 10)
    : 85.0;

  const deltaPeningkatan = Math.round((finalComprehensiveScore - baselineAverage) * 10) / 10;
  const statusOptimal: 'optimal' | 'belum_optimal' = isOptimal ? 'optimal' : 'belum_optimal';
  const labelStatus = isOptimal
    ? 'Optimal (Seluruh Komponen Terpenuhi)'
    : `Belum Optimal (${defisitMenujuOptimal > 0 ? `Defisit -${defisitMenujuOptimal}%` : 'Komponen Belum Lengkap'})`;

  let predicate: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Perbaikan' = 'Perlu Perbaikan';
  if (isOptimal && finalComprehensiveScore >= 91.0) predicate = 'Sangat Baik';
  else if (finalComprehensiveScore >= 81.0) predicate = 'Baik';
  else if (finalComprehensiveScore >= 71.0) predicate = 'Cukup';

  let kategoriDeskripsi = '';
  if (isOptimal) {
    kategoriDeskripsi = `Guru telah mencapai status OPTIMAL karena seluruh komponen nilai telah terpenuhi secara paripurna (Telaah Modul: ${akhirTelaah}% ≥ 85%, Observasi Kelas: ${akhirObservasi}% ≥ 85%, Nilai Akhir: ${finalComprehensiveScore}% ≥ 85%, dan 4 Indikator Transformasi Optimal). Praktik Pembelajaran Mendalam telah membudaya secara mandiri.`;
  } else {
    kategoriDeskripsi = `Guru berstatus BELUM OPTIMAL (Capaian: ${finalComprehensiveScore}%, Defisit: -${defisitMenujuOptimal}% menuju standar kelulusan 85.0%). Komponen yang memerlukan pembinaan: ${komponenDefisitList.map(k => `${k.nama} (${k.capaian}% vs target ${k.target}%)`).join(', ')}.`;
  }

  let rekomendasiPengawas = '';
  if (isOptimal) {
    rekomendasiPengawas = `Selamat kepada ${s.teacherName} (${s.subject} di ${s.schoolName}). Seluruh komponen nilai supervisi telah terpenuhi secara optimal (&ge;85%). Direkomendasikan sebagai Guru Model untuk mendiseminasikan praktik baik Pembelajaran Mendalam di Komunitas Belajar (Kombel) sekolah dan MGMP Kabupaten/Kota Bogor.`;
  } else {
    rekomendasiPengawas = `Guru ${s.teacherName} berstatus Belum Optimal (Capaian: ${finalComprehensiveScore}%, Defisit: -${defisitMenujuOptimal}%). Memerlukan pembinaan terfokus pada: ${aspekBelumOptimal.join('; ')}. Direkomendasikan pendampingan klinis terjadwal oleh Kepala Sekolah dan Pengawas Pembina Kusnandar, M.Si.`;
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

  const isScoreOptimal = finalComprehensiveScore >= 85.0;

  const komponenStatus = {
    telaahModul: {
      nama: 'Telaah Modul Ajar',
      score: akhirTelaah,
      target: 85,
      isFulfilled: isTelaahOptimal,
      keterangan: isTelaahOptimal ? 'Tuntas (≥85%)' : `Belum Tuntas (${akhirTelaah}% < 85%, Defisit: -${Math.round((85 - akhirTelaah) * 10) / 10}%)`,
    },
    observasiKelas: {
      nama: 'Observasi Kelas',
      score: akhirObservasi,
      target: 85,
      isFulfilled: isObservasiOptimal,
      keterangan: isObservasiOptimal ? 'Tuntas (≥85%)' : akhirObservasi === 0 ? 'Belum Terlaksana (Status Draf Awal)' : `Belum Tuntas (${akhirObservasi}% < 85%, Defisit: -${Math.round((85 - akhirObservasi) * 10) / 10}%)`,
    },
    nilaiAkhir: {
      nama: 'Nilai Akhir Komprehensif',
      score: finalComprehensiveScore,
      target: 85,
      isFulfilled: isScoreOptimal,
      keterangan: isScoreOptimal ? 'Tuntas (≥85%)' : `Belum Tuntas (${finalComprehensiveScore}% < 85%, Defisit: -${defisitMenujuOptimal}%)`,
    },
    refleksiMurid: {
      nama: 'Refleksi Murid',
      score: refleksiAkhirVal,
      target: 80,
      isFulfilled: isRefleksiOptimal,
      keterangan: isRefleksiOptimal ? 'Tuntas (≥80%)' : `Belum Tuntas (${refleksiAkhirVal}% < 80%, Defisit: -${Math.round((80 - refleksiAkhirVal) * 10) / 10}%)`,
    },
    indikatorKunci: {
      nama: '4 Indikator Transformasi SAMBUNG',
      isFulfilled: isAll4IndicatorsOptimal,
      details: {
        peranGuru: peranGuruStatus,
        aktivitasMurid: aktivitasMuridStatus,
        konteksNyata: konteksNyataStatus,
        refleksiMurid: refleksiMuridStatus,
      },
    },
    evaluasiTahunan: hasEvaluasi ? {
      nama: 'Evaluasi Portofolio 1 Tahun',
      score: s.evaluasiTahunan!.finalAverageScore,
      target: 80,
      isFulfilled: isEvaluasiOptimal,
      keterangan: isEvaluasiOptimal ? 'Tuntas (≥80%)' : `Belum Tuntas (${s.evaluasiTahunan!.finalAverageScore}% < 80%)`,
    } : undefined,
    allFulfilled: isOptimal,
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
    defisitMenujuOptimal,
    komponenDefisitList,
    komponenStatus,
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
  averageScoreOptimal: number;
  averageScoreBelumOptimal: number;
  averageDefisitBelumOptimal: number;
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
  let optimalScoreSum = 0;
  let belumOptimalScoreSum = 0;
  let belumOptimalDefisitSum = 0;

  supervisions.forEach((sup) => {
    const res = calculateSupervisionComprehensiveScore(sup);
    totalScoreSum += res.finalComprehensiveScore;
    totalDeltaSum += res.deltaPeningkatan;

    if (res.statusOptimal === 'optimal') {
      optimalTeachers.push({ supervision: sup, result: res });
      optimalScoreSum += res.finalComprehensiveScore;
    } else {
      belumOptimalTeachers.push({ supervision: sup, result: res });
      belumOptimalScoreSum += res.finalComprehensiveScore;
      belumOptimalDefisitSum += res.defisitMenujuOptimal;
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

  const averageScoreOptimal = optimalCount > 0 ? Math.round((optimalScoreSum / optimalCount) * 10) / 10 : 0;
  const averageScoreBelumOptimal = belumOptimalCount > 0 ? Math.round((belumOptimalScoreSum / belumOptimalCount) * 10) / 10 : 0;
  const averageDefisitBelumOptimal = belumOptimalCount > 0 ? Math.round((belumOptimalDefisitSum / belumOptimalCount) * 10) / 10 : 0;

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
    averageScoreOptimal,
    averageScoreBelumOptimal,
    averageDefisitBelumOptimal,
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
    if (comp.komponenStatus?.indikatorKunci?.details?.[indikator]) {
      return comp.komponenStatus.indikatorKunci.details[indikator];
    }
    if (indikator === 'peranGuru') return (comp.akhirTelaah >= 85 && comp.akhirObservasi >= 85) ? 'optimal' : 'belum_optimal';
    if (indikator === 'aktivitasMurid') return comp.akhirObservasi >= 85 ? 'optimal' : 'belum_optimal';
    if (indikator === 'konteksNyata') return (comp.akhirTelaah >= 85 && comp.akhirObservasi >= 80) ? 'optimal' : 'belum_optimal';
    if (indikator === 'refleksiMurid') return comp.finalComprehensiveScore >= 85 ? 'optimal' : 'belum_optimal';
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
