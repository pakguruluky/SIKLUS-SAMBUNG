import { School, Supervision, UserProfile } from '../types';

export const STORAGE_KEYS = {
  SUPERVISIONS: 'siklus_sambung_supervisions_v1',
  SCHOOLS: 'siklus_sambung_schools_v1',
  USER: 'siklus_sambung_user_v1',
  LAST_SYNC: 'siklus_sambung_last_sync_v1',
  DRAFT_PREFIX: 'siklus_sambung_draft_',
} as const;

/**
 * Safely parse JSON from local storage
 */
function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn('[LocalStorage] Gagal membaca data JSON:', err);
    return fallback;
  }
}

/**
 * Supervisions Storage
 */
export function loadLocalSupervisions(): Supervision[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUPERVISIONS);
    if (!raw) return null;
    const parsed = safeJsonParse<Supervision[]>(raw, []);
    return parsed.length > 0 ? parsed : null;
  } catch (err) {
    console.warn('[LocalStorage] Error loading supervisions:', err);
    return null;
  }
}

export function saveLocalSupervisions(supervisions: Supervision[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SUPERVISIONS, JSON.stringify(supervisions));
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
  } catch (err) {
    console.warn('[LocalStorage] Error saving supervisions:', err);
  }
}

export function saveSingleLocalSupervision(supervision: Supervision): void {
  try {
    const existing = loadLocalSupervisions() || [];
    const index = existing.findIndex(s => s.id === supervision.id);
    let updated: Supervision[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = { ...updated[index], ...supervision, updatedAt: new Date().toISOString() };
    } else {
      updated = [{ ...supervision, updatedAt: new Date().toISOString() }, ...existing];
    }
    saveLocalSupervisions(updated);
  } catch (err) {
    console.warn('[LocalStorage] Error saving single supervision:', err);
  }
}

/**
 * Schools Storage
 */
export function loadLocalSchools(): School[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCHOOLS);
    if (!raw) return null;
    const parsed = safeJsonParse<School[]>(raw, []);
    return parsed.length > 0 ? parsed : null;
  } catch (err) {
    console.warn('[LocalStorage] Error loading schools:', err);
    return null;
  }
}

export function saveLocalSchools(schools: School[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(schools));
  } catch (err) {
    console.warn('[LocalStorage] Error saving schools:', err);
  }
}

/**
 * User Profile Storage
 */
export function loadLocalUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return safeJsonParse<UserProfile | null>(raw, null);
  } catch (err) {
    console.warn('[LocalStorage] Error loading user:', err);
    return null;
  }
}

export function saveLocalUser(user: UserProfile | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  } catch (err) {
    console.warn('[LocalStorage] Error saving user:', err);
  }
}

/**
 * Form Draft Auto-Save
 */
export function saveFormDraft(formKey: string, data: unknown): void {
  try {
    localStorage.setItem(`${STORAGE_KEYS.DRAFT_PREFIX}${formKey}`, JSON.stringify({
      data,
      savedAt: new Date().toISOString(),
    }));
  } catch (err) {
    console.warn('[LocalStorage] Error saving draft:', err);
  }
}

export function loadFormDraft<T>(formKey: string): { data: T; savedAt: string } | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.DRAFT_PREFIX}${formKey}`);
    if (!raw) return null;
    return safeJsonParse<{ data: T; savedAt: string } | null>(raw, null);
  } catch (err) {
    console.warn('[LocalStorage] Error loading draft:', err);
    return null;
  }
}

export function clearFormDraft(formKey: string): void {
  try {
    localStorage.removeItem(`${STORAGE_KEYS.DRAFT_PREFIX}${formKey}`);
  } catch (err) {
    console.warn('[LocalStorage] Error clearing draft:', err);
  }
}

/**
 * Export & Download Backup File directly to Device (.json)
 */
export function exportDataToLocalFile(supervisions: Supervision[], schools: School[], user: UserProfile | null): void {
  const exportPayload = {
    appName: 'SIKLUS SAMBUNG SMA',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    exportedBy: user ? { uid: user.uid, displayName: user.displayName, role: user.role } : null,
    totalSupervisions: supervisions.length,
    totalSchools: schools.length,
    schools,
    supervisions,
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const dateStr = new Date().toISOString().split('T')[0];
  const downloadAnchor = document.createElement('a');
  downloadAnchor.href = url;
  downloadAnchor.download = `SIKLUS_SAMBUNG_Backup_${dateStr}.json`;
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  document.body.removeChild(downloadAnchor);
  URL.revokeObjectURL(url);
}

/**
 * Import & Restore Backup from Device File (.json)
 */
export function readBackupFromFile(file: File): Promise<{
  supervisions: Supervision[];
  schools: School[];
  exportedAt?: string;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed || !Array.isArray(parsed.supervisions)) {
          throw new Error('Format berkas tidak valid. Berkas harus berisi array supervisi.');
        }
        resolve({
          supervisions: parsed.supervisions as Supervision[],
          schools: Array.isArray(parsed.schools) ? (parsed.schools as School[]) : [],
          exportedAt: parsed.exportedAt,
        });
      } catch (err: any) {
        reject(new Error(err.message || 'Gagal memproses berkas JSON cadangan.'));
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca berkas dari perangkat.'));
    reader.readAsText(file);
  });
}

/**
 * Storage metrics info
 */
export function getLocalStorageInfo(): {
  sizeKb: number;
  supervisionsCount: number;
  schoolsCount: number;
  lastSaved: string | null;
} {
  try {
    let totalBytes = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('siklus_sambung')) {
        const val = localStorage.getItem(key) || '';
        totalBytes += (key.length + val.length) * 2;
      }
    }
    const supervisions = loadLocalSupervisions() || [];
    const schools = loadLocalSchools() || [];
    const lastSaved = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);

    return {
      sizeKb: Math.round((totalBytes / 1024) * 10) / 10,
      supervisionsCount: supervisions.length,
      schoolsCount: schools.length,
      lastSaved,
    };
  } catch {
    return { sizeKb: 0, supervisionsCount: 0, schoolsCount: 0, lastSaved: null };
  }
}
