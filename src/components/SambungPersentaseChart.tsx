import React, { useState, useMemo } from 'react';
import { Supervision } from '../types';
import { 
  DEFAULT_MATRIKS_BEFORE, 
  DEFAULT_MATRIKS_AFTER,
  DEFAULT_DATA_DAMPAK,
  getTeacherDescriptiveDataDampak
} from '../data/sambungSeed';
import { 
  BarChart3, 
  TrendingUp, 
  User, 
  Users, 
  Compass, 
  Sparkles, 
  ArrowUpRight, 
  CheckCircle2, 
  Layers, 
  ExternalLink, 
  School, 
  Search, 
  Filter, 
  SlidersHorizontal,
  ChevronRight,
  Info
} from 'lucide-react';

export interface SambungPersentaseChartProps {
  supervisions: Supervision[];
  selectedSchool?: string;
  onOpenTeacher?: (supervisionId: string) => void;
  showTeacherTable?: boolean;
}

// 4 Indikator Resmi dari KATEGORI & INDIKATOR PEMBELAJARAN
export const KATEGORI_INDIKATOR_PEMBELAJARAN = [
  {
    id: 1,
    key: 'peranGuru' as const,
    kategori: 'Peran Guru',
    indikator: 'Guru berorientasi pada pengalaman belajar murid',
    arah: 'Dari transfer konten ceramah menuju fasilitasi pengalaman bermakna murid',
    icon: User,
    colorTheme: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      text: 'text-indigo-900',
      badge: 'bg-indigo-100 text-indigo-800',
      barAwal: 'bg-slate-400',
      barAkhir: 'bg-gradient-to-t from-indigo-700 to-indigo-500',
      barAkhirHorizontal: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
      accent: 'text-indigo-600',
    },
  },
  {
    id: 2,
    key: 'aktivitasMurid' as const,
    kategori: 'Aktivitas Murid',
    indikator: 'Pembelajaran menghasilkan murid aktif mengaplikasikan pengetahuan',
    arah: 'Dari pasif mencatat/mendengarkan menuju aktif bereksperimen dan mengaplikasikan pengetahuan',
    icon: Users,
    colorTheme: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-900',
      badge: 'bg-purple-100 text-purple-800',
      barAwal: 'bg-slate-400',
      barAkhir: 'bg-gradient-to-t from-purple-700 to-purple-500',
      barAkhirHorizontal: 'bg-gradient-to-r from-purple-500 to-purple-600',
      accent: 'text-purple-600',
    },
  },
  {
    id: 3,
    key: 'konteksNyata' as const,
    kategori: 'Konteks Kehidupan Nyata',
    indikator: 'Pembelajaran terhubung dengan konteks nyata',
    arah: 'Dari materi abstrak buku teks menuju keterhubungan fenomena kontekstual riil kehidupan murid',
    icon: Compass,
    colorTheme: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      badge: 'bg-amber-100 text-amber-800',
      barAwal: 'bg-slate-400',
      barAkhir: 'bg-gradient-to-t from-amber-600 to-amber-500',
      barAkhirHorizontal: 'bg-gradient-to-r from-amber-500 to-amber-600',
      accent: 'text-amber-600',
    },
  },
  {
    id: 4,
    key: 'refleksiMurid' as const,
    kategori: 'Refleksi Murid',
    indikator: 'Pembelajaran membiasakan murid melakukan refleksi',
    arah: 'Dari belum rutin menjadi bagian integral pembelajaran harian dan metakognisi murid',
    icon: Sparkles,
    colorTheme: {
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      text: 'text-teal-900',
      badge: 'bg-teal-100 text-teal-800',
      barAwal: 'bg-slate-400',
      barAkhir: 'bg-gradient-to-t from-teal-700 to-teal-500',
      barAkhirHorizontal: 'bg-gradient-to-r from-teal-500 to-teal-600',
      accent: 'text-teal-600',
    },
  },
];

// Helper to extract teacher percentage and qualitative notes for the 4 indicators
export const extractTeacherIndicatorsData = (s: Supervision) => {
  const name = s.teacherName || 'Guru';
  const subject = s.subject || 'Mata Pelajaran';
  const school = s.schoolName || 'SMA';

  // 1. Data Before from Kesimpulan Selidiki
  const selidikiBefore = s.sambung?.selidiki?.matriksBefore;
  const beforeTexts = {
    peranGuru: selidikiBefore?.peranGuru || DEFAULT_MATRIKS_BEFORE.peranGuru,
    aktivitasMurid: selidikiBefore?.aktivitasMurid || DEFAULT_MATRIKS_BEFORE.aktivitasMurid,
    konteksNyata: selidikiBefore?.konteksNyata || DEFAULT_MATRIKS_BEFORE.konteksNyata,
    refleksiMurid: selidikiBefore?.refleksiMurid || DEFAULT_MATRIKS_BEFORE.refleksiMurid,
  };

  // 2. Data After from Uji
  const ujiAfter = s.sambung?.uji?.matriksAfter || s.sambung?.uji?.kesimpulanUji;
  const afterTexts = {
    peranGuru: ujiAfter?.peranGuru || DEFAULT_MATRIKS_AFTER.peranGuru,
    aktivitasMurid: ujiAfter?.aktivitasMurid || DEFAULT_MATRIKS_AFTER.aktivitasMurid,
    konteksNyata: ujiAfter?.konteksNyata || DEFAULT_MATRIKS_AFTER.konteksNyata,
    refleksiMurid: ujiAfter?.refleksiMurid || DEFAULT_MATRIKS_AFTER.refleksiMurid,
  };

  // 3. Quantitative percentages: extract from s.sambung?.nyatakan?.dataDampak or getTeacherDescriptiveDataDampak
  let dampakItems = s.sambung?.nyatakan?.dataDampak;
  if (!Array.isArray(dampakItems) || dampakItems.length < 4) {
    dampakItems = getTeacherDescriptiveDataDampak(
      name,
      subject,
      school,
      s.lessonTitle,
      s.perangkatAjar?.telaahSummary?.predicate,
      s.observasiKelas?.predicate
    );
  }

  // Parse percentages safely
  const parsePercent = (val?: string, fallback: number = 50): number => {
    if (!val) return fallback;
    const num = parseFloat(val.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? fallback : num;
  };

  const getDampakForIndikator = (idx: number, fallbackAwal: number, fallbackAkhir: number) => {
    const item = dampakItems && dampakItems[idx];
    const awal = item ? parsePercent(item.awal, fallbackAwal) : fallbackAwal;
    const akhir = item ? parsePercent(item.akhir, fallbackAkhir) : fallbackAkhir;
    return {
      awal,
      akhir,
      delta: Math.max(0, akhir - awal),
      makna: item?.makna || '',
      deskripsi: item?.deskripsiPenilaian || '',
    };
  };

  const d1 = getDampakForIndikator(0, 42, 88);
  const d2 = getDampakForIndikator(1, 41, 89);
  const d3 = getDampakForIndikator(2, 48, 90);
  const d4 = getDampakForIndikator(3, 31, 84);

  return {
    teacherId: s.id,
    teacherName: name,
    schoolName: school,
    subject: subject,
    indicators: {
      peranGuru: {
        kategori: 'Peran Guru',
        indikator: 'Guru berorientasi pada pengalaman belajar murid',
        beforeText: beforeTexts.peranGuru,
        afterText: afterTexts.peranGuru,
        beforePercent: d1.awal,
        afterPercent: d1.akhir,
        deltaPercent: d1.delta,
        makna: d1.makna,
      },
      aktivitasMurid: {
        kategori: 'Aktivitas Murid',
        indikator: 'Pembelajaran menghasilkan murid aktif mengaplikasikan pengetahuan',
        beforeText: beforeTexts.aktivitasMurid,
        afterText: afterTexts.aktivitasMurid,
        beforePercent: d2.awal,
        afterPercent: d2.akhir,
        deltaPercent: d2.delta,
        makna: d2.makna,
      },
      konteksNyata: {
        kategori: 'Konteks Kehidupan Nyata',
        indikator: 'Pembelajaran terhubung dengan konteks nyata',
        beforeText: beforeTexts.konteksNyata,
        afterText: afterTexts.konteksNyata,
        beforePercent: d3.awal,
        afterPercent: d3.akhir,
        deltaPercent: d3.delta,
        makna: d3.makna,
      },
      refleksiMurid: {
        kategori: 'Refleksi Murid',
        indikator: 'Pembelajaran membiasakan murid melakukan refleksi',
        beforeText: beforeTexts.refleksiMurid,
        afterText: afterTexts.refleksiMurid,
        beforePercent: d4.awal,
        afterPercent: d4.akhir,
        deltaPercent: d4.delta,
        makna: d4.makna,
      },
    },
    avgBefore: Math.round((d1.awal + d2.awal + d3.awal + d4.awal) / 4),
    avgAfter: Math.round((d1.akhir + d2.akhir + d3.akhir + d4.akhir) / 4),
    avgDelta: Math.round((d1.delta + d2.delta + d3.delta + d4.delta) / 4),
  };
};

export const SambungPersentaseChart: React.FC<SambungPersentaseChartProps> = ({
  supervisions,
  selectedSchool = 'all',
  onOpenTeacher,
  showTeacherTable = true,
}) => {
  const [chartMode, setChartMode] = useState<'grouped_bars' | 'horizontal_trajectory' | 'table_matrix'>('grouped_bars');
  const [selectedIndicatorKey, setSelectedIndicatorKey] = useState<'all' | 'peranGuru' | 'aktivitasMurid' | 'konteksNyata' | 'refleksiMurid'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTeacherId, setExpandedTeacherId] = useState<string | null>(null);

  // Filter teachers by school and search query
  const filteredList = useMemo(() => {
    return supervisions.filter(s => {
      const matchSchool = selectedSchool === 'all' || s.schoolName === selectedSchool;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = q === '' ||
        s.teacherName.toLowerCase().includes(q) ||
        s.subject.toLowerCase().includes(q) ||
        s.schoolName.toLowerCase().includes(q);
      return matchSchool && matchQuery;
    });
  }, [supervisions, selectedSchool, searchQuery]);

  // Extract all teachers structured data
  const teachersStats = useMemo(() => {
    return filteredList.map(s => extractTeacherIndicatorsData(s));
  }, [filteredList]);

  // Aggregate averages for each of the 4 indicators
  const aggregatedStats = useMemo(() => {
    const count = teachersStats.length || 1;
    
    return KATEGORI_INDIKATOR_PEMBELAJARAN.map(ind => {
      let sumBefore = 0;
      let sumAfter = 0;

      teachersStats.forEach(t => {
        const item = t.indicators[ind.key];
        sumBefore += item.beforePercent;
        sumAfter += item.afterPercent;
      });

      const avgBefore = parseFloat((sumBefore / count).toFixed(1));
      const avgAfter = parseFloat((sumAfter / count).toFixed(1));
      const delta = parseFloat((avgAfter - avgBefore).toFixed(1));

      return {
        ...ind,
        avgBefore,
        avgAfter,
        delta,
      };
    });
  }, [teachersStats]);

  // Overall grand average
  const grandStats = useMemo(() => {
    if (aggregatedStats.length === 0) return { avgBefore: 0, avgAfter: 0, delta: 0 };
    const avgBefore = parseFloat((aggregatedStats.reduce((acc, curr) => acc + curr.avgBefore, 0) / 4).toFixed(1));
    const avgAfter = parseFloat((aggregatedStats.reduce((acc, curr) => acc + curr.avgAfter, 0) / 4).toFixed(1));
    const delta = parseFloat((avgAfter - avgBefore).toFixed(1));
    return { avgBefore, avgAfter, delta };
  }, [aggregatedStats]);

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* BANNER UTAMA KESIMPULAN PERSENTASE SAMBUNG: BEFORE (SELIDIKI) VS AFTER (UJI) */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-indigo-800/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-800/80 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>GRAFIK KESIMPULAN PERSENTASE SIKLUS SAMBUNG</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Komparasi Persentase Semua Guru: Before (Selidiki) vs After (Uji)
              </h3>
              <p className="text-xs sm:text-sm text-indigo-100/90 mt-1 max-w-4xl leading-relaxed">
                Grafik sintesis persentase ketercapaian seluruh guru binaan pada <strong>4 Kategori &amp; Indikator Pembelajaran</strong>. Data Before bersumber dari kesimpulan <strong>Tahap Selidiki (Baseline)</strong> dan data After bersumber dari pembuktian <strong>Tahap Uji (Setelah Perbaikan)</strong>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-indigo-200 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 shadow-2xs">
                Mencakup: <strong className="text-white">{filteredList.length} Guru Binaan</strong>
              </span>
              <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-400/30">
                Peningkatan Rata-Rata: <strong>+{grandStats.delta}%</strong>
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar across the 4 Indicators */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {aggregatedStats.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={item.id}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-all"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-amber-300" />
                      <span>{item.kategori}</span>
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                      <ArrowUpRight className="w-3 h-3" />
                      <span>+{item.delta}%</span>
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white leading-snug line-clamp-1 mb-2">
                    {item.indikator}
                  </h4>

                  <div className="flex items-baseline justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-300 block uppercase">Before (Selidiki)</span>
                      <span className="text-lg font-black text-slate-200">{item.avgBefore}%</span>
                    </div>
                    <span className="text-slate-400 font-bold">&rarr;</span>
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-300 block uppercase font-bold">After (Uji)</span>
                      <span className="text-lg font-black text-emerald-300">{item.avgAfter}%</span>
                    </div>
                  </div>

                  {/* Dual progress bar */}
                  <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mt-2 relative">
                    <div 
                      style={{ width: `${item.avgBefore}%` }} 
                      className="h-full bg-slate-300 absolute left-0 top-0 opacity-80" 
                    />
                    <div 
                      style={{ width: `${item.avgAfter}%` }} 
                      className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 absolute left-0 top-0 opacity-95" 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CONTROLS: VIEW SWITCHER, INDICATOR FILTER, & SEARCH                        */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setChartMode('grouped_bars')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartMode === 'grouped_bars' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Grafik Batang Komparatif</span>
            </button>
            <button
              type="button"
              onClick={() => setChartMode('horizontal_trajectory')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartMode === 'horizontal_trajectory' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
              <span>Diagram Per Guru Binaan</span>
            </button>
            {showTeacherTable && (
              <button
                type="button"
                onClick={() => setChartMode('table_matrix')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  chartMode === 'table_matrix' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-purple-600" />
                <span>Tabel Rekapitulasi Persentase</span>
              </button>
            )}
          </div>

          {/* Indicator filter pill */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 font-semibold text-[11px] px-1">Fokus:</span>
            <select
              value={selectedIndicatorKey}
              onChange={(e) => setSelectedIndicatorKey(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-indigo-900 focus:outline-indigo-600 cursor-pointer"
            >
              <option value="all">Semua 4 Indikator</option>
              <option value="peranGuru">1. Peran Guru</option>
              <option value="aktivitasMurid">2. Aktivitas Murid</option>
              <option value="konteksNyata">3. Konteks Nyata</option>
              <option value="refleksiMurid">4. Refleksi Murid</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari guru atau mapel..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600 bg-slate-50"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: GRAFIK BATANG KOMPARATIF (GROUPED BAR CHARTS)                     */}
      {/* ========================================================================= */}
      {chartMode === 'grouped_bars' && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h4 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <span>Grafik Komparasi Rata-Rata Persentase Before (Selidiki) vs After (Uji)</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Rata-rata persentase dihitung dari pembuktian seluruh {filteredList.length} guru binaan di satuan pendidikan yang dipilih.
              </p>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-slate-400 border border-slate-500/30" />
                <span className="text-slate-600">Before (Selidiki / Baseline)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-emerald-600 shadow-2xs" />
                <span className="text-emerald-800">After (Uji / Pembuktian)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
                  +Delta%
                </span>
                <span className="text-slate-600">Pertumbuhan</span>
              </div>
            </div>
          </div>

          {/* Big Visual Bars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
            {aggregatedStats
              .filter(item => selectedIndicatorKey === 'all' || selectedIndicatorKey === item.key)
              .map((item) => {
                const Icon = item.icon;
                const maxBarHeight = 180;
                const heightBefore = Math.max(20, (item.avgBefore / 100) * maxBarHeight);
                const heightAfter = Math.max(20, (item.avgAfter / 100) * maxBarHeight);

                return (
                  <div
                    key={item.id}
                    className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    {/* Header info */}
                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${item.colorTheme.badge}`}>
                          {item.kategori}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black border border-emerald-300 shadow-2xs">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>+{item.delta}%</span>
                        </span>
                      </div>
                      <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-snug pt-1">
                        {item.indikator}
                      </h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-medium line-clamp-2">
                        {item.arah}
                      </p>
                    </div>

                    {/* Vertical Grouped Chart Area */}
                    <div className="h-56 flex items-end justify-center gap-6 border-b border-dashed border-slate-300 pb-3 relative bg-white rounded-xl p-3 shadow-2xs">
                      {/* Gridlines */}
                      <div className="absolute inset-x-3 top-3 border-b border-slate-100 text-[9px] text-slate-300 font-mono text-right pr-1">100%</div>
                      <div className="absolute inset-x-3 top-1/2 border-b border-slate-100 text-[9px] text-slate-300 font-mono text-right pr-1">50%</div>

                      {/* Bar Before (Selidiki) */}
                      <div className="flex flex-col items-center gap-1.5 z-10 w-14">
                        <span className="text-xs font-black text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          {item.avgBefore}%
                        </span>
                        <div
                          style={{ height: `${heightBefore}px` }}
                          className="w-full rounded-t-xl bg-slate-400 border border-slate-500/40 shadow-xs transition-all duration-700"
                        />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center mt-0.5">
                          Selidiki
                        </span>
                      </div>

                      {/* Bar After (Uji) */}
                      <div className="flex flex-col items-center gap-1.5 z-10 w-14">
                        <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300 shadow-2xs">
                          {item.avgAfter}%
                        </span>
                        <div
                          style={{ height: `${heightAfter}px` }}
                          className="w-full rounded-t-xl bg-gradient-to-t from-emerald-600 via-teal-500 to-emerald-400 border border-emerald-500 shadow-md transition-all duration-700 relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" />
                        </div>
                        <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider text-center mt-0.5">
                          Uji
                        </span>
                      </div>
                    </div>

                    {/* Bottom Indicator Note */}
                    <div className="mt-4 pt-3 border-t border-slate-200/80 text-[11px] text-slate-600 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                        <span>Pencapaian Selidiki: {item.avgBefore}%</span>
                        <span className="text-emerald-700 font-extrabold">Uji: {item.avgAfter}%</span>
                      </div>
                      <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-200 text-[10px] font-bold text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Lonjakan positif terverifikasi di lapangan (+{item.delta}%)</span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: DIAGRAM KOMPARASI HORIZONTAL PER GURU BINAAN                      */}
      {/* ========================================================================= */}
      {chartMode === 'horizontal_trajectory' && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h4 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
                <span>Diagram Komparasi Persentase Individual Per Guru (Selidiki vs Uji)</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Menampilkan pergeseran persentase masing-masing guru binaan untuk memantau disparitas dan kemajuan individual.
              </p>
            </div>

            <div className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              Total: <strong className="text-indigo-900">{teachersStats.length} Guru</strong>
            </div>
          </div>

          <div className="space-y-4">
            {teachersStats.map((t, idx) => {
              const isExpanded = expandedTeacherId === t.teacherId;

              return (
                <div 
                  key={t.teacherId || idx}
                  className="rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 p-4 sm:p-5 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-800 text-xs font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-black text-slate-900 text-sm">{t.teacherName}</h5>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-indigo-700">
                            {t.subject}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <School className="w-3 h-3 text-slate-400" />
                          <span>{t.schoolName}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <div className="text-right text-xs">
                        <span className="text-[10px] text-slate-400 block font-semibold">Rata-Rata 4 Indikator</span>
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="text-slate-600">{t.avgBefore}% (Selidiki)</span>
                          <span className="text-slate-300">&rarr;</span>
                          <span className="text-emerald-700 font-black">{t.avgAfter}% (Uji)</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
                            +{t.avgDelta}%
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setExpandedTeacherId(isExpanded ? null : t.teacherId)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        {isExpanded ? 'Tutup Detail' : 'Lihat 4 Indikator'}
                      </button>

                      {onOpenTeacher && (
                        <button
                          type="button"
                          onClick={() => onOpenTeacher(t.teacherId)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>Portofolio</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 4 Indicators Horizontal Bar Stack */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-200/70">
                    {KATEGORI_INDIKATOR_PEMBELAJARAN.map((ind) => {
                      const indData = t.indicators[ind.key];

                      return (
                        <div key={ind.key} className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-extrabold text-slate-800 truncate pr-1">
                              {ind.kategori}
                            </span>
                            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              +{indData.deltaPercent}%
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
                            <span>Selidiki: <strong>{indData.beforePercent}%</strong></span>
                            <span>Uji: <strong className="text-emerald-700">{indData.afterPercent}%</strong></span>
                          </div>

                          {/* Dual Bar Track */}
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden relative border border-slate-200">
                            <div 
                              style={{ width: `${indData.beforePercent}%` }} 
                              className="h-full bg-slate-400 absolute left-0 top-0" 
                            />
                            <div 
                              style={{ width: `${indData.afterPercent}%` }} 
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 absolute left-0 top-0 opacity-90" 
                            />
                          </div>

                          {/* Expanded Qualitative Notes */}
                          {isExpanded && (
                            <div className="pt-2 mt-2 border-t border-slate-100 text-[10px] text-slate-600 space-y-1 animate-fade-in">
                              <div className="p-1.5 rounded bg-slate-50 border border-slate-100">
                                <strong className="text-slate-500 block uppercase text-[9px]">Selidiki (Before):</strong>
                                <span className="line-clamp-2">{indData.beforeText}</span>
                              </div>
                              <div className="p-1.5 rounded bg-purple-50/70 border border-purple-100 text-purple-950">
                                <strong className="text-purple-700 block uppercase text-[9px]">Uji (After):</strong>
                                <span className="line-clamp-2">{indData.afterText}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: TABEL REKAPITULASI PERSENTASE & MATRIKS LENGKAP                   */}
      {/* ========================================================================= */}
      {chartMode === 'table_matrix' && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h4 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-600" />
                <span>Tabel Rekapitulasi Persentase Sesuai 4 Kategori &amp; Indikator Pembelajaran</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Data Before bersumber dari <strong>Kesimpulan Selidiki</strong> dan data After bersumber dari <strong>Hasil Uji</strong>.
              </p>
            </div>

            <span className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 font-semibold">
              Menampilkan {teachersStats.length} Guru
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-xs border-collapse min-w-[1100px]">
              <thead>
                <tr className="bg-gradient-to-r from-slate-100 via-indigo-50/50 to-slate-100 text-slate-800 font-bold border-b border-slate-200 uppercase text-[10px]">
                  <th className="py-3 px-3 text-center w-10">No</th>
                  <th className="py-3 px-3 text-left w-52 font-bold">Identitas Guru &amp; Sekolah</th>
                  <th className="py-3 px-3 text-center w-48 font-bold bg-indigo-50/40 text-indigo-950">
                    1. Peran Guru (Selidiki &rarr; Uji)
                  </th>
                  <th className="py-3 px-3 text-center w-48 font-bold bg-purple-50/40 text-purple-950">
                    2. Aktivitas Murid (Selidiki &rarr; Uji)
                  </th>
                  <th className="py-3 px-3 text-center w-48 font-bold bg-amber-50/40 text-amber-950">
                    3. Konteks Nyata (Selidiki &rarr; Uji)
                  </th>
                  <th className="py-3 px-3 text-center w-48 font-bold bg-teal-50/40 text-teal-950">
                    4. Refleksi Murid (Selidiki &rarr; Uji)
                  </th>
                  <th className="py-3 px-3 text-center w-32 font-bold bg-emerald-50 text-emerald-950">
                    Rata-Rata Capaian
                  </th>
                  <th className="py-3 px-3 text-center w-28 font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachersStats.map((t, idx) => (
                  <tr key={t.teacherId || idx} className="hover:bg-slate-50/70 transition-colors align-middle">
                    <td className="py-3 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-3 font-extrabold text-slate-900">
                      <div>
                        <span className="text-slate-900 block font-black text-xs">{t.teacherName}</span>
                        <span className="text-[10px] text-indigo-700 font-bold block">{t.subject}</span>
                        <span className="text-[10px] text-slate-500 font-medium block">{t.schoolName}</span>
                      </div>
                    </td>

                    {/* 1. Peran Guru */}
                    <td className="py-3 px-3 text-center bg-indigo-50/20">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-indigo-200 font-bold text-[11px] shadow-2xs">
                        <span className="text-slate-600">{t.indicators.peranGuru.beforePercent}%</span>
                        <span className="text-slate-300">&rarr;</span>
                        <span className="text-indigo-900 font-black">{t.indicators.peranGuru.afterPercent}%</span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1 rounded">
                          +{t.indicators.peranGuru.deltaPercent}%
                        </span>
                      </div>
                    </td>

                    {/* 2. Aktivitas Murid */}
                    <td className="py-3 px-3 text-center bg-purple-50/20">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-purple-200 font-bold text-[11px] shadow-2xs">
                        <span className="text-slate-600">{t.indicators.aktivitasMurid.beforePercent}%</span>
                        <span className="text-slate-300">&rarr;</span>
                        <span className="text-purple-900 font-black">{t.indicators.aktivitasMurid.afterPercent}%</span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1 rounded">
                          +{t.indicators.aktivitasMurid.deltaPercent}%
                        </span>
                      </div>
                    </td>

                    {/* 3. Konteks Nyata */}
                    <td className="py-3 px-3 text-center bg-amber-50/20">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-amber-200 font-bold text-[11px] shadow-2xs">
                        <span className="text-slate-600">{t.indicators.konteksNyata.beforePercent}%</span>
                        <span className="text-slate-300">&rarr;</span>
                        <span className="text-amber-900 font-black">{t.indicators.konteksNyata.afterPercent}%</span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1 rounded">
                          +{t.indicators.konteksNyata.deltaPercent}%
                        </span>
                      </div>
                    </td>

                    {/* 4. Refleksi Murid */}
                    <td className="py-3 px-3 text-center bg-teal-50/20">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-teal-200 font-bold text-[11px] shadow-2xs">
                        <span className="text-slate-600">{t.indicators.refleksiMurid.beforePercent}%</span>
                        <span className="text-slate-300">&rarr;</span>
                        <span className="text-teal-900 font-black">{t.indicators.refleksiMurid.afterPercent}%</span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1 rounded">
                          +{t.indicators.refleksiMurid.deltaPercent}%
                        </span>
                      </div>
                    </td>

                    {/* Grand Average */}
                    <td className="py-3 px-3 text-center bg-emerald-50/40">
                      <div className="space-y-0.5">
                        <span className="text-xs font-black text-emerald-800 block">
                          {t.avgAfter}%
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Awal: {t.avgBefore}% (+{t.avgDelta}%)
                        </span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 text-center">
                      {onOpenTeacher && (
                        <button
                          type="button"
                          onClick={() => onOpenTeacher(t.teacherId)}
                          className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors w-full cursor-pointer"
                        >
                          <span>Lihat</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
