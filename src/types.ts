export interface User {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  credibility: number;
  wins: number;
  losses: number;
  createdAt: any;
  level: number;
}

export interface Debate {
  id: string;
  title: string;
  category: string;
  status: 'active' | 'completed' | 'upcoming';
  startTime: any;
  endTime: any;
  sideA_user?: string;
  sideB_user?: string;
  winner?: string;
  votesA: number;
  votesB: number;
  description: string;
}

export interface Argument {
  id: string;
  debateId: string;
  round: 1 | 2 | 3;
  side: 'A' | 'B';
  content: string;
  userId: string;
  createdAt: any;
}

export interface Vote {
  debateId: string;
  voterId: string;
  side: 'A' | 'B';
}

export interface Report {
  id: string;
  reporterId: string;
  targetId: string;
  reason: string;
  status: 'pending' | 'resolved' | 'ignored';
  timestamp: any;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'debate_start' | 'vote_received' | 'win' | 'loss' | 'alert';
  message: string;
  read: boolean;
  createdAt: any;
}
