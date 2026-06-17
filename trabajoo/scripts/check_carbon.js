const https = require('https');

const urlArg = process.argv[2];
if (!urlArg) {
  console.error('Uso: node scripts/check_carbon.js <url>');
  process.exit(1);
}

const apiUrl = `https://api.websitecarbon.com/site?url=${encodeURIComponent(urlArg)}`;

https.get(apiUrl, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('URL:', json.url || urlArg);
      console.log('Green (low-carbon host):', json.green);
      if (json.statistics) {
        console.log('Bytes transferred:', json.statistics.bytes ?? 'N/A');
        if (json.statistics.co2) {
          console.log('CO2 (g):', json.statistics.co2 ?? 'N/A');
        }
        console.log('Energy (kWh):', json.statistics.energy ?? 'N/A');
      }
      console.log('\nFull response:');
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.error('Error parsing response:', e.message);
      console.error(data);
    }
  });
}).on('error', (e) => {
  console.error('Request error:', e.message);
});
