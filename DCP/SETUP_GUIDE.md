# Quick Setup Guide

## Step-by-Step Instructions

### Step 1: Configure Database Connection

**Option 1: Direct Configuration (Simple)**
1. Open `backend/app.py` in a text editor
2. Find the `DB_CONFIG` dictionary (around line 21-25)
3. Update with your MySQL credentials:
   ```python
   DB_CONFIG = {
       'host': 'localhost',
       'database': 'dr_portal',
       'user': 'root',          # Your MySQL username
       'password': 'your_password_here'  # Your MySQL password
   }
   ```
4. Save the file

**Option 2: Environment Variables (Recommended)**
1. Copy `backend/.env.example` to `backend/.env`
2. Update the values in `.env` file with your MySQL credentials

**Test Database Connection:**
Before starting the server, you can test your database connection:
```bash
cd backend
python test_db_connection.py
```

This will verify:
- ✅ MySQL connection works
- ✅ Database 'dr_portal' exists
- ✅ Required tables are present
- ✅ Show data counts

### Step 2: Install Backend Dependencies

Open PowerShell or Command Prompt in the project root and run:

```bash
cd backend
pip install -r requirements.txt
```

If `pip` doesn't work, try `pip3` or `python -m pip install -r requirements.txt`

### Step 3: Install Frontend Dependencies

In a new terminal window:

```bash
cd frontend
npm install
```

This will install React, React Router, Axios, and TailwindCSS (all React dependencies).

If npm is not found, make sure Node.js is installed.

### Step 4: Start the Backend Server

Keep the backend terminal open and run:

```bash
cd backend
python app.py
```

You should see: `Running on http://127.0.0.1:5000`

### Step 5: Start the Frontend Server

Open a NEW terminal window and run:

```bash
cd frontend
npm start
```

The browser should automatically open to `http://localhost:3000`

## Testing the Application

### Test User Registration:

1. Go to "Sign up" page
2. Create a Patient account:
   - Name: John Doe
   - Email: john@test.com
   - Password: test123

3. Create a Doctor account:
   - Name: Dr. Smith
   - Email: drsmith@test.com
   - Password: test123
   - Specialization: Cardiology
   - Fees: 1000

### Test Admin Login:

Make sure you have an admin entry in your database:
```sql
INSERT INTO admin (username, password) VALUES ('admin', 'admin123');
```

Then login with:
- Username: admin
- Password: admin123

## Common Issues

**Issue: "ModuleNotFoundError: No module named 'flask'"**
- Solution: Make sure you ran `pip install -r requirements.txt` in the backend folder

**Issue: "Error connecting to MySQL"**
- Solution: 
  1. Run `python test_db_connection.py` in the backend folder to diagnose
  2. Check if MySQL server is running (check Services on Windows)
  3. Verify database name is `dr_portal` (create it if it doesn't exist)
  4. Check username/password in `backend/app.py` (line 21-25)
  5. If MySQL uses a different port, add `'port': 3306` to DB_CONFIG

**Issue: "Database connection failed" when starting Flask**
- Solution:
  1. Run `python test_db_connection.py` first to see the exact error
  2. Make sure MySQL is installed and running
  3. Create the database: `CREATE DATABASE dr_portal;`
  4. Run the schema file: Import `database_schema.sql` into MySQL

**Issue: "npm ERR! code ELIFECYCLE"**
- Solution: Delete `node_modules` folder in frontend and run `npm install` again

**Issue: "Port 5000 already in use"**
- Solution: Kill the process using port 5000 or change the port in `app.py` line 396

## Project is Ready!

Once both servers are running, you can:
- Register new users
- Login with different roles
- Book appointments as a patient
- Manage appointments as a doctor
- Admin dashboard for system management

Good luck with your presentation! 🎉

