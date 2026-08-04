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
const dataStore = require('./services/dataStore');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5001;

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
app.use('/api/analytics', analyticsRoute);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'FinFlow Pro Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Setup WebSocket Server for Live Real-Time Data Push
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('[WebSocket] Client connected to live market & sync feed');
  
  // Send initial handshake state
  const db = dataStore.getDb();
  ws.send(JSON.stringify({
    event: 'INIT_STATE',
    timestamp: new Date().toISOString(),
    profile: db.profile
  }));

  ws.on('message', (message) => {
    try {
      const parsed = JSON.parse(message);
      if (parsed.type === 'PING') {
        ws.send(JSON.stringify({ event: 'PONG', timestamp: new Date().toISOString() }));
      }
    } catch (e) {
      // ignore
    }
  });

  ws.on('close', () => {
    console.log('[WebSocket] Client disconnected');
  });
});

// Broadcast helper
function broadcastEvent(event, data) {
  const payload = JSON.stringify({ event, data, timestamp: new Date().toISOString() });
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(payload);
    }
  });
}

// Start Server
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  🚀 FINFLOW PRO BACKEND RUNNING ON PORT: ${PORT}`);
  console.log(`  🔗 REST API:  http://localhost:${PORT}/api/health`);
  console.log(`  ⚡ WEBSOCKET: ws://localhost:${PORT}/ws`);
  console.log(`====================================================`);
});
