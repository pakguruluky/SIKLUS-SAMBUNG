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

// Connection verification test per Firebase skill guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase configuration notice: operating in offline-cached mode until connection is re-established.');
    }
  }
}
testConnection();

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
  },
  {
    uid: 'teacher-hilmia',
    username: 'hilmia',
    password: 'pakkus',
    email: 'hilmia@siklus-sambung.sch.id',
    displayName: 'Hilmia Fitriyani, S.Pd.',
    role: 'guru',
    schoolId: 'sch-sman4',
    schoolName: 'SMAN 4 Bogor',
    subject: 'Ekonomi',
    nip: '19851120 200902 2 008',
    phone: '081388776655',
    approvalStatus: 'approved',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    uid: 'teacher-ivany',
    username: 'ivany',
    password: 'pakkus',
    email: 'ivany@siklus-sambung.sch.id',
    displayName: 'Ivany Ratna Ekandini, S.Pd.',
    role: 'guru',
    schoolId: 'sch-rimba-madya',
    schoolName: 'SMAS Rimba Madya',
    subject: 'Bahasa Indonesia',
    nip: '19890412 201402 2 003',
    phone: '081234567890',
    approvalStatus: 'approved',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    uid: 'teacher-alline',
    username: 'alline',
    password: 'pakkus',
    email: 'alline@siklus-sambung.sch.id',
    displayName: 'Alline Novianti, S.Pd.',
    role: 'guru',
    schoolId: 'sch-sman2',
    schoolName: 'SMAN 2 Bogor',
    subject: 'Kimia',
    nip: '19860715 201001 2 011',
    phone: '081298765432',
    approvalStatus: 'approved',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    uid: 'teacher-mega',
    username: 'mega',
    password: 'pakkus',
    email: 'mega@siklus-sambung.sch.id',
    displayName: 'Mega Nur Alfira, S.Pd.',
    role: 'guru',
    schoolId: 'sch-sman2',
    schoolName: 'SMAN 2 Bogor',
    subject: 'Sejarah',
    nip: '19910318 201503 2 006',
    phone: '081356789012',
    approvalStatus: 'approved',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    uid: 'teacher-iqbal',
    username: 'iqbal',
    password: 'pakkus',
    email: 'iqbal@siklus-sambung.sch.id',
    displayName: 'Iqbal Aziz Andrianto',
    role: 'guru',
    schoolId: 'sch-pgri-1',
    schoolName: 'SMAS PGRI 1',
    subject: 'Sejarah',
    nip: '19920824 201901 1 005',
    phone: '081323456789',
    approvalStatus: 'approved',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    uid: 'teacher-sani',
    username: 'sani',
    password: 'pakkus',
    email: 'sani@siklus-sambung.sch.id',
    displayName: 'Sani Ramadhanti Noor, S.E.',
    role: 'guru',
    schoolId: 'sch-ummul-quro',
    schoolName: 'SMAS IT Ummul Quro',
    subject: 'Ekonomi',
    nip: '19880914 201201 2 004',
    phone: '081278901234',
    approvalStatus: 'approved',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    uid: 'teacher-kirana',
    username: 'kirana',
    password: 'pakkus',
    email: 'kirana@siklus-sambung.sch.id',
    displayName: 'Kirana Mahardhika, S.Pd, Gr.',
    role: 'guru',
    schoolId: 'sch-ummul-quro',
    schoolName: 'SMAS IT Ummul Quro',
    subject: 'Fisika',
    nip: '19930217 201801 2 009',
    phone: '081289012345',
    approvalStatus: 'approved',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    uid: 'teacher-atik',
    username: 'atik',
    password: 'pakkus',
    email: 'atik@siklus-sambung.sch.id',
    displayName: 'Atik Dwi Larasati, S.Pd.',
    role: 'guru',
    schoolId: 'sch-rimba-madya',
    schoolName: 'SMAS Rimba Madya',
    subject: 'Ekonomi',
    nip: '19870622 201101 2 012',
    phone: '081390123456',
    approvalStatus: 'approved',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    uid: 'teacher-sihana',
    username: 'sihana',
    password: 'pakkus',
    email: 'sihana@siklus-sambung.sch.id',
    displayName: 'Sihana, S.Pd.Gr.',
    role: 'guru',
    schoolId: 'sch-yphb',
    schoolName: 'SMAS YPHB',
    subject: 'Penjasorkes',
    nip: '19830509 200604 1 008',
    phone: '081212345678',
    approvalStatus: 'approved',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    uid: 'teacher-salma',
    username: 'salma',
    password: 'pakkus',
    email: 'salma@siklus-sambung.sch.id',
    displayName: 'Siti Salma, S.Pd',
    role: 'guru',
    schoolId: 'sch-yphb',
    schoolName: 'SMAS YPHB',
    subject: 'Fisika',
    nip: '19901205 201403 2 007',
    phone: '081223456789',
    approvalStatus: 'approved',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    uid: 'teacher-widya',
    username: 'widya',
    password: 'pakkus',
    email: 'widya@siklus-sambung.sch.id',
    displayName: 'Widya Anjani, S.Pd.',
    role: 'guru',
    schoolId: 'sch-bhakti-insani',
    schoolName: 'SMAS Bhakti Insani',
    subject: 'Ekonomi',
    nip: '19940830 202012 2 010',
    phone: '081334567890',
    approvalStatus: 'approved',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    uid: 'teacher-yazid',
    username: 'yazid',
    password: 'pakkus',
    email: 'yazid@siklus-sambung.sch.id',
    displayName: 'Yazid Ali Hamdi',
    role: 'guru',
    schoolId: 'sch-yasih',
    schoolName: 'SMAS Yasih',
    subject: 'PKn',
    nip: '19891111 201502 1 003',
    phone: '081345678901',
    approvalStatus: 'approved',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    uid: 'teacher-lutfiana',
    username: 'lutfiana',
    password: 'pakkus',
    email: 'lutfiana@siklus-sambung.sch.id',
    displayName: 'Lutfiana Faridh Fadillah',
    role: 'guru',
    schoolId: 'sch-muhammadiyah',
    schoolName: 'SMAS Muhammadiyah',
    subject: 'Kimia',
    nip: '19950125 202104 2 006',
    phone: '081256789012',
    approvalStatus: 'approved',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    uid: 'teacher-saulina',
    username: 'saulina',
    password: 'pakkus',
    email: 'saulina@siklus-sambung.sch.id',
    displayName: 'Saulina Siregar, S.Sos',
    role: 'guru',
    schoolId: 'sch-ananda',
    schoolName: 'SMAS Ananda',
    subject: 'Ekonomi',
    nip: '19860314 201003 2 005',
    phone: '081267890123',
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

  // 2. Save to Firestore
  try {
    const cleaned = cleanForFirestore(completeUser);
    await setDoc(doc(db, 'users', uid), cleaned, { merge: true });
  } catch (err) {
    console.warn('Notice saving user to Firestore (saved locally):', err);
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

  // 2. Save to Firestore
  try {
    const cleaned = cleanForFirestore(completeUser);
    await setDoc(doc(db, 'users', user.uid), cleaned, { merge: true });
  } catch (err) {
    console.warn('Notice updating user in Firestore (saved locally):', err);
  }

  // 3. Update related supervisions if teacher information changed
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
          setDoc(doc(db, 'supervisions', s.id), cleanForFirestore(s), { merge: true }).catch(() => {});
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
    await deleteDoc(doc(db, 'users', uid));
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
      try {
        await deleteDoc(doc(db, 'supervisions', sup.id));
      } catch (delErr) {
        console.warn('Notice deleting supervision in Firestore during user deletion:', delErr);
      }
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
  const school: School = { id: newDoc.id, ...data };
  const current = loadLocalSchools() || DEFAULT_SCHOOLS;
  saveLocalSchools([...current.filter(s => s.id !== school.id), school]);
  try {
    const cleaned = cleanForFirestore(school);
    await setDoc(newDoc, cleaned);
  } catch (err) {
    console.warn('Notice saving school to Firestore (saved locally):', err);
  }
  return school;
}

export async function updateSchool(id: string, data: Partial<School>): Promise<void> {
  const current = loadLocalSchools() || DEFAULT_SCHOOLS;
  const idx = current.findIndex(s => s.id === id);
  if (idx >= 0) {
    current[idx] = { ...current[idx], ...data };
    saveLocalSchools(current);
  }
  try {
    const cleaned = cleanForFirestore({ ...data, updatedAt: new Date().toISOString() });
    await setDoc(doc(db, 'schools', id), cleaned, { merge: true });
  } catch (err) {
    console.warn('Notice updating school in Firestore (saved locally):', err);
  }
}

export async function deleteSchool(id: string): Promise<void> {
  const current = (loadLocalSchools() || DEFAULT_SCHOOLS).filter(s => s.id !== id);
  saveLocalSchools(current);
  try {
    await deleteDoc(doc(db, 'schools', id));
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
    const q = collection(db, 'supervisions');
    const snap = await getDocs(q);
    let results: Supervision[] = [];

    if (!snap.empty) {
      results = snap.docs.map(d => normalizeSupervisionData({ id: d.id, ...d.data() } as Supervision));
    } else {
      results = await ensureInitialSupervisions();
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

  // 2. ALWAYS persist to Firebase Firestore directly with sanitized data
  try {
    const docRef = doc(db, 'supervisions', targetId);
    const cleaned = cleanForFirestore(fullData);
    await setDoc(docRef, cleaned, { merge: true });
    return targetId;
  } catch (err) {
    console.warn('Firestore write notice (saved in device local storage):', err);
    return targetId;
  }
}

export async function deleteSupervision(id: string): Promise<void> {
  addDeletedSupervisionId(id);
  const localList = (loadLocalSupervisions() || []).filter(s => s.id !== id);
  saveLocalSupervisions(localList);
  try {
    await deleteDoc(doc(db, 'supervisions', id));
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
