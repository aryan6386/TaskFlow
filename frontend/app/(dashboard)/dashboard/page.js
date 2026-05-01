'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';
import StatCard from '../../../components/StatCard';
import Link from 'next/link';

const statusLabel = { todo:'To Do', in_progress:'In Progress', completed:'Completed' };
const priorityLabel = { low:'Low', medium:'Medium', high:'High' };

function formatDate(d) {
  if (!d) return null;
  const date = new Date(d);
  const now = new Date();
  const diff = (date - now) / 86400000;
  if (diff < 0) return { text: 'Overdue', cls: 'due-overdue' };
  if (diff < 3) return { text: `Due in ${Math.ceil(diff)}d`, cls: 'due-soon' };
  return { text: date.toLocaleDateString(), cls: 'due-ok' };
}

export default function DashboardPage() {
  const { token, user } = useAuth();
  const [stats, setStats]       = useState(null);
  const [overdue, setOverdue]   = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      api.get('/api/dashboard/stats', token),
      api.get('/api/dashboard/overdue', token),
    ]).then(([s, o]) => {
      setStats(s);
      setOverdue(o.tasks || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>;

  const cards = [
    { label:'Total Projects', value: stats?.totalProjects ?? 0,   icon:'📁', color:'var(--grad)',  bg:'rgba(99,102,241,0.15)' },
    { label:'Total Tasks',    value: stats?.totalTasks    ?? 0,   icon:'📋', color:'var(--grad2)', bg:'rgba(6,182,212,0.15)' },
    { label:'Completed',      value: stats?.completedTasks ?? 0,  icon:'✅', color:'var(--success)',bg:'rgba(16,185,129,0.15)' },
    { label:'Overdue',        value: stats?.overdueTasks   ?? 0,  icon:'⚠️', color:'var(--danger)', bg:'rgba(239,68,68,0.15)' },
  ];

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <div className="header-row">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back, <strong>{user?.name}</strong> 👋</p>
          </div>
          <span className={`badge badge-${user?.role}`}>{user?.role}</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {cards.map(c => <StatCard key={c.label} {...c} />)}
      </div>

      {/* Overdue Alert */}
      {overdue.length > 0 && (
        <div className="alert-banner alert-danger" style={{marginBottom:24}}>
          ⚠ <strong>{overdue.length} overdue task{overdue.length > 1 ? 's' : ''}</strong> need your attention!
        </div>
      )}

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20}}>
        {/* Recent Tasks */}
        <div className="card">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
            <h3 className="section-title" style={{marginBottom:0}}>Recent Tasks</h3>
            <Link href="/tasks" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          {stats?.recentTasks?.length === 0
            ? <div className="empty-state"><div className="empty-icon">📋</div><p>No tasks yet</p></div>
            : <div style={{display:'flex', flexDirection:'column', gap:10}}>
                {stats?.recentTasks?.map(task => (
                  <div key={task._id} className="task-card">
                    <div className="task-title">{task.title}</div>
                    <div className="task-meta">
                      <span className={`badge badge-${task.status}`}>{statusLabel[task.status]}</span>
                      <span className={`badge badge-${task.priority}`}>{priorityLabel[task.priority]}</span>
                      {task.project && <span style={{fontSize:12, color:'var(--t3)'}}>📁 {task.project.name}</span>}
                    </div>
                    {task.dueDate && (() => { const d = formatDate(task.dueDate); return <div className={d.cls} style={{marginTop:6, fontSize:12}}>🗓 {d.text}</div>; })()}
                  </div>
                ))}
              </div>
          }
        </div>

        {/* Overdue Tasks */}
        <div className="card">
          <h3 className="section-title">Overdue Tasks</h3>
          {overdue.length === 0
            ? <div className="empty-state"><div className="empty-icon">🎉</div><p>No overdue tasks!</p></div>
            : <div style={{display:'flex', flexDirection:'column', gap:10}}>
                {overdue.slice(0,5).map(task => (
                  <div key={task._id} className="task-card">
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                      <div className="task-title">{task.title}</div>
                      <span className="badge badge-overdue">Overdue</span>
                    </div>
                    <div className="task-meta" style={{marginTop:6}}>
                      <span className={`badge badge-${task.priority}`}>{priorityLabel[task.priority]}</span>
                      {task.project && <span style={{fontSize:12, color:'var(--t3)'}}>📁 {task.project.name}</span>}
                      {task.assignee && <span style={{fontSize:12, color:'var(--t3)'}}>👤 {task.assignee.name}</span>}
                    </div>
                    <div className="due-overdue" style={{marginTop:6, fontSize:12}}>
                      🗓 Was due {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>
    </div>
  );
}
