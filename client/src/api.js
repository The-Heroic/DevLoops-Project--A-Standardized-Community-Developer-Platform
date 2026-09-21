import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Fetch all projects
export const fetchProjects = () => API.get('/projects');

// Create a new project
export const createProject = (projectData) => API.post('/projects', projectData);

// Fetch all users (to populate user dropdowns)
export const fetchUsers = () => API.get('/users');