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

import { 
  auth, 
  fbSignOut, 
  ensureInitialSchools, 
  fetchAllSchools, 
  getUserProfile,
  fetchSupervisions,
  saveSupervision,
  updateUserApprovalStatus,
  syncAllInitialDataToFirestore,
  subscribeToSupervisions
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
  return list.filter(s => {
    if (EXCLUDED_SUPERVISION_IDS.has(s.id)) return false;
    if (s.teacherName && (s.teacherName.toLowerCase().includes('risna') || s.teacherName.toLowerCase().includes('fatma rita'))) return false;
    return true;
  });
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => loadLocalUser());
  const [schools, setSchools] = useState<School[]>(() => loadLocalSchools() || []);
  const [supervisions, setSupervisions] = useState<Supervision[]>(() => {
    const cached = filterValidSupervisions(loadLocalSupervisions() || []);
    const cachedIds = new Set(cached.map(s => s.id));
    const missing = SAMPLE_SUPERVISIONS.filter(s => !cachedIds.has(s.id));
    const initialList = filterValidSupervisions([...cached, ...missing]);
    saveLocalSupervisions(initialList);
    return initialList;
  });
  const [activeTab, setActiveTab] = useState<string>(() => loadLocalUser() ? 'dashboard' : 'landing');

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNewSupervisionModalOpen, setIsNewSupervisionModalOpen] = useState(false);
  const [isLocalStorageModalOpen, setIsLocalStorageModalOpen] = useState(false);
  const [selectedSupervision, setSelectedSupervision] = useState<Supervision | null>(null);
  const [activeFormStage, setActiveFormStage] = useState<'perangkat' | 'pra' | 'observasi' | 'pasca' | 'evaluasi' | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedSambungId, setSelectedSambungId] = useState<string | undefined>(undefined);

  // Initialize app data and sync to Firestore
  useEffect(() => {
    const initApp = async () => {
      // 1. Sync all initial schools, default users, and initial supervisions to Firebase Firestore
      await syncAllInitialDataToFirestore();

      const loadedSchools = await ensureInitialSchools();
      if (loadedSchools.length > 0) {
        setSchools(loadedSchools);
        saveLocalSchools(loadedSchools);
      } else {
        const fallbackSchools = await fetchAllSchools();
        setSchools(fallbackSchools);
        saveLocalSchools(fallbackSchools);
      }

      // Check persistent supervisions from Firestore
      try {
        const firestoreSupervisions = await fetchSupervisions(currentUser);
        if (firestoreSupervisions && firestoreSupervisions.length > 0) {
          const valid = filterValidSupervisions(firestoreSupervisions);
          setSupervisions(valid);
          saveLocalSupervisions(valid);
        }
      } catch (e) {
        console.warn('Notice fetching supervisions:', e);
      }
    };

    initApp();

    // Firebase Auth Listener
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await getUserProfile(user.uid);
        if (profile) {
          setCurrentUser(profile);
          saveLocalUser(profile);
          setActiveTab('dashboard');
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

  const handleUpdateSupervision = async (updated: Supervision) => {
    setSupervisions(prev => {
      const next = prev.map(s => (s.id === updated.id ? updated : s));
      saveLocalSupervisions(next);
      return next;
    });
    setSelectedSupervision(updated);
    // Write directly to Firebase
    await saveSupervision(updated);
  };

  const handleCreateSupervision = async (newSup: Supervision) => {
    setSupervisions(prev => {
      const next = [newSup, ...prev];
      saveLocalSupervisions(next);
      return next;
    });
    setSelectedSambungId(newSup.id);
    setActiveTab('sambung');
    // Write directly to Firebase
    await saveSupervision(newSup);
  };

  const handleRestoreData = (restoredSupervisions: Supervision[], restoredSchools: School[]) => {
    if (restoredSupervisions.length > 0) {
      setSupervisions(restoredSupervisions);
      saveLocalSupervisions(restoredSupervisions);
    }
    if (restoredSchools.length > 0) {
      setSchools(restoredSchools);
      saveLocalSchools(restoredSchools);
    }
  };

  // Role-based visibility enforcement:
  // 1. Pengawas / Admin: melihat semua sekolah dan guru
  // 2. Kepala Sekolah: hanya melihat instrumen dan kesimpulan sekolahnya saja tanpa bisa melihat sekolah dan guru lain
  // 3. Guru: hanya melihat instrumen dan kesimpulan akun dia saja
  const visibleSupervisions = React.useMemo(() => {
    if (!currentUser) return supervisions;

    if (currentUser.role === 'guru') {
      const matched = supervisions.filter(
        s => s.teacherId === currentUser.uid ||
             s.teacherName.toLowerCase().trim() === currentUser.displayName?.toLowerCase().trim()
      );
      return matched.length > 0 ? matched : supervisions.slice(0, 1);
    }

    if (currentUser.role === 'kepsek') {
      const userSch = (currentUser.schoolName || '').toLowerCase().trim();
      const matched = supervisions.filter(
        s => (currentUser.schoolId && s.schoolId === currentUser.schoolId) ||
             (userSch && (s.schoolName.toLowerCase().trim().includes(userSch) || userSch.includes(s.schoolName.toLowerCase().trim())))
      );
      return matched;
    }

    // Admin / Pengawas sees all
    return supervisions;
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
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'landing' && (
          <LandingPage
            onOpenAuth={() => setIsAuthModalOpen(true)}
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
              />
            )}

            {activeTab === 'sambung' && (
              <SambungInstrumentView
                supervisions={visibleSupervisions}
                currentUser={currentUser}
                schools={schools}
                initialSupervisionId={selectedSambungId}
                onUpdateSupervision={handleUpdateSupervision}
              />
            )}

            {activeTab === 'kesimpulan-sambung' && (
              <KesimpulanSemuaGuruDashboard
                supervisions={visibleSupervisions}
                currentUser={currentUser}
                onOpenSambungTeacher={(supervisionId) => {
                  handleOpenSambung(supervisionId);
                }}
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
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

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
    </div>
  );
}
