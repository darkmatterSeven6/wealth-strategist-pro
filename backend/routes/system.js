const express = require('express');
const router = express.Router();
const gitSyncService = require('../services/gitSyncService');
const dataStore = require('../services/dataStore');

// POST /api/system/save-and-push - Flush local DB and commit/push to GitHub
router.post('/save-and-push', async (req, res) => {
  try {
    const { message } = req.body || {};
    const result = await gitSyncService.saveAndPush(message);
    res.json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
      localSaved: false,
      githubPushed: false
    });
  }
});

// GET /api/system/sync-status - Check git status & uncommitted changes
router.get('/sync-status', async (req, res) => {
  try {
    const status = await gitSyncService.getStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/system/shutdown - Graceful exit
router.post('/shutdown', (req, res) => {
  res.json({
    success: true,
    message: 'DV Financials backend shutting down gracefully.'
  });

  console.log('[System] Exit request received. Shutting down gracefully...');
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

module.exports = router;
