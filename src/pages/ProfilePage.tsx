import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { User, Debate } from '../types';
import { Shield, Trophy, Target, Award, AlertTriangle } from 'lucide-react';
import { Button } from '../components/Button';
import { cn } from '../lib/utils';

const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userDebates, setUserDebates] = useState<Debate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;
      
      try {
        const q = query(collection(db, 'users'), where('username', '==', username), limit(1));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userData = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as User;
          setProfileUser(userData);
          
          // Fetch user's debates
          const dq = query(
            collection(db, 'debates'), 
            where('sideA_user', '==', userData.id),
            limit(10)
          );
          const dSnap = await getDocs(dq);
          const debates = dSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Debate));
          setUserDebates(debates);
        }
      } catch (error) {
        console.error('Fetch profile error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) return <div className="flex h-96 items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-blue border-t-transparent" /></div>;
  if (!profileUser) return <div className="text-center py-20">User not found</div>;

  const getLevelBadge = (level: number) => {
    if (level >= 20) return { label: 'Sentinel', color: 'text-purple-400', bg: 'bg-purple-400/10' };
    if (level >= 10) return { label: 'Cyber Guardian', color: 'text-sky-blue', bg: 'bg-sky-blue/10' };
    if (level >= 5) return { label: 'Defender', color: 'text-green-400', bg: 'bg-green-400/10' };
    return { label: 'Observer', color: 'text-text-primary/60', bg: 'bg-white/5' };
  };

  const badge = getLevelBadge(profileUser.level);
  const winRate = profileUser.wins + profileUser.losses === 0 
    ? 0 
    : Math.round((profileUser.wins / (profileUser.wins + profileUser.losses)) * 100);

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="glass-card p-8 cyber-glow relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
          <Button variant="ghost" size="sm" className="text-danger-red hover:bg-danger-red/10">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Report User
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div className="h-32 w-32 rounded-full bg-gradient-to-br from-sky-blue to-primary-blue p-1">
              <div className="h-full w-full rounded-full bg-bg-dark flex items-center justify-center overflow-hidden">
                <UserIcon className="h-20 w-20 text-sky-blue/50" />
              </div>
            </div>
            <div className={cn("absolute -bottom-2 -right-2 rounded-lg px-3 py-1 text-[10px] font-bold uppercase", badge.bg, badge.color)}>
              {badge.label}
            </div>
          </div>
          
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold">{profileUser.username}</h1>
            <div className="mt-2 flex flex-wrap items-center justify-center md:justify-start gap-4">
              <div className="flex items-center gap-1.5 text-sky-blue">
                <Shield className="h-4 w-4" />
                <span className="font-bold">{profileUser.credibility} Credibility</span>
              </div>
              <div className="h-1 w-1 rounded-full bg-white/20" />
              <div className="text-text-primary/60">Joined {new Date(profileUser.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-4">
        {[
          { icon: Trophy, label: 'Wins', value: profileUser.wins, color: 'text-yellow-400' },
          { icon: Target, label: 'Losses', value: profileUser.losses, color: 'text-danger-red' },
          { icon: Award, label: 'Win Rate', value: `${winRate}%`, color: 'text-green-400' },
          { icon: Shield, label: 'Participation', value: profileUser.wins + profileUser.losses, color: 'text-sky-blue' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 text-center">
            <stat.icon className={cn("mx-auto h-6 w-6 mb-2", stat.color)} />
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-text-primary/60 uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* History */}
      <div className="glass-card p-8">
        <h2 className="text-xl font-bold mb-6">Debate History</h2>
        <div className="space-y-4">
          {userDebates.length > 0 ? (
            userDebates.map(debate => (
              <div key={debate.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-sky-blue/30 transition-all">
                <div>
                  <h4 className="font-bold">{debate.title}</h4>
                  <p className="text-xs text-text-primary/40 mt-1">{debate.category} • {debate.status}</p>
                </div>
                <div className="text-right">
                  <div className={cn(
                    "text-sm font-bold",
                    debate.winner === profileUser.id ? "text-success-green" : "text-danger-red"
                  )}>
                    {debate.winner === profileUser.id ? 'WON' : 'LOST'}
                  </div>
                  <p className="text-[10px] text-text-primary/40 mt-1">{debate.votesA + debate.votesB} Total Votes</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center py-10 text-text-primary/40 italic">No debate history found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

export default ProfilePage;
