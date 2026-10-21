import { Supervision, SambungData } from '../types';

export type StageKey = 'S' | 'A' | 'M' | 'B' | 'U' | 'N' | 'G';

export interface StageProgressDetail {
  key: StageKey;
  letter: string;
  name: string;
  subTitle: string;
  isComplete: boolean;
  isLocked: boolean;
  progressPercent: number; // 0 to 100% for this individual stage
  statusLabel: 'Belum Diisi' | 'Sedang Berjalan' | 'Selesai' | 'Terkunci';
  missingReasons: string[];
}

export interface SupervisionSambungProgress {
  stages: Record<StageKey, StageProgressDetail>;
  completedStagesCount: number;
  overallPercent: number; // 0 - 100%
  currentActiveStage: StageKey;
  statusBadge: {
    text: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
  };
  canProceedTo: (targetStage: StageKey) => { allowed: boolean; lockedReason?: string };
}

export const STAGES_LIST: Array<{ key: StageKey; letter: string; name: string; subTitle: string }> = [
  { key: 'S', letter: 'S', name: 'Selidiki', subTitle: 'Kondisi Awal & Telaah' },
  { key: 'A', letter: 'A', name: 'Amati', subTitle: 'Fokus Perbaikan & Aksi' },
  { key: 'M', letter: 'M', name: 'Maknai', subTitle: 'Coaching 10 Pertanyaan' },
  { key: 'B', letter: 'B', name: 'Berdayakan', subTitle: 'Modul Ajar & Siklus Coba' },
  { key: 'U', letter: 'U', name: 'Uji', subTitle: 'Observasi 25 Aspek & Murid' },
  { key: 'N', letter: 'N', name: 'Nyatakan', subTitle: 'Dampak Before vs After' },
  { key: 'G', letter: 'G', name: 'Gerakkan', subTitle: 'Tindak Lanjut & Diseminasi' },
];

/**
 * Checks whether an individual stage is completed based on filled fields
 */
export function checkStageCompletion(
  sup: Supervision,
  stage: StageKey
): { isComplete: boolean; progressPercent: number; missingReasons: string[] } {
  const sambung = sup.sambung;
  const missingReasons: string[] = [];

  switch (stage) {
    case 'S': {
      // S - SELIDIKI
      // Complete if either:
      // 1. matriksBefore has filled indicators, OR
      // 2. items has filled kondisiAwal/kebutuhanPembinaan, OR
      // 3. perangkatAjar has telaah scores/summary
      const selidiki = sambung?.selidiki;
      const mb = selidiki?.matriksBefore;
      const hasMatriks = Boolean(
        mb && (mb.peranGuru?.trim() || mb.aktivitasMurid?.trim() || mb.konteksNyata?.trim() || mb.refleksiMurid?.trim())
      );
      const hasItems = Boolean(
        selidiki?.items && selidiki.items.some(i => i.kondisiAwal?.trim() || i.kebutuhanPembinaan?.trim())
      );
      const hasTelaah = Boolean(
        sup.perangkatAjar?.telaahSummary?.finalScore && sup.perangkatAjar.telaahSummary.finalScore > 0
      );

      if (!hasMatriks && !hasItems && !hasTelaah) {
        missingReasons.push('Isi instrumen pemetaan kondisi awal atau 4 Indikator Matriks Sebelum Supervisi (Peran Guru, Aktivitas Murid, Konteks Nyata, Refleksi Murid)');
        return { isComplete: false, progressPercent: 0, missingReasons };
      }

      // Check depth of completion
      let filledCount = 0;
      if (mb?.peranGuru?.trim()) filledCount++;
      if (mb?.aktivitasMurid?.trim()) filledCount++;
      if (mb?.konteksNyata?.trim()) filledCount++;
      if (mb?.refleksiMurid?.trim()) filledCount++;
      if (hasItems) filledCount += 2;
      if (hasTelaah) filledCount += 2;

      if (filledCount === 0) {
        missingReasons.push('Isi instrumen pemetaan kondisi awal atau 4 Indikator Matriks Sebelum Supervisi (Peran Guru, Aktivitas Murid, Konteks Nyata, Refleksi Murid)');
        return { isComplete: false, progressPercent: 0, missingReasons };
      }

      if (filledCount < 4) {
        const percent = Math.min(80, Math.round((filledCount / 4) * 100));
        missingReasons.push('Lengkapi 4 indikator matriks kondisi awal atau telaah perangkat ajar untuk menyelesaikan Tahap Selidiki');
        return { isComplete: false, progressPercent: percent, missingReasons };
      }

      return { isComplete: true, progressPercent: 100, missingReasons: [] };
    }

    case 'A': {
      // A - AMATI (ARAHKAN)
      // Complete if: fokusIndikatorTerpilih has at least 1 indicator AND (fokusPerubahan filled OR kegiatan has items)
      const arahkan = sambung?.arahkan;
      const hasFokus = Boolean(arahkan?.fokusIndikatorTerpilih && arahkan.fokusIndikatorTerpilih.length > 0);
      const hasPerubahan = Boolean(arahkan?.fokusPerubahan && arahkan.fokusPerubahan.trim().length > 5);
      const hasKegiatan = Boolean(arahkan?.kegiatan && arahkan.kegiatan.length > 0 && arahkan.kegiatan[0]?.kegiatanPembinaan?.trim());

      if (!hasFokus) {
        missingReasons.push('Pilih minimal 1 fokus indikator perbaikan dari hasil analisis Selidiki');
      }
      if (!hasPerubahan && !hasKegiatan) {
        missingReasons.push('Rumuskan kalimat fokus perubahan pembelajaran atau tambahkan minimal 1 rencana kegiatan aksi');
      }

      if (missingReasons.length > 0) {
        const percent = hasFokus ? 50 : 0;
        return { isComplete: false, progressPercent: percent, missingReasons };
      }

      return { isComplete: true, progressPercent: 100, missingReasons: [] };
    }

    case 'M': {
      // M - MAKNAI
      // Complete if:
      // 1. pertanyaanList has answers (at least 2 questions answered) OR
      // 2. coaching TIRTA has goals/commitments OR
      // 3. pascaObservasi has answers
      const maknai = sambung?.maknai;
      const qList = maknai?.pertanyaanList || {};
      const answeredQCount = Object.values(qList).filter(v => typeof v === 'string' && v.trim().length > 3).length;
      const hasCoaching = Boolean(maknai?.coaching?.tujuan?.trim() || maknai?.coaching?.komitmen?.trim());
      const hasPasca = Boolean(sup.pascaObservasi?.q1_kesan?.trim() || sup.pascaObservasi?.generalImpression?.trim());

      let mScore = 0;
      if (answeredQCount > 0) mScore += Math.min(60, answeredQCount * 15);
      if (hasCoaching) mScore += 30;
      if (hasPasca) mScore += 30;

      if (mScore === 0) {
        missingReasons.push('Isi dialog coaching reflektif atau tanggapi pertanyaan resmi MAKNAI Pasca-Observasi');
        return { isComplete: false, progressPercent: 0, missingReasons };
      }

      if (mScore < 50) {
        missingReasons.push('Lengkapi refleksi coaching MAKNAI (minimal 3 pertanyaan atau dialog alur TIRTA)');
        return { isComplete: false, progressPercent: Math.min(80, mScore), missingReasons };
      }

      return { isComplete: true, progressPercent: 100, missingReasons: [] };
    }

    case 'B': {
      // B - BERDAYAKAN
      const berdayakan = sambung?.berdayakan;
      const hasRpp = Boolean(berdayakan?.rppPerbaikanUrl && berdayakan.rppPerbaikanUrl.trim().length > 5);
      const hasSiklus = Boolean(berdayakan?.siklusList && berdayakan.siklusList.length > 0 && berdayakan.siklusList.some(s => s.rancanganDanUjiCoba?.trim()));
      const hasTelaah = Boolean(berdayakan?.telaahSummary?.finalScore && berdayakan.telaahSummary.finalScore > 0);
      const hasPerbaikan = Boolean(sup.perangkatAjarPerbaikan?.driveLinks?.modulAjarUrl);

      let bCount = 0;
      if (hasRpp || hasPerbaikan) bCount++;
      if (hasSiklus) bCount++;
      if (hasTelaah) bCount++;

      if (bCount === 0) {
        missingReasons.push('Unggah tautan berkas Modul Ajar / RPP Perbaikan atau isi siklus rancang-coba pembelajaran');
        return { isComplete: false, progressPercent: 0, missingReasons };
      }

      if (bCount < 2) {
        missingReasons.push('Tambahkan siklus rancang-coba atau telaah modul ajar perbaikan untuk menyelesaikan Tahap Berdayakan');
        return { isComplete: false, progressPercent: 50, missingReasons };
      }

      return { isComplete: true, progressPercent: 100, missingReasons: [] };
    }

    case 'U': {
      // U - UJI
      const uji = sambung?.uji;
      const hasObs = Boolean(uji?.observasiPelaksanaan?.totalSkor && uji.observasiPelaksanaan.totalSkor > 0);
      const hasU1 = Boolean(uji?.u1_observasi?.persentaseCapaian && uji.u1_observasi.persentaseCapaian > 0);
      const hasPra = Boolean(uji?.praObservasi?.q1?.trim());
      const hasObsPerbaikan = Boolean(sup.observasiKelasPerbaikan?.score && sup.observasiKelasPerbaikan.score > 0);

      let uCount = 0;
      if (hasObs || hasObsPerbaikan) uCount += 2;
      if (hasU1) uCount += 2;
      if (hasPra) uCount += 1;

      if (uCount === 0) {
        missingReasons.push('Lakukan observasi pelaksanaan pembelajaran tahap Uji (25 Aspek Pembelajaran Mendalam)');
        return { isComplete: false, progressPercent: 0, missingReasons };
      }

      if (uCount < 2) {
        missingReasons.push('Lengkapi instrumen observasi pelaksanaan pembelajaran tahap Uji');
        return { isComplete: false, progressPercent: Math.round((uCount / 3) * 100), missingReasons };
      }

      return { isComplete: true, progressPercent: 100, missingReasons: [] };
    }

    case 'N': {
      // N - NYATAKAN
      const nyatakan = sambung?.nyatakan;
      const hasBA = Boolean(nyatakan?.beforeAfter && nyatakan.beforeAfter.length > 0 && nyatakan.beforeAfter.some(b => b.setelahSambung?.trim()));
      const hasDD = Boolean(nyatakan?.dataDampak && nyatakan.dataDampak.length > 0 && nyatakan.dataDampak.some(d => d.akhir?.trim() || d.deskripsiPenilaian?.trim()));
      const hasMA = Boolean(
        sambung?.uji?.matriksAfter && (sambung.uji.matriksAfter.peranGuru?.trim() || sambung.uji.matriksAfter.aktivitasMurid?.trim())
      );

      let nCount = 0;
      if (hasBA) nCount++;
      if (hasDD) nCount++;
      if (hasMA) nCount++;

      if (nCount === 0) {
        missingReasons.push('Isi data perbandingan Before vs After atau data dampak capaian murid di Tahap Nyatakan');
        return { isComplete: false, progressPercent: 0, missingReasons };
      }

      if (nCount < 2) {
        missingReasons.push('Lengkapi data dampak capaian murid atau matriks Before vs After');
        return { isComplete: false, progressPercent: 50, missingReasons };
      }

      return { isComplete: true, progressPercent: 100, missingReasons: [] };
    }

    case 'G': {
      // G - GERAKKAN
      const gerakkan = sambung?.gerakkan;
      const hasTL = Boolean(gerakkan?.tindakLanjut && gerakkan.tindakLanjut.length > 0 && gerakkan.tindakLanjut.some(t => t.tindakLanjut?.trim()));
      const hasRTL = Boolean(gerakkan?.rtlNyatakan && gerakkan.rtlNyatakan.length > 0 && gerakkan.rtlNyatakan.some(r => r.rencanaTindakLanjut?.trim()));
      const hasPengimbasan = Boolean(gerakkan?.pengimbasan && gerakkan.pengimbasan.length > 0 && gerakkan.pengimbasan.some(p => p.praktikBaik?.trim()));

      let gCount = 0;
      if (hasTL || hasRTL) gCount++;
      if (hasPengimbasan) gCount++;

      if (gCount === 0) {
        missingReasons.push('Rumuskan rencana tindak lanjut (RTL) atau komitmen pengimbasan praktik baik di Tahap Gerakkan');
        return { isComplete: false, progressPercent: 0, missingReasons };
      }

      return { isComplete: true, progressPercent: 100, missingReasons: [] };
    }

    default:
      return { isComplete: false, progressPercent: 0, missingReasons: [] };
  }
}

/**
 * Calculates complete sequential progress for a supervision across SAMBUNG stages.
 * Enforces sequential gating: Stage N can only be entered if Stage N-1 is complete.
 */
export function getSupervisionSambungProgress(sup: Supervision): SupervisionSambungProgress {
  const stages: Record<StageKey, StageProgressDetail> = {} as any;

  let previousStageComplete = true;
  let completedCount = 0;
  let firstIncompleteStage: StageKey | null = null;

  for (let i = 0; i < STAGES_LIST.length; i++) {
    const item = STAGES_LIST[i];
    const prevItem = i > 0 ? STAGES_LIST[i - 1] : null;

    const completion = checkStageCompletion(sup, item.key);
    const isLocked = i === 0 ? false : !previousStageComplete;

    if (completion.isComplete) {
      completedCount++;
    } else if (!firstIncompleteStage) {
      firstIncompleteStage = item.key;
    }

    let statusLabel: 'Belum Diisi' | 'Sedang Berjalan' | 'Selesai' | 'Terkunci';
    if (isLocked) {
      statusLabel = 'Terkunci';
    } else if (completion.isComplete) {
      statusLabel = 'Selesai';
    } else if (completion.progressPercent > 0) {
      statusLabel = 'Sedang Berjalan';
    } else {
      statusLabel = 'Belum Diisi';
    }

    const missingReasons = [...completion.missingReasons];
    if (isLocked && prevItem) {
      missingReasons.unshift(`Tahap ${item.key} (${item.name}) terkunci. Selesaikan Tahap ${prevItem.key} (${prevItem.name}) terlebih dahulu.`);
    }

    stages[item.key] = {
      key: item.key,
      letter: item.letter,
      name: item.name,
      subTitle: item.subTitle,
      isComplete: completion.isComplete,
      isLocked,
      progressPercent: isLocked ? 0 : completion.progressPercent,
      statusLabel,
      missingReasons,
    };

    // If current stage is not complete, all subsequent stages are locked
    if (!completion.isComplete) {
      previousStageComplete = false;
    }
  }

  // Progres terhitung secara presisi sesuai dengan apa yang sudah diisi lengkap
  const totalStageScore = STAGES_LIST.reduce((acc, item) => {
    const st = stages[item.key];
    return acc + (st.isLocked ? 0 : st.progressPercent);
  }, 0);
  const overallPercent = Math.min(100, Math.round(totalStageScore / STAGES_LIST.length));
  const currentActiveStage: StageKey = firstIncompleteStage || 'G';

  // Determine user-friendly status badge
  let statusBadge = {
    text: `${completedCount}/7 Tahap (${overallPercent}%)`,
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-800',
    borderColor: 'border-slate-300',
  };

  if (completedCount === 7) {
    statusBadge = {
      text: 'Selesai Penuh (100%)',
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-800',
      borderColor: 'border-emerald-300',
    };
  } else if (completedCount === 0 && overallPercent === 0) {
    statusBadge = {
      text: 'Baru (0% - Belum Diisi)',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-300',
    };
  } else if (completedCount === 0) {
    statusBadge = {
      text: `Sedang Mengisi Tahap S (${overallPercent}%)`,
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-800',
      borderColor: 'border-indigo-300',
    };
  } else {
    const curStageDetail = stages[currentActiveStage];
    statusBadge = {
      text: `${completedCount}/7 Selesai (${overallPercent}%) • Tahap ${currentActiveStage} (${curStageDetail?.name || ''})`,
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-800',
      borderColor: 'border-amber-300',
    };
  }

  const canProceedTo = (targetStage: StageKey): { allowed: boolean; lockedReason?: string } => {
    const targetIdx = STAGES_LIST.findIndex(s => s.key === targetStage);
    if (targetIdx <= 0) return { allowed: true };

    for (let k = 0; k < targetIdx; k++) {
      const precedingKey = STAGES_LIST[k].key;
      const precedingDetail = stages[precedingKey];
      if (!precedingDetail.isComplete) {
        return {
          allowed: false,
          lockedReason: `Tahap ${targetStage} (${stages[targetStage]?.name}) masih terkunci. Anda belum menyelesaikan Tahap ${precedingKey} (${precedingDetail.name}): ${precedingDetail.missingReasons[0] || 'Instrumen belum lengkap'}`,
        };
      }
    }
    return { allowed: true };
  };

  return {
    stages,
    completedStagesCount: completedCount,
    overallPercent,
    currentActiveStage,
    statusBadge,
    canProceedTo,
  };
}
