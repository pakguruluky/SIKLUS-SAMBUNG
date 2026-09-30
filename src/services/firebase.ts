import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  deleteDoc,
  query, 
  where,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { School, UserProfile, Supervision, Role } from '../types';
import { 
  saveSingleLocalSupervision, 
  saveLocalSupervisions, 
  saveLocalSchools, 
  loadLocalSupervisions, 
  loadLocalSchools 
} from './localStorageService';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth(app);

export const DEFAULT_SCHOOLS: School[] = [
  {
    id: 'sch-sman2',
    npsn: '20238516',
    name: 'SMAN 2 Bogor',
    address: 'Jl. Keranji Ujung No. 1, Budi Agung, Sukaresmi, Kec. Tanah Sareal, Kota Bogor',
    principalName: 'Nevy Vilanti Kusdinan, M.Pd.',
    accreditation: 'A',
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'sch-sman4',
    npsn: '20220334',
    name: 'SMAN 4 Bogor',
    address: 'Jl. Dreded V No. 36, Empang, Kec. Kota Bogor Selatan, Kota Bogor',
    principalName: 'Yulianti Rosdian, M.Pd.',
    accreditation: 'A',
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'sch-ummul-quro',
    npsn: '69775444',
    name: 'SMAS IT Ummul Quro',
    address: 'Jl. Pool Bina Marga Perumahan Kayu Manis Boulevard No. 3Rt 006 RW 005 Kayu Manis Tanah Sareal Kota Bogor - 16169',
    principalName: 'Hildawati, S.T.',
    accreditation: 'A',
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'sch-yphb',
    npsn: '20220330',
    name: 'SMAS YPHB',
    address: 'Jl. Pajajaran Nomor 234 A Kota Bogor',
    principalName: 'Joko Pitoyo, S.Pd., M.M.',
    accreditation: 'A',
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'sch-rimba-madya',
    npsn: '20220344',
    name: 'SMAS Rimba Madya',
    address: 'Jl. Rimba Mulya II Pasir Mulya Bogor Barat',
    principalName: 'Pajar Hariyanto, S.Pd.',
    accreditation: 'A',
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'sch-yza-1',
    npsn: '20220350',
    name: 'SMA YZA 1',
    address: 'Jl. Raya Ciawi KM. 09, Kel. Sindangsari, Kec. Bogor Timur, Kota Bogor',
    principalName: 'TB.Agung Hartawan, SE',
    accreditation: 'B',
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'sch-pgri-1',
    npsn: '20220317',
    name: 'SMAS PGRI 1',
    address: 'Jl. Bina Marga I No.17 Bogor Timur',
    principalName: 'Evi Jalinar, S.Pd., M.Si',
    accreditation: 'A',
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  }
];

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection on Boot
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'schools', 'connection-check'));
  } catch (error) {
    // Non-blocking ping test
  }
}

// Helper to normalize school and teacher data from DB
function normalizeSchoolData(sch: School): School {
  let name = sch.name;
  if (name.includes('Kota Bandung') || name === 'SMA Negeri 4 Bogor') {
    name = 'SMAN 4 Bogor';
  } else if (name === 'SMA Negeri 2 Bogor') {
    name = 'SMAN 2 Bogor';
  } else if (name === 'SMA Umul Quro') {
    name = 'SMAS IT Ummul Quro';
  }
  return { ...sch, name };
}

function normalizeSupervisionData(sup: Supervision): Supervision {
  let teacherName = sup.teacherName;
  let schoolName = sup.schoolName;
  let subject = sup.subject;
  let lessonTitle = sup.lessonTitle;

  if (teacherName.toLowerCase().includes('dewi kartika') || teacherName.toLowerCase().includes('sondang')) {
    teacherName = 'Sondang Asih Januarti, S.Pd.';
    schoolName = 'SMAN 4 Bogor';
    subject = 'Fisika';
    if (!lessonTitle || lessonTitle.toLowerCase().includes('termodinamika')) {
      lessonTitle = 'Listrik Arus Searah: Rangkaian Tertutup & Analisis Hukum Kirchhoff';
    }
  }

  if (schoolName === 'SMA Negeri 4 Bogor') {
    schoolName = 'SMAN 4 Bogor';
  } else if (schoolName === 'SMA Negeri 2 Bogor') {
    schoolName = 'SMAN 2 Bogor';
  } else if (schoolName === 'SMA Umul Quro') {
    schoolName = 'SMAS IT Ummul Quro';
  }

  return { ...sup, teacherName, schoolName, subject, lessonTitle };
}

// Seed initial schools
export async function ensureInitialSchools(): Promise<School[]> {
  try {
    const schoolsSnap = await getDocs(collection(db, 'schools'));
    if (!schoolsSnap.empty && schoolsSnap.docs.length >= DEFAULT_SCHOOLS.length) {
      return schoolsSnap.docs.map(d => normalizeSchoolData({ id: d.id, ...d.data() } as School));
    }

    // Sync the 7 default schools to Firestore
    try {
      for (const sch of DEFAULT_SCHOOLS) {
        const { id, ...data } = sch;
        const docRef = doc(db, 'schools', id);
        await setDoc(docRef, data, { merge: true });
      }
      const updatedSnap = await getDocs(collection(db, 'schools'));
      if (!updatedSnap.empty) {
        return updatedSnap.docs.map(d => normalizeSchoolData({ id: d.id, ...d.data() } as School));
      }
    } catch (writeErr) {
      console.warn('Could not sync default schools to Firestore, fallback to local defaults', writeErr);
    }

    return DEFAULT_SCHOOLS;
  } catch (err) {
    console.warn('Using default schools due to offline or uninitialized state', err);
    return DEFAULT_SCHOOLS;
  }
}

// Reset/Sync all 7 official schools explicitly
export async function resetToDefaultSchools(): Promise<School[]> {
  const allowedIds = new Set(DEFAULT_SCHOOLS.map(s => s.id));
  const currentSnap = await getDocs(collection(db, 'schools'));
  for (const d of currentSnap.docs) {
    if (!allowedIds.has(d.id)) {
      await deleteDoc(d.ref);
    }
  }
  for (const sch of DEFAULT_SCHOOLS) {
    const { id, ...data } = sch;
    const docRef = doc(db, 'schools', id);
    await setDoc(docRef, data, { merge: true });
  }
  const snap = await getDocs(collection(db, 'schools'));
  return snap.docs.map(d => normalizeSchoolData({ id: d.id, ...d.data() } as School));
}

// Schools CRUD
export async function fetchAllSchools(): Promise<School[]> {
  const path = 'schools';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) {
      return DEFAULT_SCHOOLS;
    }
    return snap.docs.map(doc => normalizeSchoolData({ id: doc.id, ...doc.data() } as School));
  } catch (err) {
    console.warn('Returning default schools fallback', err);
    return DEFAULT_SCHOOLS;
  }
}

export async function addSchool(data: Omit<School, 'id'>): Promise<School> {
  const path = 'schools';
  try {
    const newDoc = doc(collection(db, path));
    await setDoc(newDoc, data);
    return { id: newDoc.id, ...data };
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateSchool(id: string, data: Partial<School>): Promise<void> {
  const path = `schools/${id}`;
  try {
    await updateDoc(doc(db, 'schools', id), data);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// User Profile Operations
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const path = `users/${profile.uid}`;
  try {
    await setDoc(doc(db, 'users', profile.uid), profile, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function updateUserApprovalStatus(uid: string, status: 'approved' | 'rejected' | 'pending'): Promise<void> {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), { approvalStatus: status, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.warn('Could not update user approval in Firestore, updating state locally', err);
  }
}

export async function fetchUsersBySchool(schoolId?: string): Promise<UserProfile[]> {
  const path = 'users';
  try {
    const q = collection(db, path);
    if (schoolId) {
      const qSchool = query(q, where('schoolId', '==', schoolId));
      const snap = await getDocs(qSchool);
      return snap.docs.map(d => d.data() as UserProfile);
    }
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as UserProfile);
  } catch (err) {
    console.warn('Notice fetching users:', err);
    return [];
  }
}

// Supervisions CRUD
export async function fetchSupervisions(userProfile?: UserProfile | null): Promise<Supervision[]> {
  const path = 'supervisions';
  let results: Supervision[] = [];
  try {
    const q = collection(db, path);
    if (userProfile?.role === 'guru') {
      const qGuru = query(q, where('teacherId', '==', userProfile.uid));
      const snap = await getDocs(qGuru);
      results = snap.docs.map(d => normalizeSupervisionData({ id: d.id, ...d.data() } as Supervision));
    } else if (userProfile?.role === 'kepsek' && userProfile.schoolId) {
      const qKepsek = query(q, where('schoolId', '==', userProfile.schoolId));
      const snap = await getDocs(qKepsek);
      results = snap.docs.map(d => normalizeSupervisionData({ id: d.id, ...d.data() } as Supervision));
    } else {
      // Admin sees all
      const snap = await getDocs(q);
      results = snap.docs.map(d => normalizeSupervisionData({ id: d.id, ...d.data() } as Supervision));
    }

    if (results.length > 0) {
      saveLocalSupervisions(results);
    } else {
      const localCached = loadLocalSupervisions();
      if (localCached && localCached.length > 0) {
        return localCached;
      }
    }
    return results;
  } catch (err) {
    console.warn('Notice on fetching supervisions, falling back to device local storage:', err);
    const localCached = loadLocalSupervisions();
    return localCached || [];
  }
}

export async function getSupervisionById(id: string): Promise<Supervision | null> {
  const path = `supervisions/${id}`;
  try {
    const snap = await getDoc(doc(db, 'supervisions', id));
    if (snap.exists()) {
      const sup = normalizeSupervisionData({ id: snap.id, ...snap.data() } as Supervision);
      saveSingleLocalSupervision(sup);
      return sup;
    }
  } catch (err) {
    console.warn('Notice getting supervision by id from Firestore, checking device local storage:', err);
  }

  // Fallback to local storage
  const localList = loadLocalSupervisions() || [];
  return localList.find(s => s.id === id) || null;
}

export async function saveSupervision(supervision: Partial<Supervision> & { id?: string }): Promise<string> {
  const isNew = !supervision.id;
  const targetId = supervision.id || `sup-local-${Date.now()}`;
  const now = new Date().toISOString();

  const fullData: Supervision = {
    ...supervision,
    id: targetId,
    createdAt: (supervision as any).createdAt || now,
    updatedAt: now,
  } as Supervision;

  // 1. ALWAYS persist to device local storage immediately!
  saveSingleLocalSupervision(fullData);

  // 2. If not signed in with Firebase Auth (e.g. Quick Demo Mode), retained safely in local storage
  if (!auth.currentUser) {
    return targetId;
  }

  // 3. Attempt Firestore cloud sync
  try {
    if (isNew) {
      const newDoc = doc(collection(db, 'supervisions'));
      const firestoreData = {
        ...fullData,
        id: newDoc.id,
      };
      saveSingleLocalSupervision(firestoreData);
      await setDoc(newDoc, firestoreData);
      return newDoc.id;
    } else {
      const docRef = doc(db, 'supervisions', supervision.id!);
      await setDoc(docRef, { ...supervision, updatedAt: now }, { merge: true });
      return supervision.id!;
    }
  } catch (err) {
    console.warn('Firestore write notice (data safely saved in device local storage):', err);
    return targetId;
  }
}

export { fbSignOut };
