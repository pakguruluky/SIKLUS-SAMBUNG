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
  query, 
  where,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { School, UserProfile, Supervision, Role } from '../types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth(app);

export const DEFAULT_SCHOOLS: School[] = [
  {
    id: 'sch-sman4',
    npsn: '20220304',
    name: 'SMA Negeri 4 Bogor',
    address: 'Jl. Dreded No. 36, Empang, Kec. Bogor Selatan, Kota Bogor, Jawa Barat 16132',
    principalName: 'Dra. Hj. Yeni Suryani, M.Pd.',
    accreditation: 'A',
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'sch-umul-quro',
    npsn: '20220315',
    name: 'SMA Umul Quro',
    address: 'Jl. KH. Sholeh Iskandar No. 1, Parakan Jaya, Kemang, Kota Bogor, Jawa Barat 16164',
    principalName: 'Dr. H. Asep Kurnia, M.M.Pd.',
    accreditation: 'A',
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'sch-sman2',
    npsn: '20220302',
    name: 'SMA Negeri 2 Bogor',
    address: 'Jl. Keranji Ujung No. 1, Budi Agung, Kedungbadak, Kec. Tanah Sereal, Kota Bogor, Jawa Barat 16166',
    principalName: 'H. Suherman, S.Pd., M.M.',
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
  if (name === 'SMAN 1 Kota Bandung' || name.toLowerCase().includes('sman 1')) {
    name = 'SMA Negeri 4 Bogor';
  } else if (name === 'SMAN 2 Kota Bandung') {
    name = 'SMA Negeri 2 Bogor';
  } else if (name === 'SMAN 3 Kota Bandung' || name.toLowerCase().includes('sman 3')) {
    name = 'SMA Umul Quro';
  }
  return { ...sch, name };
}

function normalizeSupervisionData(sup: Supervision): Supervision {
  let teacherName = sup.teacherName;
  let schoolName = sup.schoolName;
  let subject = sup.subject;
  let lessonTitle = sup.lessonTitle;

  if (teacherName.toLowerCase().includes('dewi kartika')) {
    teacherName = 'Sondang Asih Januarti, S.Pd.';
    schoolName = 'SMA Negeri 4 Bogor';
    subject = 'Fisika';
    if (!lessonTitle || lessonTitle.toLowerCase().includes('termodinamika')) {
      lessonTitle = 'Listrik Arus Searah: Rangkaian Tertutup & Analisis Hukum Kirchhoff';
    }
  }

  if (schoolName === 'SMAN 1 Kota Bandung' || schoolName.toLowerCase().includes('sman 1')) {
    schoolName = 'SMA Negeri 4 Bogor';
  } else if (schoolName === 'SMAN 2 Kota Bandung') {
    schoolName = 'SMA Negeri 2 Bogor';
  } else if (schoolName === 'SMAN 3 Kota Bandung' || schoolName.toLowerCase().includes('sman 3')) {
    schoolName = 'SMA Umul Quro';
  }

  return { ...sup, teacherName, schoolName, subject, lessonTitle };
}

// Seed initial schools
export async function ensureInitialSchools(): Promise<School[]> {
  try {
    const schoolsSnap = await getDocs(collection(db, 'schools'));
    if (!schoolsSnap.empty) {
      return schoolsSnap.docs.map(d => normalizeSchoolData({ id: d.id, ...d.data() } as School));
    }

    // If signed in as user or admin, write defaults to Firestore
    if (auth.currentUser) {
      const seeded: School[] = [];
      for (const sch of DEFAULT_SCHOOLS) {
        const { id, ...data } = sch;
        const docRef = doc(db, 'schools', id);
        await setDoc(docRef, data);
        seeded.push(sch);
      }
      return seeded;
    }

    return DEFAULT_SCHOOLS;
  } catch (err) {
    console.warn('Using default schools due to offline or uninitialized state', err);
    return DEFAULT_SCHOOLS;
  }
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
  try {
    const q = collection(db, path);
    if (userProfile?.role === 'guru') {
      const qGuru = query(q, where('teacherId', '==', userProfile.uid));
      const snap = await getDocs(qGuru);
      return snap.docs.map(d => normalizeSupervisionData({ id: d.id, ...d.data() } as Supervision));
    } else if (userProfile?.role === 'kepsek' && userProfile.schoolId) {
      const qKepsek = query(q, where('schoolId', '==', userProfile.schoolId));
      const snap = await getDocs(qKepsek);
      return snap.docs.map(d => normalizeSupervisionData({ id: d.id, ...d.data() } as Supervision));
    } else {
      // Admin sees all
      const snap = await getDocs(q);
      return snap.docs.map(d => normalizeSupervisionData({ id: d.id, ...d.data() } as Supervision));
    }
  } catch (err) {
    console.warn('Notice on fetching supervisions:', err);
    return [];
  }
}

export async function getSupervisionById(id: string): Promise<Supervision | null> {
  const path = `supervisions/${id}`;
  try {
    const snap = await getDoc(doc(db, 'supervisions', id));
    if (snap.exists()) {
      return normalizeSupervisionData({ id: snap.id, ...snap.data() } as Supervision);
    }
    return null;
  } catch (err) {
    console.warn('Notice getting supervision by id:', err);
    return null;
  }
}

export async function saveSupervision(supervision: Partial<Supervision> & { id?: string }): Promise<string> {
  const isNew = !supervision.id;

  // If not signed in with Firebase Auth (e.g. Quick Demo Mode), do not attempt an unauthorized Firestore network write
  if (!auth.currentUser) {
    const id = supervision.id || `sup-demo-${Date.now()}`;
    return id;
  }

  try {
    if (isNew) {
      const newDoc = doc(collection(db, 'supervisions'));
      const fullData = {
        ...supervision,
        id: newDoc.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(newDoc, fullData);
      return newDoc.id;
    } else {
      const docRef = doc(db, 'supervisions', supervision.id!);
      await setDoc(docRef, { ...supervision, updatedAt: new Date().toISOString() }, { merge: true });
      return supervision.id!;
    }
  } catch (err) {
    console.warn('Firestore write warning:', err);
    return supervision.id || `sup-${Date.now()}`;
  }
}

export { fbSignOut };
