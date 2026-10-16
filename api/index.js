const connectToDatabase = require('../db');
const AttendanceRecord = require('../models/AttendanceRecord');

const VALID_STATUSES = ['Present', 'Absent', 'Late'];
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function setCorsHeaders(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
}

module.exports = async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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

  if (req.method === 'GET') {
    try {
      const records = await AttendanceRecord.find({})
        .sort({ subjectName: 1, section: 1, studentName: 1 })
        .lean();

      return res.status(200).json(records);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve attendance records.',
        details: error.message,
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      const { studentName, subjectName, section, attendanceDates } = body;

      if (
        typeof studentName !== 'string' ||
        !studentName.trim() ||
        typeof subjectName !== 'string' ||
        !subjectName.trim() ||
        typeof section !== 'string' ||
        !section.trim()
      ) {
        return res.status(400).json({
          success: false,
          error: 'studentName, subjectName, and section are required non-empty strings.',
        });
      }

      let normalizedDates = [];
      if (attendanceDates !== undefined) {
        if (!Array.isArray(attendanceDates)) {
          return res.status(400).json({
            success: false,
            error: 'attendanceDates must be an array of { date, status } objects.',
          });
        }

        const seenDates = new Set();
        for (const entry of attendanceDates) {
          if (
            !entry ||
            typeof entry.date !== 'string' ||
            !DATE_REGEX.test(entry.date.trim())
          ) {
            return res.status(400).json({
              success: false,
              error: 'Each attendance entry must have a valid date in YYYY-MM-DD format.',
            });
          }

          if (!VALID_STATUSES.includes(entry.status)) {
            return res.status(400).json({
              success: false,
              error: 'Attendance status must be Present, Absent, or Late.',
            });
          }

          const cleanDate = entry.date.trim();
          if (seenDates.has(cleanDate)) {
            return res.status(409).json({
              success: false,
              error: `Duplicate attendance date "${cleanDate}" provided in attendanceDates.`,
            });
          }
          seenDates.add(cleanDate);
          normalizedDates.push({ date: cleanDate, status: entry.status });
        }
      }

      const createdRecord = await AttendanceRecord.create({
        studentName: studentName.trim(),
        subjectName: subjectName.trim(),
        section: section.trim(),
        attendanceDates: normalizedDates,
      });

      return res.status(201).json(createdRecord);
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
        error: 'Failed to create student attendance record.',
        details: error.message,
      });
    }
  }

  res.setHeader('Allow', 'GET, POST, OPTIONS');
  return res.status(405).json({
    success: false,
    error: `Method ${req.method} Not Allowed.`,
  });
};
