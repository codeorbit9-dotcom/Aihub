import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { User } from '../types';
import { Trophy, Medal, Star } from 'lucide-react';
import { cn } from '../lib/utils';

const Leaderboard: React.FC = () => {
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'weekly' | 'monthly' | 'all-time'>('all-time');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'users'), orderBy('credibility', 'desc'), limit(20));
        const querySnapshot = await getDocs(q);
        const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        setTopUsers(users);
      } catch (error) {
        console.error('Fetch leaderboard error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [tab]);

  const topThree = topUsers.slice(0, 3);
  const others = topUsers.slice(3);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Leaderboard</h1>
        <p className="mt-2 text-text-primary/60">The top Cyber Guardians of the hub.</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="flex rounded-xl bg-white/5 p-1">
          {['weekly', 'monthly', 'all-time'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t as any)}
              className={cn(
                "rounded-lg px-6 py-2 text-sm font-bold transition-all uppercase tracking-wider",
                tab === t ? "bg-sky-blue text-primary-blue" : "text-text-primary/60 hover:text-text-primary"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 */}
      <div className="grid gap-8 md:grid-cols-3 items-end pt-10">
        {/* 2nd Place */}
        {topThree[1] && (
          <div className="order-2 md:order-1">
            <div className="glass-card p-6 text-center cyber-glow border-white/10 relative">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                <div className="h-20 w-20 rounded-full bg-slate-400 p-1">
                  <div className="h-full w-full rounded-full bg-bg-dark flex items-center justify-center">
                    <span className="text-2xl font-bold text-slate-400">2</span>
                  </div>
                </div>
              </div>
              <div className="mt-10">
                <h3 className="text-xl font-bold">{topThree[1].username}</h3>
                <p className="text-sky-blue font-bold">{topThree[1].credibility} pts</p>
                <div className="mt-4 flex justify-center gap-2">
                  <Medal className="h-5 w-5 text-slate-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 1st Place */}
        {topThree[0] && (
          <div className="order-1 md:order-2">
            <div className="glass-card p-8 text-center cyber-glow border-sky-blue/50 relative scale-110 z-10">
              <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                <div className="h-24 w-24 rounded-full bg-yellow-400 p-1 shadow-[0_0_30px_rgba(250,204,21,0.4)]">
                  <div className="h-full w-full rounded-full bg-bg-dark flex items-center justify-center">
                    <Trophy className="h-10 w-10 text-yellow-400" />
                  </div>
                </div>
              </div>
              <div className="mt-12">
                <h3 className="text-2xl font-bold">{topThree[0].username}</h3>
                <p className="text-sky-blue text-lg font-bold">{topThree[0].credibility} pts</p>
                <div className="mt-4 flex justify-center gap-2">
                  <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {topThree[2] && (
          <div className="order-3">
            <div className="glass-card p-6 text-center cyber-glow border-white/10 relative">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                <div className="h-20 w-20 rounded-full bg-amber-700 p-1">
                  <div className="h-full w-full rounded-full bg-bg-dark flex items-center justify-center">
                    <span className="text-2xl font-bold text-amber-700">3</span>
                  </div>
                </div>
              </div>
              <div className="mt-10">
                <h3 className="text-xl font-bold">{topThree[2].username}</h3>
                <p className="text-sky-blue font-bold">{topThree[2].credibility} pts</p>
                <div className="mt-4 flex justify-center gap-2">
                  <Medal className="h-5 w-5 text-amber-700" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Others Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-xs font-bold uppercase tracking-wider text-text-primary/40">
            <tr>
              <th className="px-6 py-4">Rank</th>
              <th className="px-6 py-4">Guardian</th>
              <th className="px-6 py-4">Credibility</th>
              <th className="px-6 py-4">Wins</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {others.map((u, i) => (
              <tr key={u.id} className="hover:bg-white/5 transition-all">
                <td className="px-6 py-4 font-bold text-text-primary/40">#{i + 4}</td>
                <td className="px-6 py-4 font-bold">{u.username}</td>
                <td className="px-6 py-4 text-sky-blue font-bold">{u.credibility}</td>
                <td className="px-6 py-4">{u.wins}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
