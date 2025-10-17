const path = require('path');
const fs = require('fs');
const express = require('express');
const net = require('net');
const readline = require('readline');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 5173;

const ROOT = __dirname;

// Function to check if port is in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => {
        resolve(false);
      });
      server.close();
    });
    server.on('error', () => {
      resolve(true);
    });
  });
}

// Function to kill process on port (Windows-specific)
function killProcessOnPort(port) {
  return new Promise((resolve, reject) => {
    exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }
      
      const lines = stdout.trim().split('\n');
      const pids = new Set();
      
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5) {
          const pid = parts[4];
          if (pid && pid !== '0') {
            pids.add(pid);
          }
        }
      }
      
      if (pids.size === 0) {
        resolve('No process found on port');
        return;
      }
      
      // Kill all processes using the port
      let killedCount = 0;
      for (const pid of pids) {
        exec(`taskkill /PID ${pid} /F`, (killError) => {
          if (!killError) {
            killedCount++;
          }
          if (killedCount === pids.size) {
            resolve(`Killed ${killedCount} process(es) on port ${port}`);
          }
        });
      }
    });
  });
}

// Function to prompt user for action
function promptUser() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    console.log('\n⚠️  Another instance appears to be running on port 5173');
    console.log('What would you like to do?');
    console.log('T - Terminate the existing instance and start a new one');
    console.log('C - Cancel and exit');
    console.log('');
    
    rl.question('Enter your choice (T/C): ', (answer) => {
      rl.close();
      resolve(answer.trim().toUpperCase());
    });
  });
}
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

// File write with retry logic to handle EBUSY errors
function writeFileWithRetry(filePath, data, maxRetries = 3, delay = 100) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    function attemptWrite() {
      attempts++;
      
      try {
        // Use writeFile instead of writeFileSync to avoid blocking
        fs.writeFile(filePath, data, 'utf8', (err) => {
          if (err) {
            if (err.code === 'EBUSY' && attempts < maxRetries) {
              console.log(`[Server] File busy, retrying in ${delay}ms (attempt ${attempts}/${maxRetries})`);
              setTimeout(attemptWrite, delay);
              return;
            }
            reject(err);
            return;
          }
          resolve();
        });
      } catch (syncErr) {
        if (syncErr.code === 'EBUSY' && attempts < maxRetries) {
          console.log(`[Server] File busy, retrying in ${delay}ms (attempt ${attempts}/${maxRetries})`);
          setTimeout(attemptWrite, delay);
          return;
        }
        reject(syncErr);
      }
    }
    
    attemptWrite();
  });
}

app.post('/api/save', async (req, res) => {
  try {
    const { filename, data } = req.body || {};
    if (!filename || typeof data !== 'object') return res.status(400).json({ error: 'Invalid payload' });
    if (!files.includes(filename)) return res.status(400).json({ error: 'Unknown filename' });
    
    const target = path.join(JSON_DIR, filename);
    const jsonData = JSON.stringify(data, null, 2);
    
    // Use retry logic for file writes
    await writeFileWithRetry(target, jsonData);
    
    res.json({ ok: true, file: path.relative(ROOT, target) });
  } catch (e) { 
    console.error('[Server] Save error:', e);
    res.status(500).json({ error: e.message }); 
  }
});

// Sponsor-specific API endpoints
app.post('/api/save-sponsors', async (req, res) => {
  try {
    const { sponsors } = req.body;
    if (!Array.isArray(sponsors)) {
      return res.status(400).json({ error: 'Invalid sponsor data structure - expected array' });
    }
    
    // Save combined sponsors data
    const sponsorsTarget = path.join(JSON_DIR, 'sponsors.json');
    const jsonData = JSON.stringify(sponsors, null, 2);
    await writeFileWithRetry(sponsorsTarget, jsonData);
    
    res.json({ ok: true, file: path.relative(ROOT, sponsorsTarget) });
  } catch (e) {
    console.error('[Server] Save sponsors error:', e);
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

app.post('/api/clear-sponsors', async (req, res) => {
  try {
    // Clear sponsors - create empty array since we only store sponsors with data
    const sponsorsTarget = path.join(JSON_DIR, 'sponsors.json');
    const emptySponsors = [];
    const jsonData = JSON.stringify(emptySponsors, null, 2);
    await writeFileWithRetry(sponsorsTarget, jsonData);
    
    res.json({ ok: true, file: path.relative(ROOT, sponsorsTarget) });
  } catch (e) {
    console.error('[Server] Clear sponsors error:', e);
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

app.post('/api/rloverlay', async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid data structure' });
    }
    const rloverlayPath = path.join(JSON_DIR, 'rloverlay.json');
    const jsonData = JSON.stringify(data, null, 2);
    await writeFileWithRetry(rloverlayPath, jsonData);
    res.json({ ok: true, file: 'rloverlay.json' });
  } catch (e) {
    console.error('[Server] Save rloverlay error:', e);
    res.status(500).json({ error: e.message });
  }
});

// Shutdown endpoint
app.post('/api/shutdown', (req, res) => {
  console.log('Shutdown requested via API');
  res.json({ message: 'Shutting down...' });
  setTimeout(() => {
    process.exit(0);
  }, 100);
});

// Start server with instance checking
async function startServer() {
  try {
    const portInUse = await isPortInUse(PORT);
    
    if (portInUse) {
      const choice = await promptUser();
      
      if (choice === 'C') {
        console.log('Cancelled. Exiting...');
        process.exit(0);
      } else if (choice === 'T') {
        console.log('Attempting to terminate existing instance...');
        try {
          const result = await killProcessOnPort(PORT);
          console.log(result);
          console.log('Waiting 2 seconds for processes to terminate...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.log('Error terminating existing instance:', error.message);
          console.log('Proceeding anyway...');
        }
      } else {
        console.log('Invalid choice. Exiting...');
        process.exit(0);
      }
    }
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`VMIX Control Panel: http://localhost:${PORT}`);
      console.log('Instance checker: Active');
    });
    
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();