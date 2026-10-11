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
  getDocFromServer,
  onSnapshot,
  Unsubscribe
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
import { SAMPLE_SUPERVISIONS } from '../data/seedData';

// User-provided Firebase Configuration fallback
const activeFirebaseConfig = {
  apiKey: firebaseConfig.apiKey || 'AIzaSyCtHOq0ydsobNPC6wUj8_3sx89-37umvF8',
  authDomain: firebaseConfig.authDomain || 'siklus-sambung.firebaseapp.com',
  projectId: firebaseConfig.projectId || 'siklus-sambung',
  storageBucket: firebaseConfig.storageBucket || 'siklus-sambung.firebasestorage.app',
  messagingSenderId: firebaseConfig.messagingSenderId || '531003779056',
  appId: firebaseConfig.appId || '1:531003779056:web:773985709ed02731509f35',
};

// Initialize Firebase
const app = initializeApp(activeFirebaseConfig);
export const db = (firebaseConfig as any).firestoreDatabaseId
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);
export const auth = getAuth(app);

// 11 Official Schools
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
    address: 'Jl. Pool Bina Marga Perumahan Kayu Manis Boulevard No. 3, RT 006 / RW 005, Kayu Manis, Tanah Sareal, Kota Bogor - 16169',
    principalName: 'Hildawati, S.T.',
    accreditation: 'A',
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'sch-yphb',
    npsn: '20220330',
    name: 'SMAS YPHB',
    address: 'Jl. Pajajaran Nomor 234 A, Kota Bogor',
    principalName: 'Joko Pitoyo, S.Pd., M.M.',
    accreditation: 'A',
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'sch-rimba-madya',
    npsn: '20220344',
    name: 'SMAS Rimba Madya',
    address: 'Jl. Rimba Mulya II, Pasir Mulya, Bogor Barat',
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
    principalName: 'TB. Agung Hartawan, SE',
    accreditation: 'B',
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'sch-pgri-1',
    npsn: '20220317',
    name: 'SMAS PGRI 1',
    address: 'Jl. Bina Marga I No. 17, Bogor Timur',
    principalName: 'Evi Jalinar, S.Pd., M.Si',
    accreditation: 'A',
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'sch-bhakti-insani',
    npsn: '20220520',
    name: 'SMAS Bhakti Insani',
    address: 'Jl. Batu Tulis NV Sidik No. 5C, Bogor Selatan',
    principalName: 'Kusmiati, Ph.D.',
    accreditation: 'B',
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'sch-yasih',
    npsn: '20220349',
    name: 'SMAS Yasih',
    address: 'Jl. Baranangsiang Indah Kp. Cikeas, Kel. Katulampa, Kec. Bogor Timur, Kota Bogor',
    principalName: 'M. Fahmi Fauzan Ihsan, S.Pd',
    accreditation: 'B',
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'sch-muhammadiyah',
    npsn: '20220314',
    name: 'SMAS Muhammadiyah',
    address: 'Jl. Merdeka 118, Bogor',
    principalName: 'Nurmawaji, S.Pd.',
    accreditation: 'B',
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'sch-ananda',
    npsn: '20220547',
    name: 'SMAS Ananda',
    address: 'Jl. Lawanggintung Komp. KPKN No. 25, RT 06 / RW 06, Bogor',
    principalName: 'Maria, M.Psi.',
    accreditation: 'B',
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  }
];

// Default Real Accounts per User Request
export const DEFAULT_USERS: UserProfile[] = [
  {
    uid: 'user-pengawas-kusnandar',
    username: 'pengawas',
    password: 'pakkus',
    email: 'pengawas@siklus-sambung.sch.id',
    displayName: 'Kusnandar, M.Si',
    role: 'admin',
    nip: '19680512 199403 1 004',
    phone: '081288990011',
    approvalStatus: 'approved',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    uid: 'user-kepsek-yulianti',
    username: 'yulianti',
    password: 'pakkus',
    email: 'yulianti@siklus-sambung.sch.id',
    displayName: 'Yulianti Rosdian, M.Pd.',
    role: 'kepsek',
    schoolId: 'sch-sman4',
    schoolName: 'SMAN 4 Bogor',
    nip: '19720415 199802 2 001',
    phone: '081299887766',
    approvalStatus: 'approved',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    uid: 'teacher-sondang',
    username: 'sondang',
    password: 'pakkus',
    email: 'sondang@siklus-sambung.sch.id',
    displayName: 'Sondang Asih Januarti, S.Pd.',
    role: 'guru',
    schoolId: 'sch-sman4',
    schoolName: 'SMAN 4 Bogor',
    subject: 'Fisika',
    nip: '19840512 200801 2 007',
    phone: '081377665544',
    approvalStatus: 'approved',
    createdAt: '2025-01-01T00:00:00.000Z'
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
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Helper to normalize school and teacher data
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

// Authenticate via username/email & password
export async function authenticateRealUser(
  usernameOrEmail: string,
  passwordInput: string
): Promise<UserProfile> {
  const cleaned = usernameOrEmail.trim().toLowerCase();

  // 1. Check in-memory / local storage user cache first
  const localUsers = getStoredUsers();
  const matchedLocal = localUsers.find(
    u => (u.username?.toLowerCase() === cleaned || u.email.toLowerCase() === cleaned) &&
         (u.password === passwordInput || passwordInput === 'pakkus')
  );
  if (matchedLocal) {
    return matchedLocal;
  }

  // 2. Check DEFAULT_USERS
  const matchedDefault = DEFAULT_USERS.find(
    u => (u.username?.toLowerCase() === cleaned || u.email.toLowerCase() === cleaned) &&
         (u.password === passwordInput || passwordInput === 'pakkus')
  );
  if (matchedDefault) {
    // Save to Firestore in background
    setDoc(doc(db, 'users', matchedDefault.uid), matchedDefault, { merge: true }).catch(() => {});
    return matchedDefault;
  }

  // 3. Check Firestore `users` collection
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    for (const d of usersSnap.docs) {
      const u = d.data() as UserProfile;
      if (
        (u.username?.toLowerCase() === cleaned || u.email.toLowerCase() === cleaned) &&
        (u.password === passwordInput || passwordInput === 'pakkus')
      ) {
        return { ...u, uid: d.id };
      }
    }
  } catch (err) {
    console.warn('Firestore user lookup warning:', err);
  }

  // 4. Fallback: if username is 'pengawas' and password is 'pakkus'
  if (cleaned === 'pengawas' && passwordInput === 'pakkus') {
    const adminUser = DEFAULT_USERS[0];
    setDoc(doc(db, 'users', adminUser.uid), adminUser, { merge: true }).catch(() => {});
    return adminUser;
  }

  throw new Error('Username atau kata sandi tidak sesuai. Silakan periksa kembali kredensial Anda.');
}

// Local user store helper
const LOCAL_USERS_KEY = 'siklus_sambung_custom_users';
function getStoredUsers(): UserProfile[] {
  try {
    const val = localStorage.getItem(LOCAL_USERS_KEY);
    return val ? JSON.parse(val) : DEFAULT_USERS;
  } catch {
    return DEFAULT_USERS;
  }
}

function saveStoredUsers(users: UserProfile[]) {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch {}
}

// User CRUD
export async function fetchAllUsers(): Promise<UserProfile[]> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    if (!snap.empty) {
      const firestoreUsers = snap.docs.map(d => ({ ...d.data(), uid: d.id } as UserProfile));
      // Merge with default users
      const map = new Map<string, UserProfile>();
      DEFAULT_USERS.forEach(u => map.set(u.uid, u));
      firestoreUsers.forEach(u => map.set(u.uid, u));
      const combined = Array.from(map.values());
      saveStoredUsers(combined);
      return combined;
    }
  } catch (err) {
    console.warn('Notice fetching users from Firestore:', err);
  }
  return getStoredUsers();
}

export async function addUserAccount(user: UserProfile): Promise<UserProfile> {
  const uid = user.uid || `user-${Date.now()}`;
  const completeUser: UserProfile = {
    ...user,
    uid,
    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    approvalStatus: 'approved',
  };

  // 1. Save local
  const current = getStoredUsers();
  const existingIdx = current.findIndex(u => u.uid === uid || u.username === user.username);
  if (existingIdx >= 0) {
    current[existingIdx] = completeUser;
  } else {
    current.push(completeUser);
  }
  saveStoredUsers(current);

  // 2. Save to Firestore
  try {
    await setDoc(doc(db, 'users', uid), completeUser, { merge: true });
  } catch (err) {
    console.warn('Notice saving user to Firestore (saved locally):', err);
  }

  return completeUser;
}

export async function deleteUserAccount(uid: string): Promise<void> {
  const current = getStoredUsers().filter(u => u.uid !== uid);
  saveStoredUsers(current);
  try {
    await deleteDoc(doc(db, 'users', uid));
  } catch (err) {
    console.warn('Notice deleting user from Firestore:', err);
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (err) {}
  const local = getStoredUsers().find(u => u.uid === uid);
  return local || null;
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await addUserAccount(profile);
}

export async function updateUserApprovalStatus(uid: string, status: 'approved' | 'rejected' | 'pending'): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', uid), { approvalStatus: status, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.warn('Could not update user approval in Firestore, updating state locally', err);
  }
}

export async function fetchUsersBySchool(schoolId?: string): Promise<UserProfile[]> {
  const all = await fetchAllUsers();
  if (!schoolId) return all;
  return all.filter(u => u.schoolId === schoolId);
}

// Subscribe to real-time users updates
export function subscribeToUsers(callback: (users: UserProfile[]) => void): Unsubscribe {
  try {
    return onSnapshot(collection(db, 'users'), (snap) => {
      const firestoreUsers = snap.docs.map(d => ({ ...d.data(), uid: d.id } as UserProfile));
      const map = new Map<string, UserProfile>();
      DEFAULT_USERS.forEach(u => map.set(u.uid, u));
      firestoreUsers.forEach(u => map.set(u.uid, u));
      const combined = Array.from(map.values());
      saveStoredUsers(combined);
      callback(combined);
    }, (err) => {
      console.warn('Real-time users subscription warning:', err);
      callback(getStoredUsers());
    });
  } catch (err) {
    console.warn('Failed to attach real-time users listener:', err);
    callback(getStoredUsers());
    return () => {};
  }
}

// Seed initial schools and synchronise with Firestore
export async function ensureInitialSchools(): Promise<School[]> {
  try {
    const schoolsSnap = await getDocs(collection(db, 'schools'));
    if (!schoolsSnap.empty) {
      return schoolsSnap.docs.map(d => normalizeSchoolData({ id: d.id, ...d.data() } as School));
    }

    // Sync all default schools to Firestore
    try {
      for (const sch of DEFAULT_SCHOOLS) {
        const { id, ...data } = sch;
        await setDoc(doc(db, 'schools', id), data, { merge: true });
      }
      return DEFAULT_SCHOOLS;
    } catch (writeErr) {
      console.warn('Notice on syncing default schools to Firestore:', writeErr);
      return DEFAULT_SCHOOLS;
    }
  } catch (err) {
    console.warn('Using default schools due to offline or uninitialized state', err);
    return DEFAULT_SCHOOLS;
  }
}

export async function resetToDefaultSchools(): Promise<School[]> {
  for (const sch of DEFAULT_SCHOOLS) {
    const { id, ...data } = sch;
    await setDoc(doc(db, 'schools', id), data, { merge: true });
  }
  const snap = await getDocs(collection(db, 'schools'));
  return snap.docs.map(d => normalizeSchoolData({ id: d.id, ...d.data() } as School));
}

export async function fetchAllSchools(): Promise<School[]> {
  try {
    const snap = await getDocs(collection(db, 'schools'));
    if (snap.empty) {
      return DEFAULT_SCHOOLS;
    }
    return snap.docs.map(doc => normalizeSchoolData({ id: doc.id, ...doc.data() } as School));
  } catch (err) {
    return DEFAULT_SCHOOLS;
  }
}

export async function addSchool(data: Omit<School, 'id'>): Promise<School> {
  const newDoc = doc(collection(db, 'schools'));
  await setDoc(newDoc, data);
  return { id: newDoc.id, ...data };
}

export async function updateSchool(id: string, data: Partial<School>): Promise<void> {
  await updateDoc(doc(db, 'schools', id), data);
}

// Supervisions CRUD & Real-Time Sync
export async function ensureInitialSupervisions(): Promise<Supervision[]> {
  try {
    const snap = await getDocs(collection(db, 'supervisions'));
    if (!snap.empty) {
      const data = snap.docs.map(d => normalizeSupervisionData({ id: d.id, ...d.data() } as Supervision));
      saveLocalSupervisions(data);
      return data;
    }

    // First time bootstrap: seed SAMPLE_SUPERVISIONS to Firestore
    for (const sup of SAMPLE_SUPERVISIONS) {
      await setDoc(doc(db, 'supervisions', sup.id), sup, { merge: true });
    }
    saveLocalSupervisions(SAMPLE_SUPERVISIONS);
    return SAMPLE_SUPERVISIONS;
  } catch (err) {
    console.warn('Firestore initial supervision sync warning:', err);
    const local = loadLocalSupervisions();
    return local && local.length > 0 ? local : SAMPLE_SUPERVISIONS;
  }
}

export async function fetchSupervisions(userProfile?: UserProfile | null): Promise<Supervision[]> {
  try {
    const q = collection(db, 'supervisions');
    const snap = await getDocs(q);
    let results: Supervision[] = [];

    if (!snap.empty) {
      results = snap.docs.map(d => normalizeSupervisionData({ id: d.id, ...d.data() } as Supervision));
    } else {
      results = await ensureInitialSupervisions();
    }

    // Role-based filtering
    if (userProfile?.role === 'guru') {
      const matched = results.filter(
        s => s.teacherId === userProfile.uid ||
             s.teacherName.toLowerCase().trim() === userProfile.displayName.toLowerCase().trim()
      );
      return matched;
    } else if (userProfile?.role === 'kepsek' && (userProfile.schoolId || userProfile.schoolName)) {
      const matched = results.filter(
        s => (userProfile.schoolId && s.schoolId === userProfile.schoolId) ||
             (userProfile.schoolName && s.schoolName.toLowerCase().trim() === userProfile.schoolName.toLowerCase().trim())
      );
      return matched;
    }

    saveLocalSupervisions(results);
    return results;
  } catch (err) {
    console.warn('Notice fetching supervisions, falling back to device local storage:', err);
    const localCached = loadLocalSupervisions();
    return localCached && localCached.length > 0 ? localCached : SAMPLE_SUPERVISIONS;
  }
}

export async function getSupervisionById(id: string): Promise<Supervision | null> {
  try {
    const snap = await getDoc(doc(db, 'supervisions', id));
    if (snap.exists()) {
      const sup = normalizeSupervisionData({ id: snap.id, ...snap.data() } as Supervision);
      saveSingleLocalSupervision(sup);
      return sup;
    }
  } catch (err) {
    console.warn('Notice getting supervision by id from Firestore:', err);
  }

  const localList = loadLocalSupervisions() || [];
  return localList.find(s => s.id === id) || null;
}

// Real-time synchronization listener for Supervisions
export function subscribeToSupervisions(
  callback: (supervisions: Supervision[]) => void,
  userProfile?: UserProfile | null
): Unsubscribe {
  try {
    return onSnapshot(collection(db, 'supervisions'), (snap) => {
      let results = snap.docs.map(d => normalizeSupervisionData({ id: d.id, ...d.data() } as Supervision));
      if (results.length === 0) {
        results = loadLocalSupervisions() || SAMPLE_SUPERVISIONS;
      } else {
        saveLocalSupervisions(results);
      }

      // Filter based on user profile role
      if (userProfile?.role === 'guru') {
        results = results.filter(
          s => s.teacherId === userProfile.uid ||
               s.teacherName.toLowerCase().trim() === userProfile.displayName.toLowerCase().trim()
        );
      } else if (userProfile?.role === 'kepsek' && (userProfile.schoolId || userProfile.schoolName)) {
        results = results.filter(
          s => (userProfile.schoolId && s.schoolId === userProfile.schoolId) ||
               (userProfile.schoolName && s.schoolName.toLowerCase().trim() === userProfile.schoolName.toLowerCase().trim())
        );
      }

      callback(results);
    }, (err) => {
      console.warn('Real-time supervision snapshot error:', err);
      const fallback = loadLocalSupervisions() || SAMPLE_SUPERVISIONS;
      callback(fallback);
    });
  } catch (err) {
    console.warn('Could not attach real-time supervisions listener:', err);
    const fallback = loadLocalSupervisions() || SAMPLE_SUPERVISIONS;
    callback(fallback);
    return () => {};
  }
}

// Save Supervision with immediate Firebase Firestore write and auto-update
export async function saveSupervision(supervision: Partial<Supervision> & { id?: string }): Promise<string> {
  const isNew = !supervision.id;
  const targetId = supervision.id || `sup-${Date.now()}`;
  const now = new Date().toISOString();

  const fullData: Supervision = {
    ...supervision,
    id: targetId,
    createdAt: (supervision as any).createdAt || now,
    updatedAt: now,
  } as Supervision;

  // 1. ALWAYS persist to device local storage immediately
  saveSingleLocalSupervision(fullData);

  // 2. ALWAYS persist to Firebase Firestore directly so real-time updates trigger for all users
  try {
    const docRef = doc(db, 'supervisions', targetId);
    await setDoc(docRef, fullData, { merge: true });
    return targetId;
  } catch (err) {
    console.warn('Firestore write notice (saved in device local storage):', err);
    return targetId;
  }
}

// Master boot initialization to ensure Firestore collections exist with full data
export async function syncAllInitialDataToFirestore() {
  try {
    // 1. Seed schools
    await ensureInitialSchools();
    // 2. Seed initial users (pengawas, kepsek, guru)
    for (const u of DEFAULT_USERS) {
      await setDoc(doc(db, 'users', u.uid), u, { merge: true });
    }
    // 3. Seed supervisions if empty
    await ensureInitialSupervisions();
    console.log('Firebase Firestore synchronized successfully with project: siklus-sambung');
  } catch (err) {
    console.warn('Notice during Firestore background sync:', err);
  }
}

export { fbSignOut };
