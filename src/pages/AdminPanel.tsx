import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Shield, Plus, Users, Flag, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';

const AdminPanel: React.FC = () => {
  const location = useLocation();

  const tabs = [
    { label: 'Overview', path: '/admin', icon: Shield },
    { label: 'Topics', path: '/admin/topics', icon: MessageSquare },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Reports', path: '/admin/reports', icon: Flag },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Control Center</h1>
      </div>

      <div className="flex border-b border-white/10">
        {tabs.map((tab) => (
          <Link
            key={tab.path}
            to={tab.path}
            className={cn(
              "flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2",
              location.pathname === tab.path 
                ? "border-sky-blue text-sky-blue" 
                : "border-transparent text-text-primary/40 hover:text-text-primary"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Link>
        ))}
      </div>

      <Routes>
        <Route path="/" element={<AdminOverview />} />
        <Route path="/topics" element={<AdminTopics />} />
        <Route path="/users" element={<div>User Management (Coming Soon)</div>} />
        <Route path="/reports" element={<div>Report Management (Coming Soon)</div>} />
      </Routes>
    </div>
  );
};

const AdminOverview = () => (
  <div className="grid gap-6 md:grid-cols-4">
    {[
      { label: 'Total Users', value: '1,245', icon: Users },
      { label: 'Active Debates', value: '12', icon: MessageSquare },
      { label: 'Pending Reports', value: '5', icon: Flag },
      { label: 'System Health', value: 'Optimal', icon: Shield },
    ].map((stat, i) => (
      <div key={i} className="glass-card p-6">
        <stat.icon className="h-6 w-6 text-sky-blue mb-4" />
        <p className="text-2xl font-bold">{stat.value}</p>
        <p className="text-xs text-text-primary/40 uppercase tracking-wider">{stat.label}</p>
      </div>
    ))}
  </div>
);

const AdminTopics = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Cybersecurity');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateDebate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'debates'), {
        title,
        category,
        description,
        status: 'active',
        startTime: new Date(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        votesA: 0,
        votesB: 0,
        sideA_user: 'system', // Placeholder or assign real users
        sideB_user: 'system',
      });
      setTitle('');
      setDescription('');
      alert('Debate created successfully!');
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="glass-card p-8">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Plus className="h-5 w-5 text-sky-blue" />
          Create New Debate Topic
        </h3>
        <form onSubmit={handleCreateDebate} className="space-y-4">
          <Input 
            label="Topic Title" 
            placeholder="e.g. Should India implement a national AI ethics board?" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary/70">Category</label>
            <select 
              className="w-full rounded-xl border border-white/10 bg-card-bg px-4 py-2 text-text-primary outline-none focus:border-sky-blue/50"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>Cybersecurity</option>
              <option>India Policy</option>
              <option>AI & Regulation</option>
              <option>Data Privacy</option>
              <option>Digital Sovereignty</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary/70">Description</label>
            <textarea 
              className="w-full h-32 rounded-xl border border-white/10 bg-card-bg px-4 py-2 text-text-primary outline-none focus:border-sky-blue/50"
              placeholder="Provide context for the debate..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" isLoading={loading}>Create Debate</Button>
        </form>
      </div>

      <div className="glass-card p-8">
        <h3 className="text-xl font-bold mb-6">Existing Topics</h3>
        <div className="space-y-4 text-sm text-text-primary/40 italic">
          List of existing topics will appear here...
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
