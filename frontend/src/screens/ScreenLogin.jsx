import React, { useState } from 'react';
import {
  User,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  ShieldCheck,
  Sprout,
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { loginWithUsernameOrEmail, registerUser, isFirebaseConfigured } from '../services/firebase';

export default function ScreenLogin({ onLoginSuccess }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleDemoFill = () => {
    setUsername('gorakhpur_farmer');
    setEmail('farmer@agrinexus.gov.in');
    setPassword('farmer123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isRegisterMode) {
        if (!username.trim()) {
          throw new Error('Please enter a username.');
        }
        if (!email.trim() || !email.includes('@')) {
          throw new Error('Please enter a valid email address.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }

        const user = await registerUser(username, email, password);
        setSuccessMsg('Account created successfully! Logging you in...');
        setTimeout(() => {
          onLoginSuccess(user);
        }, 800);
      } else {
        const identifier = username || email;
        if (!identifier.trim()) {
          throw new Error('Please enter your username or email address.');
        }
        if (!password) {
          throw new Error('Please enter your password.');
        }

        const user = await loginWithUsernameOrEmail(identifier, password);
        onLoginSuccess(user);
      }
    } catch (err) {
      console.error('Auth error:', err);
      let msg = err.message || 'Authentication failed.';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/user-not-found')) {
        msg = 'Invalid credentials. Please check your username/email and password.';
      } else if (msg.includes('auth/email-already-in-use')) {
        msg = 'This email is already registered. Please login instead.';
      } else if (msg.includes('auth/configuration-not-found')) {
        msg = 'Firebase Auth is disabled in your Firebase Console. Go to Firebase Console > Authentication > Sign-in method and enable "Email/Password".';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Dynamic Background Glows */}
      <div className="absolute -top-24 -left-20 w-80 h-80 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-20 w-80 h-80 bg-amber-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="z-10 text-center mt-4">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl mb-3 shadow-lg shadow-emerald-900/20">
          <Sprout className="w-9 h-9 text-emerald-400 animate-bounce" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
          AgriNexus AI
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Data-Driven Agricultural Intelligence Platform
        </p>
      </div>

      {/* Auth Card */}
      <div className="z-10 my-auto w-full max-w-md mx-auto bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">
              {isRegisterMode ? 'Create Account' : 'Farmer Login'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRegisterMode
                ? 'Register to access personalized farm intelligence'
                : 'Enter your credentials to manage your parcel'}
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isFirebaseConfigured ? 'Firebase Auth' : 'Demo Auth'}</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-start gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Input */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Username {isRegisterMode ? '' : 'or Email'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={isRegisterMode ? 'e.g. gorakhpur_farmer' : 'Username or farmer@agrinexus.gov.in'}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Email Input (only during registration) */}
          {isRegisterMode && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="farmer@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>
          )}

          {/* Password Input */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all transform active:scale-98 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-slate-950 border-t-transparent" />
            ) : isRegisterMode ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Account</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to Dashboard</span>
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-5 text-center text-xs text-slate-400 pt-4 border-t border-slate-800/80">
          {isRegisterMode ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(false);
                  setError('');
                }}
                className="text-emerald-400 hover:underline font-semibold ml-1"
              >
                Log In
              </button>
            </p>
          ) : (
            <p>
              New to AgriNexus?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(true);
                  setError('');
                }}
                className="text-emerald-400 hover:underline font-semibold ml-1"
              >
                Register Account
              </button>
            </p>
          )}
        </div>

        {/* Quick Demo Autofill Button */}
        <div className="mt-4 pt-3 text-center">
          <button
            type="button"
            onClick={handleDemoFill}
            className="inline-flex items-center gap-1.5 text-xs text-amber-400/90 hover:text-amber-300 bg-amber-950/40 hover:bg-amber-900/40 border border-amber-500/30 px-3 py-1.5 rounded-lg transition-all"
          >
            <span>Autofill Demo Credentials</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="z-10 text-center text-xs text-slate-500 py-2">
        Integrated with Firebase Auth & ICAR Grounded Agronomy Engine
      </div>
    </div>
  );
}
