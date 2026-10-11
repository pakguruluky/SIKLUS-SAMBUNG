import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Building2, 
  Briefcase, 
  GraduationCap, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { School, Role, UserProfile } from '../types';
import { 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, saveUserProfile, getUserProfile, authenticateRealUser } from '../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  schools: School[];
  onAuthSuccess: (profile: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  schools,
  onAuthSuccess,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<Role>('guru');
  const [schoolId, setSchoolId] = useState('');
  const [nip, setNip] = useState('');
  const [subject, setSubject] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      if (isRegister) {
        if (role !== 'admin' && role !== 'pengawas' && !schoolId) {
          throw new Error('Harap pilih sekolah tempat Anda bertugas.');
        }

        const email = identifier.includes('@') ? identifier : `${identifier}@siklus-sambung.sch.id`;
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const selectedSchool = schools.find(s => s.id === schoolId);

        const finalRole: Role = (identifier.toLowerCase() === 'pengawas' || email.toLowerCase() === 'pengawas@siklus-sambung.sch.id') 
          ? 'admin' 
          : role;

        const newProfile: UserProfile = {
          uid: res.user.uid,
          username: identifier.includes('@') ? identifier.split('@')[0] : identifier,
          password,
          email: res.user.email || email,
          displayName: displayName || (finalRole === 'admin' ? 'Kusnandar, M.Si' : 'Pengguna Baru'),
          role: finalRole,
          schoolId: (finalRole === 'admin' || finalRole === 'pengawas') ? undefined : schoolId,
          schoolName: (finalRole === 'admin' || finalRole === 'pengawas') ? undefined : selectedSchool?.name,
          nip: nip || undefined,
          phone: phone || undefined,
          subject: finalRole === 'guru' ? subject : undefined,
          createdAt: new Date().toISOString(),
        };

        await saveUserProfile(newProfile);
        onAuthSuccess(newProfile);
        onClose();
      } else {
        // Real user login with username or email
        const profile = await authenticateRealUser(identifier, password);
        onAuthSuccess(profile);
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      let msg = err.message || 'Terjadi kesalahan autentikasi.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        msg = 'Username / email atau kata sandi tidak cocok.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'Email/Username ini sudah terdaftar. Silakan login.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Kata sandi minimal 6 karakter.';
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);

      let profile = await getUserProfile(res.user.uid);
      const isAdminEmail = res.user.email?.toLowerCase().includes('kusnandar') || res.user.email?.toLowerCase() === 'pakguruluky@gmail.com';

      if (!profile) {
        profile = {
          uid: res.user.uid,
          username: res.user.email?.split('@')[0] || 'pengguna',
          email: res.user.email || '',
          displayName: res.user.displayName || (isAdminEmail ? 'Kusnandar, M.Si' : 'Guru SIKLUS SAMBUNG'),
          role: isAdminEmail ? 'admin' : 'guru',
          createdAt: new Date().toISOString(),
        };
        await saveUserProfile(profile);
      }
      onAuthSuccess(profile);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Gagal masuk dengan Google: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="relative bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 p-6 text-white text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-indigo-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center mx-auto mb-3 text-indigo-300 shadow-inner">
            <GraduationCap className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-bold tracking-tight">
            {isRegister ? 'Daftar Akun Baru' : 'Masuk ke SIKLUS SAMBUNG'}
          </h2>
          <p className="text-xs text-indigo-200/80 mt-1">
            Sistem Informasi Supervisi Akademik & Transformasi Guru SMA
          </p>


        </div>

        {/* Modal Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Mode Switcher */}
          <div className="flex p-1 rounded-xl bg-slate-100 mb-5">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setErrorMessage(''); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                !isRegister
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Masuk (Login)
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setErrorMessage(''); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                isRegister
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Registrasi
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                {/* Role selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Peran / Jabatan
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('guru')}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                        role === 'guru'
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Guru Mapel
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('kepsek')}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                        role === 'kepsek'
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Kepala Sekolah
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('admin')}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                        role === 'admin'
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Pengawas
                    </button>
                  </div>
                </div>

                {/* Full name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap & Gelar
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Contoh: Sondang Asih Januarti, S.Pd."
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-indigo-600"
                    />
                  </div>
                </div>

                {/* School Selection for Non-admin */}
                {role !== 'admin' && role !== 'pengawas' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Satuan Pendidikan (Sekolah Binaan)
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <select
                        required
                        value={schoolId}
                        onChange={(e) => setSchoolId(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-indigo-600 appearance-none bg-white"
                      >
                        <option value="">-- Pilih Satuan Pendidikan --</option>
                        {schools.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Additional Teacher fields */}
                {role === 'guru' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Mata Pelajaran
                      </label>
                      <input
                        type="text"
                        required
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Contoh: Fisika"
                        className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        NIP (Opsional)
                      </label>
                      <input
                        type="text"
                        value={nip}
                        onChange={(e) => setNip(e.target.value)}
                        placeholder="18 digit NIP"
                        className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-indigo-600"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Username or Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isRegister ? 'Alamat Email / Username' : 'Username atau Alamat Email'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type={isRegister ? 'text' : 'text'}
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={isRegister ? 'pengawas atau nama@sekolah.sch.id' : 'Contoh: pengawas atau email Anda'}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-indigo-600"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-indigo-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block animate-spin mr-2">⏳</span>
              ) : null}
              <span>{isRegister ? 'Daftar Sekarang' : 'Masuk Aplikasi'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Google Sign In option */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Lanjutkan dengan Akun Google</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
