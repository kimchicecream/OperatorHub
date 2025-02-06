import { useState, useEffect } from 'react';
import './Machines.css';

function Machines() {
    const [machines] = useState(Array.from({ length: 110 - 71 + 1 }, (_, i) => i + 71));
    const [selectedMachine, setSelectedMachine] = useState(null);
    const [machineData, setMachineData] = useState({});
    const [loadingMachine, setLoadingMachine] = useState(false);
    const [loading, setLoading] = useState();

    // const machinesColumn1 = Array.from({ length: (90 - 72) / 2 + 1 }, (_, i) => 72 + i * 2); // even: 72-90
    // const machinesColumn2 = Array.from({ length: (89 - 71) / 2 + 1 }, (_, i) => 71 + i * 2); // odd: 71-89
    // const machinesColumn3 = Array.from({ length: (109 - 91) / 2 + 1 }, (_, i) => 91 + i * 2); // odd: 91-109
    // const machinesColumn4 = Array.from({ length: (110 - 92) / 2 + 1 }, (_, i) => 92 + i * 2); // even: 92-110

    // no scroll
    useEffect(() => {
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    async function fetchMachineData(machine) {
        setLoadingMachine(machine);
        try {
            const response = await fetch(`http://localhost:5001/api/scrape-jobs?machine=${machine}`);
            // If the response is not OK, throw an error so we handle it below.
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            setMachineData(prevData => ({
                ...prevData,
                [machine]: data.extractedData
            }));
        } catch (error) {
            console.error('Error fetching machine data:', error);
            setMachineData(prevData => ({
                ...prevData,
                [machine]: null
            }));
        } finally {
            setLoadingMachine(null);
        }
    }

    useEffect(() => {
        setLoading(true);
        machines.forEach(machine => {
            fetchMachineData(machine);
        });
        setLoading(false);

        const interval = setInterval(() => {
            machines.forEach(machine => {
                fetchMachineData(machine);
            });
        }, 30000);

        return () => clearInterval(interval);
    }, [machines]);

    const totalJobs = Object.values(machineData).reduce((acc, data) => acc + (data && data.jobid ? 1 : 0), 0);
    const totalOpenMachines = machines.filter(machine => !machineData[machine] || machineData[machine].status.includes('IDLE')).length;

    return (
        <div className='machine-jobs-container'>
            {/* <div className='title'>
                <h1>Jobs</h1>
            </div> */}
            <div className='general-info'>
                <div className='left-column'>
                    <div className='big box' id='b1'>
                        <div className='info-num'>
                            {loading ? (
                                <div className='rectangle-loader'></div>
                            ) : (
                                <div className='total-open-machines'>{totalOpenMachines}</div>
                            )}
                        </div>
                        <div className='info'>
                            <p>Open machines</p>
                            <i className="fa-solid fa-circle-info"></i>
                            <div className='tooltip'>The total number of unemployed machines. Unbelievable!</div>
                        </div>
                    </div>
                    <div className='big box' id='b2'>
                        <div className='info-num'>
                            {loading ? (
                                <div className='rectangle-loader'></div>
                            ) : (
                                <div className='total-jobs'>{totalJobs}</div>
                            )}
                        </div>
                        <div className='info'>
                            <p>Total jobs running</p>
                            <i className="fa-solid fa-circle-info"></i>
                            <div className='tooltip'>The total number of jobs currently running.</div>
                        </div>
                    </div>
                    <div className='big box' id='b3'>
                        <div className='info-num'>
                            {loading ? (
                                <div className='rectangle-loader'></div>
                            ) : (
                                <div className='total-orders'>{'N/A'}</div>
                            )}
                        </div>
                        <div className='info'>
                            <p>Next batch suggestion</p>
                            <i className="fa-solid fa-circle-info"></i>
                            <div className='tooltip'>The combination of Notes and Envelopes suggested for the next batch of orders.</div>
                        </div>
                    </div>
                </div>
                <div className='right-column'>
                </div>
            </div>
            <div className='machines-module'>
                <div className='title'>
                    <h3>Your Penbots <p>{machines.length}</p></h3>
                </div>
                <div className='machine-selector'>
                    <div className='machine-list'>
                        <div className='button-labels'>
                            <div className='t1'>
                                <div className="c1">Status</div>
                                <div className="c2">Machine</div>
                                <div className="c3">Type</div>
                            </div>
                            <div className="c4">Jobs</div>
                            <div className="c5">Pages Left</div>
                            <div className="c6">Note/Env</div>
                            <div className="c7">Attributes</div>
                        </div>
                        {machines.map((machine) => (
                            <div key={machine} className='machine-container'>
                                <button
                                    className={`machine-button ${selectedMachine === machine ? 'selected' : ''}`}
                                    onClick={() => setSelectedMachine(selectedMachine === machine ? null : machine)}
                                >
                                    <div className='status'>
                                        <div className='led-container'>
                                        <div className={`led ${
                                            !machineData[machine]
                                                ? 'gray'  // inactive
                                                : /PAPER_JAM|paperJam|INCORRECT_CARD/.test(machineData[machine].status)
                                                ? 'red'   // errors
                                                : machineData[machine].status.includes('IDLE') || machineData[machine].status.includes === 'idle' || machineData[machine].status === '--' || !machineData[machine].status
                                                ? 'blue'  // idle
                                                : 'green' // running
                                            }`}></div>
                                        </div>
                                        <div className='machine-num'>{machine}</div>
                                        <div className="machine-type">[N/E]</div>
                                    </div>
                                    <div className='num-jobs'>{machineData[machine]?.jobid || '--'}</div>
                                    <div className='pages-left'>{machineData[machine]?.copies_left || '--'}</div>
                                    {/* <div className='note-env'>{machineData[machine]?.pen_life || '--'}</div> */}
                                    <div className='attributes'>{machineData[machine]?.status[0] || '--'}</div>
                                    <div className='running-type'>
                                        {machineData[machine]?.card_or_envelope === 'c'
                                            ? 'Card'
                                            : machineData[machine]?.card_or_envelope === 'e'
                                            ? 'Envelope'
                                            : 'Unknown'}
                                    </div>
                                    <div className='attributes'>
                                        {/* <div className='att-jira'>
                                            <p>JIRA</p>
                                        </div>
                                        <div className='bad-feeder'>
                                            <p>BAD FEED</p>
                                        </div> */}
                                    </div>
                                </button>
                                {selectedMachine === machine && (
                                    <div className='job-dropdown'>
                                        {loadingMachine === machine ? (
                                            <div className='loading'>Loading...</div>
                                        ) : (
                                            machineData[machine] ? (
                                                <div className='job-group'>
                                                    <h4 className='main-file-title'>{machineData[machine].filename || 'No file'}</h4>
                                                    <p className='page-count'>Copies Left: {machineData[machine].copies_left}</p>
                                                </div>
                                            ) : (
                                                <p className='no-jobs'>No data available.</p>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
};

export default Machines;
