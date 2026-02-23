import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { ShieldAlert } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

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
          {message && (
            <div className="rounded-lg bg-sky-blue/10 p-3 text-sm text-sky-blue border border-sky-blue/20">
              {message}
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
                onClick={handleForgotPassword} 
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

