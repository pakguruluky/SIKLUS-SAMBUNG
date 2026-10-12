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
  BookOpen,
  HardDrive,
  Sparkles,
  Users,
  Home
} from 'lucide-react';

interface NavbarProps {
  currentUser: UserProfile | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onNewSupervision: () => void;
  onOpenLocalStorageModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onLogout,
  onNewSupervision,
  onOpenLocalStorageModal,
}) => {
  const getRoleLabel = (role: Role) => {
    switch (role) {
      case 'admin':
      case 'pengawas':
        return 'Pengawas Pembina / Admin';
      case 'kepsek':
        return 'Kepala Sekolah';
      case 'guru':
        return 'Guru Mapel';
      default:
        return 'Pengawas Pembina';
    }
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer select-none shrink-0 min-w-fit" 
            onClick={() => setActiveTab('landing')}
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="leading-tight shrink-0 whitespace-nowrap">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 whitespace-nowrap">
                  SIKLUS <span className="text-indigo-600">SAMBUNG</span>
                </span>
                <span className="text-[10px] font-bold text-slate-500 border border-slate-200 bg-slate-50 px-1 py-0.2 rounded">
                  SMA
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium hidden lg:block whitespace-nowrap">
                Sistem Supervisi Akademik
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          {currentUser && (
            <div className="hidden md:flex items-center gap-0.5 lg:gap-1 xl:gap-1.5 shrink min-w-0">
              <button
                onClick={() => setActiveTab('landing')}
                className={`px-2 lg:px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeTab === 'landing'
                    ? 'bg-indigo-50 text-indigo-700 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Home className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Beranda</span>
              </button>

              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-2 lg:px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeTab === 'dashboard'
                    ? 'bg-indigo-50 text-indigo-700 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Dashboard</span>
              </button>

              {(currentUser.role === 'admin' || (currentUser.role as string) === 'pengawas') && (
                <>
                  <button
                    onClick={() => setActiveTab('schools')}
                    title="Sekolah Binaan"
                    className={`px-2 lg:px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                      activeTab === 'schools'
                        ? 'bg-indigo-50 text-indigo-700 font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="hidden xl:inline">Sekolah Binaan</span>
                    <span className="xl:hidden">Sekolah</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('users')}
                    title="Kelola Pengguna"
                    className={`px-2 lg:px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                      activeTab === 'users'
                        ? 'bg-indigo-50 text-indigo-700 font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="hidden xl:inline">Kelola Pengguna</span>
                    <span className="xl:hidden">Pengguna</span>
                  </button>
                </>
              )}

              <button
                onClick={() => setActiveTab('sambung')}
                title="Instrumen Siklus SAMBUNG"
                className={`px-2 lg:px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeTab === 'sambung'
                    ? 'bg-indigo-50 text-indigo-700 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="hidden xl:inline">Instrumen SAMBUNG</span>
                <span className="xl:hidden">Instrumen</span>
              </button>

              <button
                onClick={() => setActiveTab('kesimpulan-sambung')}
                title="Kesimpulan Siklus SAMBUNG"
                className={`px-2 lg:px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeTab === 'kesimpulan-sambung'
                    ? 'bg-gradient-to-r from-amber-50 to-indigo-50 text-indigo-900 font-bold border border-amber-200/60 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="hidden xl:inline">Kesimpulan SAMBUNG</span>
                <span className="xl:hidden">Kesimpulan</span>
              </button>
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {currentUser ? (
              <>
                <button
                  onClick={onNewSupervision}
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors whitespace-nowrap shrink-0"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Supervisi Baru</span>
                  <span className="lg:hidden">+ Supervisi</span>
                </button>

                {onOpenLocalStorageModal && (
                  <button
                    onClick={onOpenLocalStorageModal}
                    title="Penyimpanan Cloud Firebase & Cadangan Lokal"
                    className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-xs font-semibold transition-all shadow-2xs whitespace-nowrap shrink-0"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <HardDrive className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="hidden 2xl:inline text-[11px] font-bold text-slate-700">Firebase &amp; Backup</span>
                    <span className="hidden sm:inline 2xl:hidden text-[11px] font-bold text-slate-700">Cloud</span>
                  </button>
                )}

                <div className="hidden lg:flex flex-col items-end leading-tight pl-2 border-l border-slate-200 shrink-0">
                  <span className="text-xs font-bold text-slate-900 truncate max-w-[110px] xl:max-w-[150px]">{currentUser.displayName}</span>
                  <span className="text-[10px] text-slate-400 font-medium truncate max-w-[110px] xl:max-w-[150px]">
                    {getRoleLabel(currentUser.role)}
                  </span>
                </div>

                <button
                  onClick={onLogout}
                  title="Keluar"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('landing')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                    activeTab === 'landing' ? 'text-indigo-600 font-bold bg-indigo-50' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Beranda
                </button>
                <button
                  onClick={onOpenAuth}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors whitespace-nowrap"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Masuk / Daftar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav bar if logged in */}
      {currentUser && (
        <div className="md:hidden border-t border-slate-200 px-4 py-2 flex items-center justify-around bg-slate-50 text-[11px]">
          <button
            onClick={() => setActiveTab('landing')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'landing' ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}
          >
            <Home className="w-4 h-4" />
            <span>Beranda</span>
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          {currentUser.role === 'admin' && (
            <button
              onClick={() => setActiveTab('schools')}
              className={`flex flex-col items-center gap-1 ${activeTab === 'schools' ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}
            >
              <Building2 className="w-4 h-4" />
              <span>Sekolah Binaan</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('sambung')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'sambung' ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Instrumen</span>
          </button>
          <button
            onClick={() => setActiveTab('kesimpulan-sambung')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'kesimpulan-sambung' ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Kesimpulan</span>
          </button>
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
