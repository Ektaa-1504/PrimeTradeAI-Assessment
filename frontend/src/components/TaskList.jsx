import { useState, useEffect, useCallback } from 'react';
import api from '../api';

const STATUS_STYLES = {
  pending:     'bg-yellow-950/60 text-yellow-300 border-yellow-800',
  'in-progress': 'bg-blue-950/60 text-blue-300 border-blue-800',
  completed:   'bg-green-950/60 text-green-300 border-green-800',
};

const PRIORITY_STYLES = {
  low:    'text-gray-400',
  medium: 'text-amber-400',
  high:   'text-red-400',
};

const PRIORITY_DOT = {
  low:    'bg-gray-500',
  medium: 'bg-amber-400',
  high:   'bg-red-500',
};

const EMPTY_FORM = { title: '', description: '', status: 'pending', priority: 'medium' };

/* ── Toast ────────────────────────────────────────────── */
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-3 shadow-2xl text-sm font-medium border animate-fade-in
      ${type === 'success'
        ? 'bg-green-950 text-green-200 border-green-700'
        : 'bg-red-950 text-red-200 border-red-700'}`}>
      <span>{type === 'success' ? '✅' : '❌'}</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-1 opacity-50 hover:opacity-100 text-lg leading-none">×</button>
    </div>
  );
}

/* ── Task Modal (Create / Edit) ──────────────────────── */
function TaskModal({ task, onClose, onSaved }) {
  const [form, setForm] = useState(
    task
      ? { title: task.title, description: task.description, status: task.status, priority: task.priority }
      : EMPTY_FORM
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    setSaving(true);
    try {
      if (task) {
        const { data } = await api.patch(`/tasks/${task._id}`, form);
        onSaved(data.task, 'updated');
      } else {
        const { data } = await api.post('/tasks', form);
        onSaved(data.task, 'created');
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/70 px-4 pb-4 sm:pb-0">
      <div className="w-full max-w-lg card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">{task ? '✏️ Edit Task' : '➕ New Task'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-xl leading-none">×</button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-950/60 border border-red-800 px-4 py-2.5 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2" htmlFor="task-title">Title</label>
            <input id="task-title" name="title" value={form.title} onChange={handleChange} className="input" placeholder="What needs to be done?" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2" htmlFor="task-desc">Description</label>
            <textarea id="task-desc" name="description" value={form.description} onChange={handleChange} className="input resize-none h-24" placeholder="Optional details…" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2" htmlFor="task-status">Status</label>
              <select id="task-status" name="status" value={form.status} onChange={handleChange} className="input">
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2" htmlFor="task-priority">Priority</label>
              <select id="task-priority" name="priority" value={form.priority} onChange={handleChange} className="input">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : task ? 'Save Changes' : 'Create Task'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary w-full">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Delete Confirm ──────────────────────────────────── */
function DeleteModal({ task, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4">
      <div className="card w-full max-w-sm text-center">
        <div className="text-5xl mb-3">🗑️</div>
        <h3 className="text-lg font-bold text-white mb-2">Delete Task?</h3>
        <p className="text-sm text-gray-400 mb-6">
          "<span className="text-gray-200">{task.title}</span>" will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button id="confirm-delete-btn" onClick={onConfirm} className="btn-danger w-full py-2.5">Yes, Delete</button>
          <button onClick={onClose} className="btn-secondary w-full py-2.5">Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ── Main TaskList ────────────────────────────────────── */
export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 8, ...filters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const { data } = await api.get('/tasks', { params });
      setTasks(data.tasks);
      setPagination({ total: data.total, pages: data.pages });
    } catch {
      showToast('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleFilterChange = (e) => {
    setFilters((p) => ({ ...p, [e.target.name]: e.target.value }));
    setPage(1);
  };

  const handleSaved = (_task, action) => {
    fetchTasks();
    showToast(`Task ${action} successfully`);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/tasks/${deleteTarget._id}`);
      setDeleteTarget(null);
      fetchTasks();
      showToast('Task deleted');
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1 sm:max-w-[170px]">
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="input appearance-none pr-8 cursor-pointer text-sm"
              id="filter-status"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">▾</span>
          </div>

          <div className="relative flex-1 sm:max-w-[170px]">
            <select
              name="priority"
              value={filters.priority}
              onChange={handleFilterChange}
              className="input appearance-none pr-8 cursor-pointer text-sm"
              id="filter-priority"
            >
              <option value="">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">▾</span>
          </div>
        </div>

        <button
          id="new-task-btn"
          onClick={() => setModal('create')}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition duration-200 shrink-0 shadow-md shadow-indigo-900/30"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Task
        </button>
      </div>

      {/* Stats bar */}
      {!loading && pagination.total > 0 && (
        <p className="text-xs text-gray-500 mb-4">
          Showing <span className="text-gray-300 font-medium">{tasks.length}</span> of{' '}
          <span className="text-gray-300 font-medium">{pagination.total}</span> tasks
        </p>
      )}

      {/* Task list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-500">
          <svg className="animate-spin h-8 w-8 text-indigo-500 mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p className="text-sm">Loading tasks…</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-500">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-base font-medium text-gray-400">No tasks found</p>
          <p className="text-sm mt-1">Click "New Task" to create your first one</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="group flex flex-col sm:flex-row sm:items-center gap-4 bg-gray-900/70 hover:bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 transition duration-200"
            >
              {/* Priority dot */}
              <div className={`hidden sm:block w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[task.priority]}`} />

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-white text-sm truncate">{task.title}</span>
                  <span className={`badge ${STATUS_STYLES[task.status]}`}>
                    {task.status}
                  </span>
                </div>

                {task.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{task.description}</p>
                )}

                <div className="flex items-center flex-wrap gap-3 mt-2">
                  <span className={`flex items-center gap-1.5 text-xs font-medium ${PRIORITY_STYLES[task.priority]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full sm:hidden ${PRIORITY_DOT[task.priority]}`} />
                    {task.priority} priority
                  </span>
                  {task.owner?.name && (
                    <span className="text-xs text-gray-600">by {task.owner.name}</span>
                  )}
                  <span className="text-xs text-gray-700">
                    {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  id={`edit-task-${task._id}`}
                  onClick={() => setModal(task)}
                  className="text-xs font-medium text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg px-3 py-1.5 transition duration-200"
                >
                  Edit
                </button>
                <button
                  id={`delete-task-${task._id}`}
                  onClick={() => setDeleteTarget(task)}
                  className="text-xs font-medium text-red-400 hover:text-white hover:bg-red-700 border border-red-900 hover:border-red-700 rounded-lg px-3 py-1.5 transition duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="btn-secondary px-5 py-2 text-sm disabled:opacity-30"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-400">
            Page <span className="text-white font-medium">{page}</span> of {pagination.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, pagination.pages))}
            disabled={page === pagination.pages}
            className="btn-secondary px-5 py-2 text-sm disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      )}

      {/* Modals */}
      {(modal === 'create' || (modal && modal._id)) && (
        <TaskModal
          task={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          task={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
