const path = require('path');
const fs = require('fs');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 5173;

const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT);
const JSON_DIR = path.join(ROOT, 'JSONs');

if (!fs.existsSync(JSON_DIR)) fs.mkdirSync(JSON_DIR, { recursive: true });

const files = ['RLT1DS.json','RLT2DS.json','VALT1DS.json','VALT2DS.json','FinalOutput.json','sponsors.json','rloverlay.json'];
for (const f of files) {
  const p = path.join(JSON_DIR, f);
  if (!fs.existsSync(p)) {
    if (f === 'FinalOutput.json') {
      // Create FinalOutput.json with empty object initially
      fs.writeFileSync(p, '{}', 'utf8');
    } else if (f === 'sponsors.json') {
      // Create sponsors.json with empty array since we only store sponsors with data
      const emptySponsors = [];
      fs.writeFileSync(p, JSON.stringify(emptySponsors, null, 2), 'utf8');
    } else {
      // Create other files with empty object
      fs.writeFileSync(p, '{}', 'utf8');
    }
  }
}

app.use(express.json({ limit: '1mb' }));
app.use(express.static(PUBLIC_DIR));

// Add CORS headers to allow cross-origin requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.post('/api/save', (req, res) => {
  try {
    const { filename, data } = req.body || {};
    if (!filename || typeof data !== 'object') return res.status(400).json({ error: 'Invalid payload' });
    if (!files.includes(filename)) return res.status(400).json({ error: 'Unknown filename' });
    const target = path.join(JSON_DIR, filename);
    fs.writeFileSync(target, JSON.stringify(data, null, 2), 'utf8');
    res.json({ ok: true, file: path.relative(ROOT, target) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Sponsor-specific API endpoints
app.post('/api/save-sponsors', (req, res) => {
  try {
    const { sponsors } = req.body;
    if (!Array.isArray(sponsors)) {
      return res.status(400).json({ error: 'Invalid sponsor data structure - expected array' });
    }
    
    // Save combined sponsors data
    const sponsorsTarget = path.join(JSON_DIR, 'sponsors.json');
    fs.writeFileSync(sponsorsTarget, JSON.stringify(sponsors, null, 2), 'utf8');
    
    res.json({ ok: true, file: path.relative(ROOT, sponsorsTarget) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/load-sponsors', (req, res) => {
  try {
    const sponsorsTarget = path.join(JSON_DIR, 'sponsors.json');
    
    if (!fs.existsSync(sponsorsTarget)) {
      return res.status(404).json({ error: 'Sponsors file not found' });
    }
    
    const sponsorsData = fs.readFileSync(sponsorsTarget, 'utf8');
    const sponsors = JSON.parse(sponsorsData);
    
    res.json(sponsors);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/clear-sponsors', (req, res) => {
  try {
    // Clear sponsors - create empty array since we only store sponsors with data
    const sponsorsTarget = path.join(JSON_DIR, 'sponsors.json');
    const emptySponsors = [];
    fs.writeFileSync(sponsorsTarget, JSON.stringify(emptySponsors, null, 2), 'utf8');
    
    res.json({ ok: true, file: path.relative(ROOT, sponsorsTarget) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// RLOverlay API endpoints
app.get('/api/rloverlay', (req, res) => {
  try {
    const rloverlayPath = path.join(JSON_DIR, 'rloverlay.json');
    if (!fs.existsSync(rloverlayPath)) {
      return res.status(404).json({ error: 'RLOverlay data not found' });
    }
    const data = JSON.parse(fs.readFileSync(rloverlayPath, 'utf8'));
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/rloverlay', (req, res) => {
  try {
    const { data } = req.body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid data structure' });
    }
    const rloverlayPath = path.join(JSON_DIR, 'rloverlay.json');
    fs.writeFileSync(rloverlayPath, JSON.stringify(data, null, 2), 'utf8');
    res.json({ ok: true, file: 'rloverlay.json' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => console.log(`VMIX Control Panel: http://localhost:${PORT}`));