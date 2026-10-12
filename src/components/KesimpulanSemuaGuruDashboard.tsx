import React, { useState, useMemo } from 'react';
import { Supervision, UserProfile, SambungKesimpulanAlurSambung, SambungRtlNyatakanItem, SambungPengimbasanItem } from '../types';
import { 
  DEFAULT_DATA_DAMPAK, 
  DEFAULT_MATRIKS_BEFORE, 
  DEFAULT_MATRIKS_AFTER 
} from '../data/sambungSeed';
import { generateGerakkanData } from '../data/autoFillData';
import { SambungPrintModal } from './SambungPrintModal';
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
  Target,
  Share2,
  Printer,
  Eye,
  FileText,
  X,
  ChevronRight,
  ShieldCheck,
  Calendar,
  CheckCircle,
  HelpCircle
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

// Helper to safely obtain full 7-stage coherent flow
const getTeacherAlurSambung = (s: Supervision): SambungKesimpulanAlurSambung => {
  if (s.sambung?.gerakkan?.kesimpulanAlurSambung) {
    return s.sambung.gerakkan.kesimpulanAlurSambung;
  }
  return generateGerakkanData(s).kesimpulanAlurSambung;
};

// Helper to safely obtain RTL items
const getTeacherRtlNyatakan = (s: Supervision): SambungRtlNyatakanItem[] => {
  if (s.sambung?.gerakkan?.rtlNyatakan && s.sambung.gerakkan.rtlNyatakan.length > 0) {
    return s.sambung.gerakkan.rtlNyatakan;
  }
  return generateGerakkanData(s).rtlNyatakan;
};

// Helper to safely obtain Pengimbasan items
const getTeacherPengimbasan = (s: Supervision): SambungPengimbasanItem[] => {
  if (s.sambung?.gerakkan?.pengimbasan && s.sambung.gerakkan.pengimbasan.length > 0) {
    return s.sambung.gerakkan.pengimbasan;
  }
  return generateGerakkanData(s).pengimbasan;
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
  
  // Master navigation tabs for Kesimpulan Siklus SAMBUNG
  const [activeMainTab, setActiveMainTab] = useState<'alur_7_tahap' | 'matriks_before_after' | 'grafik_dampak' | 'rtl_gerakkan'>('alur_7_tahap');
  
  const [chartViewMode, setChartViewMode] = useState<'bars' | 'trajectory'>('bars');
  const [matrixViewMode, setMatrixViewMode] = useState<'nyatakan' | 'selidiki' | 'uji'>('nyatakan');

  // Detail Modal & Print States
  const [detailModalTeacher, setDetailModalTeacher] = useState<Supervision | null>(null);
  const [printSupervision, setPrintSupervision] = useState<Supervision | null>(null);

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
  const aggregatedImpact = useMemo(() => {
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

    const totalDelta = aggregatedImpact.reduce((acc, item) => acc + item.deltaNum, 0);
    const avgGain = aggregatedImpact.length > 0 ? Math.round((totalDelta / aggregatedImpact.length) * 10) / 10 : 38.5;

    const telaahScores = list
      .map(s => s.perangkatAjar?.telaahSummary?.finalScore)
      .filter((s): s is number => typeof s === 'number' && !isNaN(s));
    const avgTelaah = telaahScores.length > 0 
      ? Math.round((telaahScores.reduce((a, b) => a + b, 0) / telaahScores.length) * 10) / 10
      : 92.4;

    const observasiScores = list
      .map(s => s.observasiKelas?.score)
      .filter((s): s is number => typeof s === 'number' && !isNaN(s));
    const avgObservasi = observasiScores.length > 0
      ? Math.round((observasiScores.reduce((a, b) => a + b, 0) / observasiScores.length) * 10) / 10
      : 93.8;

    let sbCount = 0;
    let bCount = 0;
    let cCount = 0;

    list.forEach(s => {
      const tag = getPredicateTag(s) || '';
      if (tag.includes('SB')) sbCount++;
      else if (tag.includes('B')) bCount++;
      else if (tag.includes('C')) cCount++;
    });

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
              Kesimpulan Siklus SAMBUNG (S — A — M — B — U — N — G)
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200/90 mt-2 leading-relaxed">
              Instrumen komprehensif yang menghubungkan secara utuh &amp; berkesinambungan 7 tahap supervisi akademik: <strong>Selidiki (S)</strong>, <strong>Amati (A)</strong>, <strong>Maknai (M)</strong>, <strong>Berdayakan (B)</strong>, <strong>Uji (U)</strong>, <strong>Nyatakan (N)</strong>, hingga <strong>Gerakkan (G)</strong>.
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
              <span className="text-[11px] text-indigo-200 font-medium block">Kenaikan Praktik Inkuiri</span>
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
          <span>Instrumen Terhubung Selidiki &rarr; Amati &rarr; Maknai &rarr; Berdayakan &rarr; Uji &rarr; Nyatakan &rarr; Gerakkan</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MASTER NAVIGATION TABS UNTUK KESIMPULAN SIKLUS SAMBUNG                     */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveMainTab('alur_7_tahap')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeMainTab === 'alur_7_tahap'
                ? 'bg-gradient-to-r from-indigo-700 to-indigo-800 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-300" />
            <span>1. Matriks Alur 7 Tahap SAMBUNG (S — G)</span>
            <span className="text-[10px] bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded font-black uppercase">
              Instrumen Utama
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('matriks_before_after')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeMainTab === 'matriks_before_after'
                ? 'bg-indigo-700 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-indigo-300" />
            <span>2. Matriks Perubahan Before vs After (4 Indikator)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('grafik_dampak')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeMainTab === 'grafik_dampak'
                ? 'bg-indigo-700 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-300" />
            <span>3. Grafik &amp; Data Dampak Kuantitatif Murid</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('rtl_gerakkan')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeMainTab === 'rtl_gerakkan'
                ? 'bg-cyan-700 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Share2 className="w-4 h-4 text-cyan-300" />
            <span>4. Rencana Tindak Lanjut &amp; Diseminasi (Gerakkan)</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-semibold px-3 py-1">
          Menampilkan: <strong className="text-indigo-900">{filteredSupervisions.length} Guru</strong>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MATRIKS KETERHUBUNGAN 7 TAHAP SIKLUS SAMBUNG (S - A - M - B - U - N - G) */}
      {/* ========================================================================= */}
      {activeMainTab === 'alur_7_tahap' && (
        <div className="space-y-6">
          {/* Banner Penjelasan Alur 7 Tahap SAMBUNG */}
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-indigo-700/50 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-700/60 pb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Benang Merah Supervisi Akademik Berkelanjutan</span>
                </div>
                <h3 className="text-lg sm:text-2xl font-black text-white">
                  Matriks Kesimpulan Keterhubungan 7 Tahap Siklus SAMBUNG
                </h3>
                <p className="text-xs sm:text-sm text-indigo-100/90 mt-1 max-w-4xl leading-relaxed">
                  Supervisi akademik tidak berhenti sebagai lembar penilaian administratif. Seluruh temuan berkesinambungan mulai dari penyelidikan awal hingga komitmen aksi dan diseminasi di komunitas belajar.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-[11px] font-bold text-indigo-200 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                  Standar Pengawas Pembina: Kusnandar, M.Si
                </span>
              </div>
            </div>

            {/* 7 Pipeline Steps Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
              <div className="bg-white/10 rounded-xl p-2.5 border border-white/15 text-center">
                <span className="w-5 h-5 rounded-md bg-indigo-500 text-white font-black text-[11px] inline-flex items-center justify-center mb-1">S</span>
                <span className="text-[11px] font-black text-white block">SELIDIKI</span>
                <span className="text-[9px] text-indigo-200 block">Baseline Telaah Modul</span>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5 border border-white/15 text-center">
                <span className="w-5 h-5 rounded-md bg-blue-500 text-white font-black text-[11px] inline-flex items-center justify-center mb-1">A</span>
                <span className="text-[11px] font-black text-white block">AMATI</span>
                <span className="text-[9px] text-indigo-200 block">Observasi Kelas Awal</span>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5 border border-white/15 text-center">
                <span className="w-5 h-5 rounded-md bg-emerald-500 text-white font-black text-[11px] inline-flex items-center justify-center mb-1">M</span>
                <span className="text-[11px] font-black text-white block">MAKNAI</span>
                <span className="text-[9px] text-indigo-200 block">Coaching TIRTA (10 Q)</span>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5 border border-white/15 text-center">
                <span className="w-5 h-5 rounded-md bg-amber-500 text-white font-black text-[11px] inline-flex items-center justify-center mb-1">B</span>
                <span className="text-[11px] font-black text-white block">BERDAYAKAN</span>
                <span className="text-[9px] text-indigo-200 block">Modul Deep Learning</span>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5 border border-white/15 text-center">
                <span className="w-5 h-5 rounded-md bg-purple-500 text-white font-black text-[11px] inline-flex items-center justify-center mb-1">U</span>
                <span className="text-[11px] font-black text-white block">UJI</span>
                <span className="text-[9px] text-indigo-200 block">Uji Coba Lapangan (25)</span>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5 border border-white/15 text-center">
                <span className="w-5 h-5 rounded-md bg-rose-500 text-white font-black text-[11px] inline-flex items-center justify-center mb-1">N</span>
                <span className="text-[11px] font-black text-white block">NYATAKAN</span>
                <span className="text-[9px] text-indigo-200 block">Dampak Before vs After</span>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5 border border-white/15 text-center">
                <span className="w-5 h-5 rounded-md bg-cyan-500 text-white font-black text-[11px] inline-flex items-center justify-center mb-1">G</span>
                <span className="text-[11px] font-black text-white block">GERAKKAN</span>
                <span className="text-[9px] text-indigo-200 block">RTL &amp; Pengimbasan</span>
              </div>
            </div>
          </div>

          {/* Master Table 7 Tahap SAMBUNG */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <span>Tabel Rekapitulasi Alur Terpadu 7 Tahap Siklus SAMBUNG Per Guru Binaan</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Setiap kolom menyajikan keterhubungan proses dari instrumen telaah modul, coaching reflektif, verifikasi lapangan 25 butir, hingga aksi nyata di komunitas.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 font-semibold">
                  Total Terdaftar: <strong className="text-indigo-900">{filteredSupervisions.length} Guru</strong>
                </span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
              <table className="w-full text-xs border-collapse min-w-[1400px]">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-800 font-bold border-b border-slate-200 uppercase text-[10px]">
                    <th className="py-3 px-3 text-center w-10">No</th>
                    <th className="py-3 px-3 text-left w-52 font-bold">Identitas Guru &amp; Satuan Pendidikan</th>
                    <th className="py-3 px-3 text-left w-48 font-bold bg-indigo-50/50 text-indigo-900">
                      1. SELIDIKI (S) &bull; Baseline Awal
                    </th>
                    <th className="py-3 px-3 text-left w-48 font-bold bg-blue-50/50 text-blue-900">
                      2. AMATI (A) &bull; Observasi Kelas Awal
                    </th>
                    <th className="py-3 px-3 text-left w-48 font-bold bg-emerald-50/50 text-emerald-900">
                      3. MAKNAI (M) &bull; Coaching TIRTA (10 Q)
                    </th>
                    <th className="py-3 px-3 text-left w-48 font-bold bg-amber-50/50 text-amber-900">
                      4. BERDAYAKAN (B) &bull; Modul Deep Learning
                    </th>
                    <th className="py-3 px-3 text-left w-48 font-bold bg-purple-50/50 text-purple-900">
                      5. UJI (U) &bull; Uji Lapangan (25 Aspek)
                    </th>
                    <th className="py-3 px-3 text-left w-48 font-bold bg-rose-50/50 text-rose-900">
                      6. NYATAKAN (N) &bull; Dampak Before vs After
                    </th>
                    <th className="py-3 px-3 text-left w-48 font-bold bg-cyan-50/50 text-cyan-900">
                      7. GERAKKAN (G) &bull; RTL &amp; Pengimbasan
                    </th>
                    <th className="py-3 px-3 text-center w-36 font-bold">Aksi &amp; Dokumen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSupervisions.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        Tidak ditemukan data guru yang sesuai dengan kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredSupervisions.map((sup, idx) => {
                      const alur = getTeacherAlurSambung(sup);
                      const tag = getPredicateTag(sup);
                      const tScore = sup.perangkatAjar?.telaahSummary?.finalScore;
                      const oScore = sup.observasiKelas?.score;

                      return (
                        <tr key={sup.id || idx} className="hover:bg-slate-50/80 transition-colors align-top">
                          {/* No */}
                          <td className="py-3.5 px-3 text-center font-bold text-slate-400 bg-slate-50/30">
                            {idx + 1}
                          </td>

                          {/* Profil Guru */}
                          <td className="py-3.5 px-3 bg-slate-50/50 border-r border-slate-100 space-y-1.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-black text-slate-900 text-xs">
                                {sup.teacherName}
                              </span>
                              {tag && (
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black tracking-wide border shadow-2xs ${
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
                            <div className="flex flex-wrap gap-1 pt-0.5 text-[9px]">
                              {tScore && (
                                <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">
                                  Telaah: {tScore}
                                </span>
                              )}
                              {oScore && (
                                <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200 font-semibold">
                                  Obs: {oScore}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 1. SELIDIKI */}
                          <td className="py-3.5 px-3 bg-indigo-50/20">
                            <div className="text-[11px] text-slate-700 leading-relaxed font-normal p-2 rounded-xl bg-white border border-indigo-100/80 shadow-2xs">
                              {alur.selidikiBaseline}
                            </div>
                          </td>

                          {/* 2. AMATI */}
                          <td className="py-3.5 px-3 bg-blue-50/20">
                            <div className="text-[11px] text-slate-700 leading-relaxed font-normal p-2 rounded-xl bg-white border border-blue-100/80 shadow-2xs">
                              {alur.amatiObservasi}
                            </div>
                          </td>

                          {/* 3. MAKNAI */}
                          <td className="py-3.5 px-3 bg-emerald-50/20">
                            <div className="text-[11px] text-slate-700 leading-relaxed font-normal p-2 rounded-xl bg-white border border-emerald-100/80 shadow-2xs">
                              {alur.maknaiCoaching}
                            </div>
                          </td>

                          {/* 4. BERDAYAKAN */}
                          <td className="py-3.5 px-3 bg-amber-50/20">
                            <div className="text-[11px] text-slate-700 leading-relaxed font-normal p-2 rounded-xl bg-white border border-amber-100/80 shadow-2xs">
                              {alur.berdayakanModul}
                            </div>
                          </td>

                          {/* 5. UJI */}
                          <td className="py-3.5 px-3 bg-purple-50/20">
                            <div className="text-[11px] text-slate-700 leading-relaxed font-normal p-2 rounded-xl bg-white border border-purple-100/80 shadow-2xs">
                              {alur.ujiPembuktian}
                            </div>
                          </td>

                          {/* 6. NYATAKAN */}
                          <td className="py-3.5 px-3 bg-rose-50/20">
                            <div className="text-[11px] text-slate-700 leading-relaxed font-normal p-2 rounded-xl bg-white border border-rose-100/80 shadow-2xs">
                              {alur.nyatakanDampak}
                            </div>
                          </td>

                          {/* 7. GERAKKAN */}
                          <td className="py-3.5 px-3 bg-cyan-50/20">
                            <div className="text-[11px] text-slate-700 leading-relaxed font-normal p-2 rounded-xl bg-white border border-cyan-100/80 shadow-2xs">
                              {alur.gerakkanKomitmen}
                            </div>
                          </td>

                          {/* Aksi */}
                          <td className="py-3.5 px-3 text-center align-middle space-y-1.5">
                            <button
                              type="button"
                              onClick={() => setDetailModalTeacher(sup)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-2xs transition-colors cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Lihat Detail Alur</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setPrintSupervision(sup)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            >
                              <Printer className="w-3 h-3 text-indigo-600" />
                              <span>Cetak Laporan</span>
                            </button>

                            {onOpenSambungTeacher && (
                              <button
                                type="button"
                                onClick={() => onOpenSambungTeacher(sup.id)}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-indigo-700 font-bold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
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
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MATRIKS PERUBAHAN BEFORE - AFTER (4 INDIKATOR KUNCI)               */}
      {/* ========================================================================= */}
      {activeMainTab === 'matriks_before_after' && (
        <div className="space-y-6">
          {/* Seksi 4 Pilar Kunci Sintesis Kualitatif */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
                  <Layers className="w-4 h-4" />
                  <span>Sintesis Kualitatif Perubahan Praktik Pembelajaran</span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  4 Pilar Kunci Transformasi Pasca Siklus SAMBUNG
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pergeseran paradigma dan iklim belajar di kelas dari kondisi awal (Selidiki) menuju hasil uji coba lapangan (Uji &amp; Nyatakan).
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-800 text-xs font-bold border border-indigo-200">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Instrumen Resmi Supervisi</span>
              </div>
            </div>

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

          {/* Tabel Detail Per Guru: Matriks Before & After */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Matriks Perubahan Before &ndash; After Individual Semua Guru Binaan
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dihubungkan secara presisi dari kesimpulan Tahap Selidiki (Before) dan Tahap Uji / Nyatakan (After) masing-masing guru binaan.
                </p>
              </div>

              {/* Sub-view switcher */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setMatrixViewMode('nyatakan')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    matrixViewMode === 'nyatakan' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Before &rarr; After
                </button>
                <button
                  type="button"
                  onClick={() => setMatrixViewMode('selidiki')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    matrixViewMode === 'selidiki' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Selidiki (Baseline)
                </button>
                <button
                  type="button"
                  onClick={() => setMatrixViewMode('uji')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    matrixViewMode === 'uji' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Uji (Setelah Perbaikan)
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
              <table className="w-full text-xs border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-800 font-bold border-b border-slate-200 uppercase text-[11px]">
                    <th className="py-3.5 px-4 text-left w-56 font-bold">Identitas Guru &amp; Sekolah</th>
                    <th className="py-3.5 px-4 text-left w-64 font-bold">
                      {matrixViewMode === 'selidiki' ? '1. Peran Guru (Baseline)' : matrixViewMode === 'uji' ? '1. Peran Guru (Setelah Uji)' : '1. Peran Guru (Before &rarr; After)'}
                    </th>
                    <th className="py-3.5 px-4 text-left w-64 font-bold">
                      {matrixViewMode === 'selidiki' ? '2. Aktivitas Murid (Baseline)' : matrixViewMode === 'uji' ? '2. Aktivitas Murid (Setelah Uji)' : '2. Aktivitas Murid (Before &rarr; After)'}
                    </th>
                    <th className="py-3.5 px-4 text-left w-64 font-bold">
                      {matrixViewMode === 'selidiki' ? '3. Konteks Nyata (Baseline)' : matrixViewMode === 'uji' ? '3. Konteks Nyata (Setelah Uji)' : '3. Konteks Nyata (Before &rarr; After)'}
                    </th>
                    <th className="py-3.5 px-4 text-left w-64 font-bold">
                      {matrixViewMode === 'selidiki' ? '4. Refleksi Murid (Baseline)' : matrixViewMode === 'uji' ? '4. Refleksi Murid (Setelah Uji)' : '4. Refleksi Murid (Before &rarr; After)'}
                    </th>
                    <th className="py-3.5 px-3 text-center w-28 font-bold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSupervisions.map((sup, idx) => {
                    const aspects = getTeacherAspects(sup);
                    const tag = getPredicateTag(sup);

                    return (
                      <tr key={sup.id || idx} className="hover:bg-slate-50/70 transition-colors align-top">
                        <td className="py-4 px-4 bg-slate-50/50 border-r border-slate-100">
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-extrabold text-slate-900 text-sm">
                                {sup.teacherName}
                              </span>
                              {tag && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  {tag}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-bold text-indigo-700 block">
                              {sup.subject}
                            </span>
                            <span className="text-[10px] text-slate-600 block">
                              {sup.schoolName}
                            </span>
                          </div>
                        </td>

                        {/* Peran Guru */}
                        <td className="py-4 px-4">
                          {matrixViewMode === 'selidiki' ? (
                            <p className="text-slate-700 leading-relaxed text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200">{aspects.peranGuru.before}</p>
                          ) : matrixViewMode === 'uji' ? (
                            <p className="text-purple-950 font-medium leading-relaxed text-[11px] bg-purple-50 p-2.5 rounded-xl border border-purple-200">{aspects.peranGuru.after}</p>
                          ) : (
                            <div className="space-y-2">
                              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                                <span className="font-bold text-slate-500 block text-[9px] uppercase">Before:</span>
                                {aspects.peranGuru.before}
                              </div>
                              <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-[11px] text-indigo-950 font-medium">
                                <span className="font-bold text-indigo-700 block text-[9px] uppercase">After:</span>
                                {aspects.peranGuru.after}
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Aktivitas Murid */}
                        <td className="py-4 px-4">
                          {matrixViewMode === 'selidiki' ? (
                            <p className="text-slate-700 leading-relaxed text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200">{aspects.aktivitasMurid.before}</p>
                          ) : matrixViewMode === 'uji' ? (
                            <p className="text-purple-950 font-medium leading-relaxed text-[11px] bg-purple-50 p-2.5 rounded-xl border border-purple-200">{aspects.aktivitasMurid.after}</p>
                          ) : (
                            <div className="space-y-2">
                              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                                <span className="font-bold text-slate-500 block text-[9px] uppercase">Before:</span>
                                {aspects.aktivitasMurid.before}
                              </div>
                              <div className="p-2 rounded-xl bg-purple-50 border border-purple-200 text-[11px] text-purple-950 font-medium">
                                <span className="font-bold text-purple-700 block text-[9px] uppercase">After:</span>
                                {aspects.aktivitasMurid.after}
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Konteks Nyata */}
                        <td className="py-4 px-4">
                          {matrixViewMode === 'selidiki' ? (
                            <p className="text-slate-700 leading-relaxed text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200">{aspects.konteksNyata.before}</p>
                          ) : matrixViewMode === 'uji' ? (
                            <p className="text-amber-950 font-medium leading-relaxed text-[11px] bg-amber-50 p-2.5 rounded-xl border border-amber-200">{aspects.konteksNyata.after}</p>
                          ) : (
                            <div className="space-y-2">
                              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                                <span className="font-bold text-slate-500 block text-[9px] uppercase">Before:</span>
                                {aspects.konteksNyata.before}
                              </div>
                              <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-950 font-medium">
                                <span className="font-bold text-amber-700 block text-[9px] uppercase">After:</span>
                                {aspects.konteksNyata.after}
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Refleksi Murid */}
                        <td className="py-4 px-4">
                          {matrixViewMode === 'selidiki' ? (
                            <p className="text-slate-700 leading-relaxed text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200">{aspects.refleksiMurid.before}</p>
                          ) : matrixViewMode === 'uji' ? (
                            <p className="text-blue-950 font-medium leading-relaxed text-[11px] bg-blue-50 p-2.5 rounded-xl border border-blue-200">{aspects.refleksiMurid.after}</p>
                          ) : (
                            <div className="space-y-2">
                              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                                <span className="font-bold text-slate-500 block text-[9px] uppercase">Before:</span>
                                {aspects.refleksiMurid.before}
                              </div>
                              <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-950 font-medium">
                                <span className="font-bold text-blue-700 block text-[9px] uppercase">After:</span>
                                {aspects.refleksiMurid.after}
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Aksi Button */}
                        <td className="py-4 px-3 text-center align-middle">
                          <button
                            type="button"
                            onClick={() => setDetailModalTeacher(sup)}
                            className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-2xs transition-colors w-full cursor-pointer"
                          >
                            <span>Detail Alur</span>
                            <Eye className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: GRAFIK & DATA DAMPAK KUANTITATIF (AWAL VS SETELAH SAMBUNG)          */}
      {/* ========================================================================= */}
      {activeMainTab === 'grafik_dampak' && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
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
              <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setChartViewMode('bars')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    chartViewMode === 'bars' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Grafik Batang</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChartViewMode('trajectory')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    chartViewMode === 'trajectory' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Diagram Trayektori</span>
                </button>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instrumen Resmi SAMBUNG</span>
              </div>
            </div>
          </div>

          {/* Visual Bars Container */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-50/70 to-indigo-50/30 border border-slate-200 space-y-6">
            {chartViewMode === 'bars' ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {aggregatedImpact.map((item, idx) => {
                  const maxBarHeight = 160;
                  const heightAwal = Math.max(16, (item.awalNum / 100) * maxBarHeight);
                  const heightAkhir = Math.max(16, (item.akhirNum / 100) * maxBarHeight);

                  return (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-indigo-300 transition-all"
                    >
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
                        <h4 className="font-extrabold text-slate-800 text-xs leading-snug line-clamp-2 pt-1">
                          {item.indikator}
                        </h4>
                      </div>

                      <div className="h-44 flex items-end justify-center gap-4 border-b border-dashed border-slate-200 pb-2 relative">
                        <div className="flex flex-col items-center gap-1.5 z-10 w-11">
                          <span className="text-[11px] font-bold text-slate-600">{item.awal}</span>
                          <div
                            style={{ height: `${heightAwal}px` }}
                            className="w-full rounded-t-lg bg-slate-300 border border-slate-400/50 shadow-2xs"
                          />
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Awal</span>
                        </div>

                        <div className="flex flex-col items-center gap-1.5 z-10 w-11">
                          <span className="text-[11px] font-black text-emerald-700">{item.akhir}</span>
                          <div
                            style={{ height: `${heightAkhir}px` }}
                            className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600 via-teal-500 to-emerald-400 border border-emerald-500 shadow-md"
                          />
                          <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">Setelah</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 text-[11px] text-slate-600 leading-relaxed font-medium bg-slate-50/80 p-2 rounded-xl border border-slate-100">
                        {item.makna}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {aggregatedImpact.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
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

                    <div className="relative pt-2 pb-1">
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 relative">
                        <div style={{ width: `${item.awalNum}%` }} className="h-full bg-slate-300 absolute left-0 top-0" />
                        <div style={{ width: `${item.akhirNum}%` }} className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 absolute left-0 top-0 opacity-90" />
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <strong>Makna:</strong> {item.makna}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tabel Data Resmi */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-800 font-bold border-b border-slate-200 uppercase text-[11px]">
                  <th className="py-3.5 px-4 text-center w-12">No</th>
                  <th className="py-3.5 px-4 text-left font-bold">Indikator</th>
                  <th className="py-3.5 px-4 text-center w-32 font-bold">Awal</th>
                  <th className="py-3.5 px-4 text-center w-44 font-bold">Setelah SAMBUNG</th>
                  <th className="py-3.5 px-4 text-left font-bold">Makna &amp; Uraian Pengawas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {aggregatedImpact.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-4 px-4 font-extrabold text-slate-900 align-middle text-sm">{item.indikator}</td>
                    <td className="py-4 px-4 text-center align-middle font-extrabold text-slate-700 bg-slate-50/50">{item.awal}</td>
                    <td className="py-4 px-4 text-center align-middle">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs border border-emerald-300">
                        <span>{item.akhir}</span>
                        <span className="text-[10px] bg-white px-1.5 py-0.5 rounded font-black text-emerald-700">+{item.deltaNum}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 align-middle text-slate-700 leading-relaxed">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                        <p className="font-extrabold text-slate-900">{item.makna}</p>
                        {item.deskripsiPenilaian && (
                          <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                            <strong>Evaluasi Pengawas:</strong> {item.deskripsiPenilaian}
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: RENCANA TINDAK LANJUT & DISEMINASI (TAHAP GERAKKAN)                */}
      {/* ========================================================================= */}
      {activeMainTab === 'rtl_gerakkan' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-teal-900 via-cyan-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-teal-700/50 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 text-xs font-black uppercase tracking-wider">
              <Share2 className="w-3.5 h-3.5" />
              <span>Tahap 7 &bull; GERAKKAN (Hasil Nyatakan &rarr; Aksi Nyata &amp; Pengimbasan)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Rekapitulasi Rencana Tindak Lanjut &amp; Diseminasi Praktik Baik
            </h3>
            <p className="text-xs sm:text-sm text-cyan-100/90 leading-relaxed max-w-4xl">
              Memastikan hasil supervisi melembaga menjadi budaya kerja guru dan disebarluaskan ke Komunitas Belajar (Kombel) sekolah, MGMP Kabupaten Bogor, serta Platform Merdeka Mengajar (PMM).
            </p>
          </div>

          {/* Tabel RTL 5 Indikator Transformasi */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-teal-600" />
              <span>Rencana Tindak Lanjut Berdasarkan Hasil Nyatakan &amp; Kesimpulan (Per Guru Binaan)</span>
            </h4>

            <div className="space-y-6">
              {filteredSupervisions.map((sup, sIdx) => {
                const rtlList = getTeacherRtlNyatakan(sup);
                const pengimbasanList = getTeacherPengimbasan(sup);

                return (
                  <div key={sup.id || sIdx} className="border border-slate-200 rounded-2xl p-5 bg-slate-50/40 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div>
                        <span className="font-black text-slate-900 text-sm">{sup.teacherName}</span>
                        <span className="text-xs text-indigo-700 font-bold ml-2">({sup.subject})</span>
                        <span className="text-xs text-slate-500 ml-2">&bull; {sup.schoolName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setDetailModalTeacher(sup)}
                          className="px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200"
                        >
                          Lihat Alur SAMBUNG
                        </button>
                        <button
                          type="button"
                          onClick={() => setPrintSupervision(sup)}
                          className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3 text-slate-600" />
                          <span>Cetak RTL</span>
                        </button>
                      </div>
                    </div>

                    {/* Table RTL */}
                    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                            <th className="py-2.5 px-3 text-center w-8">No</th>
                            <th className="py-2.5 px-3 text-left w-52">Fokus Indikator</th>
                            <th className="py-2.5 px-3 text-left">Aksi Tindak Lanjut Konkret Guru</th>
                            <th className="py-2.5 px-3 text-left w-44">Mitra &amp; Sasaran</th>
                            <th className="py-2.5 px-3 text-left w-36">Waktu &amp; Bukti</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {rtlList.slice(0, 4).map((r, rIdx) => (
                            <tr key={r.id || rIdx} className="align-top hover:bg-slate-50/50">
                              <td className="py-3 px-3 text-center font-bold text-slate-400">{rIdx + 1}</td>
                              <td className="py-3 px-3 font-bold text-slate-900 bg-slate-50/50">{r.indikator}</td>
                              <td className="py-3 px-3 text-slate-700 whitespace-pre-line leading-relaxed">{r.rencanaTindakLanjut}</td>
                              <td className="py-3 px-3 text-slate-600">{r.mitraKolaborasi}</td>
                              <td className="py-3 px-3 text-slate-600">
                                <span className="font-semibold block">{r.waktuPelaksanaan}</span>
                                <span className="text-[10px] text-slate-400 italic block">{r.buktiKeberhasilan}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mini Pengimbasan Row */}
                    <div className="p-3 bg-teal-50/50 border border-teal-200 rounded-xl space-y-1.5">
                      <span className="text-[11px] font-black text-teal-900 uppercase flex items-center gap-1.5">
                        <Share2 className="w-3.5 h-3.5 text-teal-700" />
                        <span>Agenda Diseminasi &amp; Pengimbasan Praktik Baik:</span>
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {pengimbasanList.slice(0, 2).map((p, pIdx) => (
                          <div key={p.id || pIdx} className="bg-white p-2.5 rounded-lg border border-teal-200/80">
                            <span className="font-bold text-slate-900 block">{p.praktikBaik}</span>
                            <span className="text-[11px] text-teal-700 block mt-0.5">
                              Sasaran: {p.sasaran} &bull; Bentuk: {p.bentuk}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DETAIL ALUR TERPADU SIKLUS SAMBUNG (S - A - M - B - U - N - G)     */}
      {/* ========================================================================= */}
      {detailModalTeacher && (() => {
        const sup = detailModalTeacher;
        const alur = getTeacherAlurSambung(sup);
        const rtlList = getTeacherRtlNyatakan(sup);
        const pengimbasanList = getTeacherPengimbasan(sup);
        const aspects = getTeacherAspects(sup);
        const tag = getPredicateTag(sup);

        return (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex justify-center p-2 sm:p-4">
            <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col my-auto max-h-[92vh] overflow-hidden border border-slate-200">
              {/* Modal Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                    7S
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-white">
                        Kesimpulan Alur Lengkap Siklus SAMBUNG
                      </h3>
                      {tag && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-400/30">
                          {tag}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-indigo-200">
                      {sup.teacherName} &bull; {sup.subject} &bull; {sup.schoolName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPrintSupervision(sup);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Lembar Resmi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailModalTeacher(null)}
                    className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Scrollable Body */}
              <div className="p-6 sm:p-8 space-y-6 overflow-y-auto text-xs text-slate-800">
                {/* 7-Step Interactive Pipeline View */}
                <div className="space-y-3">
                  <h4 className="font-black text-sm text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Keterhubungan Berkelanjutan 7 Tahap Siklus SAMBUNG</span>
                  </h4>

                  <div className="space-y-3">
                    {/* S */}
                    <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/30 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center">S</span>
                        <span className="font-black text-indigo-950 uppercase text-xs">Tahap 1 &bull; SELIDIKI (Baseline Telaah Modul &amp; Wawancara Awal)</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed pl-8 text-xs">{alur.selidikiBaseline}</p>
                    </div>

                    {/* A */}
                    <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/30 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">A</span>
                        <span className="font-black text-blue-950 uppercase text-xs">Tahap 2 &bull; AMATI (Observasi Tatap Muka Kelas Awal &amp; Fokus Prioritas)</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed pl-8 text-xs">{alur.amatiObservasi}</p>
                    </div>

                    {/* M */}
                    <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center">M</span>
                        <span className="font-black text-emerald-950 uppercase text-xs">Tahap 3 &bull; MAKNAI (Coaching Reflektif Pasca-Observasi &amp; 10 Pertanyaan Resmi)</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed pl-8 text-xs">{alur.maknaiCoaching}</p>
                    </div>

                    {/* B */}
                    <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/30 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-amber-600 text-white font-black text-xs flex items-center justify-center">B</span>
                        <span className="font-black text-amber-950 uppercase text-xs">Tahap 4 &bull; BERDAYAKAN (Desain Modul Ajar Perbaikan Deep Learning &amp; Scaffolding)</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed pl-8 text-xs">{alur.berdayakanModul}</p>
                    </div>

                    {/* U */}
                    <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/30 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-black text-xs flex items-center justify-center">U</span>
                        <span className="font-black text-purple-950 uppercase text-xs">Tahap 5 &bull; UJI (Uji Coba Lapangan 25 Aspek, Pra/Pasca Wawancara &amp; Suara Murid)</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed pl-8 text-xs">{alur.ujiPembuktian}</p>
                    </div>

                    {/* N */}
                    <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/30 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-rose-600 text-white font-black text-xs flex items-center justify-center">N</span>
                        <span className="font-black text-rose-950 uppercase text-xs">Tahap 6 &bull; NYATAKAN (Pembuktian Data Dampak Before vs After Kuantitatif &amp; Kualitatif)</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed pl-8 text-xs">{alur.nyatakanDampak}</p>
                    </div>

                    {/* G */}
                    <div className="p-4 rounded-2xl border-2 border-cyan-400 bg-cyan-50/40 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-cyan-700 text-white font-black text-xs flex items-center justify-center">G</span>
                        <span className="font-black text-cyan-950 uppercase text-xs">Tahap 7 &bull; GERAKKAN (5 Rencana Tindak Lanjut Konkret &amp; Diseminasi Praktik Baik)</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed pl-8 text-xs">{alur.gerakkanKomitmen}</p>
                    </div>
                  </div>
                </div>

                {/* 4 Pilar Before vs After Table */}
                <div className="space-y-3 pt-2">
                  <h4 className="font-black text-sm text-slate-900 uppercase tracking-wide">
                    Matriks Perubahan Before vs After (4 Indikator Mutu Pembelajaran)
                  </h4>
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px]">
                          <th className="py-2.5 px-3 text-left w-48">Indikator Mutu</th>
                          <th className="py-2.5 px-3 text-left">Selidiki (Before / Kondisi Awal)</th>
                          <th className="py-2.5 px-3 text-left bg-emerald-50 text-emerald-950">Uji &amp; Nyatakan (After / Setelah Pembuktian)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="py-2.5 px-3 font-bold text-slate-900 bg-slate-50">1. Peran Guru</td>
                          <td className="py-2.5 px-3 text-slate-600">{aspects.peranGuru.before}</td>
                          <td className="py-2.5 px-3 font-semibold text-emerald-900 bg-emerald-50/30">{aspects.peranGuru.after}</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-bold text-slate-900 bg-slate-50">2. Aktivitas Murid</td>
                          <td className="py-2.5 px-3 text-slate-600">{aspects.aktivitasMurid.before}</td>
                          <td className="py-2.5 px-3 font-semibold text-emerald-900 bg-emerald-50/30">{aspects.aktivitasMurid.after}</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-bold text-slate-900 bg-slate-50">3. Konteks Nyata</td>
                          <td className="py-2.5 px-3 text-slate-600">{aspects.konteksNyata.before}</td>
                          <td className="py-2.5 px-3 font-semibold text-emerald-900 bg-emerald-50/30">{aspects.konteksNyata.after}</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-bold text-slate-900 bg-slate-50">4. Refleksi Murid</td>
                          <td className="py-2.5 px-3 text-slate-600">{aspects.refleksiMurid.before}</td>
                          <td className="py-2.5 px-3 font-semibold text-emerald-900 bg-emerald-50/30">{aspects.refleksiMurid.after}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Catatan Naratif Pengawas & Dukungan KS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                    <span className="font-bold text-indigo-900 block text-xs">Catatan Resmi Pengawas Pembina Kusnandar, M.Si:</span>
                    <p className="text-slate-700 italic leading-relaxed text-[11px]">{alur.catatanPengawas}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900 block text-xs">Dukungan Manajemen &amp; Kepala Sekolah:</span>
                    <p className="text-slate-700 leading-relaxed text-[11px]">{alur.dukunganKepalaSekolah || 'Sekolah mendukung penuh sarana praktikum dan memfasilitasi sesi berbagi di Komunitas Belajar (Kombel) sekolah.'}</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Dokumen Portofolio Kesimpulan Siklus SAMBUNG resmi Pengawas Pembina Kusnandar, M.Si
                </span>
                <button
                  type="button"
                  onClick={() => setDetailModalTeacher(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* CETAK LAPORAN MODAL INTEGRATION                                           */}
      {/* ========================================================================= */}
      {printSupervision && (
        <SambungPrintModal
          isOpen={!!printSupervision}
          onClose={() => setPrintSupervision(null)}
          supervision={printSupervision}
        />
      )}
    </div>
  );
};
