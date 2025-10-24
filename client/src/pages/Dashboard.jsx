import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';
import ThreeBg from '../components/ThreeBg.jsx';
import TabNav from '../components/TabNav.jsx';

export default function Dashboard() {
  const auth = useMemo(() => JSON.parse(localStorage.getItem('auth') || '{}'), []);
  const orgId = auth?.organization?._id;
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [pname, setPname] = useState('');
  const [ntitle, setNtitle] = useState('');
  const [ndesc, setNdesc] = useState('');
  const [nassignee, setNassignee] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('Tasks');

  async function loadProjects() {
    try {
      const data = await api.listProjects();
      setProjects(data.projects);
      if (data.projects?.length && !selectedProject) {
        setSelectedProject(data.projects[0]._id);
      }
    } catch (e) {
      setError(e.message);
    }
  }

  async function loadTasks(projectId) {
    if (!projectId) { setTasks([]); return; }
    try {
      const data = await api.listTasks(projectId);
      setTasks(data.tasks);
    } catch (e) {
      setError(e.message);
    }
  }

  async function loadMembers() {
    if (!orgId) return;
    try {
      const data = await api.orgMembers(orgId);
      setMembers(data.members || []);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    loadProjects();
    loadMembers();
  }, []);

  useEffect(() => {
    loadTasks(selectedProject);
  }, [selectedProject]);

  async function createProject(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.createProject({ name: pname });
      setPname('');
      await loadProjects();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function createTask(e) {
    e.preventDefault();
    if (!selectedProject) return;
    setLoading(true);
    setError('');
    try {
      await api.createTask({ projectId: selectedProject, title: ntitle, description: ndesc, assignedTo: nassignee || null });
      setNtitle(''); setNdesc(''); setNassignee('');
      await loadTasks(selectedProject);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function changeStatus(taskId, status) {
    try {
      await api.updateTaskStatus(taskId, status);
      await loadTasks(selectedProject);
    } catch (e) {
      setError(e.message);
    }
  }

  async function assignTask(taskId, userId) {
    try {
      await api.assignTask(taskId, userId);
      await loadTasks(selectedProject);
    } catch (e) {
      setError(e.message);
    }
  }

  async function deleteTask(taskId) {
    try {
      await api.deleteTask(taskId);
      await loadTasks(selectedProject);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="page">
      <ThreeBg variant="app" />
      <div className="content">
        <div className="container">
          <div className="card" style={{ marginBottom: 12 }}>
            <h2 style={{ marginTop: 0 }}>Dashboard</h2>
            <p className="small">Organization: <strong>{auth?.organization?.name}</strong> • User: <strong>{auth?.user?.name}</strong> ({auth?.user?.role})</p>
            <TabNav tabs={["Tasks","Projects","Members"]} current={tab} onChange={setTab} />

            {tab === 'Projects' && (
              <div>
                <form onSubmit={createProject} style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input placeholder="New project name" value={pname} onChange={(e) => setPname(e.target.value)} required />
                  <button disabled={loading}>Create</button>
                </form>
                {projects.length === 0 ? (
                  <p className="small">No projects yet. Create your first project.</p>
                ) : (
                  <ul>
                    {projects.map((p) => (
                      <li key={p._id} style={{ marginBottom: 6 }}>
                        <label className="radio">
                          <input type="radio" name="project" checked={selectedProject === p._id} onChange={() => setSelectedProject(p._id)} />
                          <span>{p.name}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {tab === 'Tasks' && (
              <div>
                <div className="small" style={{ marginBottom: 8 }}>
                  Project:{' '}
                  {projects.length === 0 ? 'Create a project first.' : (
                    <>
                      {projects.map((p) => (
                        <label key={p._id} className="radio" style={{ marginRight: 12 }}>
                          <input type="radio" name="project" checked={selectedProject === p._id} onChange={() => setSelectedProject(p._id)} />
                          <span>{p.name}</span>
                        </label>
                      ))}
                    </>
                  )}
                </div>
                {selectedProject && (
                  <form onSubmit={createTask} style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                    <input placeholder="Title" value={ntitle} onChange={(e) => setNtitle(e.target.value)} required />
                    <input placeholder="Description" value={ndesc} onChange={(e) => setNdesc(e.target.value)} />
                    <select value={nassignee} onChange={(e) => setNassignee(e.target.value)}>
                      <option value="">Unassigned</option>
                      {members.map((m) => (
                        <option value={m._id} key={m._id}>{m.name} ({m.email})</option>
                      ))}
                    </select>
                    <button disabled={loading}>Add Task</button>
                  </form>
                )}

                {selectedProject ? (
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {tasks.map((t) => (
                      <li key={t._id} className="card" style={{ padding: 12, marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                          <div>
                            <strong>{t.title}</strong>
                            {t.description && <span> — {t.description}</span>}
                            <div className="small" style={{ marginTop: 6 }}>
                              Status:{' '}
                              <select value={t.status} onChange={(e) => changeStatus(t._id, e.target.value)}>
                                <option value="todo">To do</option>
                                <option value="in-progress">In progress</option>
                                <option value="done">Done</option>
                              </select>
                            </div>
                            <div className="small" style={{ marginTop: 6 }}>
                              Assigned to:{' '}
                              <select value={t.assignedTo || ''} onChange={(e) => assignTask(t._id, e.target.value)}>
                                <option value="">Unassigned</option>
                                {members.map((m) => (
                                  <option value={m._id} key={m._id}>{m.name} ({m.email})</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div>
                            <button onClick={() => deleteTask(t._id)} style={{ borderColor: 'rgba(255,255,255,0.2)' }}>Delete</button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="small">Select a project to view tasks.</p>
                )}
              </div>
            )}

            {tab === 'Members' && (
              <div>
                {members.length === 0 ? (
                  <p className="small">No members yet.</p>
                ) : (
                  <ul>
                    {members.map((m) => (
                      <li key={m._id} style={{ marginBottom: 6 }}>
                        {m.name} <span className="small">({m.email})</span> — <strong>{m.role}</strong>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {error && <p style={{ color: '#fca5a5' }}>{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
