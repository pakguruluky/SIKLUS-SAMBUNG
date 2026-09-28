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
  Sparkles
} from 'lucide-react';
import { School, Role, UserProfile } from '../types';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, saveUserProfile, getUserProfile } from '../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  schools: School[];
  onAuthSuccess: (profile: UserProfile) => void;
  onQuickDemoLogin: (role: Role) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  schools,
  onAuthSuccess,
  onQuickDemoLogin,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
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
        if (role !== 'admin' && !schoolId) {
          throw new Error('Harap pilih sekolah tempat Anda bertugas.');
        }

        const res = await createUserWithEmailAndPassword(auth, email, password);
        const selectedSchool = schools.find(s => s.id === schoolId);

        // Auto-assign admin if user matches official supervisor email
        const finalRole: Role = (email.toLowerCase() === 'pakguruluky@gmail.com') ? 'admin' : role;

        const newProfile: UserProfile = {
          uid: res.user.uid,
          email: res.user.email || email,
          displayName: displayName || (finalRole === 'admin' ? 'H. Kusnandar, M.Si.' : 'Pengguna Baru'),
          role: finalRole,
          schoolId: finalRole === 'admin' ? undefined : schoolId,
          schoolName: finalRole === 'admin' ? undefined : selectedSchool?.name,
          nip: nip || undefined,
          phone: phone || undefined,
          subject: finalRole === 'guru' ? subject : undefined,
          createdAt: new Date().toISOString(),
        };

        await saveUserProfile(newProfile);
        onAuthSuccess(newProfile);
        onClose();
      } else {
        // Login
        const res = await signInWithEmailAndPassword(auth, email, password);
        let profile = await getUserProfile(res.user.uid);

        if (!profile) {
          // Fallback initial profile
          const isAdminEmail = res.user.email?.toLowerCase() === 'pakguruluky@gmail.com';
          profile = {
            uid: res.user.uid,
            email: res.user.email || '',
            displayName: res.user.displayName || (isAdminEmail ? 'H. Kusnandar, M.Si.' : 'Pengguna SIKLUS SAMBUNG'),
            role: isAdminEmail ? 'admin' : 'guru',
            createdAt: new Date().toISOString(),
          };
          await saveUserProfile(profile);
        }
        onAuthSuccess(profile);
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      let msg = err.message || 'Terjadi kesalahan autentikasi.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        msg = 'Email atau kata sandi tidak cocok.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'Email ini sudah terdaftar. Silakan login.';
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
      const isAdminEmail = res.user.email?.toLowerCase() === 'pakguruluky@gmail.com';

      if (!profile) {
        profile = {
          uid: res.user.uid,
          email: res.user.email || '',
          displayName: res.user.displayName || (isAdminEmail ? 'H. Kusnandar, M.Si.' : 'Guru SIKLUS SAMBUNG'),
          role: isAdminEmail ? 'admin' : 'guru',
          createdAt: new Date().toISOString(),
        };
        await saveUserProfile(profile);
      }
      onAuthSuccess(profile);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Gagal masuk dengan Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-800 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1 rounded-full text-indigo-200 hover:text-white hover:bg-indigo-600/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-amber-300">
              SIKLUS SAMBUNG SMA
            </span>
          </div>
          <h2 className="text-2xl font-bold">
            {isRegister ? 'Pendaftaran Akun Baru' : 'Masuk ke Sistem'}
          </h2>
          <p className="text-xs text-indigo-100 mt-1">
            {isRegister 
              ? 'Lengkapi profil pengawas, kepala sekolah, atau guru.'
              : 'Silakan masuk menggunakan akun terdaftar Anda.'}
          </p>

          {/* Tab switcher */}
          <div className="flex bg-indigo-900/50 p-1 rounded-xl mt-4">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setErrorMessage(''); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                !isRegister ? 'bg-white text-indigo-700 shadow-xs' : 'text-indigo-200 hover:text-white'
              }`}
            >
              Masuk (Login)
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setErrorMessage(''); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                isRegister ? 'bg-white text-indigo-700 shadow-xs' : 'text-indigo-200 hover:text-white'
              }`}
            >
              Daftar Baru (Registrasi)
            </button>
          </div>
        </div>

        {/* Body Form */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                {/* Role Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Peran / Status Pengguna
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('guru')}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                        role === 'guru'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>Guru</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('kepsek')}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                        role === 'kepsek'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Kepala Sekolah</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('admin')}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                        role === 'admin'
                          ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Pengawas</span>
                    </button>
                  </div>
                </div>

                {/* Display Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap &amp; Gelar
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Contoh: Dra. Hj. Siti Rohmah, M.Pd."
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-indigo-600"
                    />
                  </div>
                </div>

                {/* School Selection (Required for Guru & Kepsek) */}
                {role !== 'admin' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Asal Satuan Pendidikan SMA
                    </label>
                    <select
                      required
                      value={schoolId}
                      onChange={(e) => setSchoolId(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-indigo-600 bg-white"
                    >
                      <option value="">-- Pilih SMA yang terdaftar --</option>
                      {schools.map((sch) => (
                        <option key={sch.id} value={sch.id}>
                          {sch.name} (NPSN: {sch.npsn})
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-500 mt-1">
                      *Catatan: Guru hanya dapat mendaftar jika sekolah sudah didaftarkan oleh Pengawas.
                    </p>
                  </div>
                )}

                {/* Additional Fields for Guru */}
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
                        placeholder="Contoh: Matematika"
                        className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        NIP / NUPTK
                      </label>
                      <input
                        type="text"
                        value={nip}
                        onChange={(e) => setNip(e.target.value)}
                        placeholder="198204..."
                        className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-indigo-600"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Email & Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@sekolah.sch.id"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-indigo-600"
                />
              </div>
            </div>

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
                  placeholder="Minimal 6 karakter"
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

          {/* Instant Simulation Mode Switcher */}
          <div className="mt-5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Simulasi Cepat 1-Klik (Tanpa Password):</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => { onQuickDemoLogin('admin'); onClose(); }}
                className="py-1.5 px-2 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 text-[11px] font-semibold transition-colors"
              >
                Pengawas
              </button>
              <button
                type="button"
                onClick={() => { onQuickDemoLogin('kepsek'); onClose(); }}
                className="py-1.5 px-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-[11px] font-semibold transition-colors"
              >
                Kepsek
              </button>
              <button
                type="button"
                onClick={() => { onQuickDemoLogin('guru'); onClose(); }}
                className="py-1.5 px-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-900 text-[11px] font-semibold transition-colors"
              >
                Guru SMA
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
