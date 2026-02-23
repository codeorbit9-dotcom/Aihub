import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, MessageSquare, Trophy, Users, ArrowRight, Sun, Moon } from 'lucide-react';
import { Button } from '../components/Button';
import { motion } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

const LandingPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-bg-dark text-text-primary overflow-x-hidden transition-colors duration-300">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-black/5 dark:border-white/10 bg-bg-dark/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-sky-blue flex items-center justify-center">
              <ShieldAlert className="h-5 w-5 text-primary-blue" />
            </div>
            <span className="text-xl font-bold tracking-tight text-sky-blue">AIGuardian</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link to="/debates" className="text-sm font-medium text-text-primary/70 hover:text-sky-blue">Live Debates</Link>
            <Link to="/leaderboard" className="text-sm font-medium text-text-primary/70 hover:text-sky-blue">Leaderboard</Link>
            <Link to="/about" className="text-sm font-medium text-text-primary/70 hover:text-sky-blue">About</Link>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 text-text-primary/70 hover:text-sky-blue transition-colors">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link to="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">Join the Hub</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.1),transparent_50%)]" />
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl font-extrabold tracking-tight md:text-7xl">
              Debate. <span className="text-sky-blue">Defend.</span> Decide.
            </h1>
            <p className="mt-6 text-xl text-text-primary/60 md:text-2xl">
              India's structured cybersecurity and policy debate platform. 
              Engage in high-stakes discussions on digital sovereignty and AI regulation.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="px-8">Get Started <ArrowRight className="ml-2 h-5 w-5" /></Button>
              </Link>
              <Link to="/debates">
                <Button variant="outline" size="lg" className="px-8">View Live Debates</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats/Preview Section */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: MessageSquare, label: 'Active Debates', value: '12' },
              { icon: Users, label: 'Guardians Joined', value: '1.2k+' },
              { icon: Trophy, label: 'Total Votes', value: '45k+' },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-8 text-center cyber-glow">
                <stat.icon className="mx-auto h-10 w-10 text-sky-blue" />
                <h3 className="mt-4 text-3xl font-bold">{stat.value}</h3>
                <p className="text-text-primary/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-white/5">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold md:text-4xl">How It Works</h2>
          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {[
              { step: '01', title: 'Choose a Side', desc: 'Browse active topics and join the side you believe in.' },
              { step: '02', title: 'Present Your Argument', desc: 'Structured rounds for opening, rebuttal, and closing statements.' },
              { step: '03', title: 'Community Votes', desc: 'The hub decides the winner based on logic and evidence.' },
            ].map((item, i) => (
              <div key={i} className="relative">
                <span className="text-6xl font-black text-sky-blue/10 absolute -top-10 -left-4">{item.step}</span>
                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-text-primary/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="mx-auto max-w-7xl grid gap-8 md:grid-cols-4">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-sky-blue flex items-center justify-center">
                <ShieldAlert className="h-4 w-4 text-primary-blue" />
              </div>
              <span className="text-lg font-bold tracking-tight text-sky-blue">AIGuardian</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-text-primary/60">
              Securing India's digital future through structured discourse and policy awareness.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-text-primary/60">
              <li><Link to="/debates" className="hover:text-sky-blue">Live Debates</Link></li>
              <li><Link to="/leaderboard" className="hover:text-sky-blue">Leaderboard</Link></li>
              <li><Link to="/categories" className="hover:text-sky-blue">Categories</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-text-primary/60">
              <li><Link to="/privacy" className="hover:text-sky-blue">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-sky-blue">Terms of Service</Link></li>
              <li><Link to="/guidelines" className="hover:text-sky-blue">Community Guidelines</Link></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto max-w-7xl mt-12 pt-8 border-t border-white/5 text-center text-xs text-text-primary/40">
          © 2026 AIGuardian Hub. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
