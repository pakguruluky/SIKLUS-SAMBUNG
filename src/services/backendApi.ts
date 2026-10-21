import { School, Supervision, UserProfile } from '../types';

const API_BASE = '/api';

export interface BootstrapResponse {
  schools: School[];
  supervisions: Supervision[];
  users: UserProfile[];
  deletedSupervisionIds: string[];
  deletedUserIds: string[];
  deletedUserNames: string[];
}

export async function apiGetBootstrapData(): Promise<BootstrapResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/bootstrap`, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.warn('Backend API bootstrap unavailable, falling back to local:', err);
    return null;
  }
}

// Schools API
export async function apiFetchSchools(): Promise<School[] | null> {
  try {
    const res = await fetch(`${API_BASE}/schools`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    const json = await res.json();
    return json.schools || null;
  } catch (err) {
    console.warn('Backend API fetch schools unavailable:', err);
    return null;
  }
}

export async function apiSaveSchool(school: School): Promise<School | null> {
  try {
    const res = await fetch(`${API_BASE}/schools`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(school),
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.school || null;
  } catch (err) {
    console.warn('Backend API save school failed:', err);
    return null;
  }
}

export async function apiUpdateSchool(id: string, partial: Partial<School>): Promise<School | null> {
  try {
    const res = await fetch(`${API_BASE}/schools/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partial),
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.school || null;
  } catch (err) {
    console.warn('Backend API update school failed:', err);
    return null;
  }
}

export async function apiDeleteSchool(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/schools/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function apiResetSchools(): Promise<School[] | null> {
  try {
    const res = await fetch(`${API_BASE}/schools/reset`, {
      method: 'POST',
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.schools || null;
  } catch {
    return null;
  }
}

// Supervisions API
export async function apiFetchSupervisions(): Promise<Supervision[] | null> {
  try {
    const res = await fetch(`${API_BASE}/supervisions`, { signal: AbortSignal.timeout(3500) });
    if (!res.ok) return null;
    const json = await res.json();
    return json.supervisions || null;
  } catch (err) {
    console.warn('Backend API fetch supervisions unavailable:', err);
    return null;
  }
}

export async function apiSaveSupervision(supervision: Partial<Supervision> & { id?: string }): Promise<Supervision | null> {
  try {
    const res = await fetch(`${API_BASE}/supervisions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(supervision),
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.supervision || null;
  } catch (err) {
    console.warn('Backend API save supervision failed:', err);
    return null;
  }
}

export async function apiDeleteSupervision(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/supervisions/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Users API
export async function apiFetchUsers(): Promise<UserProfile[] | null> {
  try {
    const res = await fetch(`${API_BASE}/users`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    const json = await res.json();
    return json.users || null;
  } catch {
    return null;
  }
}

export async function apiSaveUser(user: UserProfile): Promise<UserProfile | null> {
  try {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.user || null;
  } catch (err) {
    console.warn('Backend API save user failed:', err);
    return null;
  }
}

export async function apiDeleteUser(uid: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/users/${encodeURIComponent(uid)}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Bulk Sync & Restore API
export async function apiSyncAll(payload: {
  schools?: School[];
  supervisions?: Supervision[];
  users?: UserProfile[];
  deletedSupervisionIds?: string[];
  deletedUserIds?: string[];
  deletedUserNames?: string[];
}): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(6000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function apiRestoreBackup(payload: {
  supervisions: Supervision[];
  schools?: School[];
}): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
