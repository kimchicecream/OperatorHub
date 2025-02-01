import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Navigation from './components/Navigation';
import './components/Navigation/Navigation.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Navigation />
  </StrictMode>,
)
