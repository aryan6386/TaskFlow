'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { api } from '../../../../lib/api';
import Modal from '../../../../components/Modal';

const STATUSES = ['todo','in_progress','completed'];
const STATUS_LABELS = { todo:'To Do', in_progress:'In Progress', completed:'Completed' };
const PRIORITY_LABELS = { low:'Low', medium:'Medium', high:'High' };
const STATUS_COLORS = { todo:'badge-todo', in_progress:'badge-in_progress', completed:'badge-completed' };

function formatDue(d) {
  if (!d) return null;
  const diff = (new Date(d) - new Date()) / 86400000;
  if (diff < 0) return { text:'Overdue', cls:'due-overdue' };
  if (diff < 3) return { text:`Due in ${Math.ceil(diff)}d`, cls:'due-soon' };
  return { text: new Date(d).toLocaleDateString(), cls:'due-ok' };
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks,   setTasks]   = useState([]);
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal,   setShowTaskModal]   = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title:'', description:'', priority:'medium', assigneeId:'', dueDate:'' });
  const [memberEmail, setMemberEmail] = useState('');
  const [saving, setSaving]   = useState(false);
  const [error,  setError]    = useState('');

  const load = useCallback(async () => {
    try {
      const [pd, td] = await Promise.all([
        api.get(`/api/projects/${id}`, token),
        api.get(`/api/tasks/project/${id}`, token),
      ]);
      setProject(pd.project);
      setTasks(td.tasks || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [id, token]);

  useEffect(() => { if (token && id) load(); }, [token, id, load]);

  const createTask = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      const payload = { ...taskForm, projectId: id, dueDate: taskForm.dueDate || undefined, assigneeId: taskForm.assigneeId || undefined };
      const d = await api.post('/api/tasks', payload, token);
      setTasks(prev => [d.task, ...prev]);
      setShowTaskModal(false);
      setTaskForm({ title:'', description:'', priority:'medium', assigneeId:'', dueDate:'' });
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const updateStatus = async (taskId, status) => {
    try {
      await api.patch(`/api/tasks/${taskId}/status`, { status }, token);
      setTasks(prev => prev.map(t => t._id === taskId ? {...t, status} : t));
    } catch (e) { console.error(e); }
  };

  const deleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/api/tasks/${taskId}`, token);
      setTasks(prev => prev.filter(t => t._id !== taskId));
    } catch (e) { alert(e.message); }
  };

  const addMember = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      // Find user by email via search endpoint
      const all = await api.get('/api/auth/users', token).catch(() => null);
      let uid = all?.users?.find(u => u.email === memberEmail)?._id;
      if (!uid) { setError('User not found. Make sure they have an account.'); setSaving(false); return; }
      const d = await api.post(`/api/projects/${id}/members`, { userId: uid }, token);
      setProject(d.project);
      setShowMemberModal(false); setMemberEmail('');
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const removeMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    try {
      const d = await api.delete(`/api/projects/${id}/members/${userId}`, token);
      setProject(d.project);
    } catch (e) { alert(e.message); }
  };

  const deleteProject = async () => {
    if (!confirm('Delete this project and ALL its tasks? This cannot be undone.')) return;
    try {
      await api.delete(`/api/projects/${id}`, token);
      window.location.href = '/projects';
    } catch (e) { alert(e.message); }
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>;
  if (!project) return <div className="page-content"><div className="empty-state"><div className="empty-icon">🔍</div><h3>Project not found</h3></div></div>;

  const tasksByStatus = STATUSES.reduce((acc, s) => ({ ...acc, [s]: tasks.filter(t => t.status === s) }), {});
  const colColors = { todo:'var(--t3)', in_progress:'var(--info)', completed:'var(--success)' };
  const completedPct = tasks.length ? Math.round((tasksByStatus.completed.length / tasks.length) * 100) : 0;

  return (
    <div className="page-content fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="header-row" style={{flexWrap:'wrap', gap:12}}>
          <div>
            <div style={{fontSize:13, color:'var(--t3)', marginBottom:4}}>
              <a href="/projects" style={{color:'var(--primary-l)'}}>Projects</a> / {project.name}
            </div>
            <h1>{project.name}</h1>
            {project.description && <p>{project.description}</p>}
          </div>
          {user?.role === 'admin' && (
            <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
              <button className="btn btn-primary btn-sm" onClick={() => setShowTaskModal(true)} id="add-task-btn">+ Add Task</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowMemberModal(true)} id="add-member-btn">👤 Add Member</button>
              <button className="btn btn-danger btn-sm" onClick={deleteProject} id="delete-project-btn">🗑 Delete</button>
            </div>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="card" style={{marginBottom:24}}>
        <div style={{display:'flex', justifyContent:'space-between', marginBottom:10, fontSize:14}}>
          <span style={{fontWeight:600}}>Overall Progress</span>
          <span style={{color:'var(--t2)'}}>{tasksByStatus.completed.length}/{tasks.length} tasks · {completedPct}%</span>
        </div>
        <div className="progress-bar" style={{height:8}}>
          <div className="progress-fill" style={{width:`${completedPct}%`}} />
        </div>
      </div>

      {/* Members */}
      <div className="section-title">Team Members</div>
      <div className="members-list" style={{marginBottom:28}}>
        {project.members?.map(m => (
          <div key={m._id} className="member-row">
            <div className="member-avatar-m">{m.name?.[0]?.toUpperCase()}</div>
            <div className="member-details">
              <div className="member-name">{m.name} {m._id === project.owner?._id && '👑'}</div>
              <div className="member-email">{m.email}</div>
            </div>
            <span className={`badge badge-${m.role}`}>{m.role}</span>
            {user?.role === 'admin' && m._id !== project.owner?._id && (
              <button className="btn btn-danger btn-sm" onClick={() => removeMember(m._id)}>Remove</button>
            )}
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="section-title">Tasks</div>
      {tasks.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📋</div><h3>No tasks yet</h3><p>Add tasks to get started.</p></div>
      ) : (
        <div className="kanban-board">
          {STATUSES.map(status => (
            <div key={status} className="kanban-col">
              <div className="kanban-col-header">
                <span className="kanban-col-title" style={{color: colColors[status]}}>{STATUS_LABELS[status]}</span>
                <span className="kanban-count">{tasksByStatus[status].length}</span>
              </div>
              <div className="kanban-tasks">
                {tasksByStatus[status].length === 0
                  ? <div style={{fontSize:13, color:'var(--t3)', textAlign:'center', padding:'20px 0'}}>No tasks</div>
                  : tasksByStatus[status].map(task => {
                      const due = formatDue(task.dueDate);
                      const isAssignee = task.assignee?._id === user?.id;
                      const canUpdate = user?.role === 'admin' || isAssignee;
                      return (
                        <div key={task._id} className="task-card">
                          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6}}>
                            <div className="task-title" style={{marginBottom:0}}>{task.title}</div>
                            {user?.role === 'admin' && (
                              <button onClick={() => deleteTask(task._id)} style={{background:'none', border:'none', color:'var(--t3)', fontSize:14, cursor:'pointer', padding:'0 0 0 8px'}} title="Delete">✕</button>
                            )}
                          </div>
                          {task.description && <div className="task-desc">{task.description}</div>}
                          <div className="task-meta">
                            <span className={`badge badge-${task.priority}`}>{PRIORITY_LABELS[task.priority]}</span>
                            {task.assignee && <span style={{fontSize:12, color:'var(--t3)'}}>👤 {task.assignee.name}</span>}
                          </div>
                          {due && <div className={due.cls} style={{marginTop:6, fontSize:12}}>🗓 {due.text}</div>}
                          {canUpdate && (
                            <select
                              value={task.status}
                              onChange={e => updateStatus(task._id, e.target.value)}
                              className="filter-select"
                              style={{width:'100%', marginTop:10, fontSize:12}}
                            >
                              <option value="todo">To Do</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          )}
                        </div>
                      );
                    })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      {showTaskModal && (
        <Modal title="Create Task" onClose={() => setShowTaskModal(false)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
            <button className="btn btn-primary" form="task-form" type="submit" disabled={saving}>
              {saving ? 'Creating…' : 'Create Task'}
            </button>
          </>}>
          <form id="task-form" onSubmit={createTask}>
            {error && <div className="auth-error">⚠ {error}</div>}
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" placeholder="Task title"
                value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" placeholder="Task details…"
                value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-select" value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input type="date" className="form-input" value={taskForm.dueDate}
                  onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Assign To</label>
              <select className="form-select" value={taskForm.assigneeId} onChange={e => setTaskForm({...taskForm, assigneeId: e.target.value})}>
                <option value="">Unassigned</option>
                {project.members?.map(m => <option key={m._id} value={m._id}>{m.name} ({m.email})</option>)}
              </select>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <Modal title="Add Member" onClose={() => setShowMemberModal(false)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setShowMemberModal(false)}>Cancel</button>
            <button className="btn btn-primary" form="member-form" type="submit" disabled={saving}>
              {saving ? 'Adding…' : 'Add Member'}
            </button>
          </>}>
          <form id="member-form" onSubmit={addMember}>
            {error && <div className="auth-error">⚠ {error}</div>}
            <div className="form-group">
              <label className="form-label">Member Email</label>
              <input className="form-input" type="email" placeholder="member@example.com"
                value={memberEmail} onChange={e => setMemberEmail(e.target.value)} required />
            </div>
            <p style={{fontSize:12, color:'var(--t3)'}}>The user must already have an account in TaskFlow.</p>
          </form>
        </Modal>
      )}
    </div>
  );
}
