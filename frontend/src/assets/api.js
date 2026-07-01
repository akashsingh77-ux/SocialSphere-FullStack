import axios from "axios";

const api = axios.create({
  baseURL: "https://socialsphere-fullstack.onrender.com/api",
  withCredentials: true,
});

export default api;