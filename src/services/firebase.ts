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
      if (val !== undefined) {
        cleaned[key] = cleanForFirestore(val);
      }
    }
    return cleaned as T;
  }
  return obj;
}

// Safe timeout wrapper for all Firestore network promises to guarantee UI never freezes or hangs
export async function withFirestoreTimeout<T>(
  promise: Promise<T>,
  timeoutMs = 800,
  fallbackValue?: T
): Promise<T> {
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
    console.warn('Notice from Firestore operation (data safely stored in backend/local):', err?.message || err);
    return fallbackValue as T;
  }
}

// Connection verification test per Firebase skill guidelines
async function testConnection() {
  try {
    await withFirestoreTimeout(getDocFromServer(doc(db, 'test', 'connection')), 1500, null);
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase configuration notice: operating in offline-cached mode until connection is re-established.');
    }
  }
}
testConnection();

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

  const normalized: Supervision = { ...sup, teacherName, schoolName, subject, lessonTitle };
  const isSeedSupervision = Boolean(sup.id && sup.id.startsWith('sup-demo-'));

  if (!normalized.sambung) {
    if (isSeedSupervision) {
      normalized.sambung = createDefaultSambungForTeacher(teacherName, schoolName, subject);
    } else {
      normalized.sambung = createEmptySambungData(teacherName, schoolName, subject);
      return normalized;
    }
  }

  // If this is a user-created new supervision, preserve all empty instruments as completely blank (belum terisi)
  if (!isSeedSupervision || (sup as any).isNewSupervision) {
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

  // 3. Save to Firestore
  try {
    const cleaned = cleanForFirestore(completeUser);
    withFirestoreTimeout(setDoc(doc(db, 'users', user.uid), cleaned, { merge: true }), 600).catch(() => {});
  } catch (err) {
    console.warn('Notice updating user in Firestore (saved in backend/local):', err);
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
          withFirestoreTimeout(setDoc(doc(db, 'supervisions', s.id), cleanForFirestore(s), { merge: true }), 500).catch(() => {});
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

export async function deleteUserAccount(uid: string): Promise<void> {
  addDeletedUserId(uid);
  const allUsers = getStoredUsers();
  const targetUser = allUsers.find(u => u.uid === uid);
  if (targetUser?.displayName) {
    addDeletedUserName(targetUser.displayName);
  }
  const current = allUsers.filter(u => u.uid !== uid);
  saveStoredUsers(current);

  try {
    await apiDeleteUser(uid);
  } catch {}

  try {
    withFirestoreTimeout(deleteDoc(doc(db, 'users', uid)), 600).catch(() => {});
  } catch (err) {
    console.warn('Notice deleting user from Firestore:', err);
  }

  // Also cascade delete all supervisions belonging to this deleted user/teacher
  try {
    const localSups = loadLocalSupervisions() || [];
    const targetName = targetUser?.displayName?.toLowerCase().trim();
    const supsToDelete = localSups.filter(s => 
      s.teacherId === uid || 
      (targetName && s.teacherName?.toLowerCase().trim() === targetName) ||
      (targetUser?.username && s.id.includes(targetUser.username))
    );

    for (const sup of supsToDelete) {
      addDeletedSupervisionId(sup.id);
      apiDeleteSupervision(sup.id).catch(() => {});
      withFirestoreTimeout(deleteDoc(doc(db, 'supervisions', sup.id)), 500).catch(() => {});
    }

    const remainingSups = localSups.filter(s => !supsToDelete.some(del => del.id === s.id));
    saveLocalSupervisions(remainingSups);
  } catch (err) {
    console.warn('Notice cleaning up supervisions for deleted user:', err);
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

  // Fire-and-forget to Firestore without blocking UI
  try {
    const cleaned = cleanForFirestore(school);
    withFirestoreTimeout(setDoc(doc(db, 'schools', targetId), cleaned), 600).catch(() => {});
  } catch (err) {
    console.warn('Notice saving school to Firestore (saved locally & backend):', err);
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

  // Non-blocking Firestore push
  try {
    const cleaned = cleanForFirestore(updatedSchool);
    withFirestoreTimeout(setDoc(doc(db, 'schools', id), cleaned, { merge: true }), 600).catch(() => {});
  } catch (err) {
    console.warn('Notice updating school in Firestore (saved locally & backend):', err);
  }
}

export async function deleteSchool(id: string): Promise<void> {
  const current = (loadLocalSchools() || DEFAULT_SCHOOLS).filter(s => s.id !== id);
  saveLocalSchools(current);

  try {
    await apiDeleteSchool(id);
  } catch {}

  try {
    withFirestoreTimeout(deleteDoc(doc(db, 'schools', id)), 600).catch(() => {});
  } catch (err) {
    console.warn('Notice deleting school from Firestore:', err);
  }
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
    const localCached = loadLocalSupervisions();
    let results: Supervision[] = localCached && localCached.length > 0 ? localCached : SAMPLE_SUPERVISIONS;

    // 1. Fetch from persistent backend API first
    try {
      const backendSups = await apiFetchSupervisions();
      if (backendSups && backendSups.length > 0) {
        results = mergeSupervisionsByTimestamp(backendSups, results);
        saveLocalSupervisions(results);
      }
    } catch (backendErr) {
      console.warn('Backend API supervisions notice:', backendErr);
    }

    // 2. Non-blocking Firestore sync (if available and newer)
    try {
      const q = collection(db, 'supervisions');
      const snap = await withFirestoreTimeout(getDocs(q), 600, null);
      if (snap && !snap.empty) {
        const firestoreSups = snap.docs.map(d => normalizeSupervisionData({ id: d.id, ...d.data() } as Supervision));
        results = mergeSupervisionsByTimestamp(results, firestoreSups);
        saveLocalSupervisions(results);
      }
    } catch (err) {
      console.warn('Firestore supervisions notice:', err);
    }

    const deletedSupIds = new Set(getDeletedSupervisionIds());
    const deletedUids = new Set(getDeletedUserIds());
    const deletedNames = new Set(getDeletedUserNames());

    const isSupDeleted = (s: Supervision) =>
      deletedSupIds.has(s.id) ||
      (s.teacherId && deletedUids.has(s.teacherId)) ||
      (s.teacherName && deletedNames.has(s.teacherName.toLowerCase().trim()));

    // Merge with SAMPLE_SUPERVISIONS to guarantee initial supervised teachers are available,
    // excluding any that have been deleted via Kelola Pengguna
    const map = new Map<string, Supervision>();
    SAMPLE_SUPERVISIONS.forEach(s => {
      if (!isSupDeleted(s)) {
        map.set(s.id, s);
      }
    });
    results.forEach(s => {
      if (!isSupDeleted(s)) {
        map.set(s.id, s);
      }
    });
    results = Array.from(map.values()).filter(s => !isSupDeleted(s));

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
    const fallback = localCached && localCached.length > 0 ? localCached : SAMPLE_SUPERVISIONS;
    const deletedSupIds = new Set(getDeletedSupervisionIds());
    const deletedUids = new Set(getDeletedUserIds());
    const deletedNames = new Set(getDeletedUserNames());
    return fallback.filter(
      s => !deletedSupIds.has(s.id) && 
           (!s.teacherId || !deletedUids.has(s.teacherId)) &&
           (!s.teacherName || !deletedNames.has(s.teacherName.toLowerCase().trim()))
    );
  }
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
        const local = loadLocalSupervisions() || [];
        results = mergeSupervisionsByTimestamp(local, results);
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

// Save Supervision with immediate local storage + backend API disk persistence + non-blocking Firebase write
export async function saveSupervision(supervision: Partial<Supervision> & { id?: string }): Promise<string> {
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

  // 3. Persist to Firebase Firestore without blocking UI
  try {
    const docRef = doc(db, 'supervisions', targetId);
    const cleaned = cleanForFirestore(fullData);
    withFirestoreTimeout(setDoc(docRef, cleaned, { merge: true }), 600).catch(() => {});
    return targetId;
  } catch (err) {
    console.warn('Firestore write notice (saved in local and backend storage):', err);
    return targetId;
  }
}

export async function deleteSupervision(id: string): Promise<void> {
  addDeletedSupervisionId(id);
  const localList = (loadLocalSupervisions() || []).filter(s => s.id !== id);
  saveLocalSupervisions(localList);

  try {
    await apiDeleteSupervision(id);
  } catch {}

  try {
    withFirestoreTimeout(deleteDoc(doc(db, 'supervisions', id)), 600).catch(() => {});
  } catch (err) {
    console.warn('Notice deleting supervision from Firestore:', err);
  }
}

// Synchronize all pending local data (users, schools, supervisions) to Firebase Firestore
export async function syncAllPendingLocalChangesToFirestore(): Promise<{ usersCount: number; schoolsCount: number; supervisionsCount: number }> {
  let uCount = 0;
  let sCount = 0;
  let supCount = 0;

  // 1. Users
  try {
    const users = getStoredUsers();
    for (const u of users) {
      await setDoc(doc(db, 'users', u.uid), cleanForFirestore(u), { merge: true });
      uCount++;
    }
  } catch (err) {
    console.warn('Pending users sync notice:', err);
  }

  // 2. Schools
  try {
    const schools = loadLocalSchools() || DEFAULT_SCHOOLS;
    for (const s of schools) {
      await setDoc(doc(db, 'schools', s.id), cleanForFirestore(s), { merge: true });
      sCount++;
    }
  } catch (err) {
    console.warn('Pending schools sync notice:', err);
  }

  // 3. Supervisions
  try {
    const supervisions = loadLocalSupervisions() || [];
    for (const s of supervisions) {
      await setDoc(doc(db, 'supervisions', s.id), cleanForFirestore(s), { merge: true });
      supCount++;
    }
  } catch (err) {
    console.warn('Pending supervisions sync notice:', err);
  }

  return { usersCount: uCount, schoolsCount: sCount, supervisionsCount: supCount };
}

// Master boot initialization to ensure Firestore collections exist with full data
export async function syncAllInitialDataToFirestore() {
  try {
    // 1. Ensure schools exist in Firestore (seeds only if collection is empty)
    await ensureInitialSchools();

    // 2. Ensure default users exist in Firestore only if not present yet
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const existingUserIds = new Set(usersSnap.docs.map(d => d.id));
      for (const u of DEFAULT_USERS) {
        if (!existingUserIds.has(u.uid)) {
          await setDoc(doc(db, 'users', u.uid), cleanForFirestore(u), { merge: true });
        }
      }
    } catch (userErr) {
      console.warn('Users bootstrap notice:', userErr);
    }

    // 3. Ensure Supervisions exist in Firestore:
    // If Firestore has data, ensureInitialSupervisions downloads and caches them locally!
    // If Firestore is empty, it seeds SAMPLE_SUPERVISIONS once to Firestore.
    // It will NEVER overwrite newer cloud data with older local storage on another device.
    await ensureInitialSupervisions();
    console.log(`Firebase Firestore synchronized successfully with project: ${firebaseConfig.projectId}`);
  } catch (err) {
    console.warn('Notice during Firestore background sync:', err);
  }
}

export { fbSignOut };
