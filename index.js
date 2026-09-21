const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// 1. Health check route
app.get('/', (req, res) => {
  res.send('DevLoops backend is running');
});

// 2. Create a new user (POST /api/users)
app.post('/api/users', async (req, res) => {
  try {
    const { username, email } = req.body;
    const newUser = await pool.query(
      'INSERT INTO users (username, email) VALUES ($1, $2) RETURNING *',
      [username, email]
    );
    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// 3. Get all users (GET /api/users)
app.get('/api/users', async (req, res) => {
  try {
    const allUsers = await pool.query('SELECT * FROM users ORDER BY id ASC');
    res.json(allUsers.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// 4. Get a single user by ID (GET /api/users/:id)
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});
// 5. Update a user (PUT /api/users/:id)
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email } = req.body;

    const updatedUser = await pool.query(
      'UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING *',
      [username, email, id]
    );

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(updatedUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// 6. Delete a user (DELETE /api/users/:id)
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleteUser = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING *',
      [id]
    );

    if (deleteUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User was successfully deleted', user: deleteUser.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// --- PROJECT ROUTES ---

// Create a project for a specific user
app.post('/api/projects', async (req, res) => {
  try {
    const { title, description, repo_url, user_id } = req.body;
    const newProject = await pool.query(
      'INSERT INTO projects (title, description, repo_url, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, repo_url, user_id]
    );
    res.status(201).json(newProject.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    const allProjects = await pool.query('SELECT * FROM projects ORDER BY id ASC');
    res.json(allProjects.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all projects belonging to a specific user (with user info joined)
app.get('/api/users/:userId/projects', async (req, res) => {
  try {
    const { userId } = req.params;
    const userProjects = await pool.query(
      `SELECT projects.id, projects.title, projects.description, projects.repo_url, projects.created_at,
              users.username, users.email
      FROM projects
      JOIN users ON projects.user_id = users.id
      WHERE users.id = $1`,
      [userId]
    );
    res.json(userProjects.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});