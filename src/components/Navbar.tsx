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
  BookOpen
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
  const getRoleLabel = (role: Role) => {
    switch (role) {
      case 'admin':
        return 'Pengawas Pembina';
      case 'kepsek':
        return 'Kepala Sekolah';
      case 'guru':
        return 'Guru Mapel';
    }
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none shrink-0" 
            onClick={() => setActiveTab(currentUser ? 'dashboard' : 'landing')}
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  SIKLUS <span className="text-indigo-600">SAMBUNG</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 border border-slate-200 px-1 py-0.2 rounded">
                  SMA
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Sistem Supervisi Akademik
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          {currentUser && (
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'dashboard'
                    ? 'bg-slate-100 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('supervisions')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'supervisions'
                    ? 'bg-slate-100 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>{currentUser.role === 'guru' ? 'Hasil Supervisi' : 'Daftar Supervisi'}</span>
              </button>

              <button
                onClick={() => setActiveTab('sambung')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'sambung'
                    ? 'bg-slate-100 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>Instrumen SAMBUNG</span>
              </button>

              {currentUser.role === 'admin' && (
                <button
                  onClick={() => setActiveTab('schools')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    activeTab === 'schools'
                      ? 'bg-slate-100 text-indigo-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sekolah Binaan</span>
                </button>
              )}
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {currentUser ? (
              <>
                <button
                  onClick={onNewSupervision}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Supervisi Baru</span>
                </button>

                <div className="hidden lg:flex flex-col items-end leading-tight pl-3 border-l border-slate-200">
                  <span className="text-xs font-bold text-slate-900">{currentUser.displayName}</span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {getRoleLabel(currentUser.role)}
                    {currentUser.schoolName ? ` · ${currentUser.schoolName}` : ''}
                  </span>
                </div>

                <button
                  onClick={onLogout}
                  title="Keluar"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('landing')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                    activeTab === 'landing' ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Beranda
                </button>
                <button
                  onClick={onOpenAuth}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
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
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('supervisions')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'supervisions' ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}
          >
            <FileText className="w-4 h-4" />
            <span>{currentUser.role === 'guru' ? 'Hasil' : 'Supervisi'}</span>
          </button>
          <button
            onClick={() => setActiveTab('sambung')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'sambung' ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}
          >
            <BookOpen className="w-4 h-4" />
            <span>SAMBUNG</span>
          </button>
          {currentUser.role === 'admin' && (
            <button
              onClick={() => setActiveTab('schools')}
              className={`flex flex-col items-center gap-1 ${activeTab === 'schools' ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}
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
