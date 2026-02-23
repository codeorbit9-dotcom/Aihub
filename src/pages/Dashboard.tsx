import React, { useEffect, useState } from 'react';
import { collection, query, limit, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Debate } from '../types';
import { Shield, Trophy, MessageSquare, TrendingUp, Clock, Users } from 'lucide-react';
import { Button } from '../components/Button';
import { Link } from 'react-router-dom';

import { cn } from '../lib/utils';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeDebates, setActiveDebates] = useState<Debate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDebates = async () => {
      try {
        const q = query(collection(db, 'debates'), orderBy('startTime', 'desc'), limit(5));
        const querySnapshot = await getDocs(q);
        const debates = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Debate));
        setActiveDebates(debates);
      } catch (error) {
        console.error('Fetch debates error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDebates();
  }, []);

  const stats = [
    { label: 'Credibility Score', value: user?.credibility || 0, icon: Shield, color: 'text-sky-blue' },
    { label: 'Total Debates', value: (user?.wins || 0) + (user?.losses || 0), icon: MessageSquare, color: 'text-purple-400' },
    { label: 'Wins', value: user?.wins || 0, icon: Trophy, color: 'text-yellow-400' },
    { label: 'Current Level', value: `Lvl ${user?.level || 1}`, icon: TrendingUp, color: 'text-green-400' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user?.username}</h1>
          <p className="text-text-primary/60">Here's your cybersecurity status for today.</p>
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-medium text-text-primary/40">Guardian Level: <span className="text-sky-blue">Sentinel</span></p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-6 cyber-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-primary/60">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={cn("rounded-lg bg-white/5 p-3", stat.color)}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Active Debates */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Active Debates</h2>
            <Link to="/debates" className="text-sm text-sky-blue hover:underline">View all</Link>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-32 w-full animate-pulse rounded-xl bg-white/5" />)
            ) : activeDebates.length > 0 ? (
              activeDebates.map(debate => (
                <div key={debate.id} className="glass-card p-6 transition-all hover:bg-white/5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="rounded-full bg-sky-blue/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-sky-blue">
                        {debate.category}
                      </span>
                      <h3 className="mt-2 text-lg font-bold">{debate.title}</h3>
                      <div className="mt-4 flex items-center gap-4 text-sm text-text-primary/60">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Ends in 2h 45m</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{debate.votesA + debate.votesB} votes</span>
                        </div>
                      </div>
                    </div>
                    <Link to={`/debate/${debate.id}`}>
                      <Button size="sm">Participate</Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-card p-12 text-center">
                <p className="text-text-primary/60">No active debates at the moment.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          {/* Cyber Alert */}
          <div className="glass-card overflow-hidden border-sky-blue/20">
            <div className="bg-sky-blue/10 p-4 border-b border-sky-blue/20">
              <h3 className="flex items-center gap-2 font-bold text-sky-blue">
                <Shield className="h-4 w-4" />
                Weekly Cyber Alert
              </h3>
            </div>
            <div className="p-6">
              <p className="text-sm leading-relaxed text-text-primary/80">
                New phishing campaign targeting Indian banking users via fake "KYC Update" SMS. 
                Always verify the sender and never click on suspicious links.
              </p>
              <Button variant="outline" size="sm" className="mt-4 w-full">Read More</Button>
            </div>
          </div>

          {/* Recent Results */}
          <div className="glass-card p-6">
            <h3 className="font-bold mb-4">Recent Results</h3>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-text-primary/60 truncate max-w-[150px]">Data Privacy Bill 2024</span>
                  <span className="text-success-green font-bold">+50 pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
