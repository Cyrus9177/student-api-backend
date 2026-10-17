# Student API Backend

Serverless API backend built with Node.js, Mongoose, and Vercel Serverless Functions connected to MongoDB Atlas (`LabAttendanceDBBAUTISTA.daily_attendance`).

## Endpoints

- `GET /api` — Retrieve all student attendance records from `daily_attendance`.
- `POST /api` — Create a new student attendance record.
- `POST /api/attendance` — Append a laboratory attendance date (`Present`, `Absent`, or `Late`) to an existing student record.
