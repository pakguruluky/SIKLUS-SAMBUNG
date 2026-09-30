import React, { useState } from 'react';
import { Supervision, UserProfile, School } from '../types';
import { 
  Search, 
  Filter, 
  PlusCircle, 
  FolderGit2, 
  Compass, 
  FileSpreadsheet, 
  FileText, 
  Award, 
  Printer, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Download,
  HardDrive
} from 'lucide-react';
import { exportDataToLocalFile } from '../services/localStorageService';

interface SupervisionListProps {
  supervisions: Supervision[];
  currentUser: UserProfile;
  schools: School[];
  onOpenForm: (supervision: Supervision, stage: 'perangkat' | 'pra' | 'observasi' | 'pasca' | 'evaluasi') => void;
  onOpenPrint: (supervision: Supervision) => void;
  onNewSupervision: () => void;
  onOpenSambung?: (supervisionId?: string) => void;
}

export const SupervisionList: React.FC<SupervisionListProps> = ({
  supervisions,
  currentUser,
  schools,
  onOpenForm,
  onOpenPrint,
  onNewSupervision,
  onOpenSambung,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [schoolFilter, setSchoolFilter] = useState<string>('all');

  const isGuru = currentUser.role === 'guru';
  const isAdmin = currentUser.role === 'admin';
  const isKepsek = currentUser.role === 'kepsek';

  // REQUIREMENT 1: Guru yang satu tidak dapat melihat hasil supervisi guru yang lain
  const authorizedSupervisions = isGuru
    ? supervisions.filter(s => s.teacherId === currentUser.uid || s.teacherName.toLowerCase() === currentUser.displayName.toLowerCase())
    : isKepsek
    ? supervisions.filter(s => s.schoolId === currentUser.schoolId || s.schoolName === currentUser.schoolName)
    : supervisions;

  const filtered = authorizedSupervisions.filter(sup => {
    const matchSearch = 
      sup.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sup.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sup.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sup.lessonTitle?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'all' || sup.status === statusFilter;
    const matchSchool = schoolFilter === 'all' || sup.schoolId === schoolFilter || sup.schoolName === schoolFilter;

    return matchSearch && matchStatus && matchSchool;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
            {isGuru ? 'Hasil Penilaian & Portofolio Supervisi Saya' : 'Daftar Rekam Supervisi Akademik Guru'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isGuru
              ? 'Lihat rincian nilai telaah perangkat, observasi tatap muka, dan unggah modul ajar hasil perbaikan.'
              : 'Pantau kemajuan 5 tahapan instrumen supervisi mulai dari telaah perangkat, observasi kelas, hingga evaluasi tahunan.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => exportDataToLocalFile(authorizedSupervisions, schools, currentUser)}
            title="Unduh Salinan Berkas ke Perangkat Lokal (.JSON)"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Simpan ke Device (.JSON)</span>
          </button>

          {!isGuru && (
            <button
              onClick={onNewSupervision}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Mulai Supervisi Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar (Only shown for admin or kepsek, or if guru has multiple years) */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isGuru ? "Cari mata pelajaran atau materi..." : "Cari nama guru, mata pelajaran, materi, atau sekolah..."}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-indigo-600"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto">
          {isAdmin && (
            <select
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              className="flex-1 sm:flex-initial px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600 bg-white"
            >
              <option value="all">Semua SMA Binaan</option>
              {schools.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          )}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 sm:flex-initial px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600 bg-white"
          >
            <option value="all">Semua Status</option>
            <option value="completed">Selesai Penuh</option>
            <option value="in_progress">Dalam Proses</option>
            <option value="submitted">Pengajuan / Menunggu</option>
            <option value="draft">Draf</option>
          </select>
        </div>
      </div>

      {/* Supervisi Cards List */}
      <div className="space-y-4">
        {filtered.map((sup) => {
          const hasPerangkat = Boolean(sup.perangkatAjar?.driveLinks?.modulAjarUrl);
          const hasReviewedPerangkat = Boolean(sup.perangkatAjar?.reviewedAt);
          const hasRevisi = Boolean(sup.perangkatAjar?.revisi?.modulAjarRevisiUrl);
          const hasPra = Boolean(sup.praObservasi?.completedAt);
          const hasObs = Boolean(sup.observasiKelas?.completedAt);
          const hasPasca = Boolean(sup.pascaObservasi?.completedAt);
          const hasEval = Boolean(sup.evaluasiTahunan?.completedAt);

          return (
            <div 
              key={sup.id} 
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
            >
              {/* Left Info */}
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    sup.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : sup.status === 'in_progress'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                  }`}>
                    {sup.status === 'completed' ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        Selesai Lengkap
                      </>
                    ) : sup.status === 'in_progress' ? (
                      <>
                        <Clock className="w-3 h-3" />
                        Proses Observasi
                      </>
                    ) : (
                      'Draf / Pengajuan Baru'
                    )}
                  </span>

                  {/* Revision Status Badge (Requirement 6) */}
                  {hasReviewedPerangkat && (
                    hasRevisi ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Revisi Modul Diunggah
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                        <AlertCircle className="w-3 h-3" />
                        Wajib Unggah Revisi
                      </span>
                    )
                  )}

                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    TP {sup.schoolYear} &bull; Semester {sup.semester}
                  </span>
                  <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {sup.classGrade}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                    {sup.teacherName}
                    <span className="text-xs font-normal text-slate-400">({sup.teacherNip || 'NIP -'})</span>
                  </h3>
                  <p className="text-xs font-medium text-indigo-600 mt-0.5">
                    {sup.subject} &bull; <span className="text-slate-700 font-semibold">{sup.schoolName}</span>
                  </p>
                  {sup.lessonTitle && (
                    <p className="text-xs text-slate-600 mt-1 italic line-clamp-1">
                      Materi: &ldquo;{sup.lessonTitle}&rdquo;
                    </p>
                  )}
                </div>

                {/* Score Badges */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Telaah RPP:</span>
                    <span className="font-bold text-indigo-700">
                      {sup.perangkatAjar?.telaahSummary?.finalScore ? `${sup.perangkatAjar.telaahSummary.finalScore.toFixed(1)}` : '-'}
                    </span>
                    {sup.perangkatAjar?.telaahSummary?.predicate && (
                      <span className="text-[10px] text-indigo-600 font-semibold">({sup.perangkatAjar.telaahSummary.predicate})</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Observasi:</span>
                    <span className="font-bold text-emerald-700">
                      {sup.observasiKelas?.score ? `${sup.observasiKelas.score}%` : '-'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Supervisor:</span>
                    <span className="font-medium text-slate-700">
                      {sup.supervisorName || 'Pengawas Pembina'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Workflow Stepper Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0">
                {isGuru && (
                  <button
                    onClick={() => onOpenForm(sup, 'perangkat')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all ${
                      hasReviewedPerangkat && !hasRevisi
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : hasReviewedPerangkat
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                    }`}
                  >
                    <FolderGit2 className="w-4 h-4" />
                    <span>
                      {hasReviewedPerangkat && !hasRevisi 
                        ? 'Unggah Modul Revisi' 
                        : hasReviewedPerangkat 
                        ? 'Lihat Berkas & Hasil Telaah' 
                        : 'Unggah Berkas Awal (Sebelum Penilaian)'}
                    </span>
                  </button>
                )}

                <div className="grid grid-cols-5 gap-1 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                  {/* Step 1: Perangkat & Telaah (Guru can also upload revision here!) */}
                  <button
                    onClick={() => onOpenForm(sup, 'perangkat')}
                    title={isGuru ? "Unggah & Lihat Telaah / Revisi Perangkat" : "1. Telaah Perangkat Pembelajaran"}
                    className={`p-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all relative ${
                      hasReviewedPerangkat && !hasRevisi && isGuru
                        ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-300'
                        : hasPerangkat
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <FolderGit2 className="w-4 h-4" />
                    <span className="text-[10px]">{hasReviewedPerangkat && !hasRevisi && isGuru ? 'Revisi!' : 'Perangkat'}</span>
                  </button>

                  {/* Step 2: Pra-Observasi */}
                  <button
                    onClick={() => onOpenForm(sup, 'pra')}
                    title={isGuru ? "Lihat Wawancara Pra-Observasi" : "2. Wawancara Pra-Observasi"}
                    className={`p-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                      hasPra
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Compass className="w-4 h-4" />
                    <span className="text-[10px]">Pra-Obs</span>
                  </button>

                  {/* Step 3: Observasi Kelas */}
                  <button
                    onClick={() => onOpenForm(sup, 'observasi')}
                    title={isGuru ? "Lihat Hasil Observasi Kelas" : "3. Instrumen Observasi Kelas Tatap Muka"}
                    className={`p-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                      hasObs
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span className="text-[10px]">Observasi</span>
                  </button>

                  {/* Step 4: Pasca-Observasi */}
                  <button
                    onClick={() => onOpenForm(sup, 'pasca')}
                    title={isGuru ? "Lihat Hasil Refleksi Pasca-Observasi" : "4. Dialog Refleksi Pasca-Observasi"}
                    className={`p-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                      hasPasca
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span className="text-[10px]">Pasca</span>
                  </button>

                  {/* Step 5: Evaluasi 1 Tahun */}
                  <button
                    onClick={() => onOpenForm(sup, 'evaluasi')}
                    title={isGuru ? "Lihat Hasil Evaluasi Tahunan" : "5. Evaluasi 1 Tahun Pelajaran Komprehensif"}
                    className={`p-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                      hasEval
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Award className="w-4 h-4" />
                    <span className="text-[10px]">Tahunan</span>
                  </button>
                </div>

                {/* Instrumen SAMBUNG Button */}
                {onOpenSambung && (
                  <button
                    onClick={() => onOpenSambung(sup.id)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all shrink-0"
                    title="Buka Siklus Instrumen SAMBUNG (S-A-M-B-U-N-G) untuk guru ini"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>SAMBUNG</span>
                  </button>
                )}

                {/* Print Report Trigger Button */}
                <button
                  onClick={() => onOpenPrint(sup)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>Cetak Laporan</span>
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-sm text-slate-700">
              {isGuru ? 'Belum ada berkas supervisi untuk akun Anda.' : 'Tidak ada berkas supervisi yang sesuai kriteria.'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {isGuru ? 'Hubungi Pengawas atau Kepala Sekolah Anda untuk menjadwalkan supervisi.' : 'Coba sesuaikan kata kunci pencarian atau buat supervisi baru.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
