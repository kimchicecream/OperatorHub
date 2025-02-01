import { useState, useEffect } from 'react';
import './Dashboard.css';

function Dashboard() {
    const [numbers, setNumbers] = useState(() => {
        return JSON.parse(sessionStorage.getItem('cachedNumbers')) || [];
    });
    const [loading, setLoading] = useState(numbers.length === 0);
    const [retryCount, setRetryCount] = useState(0); // track retry attempts

    async function fetchData(forceRefresh = false) {
        try {
            const cacheTime = sessionStorage.getItem('cacheTime');
            const now = Date.now();

            // skip fetch if cache is fresh and not forced
            if (!forceRefresh && cacheTime && now - cacheTime < 2 * 60 * 1000) {
                console.log('[LOG] Using cached data from sessionStorage.');
                return;
            }

            console.log(`[LOG] Fetching new data... (Retry Count: ${retryCount})`);

            const response = await fetch('http://localhost:5001/api/scrape-performance');
            const data = await response.json();

            setNumbers(data);
            sessionStorage.setItem('cachedNumbers', JSON.stringify(data));
            sessionStorage.setItem('cacheTime', now.toString());

            // reset retry count on successful fetch
            setRetryCount(0);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();

        const interval = setInterval(fetchData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // retry logic if numbers are N/A
    useEffect(() => {
        if ((numbers[0] === 'N/A' || numbers[2] === 'N/A') && retryCount < 3) {
            console.log('[LOG] Data is invalid, retrying scrape...');
            setRetryCount(prev => prev + 1);
            setTimeout(() => fetchData(true), 5000); // retry after 5 seconds
        }
    }, [numbers, retryCount]);

    return (
        <div className='machine-dashboard'>
            <div className='title'>
                <h1>Hello, operator</h1>
            </div>
            <div className='total-stats'>
                <div className='container'>
                    {loading ? (
                        <div className='rectangle-loader'></div>
                    ) : (
                        <div className='total-orders'>{numbers[0] || 'N/A'}</div>
                    )}
                    <div className='info'>
                        <p>Total open orders</p>
                        <i className="fa-solid fa-circle-info"></i>
                        <div className='tooltip'>The total number of orders in queue.</div>
                    </div>
                </div>
                <div className='container'>
                    {loading ? (
                        <div className='rectangle-loader'></div>
                    ) : (
                        <div className='total-orders'>{numbers[2] || 'N/A'}</div>
                    )}
                    <div className='info'>
                        <p>Orders completed today</p>
                        <i className="fa-solid fa-circle-info"></i>
                        <div className='tooltip'>The total number of orders fulfilled.</div>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default Dashboard;
