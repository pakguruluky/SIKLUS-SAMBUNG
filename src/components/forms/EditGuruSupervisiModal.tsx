import React, { useState, useEffect } from 'react';
import { Supervision, UserProfile, School } from '../../types';
import { 
  X, 
  Save, 
  User, 
  GraduationCap, 
  Building2, 
  BookOpen, 
  Calendar, 
  Award, 
  FileCheck2, 
  Link as LinkIcon, 
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Printer
} from 'lucide-react';
import { saveSupervision, updateUserAccount, fetchAllUsers } from '../../services/firebase';
import { getSupervisionSambungProgress } from '../../utils/sambungProgress';

interface EditGuruSupervisiModalProps {
  isOpen: boolean;
  onClose: () => void;
  supervision: Supervision;
  schools: School[];
  currentUser: UserProfile;
  onSaved: (updated: Supervision) => void;
  onOpenStageForm?: (supervision: Supervision, stage: 'perangkat' | 'pra' | 'observasi' | 'pasca' | 'evaluasi') => void;
  onOpenSambung?: (supervisionId: string) => void;
  onOpenPrint?: (supervision: Supervision) => void;
}

export const EditGuruSupervisiModal: React.FC<EditGuruSupervisiModalProps> = ({
  isOpen,
  onClose,
  supervision,
  schools,
  currentUser,
  onSaved,
  onOpenStageForm,
  onOpenSambung,
  onOpenPrint,
}) => {
  const [activeTab, setActiveTab] = useState<'identitas' | 'penilaian' | 'pintasan'>('identitas');
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form Fields - Identitas & Penugasan
  const [teacherName, setTeacherName] = useState(supervision.teacherName || '');
  const [teacherNip, setTeacherNip] = useState(supervision.teacherNip || '');
  const [subject, setSubject] = useState(supervision.subject || '');
  const [schoolId, setSchoolId] = useState(supervision.schoolId || '');
  const [classGrade, setClassGrade] = useState(supervision.classGrade || '');
  const [semester, setSemester] = useState<'Ganjil' | 'Genap'>(supervision.semester || 'Ganjil');
  const [schoolYear, setSchoolYear] = useState(supervision.schoolYear || '2025/2026');
  const [lessonTitle, setLessonTitle] = useState(supervision.lessonTitle || '');
  const [supervisorName, setSupervisorName] = useState(supervision.supervisorName || 'Kusnandar, M.Si');
  const [status, setStatus] = useState<'draft' | 'submitted' | 'in_progress' | 'completed'>(supervision.status || 'completed');

  // Form Fields - Capaian Penilaian
  const [telaahScore, setTelaahScore] = useState<number>(
    supervision.perangkatAjar?.telaahSummary?.finalScore ?? 90
  );
  const [telaahPredicate, setTelaahPredicate] = useState<'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Perbaikan'>(
    supervision.perangkatAjar?.telaahSummary?.predicate ?? 'Sangat Baik'
  );
  const [telaahRekomendasi, setTelaahRekomendasi] = useState<string>(
    supervision.perangkatAjar?.feedback?.rekomendasi || ''
  );
  const [modulUrl, setModulUrl] = useState<string>(
    supervision.perangkatAjar?.driveLinks?.modulAjarUrl || ''
  );

  const [obsScore, setObsScore] = useState<number>(
    supervision.observasiKelas?.score ?? 90
  );
  const [obsPredicate, setObsPredicate] = useState<string>(
    supervision.observasiKelas?.predicate || 'Amat Baik (A)'
  );
  const [obsFeedback, setObsFeedback] = useState<string>(
    supervision.observasiKelas?.feedbackNotes || ''
  );

  // Sync form state when supervision changes
  useEffect(() => {
    if (supervision) {
      setTeacherName(supervision.teacherName || '');
      setTeacherNip(supervision.teacherNip || '');
      setSubject(supervision.subject || '');
      setSchoolId(supervision.schoolId || '');
      setClassGrade(supervision.classGrade || '');
      setSemester(supervision.semester || 'Ganjil');
      setSchoolYear(supervision.schoolYear || '2025/2026');
      setLessonTitle(supervision.lessonTitle || '');
      setSupervisorName(supervision.supervisorName || 'Kusnandar, M.Si');
      setStatus(supervision.status || 'completed');

      setTelaahScore(supervision.perangkatAjar?.telaahSummary?.finalScore ?? 90);
      setTelaahPredicate(supervision.perangkatAjar?.telaahSummary?.predicate ?? 'Sangat Baik');
      setTelaahRekomendasi(supervision.perangkatAjar?.feedback?.rekomendasi || '');
      setModulUrl(supervision.perangkatAjar?.driveLinks?.modulAjarUrl || '');

      setObsScore(supervision.observasiKelas?.score ?? 90);
      setObsPredicate(supervision.observasiKelas?.predicate || 'Amat Baik (A)');
      setObsFeedback(supervision.observasiKelas?.feedbackNotes || '');
    }
  }, [supervision]);

  if (!isOpen) return null;

  const selectedSchool = schools.find(s => s.id === schoolId);
  const currentSchoolName = selectedSchool?.name || supervision.schoolName;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim()) {
      alert('Nama guru wajib diisi.');
      return;
    }

    setIsSaving(true);
    try {
      // Build updated supervision
      const updated: Supervision = {
        ...supervision,
        teacherName: teacherName.trim(),
        teacherNip: teacherNip.trim(),
        subject: subject.trim(),
        schoolId: schoolId || supervision.schoolId,
        schoolName: currentSchoolName,
        classGrade: classGrade.trim(),
        semester,
        schoolYear: schoolYear.trim(),
        lessonTitle: lessonTitle.trim(),
        supervisorName: supervisorName.trim(),
        status,
        updatedAt: new Date().toISOString(),

        // Perangkat Ajar updates
        perangkatAjar: {
          ...supervision.perangkatAjar,
          driveLinks: {
            ...supervision.perangkatAjar?.driveLinks,
            modulAjarUrl: modulUrl.trim() || supervision.perangkatAjar?.driveLinks?.modulAjarUrl || '',
            cpTpAtpUrl: supervision.perangkatAjar?.driveLinks?.cpTpAtpUrl || '',
          },
          telaahScores: supervision.perangkatAjar?.telaahScores || {},
          telaahComments: supervision.perangkatAjar?.telaahComments || {},
          telaahSummary: {
            totalScore: supervision.perangkatAjar?.telaahSummary?.totalScore ?? Math.round((telaahScore / 100) * 44),
            maxPossibleScore: 44,
            finalScore: Number(telaahScore),
            predicate: telaahPredicate,
          },
          feedback: {
            kelebihan: supervision.perangkatAjar?.feedback?.kelebihan || 'Perangkat ajar tersusun sistematis dan kontekstual.',
            perbaikan: supervision.perangkatAjar?.feedback?.perbaikan || 'Perkuat asesmen formatif berkelanjutan.',
            rekomendasi: telaahRekomendasi.trim() || supervision.perangkatAjar?.feedback?.rekomendasi || 'Dapat diterapkan sebagai praktik baik pembelajaran.',
          },
        },

        // Observasi Kelas updates
        observasiKelas: {
          ...supervision.observasiKelas,
          items: supervision.observasiKelas?.items || {},
          totalAspek: supervision.observasiKelas?.totalAspek || 24,
          score: Number(obsScore),
          predicate: obsPredicate,
          feedbackNotes: obsFeedback.trim() || supervision.observasiKelas?.feedbackNotes || 'Pembelajaran berpusat pada murid berlangsung efektif dan menggembirakan.',
        },
      };

      // Also sync user profile if exists in users collection
      try {
        const allUsers = await fetchAllUsers();
        const matchedUser = allUsers.find(
          u => u.uid === supervision.teacherId || 
               u.displayName.toLowerCase().trim() === supervision.teacherName.toLowerCase().trim()
        );
        if (matchedUser) {
          const updatedUser: UserProfile = {
            ...matchedUser,
            displayName: teacherName.trim(),
            nip: teacherNip.trim() || matchedUser.nip,
            subject: subject.trim() || matchedUser.subject,
            schoolId: schoolId || matchedUser.schoolId,
            schoolName: currentSchoolName || matchedUser.schoolName,
            updatedAt: new Date().toISOString(),
          };
          await updateUserAccount(updatedUser);
        }
      } catch (userSyncErr) {
        console.warn('Notice syncing user profile for teacher:', userSyncErr);
      }

      await saveSupervision(updated);
      onSaved(updated);

      setToastMessage(`Data guru ${updated.teacherName} berhasil disimpan!`);
      setTimeout(() => {
        setToastMessage(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Error saving teacher data:', err);
      alert('Gagal menyimpan perubahan: ' + (err.message || ''));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white p-5 sm:p-6 border-b border-indigo-950/40 relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-black text-lg shadow-inner">
                {teacherName.charAt(0) || 'G'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 uppercase tracking-wider">
                    Menu Edit Guru &amp; Supervisi
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    status === 'completed'
                      ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-500/40'
                      : status === 'in_progress'
                      ? 'bg-amber-500/30 text-amber-200 border border-amber-500/40'
                      : 'bg-indigo-500/30 text-indigo-200'
                  }`}>
                    {status === 'completed' ? 'Selesai Penuh' : status === 'in_progress' ? 'Observasi Kelas' : 'Draf / Pengajuan'}
                  </span>
                </div>
                <h2 className="text-base sm:text-xl font-bold tracking-tight text-white mt-1">
                  {teacherName || 'Data Guru'}
                </h2>
                <p className="text-xs text-indigo-200/80 mt-0.5">
                  {subject} &bull; {currentSchoolName} &bull; {classGrade}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-indigo-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-5 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('identitas')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'identitas'
                  ? 'bg-white text-indigo-950 shadow-xs'
                  : 'text-indigo-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Identitas &amp; Penugasan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('penilaian')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'penilaian'
                  ? 'bg-white text-indigo-950 shadow-xs'
                  : 'text-indigo-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Capaian &amp; Hasil Supervisi</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pintasan')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'pintasan'
                  ? 'bg-white text-indigo-950 shadow-xs'
                  : 'text-indigo-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Pintasan Instrumen Supervisi</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {toastMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* TAB 1: IDENTITAS & PENUGASAN */}
          {activeTab === 'identitas' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap Guru (dengan Gelar) *
                  </label>
                  <input
                    type="text"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-indigo-600 focus:ring-1 focus:ring-indigo-600 font-semibold"
                    placeholder="Contoh: Sondang Asih Januarti, S.Pd."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NIP / NUPTK Guru
                  </label>
                  <input
                    type="text"
                    value={teacherNip}
                    onChange={(e) => setTeacherNip(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-indigo-600 font-mono"
                    placeholder="Contoh: 19840512 200801 2 007"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mata Pelajaran Diampu *
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-indigo-600 font-semibold"
                    placeholder="Contoh: Fisika, Ekonomi, Kimia..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Satuan Pendidikan (Sekolah) *
                  </label>
                  <select
                    value={schoolId}
                    onChange={(e) => setSchoolId(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-indigo-600 font-semibold bg-white"
                  >
                    {schools.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Fase &amp; Rombongan Belajar
                  </label>
                  <input
                    type="text"
                    value={classGrade}
                    onChange={(e) => setClassGrade(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-indigo-600"
                    placeholder="Contoh: Fase F / Kelas XI-1"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Semester
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value as 'Ganjil' | 'Genap')}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-indigo-600 font-semibold bg-white"
                  >
                    <option value="Ganjil">Semester Ganjil</option>
                    <option value="Genap">Semester Genap</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tahun Pelajaran
                  </label>
                  <input
                    type="text"
                    value={schoolYear}
                    onChange={(e) => setSchoolYear(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-indigo-600"
                    placeholder="2025/2026"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Materi Pokok / Judul Modul Ajar Supervisi
                </label>
                <textarea
                  rows={2}
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-indigo-600"
                  placeholder="Contoh: Listrik Arus Searah: Rangkaian Tertutup & Analisis Hukum Kirchhoff"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status Supervisi
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-indigo-600 font-bold bg-white"
                  >
                    <option value="completed">Selesai Penuh (Completed)</option>
                    <option value="in_progress">Dalam Proses (Observasi Kelas)</option>
                    <option value="submitted">Pengajuan Berkas (Submitted)</option>
                    <option value="draft">Draf Awal (Draft)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Supervisor / Pengawas Pembina
                  </label>
                  <input
                    type="text"
                    value={supervisorName}
                    onChange={(e) => setSupervisorName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-indigo-600"
                    placeholder="Kusnandar, M.Si"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CAPAIAN & HASIL SUPERVISI */}
          {activeTab === 'penilaian' && (
            <div className="space-y-5">
              {/* Telaah RPP Section */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-indigo-600" />
                    <span>1. Telaah Perangkat Ajar (RPP / Modul)</span>
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                    22 Indikator Deep Learning
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Skor Telaah Akhir (0 - 100)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={telaahScore}
                      onChange={(e) => setTelaahScore(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-indigo-600 font-bold text-indigo-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Predikat Telaah
                    </label>
                    <select
                      value={telaahPredicate}
                      onChange={(e) => setTelaahPredicate(e.target.value as any)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-indigo-600 font-semibold bg-white"
                    >
                      <option value="Sangat Baik">Sangat Baik</option>
                      <option value="Baik">Baik</option>
                      <option value="Cukup">Cukup</option>
                      <option value="Perlu Perbaikan">Perlu Perbaikan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tautan Google Drive Modul Ajar
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={modulUrl}
                      onChange={(e) => setModulUrl(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-indigo-600 font-mono text-[11px]"
                      placeholder="https://drive.google.com/file/d/..."
                    />
                    {modulUrl && (
                      <a
                        href={modulUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                        title="Buka Dokumen Modul Ajar"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Catatan / Rekomendasi Telaah Pengawas
                  </label>
                  <textarea
                    rows={2}
                    value={telaahRekomendasi}
                    onChange={(e) => setTelaahRekomendasi(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-indigo-600"
                    placeholder="Catatan kelebihan atau tindak lanjut perbaikan perangkat ajar..."
                  />
                </div>
              </div>

              {/* Observasi Kelas Section */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>2. Observasi Pelaksanaan Pembelajaran</span>
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    24 Aspek Observasi Kelas
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Skor Observasi Kelas (0 - 100%)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      value={obsScore}
                      onChange={(e) => setObsScore(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-indigo-600 font-bold text-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Predikat Observasi
                    </label>
                    <select
                      value={obsPredicate}
                      onChange={(e) => setObsPredicate(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-indigo-600 font-semibold bg-white"
                    >
                      <option value="Amat Baik (A)">Amat Baik (A)</option>
                      <option value="Baik (B)">Baik (B)</option>
                      <option value="Cukup (C)">Cukup (C)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Catatan &amp; Umpan Balik Observasi Tatap Muka
                  </label>
                  <textarea
                    rows={2}
                    value={obsFeedback}
                    onChange={(e) => setObsFeedback(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-indigo-600"
                    placeholder="Umpan balik suasana kelas, pelibatan aktif murid, dan asesmen formatif..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PINTASAN INSTRUMEN SUPERVISI */}
          {activeTab === 'pintasan' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-600">
                  Akses langsung form instrumen detail untuk <strong>{teacherName}</strong>. Klik salah satu modul di bawah ini untuk mengedit item atau mencetak portofolio.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {onOpenStageForm && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenStageForm(supervision, 'perangkat');
                      }}
                      className="p-3 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-left transition-all flex items-center justify-between group"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-700">
                          1. Form Telaah Perangkat Ajar
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          22 Aspek telaah RPP / Modul Ajar
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenStageForm(supervision, 'pra');
                      }}
                      className="p-3 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-left transition-all flex items-center justify-between group"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-700">
                          2. Wawancara Pra-Observasi
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          8 Pertanyaan persiapan dan kesiapan guru
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenStageForm(supervision, 'observasi');
                      }}
                      className="p-3 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-left transition-all flex items-center justify-between group"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-700">
                          3. Form Observasi Pelaksanaan Pembelajaran
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          25 Aspek observasi kelas (9 Kategori Resmi Sesuai PDF)
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenStageForm(supervision, 'pasca');
                      }}
                      className="p-3 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-left transition-all flex items-center justify-between group"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-700">
                          4. Form Pasca-Observasi &amp; Refleksi MAKNAI
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          10 Butir pertanyaan coaching reflektif &amp; kesepakatan TIRTA
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenStageForm(supervision, 'evaluasi');
                      }}
                      className="p-3 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-left transition-all flex items-center justify-between group"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-700">
                          5. Evaluasi Kinerja Tahunan
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Rekap portofolio integratif 1 tahun
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                    </button>
                  </>
                )}

                {onOpenSambung && (() => {
                  const sambungProg = getSupervisionSambungProgress(supervision);
                  return (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenSambung(supervision.id);
                      }}
                      className="p-3.5 rounded-2xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-white hover:bg-indigo-100 text-left transition-all flex items-center justify-between group shadow-2xs"
                    >
                      <div className="flex-1 mr-3">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="text-xs font-black text-indigo-950">
                            🌿 Buka Instrumen SAMBUNG 7 Tahap
                          </p>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${sambungProg.statusBadge.bgColor} ${sambungProg.statusBadge.textColor} ${sambungProg.statusBadge.borderColor}`}>
                            {sambungProg.statusBadge.text}
                          </span>
                        </div>
                        <p className="text-[11px] text-indigo-800">
                          Tahap Aktif: <strong>Tahap {sambungProg.currentActiveStage} ({sambungProg.stages[sambungProg.currentActiveStage]?.name})</strong> &bull; {sambungProg.completedStagesCount}/7 Selesai ({sambungProg.overallPercent}%)
                        </p>
                      </div>
                      <BookOpen className="w-5 h-5 text-indigo-600 shrink-0" />
                    </button>
                  );
                })()}

                {onOpenPrint && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenPrint(supervision);
                    }}
                    className="p-3 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-left transition-all flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        🖨️ Pratinjau &amp; Cetak Berkas Supervisi
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Format resmi PDF / Cetak langsung
                      </p>
                    </div>
                    <Printer className="w-4 h-4 text-slate-600" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors"
            >
              Tutup
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan Data Guru'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
