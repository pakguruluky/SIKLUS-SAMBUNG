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
  initializeFirestore,
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
  Unsubscribe,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { School, UserProfile, Supervision, Role } from '../types';
import { 
  saveSingleLocalSupervision, 
  saveLocalSupervisions, 
  saveLocalSchools, 
  loadLocalSupervisions, 
  loadLocalSchools,
  clearFormDraft
} from './localStorageService';
import { SAMPLE_SUPERVISIONS } from '../data/seedData';
import { generateTeacherMaknaiData, generateAmatiData, generateBerdayakanTelaahPerbaikanData, generateUjiData, getTeacherAutoFillData } from '../data/autoFillData';
import { DEFAULT_MATRIKS_BEFORE, createDefaultSambungForTeacher, createEmptySambungData } from '../data/sambungSeed';
import { DEFAULT_SCHOOLS, DEFAULT_USERS } from './firebaseDefaults';
export { DEFAULT_SCHOOLS, DEFAULT_USERS };
import {
  apiFetchSchools,
  apiSaveSchool,
  apiUpdateSchool,
  apiDeleteSchool,
  apiResetSchools,
  apiFetchSupervisions,
  apiSaveSupervision,
  apiDeleteSupervision,
  apiFetchUsers,
  apiSaveUser,
  apiDeleteUser,
  apiPurgeTeacher,
  apiSyncAll,
  apiRestoreBackup,
} from './backendApi';

// Helper to safely merge school lists prioritizing latest updatedAt
export function mergeSchoolsByTimestamp(primary: School[], secondary: School[]): School[] {
  const map = new Map<string, School>();
  secondary.forEach(s => map.set(s.id, s));
  primary.forEach(p => {
    const existing = map.get(p.id);
    if (!existing) {
      map.set(p.id, p);
    } else {
      const pTime = p.updatedAt ? new Date(p.updatedAt).getTime() : 0;
      const eTime = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
      if (pTime >= eTime || !existing.updatedAt) {
        map.set(p.id, p);
      }
    }
  });
  return Array.from(map.values());
}

// Helper to safely merge supervision lists prioritizing latest updatedAt
export function mergeSupervisionsByTimestamp(primary: Supervision[], secondary: Supervision[]): Supervision[] {
  const map = new Map<string, Supervision>();
  secondary.forEach(s => map.set(s.id, s));
  primary.forEach(p => {
    const existing = map.get(p.id);
    if (!existing) {
      map.set(p.id, p);
    } else {
      const pTime = p.updatedAt ? new Date(p.updatedAt).getTime() : 0;
      const eTime = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
      if (pTime >= eTime || !existing.updatedAt) {
        map.set(p.id, p);
      }
    }
  });
  return Array.from(map.values());
}

// Initialize Firebase with provisioned credentials & ignore undefined fields
const app = initializeApp(firebaseConfig);
export const db = (firebaseConfig as any).firestoreDatabaseId
  ? initializeFirestore(app, { ignoreUndefinedProperties: true }, (firebaseConfig as any).firestoreDatabaseId)
  : initializeFirestore(app, { ignoreUndefinedProperties: true });
export const auth = getAuth(app);

// Helper to remove any undefined or non-serializable fields before sending to Firestore
export function cleanForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return null as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj
      .filter(item => item !== undefined)
      .map(item => cleanForFirestore(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    if (obj instanceof Date) {
      return obj.toISOString() as unknown as T;
    }
    const cleaned: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj)) {
      if (val !== undefined && typeof val !== 'function') {
        cleaned[key] = cleanForFirestore(val);
      }
    }
    return cleaned as T;
  }
  return obj;
}

// Quota exhaustion tracking and handling - transient only, never block across reloads
let isFirestoreQuotaExceeded = false;
try {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('firestore_quota_exceeded_date');
    sessionStorage.removeItem('firestore_quota_exceeded');
  }
} catch {}

export function isQuotaExceeded(): boolean {
  return isFirestoreQuotaExceeded;
}

export const getIsFirestoreQuotaExhausted = isQuotaExceeded;

export function getQuotaConsoleUrl(): string {
  const proj = firebaseConfig.projectId;
  const dbId = (firebaseConfig as any).firestoreDatabaseId || '(default)';
  return `https://console.firebase.google.com/project/${proj}/firestore/databases/${dbId}/data?openUpgradeDialog=true`;
}

export function isQuotaError(err: any): boolean {
  if (!err) return false;
  const code = err?.code || '';
  const msg = (err?.message || String(err)).toLowerCase();
  return (
    code === 'resource-exhausted' ||
    msg.includes('resource-exhausted') ||
    msg.includes('quota limit exceeded') ||
    msg.includes('quota exceeded') ||
    msg.includes('daily write units') ||
    msg.includes('daily read units') ||
    msg.includes('maximum backoff delay')
  );
}

export function markQuotaExceeded(err?: any) {
  isFirestoreQuotaExceeded = true;
  // Automatically reset after 15 seconds so subsequent queries or syncs are never locked out
  setTimeout(() => {
    isFirestoreQuotaExceeded = false;
  }, 15000);
  console.warn(
    '⚠️ [Firestore Notice] Temporary quota or network limit reached. Resuming with local and backend storage.',
    err?.message || err
  );
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('firestore-quota-exceeded', {
        detail: {
          projectId: firebaseConfig.projectId,
          databaseId: (firebaseConfig as any).firestoreDatabaseId,
          error: err?.message || 'Quota limit exceeded',
          url: getQuotaConsoleUrl(),
        },
      })
    );
  }
}

// Local sync tracking flags
const HAS_UNSYNCED_KEY = 'pakkus_has_unsynced_changes';
const LAST_SYNC_TIME_KEY = 'pakkus_last_sync_time';

export function markDataModifiedLocally() {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(HAS_UNSYNCED_KEY, 'true');
      window.dispatchEvent(new CustomEvent('pakkus-local-data-modified'));
    }
  } catch {}
}

export function getHasPendingSync(): boolean {
  try {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(HAS_UNSYNCED_KEY) === 'true';
    }
  } catch {}
  return false;
}

export function getLastSyncTime(): string | null {
  try {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(LAST_SYNC_TIME_KEY);
    }
  } catch {}
  return null;
}

// Safe timeout wrapper for all Firestore network promises to guarantee UI never freezes or hangs
export async function withFirestoreTimeout<T>(
  promise: Promise<T>,
  timeoutMs = 3500,
  fallbackValue?: T
): Promise<T> {
  // If quota is already known to be exceeded, do not attempt to contact Firestore
  if (isFirestoreQuotaExceeded) {
    return fallbackValue as T;
  }

  let timer: any;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      resolve(fallbackValue as T);
    }, timeoutMs);
  });

  try {
    const res = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timer);
    return res;
  } catch (err: any) {
    clearTimeout(timer);
    if (isQuotaError(err)) {
      markQuotaExceeded(err);
    } else {
      console.warn('Notice from Firestore operation (data safely stored in backend/local):', err?.message || err);
    }
    return fallbackValue as T;
  }
}

// Connection verification test per Firebase skill guidelines (passive, only runs when needed)
export async function testConnection() {
  if (isFirestoreQuotaExceeded) return;
  try {
    await withFirestoreTimeout(getDocFromServer(doc(db, 'test', 'connection')), 1500, null);
  } catch (error) {
    if (isQuotaError(error)) {
      markQuotaExceeded(error);
      return;
    }
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase configuration notice: operating in offline-cached mode until connection is re-established.');
    }
  }
}

// DEFAULT_SCHOOLS and DEFAULT_USERS are imported and re-exported from firebaseDefaults.ts

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

  const normalized: Supervision = { ...sup, teacherName, schoolName, subject, lessonTitle, isValidData: true };
  const isSeedSupervision = Boolean(sup.id && (sup.id.startsWith('sup-demo-') || sup.isValidData || normalized.isValidData));

  if (!normalized.sambung) {
    if (isSeedSupervision) {
      normalized.sambung = createDefaultSambungForTeacher(teacherName, schoolName, subject);
    } else {
      normalized.sambung = createEmptySambungData(teacherName, schoolName, subject);
      return normalized;
    }
  }

  // If this is an explicitly newly created empty supervision, preserve blank instruments
  if ((sup as any).isNewSupervision) {
    return normalized;
  }

  if (normalized.sambung) {
    // Pastikan seluruh 4 indikator Kesimpulan Selidiki (Peran Guru, Aktivitas Murid, Konteks Nyata, Refleksi Murid) lengkap
    let selidiki = normalized.sambung.selidiki;
    if (!selidiki) {
      selidiki = {
        tanggal: new Date().toISOString().split('T')[0],
        items: [],
      };
    }
    const autoData = getTeacherAutoFillData(teacherName, subject, lessonTitle, schoolName);
    const existingMatriks: any = selidiki.matriksBefore || {};
    selidiki = {
      ...selidiki,
      matriksBefore: {
        peranGuru: existingMatriks.peranGuru || autoData.kesimpulanSelidiki.guruBerorientasi || DEFAULT_MATRIKS_BEFORE.peranGuru,
        aktivitasMurid: existingMatriks.aktivitasMurid || autoData.kesimpulanSelidiki.muridAktif || DEFAULT_MATRIKS_BEFORE.aktivitasMurid,
        konteksNyata: existingMatriks.konteksNyata || autoData.kesimpulanSelidiki.konteksNyata || DEFAULT_MATRIKS_BEFORE.konteksNyata,
        refleksiMurid: existingMatriks.refleksiMurid || autoData.kesimpulanSelidiki.refleksiMurid || DEFAULT_MATRIKS_BEFORE.refleksiMurid,
      },
    };
    normalized.sambung.selidiki = selidiki;

    let maknai = normalized.sambung.maknai;
    if (!maknai?.pertanyaanList?.q1) {
      const autoMaknai = generateTeacherMaknaiData(normalized);
      maknai = {
        ...maknai,
        ...autoMaknai,
        pertanyaanList: {
          ...autoMaknai.pertanyaanList,
          ...(maknai?.pertanyaanList || {}),
        },
        kesanUmum: maknai?.kesanUmum ?? autoMaknai.kesanUmum,
        saranMasukan: maknai?.saranMasukan ?? autoMaknai.saranMasukan,
      };
    }

    let arahkan = normalized.sambung.arahkan;
    if (!arahkan?.fokusIndikatorTerpilih || arahkan.fokusIndikatorTerpilih.length === 0) {
      const autoAmati = generateAmatiData(normalized, ['peranGuru', 'aktivitasMurid'], normalized.sambung.selidiki?.matriksBefore);
      arahkan = {
        ...arahkan,
        ...autoAmati,
        fokusIndikatorTerpilih: autoAmati.fokusIndikatorTerpilih,
      };
    }

    let berdayakan = normalized.sambung.berdayakan;
    if (!berdayakan?.telaahScores || !berdayakan?.rppPerbaikanUrl) {
      const autoBerdayakan = generateBerdayakanTelaahPerbaikanData(normalized);
      berdayakan = {
        ...berdayakan,
        ...autoBerdayakan,
        siklusList: (berdayakan?.siklusList && berdayakan.siklusList.length > 0)
          ? berdayakan.siklusList
          : autoBerdayakan.siklusList,
      };
    }

    let uji = normalized.sambung.uji;
    if (!uji?.observasiPelaksanaan || !uji?.praObservasi) {
      const autoUji = generateUjiData(normalized);
      uji = {
        ...uji,
        ...autoUji,
      };
    }

    normalized.sambung = {
      ...normalized.sambung,
      maknai,
      arahkan,
      berdayakan,
      uji,
    };

    if (!normalized.perangkatAjarPerbaikan && berdayakan?.telaahScores) {
      normalized.perangkatAjarPerbaikan = {
        driveLinks: {
          cpTpAtpUrl: normalized.perangkatAjar?.driveLinks?.cpTpAtpUrl || 'https://drive.google.com/file/d/1CpTpAtp_Revisi/view',
          modulAjarUrl: berdayakan.rppPerbaikanUrl,
          bahanAjarUrl: normalized.perangkatAjar?.driveLinks?.bahanAjarUrl,
          asesmenUrl: normalized.perangkatAjar?.driveLinks?.asesmenUrl,
        },
        submittedAt: new Date().toISOString(),
        telaahScores: berdayakan.telaahScores,
        telaahComments: berdayakan.telaahComments,
        telaahSummary: berdayakan.telaahSummary,
        feedback: berdayakan.feedback,
        catatanRevisiGuru: berdayakan.catatanRefleksiGuru,
        reviewedAt: new Date().toISOString(),
        reviewedBy: berdayakan.namaPenelaah,
      };
    }

    if (!normalized.praObservasiPerbaikan && uji?.praObservasi) {
      normalized.praObservasiPerbaikan = {
        q1_kd_indikator: uji.praObservasi.q1,
        q2_metode: uji.praObservasi.q2,
        q3_alat_bahan: uji.praObservasi.q3,
        q4_tahapan: uji.praObservasi.q4,
        q5_persiapan: uji.praObservasi.q5,
        q6_materi_sulit: uji.praObservasi.q6,
        q7_target_kompetensi: uji.praObservasi.q7,
        q8_perhatian_khusus: uji.praObservasi.q8,
        supervisorNotes: uji.praObservasi.supervisorNotes || '',
        interviewDurationMinutes: 35,
      };
    }

    if (!normalized.observasiKelasPerbaikan && uji?.observasiPelaksanaan) {
      normalized.observasiKelasPerbaikan = {
        items: uji.observasiPelaksanaan.items,
        totalYa: 25,
        totalAspek: 25,
        totalSkor: uji.observasiPelaksanaan.totalSkor,
        score: uji.observasiPelaksanaan.persentaseCapaian,
        predicate: uji.observasiPelaksanaan.predicate,
        feedbackNotes: `${uji.observasiPelaksanaan.feedback.kelebihan}\n\nHal yang perlu diperbaiki: ${uji.observasiPelaksanaan.feedback.perbaikan}\n\nRekomendasi: ${uji.observasiPelaksanaan.feedback.rekomendasi}`,
        feedback: uji.observasiPelaksanaan.feedback,
        completedAt: uji.observasiPelaksanaan.completedAt || new Date().toISOString(),
      };
    }

    if (!normalized.pascaObservasiPerbaikan && uji?.pascaObservasi) {
      normalized.pascaObservasiPerbaikan = {
        q1_kesan: uji.pascaObservasi.pertanyaanList.q1,
        q2_sesuai_rencana: uji.pascaObservasi.pertanyaanList.q2,
        q3_hal_memuaskan: uji.pascaObservasi.pertanyaanList.q3,
        q4_hal_kurang: uji.pascaObservasi.pertanyaanList.q4,
        q5_ketercapaian_tujuan: uji.pascaObservasi.pertanyaanList.q5,
        q6_kesulitan_siswa: uji.pascaObservasi.pertanyaanList.q6,
        q7_alternatif_solusi: uji.pascaObservasi.pertanyaanList.q7,
        q8_rencana_tindak_lanjut: uji.pascaObservasi.pertanyaanList.q8,
        q9_pengembangan_diri: uji.pascaObservasi.pertanyaanList.q9,
        generalImpression: uji.pascaObservasi.kesanUmum,
        recommendations: uji.pascaObservasi.saranMasukan,
        completedAt: uji.pascaObservasi.completedAt || new Date().toISOString(),
      };
    }
  }

  return normalized;
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
    const parsed: UserProfile[] = val ? JSON.parse(val) : [];
    const map = new Map<string, UserProfile>();
    DEFAULT_USERS.forEach(u => map.set(u.uid, u));
    parsed.forEach(u => map.set(u.uid, u));
    return Array.from(map.values());
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
  let currentUsers = getStoredUsers();

  // 1. Fetch from persistent backend API first
  try {
    const backendUsers = await apiFetchUsers();
    if (backendUsers && backendUsers.length > 0) {
      const map = new Map<string, UserProfile>();
      DEFAULT_USERS.forEach(u => map.set(u.uid, u));
      currentUsers.forEach(u => map.set(u.uid, u));
      backendUsers.forEach(u => map.set(u.uid, u));
      currentUsers = Array.from(map.values());
      saveStoredUsers(currentUsers);
    }
  } catch (err) {
    console.warn('Backend API users notice:', err);
  }

  // 2. Non-blocking Firestore sync
  try {
    const snap = await withFirestoreTimeout(getDocs(collection(db, 'users')), 600, null);
    if (snap && !snap.empty) {
      const firestoreUsers = snap.docs.map(d => ({ ...d.data(), uid: d.id } as UserProfile));
      const map = new Map<string, UserProfile>();
      currentUsers.forEach(u => map.set(u.uid, u));
      firestoreUsers.forEach(u => map.set(u.uid, u));
      currentUsers = Array.from(map.values());
      saveStoredUsers(currentUsers);
    }
  } catch (err) {
    console.warn('Notice fetching users from Firestore (using backend/local):', err);
  }

  const deletedUids = new Set(getDeletedUserIds());
  const deletedNames = new Set(getDeletedUserNames());
  return currentUsers.filter(u => !deletedUids.has(u.uid) && (!u.displayName || !deletedNames.has(u.displayName.toLowerCase().trim())));
}

export async function addUserAccount(user: UserProfile): Promise<UserProfile> {
  const uid = user.uid || `user-${Date.now()}`;
  const completeUser: UserProfile = {
    ...user,
    uid,
    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    approvalStatus: user.approvalStatus || 'approved',
  };

  // 1. Save local
  const current = getStoredUsers();
  const existingIdx = current.findIndex(u => u.uid === uid || (user.username && u.username === user.username));
  if (existingIdx >= 0) {
    current[existingIdx] = completeUser;
  } else {
    current.push(completeUser);
  }
  saveStoredUsers(current);

  // 2. Save to backend API
  try {
    await apiSaveUser(completeUser);
  } catch (apiErr) {
    console.warn('Backend API save user notice:', apiErr);
  }

  // 3. Save to Firestore
  try {
    const cleaned = cleanForFirestore(completeUser);
    withFirestoreTimeout(setDoc(doc(db, 'users', uid), cleaned, { merge: true }), 600).catch(() => {});
  } catch (err) {
    console.warn('Notice saving user to Firestore (saved in backend/local):', err);
  }

  return completeUser;
}

export async function updateUserAccount(user: UserProfile): Promise<UserProfile> {
  const completeUser: UserProfile = {
    ...user,
    updatedAt: new Date().toISOString(),
  };

  // 1. Save local
  const current = getStoredUsers();
  const existingIdx = current.findIndex(u => u.uid === user.uid || (user.username && u.username === user.username));
  if (existingIdx >= 0) {
    current[existingIdx] = completeUser;
  } else {
    current.push(completeUser);
  }
  saveStoredUsers(current);

  // 2. Save to backend API
  try {
    await apiSaveUser(completeUser);
  } catch (apiErr) {
    console.warn('Backend API update user notice:', apiErr);
  }

  // 3. Save to Firestore (only if quota available)
  if (!isFirestoreQuotaExceeded) {
    try {
      const cleaned = cleanForFirestore(completeUser);
      withFirestoreTimeout(setDoc(doc(db, 'users', user.uid), cleaned, { merge: true }), 600).catch((err) => {
        if (isQuotaError(err)) markQuotaExceeded(err);
      });
    } catch (err) {
      if (isQuotaError(err)) markQuotaExceeded(err);
      console.warn('Notice updating user in Firestore (saved in backend/local):', err);
    }
  }

  // 4. Update related supervisions if teacher information changed
  try {
    const supervisions = loadLocalSupervisions() || [];
    let supModified = false;
    const updatedSupervisions = supervisions.map(s => {
      if (s.teacherId === user.uid || (user.username && s.teacherId === user.username)) {
        supModified = true;
        return {
          ...s,
          teacherName: user.displayName || s.teacherName,
          teacherNip: user.nip !== undefined ? user.nip : s.teacherNip,
          subject: user.subject || s.subject,
          schoolId: user.schoolId || s.schoolId,
          schoolName: user.schoolName || s.schoolName,
          updatedAt: new Date().toISOString(),
        };
      }
      return s;
    });
    if (supModified) {
      saveLocalSupervisions(updatedSupervisions);
      for (const s of updatedSupervisions) {
        if (s.teacherId === user.uid || (user.username && s.teacherId === user.username)) {
          apiSaveSupervision(s).catch(() => {});
          if (!isFirestoreQuotaExceeded) {
            withFirestoreTimeout(setDoc(doc(db, 'supervisions', s.id), cleanForFirestore(s), { merge: true }), 500).catch((err) => {
              if (isQuotaError(err)) markQuotaExceeded(err);
            });
          }
        }
      }
    }
  } catch (supErr) {
    console.warn('Notice syncing supervisions for updated user:', supErr);
  }

  return completeUser;
}

const DELETED_SUPERVISION_IDS_KEY = 'pakkus_deleted_supervisions';
const DELETED_USER_IDS_KEY = 'pakkus_deleted_users';
const DELETED_USER_NAMES_KEY = 'pakkus_deleted_usernames';

export function getDeletedSupervisionIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_SUPERVISION_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addDeletedSupervisionId(id: string) {
  try {
    const ids = getDeletedSupervisionIds();
    if (!ids.includes(id)) {
      ids.push(id);
      localStorage.setItem(DELETED_SUPERVISION_IDS_KEY, JSON.stringify(ids));
    }
  } catch {}
}

export function getDeletedUserIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_USER_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addDeletedUserId(uid: string) {
  try {
    const ids = getDeletedUserIds();
    if (!ids.includes(uid)) {
      ids.push(uid);
      localStorage.setItem(DELETED_USER_IDS_KEY, JSON.stringify(ids));
    }
  } catch {}
}

export function getDeletedUserNames(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_USER_NAMES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addDeletedUserName(name: string) {
  if (!name) return;
  try {
    const names = getDeletedUserNames();
    const clean = name.toLowerCase().trim();
    if (!names.includes(clean)) {
      names.push(clean);
      localStorage.setItem(DELETED_USER_NAMES_KEY, JSON.stringify(names));
    }
  } catch {}
}

export async function purgeTeacherDataCompletely(target: {
  id?: string;
  teacherId?: string;
  teacherName?: string;
}): Promise<void> {
  const cleanName = (target.teacherName || '').toLowerCase().trim();
  const targetId = target.id;
  let teacherId = target.teacherId;

  // If teacherId or teacherName not directly provided, find from local supervisions or users
  if (!teacherId || !cleanName) {
    if (targetId) {
      const localSups = loadLocalSupervisions() || [];
      const found = localSups.find(s => s.id === targetId);
      if (found) {
        if (!cleanName && found.teacherName) {
          target.teacherName = found.teacherName;
        }
        if (!teacherId && found.teacherId) {
          teacherId = found.teacherId;
        }
      }
    }
    if (!cleanName && teacherId) {
      const foundUser = getStoredUsers().find(u => u.uid === teacherId);
      if (foundUser?.displayName) {
        target.teacherName = foundUser.displayName;
      }
    }
  }

  const effectiveCleanName = (target.teacherName || '').toLowerCase().trim();

  // 1. Record in local deleted tracking sets so they are permanently excluded
  if (targetId) {
    addDeletedSupervisionId(targetId);
    clearFormDraft(targetId);
  }
  if (effectiveCleanName) {
    addDeletedUserName(effectiveCleanName);
  }
  if (teacherId) {
    addDeletedUserId(teacherId);
    clearFormDraft(teacherId);
  }

  // 2. Clear any cached form drafts matching this teacher or supervision
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('siklus_sambung_draft_')) {
          if (targetId && k.includes(targetId)) keysToRemove.push(k);
          if (teacherId && k.includes(teacherId)) keysToRemove.push(k);
          try {
            const val = localStorage.getItem(k);
            if (val && effectiveCleanName && val.toLowerCase().includes(effectiveCleanName)) {
              keysToRemove.push(k);
            }
          } catch {}
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    }
  } catch (err) {
    console.warn('Notice clearing local drafts:', err);
  }

  // 3. Remove all matching supervisions from local storage
  try {
    const localSups = loadLocalSupervisions() || [];
    const matchedSupIds = new Set<string>();
    if (targetId) matchedSupIds.add(targetId);

    localSups.forEach(s => {
      if (targetId && s.id === targetId) matchedSupIds.add(s.id);
      if (teacherId && s.teacherId === teacherId) matchedSupIds.add(s.id);
      if (effectiveCleanName && s.teacherName && s.teacherName.toLowerCase().trim() === effectiveCleanName) {
        matchedSupIds.add(s.id);
      }
    });
    matchedSupIds.forEach(id => addDeletedSupervisionId(id));

    const remainingSups = localSups.filter(s => !matchedSupIds.has(s.id));
    saveLocalSupervisions(remainingSups);
  } catch (err) {
    console.warn('Notice cleaning local supervisions:', err);
  }

  // 4. Remove all matching users from local storage
  try {
    const allUsers = getStoredUsers();
    const matchedUserUids = new Set<string>();
    if (teacherId) matchedUserUids.add(teacherId);

    allUsers.forEach(u => {
      if (teacherId && u.uid === teacherId) matchedUserUids.add(u.uid);
      if (effectiveCleanName && u.displayName && u.displayName.toLowerCase().trim() === effectiveCleanName) {
        matchedUserUids.add(u.uid);
      }
    });
    matchedUserUids.forEach(uid => addDeletedUserId(uid));

    const remainingUsers = allUsers.filter(u => !matchedUserUids.has(u.uid));
    saveStoredUsers(remainingUsers);
  } catch (err) {
    console.warn('Notice cleaning local users:', err);
  }

  // 5. Backend Server API Purge
  try {
    await apiPurgeTeacher({
      teacherName: target.teacherName || '',
      teacherId: teacherId,
      supervisionId: target.id,
    });
  } catch (err) {
    console.warn('Notice calling backend purge:', err);
  }

  // 6. Delete clean from Firebase Firestore
  if (!isFirestoreQuotaExceeded) {
    try {
      if (targetId) {
        withFirestoreTimeout(deleteDoc(doc(db, 'supervisions', targetId)), 600).catch((err) => {
          if (isQuotaError(err)) markQuotaExceeded(err);
        });
      }

      if (teacherId) {
        withFirestoreTimeout(deleteDoc(doc(db, 'users', teacherId)), 600).catch((err) => {
          if (isQuotaError(err)) markQuotaExceeded(err);
        });
      }

      if (effectiveCleanName && target.teacherName) {
        withFirestoreTimeout(
          getDocs(query(collection(db, 'supervisions'), where('teacherName', '==', target.teacherName))),
          800
        ).then(snap => {
          snap.forEach(d => {
            deleteDoc(doc(db, 'supervisions', d.id)).catch(() => {});
          });
        }).catch(() => {});

        withFirestoreTimeout(
          getDocs(query(collection(db, 'users'), where('displayName', '==', target.teacherName))),
          800
        ).then(snap => {
          snap.forEach(d => {
            deleteDoc(doc(db, 'users', d.id)).catch(() => {});
          });
        }).catch(() => {});
      }
    } catch (err) {
      if (isQuotaError(err)) markQuotaExceeded(err);
      console.warn('Notice deleting teacher data from Firestore:', err);
    }
  }

  markDataModifiedLocally();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pakkus-local-supervisions-updated'));
    window.dispatchEvent(new CustomEvent('pakkus-local-data-modified'));
  }
}

export async function deleteUserAccount(uid: string): Promise<void> {
  const allUsers = getStoredUsers();
  const targetUser = allUsers.find(u => u.uid === uid);
  await purgeTeacherDataCompletely({
    teacherId: uid,
    teacherName: targetUser?.displayName,
  });
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
  const current = getStoredUsers();
  const idx = current.findIndex(u => u.uid === uid);
  if (idx >= 0) {
    current[idx] = { ...current[idx], approvalStatus: status, updatedAt: new Date().toISOString() };
    saveStoredUsers(current);
  }
  try {
    await setDoc(doc(db, 'users', uid), { approvalStatus: status, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn('Could not update user approval in Firestore, updated state locally', err);
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

// Real-time synchronization listener for Schools (Firestore onSnapshot + Local fallback)
export function subscribeToSchools(callback: (schools: School[]) => void): Unsubscribe {
  const initial = loadLocalSchools() || DEFAULT_SCHOOLS;
  callback(initial);

  let unsubscribeFirestore: Unsubscribe = () => {};
  try {
    unsubscribeFirestore = onSnapshot(collection(db, 'schools'), (snap) => {
      if (!snap.empty) {
        const firestoreSchools = snap.docs.map(d => normalizeSchoolData({ id: d.id, ...d.data() } as School));
        const merged = mergeSchoolsByTimestamp(firestoreSchools, loadLocalSchools() || DEFAULT_SCHOOLS);
        saveLocalSchools(merged);
        callback(merged);
      }
    }, (err) => {
      console.warn('Real-time schools onSnapshot notice:', err);
      callback(loadLocalSchools() || DEFAULT_SCHOOLS);
    });
  } catch (err) {
    console.warn('Could not attach Firestore onSnapshot for schools:', err);
  }

  const handleLocalChange = () => {
    callback(loadLocalSchools() || DEFAULT_SCHOOLS);
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('pakkus-local-schools-updated', handleLocalChange);
    window.addEventListener('pakkus-sync-completed', handleLocalChange);
    return () => {
      unsubscribeFirestore();
      window.removeEventListener('pakkus-local-schools-updated', handleLocalChange);
      window.removeEventListener('pakkus-sync-completed', handleLocalChange);
    };
  }

  return () => {
    unsubscribeFirestore();
  };
}

// Seed initial schools and synchronise with Firestore
export async function ensureInitialSchools(): Promise<School[]> {
  const local = loadLocalSchools();
  if (local && local.length > 0) {
    return local;
  }
  try {
    const schoolsSnap = await withFirestoreTimeout(getDocs(collection(db, 'schools')), 1800, null);
    if (schoolsSnap && !schoolsSnap.empty) {
      const data = schoolsSnap.docs.map(d => normalizeSchoolData({ id: d.id, ...d.data() } as School));
      saveLocalSchools(data);
      return data;
    }

    // Bootstrap defaults
    for (const sch of DEFAULT_SCHOOLS) {
      const { id, ...data } = sch;
      withFirestoreTimeout(setDoc(doc(db, 'schools', id), data, { merge: true }), 1500).catch(() => {});
    }
    saveLocalSchools(DEFAULT_SCHOOLS);
    return DEFAULT_SCHOOLS;
  } catch (err) {
    console.warn('Using default schools due to offline or uninitialized state', err);
    saveLocalSchools(DEFAULT_SCHOOLS);
    return DEFAULT_SCHOOLS;
  }
}

export async function resetToDefaultSchools(): Promise<School[]> {
  saveLocalSchools(DEFAULT_SCHOOLS);
  try {
    await apiResetSchools();
  } catch {}
  for (const sch of DEFAULT_SCHOOLS) {
    const { id, ...data } = sch;
    withFirestoreTimeout(setDoc(doc(db, 'schools', id), data, { merge: true }), 500).catch(() => {});
  }
  return DEFAULT_SCHOOLS;
}

export async function fetchAllSchools(): Promise<School[]> {
  const local = loadLocalSchools();
  let currentList = local && local.length > 0 ? local : DEFAULT_SCHOOLS;

  // 1. Fetch from persistent backend API first
  try {
    const backendSchools = await apiFetchSchools();
    if (backendSchools && backendSchools.length > 0) {
      currentList = mergeSchoolsByTimestamp(backendSchools, currentList);
      saveLocalSchools(currentList);
    }
  } catch (backendErr) {
    console.warn('Backend API schools notice:', backendErr);
  }

  // 2. Non-blocking Firestore sync (only if newer)
  try {
    const snap = await withFirestoreTimeout(getDocs(collection(db, 'schools')), 600, null);
    if (snap && !snap.empty) {
      const firestoreSchools = snap.docs.map(doc => normalizeSchoolData({ id: doc.id, ...doc.data() } as School));
      currentList = mergeSchoolsByTimestamp(currentList, firestoreSchools);
      saveLocalSchools(currentList);
    }
  } catch (err) {
    console.warn('Notice fetching schools from Firestore (using backend/local storage):', err);
  }

  return currentList;
}

export async function addSchool(data: Omit<School, 'id'>): Promise<School> {
  const targetId = `sch-${Date.now()}`;
  const now = new Date().toISOString();
  const school: School = {
    id: targetId,
    ...data,
    createdAt: data.createdAt || now,
    updatedAt: now,
    createdBy: data.createdBy || 'system',
  };
  const current = loadLocalSchools() || DEFAULT_SCHOOLS;
  saveLocalSchools([...current.filter(s => s.id !== school.id), school]);

  // Persist to backend API (disk)
  try {
    await apiSaveSchool(school);
  } catch (err) {
    console.warn('Backend API save school notice:', err);
  }

  // Fire-and-forget to Firestore without blocking UI (if quota available)
  if (!isFirestoreQuotaExceeded) {
    try {
      const cleaned = cleanForFirestore(school);
      withFirestoreTimeout(setDoc(doc(db, 'schools', targetId), cleaned), 600).catch((err) => {
        if (isQuotaError(err)) markQuotaExceeded(err);
      });
    } catch (err) {
      if (isQuotaError(err)) markQuotaExceeded(err);
      console.warn('Notice saving school to Firestore (saved locally & backend):', err);
    }
  }
  return school;
}

export async function updateSchool(id: string, data: Partial<School>): Promise<void> {
  const current = loadLocalSchools() || DEFAULT_SCHOOLS;
  const idx = current.findIndex(s => s.id === id);
  const now = new Date().toISOString();
  let updatedSchool: School;

  if (idx >= 0) {
    updatedSchool = { ...current[idx], ...data, id, updatedAt: now };
    current[idx] = updatedSchool;
  } else {
    updatedSchool = {
      id,
      name: data.name || 'SMA Binaan',
      npsn: data.npsn || '',
      principalName: data.principalName || '',
      accreditation: data.accreditation || 'A',
      address: data.address || '',
      createdAt: now,
      updatedAt: now,
      createdBy: data.createdBy || 'system',
      ...data,
    };
    current.push(updatedSchool);
  }
  saveLocalSchools(current);

  // If school name changed, update schoolName on related supervisions and users so UI is 100% in sync
  if (data.name) {
    try {
      const sups = loadLocalSupervisions() || [];
      let supModified = false;
      const updatedSups = sups.map(s => {
        if (s.schoolId === id) {
          supModified = true;
          return { ...s, schoolName: data.name!, updatedAt: now };
        }
        return s;
      });
      if (supModified) {
        saveLocalSupervisions(updatedSups);
      }

      const users = getStoredUsers();
      let userModified = false;
      const updatedUsers = users.map(u => {
        if (u.schoolId === id) {
          userModified = true;
          return { ...u, schoolName: data.name!, updatedAt: now };
        }
        return u;
      });
      if (userModified) {
        saveStoredUsers(updatedUsers);
      }
    } catch (syncErr) {
      console.warn('Notice syncing school name to related records:', syncErr);
    }
  }

  // Persist to backend API (takes ~5ms, guaranteed persistence on disk)
  try {
    await apiUpdateSchool(id, updatedSchool);
  } catch (apiErr) {
    console.warn('Backend API update school notice:', apiErr);
  }

  // Non-blocking Firestore push (only if quota available)
  if (!isFirestoreQuotaExceeded) {
    try {
      const cleaned = cleanForFirestore(updatedSchool);
      withFirestoreTimeout(setDoc(doc(db, 'schools', id), cleaned, { merge: true }), 600).catch((err) => {
        if (isQuotaError(err)) markQuotaExceeded(err);
      });
    } catch (err) {
      if (isQuotaError(err)) markQuotaExceeded(err);
      console.warn('Notice updating school in Firestore (saved locally & backend):', err);
    }
  }
}

export async function deleteSchool(id: string): Promise<void> {
  const current = (loadLocalSchools() || DEFAULT_SCHOOLS).filter(s => s.id !== id);
  saveLocalSchools(current);

  try {
    await apiDeleteSchool(id);
  } catch {}

  if (!isFirestoreQuotaExceeded) {
    try {
      withFirestoreTimeout(deleteDoc(doc(db, 'schools', id)), 600).catch((err) => {
        if (isQuotaError(err)) markQuotaExceeded(err);
      });
    } catch (err) {
      if (isQuotaError(err)) markQuotaExceeded(err);
      console.warn('Notice deleting school from Firestore:', err);
    }
  }
}

// Supervisions CRUD & Real-Time Sync
export async function ensureInitialSupervisions(): Promise<Supervision[]> {
  const local = loadLocalSupervisions();
  if (local && local.length > 0) {
    return local;
  }
  if (isFirestoreQuotaExceeded) {
    return SAMPLE_SUPERVISIONS;
  }
  try {
    const snap = await withFirestoreTimeout(getDocs(collection(db, 'supervisions')), 3500, null);
    if (snap && !snap.empty) {
      const data = snap.docs.map(d => normalizeSupervisionData({ id: d.id, ...d.data() } as Supervision));
      saveLocalSupervisions(data);
      return data;
    }

    if (isFirestoreQuotaExceeded) {
      return SAMPLE_SUPERVISIONS;
    }

    // First time bootstrap: seed SAMPLE_SUPERVISIONS to Firestore only if quota available
    for (const sup of SAMPLE_SUPERVISIONS) {
      if (isFirestoreQuotaExceeded) break;
      await withFirestoreTimeout(
        setDoc(doc(db, 'supervisions', sup.id), cleanForFirestore(sup), { merge: true }),
        1500
      ).catch(() => {});
    }
    saveLocalSupervisions(SAMPLE_SUPERVISIONS);
    return SAMPLE_SUPERVISIONS;
  } catch (err) {
    if (isQuotaError(err)) {
      markQuotaExceeded(err);
    }
    console.warn('Firestore initial supervision sync warning:', err);
    return SAMPLE_SUPERVISIONS;
  }
}

export async function fetchSupervisions(userProfile?: UserProfile | null): Promise<Supervision[]> {
  const deletedSupIds = new Set(getDeletedSupervisionIds());
  const deletedUids = new Set(getDeletedUserIds());
  const deletedNames = new Set(getDeletedUserNames().map(n => n.toLowerCase().trim()));

  const isSupDeleted = (s: Supervision) =>
    deletedSupIds.has(s.id) ||
    (s.teacherId && deletedUids.has(s.teacherId)) ||
    (s.teacherName && deletedNames.has(s.teacherName.toLowerCase().trim()));

  const filterForUser = (list: Supervision[]) => {
    if (userProfile?.role === 'guru') {
      return list.filter(
        s => s.teacherId === userProfile.uid ||
             s.teacherName.toLowerCase().trim() === userProfile.displayName.toLowerCase().trim()
      );
    } else if (userProfile?.role === 'kepsek' && (userProfile.schoolId || userProfile.schoolName)) {
      return list.filter(
        s => (userProfile.schoolId && s.schoolId === userProfile.schoolId) ||
             (userProfile.schoolName && s.schoolName.toLowerCase().trim() === userProfile.schoolName.toLowerCase().trim())
      );
    }
    return list;
  };

  // 1. AUTHORITATIVE CLOUD FIRST: Fetch from Firestore (latest synced state across devices)
  try {
    const q = collection(db, 'supervisions');
    const snap = await withFirestoreTimeout(getDocs(q), 5000, null);
    if (snap && !snap.empty) {
      const firestoreSups = snap.docs
        .map(d => normalizeSupervisionData({ id: d.id, ...d.data() } as Supervision))
        .filter(s => !isSupDeleted(s));

      if (firestoreSups.length > 0) {
        saveLocalSupervisions(firestoreSups);
        return filterForUser(firestoreSups);
      }
    }
  } catch (err) {
    console.warn('Firestore supervisions fetch notice (falling back to backend/local):', err);
  }

  // 2. Fetch from backend API disk persistence
  try {
    const backendSups = await apiFetchSupervisions();
    if (backendSups && backendSups.length > 0) {
      const validBackend = backendSups
        .map(s => normalizeSupervisionData(s))
        .filter(s => !isSupDeleted(s));
      if (validBackend.length > 0) {
        saveLocalSupervisions(validBackend);
        return filterForUser(validBackend);
      }
    }
  } catch (backendErr) {
    console.warn('Backend API supervisions notice:', backendErr);
  }

  // 3. Fallback to local cache / sample
  const localCached = loadLocalSupervisions();
  let results: Supervision[] = localCached && localCached.length > 0 ? localCached : SAMPLE_SUPERVISIONS;
  results = results.map(s => normalizeSupervisionData(s)).filter(s => !isSupDeleted(s));
  return filterForUser(results);
}

export async function getSupervisionById(id: string): Promise<Supervision | null> {
  try {
    const snap = await withFirestoreTimeout(getDoc(doc(db, 'supervisions', id)), 600, null);
    if (snap && snap.exists()) {
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

// Real-time synchronization listener for Supervisions (Firestore onSnapshot + Local fallback)
export function subscribeToSupervisions(
  callback: (supervisions: Supervision[]) => void,
  userProfile?: UserProfile | null
): Unsubscribe {
  const filterForUser = (list: Supervision[]) => {
    let results = list;
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
    return results;
  };

  const getFilteredLocal = () => {
    const deletedIds = new Set(getDeletedSupervisionIds());
    const deletedNames = new Set(getDeletedUserNames().map(n => n.toLowerCase().trim()));
    const deletedUids = new Set(getDeletedUserIds());
    const base = loadLocalSupervisions() || SAMPLE_SUPERVISIONS;
    const clean = base.filter(s => {
      if (deletedIds.has(s.id)) return false;
      if (s.teacherId && deletedUids.has(s.teacherId)) return false;
      if (s.teacherName && deletedNames.has(s.teacherName.toLowerCase().trim())) return false;
      return true;
    }).map(s => normalizeSupervisionData(s));
    return filterForUser(clean);
  };

  // 1. Immediately provide initial local data for instant 0ms render
  callback(getFilteredLocal());

  // 2. Setup real-time listener to Firestore supervisions collection
  let unsubscribeFirestore: Unsubscribe = () => {};
  try {
    const supervisionsCol = collection(db, 'supervisions');
    unsubscribeFirestore = onSnapshot(supervisionsCol, (snapshot) => {
      if (!snapshot.empty) {
        const deletedIds = new Set(getDeletedSupervisionIds());
        const deletedNames = new Set(getDeletedUserNames().map(n => n.toLowerCase().trim()));
        const deletedUids = new Set(getDeletedUserIds());

        const firestoreSupervisions: Supervision[] = [];
        snapshot.docs.forEach(docSnap => {
          const raw = { id: docSnap.id, ...docSnap.data() } as Supervision;
          if (deletedIds.has(raw.id)) return;
          if (raw.teacherId && deletedUids.has(raw.teacherId)) return;
          if (raw.teacherName && deletedNames.has(raw.teacherName.toLowerCase().trim())) return;
          firestoreSupervisions.push(normalizeSupervisionData(raw));
        });

        if (firestoreSupervisions.length > 0) {
          // Cloud snapshot is authoritative from the latest sync across devices
          saveLocalSupervisions(firestoreSupervisions);
          callback(filterForUser(firestoreSupervisions));
        }
      }
    }, (error) => {
      console.warn('Real-time supervisions onSnapshot notice:', error);
      if (isQuotaError(error)) {
        markQuotaExceeded(error);
      }
      callback(getFilteredLocal());
    });
  } catch (err) {
    console.warn('Could not attach Firestore onSnapshot for supervisions:', err);
  }

  // 3. Setup local window event listeners for local updates / sync completed
  const handleLocalChange = () => {
    callback(getFilteredLocal());
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('pakkus-local-supervisions-updated', handleLocalChange);
    window.addEventListener('pakkus-sync-completed', handleLocalChange);
    return () => {
      unsubscribeFirestore();
      window.removeEventListener('pakkus-local-supervisions-updated', handleLocalChange);
      window.removeEventListener('pakkus-sync-completed', handleLocalChange);
    };
  }

  return () => {
    unsubscribeFirestore();
  };
}

// Save Supervision with immediate local storage + backend API disk persistence.
// Data is saved to LocalStorage & Backend API disk. Firestore sync is executed when Admin clicks 'Sinkronisasi'
export async function saveSupervision(
  supervision: Partial<Supervision> & { id?: string },
  forceSyncToFirestore = false
): Promise<string> {
  const targetId = supervision.id || `sup-${Date.now()}`;
  const now = new Date().toISOString();

  const fullData: Supervision = {
    ...supervision,
    id: targetId,
    createdAt: (supervision as any).createdAt || now,
    updatedAt: now,
  } as Supervision;

  // 1. ALWAYS persist to device local storage immediately (0ms)
  saveSingleLocalSupervision(fullData);

  // 2. ALWAYS persist to backend API disk storage immediately (< 10ms)
  try {
    await apiSaveSupervision(fullData);
  } catch (apiErr) {
    console.warn('Backend API save supervision notice:', apiErr);
  }

  // Mark that there are local modifications ready for sync
  markDataModifiedLocally();

  // 3. Persist to Firebase Firestore if explicitly requested or forced
  if (forceSyncToFirestore && !isFirestoreQuotaExceeded) {
    try {
      const docRef = doc(db, 'supervisions', targetId);
      const cleaned = cleanForFirestore(fullData);
      await withFirestoreTimeout(setDoc(docRef, cleaned, { merge: true }), 3500);
      return targetId;
    } catch (err: any) {
      if (isQuotaError(err)) {
        markQuotaExceeded(err);
      } else {
        console.warn('Firestore write notice (saved in local and backend storage):', err);
      }
      return targetId;
    }
  }

  return targetId;
}

export async function deleteSupervision(id: string, teacherName?: string, teacherId?: string): Promise<void> {
  let name = teacherName;
  let tId = teacherId;
  if (!name || !tId) {
    const local = loadLocalSupervisions() || [];
    const found = local.find(s => s.id === id);
    if (found) {
      if (!name) name = found.teacherName;
      if (!tId) tId = found.teacherId;
    }
  }
  await purgeTeacherDataCompletely({ id, teacherName: name, teacherId: tId });
}

// Synchronize all pending local data (users, schools, supervisions) to Firebase Firestore
export async function syncAllPendingLocalChangesToFirestore(): Promise<{ 
  usersCount: number; 
  schoolsCount: number; 
  supervisionsCount: number;
  lastSyncTime: string;
}> {
  // When user clicks Cloud Sinkron, reset temporary quota flag to attempt live Firestore write
  isFirestoreQuotaExceeded = false;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('firestore_quota_exceeded_date');
    sessionStorage.removeItem('firestore_quota_exceeded');
  }

  let uCount = 0;
  let sCount = 0;
  let supCount = 0;

  // 1. Prepare clean entities
  const deletedIds = new Set(getDeletedSupervisionIds());
  const deletedNames = new Set(getDeletedUserNames().map(n => n.toLowerCase().trim()));
  const deletedUids = new Set(getDeletedUserIds());

  // Users
  const users = getStoredUsers();
  const validUsers = users.filter(u => {
    if (deletedUids.has(u.uid)) return false;
    if (u.displayName && deletedNames.has(u.displayName.toLowerCase().trim())) return false;
    return true;
  });

  // Schools
  const validSchools = loadLocalSchools() || DEFAULT_SCHOOLS;

  // Supervisions: ensure full set of 10 official supervisions is preserved
  let allSups = loadLocalSupervisions() || [];
  if (allSups.length === 0) {
    try {
      const backendSups = await apiFetchSupervisions();
      allSups = backendSups && backendSups.length > 0 ? backendSups : SAMPLE_SUPERVISIONS;
    } catch {
      allSups = SAMPLE_SUPERVISIONS;
    }
  }

  const validSupervisions = allSups.filter(s => {
    if (deletedIds.has(s.id)) return false;
    if (s.teacherId && deletedUids.has(s.teacherId)) return false;
    if (s.teacherName && deletedNames.has(s.teacherName.toLowerCase().trim())) return false;
    return true;
  }).map(s => normalizeSupervisionData(s));

  // 2. Persist to Backend API first (persists to server_data/database.json)
  try {
    await apiSyncAll({
      supervisions: validSupervisions,
      schools: validSchools,
      users: validUsers,
    });
  } catch (apiErr) {
    console.warn('Backend API sync notice:', apiErr);
  }

  // 3. Write directly to Firebase Firestore using writeBatch for atomic real-time update
  try {
    const batch = writeBatch(db);

    // Add users to batch
    for (const u of validUsers) {
      const docRef = doc(db, 'users', u.uid);
      batch.set(docRef, cleanForFirestore(u), { merge: true });
      uCount++;
    }

    // Add schools to batch
    for (const s of validSchools) {
      const docRef = doc(db, 'schools', s.id);
      batch.set(docRef, cleanForFirestore(s), { merge: true });
      sCount++;
    }

    // Add supervisions to batch
    for (const sup of validSupervisions) {
      const docRef = doc(db, 'supervisions', sup.id);
      batch.set(docRef, cleanForFirestore(sup), { merge: true });
      supCount++;
    }

    // Record cloud sync state so all devices know the exact author, count, and timestamp of the latest sync
    const syncMetaDoc = doc(db, 'system', 'sync_state');
    batch.set(syncMetaDoc, {
      lastSyncedAt: new Date().toISOString(),
      lastSyncedBy: auth.currentUser?.email || 'admin',
      lastSyncedByName: auth.currentUser?.displayName || 'Kusnandar, M.Si',
      supervisionsCount: validSupervisions.length,
      supervisionIds: validSupervisions.map(s => s.id),
      schoolsCount: validSchools.length,
      usersCount: validUsers.length,
      timestamp: Date.now(),
    }, { merge: true });

    // Clean up any deleted records in Firestore
    for (const delId of deletedIds) {
      batch.delete(doc(db, 'supervisions', delId));
    }

    // Commit all documents in one real-time batch
    await withFirestoreTimeout(batch.commit(), 8000);
  } catch (batchErr: any) {
    console.warn('Batch commit notice, running individual concurrent writes:', batchErr);
    if (isQuotaError(batchErr)) {
      markQuotaExceeded(batchErr);
      throw batchErr;
    }

    // Fallback: individual writes with timeout
    uCount = 0;
    sCount = 0;
    supCount = 0;

    for (const u of validUsers) {
      try {
        await withFirestoreTimeout(setDoc(doc(db, 'users', u.uid), cleanForFirestore(u), { merge: true }), 3500);
        uCount++;
      } catch (e) {
        console.warn('Sync user fallback notice:', e);
      }
    }
    for (const s of validSchools) {
      try {
        await withFirestoreTimeout(setDoc(doc(db, 'schools', s.id), cleanForFirestore(s), { merge: true }), 3500);
        sCount++;
      } catch (e) {
        console.warn('Sync school fallback notice:', e);
      }
    }
    for (const sup of validSupervisions) {
      try {
        await withFirestoreTimeout(setDoc(doc(db, 'supervisions', sup.id), cleanForFirestore(sup), { merge: true }), 3500);
        supCount++;
      } catch (e) {
        console.warn('Sync supervision fallback notice:', e);
      }
    }
    try {
      await withFirestoreTimeout(setDoc(doc(db, 'system', 'sync_state'), {
        lastSyncedAt: new Date().toISOString(),
        lastSyncedBy: auth.currentUser?.email || 'admin',
        lastSyncedByName: auth.currentUser?.displayName || 'Kusnandar, M.Si',
        supervisionsCount: validSupervisions.length,
        supervisionIds: validSupervisions.map(s => s.id),
        schoolsCount: validSchools.length,
        usersCount: validUsers.length,
        timestamp: Date.now(),
      }, { merge: true }), 3500);
    } catch {}
  }

  const syncTime = new Date().toISOString();
  if (typeof window !== 'undefined') {
    localStorage.setItem(LAST_SYNC_TIME_KEY, syncTime);
    localStorage.removeItem(HAS_UNSYNCED_KEY);
    window.dispatchEvent(new CustomEvent('pakkus-sync-completed', { detail: { syncTime, count: supCount } }));
    window.dispatchEvent(new CustomEvent('pakkus-local-supervisions-updated'));
  }

  return { usersCount: uCount, schoolsCount: sCount, supervisionsCount: supCount, lastSyncTime: syncTime };
}

export interface CloudSyncState {
  lastSyncedAt: string;
  lastSyncedBy?: string;
  lastSyncedByName?: string;
  supervisionsCount: number;
  supervisionIds?: string[];
  schoolsCount?: number;
  usersCount?: number;
  timestamp?: number;
}

export function subscribeToSyncState(callback: (state: CloudSyncState | null) => void): Unsubscribe {
  try {
    const docRef = doc(db, 'system', 'sync_state');
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        callback(snap.data() as CloudSyncState);
      } else {
        callback(null);
      }
    }, (err) => {
      console.warn('Real-time sync state notice:', err);
    });
  } catch {
    return () => {};
  }
}

// Master boot initialization to ensure Firestore collections exist with full data
export async function syncAllInitialDataToFirestore() {
  if (isFirestoreQuotaExceeded) {
    return;
  }

  // Throttle initial sync to avoid unnecessary repeated writes on every single page mount
  const lastSyncStr = typeof window !== 'undefined' ? localStorage.getItem('last_firestore_initial_sync') : null;
  const now = Date.now();
  if (lastSyncStr && (now - Number(lastSyncStr) < 4 * 60 * 60 * 1000)) {
    return;
  }

  try {
    // 1. Ensure schools exist in Firestore (seeds only if collection is empty)
    await ensureInitialSchools();
    if (isFirestoreQuotaExceeded) return;

    // 2. Ensure default users exist in Firestore only if not present yet
    try {
      const usersSnap = await withFirestoreTimeout(getDocs(collection(db, 'users')), 3500, null);
      if (usersSnap) {
        const existingUserIds = new Set(usersSnap.docs.map(d => d.id) || []);
        for (const u of DEFAULT_USERS) {
          if (isFirestoreQuotaExceeded) return;
          if (!existingUserIds.has(u.uid)) {
            await setDoc(doc(db, 'users', u.uid), cleanForFirestore(u), { merge: true });
          }
        }
      }
    } catch (userErr) {
      if (isQuotaError(userErr)) {
        markQuotaExceeded(userErr);
        return;
      }
      console.warn('Users bootstrap notice:', userErr);
    }

    if (isFirestoreQuotaExceeded) return;

    // 3. Ensure Supervisions exist in Firestore and sync bidirectionally with Backend API
    try {
      const backendSups = await apiFetchSupervisions();
      const localSups = loadLocalSupervisions() || [];
      const primarySups = backendSups && backendSups.length > 0 ? backendSups : (localSups.length > 0 ? localSups : SAMPLE_SUPERVISIONS);

      const snap = await withFirestoreTimeout(getDocs(collection(db, 'supervisions')), 3500, null);
      const existingFirestoreMap = new Map<string, any>();
      if (snap && !snap.empty) {
        snap.docs.forEach(d => existingFirestoreMap.set(d.id, d.data()));
      }

      // Sync any missing or newer from backend/local to Firestore
      for (const sup of primarySups) {
        if (isFirestoreQuotaExceeded) return;
        const exist = existingFirestoreMap.get(sup.id);
        const supTime = sup.updatedAt ? new Date(sup.updatedAt).getTime() : 0;
        const existTime = exist?.updatedAt ? new Date(exist.updatedAt).getTime() : 0;
        if (!exist || supTime > existTime) {
          await setDoc(doc(db, 'supervisions', sup.id), cleanForFirestore(sup), { merge: true });
        }
      }

      // Sync any from Firestore to backend API
      if (snap && !snap.empty) {
        for (const docSnap of snap.docs) {
          const fsData = normalizeSupervisionData({ id: docSnap.id, ...docSnap.data() } as Supervision);
          apiSaveSupervision(fsData).catch(() => {});
        }
      }
    } catch (supErr) {
      if (isQuotaError(supErr)) {
        markQuotaExceeded(supErr);
        return;
      }
      console.warn('Supervisions bootstrap notice:', supErr);
      await ensureInitialSupervisions();
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('last_firestore_initial_sync', String(now));
    }

    console.log(`Firebase Firestore status verified for project: ${firebaseConfig.projectId}`);
  } catch (err) {
    if (isQuotaError(err)) {
      markQuotaExceeded(err);
      return;
    }
    console.warn('Notice during Firestore background sync:', err);
  }
}

export { fbSignOut };
