require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const path = require('path');

const accountsRoute = require('./routes/accounts');
const ginvestRoute = require('./routes/ginvest');
const rebalanceRoute = require('./routes/rebalance');
const liabilitiesRoute = require('./routes/liabilities');
const syncRoute = require('./routes/sync');
const analyticsRoute = require('./routes/analytics');
const systemRoute = require('./routes/system');
const dataStore = require('./services/dataStore');
const accrualEngine = require('./services/accrualEngine');
const navpuScraper = require('./services/navpuScraper');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5001;

// Initialize Midnight Net Yield Accrual Engine (12:01 AM Asia/Manila Cron)
accrualEngine.init();

// Initialize Daily 6:00 PM PHT NAVPU Valuation Worker (Asia/Manila Cron)
navpuScraper.initScheduler();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/accounts', accountsRoute);
app.use('/api/ginvest', ginvestRoute);
app.use('/api/rebalance', rebalanceRoute);
app.use('/api/liabilities', liabilitiesRoute);
app.use('/api/sync', syncRoute);
app.use('/api/sync-data', syncRoute);
app.use('/api/analytics', analyticsRoute);
app.use('/api/system', systemRoute);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'DV Financials Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Setup WebSocket Server for Live Real-Time Data Push
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  ws.isAlive = true;
  console.log('[WebSocket] Client connected to live market & sync feed');

  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('error', (error) => {
    // Gracefully handle socket write aborts, reset, or proxy disconnects
    if (error.code === 'ECONNABORTED' || error.code === 'ECONNRESET' || error.code === 'EPIPE') {
      console.log(`[WebSocket] Client connection reset (${error.code})`);
    } else {
      console.warn('[WebSocket Error]:', error.message);
    }
  });

  // Send initial handshake state safely
  try {
    const db = dataStore.getDb();
    if (ws.readyState === 1) {
      ws.send(JSON.stringify({
        event: 'INIT_STATE',
        timestamp: new Date().toISOString(),
        profile: db.profile
      }));
    }
  } catch (err) {
    // ignore initial send error
  }

  ws.on('message', (message) => {
    try {
      const parsed = JSON.parse(message);
      if (parsed.type === 'PING') {
        if (ws.readyState === 1) {
          ws.send(JSON.stringify({ event: 'PONG', timestamp: new Date().toISOString() }));
        }
      }
    } catch (e) {
      // ignore malformed message
    }
  });

  ws.on('close', () => {
    console.log('[WebSocket] Client disconnected');
  });
});

wss.on('error', (err) => {
  console.warn('[WebSocket Server Error]:', err.message);
});

// Periodic heartbeat to terminate dead sockets
const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      return ws.terminate();
    }
    ws.isAlive = false;
    try {
      ws.ping();
    } catch (e) {}
  });
}, 30000);

wss.on('close', () => {
  clearInterval(heartbeatInterval);
});

// Broadcast helper
function broadcastEvent(event, data) {
  const payload = JSON.stringify({ event, data, timestamp: new Date().toISOString() });
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      try {
        client.send(payload);
      } catch (err) {
        // ignore write error on closing client
      }
    }
  });
}

// Global server client error handler
server.on('clientError', (err, socket) => {
  if (err.code === 'ECONNRESET' || !socket.writable) {
    return;
  }
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

// Start Server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`  🚀 DV FINANCIALS BACKEND RUNNING ON PORT: ${PORT}`);
  console.log(`  🔗 REST API:  http://localhost:${PORT}/api/health`);
  console.log(`  ⚡ WEBSOCKET: ws://localhost:${PORT}/ws`);
  console.log(`====================================================`);
});


