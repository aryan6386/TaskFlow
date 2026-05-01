'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';

const STATUS_LABELS   = { todo:'To Do', in_progress:'In Progress', completed:'Completed' };
const PRIORITY_LABELS = { low:'Low', medium:'Medium', high:'High' };

function formatDue(d) {
  if (!d) return null;
  const diff = (new Date(d) - new Date()) / 86400000;
  if (diff < 0) return { text:'Overdue', cls:'due-overdue' };
  if (diff < 3) return { text:`Due in ${Math.ceil(diff)}d`, cls:'due-soon' };
  return { text: new Date(d).toLocaleDateString(), cls:'due-ok' };
}

export default function TasksPage() {
  const { token, user } = useAuth();
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [filterStatus,   setFilterStatus]   = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  useEffect(() => {
    if (!token) return;
    const params = new URLSearchParams();
    if (filterStatus)   params.set('status',   filterStatus);
    if (filterPriority) params.set('priority', filterPriority);
    api.get(`/api/tasks?${params.toString()}`, token)
      .then(d => setTasks(d.tasks || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, filterStatus, filterPriority]);

  const updateStatus = async (taskId, status) => {
    try {
      await api.patch(`/api/tasks/${taskId}/status`, { status }, token);
      setTasks(prev => prev.map(t => t._id === taskId ? {...t, status} : t));
    } catch (e) { alert(e.message); }
  };

  const deleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/api/tasks/${taskId}`, token);
      setTasks(prev => prev.filter(t => t._id !== taskId));
    } catch (e) { alert(e.message); }
  };

  const filtered = tasks.filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.project?.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>;

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h1>My Tasks</h1>
        <p>{filtered.length} task{filtered.length !== 1 ? 's' : ''} found</p>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <input className="search-input" placeholder="🔍 Search tasks or projects…"
          value={search} onChange={e => setSearch(e.target.value)} id="task-search" />
        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} id="filter-status">
          <option value="">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select className="filter-select" value={filterPriority} onChange={e => setFilterPriority(e.target.value)} id="filter-priority">
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        {(search || filterStatus || filterPriority) && (
          <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setFilterStatus(''); setFilterPriority(''); }}>
            ✕ Clear
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <h3>No Tasks Found</h3>
          <p>Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Assignee</th>
                {user?.role === 'admin' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(task => {
                const due = formatDue(task.dueDate);
                const isAssignee = task.assignee?._id === user?.id;
                const canUpdate = user?.role === 'admin' || isAssignee;
                return (
                  <tr key={task._id}>
                    <td>
                      <div style={{fontWeight:600, fontSize:14}}>{task.title}</div>
                      {task.description && <div style={{fontSize:12, color:'var(--t3)', marginTop:2}}>{task.description.slice(0,60)}{task.description.length > 60 ? '…':''}</div>}
                    </td>
                    <td>
                      {task.project
                        ? <a href={`/projects/${task.project._id}`} style={{color:'var(--primary-l)', fontWeight:500, fontSize:13}}>📁 {task.project.name}</a>
                        : <span style={{color:'var(--t3)', fontSize:13}}>—</span>}
                    </td>
                    <td><span className={`badge badge-${task.priority}`}>{PRIORITY_LABELS[task.priority]}</span></td>
                    <td>
                      {canUpdate ? (
                        <select value={task.status} onChange={e => updateStatus(task._id, e.target.value)}
                          className="filter-select" style={{fontSize:12, padding:'5px 8px'}}>
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      ) : (
                        <span className={`badge badge-${task.status}`}>{STATUS_LABELS[task.status]}</span>
                      )}
                    </td>
                    <td>
                      {due ? <span className={due.cls}>{due.text}</span> : <span style={{color:'var(--t3)'}}>—</span>}
                    </td>
                    <td>
                      {task.assignee
                        ? <span style={{fontSize:13}}>👤 {task.assignee.name}</span>
                        : <span style={{color:'var(--t3)', fontSize:13}}>Unassigned</span>}
                    </td>
                    {user?.role === 'admin' && (
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteTask(task._id)}>Delete</button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
