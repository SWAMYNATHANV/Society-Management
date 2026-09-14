// backend/src/routes/complaintRoutes.js
const sendEmail = require('../utils/sendEmail');
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// 1. CREATE COMPLAINT (Resident & Admin)
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, category, description, photoUrl, priority } = req.body;

    // Prisma allows us to create the complaint AND the first history log in one step
    const complaint = await prisma.complaint.create({
      data: {
        title,
        category,
        description,
        photoUrl,
        priority: priority || 'LOW',
        userId: req.user.userId,
        history: {
          create: {
            status: 'OPEN',
            note: 'Complaint submitted by resident',
            changedById: req.user.userId,
          }
        }
      },
      include: { history: true } // Return the history in the response
    });

    res.status(201).json({ message: 'Complaint created successfully', complaint });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create complaint', details: error.message });
  }
});

// 2. FETCH COMPLAINTS (Filtered based on Role)
router.get('/', authenticate, async (req, res) => {
  try {
    const { category, status, priority } = req.query;
    let whereClause = {};

    // If the user is a RESIDENT, forcefully restrict the query to only their complaints
    if (req.user.role === 'RESIDENT') {
      whereClause.userId = req.user.userId;
    } else {
      // If the user is an ADMIN, allow them to use the query filters
      if (category) whereClause.category = category;
      if (status) whereClause.status = status;
      if (priority) whereClause.priority = priority;
    }

    const complaints = await prisma.complaint.findMany({
      where: whereClause,
      include: {
        // Fetch the full lifecycle history for each ticket, newest first
        history: { orderBy: { createdAt: 'desc' } },
        user: { select: { name: true, email: true } } 
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch complaints', details: error.message });
  }
});

// 3. UPDATE COMPLAINT STATUS (Admin Only)
router.patch('/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    // We use a Prisma Transaction to guarantee both database updates succeed, 
    // or if one fails, they both roll back cleanly.
    const [updatedComplaint, newHistory] = await prisma.$transaction([
      prisma.complaint.update({
        where: { id },
        data: { status }
      }),
      prisma.complaintHistory.create({
        data: {
          complaintId: id,
          status,
          note: note || `Status changed to ${status}`,
          changedById: req.user.userId
        }
      })
    ]);

    try {
   // ... your email sending code goes in here ...
} catch (emailError) {
   console.log("Status updated, but email failed to send:", emailError.message);
}

// ALWAYS send the success response to the frontend
res.json({ message: 'Status updated successfully', updatedComplaint });

  // Ensure the ticket user exists and has an email before sending
    const ticketOwner = await prisma.user.findUnique({
      where: { id: updatedComplaint.userId },
      select: { email: true, name: true }
    });

    if (ticketOwner) {
      const emailSubject = `Update on your Maintenance Complaint: ${updatedComplaint.title}`;
      const emailBody = `Hello ${ticketOwner.name},\n\nThe status of your complaint "${updatedComplaint.title}" has been updated to: ${status}.\n\nAdmin Note: ${note || 'No additional notes provided.'}\n\nThank you,\nSociety Admin Team`;
      
      // We do not 'await' this function because we don't want a slow email server 
      // to delay the API response back to the admin frontend.
      sendEmail(ticketOwner.email, emailSubject, emailBody);
    }

    res.json({ message: 'Status updated successfully', updatedComplaint, newHistory });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status', details: error.message });
  }
});

// DELETE COMPLAINT
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Optional: Verify the complaint exists first
    const complaint = await prisma.complaint.findUnique({ where: { id } });
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Delete it from the database
    await prisma.complaint.delete({ where: { id } });
    
    res.json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete complaint', details: error.message });
  }
});

// UPDATE COMPLAINT STATUS (Admin Only)
router.patch('/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedComplaint = await prisma.complaint.update({
      where: { id },
      data: { status },
    });

    res.json({ message: 'Status updated successfully', updatedComplaint });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status', details: error.message });
  }
});

module.exports = router;