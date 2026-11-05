import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { School, Supervision, UserProfile } from '../types';
import { SAMPLE_SUPERVISIONS } from '../data/seedData';
import { DEFAULT_SCHOOLS, DEFAULT_USERS } from '../services/firebaseDefaults';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../server_data');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');

interface DatabaseSchema {
  schools: School[];
  supervisions: Supervision[];
  users: UserProfile[];
  deletedSupervisionIds: string[];
  deletedUserIds: string[];
  deletedUserNames: string[];
  lastUpdated: string;
}

let inMemoryDb: DatabaseSchema | null = null;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getInitialDatabase(): DatabaseSchema {
  return {
    schools: DEFAULT_SCHOOLS,
    supervisions: SAMPLE_SUPERVISIONS,
    users: DEFAULT_USERS,
    deletedSupervisionIds: [],
    deletedUserIds: [],
    deletedUserNames: [],
    lastUpdated: new Date().toISOString(),
  };
}

export function loadDatabase(): DatabaseSchema {
  if (inMemoryDb) {
    return inMemoryDb;
  }

  ensureDataDir();

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.schools) && Array.isArray(parsed.supervisions)) {
        inMemoryDb = {
          schools: parsed.schools,
          supervisions: parsed.supervisions,
          users: Array.isArray(parsed.users) ? parsed.users : DEFAULT_USERS,
          deletedSupervisionIds: Array.isArray(parsed.deletedSupervisionIds) ? parsed.deletedSupervisionIds : [],
          deletedUserIds: Array.isArray(parsed.deletedUserIds) ? parsed.deletedUserIds : [],
          deletedUserNames: Array.isArray(parsed.deletedUserNames) ? parsed.deletedUserNames : [],
          lastUpdated: parsed.lastUpdated || new Date().toISOString(),
        };
        return inMemoryDb;
      }
    } catch (err) {
      console.warn('Notice loading database.json (fallback to defaults):', err);
    }
  }

  inMemoryDb = getInitialDatabase();
  saveDatabase(inMemoryDb);
  return inMemoryDb;
}

export function saveDatabase(db: DatabaseSchema): void {
  ensureDataDir();
  inMemoryDb = {
    ...db,
    lastUpdated: new Date().toISOString(),
  };
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(inMemoryDb, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed writing to database.json:', err);
  }
}

// Schools Operations
export function getAllSchools(): School[] {
  const db = loadDatabase();
  return db.schools;
}

export function getSchoolById(id: string): School | null {
  const db = loadDatabase();
  return db.schools.find(s => s.id === id) || null;
}

export function saveSchool(school: School): School {
  const db = loadDatabase();
  const existingIndex = db.schools.findIndex(s => s.id === school.id);
  const now = new Date().toISOString();
  const updatedSchool: School = {
    ...school,
    updatedAt: now,
  };

  if (existingIndex >= 0) {
    db.schools[existingIndex] = updatedSchool;
  } else {
    db.schools.push(updatedSchool);
  }

  // Also sync schoolName to supervisions and users if school name changed
  if (updatedSchool.name) {
    db.supervisions = db.supervisions.map(s => {
      if (s.schoolId === updatedSchool.id) {
        return { ...s, schoolName: updatedSchool.name, updatedAt: now };
      }
      return s;
    });

    db.users = db.users.map(u => {
      if (u.schoolId === updatedSchool.id) {
        return { ...u, schoolName: updatedSchool.name, updatedAt: now };
      }
      return u;
    });
  }

  saveDatabase(db);
  return updatedSchool;
}

export function updateSchoolById(id: string, partial: Partial<School>): School {
  const db = loadDatabase();
  const existing = db.schools.find(s => s.id === id);
  const now = new Date().toISOString();

  const target: School = existing
    ? { ...existing, ...partial, id, updatedAt: now, createdBy: partial.createdBy || existing.createdBy || 'system' }
    : {
        id,
        name: partial.name || 'SMA Binaan',
        npsn: partial.npsn || '',
        principalName: partial.principalName || '',
        accreditation: partial.accreditation || 'A',
        address: partial.address || '',
        createdAt: now,
        updatedAt: now,
        createdBy: partial.createdBy || 'system',
        ...partial,
      };

  return saveSchool(target);
}

export function deleteSchoolById(id: string): boolean {
  const db = loadDatabase();
  const beforeCount = db.schools.length;
  db.schools = db.schools.filter(s => s.id !== id);
  if (db.schools.length !== beforeCount) {
    saveDatabase(db);
    return true;
  }
  return false;
}

export function resetSchoolsToDefault(): School[] {
  const db = loadDatabase();
  db.schools = [...DEFAULT_SCHOOLS];
  saveDatabase(db);
  return db.schools;
}

// Supervisions Operations
export function getAllSupervisions(): Supervision[] {
  const db = loadDatabase();
  const deletedIds = new Set(db.deletedSupervisionIds);
  const deletedUids = new Set(db.deletedUserIds);
  const deletedNames = new Set(db.deletedUserNames.map(n => n.toLowerCase().trim()));

  return db.supervisions
    .filter(s => {
      if (deletedIds.has(s.id)) return false;
      if (s.teacherId && deletedUids.has(s.teacherId)) return false;
      if (s.teacherName && deletedNames.has(s.teacherName.toLowerCase().trim())) return false;
      return true;
    })
    .map(s => ({ ...s, isValidData: true }));
}

export function getSupervisionById(id: string): Supervision | null {
  const db = loadDatabase();
  if (db.deletedSupervisionIds.includes(id)) return null;
  const found = db.supervisions.find(s => s.id === id);
  return found ? { ...found, isValidData: true } : null;
}

export function saveSupervisionRecord(sup: Partial<Supervision> & { id?: string }): Supervision {
  const db = loadDatabase();
  const now = new Date().toISOString();
  const targetId = sup.id || `sup-${Date.now()}`;

  const fullSupervision: Supervision = {
    ...sup,
    id: targetId,
    isValidData: true,
    createdAt: (sup as any).createdAt || now,
    updatedAt: now,
  } as Supervision;

  // Unmark if previously deleted
  db.deletedSupervisionIds = db.deletedSupervisionIds.filter(id => id !== targetId);

  const idx = db.supervisions.findIndex(s => s.id === targetId);
  if (idx >= 0) {
    db.supervisions[idx] = fullSupervision;
  } else {
    db.supervisions.unshift(fullSupervision);
  }

  saveDatabase(db);
  return fullSupervision;
}

export function deleteTeacherCompletely(payload: {
  teacherName?: string;
  teacherId?: string;
  supervisionId?: string;
}): boolean {
  const db = loadDatabase();
  const cleanName = (payload.teacherName || '').toLowerCase().trim();
  const targetId = payload.supervisionId;
  let teacherId = payload.teacherId;

  // If teacherId or cleanName not directly provided, find from existing records
  if ((!teacherId || !cleanName) && targetId) {
    const existing = db.supervisions.find(s => s.id === targetId);
    if (existing) {
      if (!cleanName && existing.teacherName) {
        payload.teacherName = existing.teacherName;
      }
      if (!teacherId && existing.teacherId) {
        teacherId = existing.teacherId;
      }
    }
  }

  const effectiveCleanName = (payload.teacherName || '').toLowerCase().trim();

  // 1. Collect all matching supervision IDs
  const matchedSupervisionIds = new Set<string>();
  if (targetId) matchedSupervisionIds.add(targetId);

  db.supervisions.forEach(s => {
    if (targetId && s.id === targetId) matchedSupervisionIds.add(s.id);
    if (teacherId && s.teacherId === teacherId) matchedSupervisionIds.add(s.id);
    if (effectiveCleanName && s.teacherName && s.teacherName.toLowerCase().trim() === effectiveCleanName) {
      matchedSupervisionIds.add(s.id);
    }
  });

  // 2. Collect all matching user UIDs & display names
  const matchedUserUids = new Set<string>();
  if (teacherId) matchedUserUids.add(teacherId);

  db.users.forEach(u => {
    if (teacherId && u.uid === teacherId) matchedUserUids.add(u.uid);
    if (effectiveCleanName && u.displayName && u.displayName.toLowerCase().trim() === effectiveCleanName) {
      matchedUserUids.add(u.uid);
    }
  });

  // 3. Add to tracking deleted lists
  matchedSupervisionIds.forEach(id => {
    if (!db.deletedSupervisionIds.includes(id)) {
      db.deletedSupervisionIds.push(id);
    }
  });

  matchedUserUids.forEach(uid => {
    if (!db.deletedUserIds.includes(uid)) {
      db.deletedUserIds.push(uid);
    }
  });

  if (effectiveCleanName && !db.deletedUserNames.map(n => n.toLowerCase().trim()).includes(effectiveCleanName)) {
    db.deletedUserNames.push(effectiveCleanName);
  }

  // 4. Remove matching records completely from db.supervisions
  db.supervisions = db.supervisions.filter(s => {
    if (matchedSupervisionIds.has(s.id)) return false;
    if (teacherId && s.teacherId === teacherId) return false;
    if (effectiveCleanName && s.teacherName && s.teacherName.toLowerCase().trim() === effectiveCleanName) return false;
    return true;
  });

  // 5. Remove matching user accounts completely from db.users
  db.users = db.users.filter(u => {
    if (matchedUserUids.has(u.uid)) return false;
    if (effectiveCleanName && u.displayName && u.displayName.toLowerCase().trim() === effectiveCleanName) return false;
    return true;
  });

  saveDatabase(db);
  return true;
}

export function deleteSupervisionById(id: string): boolean {
  const db = loadDatabase();
  const target = db.supervisions.find(s => s.id === id);
  return deleteTeacherCompletely({
    supervisionId: id,
    teacherId: target?.teacherId,
    teacherName: target?.teacherName,
  });
}

// Users Operations
export function getAllUsers(): UserProfile[] {
  const db = loadDatabase();
  const deletedUids = new Set(db.deletedUserIds);
  const deletedNames = new Set(db.deletedUserNames.map(n => n.toLowerCase().trim()));

  return db.users.filter(u => {
    if (deletedUids.has(u.uid)) return false;
    if (u.displayName && deletedNames.has(u.displayName.toLowerCase().trim())) return false;
    return true;
  });
}

export function saveUserRecord(user: UserProfile): UserProfile {
  const db = loadDatabase();
  const now = new Date().toISOString();
  const targetUser: UserProfile = {
    ...user,
    updatedAt: now,
  };

  // Unmark if in deleted
  db.deletedUserIds = db.deletedUserIds.filter(id => id !== user.uid);
  if (user.displayName) {
    const cleanName = user.displayName.toLowerCase().trim();
    db.deletedUserNames = db.deletedUserNames.filter(n => n.toLowerCase().trim() !== cleanName);
  }

  const idx = db.users.findIndex(u => u.uid === user.uid || (user.username && u.username === user.username));
  if (idx >= 0) {
    db.users[idx] = targetUser;
  } else {
    db.users.push(targetUser);
  }

  // Cascade updates to supervisions
  if (user.role === 'guru') {
    db.supervisions = db.supervisions.map(s => {
      if (s.teacherId === user.uid || (user.username && s.teacherId === user.username)) {
        return {
          ...s,
          teacherName: user.displayName || s.teacherName,
          teacherNip: user.nip !== undefined ? user.nip : s.teacherNip,
          subject: user.subject || s.subject,
          schoolId: user.schoolId || s.schoolId,
          schoolName: user.schoolName || s.schoolName,
          updatedAt: now,
        };
      }
      return s;
    });
  }

  saveDatabase(db);
  return targetUser;
}

export function deleteUserRecord(uid: string): boolean {
  const db = loadDatabase();
  const target = db.users.find(u => u.uid === uid);
  return deleteTeacherCompletely({
    teacherId: uid,
    teacherName: target?.displayName,
  });
}

// Bulk Sync & Restore Operations
export function bulkSync(data: {
  schools?: School[];
  supervisions?: Supervision[];
  users?: UserProfile[];
  deletedSupervisionIds?: string[];
  deletedUserIds?: string[];
  deletedUserNames?: string[];
  replaceSupervisions?: boolean;
}): { schoolsCount: number; supervisionsCount: number; usersCount: number } {
  const db = loadDatabase();

  if (Array.isArray(data.deletedSupervisionIds)) {
    const set = new Set([...db.deletedSupervisionIds, ...data.deletedSupervisionIds]);
    db.deletedSupervisionIds = Array.from(set);
  }
  if (Array.isArray(data.deletedUserIds)) {
    const set = new Set([...db.deletedUserIds, ...data.deletedUserIds]);
    db.deletedUserIds = Array.from(set);
  }
  if (Array.isArray(data.deletedUserNames)) {
    const set = new Set([...db.deletedUserNames, ...data.deletedUserNames]);
    db.deletedUserNames = Array.from(set);
  }

  if (Array.isArray(data.schools)) {
    const schoolMap = new Map<string, School>();
    db.schools.forEach(s => schoolMap.set(s.id, s));
    data.schools.forEach(s => schoolMap.set(s.id, s));
    db.schools = Array.from(schoolMap.values());
  }

  if (Array.isArray(data.supervisions)) {
    if (data.replaceSupervisions) {
      db.supervisions = [...data.supervisions];
    } else {
      const supMap = new Map<string, Supervision>();
      db.supervisions.forEach(s => supMap.set(s.id, s));
      data.supervisions.forEach(s => supMap.set(s.id, s));
      db.supervisions = Array.from(supMap.values());
    }
  }

  if (Array.isArray(data.users)) {
    const userMap = new Map<string, UserProfile>();
    db.users.forEach(u => userMap.set(u.uid, u));
    data.users.forEach(u => userMap.set(u.uid, u));
    db.users = Array.from(userMap.values());
  }

  saveDatabase(db);
  return {
    schoolsCount: db.schools.length,
    supervisionsCount: db.supervisions.length,
    usersCount: db.users.length,
  };
}

export function restoreBackupData(data: {
  supervisions: Supervision[];
  schools?: School[];
}): { supervisionsCount: number; schoolsCount: number } {
  const db = loadDatabase();

  if (Array.isArray(data.schools) && data.schools.length > 0) {
    const schoolMap = new Map<string, School>();
    db.schools.forEach(s => schoolMap.set(s.id, s));
    data.schools.forEach(s => schoolMap.set(s.id, s));
    db.schools = Array.from(schoolMap.values());
  }

  if (Array.isArray(data.supervisions) && data.supervisions.length > 0) {
    const supMap = new Map<string, Supervision>();
    db.supervisions.forEach(s => supMap.set(s.id, s));
    data.supervisions.forEach(s => {
      // clear from deleted if present
      db.deletedSupervisionIds = db.deletedSupervisionIds.filter(id => id !== s.id);
      supMap.set(s.id, s);
    });
    db.supervisions = Array.from(supMap.values());
  }

  saveDatabase(db);
  return {
    supervisionsCount: data.supervisions.length,
    schoolsCount: data.schools?.length || 0,
  };
}
