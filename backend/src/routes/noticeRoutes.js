const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

// GET all notices (Residents & Admins)
router.get('/', authenticate, async (req, res) => {
  try {
    const notices = await prisma.notice.findMany({ 
      orderBy: { createdAt: 'desc' } 
    });
    res.json(notices);
  } catch (error) {
    // 1. ADDED HERE FOR THE GET ROUTE
    console.error("Notice GET Error:", error); 
    res.status(500).json({ error: 'Failed to fetch notices' });
  }
});

// POST new notice (Admins Only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, content, isUrgent } = req.body;
    const newNotice = await prisma.notice.create({
      data: { 
        title, 
        content, 
        isImportant: isUrgent, // <-- Maps the data to match your database schema
        createdBy: {
          connect: { id: req.user.userId } 
        }
      }
    });
    res.status(201).json(newNotice);
  } catch (error) {
    console.error("Notice POST Error:", error); 
    res.status(500).json({ error: 'Failed to create notice' });
  }
});

// DELETE a notice (Admins Only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.notice.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    console.error("Notice DELETE Error:", error); 
    res.status(500).json({ error: 'Failed to delete notice' });
  }
});
module.exports = router;