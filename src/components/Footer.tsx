import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-center no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              SS
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-white">SIKLUS SAMBUNG</p>
              <p className="text-xs text-slate-400">Sistem Informasi Pengawasan, Pendampingan, dan Evaluasi Guru SMA</p>
            </div>
          </div>
          <div className="text-sm font-medium text-amber-400 tracking-wide">
            @copyright by Pak Kus &amp; Pak GuruAI
          </div>
          <p className="text-xs text-slate-500">
            Mendampingi Guru, Meningkatkan Mutu &bull; Prov. Jawa Barat
          </p>
        </div>
      </div>
    </footer>
  );
};
