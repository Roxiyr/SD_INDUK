import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';

/** Memasang root React pada halaman HTML. @returns {void} Aplikasi ditampilkan. */
function render(){createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);}
render();
