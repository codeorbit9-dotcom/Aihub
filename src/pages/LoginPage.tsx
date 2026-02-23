import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { ShieldAlert } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Reset Password State
  const [isResetting, setIsResetting] = useState(false);
  const [resetStep, setResetStep] = useState<'username' | 'verify'>('username');
  const [resetUsername, setResetUsername] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get email from username
      const q = query(collection(db, 'users'), where('username', '==', resetUsername));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setError('Username not found');
        setLoading(false);
        return;
      }

      const userDoc = querySnapshot.docs[0].data();
      const userEmail = userDoc.email;
      setResetEmail(userEmail);

      // Send verification code
      const response = await fetch('/api/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, type: 'reset' }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset code');
      }

      setResetStep('verify');
    } catch (err: any) {
      setError(err.message || 'Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Verify code
      const verifyRes = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, code: resetCode }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || 'Invalid verification code');
      }

      // Reset password
      const resetRes = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, newPassword }),
      });

      const resetData = await resetRes.json();
      if (!resetRes.ok) {
        throw new Error(resetData.error || 'Failed to reset password');
      }

      alert('Password reset successful! Please login with your new password.');
      setIsResetting(false);
      setResetStep('username');
      setResetUsername('');
      setResetCode('');
      setNewPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (isResetting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-dark px-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 rounded-xl bg-sky-blue flex items-center justify-center mb-6">
              <ShieldAlert className="h-6 w-6 text-primary-blue" />
            </div>
            <h2 className="text-3xl font-bold">Reset Password</h2>
            <p className="mt-2 text-text-primary/60">
              {resetStep === 'username' ? 'Enter your username to receive a code' : 'Enter the code sent to your email'}
            </p>
          </div>

          {resetStep === 'username' ? (
            <form onSubmit={handleSendResetCode} className="glass-card p-8 space-y-6 cyber-glow">
              {error && (
                <div className="rounded-lg bg-danger-red/10 p-3 text-sm text-danger-red border border-danger-red/20">
                  {error}
                </div>
              )}
              <Input
                label="Username"
                type="text"
                placeholder="cyber_guardian"
                value={resetUsername}
                onChange={(e) => setResetUsername(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" isLoading={loading}>
                Send Reset Code
              </Button>
              <div className="text-center">
                <button 
                  type="button" 
                  onClick={() => setIsResetting(false)}
                  className="text-sm text-sky-blue hover:underline"
                >
                  Back to Login
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyAndReset} className="glass-card p-8 space-y-6 cyber-glow">
              {error && (
                <div className="rounded-lg bg-danger-red/10 p-3 text-sm text-danger-red border border-danger-red/20">
                  {error}
                </div>
              )}
              <div className="text-center mb-4">
                <p className="text-sm text-text-primary/80">
                  Code sent to <strong>{resetEmail.replace(/(.{2})(.*)(?=@)/, '$1***')}</strong>
                </p>
              </div>
              <Input
                label="Verification Code"
                type="text"
                placeholder="123456"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                required
                maxLength={6}
              />
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" isLoading={loading}>
                Reset Password
              </Button>
              <div className="text-center">
                <button 
                  type="button" 
                  onClick={() => setResetStep('username')}
                  className="text-sm text-sky-blue hover:underline"
                >
                  Back
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-dark px-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-sky-blue flex items-center justify-center">
              <ShieldAlert className="h-6 w-6 text-primary-blue" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-sky-blue">AIGuardian</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold">Welcome Back</h2>
          <p className="mt-2 text-text-primary/60">Enter your credentials to access the hub</p>
        </div>

        <form onSubmit={handleLogin} className="glass-card p-8 space-y-6 cyber-glow">
          {error && (
            <div className="rounded-lg bg-danger-red/10 p-3 text-sm text-danger-red border border-danger-red/20">
              {error}
            </div>
          )}
          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="space-y-1">
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="text-right">
              <button 
                type="button"
                onClick={() => setIsResetting(true)} 
                className="text-xs text-sky-blue hover:underline"
              >
                Forgot password?
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full" isLoading={loading}>
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-text-primary/60">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-sky-blue hover:underline">
            Join the Hub
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

