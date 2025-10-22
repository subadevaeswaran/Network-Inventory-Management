// src/api/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  // Use import.meta.env for Vite
  baseURL: import.meta.env.VITE_API_BASE_URL,
  
  headers: {
    'Content-Type': 'application/json',
  }
});

export default apiClient;