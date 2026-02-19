const https = require('https');
// Manual reading of .env.local because we are running this with node, not next
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const tokenMatch = envContent.match(/SPLITWISE_ACCESS_TOKEN=(.+)/);
const token = tokenMatch ? tokenMatch[1].trim() : null;

if (!token) {
    console.error('Could not find SPLITWISE_ACCESS_TOKEN in .env.local');
    process.exit(1);
}

const options = {
    hostname: 'secure.splitwise.com',
    path: '/api/v3.0/get_groups',
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`
    }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        if (res.statusCode !== 200) {
            console.error(`Error: ${res.statusCode}`, data);
            return;
        }
        const groups = JSON.parse(data).groups;
        console.log('--- Groups ---');
        groups.forEach(g => {
            console.log(`[GROUP] ID: ${g.id} | Name: "${g.name}"`);
        });
    });
});

req.on('error', (e) => {
    console.error(e);
});

req.end();
