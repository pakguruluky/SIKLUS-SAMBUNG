import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
export type School = any;
export type Supervision = any;
export type UserProfile = any;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../server_data');
const WORKSPACES_DIR = path.resolve(DATA_DIR, 'workspaces');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');
const KUSNANDAR_UID = 'user-pengawas-kusnandar';

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
  if (!fs.existsSync(WORKSPACES_DIR)) {
    fs.mkdirSync(WORKSPACES_DIR, { recursive: true });
  }
}

function sanitizeWorkspaceFileId(id: string): string {
  return (id || KUSNANDAR_UID).replace(/[^a-zA-Z0-9_-]/g, '_');
}

function isKusnandarOwnerId(id?: string | null): boolean {
  if (!id) return false;
  return id === KUSNANDAR_UID || id === 'admin-kusnandar' || id === 'system';
}

export function resolveRecordOwnerUid(record: any, db?: DatabaseSchema): string {
  if (!record) return KUSNANDAR_UID;
  if (record.role === 'super_admin' || record.uid === 'user-super-admin' || record.username === 'admin') {
    return 'user-super-admin';
  }
  if (record.role === 'pengawas' || record.role === 'admin') {
    if (record.uid === KUSNANDAR_UID || record.uid === 'admin-kusnandar' || record.username === 'pengawas') {
      return KUSNANDAR_UID;
    }
    return record.supervisorWorkspaceId || record.uid || KUSNANDAR_UID;
  }
  if (record.supervisorWorkspaceId && !isKusnandarOwnerId(record.supervisorWorkspaceId)) {
    return record.supervisorWorkspaceId;
  }
  if (record.supervisorId && !isKusnandarOwnerId(record.supervisorId)) {
    return record.supervisorId;
  }
  if (record.createdBy && !isKusnandarOwnerId(record.createdBy) && record.createdBy !== 'user-super-admin') {
    return record.createdBy;
  }
  // If linked to a school in db, inherit that school's owner
  if (db && record.schoolId) {
    const sch = db.schools.find(s => s.id === record.schoolId);
    if (sch) {
      const schOwner = sch.supervisorWorkspaceId || sch.supervisorId || sch.createdBy;
      if (schOwner && !isKusnandarOwnerId(schOwner) && schOwner !== 'user-super-admin') {
        return schOwner;
      }
    }
  }
  return KUSNANDAR_UID;
}

export function belongsToSupervisor(record: any, targetSupervisorId: string, db?: DatabaseSchema): boolean {
  if (!targetSupervisorId || targetSupervisorId === 'user-super-admin') return true;
  const normalizedTarget = isKusnandarOwnerId(targetSupervisorId) ? KUSNANDAR_UID : targetSupervisorId;
  const owner = resolveRecordOwnerUid(record, db);
  return owner === normalizedTarget;
}

function isNameDeletedForOwner(name: string | undefined, ownerUid: string, deletedUserNames: string[]): boolean {
  if (!name) return false;
  const clean = name.toLowerCase().trim();
  const scopedKey = `${ownerUid}::${clean}`;
  for (const entry of deletedUserNames) {
    const low = entry.toLowerCase().trim();
    if (low === scopedKey) return true;
    // Legacy unscoped entries only apply to Pak Kusnandar's workspace
    if (!low.includes('::') && ownerUid === KUSNANDAR_UID && low === clean) return true;
  }
  return false;
}

function persistPerPengawasWorkspaces(db: DatabaseSchema): void {
  try {
    ensureDataDir();
    const ownerIds = new Set<string>([KUSNANDAR_UID]);
    db.users.forEach(u => {
      if (u.role === 'pengawas' || u.role === 'admin') {
        const uid = resolveRecordOwnerUid(u, db);
        if (uid && uid !== 'user-super-admin') ownerIds.add(uid);
      } else {
        const uid = resolveRecordOwnerUid(u, db);
        if (uid && uid !== 'user-super-admin') ownerIds.add(uid);
      }
    });
    db.schools.forEach(s => {
      const uid = resolveRecordOwnerUid(s, db);
      if (uid && uid !== 'user-super-admin') ownerIds.add(uid);
    });
    db.supervisions.forEach(s => {
      const uid = resolveRecordOwnerUid(s, db);
      if (uid && uid !== 'user-super-admin') ownerIds.add(uid);
    });

    ownerIds.forEach(ownerUid => {
      const wsSchools = db.schools.filter(s => belongsToSupervisor(s, ownerUid, db));
      const wsSupervisions = db.supervisions.filter(s => belongsToSupervisor(s, ownerUid, db));
      const wsUsers = db.users.filter(u => u.role !== 'super_admin' && belongsToSupervisor(u, ownerUid, db));
      const pengawasProfile = wsUsers.find(u => u.uid === ownerUid) || null;

      const workspacePayload = {
        supervisorId: ownerUid,
        supervisorName: pengawasProfile?.displayName || (ownerUid === KUSNANDAR_UID ? 'Kusnandar, M.Si' : ''),
        updatedAt: db.lastUpdated,
        counts: {
          schools: wsSchools.length,
          supervisions: wsSupervisions.length,
          users: wsUsers.length,
        },
        schools: wsSchools,
        supervisions: wsSupervisions,
        users: wsUsers,
      };
      const filePath = path.resolve(WORKSPACES_DIR, `${sanitizeWorkspaceFileId(ownerUid)}.json`);
      fs.writeFileSync(filePath, JSON.stringify(workspacePayload, null, 2), 'utf-8');
    });
  } catch (err) {
    console.warn('Notice persisting per-pengawas workspace files:', err);
  }
}

export function getWorkspaceSnapshot(supervisorId: string) {
  const db = loadDatabase();
  const normalizedTarget = isKusnandarOwnerId(supervisorId) ? KUSNANDAR_UID : supervisorId;
  const schools = getAllSchools(normalizedTarget);
  const supervisions = getAllSupervisions(normalizedTarget);
  const users = getAllUsers(normalizedTarget);
  return {
    supervisorId: normalizedTarget,
    schools,
    supervisions,
    users,
    lastUpdated: db.lastUpdated,
  };
}

function getInitialDatabase(): DatabaseSchema {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed) return parsed;
    } catch {}
  }
  return {
    schools: [],
    supervisions: [],
    users: [],
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
        const sanitizedSupervisions = (parsed.supervisions || []).map((s: any) => {
          if (s.sambung?.gerakkan?.rtlNyatakan) {
            s.sambung.gerakkan.rtlNyatakan = s.sambung.gerakkan.rtlNyatakan.filter(
              (r: any) => !r.indikator?.includes('Asesmen Autentik') && r.id !== 5
            );
          }
          return s;
        });

        inMemoryDb = {
          schools: parsed.schools,
          supervisions: sanitizedSupervisions,
          users: Array.isArray(parsed.users) ? parsed.users : [],
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
    persistPerPengawasWorkspaces(inMemoryDb);
  } catch (err) {
    console.error('Failed writing to database.json:', err);
  }
}

// Schools Operations
export function getAllSchools(supervisorId?: string): School[] {
  const db = loadDatabase();
  if (!supervisorId) return db.schools;
  return db.schools.filter(s => belongsToSupervisor(s, supervisorId, db));
}

export function getSchoolById(id: string): School | null {
  const db = loadDatabase();
  return db.schools.find(s => s.id === id) || null;
}

export function saveSchool(school: School): School {
  const db = loadDatabase();
  const existingIndex = db.schools.findIndex(s => s.id === school.id);
  const existing = existingIndex >= 0 ? db.schools[existingIndex] : null;
  const now = new Date().toISOString();
  const ownerUid = resolveRecordOwnerUid({ ...existing, ...school }, db);
  const updatedSchool: School = {
    ...existing,
    ...school,
    supervisorId: school.supervisorId || existing?.supervisorId || ownerUid,
    supervisorWorkspaceId: school.supervisorWorkspaceId || existing?.supervisorWorkspaceId || ownerUid,
    createdBy: school.createdBy || existing?.createdBy || ownerUid,
    updatedAt: now,
  };

  if (existingIndex >= 0) {
    db.schools[existingIndex] = updatedSchool;
  } else {
    db.schools.push(updatedSchool);
  }

  // Also sync schoolName to supervisions and users of this school
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
  const ownerUid = resolveRecordOwnerUid({ ...existing, ...partial }, db);

  const target: School = existing
    ? {
        ...existing,
        ...partial,
        id,
        updatedAt: now,
        supervisorId: partial.supervisorId || existing.supervisorId || ownerUid,
        supervisorWorkspaceId: partial.supervisorWorkspaceId || existing.supervisorWorkspaceId || ownerUid,
        createdBy: partial.createdBy || existing.createdBy || ownerUid,
      }
    : {
        id,
        name: partial.name || 'SMA Binaan',
        npsn: partial.npsn || '',
        principalName: partial.principalName || '',
        accreditation: partial.accreditation || 'A',
        address: partial.address || '',
        createdAt: now,
        updatedAt: now,
        supervisorId: ownerUid,
        supervisorWorkspaceId: ownerUid,
        createdBy: partial.createdBy || ownerUid,
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
  return db.schools;
}

// Supervisions Operations
export function getAllSupervisions(supervisorId?: string): Supervision[] {
  const db = loadDatabase();
  const deletedIds = new Set(db.deletedSupervisionIds);
  const deletedUids = new Set(db.deletedUserIds);

  return db.supervisions
    .filter(s => {
      if (supervisorId && !belongsToSupervisor(s, supervisorId, db)) return false;
      if (deletedIds.has(s.id)) return false;
      if (s.teacherId && deletedUids.has(s.teacherId)) return false;
      const ownerUid = resolveRecordOwnerUid(s, db);
      if (isNameDeletedForOwner(s.teacherName, ownerUid, db.deletedUserNames)) return false;
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
  const existing = db.supervisions.find(s => s.id === targetId);
  const ownerUid = resolveRecordOwnerUid({ ...existing, ...sup }, db);

  const fullSupervision: Supervision = {
    ...existing,
    ...sup,
    id: targetId,
    supervisorId: sup.supervisorId || existing?.supervisorId || ownerUid,
    supervisorWorkspaceId: sup.supervisorWorkspaceId || existing?.supervisorWorkspaceId || ownerUid,
    createdBy: sup.createdBy || existing?.createdBy || ownerUid,
    isValidData: true,
    createdAt: (sup as any).createdAt || existing?.createdAt || now,
    updatedAt: now,
  } as Supervision;

  // Unmark if previously deleted
  db.deletedSupervisionIds = db.deletedSupervisionIds.filter(id => id !== targetId);
  if (fullSupervision.teacherName) {
    const clean = fullSupervision.teacherName.toLowerCase().trim();
    const scoped = `${ownerUid}::${clean}`;
    db.deletedUserNames = db.deletedUserNames.filter(n => {
      const low = n.toLowerCase().trim();
      if (low === scoped) return false;
      if (ownerUid === KUSNANDAR_UID && low === clean) return false;
      return true;
    });
  }

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
  supervisorId?: string;
}): boolean {
  const db = loadDatabase();
  const cleanName = (payload.teacherName || '').toLowerCase().trim();
  const targetId = payload.supervisionId;
  let teacherId = payload.teacherId;
  let resolvedSupervisorId = payload.supervisorId;

  // Find missing metadata from existing records
  if (targetId) {
    const existing = db.supervisions.find(s => s.id === targetId);
    if (existing) {
      if (!cleanName && existing.teacherName) payload.teacherName = existing.teacherName;
      if (!teacherId && existing.teacherId) teacherId = existing.teacherId;
      if (!resolvedSupervisorId) resolvedSupervisorId = resolveRecordOwnerUid(existing, db);
    }
  }
  if (teacherId) {
    const existingUser = db.users.find(u => u.uid === teacherId);
    if (existingUser) {
      if (!payload.teacherName && existingUser.displayName) payload.teacherName = existingUser.displayName;
      if (!resolvedSupervisorId) resolvedSupervisorId = resolveRecordOwnerUid(existingUser, db);
    }
  }

  const effectiveCleanName = (payload.teacherName || '').toLowerCase().trim();
  const ownerScope = resolvedSupervisorId
    ? (isKusnandarOwnerId(resolvedSupervisorId) ? KUSNANDAR_UID : resolvedSupervisorId)
    : null;

  // 1. Collect matching supervision IDs strictly within the same supervisor workspace
  const matchedSupervisionIds = new Set<string>();
  if (targetId) matchedSupervisionIds.add(targetId);

  db.supervisions.forEach(s => {
    const inSameWorkspace = !ownerScope || belongsToSupervisor(s, ownerScope, db);
    if (targetId && s.id === targetId) matchedSupervisionIds.add(s.id);
    if (teacherId && s.teacherId === teacherId && inSameWorkspace) matchedSupervisionIds.add(s.id);
    if (
      inSameWorkspace &&
      effectiveCleanName &&
      s.teacherName &&
      s.teacherName.toLowerCase().trim() === effectiveCleanName
    ) {
      matchedSupervisionIds.add(s.id);
    }
  });

  // 2. Collect matching user UIDs strictly within the same supervisor workspace
  const matchedUserUids = new Set<string>();
  if (teacherId) matchedUserUids.add(teacherId);

  db.users.forEach(u => {
    if (u.role === 'super_admin') return;
    const inSameWorkspace = !ownerScope || belongsToSupervisor(u, ownerScope, db);
    if (teacherId && u.uid === teacherId) matchedUserUids.add(u.uid);
    if (
      inSameWorkspace &&
      u.role === 'guru' &&
      effectiveCleanName &&
      u.displayName &&
      u.displayName.toLowerCase().trim() === effectiveCleanName
    ) {
      matchedUserUids.add(u.uid);
    }
  });

  // 3. Add to tracking deleted lists (scoped by supervisorId for names so other pengawas are never affected)
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

  if (effectiveCleanName && ownerScope) {
    const scopedNameKey = `${ownerScope}::${effectiveCleanName}`;
    if (!db.deletedUserNames.map(n => n.toLowerCase().trim()).includes(scopedNameKey)) {
      db.deletedUserNames.push(scopedNameKey);
    }
  }

  // 4. Remove ONLY matching records from db.supervisions (other pengawas untouched)
  db.supervisions = db.supervisions.filter(s => !matchedSupervisionIds.has(s.id));

  // 5. Remove ONLY matching user accounts from db.users (other pengawas untouched)
  db.users = db.users.filter(u => !matchedUserUids.has(u.uid));

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
    supervisorId: target ? resolveRecordOwnerUid(target, db) : undefined,
  });
}

// Users Operations
export function getAllUsers(supervisorId?: string): UserProfile[] {
  const db = loadDatabase();
  const deletedUids = new Set(db.deletedUserIds);

  return db.users.filter(u => {
    if (supervisorId && u.role !== 'super_admin' && !belongsToSupervisor(u, supervisorId, db)) {
      return false;
    }
    if (supervisorId && supervisorId !== 'user-super-admin' && u.role === 'super_admin') {
      return false;
    }
    if (deletedUids.has(u.uid)) return false;
    const ownerUid = resolveRecordOwnerUid(u, db);
    if (u.role === 'guru' && isNameDeletedForOwner(u.displayName, ownerUid, db.deletedUserNames)) return false;
    return true;
  });
}

export function saveUserRecord(user: UserProfile): UserProfile {
  const db = loadDatabase();
  const now = new Date().toISOString();
  const existingIdx = db.users.findIndex(u => u.uid === user.uid || (user.username && u.username === user.username));
  const existing = existingIdx >= 0 ? db.users[existingIdx] : null;
  const ownerUid = resolveRecordOwnerUid({ ...existing, ...user }, db);

  const targetUser: UserProfile = {
    ...existing,
    ...user,
    ...(user.role !== 'super_admin'
      ? {
          supervisorId: user.supervisorId || existing?.supervisorId || ownerUid,
          supervisorWorkspaceId: user.supervisorWorkspaceId || existing?.supervisorWorkspaceId || ownerUid,
          createdBy: user.createdBy || existing?.createdBy || ownerUid,
        }
      : {}),
    updatedAt: now,
  };

  // Unmark if in deleted
  db.deletedUserIds = db.deletedUserIds.filter(id => id !== user.uid);
  if (user.displayName) {
    const cleanName = user.displayName.toLowerCase().trim();
    const scopedName = `${ownerUid}::${cleanName}`;
    db.deletedUserNames = db.deletedUserNames.filter(n => {
      const low = n.toLowerCase().trim();
      if (low === scopedName) return false;
      if (ownerUid === KUSNANDAR_UID && low === cleanName) return false;
      return true;
    });
  }

  if (existingIdx >= 0) {
    db.users[existingIdx] = targetUser;
  } else {
    db.users.push(targetUser);
  }

  // Cascade updates to supervisions owned by this teacher
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
    supervisorId: target ? resolveRecordOwnerUid(target, db) : undefined,
  });
}

// Bulk Sync & Restore Operations (Strictly Preserves Other Pengawas Data!)
export function bulkSync(data: {
  supervisorId?: string;
  schools?: School[];
  supervisions?: Supervision[];
  users?: UserProfile[];
  deletedSupervisionIds?: string[];
  deletedUserIds?: string[];
  deletedUserNames?: string[];
  replaceSupervisions?: boolean;
}): { schoolsCount: number; supervisionsCount: number; usersCount: number } {
  const db = loadDatabase();
  const scopedSupervisorId =
    data.supervisorId && data.supervisorId !== 'user-super-admin'
      ? (isKusnandarOwnerId(data.supervisorId) ? KUSNANDAR_UID : data.supervisorId)
      : null;

  if (Array.isArray(data.deletedSupervisionIds)) {
    const set = new Set([...db.deletedSupervisionIds, ...data.deletedSupervisionIds]);
    db.deletedSupervisionIds = Array.from(set);
  }
  if (Array.isArray(data.deletedUserIds)) {
    const set = new Set([...db.deletedUserIds, ...data.deletedUserIds]);
    db.deletedUserIds = Array.from(set);
  }
  if (Array.isArray(data.deletedUserNames)) {
    const normalized = data.deletedUserNames.map(n => {
      if (n.includes('::')) return n.toLowerCase().trim();
      return scopedSupervisorId ? `${scopedSupervisorId}::${n.toLowerCase().trim()}` : n.toLowerCase().trim();
    });
    const set = new Set([...db.deletedUserNames, ...normalized]);
    db.deletedUserNames = Array.from(set);
  }

  if (Array.isArray(data.schools)) {
    const schoolMap = new Map<string, School>();
    db.schools.forEach(s => schoolMap.set(s.id, s));
    data.schools.forEach(s => {
      const owner = scopedSupervisorId || resolveRecordOwnerUid(s, db);
      schoolMap.set(s.id, {
        ...s,
        supervisorId: s.supervisorId || owner,
        supervisorWorkspaceId: s.supervisorWorkspaceId || owner,
        createdBy: s.createdBy || owner,
      });
    });
    db.schools = Array.from(schoolMap.values());
  }

  if (Array.isArray(data.supervisions)) {
    if (data.replaceSupervisions && !scopedSupervisorId) {
      db.supervisions = [...data.supervisions];
    } else if (data.replaceSupervisions && scopedSupervisorId) {
      // Only replace records belonging to scopedSupervisorId; preserve all other pengawas's records
      const others = db.supervisions.filter(s => !belongsToSupervisor(s, scopedSupervisorId, db));
      const stamped = data.supervisions.map(s => ({
        ...s,
        supervisorId: s.supervisorId || scopedSupervisorId,
        supervisorWorkspaceId: s.supervisorWorkspaceId || scopedSupervisorId,
        createdBy: s.createdBy || scopedSupervisorId,
      }));
      db.supervisions = [...stamped, ...others];
    } else {
      const supMap = new Map<string, Supervision>();
      db.supervisions.forEach(s => supMap.set(s.id, s));
      data.supervisions.forEach(s => {
        const owner = scopedSupervisorId || resolveRecordOwnerUid(s, db);
        supMap.set(s.id, {
          ...s,
          supervisorId: s.supervisorId || owner,
          supervisorWorkspaceId: s.supervisorWorkspaceId || owner,
          createdBy: s.createdBy || owner,
        });
      });
      db.supervisions = Array.from(supMap.values());
    }
  }

  if (Array.isArray(data.users)) {
    const userMap = new Map<string, UserProfile>();
    db.users.forEach(u => userMap.set(u.uid, u));
    data.users.forEach(u => {
      if (u.role === 'super_admin') {
        userMap.set(u.uid, u);
      } else {
        const owner = scopedSupervisorId || resolveRecordOwnerUid(u, db);
        userMap.set(u.uid, {
          ...u,
          supervisorId: u.supervisorId || owner,
          supervisorWorkspaceId: u.supervisorWorkspaceId || owner,
          createdBy: u.createdBy || owner,
        });
      }
    });
    db.users = Array.from(userMap.values());
  }

  saveDatabase(db);
  return {
    schoolsCount: scopedSupervisorId ? getAllSchools(scopedSupervisorId).length : db.schools.length,
    supervisionsCount: scopedSupervisorId ? getAllSupervisions(scopedSupervisorId).length : db.supervisions.length,
    usersCount: scopedSupervisorId ? getAllUsers(scopedSupervisorId).length : db.users.length,
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
