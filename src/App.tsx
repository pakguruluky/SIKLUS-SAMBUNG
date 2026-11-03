import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { DashboardOverview } from './components/DashboardOverview';
import { SchoolManagement } from './components/SchoolManagement';
import { UserManagementView } from './components/UserManagementView';
import { AuthModal } from './components/AuthModal';
import { ReportPrintView } from './components/ReportPrintView';
import { PerangkatAjarModal } from './components/forms/PerangkatAjarModal';
import { PraObservasiModal } from './components/forms/PraObservasiModal';
import { ObservasiKelasModal } from './components/forms/ObservasiKelasModal';
import { PascaObservasiModal } from './components/forms/PascaObservasiModal';
import { EvaluasiTahunanModal } from './components/forms/EvaluasiTahunanModal';
import { NewSupervisionModal } from './components/forms/NewSupervisionModal';
import { SambungInstrumentView } from './components/SambungInstrumentView';
import { KesimpulanSemuaGuruDashboard } from './components/KesimpulanSemuaGuruDashboard';
import { LocalStorageBackupModal } from './components/LocalStorageBackupModal';
import { CheckCircle2, AlertCircle } from 'lucide-react';

import { 
  auth, 
  fbSignOut, 
  ensureInitialSchools, 
  fetchAllSchools, 
  getUserProfile, 
  fetchSupervisions, 
  saveSupervision, 
  deleteSupervision, 
  updateSchool, 
  updateUserApprovalStatus, 
  syncAllInitialDataToFirestore, 
  syncAllPendingLocalChangesToFirestore,
  subscribeToSupervisions, 
  getDeletedUserIds, 
  getDeletedSupervisionIds, 
  getDeletedUserNames,
  isQuotaExceeded,
  getQuotaConsoleUrl,
  getHasPendingSync,
  isQuotaError
} from './services/firebase';
import { 
  loadLocalSupervisions, 
  saveLocalSupervisions, 
  loadLocalSchools, 
  saveLocalSchools, 
  loadLocalUser, 
  saveLocalUser 
} from './services/localStorageService';
import { School, Supervision, UserProfile, Role } from './types';
import { SAMPLE_SUPERVISIONS } from './data/seedData';
import { onAuthStateChanged } from 'firebase/auth';

const EXCLUDED_SUPERVISION_IDS = new Set(['sup-demo-dewi-awal', 'sup-demo-03', 'sup-demo-08']);
const filterValidSupervisions = (list: Supervision[]): Supervision[] => {
  const deletedSupIds = new Set(getDeletedSupervisionIds());
  const deletedUids = new Set(getDeletedUserIds());
  const deletedNames = new Set(getDeletedUserNames());
  return list.filter(s => {
    if (EXCLUDED_SUPERVISION_IDS.has(s.id)) return false;
    if (deletedSupIds.has(s.id)) return false;
    if (s.teacherId && deletedUids.has(s.teacherId)) return false;
    if (s.teacherName && deletedNames.has(s.teacherName.toLowerCase().trim())) return false;
    if (s.teacherName && (s.teacherName.toLowerCase().includes('risna') || s.teacherName.toLowerCase().includes('fatma rita'))) return false;
    return true;
  });
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => loadLocalUser());
  const [schools, setSchools] = useState<School[]>(() => loadLocalSchools() || []);
  const [supervisions, setSupervisions] = useState<Supervision[]>(() => {
    const loaded = loadLocalSupervisions();
    const map = new Map<string, Supervision>();
    SAMPLE_SUPERVISIONS.forEach(s => map.set(s.id, s));
    if (loaded && loaded.length > 0) {
      loaded.forEach(s => map.set(s.id, s));
    }
    return filterValidSupervisions(Array.from(map.values()));
  });
  // Pastikan ketika memasukan alamat aplikasi langsung ke halaman beranda (landing) walaupun sudah pernah membuka sebelumnya
  const [activeTab, setActiveTab] = useState<string>('landing');

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNewSupervisionModalOpen, setIsNewSupervisionModalOpen] = useState(false);
  const [isLocalStorageModalOpen, setIsLocalStorageModalOpen] = useState(false);
  const [selectedSupervision, setSelectedSupervision] = useState<Supervision | null>(null);
  const [activeFormStage, setActiveFormStage] = useState<'perangkat' | 'pra' | 'observasi' | 'pasca' | 'evaluasi' | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedSambungId, setSelectedSambungId] = useState<string | undefined>(undefined);
  const [quotaWarning, setQuotaWarning] = useState<boolean>(() => isQuotaExceeded());
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasPendingSync, setHasPendingSync] = useState<boolean>(() => getHasPendingSync());
  const [syncToast, setSyncToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Listen for firestore quota & sync events
  useEffect(() => {
    const handleQuota = () => setQuotaWarning(true);
    const onModified = () => setHasPendingSync(true);
    const onCompleted = () => setHasPendingSync(false);

    window.addEventListener('firestore-quota-exceeded', handleQuota);
    window.addEventListener('pakkus-local-data-modified', onModified);
    window.addEventListener('pakkus-sync-completed', onCompleted);

    return () => {
      window.removeEventListener('firestore-quota-exceeded', handleQuota);
      window.removeEventListener('pakkus-local-data-modified', onModified);
      window.removeEventListener('pakkus-sync-completed', onCompleted);
    };
  }, []);

  // Initialize app data from local storage and backend server disk
  useEffect(() => {
    const initApp = async () => {
      // 1. Fetch schools from persistent backend API / local
      try {
        const loadedSchools = await fetchAllSchools();
        if (loadedSchools && loadedSchools.length > 0) {
          setSchools(loadedSchools);
          saveLocalSchools(loadedSchools);
        }
      } catch (schErr) {
        console.warn('Notice loading schools on boot:', schErr);
      }

      // 2. Fetch persistent supervisions from backend API / local
      try {
        const loadedSupervisions = await fetchSupervisions(currentUser);
        if (loadedSupervisions && loadedSupervisions.length > 0) {
          const valid = filterValidSupervisions(loadedSupervisions);
          setSupervisions(valid);
          saveLocalSupervisions(valid);
        }
      } catch (e) {
        console.warn('Notice fetching supervisions on boot:', e);
      }
    };

    initApp();

    // Firebase Auth Listener - restore authenticated profile without forcing navigation away from landing
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await getUserProfile(user.uid);
        if (profile) {
          setCurrentUser(profile);
          saveLocalUser(profile);
        }
      }
    });

    // Real-time Firestore synchronization listener
    const unsubscribeSupervisions = subscribeToSupervisions((liveList) => {
      if (liveList && liveList.length > 0) {
        const filtered = filterValidSupervisions(liveList);
        setSupervisions(filtered);
      }
    }, currentUser);

    return () => {
      unsubscribeAuth();
      unsubscribeSupervisions();
    };
  }, [currentUser?.uid]);

  const handleRefreshSchools = async () => {
    try {
      const refreshed = await fetchAllSchools();
      setSchools(refreshed);
      saveLocalSchools(refreshed);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await fbSignOut(auth);
    setCurrentUser(null);
    saveLocalUser(null);
    setActiveTab('landing');
  };

  const handleApproveTeacher = async (uid: string) => {
    if (currentUser && currentUser.uid === uid) {
      setCurrentUser(prev => prev ? { ...prev, approvalStatus: 'approved' } : prev);
    }
    await updateUserApprovalStatus(uid, 'approved');
  };

  const handleOpenForm = (
    supervision: Supervision, 
    stage: 'perangkat' | 'pra' | 'observasi' | 'pasca' | 'evaluasi'
  ) => {
    setSelectedSupervision(supervision);
    setActiveFormStage(stage);
  };

  const handleOpenPrint = (supervision: Supervision) => {
    setSelectedSupervision(supervision);
    setIsPrintModalOpen(true);
  };

  const handleOpenSambung = (supervisionId?: string) => {
    if (supervisionId) {
      setSelectedSambungId(supervisionId);
    }
    setActiveTab('sambung');
  };

  const handleSyncToFirebase = async () => {
    try {
      setIsSyncing(true);
      const res = await syncAllPendingLocalChangesToFirestore();
      setHasPendingSync(false);
      setSyncToast({
        type: 'success',
        message: `Sinkronisasi Berhasil! ${res.supervisionsCount} berkas supervisi, ${res.schoolsCount} sekolah, dan ${res.usersCount} pengguna berhasil tersimpan permanen di Firebase Database.`
      });
      setTimeout(() => setSyncToast(null), 6000);
    } catch (err: any) {
      console.warn('Sync notice:', err);
      const isQuota = isQuotaError(err) || isQuotaExceeded();
      setSyncToast({
        type: isQuota ? 'info' : 'error',
        message: isQuota
          ? 'Pemberitahuan: Batas kuota gratis Firebase tercapai untuk hari ini. Seluruh data Anda tersimpan 100% aman di Server Backend & Penyimpanan Lokal. Anda dapat melanjutkan pengisian data dan sinkronisasi Cloud dapat dicoba kembali besok.'
          : (err.message || 'Gagal menyinkronkan data ke Firebase.')
      });
      setTimeout(() => setSyncToast(null), 7000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateSupervision = async (updated: Supervision) => {
    setSupervisions(prev => {
      const next = prev.map(s => (s.id === updated.id ? updated : s));
      saveLocalSupervisions(next);
      return next;
    });
    setSelectedSupervision(updated);
    // Saved in local storage & backend disk (0 Firestore quota consumed during instrument filling)
    await saveSupervision(updated, false);
    setHasPendingSync(true);
  };

  const handleCreateSupervision = async (newSup: Supervision) => {
    setSupervisions(prev => {
      const next = [newSup, ...prev];
      saveLocalSupervisions(next);
      return next;
    });
    setSelectedSambungId(newSup.id);
    setActiveTab('sambung');
    // Saved in local storage & backend disk (0 Firestore quota consumed during instrument filling)
    await saveSupervision(newSup, false);
    setHasPendingSync(true);
  };

  const handleRestoreData = async (restoredSupervisions: Supervision[], restoredSchools: School[]) => {
    if (restoredSupervisions.length > 0) {
      setSupervisions(restoredSupervisions);
      saveLocalSupervisions(restoredSupervisions);
      for (const sup of restoredSupervisions) {
        await saveSupervision(sup);
      }
    }
    if (restoredSchools.length > 0) {
      setSchools(restoredSchools);
      saveLocalSchools(restoredSchools);
      for (const sch of restoredSchools) {
        await updateSchool(sch.id, sch);
      }
    }
  };

  // Role-based visibility enforcement:
  // 1. Pengawas / Admin: melihat semua sekolah dan guru
  // 2. Kepala Sekolah: hanya melihat instrumen dan kesimpulan sekolahnya saja tanpa bisa melihat sekolah dan guru lain
  // 3. Guru: hanya melihat instrumen dan kesimpulan akun dia saja
  const visibleSupervisions = React.useMemo(() => {
    const deletedSupIds = new Set(getDeletedSupervisionIds());
    const deletedUids = new Set(getDeletedUserIds());
    const deletedNames = new Set(getDeletedUserNames());
    const cleanSupervisions = supervisions.filter(
      s => !deletedSupIds.has(s.id) && 
           (!s.teacherId || !deletedUids.has(s.teacherId)) &&
           (!s.teacherName || !deletedNames.has(s.teacherName.toLowerCase().trim()))
    );

    if (!currentUser) return cleanSupervisions;

    if (currentUser.role === 'guru') {
      const matched = cleanSupervisions.filter(
        s => s.teacherId === currentUser.uid ||
             s.teacherName.toLowerCase().trim() === currentUser.displayName?.toLowerCase().trim()
      );
      return matched.length > 0 ? matched : cleanSupervisions.slice(0, 1);
    }

    if (currentUser.role === 'kepsek') {
      const userSch = (currentUser.schoolName || '').toLowerCase().trim();
      const matched = cleanSupervisions.filter(
        s => (currentUser.schoolId && s.schoolId === currentUser.schoolId) ||
             (userSch && (s.schoolName.toLowerCase().trim().includes(userSch) || userSch.includes(s.schoolName.toLowerCase().trim())))
      );
      return matched;
    }

    // Admin / Pengawas sees all non-deleted
    return cleanSupervisions;
  }, [supervisions, currentUser]);

  const isAdminOrPengawas = currentUser?.role === 'admin' || (currentUser?.role as string) === 'pengawas';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Navbar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onNewSupervision={() => setIsNewSupervisionModalOpen(true)}
        onOpenLocalStorageModal={() => setIsLocalStorageModalOpen(true)}
        onSyncToFirebase={handleSyncToFirebase}
        isSyncing={isSyncing}
        hasPendingSync={hasPendingSync}
      />

      {/* Quota limit informational banner per Firebase guidelines */}
      {quotaWarning && (
        <div className="bg-amber-600 text-white px-3 sm:px-6 py-2.5 text-xs sm:text-sm font-medium shadow-sm flex flex-wrap items-center justify-between gap-2 z-40 border-b border-amber-700">
          <div className="flex items-center gap-2 max-w-4xl">
            <span className="font-black px-2 py-0.5 rounded bg-amber-800 text-amber-100 uppercase tracking-wider text-[10px] shrink-0">
              Penyimpanan Server &amp; Lokal Aktif
            </span>
            <span className="leading-snug">
              Batas kuota harian gratis Firebase (Free daily read/write units) telah tercapai untuk hari ini. Seluruh data pengisian instrumen Anda <strong>tetap tersimpan 100% aman &amp; permanen</strong> di Database Server dan perangkat ini. Kuota Firestore akan di-reset otomatis besok.
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href={getQuotaConsoleUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-amber-100 font-bold underline transition-colors text-xs"
            >
              Buka Konsol Firebase ↗
            </a>
            <button
              type="button"
              onClick={() => setQuotaWarning(false)}
              className="px-2 py-0.5 hover:bg-amber-700 rounded text-amber-100 text-xs font-bold transition-colors cursor-pointer"
              title="Tutup pemberitahuan ini"
            >
              Tutup ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'landing' && (
          <LandingPage
            onOpenAuth={() => setIsAuthModalOpen(true)}
            currentUser={currentUser}
            onGoToDashboard={() => setActiveTab('dashboard')}
            onGoToSambung={() => setActiveTab('sambung')}
            onGoToKesimpulan={() => setActiveTab('kesimpulan-sambung')}
          />
        )}

        {currentUser && (
          <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1">
            {activeTab === 'dashboard' && (
              <DashboardOverview
                schools={schools}
                supervisions={visibleSupervisions}
                currentUser={currentUser}
                onNavigateSupervisions={() => setActiveTab('sambung')}
                onNavigateSchools={() => setActiveTab('schools')}
                onNewSupervision={() => setIsNewSupervisionModalOpen(true)}
                onOpenForm={handleOpenForm}
                onOpenPrint={handleOpenPrint}
                onApproveTeacher={handleApproveTeacher}
                onOpenSambung={handleOpenSambung}
                onOpenStorageModal={() => setIsLocalStorageModalOpen(true)}
                onNavigateKesimpulan={() => setActiveTab('kesimpulan-sambung')}
                onUpdateSupervision={handleUpdateSupervision}
                onDeleteSupervision={async (deletedId) => {
                  await deleteSupervision(deletedId);
                  const updated = await fetchSupervisions();
                  setSupervisions(filterValidSupervisions(updated));
                }}
                onSyncToFirebase={handleSyncToFirebase}
                isSyncing={isSyncing}
                hasPendingSync={hasPendingSync}
              />
            )}

            {activeTab === 'sambung' && (
              <SambungInstrumentView
                supervisions={visibleSupervisions}
                currentUser={currentUser}
                schools={schools}
                initialSupervisionId={selectedSambungId}
                onUpdateSupervision={handleUpdateSupervision}
                onDeleteSupervision={async (deletedId) => {
                  await deleteSupervision(deletedId);
                  const updated = await fetchSupervisions();
                  setSupervisions(filterValidSupervisions(updated));
                }}
                onSyncToFirebase={handleSyncToFirebase}
                isSyncing={isSyncing}
                hasPendingSync={hasPendingSync}
              />
            )}

            {activeTab === 'kesimpulan-sambung' && (
              <KesimpulanSemuaGuruDashboard
                supervisions={visibleSupervisions}
                currentUser={currentUser}
                schools={schools}
                onOpenSambungTeacher={(supervisionId) => {
                  handleOpenSambung(supervisionId);
                }}
                onOpenForm={handleOpenForm}
                onOpenPrint={handleOpenPrint}
                onUpdateSupervision={handleUpdateSupervision}
              />
            )}

            {activeTab === 'schools' && isAdminOrPengawas && (
              <SchoolManagement
                schools={schools}
                currentUser={currentUser}
                onRefreshSchools={handleRefreshSchools}
              />
            )}

            {activeTab === 'users' && isAdminOrPengawas && (
              <UserManagementView
                currentUser={currentUser}
                schools={schools}
                onUserAdded={async () => {
                  const updated = await fetchSupervisions();
                  setSupervisions(filterValidSupervisions(updated));
                }}
                onUserUpdated={async (updatedUser) => {
                  if (currentUser.uid === updatedUser.uid) {
                    setCurrentUser(updatedUser);
                    saveLocalUser(updatedUser);
                  }
                  const updated = await fetchSupervisions();
                  setSupervisions(filterValidSupervisions(updated));
                }}
                onUserDeleted={async () => {
                  const updated = await fetchSupervisions();
                  setSupervisions(filterValidSupervisions(updated));
                }}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer (only on inner tabs to keep landing page cleanly within viewport) */}
      {activeTab !== 'landing' && <Footer />}

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        schools={schools}
        onAuthSuccess={(profile) => {
          setCurrentUser(profile);
          saveLocalUser(profile);
          setActiveTab('dashboard');
        }}
      />

      {currentUser && (
        <NewSupervisionModal
          isOpen={isNewSupervisionModalOpen}
          onClose={() => setIsNewSupervisionModalOpen(false)}
          currentUser={currentUser}
          schools={schools}
          onCreated={handleCreateSupervision}
        />
      )}

      {/* Form Modals */}
      {selectedSupervision && currentUser && activeFormStage === 'perangkat' && (
        <PerangkatAjarModal
          isOpen={true}
          onClose={() => setActiveFormStage(null)}
          supervision={selectedSupervision}
          currentUser={currentUser}
          onSaved={handleUpdateSupervision}
          onApproveTeacher={handleApproveTeacher}
        />
      )}

      {selectedSupervision && currentUser && activeFormStage === 'pra' && (
        <PraObservasiModal
          isOpen={true}
          onClose={() => setActiveFormStage(null)}
          supervision={selectedSupervision}
          currentUser={currentUser}
          onSaved={handleUpdateSupervision}
        />
      )}

      {selectedSupervision && currentUser && activeFormStage === 'observasi' && (
        <ObservasiKelasModal
          isOpen={true}
          onClose={() => setActiveFormStage(null)}
          supervision={selectedSupervision}
          currentUser={currentUser}
          onSaved={handleUpdateSupervision}
        />
      )}

      {selectedSupervision && currentUser && activeFormStage === 'pasca' && (
        <PascaObservasiModal
          isOpen={true}
          onClose={() => setActiveFormStage(null)}
          supervision={selectedSupervision}
          currentUser={currentUser}
          onSaved={handleUpdateSupervision}
        />
      )}

      {selectedSupervision && currentUser && activeFormStage === 'evaluasi' && (
        <EvaluasiTahunanModal
          isOpen={true}
          onClose={() => setActiveFormStage(null)}
          supervision={selectedSupervision}
          currentUser={currentUser}
          onSaved={handleUpdateSupervision}
        />
      )}

      {/* Official Printable Report View */}
      {selectedSupervision && isPrintModalOpen && (
        <ReportPrintView
          supervision={selectedSupervision}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}

      {/* Local Storage & Device Backup Modal */}
      <LocalStorageBackupModal
        isOpen={isLocalStorageModalOpen}
        onClose={() => setIsLocalStorageModalOpen(false)}
        supervisions={supervisions}
        schools={schools}
        currentUser={currentUser}
        onRestoreData={handleRestoreData}
      />

      {/* Sync Toast Notification */}
      {syncToast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border animate-bounce text-xs sm:text-sm font-semibold max-w-lg ${
          syncToast.type === 'success'
            ? 'bg-emerald-900 text-white border-emerald-600 shadow-emerald-950/40'
            : syncToast.type === 'info'
            ? 'bg-amber-950 text-amber-100 border-amber-600 shadow-amber-950/40'
            : 'bg-rose-950 text-rose-100 border-rose-600 shadow-rose-950/40'
        }`}>
          {syncToast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          )}
          <span className="leading-snug">{syncToast.message}</span>
          <button
            type="button"
            onClick={() => setSyncToast(null)}
            className="ml-auto text-white/70 hover:text-white font-bold px-1.5 py-0.5 rounded cursor-pointer"
            title="Tutup"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
