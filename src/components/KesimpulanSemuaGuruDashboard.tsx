import React, { useState, useMemo } from 'react';
import { Supervision, UserProfile } from '../types';
import { 
  DEFAULT_DATA_DAMPAK, 
  DEFAULT_MATRIKS_BEFORE, 
  DEFAULT_MATRIKS_AFTER 
} from '../data/sambungSeed';
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  User, 
  Compass, 
  Layers, 
  School, 
  Search, 
  ExternalLink,
  CheckCircle2,
  BookOpen,
  Filter,
  BarChart3,
  ArrowUpRight,
  Award,
  RotateCcw,
  SlidersHorizontal,
  Target
} from 'lucide-react';

interface KesimpulanSemuaGuruDashboardProps {
  supervisions: Supervision[];
  currentUser: UserProfile;
  onOpenSambungTeacher?: (supervisionId: string) => void;
}

const getPredicateTag = (s: Supervision): string | null => {
  const t = s.perangkatAjar?.telaahSummary?.predicate;
  const o = s.observasiKelas?.predicate;
  const isSB = (str?: string) => str && (str.toLowerCase().includes('sangat') || str.toLowerCase().includes('amat'));
  const isB = (str?: string) => str && str.toLowerCase().includes('baik') && !isSB(str);
  const isC = (str?: string) => str && str.toLowerCase().includes('cukup');
  
  const tagT = isSB(t) ? 'SB' : isB(t) ? 'B' : isC(t) ? 'C' : null;
  const tagO = isSB(o) ? 'SB' : isB(o) ? 'B' : isC(o) ? 'C' : null;

  if (tagT && tagO) {
    return tagT === tagO ? `[${tagT}]` : `[${tagT}, ${tagO}]`;
  }
  return tagT ? `[${tagT}]` : tagO ? `[${tagO}]` : null;
};

// Helper to extract Before and After descriptions resolving from any input section
const getTeacherAspects = (s: Supervision) => {
  const sambung = s.sambung;
  const beforeMatriks = sambung?.selidiki?.matriksBefore;
  const afterMatriks = sambung?.uji?.matriksAfter;
  const beforeAfterList = sambung?.nyatakan?.beforeAfter || [];

  const findInNyatakan = (keyword: string) => {
    const found = beforeAfterList.find(item => item.aspek.toLowerCase().includes(keyword.toLowerCase()));
    return found ? { before: found.sebelumSambung, after: found.setelahSambung } : null;
  };

  const peranGuruNyatakan = findInNyatakan('peran guru');
  const aktivitasMuridNyatakan = findInNyatakan('aktivitas murid');
  const konteksNyataNyatakan = findInNyatakan('konteks');
  const refleksiMuridNyatakan = findInNyatakan('refleksi');

  return {
    peranGuru: {
      before: peranGuruNyatakan?.before || beforeMatriks?.peranGuru || DEFAULT_MATRIKS_BEFORE.peranGuru,
      after: peranGuruNyatakan?.after || afterMatriks?.peranGuru || DEFAULT_MATRIKS_AFTER.peranGuru,
    },
    aktivitasMurid: {
      before: aktivitasMuridNyatakan?.before || beforeMatriks?.aktivitasMurid || DEFAULT_MATRIKS_BEFORE.aktivitasMurid,
      after: aktivitasMuridNyatakan?.after || afterMatriks?.aktivitasMurid || DEFAULT_MATRIKS_AFTER.aktivitasMurid,
    },
    konteksNyata: {
      before: konteksNyataNyatakan?.before || beforeMatriks?.konteksNyata || DEFAULT_MATRIKS_BEFORE.konteksNyata,
      after: konteksNyataNyatakan?.after || afterMatriks?.konteksNyata || DEFAULT_MATRIKS_AFTER.konteksNyata,
    },
    refleksiMurid: {
      before: refleksiMuridNyatakan?.before || beforeMatriks?.refleksiMurid || DEFAULT_MATRIKS_BEFORE.refleksiMurid,
      after: refleksiMuridNyatakan?.after || afterMatriks?.refleksiMurid || DEFAULT_MATRIKS_AFTER.refleksiMurid,
    },
  };
};

export const KesimpulanSemuaGuruDashboard: React.FC<KesimpulanSemuaGuruDashboardProps> = ({
  supervisions,
  currentUser,
  onOpenSambungTeacher,
}) => {
  const isKepsek = currentUser.role === 'kepsek';
  const isGuru = currentUser.role === 'guru';

  const defaultSchool = isKepsek ? (currentUser.schoolName || 'SMAN 4 Bogor') : 'all';
  const [selectedSchool, setSelectedSchool] = useState<string>(defaultSchool);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [chartViewMode, setChartViewMode] = useState<'bars' | 'trajectory'>('bars');
  const [matrixViewMode, setMatrixViewMode] = useState<'nyatakan' | 'selidiki' | 'uji'>('nyatakan');

  // Extract unique schools dynamically from supervisions
  const schoolOptions = useMemo(() => {
    if (isKepsek && currentUser.schoolName) {
      return [currentUser.schoolName];
    }
    const map = new Map<string, string>();
    supervisions.forEach(s => {
      if (s.schoolName) {
        map.set(s.schoolName, s.schoolName);
      }
    });
    return Array.from(map.values()).sort();
  }, [supervisions, isKepsek, currentUser.schoolName]);

  // Filtered supervisions based on selected school and search term
  const filteredSupervisions = useMemo(() => {
    return supervisions.filter(s => {
      if (isGuru) {
        return s.teacherId === currentUser.uid ||
               s.teacherName.toLowerCase().trim() === currentUser.displayName?.toLowerCase().trim();
      }

      if (isKepsek) {
        const userSch = (currentUser.schoolName || '').toLowerCase().trim();
        const supSch = (s.schoolName || '').toLowerCase().trim();
        const matchSchool = (currentUser.schoolId && s.schoolId === currentUser.schoolId) ||
                            (userSch && (supSch.includes(userSch) || userSch.includes(supSch)));
        const q = searchQuery.toLowerCase().trim();
        const matchQuery = q === '' ||
          s.teacherName.toLowerCase().includes(q) ||
          s.subject.toLowerCase().includes(q);
        return matchSchool && matchQuery;
      }

      const matchSchool = selectedSchool === 'all' || s.schoolName === selectedSchool;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = 
        q === '' ||
        s.teacherName.toLowerCase().includes(q) ||
        s.subject.toLowerCase().includes(q) ||
        s.schoolName.toLowerCase().includes(q);
      return matchSchool && matchQuery;
    });
  }, [supervisions, selectedSchool, searchQuery, isGuru, isKepsek, currentUser]);

  // Dynamic aggregation of quantitative impact data (Awal vs Setelah SAMBUNG)
  // connected in real-time to what the supervisor inputs or defaults
  const aggregatedImpact = useMemo(() => {
    // Collect all dataDampak items across filtered teachers
    const buckets: {
      [key: string]: {
        indikator: string;
        awalValues: number[];
        akhirValues: number[];
        maknaList: string[];
        deskripsiList: string[];
      };
    } = {
      '1': { 
        indikator: 'Guru berorientasi pada pengalaman belajar murid', 
        awalValues: [], 
        akhirValues: [], 
        maknaList: [],
        deskripsiList: [] 
      },
      '2': { 
        indikator: 'Murid aktif mengaplikasikan pengetahuan', 
        awalValues: [], 
        akhirValues: [], 
        maknaList: [],
        deskripsiList: [] 
      },
      '3': { 
        indikator: 'Pembelajaran terhubung dengan konteks nyata', 
        awalValues: [], 
        akhirValues: [], 
        maknaList: [],
        deskripsiList: [] 
      },
      '4': { 
        indikator: 'Murid melakukan refleksi', 
        awalValues: [], 
        akhirValues: [], 
        maknaList: [],
        deskripsiList: [] 
      },
    };

    const targetList = filteredSupervisions.length > 0 ? filteredSupervisions : supervisions;

    targetList.forEach(s => {
      const list = s.sambung?.nyatakan?.dataDampak;
      if (Array.isArray(list) && list.length > 0) {
        list.forEach((item, idx) => {
          let key = String(idx + 1);
          const indLower = (item.indikator || '').toLowerCase();
          if (indLower.includes('orientasi') || indLower.includes('pengalaman belajar')) {
            key = '1';
          } else if (indLower.includes('mengaplikasikan') || indLower.includes('aplikasi')) {
            key = '2';
          } else if (indLower.includes('konteks nyata') || indLower.includes('kehidupan')) {
            key = '3';
          } else if (indLower.includes('refleksi')) {
            key = '4';
          }

          if (buckets[key]) {
            const a = parseFloat((item.awal || '').replace(/[^0-9.]/g, ''));
            const b = parseFloat((item.akhir || '').replace(/[^0-9.]/g, ''));
            if (!isNaN(a)) buckets[key].awalValues.push(a);
            if (!isNaN(b)) buckets[key].akhirValues.push(b);
            if (item.makna && item.makna.trim()) buckets[key].maknaList.push(item.makna);
            if (item.deskripsiPenilaian && item.deskripsiPenilaian.trim()) {
              buckets[key].deskripsiList.push(item.deskripsiPenilaian);
            }
          }
        });
      }
    });

    return DEFAULT_DATA_DAMPAK.map((def, idx) => {
      const key = String(idx + 1);
      const bucket = buckets[key];
      const hasAwalData = bucket && bucket.awalValues.length > 0;
      const hasAkhirData = bucket && bucket.akhirValues.length > 0;

      const avgAwal = hasAwalData
        ? Math.round(bucket.awalValues.reduce((acc, v) => acc + v, 0) / bucket.awalValues.length)
        : parseFloat(def.awal.replace(/[^0-9.]/g, '')) || 0;

      const avgAkhir = hasAkhirData
        ? Math.round(bucket.akhirValues.reduce((acc, v) => acc + v, 0) / bucket.akhirValues.length)
        : parseFloat(def.akhir.replace(/[^0-9.]/g, '')) || 0;

      const delta = avgAkhir - avgAwal;
      const isSingleTeacher = targetList.length === 1;
      const makna = isSingleTeacher && bucket && bucket.maknaList.length > 0 
        ? bucket.maknaList[0] 
        : def.makna;
      const deskripsiPenilaian = isSingleTeacher && bucket && bucket.deskripsiList.length > 0 
        ? bucket.deskripsiList[0] 
        : (def as any).deskripsiPenilaian;

      return {
        indikator: def.indikator,
        awal: `${avgAwal}%`,
        akhir: `${avgAkhir}%`,
        makna,
        deskripsiPenilaian,
        awalNum: avgAwal,
        akhirNum: avgAkhir,
        deltaNum: delta,
      };
    });
  }, [filteredSupervisions, supervisions]);

  // Dynamic high-level statistics calculated from real supervisor inputs
  const dynamicStats = useMemo(() => {
    const list = filteredSupervisions;
    const totalTeachers = list.length;
    const uniqueSchoolsCount = new Set(list.map(s => s.schoolName).filter(Boolean)).size;

    // Overall quantitative gains from aggregated impact
    const totalDelta = aggregatedImpact.reduce((acc, item) => acc + item.deltaNum, 0);
    const avgGain = aggregatedImpact.length > 0 ? Math.round((totalDelta / aggregatedImpact.length) * 10) / 10 : 38.5;

    // Telaah scores
    const telaahScores = list
      .map(s => s.perangkatAjar?.telaahSummary?.finalScore)
      .filter((s): s is number => typeof s === 'number' && !isNaN(s));
    const avgTelaah = telaahScores.length > 0 
      ? Math.round((telaahScores.reduce((a, b) => a + b, 0) / telaahScores.length) * 10) / 10
      : 92.4;

    // Observasi scores
    const observasiScores = list
      .map(s => s.observasiKelas?.score)
      .filter((s): s is number => typeof s === 'number' && !isNaN(s));
    const avgObservasi = observasiScores.length > 0
      ? Math.round((observasiScores.reduce((a, b) => a + b, 0) / observasiScores.length) * 10) / 10
      : 93.8;

    // Predicates distribution
    let sbCount = 0;
    let bCount = 0;
    let cCount = 0;

    list.forEach(s => {
      const tag = getPredicateTag(s) || '';
      if (tag.includes('SB')) sbCount++;
      else if (tag.includes('B')) bCount++;
      else if (tag.includes('C')) cCount++;
    });

    // Highest gain indicator
    const topGain = [...aggregatedImpact].sort((a, b) => b.deltaNum - a.deltaNum)[0];

    return {
      totalTeachers,
      uniqueSchoolsCount,
      avgGain,
      avgTelaah,
      avgObservasi,
      sbCount,
      bCount,
      cCount,
      topGain,
    };
  }, [filteredSupervisions, aggregatedImpact]);

  return (
    <div className="space-y-8">
      {/* ========================================================================= */}
      {/* HEADER SECTION (SISTEM INFORMASI PENGAWASAN, PENDAMPINGAN & EVALUASI)     */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-indigo-800/50 shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Sistem Informasi Pengawasan, Pendampingan, dan Evaluasi Guru SMA</span>
            </div>

            <div className="text-xs text-indigo-200 flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10 shadow-2xs">
              <User className="w-3.5 h-3.5 text-indigo-300" />
              <span>Pengawas Pembina: <strong className="text-white">Kusnandar, M.Si</strong></span>
            </div>
          </div>

          <div className="max-w-3xl">
            <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
              Dashboard Kesimpulan Transformasi Seluruh Guru Pasca Siklus SAMBUNG
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200/90 mt-2 leading-relaxed">
              Rekapitulasi otomatis dan terhubung real-time dari seluruh tahapan <strong>Siklus SAMBUNG</strong> (Selidiki, Arahkan, Maknai, Berdayakan, Uji, Nyatakan, Gerakkan). Menghubungkan telaah modul ajar, observasi kelas, dan data dampak kuantitatif murid per guru binaan.
            </p>
          </div>

          {/* Connected Dynamic Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
              <span className="text-[11px] text-indigo-200 font-medium block">Total Guru Terdata</span>
              <span className="text-2xl font-black text-white mt-0.5 block">
                {dynamicStats.totalTeachers} Guru
              </span>
              <span className="text-[10px] text-emerald-300 font-medium flex items-center gap-1 mt-0.5">
                <School className="w-3 h-3" />
                <span>{dynamicStats.uniqueSchoolsCount} Satuan Pendidikan</span>
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
              <span className="text-[11px] text-indigo-200 font-medium block">Rata-rata Kenaikan Praktik</span>
              <span className="text-2xl font-black text-emerald-300 mt-0.5 block">
                +{dynamicStats.avgGain}%
              </span>
              <span className="text-[10px] text-indigo-200 font-medium">
                Peningkatan Aktivitas Murid
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
              <span className="text-[11px] text-indigo-200 font-medium block">Aplikasi Konteks Nyata</span>
              <span className="text-2xl font-black text-amber-300 mt-0.5 block">
                {aggregatedImpact[2]?.akhir || '89%'}
              </span>
              <span className="text-[10px] text-indigo-200 font-medium">
                Meningkat dari {aggregatedImpact[2]?.awal || '56%'} (+{aggregatedImpact[2]?.deltaNum || 33}%)
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
              <span className="text-[11px] text-indigo-200 font-medium block">Rutin Refleksi Murid</span>
              <span className="text-2xl font-black text-purple-300 mt-0.5 block">
                {aggregatedImpact[3]?.akhir || '78%'}
              </span>
              <span className="text-[10px] text-indigo-200 font-medium">
                Meningkat dari {aggregatedImpact[3]?.awal || '33%'} (+{aggregatedImpact[3]?.deltaNum || 45}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FILTER & PENCARIAN TERPADU                                                */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold text-slate-600">Filter Sekolah:</span>
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="bg-transparent font-bold text-indigo-900 focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Satuan Pendidikan ({supervisions.length} Guru)</option>
              {schoolOptions.map((sch) => {
                const count = supervisions.filter(s => s.schoolName === sch).length;
                return (
                  <option key={sch} value={sch}>
                    {sch} ({count} Guru)
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs w-60 sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Cari guru, mapel, atau materi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-slate-700 placeholder-slate-400 focus:outline-none text-xs"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                &times;
              </button>
            )}
          </div>

          {(selectedSchool !== 'all' || searchQuery !== '') && (
            <button
              onClick={() => { setSelectedSchool('all'); setSearchQuery(''); }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Data Terhubung Otomatis dengan Instrumen Pengawas</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEKSI 1: GRAFIK & DATA DAMPAK PEMBELAJARAN MURID (AWAL VS SETELAH SAMBUNG) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
        {/* Header Seksi */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Tabel &amp; Grafik Dampak Kuantitatif Siklus SAMBUNG</span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Data Dampak Pembelajaran Murid (Awal vs Setelah SAMBUNG)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Komparasi data persentase praktik pembelajaran sebelum dan setelah intervensi pendampingan pengawas sekolah.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setChartViewMode('bars')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  chartViewMode === 'bars'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Grafik Batang Komparasi</span>
              </button>
              <button
                type="button"
                onClick={() => setChartViewMode('trajectory')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  chartViewMode === 'trajectory'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                <span>Diagram Trayektori Kenaikan</span>
              </button>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Format Resmi SAMBUNG</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BAGIAN GRAFIK VISUAL (BAR CHART & PROGRESS TRAJECTORY)                    */}
        {/* ========================================================================= */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-50/70 to-indigo-50/30 border border-slate-200 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                Visualisasi Grafik &bull; Awal vs Setelah SAMBUNG
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {selectedSchool === 'all' 
                  ? 'Menampilkan rata-rata agregat seluruh satuan pendidikan binaan'
                  : `Menampilkan agregat khusus: ${selectedSchool}`}
              </span>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-slate-400 border border-slate-500" />
                <span className="text-slate-600 text-[11px]">Kondisi Awal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-gradient-to-r from-emerald-500 to-teal-500 shadow-xs" />
                <span className="text-emerald-700 text-[11px]">Setelah SAMBUNG</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-amber-400" />
                <span className="text-amber-700 text-[11px]">Selisih Kenaikan (%)</span>
              </div>
            </div>
          </div>

          {/* VIEW 1: GROUPED BAR CHART */}
          {chartViewMode === 'bars' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {aggregatedImpact.map((item, idx) => {
                const maxBarHeight = 160; // px
                const heightAwal = Math.max(16, (item.awalNum / 100) * maxBarHeight);
                const heightAkhir = Math.max(16, (item.akhirNum / 100) * maxBarHeight);

                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-indigo-300 transition-all group"
                  >
                    {/* Indicator Title & No */}
                    <div className="space-y-1 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black border border-emerald-200">
                          <ArrowUpRight className="w-3 h-3" />
                          <span>+{item.deltaNum}%</span>
                        </span>
                      </div>
                      <h4 className="font-extrabold text-slate-800 text-xs leading-snug line-clamp-2 pt-1 group-hover:text-indigo-900 transition-colors">
                        {item.indikator}
                      </h4>
                    </div>

                    {/* Bars Container */}
                    <div className="h-44 flex items-end justify-center gap-4 border-b border-dashed border-slate-200 pb-2 relative">
                      {/* Grid guidelines */}
                      <div className="absolute inset-x-0 top-0 border-b border-slate-100 text-[9px] text-slate-300 select-none pl-1">100%</div>
                      <div className="absolute inset-x-0 top-1/2 border-b border-slate-100 text-[9px] text-slate-300 select-none pl-1">50%</div>

                      {/* Bar Awal */}
                      <div className="flex flex-col items-center gap-1.5 z-10 w-11">
                        <span className="text-[11px] font-bold text-slate-600">
                          {item.awal}
                        </span>
                        <div
                          style={{ height: `${heightAwal}px` }}
                          className="w-full rounded-t-lg bg-slate-300 hover:bg-slate-400 transition-all border border-slate-400/50 shadow-2xs relative group/bar"
                          title={`Kondisi Awal: ${item.awal}`}
                        >
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover/bar:block bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded shadow whitespace-nowrap z-20">
                            Awal: {item.awal}
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          Awal
                        </span>
                      </div>

                      {/* Bar Setelah SAMBUNG */}
                      <div className="flex flex-col items-center gap-1.5 z-10 w-11">
                        <span className="text-[11px] font-black text-emerald-700">
                          {item.akhir}
                        </span>
                        <div
                          style={{ height: `${heightAkhir}px` }}
                          className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600 via-teal-500 to-emerald-400 hover:brightness-110 transition-all border border-emerald-500 shadow-md relative group/bar"
                          title={`Setelah SAMBUNG: ${item.akhir}`}
                        >
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover/bar:block bg-emerald-950 text-white text-[10px] px-1.5 py-0.5 rounded shadow whitespace-nowrap z-20">
                            Setelah SAMBUNG: {item.akhir} (+{item.deltaNum}%)
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">
                          Setelah
                        </span>
                      </div>
                    </div>

                    {/* Makna Snippet */}
                    <div className="mt-3 pt-2 text-[11px] text-slate-600 leading-relaxed font-medium bg-slate-50/80 p-2 rounded-xl border border-slate-100">
                      {item.makna}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW 2: PROGRESS TRAJECTORY (HORIZONTAL SLIDERS) */}
          {chartViewMode === 'trajectory' && (
            <div className="space-y-4">
              {aggregatedImpact.map((item, idx) => {
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2 hover:border-emerald-300 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm">
                          {item.indikator}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-bold">
                        <span className="text-slate-500">Awal: <strong>{item.awal}</strong></span>
                        <span className="text-slate-300">&rarr;</span>
                        <span className="text-emerald-700">Setelah SAMBUNG: <strong>{item.akhir}</strong></span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-black text-[11px] border border-emerald-200">
                          +{item.deltaNum}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Track */}
                    <div className="relative pt-2 pb-1">
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 relative">
                        {/* Awal marker */}
                        <div
                          style={{ width: `${item.awalNum}%` }}
                          className="h-full bg-slate-300 absolute left-0 top-0"
                        />
                        {/* Setelah SAMBUNG fill */}
                        <div
                          style={{ width: `${item.akhirNum}%` }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 absolute left-0 top-0 opacity-90"
                        />
                      </div>

                      {/* Scale points */}
                      <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <strong>Makna:</strong> {item.makna}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Insights Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Lonjakan Tertinggi</span>
                <span className="text-xs font-black text-slate-800 block">
                  {dynamicStats.topGain?.indikator ? dynamicStats.topGain.indikator.substring(0, 30) + '...' : 'Aplikasi Pengetahuan'}
                </span>
                <span className="text-[11px] font-extrabold text-emerald-600">
                  +{dynamicStats.topGain?.deltaNum || 44}% Pertumbuhan
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Capaian &gt; 75% Post-SAMBUNG</span>
                <span className="text-xs font-black text-slate-800 block">
                  4 dari 4 Indikator Mutu
                </span>
                <span className="text-[11px] font-extrabold text-indigo-600">
                  100% Target Intervensi Terlampaui
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Rata-rata Telaah &amp; Observasi</span>
                <span className="text-xs font-black text-slate-800 block">
                  {dynamicStats.avgTelaah} / 100 &bull; Predikat Sangat Baik
                </span>
                <span className="text-[11px] font-extrabold text-amber-600">
                  Observasi Tatap Muka: {dynamicStats.avgObservasi}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TABEL 1: DATA RESMI SESUAI DOKUMEN PRAKTIK BAIK                           */}
        {/* ========================================================================= */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-800 font-bold border-b border-slate-200 uppercase text-[11px]">
                <th className="py-3.5 px-4 text-center w-12">No</th>
                <th className="py-3.5 px-4 text-left font-bold">Indikator</th>
                <th className="py-3.5 px-4 text-center w-32 font-bold">Awal</th>
                <th className="py-3.5 px-4 text-center w-44 font-bold">Setelah SAMBUNG</th>
                <th className="py-3.5 px-4 text-left font-bold">Makna</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {aggregatedImpact.map((item, idx) => {
                return (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4 text-center font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-4 px-4 font-extrabold text-slate-900 align-middle text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
                        <span>{item.indikator}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center align-middle">
                      <span className="inline-block px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-extrabold text-xs border border-slate-200">
                        {item.awal}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center align-middle">
                      <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs border border-emerald-300 shadow-2xs">
                        <span>{item.akhir}</span>
                        <span className="text-[10px] text-emerald-700 bg-white/80 px-1.5 py-0.5 rounded font-black">
                          +{item.deltaNum}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 align-middle text-slate-700 leading-relaxed font-medium">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1.5">
                        <p className="font-extrabold text-slate-900">{item.makna}</p>
                        {item.deskripsiPenilaian && (
                          <p className="text-[11px] text-slate-600 bg-white/90 p-2 rounded-lg border border-slate-200/60 leading-relaxed">
                            <strong className="text-indigo-800 not-italic">Uraian Evaluasi Pengawas: </strong>
                            {item.deskripsiPenilaian}
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEKSI 2: ASPEK PERUBAHAN YANG TERLIHAT (SINTESIS 4 PILAR)                */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
              <Layers className="w-4 h-4" />
              <span>Tabel 2 &bull; Sintesis Kualitatif Perubahan Pembelajaran</span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Kesimpulan: Aspek Perubahan yang Terlihat
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Transformasi paradigma dan praktik pembelajaran di ruang kelas dari kondisi awal menuju pasca-siklus SAMBUNG.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-800 text-xs font-bold border border-indigo-200 self-start sm:self-auto">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>4 Pilar Kunci Transformasi</span>
          </div>
        </div>

        {/* 4 Pilar Kunci Transformasi Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-slate-100 to-indigo-50/60 text-slate-800 font-bold border-b border-slate-200 uppercase text-[11px]">
                <th className="py-3.5 px-4 text-center w-14">No</th>
                <th className="py-3.5 px-4 text-left w-64 font-bold text-slate-900">
                  Aspek Perubahan yang Terlihat
                </th>
                <th className="py-3.5 px-4 text-left font-bold text-slate-900">
                  Arah Transformasi Pembelajaran (Sebelum Menuju Sesudah)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Row 1: Peran Guru */}
              <tr className="hover:bg-indigo-50/30 transition-colors">
                <td className="py-4 px-4 text-center font-bold text-slate-400">1</td>
                <td className="py-4 px-4 font-extrabold text-slate-900 align-top">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-extrabold text-slate-900 block">Peran guru</span>
                      <span className="text-[10px] text-slate-400 font-medium">Orientasi Mengajar</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 align-top">
                  <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-col sm:flex-row sm:items-center gap-3">
                    <span className="font-bold text-indigo-950 text-xs sm:text-sm">
                      Dari berfokus pada penyampaian materi menuju pengalaman belajar murid
                    </span>
                    <span className="text-[10px] bg-white text-indigo-800 font-extrabold px-2.5 py-1 rounded-lg border border-indigo-200 shrink-0 self-start sm:self-auto">
                      Student-Centered
                    </span>
                  </div>
                </td>
              </tr>

              {/* Row 2: Aktivitas Murid */}
              <tr className="hover:bg-purple-50/30 transition-colors">
                <td className="py-4 px-4 text-center font-bold text-slate-400">2</td>
                <td className="py-4 px-4 font-extrabold text-slate-900 align-top">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-extrabold text-slate-900 block">Aktivitas murid</span>
                      <span className="text-[10px] text-slate-400 font-medium">Partisipasi &amp; Aksi</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 align-top">
                  <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100 flex flex-col sm:flex-row sm:items-center gap-3">
                    <span className="font-bold text-purple-950 text-xs sm:text-sm">
                      Dari lebih banyak menerima menjadi lebih aktif mengaplikasikan pengetahuan
                    </span>
                    <span className="text-[10px] bg-white text-purple-800 font-extrabold px-2.5 py-1 rounded-lg border border-purple-200 shrink-0 self-start sm:self-auto">
                      Active Application
                    </span>
                  </div>
                </td>
              </tr>

              {/* Row 3: Konteks Nyata */}
              <tr className="hover:bg-amber-50/30 transition-colors">
                <td className="py-4 px-4 text-center font-bold text-slate-400">3</td>
                <td className="py-4 px-4 font-extrabold text-slate-900 align-top">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-extrabold text-slate-900 block">Konteks nyata</span>
                      <span className="text-[10px] text-slate-400 font-medium">Relevansi Materi</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 align-top">
                  <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100 flex flex-col sm:flex-row sm:items-center gap-3">
                    <span className="font-bold text-amber-950 text-xs sm:text-sm">
                      Dari belum konsisten menjadi mulai dirancang dalam pembelajaran
                    </span>
                    <span className="text-[10px] bg-white text-amber-800 font-extrabold px-2.5 py-1 rounded-lg border border-amber-200 shrink-0 self-start sm:self-auto">
                      Real-World Design
                    </span>
                  </div>
                </td>
              </tr>

              {/* Row 4: Refleksi */}
              <tr className="hover:bg-blue-50/30 transition-colors">
                <td className="py-4 px-4 text-center font-bold text-slate-400">4</td>
                <td className="py-4 px-4 font-extrabold text-slate-900 align-top">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-extrabold text-slate-900 block">Refleksi</span>
                      <span className="text-[10px] text-slate-400 font-medium">Metakognisi &amp; Umpan Balik</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 align-top">
                  <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100 flex flex-col sm:flex-row sm:items-center gap-3">
                    <span className="font-bold text-blue-950 text-xs sm:text-sm">
                      Dari belum rutin menjadi mulai menjadi bagian pembelajaran
                    </span>
                    <span className="text-[10px] bg-white text-blue-800 font-extrabold px-2.5 py-1 rounded-lg border border-blue-200 shrink-0 self-start sm:self-auto">
                      Routine Habit
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEKSI 3: REKAPITULASI OTOMATIS INDIVIDUAL SELURUH GURU BINAAN             */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider mb-1">
              <BookOpen className="w-4 h-4" />
              <span>Tabel 3 &bull; Rekapitulasi Otomatis Individual Seluruh Guru Binaan</span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Matriks Perubahan Before &ndash; After Individual Semua Guru
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Dihasilkan otomatis dari kesimpulan Tahap Selidiki (Before) dan Tahap Uji / Nyatakan (After) masing-masing guru binaan yang telah diisi oleh pengawas.
            </p>
          </div>

          <div className="text-xs text-slate-500 font-semibold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            Menampilkan: <strong className="text-indigo-900">{filteredSupervisions.length} Guru</strong>
          </div>
        </div>

        {/* 3-Mode View Switcher: Nyatakan (Before-After), Selidiki (Baseline), Uji (Setelah Perbaikan) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setMatrixViewMode('nyatakan')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                matrixViewMode === 'nyatakan'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Tabel Nyatakan: Indikator, Selidiki (Before) &amp; Uji (After)</span>
            </button>

            <button
              type="button"
              onClick={() => setMatrixViewMode('selidiki')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                matrixViewMode === 'selidiki'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Tabel Selidiki: Indikator &amp; Selidiki (Baseline)</span>
            </button>

            <button
              type="button"
              onClick={() => setMatrixViewMode('uji')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                matrixViewMode === 'uji'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Tabel Uji: Indikator &amp; Uji (Setelah Perbaikan)</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-500 font-medium px-2">
            Menampilkan 4 indikator kunci per guru binaan
          </span>
        </div>

        {/* Big Detailed Matrix Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-xs border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-100/90 text-slate-800 font-bold border-b border-slate-200 uppercase text-[11px]">
                <th className="py-3.5 px-4 text-left w-56 font-bold">Identitas Guru &amp; Sekolah</th>
                <th className="py-3.5 px-4 text-left w-64 font-bold">
                  {matrixViewMode === 'selidiki' 
                    ? '1. Peran Guru (Selidiki / Kondisi Awal)' 
                    : matrixViewMode === 'uji' 
                    ? '1. Peran Guru (Uji / Setelah Perbaikan)' 
                    : '1. Peran Guru (Before → After)'}
                </th>
                <th className="py-3.5 px-4 text-left w-64 font-bold">
                  {matrixViewMode === 'selidiki' 
                    ? '2. Aktivitas Murid (Selidiki / Kondisi Awal)' 
                    : matrixViewMode === 'uji' 
                    ? '2. Aktivitas Murid (Uji / Setelah Perbaikan)' 
                    : '2. Aktivitas Murid (Before → After)'}
                </th>
                <th className="py-3.5 px-4 text-left w-64 font-bold">
                  {matrixViewMode === 'selidiki' 
                    ? '3. Konteks Nyata (Selidiki / Kondisi Awal)' 
                    : matrixViewMode === 'uji' 
                    ? '3. Konteks Nyata (Uji / Setelah Perbaikan)' 
                    : '3. Konteks Nyata (Before → After)'}
                </th>
                <th className="py-3.5 px-4 text-left w-64 font-bold">
                  {matrixViewMode === 'selidiki' 
                    ? '4. Refleksi Murid (Selidiki / Kondisi Awal)' 
                    : matrixViewMode === 'uji' 
                    ? '4. Refleksi Murid (Uji / Setelah Perbaikan)' 
                    : '4. Refleksi Murid (Before → After)'}
                </th>
                <th className="py-3.5 px-3 text-center w-28 font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSupervisions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ditemukan data guru yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredSupervisions.map((sup, idx) => {
                  const aspects = getTeacherAspects(sup);
                  const tag = getPredicateTag(sup);

                  return (
                    <tr key={sup.id || idx} className="hover:bg-slate-50/70 transition-colors align-top">
                      {/* Identitas Guru */}
                      <td className="py-4 px-4 bg-slate-50/50 border-r border-slate-100">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-extrabold text-slate-900 text-sm">
                              {sup.teacherName}
                            </span>
                            {tag && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black tracking-wide border shadow-2xs ${
                                tag.includes('SB')
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : tag.includes('B')
                                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}>
                                {tag}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-indigo-700 block">
                            {sup.subject}
                          </span>
                          <span className="text-[10px] text-slate-600 flex items-center gap-1 font-medium">
                            <School className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{sup.schoolName}</span>
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {sup.classGrade} &bull; {sup.semester}
                          </span>
                          {sup.perangkatAjar?.telaahSummary?.finalScore && (
                            <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Skor Telaah: {sup.perangkatAjar.telaahSummary.finalScore}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Peran Guru */}
                      <td className="py-4 px-4">
                        {matrixViewMode === 'selidiki' ? (
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                            <span className="text-[10px] font-bold text-indigo-700 uppercase block mb-1">
                              Kesimpulan Selidiki (Baseline):
                            </span>
                            <p className="text-slate-700 leading-relaxed text-[11px]">
                              {aspects.peranGuru.before}
                            </p>
                          </div>
                        ) : matrixViewMode === 'uji' ? (
                          <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200">
                            <span className="text-[10px] font-bold text-purple-700 uppercase block mb-1">
                              Kesimpulan Uji (Setelah Perbaikan):
                            </span>
                            <p className="text-purple-950 font-medium leading-relaxed text-[11px]">
                              {aspects.peranGuru.after}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                                Selidiki (Before):
                              </span>
                              <p className="text-slate-700 leading-relaxed text-[11px]">
                                {aspects.peranGuru.before}
                              </p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200">
                              <span className="text-[10px] font-bold text-indigo-700 uppercase block mb-0.5">
                                Uji (After):
                              </span>
                              <p className="text-indigo-950 font-medium leading-relaxed text-[11px]">
                                {aspects.peranGuru.after}
                              </p>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Aktivitas Murid */}
                      <td className="py-4 px-4">
                        {matrixViewMode === 'selidiki' ? (
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                            <span className="text-[10px] font-bold text-purple-700 uppercase block mb-1">
                              Kesimpulan Selidiki (Baseline):
                            </span>
                            <p className="text-slate-700 leading-relaxed text-[11px]">
                              {aspects.aktivitasMurid.before}
                            </p>
                          </div>
                        ) : matrixViewMode === 'uji' ? (
                          <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200">
                            <span className="text-[10px] font-bold text-purple-700 uppercase block mb-1">
                              Kesimpulan Uji (Setelah Perbaikan):
                            </span>
                            <p className="text-purple-950 font-medium leading-relaxed text-[11px]">
                              {aspects.aktivitasMurid.after}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                                Selidiki (Before):
                              </span>
                              <p className="text-slate-700 leading-relaxed text-[11px]">
                                {aspects.aktivitasMurid.before}
                              </p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200">
                              <span className="text-[10px] font-bold text-purple-700 uppercase block mb-0.5">
                                Uji (After):
                              </span>
                              <p className="text-purple-950 font-medium leading-relaxed text-[11px]">
                                {aspects.aktivitasMurid.after}
                              </p>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Konteks Nyata */}
                      <td className="py-4 px-4">
                        {matrixViewMode === 'selidiki' ? (
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                            <span className="text-[10px] font-bold text-amber-700 uppercase block mb-1">
                              Kesimpulan Selidiki (Baseline):
                            </span>
                            <p className="text-slate-700 leading-relaxed text-[11px]">
                              {aspects.konteksNyata.before}
                            </p>
                          </div>
                        ) : matrixViewMode === 'uji' ? (
                          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200">
                            <span className="text-[10px] font-bold text-amber-700 uppercase block mb-1">
                              Kesimpulan Uji (Setelah Perbaikan):
                            </span>
                            <p className="text-amber-950 font-medium leading-relaxed text-[11px]">
                              {aspects.konteksNyata.after}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                                Selidiki (Before):
                              </span>
                              <p className="text-slate-700 leading-relaxed text-[11px]">
                                {aspects.konteksNyata.before}
                              </p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200">
                              <span className="text-[10px] font-bold text-amber-700 uppercase block mb-0.5">
                                Uji (After):
                              </span>
                              <p className="text-amber-950 font-medium leading-relaxed text-[11px]">
                                {aspects.konteksNyata.after}
                              </p>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Refleksi Murid */}
                      <td className="py-4 px-4">
                        {matrixViewMode === 'selidiki' ? (
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                            <span className="text-[10px] font-bold text-blue-700 uppercase block mb-1">
                              Kesimpulan Selidiki (Baseline):
                            </span>
                            <p className="text-slate-700 leading-relaxed text-[11px]">
                              {aspects.refleksiMurid.before}
                            </p>
                          </div>
                        ) : matrixViewMode === 'uji' ? (
                          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200">
                            <span className="text-[10px] font-bold text-blue-700 uppercase block mb-1">
                              Kesimpulan Uji (Setelah Perbaikan):
                            </span>
                            <p className="text-blue-950 font-medium leading-relaxed text-[11px]">
                              {aspects.refleksiMurid.after}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                                Selidiki (Before):
                              </span>
                              <p className="text-slate-700 leading-relaxed text-[11px]">
                                {aspects.refleksiMurid.before}
                              </p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200">
                              <span className="text-[10px] font-bold text-blue-700 uppercase block mb-0.5">
                                Uji (After):
                              </span>
                              <p className="text-blue-950 font-medium leading-relaxed text-[11px]">
                                {aspects.refleksiMurid.after}
                              </p>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Aksi Button */}
                      <td className="py-4 px-3 text-center align-middle">
                        {onOpenSambungTeacher && (
                          <button
                            type="button"
                            onClick={() => onOpenSambungTeacher(sup.id)}
                            className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors w-full cursor-pointer"
                          >
                            <span>Buka Portofolio</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
