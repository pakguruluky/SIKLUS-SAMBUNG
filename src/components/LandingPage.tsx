import React from 'react';
import { 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  BookOpen,
  LayoutDashboard,
  CheckCircle2,
  Database
} from 'lucide-react';
import { UserProfile } from '../types';

interface LandingPageProps {
  onOpenAuth: () => void;
  currentUser?: UserProfile | null;
  onGoToDashboard?: () => void;
  onGoToSambung?: () => void;
  onGoToKesimpulan?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  currentUser,
  onGoToDashboard,
  onGoToSambung,
  onGoToKesimpulan,
}) => {
  // 7 Tahapan Siklus SAMBUNG
  const sambungSteps = [
    { code: 'S', title: 'Selidiki', desc: 'Refleksi Awal' },
    { code: 'A', title: 'Amati', desc: 'Observasi Kelas' },
    { code: 'M', title: 'Maknai', desc: 'Diskusi & Refleksi' },
    { code: 'B', title: 'Berdayakan', desc: 'Rencana Tindak' },
    { code: 'U', title: 'Uji', desc: 'Praktik Nyata' },
    { code: 'N', title: 'Nyatakan', desc: 'Bukti Perubahan' },
    { code: 'G', title: 'Gerakkan', desc: 'Diseminasi Budaya' },
  ];

  return (
    <div className="flex-1 bg-slate-950 text-white min-h-[calc(100dvh-4rem)] lg:h-[calc(100dvh-4rem)] flex flex-col justify-between overflow-y-auto lg:overflow-hidden relative select-none">
      {/* Background Glow & Pattern */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-indigo-600/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[300px] bg-sky-600/10 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </div>

      {/* Main Content Area - Balanced for Zero-Scroll Viewport */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-7 flex-1 flex flex-col justify-center items-center text-center">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 text-xs sm:text-sm font-medium mb-3 sm:mb-4 backdrop-blur-md shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span>Sistem Informasi Pengawasan &amp; Evaluasi Guru SMA</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5.5xl font-extrabold tracking-tight mb-2 sm:mb-3 leading-tight">
          SIKLUS <span className="bg-gradient-to-r from-indigo-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent">SAMBUNG</span>
        </h1>

        {/* Motto / Slogan */}
        <p className="text-base sm:text-lg md:text-xl font-medium text-indigo-200/90 italic mb-3 sm:mb-4 max-w-2xl">
          &ldquo;Merangkai Aksi, Menggerakkan Perubahan Menuju Pembelajaran Bermakna.&rdquo;
        </p>

        {/* Concise Description */}
        <p className="text-xs sm:text-sm text-slate-300/90 max-w-2xl leading-relaxed mb-4 sm:mb-5">
          Platform supervisi akademik terintegrasi untuk pendampingan guru SMA, pemantauan praktik pembelajaran, dokumentasi bukti perubahan, dan tindak lanjut evaluasi berkelanjutan.
        </p>

        {/* 7 Tahapan Siklus SAMBUNG Strip */}
        <div className="w-full max-w-4xl bg-slate-900/80 border border-slate-800/90 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 mb-4 sm:mb-5 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
            <span>Alur 7 Tahapan Supervisi SAMBUNG</span>
            <span className="text-indigo-400 normal-case font-medium hidden sm:inline">Terintegrasi Instrumen &amp; Firestore</span>
          </div>
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {sambungSteps.map((step, idx) => (
              <div 
                key={step.code}
                className="group flex flex-col items-center p-1.5 sm:p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 hover:border-indigo-500/60 hover:bg-slate-800 transition-all text-center"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-black text-[11px] sm:text-xs flex items-center justify-center mb-1 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {step.code}
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-200 truncate w-full">
                  {step.title}
                </span>
                <span className="text-[8px] sm:text-[9px] text-slate-400 truncate w-full hidden md:block">
                  {step.desc}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Inisiasi & Pembina Card */}
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-left mb-4 sm:mb-6 shadow-md backdrop-blur-md">
          <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="leading-tight">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Diinisiasi &amp; Dibina Oleh:
            </p>
            <p className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
              <span>Kusnandar, M.Si</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </p>
            <p className="text-[11px] text-indigo-300">Pengawas Pembina &amp; Pengembang Mutu SMA</p>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
          {currentUser ? (
            <>
              {onGoToDashboard && (
                <button
                  onClick={onGoToDashboard}
                  className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-102 active:scale-98"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Buka Dashboard ({currentUser.displayName})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {onGoToSambung && (
                <button
                  onClick={onGoToSambung}
                  className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700 flex items-center gap-2 transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span>Instrumen SAMBUNG</span>
                </button>
              )}

              <button
                onClick={onOpenAuth}
                className="px-3.5 py-2.5 sm:py-3 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors"
              >
                Ganti Akun
              </button>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-7 sm:px-8 py-3 sm:py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-indigo-600/30 flex items-center gap-2.5 transition-all hover:scale-102 active:scale-98"
            >
              <span>Masuk ke Sistem Supervisi</span>
              <ArrowRight className="w-4.5 h-4.5" />
            </button>
          )}
        </div>
      </div>

      {/* Integrated Single-Page Footer Bar */}
      <footer className="relative z-10 w-full border-t border-slate-800/90 bg-slate-950/80 backdrop-blur-md py-2.5 sm:py-3 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] sm:text-xs text-slate-400">
          {/* Cloud Status */}
          <div className="inline-flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium text-slate-300">Firebase Firestore Cloud Aktif</span>
          </div>

          {/* Copyright */}
          <div className="text-slate-400 font-medium">
            &copy; {new Date().getFullYear()} <span className="text-amber-400 font-semibold">Pak Kus &amp; Pak GuruAI</span> &bull; Prov. Jawa Barat
          </div>
        </div>
      </footer>
    </div>
  );
};
