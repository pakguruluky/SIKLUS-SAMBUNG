import React, { useState, useRef } from 'react';
import { 
  HardDrive, 
  Download, 
  Upload, 
  CheckCircle2, 
  RefreshCw, 
  X, 
  Database,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { Supervision, School, UserProfile } from '../types';
import { 
  exportDataToLocalFile, 
  readBackupFromFile, 
  getLocalStorageInfo, 
  saveLocalSupervisions, 
  saveLocalSchools 
} from '../services/localStorageService';

interface LocalStorageBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  supervisions: Supervision[];
  schools: School[];
  currentUser: UserProfile | null;
  onRestoreData: (supervisions: Supervision[], schools: School[]) => void;
}

export const LocalStorageBackupModal: React.FC<LocalStorageBackupModalProps> = ({
  isOpen,
  onClose,
  supervisions,
  schools,
  currentUser,
  onRestoreData,
}) => {
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const storageInfo = getLocalStorageInfo();

  const handleExport = () => {
    try {
      setIsProcessing(true);
      exportDataToLocalFile(supervisions, schools, currentUser);
      setSuccessMessage('Berkas cadangan (.json) berhasil diunduh ke folder unduhan perangkat Anda.');
      setTimeout(() => setSuccessMessage(''), 6000);
    } catch (err: any) {
      setErrorMessage('Gagal mengunduh berkas cadangan: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      setErrorMessage('');
      setSuccessMessage('');
      const restored = await readBackupFromFile(file);
      
      // Save directly to localStorage
      saveLocalSupervisions(restored.supervisions);
      if (restored.schools.length > 0) {
        saveLocalSchools(restored.schools);
      }

      // Propagate to App state
      onRestoreData(restored.supervisions, restored.schools);
      setSuccessMessage(`Berhasil memulihkan ${restored.supervisions.length} berkas supervisi dari perangkat!`);
      setTimeout(() => setSuccessMessage(''), 6000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memulihkan berkas.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleForceSync = () => {
    saveLocalSupervisions(supervisions);
    saveLocalSchools(schools);
    setSuccessMessage('Data terbaru telah disinkronkan ke Penyimpanan Lokal (Local Storage) perangkat.');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Penyimpanan Lokal Perangkat</h3>
              <p className="text-xs text-slate-500">Local Storage Device &amp; Cadangan Mandiri</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Status Card */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 leading-relaxed">
              <p className="font-bold text-emerald-900">Penyimpanan Lokal Aktif &amp; Terlindungi</p>
              <p className="mt-0.5 text-slate-600">
                Setiap perubahan pada instrumen telaah, observasi kelas, dan evaluasi tahunan otomatis tersimpan di peramban (browser) perangkat Anda.
              </p>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 block">Supervisi Lokal</span>
              <span className="text-lg font-bold text-slate-900">{supervisions.length}</span>
              <span className="text-[10px] text-slate-400 block">Berkas</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 block">Sekolah Target</span>
              <span className="text-lg font-bold text-slate-900">{schools.length}</span>
              <span className="text-[10px] text-slate-400 block">Satuan Pend.</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 block">Ukuran Data</span>
              <span className="text-lg font-bold text-slate-900">{storageInfo.sizeKb} KB</span>
              <span className="text-[10px] text-slate-400 block">Di Memori HP/PC</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <button
              onClick={handleExport}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Unduh File Cadangan Lengkap (.JSON)</span>
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors border border-slate-200"
              >
                <Upload className="w-4 h-4 text-slate-500" />
                <span>Pulihkan dari File</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
              />

              <button
                onClick={handleForceSync}
                disabled={isProcessing}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors border border-slate-200"
              >
                <RefreshCw className="w-4 h-4 text-slate-500" />
                <span>Simpan Ulang Sekarang</span>
              </button>
            </div>
          </div>

          {/* Feedback messages */}
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <p className="text-[11px] text-slate-400 text-center">
            Penyimpanan lokal device memastikan berkas supervisi Anda tetap dapat dibuka dan diedit saat jaringan lambat atau terputus.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
