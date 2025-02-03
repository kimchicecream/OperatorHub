import { useState, useEffect } from 'react';
import './Machines.css';

function Machines() {
    const [machines] = useState(Array.from({ length: 110 - 71 + 1 }, (_, i) => i + 71));
    const [selectedMachine, setSelectedMachine] = useState(null);
    const [jobData, setJobData] = useState([]);
    const [pageCounts, setPageCounts] = useState({});
    const [jobCounts, setJobCounts] = useState({});
    const [noteEnvStatus, setNoteEnvStatus] = useState({});
    const [loadingMachine, setLoadingMachine] = useState(false);
    const [loading, setLoading] = useState();

    // const machinesColumn1 = Array.from({ length: (90 - 72) / 2 + 1 }, (_, i) => 72 + i * 2); // even: 72-90
    // const machinesColumn2 = Array.from({ length: (89 - 71) / 2 + 1 }, (_, i) => 71 + i * 2); // odd: 71-89
    // const machinesColumn3 = Array.from({ length: (109 - 91) / 2 + 1 }, (_, i) => 91 + i * 2); // odd: 91-109
    // const machinesColumn4 = Array.from({ length: (110 - 92) / 2 + 1 }, (_, i) => 92 + i * 2); // even: 92-110

    useEffect(() => {
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    async function fetchJobData(machine) {
        try {
            const response = await fetch(`http://localhost:5001/api/scrape-jobs?machine=${machine}`);
            const data = await response.json();

            // Ensure extractedData exists and is an array before using reduce
            const extractedData = Array.isArray(data.extractedData) ? data.extractedData : [];

            const totalPages = extractedData.reduce((sum, group) => sum + group.dataRows.length, 0);
            const totalJobs = extractedData.length;
            const status = determineNoteEnvStatus(extractedData);

            setJobData(prevData => ({
                ...prevData,
                [machine]: extractedData
            }));

            setPageCounts(prevCounts => ({
                ...prevCounts,
                [machine]: totalPages
            }));

            setJobCounts(prevCounts => ({
                ...prevCounts,
                [machine]: totalJobs
            }));

            setNoteEnvStatus(prevStatus => ({
                ...prevStatus,
                [machine]: status
            }));
        } catch (error) {
            console.error('Error fetching machine data:', error);

            setJobData(prevData => ({
                ...prevData,
                [machine]: []
            }));

            setPageCounts(prevCounts => ({
                ...prevCounts,
                [machine]: 0
            }));

            setJobCounts(prevCounts => ({
                ...prevCounts,
                [machine]: 0
            }));

            setNoteEnvStatus(prevStatus => ({
                ...prevStatus,
                [machine]: '--'
            }));
        }
    }

    function determineNoteEnvStatus(extractedData) {
        for (const group of extractedData) {
            if (group.pdfFile.endsWith('_envelope.pdf')) return 'Envelope';
            if (group.pdfFile.endsWith('_note.pdf')) return 'Note';
        }
        return '--';
    }

    useEffect(() => {
        machines.forEach(machine => {
            fetchJobData(machine);
        });

        const interval = setInterval(() => {
            machines.forEach(machine => {
                fetchJobData(machine);
            });
        }, 30000);

        return () => clearInterval(interval);
    }, [machines]);

    const totalJobs = Object.values(jobCounts).reduce((acc, count) => acc + count, 0);
    const totalOpenMachines = machines.filter(machine => jobCounts[machine] === 0).length;

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
                                            <div className={`led ${jobCounts[machine] > 0 ? 'green' : 'blue'}`}></div> {/* will have to adjust for down machines */}
                                        </div>
                                        <div className='machine-num'>{machine}</div>
                                        <div className='machine-type'>N/E</div>
                                    </div>
                                    <div className='num-jobs'>{jobCounts[machine] !== undefined ? `${jobCounts[machine]}` : '--'}</div>
                                    <div className='pages-left'>{pageCounts[machine] !== undefined ? `${pageCounts[machine]}` : '--'}</div>
                                    <div className='note-env'>{noteEnvStatus[machine]}</div>
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
                                            jobData[machine]?.length > 0 ? (
                                                jobData[machine].map((group, index) => (
                                                    <div key={index} className='job-group'>
                                                        <h4 className='main-file-title'>{group.pdfFile}</h4>
                                                        <p className='page-count'>Pages: {group.dataRows.length}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className='no-jobs'>No jobs found.</p>
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
