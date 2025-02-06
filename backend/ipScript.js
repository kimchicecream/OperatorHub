// const os = require('os');

// const interfaces = os.networkInterfaces();

// for (const [name, ifaceArray] of Object.entries(interfaces)) {
//     ifaceArray.forEach(iface => {
//         if (!iface.internal && iface.family === 'IPv4') {
//             console.log(`Interface: ${name}, Address: ${iface.address}`);
//         }
//     });
// }

const ping = require('ping');

async function isMachineReachable(ip) {
    const res = await ping.promise.probe(ip);
    return res.alive;
}

// Usage inside your route:
const isReachable = await isMachineReachable(`192.168.0.${machine}`);
if (!isReachable) {
    return res.status(500).json({ error: `Machine ${machine} is not reachable over the network.` });
}
