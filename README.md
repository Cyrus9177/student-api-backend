# Student Laboratory Attendance API Backend (`student-api-backend`)

> **Node.js + Mongoose + Vercel Serverless Functions + MongoDB Atlas**  
> Serverless backend API for the University Laboratory Attendance Management System, connecting the public **GitHub Pages** frontend to the **`LabAttendanceDBBAUTISTA.daily_attendance`** collection on **MongoDB Atlas**.

---

## 🔗 Live Deployment & Repository Links

| Resource | Link | Description |
| :--- | :--- | :--- |
| **⚡ Live Backend API (`GET` / `POST`)** | **[https://student-api-backend-fawn.vercel.app/api](https://student-api-backend-fawn.vercel.app/api)** | Retrieve all records or register a new student document |
| **⚡ Live Attendance Endpoint (`POST`)** | `https://student-api-backend-fawn.vercel.app/api/attendance` | Append a laboratory attendance date to an existing student |
| **🌐 Live Frontend (GitHub Pages)** | **[https://cyrus9177.github.io/student-frontend/](https://cyrus9177.github.io/student-frontend/)** | Public web application interface hosted on GitHub Pages |
| **🛠️ Backend Repository** | **[https://github.com/Cyrus9177/student-api-backend](https://github.com/Cyrus9177/student-api-backend)** | Source code for this Vercel Serverless API |
| **📦 Frontend Repository** | **[https://github.com/Cyrus9177/student-frontend](https://github.com/Cyrus9177/student-frontend)** | Source code for the GitHub Pages frontend |

---

## 📁 Project Structure

```text
student-api-backend/
├── api/
│   ├── index.js          # GET /api (fetch roster) & POST /api (create student)
│   └── attendance.js     # POST /api/attendance (append date, prevent duplicates)
├── models/
│   └── AttendanceRecord.js # Mongoose schema bound to 'daily_attendance'
├── db.js                 # global.mongoose connection caching for serverless execution
├── .env.example          # Placeholder for MONGODB_URI
├── .gitignore            # Excludes node_modules, .env, .vercel
└── package.json
```

---

## 🔐 Environment Variables (Configured on Vercel)

| Variable | Description |
| :--- | :--- |
| `MONGODB_URI` | MongoDB Atlas connection string (`mongodb+srv://...`) stored securely in Vercel Project Settings |
| `MONGODB_DB` *(Optional)* | Defaults automatically to `LabAttendanceDBBAUTISTA` |
