import React from 'react';
import { 
  ShieldCheck, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { UserProfile } from '../types';

interface LandingPageProps {
  onOpenAuth: () => void;
  currentUser?: UserProfile | null;
  onGoToDashboard?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  currentUser,
  onGoToDashboard,
}) => {
  return (
    <div className="flex-1 bg-slate-900 min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs sm:text-sm font-medium mb-6 backdrop-blur-xs">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Sistem Informasi Pengawasan, Pendampingan, dan Evaluasi Guru SMA</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 leading-tight">
            SIKLUS <span className="text-indigo-400">SAMBUNG</span>
          </h1>
          <p className="text-xl sm:text-2xl font-light text-indigo-200 italic mb-6">
            &ldquo;Merangkai Aksi, Menggerakkan Perubahan Menuju Pembelajaran Bermakna.&rdquo;
          </p>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed mb-8">
            Platform supervisi akademik terintegrasi untuk mendukung pendampingan guru, pemantauan praktik pembelajaran, dokumentasi bukti perubahan, dan tindak lanjut secara berkelanjutan.
          </p>

          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 max-w-xl mx-auto mb-10 shadow-lg backdrop-blur-xs">
            <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-1">
              Diinisiasi &amp; Dibina Oleh:
            </p>
            <p className="text-lg font-bold text-white flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              Kusnandar, M.Si
            </p>
            <p className="text-xs text-indigo-300 mt-0.5">Pengawas Pembina &amp; Pengembang Mutu SMA</p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {currentUser && onGoToDashboard ? (
              <>
                <button
                  onClick={onGoToDashboard}
                  className="px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 flex items-center gap-2.5 transition-all hover:scale-102"
                >
                  <span>Buka Dashboard ({currentUser.displayName})</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={onOpenAuth}
                  className="px-6 py-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-colors"
                >
                  <span>Ganti / Masuk Akun Lain</span>
                </button>
              </>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 flex items-center gap-2.5 transition-all hover:scale-102"
              >
                <span>Masuk ke Sistem Supervisi</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Real Cloud System Status */}
          <div className="mt-12 pt-6 border-t border-slate-800/80 max-w-xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-slate-300 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-medium">Tersinkronisasi ke Cloud Database</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
