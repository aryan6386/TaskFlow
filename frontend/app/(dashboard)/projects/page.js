'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';
import Modal from '../../../components/Modal';

const statusColors = { active:'badge-active', on_hold:'badge-on_hold', completed:'badge-completed' };
const statusLabels = { active:'Active', on_hold:'On Hold', completed:'Completed' };

export default function ProjectsPage() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name:'', description:'', status:'active' });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const load = async () => {
    try {
      const d = await api.get('/api/projects', token);
      setProjects(d.projects || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (token) load(); }, [token]);

  const handleCreate = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      const d = await api.post('/api/projects', form, token);
      setProjects(prev => [d.project, ...prev]);
      setShowModal(false); setForm({ name:'', description:'', status:'active' });
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>;

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <div className="header-row">
          <div>
            <h1>Projects</h1>
            <p>{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
          </div>
          {user?.role === 'admin' && (
            <button id="create-project-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
              + New Project
            </button>
          )}
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h3>No Projects Yet</h3>
          <p>{user?.role === 'admin' ? 'Create your first project to get started.' : 'You have not been added to any projects yet.'}</p>
        </div>
      ) : (
        <div className="grid-2">
          {projects.map(p => {
            const pct = p.taskCount > 0 ? Math.round((p.completedCount / p.taskCount) * 100) : 0;
            return (
              <div key={p._id} className="project-card" onClick={() => router.push(`/projects/${p._id}`)} role="button" tabIndex={0}>
                <div className="project-card-top">
                  <div>
                    <div className="project-name">{p.name}</div>
                    <div className="project-desc">{p.description || 'No description'}</div>
                  </div>
                  <span className={`badge ${statusColors[p.status]}`} style={{marginLeft:10, flexShrink:0}}>
                    {statusLabels[p.status]}
                  </span>
                </div>
                <div>
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--t2)', marginBottom:6}}>
                    <span>Progress</span>
                    <span>{p.completedCount}/{p.taskCount} tasks</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width:`${pct}%`}} />
                  </div>
                </div>
                <div className="project-meta">
                  <div className="members-stack">
                    {(p.members || []).slice(0,4).map(m => (
                      <div key={m._id} className="member-avatar-sm" title={m.name}>
                        {m.name?.[0]?.toUpperCase()}
                      </div>
                    ))}
                    {p.members?.length > 4 && <div className="member-avatar-sm">+{p.members.length - 4}</div>}
                  </div>
                  <span>{p.members?.length || 0} member{p.members?.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <Modal title="Create New Project" onClose={() => setShowModal(false)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" form="create-project-form" type="submit" disabled={saving} id="submit-project">
              {saving ? 'Creating…' : 'Create Project'}
            </button>
          </>}>
          <form id="create-project-form" onSubmit={handleCreate}>
            {error && <div className="auth-error">⚠ {error}</div>}
            <div className="form-group">
              <label className="form-label">Project Name *</label>
              <input className="form-input" placeholder="e.g. Website Redesign"
                value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" placeholder="What is this project about?"
                value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
