import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', // according to the local host url it will changes. 
  headers: {
    'Content-Type': 'application/json',
  },
});

// adding an interceptor to automatically attach the user JWS Token's once log in 
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('edusync_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;