import React from 'react';
import { UserProfile, Role } from '../types';
import { 
  GraduationCap, 
  BarChart3, 
  FileText, 
  Building2, 
  PlusCircle, 
  LogOut, 
  LogIn, 
  ShieldCheck, 
  UserCheck, 
  BookOpen,
  Sparkles,
  Compass
} from 'lucide-react';

interface NavbarProps {
  currentUser: UserProfile | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onNewSupervision: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onLogout,
  onNewSupervision,
}) => {
  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            Pengawas / Admin
          </span>
        );
      case 'kepsek':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <UserCheck className="w-3.5 h-3.5" />
            Kepala Sekolah
          </span>
        );
      case 'guru':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <GraduationCap className="w-3.5 h-3.5" />
            Guru Mata Pelajaran
          </span>
        );
    }
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  SIKLUS <span className="text-indigo-600">SAMBUNG</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 uppercase tracking-wider">
                  SMA
                </span>
              </div>
              <p className="text-[11px] text-slate-500 -mt-0.5 font-medium hidden sm:block">
                Mendampingi Guru, Meningkatkan Mutu
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          {currentUser && (
            <div className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'dashboard'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Dashboard Analitik
              </button>

              <button
                onClick={() => setActiveTab('supervisions')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'supervisions'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                {currentUser.role === 'guru' ? 'Hasil Penilaian Saya' : 'Daftar Supervisi Guru'}
              </button>

              <button
                onClick={() => setActiveTab('sambung')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                  activeTab === 'sambung'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                <Sparkles className={`w-4 h-4 ${activeTab === 'sambung' ? 'text-amber-300' : 'text-indigo-600'}`} />
                <span>Instrumen SAMBUNG</span>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${
                  activeTab === 'sambung' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-800'
                }`}>
                  S-G
                </span>
              </button>

              {currentUser.role === 'admin' && (
                <button
                  onClick={() => setActiveTab('schools')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    activeTab === 'schools'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Target Sekolah
                </button>
              )}
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <>
                {(currentUser.role === 'admin' || currentUser.role === 'kepsek' || currentUser.role === 'guru') && (
                  <button
                    onClick={onNewSupervision}
                    className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all hover:shadow-indigo-200"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Mulai Supervisi</span>
                  </button>
                )}

                <div className="hidden lg:flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">{currentUser.displayName}</span>
                    {getRoleBadge(currentUser.role)}
                  </div>
                  {currentUser.schoolName && (
                    <span className="text-[11px] text-slate-500 font-medium">
                      {currentUser.schoolName}
                    </span>
                  )}
                </div>

                <button
                  onClick={onLogout}
                  title="Keluar Akun"
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('landing')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                    activeTab === 'landing' ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Beranda
                </button>
                <button
                  onClick={onOpenAuth}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Masuk / Daftar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav bar if logged in */}
      {currentUser && (
        <div className="md:hidden border-t border-slate-200 px-4 py-2 flex items-center justify-around bg-slate-50 text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-indigo-600 font-bold' : 'text-slate-600'}`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analitik</span>
          </button>
          <button
            onClick={() => setActiveTab('supervisions')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'supervisions' ? 'text-indigo-600 font-bold' : 'text-slate-600'}`}
          >
            <FileText className="w-4 h-4" />
            <span>{currentUser.role === 'guru' ? 'Hasil Nilai' : 'Supervisi'}</span>
          </button>
          <button
            onClick={() => setActiveTab('sambung')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'sambung' ? 'text-indigo-600 font-bold' : 'text-slate-600'}`}
          >
            <Sparkles className="w-4 h-4" />
            <span>SAMBUNG</span>
          </button>
          {currentUser.role === 'admin' && (
            <button
              onClick={() => setActiveTab('schools')}
              className={`flex flex-col items-center gap-1 ${activeTab === 'schools' ? 'text-indigo-600 font-bold' : 'text-slate-600'}`}
            >
              <Building2 className="w-4 h-4" />
              <span>Sekolah</span>
            </button>
          )}
          <button
            onClick={onNewSupervision}
            className="flex flex-col items-center gap-1 text-indigo-600 font-semibold"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Baru</span>
          </button>
        </div>
      )}
    </nav>
  );
};
