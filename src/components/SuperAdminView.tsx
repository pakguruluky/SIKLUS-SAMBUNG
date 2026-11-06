import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  Users, 
  Search, 
  Building2, 
  GraduationCap, 
  Key, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Trash2, 
  Edit3, 
  Sparkles, 
  ExternalLink, 
  RefreshCw,
  FolderOpen,
  ArrowRight,
  Database,
  CloudCheck,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { UserProfile, School, Supervision, Role } from '../types';
import { 
  fetchAllUsers, 
  addUserAccount, 
  updateUserAccount, 
  deleteUserAccount,
  isKusnandarAccount
} from '../services/firebase';

interface SuperAdminViewProps {
  currentUser: UserProfile;
  supervisions: Supervision[];
  schools: School[];
  onSelectSupervisorWorkspace: (supervisor: UserProfile | null) => void;
  activeSupervisorOverride: UserProfile | null;
  onRefreshData?: () => Promise<void>;
}

export const SuperAdminView: React.FC<SuperAdminViewProps> = ({
  currentUser,
  supervisions,
  schools,
  onSelectSupervisorWorkspace,
  activeSupervisorOverride,
  onRefreshData,
}) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPengawas, setEditingPengawas] = useState<UserProfile | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedUid, setCopiedUid] = useState<string | null>(null);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // Add / Edit Form State
  const [namaLengkap, setNamaLengkap] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('bajuri39');
  const [nip, setNip] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [wilayahTugas, setWilayahTugas] = useState('Cabang Dinas Pendidikan Wilayah II (Kota/Kab. Bogor)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadAllPengawas = async () => {
    try {
      setLoading(true);
      const all = await fetchAllUsers();
      setUsers(all);
    } catch (err) {
      console.warn('Error loading users for super admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllPengawas();
  }, []);

  // Filter only pengawas and admin accounts
  const pengawasUsers = users.filter(
    u => u.role === 'pengawas' || 
         u.role === 'admin' || 
         u.username === 'pengawas' ||
         u.role === 'super_admin'
  );

  const filteredPengawas = pengawasUsers.filter(u => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      (u.displayName && u.displayName.toLowerCase().includes(term)) ||
      (u.username && u.username.toLowerCase().includes(term)) ||
      (u.nip && u.nip.toLowerCase().includes(term)) ||
      (u.wilayahTugas && u.wilayahTugas.toLowerCase().includes(term))
    );
  });

  const getSupervisionCountFor = (p: UserProfile) => {
    if (p.role === 'super_admin') return supervisions.length;
    if (isKusnandarAccount(p)) {
      return supervisions.filter(s =>
        !s.supervisorId ||
        s.supervisorId === 'user-pengawas-kusnandar' ||
        s.supervisorId === 'admin-kusnandar' ||
        (s.supervisorName && s.supervisorName.toLowerCase().includes('kusnandar')) ||
        s.createdBy === 'user-pengawas-kusnandar' ||
        s.createdBy === 'system' ||
        s.id.startsWith('sup-demo-')
      ).length;
    }
    return supervisions.filter(s =>
      s.supervisorId === p.uid ||
      s.createdBy === p.uid ||
      (Boolean(s.supervisorName) && s.supervisorName.toLowerCase().trim() === p.displayName?.toLowerCase().trim())
    ).length;
  };

  const getSchoolCountFor = (p: UserProfile) => {
    if (p.role === 'super_admin') return schools.length;
    if (isKusnandarAccount(p)) {
      return schools.length;
    }
    return schools.filter(s => s.createdBy === p.uid).length;
  };

  const handleOpenAddModal = () => {
    setEditingPengawas(null);
    setNamaLengkap('');
    setUsername('');
    setPassword('bajuri39');
    setNip('');
    setEmail('');
    setPhone('');
    setWilayahTugas('Cabang Dinas Pendidikan Wilayah II (Kota/Kab. Bogor)');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (p: UserProfile) => {
    setEditingPengawas(p);
    setNamaLengkap(p.displayName || '');
    setUsername(p.username || '');
    setPassword(p.password || 'bajuri39');
    setNip(p.nip || '');
    setEmail(p.email || '');
    setPhone(p.phone || '');
    setWilayahTugas(p.wilayahTugas || 'Cabang Dinas Pendidikan Wilayah II');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleSavePengawas = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanUsername) {
      setFormError('Username pengawas wajib diisi.');
      return;
    }
    if (!namaLengkap.trim()) {
      setFormError('Nama lengkap pengawas wajib diisi.');
      return;
    }
    if (!password.trim()) {
      setFormError('Password wajib diisi.');
      return;
    }

    try {
      setIsSubmitting(true);
      const emailFinal = email.trim() || `${cleanUsername}@siklus-sambung.sch.id`;

      if (editingPengawas) {
        const updated: UserProfile = {
          ...editingPengawas,
          displayName: namaLengkap.trim(),
          username: cleanUsername,
          password: password.trim(),
          nip: nip.trim() || undefined,
          email: emailFinal,
          phone: phone.trim() || undefined,
          wilayahTugas: wilayahTugas.trim(),
          updatedAt: new Date().toISOString(),
        };
        await updateUserAccount(updated);
        setToastMessage(`Akun Pengawas ${updated.displayName} berhasil diperbarui di Firebase!`);
      } else {
        // Check for duplicate username
        const duplicate = users.find(u => u.username?.toLowerCase() === cleanUsername);
        if (duplicate) {
          setFormError(`Username "${cleanUsername}" sudah digunakan oleh akun lain. Gunakan username berbeda.`);
          setIsSubmitting(false);
          return;
        }

        const newUid = `user-pengawas-${Date.now()}`;
        const newPengawas: UserProfile = {
          uid: newUid,
          username: cleanUsername,
          password: password.trim(),
          email: emailFinal,
          displayName: namaLengkap.trim(),
          role: 'pengawas',
          nip: nip.trim() || undefined,
          phone: phone.trim() || undefined,
          wilayahTugas: wilayahTugas.trim(),
          supervisorWorkspaceId: newUid,
          approvalStatus: 'approved',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await addUserAccount(newPengawas);
        setToastMessage(`Akun Pengawas baru "${newPengawas.displayName}" berhasil dibuat! Ruang kerja baru bersih (kosong) dan terhubung ke Firebase.`);
      }

      await loadAllPengawas();
      if (onRefreshData) await onRefreshData();
      setIsAddModalOpen(false);
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Gagal menyimpan akun pengawas.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePengawas = async (p: UserProfile) => {
    if (p.role === 'super_admin' || p.username === 'admin') {
      alert('Akun Super Admin utama tidak dapat dihapus.');
      return;
    }
    if (isKusnandarAccount(p)) {
      alert('Akun Pengawas Utama Kusnandar, M.Si dilindungi dan tidak dapat dihapus agar data supervisi baku tetap terjaga.');
      return;
    }

    const conf = window.confirm(
      `Apakah Anda yakin ingin menghapus akun Pengawas "${p.displayName}" (@${p.username})?\n\nSeluruh data akun pengawas ini akan dibersihkan dari Firebase dan database.`
    );
    if (!conf) return;

    try {
      await deleteUserAccount(p.uid);
      setToastMessage(`Akun Pengawas ${p.displayName} berhasil dihapus.`);
      setTimeout(() => setToastMessage(null), 4000);
      await loadAllPengawas();
      if (onRefreshData) await onRefreshData();
    } catch (err: any) {
      alert('Gagal menghapus akun pengawas: ' + (err.message || ''));
    }
  };

  const copyCredentials = (p: UserProfile) => {
    const text = `KREDENSIAL LOGIN SIKLUS SAMBUNG:\nNama: ${p.displayName}\nUsername: ${p.username}\nPassword: ${p.password || 'bajuri39'}\nRole: Pengawas Sekolah\nAplikasi: https://ais-dev-avq4thyo2p27q5l7wz6t7e-729791157853.asia-southeast1.run.app`;
    navigator.clipboard.writeText(text);
    setCopiedUid(p.uid);
    setTimeout(() => setCopiedUid(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-lg shadow-emerald-100 animate-in slide-in-from-top-4">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-950 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Active Workspace Override Indicator */}
      {activeSupervisorOverride && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-purple-500/30 border border-purple-400/40 flex items-center justify-center text-purple-200">
              <FolderOpen className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-400 text-amber-950">
                  Mode Super Admin Aktif
                </span>
                <span className="text-xs text-purple-200">Sedang melihat workspace supervisi:</span>
              </div>
              <h4 className="text-sm font-bold text-white mt-0.5">
                {activeSupervisorOverride.displayName} ({activeSupervisorOverride.nip || 'NIP Terverifikasi'})
              </h4>
            </div>
          </div>
          <button
            onClick={() => onSelectSupervisorWorkspace(null)}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>Kembali ke Master View</span>
          </button>
        </div>
      )}

      {/* Hero Super Admin Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 text-white p-6 sm:p-8 shadow-xl border border-purple-900/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Akses Super Admin Pusat (Akun: admin / bajuri39)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Pusat Manajemen Akun Pengawas Sekolah
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed">
              Super Admin berwenang mendaftarkan akun baru untuk Pengawas Sekolah. Setiap akun Pengawas baru akan memiliki ruang kerja supervisi mandiri (aplikasi baru yang bersih dan kosong) serta tersambung secara realtime ke Firebase Firestore.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-500/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Tambah Akun Pengawas Baru</span>
            </button>
            <button
              onClick={loadAllPengawas}
              disabled={loading}
              className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-purple-200 text-xs font-bold border border-white/15 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Segarkan</span>
            </button>
          </div>
        </div>

        {/* System Stats Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-purple-800/40">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-purple-300 uppercase tracking-wider font-semibold block">Total Pengawas</span>
            <span className="text-xl sm:text-2xl font-black text-white">{pengawasUsers.filter(u => u.role !== 'super_admin').length}</span>
            <span className="text-[10px] text-purple-300 block mt-0.5">Pengawas Pembina Aktif</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-purple-300 uppercase tracking-wider font-semibold block">Total Guru Supervisi</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400">{supervisions.length}</span>
            <span className="text-[10px] text-purple-300 block mt-0.5">Di Seluruh Pengawas</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-purple-300 uppercase tracking-wider font-semibold block">Satuan Pendidikan</span>
            <span className="text-xl sm:text-2xl font-black text-cyan-400">{schools.length}</span>
            <span className="text-[10px] text-purple-300 block mt-0.5">SMA Terdaftar</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-purple-300 uppercase tracking-wider font-semibold block">Koneksi Database</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-sm font-bold text-white">Firebase Cloud</span>
            </div>
            <span className="text-[10px] text-emerald-300 block mt-0.5">Realtime Multi-Tenant</span>
          </div>
        </div>
      </div>

      {/* Search and Action Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama pengawas, NIP, username, atau wilayah..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-purple-600 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span>Menampilkan <strong className="text-slate-800">{filteredPengawas.length}</strong> akun pengawas</span>
        </div>
      </div>

      {/* Pengawas Accounts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPengawas.map((p) => {
          const isCurrentSuper = p.role === 'super_admin';
          const isKusnandar = isKusnandarAccount(p);
          const supCount = getSupervisionCountFor(p);
          const schCount = getSchoolCountFor(p);
          const isOverrideActive = activeSupervisorOverride?.uid === p.uid;
          const showPass = showPasswordMap[p.uid] || false;

          return (
            <div
              key={p.uid}
              className={`bg-white rounded-3xl p-5 border transition-all flex flex-col justify-between ${
                isOverrideActive
                  ? 'border-purple-500 ring-2 ring-purple-200 shadow-md'
                  : 'border-slate-200 shadow-xs hover:shadow-md hover:border-purple-200'
              }`}
            >
              <div className="space-y-4">
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${
                      isCurrentSuper 
                        ? 'bg-purple-600 text-white shadow-purple-200' 
                        : isKusnandar 
                        ? 'bg-indigo-600 text-white shadow-indigo-200'
                        : 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-teal-200'
                    }`}>
                      {p.displayName.charAt(0) || 'P'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                          isCurrentSuper
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : isKusnandar
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {isCurrentSuper ? 'Super Admin' : isKusnandar ? 'Pengawas Utama' : 'Pengawas Binaan'}
                        </span>
                        {isKusnandar && (
                          <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                            Akun Asli Bawaan
                          </span>
                        )}
                        {!isKusnandar && !isCurrentSuper && (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            Workspace Bersih
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 truncate mt-1" title={p.displayName}>
                        {p.displayName}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-mono truncate">
                        {p.nip ? `NIP. ${p.nip}` : 'NIP belum diisi'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Login Credentials Box */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Username:</span>
                    <span className="font-bold text-slate-800 font-mono">@{p.username || 'admin'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Password:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800 font-mono">
                        {showPass ? (p.password || 'bajuri39') : '••••••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPasswordMap(prev => ({ ...prev, [p.uid]: !prev[p.uid] }))}
                        className="text-slate-400 hover:text-slate-700 p-0.5"
                        title={showPass ? 'Sembunyikan' : 'Tampilkan'}
                      >
                        {showPass ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500 text-[11px]">Wilayah:</span>
                    <span className="text-[11px] text-slate-700 font-medium truncate max-w-[160px]" title={p.wilayahTugas}>
                      {p.wilayahTugas || 'Cabang Dinas Wilayah II'}
                    </span>
                  </div>
                </div>

                {/* Scope Stats */}
                {!isCurrentSuper && (
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
                      <span className="text-[10px] text-indigo-700 block font-semibold">Guru Binaan</span>
                      <span className="text-base font-black text-indigo-900">{supCount} Guru</span>
                      <span className="text-[9px] text-indigo-600 block mt-0.5">
                        {supCount === 0 ? 'Aplikasi Bersih (0)' : 'Supervisi Aktif'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-teal-50/60 border border-teal-100">
                      <span className="text-[10px] text-teal-700 block font-semibold">Sekolah Binaan</span>
                      <span className="text-base font-black text-teal-900">{schCount} Sekolah</span>
                      <span className="text-[9px] text-teal-600 block mt-0.5">Wilayah Tugas</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => copyCredentials(p)}
                    title="Salin Kredensial Login"
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
                  >
                    {copiedUid === p.uid ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 text-[11px]">Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-[11px] hidden sm:inline">Salin Akun</span>
                      </>
                    )}
                  </button>

                  {!isCurrentSuper && (
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(p)}
                      title="Edit Akun Pengawas"
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {!isCurrentSuper && !isKusnandar && (
                    <button
                      type="button"
                      onClick={() => handleDeletePengawas(p)}
                      title="Hapus Akun Pengawas"
                      className="p-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {!isCurrentSuper && (
                  <button
                    type="button"
                    onClick={() => onSelectSupervisorWorkspace(isOverrideActive ? null : p)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isOverrideActive
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200'
                    }`}
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>{isOverrideActive ? 'Sedang Dibuka' : 'Buka Ruang Kerja'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Pengawas Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 text-white flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-purple-400/20 text-purple-200 text-[10px] font-black uppercase mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{editingPengawas ? 'Edit Data Pengawas' : 'Pendaftaran Pengawas Baru'}</span>
                </div>
                <h3 className="font-extrabold text-lg text-white">
                  {editingPengawas ? `Edit Akun: ${editingPengawas.displayName}` : 'Tambah Akun Pengawas Sekolah Baru'}
                </h3>
                <p className="text-xs text-purple-200/80 mt-0.5">
                  Pengawas baru akan memiliki ruang kerja supervisi mandiri yang bersih (0 data) dan tersambung ke Firebase.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-purple-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePengawas} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Informational Guidance */}
              <div className="p-3 rounded-2xl bg-purple-50/80 border border-purple-200 text-[11px] text-purple-900 leading-relaxed space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-purple-950">
                  <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Ketentuan Ruang Kerja Pengawas Baru:</span>
                </div>
                <p>
                  Setelah akun dibuat, Pengawas dapat login menggunakan username dan password yang didaftarkan. Tampilan akun baru akan <strong>bersih (aplikasi baru yang kosong)</strong> sehingga pengawas tersebut dapat mulai mendata sekolah binaan dan guru supervisi mereka sendiri secara mandiri.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap Pengawas &amp; Gelar *
                </label>
                <input
                  type="text"
                  required
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  placeholder="Contoh: Drs. H. Ahmad Sudrajat, M.Pd."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-purple-600 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Username Pengawas *
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: ahmadsudrajat"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-purple-600 bg-white font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Hanya huruf kecil, angka, atau tanda strip (-)</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kata Sandi (Password) *
                  </label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contoh: bajuri39"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-purple-600 bg-white font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Default: bajuri39</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NIP Pengawas
                  </label>
                  <input
                    type="text"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    placeholder="Contoh: 19680512 199403 1 004"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-purple-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No. WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-purple-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat Email Resmi
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Contoh: ahmad@siklus-sambung.sch.id (opsional)"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-purple-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Wilayah Tugas / Binaan
                </label>
                <input
                  type="text"
                  value={wilayahTugas}
                  onChange={(e) => setWilayahTugas(e.target.value)}
                  placeholder="Contoh: Cabang Dinas Wilayah I (Bogor Barat)"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-purple-600 bg-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-200 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan ke Firebase...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingPengawas ? 'Simpan Perubahan' : 'Buat Akun Pengawas'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
