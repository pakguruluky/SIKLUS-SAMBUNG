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

      const percent = Math.min(100, Math.round((filledCount / 4) * 100));
      return { isComplete: true, progressPercent: percent, missingReasons: [] };
    }

    case 'A': {
      // A - AMATI (ARAHKAN)
      // Complete if: fokusIndikatorTerpilih has at least 1 indicator AND (fokusPerubahan filled OR kegiatan has items)
      const arahkan = sambung?.arahkan;
      const hasFokus = Boolean(arahkan?.fokusIndikatorTerpilih && arahkan.fokusIndikatorTerpilih.length > 0);
      const hasPerubahan = Boolean(arahkan?.fokusPerubahan && arahkan.fokusPerubahan.trim().length > 5);
      const hasKegiatan = Boolean(arahkan?.kegiatan && arahkan.kegiatan.length > 0 && arahkan.kegiatan[0].kegiatanPembinaan?.trim());

      if (!hasFokus) {
        missingReasons.push('Pilih minimal 1 fokus indikator perbaikan dari hasil analisis Selidiki');
      }
      if (!hasPerubahan && !hasKegiatan) {
        missingReasons.push('Rumuskan kalimat fokus perubahan pembelajaran atau tambahkan minimal 1 rencana kegiatan aksi');
      }

      if (missingReasons.length > 0) {
        const percent = hasFokus ? 40 : 0;
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

      if (answeredQCount === 0 && !hasCoaching && !hasPasca) {
        missingReasons.push('Isi dialog coaching reflektif atau tanggapi 10 Pertanyaan Resmi MAKNAI Pasca-Observasi');
        return { isComplete: false, progressPercent: 0, missingReasons };
      }

      const percent = Math.min(100, Math.max(50, Math.round((answeredQCount / 10) * 100)));
      return { isComplete: true, progressPercent: percent, missingReasons: [] };
    }

    case 'B': {
      // B - BERDAYAKAN
      // Complete if:
      // 1. rppPerbaikanUrl is provided OR
      // 2. siklusList has at least 1 cycle filled OR
      // 3. telaahScores has perbaikan scores OR
      // 4. perangkatAjarPerbaikan is filled
      const berdayakan = sambung?.berdayakan;
      const hasRpp = Boolean(berdayakan?.rppPerbaikanUrl && berdayakan.rppPerbaikanUrl.trim().length > 5);
      const hasSiklus = Boolean(berdayakan?.siklusList && berdayakan.siklusList.length > 0 && berdayakan.siklusList.some(s => s.rancanganDanUjiCoba?.trim()));
      const hasTelaah = Boolean(berdayakan?.telaahSummary?.finalScore && berdayakan.telaahSummary.finalScore > 0);
      const hasPerbaikan = Boolean(sup.perangkatAjarPerbaikan?.driveLinks?.modulAjarUrl);

      if (!hasRpp && !hasSiklus && !hasTelaah && !hasPerbaikan) {
        missingReasons.push('Unggah tautan berkas Modul Ajar / RPP Perbaikan atau isi siklus rancang-coba pembelajaran');
        return { isComplete: false, progressPercent: 0, missingReasons };
      }

      return { isComplete: true, progressPercent: 100, missingReasons: [] };
    }

    case 'U': {
      // U - UJI
      // Complete if:
      // 1. uji.observasiPelaksanaan has scores/items OR
      // 2. uji.u1_observasi has persentaseCapaian > 0 OR
      // 3. uji.praObservasi has answers OR
      // 4. observasiKelasPerbaikan has score > 0
      const uji = sambung?.uji;
      const hasObs = Boolean(uji?.observasiPelaksanaan?.totalSkor && uji.observasiPelaksanaan.totalSkor > 0);
      const hasU1 = Boolean(uji?.u1_observasi?.persentaseCapaian && uji.u1_observasi.persentaseCapaian > 0);
      const hasPra = Boolean(uji?.praObservasi?.q1?.trim());
      const hasObsPerbaikan = Boolean(sup.observasiKelasPerbaikan?.score && sup.observasiKelasPerbaikan.score > 0);

      if (!hasObs && !hasU1 && !hasPra && !hasObsPerbaikan) {
        missingReasons.push('Lakukan observasi pelaksanaan pembelajaran tahap Uji (25 Aspek Pembelajaran Mendalam)');
        return { isComplete: false, progressPercent: 0, missingReasons };
      }

      return { isComplete: true, progressPercent: 100, missingReasons: [] };
    }

    case 'N': {
      // N - NYATAKAN
      // Complete if:
      // 1. nyatakan.beforeAfter has at least 1 item with setelahSambung filled OR
      // 2. nyatakan.dataDampak has at least 1 indicator item with akhir value OR
      // 3. uji.matriksAfter has filled fields
      const nyatakan = sambung?.nyatakan;
      const hasBA = Boolean(nyatakan?.beforeAfter && nyatakan.beforeAfter.some(b => b.setelahSambung?.trim()));
      const hasDD = Boolean(nyatakan?.dataDampak && nyatakan.dataDampak.some(d => d.akhir?.trim()));
      const hasMA = Boolean(
        sambung?.uji?.matriksAfter && (sambung.uji.matriksAfter.peranGuru?.trim() || sambung.uji.matriksAfter.aktivitasMurid?.trim())
      );

      if (!hasBA && !hasDD && !hasMA) {
        missingReasons.push('Isi data perbandingan Before vs After atau data dampak capaian murid di Tahap Nyatakan');
        return { isComplete: false, progressPercent: 0, missingReasons };
      }

      return { isComplete: true, progressPercent: 100, missingReasons: [] };
    }

    case 'G': {
      // G - GERAKKAN
      // Complete if:
      // 1. gerakkan.tindakLanjut has items OR
      // 2. gerakkan.rtlNyatakan has items OR
      // 3. gerakkan.pengimbasan has items
      const gerakkan = sambung?.gerakkan;
      const hasTL = Boolean(gerakkan?.tindakLanjut && gerakkan.tindakLanjut.length > 0 && gerakkan.tindakLanjut.some(t => t.tindakLanjut?.trim()));
      const hasRTL = Boolean(gerakkan?.rtlNyatakan && gerakkan.rtlNyatakan.length > 0 && gerakkan.rtlNyatakan.some(r => r.rencanaTindakLanjut?.trim()));
      const hasPengimbasan = Boolean(gerakkan?.pengimbasan && gerakkan.pengimbasan.length > 0 && gerakkan.pengimbasan.some(p => p.praktikBaik?.trim()));

      if (!hasTL && !hasRTL && !hasPengimbasan) {
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

  const overallPercent = Math.round((completedCount / STAGES_LIST.length) * 100);
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
  } else if (completedCount === 0) {
    statusBadge = {
      text: 'Baru (0% - Belum Diisi)',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-300',
    };
  } else {
    const curStageDetail = stages[currentActiveStage];
    statusBadge = {
      text: `${completedCount}/7 Selesai &bull; Tahap ${currentActiveStage} (${curStageDetail?.name || ''})`,
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
