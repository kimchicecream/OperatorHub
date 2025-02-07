// import fetch from 'node-fetch';

const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const axios = require('axios');
const http = require('http');
const net = require('net');
const fetch = require('node-fetch');
// const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 5001; // change for new machines

const allowedOrigins = [
    'http://localhost:5173',
    'https://alexharimgo.com'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.options('*', (req, res) => {
    const origin = allowedOrigins.includes(req.headers.origin) ? req.headers.origin : false;
    if (origin) {
        // res.header('Access-Control-Allow-Origin', "*");
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.header('Access-Control-Allow-Credentials', 'true');
    }
    res.sendStatus(200);
});

let cache = null;
let lastFetchedTime = 0;
let browser;

// keep puppeteer running for optimization
async function getBrowserInstance() {
    if (!browser) {
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--single-process',
                '--disable-gpu'
            ]
        });
    }
    return browser;
}

// SCRAPE reporting.handwrytten.com/performance
app.get('/api/scrape-performance', async (req, res) => {
    try {
        // if cached data exists and is less than 1 min old, return cache
        const now = Date.now();
        if (cache && now - lastFetchedTime < 1 * 60 * 1000) {
            return res.json(cache);
        }

        const browser = await getBrowserInstance();
        const page = await browser.newPage();

        await page.authenticate({
            username: 'report',
            password: 'K1CRvBnqJPC9'
        });

        await page.goto('https://reporting.handwrytten.com/performance', {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        await page.waitForSelector('g.trace text.number');
        const numbers = await page.evaluate(() =>
            Array.from(document.querySelectorAll('g.trace text.number')).map(el => el.textContent.trim())
        );

        await page.close();

        // save cache and timestamp
        cache = numbers;
        lastFetchedTime = Date.now();

        res.json(numbers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to scrape data' });
    }
});

let jobCache = {};
let jobLastFetched = {};

// define the keys to extract
const keysToExtract = [
    'card_id',
    'card_or_envelope',
    'copies_left',
    'filename',
    'jobid',
    'order_id',
    'pen_life',
    'status'
];

// const agent = new http.Agent({
//     keepAlive: false,
//     createConnection: (options, callback) => {
//         options.localAddress = '192.168.2.118';
//         return net.createConnection(options, callback);
//     }
// });

/* -------------------------------- */
/* -------- FETCH MACHINES -------- */
/* -------------------------------- */
app.get('/api/scrape-jobs', async (req, res) => {
    const machine = req.query.machine;

    if (!machine || isNaN(machine) || machine < 71 || machine > 110) {
        return res.status(400).json({ error: 'Invalid machine number (71-110).' });
    }

    const machineStatusUrl = `http://192.168.0.${machine}/machine_status`;

    try {
        const response = await axios.get(machineStatusUrl, {
            timeout: 5000
        });

        const jsonData = response.data;
        const extractedData = keysToExtract.reduce((acc, key) => {
            if (jsonData.hasOwnProperty(key)) acc[key] = jsonData[key];
            return acc;
        }, {});

        res.json({ extractedData });
    } catch (err) {
        console.error(`Error fetching machine status from ${machineStatusUrl}`);
        console.error('Detailed Error:', err);

        if (err.code === 'EHOSTUNREACH') {
            res.status(500).json({ error: `Machine ${machine} is unreachable. Check network.` });
        } else {
            res.status(500).json({ error: 'Failed to fetch machine status' });
        }
    }
});


// SCRAPE 192.168.0.91/jobs
// app.get('/api/scrape-jobs', async (req, res) => {
//     const machine = req.query.machine;

//     if (!machine || isNaN(machine) || machine < 71 || machine > 110) {
//         return res.status(400).json({ error: 'Invalid machine number (71-110).' });
//     }

//     // check if cache exists and is less than 1 min old
//     const now = Date.now();
//     if (jobCache[machine] && now - jobLastFetched[machine] < 1 * 60 * 1000) {
//         return res.json({ extractedData: jobCache[machine] });
//     }

//     try {
//         const browser = await getBrowserInstance(); // reuse the existing browser instance
//         const page = await browser.newPage();

//         await page.setViewport({ width: 800, height: 600 });
//         await page.setRequestInterception(true);
//         page.on('request', (req) => {
//             if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
//                 req.abort();
//             } else {
//                 req.continue();
//             }
//         });

//         const jobPageUrl = `http://192.168.0.${machine}/jobs`;
//         await page.goto(jobPageUrl, { waitUntil: 'domcontentloaded', timeout: 40000 });
//         await page.waitForSelector('tbody tr', { timeout: 15000 });

//         const extractedData = await page.evaluate(() => {
//             const rows = Array.from(document.querySelectorAll('tbody tr'));
//             let groupedData = [];
//             let currentGroup = null;

//             rows.forEach((row) => {
//                 const cells = Array.from(row.querySelectorAll('td'));
//                 const rowData = cells.map(td => td.textContent.trim());

//                 const hasPdf = cells.some(td => {
//                     const strong = td.querySelector('strong');
//                     return strong && strong.textContent.trim().endsWith('.pdf');
//                 });

//                 if (hasPdf) {
//                     if (currentGroup) groupedData.push(currentGroup);
//                     currentGroup = { pdfFile: rowData[0], dataRows: [] };
//                 } else if (currentGroup) {
//                     currentGroup.dataRows.push(rowData);
//                 }
//             });

//             if (currentGroup) groupedData.push(currentGroup);
//             return groupedData;
//         });

//         await page.close();

//         // Update cache
//         jobCache[machine] = extractedData;
//         jobLastFetched[machine] = Date.now();

//         res.json({ extractedData });
//     } catch (error) {
//         console.error('Error scraping job data:', error);
//         res.status(500).json({ error: 'Failed to scrape job data' });
//     }
// });

// close gracefully
process.on('exit', async () => {
    if (browser) {
        await browser.close();
    }
});

process.on('SIGINT', async () => {
    if (browser) {
        await browser.close();
    }
    process.exit();
});

// prevent backend crashes
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
