// backend/src/routes/adminRoutes.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// GET ADMIN DASHBOARD METRICS & OVERDUE COUNTS
router.get('/dashboard', authenticate, requireAdmin, async (req, res) => {
  try {
    const overdueDaysThreshold = parseInt(req.query.thresholdDays) || 3; // Default 3 days
    const overdueCutoffDate = new Date(Date.now() - overdueDaysThreshold * 24 * 60 * 60 * 1000);

    // Run parallel aggregation queries
    const [byStatus, byCategory, overdueCount, totalComplaints] = await Promise.all([
      prisma.complaint.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.complaint.groupBy({
        by: ['category'],
        _count: { category: true }
      }),
      prisma.complaint.count({
        where: {
          status: { not: 'RESOLVED' },
          createdAt: { lt: overdueCutoffDate }
        }
      }),
      prisma.complaint.count()
    ]);

    res.json({
      totalComplaints,
      overdueThresholdDays: overdueDaysThreshold,
      overdueCount,
      byStatus,
      byCategory
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard metrics', details: error.message });
  }
});

module.exports = router;