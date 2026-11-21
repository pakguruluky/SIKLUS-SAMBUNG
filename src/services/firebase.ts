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
  writeBatch,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { School, UserProfile, Supervision, Role } from '../types';
import { 
  saveSingleLocalSupervision, 
  saveLocalSupervisions, 
  mergeLocalSupervisions,
  saveSingleLocalSchool,
  saveLocalSchools, 
  mergeLocalSchools,
  loadLocalSupervisions, 
  loadLocalSchools,
  loadLocalUser,
  clearFormDraft
} from './localStorageService';
import { SAMPLE_SUPERVISIONS } from '../data/seedData';
import { generateTeacherMaknaiData, generateAmatiData, generateBerdayakanTelaahPerbaikanData, generateUjiData, getTeacherAutoFillData } from '../data/autoFillData';
import { DEFAULT_MATRIKS_BEFORE, createDefaultSambungForTeacher, createEmptySambungData } from '../data/sambungSeed';
import { DEFAULT_SCHOOLS, DEFAULT_USERS, KUSNANDAR_SUPERVISOR_ID, KUSNANDAR_SUPERVISOR_NAME } from './firebaseDefaults';
export { DEFAULT_SCHOOLS, DEFAULT_USERS, KUSNANDAR_SUPERVISOR_ID, KUSNANDAR_SUPERVISOR_NAME };
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

// Local sync tracking flags & Realtime Online/Offline Mode
const HAS_UNSYNCED_KEY = 'pakkus_has_unsynced_changes';
const LAST_SYNC_TIME_KEY = 'pakkus_last_sync_time';
const ONLINE_MODE_KEY = 'siklus_sambung_online_mode';

export function getOnlineMode(): boolean {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(ONLINE_MODE_KEY);
      // Default to ONLINE (true) so app is connected realtime to Firebase by default
      return stored !== 'false';
    }
  } catch {}
  return true;
}

let isSyncingOfflineQueue = false;

export function setOnlineModeState(online: boolean, dispatchEvent = true): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ONLINE_MODE_KEY, online ? 'true' : 'false');
      if (dispatchEvent) {
        window.dispatchEvent(new CustomEvent('pakkus-online-mode-changed', { detail: { online } }));
      }
    }
  } catch {}
}

export async function toggleOnlineMode(online: boolean): Promise<{
  online: boolean;
  synced: boolean;
  usersCount: number;
  schoolsCount: number;
  supervisionsCount: number;
  lastSyncTime?: string;
  error?: string;
}> {
  if (!online) {
    setOnlineModeState(false, true);
    try {
      await disableNetwork(db);
    } catch (err) {
      console.warn('Firestore disableNetwork notice:', err);
    }
    return {
      online: false,
      synced: false,
      usersCount: 0,
      schoolsCount: 0,
      supervisionsCount: 0,
    };
  }

  // Switching OFFLINE -> ONLINE:
  // 1. Hold onSnapshot overwrites via isSyncingOfflineQueue while pushing localStorage changes to Firebase
  // 2. Enable Firestore network and verify connection
  // 3. Push ALL localStorage data & deletions to Firebase/database FIRST
  // 4. Release guard and notify UI listeners so live sync resumes cleanly
  isSyncingOfflineQueue = true;
  isFirestoreQuotaExceeded = false;
  setOnlineModeState(true, false);

  try {
    await enableNetwork(db);
  } catch (err) {
    console.warn('Firestore enableNetwork notice:', err);
  }

  try {
    await testConnection();
    const res = await syncAllPendingLocalChangesToFirestore();
    isSyncingOfflineQueue = false;
    setOnlineModeState(true, true);
    return {
      online: true,
      synced: true,
      usersCount: res.usersCount,
      schoolsCount: res.schoolsCount,
      supervisionsCount: res.supervisionsCount,
      lastSyncTime: res.lastSyncTime,
    };
  } catch (err: any) {
    isSyncingOfflineQueue = false;
    setOnlineModeState(true, true);
    console.warn('Auto-sync when switching online notice:', err);
    return {
      online: true,
      synced: false,
      usersCount: 0,
      schoolsCount: 0,
      supervisionsCount: 0,
      error: err?.message || 'Tersambung ke mode Online, sinkronisasi sebagian tertunda.',
    };
  }
}

// Enforce initial offline network state if user explicitly left the toggle Offline
if (typeof window !== 'undefined' && !getOnlineMode()) {
  disableNetwork(db).catch(() => {});
}

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
  timeoutMs = 4500,
  fallbackValue?: T
): Promise<T> {
  // Respect Offline Mode & temporary quota limit
  if (!getOnlineMode() || isFirestoreQuotaExceeded) {
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

    if (normalized.sambung?.gerakkan?.rtlNyatakan) {
      normalized.sambung.gerakkan.rtlNyatakan = normalized.sambung.gerakkan.rtlNyatakan.filter(
        (r: any) => !r.indikator?.includes('Asesmen Autentik') && r.id !== 5
      );
    }
  }

  return normalized;
}

export const KUSNANDAR_UID = KUSNANDAR_SUPERVISOR_ID;

export function isKusnandarOwnerId(id?: string | null): boolean {
  if (!id) return false;
  return id === KUSNANDAR_UID || id === 'admin-kusnandar' || id === 'system';
}

export function isKusnandarAccount(user?: UserProfile | null): boolean {
  if (!user) return false;
  const uid = user.uid || '';
  const username = (user.username || '').toLowerCase().trim();
  const name = (user.displayName || '').toLowerCase().trim();
  return (
    uid === KUSNANDAR_UID ||
    uid === 'admin-kusnandar' ||
    username === 'pengawas' ||
    username === 'kusnandar' ||
    name.includes('kusnandar')
  );
}

export function isSupervisorAccount(user?: UserProfile | null): boolean {
  if (!user) return false;
  return user.role === 'admin' || user.role === 'pengawas' || user.role === 'super_admin';
}

export function isSuperAdminAccount(user?: Partial<UserProfile> | null): boolean {
  if (!user) return false;
  return user.role === 'super_admin' || user.uid === 'user-super-admin' || (user.username || '').toLowerCase().trim() === 'admin';
}

/**
 * Resolve the isolated Firestore workspace ID for a logged-in user.
 * Returns null for Super Admin (global view) or unauthenticated sessions.
 */
export function resolveWorkspaceOwnerForUser(user?: UserProfile | null): string | null {
  if (!user || isSuperAdminAccount(user)) return null;
  if (user.role === 'admin' || user.role === 'pengawas') {
    return isKusnandarAccount(user) ? KUSNANDAR_UID : (user.supervisorWorkspaceId || user.uid);
  }
  if (user.supervisorWorkspaceId && !isKusnandarOwnerId(user.supervisorWorkspaceId)) {
    return user.supervisorWorkspaceId;
  }
  if (user.supervisorId && !isKusnandarOwnerId(user.supervisorId)) {
    return user.supervisorId;
  }
  if (user.createdBy && !isKusnandarOwnerId(user.createdBy) && user.createdBy !== 'user-super-admin') {
    return user.createdBy;
  }
  if (user.schoolId) {
    const schools = loadLocalSchools() || [];
    const sch = schools.find(s => s.id === user.schoolId);
    const schOwner = sch?.supervisorWorkspaceId || sch?.supervisorId || sch?.createdBy;
    if (schOwner && !isKusnandarOwnerId(schOwner) && schOwner !== 'user-super-admin') {
      return schOwner;
    }
  }
  return KUSNANDAR_UID;
}

/**
 * Resolve the canonical Pengawas workspace owner UID for any record (School, Supervision, UserProfile).
 */
export function resolveRecordOwnerUid(record?: any, fallbackActor?: UserProfile | null): string {
  if (!record) {
    return resolveWorkspaceOwnerForUser(fallbackActor) || KUSNANDAR_UID;
  }
  if (isSuperAdminAccount(record)) {
    return 'user-super-admin';
  }
  if (record.role === 'pengawas' || record.role === 'admin') {
    return isKusnandarAccount(record) ? KUSNANDAR_UID : (record.supervisorWorkspaceId || record.uid || KUSNANDAR_UID);
  }
  if (record.supervisorWorkspaceId && !isKusnandarOwnerId(record.supervisorWorkspaceId) && record.supervisorWorkspaceId !== 'user-super-admin') {
    return record.supervisorWorkspaceId;
  }
  if (record.supervisorId && !isKusnandarOwnerId(record.supervisorId) && record.supervisorId !== 'user-super-admin') {
    return record.supervisorId;
  }
  if (record.createdBy && !isKusnandarOwnerId(record.createdBy) && record.createdBy !== 'user-super-admin') {
    return record.createdBy;
  }
  if (record.supervisorId && isKusnandarOwnerId(record.supervisorId)) {
    return KUSNANDAR_UID;
  }
  if (record.supervisorName && String(record.supervisorName).toLowerCase().includes('kusnandar')) {
    return KUSNANDAR_UID;
  }
  if (record.id && String(record.id).startsWith('sup-demo-')) {
    return KUSNANDAR_UID;
  }
  if (record.schoolId) {
    const schools = loadLocalSchools() || [];
    const sch = schools.find(s => s.id === record.schoolId);
    if (sch) {
      const schOwner = sch.supervisorWorkspaceId || sch.supervisorId || sch.createdBy;
      if (schOwner && !isKusnandarOwnerId(schOwner) && schOwner !== 'user-super-admin') {
        return schOwner;
      }
      if (schOwner && isKusnandarOwnerId(schOwner)) {
        return KUSNANDAR_UID;
      }
    }
  }
  const actorOwner = resolveWorkspaceOwnerForUser(fallbackActor);
  if (actorOwner) return actorOwner;
  return KUSNANDAR_UID;
}

export function resolveOwnerDisplayName(ownerUid: string, explicitName?: string, fallbackActor?: UserProfile | null): string {
  if (explicitName && explicitName.trim()) return explicitName.trim();
  if (ownerUid === KUSNANDAR_UID) return KUSNANDAR_SUPERVISOR_NAME;
  if (fallbackActor && fallbackActor.uid === ownerUid && fallbackActor.displayName) {
    return fallbackActor.displayName;
  }
  try {
    const stored = getStoredUsers();
    const matched = stored.find(u => u.uid === ownerUid);
    if (matched?.displayName) return matched.displayName;
  } catch {}
  return 'Pengawas Pembina';
}

export function belongsToSupervisorWorkspace(record: any, targetOwnerUid: string): boolean {
  if (!record || !targetOwnerUid) return false;
  if (isSuperAdminAccount(record)) return false;
  const normalizedTarget = isKusnandarOwnerId(targetOwnerUid) ? KUSNANDAR_UID : targetOwnerUid;
  const owner = resolveRecordOwnerUid(record);
  return owner === normalizedTarget;
}

function getWorkspaceColRef(ownerUid: string, subcol: 'schools' | 'supervisions' | 'users') {
  const safeOwner = isKusnandarOwnerId(ownerUid) ? KUSNANDAR_UID : ownerUid;
  return collection(db, 'pengawas_workspaces', safeOwner, subcol);
}

function getWorkspaceDocRef(ownerUid: string, subcol: 'schools' | 'supervisions' | 'users', docId: string) {
  const safeOwner = isKusnandarOwnerId(ownerUid) ? KUSNANDAR_UID : ownerUid;
  return doc(db, 'pengawas_workspaces', safeOwner, subcol, docId);
}

function getWorkspaceSyncDocRef(ownerUid: string) {
  const safeOwner = isKusnandarOwnerId(ownerUid) ? KUSNANDAR_UID : ownerUid;
  return doc(db, 'pengawas_workspaces', safeOwner, 'meta', 'sync_state');
}

function getWorkspaceProfileDocRef(ownerUid: string) {
  const safeOwner = isKusnandarOwnerId(ownerUid) ? KUSNANDAR_UID : ownerUid;
  return doc(db, 'pengawas_workspaces', safeOwner, 'meta', 'profile');
}

export function isNameDeletedForWorkspace(name: string | undefined, ownerUid: string, deletedNames?: string[]): boolean {
  if (!name) return false;
  const clean = name.toLowerCase().trim();
  const normalizedOwner = isKusnandarOwnerId(ownerUid) ? KUSNANDAR_UID : ownerUid;
  const scopedKey = `${normalizedOwner}::${clean}`;
  const list = deletedNames || getDeletedUserNames();
  for (const entry of list) {
    const low = entry.toLowerCase().trim();
    if (low === scopedKey) return true;
    // Legacy unscoped tombstones only apply to Pak Kusnandar's workspace
    if (!low.includes('::') && normalizedOwner === KUSNANDAR_UID && low === clean) return true;
  }
  return false;
}

async function writeWorkspaceSyncMetadata(ownerUid: string, actorUser?: UserProfile | null): Promise<void> {
  if (!getOnlineMode() || isFirestoreQuotaExceeded) return;
  const safeOwner = isKusnandarOwnerId(ownerUid) ? KUSNANDAR_UID : ownerUid;
  const now = new Date().toISOString();
  const localUser = actorUser || loadLocalUser();
  const allLocalSups = (loadLocalSupervisions() || []).filter(s => belongsToSupervisorWorkspace(s, safeOwner));
  const allLocalSchools = (loadLocalSchools() || []).filter(s => belongsToSupervisorWorkspace(s, safeOwner));
  const allLocalUsers = getStoredUsers().filter(u => belongsToSupervisorWorkspace(u, safeOwner));

  const payload = {
    supervisorId: safeOwner,
    supervisorName: resolveOwnerDisplayName(safeOwner, localUser?.displayName, localUser),
    lastSyncedAt: now,
    lastSyncedBy: localUser?.email || auth.currentUser?.email || 'admin',
    lastSyncedByName: localUser?.displayName || auth.currentUser?.displayName || resolveOwnerDisplayName(safeOwner),
    supervisionsCount: allLocalSups.length,
    supervisionIds: allLocalSups.map(s => s.id),
    schoolsCount: allLocalSchools.length,
    usersCount: allLocalUsers.length,
    timestamp: Date.now(),
  };

  await withFirestoreTimeout(setDoc(getWorkspaceSyncDocRef(safeOwner), payload, { merge: true }), 3500).catch(() => {});

  // Also refresh global summary metadata for Super Admin view
  const allGlobalSups = loadLocalSupervisions() || [];
  const allGlobalSchools = loadLocalSchools() || [];
  const allGlobalUsers = getStoredUsers();
  withFirestoreTimeout(
    setDoc(doc(db, 'system', 'sync_state'), {
      lastSyncedAt: now,
      lastSyncedBy: payload.lastSyncedBy,
      lastSyncedByName: payload.lastSyncedByName,
      supervisionsCount: allGlobalSups.length,
      supervisionIds: allGlobalSups.map(s => s.id),
      schoolsCount: allGlobalSchools.length,
      usersCount: allGlobalUsers.length,
      timestamp: Date.now(),
    }, { merge: true }),
    3000
  ).catch(() => {});
}

function matchesUserCredentials(
  u: Partial<UserProfile> | null | undefined,
  cleanedIdentifier: string,
  passwordInput: string
): boolean {
  if (!u || !cleanedIdentifier) return false;
  const uname = (u.username || '').trim().toLowerCase();
  const uemail = (u.email || '').trim().toLowerCase();
  const emailPrefix = uemail.includes('@') ? uemail.split('@')[0] : '';
  const isIdentifierMatch =
    (Boolean(uname) && uname === cleanedIdentifier) ||
    (Boolean(uemail) && uemail === cleanedIdentifier) ||
    (!cleanedIdentifier.includes('@') && Boolean(emailPrefix) && emailPrefix === cleanedIdentifier);

  if (!isIdentifierMatch) return false;

  const trimmedPass = passwordInput.trim();
  const storedPass = typeof u.password === 'string' ? u.password : '';
  const isSuperAdminAccount = uname === 'admin' || u.role === 'super_admin';

  if (storedPass && (storedPass === passwordInput || storedPass.trim() === trimmedPass)) {
    return true;
  }
  if (!isSuperAdminAccount && (passwordInput === 'pakkus' || trimmedPass === 'pakkus')) {
    return true;
  }
  return false;
}

function cacheAuthenticatedUser(user: UserProfile): void {
  try {
    const current = getStoredUsers();
    const idx = current.findIndex(u => u.uid === user.uid);
    if (idx >= 0) {
      current[idx] = user;
    } else {
      current.push(user);
    }
    saveStoredUsers(current);
  } catch {}
}

export async function authenticateRealUserResult(
  usernameOrEmail: string,
  passwordInput: string
): Promise<{ user: UserProfile | null; error?: string }> {
  const cleaned = (usernameOrEmail || '').trim().toLowerCase();
  const trimmedPass = (passwordInput || '').trim();

  if (!cleaned || !trimmedPass) {
    return { user: null, error: 'Harap masukkan username/email dan kata sandi.' };
  }

  // 1. Super Admin Direct Access (username: admin, password: bajuri39)
  if (cleaned === 'admin' || cleaned === 'admin@siklus-sambung.sch.id') {
    if (passwordInput === 'bajuri39' || trimmedPass === 'bajuri39') {
      const superAdminUser: UserProfile = DEFAULT_USERS[0];
      setDoc(doc(db, 'users', superAdminUser.uid), cleanForFirestore(superAdminUser), { merge: true }).catch(() => {});
      return { user: superAdminUser };
    } else {
      return { user: null, error: 'Kata sandi Super Admin tidak sesuai. Silakan masukkan kata sandi yang valid.' };
    }
  }

  // 2. Check in-memory / local storage user cache first
  const localUsers = getStoredUsers();
  const matchedLocal = localUsers.find(u => matchesUserCredentials(u, cleaned, passwordInput));
  if (matchedLocal) {
    return { user: matchedLocal };
  }

  // 3. Check DEFAULT_USERS
  const matchedDefault = DEFAULT_USERS.find(u => matchesUserCredentials(u, cleaned, passwordInput));
  if (matchedDefault) {
    setDoc(doc(db, 'users', matchedDefault.uid), cleanForFirestore(matchedDefault), { merge: true }).catch(() => {});
    return { user: matchedDefault };
  }

  // 4. Check persistent Backend API `/api/users`
  try {
    const backendUsers = await apiFetchUsers();
    if (Array.isArray(backendUsers) && backendUsers.length > 0) {
      const matchedBackend = backendUsers.find(u => matchesUserCredentials(u, cleaned, passwordInput));
      if (matchedBackend) {
        cacheAuthenticatedUser(matchedBackend);
        return { user: matchedBackend };
      }
    }
  } catch (err) {
    console.warn('Backend user lookup warning:', err);
  }

  // 5. Check Firestore `users` collection (with timeout and null-safe field checks)
  if (!isFirestoreQuotaExceeded) {
    try {
      const usersSnap = await withFirestoreTimeout(getDocs(collection(db, 'users')), 5000, null);
      if (usersSnap) {
        for (const d of usersSnap.docs) {
          const u = d.data() as Partial<UserProfile>;
          if (matchesUserCredentials(u, cleaned, passwordInput)) {
            const resolved: UserProfile = {
              ...(u as UserProfile),
              uid: d.id,
              email: u.email || `${u.username || d.id}@siklus-sambung.sch.id`,
            };
            cacheAuthenticatedUser(resolved);
            return { user: resolved };
          }
        }
      }
    } catch (err) {
      if (isQuotaError(err)) markQuotaExceeded(err);
      console.warn('Firestore user lookup warning:', err);
    }
  }

  // 6. Fallback: if username is 'pengawas' and password is 'pakkus'
  if (cleaned === 'pengawas' && (passwordInput === 'pakkus' || trimmedPass === 'pakkus')) {
    const pengawasUser = DEFAULT_USERS.find(u => u.username === 'pengawas') || DEFAULT_USERS[1];
    setDoc(doc(db, 'users', pengawasUser.uid), cleanForFirestore(pengawasUser), { merge: true }).catch(() => {});
    return { user: pengawasUser };
  }

  // 7. Fallback: Firebase Auth Email/Password login (for users registered via Firebase Auth)
  try {
    const emailCandidate = cleaned.includes('@') ? cleaned : `${cleaned}@siklus-sambung.sch.id`;
    const cred = await signInWithEmailAndPassword(auth, emailCandidate, passwordInput);
    const existingProfile = await getUserProfile(cred.user.uid);
    if (existingProfile) {
      cacheAuthenticatedUser(existingProfile);
      return { user: existingProfile };
    }
    const fallbackProfile: UserProfile = {
      uid: cred.user.uid,
      username: emailCandidate.split('@')[0],
      email: cred.user.email || emailCandidate,
      displayName: cred.user.displayName || emailCandidate.split('@')[0],
      role: 'guru',
      approvalStatus: 'approved',
      createdAt: new Date().toISOString(),
    };
    cacheAuthenticatedUser(fallbackProfile);
    return { user: fallbackProfile };
  } catch {
    // Ignore Firebase Auth mismatch and return clean user-facing error
  }

  return {
    user: null,
    error: 'Username atau kata sandi tidak sesuai. Silakan periksa kembali kredensial Anda.',
  };
}

// Authenticate via username/email & password
export async function authenticateRealUser(
  usernameOrEmail: string,
  passwordInput: string
): Promise<UserProfile> {
  const result = await authenticateRealUserResult(usernameOrEmail, passwordInput);
  if (result.user) {
    return result.user;
  }
  throw new Error(result.error || 'Username atau kata sandi tidak sesuai. Silakan periksa kembali kredensial Anda.');
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
export async function fetchAllUsers(userProfile?: UserProfile | null): Promise<UserProfile[]> {
  let currentUsers = getStoredUsers();
  const deletedUids = new Set(getDeletedUserIds());
  const deletedNames = getDeletedUserNames();
  const ownerScope = resolveWorkspaceOwnerForUser(userProfile);

  const filterUsers = (list: UserProfile[]) =>
    list.filter(u => {
      if (deletedUids.has(u.uid)) return false;
      const recOwner = resolveRecordOwnerUid(u);
      if (u.role === 'guru' && isNameDeletedForWorkspace(u.displayName, recOwner, deletedNames)) return false;
      if (ownerScope) {
        if (isSuperAdminAccount(u)) return false;
        return belongsToSupervisorWorkspace(u, ownerScope);
      }
      return true;
    });

  // If in Offline mode, serve directly from Local Storage
  if (!getOnlineMode()) {
    return filterUsers(currentUsers);
  }

  // 1. Fetch from persistent backend API
  try {
    const backendUsers = await apiFetchUsers(ownerScope || undefined);
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

  // 2. Live Firestore sync (workspace subcollection + top-level users)
  try {
    const reads: Promise<any>[] = [
      withFirestoreTimeout(getDocs(collection(db, 'users')), 4000, null),
    ];
    if (ownerScope) {
      reads.push(withFirestoreTimeout(getDocs(getWorkspaceColRef(ownerScope, 'users')), 4000, null));
    }
    const [topSnap, wsSnap] = await Promise.all(reads);
    const map = new Map<string, UserProfile>();
    currentUsers.forEach(u => map.set(u.uid, u));
    if (topSnap && !topSnap.empty) {
      topSnap.docs.forEach((d: any) => {
        const u = { ...d.data(), uid: d.id } as UserProfile;
        map.set(u.uid, u);
      });
    }
    if (wsSnap && !wsSnap.empty) {
      wsSnap.docs.forEach((d: any) => {
        const u = { ...d.data(), uid: d.id } as UserProfile;
        map.set(u.uid, u);
      });
    }
    currentUsers = Array.from(map.values());
    saveStoredUsers(currentUsers);
  } catch (err) {
    console.warn('Notice fetching users from Firestore (using backend/local):', err);
  }

  return filterUsers(currentUsers);
}

export async function addUserAccount(user: UserProfile): Promise<UserProfile> {
  const uid = user.uid || `user-${Date.now()}`;
  const now = new Date().toISOString();
  const activeActor = loadLocalUser();
  const isSuper = isSuperAdminAccount(user);
  const ownerUid = isSuper
    ? 'user-super-admin'
    : resolveRecordOwnerUid({ ...user, uid }, activeActor);
  const ownerName = isSuper
    ? undefined
    : resolveOwnerDisplayName(
        ownerUid,
        user.role === 'pengawas' || user.role === 'admin' ? user.displayName : user.supervisorName,
        activeActor
      );

  const completeUser: UserProfile = {
    ...user,
    uid,
    ...(isSuper
      ? {}
      : {
          supervisorId: user.supervisorId || ownerUid,
          supervisorWorkspaceId: user.supervisorWorkspaceId || ownerUid,
          supervisorName: user.supervisorName || ownerName,
          createdBy: user.createdBy || activeActor?.uid || ownerUid,
        }),
    createdAt: user.createdAt || now,
    updatedAt: now,
    approvalStatus: user.approvalStatus || 'approved',
  };

  // Remove from deleted tombstones if re-added
  removeDeletedUserId(uid);
  if (user.displayName) removeDeletedUserName(user.displayName, ownerUid);

  // 1. Always save locally first (instant 0ms response)
  const current = getStoredUsers();
  const existingIdx = current.findIndex(u => u.uid === uid || (user.username && u.username === user.username));
  if (existingIdx >= 0) {
    current[existingIdx] = completeUser;
  } else {
    current.push(completeUser);
  }
  saveStoredUsers(current);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pakkus-local-users-updated'));
  }

  // If Offline Mode: store in localStorage and flag for automatic sync when switched back Online
  if (!getOnlineMode()) {
    markDataModifiedLocally();
    return completeUser;
  }

  // 2. Save to backend API
  try {
    await apiSaveUser(completeUser);
  } catch (apiErr) {
    console.warn('Backend API save user notice:', apiErr);
  }

  // 3. Save to Firestore in real-time (BOTH top-level users & dedicated per-Pengawas workspace)
  if (!isFirestoreQuotaExceeded) {
    try {
      const cleaned = cleanForFirestore(completeUser);
      const writes: Promise<any>[] = [
        withFirestoreTimeout(setDoc(doc(db, 'users', uid), cleaned, { merge: true }), 4500),
      ];
      if (!isSuper && ownerUid !== 'user-super-admin') {
        writes.push(
          withFirestoreTimeout(setDoc(getWorkspaceDocRef(ownerUid, 'users', uid), cleaned, { merge: true }), 4500)
        );
        // When a new Pengawas account is created, initialize their clean isolated workspace metadata doc in Firebase
        if (completeUser.role === 'pengawas' || completeUser.role === 'admin') {
          writes.push(
            withFirestoreTimeout(
              setDoc(
                getWorkspaceProfileDocRef(ownerUid),
                cleanForFirestore({
                  supervisorId: ownerUid,
                  supervisorName: completeUser.displayName,
                  username: completeUser.username,
                  email: completeUser.email,
                  wilayahTugas: completeUser.wilayahTugas || '',
                  createdAt: completeUser.createdAt,
                  updatedAt: now,
                }),
                { merge: true }
              ),
              4000
            )
          );
          if (ownerUid !== KUSNANDAR_UID) {
            writes.push(
              withFirestoreTimeout(
                setDoc(
                  getWorkspaceSyncDocRef(ownerUid),
                  {
                    supervisorId: ownerUid,
                    supervisorName: completeUser.displayName,
                    lastSyncedAt: now,
                    lastSyncedBy: activeActor?.email || completeUser.email,
                    lastSyncedByName: activeActor?.displayName || completeUser.displayName,
                    supervisionsCount: 0,
                    supervisionIds: [],
                    schoolsCount: 0,
                    usersCount: 1,
                    timestamp: Date.now(),
                  },
                  { merge: true }
                ),
                4000
              )
            );
          }
        }
      }
      await Promise.all(writes);
    } catch (err) {
      if (isQuotaError(err)) markQuotaExceeded(err);
      console.warn('Notice saving user to Firestore (saved in backend/local):', err);
    }
  }

  return completeUser;
}

export async function updateUserAccount(user: UserProfile): Promise<UserProfile> {
  const now = new Date().toISOString();
  const current = getStoredUsers();
  const existingIdx = current.findIndex(u => u.uid === user.uid || (user.username && u.username === user.username));
  const existing = existingIdx >= 0 ? current[existingIdx] : null;
  const activeActor = loadLocalUser();
  const isSuper = isSuperAdminAccount(user);
  const ownerUid = isSuper
    ? 'user-super-admin'
    : resolveRecordOwnerUid({ ...existing, ...user }, activeActor);
  const ownerName = isSuper
    ? undefined
    : resolveOwnerDisplayName(
        ownerUid,
        user.role === 'pengawas' || user.role === 'admin' ? user.displayName : (user.supervisorName || existing?.supervisorName),
        activeActor
      );

  const completeUser: UserProfile = {
    ...existing,
    ...user,
    ...(isSuper
      ? {}
      : {
          supervisorId: user.supervisorId || existing?.supervisorId || ownerUid,
          supervisorWorkspaceId: user.supervisorWorkspaceId || existing?.supervisorWorkspaceId || ownerUid,
          supervisorName: user.supervisorName || existing?.supervisorName || ownerName,
          createdBy: user.createdBy || existing?.createdBy || ownerUid,
        }),
    updatedAt: now,
  };

  // 1. Always save locally first
  if (existingIdx >= 0) {
    current[existingIdx] = completeUser;
  } else {
    current.push(completeUser);
  }
  saveStoredUsers(current);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pakkus-local-users-updated'));
  }

  const isOnline = getOnlineMode();

  // 2. Save to backend API & Firestore only when Online
  if (isOnline) {
    try {
      await apiSaveUser(completeUser);
    } catch (apiErr) {
      console.warn('Backend API update user notice:', apiErr);
    }

    if (!isFirestoreQuotaExceeded) {
      try {
        const cleaned = cleanForFirestore(completeUser);
        const writes: Promise<any>[] = [
          withFirestoreTimeout(setDoc(doc(db, 'users', completeUser.uid), cleaned, { merge: true }), 4500),
        ];
        if (!isSuper && ownerUid !== 'user-super-admin') {
          writes.push(
            withFirestoreTimeout(setDoc(getWorkspaceDocRef(ownerUid, 'users', completeUser.uid), cleaned, { merge: true }), 4500)
          );
          if (completeUser.role === 'pengawas' || completeUser.role === 'admin') {
            writes.push(
              withFirestoreTimeout(
                setDoc(
                  getWorkspaceProfileDocRef(ownerUid),
                  cleanForFirestore({
                    supervisorId: ownerUid,
                    supervisorName: completeUser.displayName,
                    username: completeUser.username,
                    email: completeUser.email,
                    wilayahTugas: completeUser.wilayahTugas || '',
                    updatedAt: now,
                  }),
                  { merge: true }
                ),
                4000
              )
            );
          }
        }
        await Promise.all(writes);
      } catch (err) {
        if (isQuotaError(err)) markQuotaExceeded(err);
        console.warn('Notice updating user in Firestore (saved in backend/local):', err);
      }
    }
  } else {
    markDataModifiedLocally();
  }

  // 4. Update related supervisions if teacher information changed (strictly within the same workspace)
  try {
    const supervisions = loadLocalSupervisions() || [];
    let supModified = false;
    const updatedSupervisions = supervisions.map(s => {
      if (
        (s.teacherId === completeUser.uid || (completeUser.username && s.teacherId === completeUser.username)) &&
        (isSuper || belongsToSupervisorWorkspace(s, ownerUid))
      ) {
        supModified = true;
        return {
          ...s,
          teacherName: completeUser.displayName || s.teacherName,
          teacherNip: completeUser.nip !== undefined ? completeUser.nip : s.teacherNip,
          subject: completeUser.subject || s.subject,
          schoolId: completeUser.schoolId || s.schoolId,
          schoolName: completeUser.schoolName || s.schoolName,
          updatedAt: now,
        };
      }
      return s;
    });
    if (supModified) {
      saveLocalSupervisions(updatedSupervisions);
      if (isOnline) {
        for (const s of updatedSupervisions) {
          if (
            (s.teacherId === completeUser.uid || (completeUser.username && s.teacherId === completeUser.username)) &&
            (isSuper || belongsToSupervisorWorkspace(s, ownerUid))
          ) {
            const supOwner = resolveRecordOwnerUid(s);
            apiSaveSupervision(s).catch(() => {});
            if (!isFirestoreQuotaExceeded) {
              const cleanedSup = cleanForFirestore(s);
              await Promise.all([
                withFirestoreTimeout(setDoc(doc(db, 'supervisions', s.id), cleanedSup, { merge: true }), 3500),
                withFirestoreTimeout(setDoc(getWorkspaceDocRef(supOwner, 'supervisions', s.id), cleanedSup, { merge: true }), 3500),
              ]).catch((err) => {
                if (isQuotaError(err)) markQuotaExceeded(err);
              });
            }
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

export function addDeletedUserName(name: string, ownerUid?: string) {
  if (!name) return;
  try {
    const names = getDeletedUserNames();
    const clean = name.toLowerCase().trim();
    const entry = ownerUid ? `${isKusnandarOwnerId(ownerUid) ? KUSNANDAR_UID : ownerUid}::${clean}` : clean;
    if (!names.includes(entry)) {
      names.push(entry);
      localStorage.setItem(DELETED_USER_NAMES_KEY, JSON.stringify(names));
    }
  } catch {}
}

export function removeDeletedSupervisionId(id: string) {
  try {
    const ids = getDeletedSupervisionIds().filter(i => i !== id);
    localStorage.setItem(DELETED_SUPERVISION_IDS_KEY, JSON.stringify(ids));
  } catch {}
}

export function removeDeletedUserId(uid: string) {
  try {
    const ids = getDeletedUserIds().filter(i => i !== uid);
    localStorage.setItem(DELETED_USER_IDS_KEY, JSON.stringify(ids));
  } catch {}
}

export function removeDeletedUserName(name: string, ownerUid?: string) {
  if (!name) return;
  try {
    const clean = name.toLowerCase().trim();
    const normalizedOwner = ownerUid ? (isKusnandarOwnerId(ownerUid) ? KUSNANDAR_UID : ownerUid) : null;
    const scopedKey = normalizedOwner ? `${normalizedOwner}::${clean}` : null;
    const names = getDeletedUserNames().filter(n => {
      const low = n.toLowerCase().trim();
      if (scopedKey && low === scopedKey) return false;
      if (!scopedKey && low === clean) return false;
      if (normalizedOwner === KUSNANDAR_UID && low === clean) return false;
      return true;
    });
    localStorage.setItem(DELETED_USER_NAMES_KEY, JSON.stringify(names));
  } catch {}
}

export async function purgeTeacherDataCompletely(target: {
  id?: string;
  teacherId?: string;
  teacherName?: string;
  supervisorId?: string;
}): Promise<void> {
  const cleanName = (target.teacherName || '').toLowerCase().trim();
  const targetId = target.id;
  let teacherId = target.teacherId;
  let resolvedOwnerUid = target.supervisorId
    ? (isKusnandarOwnerId(target.supervisorId) ? KUSNANDAR_UID : target.supervisorId)
    : undefined;

  // Find missing teacherId, teacherName, or ownerUid from local supervisions or users
  if (targetId) {
    const localSups = loadLocalSupervisions() || [];
    const found = localSups.find(s => s.id === targetId);
    if (found) {
      if (!cleanName && found.teacherName) target.teacherName = found.teacherName;
      if (!teacherId && found.teacherId) teacherId = found.teacherId;
      if (!resolvedOwnerUid) resolvedOwnerUid = resolveRecordOwnerUid(found);
    }
  }
  if (teacherId) {
    const foundUser = getStoredUsers().find(u => u.uid === teacherId);
    if (foundUser) {
      if (!target.teacherName && foundUser.displayName) target.teacherName = foundUser.displayName;
      if (!resolvedOwnerUid && !isSuperAdminAccount(foundUser)) {
        resolvedOwnerUid = resolveRecordOwnerUid(foundUser);
      }
    }
  }
  if (!resolvedOwnerUid) {
    resolvedOwnerUid = resolveWorkspaceOwnerForUser(loadLocalUser()) || KUSNANDAR_UID;
  }

  const effectiveCleanName = (target.teacherName || '').toLowerCase().trim();

  // 1. Record in local deleted tracking sets (name tombstone strictly scoped to this supervisor workspace!)
  if (targetId) {
    addDeletedSupervisionId(targetId);
    clearFormDraft(targetId);
  }
  if (effectiveCleanName) {
    addDeletedUserName(effectiveCleanName, resolvedOwnerUid);
  }
  if (teacherId) {
    addDeletedUserId(teacherId);
    clearFormDraft(teacherId);
  }

  // 2. Clear any cached form drafts matching this exact target/teacher ID
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('siklus_sambung_draft_')) {
          if (targetId && k.includes(targetId)) keysToRemove.push(k);
          if (teacherId && k.includes(teacherId)) keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    }
  } catch (err) {
    console.warn('Notice clearing local drafts:', err);
  }

  // 3. Remove matching supervisions ONLY within resolvedOwnerUid's workspace (never touch other Pengawas!)
  const matchedSupIds = new Set<string>();
  if (targetId) matchedSupIds.add(targetId);
  try {
    const localSups = loadLocalSupervisions() || [];
    localSups.forEach(s => {
      const sameWorkspace = belongsToSupervisorWorkspace(s, resolvedOwnerUid!);
      if (targetId && s.id === targetId) matchedSupIds.add(s.id);
      if (sameWorkspace && teacherId && s.teacherId === teacherId) matchedSupIds.add(s.id);
      if (
        sameWorkspace &&
        effectiveCleanName &&
        s.teacherName &&
        s.teacherName.toLowerCase().trim() === effectiveCleanName
      ) {
        matchedSupIds.add(s.id);
      }
    });
    matchedSupIds.forEach(id => addDeletedSupervisionId(id));

    const remainingSups = localSups.filter(s => !matchedSupIds.has(s.id));
    saveLocalSupervisions(remainingSups);
  } catch (err) {
    console.warn('Notice cleaning local supervisions:', err);
  }

  // 4. Remove matching users ONLY within resolvedOwnerUid's workspace (never touch other Pengawas!)
  const matchedUserUids = new Set<string>();
  if (teacherId) matchedUserUids.add(teacherId);
  try {
    const allUsers = getStoredUsers();
    allUsers.forEach(u => {
      if (isSuperAdminAccount(u)) return;
      const sameWorkspace = belongsToSupervisorWorkspace(u, resolvedOwnerUid!);
      if (teacherId && u.uid === teacherId) matchedUserUids.add(u.uid);
      if (
        sameWorkspace &&
        u.role === 'guru' &&
        effectiveCleanName &&
        u.displayName &&
        u.displayName.toLowerCase().trim() === effectiveCleanName
      ) {
        matchedUserUids.add(u.uid);
      }
    });
    matchedUserUids.forEach(uid => addDeletedUserId(uid));

    const remainingUsers = allUsers.filter(u => !matchedUserUids.has(u.uid));
    saveStoredUsers(remainingUsers);
  } catch (err) {
    console.warn('Notice cleaning local users:', err);
  }

  const isOnline = getOnlineMode();

  if (isOnline) {
    // 5. Backend Server API Purge (strictly scoped by supervisorId)
    try {
      await apiPurgeTeacher({
        teacherName: target.teacherName || '',
        teacherId: teacherId,
        supervisionId: target.id,
        supervisorId: resolvedOwnerUid,
      });
    } catch (err) {
      console.warn('Notice calling backend purge:', err);
    }

    // 6. Delete clean from Firebase Firestore in real-time (BOTH top-level & per-Pengawas workspace)
    if (!isFirestoreQuotaExceeded) {
      try {
        const deletePromises: Promise<any>[] = [];

        for (const supId of matchedSupIds) {
          deletePromises.push(
            withFirestoreTimeout(deleteDoc(doc(db, 'supervisions', supId)), 4000).catch((err) => {
              if (isQuotaError(err)) markQuotaExceeded(err);
            }),
            withFirestoreTimeout(deleteDoc(getWorkspaceDocRef(resolvedOwnerUid, 'supervisions', supId)), 4000).catch((err) => {
              if (isQuotaError(err)) markQuotaExceeded(err);
            })
          );
        }

        for (const uId of matchedUserUids) {
          deletePromises.push(
            withFirestoreTimeout(deleteDoc(doc(db, 'users', uId)), 4000).catch((err) => {
              if (isQuotaError(err)) markQuotaExceeded(err);
            }),
            withFirestoreTimeout(deleteDoc(getWorkspaceDocRef(resolvedOwnerUid, 'users', uId)), 4000).catch((err) => {
              if (isQuotaError(err)) markQuotaExceeded(err);
            })
          );
        }

        // Only clean up duplicate docs matching teacherName INSIDE this supervisor's own workspace
        if (effectiveCleanName && target.teacherName) {
          deletePromises.push(
            withFirestoreTimeout(
              getDocs(query(getWorkspaceColRef(resolvedOwnerUid, 'supervisions'), where('teacherName', '==', target.teacherName))),
              3500,
              null
            ).then(async (snap) => {
              if (!snap) return;
              await Promise.all(
                snap.docs.flatMap(d => [
                  deleteDoc(getWorkspaceDocRef(resolvedOwnerUid!, 'supervisions', d.id)).catch(() => {}),
                  deleteDoc(doc(db, 'supervisions', d.id)).catch(() => {}),
                ])
              );
            }).catch(() => {})
          );

          deletePromises.push(
            withFirestoreTimeout(
              getDocs(query(collection(db, 'supervisions'), where('teacherName', '==', target.teacherName))),
              3500,
              null
            ).then(async (snap) => {
              if (!snap) return;
              const ownDocs = snap.docs.filter(d => belongsToSupervisorWorkspace({ id: d.id, ...d.data() }, resolvedOwnerUid!));
              await Promise.all(
                ownDocs.flatMap(d => [
                  deleteDoc(doc(db, 'supervisions', d.id)).catch(() => {}),
                  deleteDoc(getWorkspaceDocRef(resolvedOwnerUid!, 'supervisions', d.id)).catch(() => {}),
                ])
              );
            }).catch(() => {})
          );
        }

        await Promise.all(deletePromises);
        await writeWorkspaceSyncMetadata(resolvedOwnerUid);

        const now = new Date().toISOString();
        const ownCount = (loadLocalSupervisions() || []).filter(s => belongsToSupervisorWorkspace(s, resolvedOwnerUid!)).length;
        if (typeof window !== 'undefined') {
          localStorage.setItem(LAST_SYNC_TIME_KEY, now);
          window.dispatchEvent(new CustomEvent('pakkus-sync-completed', { detail: { syncTime: now, count: ownCount } }));
        }
      } catch (err) {
        if (isQuotaError(err)) markQuotaExceeded(err);
        console.warn('Notice deleting teacher data from Firestore:', err);
      }
    }
  } else {
    markDataModifiedLocally();
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pakkus-local-users-updated'));
    window.dispatchEvent(new CustomEvent('pakkus-local-supervisions-updated'));
  }
}

export async function deleteUserAccount(uid: string): Promise<void> {
  const allUsers = getStoredUsers();
  const targetUser = allUsers.find(u => u.uid === uid);
  await purgeTeacherDataCompletely({
    teacherId: uid,
    teacherName: targetUser?.displayName,
    supervisorId: targetUser ? resolveRecordOwnerUid(targetUser) : undefined,
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
  const now = new Date().toISOString();
  const current = getStoredUsers();
  const idx = current.findIndex(u => u.uid === uid);
  let updatedUser: UserProfile | null = null;
  if (idx >= 0) {
    updatedUser = { ...current[idx], approvalStatus: status, updatedAt: now };
    current[idx] = updatedUser;
    saveStoredUsers(current);
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pakkus-local-users-updated'));
  }

  if (!getOnlineMode()) {
    markDataModifiedLocally();
    return;
  }

  if (updatedUser) {
    try {
      await apiSaveUser(updatedUser);
    } catch {}
  }

  if (!isFirestoreQuotaExceeded) {
    try {
      const ownerUid = updatedUser ? resolveRecordOwnerUid(updatedUser) : null;
      const writes: Promise<any>[] = [
        withFirestoreTimeout(
          setDoc(doc(db, 'users', uid), { approvalStatus: status, updatedAt: now }, { merge: true }),
          4000
        ),
      ];
      if (ownerUid && ownerUid !== 'user-super-admin') {
        writes.push(
          withFirestoreTimeout(
            setDoc(getWorkspaceDocRef(ownerUid, 'users', uid), { approvalStatus: status, updatedAt: now }, { merge: true }),
            4000
          )
        );
      }
      await Promise.all(writes);
    } catch (err) {
      if (isQuotaError(err)) markQuotaExceeded(err);
      console.warn('Could not update user approval in Firestore, updated state locally', err);
    }
  }
}

export async function fetchUsersBySchool(schoolId?: string): Promise<UserProfile[]> {
  const all = await fetchAllUsers();
  if (!schoolId) return all;
  return all.filter(u => u.schoolId === schoolId);
}

// Subscribe to real-time users updates (Firestore onSnapshot + per-Pengawas workspace + Local fallback)
export function subscribeToUsers(
  callback: (users: UserProfile[]) => void,
  userProfile?: UserProfile | null
): Unsubscribe {
  const ownerScope = resolveWorkspaceOwnerForUser(userProfile);

  const getFilteredLocalUsers = () => {
    const deletedUids = new Set(getDeletedUserIds());
    const deletedNames = getDeletedUserNames();
    return getStoredUsers().filter(u => {
      if (deletedUids.has(u.uid)) return false;
      const recOwner = resolveRecordOwnerUid(u);
      if (u.role === 'guru' && isNameDeletedForWorkspace(u.displayName, recOwner, deletedNames)) return false;
      if (ownerScope) {
        if (isSuperAdminAccount(u)) return false;
        return belongsToSupervisorWorkspace(u, ownerScope);
      }
      return true;
    });
  };

  callback(getFilteredLocalUsers());

  const unsubs: Unsubscribe[] = [];

  const mergeAndEmit = (incoming: UserProfile[]) => {
    const deletedUids = new Set(getDeletedUserIds());
    const deletedNames = getDeletedUserNames();
    const map = new Map<string, UserProfile>();
    DEFAULT_USERS.forEach(u => {
      if (!deletedUids.has(u.uid)) map.set(u.uid, u);
    });
    getStoredUsers().forEach(u => {
      if (!deletedUids.has(u.uid)) map.set(u.uid, u);
    });
    incoming.forEach(u => {
      if (deletedUids.has(u.uid)) return;
      const recOwner = resolveRecordOwnerUid(u);
      if (u.role === 'guru' && isNameDeletedForWorkspace(u.displayName, recOwner, deletedNames)) return;
      map.set(u.uid, u);
    });
    const combined = Array.from(map.values());
    saveStoredUsers(combined);
    callback(getFilteredLocalUsers());
  };

  try {
    unsubs.push(
      onSnapshot(collection(db, 'users'), (snap) => {
        if (!getOnlineMode() || isSyncingOfflineQueue) return;
        const firestoreUsers = snap.docs.map(d => ({ ...d.data(), uid: d.id } as UserProfile));
        mergeAndEmit(firestoreUsers);
      }, (err) => {
        console.warn('Real-time users subscription warning:', err);
        callback(getFilteredLocalUsers());
      })
    );

    if (ownerScope) {
      unsubs.push(
        onSnapshot(getWorkspaceColRef(ownerScope, 'users'), (snap) => {
          if (!getOnlineMode() || isSyncingOfflineQueue) return;
          const wsUsers = snap.docs.map(d => ({ ...d.data(), uid: d.id } as UserProfile));
          mergeAndEmit(wsUsers);
        }, (err) => {
          console.warn('Real-time workspace users subscription warning:', err);
        })
      );
    }
  } catch (err) {
    console.warn('Failed to attach real-time users listener:', err);
    callback(getFilteredLocalUsers());
  }

  const handleLocalChange = () => {
    callback(getFilteredLocalUsers());
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('pakkus-local-users-updated', handleLocalChange);
    window.addEventListener('pakkus-sync-completed', handleLocalChange);
    window.addEventListener('pakkus-online-mode-changed', handleLocalChange);
    return () => {
      unsubs.forEach(u => u());
      window.removeEventListener('pakkus-local-users-updated', handleLocalChange);
      window.removeEventListener('pakkus-sync-completed', handleLocalChange);
      window.removeEventListener('pakkus-online-mode-changed', handleLocalChange);
    };
  }

  return () => {
    unsubs.forEach(u => u());
  };
}

function filterSchoolsForUser(list: School[], userProfile?: UserProfile | null): School[] {
  if (!userProfile || isSuperAdminAccount(userProfile)) return list;
  if (userProfile.role === 'kepsek') {
    const userSch = (userProfile.schoolName || '').toLowerCase().trim();
    return list.filter(s => s.id === userProfile.schoolId || (userSch && s.name.toLowerCase().includes(userSch)));
  }
  if (userProfile.role === 'guru') {
    return list.filter(s => s.id === userProfile.schoolId);
  }
  const ownerScope = resolveWorkspaceOwnerForUser(userProfile);
  if (!ownerScope) return list;
  return list.filter(s => belongsToSupervisorWorkspace(s, ownerScope));
}

// Real-time synchronization listener for Schools (per-Pengawas isolated Firestore workspace + top-level fallback)
export function subscribeToSchools(
  callback: (schools: School[]) => void,
  userProfile?: UserProfile | null
): Unsubscribe {
  const ownerScope = resolveWorkspaceOwnerForUser(userProfile);
  const isNewNonKusnandarPengawas = Boolean(
    userProfile &&
    (userProfile.role === 'pengawas' || userProfile.role === 'admin') &&
    !isKusnandarAccount(userProfile)
  );

  const getLocalScopedSchools = () => {
    const cached = loadLocalSchools();
    const base = cached && cached.length > 0 ? cached : (isNewNonKusnandarPengawas ? [] : DEFAULT_SCHOOLS);
    return filterSchoolsForUser(base, userProfile);
  };

  callback(getLocalScopedSchools());

  const unsubs: Unsubscribe[] = [];

  const handleIncomingSchools = (incoming: School[]) => {
    if (incoming.length > 0) {
      mergeLocalSchools(incoming);
    }
    callback(getLocalScopedSchools());
  };

  try {
    if (ownerScope && (userProfile?.role === 'pengawas' || userProfile?.role === 'admin')) {
      // Dedicated per-Pengawas Firestore workspace listener
      unsubs.push(
        onSnapshot(getWorkspaceColRef(ownerScope, 'schools'), (snap) => {
          if (!getOnlineMode() || isSyncingOfflineQueue) return;
          const wsSchools = snap.docs.map(d => normalizeSchoolData({
            id: d.id,
            supervisorId: ownerScope,
            supervisorWorkspaceId: ownerScope,
            ...d.data(),
          } as School));
          handleIncomingSchools(wsSchools);
        }, (err) => {
          console.warn('Real-time workspace schools onSnapshot notice:', err);
        })
      );
    }

    // Top-level schools listener (strictly filtered to ownerScope when Pengawas)
    unsubs.push(
      onSnapshot(collection(db, 'schools'), (snap) => {
        if (!getOnlineMode() || isSyncingOfflineQueue) return;
        if (!snap.empty) {
          const firestoreSchools = snap.docs.map(d => normalizeSchoolData({ id: d.id, ...d.data() } as School));
          const relevant = ownerScope
            ? firestoreSchools.filter(s => belongsToSupervisorWorkspace(s, ownerScope))
            : firestoreSchools;
          handleIncomingSchools(relevant);
        }
      }, (err) => {
        console.warn('Real-time schools onSnapshot notice:', err);
        callback(getLocalScopedSchools());
      })
    );
  } catch (err) {
    console.warn('Could not attach Firestore onSnapshot for schools:', err);
  }

  const handleLocalChange = () => {
    callback(getLocalScopedSchools());
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('pakkus-local-schools-updated', handleLocalChange);
    window.addEventListener('pakkus-sync-completed', handleLocalChange);
    window.addEventListener('pakkus-online-mode-changed', handleLocalChange);
    return () => {
      unsubs.forEach(u => u());
      window.removeEventListener('pakkus-local-schools-updated', handleLocalChange);
      window.removeEventListener('pakkus-sync-completed', handleLocalChange);
      window.removeEventListener('pakkus-online-mode-changed', handleLocalChange);
    };
  }

  return () => {
    unsubs.forEach(u => u());
  };
}

// Seed initial Kusnandar schools and synchronise with Firestore (without touching other pengawas's schools)
export async function ensureInitialSchools(): Promise<School[]> {
  const local = loadLocalSchools();
  if (local && local.length > 0) {
    return local;
  }
  try {
    const schoolsSnap = await withFirestoreTimeout(getDocs(collection(db, 'schools')), 1800, null);
    if (schoolsSnap && !schoolsSnap.empty) {
      const data = schoolsSnap.docs.map(d => normalizeSchoolData({ id: d.id, ...d.data() } as School));
      mergeLocalSchools(data);
      return data;
    }

    // Bootstrap Pak Kusnandar defaults into both top-level & his dedicated workspace
    for (const sch of DEFAULT_SCHOOLS) {
      const cleaned = cleanForFirestore(sch);
      withFirestoreTimeout(setDoc(doc(db, 'schools', sch.id), cleaned, { merge: true }), 1500).catch(() => {});
      withFirestoreTimeout(setDoc(getWorkspaceDocRef(KUSNANDAR_UID, 'schools', sch.id), cleaned, { merge: true }), 1500).catch(() => {});
    }
    mergeLocalSchools(DEFAULT_SCHOOLS);
    return DEFAULT_SCHOOLS;
  } catch (err) {
    console.warn('Using default schools due to offline or uninitialized state', err);
    mergeLocalSchools(DEFAULT_SCHOOLS);
    return DEFAULT_SCHOOLS;
  }
}

export async function resetToDefaultSchools(): Promise<School[]> {
  // Merge Pak Kusnandar's 11 default schools WITHOUT wiping any other Pengawas's schools
  const merged = mergeLocalSchools(DEFAULT_SCHOOLS);
  try {
    await apiResetSchools();
  } catch {}
  for (const sch of DEFAULT_SCHOOLS) {
    const cleaned = cleanForFirestore(sch);
    withFirestoreTimeout(setDoc(doc(db, 'schools', sch.id), cleaned, { merge: true }), 1500).catch(() => {});
    withFirestoreTimeout(setDoc(getWorkspaceDocRef(KUSNANDAR_UID, 'schools', sch.id), cleaned, { merge: true }), 1500).catch(() => {});
  }
  return merged;
}

export async function fetchAllSchools(userProfile?: UserProfile | null): Promise<School[]> {
  const ownerScope = resolveWorkspaceOwnerForUser(userProfile);
  const isNewNonKusnandarPengawas = Boolean(
    userProfile &&
    (userProfile.role === 'pengawas' || userProfile.role === 'admin') &&
    !isKusnandarAccount(userProfile)
  );
  const local = loadLocalSchools();
  let currentList = local && local.length > 0 ? local : (isNewNonKusnandarPengawas ? [] : DEFAULT_SCHOOLS);

  if (!getOnlineMode()) {
    return filterSchoolsForUser(currentList, userProfile);
  }

  // 1. Fetch from persistent backend API (scoped if pengawas)
  try {
    const backendSchools = await apiFetchSchools(ownerScope || undefined);
    if (backendSchools && backendSchools.length > 0) {
      currentList = mergeLocalSchools(backendSchools);
    }
  } catch (backendErr) {
    console.warn('Backend API schools notice:', backendErr);
  }

  // 2. Fetch latest schools from Firebase Firestore (dedicated workspace + top-level)
  try {
    const reads: Promise<any>[] = [
      withFirestoreTimeout(getDocs(collection(db, 'schools')), 3500, null),
    ];
    if (ownerScope) {
      reads.push(withFirestoreTimeout(getDocs(getWorkspaceColRef(ownerScope, 'schools')), 3500, null));
    }
    const [topSnap, wsSnap] = await Promise.all(reads);
    const incoming: School[] = [];
    if (topSnap && !topSnap.empty) {
      topSnap.docs.forEach((d: any) => {
        incoming.push(normalizeSchoolData({ id: d.id, ...d.data() } as School));
      });
    }
    if (wsSnap && !wsSnap.empty) {
      wsSnap.docs.forEach((d: any) => {
        incoming.push(normalizeSchoolData({
          id: d.id,
          supervisorId: ownerScope || undefined,
          supervisorWorkspaceId: ownerScope || undefined,
          ...d.data(),
        } as School));
      });
    }
    if (incoming.length > 0) {
      currentList = mergeLocalSchools(incoming);
    }
  } catch (err) {
    console.warn('Notice fetching schools from Firestore (using backend/local storage):', err);
  }

  return filterSchoolsForUser(currentList, userProfile);
}

export async function addSchool(data: Omit<School, 'id'>): Promise<School> {
  const targetId = `sch-${Date.now()}`;
  const now = new Date().toISOString();
  const activeActor = loadLocalUser();
  const ownerUid = resolveRecordOwnerUid(data, activeActor);
  const ownerName = resolveOwnerDisplayName(ownerUid, data.supervisorName, activeActor);

  const school: School = {
    id: targetId,
    ...data,
    supervisorId: data.supervisorId || ownerUid,
    supervisorWorkspaceId: data.supervisorWorkspaceId || ownerUid,
    supervisorName: data.supervisorName || ownerName,
    createdAt: data.createdAt || now,
    updatedAt: now,
    createdBy: data.createdBy || activeActor?.uid || ownerUid,
  };

  saveSingleLocalSchool(school);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pakkus-local-schools-updated'));
  }

  if (!getOnlineMode()) {
    markDataModifiedLocally();
    return school;
  }

  // Persist to backend API (disk + per-pengawas workspace file)
  try {
    await apiSaveSchool(school);
  } catch (err) {
    console.warn('Backend API save school notice:', err);
  }

  // Persist real-time to Firebase Firestore (BOTH dedicated per-Pengawas workspace & top-level)
  if (!isFirestoreQuotaExceeded) {
    try {
      const cleaned = cleanForFirestore(school);
      await Promise.all([
        withFirestoreTimeout(setDoc(doc(db, 'schools', targetId), cleaned, { merge: true }), 4000),
        withFirestoreTimeout(setDoc(getWorkspaceDocRef(ownerUid, 'schools', targetId), cleaned, { merge: true }), 4000),
      ]);
      await writeWorkspaceSyncMetadata(ownerUid, activeActor);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LAST_SYNC_TIME_KEY, now);
        window.dispatchEvent(new CustomEvent('pakkus-sync-completed', { detail: { syncTime: now } }));
      }
    } catch (err) {
      if (isQuotaError(err)) markQuotaExceeded(err);
      console.warn('Notice saving school to Firestore (saved locally & backend):', err);
    }
  }
  return school;
}

export async function updateSchool(id: string, data: Partial<School>): Promise<void> {
  const current = loadLocalSchools() || [];
  const existing = current.find(s => s.id === id);
  const now = new Date().toISOString();
  const activeActor = loadLocalUser();
  const ownerUid = resolveRecordOwnerUid({ ...existing, ...data }, activeActor);
  const ownerName = resolveOwnerDisplayName(ownerUid, data.supervisorName || existing?.supervisorName, activeActor);

  const updatedSchool: School = existing
    ? {
        ...existing,
        ...data,
        id,
        supervisorId: data.supervisorId || existing.supervisorId || ownerUid,
        supervisorWorkspaceId: data.supervisorWorkspaceId || existing.supervisorWorkspaceId || ownerUid,
        supervisorName: data.supervisorName || existing.supervisorName || ownerName,
        createdBy: data.createdBy || existing.createdBy || ownerUid,
        updatedAt: now,
      }
    : {
        id,
        name: data.name || 'SMA Binaan',
        npsn: data.npsn || '',
        principalName: data.principalName || '',
        accreditation: data.accreditation || 'A',
        address: data.address || '',
        createdAt: now,
        updatedAt: now,
        supervisorId: ownerUid,
        supervisorWorkspaceId: ownerUid,
        supervisorName: ownerName,
        createdBy: data.createdBy || ownerUid,
        ...data,
      };

  saveSingleLocalSchool(updatedSchool);

  // If school name changed, update schoolName on related supervisions and users
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

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pakkus-local-schools-updated'));
  }

  if (!getOnlineMode()) {
    markDataModifiedLocally();
    return;
  }

  // Persist to backend API (disk + per-pengawas workspace file)
  try {
    await apiUpdateSchool(id, updatedSchool);
  } catch (apiErr) {
    console.warn('Backend API update school notice:', apiErr);
  }

  // Persist real-time to Firebase Firestore (BOTH dedicated per-Pengawas workspace & top-level)
  if (!isFirestoreQuotaExceeded) {
    try {
      const cleaned = cleanForFirestore(updatedSchool);
      await Promise.all([
        withFirestoreTimeout(setDoc(doc(db, 'schools', id), cleaned, { merge: true }), 4000),
        withFirestoreTimeout(setDoc(getWorkspaceDocRef(ownerUid, 'schools', id), cleaned, { merge: true }), 4000),
      ]);
      await writeWorkspaceSyncMetadata(ownerUid, activeActor);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LAST_SYNC_TIME_KEY, now);
        window.dispatchEvent(new CustomEvent('pakkus-sync-completed', { detail: { syncTime: now } }));
      }
    } catch (err) {
      if (isQuotaError(err)) markQuotaExceeded(err);
      console.warn('Notice updating school in Firestore (saved locally & backend):', err);
    }
  }
}

export async function deleteSchool(id: string): Promise<void> {
  const existingSchools = loadLocalSchools() || [];
  const targetSchool = existingSchools.find(s => s.id === id);
  const ownerUid = targetSchool ? resolveRecordOwnerUid(targetSchool, loadLocalUser()) : (resolveWorkspaceOwnerForUser(loadLocalUser()) || KUSNANDAR_UID);

  const remaining = existingSchools.filter(s => s.id !== id);
  saveLocalSchools(remaining);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pakkus-local-schools-updated'));
  }

  if (!getOnlineMode()) {
    markDataModifiedLocally();
    return;
  }

  try {
    await apiDeleteSchool(id);
  } catch {}

  if (!isFirestoreQuotaExceeded) {
    try {
      await Promise.all([
        withFirestoreTimeout(deleteDoc(doc(db, 'schools', id)), 4000),
        withFirestoreTimeout(deleteDoc(getWorkspaceDocRef(ownerUid, 'schools', id)), 4000),
      ]);
      await writeWorkspaceSyncMetadata(ownerUid);
      if (typeof window !== 'undefined') {
        const now = new Date().toISOString();
        localStorage.setItem(LAST_SYNC_TIME_KEY, now);
        window.dispatchEvent(new CustomEvent('pakkus-sync-completed', { detail: { syncTime: now } }));
      }
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
      mergeLocalSupervisions(data);
      return data;
    }

    if (isFirestoreQuotaExceeded) {
      return SAMPLE_SUPERVISIONS;
    }

    // First time bootstrap: seed SAMPLE_SUPERVISIONS for Pak Kusnandar workspace only
    for (const sup of SAMPLE_SUPERVISIONS) {
      if (isFirestoreQuotaExceeded) break;
      const stamped = {
        ...sup,
        supervisorId: KUSNANDAR_UID,
        supervisorWorkspaceId: KUSNANDAR_UID,
        createdBy: KUSNANDAR_UID,
      };
      const cleaned = cleanForFirestore(stamped);
      await Promise.all([
        withFirestoreTimeout(setDoc(doc(db, 'supervisions', sup.id), cleaned, { merge: true }), 1500),
        withFirestoreTimeout(setDoc(getWorkspaceDocRef(KUSNANDAR_UID, 'supervisions', sup.id), cleaned, { merge: true }), 1500),
      ]).catch(() => {});
    }
    mergeLocalSupervisions(SAMPLE_SUPERVISIONS);
    return SAMPLE_SUPERVISIONS;
  } catch (err) {
    if (isQuotaError(err)) {
      markQuotaExceeded(err);
    }
    console.warn('Firestore initial supervision sync warning:', err);
    return SAMPLE_SUPERVISIONS;
  }
}

function filterSupervisionsForUser(list: Supervision[], userProfile?: UserProfile | null): Supervision[] {
  if (!userProfile || isSuperAdminAccount(userProfile)) return list;
  if (userProfile.role === 'guru') {
    return list.filter(
      s => s.teacherId === userProfile.uid ||
           s.teacherName.toLowerCase().trim() === userProfile.displayName.toLowerCase().trim()
    );
  }
  if (userProfile.role === 'kepsek' && (userProfile.schoolId || userProfile.schoolName)) {
    return list.filter(
      s => (userProfile.schoolId && s.schoolId === userProfile.schoolId) ||
           (userProfile.schoolName && s.schoolName.toLowerCase().trim() === userProfile.schoolName.toLowerCase().trim())
    );
  }
  const ownerScope = resolveWorkspaceOwnerForUser(userProfile);
  if (!ownerScope) return list;
  return list.filter(s => belongsToSupervisorWorkspace(s, ownerScope));
}

export async function fetchSupervisions(userProfile?: UserProfile | null): Promise<Supervision[]> {
  const deletedSupIds = new Set(getDeletedSupervisionIds());
  const deletedUids = new Set(getDeletedUserIds());
  const deletedNames = getDeletedUserNames();
  const ownerScope = resolveWorkspaceOwnerForUser(userProfile);
  const isNewNonKusnandarPengawas = Boolean(
    userProfile &&
    (userProfile.role === 'pengawas' || userProfile.role === 'admin') &&
    !isKusnandarAccount(userProfile)
  );

  const isSupDeleted = (s: Supervision) => {
    if (deletedSupIds.has(s.id)) return true;
    if (s.teacherId && deletedUids.has(s.teacherId)) return true;
    const ownerUid = resolveRecordOwnerUid(s);
    if (isNameDeletedForWorkspace(s.teacherName, ownerUid, deletedNames)) return true;
    return false;
  };

  // If OFFLINE mode is active, serve strictly from localStorage without hitting cloud/network
  if (!getOnlineMode()) {
    const localCached = loadLocalSupervisions();
    const base: Supervision[] = localCached && localCached.length > 0
      ? localCached
      : (isNewNonKusnandarPengawas ? [] : SAMPLE_SUPERVISIONS);
    const clean = base.map(s => normalizeSupervisionData(s)).filter(s => !isSupDeleted(s));
    return filterSupervisionsForUser(clean, userProfile);
  }

  // 1. AUTHORITATIVE CLOUD FIRST: Fetch from Firestore (dedicated per-Pengawas workspace + top-level)
  try {
    const reads: Promise<any>[] = [];
    if (ownerScope && (userProfile?.role === 'pengawas' || userProfile?.role === 'admin')) {
      reads.push(withFirestoreTimeout(getDocs(getWorkspaceColRef(ownerScope, 'supervisions')), 5000, null));
      if (ownerScope === KUSNANDAR_UID) {
        // Also fetch top-level for legacy Pak Kusnandar documents
        reads.push(withFirestoreTimeout(getDocs(collection(db, 'supervisions')), 5000, null));
      } else {
        reads.push(withFirestoreTimeout(getDocs(query(collection(db, 'supervisions'), where('supervisorId', '==', ownerScope))), 5000, null));
      }
    } else {
      reads.push(withFirestoreTimeout(getDocs(collection(db, 'supervisions')), 5000, null));
      if (ownerScope) {
        reads.push(withFirestoreTimeout(getDocs(getWorkspaceColRef(ownerScope, 'supervisions')), 5000, null));
      }
    }

    const snaps = await Promise.all(reads);
    const combinedMap = new Map<string, Supervision>();
    snaps.forEach((snap) => {
      if (snap && !snap.empty) {
        snap.docs.forEach((d: any) => {
          const normalized = normalizeSupervisionData({ id: d.id, ...d.data() } as Supervision);
          if (!isSupDeleted(normalized)) {
            const existing = combinedMap.get(normalized.id);
            if (!existing || (normalized.updatedAt || '') >= (existing.updatedAt || '')) {
              combinedMap.set(normalized.id, normalized);
            }
          }
        });
      }
    });

    const firestoreSups = Array.from(combinedMap.values());
    if (firestoreSups.length > 0) {
      mergeLocalSupervisions(firestoreSups);
      return filterSupervisionsForUser(firestoreSups, userProfile);
    }
    // If a non-Kusnandar Pengawas has 0 supervisions in Firestore, check backend before returning empty []
  } catch (err) {
    console.warn('Firestore supervisions fetch notice (falling back to backend/local):', err);
  }

  // 2. Fetch from backend API disk persistence (scoped by supervisorId)
  try {
    const backendSups = await apiFetchSupervisions(ownerScope || undefined);
    if (backendSups && backendSups.length > 0) {
      const validBackend = backendSups
        .map(s => normalizeSupervisionData(s))
        .filter(s => !isSupDeleted(s));
      if (validBackend.length > 0) {
        mergeLocalSupervisions(validBackend);
        return filterSupervisionsForUser(validBackend, userProfile);
      }
    }
  } catch (backendErr) {
    console.warn('Backend API supervisions notice:', backendErr);
  }

  // 3. Fallback to local cache (NEVER fall back to SAMPLE_SUPERVISIONS for a brand-new Pengawas!)
  const localCached = loadLocalSupervisions();
  const fallbackBase: Supervision[] = localCached && localCached.length > 0
    ? localCached
    : (isNewNonKusnandarPengawas ? [] : SAMPLE_SUPERVISIONS);
  const results = fallbackBase.map(s => normalizeSupervisionData(s)).filter(s => !isSupDeleted(s));
  return filterSupervisionsForUser(results, userProfile);
}

export async function getSupervisionById(id: string): Promise<Supervision | null> {
  try {
    const activeOwner = resolveWorkspaceOwnerForUser(loadLocalUser());
    if (activeOwner) {
      const wsSnap = await withFirestoreTimeout(getDoc(getWorkspaceDocRef(activeOwner, 'supervisions', id)), 600, null);
      if (wsSnap && wsSnap.exists()) {
        const sup = normalizeSupervisionData({ id: wsSnap.id, ...wsSnap.data() } as Supervision);
        saveSingleLocalSupervision(sup);
        return sup;
      }
    }
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

// Real-time synchronization listener for Supervisions (per-Pengawas isolated Firestore workspace + top-level)
export function subscribeToSupervisions(
  callback: (supervisions: Supervision[]) => void,
  userProfile?: UserProfile | null
): Unsubscribe {
  const ownerScope = resolveWorkspaceOwnerForUser(userProfile);
  const isNewNonKusnandarPengawas = Boolean(
    userProfile &&
    (userProfile.role === 'pengawas' || userProfile.role === 'admin') &&
    !isKusnandarAccount(userProfile)
  );

  const isSupDeleted = (s: Supervision) => {
    const deletedIds = new Set(getDeletedSupervisionIds());
    const deletedUids = new Set(getDeletedUserIds());
    const deletedNames = getDeletedUserNames();
    if (deletedIds.has(s.id)) return true;
    if (s.teacherId && deletedUids.has(s.teacherId)) return true;
    const recOwner = resolveRecordOwnerUid(s);
    if (isNameDeletedForWorkspace(s.teacherName, recOwner, deletedNames)) return true;
    return false;
  };

  const getFilteredLocal = () => {
    const localCached = loadLocalSupervisions();
    const base = localCached && localCached.length > 0
      ? localCached
      : (isNewNonKusnandarPengawas ? [] : SAMPLE_SUPERVISIONS);
    const clean = base.filter(s => !isSupDeleted(s)).map(s => normalizeSupervisionData(s));
    return filterSupervisionsForUser(clean, userProfile);
  };

  // 1. Immediately provide initial local data for instant 0ms render
  callback(getFilteredLocal());

  // 2. Setup real-time Firestore listeners (dedicated per-Pengawas workspace + top-level)
  const unsubs: Unsubscribe[] = [];

  const applyCloudDocs = (docs: Array<{ id: string; data: any }>) => {
    const incoming: Supervision[] = [];
    docs.forEach(item => {
      const raw = { id: item.id, ...item.data } as Supervision;
      if (isSupDeleted(raw)) return;
      incoming.push(normalizeSupervisionData(raw));
    });
    if (incoming.length > 0) {
      mergeLocalSupervisions(incoming);
    }
    callback(getFilteredLocal());
  };

  try {
    if (ownerScope && (userProfile?.role === 'pengawas' || userProfile?.role === 'admin')) {
      // Dedicated isolated Firestore workspace for this Pengawas
      unsubs.push(
        onSnapshot(getWorkspaceColRef(ownerScope, 'supervisions'), (snapshot) => {
          if (!getOnlineMode() || isSyncingOfflineQueue) return;
          applyCloudDocs(snapshot.docs.map(d => ({ id: d.id, data: d.data() })));
        }, (error) => {
          console.warn('Real-time workspace supervisions onSnapshot notice:', error);
          if (isQuotaError(error)) markQuotaExceeded(error);
        })
      );

      if (ownerScope === KUSNANDAR_UID) {
        unsubs.push(
          onSnapshot(collection(db, 'supervisions'), (snapshot) => {
            if (!getOnlineMode() || isSyncingOfflineQueue) return;
            const ownDocs = snapshot.docs
              .filter(d => belongsToSupervisorWorkspace({ id: d.id, ...d.data() }, KUSNANDAR_UID))
              .map(d => ({ id: d.id, data: d.data() }));
            applyCloudDocs(ownDocs);
          }, (error) => {
            console.warn('Real-time supervisions onSnapshot notice:', error);
            if (isQuotaError(error)) markQuotaExceeded(error);
            callback(getFilteredLocal());
          })
        );
      } else {
        unsubs.push(
          onSnapshot(query(collection(db, 'supervisions'), where('supervisorId', '==', ownerScope)), (snapshot) => {
            if (!getOnlineMode() || isSyncingOfflineQueue) return;
            applyCloudDocs(snapshot.docs.map(d => ({ id: d.id, data: d.data() })));
          }, (error) => {
            console.warn('Real-time scoped supervisions onSnapshot notice:', error);
            if (isQuotaError(error)) markQuotaExceeded(error);
            callback(getFilteredLocal());
          })
        );
      }
    } else {
      // Super Admin, Kepsek, Guru, or unauthenticated view
      unsubs.push(
        onSnapshot(collection(db, 'supervisions'), (snapshot) => {
          if (!getOnlineMode() || isSyncingOfflineQueue) return;
          if (!snapshot.empty) {
            applyCloudDocs(snapshot.docs.map(d => ({ id: d.id, data: d.data() })));
          }
        }, (error) => {
          console.warn('Real-time supervisions onSnapshot notice:', error);
          if (isQuotaError(error)) markQuotaExceeded(error);
          callback(getFilteredLocal());
        })
      );
      if (ownerScope) {
        unsubs.push(
          onSnapshot(getWorkspaceColRef(ownerScope, 'supervisions'), (snapshot) => {
            if (!getOnlineMode() || isSyncingOfflineQueue) return;
            if (!snapshot.empty) {
              applyCloudDocs(snapshot.docs.map(d => ({ id: d.id, data: d.data() })));
            }
          }, (error) => {
            console.warn('Real-time workspace supervisions onSnapshot notice:', error);
          })
        );
      }
    }
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
    window.addEventListener('pakkus-online-mode-changed', handleLocalChange);
    return () => {
      unsubs.forEach(u => u());
      window.removeEventListener('pakkus-local-supervisions-updated', handleLocalChange);
      window.removeEventListener('pakkus-sync-completed', handleLocalChange);
      window.removeEventListener('pakkus-online-mode-changed', handleLocalChange);
    };
  }

  return () => {
    unsubs.forEach(u => u());
  };
}

// Save Supervision:
// - Menetapkan kepemilikan supervisorId/supervisorWorkspaceId secara eksplisit agar data tiap pengawas tersimpan terpisah.
// - Mode ONLINE: otomatis tersimpan realtime ke Firestore workspace masing-masing pengawas + koleksi utama + backend database.
// - Mode OFFLINE: tersimpan di localStorage dan otomatis disinkronkan saat beralih ke ONLINE.
export async function saveSupervision(
  supervision: Partial<Supervision> & { id?: string },
  forceSyncToFirestore = false
): Promise<string> {
  const targetId = supervision.id || `sup-${Date.now()}`;
  const now = new Date().toISOString();
  const activeActor = loadLocalUser();
  const existingLocal = (loadLocalSupervisions() || []).find(s => s.id === targetId);
  const ownerUid = resolveRecordOwnerUid({ ...existingLocal, ...supervision }, activeActor);
  const ownerName = resolveOwnerDisplayName(
    ownerUid,
    supervision.supervisorName || existingLocal?.supervisorName,
    activeActor
  );

  // Bersihkan penanda tombstone jika guru atau supervisi ini ditambahkan kembali
  removeDeletedSupervisionId(targetId);
  if (supervision.teacherId) removeDeletedUserId(supervision.teacherId);
  if (supervision.teacherName) removeDeletedUserName(supervision.teacherName, ownerUid);

  const fullData: Supervision = {
    ...existingLocal,
    ...supervision,
    id: targetId,
    supervisorId: supervision.supervisorId || existingLocal?.supervisorId || ownerUid,
    supervisorWorkspaceId: supervision.supervisorWorkspaceId || existingLocal?.supervisorWorkspaceId || ownerUid,
    supervisorName: supervision.supervisorName || existingLocal?.supervisorName || ownerName,
    createdBy: supervision.createdBy || existingLocal?.createdBy || activeActor?.uid || ownerUid,
    isValidData: true,
    createdAt: (supervision as any).createdAt || existingLocal?.createdAt || now,
    updatedAt: now,
  } as Supervision;

  // 1. SELALU simpan langsung ke local storage perangkat (non-destruktif, tidak menghapus data pengawas lain)
  saveSingleLocalSupervision(fullData);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pakkus-local-supervisions-updated'));
  }

  const isOnline = getOnlineMode();
  const shouldSyncCloud = isOnline || forceSyncToFirestore;

  // Jika mode OFFLINE aktif, simpan di localStorage saja dan tandai untuk sinkronisasi otomatis saat kembali ONLINE
  if (!shouldSyncCloud) {
    markDataModifiedLocally();
    return targetId;
  }

  // 2. Simpan ke persistent disk backend API + workspace pengawas (< 10ms)
  try {
    await apiSaveSupervision(fullData);
  } catch (apiErr) {
    console.warn('Backend API save supervision notice:', apiErr);
  }

  // 3. Mode ONLINE aktif: LANGSUNG simpan realtime ke Firebase Firestore (workspace khusus pengawas + koleksi utama)
  if (!isFirestoreQuotaExceeded) {
    try {
      const cleaned = cleanForFirestore(fullData);
      await Promise.all([
        withFirestoreTimeout(setDoc(doc(db, 'supervisions', targetId), cleaned, { merge: true }), 4500),
        withFirestoreTimeout(setDoc(getWorkspaceDocRef(ownerUid, 'supervisions', targetId), cleaned, { merge: true }), 4500),
      ]);

      await writeWorkspaceSyncMetadata(ownerUid, activeActor);

      const ownCount = (loadLocalSupervisions() || []).filter(s => belongsToSupervisorWorkspace(s, ownerUid)).length;
      if (typeof window !== 'undefined') {
        localStorage.setItem(LAST_SYNC_TIME_KEY, now);
        localStorage.removeItem(HAS_UNSYNCED_KEY);
        window.dispatchEvent(new CustomEvent('pakkus-sync-completed', { detail: { syncTime: now, count: ownCount } }));
      }
      return targetId;
    } catch (err: any) {
      if (isQuotaError(err)) {
        markQuotaExceeded(err);
      } else {
        console.warn('Firestore write notice (saved in local and backend storage):', err);
      }
      markDataModifiedLocally();
      return targetId;
    }
  } else {
    markDataModifiedLocally();
  }

  return targetId;
}

export async function deleteSupervision(id: string, teacherName?: string, teacherId?: string): Promise<void> {
  let name = teacherName;
  let tId = teacherId;
  let supOwner: string | undefined;
  const local = loadLocalSupervisions() || [];
  const found = local.find(s => s.id === id);
  if (found) {
    if (!name) name = found.teacherName;
    if (!tId) tId = found.teacherId;
    supOwner = resolveRecordOwnerUid(found);
  }
  await purgeTeacherDataCompletely({ id, teacherName: name, teacherId: tId, supervisorId: supOwner });
}

// Synchronize pending local data strictly scoped to the active Pengawas's workspace (or all workspaces if Super Admin)
export async function syncAllPendingLocalChangesToFirestore(activeUser?: UserProfile | null): Promise<{ 
  usersCount: number; 
  schoolsCount: number; 
  supervisionsCount: number;
  lastSyncTime: string;
}> {
  if (!getOnlineMode()) {
    setOnlineModeState(true, false);
    try {
      await enableNetwork(db);
    } catch {}
  }
  isFirestoreQuotaExceeded = false;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('firestore_quota_exceeded_date');
    sessionStorage.removeItem('firestore_quota_exceeded');
  }

  const actor = activeUser || loadLocalUser();
  const isSuper = isSuperAdminAccount(actor);
  const scopedOwnerUid = !isSuper ? resolveWorkspaceOwnerForUser(actor) : null;
  const isNewNonKusnandarPengawas = Boolean(scopedOwnerUid && scopedOwnerUid !== KUSNANDAR_UID);

  let uCount = 0;
  let sCount = 0;
  let supCount = 0;

  // 1. Prepare clean entities strictly scoped to the active Pengawas (never touch other Pengawas's data!)
  const deletedIds = new Set(getDeletedSupervisionIds());
  const deletedNames = getDeletedUserNames();
  const deletedUids = new Set(getDeletedUserIds());

  // Users
  const allUsers = getStoredUsers();
  const validUsers = allUsers
    .filter(u => {
      if (deletedUids.has(u.uid)) return false;
      const recOwner = resolveRecordOwnerUid(u);
      if (u.role === 'guru' && isNameDeletedForWorkspace(u.displayName, recOwner, deletedNames)) return false;
      if (scopedOwnerUid) {
        if (isSuperAdminAccount(u)) return false;
        return belongsToSupervisorWorkspace(u, scopedOwnerUid);
      }
      return true;
    })
    .map(u => {
      if (isSuperAdminAccount(u)) return u;
      const owner = scopedOwnerUid || resolveRecordOwnerUid(u);
      return {
        ...u,
        supervisorId: u.supervisorId || owner,
        supervisorWorkspaceId: u.supervisorWorkspaceId || owner,
        createdBy: u.createdBy || owner,
      };
    });

  // Schools
  const localSchools = loadLocalSchools();
  const rawSchools = localSchools && localSchools.length > 0
    ? localSchools
    : (isNewNonKusnandarPengawas ? [] : DEFAULT_SCHOOLS);
  const validSchools = rawSchools
    .filter(s => (scopedOwnerUid ? belongsToSupervisorWorkspace(s, scopedOwnerUid) : true))
    .map(s => {
      const owner = scopedOwnerUid || resolveRecordOwnerUid(s);
      return {
        ...s,
        supervisorId: s.supervisorId || owner,
        supervisorWorkspaceId: s.supervisorWorkspaceId || owner,
        createdBy: s.createdBy || owner,
      };
    });

  // Supervisions (NEVER fall back to SAMPLE_SUPERVISIONS for a brand-new Pengawas with 0 supervisions!)
  let allSups = loadLocalSupervisions() || [];
  if (allSups.length === 0 && !isNewNonKusnandarPengawas) {
    try {
      const backendSups = await apiFetchSupervisions(scopedOwnerUid || undefined);
      allSups = backendSups && backendSups.length > 0
        ? backendSups
        : (scopedOwnerUid && scopedOwnerUid !== KUSNANDAR_UID ? [] : SAMPLE_SUPERVISIONS);
    } catch {
      allSups = scopedOwnerUid && scopedOwnerUid !== KUSNANDAR_UID ? [] : SAMPLE_SUPERVISIONS;
    }
  }

  const validSupervisions = allSups
    .filter(s => {
      if (deletedIds.has(s.id)) return false;
      if (s.teacherId && deletedUids.has(s.teacherId)) return false;
      const recOwner = resolveRecordOwnerUid(s);
      if (isNameDeletedForWorkspace(s.teacherName, recOwner, deletedNames)) return false;
      if (scopedOwnerUid) {
        return belongsToSupervisorWorkspace(s, scopedOwnerUid);
      }
      return true;
    })
    .map(s => {
      const owner = scopedOwnerUid || resolveRecordOwnerUid(s);
      return normalizeSupervisionData({
        ...s,
        supervisorId: s.supervisorId || owner,
        supervisorWorkspaceId: s.supervisorWorkspaceId || owner,
        createdBy: s.createdBy || owner,
      });
    });

  // 2. Persist to Backend API first (strictly scoped to supervisorId so other Pengawas's records are untouched)
  try {
    await apiSyncAll({
      supervisorId: scopedOwnerUid || undefined,
      supervisions: validSupervisions,
      schools: validSchools,
      users: validUsers,
    });
  } catch (apiErr) {
    console.warn('Backend API sync notice:', apiErr);
  }

  // 3. Write to Firebase Firestore: BOTH dedicated per-Pengawas workspace & top-level collections
  const nowIso = new Date().toISOString();
  const syncedByEmail = actor?.email || auth.currentUser?.email || 'admin';
  const syncedByName = actor?.displayName || auth.currentUser?.displayName || 'Pengawas Pembina';

  try {
    const batch = writeBatch(db);

    for (const u of validUsers) {
      const cleaned = cleanForFirestore(u);
      batch.set(doc(db, 'users', u.uid), cleaned, { merge: true });
      if (!isSuperAdminAccount(u)) {
        const owner = scopedOwnerUid || resolveRecordOwnerUid(u);
        if (owner !== 'user-super-admin') {
          batch.set(getWorkspaceDocRef(owner, 'users', u.uid), cleaned, { merge: true });
        }
      }
      uCount++;
    }

    for (const s of validSchools) {
      const cleaned = cleanForFirestore(s);
      const owner = scopedOwnerUid || resolveRecordOwnerUid(s);
      batch.set(doc(db, 'schools', s.id), cleaned, { merge: true });
      batch.set(getWorkspaceDocRef(owner, 'schools', s.id), cleaned, { merge: true });
      sCount++;
    }

    for (const sup of validSupervisions) {
      const cleaned = cleanForFirestore(sup);
      const owner = scopedOwnerUid || resolveRecordOwnerUid(sup);
      batch.set(doc(db, 'supervisions', sup.id), cleaned, { merge: true });
      batch.set(getWorkspaceDocRef(owner, 'supervisions', sup.id), cleaned, { merge: true });
      supCount++;
    }

    if (scopedOwnerUid) {
      batch.set(getWorkspaceSyncDocRef(scopedOwnerUid), {
        supervisorId: scopedOwnerUid,
        supervisorName: resolveOwnerDisplayName(scopedOwnerUid, syncedByName, actor),
        lastSyncedAt: nowIso,
        lastSyncedBy: syncedByEmail,
        lastSyncedByName: syncedByName,
        supervisionsCount: validSupervisions.length,
        supervisionIds: validSupervisions.map(s => s.id),
        schoolsCount: validSchools.length,
        usersCount: validUsers.length,
        timestamp: Date.now(),
      }, { merge: true });
    } else {
      batch.set(doc(db, 'system', 'sync_state'), {
        lastSyncedAt: nowIso,
        lastSyncedBy: syncedByEmail,
        lastSyncedByName: syncedByName,
        supervisionsCount: validSupervisions.length,
        supervisionIds: validSupervisions.map(s => s.id),
        schoolsCount: validSchools.length,
        usersCount: validUsers.length,
        timestamp: Date.now(),
      }, { merge: true });
    }

    // Delete tombstones only within current workspace (or global for Super Admin)
    for (const delId of deletedIds) {
      if (scopedOwnerUid) {
        batch.delete(getWorkspaceDocRef(scopedOwnerUid, 'supervisions', delId));
      } else {
        batch.delete(doc(db, 'supervisions', delId));
      }
    }
    for (const delUid of deletedUids) {
      if (scopedOwnerUid) {
        batch.delete(getWorkspaceDocRef(scopedOwnerUid, 'users', delUid));
      } else {
        batch.delete(doc(db, 'users', delUid));
      }
    }

    await withFirestoreTimeout(batch.commit(), 8000);
  } catch (batchErr: any) {
    console.warn('Batch commit notice, running individual concurrent writes:', batchErr);
    if (isQuotaError(batchErr)) {
      markQuotaExceeded(batchErr);
      throw batchErr;
    }

    uCount = 0;
    sCount = 0;
    supCount = 0;

    for (const u of validUsers) {
      try {
        const cleaned = cleanForFirestore(u);
        await withFirestoreTimeout(setDoc(doc(db, 'users', u.uid), cleaned, { merge: true }), 3500);
        if (!isSuperAdminAccount(u)) {
          const owner = scopedOwnerUid || resolveRecordOwnerUid(u);
          if (owner !== 'user-super-admin') {
            await withFirestoreTimeout(setDoc(getWorkspaceDocRef(owner, 'users', u.uid), cleaned, { merge: true }), 3500);
          }
        }
        uCount++;
      } catch (e) {
        console.warn('Sync user fallback notice:', e);
      }
    }
    for (const s of validSchools) {
      try {
        const cleaned = cleanForFirestore(s);
        const owner = scopedOwnerUid || resolveRecordOwnerUid(s);
        await withFirestoreTimeout(setDoc(doc(db, 'schools', s.id), cleaned, { merge: true }), 3500);
        await withFirestoreTimeout(setDoc(getWorkspaceDocRef(owner, 'schools', s.id), cleaned, { merge: true }), 3500);
        sCount++;
      } catch (e) {
        console.warn('Sync school fallback notice:', e);
      }
    }
    for (const sup of validSupervisions) {
      try {
        const cleaned = cleanForFirestore(sup);
        const owner = scopedOwnerUid || resolveRecordOwnerUid(sup);
        await withFirestoreTimeout(setDoc(doc(db, 'supervisions', sup.id), cleaned, { merge: true }), 3500);
        await withFirestoreTimeout(setDoc(getWorkspaceDocRef(owner, 'supervisions', sup.id), cleaned, { merge: true }), 3500);
        supCount++;
      } catch (e) {
        console.warn('Sync supervision fallback notice:', e);
      }
    }
    if (scopedOwnerUid) {
      await writeWorkspaceSyncMetadata(scopedOwnerUid, actor);
    } else {
      try {
        await withFirestoreTimeout(setDoc(doc(db, 'system', 'sync_state'), {
          lastSyncedAt: nowIso,
          lastSyncedBy: syncedByEmail,
          lastSyncedByName: syncedByName,
          supervisionsCount: validSupervisions.length,
          supervisionIds: validSupervisions.map(s => s.id),
          schoolsCount: validSchools.length,
          usersCount: validUsers.length,
          timestamp: Date.now(),
        }, { merge: true }), 3500);
      } catch {}
    }
  }

  const syncTime = new Date().toISOString();
  if (typeof window !== 'undefined') {
    localStorage.setItem(LAST_SYNC_TIME_KEY, syncTime);
    localStorage.removeItem(HAS_UNSYNCED_KEY);
    window.dispatchEvent(new CustomEvent('pakkus-sync-completed', { detail: { syncTime, count: supCount } }));
    window.dispatchEvent(new CustomEvent('pakkus-local-users-updated'));
    window.dispatchEvent(new CustomEvent('pakkus-local-schools-updated'));
    window.dispatchEvent(new CustomEvent('pakkus-local-supervisions-updated'));
  }

  return { usersCount: uCount, schoolsCount: sCount, supervisionsCount: supCount, lastSyncTime: syncTime };
}

export interface CloudSyncState {
  supervisorId?: string;
  supervisorName?: string;
  lastSyncedAt: string;
  lastSyncedBy?: string;
  lastSyncedByName?: string;
  supervisionsCount: number;
  supervisionIds?: string[];
  schoolsCount?: number;
  usersCount?: number;
  timestamp?: number;
}

export function subscribeToSyncState(
  callback: (state: CloudSyncState | null) => void,
  userProfile?: UserProfile | null
): Unsubscribe {
  try {
    const ownerScope = resolveWorkspaceOwnerForUser(userProfile);
    const docRef = ownerScope ? getWorkspaceSyncDocRef(ownerScope) : doc(db, 'system', 'sync_state');
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

// Master boot initialization: ensures Pak Kusnandar defaults & per-Pengawas workspaces are initialized safely
export async function syncAllInitialDataToFirestore() {
  if (!getOnlineMode() || isFirestoreQuotaExceeded) {
    return;
  }

  // Throttle initial sync to avoid unnecessary repeated writes on every single page mount
  const lastSyncStr = typeof window !== 'undefined' ? localStorage.getItem('last_firestore_initial_sync_v2') : null;
  const now = Date.now();
  if (lastSyncStr && (now - Number(lastSyncStr) < 4 * 60 * 60 * 1000)) {
    return;
  }

  try {
    // 1. Ensure schools exist in Firestore and backfill into each Pengawas's dedicated workspace
    const schoolsSnap = await withFirestoreTimeout(getDocs(collection(db, 'schools')), 3500, null);
    if (!schoolsSnap || schoolsSnap.empty) {
      await ensureInitialSchools();
    } else {
      for (const d of schoolsSnap.docs) {
        if (isFirestoreQuotaExceeded) return;
        const sch = normalizeSchoolData({ id: d.id, ...d.data() } as School);
        const owner = resolveRecordOwnerUid(sch);
        const stamped = {
          ...sch,
          supervisorId: sch.supervisorId || owner,
          supervisorWorkspaceId: sch.supervisorWorkspaceId || owner,
          createdBy: sch.createdBy || owner,
        };
        await withFirestoreTimeout(
          setDoc(getWorkspaceDocRef(owner, 'schools', sch.id), cleanForFirestore(stamped), { merge: true }),
          2500
        ).catch(() => {});
      }
    }
    if (isFirestoreQuotaExceeded) return;

    // 2. Ensure default users exist & backfill each user into their Pengawas's workspace
    try {
      const usersSnap = await withFirestoreTimeout(getDocs(collection(db, 'users')), 3500, null);
      if (usersSnap) {
        const existingUserIds = new Set(usersSnap.docs.map(d => d.id) || []);
        for (const u of DEFAULT_USERS) {
          if (isFirestoreQuotaExceeded) return;
          if (!existingUserIds.has(u.uid)) {
            const cleaned = cleanForFirestore(u);
            await setDoc(doc(db, 'users', u.uid), cleaned, { merge: true });
            if (!isSuperAdminAccount(u)) {
              const owner = resolveRecordOwnerUid(u);
              await setDoc(getWorkspaceDocRef(owner, 'users', u.uid), cleaned, { merge: true });
            }
          }
        }
        // Backfill all existing non-super-admin users to their own pengawas_workspaces/{owner}/users/{uid}
        for (const d of usersSnap.docs) {
          if (isFirestoreQuotaExceeded) return;
          const u = { ...d.data(), uid: d.id } as UserProfile;
          if (isSuperAdminAccount(u)) continue;
          const owner = resolveRecordOwnerUid(u);
          if (owner !== 'user-super-admin') {
            const stamped = {
              ...u,
              supervisorId: u.supervisorId || owner,
              supervisorWorkspaceId: u.supervisorWorkspaceId || owner,
              createdBy: u.createdBy || owner,
            };
            await withFirestoreTimeout(
              setDoc(getWorkspaceDocRef(owner, 'users', u.uid), cleanForFirestore(stamped), { merge: true }),
              2500
            ).catch(() => {});
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

    // 3. Ensure Supervisions exist in Firestore & backfill each supervision into its owner's dedicated workspace
    try {
      const backendSups = await apiFetchSupervisions();
      const localSups = loadLocalSupervisions() || [];
      const primarySups = backendSups && backendSups.length > 0 ? backendSups : (localSups.length > 0 ? localSups : SAMPLE_SUPERVISIONS);

      const snap = await withFirestoreTimeout(getDocs(collection(db, 'supervisions')), 3500, null);
      const existingFirestoreMap = new Map<string, any>();
      if (snap && !snap.empty) {
        snap.docs.forEach(d => existingFirestoreMap.set(d.id, d.data()));
      }

      for (const sup of primarySups) {
        if (isFirestoreQuotaExceeded) return;
        const owner = resolveRecordOwnerUid(sup);
        const stamped = {
          ...sup,
          supervisorId: sup.supervisorId || owner,
          supervisorWorkspaceId: sup.supervisorWorkspaceId || owner,
          createdBy: sup.createdBy || owner,
        };
        const exist = existingFirestoreMap.get(sup.id);
        const supTime = sup.updatedAt ? new Date(sup.updatedAt).getTime() : 0;
        const existTime = exist?.updatedAt ? new Date(exist.updatedAt).getTime() : 0;
        const cleaned = cleanForFirestore(stamped);
        if (!exist || supTime > existTime) {
          await setDoc(doc(db, 'supervisions', sup.id), cleaned, { merge: true });
        }
        await withFirestoreTimeout(
          setDoc(getWorkspaceDocRef(owner, 'supervisions', sup.id), cleaned, { merge: true }),
          2500
        ).catch(() => {});
      }

      // Also sync any newer docs from Firestore into backend API & workspace path
      if (snap && !snap.empty) {
        for (const docSnap of snap.docs) {
          const fsData = normalizeSupervisionData({ id: docSnap.id, ...docSnap.data() } as Supervision);
          const owner = resolveRecordOwnerUid(fsData);
          const stamped = {
            ...fsData,
            supervisorId: fsData.supervisorId || owner,
            supervisorWorkspaceId: fsData.supervisorWorkspaceId || owner,
            createdBy: fsData.createdBy || owner,
          };
          apiSaveSupervision(stamped).catch(() => {});
          withFirestoreTimeout(
            setDoc(getWorkspaceDocRef(owner, 'supervisions', stamped.id), cleanForFirestore(stamped), { merge: true }),
            2000
          ).catch(() => {});
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
      localStorage.setItem('last_firestore_initial_sync_v2', String(now));
    }

    console.log(`Firebase Firestore per-Pengawas workspaces verified for project: ${firebaseConfig.projectId}`);
  } catch (err) {
    if (isQuotaError(err)) {
      markQuotaExceeded(err);
      return;
    }
    console.warn('Notice during Firestore background sync:', err);
  }
}

export { fbSignOut };
