const mongoose = require('mongoose');
const connectToDatabase = require('../db');
const AttendanceRecord = require('../models/AttendanceRecord');

const VALID_STATUSES = ['Present', 'Absent', 'Late'];
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function setCorsHeaders(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
}

module.exports = async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} Not Allowed.`,
    });
  }

  try {
    await connectToDatabase();
  } catch (dbError) {
    return res.status(500).json({
      success: false,
      error: 'Failed to connect to MongoDB Atlas.',
      details: dbError.message,
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const { studentId, date, status } = body;

    if (!studentId || typeof studentId !== 'string' || !mongoose.Types.ObjectId.isValid(studentId.trim())) {
      return res.status(400).json({
        success: false,
        error: 'A valid MongoDB studentId is required.',
      });
    }

    if (!date || typeof date !== 'string' || !DATE_REGEX.test(date.trim())) {
      return res.status(400).json({
        success: false,
        error: 'A valid date in YYYY-MM-DD format is required.',
      });
    }

    const parsedDate = new Date(`${date.trim()}T00:00:00Z`);
    if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date.trim()) {
      return res.status(400).json({
        success: false,
        error: `Invalid calendar date "${date.trim()}". Use a real YYYY-MM-DD date.`,
      });
    }

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status is required and must be Present, Absent, or Late.',
      });
    }

    const cleanId = studentId.trim();
    const cleanDate = date.trim();

    const student = await AttendanceRecord.findById(cleanId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: `Student record with ID "${cleanId}" was not found.`,
      });
    }

    const existingDates = Array.isArray(student.attendanceDates) ? student.attendanceDates : [];
    const alreadyExists = existingDates.some((entry) => {
      if (typeof entry === 'string') {
        return entry === cleanDate;
      }
      return entry && entry.date === cleanDate;
    });

    if (alreadyExists) {
      return res.status(409).json({
        success: false,
        error: `Attendance for ${student.studentName} on ${cleanDate} is already recorded.`,
      });
    }

    // Atomic update that also guards against race-condition duplicate dates
    const updatedStudent = await AttendanceRecord.findOneAndUpdate(
      {
        _id: cleanId,
        'attendanceDates.date': { $ne: cleanDate },
      },
      {
        $push: {
          attendanceDates: {
            date: cleanDate,
            status,
          },
        },
      },
      {
        returnDocument: 'after',
        runValidators: true,
      }
    ).lean();

    if (!updatedStudent) {
      return res.status(409).json({
        success: false,
        error: `Attendance for ${student.studentName} on ${cleanDate} is already recorded.`,
      });
    }

    return res.status(200).json(updatedStudent);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid JSON request body.',
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Failed to add attendance entry.',
      details: error.message,
    });
  }
};
