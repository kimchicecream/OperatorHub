import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import MachineDemo from './components/Navigation';
import './components/Navigation/Navigation.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MachineDemo />
  </StrictMode>,
)
