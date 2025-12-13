import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:5000/api', // Matches your backend port
});

// Automatically add token to requests if it exists
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;