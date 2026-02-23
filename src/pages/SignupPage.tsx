import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDocs, query, collection, where } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { ShieldAlert } from 'lucide-react';

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check if username is unique
      const q = query(collection(db, 'users'), where('username', '==', username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setError('Username is already taken');
        setLoading(false);
        return;
      }

      // Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email,
        username,
        role: 'user',
        credibility: 100,
        wins: 0,
        losses: 0,
        level: 1,
        createdAt: new Date(),
      });

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
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
          <h2 className="mt-6 text-3xl font-bold">Join the Hub</h2>
          <p className="mt-2 text-text-primary/60">Start your journey as a Cyber Guardian</p>
        </div>

        <form onSubmit={handleSignup} className="glass-card p-8 space-y-4 cyber-glow">
          {error && (
            <div className="rounded-lg bg-danger-red/10 p-3 text-sm text-danger-red border border-danger-red/20">
              {error}
            </div>
          )}
          <Input
            label="Username"
            type="text"
            placeholder="cyber_guardian"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full mt-4" isLoading={loading}>
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-text-primary/60">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-sky-blue hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;

