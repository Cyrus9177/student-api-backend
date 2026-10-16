const mongoose = require('mongoose');

const AttendanceEntrySchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: [true, 'Attendance date is required'],
      trim: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
    },
    status: {
      type: String,
      required: [true, 'Attendance status is required'],
      enum: {
        values: ['Present', 'Absent', 'Late'],
        message: 'Status must be Present, Absent, or Late',
      },
    },
  },
  { _id: false }
);

const AttendanceRecordSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: [true, 'studentName is required'],
      trim: true,
    },
    subjectName: {
      type: String,
      required: [true, 'subjectName is required'],
      trim: true,
    },
    section: {
      type: String,
      required: [true, 'section is required'],
      trim: true,
    },
    attendanceDates: {
      type: [AttendanceEntrySchema],
      default: [],
    },
  },
  {
    collection: 'daily_attendance',
    versionKey: false,
  }
);

module.exports =
  mongoose.models.AttendanceRecord ||
  mongoose.model('AttendanceRecord', AttendanceRecordSchema, 'daily_attendance');
