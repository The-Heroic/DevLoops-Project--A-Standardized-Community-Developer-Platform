import React, { useState, useEffect } from 'react';
import { fetchProjects, createProject, fetchUsers } from './api';

function App() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    repo_url: '',
    user_id: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsRes, usersRes] = await Promise.all([
        fetchProjects(),
        fetchUsers(),
      ]);
      setProjects(projectsRes.data);
      setUsers(usersRes.data);
      if (usersRes.data.length > 0) {
        setFormData((prev) => ({ ...prev, user_id: usersRes.data[0].id }));
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.user_id) return;

    try {
      const res = await createProject(formData);
      setProjects([res.data, ...projects]);
      setFormData({
        title: '',
        description: '',
        repo_url: '',
        user_id: users[0]?.id || '',
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error creating project:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 selection:bg-emerald-500 selection:text-gray-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-40 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
              ⟳
            </div>
            <span className="text-xl font-bold mono tracking-tight">DevLoops</span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-semibold px-4 py-2 rounded-lg transition text-sm flex items-center gap-1 shadow-lg shadow-emerald-500/20"
          >
            <span>+</span> Post Project
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 pt-28 pb-16">
        {/* Header section */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-800/60">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Active Projects</h1>
            <p className="text-gray-400 text-sm mt-1">Explore and collaborate on real-time projects.</p>
          </div>
          <span className="text-xs bg-gray-900 border border-gray-800 text-emerald-400 px-3 py-1.5 rounded-full mono">
            {projects.length} Projects Live
          </span>
        </div>

        {/* Project Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading live projects...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-800 rounded-2xl">
            <p className="text-gray-400 mb-4">No projects listed yet.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-emerald-400 hover:underline text-sm"
            >
              Post the first one →
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="bg-gray-900 border border-gray-800/80 hover:border-gray-700 transition duration-200 rounded-xl p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="font-semibold text-lg text-white">{proj.title}</h3>
                    <span className="text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-md mono">
                      Active
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    {proj.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-800/50 flex items-center justify-between text-xs">
                  {proj.repo_url ? (
                    <a
                      href={proj.repo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 transition underline underline-offset-4"
                    >
                      Repository ↗
                    </a>
                  ) : (
                    <span className="text-gray-600">No link provided</span>
                  )}
                  <span className="text-gray-500 mono">User ID: #{proj.user_id}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Styled Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold">Post a Project</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white transition text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Author
                </label>
                <select
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.username} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Project Title
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g., Fix Auth Bug"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="What is this project about?"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Repository URL
                </label>
                <input
                  type="url"
                  name="repo_url"
                  placeholder="https://github.com/username/project"
                  value={formData.repo_url}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold py-3 rounded-lg transition mt-4 text-sm shadow-md shadow-emerald-500/20"
              >
                Post Project
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;