import Machines from '../Machines';
import Dashboard from '../Dashboard';
import Jobs from '../Jobs';
import './Navigation.css';
import { useEffect, useState } from 'react';

function Navigation() {
    const [activeTab, setActiveTab] = useState('dashboard');

    // keep page static
    useEffect(() => {
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    return (
        <div className='machine-demo-page'>
            <div className='nav-bar'>
                <div className='logo-container'>
                    <img src='/handwrytten_logo_2.png' alt='riddym' loading="lazy"/>
                </div>
                <span></span>
                <div className='options'>
                    <div
                        className={`option-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        <i className="fa-solid fa-gauge"></i>
                        <div className='tooltip'>Dashboard</div>
                    </div>
                    <div
                        className={`option-item ${activeTab === 'machines' ? 'active' : ''}`}
                        onClick={() => setActiveTab('machines')}
                    >
                        <i className="fa-solid fa-print"></i>
                        <div className='tooltip'>Machines</div>
                    </div>
                    <div
                        className={`option-item ${activeTab === 'jobs' ? 'active' : ''}`}
                        onClick={() => setActiveTab('jobs')}
                    >
                        <i className="fa-solid fa-bars-progress"></i>
                        <div className='tooltip'>Jobs</div>
                    </div>
                </div>
            </div>
            <div className='content'>
                {activeTab === 'dashboard' && <Dashboard />}
                {activeTab === 'machines' && <Machines />}
                {activeTab === 'jobs' && <Jobs />}
            </div>
        </div>
    )
};

export default Navigation;
