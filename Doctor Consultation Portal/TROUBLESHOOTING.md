# Troubleshooting Guide - Doctor Consultation Portal

## Quick Diagnosis

### Step 1: Check Backend Status

**Open PowerShell in the backend folder:**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python main.py
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

**If you see errors:**
- **"Module not found"** → Run: `pip install -r requirements.txt`
- **"Can't connect to database"** → Check MySQL is running and `.env` file exists
- **"Port 8000 already in use"** → Stop other processes or change port

### Step 2: Check Frontend Status

**Open a NEW PowerShell window in the frontend folder:**
```powershell
cd frontend
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:3000/
```

**If you see errors:**
- **"npm: command not found"** → Install Node.js from https://nodejs.org/
- **"Port 3000 already in use"** → Change port in `vite.config.js`
- **"Cannot find module"** → Run: `npm install`

### Step 3: Verify Database

**Check if database is initialized:**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python init_db.py
```

**Expected Output:**
```
Database 'doctor_portal' created or already exists
Tables created successfully
Admin user created: username=admin, password=admin123
Database initialization completed!
```

## Common Issues and Solutions

### Issue 1: Backend Won't Start

**Symptoms:**
- Error messages when running `python main.py`
- "Module not found" errors

**Solutions:**

1. **Activate virtual environment:**
   ```powershell
   cd backend
   .\venv\Scripts\Activate.ps1
   ```
   You should see `(venv)` in your prompt.

2. **Install/Reinstall dependencies:**
   ```powershell
   pip install -r requirements.txt
   ```

3. **Check if .env file exists:**
   ```powershell
   Test-Path .env
   ```
   If False, create it (see HOW_TO_RUN.md)

### Issue 2: Database Connection Error

**Symptoms:**
- "Can't connect to MySQL server"
- "Access denied for user"

**Solutions:**

1. **Check MySQL is running:**
   - Open Services (Win+R → services.msc)
   - Find "MySQL" service
   - Ensure it's "Running"

2. **Verify .env file:**
   ```powershell
   cd backend
   Get-Content .env
   ```
   Check that DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME are correct

3. **Test database connection:**
   ```powershell
   .\venv\Scripts\Activate.ps1
   python -c "from database import engine; engine.connect(); print('Connected!')"
   ```

### Issue 3: Frontend Won't Start

**Symptoms:**
- "npm: command not found"
- Port errors
- Module not found errors

**Solutions:**

1. **Install Node.js:**
   - Download from https://nodejs.org/
   - Install and restart terminal

2. **Install dependencies:**
   ```powershell
   cd frontend
   npm install
   ```

3. **Check if port 3000 is in use:**
   ```powershell
   netstat -ano | findstr :3000
   ```
   If something is using it, change port in `vite.config.js`

### Issue 4: Frontend Can't Connect to Backend

**Symptoms:**
- "Network Error" in browser console
- API calls failing
- CORS errors

**Solutions:**

1. **Ensure backend is running:**
   - Backend must be running on http://localhost:8000
   - Check: Open http://localhost:8000 in browser (should show API info)

2. **Check CORS settings:**
   - In `backend/main.py`, ensure `allow_origins` includes `http://localhost:3000`

3. **Verify proxy settings:**
   - In `frontend/vite.config.js`, ensure proxy target is `http://localhost:8000`

### Issue 5: "Port Already in Use"

**Backend (Port 8000):**
```powershell
# Find what's using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or use a different port
uvicorn main:app --port 8001
```

**Frontend (Port 3000):**
- Change port in `frontend/vite.config.js`:
  ```js
  server: {
    port: 3001,  // Change from 3000
  }
  ```

### Issue 6: Login Not Working

**Symptoms:**
- Can't login with admin credentials
- "Incorrect username or password"

**Solutions:**

1. **Ensure database is initialized:**
   ```powershell
   cd backend
   .\venv\Scripts\Activate.ps1
   python init_db.py
   ```

2. **Default admin credentials:**
   - Username: `admin`
   - Password: `admin123`
   - Email: `admin@doctorportal.com`

3. **Check if admin user exists:**
   - Run `init_db.py` again (it won't create duplicate)

## Step-by-Step Startup Checklist

### First Time Setup:
- [ ] MySQL is installed and running
- [ ] Python 3.10+ is installed
- [ ] Node.js 18+ is installed
- [ ] Backend `.env` file exists with correct credentials
- [ ] Backend virtual environment is created
- [ ] Backend dependencies are installed (`pip install -r requirements.txt`)
- [ ] Database is initialized (`python init_db.py`)
- [ ] Frontend dependencies are installed (`npm install`)

### Every Time You Start:
- [ ] MySQL service is running
- [ ] Backend virtual environment is activated
- [ ] Backend server is running (`python main.py`)
- [ ] Frontend server is running (`npm run dev`)
- [ ] Browser opens to http://localhost:3000

## Testing the Application

### Test Backend:
1. Open http://localhost:8000 in browser
2. Should see: `{"message":"Doctor Appointment Portal API",...}`
3. Open http://localhost:8000/docs
4. Should see Swagger API documentation

### Test Frontend:
1. Open http://localhost:3000 in browser
2. Should see the home page
3. Try logging in with:
   - Username: `admin`
   - Password: `admin123`

## Getting Help

If none of these solutions work:

1. **Check error messages carefully** - They usually tell you what's wrong
2. **Verify all prerequisites** - Python, Node.js, MySQL versions
3. **Check file paths** - Ensure you're in the correct directory
4. **Review HOW_TO_RUN.md** - Detailed setup instructions
5. **Check console/terminal output** - Look for specific error messages

## Quick Commands Reference

```powershell
# Backend
cd backend
.\venv\Scripts\Activate.ps1
python init_db.py          # First time only
python main.py             # Start server

# Frontend (in new terminal)
cd frontend
npm install                # First time only
npm run dev                # Start server

# Check if running
# Backend: http://localhost:8000
# Frontend: http://localhost:3000
```

