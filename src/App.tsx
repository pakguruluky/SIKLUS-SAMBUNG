import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { DashboardOverview } from './components/DashboardOverview';
import { SupervisionList } from './components/SupervisionList';
import { SchoolManagement } from './components/SchoolManagement';
import { AuthModal } from './components/AuthModal';
import { ReportPrintView } from './components/ReportPrintView';
import { PerangkatAjarModal } from './components/forms/PerangkatAjarModal';
import { PraObservasiModal } from './components/forms/PraObservasiModal';
import { ObservasiKelasModal } from './components/forms/ObservasiKelasModal';
import { PascaObservasiModal } from './components/forms/PascaObservasiModal';
import { EvaluasiTahunanModal } from './components/forms/EvaluasiTahunanModal';
import { NewSupervisionModal } from './components/forms/NewSupervisionModal';
import { SambungInstrumentView } from './components/SambungInstrumentView';

import { 
  auth, 
  fbSignOut, 
  testFirestoreConnection, 
  ensureInitialSchools, 
  fetchAllSchools, 
  getUserProfile,
  fetchSupervisions,
  saveSupervision,
  updateUserApprovalStatus
} from './services/firebase';
import { School, Supervision, UserProfile, Role } from './types';
import { SAMPLE_SUPERVISIONS } from './data/seedData';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [supervisions, setSupervisions] = useState<Supervision[]>(SAMPLE_SUPERVISIONS);
  const [activeTab, setActiveTab] = useState<string>('landing');

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNewSupervisionModalOpen, setIsNewSupervisionModalOpen] = useState(false);
  const [selectedSupervision, setSelectedSupervision] = useState<Supervision | null>(null);
  const [activeFormStage, setActiveFormStage] = useState<'perangkat' | 'pra' | 'observasi' | 'pasca' | 'evaluasi' | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedSambungId, setSelectedSambungId] = useState<string | undefined>(undefined);

  // Initialize app data
  useEffect(() => {
    const initApp = async () => {
      await testFirestoreConnection();
      const loadedSchools = await ensureInitialSchools();
      if (loadedSchools.length > 0) {
        setSchools(loadedSchools);
      } else {
        const fallbackSchools = await fetchAllSchools();
        setSchools(fallbackSchools);
      }

      // Check persistent supervisions from Firestore
      try {
        const firestoreSupervisions = await fetchSupervisions();
        if (firestoreSupervisions && firestoreSupervisions.length > 0) {
          // Merge with sample supervisions to ensure rich analytics demo
          const existingIds = new Set(firestoreSupervisions.map(s => s.id));
          const merged = [...firestoreSupervisions, ...SAMPLE_SUPERVISIONS.filter(s => !existingIds.has(s.id))];
          setSupervisions(merged);
        }
      } catch (e) {
        console.warn('Using local seed supervisions', e);
      }
    };

    initApp();

    // Firebase Auth Listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await getUserProfile(user.uid);
        if (profile) {
          setCurrentUser(profile);
          setActiveTab('dashboard');
        } else {
          // Default profile if newly signed in
          const isAdmin = user.email?.toLowerCase() === 'pakguruluky@gmail.com';
          const defaultProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || (isAdmin ? 'Kusnandar, M.Si' : 'Pengguna SIKLUS SAMBUNG'),
            role: isAdmin ? 'admin' : 'guru',
            createdAt: new Date().toISOString(),
          };
          setCurrentUser(defaultProfile);
          setActiveTab('dashboard');
        }
      } else {
        // If not logged in and currently in private dashboard, switch to landing
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleRefreshSchools = async () => {
    try {
      const refreshed = await fetchAllSchools();
      setSchools(refreshed);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await fbSignOut(auth);
    setCurrentUser(null);
    setActiveTab('landing');
  };

  // Quick Demo Simulator for instant testing of all roles
  const handleQuickDemoLogin = (role: Role) => {
    let mockProfile: UserProfile;
    if (role === 'admin') {
      mockProfile = {
        uid: 'admin-kusnandar',
        email: 'pakguruluky@gmail.com',
        displayName: 'Kusnandar, M.Si',
        role: 'admin',
        createdAt: new Date().toISOString(),
      };
    } else if (role === 'kepsek') {
      const sman4 = schools.find(s => s.id === 'sch-sman4') || schools[0];
      mockProfile = {
        uid: 'kepsek-yulianti',
        email: 'kepsek@sman4bogor.sch.id',
        displayName: sman4?.principalName || 'Yulianti Rosdian, M.Pd.',
        role: 'kepsek',
        schoolId: sman4?.id || 'sch-sman4',
        schoolName: sman4?.name || 'SMAN 4 Bogor',
        nip: '19720518 199802 2 003',
        createdAt: new Date().toISOString(),
      };
    } else {
      const sman4 = schools.find(s => s.id === 'sch-sman4') || schools[0];
      mockProfile = {
        uid: 'teacher-sondang',
        email: 'sondangasih@sman4bogor.sch.id',
        displayName: 'Sondang Asih Januarti, S.Pd.',
        role: 'guru',
        schoolId: sman4?.id || 'sch-sman4',
        schoolName: sman4?.name || 'SMAN 4 Bogor',
        nip: '19840512 200801 2 007',
        subject: 'Fisika',
        approvalStatus: 'approved',
        createdAt: new Date().toISOString(),
      };
    }

    setCurrentUser(mockProfile);
    setActiveTab('dashboard');
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

  const handleUpdateSupervision = (updated: Supervision) => {
    setSupervisions(prev => prev.map(s => (s.id === updated.id ? updated : s)));
    setSelectedSupervision(updated);
  };

  const handleCreateSupervision = (newSup: Supervision) => {
    setSupervisions(prev => [newSup, ...prev]);
    setActiveTab('supervisions');
  };

  // Requirement 1: Guru yang satu tidak dapat melihat hasil supervisi guru yang lain
  const visibleSupervisions = currentUser?.role === 'guru'
    ? supervisions.filter(s => s.teacherId === currentUser.uid || s.teacherName.toLowerCase() === currentUser.displayName.toLowerCase())
    : currentUser?.role === 'kepsek'
    ? supervisions.filter(s => s.schoolId === currentUser.schoolId || s.schoolName === currentUser.schoolName)
    : supervisions;

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
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'landing' && (
          <LandingPage
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onQuickDemoLogin={handleQuickDemoLogin}
          />
        )}

        {currentUser && (
          <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1">
            {activeTab === 'dashboard' && (
              <DashboardOverview
                schools={schools}
                supervisions={visibleSupervisions}
                currentUser={currentUser}
                onNavigateSupervisions={() => setActiveTab('supervisions')}
                onNavigateSchools={() => setActiveTab('schools')}
                onNewSupervision={() => setIsNewSupervisionModalOpen(true)}
                onOpenForm={handleOpenForm}
                onOpenPrint={handleOpenPrint}
                onApproveTeacher={handleApproveTeacher}
                onOpenSambung={handleOpenSambung}
              />
            )}

            {activeTab === 'supervisions' && (
              <SupervisionList
                supervisions={visibleSupervisions}
                currentUser={currentUser}
                schools={schools}
                onOpenForm={handleOpenForm}
                onOpenPrint={handleOpenPrint}
                onNewSupervision={() => setIsNewSupervisionModalOpen(true)}
                onOpenSambung={handleOpenSambung}
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

            {activeTab === 'schools' && currentUser.role === 'admin' && (
              <SchoolManagement
                schools={schools}
                currentUser={currentUser}
                onRefreshSchools={handleRefreshSchools}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer: REQUIREMENT "@copyright by Pak Kus & Pak GuruAI" */}
      <Footer />

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        schools={schools}
        onAuthSuccess={(profile) => {
          setCurrentUser(profile);
          setActiveTab('dashboard');
        }}
        onQuickDemoLogin={handleQuickDemoLogin}
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
    </div>
  );
}
