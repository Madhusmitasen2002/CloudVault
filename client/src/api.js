// src/api.js
import axios from "axios";

// ----- Axios instance -----
const api = axios.create({
  baseURL: "https://cloudvault-1-ac6o.onrender.com/api",
});

// ----- Auth token handling -----
export const setAccessToken = (token) => {
  if (token) {
    localStorage.setItem("accessToken", token);
  } else {
    localStorage.removeItem("accessToken");
  }
};

// Automatically attach token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // If data is FormData, let Axios handle Content-Type
  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

// Handle 401 responses globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      setAccessToken(null); // auto logout on invalid token
    }
    return Promise.reject(error);
  }
);

// ----- Auth methods -----
export const auth = {
  login: async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token, user, message } = res.data; // <-- use `token` here
    setAccessToken(token); // save token in localStorage
    return { token, user, message };
  },

  signup: async (name, email, password) => {
    const res = await api.post("/auth/register", { name, email, password });
    return res.data;
  },

  getUserFromToken: () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return { ...payload };
    } catch {
      return null;
    }
  },

  logout: () => setAccessToken(null),
};

// ----- File & Folder API -----
export const uploadFile = async (formData) => {
  if (!(formData instanceof FormData)) {
    throw new Error("uploadFile expects FormData");
  }

  return api.post("/files/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};


export const getFiles = async (folderId = null) => {
  const res = await api.get("/files", { params: { parent_id: folderId } });
  return res.data.files || [];
};

export const createFolder = async (folderName, parentFolderId = null) => {
  const token = localStorage.getItem("accessToken");
 
  
  const res = await api.post(
    "/folders/create",
    {
      folder_name: folderName,              // backend column
      parent_folder_id: parentFolderId || null, // backend column
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export const getFolders = async (parentId = null) => {
  // Use axios params instead of manual URL query string
  const params = parentId === null ? { parent_id: "null" } : { parent_id: parentId };

  const res = await api.get("/folders", { params });

  // Assuming your backend returns array of folders directly
  return res.data;
};



export default api;
