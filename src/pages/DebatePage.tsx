import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment, collection, addDoc, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Debate, Argument } from '../types';
import { Button } from '../components/Button';
import { Clock, Users, Shield, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const DebatePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [debate, setDebate] = useState<Debate | null>(null);
  const [argumentsList, setArgumentsList] = useState<Argument[]>([]);
  const [loading, setLoading] = useState(true);
  const [newArgument, setNewArgument] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);

  useEffect(() => {
    if (!id) return;

    const fetchDebate = async () => {
      try {
        const docRef = doc(db, 'debates', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDebate({ id: docSnap.id, ...docSnap.data() } as Debate);
        } else {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Fetch debate error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDebate();

    // Listen for arguments
    const q = query(collection(db, 'arguments'), where('debateId', '==', id), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const args = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Argument));
      setArgumentsList(args);
      
      // Determine current round based on arguments count
      const count = args.length;
      if (count < 2) setCurrentRound(1);
      else if (count < 4) setCurrentRound(2);
      else setCurrentRound(3);
    });

    return () => unsubscribe();
  }, [id, navigate]);

  const handleVote = async (side: 'A' | 'B') => {
    if (!id || !user || hasVoted) return;

    try {
      const debateRef = doc(db, 'debates', id);
      await updateDoc(debateRef, {
        [side === 'A' ? 'votesA' : 'votesB']: increment(1)
      });
      
      // Also record the vote in a 'votes' collection to prevent double voting
      await addDoc(collection(db, 'votes'), {
        debateId: id,
        voterId: user.id,
        side,
        createdAt: new Date()
      });

      setHasVoted(true);
      
      // Award points for voting
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        credibility: increment(5)
      });
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  const submitArgument = async () => {
    if (!id || !user || !newArgument.trim() || !debate) return;

    // AI Moderation Placeholder
    const isClean = await simulateAIModeration(newArgument);
    if (!isClean) {
      alert('Your argument was flagged by AI moderation for policy violations.');
      return;
    }

    const isSideA = debate.sideA_user === user.id;
    const isSideB = debate.sideB_user === user.id;
    
    if (!isSideA && !isSideB) return;

    const side = isSideA ? 'A' : 'B';
    
    const existing = argumentsList.find(a => a.round === currentRound && a.side === side);
    if (existing) {
      alert('You have already submitted your argument for this round.');
      return;
    }

    try {
      await addDoc(collection(db, 'arguments'), {
        debateId: id,
        userId: user.id,
        side,
        round: currentRound,
        content: newArgument,
        createdAt: new Date()
      });
      setNewArgument('');
      
      // Award points for participation
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        credibility: increment(10)
      });
    } catch (err) {
      console.error('Error submitting argument:', err);
    }
  };

  const simulateAIModeration = async (text: string) => {
    // In a real app, this would call a Gemini API or a moderation endpoint
    console.log('Moderating text:', text);
    const prohibited = ['abuse', 'hate', 'target'];
    return !prohibited.some(word => text.toLowerCase().includes(word));
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-blue border-t-transparent" /></div>;
  if (!debate) return null;

  const totalVotes = debate.votesA + debate.votesB;
  const percentA = totalVotes === 0 ? 50 : Math.round((debate.votesA / totalVotes) * 100);
  const percentB = 100 - percentA;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-card p-8 cyber-glow">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="rounded-full bg-sky-blue/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-blue">
              {debate.category}
            </span>
            <h1 className="mt-4 text-3xl font-bold">{debate.title}</h1>
            <p className="mt-2 text-text-primary/60">{debate.description}</p>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex flex-col items-center">
              <Clock className="h-5 w-5 text-sky-blue" />
              <span className="mt-1 font-bold">2h 45m</span>
            </div>
            <div className="flex flex-col items-center">
              <Users className="h-5 w-5 text-purple-400" />
              <span className="mt-1 font-bold">{totalVotes}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Debate Arena */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Side A */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-sky-blue">Side A: Pro-Policy</h3>
            {debate.sideA_user === user?.id && <span className="text-xs font-bold text-success-green">YOUR SIDE</span>}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(round => {
              const arg = argumentsList.find(a => a.side === 'A' && a.round === round);
              return (
                <div key={round} className={cn(
                  "glass-card p-6 border-l-4",
                  arg ? "border-sky-blue" : "border-white/5 opacity-50"
                )}>
                  <p className="text-xs font-bold text-text-primary/40 uppercase mb-2">Round {round}: {round === 1 ? 'Opening' : round === 2 ? 'Rebuttal' : 'Closing'}</p>
                  {arg ? (
                    <p className="text-text-primary/90 leading-relaxed">{arg.content}</p>
                  ) : (
                    <p className="italic text-text-primary/30">Waiting for argument...</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Side B */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-danger-red">Side B: Counter-Policy</h3>
            {debate.sideB_user === user?.id && <span className="text-xs font-bold text-success-green">YOUR SIDE</span>}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(round => {
              const arg = argumentsList.find(a => a.side === 'B' && a.round === round);
              return (
                <div key={round} className={cn(
                  "glass-card p-6 border-r-4",
                  arg ? "border-danger-red" : "border-white/5 opacity-50"
                )}>
                  <p className="text-xs font-bold text-text-primary/40 uppercase mb-2 text-right">Round {round}: {round === 1 ? 'Opening' : round === 2 ? 'Rebuttal' : 'Closing'}</p>
                  {arg ? (
                    <p className="text-text-primary/90 leading-relaxed text-right">{arg.content}</p>
                  ) : (
                    <p className="italic text-text-primary/30 text-right">Waiting for argument...</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Participation/Voting Section */}
      <div className="glass-card p-8 cyber-glow border-sky-blue/20">
        {(debate.sideA_user === user?.id || debate.sideB_user === user?.id) ? (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Submit Your Round {currentRound} Argument</h3>
            <textarea
              className="w-full h-32 rounded-xl border border-white/10 bg-bg-dark p-4 text-text-primary outline-none focus:border-sky-blue/50"
              placeholder="Present your case (max 200 characters)..."
              maxLength={currentRound === 3 ? 150 : 200}
              value={newArgument}
              onChange={(e) => setNewArgument(e.target.value)}
            />
            <div className="flex justify-end">
              <Button onClick={submitArgument} className="gap-2">
                <Send className="h-4 w-4" />
                Post Argument
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold">Cast Your Vote</h3>
              <p className="text-text-primary/60">Who presented the more compelling cybersecurity case?</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Button 
                variant={hasVoted ? 'outline' : 'primary'} 
                className="h-20 text-xl"
                onClick={() => handleVote('A')}
                disabled={hasVoted}
              >
                Vote Side A
              </Button>
              <Button 
                variant={hasVoted ? 'outline' : 'danger'} 
                className="h-20 text-xl"
                onClick={() => handleVote('B')}
                disabled={hasVoted}
              >
                Vote Side B
              </Button>
            </div>

            {hasVoted && (
              <div className="space-y-4">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-sky-blue">Side A: {percentA}%</span>
                  <span className="text-danger-red">Side B: {percentB}%</span>
                </div>
                <div className="h-4 w-full overflow-hidden rounded-full bg-white/5 flex">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentA}%` }}
                    className="h-full bg-sky-blue"
                  />
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentB}%` }}
                    className="h-full bg-danger-red"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DebatePage;
