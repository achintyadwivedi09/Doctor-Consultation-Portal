# How to Run the Doctor Appointment Portal

## Languages Used

### 1. **Python** (Backend)
   - **Location**: `backend/` folder
   - **Files**:
     - `main.py` - FastAPI application (main server)
     - `database.py` - Database connection
     - `models.py` - Database models (SQLAlchemy)
     - `schemas.py` - Data validation (Pydantic)
     - `auth.py` - Authentication logic (JWT)
     - `init_db.py` - Database initialization script
   - **Purpose**: API server, database operations, authentication

### 2. **JavaScript/React** (Frontend)
   - **Location**: `frontend/` folder
   - **Files**:
     - `src/main.jsx` - React entry point
     - `src/App.jsx` - Main application component
     - `src/pages/` - All page components (Login, Dashboards)
     - `src/components/` - Reusable components
     - `src/contexts/` - React contexts (Auth)
     - `src/services/` - API service layer
   - **Purpose**: User interface, web pages, API calls

### 3. **SQL/MySQL** (Database)
   - **Location**: MySQL server
   - **Purpose**: Data storage (users, doctors, appointments, etc.)
   - **Managed by**: Python SQLAlchemy models

### 4. **HTML/CSS** (Frontend Styling)
   - **Location**: `frontend/src/index.css` (Tailwind CSS)
   - **Purpose**: Styling the web pages

---

## Project Structure

```
Doctor Consultation Portal/
│
├── backend/                    # Python/FastAPI Backend
│   ├── main.py                 # ⭐ START BACKEND HERE
│   ├── init_db.py             # Run this FIRST to setup database
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── auth.py
│   ├── requirements.txt       # Python dependencies
│   └── .env                    # Database credentials (create this)
│
├── frontend/                   # React/JavaScript Frontend
│   ├── src/
│   │   ├── main.jsx           # React entry point
│   │   ├── App.jsx
│   │   ├── pages/
│   │   ├── components/
│   │   └── services/
│   ├── package.json            # Node.js dependencies
│   └── vite.config.js
│
└── README.md                   # Full documentation
```

---

## Step-by-Step: How to Run the Project

### **PREREQUISITES** (Do this once)

1. **Install Python 3.10+**
   - Download from: https://www.python.org/downloads/
   - Check installation: `python --version`

2. **Install Node.js 18+**
   - Download from: https://nodejs.org/
   - Check installation: `node --version` and `npm --version`

3. **Install MySQL**
   - Download from: https://dev.mysql.com/downloads/
   - Or use XAMPP/WAMP which includes MySQL
   - Make sure MySQL service is running

---

### **STEP 1: Setup Backend (Python)**

#### 1.1 Navigate to Backend Folder

**If you're already in the project root directory:**
```bash
cd backend
```

**If you're starting from a different location (e.g., Desktop or Projects folder):**
```bash
# Windows PowerShell/Command Prompt
cd "Doctor Consultation Portal\backend"

# macOS/Linux
cd "Doctor Consultation Portal/backend"
```

**To check your current location:**
```bash
# Windows PowerShell
pwd

# Windows Command Prompt
cd

# macOS/Linux
pwd
```

#### 1.2 Create Virtual Environment
```bash
# Windows
python -m venv venv

# macOS/Linux
python3 -m venv venv
```

#### 1.3 Activate Virtual Environment
```bash
# Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# Windows (Command Prompt)
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```
*You should see `(venv)` in your terminal prompt*

#### 1.4 Install Python Dependencies
```bash
pip install -r requirements.txt
```

#### 1.5 Create Environment File (.env)
Create a file named `.env` in the `backend` folder:

**Windows (PowerShell):**
```powershell
New-Item .env
notepad .env
```

**macOS/Linux:**
```bash
touch .env
nano .env
```

**Add this content to .env:**
```env
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306
DB_NAME=doctor_portal
SECRET_KEY=your-secret-key-change-this-in-production
```
*Replace `your_mysql_password` with your actual MySQL password*

#### 1.6 Initialize Database (Run this FIRST!)
```bash
python init_db.py
```
*This creates the database, tables, and default admin user*

#### 1.7 Start Backend Server
```bash
python main.py
```

**✅ Success!** You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

**Backend is now running on:** `http://localhost:8000`

**Keep this terminal window OPEN!**

---

### **STEP 2: Setup Frontend (React)**

#### 2.1 Open a NEW Terminal Window
*Keep the backend terminal running!*

#### 2.2 Navigate to Frontend Folder

**If you're already in the project root directory:**
```bash
cd frontend
```

**If you're starting from a different location (e.g., Desktop or Projects folder):**
```bash
# Windows PowerShell/Command Prompt
cd "Doctor Consultation Portal\frontend"

# macOS/Linux
cd "Doctor Consultation Portal/frontend"
```

#### 2.3 Install Node.js Dependencies
```bash
npm install
```
*This may take a few minutes on first run*

#### 2.4 Start Frontend Development Server
```bash
npm run dev
```

**✅ Success!** You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
```

**Frontend is now running on:** `http://localhost:3000`

**Keep this terminal window OPEN too!**

---

### **STEP 3: Access the Application**

1. **Open your web browser**
2. **Go to:** `http://localhost:3000`
3. **You should see the home page!**

---

### **STEP 4: Login**

**Default Admin Credentials:**
- **Email:** `admin@doctorportal.com`
- **Password:** `admin123`

**Or register a new user:**
- Click "Sign Up" on the home page
- Fill in the form
- Choose role (Patient or Doctor)
- Login with new credentials

---

## File Execution Order

### First Time Setup:
```
1. backend/init_db.py          ← Run FIRST (creates database)
2. backend/main.py             ← Run SECOND (starts API server)
3. frontend: npm run dev       ← Run THIRD (starts web server)
```

### Every Time You Start:
```
1. backend/main.py             ← Start backend server
2. frontend: npm run dev       ← Start frontend server
3. Open browser to http://localhost:3000
```

---

## Running Commands Summary

### Backend Terminal:
```bash
cd backend
venv\Scripts\activate          # Windows
# OR
source venv/bin/activate         # macOS/Linux

python init_db.py                # First time only
python main.py                   # Every time
```

### Frontend Terminal:
```bash
cd frontend
npm install                      # First time only
npm run dev                      # Every time
```

---

## Troubleshooting

### "Module not found" error (Backend)
```bash
# Make sure venv is activated
venv\Scripts\activate            # Windows
source venv/bin/activate         # macOS/Linux

# Reinstall dependencies
pip install -r requirements.txt
```

### "npm: command not found" (Frontend)
- Install Node.js from https://nodejs.org/

### "Can't connect to database"
- Check MySQL is running
- Verify `.env` file has correct credentials
- Run `python init_db.py` again

### "Port 8000 already in use" (Backend)
```bash
# Use a different port
uvicorn main:app --port 8001
```

### "Port 3000 already in use" (Frontend)
- Change port in `frontend/vite.config.js`

---

## Quick Reference

| Component | Language | Location | Start Command |
|-----------|----------|----------|---------------|
| **Backend API** | Python | `backend/main.py` | `python main.py` |
| **Frontend UI** | React/JS | `frontend/` | `npm run dev` |
| **Database** | MySQL | MySQL Server | Auto-managed |
| **Init Script** | Python | `backend/init_db.py` | `python init_db.py` |

---

## What Happens When You Run:

### `python main.py` (Backend)
- Starts FastAPI server on port 8000
- Handles API requests from frontend
- Connects to MySQL database
- Provides authentication and CRUD operations

### `npm run dev` (Frontend)
- Starts Vite development server on port 3000
- Serves React application
- Connects to backend API (proxy to port 8000)
- Hot-reloads on code changes

### `python init_db.py` (One-time setup)
- Creates MySQL database if not exists
- Creates all tables (users, doctors, appointments, etc.)
- Creates default admin user
- Only needed once!

---

## Visual Guide

```
┌─────────────────────────────────────────┐
│  TERMINAL 1 (Backend)                   │
│  cd backend                              │
│  venv\Scripts\activate                  │
│  python main.py                         │
│  ✓ Running on http://localhost:8000     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  TERMINAL 2 (Frontend)                  │
│  cd frontend                             │
│  npm run dev                            │
│  ✓ Running on http://localhost:3000    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  BROWSER                                 │
│  http://localhost:3000                  │
│  ✓ Application is running!              │
└─────────────────────────────────────────┘
```

---

## Next Steps After Setup

1. **Login as Admin:**
   - Email: `admin@doctorportal.com`
   - Password: `admin123`

2. **Create Test Users:**
   - Register as Patient
   - Register as Doctor

3. **Create Doctor Profile:**
   - Login as Admin
   - Go to "Doctors" tab
   - Create doctor profile for registered doctor user

4. **Test Booking:**
   - Login as Patient
   - Search for doctors
   - Book an appointment

---

That's it! Your Doctor Appointment Portal is now running! 🎉

