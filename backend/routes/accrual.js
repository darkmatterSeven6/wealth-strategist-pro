const express = require('express');
const router = express.Router();
const accrualEngine = require('../services/accrualEngine');

// Dry-run test endpoint for Daily Accrual
router.post('/trigger-daily-test', async (req, res) => {
  try {
    const result = await accrualEngine.runDailyAccrual(true);
    res.json({
      success: true,
      message: 'Accrual engine dry-run test triggered successfully',
      data: result
    });
  } catch (err) {
    console.error('Error triggering daily accrual:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
