import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import UserContextProvider from "./UserContextProvider.jsx";
import axios from "axios";
// setting the default config of axios
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:3000";


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <App />
  </React.StrictMode>,
)
