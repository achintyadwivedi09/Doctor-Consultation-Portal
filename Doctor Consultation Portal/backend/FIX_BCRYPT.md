# Fix Bcrypt Compatibility Issue

## The Problem
- You're using Python 3.13 (latest)
- bcrypt 5.0.0 is incompatible with passlib 1.7.4 on Python 3.13
- You need to use the VIRTUAL ENVIRONMENT (not global Python)

## Quick Fix (Run these commands one by one):

### Step 1: Navigate to backend folder
```powershell
cd backend
```

### Step 2: Activate virtual environment
```powershell
venv\Scripts\Activate.ps1
```
*(You should see `(venv)` in your prompt)*

### Step 3: Uninstall incompatible bcrypt
```powershell
pip uninstall bcrypt -y
```

### Step 4: Install compatible bcrypt version
```powershell
pip install bcrypt==4.1.2
```

### Step 5: Reinstall passlib
```powershell
pip install --force-reinstall passlib[bcrypt]==1.7.4
```

### Step 6: Now try init_db again
```powershell
python init_db.py
```

---

## Alternative: Use the batch file

Just double-click: `fix_bcrypt.bat`

---

## Important Notes:

**You MUST use the virtual environment!**

✅ **Correct way:**
```powershell
cd backend
venv\Scripts\Activate.ps1    # Activates venv (you'll see "(venv)" in prompt)
pip install ...               # Installs in venv
python init_db.py            # Uses venv Python
```

❌ **Wrong way (what you were doing):**
```powershell
pip install ...              # Installs globally - WRONG!
python backend/init_db.py    # Uses global Python - WRONG!
```

The virtual environment ensures all packages work together correctly!

