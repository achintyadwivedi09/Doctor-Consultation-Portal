# Database Setup Guide

## Quick Overview

Your backend uses **MySQL** with the database name `dr_portal`. The connection is configured in `backend/app.py`.

## Step 1: Create Database

1. Open MySQL Command Line or MySQL Workbench
2. Run this command:
   ```sql
   CREATE DATABASE dr_portal;
   ```
3. Verify it exists:
   ```sql
   SHOW DATABASES;
   ```

## Step 2: Create Tables

You have two options:

### Option A: Using the SQL File (Recommended)
1. Open MySQL Workbench or MySQL Command Line
2. Import the `database_schema.sql` file:
   - In Workbench: File → Run SQL Script → Select `database_schema.sql`
   - In Command Line: `mysql -u root -p dr_portal < database_schema.sql`

### Option B: Manual Creation
Run these SQL commands:

```sql
USE dr_portal;

-- Admin Table
CREATE TABLE IF NOT EXISTS admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Doctor Table
CREATE TABLE IF NOT EXISTS doctor (
    doctor_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    availability VARCHAR(100) DEFAULT '9:00 AM - 5:00 PM',
    fees DECIMAL(10, 2) DEFAULT 500.00
);

-- Patient Table
CREATE TABLE IF NOT EXISTS patient (
    patient_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    age INT DEFAULT 0,
    gender VARCHAR(20),
    phone VARCHAR(20)
);

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    app_id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL,
    patient_id INT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patient(patient_id) ON DELETE CASCADE
);

-- Feedback Table (Optional)
CREATE TABLE IF NOT EXISTS feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT,
    rating INT CHECK (rating BETWEEN 1 AND 5)
);
```

## Step 3: Configure Connection

### Edit `backend/app.py` (lines 21-25):

```python
DB_CONFIG = {
    'host': 'localhost',
    'database': 'dr_portal',
    'user': 'root',              # Your MySQL username
    'password': 'your_password'  # Your MySQL password
}
```

**Important:** If your MySQL uses a different port (not 3306), add:
```python
DB_CONFIG = {
    'host': 'localhost',
    'port': 3306,  # Add this if different
    'database': 'dr_portal',
    'user': 'root',
    'password': 'your_password'
}
```

## Step 4: Test Connection

Before starting the Flask server, test your connection:

```bash
cd backend
python test_db_connection.py
```

This script will:
- ✅ Test MySQL connection
- ✅ Check if database exists
- ✅ Verify required tables are present
- ✅ Show data counts

Expected output:
```
✅ Successfully connected to MySQL database!
📊 Found 4 table(s) in database:
   - admin
   - doctor
   - patient
   - appointments
```

## Step 5: Create Sample Admin (Optional)

To login as admin, create an admin account:

```sql
USE dr_portal;
INSERT INTO admin (username, password) VALUES ('admin', 'admin123');
```

Then login with:
- Username: `admin`
- Password: `admin123`

## Troubleshooting

### "Access denied for user"
- Check username and password in `app.py`
- Verify MySQL user has privileges: `GRANT ALL ON dr_portal.* TO 'root'@'localhost';`

### "Unknown database 'dr_portal'"
- Create the database: `CREATE DATABASE dr_portal;`
- Then create tables using the schema

### "Table doesn't exist"
- Import `database_schema.sql` or run the CREATE TABLE commands manually

### "Can't connect to MySQL server"
- Check if MySQL service is running:
  - Windows: Services → MySQL
  - Or run: `net start MySQL80` (adjust version name)

### Connection works but Flask shows errors
- Make sure you're using the correct database name
- Check table names match exactly (case-sensitive on Linux/Mac)
- Verify foreign key constraints are properly set

## Verify Everything Works

1. **Test Database Connection:**
   ```bash
   cd backend
   python test_db_connection.py
   ```

2. **Start Flask Server:**
   ```bash
   python app.py
   ```
   You should see: `✅ Database connection successful!`

3. **Test API Endpoint:**
   Open browser: `http://localhost:5000/api/health`
   Should return: `{"status": "healthy", "database": "connected"}`

4. **Test Database Endpoint:**
   Open browser: `http://localhost:5000/api/test-db`
   Should show your tables and status

## Next Steps

Once database is set up:
1. ✅ Start Flask backend: `python app.py`
2. ✅ Start React frontend: `npm start` (in frontend folder)
3. ✅ Open browser: `http://localhost:3000`
4. ✅ Register users and test the application!

