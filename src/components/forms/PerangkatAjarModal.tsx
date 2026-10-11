import React, { useState } from 'react';
import { Supervision, UserProfile } from '../../types';
import { TELAAH_ITEMS } from '../../data/instrumentData';
import { 
  X, 
  Save, 
  ExternalLink, 
  Link2, 
  AlertCircle, 
  CheckCircle2, 
  FolderSync,
  FileCheck,
  Eye,
  Sparkles,
  UploadCloud,
  FileText
} from 'lucide-react';
import { saveSupervision } from '../../services/firebase';

interface PerangkatAjarModalProps {
  isOpen: boolean;
  onClose: () => void;
  supervision: Supervision;
  currentUser: UserProfile;
  onSaved: (updated: Supervision) => void;
  onApproveTeacher?: (uid: string) => void;
  mode?: 'awal' | 'perbaikan';
}

export const PerangkatAjarModal: React.FC<PerangkatAjarModalProps> = ({
  isOpen,
  onClose,
  supervision,
  currentUser,
  onSaved,
  mode = 'awal',
}) => {
  // Initial links
  const [cpTpAtpUrl, setCpTpAtpUrl] = useState(
    (mode === 'perbaikan' ? supervision.perangkatAjarPerbaikan?.driveLinks?.cpTpAtpUrl : undefined) ||
    supervision.perangkatAjar?.driveLinks?.cpTpAtpUrl || ''
  );
  const [modulAjarUrl, setModulAjarUrl] = useState(
    (mode === 'perbaikan' ? (supervision.perangkatAjar?.revisi?.modulAjarRevisiUrl || supervision.perangkatAjarPerbaikan?.driveLinks?.modulAjarUrl) : undefined) ||
    supervision.perangkatAjar?.driveLinks?.modulAjarUrl || ''
  );
  const [bahanAjarUrl, setBahanAjarUrl] = useState(
    (mode === 'perbaikan' ? supervision.perangkatAjarPerbaikan?.driveLinks?.bahanAjarUrl : undefined) ||
    supervision.perangkatAjar?.driveLinks?.bahanAjarUrl || ''
  );
  const [asesmenUrl, setAsesmenUrl] = useState(
    (mode === 'perbaikan' ? supervision.perangkatAjarPerbaikan?.driveLinks?.asesmenUrl : undefined) ||
    supervision.perangkatAjar?.driveLinks?.asesmenUrl || ''
  );

  // Scores and Comments
  const [scores, setScores] = useState<Record<number, number | 'NA'>>(() => {
    if (mode === 'perbaikan' && supervision.perangkatAjarPerbaikan?.telaahScores) {
      return supervision.perangkatAjarPerbaikan.telaahScores;
    }
    return supervision.perangkatAjar?.telaahScores || {};
  });
  const [comments, setComments] = useState<Record<number, string>>(() => {
    if (mode === 'perbaikan' && supervision.perangkatAjarPerbaikan?.telaahComments) {
      return supervision.perangkatAjarPerbaikan.telaahComments;
    }
    return supervision.perangkatAjar?.telaahComments || {};
  });

  // Feedbacks
  const [kelebihan, setKelebihan] = useState(
    (mode === 'perbaikan' ? supervision.perangkatAjarPerbaikan?.feedback?.kelebihan : undefined) ||
    supervision.perangkatAjar?.feedback?.kelebihan || ''
  );
  const [perbaikan, setPerbaikan] = useState(
    (mode === 'perbaikan' ? supervision.perangkatAjarPerbaikan?.feedback?.perbaikan : undefined) ||
    supervision.perangkatAjar?.feedback?.perbaikan || ''
  );
  const [rekomendasi, setRekomendasi] = useState(
    (mode === 'perbaikan' ? supervision.perangkatAjarPerbaikan?.feedback?.rekomendasi : undefined) ||
    supervision.perangkatAjar?.feedback?.rekomendasi || ''
  );

  // Post-Review Revision state
  const [modulAjarRevisiUrl, setModulAjarRevisiUrl] = useState(
    supervision.perangkatAjar?.revisi?.modulAjarRevisiUrl || ''
  );
  const [catatanRevisiGuru, setCatatanRevisiGuru] = useState(
    supervision.perangkatAjar?.revisi?.catatanRevisiGuru || ''
  );
  const [revisiStatus, setRevisiStatus] = useState<'belum_diunggah' | 'sudah_diunggah' | 'disetujui'>(
    supervision.perangkatAjar?.revisi?.revisiStatus || 'belum_diunggah'
  );

  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const isSupervisor = currentUser.role === 'admin' || (currentUser.role as string) === 'pengawas' || currentUser.role === 'kepsek';
  const isGuru = currentUser.role === 'guru';
  // Guru and supervisor can add and evaluate Perangkat Ajar & Telaah Modul Ajar (22 Aspek)
  const canEditTelaah = true;

  // Check if telaah has been reviewed by supervisor
  const isReviewed = Boolean(supervision.perangkatAjar?.reviewedAt);

  if (!isOpen) return null;

  // Count uploaded items (out of 4)
  const uploadedFilesCount = [cpTpAtpUrl, modulAjarUrl, bahanAjarUrl, asesmenUrl].filter(
    url => Boolean(url && url.trim().length > 0)
  ).length;
  const uploadProgressPercent = Math.round((uploadedFilesCount / 4) * 100);

  // Auto calculate scores
  let totalScore = 0;
  let maxPossibleScore = 0;
  TELAAH_ITEMS.forEach(item => {
    const val = scores[item.id];
    if (val !== 'NA' && val !== undefined) {
      totalScore += Number(val);
      maxPossibleScore += 2;
    }
  });

  const finalScore = maxPossibleScore > 0 ? parseFloat(((totalScore / maxPossibleScore) * 100).toFixed(1)) : 0;
  let predicate: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Perbaikan' = 'Perlu Perbaikan';
  if (finalScore >= 86) predicate = 'Sangat Baik';
  else if (finalScore >= 76) predicate = 'Baik';
  else if (finalScore >= 66) predicate = 'Cukup';

  const handleScoreChange = (id: number, val: number | 'NA') => {
    setScores(prev => ({ ...prev, [id]: val }));
  };

  const handleCommentChange = (id: number, text: string) => {
    setComments(prev => ({ ...prev, [id]: text }));
  };

  // Helper to quickly populate sample Drive link for easy testing
  const handleUseSampleLink = (type: 'cp' | 'modul' | 'bahan' | 'asesmen') => {
    const baseSamples = {
      cp: 'https://drive.google.com/file/d/1Contoh_CP_TP_ATP_KurikulumMerdeka/view?usp=sharing',
      modul: 'https://drive.google.com/file/d/1Contoh_Modul_Ajar_Pembelajaran_Mendalam/view?usp=sharing',
      bahan: 'https://drive.google.com/file/d/1Contoh_Bahan_Ajar_Media_Digital/view?usp=sharing',
      asesmen: 'https://drive.google.com/file/d/1Contoh_Rubrik_Asesmen_Otentik_KKTP/view?usp=sharing',
    };

    if (type === 'cp') setCpTpAtpUrl(baseSamples.cp);
    if (type === 'modul') setModulAjarUrl(baseSamples.modul);
    if (type === 'bahan') setBahanAjarUrl(baseSamples.bahan);
    if (type === 'asesmen') setAsesmenUrl(baseSamples.asesmen);
  };

  // Simulated local file picker that generates realistic Google Drive link
  const handleSimulatedFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const cleanName = encodeURIComponent(file.name.replace(/\s+/g, '_'));
      const generatedDriveLink = `https://drive.google.com/file/d/drive_${Date.now()}_${cleanName}/view?usp=sharing`;
      setter(generatedDriveLink);
    }
  };

  const handleSaveData = async (isPeriodicDraft = false) => {
    try {
      setSaving(true);
      setSaveSuccessMsg('');

      const hasNewRevision = Boolean(modulAjarRevisiUrl.trim());
      const newRevisiStatus = hasNewRevision 
        ? (isSupervisor && revisiStatus === 'disetujui' ? 'disetujui' : 'sudah_diunggah')
        : (supervision.perangkatAjar?.revisi?.revisiStatus || 'belum_diunggah');

      const updatedSupervision: Supervision = {
        ...supervision,
        perangkatAjar: {
          driveLinks: mode === 'perbaikan' 
            ? (supervision.perangkatAjar?.driveLinks || {
                cpTpAtpUrl: cpTpAtpUrl.trim(),
                modulAjarUrl: modulAjarUrl.trim(),
                bahanAjarUrl: bahanAjarUrl.trim(),
                asesmenUrl: asesmenUrl.trim(),
              })
            : {
                cpTpAtpUrl: cpTpAtpUrl.trim(),
                modulAjarUrl: modulAjarUrl.trim(),
                bahanAjarUrl: bahanAjarUrl.trim(),
                asesmenUrl: asesmenUrl.trim(),
              },
          submittedAt: supervision.perangkatAjar?.submittedAt || (uploadedFilesCount > 0 ? new Date().toISOString() : undefined),
          telaahScores: mode === 'perbaikan' ? (supervision.perangkatAjar?.telaahScores || scores) : scores,
          telaahComments: mode === 'perbaikan' ? (supervision.perangkatAjar?.telaahComments || comments) : comments,
          telaahSummary: mode === 'perbaikan' ? (supervision.perangkatAjar?.telaahSummary || { totalScore, maxPossibleScore, finalScore, predicate }) : {
            totalScore,
            maxPossibleScore,
            finalScore,
            predicate,
          },
          feedback: mode === 'perbaikan' ? (supervision.perangkatAjar?.feedback || { kelebihan, perbaikan, rekomendasi }) : {
            kelebihan,
            perbaikan,
            rekomendasi,
          },
          reviewedAt: isSupervisor ? (supervision.perangkatAjar?.reviewedAt || new Date().toISOString()) : supervision.perangkatAjar?.reviewedAt,
          reviewedBy: isSupervisor ? (supervision.perangkatAjar?.reviewedBy || currentUser.displayName) : supervision.perangkatAjar?.reviewedBy,
          revisi: {
            modulAjarRevisiUrl: (mode === 'perbaikan' ? (modulAjarUrl.trim() || modulAjarRevisiUrl.trim()) : modulAjarRevisiUrl.trim()),
            catatanRevisiGuru: catatanRevisiGuru.trim(),
            revisiSubmittedAt: hasNewRevision ? (supervision.perangkatAjar?.revisi?.revisiSubmittedAt || new Date().toISOString()) : undefined,
            revisiStatus: newRevisiStatus,
          },
        },
        ...(mode === 'perbaikan' ? {
          perangkatAjarPerbaikan: {
            driveLinks: {
              cpTpAtpUrl: cpTpAtpUrl.trim(),
              modulAjarUrl: modulAjarUrl.trim() || modulAjarRevisiUrl.trim(),
              bahanAjarUrl: bahanAjarUrl.trim(),
              asesmenUrl: asesmenUrl.trim(),
            },
            submittedAt: new Date().toISOString(),
            telaahScores: scores,
            telaahComments: comments,
            telaahSummary: {
              totalScore,
              maxPossibleScore,
              finalScore,
              predicate,
            },
            feedback: {
              kelebihan,
              perbaikan,
              rekomendasi,
            },
            reviewedAt: isSupervisor ? new Date().toISOString() : undefined,
            reviewedBy: isSupervisor ? currentUser.displayName : undefined,
          }
        } : {}),
        status: isPeriodicDraft && supervision.status === 'draft' 
          ? 'draft' 
          : (supervision.status === 'draft' && uploadedFilesCount >= 1 ? 'submitted' : supervision.status),
      };

      await saveSupervision(updatedSupervision);
      onSaved(updatedSupervision);

      setSaveSuccessMsg(
        isPeriodicDraft
          ? 'Draf berkala perangkat pembelajaran berhasil disimpan!'
          : isSupervisor
          ? 'Penilaian & telaah perangkat berhasil disimpan!'
          : 'Perangkat pembelajaran berhasil dikirim ke Pengawas & Kepala Sekolah!'
      );

      setTimeout(() => {
        setSaveSuccessMsg('');
        if (!isPeriodicDraft) {
          onClose();
        }
      }, 1500);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan perangkat pembelajaran.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className={`${mode === 'perbaikan' ? 'bg-purple-800' : 'bg-indigo-700'} text-white p-4 sm:p-5 flex items-center justify-between shrink-0 transition-colors`}>
          <div>
            <div className="flex items-center gap-2 text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-0.5">
              <FileCheck className="w-4 h-4" />
              <span>{mode === 'perbaikan' ? 'Tahap U (Uji) &bull; Perangkat Ajar Setelah Perbaikan' : 'Tahap S (Selidiki) &bull; Perangkat Ajar Kondisi Awal'}</span>
            </div>
            <h2 className="text-base sm:text-xl font-bold">
              {isSupervisor 
                ? mode === 'perbaikan' ? 'Instrumen Telaah & Evaluasi Modul Ajar (Setelah Ada Perbaikan)' : 'Instrumen Telaah & Evaluasi Modul Ajar / RPP Awal'
                : mode === 'perbaikan' ? 'Unggah Perangkat Pembelajaran Hasil Revisi / Perbaikan' : 'Unggah Berkas Perencanaan Pembelajaran Awal (Sebelum Penilaian)'}
            </h2>
            <p className="text-xs text-indigo-100 mt-0.5">
              Guru: <strong>{supervision.teacherName}</strong> &bull; Mapel: <strong>{supervision.subject}</strong> &bull; {supervision.schoolName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-indigo-200 hover:text-white hover:bg-indigo-600 transition-colors"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Banners */}
        {/* 1. Notice for Supervisor & Guru (Kolaboratif) */}
        {isSupervisor && (
          <div className="bg-indigo-50 border-b border-indigo-200 px-5 py-2.5 text-xs text-indigo-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                <strong>Kewenangan Pengawas &amp; Kepala Sekolah:</strong> Anda dapat <strong>menambahkan, menempelkan (*paste*), atau memperbarui tautan Google Drive</strong> dokumen pembelajaran guru di bawah ini, serta memberikan skor telaah dan rekomendasi.
              </span>
            </div>
            <span className="text-[11px] font-bold text-indigo-800 bg-white px-2.5 py-1 rounded-full border border-indigo-200 shrink-0 self-start sm:self-auto">
              {uploadedFilesCount} dari 4 Berkas Terhubung
            </span>
          </div>
        )}

        {/* 2. Notice for Guru (Bebas Mengunggah & Menyimpan Berkala) */}
        {isGuru && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-3 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-start sm:items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <strong>Tahap Pengunggahan Berkas Awal (Sebelum Penilaian):</strong> Silakan masukkan tautan Google Drive dokumen pembelajaran Anda di bawah ini. Anda dapat menyimpan secara berkala kapan saja.
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-800 bg-white px-3 py-1 rounded-full border border-emerald-300 shrink-0 self-start sm:self-auto">
              {uploadedFilesCount} dari 4 Berkas Tersimpan ({uploadProgressPercent}%)
            </span>
          </div>
        )}

        {/* Success Alert */}
        {saveSuccessMsg && (
          <div className="bg-emerald-600 text-white px-5 py-2 text-xs font-semibold flex items-center gap-2 justify-center animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Content Form Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs sm:text-sm">
          
          {/* SECTION 1: PERANGKAT AWAL (SEBELUM PENILAIAN) */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border-2 border-indigo-100 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[11px] font-bold mb-1">
                  <Link2 className="w-3.5 h-3.5" />
                  <span>TAHAP 1: SEBELUM PENILAIAN</span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  Berkas Perencanaan Pembelajaran Awal Guru
                </h3>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Pengawas, Kepala Sekolah, dan Guru dapat menambahkan, menempelkan (*paste*), atau memperbarui tautan Google Drive dokumen pembelajaran di bawah ini.
                </p>
              </div>

              {/* Progress Indicator */}
              <div className="flex items-center gap-2 min-w-[150px] bg-white p-2 rounded-xl border border-slate-200">
                <div className="flex-1 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgressPercent}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-700">{uploadProgressPercent}%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
              
              {/* Item A: CP, TP, ATP */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>a. Alur Tujuan Pembelajaran (CP, TP, ATP) *</span>
                  </label>
                  {cpTpAtpUrl ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Tersedia
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      Belum Diunggah
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="url"
                      value={cpTpAtpUrl}
                      onChange={(e) => setCpTpAtpUrl(e.target.value)}
                      placeholder="https://drive.google.com/file/d/..."
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-indigo-600 text-xs font-mono"
                    />
                    {cpTpAtpUrl && (
                      <a
                        href={cpTpAtpUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-xs font-semibold shrink-0 transition-colors"
                        title="Buka Dokumen di Google Drive"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Buka Drive</span>
                      </a>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-0.5">
                    <button
                      type="button"
                      onClick={() => handleUseSampleLink('cp')}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold underline text-[10px]"
                    >
                      + Isi Contoh Tautan
                    </button>

                    <label className="cursor-pointer text-slate-500 hover:text-slate-700 flex items-center gap-1 text-[10px]">
                      <UploadCloud className="w-3 h-3 text-slate-400" />
                      <span>Pilih Berkas Lokal</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleSimulatedFileUpload(e, setCpTpAtpUrl)}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Item B: Modul Ajar / RPP Awal */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>b. Modul Ajar / RPP Awal *</span>
                  </label>
                  {modulAjarUrl ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Tersedia
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      Belum Diunggah
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="url"
                      value={modulAjarUrl}
                      onChange={(e) => setModulAjarUrl(e.target.value)}
                      placeholder="https://drive.google.com/file/d/..."
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-indigo-600 text-xs font-mono"
                    />
                    {modulAjarUrl && (
                      <a
                        href={modulAjarUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-xs font-semibold shrink-0 transition-colors"
                        title="Buka Modul di Google Drive"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Buka Drive</span>
                      </a>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-0.5">
                    <button
                      type="button"
                      onClick={() => handleUseSampleLink('modul')}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold underline text-[10px]"
                    >
                      + Isi Contoh Tautan
                    </button>

                    <label className="cursor-pointer text-slate-500 hover:text-slate-700 flex items-center gap-1 text-[10px]">
                      <UploadCloud className="w-3 h-3 text-slate-400" />
                      <span>Pilih Berkas Lokal</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleSimulatedFileUpload(e, setModulAjarUrl)}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Item C: Bahan Ajar / Media */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>c. Bahan Ajar / Media / PPT (Opsional)</span>
                  </label>
                  {bahanAjarUrl ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Tersedia
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                      Belum Diunggah
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="url"
                      value={bahanAjarUrl}
                      onChange={(e) => setBahanAjarUrl(e.target.value)}
                      placeholder="https://drive.google.com/file/d/..."
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-indigo-600 text-xs font-mono"
                    />
                    {bahanAjarUrl && (
                      <a
                        href={bahanAjarUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-xs font-semibold shrink-0 transition-colors"
                        title="Buka Bahan Ajar di Google Drive"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Buka Drive</span>
                      </a>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-0.5">
                    <button
                      type="button"
                      onClick={() => handleUseSampleLink('bahan')}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold underline text-[10px]"
                    >
                      + Isi Contoh Tautan
                    </button>

                    <label className="cursor-pointer text-slate-500 hover:text-slate-700 flex items-center gap-1 text-[10px]">
                      <UploadCloud className="w-3 h-3 text-slate-400" />
                      <span>Pilih Berkas Lokal</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx"
                        onChange={(e) => handleSimulatedFileUpload(e, setBahanAjarUrl)}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Item D: Asesmen & Rubrik KKTP */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>d. Lembar Asesmen &amp; Rubrik KKTP (Opsional)</span>
                  </label>
                  {asesmenUrl ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Tersedia
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                      Belum Diunggah
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="url"
                      value={asesmenUrl}
                      onChange={(e) => setAsesmenUrl(e.target.value)}
                      placeholder="https://drive.google.com/file/d/..."
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-indigo-600 text-xs font-mono"
                    />
                    {asesmenUrl && (
                      <a
                        href={asesmenUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-xs font-semibold shrink-0 transition-colors"
                        title="Buka Asesmen di Google Drive"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Buka Drive</span>
                      </a>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-0.5">
                    <button
                      type="button"
                      onClick={() => handleUseSampleLink('asesmen')}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold underline text-[10px]"
                    >
                      + Isi Contoh Tautan
                    </button>

                    <label className="cursor-pointer text-slate-500 hover:text-slate-700 flex items-center gap-1 text-[10px]">
                      <UploadCloud className="w-3 h-3 text-slate-400" />
                      <span>Pilih Berkas Lokal</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleSimulatedFileUpload(e, setAsesmenUrl)}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Helper for Guru */}
            {isGuru && (
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="text-slate-600">
                  💡 <strong>Tip Guru:</strong> Anda dapat menyimpan berkas bertahap dengan tombol <em>&ldquo;Simpan Draf Berkala&rdquo;</em> di bawah.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    handleUseSampleLink('cp');
                    handleUseSampleLink('modul');
                  }}
                  className="px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-bold text-[11px] transition-colors shrink-0 self-start sm:self-auto"
                >
                  ⚡ Isi Contoh CP &amp; Modul Sekaligus
                </button>
              </div>
            )}
          </div>

          {/* SECTION 2: 22 ASPEK TELAAH PERENCANAAN PEMBELAJARAN */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  2. Instrumen Telaah Perencanaan Pembelajaran (22 Aspek)
                </h3>
                <p className="text-xs text-slate-500">
                  {isSupervisor 
                    ? 'Beri skor: 2 = Optimal, 1 = Sebagian/Belum Optimal, 0 = Belum Terpenuhi, N/A = Tidak Relevan.'
                    : 'Hasil penilaian dan telaah oleh Pengawas/Kepala Sekolah (Guru hanya dapat membaca hasil telaah).'}
                </p>
              </div>

              {/* Live Score Counter Pill */}
              <div className="flex items-center gap-3 bg-slate-100 px-3.5 py-1.5 rounded-xl self-start sm:self-auto border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Skor Akhir</span>
                  <span className="text-base font-extrabold text-indigo-700">{finalScore}</span>
                </div>
                <div className="h-6 w-px bg-slate-300"></div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Predikat</span>
                  <span className={`text-xs font-bold ${
                    predicate === 'Sangat Baik' ? 'text-emerald-700' : predicate === 'Baik' ? 'text-indigo-700' : 'text-amber-700'
                  }`}>
                    {predicate}
                  </span>
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="divide-y divide-slate-100 max-h-[340px] overflow-y-auto">
                {TELAAH_ITEMS.map((item) => (
                  <div key={item.id} className="p-3.5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {item.id}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{item.category}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed pl-7">
                        {item.aspect}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0 pl-7 md:pl-0">
                      {/* Skala Radio buttons */}
                      <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                        {[0, 1, 2, 'NA'].map((val) => (
                          <label
                            key={val}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                              canEditTelaah ? 'cursor-pointer' : 'cursor-default opacity-85'
                            } transition-all ${
                              scores[item.id] === val
                                ? val === 2
                                  ? 'bg-emerald-600 text-white'
                                  : val === 1
                                  ? 'bg-amber-500 text-white'
                                  : val === 0
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-slate-700 text-white'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`telaah_score_${item.id}`}
                              value={val}
                              disabled={!canEditTelaah}
                              checked={scores[item.id] === val}
                              onChange={() => handleScoreChange(item.id, val as any)}
                              className="sr-only"
                            />
                            {val === 'NA' ? 'N/A' : val}
                          </label>
                        ))}
                      </div>

                      {/* Komentar Kritis */}
                      <input
                        type="text"
                        disabled={!canEditTelaah}
                        value={comments[item.id] || ''}
                        onChange={(e) => handleCommentChange(item.id, e.target.value)}
                        placeholder="Catatan / komentar indikator..."
                        className="w-full sm:w-44 px-2.5 py-1 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600 bg-white disabled:bg-slate-100"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 3: UMPAN BALIK SUPERVISOR */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">
              3. Umpan Balik Perencanaan Pembelajaran (Pengawas / Kepala Sekolah)
            </h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                a. Kelebihan Perencanaan Pembelajaran:
              </label>
              <textarea
                rows={2}
                disabled={!isSupervisor}
                value={kelebihan}
                onChange={(e) => setKelebihan(e.target.value)}
                placeholder={isSupervisor ? "Identifikasi kekuatan, inovasi pedagogis, dan keselarasan modul yang patut dipertahankan..." : "Belum ada catatan kelebihan dari supervisor."}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-indigo-600 text-xs disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                b. Hal yang Perlu Ditingkatkan dari Perencanaan Pembelajaran:
              </label>
              <textarea
                rows={2}
                disabled={!isSupervisor}
                value={perbaikan}
                onChange={(e) => setPerbaikan(e.target.value)}
                placeholder={isSupervisor ? "Catatan kelemahan atau aspek yang belum lengkap untuk disempurnakan..." : "Belum ada catatan perbaikan dari supervisor."}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-indigo-600 text-xs disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                c. Rekomendasi dan tindak lanjut revisi sesuai prinsip Pembelajaran Mendalam:
              </label>
              <textarea
                rows={2}
                disabled={!isSupervisor}
                value={rekomendasi}
                onChange={(e) => setRekomendasi(e.target.value)}
                placeholder={isSupervisor ? "Arahan konkrit untuk revisi modul ajar..." : "Belum ada rekomendasi dari supervisor."}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-indigo-600 text-xs disabled:bg-slate-100"
              />
            </div>
          </div>

          {/* SECTION 4: PENGUNGGAHAN PERANGKAT HASIL REVISI (SETELAH PENILAIAN) */}
          <div className={`p-5 rounded-2xl border ${
            modulAjarRevisiUrl 
              ? 'bg-emerald-50/90 border-emerald-300' 
              : isReviewed 
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/40' 
              : 'bg-slate-50 border-slate-200'
          } space-y-4`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FolderSync className={`w-5 h-5 ${modulAjarRevisiUrl ? 'text-emerald-700' : 'text-amber-700'}`} />
                <h3 className="font-extrabold text-sm text-slate-900">
                  4. Unggah Perangkat Pembelajaran Hasil Revisi (Setelah Penilaian)
                </h3>
              </div>

              {modulAjarRevisiUrl ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Berkas Revisi Diunggah
                </span>
              ) : isReviewed ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Wajib Diunggah Guru
                </span>
              ) : (
                <span className="text-[11px] text-slate-500 italic">
                  (Aktif setelah telaah dinilai)
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Setelah dilakukan telaah dan penilaian oleh Pengawas/Kepala Sekolah di atas, guru <strong>wajib</strong> memperbaiki modul ajar sesuai umpan balik rekomendasi dan mengunggah tautan berkas hasil revisi di bawah ini.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Tautan Google Drive Modul Ajar / RPP Hasil Revisi:
                </label>

                {isSupervisor ? (
                  // Supervisor can only view
                  <div>
                    {modulAjarRevisiUrl ? (
                      <a
                        href={modulAjarRevisiUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold text-xs transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Buka Modul Ajar Revisi di Google Drive</span>
                      </a>
                    ) : (
                      <p className="text-xs text-slate-400 italic py-2">
                        Guru belum mengunggah berkas modul ajar revisi.
                      </p>
                    )}
                  </div>
                ) : (
                  // Guru can edit
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={modulAjarRevisiUrl}
                      onChange={(e) => setModulAjarRevisiUrl(e.target.value)}
                      placeholder="https://drive.google.com/file/d/... (Modul Ajar Revisi)"
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-emerald-600 text-xs font-mono"
                    />
                    {modulAjarRevisiUrl && (
                      <a
                        href={modulAjarRevisiUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shrink-0"
                        title="Buka Berkas Revisi"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Catatan Poin-Poin Perbaikan oleh Guru:
                </label>
                <textarea
                  rows={2}
                  disabled={!isGuru}
                  value={catatanRevisiGuru}
                  onChange={(e) => setCatatanRevisiGuru(e.target.value)}
                  placeholder="Jelaskan bagian apa saja yang telah disempurnakan (contoh: telah menambahkan rubrik KKTP, diferensiasi proses, simulasi digital)..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-emerald-600 text-xs disabled:bg-slate-100"
                />
              </div>

              {/* Supervisor Verification of Revision */}
              {isSupervisor && modulAjarRevisiUrl && (
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">Verifikasi Supervisor:</span>
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold text-emerald-800">
                      <input
                        type="checkbox"
                        checked={revisiStatus === 'disetujui'}
                        onChange={(e) => setRevisiStatus(e.target.checked ? 'disetujui' : 'sudah_diunggah')}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span>Tandai Perangkat Revisi Disetujui</span>
                    </label>
                  </div>
                  {supervision.perangkatAjar?.revisi?.revisiSubmittedAt && (
                    <span className="text-[11px] text-slate-500">
                      Diunggah guru: {new Date(supervision.perangkatAjar.revisi.revisiSubmittedAt).toLocaleDateString('id-ID')}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
            <div className="text-xs text-slate-500 text-center sm:text-left">
              {supervision.perangkatAjar?.reviewedAt ? (
                <span>Status: <strong>Telah Dinilai oleh {supervision.perangkatAjar.reviewedBy || 'Pengawas'}</strong></span>
              ) : (
                <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                  Status: Menunggu Penilaian / Telaah Pengawas
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium text-xs"
              >
                Tutup
              </button>

              {/* GURU ACTION BUTTONS */}
              {isGuru && (
                <>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSaveData(true)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-300 disabled:opacity-50 transition-colors"
                    title="Simpan kemajuan bertahap meskipun belum semua berkas diunggah"
                  >
                    <Save className="w-3.5 h-3.5 text-slate-600" />
                    <span>Simpan Draf Berkala</span>
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSaveData(false)}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-200 disabled:opacity-50 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Menyimpan...' : 'Simpan & Ajukan ke Pengawas'}</span>
                  </button>
                </>
              )}

              {/* SUPERVISOR ACTION BUTTON */}
              {isSupervisor && (
                <>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSaveData(true)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-300 disabled:opacity-50 transition-colors"
                    title="Simpan tautan Drive dan catatan draf sementara tanpa menutup modal"
                  >
                    <Save className="w-3.5 h-3.5 text-slate-600" />
                    <span>Simpan Draf Berkas</span>
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSaveData(false)}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-200 disabled:opacity-50 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Menyimpan...' : 'Simpan Berkas, Telaah & Rekomendasi'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
