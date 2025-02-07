const axios = require('axios');

async function testAxios() {
    try {
        console.log('🔵 Attempting to connect...');
        const response = await axios.get('http://192.168.0.94/machine_status', {
            timeout: 5000,
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json, text/plain, */*'
            }
        });
        console.log('✅ Successfully connected! Status:', response.status);
    } catch (error) {
        console.error('❌ Failed to connect:', error.message);
    }
}

testAxios();
