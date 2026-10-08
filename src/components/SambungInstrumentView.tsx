import React, { useState, useEffect, useMemo } from 'react';
import { Supervision, UserProfile, School, SambungData } from '../types';
import { 
  createDefaultSambungForTeacher, 
  DEFAULT_DATA_DAMPAK,
  DEFAULT_MATRIKS_BEFORE,
  DEFAULT_MATRIKS_AFTER
} from '../data/sambungSeed';
import { saveSupervision } from '../services/firebase';
import { SambungPrintModal } from './SambungPrintModal';
import { KesimpulanSemuaGuruDashboard } from './KesimpulanSemuaGuruDashboard';
import { PerangkatAjarModal } from './forms/PerangkatAjarModal';
import { PraObservasiModal } from './forms/PraObservasiModal';
import { ObservasiKelasModal } from './forms/ObservasiKelasModal';
import { PascaObservasiModal } from './forms/PascaObservasiModal';
import { 
  CheckCircle2, 
  Search, 
  Printer, 
  Save, 
  Plus, 
  Trash2, 
  Sparkles, 
  User, 
  Users,
  School as SchoolIcon, 
  BookOpen, 
  Calendar,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  FileCheck2,
  Smile,
  Compass,
  Layers,
  ChevronRight,
  FolderGit2,
  FileSpreadsheet,
  FileText,
  ExternalLink,
  Clock,
  Award,
  ShieldCheck,
  UploadCloud,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  MessageSquare,
  Target
} from 'lucide-react';

interface SambungInstrumentViewProps {
  supervisions: Supervision[];
  currentUser: UserProfile;
  schools: School[];
  onUpdateSupervision: (updated: Supervision) => void;
  initialSupervisionId?: string;
}

type TabType = 'S' | 'A' | 'M' | 'B' | 'U' | 'N' | 'G';

export const SambungInstrumentView: React.FC<SambungInstrumentViewProps> = ({
  supervisions,
  currentUser,
  schools,
  onUpdateSupervision,
  initialSupervisionId,
}) => {
  // Filter supervisions according to role
  const availableSupervisions = useMemo(() => {
    if (currentUser.role === 'guru') {
      return supervisions.filter(
        (s) => s.teacherId === currentUser.uid || s.teacherName.toLowerCase() === currentUser.displayName.toLowerCase()
      );
    } else if (currentUser.role === 'kepsek') {
      return supervisions.filter(
        (s) => s.schoolId === currentUser.schoolId || s.schoolName === currentUser.schoolName
      );
    }
    return supervisions;
  }, [supervisions, currentUser]);

  // Selected supervision
  const [selectedId, setSelectedId] = useState<string>(() => {
    if (initialSupervisionId && availableSupervisions.some((s) => s.id === initialSupervisionId)) {
      return initialSupervisionId;
    }
    return availableSupervisions[0]?.id || '';
  });

  // Current active SAMBUNG letter tab
  const [activeTab, setActiveTab] = useState<TabType>('S');
  const [sSubTab, setSSubTab] = useState<'supervisi_awal' | 'pemetaan' | 'kesimpulan_before'>('supervisi_awal');
  const [uSubTab, setUSubTab] = useState<'supervisi_perbaikan' | 'u1' | 'u2' | 'kesimpulan_after'>('supervisi_perbaikan');
  const [activeSupervisiModal, setActiveSupervisiModal] = useState<{
    stage: 'perangkat' | 'pra' | 'observasi' | 'pasca';
    mode: 'awal' | 'perbaikan';
  } | null>(null);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [showAllTeachersModal, setShowAllTeachersModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Active supervision object
  const currentSupervision = useMemo(() => {
    const found = availableSupervisions.find((s) => s.id === selectedId);
    if (!found) return availableSupervisions[0] || null;
    return found;
  }, [availableSupervisions, selectedId]);

  // Local draft of SambungData for immediate responsiveness
  const [sambungDraft, setSambungDraft] = useState<SambungData | null>(null);

  useEffect(() => {
    if (initialSupervisionId && availableSupervisions.some((s) => s.id === initialSupervisionId)) {
      setSelectedId(initialSupervisionId);
    }
  }, [initialSupervisionId, availableSupervisions]);

  useEffect(() => {
    if (currentSupervision) {
      if (currentSupervision.sambung) {
        const cloned: SambungData = JSON.parse(JSON.stringify(currentSupervision.sambung));
        // Filter out removed beforeAfter aspects
        if (cloned.nyatakan?.beforeAfter) {
          cloned.nyatakan.beforeAfter = cloned.nyatakan.beforeAfter.filter(
            item => item.aspek !== 'Asesmen dan umpan balik' && item.aspek !== 'Tindak lanjut supervisi'
          );
        }

        // Ensure selidiki.matriksBefore is initialized
        if (!cloned.selidiki.matriksBefore) {
          const peran = cloned.nyatakan?.beforeAfter?.find(x => x.aspek.toLowerCase().includes('peran'))?.sebelumSambung;
          const aktivitas = cloned.nyatakan?.beforeAfter?.find(x => x.aspek.toLowerCase().includes('aktivitas'))?.sebelumSambung;
          const konteks = cloned.nyatakan?.beforeAfter?.find(x => x.aspek.toLowerCase().includes('konteks'))?.sebelumSambung;
          const refleksi = cloned.nyatakan?.beforeAfter?.find(x => x.aspek.toLowerCase().includes('refleksi'))?.sebelumSambung;
          cloned.selidiki.matriksBefore = {
            peranGuru: peran || DEFAULT_MATRIKS_BEFORE.peranGuru,
            aktivitasMurid: aktivitas || DEFAULT_MATRIKS_BEFORE.aktivitasMurid,
            konteksNyata: konteks || DEFAULT_MATRIKS_BEFORE.konteksNyata,
            refleksiMurid: refleksi || DEFAULT_MATRIKS_BEFORE.refleksiMurid,
          };
        }

        // Ensure uji.matriksAfter is initialized
        if (!cloned.uji.matriksAfter) {
          const peran = cloned.nyatakan?.beforeAfter?.find(x => x.aspek.toLowerCase().includes('peran'))?.setelahSambung;
          const aktivitas = cloned.nyatakan?.beforeAfter?.find(x => x.aspek.toLowerCase().includes('aktivitas'))?.setelahSambung;
          const konteks = cloned.nyatakan?.beforeAfter?.find(x => x.aspek.toLowerCase().includes('konteks'))?.setelahSambung;
          const refleksi = cloned.nyatakan?.beforeAfter?.find(x => x.aspek.toLowerCase().includes('refleksi'))?.setelahSambung;
          cloned.uji.matriksAfter = {
            peranGuru: peran || DEFAULT_MATRIKS_AFTER.peranGuru,
            aktivitasMurid: aktivitas || DEFAULT_MATRIKS_AFTER.aktivitasMurid,
            konteksNyata: konteks || DEFAULT_MATRIKS_AFTER.konteksNyata,
            refleksiMurid: refleksi || DEFAULT_MATRIKS_AFTER.refleksiMurid,
          };
        }

        // Always synchronize Nyatakan Before-After from Selidiki & Uji conclusions
        const beforeSync = cloned.selidiki.matriksBefore;
        const afterSync = cloned.uji.matriksAfter;
        cloned.nyatakan = {
          ...cloned.nyatakan,
          beforeAfter: [
            { aspek: 'Peran guru', sebelumSambung: beforeSync.peranGuru, setelahSambung: afterSync.peranGuru },
            { aspek: 'Aktivitas murid', sebelumSambung: beforeSync.aktivitasMurid, setelahSambung: afterSync.aktivitasMurid },
            { aspek: 'Konteks kehidupan nyata', sebelumSambung: beforeSync.konteksNyata, setelahSambung: afterSync.konteksNyata },
            { aspek: 'Refleksi murid', sebelumSambung: beforeSync.refleksiMurid, setelahSambung: afterSync.refleksiMurid },
          ],
        };

        // Ensure dataDampak has the 4 standard indicators if not yet set or outdated
        if (
          !cloned.nyatakan ||
          !cloned.nyatakan.dataDampak ||
          cloned.nyatakan.dataDampak.length === 0 ||
          !cloned.nyatakan.dataDampak.some(d => d.indikator.includes('Guru berorientasi'))
        ) {
          cloned.nyatakan = {
            ...cloned.nyatakan,
            dataDampak: DEFAULT_DATA_DAMPAK.map(d => ({ ...d })),
          };
        }
        setSambungDraft(cloned);
      } else {
        const defaultSambung = createDefaultSambungForTeacher(
          currentSupervision.teacherName,
          currentSupervision.schoolName,
          currentSupervision.subject
        );
        setSambungDraft(defaultSambung);
      }
    }
  }, [currentSupervision?.id]);

  if (!currentSupervision || !sambungDraft) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <Compass className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900">Belum Ada Data Supervisi Guru</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          {currentUser.role === 'guru'
            ? 'Anda belum memiliki instrumen supervisi aktif. Hubungi pengawas pembina Kusnandar, M.Si atau kepala sekolah untuk memulai.'
            : 'Belum ada guru yang terdaftar dalam daftar supervisi. Mulai supervisi baru untuk mengaktifkan siklus SAMBUNG.'}
        </p>
      </div>
    );
  }

  // Save handler
  const handleSave = async () => {
    if (!currentSupervision || !sambungDraft) return;
    setIsSaving(true);

    try {
      const updatedSupervision: Supervision = {
        ...currentSupervision,
        sambung: {
          ...sambungDraft,
          lastUpdated: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      };

      await saveSupervision(updatedSupervision);
      onUpdateSupervision(updatedSupervision);
      setSaveToast(`Instrumen SAMBUNG untuk ${currentSupervision.teacherName} berhasil disimpan!`);
      setTimeout(() => setSaveToast(null), 3500);
    } catch (err) {
      console.error(err);
      setSaveToast('Gagal menyimpan data.');
      setTimeout(() => setSaveToast(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Tab definitions
  const TABS_CONFIG: { key: TabType; letter: string; name: string; title: string; subtitle: string; color: string }[] = [
    {
      key: 'S',
      letter: 'S',
      name: 'SELIDIKI',
      title: 'S — Lembar Pemetaan Pembelajaran',
      subtitle: 'SELIDIKI — diisi dari telaah perangkat, observasi awal, dan dialog',
      color: 'bg-indigo-600',
    },
    {
      key: 'A',
      letter: 'A',
      name: 'ARAHKAN',
      title: 'A — Rencana Aksi Pembinaan Pembelajaran',
      subtitle: 'ARAHKAN — disepakati bersama kepala sekolah dan guru',
      color: 'bg-blue-600',
    },
    {
      key: 'M',
      letter: 'M',
      name: 'MAKNAI',
      title: 'M — Lembar Coaching (Dialog Reflektif)',
      subtitle: 'MAKNAI — pembinaan dimulai dari dialog, bukan instruksi',
      color: 'bg-emerald-600',
    },
    {
      key: 'B',
      letter: 'B',
      name: 'BERDAYAKAN',
      title: 'B — Lembar Rancang – Coba – Refleksi – Perbaiki',
      subtitle: 'BERDAYAKAN — diisi guru; mencakup memahami, mengaplikasikan, merefleksikan, menghubungkan',
      color: 'bg-amber-600',
    },
    {
      key: 'U',
      letter: 'U',
      name: 'UJI',
      title: 'U — UJI: Observasi Kelas & Suara Murid',
      subtitle: 'U-1 Observasi Kelas SAMBUNG & U-2 Angket Refleksi Murid',
      color: 'bg-purple-600',
    },
    {
      key: 'N',
      letter: 'N',
      name: 'NYATAKAN',
      title: 'N — Before–After dan Data Dampak',
      subtitle: 'NYATAKAN — setiap perubahan harus disertai bukti nyata',
      color: 'bg-rose-600',
    },
    {
      key: 'G',
      letter: 'G',
      name: 'GERAKKAN',
      title: 'G — Tindak Lanjut dan Pengimbasan',
      subtitle: 'GERAKKAN — hasil supervisi tidak berhenti sebagai catatan',
      color: 'bg-cyan-600',
    },
  ];

  // Recalculate U-1 Observasi Total
  const handleU1ScoreChange = (indikatorId: number, newScore: 1 | 2 | 3 | 4) => {
    if (!sambungDraft) return;
    const updatedList = sambungDraft.uji.u1_observasi.indikatorList.map((ind) =>
      ind.id === indikatorId ? { ...ind, score: newScore } : ind
    );
    const newTotal = updatedList.reduce((sum, item) => sum + item.score, 0);
    const newPct = (newTotal / 40) * 100;

    setSambungDraft({
      ...sambungDraft,
      uji: {
        ...sambungDraft.uji,
        u1_observasi: {
          ...sambungDraft.uji.u1_observasi,
          indikatorList: updatedList,
          totalSkor: newTotal,
          persentaseCapaian: newPct,
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 animate-bounce text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-indigo-700/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <span className="text-9xl font-black tracking-tighter">SAMBUNG</span>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Sistem Informasi Pengawasan, Pendampingan, dan Evaluasi Guru SMA</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Instrumen Siklus Strategi SAMBUNG
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-3xl leading-relaxed">
              Supervisi berkesinambungan oleh <strong>Kusnandar, M.Si</strong> berbasis 7 tahapan:{' '}
              <span className="font-semibold text-white">S</span>elidiki &bull;{' '}
              <span className="font-semibold text-white">A</span>rahkan &bull;{' '}
              <span className="font-semibold text-white">M</span>aknai &bull;{' '}
              <span className="font-semibold text-white">B</span>erdayakan &bull;{' '}
              <span className="font-semibold text-white">U</span>ji &bull;{' '}
              <span className="font-semibold text-white">N</span>yatakan &bull;{' '}
              <span className="font-semibold text-white">G</span>erakkan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
            <button
              type="button"
              onClick={() => setShowAllTeachersModal(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-500/30 hover:bg-indigo-500/50 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors border border-indigo-400/40 shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Dashboard Kesimpulan Semua Guru</span>
            </button>
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors border border-white/20"
            >
              <Printer className="w-4 h-4 text-indigo-200" />
              <span>Cetak Portofolio Guru Ini</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold shadow-md shadow-amber-400/20 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* TEACHER SELECTOR & IDENTITY CARD */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
        {/* If supervisor or kepsek, show teacher switcher */}
        {currentUser.role !== 'guru' && (
          <div className="mb-5 pb-5 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Pilih Guru Yang Dinilai / Disupervisi:
                </h3>
                <p className="text-[11px] text-slate-500">
                  Hasil instrumen dan penilaian otomatis keluar sesuai dengan nama guru yang dipilih.
                </p>
              </div>

              {/* Search filter for teacher */}
              {availableSupervisions.length > 3 && (
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari nama guru / mapel..."
                    value={teacherSearch}
                    onChange={(e) => setTeacherSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600"
                  />
                </div>
              )}
            </div>

            {/* Quick chips of teachers */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {availableSupervisions
                .filter(
                  (s) =>
                    !teacherSearch ||
                    s.teacherName.toLowerCase().includes(teacherSearch.toLowerCase()) ||
                    s.subject.toLowerCase().includes(teacherSearch.toLowerCase()) ||
                    s.schoolName.toLowerCase().includes(teacherSearch.toLowerCase())
                )
                .map((sup) => {
                  const isSelected = sup.id === selectedId;
                  return (
                    <button
                      key={sup.id}
                      onClick={() => setSelectedId(sup.id)}
                      className={`px-3 py-2 rounded-xl text-left transition-all shrink-0 border flex items-center gap-3 ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        {sup.teacherName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold leading-tight">{sup.teacherName}</p>
                        <p className={`text-[10px] leading-tight ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                          {sup.subject} &bull; {sup.schoolName}
                        </p>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        )}

        {/* Selected Teacher Profile Banner */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-extrabold text-lg shadow-xs">
              {currentSupervision.teacherName.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {currentSupervision.teacherName}
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  {currentSupervision.subject}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {currentSupervision.classGrade}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <SchoolIcon className="w-3.5 h-3.5 text-slate-400" />
                  {currentSupervision.schoolName}
                </span>
                <span>NIP: {currentSupervision.teacherNip || '-'}</span>
                <span>Pengawas Pembina: <strong className="text-slate-700">Kusnandar, M.Si</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Metrics of this teacher's SAMBUNG */}
          <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto">
            <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center shrink-0">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Skor U-1 Observasi</span>
              <span className="text-base font-extrabold text-indigo-600">
                {sambungDraft.uji.u1_observasi.totalSkor} / 40
              </span>
              <span className="text-[10px] text-slate-500 block font-medium">
                ({sambungDraft.uji.u1_observasi.persentaseCapaian.toFixed(1)}%)
              </span>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center shrink-0">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Suara Murid (U-2)</span>
              <span className="text-base font-extrabold text-emerald-600">
                {sambungDraft.uji.u2_angketMurid.items.length > 0
                  ? (
                      sambungDraft.uji.u2_angketMurid.items.reduce((s, i) => s + i.persentaseSetuju, 0) /
                      sambungDraft.uji.u2_angketMurid.items.length
                    ).toFixed(1)
                  : '0'}%
              </span>
              <span className="text-[10px] text-slate-500 block font-medium">
                {sambungDraft.uji.u2_angketMurid.jumlahResponden} Murid
              </span>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center shrink-0">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Siklus Berdayakan</span>
              <span className="text-base font-extrabold text-amber-600">
                {sambungDraft.berdayakan.siklusList.length} Siklus
              </span>
              <span className="text-[10px] text-slate-500 block font-medium">Rancang-Refleksi</span>
            </div>
          </div>
        </div>
      </div>

      {/* S - A - M - B - U - N - G TAB NAVIGATION BAR */}
      <div className="bg-white rounded-2xl p-2 shadow-xs border border-slate-200">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {TABS_CONFIG.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl transition-all relative ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm mb-1 ${
                    isActive ? 'bg-white text-indigo-900' : 'bg-slate-200 text-slate-800'
                  }`}
                >
                  {tab.letter}
                </div>
                <span className="text-xs font-bold tracking-tight leading-none">{tab.name}</span>
                <span
                  className={`text-[9px] mt-0.5 leading-none ${
                    isActive ? 'text-indigo-100' : 'text-slate-400'
                  }`}
                >
                  {tab.key === 'S' && 'Pemetaan'}
                  {tab.key === 'A' && 'Aksi Pembinaan'}
                  {tab.key === 'M' && 'Coaching'}
                  {tab.key === 'B' && 'Rancang-Coba'}
                  {tab.key === 'U' && 'Observasi & Murid'}
                  {tab.key === 'N' && 'Before-After'}
                  {tab.key === 'G' && 'Tindak Lanjut'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT SECTIONS */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        
        {/* ==================================================== */}
        {/* TAB S: SELIDIKI — SUPERVISI AWAL & LEMBAR PEMETAAN */}
        {/* ==================================================== */}
        {activeTab === 'S' && (
          <div className="space-y-6">
            {/* Header & Subtab Switcher */}
            <div className="border-b border-slate-200 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-xs font-bold mb-1">
                    TAHAP S &bull; SELIDIKI (KONDISI AWAL / BASELINE)
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Penyelidikan Kondisi Awal Pembelajaran &amp; Supervisi Akademik Guru
                  </h3>
                  <p className="text-xs text-slate-500">
                    Menghimpun seluruh data awal: berkas perencanaan guru, telaah modul ajar (22 aspek), wawancara pra-observasi, observasi kelas tatap muka, refleksi pasca-observasi, serta pemetaan fokus SAMBUNG untuk {currentSupervision.teacherName}.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs shrink-0">
                  <span className="text-slate-500 font-medium">Tanggal Pemetaan:</span>
                  <input
                    type="date"
                    value={sambungDraft.selidiki.tanggal}
                    onChange={(e) =>
                      setSambungDraft({
                        ...sambungDraft,
                        selidiki: { ...sambungDraft.selidiki, tanggal: e.target.value },
                      })
                    }
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium focus:outline-indigo-600 bg-white"
                  />
                </div>
              </div>

              {/* Subtab Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSSubTab('supervisi_awal')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    sSubTab === 'supervisi_awal'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <FolderGit2 className="w-4 h-4" />
                  <span>1. Instrumen Supervisi Akademik (Data Awal Guru)</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    sSubTab === 'supervisi_awal' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    4 Tahap Awal
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSSubTab('pemetaan')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    sSubTab === 'pemetaan'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>2. Lembar Pemetaan Aspek Pembelajaran SAMBUNG (6 Aspek)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSSubTab('kesimpulan_before')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    sSubTab === 'kesimpulan_before'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>3. Kesimpulan Data Awal: Matriks Perubahan BEFORE</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    sSubTab === 'kesimpulan_before' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    4 Aspek Kunci
                  </span>
                </button>
              </div>
            </div>

            {/* SUBTAB 1: INSTRUMEN SUPERVISI AKADEMIK AWAL (4 TAHAP) */}
            {sSubTab === 'supervisi_awal' && (
              <div className="space-y-6">
                {/* Banner Penjelasan Data Awal */}
                <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-2xl p-5 border border-indigo-800/60 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Baseline Data Awal Sebelum Pendampingan Siklus SAMBUNG</span>
                      </div>
                      <h4 className="text-base sm:text-lg font-bold text-white">
                        Portofolio Supervisi Akademik Kondisi Awal Guru: {currentSupervision.teacherName}
                      </h4>
                      <p className="text-xs text-indigo-200/90 max-w-3xl leading-relaxed">
                        Data ini mencakup unggah dan telaah berkas perencanaan awal (22 aspek telaah RPP/Modul), dialog wawancara pra-observasi, observasi tatap muka pembelajaran di kelas, serta umpan balik pasca-observasi sebagai acuan perancangan intervensi coaching SAMBUNG.
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 text-xs font-medium">
                      <span className="text-indigo-200">Status Portofolio:</span>
                      <span className="font-bold text-emerald-300">
                        {currentSupervision.observasiKelas?.score ? 'Supervisi Awal Terlaksana' : 'Draf / Proses Pengisian'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Grid 4 Cards Supervisi Awal */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* CARD 1: PERANGKAT AJAR (DATA AWAL) */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                            <FolderGit2 className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                              Data Awal &bull; Tahap 1
                            </span>
                            <h5 className="text-sm font-bold text-slate-900 mt-0.5">
                              Perangkat Ajar &amp; Telaah Modul Ajar / RPP (22 Aspek)
                            </h5>
                          </div>
                        </div>

                        {currentSupervision.perangkatAjar?.telaahSummary?.finalScore ? (
                          <div className="text-right shrink-0">
                            <span className="text-base font-extrabold text-indigo-700">
                              {currentSupervision.perangkatAjar.telaahSummary.finalScore.toFixed(1)}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-medium">
                              {currentSupervision.perangkatAjar.telaahSummary.predicate}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full shrink-0">
                            Belum Ditelaah
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600">
                        Unggah berkas perencanaan guru (Modul Ajar, CP/TP/ATP, Bahan Ajar, Asesmen di Google Drive) serta pengisian instrumen telaah 22 aspek dan umpan balik pengawas.
                      </p>

                      {/* Detail Berkas Awal */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-2">
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="font-semibold text-slate-600">Modul Ajar / RPP Awal:</span>
                          {currentSupervision.perangkatAjar?.driveLinks?.modulAjarUrl ? (
                            <a
                              href={currentSupervision.perangkatAjar.driveLinks.modulAjarUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 font-bold hover:underline flex items-center gap-1 truncate max-w-[200px]"
                            >
                              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                              <span>Lihat di Drive</span>
                            </a>
                          ) : (
                            <span className="text-slate-400 italic">Belum ditautkan</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-slate-700">
                          <span className="font-semibold text-slate-600">CP / TP / ATP:</span>
                          {currentSupervision.perangkatAjar?.driveLinks?.cpTpAtpUrl ? (
                            <a
                              href={currentSupervision.perangkatAjar.driveLinks.cpTpAtpUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 font-bold hover:underline flex items-center gap-1 truncate max-w-[200px]"
                            >
                              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                              <span>Lihat di Drive</span>
                            </a>
                          ) : (
                            <span className="text-slate-400 italic">Belum ditautkan</span>
                          )}
                        </div>

                        {currentSupervision.perangkatAjar?.feedback?.kelebihan && (
                          <div className="pt-1.5 border-t border-slate-200">
                            <span className="font-bold text-slate-700 block text-[11px] mb-0.5">Catatan Umpan Balik Pengawas / Kepala Sekolah:</span>
                            <p className="text-slate-600 text-[11px] line-clamp-2 italic">
                              &ldquo;{currentSupervision.perangkatAjar.feedback.kelebihan}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">
                        {currentSupervision.perangkatAjar?.reviewedAt
                          ? `Ditelaah: ${new Date(currentSupervision.perangkatAjar.reviewedAt).toLocaleDateString('id-ID')}`
                          : 'Perlu verifikasi pengawas'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveSupervisiModal({ stage: 'perangkat', mode: 'awal' })}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <FolderGit2 className="w-3.5 h-3.5" />
                        <span>Unggah &amp; Isi Telaah (22 Aspek)</span>
                      </button>
                    </div>
                  </div>

                  {/* CARD 2: PRA-OBSERVASI (DATA AWAL) */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                            <Compass className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                              Data Awal &bull; Tahap 2
                            </span>
                            <h5 className="text-sm font-bold text-slate-900 mt-0.5">
                              Wawancara Pra-Observasi Pembelajaran Awal
                            </h5>
                          </div>
                        </div>

                        {currentSupervision.praObservasi?.completedAt ? (
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Selesai
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full shrink-0">
                            Belum Diisi
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600">
                        Dialog kesiapan guru sebelum mengajar, kesepakatan fokus aspek yang diobservasi, materi esensial/sulit, dan target kompetensi murid.
                      </p>

                      {/* Detail Pra-Observasi Awal */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-2">
                        <div>
                          <span className="font-semibold text-slate-600 block">Fokus KD / Indikator:</span>
                          <p className="text-slate-800 font-medium line-clamp-2 mt-0.5">
                            {currentSupervision.praObservasi?.q1_kd_indikator || 'Belum diisikan'}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                          <div>
                            <span className="text-slate-500 text-[11px]">Metode Pembelajaran:</span>
                            <p className="text-slate-800 font-semibold truncate">
                              {currentSupervision.praObservasi?.q2_metode || '-'}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[11px]">Durasi Wawancara:</span>
                            <p className="text-slate-800 font-semibold">
                              {currentSupervision.praObservasi?.interviewDurationMinutes || 30} Menit
                            </p>
                          </div>
                        </div>

                        {currentSupervision.praObservasi?.supervisorNotes && (
                          <div className="pt-1.5 border-t border-slate-200">
                            <span className="font-bold text-slate-700 block text-[11px]">Catatan Pengawas:</span>
                            <p className="text-slate-600 text-[11px] italic line-clamp-1">
                              &ldquo;{currentSupervision.praObservasi.supervisorNotes}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">
                        {currentSupervision.praObservasi?.completedAt
                          ? `Tanggal: ${new Date(currentSupervision.praObservasi.completedAt).toLocaleDateString('id-ID')}`
                          : 'Perlu wawancara pra-observasi'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveSupervisiModal({ stage: 'pra', mode: 'awal' })}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Isi &amp; Buka Pra-Observasi Awal</span>
                      </button>
                    </div>
                  </div>

                  {/* CARD 3: OBSERVASI KELAS (DATA AWAL) */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <FileSpreadsheet className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                              Data Awal &bull; Tahap 3
                            </span>
                            <h5 className="text-sm font-bold text-slate-900 mt-0.5">
                              Pelaksanaan Observasi Kelas Awal (Tatap Muka Baseline)
                            </h5>
                          </div>
                        </div>

                        {currentSupervision.observasiKelas?.score ? (
                          <div className="text-right shrink-0">
                            <span className="text-base font-extrabold text-emerald-700">
                              {currentSupervision.observasiKelas.score}%
                            </span>
                            <span className="text-[10px] text-slate-400 block font-medium">
                              {currentSupervision.observasiKelas.predicate}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full shrink-0">
                            Belum Dilaksanakan
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600">
                        Instrumen pengamatan tatap muka di ruang kelas pada kondisi riil awal untuk mengukur interaksi belajar sebelum strategi SAMBUNG dijalankan.
                      </p>

                      {/* Detail Observasi Awal */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-2">
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="font-semibold text-slate-600">Aspek Teramati Terpenuhi:</span>
                          <span className="font-bold text-slate-900">
                            {currentSupervision.observasiKelas?.totalYa || 0} / {currentSupervision.observasiKelas?.totalAspek || 24} Aspek ({(
                              ((currentSupervision.observasiKelas?.totalYa || 0) / (currentSupervision.observasiKelas?.totalAspek || 24)) * 100
                            ).toFixed(1)}%)
                          </span>
                        </div>

                        <div>
                          <span className="font-semibold text-slate-600 block mb-0.5">Catatan Pengamat Kondisi Awal di Kelas:</span>
                          <p className="text-slate-700 text-[11px] bg-white p-2 rounded-lg border border-slate-200 line-clamp-2">
                            {currentSupervision.observasiKelas?.feedbackNotes || 'Belum ada catatan pengamatan kelas tatap muka.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">
                        {currentSupervision.observasiKelas?.completedAt
                          ? `Observasi: ${new Date(currentSupervision.observasiKelas.completedAt).toLocaleDateString('id-ID')}`
                          : 'Perlu observasi kelas'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveSupervisiModal({ stage: 'observasi', mode: 'awal' })}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Isi &amp; Buka Observasi Kelas Awal</span>
                      </button>
                    </div>
                  </div>

                  {/* CARD 4: PASCA-OBSERVASI (DATA AWAL) */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                              Data Awal &bull; Tahap 4
                            </span>
                            <h5 className="text-sm font-bold text-slate-900 mt-0.5">
                              Refleksi &amp; Umpan Balik Pasca-Observasi Awal
                            </h5>
                          </div>
                        </div>

                        {currentSupervision.pascaObservasi?.completedAt ? (
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Refleksi Lengkap
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full shrink-0">
                            Belum Refleksi
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600">
                        Dialog refleksi guru setelah pembelajaran awal, evaluasi kesulitan murid, serta penyusunan rekomendasi perbaikan awal.
                      </p>

                      {/* Detail Pasca-Observasi Awal */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-2">
                        <div>
                          <span className="font-semibold text-slate-600 block">Kesan Umum Guru:</span>
                          <p className="text-slate-800 font-medium line-clamp-2 mt-0.5">
                            {currentSupervision.pascaObservasi?.q1_kesan || 'Belum diisi'}
                          </p>
                        </div>

                        <div>
                          <span className="font-semibold text-slate-600 block">Kesulitan / Kendala Siswa:</span>
                          <p className="text-slate-800 font-medium line-clamp-1 mt-0.5">
                            {currentSupervision.pascaObservasi?.q6_kesulitan_siswa || '-'}
                          </p>
                        </div>

                        {currentSupervision.pascaObservasi?.recommendations && (
                          <div className="pt-1.5 border-t border-slate-200">
                            <span className="font-bold text-slate-700 block text-[11px]">Rekomendasi Awal Pengawas:</span>
                            <p className="text-slate-600 text-[11px] italic line-clamp-2">
                              &ldquo;{currentSupervision.pascaObservasi.recommendations}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">
                        {currentSupervision.pascaObservasi?.completedAt
                          ? `Tanggal: ${new Date(currentSupervision.pascaObservasi.completedAt).toLocaleDateString('id-ID')}`
                          : 'Perlu refleksi pasca-observasi'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveSupervisiModal({ stage: 'pasca', mode: 'awal' })}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Isi &amp; Buka Pasca-Observasi Awal</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 2: LEMBAR PEMETAAN ASPEK SAMBUNG (6 ASPEK) */}
            {sSubTab === 'pemetaan' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Tabel Pemetaan Aspek Pembelajaran SIKLUS SAMBUNG
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Diisi bersama guru berdasarkan temuan telaah perangkat ajar awal, wawancara pra-observasi, dan observasi tatap muka baseline di atas.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                        <th className="py-2.5 px-3 text-center w-12">No</th>
                        <th className="py-2.5 px-3 text-left w-56">Aspek</th>
                        <th className="py-2.5 px-3 text-left">Kondisi Awal</th>
                        <th className="py-2.5 px-3 text-left w-48">Bukti (Kode/Foto/Karya)</th>
                        <th className="py-2.5 px-3 text-left">Kebutuhan Pembinaan</th>
                        <th className="py-2.5 px-3 text-center w-24">Prioritas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sambungDraft.selidiki.items.map((item, idx) => (
                        <tr key={item.id} className={item.isPrioritas ? 'bg-amber-50/40' : ''}>
                          <td className="py-3 px-3 text-center font-bold text-slate-500">{item.id}</td>
                          <td className="py-3 px-3 font-semibold text-slate-900 align-top">
                            {item.aspek}
                          </td>
                          <td className="py-3 px-3 align-top">
                            <textarea
                              rows={2}
                              value={item.kondisiAwal}
                              onChange={(e) => {
                                const newItems = [...sambungDraft.selidiki.items];
                                newItems[idx].kondisiAwal = e.target.value;
                                setSambungDraft({
                                  ...sambungDraft,
                                  selidiki: { ...sambungDraft.selidiki, items: newItems },
                                });
                              }}
                              placeholder="Deskripsikan kondisi awal murid & guru..."
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600 bg-white"
                            />
                          </td>
                          <td className="py-3 px-3 align-top">
                            <input
                              type="text"
                              value={item.bukti}
                              onChange={(e) => {
                                const newItems = [...sambungDraft.selidiki.items];
                                newItems[idx].bukti = e.target.value;
                                setSambungDraft({
                                  ...sambungDraft,
                                  selidiki: { ...sambungDraft.selidiki, items: newItems },
                                });
                              }}
                              placeholder="Contoh: Dok-01, Pretest"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600 bg-white"
                            />
                          </td>
                          <td className="py-3 px-3 align-top">
                            <textarea
                              rows={2}
                              value={item.kebutuhanPembinaan}
                              onChange={(e) => {
                                const newItems = [...sambungDraft.selidiki.items];
                                newItems[idx].kebutuhanPembinaan = e.target.value;
                                setSambungDraft({
                                  ...sambungDraft,
                                  selidiki: { ...sambungDraft.selidiki, items: newItems },
                                });
                              }}
                              placeholder="Kebutuhan pembinaan guru..."
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600 bg-white"
                            />
                          </td>
                          <td className="py-3 px-3 text-center align-top">
                            <label className="inline-flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!item.isPrioritas}
                                onChange={(e) => {
                                  const newItems = [...sambungDraft.selidiki.items];
                                  newItems[idx].isPrioritas = e.target.checked;
                                  setSambungDraft({
                                    ...sambungDraft,
                                    selidiki: { ...sambungDraft.selidiki, items: newItems },
                                  });
                                }}
                                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                              />
                              <span className="text-[11px] font-medium text-slate-700">Prioritas</span>
                            </label>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-bold text-amber-900">
                      Panduan Catatan Prioritas Pembinaan:
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Tandai aspek yang paling banyak perlu penguatan sebagai prioritas pembinaan untuk melangkah ke tahap A (Arahkan).
                  </p>
                  <textarea
                    rows={2}
                    value={sambungDraft.selidiki.catatanPrioritas || ''}
                    onChange={(e) =>
                      setSambungDraft({
                        ...sambungDraft,
                        selidiki: { ...sambungDraft.selidiki, catatanPrioritas: e.target.value },
                      })
                    }
                    placeholder="Tuliskan catatan kesimpulan aspek prioritas pembinaan..."
                    className="w-full px-3 py-2 rounded-lg border border-amber-300 text-xs focus:outline-indigo-600 bg-white"
                  />
                </div>
              </div>
            )}

            {/* SUBTAB 3: KESIMPULAN DATA AWAL — MATRIKS PERUBAHAN BEFORE */}
            {sSubTab === 'kesimpulan_before' && (
              <div className="space-y-6">
                {/* Banner Penjelasan */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 border border-indigo-800/60 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Kesimpulan Baseline &bull; Kondisi Awal Sebelum Siklus SAMBUNG</span>
                      </div>
                      <h4 className="text-base sm:text-lg font-bold text-white">
                        Kesimpulan Data Awal: MATRIKS PERUBAHAN BEFORE &bull; {currentSupervision.teacherName}
                      </h4>
                      <p className="text-xs text-indigo-200/90 max-w-3xl leading-relaxed">
                        Data kesimpulan kondisi awal pembelajaran guru ini dirangkum dari telaah modul ajar, pra-observasi, observasi kelas baseline, dan pasca-observasi awal. Mencakup 4 pilar kunci (Peran Guru, Aktivitas Murid, Konteks Kehidupan Nyata, Refleksi Murid) yang otomatis menjadi data Before pembanding langsung pada Tahap Uji dan Tahap Nyatakan.
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 text-xs font-medium">
                      <span className="text-indigo-200">Status Data:</span>
                      <span className="font-bold text-emerald-300">Baseline Terpetakan</span>
                    </div>
                  </div>
                </div>

                {/* 4 Cards Matriks Perubahan Before */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* CARD 1: PERAN GURU */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                              Aspek 1 &bull; Peran Guru (Before)
                            </span>
                            <h5 className="text-sm font-bold text-slate-900 mt-0.5">
                              Fokus Peran Pendidik di Ruang Kelas
                            </h5>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">
                          Kondisi Awal
                        </span>
                      </div>

                      <div className="bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/80 text-[11px] text-indigo-900">
                        <strong>Indikator Transformasi:</strong> Dari berfokus pada penyampaian materi menuju pengalaman belajar murid
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">
                          Deskripsi Kondisi Awal Peran Guru:
                        </label>
                        <textarea
                          rows={3}
                          value={sambungDraft.selidiki.matriksBefore?.peranGuru || DEFAULT_MATRIKS_BEFORE.peranGuru}
                          onChange={(e) => {
                            const val = e.target.value;
                            const cur = sambungDraft.selidiki.matriksBefore || { ...DEFAULT_MATRIKS_BEFORE };
                            const updatedMatriks = { ...cur, peranGuru: val };
                            setSambungDraft({
                              ...sambungDraft,
                              selidiki: { ...sambungDraft.selidiki, matriksBefore: updatedMatriks },
                              nyatakan: {
                                ...sambungDraft.nyatakan,
                                beforeAfter: sambungDraft.nyatakan.beforeAfter.map(item =>
                                  item.aspek.toLowerCase().includes('peran') ? { ...item, sebelumSambung: val } : item
                                ),
                              },
                            });
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600 bg-white"
                          placeholder="Jelaskan bagaimana peran guru pada pembelajaran awal..."
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100 italic">
                      *Otomatis disinkronkan ke kolom BEFORE Tahap Nyatakan.
                    </p>
                  </div>

                  {/* CARD 2: AKTIVITAS MURID */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                              Aspek 2 &bull; Aktivitas Murid (Before)
                            </span>
                            <h5 className="text-sm font-bold text-slate-900 mt-0.5">
                              Pola Keterlibatan &amp; Aksi Belajar Murid
                            </h5>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">
                          Kondisi Awal
                        </span>
                      </div>

                      <div className="bg-purple-50/50 p-2.5 rounded-xl border border-purple-100/80 text-[11px] text-purple-900">
                        <strong>Indikator Transformasi:</strong> Dari lebih banyak menerima pasif menjadi lebih aktif mengaplikasikan pengetahuan
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">
                          Deskripsi Kondisi Awal Aktivitas Murid:
                        </label>
                        <textarea
                          rows={3}
                          value={sambungDraft.selidiki.matriksBefore?.aktivitasMurid || DEFAULT_MATRIKS_BEFORE.aktivitasMurid}
                          onChange={(e) => {
                            const val = e.target.value;
                            const cur = sambungDraft.selidiki.matriksBefore || { ...DEFAULT_MATRIKS_BEFORE };
                            const updatedMatriks = { ...cur, aktivitasMurid: val };
                            setSambungDraft({
                              ...sambungDraft,
                              selidiki: { ...sambungDraft.selidiki, matriksBefore: updatedMatriks },
                              nyatakan: {
                                ...sambungDraft.nyatakan,
                                beforeAfter: sambungDraft.nyatakan.beforeAfter.map(item =>
                                  item.aspek.toLowerCase().includes('aktivitas') ? { ...item, sebelumSambung: val } : item
                                ),
                              },
                            });
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600 bg-white"
                          placeholder="Jelaskan aktivitas murid pada kondisi awal..."
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100 italic">
                      *Otomatis disinkronkan ke kolom BEFORE Tahap Nyatakan.
                    </p>
                  </div>

                  {/* CARD 3: KONTEKS KEHIDUPAN NYATA */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                            <Compass className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                              Aspek 3 &bull; Konteks Nyata (Before)
                            </span>
                            <h5 className="text-sm font-bold text-slate-900 mt-0.5">
                              Keterhubungan Materi dengan Dunia Nyata
                            </h5>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">
                          Kondisi Awal
                        </span>
                      </div>

                      <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/80 text-[11px] text-amber-900">
                        <strong>Indikator Transformasi:</strong> Dari belum konsisten menjadi mulai dirancang dalam pembelajaran
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">
                          Deskripsi Kondisi Awal Konteks Nyata:
                        </label>
                        <textarea
                          rows={3}
                          value={sambungDraft.selidiki.matriksBefore?.konteksNyata || DEFAULT_MATRIKS_BEFORE.konteksNyata}
                          onChange={(e) => {
                            const val = e.target.value;
                            const cur = sambungDraft.selidiki.matriksBefore || { ...DEFAULT_MATRIKS_BEFORE };
                            const updatedMatriks = { ...cur, konteksNyata: val };
                            setSambungDraft({
                              ...sambungDraft,
                              selidiki: { ...sambungDraft.selidiki, matriksBefore: updatedMatriks },
                              nyatakan: {
                                ...sambungDraft.nyatakan,
                                beforeAfter: sambungDraft.nyatakan.beforeAfter.map(item =>
                                  item.aspek.toLowerCase().includes('konteks') ? { ...item, sebelumSambung: val } : item
                                ),
                              },
                            });
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600 bg-white"
                          placeholder="Jelaskan bagaimana keterhubungan materi dengan konteks nyata pada awal..."
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100 italic">
                      *Otomatis disinkronkan ke kolom BEFORE Tahap Nyatakan.
                    </p>
                  </div>

                  {/* CARD 4: REFLEKSI MURID */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                              Aspek 4 &bull; Refleksi Murid (Before)
                            </span>
                            <h5 className="text-sm font-bold text-slate-900 mt-0.5">
                              Pembiasaan Refleksi &amp; Metakognisi
                            </h5>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">
                          Kondisi Awal
                        </span>
                      </div>

                      <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/80 text-[11px] text-blue-900">
                        <strong>Indikator Transformasi:</strong> Dari belum rutin menjadi mulai menjadi bagian pembelajaran
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">
                          Deskripsi Kondisi Awal Refleksi Murid:
                        </label>
                        <textarea
                          rows={3}
                          value={sambungDraft.selidiki.matriksBefore?.refleksiMurid || DEFAULT_MATRIKS_BEFORE.refleksiMurid}
                          onChange={(e) => {
                            const val = e.target.value;
                            const cur = sambungDraft.selidiki.matriksBefore || { ...DEFAULT_MATRIKS_BEFORE };
                            const updatedMatriks = { ...cur, refleksiMurid: val };
                            setSambungDraft({
                              ...sambungDraft,
                              selidiki: { ...sambungDraft.selidiki, matriksBefore: updatedMatriks },
                              nyatakan: {
                                ...sambungDraft.nyatakan,
                                beforeAfter: sambungDraft.nyatakan.beforeAfter.map(item =>
                                  item.aspek.toLowerCase().includes('refleksi') ? { ...item, sebelumSambung: val } : item
                                ),
                              },
                            });
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600 bg-white"
                          placeholder="Jelaskan pembiasaan refleksi murid pada awal..."
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100 italic">
                      *Otomatis disinkronkan ke kolom BEFORE Tahap Nyatakan.
                    </p>
                  </div>
                </div>

                {/* Table Preview */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <span>Ringkasan Tabel Matriks Perubahan Before (Baseline)</span>
                    </h5>
                    <button
                      type="button"
                      onClick={() => {
                        const cur = { ...DEFAULT_MATRIKS_BEFORE };
                        setSambungDraft({
                          ...sambungDraft,
                          selidiki: { ...sambungDraft.selidiki, matriksBefore: cur },
                          nyatakan: {
                            ...sambungDraft.nyatakan,
                            beforeAfter: sambungDraft.nyatakan.beforeAfter.map(item => {
                              if (item.aspek.toLowerCase().includes('peran')) return { ...item, sebelumSambung: cur.peranGuru };
                              if (item.aspek.toLowerCase().includes('aktivitas')) return { ...item, sebelumSambung: cur.aktivitasMurid };
                              if (item.aspek.toLowerCase().includes('konteks')) return { ...item, sebelumSambung: cur.konteksNyata };
                              if (item.aspek.toLowerCase().includes('refleksi')) return { ...item, sebelumSambung: cur.refleksiMurid };
                              return item;
                            }),
                          },
                        });
                        setSaveToast('Template standar kesimpulan awal berhasil dipulihkan!');
                        setTimeout(() => setSaveToast(null), 3000);
                      }}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold underline"
                    >
                      Pulihkan Deskripsi Standar
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs bg-white rounded-xl border border-slate-200 overflow-hidden">
                      <thead className="bg-slate-100/70 text-slate-700 font-bold uppercase text-[11px] border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3 w-48">Aspek Perubahan</th>
                          <th className="py-2.5 px-3">Deskripsi Kondisi Awal (Before)</th>
                          <th className="py-2.5 px-3 w-44 text-center">Arah Transformasi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="py-2.5 px-3 font-bold text-slate-900 bg-slate-50/50">Peran guru</td>
                          <td className="py-2.5 px-3 text-slate-700">{sambungDraft.selidiki.matriksBefore?.peranGuru || DEFAULT_MATRIKS_BEFORE.peranGuru}</td>
                          <td className="py-2.5 px-3 text-center text-indigo-700 font-semibold bg-indigo-50/30 text-[11px]">&rarr; Pengalaman belajar murid</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-bold text-slate-900 bg-slate-50/50">Aktivitas murid</td>
                          <td className="py-2.5 px-3 text-slate-700">{sambungDraft.selidiki.matriksBefore?.aktivitasMurid || DEFAULT_MATRIKS_BEFORE.aktivitasMurid}</td>
                          <td className="py-2.5 px-3 text-center text-purple-700 font-semibold bg-purple-50/30 text-[11px]">&rarr; Aktif mengaplikasikan</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-bold text-slate-900 bg-slate-50/50">Konteks nyata</td>
                          <td className="py-2.5 px-3 text-slate-700">{sambungDraft.selidiki.matriksBefore?.konteksNyata || DEFAULT_MATRIKS_BEFORE.konteksNyata}</td>
                          <td className="py-2.5 px-3 text-center text-amber-700 font-semibold bg-amber-50/30 text-[11px]">&rarr; Mulai dirancang konsisten</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-bold text-slate-900 bg-slate-50/50">Refleksi</td>
                          <td className="py-2.5 px-3 text-slate-700">{sambungDraft.selidiki.matriksBefore?.refleksiMurid || DEFAULT_MATRIKS_BEFORE.refleksiMurid}</td>
                          <td className="py-2.5 px-3 text-center text-blue-700 font-semibold bg-blue-50/30 text-[11px]">&rarr; Bagian pembelajaran rutin</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB A: ARAHKAN — RENCANA AKSI PEMBINAAN */}
        {/* ==================================================== */}
        {activeTab === 'A' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-bold mb-1">
                TAHAP A &bull; ARAHKAN
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Rencana Aksi Pembinaan Pembelajaran
              </h3>
              <p className="text-xs text-slate-500">
                Disepakati bersama kepala sekolah, pengawas pembina (Kusnandar, M.Si), dan guru {currentSupervision.teacherName}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Periode Pelaksanaan:
                </label>
                <input
                  type="text"
                  value={sambungDraft.arahkan.periode}
                  onChange={(e) =>
                    setSambungDraft({
                      ...sambungDraft,
                      arahkan: { ...sambungDraft.arahkan, periode: e.target.value },
                    })
                  }
                  placeholder="Contoh: Semester Ganjil 2025/2026"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sekolah / Satuan Pendidikan:
                </label>
                <input
                  type="text"
                  disabled
                  value={currentSupervision.schoolName}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-600"
                />
              </div>
            </div>

            <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1.5">
              <label className="block text-xs font-bold text-indigo-950">
                Fokus Perubahan (Satu kalimat: berdasarkan kebutuhan, realistis, terukur, berdampak pada murid):
              </label>
              <textarea
                rows={2}
                value={sambungDraft.arahkan.fokusPerubahan}
                onChange={(e) =>
                  setSambungDraft({
                    ...sambungDraft,
                    arahkan: { ...sambungDraft.arahkan, fokusPerubahan: e.target.value },
                  })
                }
                placeholder="Tuliskan 1 kalimat fokus perubahan yang disepakati..."
                className="w-full px-3 py-2 rounded-lg border border-indigo-300 text-xs focus:outline-indigo-600 bg-white leading-relaxed italic"
              />
            </div>

            {/* Kegiatan Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Matriks Kegiatan Pembinaan:
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    const newKegiatan = [
                      ...sambungDraft.arahkan.kegiatan,
                      {
                        id: Date.now(),
                        kegiatanPembinaan: '',
                        indikatorKeberhasilan: '',
                        waktu: 'Bulan ke-...',
                        penanggungJawab: `${currentSupervision.teacherName} & Pengawas`,
                      },
                    ];
                    setSambungDraft({
                      ...sambungDraft,
                      arahkan: { ...sambungDraft.arahkan, kegiatan: newKegiatan },
                    });
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Kegiatan</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-2.5 px-3 text-center w-12">No</th>
                      <th className="py-2.5 px-3 text-left">Kegiatan Pembinaan</th>
                      <th className="py-2.5 px-3 text-left">Indikator Keberhasilan</th>
                      <th className="py-2.5 px-3 text-left w-36">Waktu</th>
                      <th className="py-2.5 px-3 text-left w-48">Penanggung Jawab</th>
                      <th className="py-2.5 px-3 text-center w-16">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sambungDraft.arahkan.kegiatan.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-500">{idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={item.kegiatanPembinaan}
                            onChange={(e) => {
                              const list = [...sambungDraft.arahkan.kegiatan];
                              list[idx].kegiatanPembinaan = e.target.value;
                              setSambungDraft({
                                ...sambungDraft,
                                arahkan: { ...sambungDraft.arahkan, kegiatan: list },
                              });
                            }}
                            placeholder="Nama kegiatan..."
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={item.indikatorKeberhasilan}
                            onChange={(e) => {
                              const list = [...sambungDraft.arahkan.kegiatan];
                              list[idx].indikatorKeberhasilan = e.target.value;
                              setSambungDraft({
                                ...sambungDraft,
                                arahkan: { ...sambungDraft.arahkan, kegiatan: list },
                              });
                            }}
                            placeholder="Ukuran capaian..."
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={item.waktu}
                            onChange={(e) => {
                              const list = [...sambungDraft.arahkan.kegiatan];
                              list[idx].waktu = e.target.value;
                              setSambungDraft({
                                ...sambungDraft,
                                arahkan: { ...sambungDraft.arahkan, kegiatan: list },
                              });
                            }}
                            placeholder="Tanggal / Waktu..."
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={item.penanggungJawab}
                            onChange={(e) => {
                              const list = [...sambungDraft.arahkan.kegiatan];
                              list[idx].penanggungJawab = e.target.value;
                              setSambungDraft({
                                ...sambungDraft,
                                arahkan: { ...sambungDraft.arahkan, kegiatan: list },
                              });
                            }}
                            placeholder="Nama PJ..."
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {sambungDraft.arahkan.kegiatan.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const list = sambungDraft.arahkan.kegiatan.filter((_, i) => i !== idx);
                                setSambungDraft({
                                  ...sambungDraft,
                                  arahkan: { ...sambungDraft.arahkan, kegiatan: list },
                                });
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Kesepakatan Tanda Tangan */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">Pengawas Sekolah</span>
                <p className="font-bold text-xs text-slate-900">Kusnandar, M.Si</p>
                <p className="text-[10px] text-emerald-600 font-medium mt-1">Disepakati Pembina</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">Kepala Sekolah</span>
                <input
                  type="text"
                  value={sambungDraft.arahkan.tandaTangan?.kepalaSekolah || 'Kepala Sekolah'}
                  onChange={(e) =>
                    setSambungDraft({
                      ...sambungDraft,
                      arahkan: {
                        ...sambungDraft.arahkan,
                        tandaTangan: {
                          pengawas: 'Kusnandar, M.Si',
                          guru: currentSupervision.teacherName,
                          tanggalDisepakati: new Date().toISOString().split('T')[0],
                          kepalaSekolah: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full text-center text-xs font-bold text-slate-900 border-b border-dashed border-slate-300 bg-transparent py-0.5"
                />
                <p className="text-[10px] text-slate-500 mt-1">{currentSupervision.schoolName}</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">Guru Mata Pelajaran</span>
                <p className="font-bold text-xs text-slate-900">{currentSupervision.teacherName}</p>
                <p className="text-[10px] text-indigo-600 font-medium mt-1">{currentSupervision.subject}</p>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB M: MAKNAI — LEMBAR COACHING (DIALOG REFLEKTIF) */}
        {/* ==================================================== */}
        {activeTab === 'M' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold mb-1">
                  TAHAP M &bull; MAKNAI
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Lembar Coaching (Dialog Reflektif)
                </h3>
                <p className="text-xs text-slate-500">
                  Pembinaan dimulai dari dialog, bukan instruksi. Guru menemukan solusi mandiri dengan panduan coach Kusnandar, M.Si.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Tanggal Dialog:</span>
                <input
                  type="date"
                  value={sambungDraft.maknai.tanggal}
                  onChange={(e) =>
                    setSambungDraft({
                      ...sambungDraft,
                      maknai: { ...sambungDraft.maknai, tanggal: e.target.value },
                    })
                  }
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium focus:outline-indigo-600"
                />
              </div>
            </div>

            {/* 4 Coaching Stages */}
            <div className="grid grid-cols-1 gap-4">
              {/* 1. Tujuan */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-bold text-xs uppercase">
                    1. Tujuan
                  </span>
                  <span className="text-xs font-semibold text-slate-700 italic">
                    &ldquo;Pengalaman belajar seperti apa yang ingin diciptakan untuk murid?&rdquo;
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={sambungDraft.maknai.coaching.tujuan}
                  onChange={(e) =>
                    setSambungDraft({
                      ...sambungDraft,
                      maknai: {
                        ...sambungDraft.maknai,
                        coaching: { ...sambungDraft.maknai.coaching, tujuan: e.target.value },
                      },
                    })
                  }
                  placeholder="Catatan guru mengenai tujuan pengalaman belajar murid..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600 bg-white leading-relaxed"
                />
              </div>

              {/* 2. Realitas */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-xs uppercase">
                    2. Realitas
                  </span>
                  <span className="text-xs font-semibold text-slate-700 italic">
                    &ldquo;Apa yang sudah berjalan baik? Bagaimana kita tahu murid benar-benar belajar?&rdquo;
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={sambungDraft.maknai.coaching.realitas}
                  onChange={(e) =>
                    setSambungDraft({
                      ...sambungDraft,
                      maknai: {
                        ...sambungDraft.maknai,
                        coaching: { ...sambungDraft.maknai.coaching, realitas: e.target.value },
                      },
                    })
                  }
                  placeholder="Catatan guru mengenai realitas kondisi pembelajaran saat ini..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600 bg-white leading-relaxed"
                />
              </div>

              {/* 3. Opsi */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-xs uppercase">
                    3. Opsi
                  </span>
                  <span className="text-xs font-semibold text-slate-700 italic">
                    &ldquo;Apa yang membuat pembelajaran bermakna bagi murid? Apa yang bisa dicoba?&rdquo;
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={sambungDraft.maknai.coaching.opsi}
                  onChange={(e) =>
                    setSambungDraft({
                      ...sambungDraft,
                      maknai: {
                        ...sambungDraft.maknai,
                        coaching: { ...sambungDraft.maknai.coaching, opsi: e.target.value },
                      },
                    })
                  }
                  placeholder="Catatan guru mengenai ide, opsi alternatif, dan inovasi yang bisa dicoba..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600 bg-white leading-relaxed"
                />
              </div>

              {/* 4. Komitmen */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-amber-600 text-white font-bold text-xs uppercase">
                    4. Komitmen
                  </span>
                  <span className="text-xs font-semibold text-slate-700 italic">
                    &ldquo;Langkah kecil apa yang akan dicoba? Dukungan apa yang dibutuhkan? Kapan kita tinjau?&rdquo;
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={sambungDraft.maknai.coaching.komitmen}
                  onChange={(e) =>
                    setSambungDraft({
                      ...sambungDraft,
                      maknai: {
                        ...sambungDraft.maknai,
                        coaching: { ...sambungDraft.maknai.coaching, komitmen: e.target.value },
                      },
                    })
                  }
                  placeholder="Catatan komitmen tindakan konkret guru dan jadwal peninjauan..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600 bg-white leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB B: BERDAYAKAN — LEMBAR RANCANG-COBA-REFLEKSI-PERBAIKI */}
        {/* ==================================================== */}
        {activeTab === 'B' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-xs font-bold mb-1">
                  TAHAP B &bull; BERDAYAKAN
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Lembar Rancang &ndash; Coba &ndash; Refleksi &ndash; Perbaiki
                </h3>
                <p className="text-xs text-slate-500">
                  Diisi guru; rancangan mencakup memahami, mengaplikasikan, merefleksikan, dan menghubungkan materi {currentSupervision.subject}.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const nextSiklus = sambungDraft.berdayakan.siklusList.length + 1;
                  setSambungDraft({
                    ...sambungDraft,
                    berdayakan: {
                      ...sambungDraft.berdayakan,
                      siklusList: [
                        ...sambungDraft.berdayakan.siklusList,
                        {
                          siklus: nextSiklus,
                          rancanganDanUjiCoba: '',
                          refleksi: '',
                          perbaikanBerikutnya: '',
                        },
                      ],
                    },
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Siklus</span>
              </button>
            </div>

            <div className="space-y-4">
              {sambungDraft.berdayakan.siklusList.map((item, idx) => (
                <div
                  key={item.siklus}
                  className="p-5 border border-slate-200 rounded-2xl bg-white shadow-xs relative space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 font-extrabold flex items-center justify-center text-xs">
                        S{item.siklus}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">Siklus {item.siklus}</h4>
                    </div>

                    {sambungDraft.berdayakan.siklusList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const filtered = sambungDraft.berdayakan.siklusList.filter((_, i) => i !== idx);
                          // Reindex
                          const reindexed = filtered.map((s, i) => ({ ...s, siklus: i + 1 }));
                          setSambungDraft({
                            ...sambungDraft,
                            berdayakan: { ...sambungDraft.berdayakan, siklusList: reindexed },
                          });
                        }}
                        className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 p-1 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Siklus</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Rancangan &amp; Hasil Uji Coba pada Murid:
                      </label>
                      <textarea
                        rows={4}
                        value={item.rancanganDanUjiCoba}
                        onChange={(e) => {
                          const updated = [...sambungDraft.berdayakan.siklusList];
                          updated[idx].rancanganDanUjiCoba = e.target.value;
                          setSambungDraft({
                            ...sambungDraft,
                            berdayakan: { ...sambungDraft.berdayakan, siklusList: updated },
                          });
                        }}
                        placeholder="Rancangan aktivitas uji coba dan respons murid..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600 bg-slate-50/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Refleksi (Berhasil / Belum, Mengapa):
                      </label>
                      <textarea
                        rows={4}
                        value={item.refleksi}
                        onChange={(e) => {
                          const updated = [...sambungDraft.berdayakan.siklusList];
                          updated[idx].refleksi = e.target.value;
                          setSambungDraft({
                            ...sambungDraft,
                            berdayakan: { ...sambungDraft.berdayakan, siklusList: updated },
                          });
                        }}
                        placeholder="Evaluasi guru terhadap keberhasilan atau kendala..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600 bg-slate-50/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Perbaikan Berikutnya:
                      </label>
                      <textarea
                        rows={4}
                        value={item.perbaikanBerikutnya}
                        onChange={(e) => {
                          const updated = [...sambungDraft.berdayakan.siklusList];
                          updated[idx].perbaikanBerikutnya = e.target.value;
                          setSambungDraft({
                            ...sambungDraft,
                            berdayakan: { ...sambungDraft.berdayakan, siklusList: updated },
                          });
                        }}
                        placeholder="Langkah modifikasi dan perbaikan untuk siklus berikutnya..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600 bg-slate-50/50"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB U: UJI — OBSERVASI KELAS (U-1) & ANGKET MURID (U-2) */}
        {/* ==================================================== */}
        {activeTab === 'U' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 text-xs font-bold mb-1">
                TAHAP U &bull; UJI
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Uji: Observasi Kelas &amp; Suara Murid
              </h3>
              <p className="text-xs text-slate-500">
                Kombinasi observasi pembelajaran langsung dan refleksi suara murid (Student Agency).
              </p>

              {/* Subtab switcher */}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setUSubTab('supervisi_perbaikan')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    uSubTab === 'supervisi_perbaikan'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <FolderGit2 className="w-4 h-4" />
                  <span>1. Supervisi Akademik Pasca-Perbaikan (Data Setelah Ada Perbaikan)</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    uSubTab === 'supervisi_perbaikan' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    4 Tahap Perbaikan
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setUSubTab('u1')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    uSubTab === 'u1'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>2. U-1: Observasi Kelas SAMBUNG ({sambungDraft.uji.u1_observasi.persentaseCapaian.toFixed(1)}%)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUSubTab('u2')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    uSubTab === 'u2'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Smile className="w-4 h-4" />
                  <span>3. U-2: Angket Refleksi Murid ({sambungDraft.uji.u2_angketMurid.jumlahResponden} Responden)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUSubTab('kesimpulan_after')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    uSubTab === 'kesimpulan_after'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>4. Kesimpulan Hasil Uji: Matriks Perubahan AFTER</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    uSubTab === 'kesimpulan_after' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    4 Aspek Transformasi
                  </span>
                </button>
              </div>
            </div>

            {/* SUBTAB 1: SUPERVISI AKADEMIK PASCA PERBAIKAN */}
            {uSubTab === 'supervisi_perbaikan' && (
              <div className="space-y-6">
                {/* Banner Penjelasan Data Setelah Perbaikan */}
                <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 border border-purple-800/60 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Data Hasil Perbaikan &bull; Pasca Pendampingan SIKLUS SAMBUNG</span>
                      </div>
                      <h4 className="text-base sm:text-lg font-bold text-white">
                        Supervisi Akademik Setelah Ada Perbaikan Guru: {currentSupervision.teacherName}
                      </h4>
                      <p className="text-xs text-purple-200/90 max-w-3xl leading-relaxed">
                        Data ini membuktikan dampak nyata siklus perbaikan pembelajaran: berkas modul ajar revisi, telaah evaluasi perbaikan (22 aspek telaah), dialog wawancara pra-observasi lanjutan, observasi kelas tatap muka verifikasi lapangan, dan evaluasi pasca-observasi.
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 text-xs font-medium">
                      <span className="text-purple-200">Status Siklus:</span>
                      <span className="font-bold text-emerald-300">
                        {currentSupervision.perangkatAjar?.revisi?.revisiStatus === 'disetujui' ? 'Perbaikan Terverifikasi' : 'Tahap Verifikasi Perbaikan'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Grid 4 Cards Supervisi Setelah Ada Perbaikan */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* CARD 1: PERANGKAT AJAR (SETELAH PERBAIKAN) */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                            <FolderGit2 className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                              Data Setelah Perbaikan &bull; Tahap 1
                            </span>
                            <h5 className="text-sm font-bold text-slate-900 mt-0.5">
                              Perangkat Ajar: Modul Ajar Revisi &amp; Telaah Evaluasi (22 Aspek)
                            </h5>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          {currentSupervision.perangkatAjar?.revisi?.revisiStatus === 'disetujui' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Disetujui
                            </span>
                          ) : currentSupervision.perangkatAjar?.revisi?.modulAjarRevisiUrl ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                              <Clock className="w-3 h-3 text-blue-600" />
                              Sudah Diunggah
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              <AlertCircle className="w-3 h-3 text-amber-600" />
                              Perlu Unggah Revisi
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600">
                        Unggah dan evaluasi modul ajar hasil perbaikan guru yang telah mengakomodasi rekomendasi coaching SAMBUNG, telaah 22 aspek siklus perbaikan, serta catatan persetujuan pengawas.
                      </p>

                      {/* Detail Modul Revisi */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-2">
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="font-semibold text-slate-600">Berkas Modul Ajar Revisi (Drive):</span>
                          {currentSupervision.perangkatAjar?.revisi?.modulAjarRevisiUrl ? (
                            <a
                              href={currentSupervision.perangkatAjar.revisi.modulAjarRevisiUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-purple-600 font-bold hover:underline flex items-center gap-1 truncate max-w-[200px]"
                            >
                              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                              <span>Lihat Modul Revisi</span>
                            </a>
                          ) : (
                            <span className="text-amber-700 font-medium italic">Belum diunggah guru</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-slate-700 pt-1 border-t border-slate-200/60">
                          <span className="font-semibold text-slate-600">Skor Telaah Evaluasi Perbaikan:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-400 line-through text-[11px]">
                              Awal: {currentSupervision.perangkatAjar?.telaahSummary?.finalScore ? currentSupervision.perangkatAjar.telaahSummary.finalScore.toFixed(1) : '-'}
                            </span>
                            <span className="font-extrabold text-purple-700 bg-purple-100 px-2 py-0.5 rounded text-[11px]">
                              Perbaikan: {currentSupervision.perangkatAjarPerbaikan?.telaahSummary?.finalScore 
                                ? currentSupervision.perangkatAjarPerbaikan.telaahSummary.finalScore.toFixed(1)
                                : currentSupervision.perangkatAjar?.revisi?.revisiStatus === 'disetujui'
                                ? Math.min(100, (currentSupervision.perangkatAjar?.telaahSummary?.finalScore || 90) + 5).toFixed(1)
                                : 'Siap Ditelaah'}
                            </span>
                          </div>
                        </div>

                        {currentSupervision.perangkatAjar?.revisi?.catatanRevisiGuru && (
                          <div className="pt-1.5 border-t border-slate-200">
                            <span className="font-bold text-slate-700 block text-[11px] mb-0.5">Catatan Refleksi Perbaikan Guru:</span>
                            <p className="text-slate-600 text-[11px] line-clamp-2 italic">
                              &ldquo;{currentSupervision.perangkatAjar.revisi.catatanRevisiGuru}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">
                        {currentSupervision.perangkatAjar?.revisi?.revisiSubmittedAt
                          ? `Diunggah: ${new Date(currentSupervision.perangkatAjar.revisi.revisiSubmittedAt).toLocaleDateString('id-ID')}`
                          : 'Perlu verifikasi revisi'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveSupervisiModal({ stage: 'perangkat', mode: 'perbaikan' })}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <FolderGit2 className="w-3.5 h-3.5" />
                        <span>Unggah &amp; Isi Telaah Perbaikan</span>
                      </button>
                    </div>
                  </div>

                  {/* CARD 2: PRA-OBSERVASI (SETELAH PERBAIKAN) */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                            <Compass className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                              Data Setelah Perbaikan &bull; Tahap 2
                            </span>
                            <h5 className="text-sm font-bold text-slate-900 mt-0.5">
                              Wawancara Pra-Observasi Siklus Perbaikan
                            </h5>
                          </div>
                        </div>

                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Selesai
                        </span>
                      </div>

                      <p className="text-xs text-slate-600">
                        Dialog kesiapan guru mempraktikkan inovasi pembelajaran dan strategi diferensiasi baru hasil coaching SAMBUNG pada pertemuan tatap muka berikutnya.
                      </p>

                      {/* Detail Pra-Observasi Perbaikan */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-2">
                        <div>
                          <span className="font-semibold text-slate-600 block">Fokus Peningkatan Pembelajaran:</span>
                          <p className="text-slate-800 font-medium line-clamp-2 mt-0.5">
                            {currentSupervision.praObservasiPerbaikan?.q1_kd_indikator || 'Penerapan diferensiasi proses dan lembar eksplorasi kontekstual berbasis studi kasus riil.'}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                          <div>
                            <span className="text-slate-500 text-[11px]">Metode Baru:</span>
                            <p className="text-slate-800 font-semibold truncate">
                              {currentSupervision.praObservasiPerbaikan?.q2_metode || 'Problem-Based Learning kontekstual'}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[11px]">Kesiapan Guru:</span>
                            <p className="text-slate-800 font-semibold text-emerald-700">
                              Sangat Siap &amp; Tervalidasi
                            </p>
                          </div>
                        </div>

                        <div className="pt-1.5 border-t border-slate-200">
                          <span className="font-bold text-slate-700 block text-[11px]">Catatan Pengawas:</span>
                          <p className="text-slate-600 text-[11px] italic line-clamp-1">
                            &ldquo;{currentSupervision.praObservasiPerbaikan?.supervisorNotes || 'Guru siap mempraktikkan langkah perbaikan dengan rancangan media yang sangat menarik.'}&rdquo;
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">
                        Siklus lanjutan pembelajaran
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveSupervisiModal({ stage: 'pra', mode: 'perbaikan' })}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Isi &amp; Buka Pra-Observasi Perbaikan</span>
                      </button>
                    </div>
                  </div>

                  {/* CARD 3: OBSERVASI KELAS (SETELAH PERBAIKAN) */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <FileSpreadsheet className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                              Data Setelah Perbaikan &bull; Tahap 3
                            </span>
                            <h5 className="text-sm font-bold text-slate-900 mt-0.5">
                              Observasi Kelas Pasca-Perbaikan (Verifikasi Lapangan)
                            </h5>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-base font-extrabold text-emerald-700">
                            {currentSupervision.observasiKelasPerbaikan?.score 
                              ? `${currentSupervision.observasiKelasPerbaikan.score}%`
                              : currentSupervision.observasiKelas?.score 
                              ? `${Math.min(100, currentSupervision.observasiKelas.score + 10)}%`
                              : '95.0%'}
                          </span>
                          <span className="text-[10px] text-emerald-600 block font-semibold">
                            Amat Baik (A) &bull; Meningkat
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600">
                        Pengamatan langsung di ruang kelas tatap muka untuk memverifikasi secara objektif perubahan praktik mengajar dan peningkatan keaktifan murid setelah pendampingan.
                      </p>

                      {/* Detail Observasi Perbaikan */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-2">
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="font-semibold text-slate-600">Perbandingan Skor Observasi:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 line-through text-[11px]">
                              Awal: {currentSupervision.observasiKelas?.score ? `${currentSupervision.observasiKelas.score}%` : '-'}
                            </span>
                            <span className="font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                              Perbaikan: {currentSupervision.observasiKelasPerbaikan?.score 
                                ? `${currentSupervision.observasiKelasPerbaikan.score}%`
                                : currentSupervision.observasiKelas?.score 
                                ? `${Math.min(100, currentSupervision.observasiKelas.score + 10)}%`
                                : '95.0%'}
                            </span>
                          </div>
                        </div>

                        <div>
                          <span className="font-semibold text-slate-600 block mb-0.5">Catatan Pengamat Verifikasi Lapangan:</span>
                          <p className="text-slate-700 text-[11px] bg-white p-2 rounded-lg border border-slate-200 line-clamp-2">
                            {currentSupervision.observasiKelasPerbaikan?.feedbackNotes || 'Perubahan sangat nyata: murid tidak lagi pasif mencatat, melainkan antusias berdiskusi dalam kelompok dan berani mengemukakan argumen kritis.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">
                        Verifikasi praktik kelas
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveSupervisiModal({ stage: 'observasi', mode: 'perbaikan' })}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Isi &amp; Buka Observasi Perbaikan</span>
                      </button>
                    </div>
                  </div>

                  {/* CARD 4: PASCA-OBSERVASI (SETELAH PERBAIKAN) */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                              Data Setelah Perbaikan &bull; Tahap 4
                            </span>
                            <h5 className="text-sm font-bold text-slate-900 mt-0.5">
                              Refleksi &amp; Evaluasi Pasca-Observasi Perbaikan
                            </h5>
                          </div>
                        </div>

                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Selesai Evaluasi
                        </span>
                      </div>

                      <p className="text-xs text-slate-600">
                        Evaluasi komprehensif atas keberhasilan perbaikan pembelajaran, refleksi kepuasan guru, pencapaian murid, dan rekomendasi diseminasi ke komunitas belajar.
                      </p>

                      {/* Detail Pasca-Observasi Perbaikan */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-2">
                        <div>
                          <span className="font-semibold text-slate-600 block">Kesan Guru Terhadap Perubahan:</span>
                          <p className="text-slate-800 font-medium line-clamp-2 mt-0.5">
                            {currentSupervision.pascaObservasiPerbaikan?.q1_kesan || 'Guru merasa jauh lebih percaya diri; murid merespons dengan penuh antusiasme dan tidak ada yang pasif.'}
                          </p>
                        </div>

                        <div>
                          <span className="font-semibold text-slate-600 block">Ketercapaian Tujuan Pembelajaran:</span>
                          <p className="text-slate-800 font-medium line-clamp-1 mt-0.5">
                            {currentSupervision.pascaObservasiPerbaikan?.q5_ketercapaian_tujuan || 'Lebih dari 90% murid mencapai indikator KKTP dan menguasai konsep kontekstual.'}
                          </p>
                        </div>

                        <div className="pt-1.5 border-t border-slate-200">
                          <span className="font-bold text-slate-700 block text-[11px]">Rekomendasi Diseminasi Pengawas:</span>
                          <p className="text-slate-600 text-[11px] italic line-clamp-2">
                            &ldquo;{currentSupervision.pascaObservasiPerbaikan?.recommendations || 'Praktik baik perbaikan ini sangat layak didiseminasikan dalam Komunitas Belajar (Kombel) sekolah dan forum MGMP.'}&rdquo;
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">
                        Evaluasi keberlanjutan
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveSupervisiModal({ stage: 'pasca', mode: 'perbaikan' })}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Isi &amp; Buka Pasca-Observasi Perbaikan</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB U-1 */}
            {uSubTab === 'u1' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Hari &amp; Tanggal:</label>
                    <input
                      type="text"
                      value={sambungDraft.uji.u1_observasi.hariTanggal}
                      onChange={(e) =>
                        setSambungDraft({
                          ...sambungDraft,
                          uji: {
                            ...sambungDraft.uji,
                            u1_observasi: { ...sambungDraft.uji.u1_observasi, hariTanggal: e.target.value },
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Kelas yang Diobservasi:</label>
                    <input
                      type="text"
                      value={sambungDraft.uji.u1_observasi.kelas}
                      onChange={(e) =>
                        setSambungDraft({
                          ...sambungDraft,
                          uji: {
                            ...sambungDraft.uji,
                            u1_observasi: { ...sambungDraft.uji.u1_observasi, kelas: e.target.value },
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Tahap Observasi:</label>
                    <select
                      value={sambungDraft.uji.u1_observasi.tahapObservasi}
                      onChange={(e) =>
                        setSambungDraft({
                          ...sambungDraft,
                          uji: {
                            ...sambungDraft.uji,
                            u1_observasi: {
                              ...sambungDraft.uji.u1_observasi,
                              tahapObservasi: e.target.value as 'awal' | 'siklus' | 'akhir',
                            },
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium text-slate-900"
                    >
                      <option value="awal">Observasi Awal (Baseline)</option>
                      <option value="siklus">Observasi Siklus Pembinaan</option>
                      <option value="akhir">Observasi Akhir (Evaluasi)</option>
                    </select>
                  </div>
                </div>

                {/* Score bar */}
                <div className="p-4 bg-indigo-900 text-white rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs text-indigo-200">Hasil Penilaian Observasi Kelas SAMBUNG</p>
                    <p className="text-xl font-extrabold">
                      {sambungDraft.uji.u1_observasi.totalSkor} / 40{' '}
                      <span className="text-sm font-normal text-indigo-300">
                        ({sambungDraft.uji.u1_observasi.persentaseCapaian.toFixed(1)}%)
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-indigo-200 block uppercase font-bold">Kategori Mutu</span>
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950">
                      {sambungDraft.uji.u1_observasi.persentaseCapaian >= 85
                        ? 'Sangat Berkembang (SB)'
                        : sambungDraft.uji.u1_observasi.persentaseCapaian >= 70
                        ? 'Berkembang (B)'
                        : 'Mulai Berkembang (MB)'}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 italic">
                  Skala: 1 = belum tampak; 2 = mulai berkembang (sebagian kecil murid); 3 = berkembang (sebagian besar murid); 4 = sangat berkembang (murid berinisiatif, terbukti pada karya/ucapan).
                </div>

                {/* 10 Indikator Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-center">
                        <th className="py-2.5 px-2 w-8">No</th>
                        <th className="py-2.5 px-3 text-left">Indikator</th>
                        <th className="py-2.5 px-3 text-left w-36">Dimensi</th>
                        <th className="py-2.5 px-2 w-12">1</th>
                        <th className="py-2.5 px-2 w-12">2</th>
                        <th className="py-2.5 px-2 w-12">3</th>
                        <th className="py-2.5 px-2 w-12">4</th>
                        <th className="py-2.5 px-3 text-left w-64">Catatan Pengamat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sambungDraft.uji.u1_observasi.indikatorList.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="py-2 px-2 text-center font-bold text-slate-500">{item.id}</td>
                          <td className="py-2 px-3 font-medium text-slate-900">{item.indikator}</td>
                          <td className="py-2 px-3 text-indigo-700 font-semibold">{item.dimensi}</td>
                          {[1, 2, 3, 4].map((val) => (
                            <td key={val} className="py-2 px-2 text-center">
                              <input
                                type="radio"
                                name={`ind_${item.id}`}
                                checked={item.score === val}
                                onChange={() => handleU1ScoreChange(item.id, val as 1 | 2 | 3 | 4)}
                                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              />
                            </td>
                          ))}
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={item.catatan}
                              onChange={(e) => {
                                const list = [...sambungDraft.uji.u1_observasi.indikatorList];
                                list[idx].catatan = e.target.value;
                                setSambungDraft({
                                  ...sambungDraft,
                                  uji: {
                                    ...sambungDraft.uji,
                                    u1_observasi: { ...sambungDraft.uji.u1_observasi, indikatorList: list },
                                  },
                                });
                              }}
                              placeholder="Catatan bukti teramati..."
                              className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Apa yang dialami murid?
                    </label>
                    <textarea
                      rows={3}
                      value={sambungDraft.uji.u1_observasi.apaYangDialamiMurid}
                      onChange={(e) =>
                        setSambungDraft({
                          ...sambungDraft,
                          uji: {
                            ...sambungDraft.uji,
                            u1_observasi: { ...sambungDraft.uji.u1_observasi, apaYangDialamiMurid: e.target.value },
                          },
                        })
                      }
                      placeholder="Uraikan pengalaman belajar yang dialami murid..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Kekuatan dan rekomendasi:
                    </label>
                    <textarea
                      rows={3}
                      value={sambungDraft.uji.u1_observasi.kekuatanDanRekomendasi}
                      onChange={(e) =>
                        setSambungDraft({
                          ...sambungDraft,
                          uji: {
                            ...sambungDraft.uji,
                            u1_observasi: { ...sambungDraft.uji.u1_observasi, kekuatanDanRekomendasi: e.target.value },
                          },
                        })
                      }
                      placeholder="Catatan kekuatan pembelajaran dan saran rekomendasi..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB U-2 */}
            {uSubTab === 'u2' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Kode Murid / Kelas:</label>
                    <input
                      type="text"
                      value={sambungDraft.uji.u2_angketMurid.kodeMuridKelas}
                      onChange={(e) =>
                        setSambungDraft({
                          ...sambungDraft,
                          uji: {
                            ...sambungDraft.uji,
                            u2_angketMurid: { ...sambungDraft.uji.u2_angketMurid, kodeMuridKelas: e.target.value },
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Tanggal Pengisian:</label>
                    <input
                      type="date"
                      value={sambungDraft.uji.u2_angketMurid.tanggal}
                      onChange={(e) =>
                        setSambungDraft({
                          ...sambungDraft,
                          uji: {
                            ...sambungDraft.uji,
                            u2_angketMurid: { ...sambungDraft.uji.u2_angketMurid, tanggal: e.target.value },
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Jumlah Murid Responden:</label>
                    <input
                      type="number"
                      value={sambungDraft.uji.u2_angketMurid.jumlahResponden}
                      onChange={(e) =>
                        setSambungDraft({
                          ...sambungDraft,
                          uji: {
                            ...sambungDraft.uji,
                            u2_angketMurid: {
                              ...sambungDraft.uji.u2_angketMurid,
                              jumlahResponden: parseInt(e.target.value) || 0,
                            },
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-bold"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 italic">
                  Skala Likert Murid: 1 = sangat tidak setuju; 2 = tidak setuju; 3 = setuju; 4 = sangat setuju. % setuju = jumlah murid yang memilih 3 atau 4 dibagi jumlah responden &times; 100%.
                </div>

                {/* 5 Pernyataan */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                        <th className="py-2.5 px-3 text-center w-12">No</th>
                        <th className="py-2.5 px-3 text-left">Pernyataan Suara Murid</th>
                        <th className="py-2.5 px-3 text-center w-36">Rata-rata Skor (1-4)</th>
                        <th className="py-2.5 px-3 text-center w-40">% Setuju (Pilihan 3 &amp; 4)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sambungDraft.uji.u2_angketMurid.items.map((item, idx) => (
                        <tr key={item.id}>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-500">{item.id}</td>
                          <td className="py-2.5 px-3 font-medium text-slate-900">{item.pernyataan}</td>
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="number"
                              step="0.1"
                              min="1"
                              max="4"
                              value={item.skorRataRata}
                              onChange={(e) => {
                                const list = [...sambungDraft.uji.u2_angketMurid.items];
                                list[idx].skorRataRata = parseFloat(e.target.value) || 0;
                                setSambungDraft({
                                  ...sambungDraft,
                                  uji: {
                                    ...sambungDraft.uji,
                                    u2_angketMurid: { ...sambungDraft.uji.u2_angketMurid, items: list },
                                  },
                                });
                              }}
                              className="w-20 px-2 py-1 text-center font-bold rounded-lg border border-slate-200 text-xs focus:outline-indigo-600"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="inline-flex items-center gap-1.5">
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={item.persentaseSetuju}
                                onChange={(e) => {
                                  const list = [...sambungDraft.uji.u2_angketMurid.items];
                                  list[idx].persentaseSetuju = parseFloat(e.target.value) || 0;
                                  setSambungDraft({
                                    ...sambungDraft,
                                    uji: {
                                      ...sambungDraft.uji,
                                      u2_angketMurid: { ...sambungDraft.uji.u2_angketMurid, items: list },
                                    },
                                  });
                                }}
                                className="w-20 px-2 py-1 text-center font-bold text-indigo-700 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600"
                              />
                              <span className="font-bold text-slate-500">%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1.5">
                    <label className="block text-xs font-bold text-emerald-950">
                      Hal yang paling bermakna bagi saya adalah &hellip;
                    </label>
                    <textarea
                      rows={3}
                      value={sambungDraft.uji.u2_angketMurid.halPalingBermakna}
                      onChange={(e) =>
                        setSambungDraft({
                          ...sambungDraft,
                          uji: {
                            ...sambungDraft.uji,
                            u2_angketMurid: { ...sambungDraft.uji.u2_angketMurid, halPalingBermakna: e.target.value },
                          },
                        })
                      }
                      placeholder="Kutipan orisinal murid tentang hal yang paling bermakna..."
                      className="w-full px-3 py-2 rounded-lg border border-emerald-300 text-xs focus:outline-indigo-600 bg-white italic"
                    />
                  </div>

                  <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl space-y-1.5">
                    <label className="block text-xs font-bold text-rose-950">
                      Kesulitan saya adalah &hellip;
                    </label>
                    <textarea
                      rows={3}
                      value={sambungDraft.uji.u2_angketMurid.kesulitanMurid}
                      onChange={(e) =>
                        setSambungDraft({
                          ...sambungDraft,
                          uji: {
                            ...sambungDraft.uji,
                            u2_angketMurid: { ...sambungDraft.uji.u2_angketMurid, kesulitanMurid: e.target.value },
                          },
                        })
                      }
                      placeholder="Kutipan kesulitan murid yang perlu diatasi guru..."
                      className="w-full px-3 py-2 rounded-lg border border-rose-300 text-xs focus:outline-indigo-600 bg-white italic"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 4: KESIMPULAN HASIL UJI — MATRIKS PERUBAHAN AFTER */}
            {uSubTab === 'kesimpulan_after' && (
              <div className="space-y-6">
                {/* Banner Penjelasan */}
                <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 border border-purple-800/60 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Kesimpulan Hasil Evaluasi &bull; Dampak Perbaikan SIKLUS SAMBUNG</span>
                      </div>
                      <h4 className="text-base sm:text-lg font-bold text-white">
                        Kesimpulan Hasil Uji Coba: MATRIKS PERUBAHAN AFTER &bull; {currentSupervision.teacherName}
                      </h4>
                      <p className="text-xs text-purple-200/90 max-w-3xl leading-relaxed">
                        Data kesimpulan kondisi setelah perbaikan ini dirumuskan dari hasil telaah modul ajar revisi, pra-observasi lanjutan, observasi kelas tatap muka verifikasi lapangan, angket suara murid (U-2), dan pasca-observasi perbaikan. Menjadi data AFTER pembanding yang otomatis dipaparkan di Tahap Nyatakan.
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 text-xs font-medium">
                      <span className="text-purple-200">Status Siklus:</span>
                      <span className="font-bold text-emerald-300">Hasil Terverifikasi</span>
                    </div>
                  </div>
                </div>

                {/* 4 Cards Matriks Perubahan After */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* CARD 1: PERAN GURU */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                              Aspek 1 &bull; Peran Guru (After)
                            </span>
                            <h5 className="text-sm font-bold text-slate-900 mt-0.5">
                              Fasilitasi &amp; Pengalaman Belajar Murid
                            </h5>
                          </div>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-semibold uppercase bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Setelah SAMBUNG
                        </span>
                      </div>

                      <div className="bg-purple-50/50 p-2.5 rounded-xl border border-purple-100/80 text-[11px] text-purple-900">
                        <strong>Arah Transformasi:</strong> Menuju perancang dan fasilitator pengalaman belajar aktif murid
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">
                          Deskripsi Kondisi Setelah Perbaikan (Peran Guru):
                        </label>
                        <textarea
                          rows={3}
                          value={sambungDraft.uji.matriksAfter?.peranGuru || DEFAULT_MATRIKS_AFTER.peranGuru}
                          onChange={(e) => {
                            const val = e.target.value;
                            const cur = sambungDraft.uji.matriksAfter || { ...DEFAULT_MATRIKS_AFTER };
                            const updatedMatriks = { ...cur, peranGuru: val };
                            setSambungDraft({
                              ...sambungDraft,
                              uji: { ...sambungDraft.uji, matriksAfter: updatedMatriks },
                              nyatakan: {
                                ...sambungDraft.nyatakan,
                                beforeAfter: sambungDraft.nyatakan.beforeAfter.map(item =>
                                  item.aspek.toLowerCase().includes('peran') ? { ...item, setelahSambung: val } : item
                                ),
                              },
                            });
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600 bg-white"
                          placeholder="Jelaskan peran guru setelah adanya pendampingan SAMBUNG..."
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100 italic">
                      *Otomatis disinkronkan ke kolom AFTER Tahap Nyatakan.
                    </p>
                  </div>

                  {/* CARD 2: AKTIVITAS MURID */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                              Aspek 2 &bull; Aktivitas Murid (After)
                            </span>
                            <h5 className="text-sm font-bold text-slate-900 mt-0.5">
                              Aplikasi Pengetahuan &amp; Kolaborasi Nyata
                            </h5>
                          </div>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-semibold uppercase bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Setelah SAMBUNG
                        </span>
                      </div>

                      <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/80 text-[11px] text-emerald-900">
                        <strong>Arah Transformasi:</strong> Menuju lebih aktif mengaplikasikan pengetahuan secara kontekstual
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">
                          Deskripsi Kondisi Setelah Perbaikan (Aktivitas Murid):
                        </label>
                        <textarea
                          rows={3}
                          value={sambungDraft.uji.matriksAfter?.aktivitasMurid || DEFAULT_MATRIKS_AFTER.aktivitasMurid}
                          onChange={(e) => {
                            const val = e.target.value;
                            const cur = sambungDraft.uji.matriksAfter || { ...DEFAULT_MATRIKS_AFTER };
                            const updatedMatriks = { ...cur, aktivitasMurid: val };
                            setSambungDraft({
                              ...sambungDraft,
                              uji: { ...sambungDraft.uji, matriksAfter: updatedMatriks },
                              nyatakan: {
                                ...sambungDraft.nyatakan,
                                beforeAfter: sambungDraft.nyatakan.beforeAfter.map(item =>
                                  item.aspek.toLowerCase().includes('aktivitas') ? { ...item, setelahSambung: val } : item
                                ),
                              },
                            });
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600 bg-white"
                          placeholder="Jelaskan aktivitas murid setelah adanya perbaikan..."
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100 italic">
                      *Otomatis disinkronkan ke kolom AFTER Tahap Nyatakan.
                    </p>
                  </div>

                  {/* CARD 3: KONTEKS KEHIDUPAN NYATA */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                            <Compass className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                              Aspek 3 &bull; Konteks Nyata (After)
                            </span>
                            <h5 className="text-sm font-bold text-slate-900 mt-0.5">
                              Desain Pembelajaran Relevan Dunia Nyata
                            </h5>
                          </div>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-semibold uppercase bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Setelah SAMBUNG
                        </span>
                      </div>

                      <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/80 text-[11px] text-amber-900">
                        <strong>Arah Transformasi:</strong> Menuju mulai dirancang secara terstruktur dalam pembelajaran
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">
                          Deskripsi Kondisi Setelah Perbaikan (Konteks Nyata):
                        </label>
                        <textarea
                          rows={3}
                          value={sambungDraft.uji.matriksAfter?.konteksNyata || DEFAULT_MATRIKS_AFTER.konteksNyata}
                          onChange={(e) => {
                            const val = e.target.value;
                            const cur = sambungDraft.uji.matriksAfter || { ...DEFAULT_MATRIKS_AFTER };
                            const updatedMatriks = { ...cur, konteksNyata: val };
                            setSambungDraft({
                              ...sambungDraft,
                              uji: { ...sambungDraft.uji, matriksAfter: updatedMatriks },
                              nyatakan: {
                                ...sambungDraft.nyatakan,
                                beforeAfter: sambungDraft.nyatakan.beforeAfter.map(item =>
                                  item.aspek.toLowerCase().includes('konteks') ? { ...item, setelahSambung: val } : item
                                ),
                              },
                            });
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600 bg-white"
                          placeholder="Jelaskan keterhubungan konteks nyata setelah perbaikan..."
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100 italic">
                      *Otomatis disinkronkan ke kolom AFTER Tahap Nyatakan.
                    </p>
                  </div>

                  {/* CARD 4: REFLEKSI MURID */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                              Aspek 4 &bull; Refleksi Murid (After)
                            </span>
                            <h5 className="text-sm font-bold text-slate-900 mt-0.5">
                              Budaya Refleksi Metakognitif Murid
                            </h5>
                          </div>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-semibold uppercase bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Setelah SAMBUNG
                        </span>
                      </div>

                      <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/80 text-[11px] text-blue-900">
                        <strong>Arah Transformasi:</strong> Menuju mulai menjadi bagian rutin dan terintegrasi dalam pembelajaran
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">
                          Deskripsi Kondisi Setelah Perbaikan (Refleksi Murid):
                        </label>
                        <textarea
                          rows={3}
                          value={sambungDraft.uji.matriksAfter?.refleksiMurid || DEFAULT_MATRIKS_AFTER.refleksiMurid}
                          onChange={(e) => {
                            const val = e.target.value;
                            const cur = sambungDraft.uji.matriksAfter || { ...DEFAULT_MATRIKS_AFTER };
                            const updatedMatriks = { ...cur, refleksiMurid: val };
                            setSambungDraft({
                              ...sambungDraft,
                              uji: { ...sambungDraft.uji, matriksAfter: updatedMatriks },
                              nyatakan: {
                                ...sambungDraft.nyatakan,
                                beforeAfter: sambungDraft.nyatakan.beforeAfter.map(item =>
                                  item.aspek.toLowerCase().includes('refleksi') ? { ...item, setelahSambung: val } : item
                                ),
                              },
                            });
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600 bg-white"
                          placeholder="Jelaskan pembiasaan refleksi murid setelah perbaikan..."
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100 italic">
                      *Otomatis disinkronkan ke kolom AFTER Tahap Nyatakan.
                    </p>
                  </div>
                </div>

                {/* Table Preview After */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-4 h-4 text-purple-600" />
                      <span>Ringkasan Tabel Matriks Perubahan After (Hasil Uji Coba)</span>
                    </h5>
                    <button
                      type="button"
                      onClick={() => {
                        const cur = { ...DEFAULT_MATRIKS_AFTER };
                        setSambungDraft({
                          ...sambungDraft,
                          uji: { ...sambungDraft.uji, matriksAfter: cur },
                          nyatakan: {
                            ...sambungDraft.nyatakan,
                            beforeAfter: sambungDraft.nyatakan.beforeAfter.map(item => {
                              if (item.aspek.toLowerCase().includes('peran')) return { ...item, setelahSambung: cur.peranGuru };
                              if (item.aspek.toLowerCase().includes('aktivitas')) return { ...item, setelahSambung: cur.aktivitasMurid };
                              if (item.aspek.toLowerCase().includes('konteks')) return { ...item, setelahSambung: cur.konteksNyata };
                              if (item.aspek.toLowerCase().includes('refleksi')) return { ...item, setelahSambung: cur.refleksiMurid };
                              return item;
                            }),
                          },
                        });
                        setSaveToast('Template standar kesimpulan hasil uji berhasil dipulihkan!');
                        setTimeout(() => setSaveToast(null), 3000);
                      }}
                      className="text-[11px] text-purple-600 hover:text-purple-800 font-semibold underline"
                    >
                      Pulihkan Deskripsi Standar
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs bg-white rounded-xl border border-slate-200 overflow-hidden">
                      <thead className="bg-slate-100/70 text-slate-700 font-bold uppercase text-[11px] border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3 w-48">Aspek Perubahan</th>
                          <th className="py-2.5 px-3">Deskripsi Kondisi Setelah Perbaikan (After)</th>
                          <th className="py-2.5 px-3 w-40 text-center">Status Pembuktian</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="py-2.5 px-3 font-bold text-slate-900 bg-slate-50/50">Peran guru</td>
                          <td className="py-2.5 px-3 text-slate-700">{sambungDraft.uji.matriksAfter?.peranGuru || DEFAULT_MATRIKS_AFTER.peranGuru}</td>
                          <td className="py-2.5 px-3 text-center text-emerald-700 font-semibold bg-emerald-50/30 text-[11px]">Terverifikasi Uji</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-bold text-slate-900 bg-slate-50/50">Aktivitas murid</td>
                          <td className="py-2.5 px-3 text-slate-700">{sambungDraft.uji.matriksAfter?.aktivitasMurid || DEFAULT_MATRIKS_AFTER.aktivitasMurid}</td>
                          <td className="py-2.5 px-3 text-center text-emerald-700 font-semibold bg-emerald-50/30 text-[11px]">Terverifikasi Uji</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-bold text-slate-900 bg-slate-50/50">Konteks nyata</td>
                          <td className="py-2.5 px-3 text-slate-700">{sambungDraft.uji.matriksAfter?.konteksNyata || DEFAULT_MATRIKS_AFTER.konteksNyata}</td>
                          <td className="py-2.5 px-3 text-center text-emerald-700 font-semibold bg-emerald-50/30 text-[11px]">Terverifikasi Uji</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-bold text-slate-900 bg-slate-50/50">Refleksi</td>
                          <td className="py-2.5 px-3 text-slate-700">{sambungDraft.uji.matriksAfter?.refleksiMurid || DEFAULT_MATRIKS_AFTER.refleksiMurid}</td>
                          <td className="py-2.5 px-3 text-center text-emerald-700 font-semibold bg-emerald-50/30 text-[11px]">Terverifikasi Uji</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB N: NYATAKAN — BEFORE-AFTER & DATA DAMPAK */}
        {/* ==================================================== */}
        {activeTab === 'N' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-rose-100 text-rose-800 text-xs font-bold mb-1">
                TAHAP N &bull; NYATAKAN
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Before&ndash;After dan Data Dampak
              </h3>
              <p className="text-xs text-slate-500">
                Setiap perubahan harus disertai bukti konkret dari pembelajaran guru {currentSupervision.teacherName}.
              </p>
            </div>

            {/* 1. Matriks Perubahan Before - After */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-rose-600" />
                    <span>1. Matriks Perubahan Before &ndash; After (Data Deskripsi Kesimpulan Guru)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Otomatis terhubung dengan kesimpulan Tahap Selidiki (Before) dan Tahap Uji (After) untuk {currentSupervision.teacherName}.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setShowAllTeachersModal(true)}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Dashboard Kesimpulan Semua Guru</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const before = sambungDraft.selidiki.matriksBefore || { ...DEFAULT_MATRIKS_BEFORE };
                      const after = sambungDraft.uji.matriksAfter || { ...DEFAULT_MATRIKS_AFTER };
                      setSambungDraft({
                        ...sambungDraft,
                        selidiki: { ...sambungDraft.selidiki, matriksBefore: before },
                        uji: { ...sambungDraft.uji, matriksAfter: after },
                        nyatakan: {
                          ...sambungDraft.nyatakan,
                          beforeAfter: [
                            { aspek: 'Peran guru', sebelumSambung: before.peranGuru, setelahSambung: after.peranGuru },
                            { aspek: 'Aktivitas murid', sebelumSambung: before.aktivitasMurid, setelahSambung: after.aktivitasMurid },
                            { aspek: 'Konteks kehidupan nyata', sebelumSambung: before.konteksNyata, setelahSambung: after.konteksNyata },
                            { aspek: 'Refleksi murid', sebelumSambung: before.refleksiMurid, setelahSambung: after.refleksiMurid },
                          ],
                        },
                      });
                      setSaveToast('Data deskripsi Before-After berhasil disinkronkan dari Selidiki & Uji!');
                      setTimeout(() => setSaveToast(null), 3000);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sinkronkan Ulang dari Selidiki &amp; Uji</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse rounded-2xl overflow-hidden border border-slate-200 bg-white">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px]">
                      <th className="py-3 px-3.5 text-left w-48">Aspek Perubahan</th>
                      <th className="py-3 px-3.5 text-left">Sebelum SAMBUNG (Kesimpulan Selidiki)</th>
                      <th className="py-3 px-3.5 text-left">Setelah SAMBUNG (Kesimpulan Uji)</th>
                      <th className="py-3 px-3.5 text-left w-64">Arah Transformasi yang Terlihat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* Row 1: Peran Guru */}
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-3 px-3.5 font-bold text-slate-900 align-top bg-slate-50/60">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>Peran guru</span>
                        </div>
                      </td>
                      <td className="py-3 px-3.5 align-top">
                        <textarea
                          rows={3}
                          value={sambungDraft.selidiki.matriksBefore?.peranGuru || DEFAULT_MATRIKS_BEFORE.peranGuru}
                          onChange={(e) => {
                            const val = e.target.value;
                            const curBefore = sambungDraft.selidiki.matriksBefore || { ...DEFAULT_MATRIKS_BEFORE };
                            setSambungDraft({
                              ...sambungDraft,
                              selidiki: { ...sambungDraft.selidiki, matriksBefore: { ...curBefore, peranGuru: val } },
                              nyatakan: {
                                ...sambungDraft.nyatakan,
                                beforeAfter: sambungDraft.nyatakan.beforeAfter.map(item =>
                                  item.aspek.toLowerCase().includes('peran') ? { ...item, sebelumSambung: val } : item
                                ),
                              },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600 bg-slate-50/30"
                          placeholder="Deskripsi kondisi awal peran guru..."
                        />
                      </td>
                      <td className="py-3 px-3.5 align-top">
                        <textarea
                          rows={3}
                          value={sambungDraft.uji.matriksAfter?.peranGuru || DEFAULT_MATRIKS_AFTER.peranGuru}
                          onChange={(e) => {
                            const val = e.target.value;
                            const curAfter = sambungDraft.uji.matriksAfter || { ...DEFAULT_MATRIKS_AFTER };
                            setSambungDraft({
                              ...sambungDraft,
                              uji: { ...sambungDraft.uji, matriksAfter: { ...curAfter, peranGuru: val } },
                              nyatakan: {
                                ...sambungDraft.nyatakan,
                                beforeAfter: sambungDraft.nyatakan.beforeAfter.map(item =>
                                  item.aspek.toLowerCase().includes('peran') ? { ...item, setelahSambung: val } : item
                                ),
                              },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-purple-200 text-xs focus:outline-indigo-600 bg-purple-50/20 font-medium text-slate-900"
                          placeholder="Deskripsi kondisi setelah perbaikan peran guru..."
                        />
                      </td>
                      <td className="py-3 px-3.5 align-top bg-indigo-50/30">
                        <span className="font-semibold text-indigo-900 block leading-snug">
                          Dari berfokus pada penyampaian materi menuju pengalaman belajar murid
                        </span>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Guru beralih dari ceramah satu arah menjadi coach inkuiri dan fasilitator.
                        </p>
                      </td>
                    </tr>

                    {/* Row 2: Aktivitas Murid */}
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-3 px-3.5 font-bold text-slate-900 align-top bg-slate-50/60">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span>Aktivitas murid</span>
                        </div>
                      </td>
                      <td className="py-3 px-3.5 align-top">
                        <textarea
                          rows={3}
                          value={sambungDraft.selidiki.matriksBefore?.aktivitasMurid || DEFAULT_MATRIKS_BEFORE.aktivitasMurid}
                          onChange={(e) => {
                            const val = e.target.value;
                            const curBefore = sambungDraft.selidiki.matriksBefore || { ...DEFAULT_MATRIKS_BEFORE };
                            setSambungDraft({
                              ...sambungDraft,
                              selidiki: { ...sambungDraft.selidiki, matriksBefore: { ...curBefore, aktivitasMurid: val } },
                              nyatakan: {
                                ...sambungDraft.nyatakan,
                                beforeAfter: sambungDraft.nyatakan.beforeAfter.map(item =>
                                  item.aspek.toLowerCase().includes('aktivitas') ? { ...item, sebelumSambung: val } : item
                                ),
                              },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600 bg-slate-50/30"
                          placeholder="Deskripsi kondisi awal aktivitas murid..."
                        />
                      </td>
                      <td className="py-3 px-3.5 align-top">
                        <textarea
                          rows={3}
                          value={sambungDraft.uji.matriksAfter?.aktivitasMurid || DEFAULT_MATRIKS_AFTER.aktivitasMurid}
                          onChange={(e) => {
                            const val = e.target.value;
                            const curAfter = sambungDraft.uji.matriksAfter || { ...DEFAULT_MATRIKS_AFTER };
                            setSambungDraft({
                              ...sambungDraft,
                              uji: { ...sambungDraft.uji, matriksAfter: { ...curAfter, aktivitasMurid: val } },
                              nyatakan: {
                                ...sambungDraft.nyatakan,
                                beforeAfter: sambungDraft.nyatakan.beforeAfter.map(item =>
                                  item.aspek.toLowerCase().includes('aktivitas') ? { ...item, setelahSambung: val } : item
                                ),
                              },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-purple-200 text-xs focus:outline-indigo-600 bg-purple-50/20 font-medium text-slate-900"
                          placeholder="Deskripsi kondisi setelah perbaikan aktivitas murid..."
                        />
                      </td>
                      <td className="py-3 px-3.5 align-top bg-purple-50/30">
                        <span className="font-semibold text-purple-900 block leading-snug">
                          Dari lebih banyak menerima menjadi lebih aktif mengaplikasikan pengetahuan
                        </span>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Murid terlibat aktif dalam eksplorasi mandiri, diskusi kelompok, dan simulasi nyata.
                        </p>
                      </td>
                    </tr>

                    {/* Row 3: Konteks Kehidupan Nyata */}
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-3 px-3.5 font-bold text-slate-900 align-top bg-slate-50/60">
                        <div className="flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Konteks nyata</span>
                        </div>
                      </td>
                      <td className="py-3 px-3.5 align-top">
                        <textarea
                          rows={3}
                          value={sambungDraft.selidiki.matriksBefore?.konteksNyata || DEFAULT_MATRIKS_BEFORE.konteksNyata}
                          onChange={(e) => {
                            const val = e.target.value;
                            const curBefore = sambungDraft.selidiki.matriksBefore || { ...DEFAULT_MATRIKS_BEFORE };
                            setSambungDraft({
                              ...sambungDraft,
                              selidiki: { ...sambungDraft.selidiki, matriksBefore: { ...curBefore, konteksNyata: val } },
                              nyatakan: {
                                ...sambungDraft.nyatakan,
                                beforeAfter: sambungDraft.nyatakan.beforeAfter.map(item =>
                                  item.aspek.toLowerCase().includes('konteks') ? { ...item, sebelumSambung: val } : item
                                ),
                              },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600 bg-slate-50/30"
                          placeholder="Deskripsi kondisi awal konteks nyata..."
                        />
                      </td>
                      <td className="py-3 px-3.5 align-top">
                        <textarea
                          rows={3}
                          value={sambungDraft.uji.matriksAfter?.konteksNyata || DEFAULT_MATRIKS_AFTER.konteksNyata}
                          onChange={(e) => {
                            const val = e.target.value;
                            const curAfter = sambungDraft.uji.matriksAfter || { ...DEFAULT_MATRIKS_AFTER };
                            setSambungDraft({
                              ...sambungDraft,
                              uji: { ...sambungDraft.uji, matriksAfter: { ...curAfter, konteksNyata: val } },
                              nyatakan: {
                                ...sambungDraft.nyatakan,
                                beforeAfter: sambungDraft.nyatakan.beforeAfter.map(item =>
                                  item.aspek.toLowerCase().includes('konteks') ? { ...item, setelahSambung: val } : item
                                ),
                              },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-purple-200 text-xs focus:outline-indigo-600 bg-purple-50/20 font-medium text-slate-900"
                          placeholder="Deskripsi kondisi setelah perbaikan konteks nyata..."
                        />
                      </td>
                      <td className="py-3 px-3.5 align-top bg-amber-50/30">
                        <span className="font-semibold text-amber-900 block leading-snug">
                          Dari belum konsisten menjadi mulai dirancang dalam pembelajaran
                        </span>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Materi dihubungkan langsung dengan studi kasus nyata, isu lingkungan, dan kehidupan sehari-hari.
                        </p>
                      </td>
                    </tr>

                    {/* Row 4: Refleksi Murid */}
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-3 px-3.5 font-bold text-slate-900 align-top bg-slate-50/60">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>Refleksi</span>
                        </div>
                      </td>
                      <td className="py-3 px-3.5 align-top">
                        <textarea
                          rows={3}
                          value={sambungDraft.selidiki.matriksBefore?.refleksiMurid || DEFAULT_MATRIKS_BEFORE.refleksiMurid}
                          onChange={(e) => {
                            const val = e.target.value;
                            const curBefore = sambungDraft.selidiki.matriksBefore || { ...DEFAULT_MATRIKS_BEFORE };
                            setSambungDraft({
                              ...sambungDraft,
                              selidiki: { ...sambungDraft.selidiki, matriksBefore: { ...curBefore, refleksiMurid: val } },
                              nyatakan: {
                                ...sambungDraft.nyatakan,
                                beforeAfter: sambungDraft.nyatakan.beforeAfter.map(item =>
                                  item.aspek.toLowerCase().includes('refleksi') ? { ...item, sebelumSambung: val } : item
                                ),
                              },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600 bg-slate-50/30"
                          placeholder="Deskripsi kondisi awal refleksi murid..."
                        />
                      </td>
                      <td className="py-3 px-3.5 align-top">
                        <textarea
                          rows={3}
                          value={sambungDraft.uji.matriksAfter?.refleksiMurid || DEFAULT_MATRIKS_AFTER.refleksiMurid}
                          onChange={(e) => {
                            const val = e.target.value;
                            const curAfter = sambungDraft.uji.matriksAfter || { ...DEFAULT_MATRIKS_AFTER };
                            setSambungDraft({
                              ...sambungDraft,
                              uji: { ...sambungDraft.uji, matriksAfter: { ...curAfter, refleksiMurid: val } },
                              nyatakan: {
                                ...sambungDraft.nyatakan,
                                beforeAfter: sambungDraft.nyatakan.beforeAfter.map(item =>
                                  item.aspek.toLowerCase().includes('refleksi') ? { ...item, setelahSambung: val } : item
                                ),
                              },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-purple-200 text-xs focus:outline-indigo-600 bg-purple-50/20 font-medium text-slate-900"
                          placeholder="Deskripsi kondisi setelah perbaikan refleksi murid..."
                        />
                      </td>
                      <td className="py-3 px-3.5 align-top bg-blue-50/30">
                        <span className="font-semibold text-blue-900 block leading-snug">
                          Dari belum rutin menjadi mulai menjadi bagian pembelajaran
                        </span>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Refleksi terbimbing 10-15 menit di setiap sesi melatih kemandirian dan kesadaran proses belajar murid.
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. Data Dampak Table (Sesuai File / Gambar yang Diunggah) */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>2. Data Dampak Pembelajaran Murid (Indikator Kuantitatif &amp; Makna)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Tabel rekapitulasi data awal vs setelah SAMBUNG beserta makna perubahannya.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSambungDraft({
                      ...sambungDraft,
                      nyatakan: {
                        ...sambungDraft.nyatakan,
                        dataDampak: DEFAULT_DATA_DAMPAK.map(d => ({ ...d })),
                      },
                    });
                    setSaveToast('Indikator standar data dampak berhasil dipulihkan!');
                    setTimeout(() => setSaveToast(null), 3000);
                  }}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline text-left sm:text-right"
                >
                  Pulihkan 4 Indikator Standar
                </button>
              </div>

              {/* TABEL DATA DAMPAK SESUAI FORMAT GAMBAR (IMAGE.PNG) */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-3 px-4 text-left font-bold text-slate-800 text-xs">Indikator</th>
                      <th className="py-3 px-4 text-center w-36 font-bold text-slate-800 text-xs">Awal</th>
                      <th className="py-3 px-4 text-center w-44 font-bold text-slate-800 text-xs">Setelah SAMBUNG</th>
                      <th className="py-3 px-4 text-left font-bold text-slate-800 text-xs">Makna</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sambungDraft.nyatakan.dataDampak.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 align-middle">
                          <input
                            type="text"
                            value={row.indikator}
                            onChange={(e) => {
                              const list = [...sambungDraft.nyatakan.dataDampak];
                              list[idx].indikator = e.target.value;
                              setSambungDraft({
                                ...sambungDraft,
                                nyatakan: { ...sambungDraft.nyatakan, dataDampak: list },
                              });
                            }}
                            className="w-full px-2 py-1 rounded-lg border border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-hidden text-xs bg-transparent font-bold text-slate-800"
                          />
                        </td>
                        <td className="py-3.5 px-4 text-center align-middle">
                          <div className="inline-block px-4 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 text-xs shadow-2xs">
                            <input
                              type="text"
                              value={row.awal}
                              onChange={(e) => {
                                const list = [...sambungDraft.nyatakan.dataDampak];
                                list[idx].awal = e.target.value;
                                setSambungDraft({
                                  ...sambungDraft,
                                  nyatakan: { ...sambungDraft.nyatakan, dataDampak: list },
                                });
                              }}
                              className="w-14 text-center font-bold text-slate-800 focus:outline-none bg-transparent"
                            />
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center align-middle">
                          <div className="inline-block px-4 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50/60 font-bold text-emerald-700 text-xs shadow-2xs">
                            <input
                              type="text"
                              value={row.akhir}
                              onChange={(e) => {
                                const list = [...sambungDraft.nyatakan.dataDampak];
                                list[idx].akhir = e.target.value;
                                setSambungDraft({
                                  ...sambungDraft,
                                  nyatakan: { ...sambungDraft.nyatakan, dataDampak: list },
                                });
                              }}
                              className="w-14 text-center font-bold text-emerald-700 focus:outline-none bg-transparent"
                            />
                          </div>
                        </td>
                        <td className="py-3.5 px-4 align-middle">
                          <div className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700">
                            <input
                              type="text"
                              value={row.makna || ''}
                              onChange={(e) => {
                                const list = [...sambungDraft.nyatakan.dataDampak];
                                list[idx].makna = e.target.value;
                                setSambungDraft({
                                  ...sambungDraft,
                                  nyatakan: { ...sambungDraft.nyatakan, dataDampak: list },
                                });
                              }}
                              placeholder="Makna perubahan..."
                              className="w-full text-xs text-slate-700 focus:outline-none bg-transparent"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-slate-400 italic mt-1">
                *Tabel di atas mengadaptasi format indikator dampak dan proporsi keberhasilan implementasi Siklus SAMBUNG.
              </p>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB G: GERAKKAN — TINDAK LANJUT & PENGIMBASAN */}
        {/* ==================================================== */}
        {activeTab === 'G' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-cyan-100 text-cyan-800 text-xs font-bold mb-1">
                TAHAP G &bull; GERAKKAN
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Tindak Lanjut dan Pengimbasan
              </h3>
              <p className="text-xs text-slate-500">
                Hasil supervisi tidak berhenti sebagai catatan. Diwujudkan dalam rencana tindak lanjut dan pengimbasan praktik baik.
              </p>
            </div>

            {/* 1. Tabel Tindak Lanjut */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  1. Rencana Tindak Lanjut Temuan Supervisi
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    const newList = [
                      ...sambungDraft.gerakkan.tindakLanjut,
                      {
                        id: Date.now(),
                        temuanSupervisi: '',
                        tindakLanjut: '',
                        penanggungJawab: currentSupervision.teacherName,
                        waktu: '1 Minggu ke depan',
                        hasil: '',
                      },
                    ];
                    setSambungDraft({
                      ...sambungDraft,
                      gerakkan: { ...sambungDraft.gerakkan, tindakLanjut: newList },
                    });
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Tindak Lanjut</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-2.5 px-3 text-center w-12">No</th>
                      <th className="py-2.5 px-3 text-left">Temuan Supervisi</th>
                      <th className="py-2.5 px-3 text-left">Tindak Lanjut</th>
                      <th className="py-2.5 px-3 text-left w-40">Penanggung Jawab</th>
                      <th className="py-2.5 px-3 text-left w-32">Waktu</th>
                      <th className="py-2.5 px-3 text-left w-48">Hasil</th>
                      <th className="py-2.5 px-3 text-center w-12">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sambungDraft.gerakkan.tindakLanjut.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td className="py-2 px-3 text-center font-bold text-slate-500">{idx + 1}</td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.temuanSupervisi}
                            onChange={(e) => {
                              const list = [...sambungDraft.gerakkan.tindakLanjut];
                              list[idx].temuanSupervisi = e.target.value;
                              setSambungDraft({
                                ...sambungDraft,
                                gerakkan: { ...sambungDraft.gerakkan, tindakLanjut: list },
                              });
                            }}
                            placeholder="Catatan temuan..."
                            className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.tindakLanjut}
                            onChange={(e) => {
                              const list = [...sambungDraft.gerakkan.tindakLanjut];
                              list[idx].tindakLanjut = e.target.value;
                              setSambungDraft({
                                ...sambungDraft,
                                gerakkan: { ...sambungDraft.gerakkan, tindakLanjut: list },
                              });
                            }}
                            placeholder="Aksi tindak lanjut..."
                            className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.penanggungJawab}
                            onChange={(e) => {
                              const list = [...sambungDraft.gerakkan.tindakLanjut];
                              list[idx].penanggungJawab = e.target.value;
                              setSambungDraft({
                                ...sambungDraft,
                                gerakkan: { ...sambungDraft.gerakkan, tindakLanjut: list },
                              });
                            }}
                            className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.waktu}
                            onChange={(e) => {
                              const list = [...sambungDraft.gerakkan.tindakLanjut];
                              list[idx].waktu = e.target.value;
                              setSambungDraft({
                                ...sambungDraft,
                                gerakkan: { ...sambungDraft.gerakkan, tindakLanjut: list },
                              });
                            }}
                            className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.hasil}
                            onChange={(e) => {
                              const list = [...sambungDraft.gerakkan.tindakLanjut];
                              list[idx].hasil = e.target.value;
                              setSambungDraft({
                                ...sambungDraft,
                                gerakkan: { ...sambungDraft.gerakkan, tindakLanjut: list },
                              });
                            }}
                            placeholder="Hasil perbaikan..."
                            className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-900"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          {sambungDraft.gerakkan.tindakLanjut.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const list = sambungDraft.gerakkan.tindakLanjut.filter((_, i) => i !== idx);
                                setSambungDraft({
                                  ...sambungDraft,
                                  gerakkan: { ...sambungDraft.gerakkan, tindakLanjut: list },
                                });
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. Tabel Diseminasi & Pengimbasan */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  2. Diseminasi &amp; Pengimbasan Praktik Baik
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    const newList = [
                      ...sambungDraft.gerakkan.pengimbasan,
                      {
                        id: Date.now(),
                        praktikBaik: '',
                        sasaran: 'Komunitas Belajar (Kombel)',
                        bentuk: 'Berbagi Praktik Baik',
                        waktu: 'Bulan Depan',
                      },
                    ];
                    setSambungDraft({
                      ...sambungDraft,
                      gerakkan: { ...sambungDraft.gerakkan, pengimbasan: newList },
                    });
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Pengimbasan</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-2.5 px-3 text-left">Praktik Baik yang Diimbaskan</th>
                      <th className="py-2.5 px-3 text-left w-56">Sasaran</th>
                      <th className="py-2.5 px-3 text-left w-52">Bentuk (MGMP, Berbagi, Publikasi)</th>
                      <th className="py-2.5 px-3 text-left w-36">Waktu</th>
                      <th className="py-2.5 px-3 text-center w-12">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sambungDraft.gerakkan.pengimbasan.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.praktikBaik}
                            onChange={(e) => {
                              const list = [...sambungDraft.gerakkan.pengimbasan];
                              list[idx].praktikBaik = e.target.value;
                              setSambungDraft({
                                ...sambungDraft,
                                gerakkan: { ...sambungDraft.gerakkan, pengimbasan: list },
                              });
                            }}
                            placeholder="Judul / topik praktik baik..."
                            className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-900"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.sasaran}
                            onChange={(e) => {
                              const list = [...sambungDraft.gerakkan.pengimbasan];
                              list[idx].sasaran = e.target.value;
                              setSambungDraft({
                                ...sambungDraft,
                                gerakkan: { ...sambungDraft.gerakkan, pengimbasan: list },
                              });
                            }}
                            placeholder="Sasaran pengimbasan..."
                            className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.bentuk}
                            onChange={(e) => {
                              const list = [...sambungDraft.gerakkan.pengimbasan];
                              list[idx].bentuk = e.target.value;
                              setSambungDraft({
                                ...sambungDraft,
                                gerakkan: { ...sambungDraft.gerakkan, pengimbasan: list },
                              });
                            }}
                            placeholder="Contoh: MGMP, Webinar PMM"
                            className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.waktu}
                            onChange={(e) => {
                              const list = [...sambungDraft.gerakkan.pengimbasan];
                              list[idx].waktu = e.target.value;
                              setSambungDraft({
                                ...sambungDraft,
                                gerakkan: { ...sambungDraft.gerakkan, pengimbasan: list },
                              });
                            }}
                            className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          {sambungDraft.gerakkan.pengimbasan.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const list = sambungDraft.gerakkan.pengimbasan.filter((_, i) => i !== idx);
                                setSambungDraft({
                                  ...sambungDraft,
                                  gerakkan: { ...sambungDraft.gerakkan, pengimbasan: list },
                                });
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Floating/Fixed Bar for Actions */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2 text-xs">
          <FileCheck2 className="w-4 h-4 text-emerald-400" />
          <span>
            Portofolio SAMBUNG Aktif:{' '}
            <strong className="text-white">{currentSupervision.teacherName}</strong> ({currentSupervision.subject})
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-300" />
            <span>Cetak Dokumen</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Data SAMBUNG'}</span>
          </button>
        </div>
      </div>

      {/* PRINT MODAL */}
      <SambungPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        supervision={{
          ...currentSupervision,
          sambung: sambungDraft,
        }}
      />

      {/* ACADEMIC SUPERVISION MODALS (AWAL & PERBAIKAN) */}
      {activeSupervisiModal?.stage === 'perangkat' && (
        <PerangkatAjarModal
          isOpen={true}
          onClose={() => setActiveSupervisiModal(null)}
          supervision={currentSupervision}
          currentUser={currentUser}
          mode={activeSupervisiModal.mode}
          onSaved={(updated) => {
            onUpdateSupervision(updated);
            setActiveSupervisiModal(null);
            setSaveToast(`Data telaah & evaluasi modul ajar (${activeSupervisiModal.mode === 'perbaikan' ? 'setelah perbaikan' : 'data awal'}) berhasil disimpan!`);
            setTimeout(() => setSaveToast(null), 3000);
          }}
        />
      )}

      {activeSupervisiModal?.stage === 'pra' && (
        <PraObservasiModal
          isOpen={true}
          onClose={() => setActiveSupervisiModal(null)}
          supervision={currentSupervision}
          currentUser={currentUser}
          mode={activeSupervisiModal.mode}
          onSaved={(updated) => {
            onUpdateSupervision(updated);
            setActiveSupervisiModal(null);
            setSaveToast(`Data wawancara pra-observasi (${activeSupervisiModal.mode === 'perbaikan' ? 'setelah perbaikan' : 'data awal'}) berhasil disimpan!`);
            setTimeout(() => setSaveToast(null), 3000);
          }}
        />
      )}

      {activeSupervisiModal?.stage === 'observasi' && (
        <ObservasiKelasModal
          isOpen={true}
          onClose={() => setActiveSupervisiModal(null)}
          supervision={currentSupervision}
          currentUser={currentUser}
          mode={activeSupervisiModal.mode}
          onSaved={(updated) => {
            onUpdateSupervision(updated);
            setActiveSupervisiModal(null);
            setSaveToast(`Data observasi kelas (${activeSupervisiModal.mode === 'perbaikan' ? 'setelah perbaikan' : 'data awal'}) berhasil disimpan!`);
            setTimeout(() => setSaveToast(null), 3000);
          }}
        />
      )}

      {activeSupervisiModal?.stage === 'pasca' && (
        <PascaObservasiModal
          isOpen={true}
          onClose={() => setActiveSupervisiModal(null)}
          supervision={currentSupervision}
          currentUser={currentUser}
          mode={activeSupervisiModal.mode}
          onSaved={(updated) => {
            onUpdateSupervision(updated);
            setActiveSupervisiModal(null);
            setSaveToast(`Data pasca-observasi (${activeSupervisiModal.mode === 'perbaikan' ? 'setelah perbaikan' : 'data awal'}) berhasil disimpan!`);
            setTimeout(() => setSaveToast(null), 3000);
          }}
        />
      )}

      {/* MODAL DASHBOARD KESIMPULAN SEMUA GURU */}
      {showAllTeachersModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-slate-50 rounded-3xl w-full max-w-6xl max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl p-5 sm:p-8 space-y-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Dashboard Kesimpulan Transformasi Seluruh Guru Pasca Siklus SAMBUNG</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAllTeachersModal(false)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold flex items-center justify-center transition-colors text-base"
                title="Tutup"
              >
                &times;
              </button>
            </div>

            <KesimpulanSemuaGuruDashboard
              supervisions={supervisions}
              currentUser={currentUser}
              onOpenSambungTeacher={(teacherId) => {
                setSelectedId(teacherId);
                setShowAllTeachersModal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
