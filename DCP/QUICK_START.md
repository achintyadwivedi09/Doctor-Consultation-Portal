# Quick start guide for the implementation post setup

## Step 1: Start Backend (Terminal 1)

```powershell
cd backend
python app.py
```

Wait for: `✅ Database connection successful!` and `Running on http://127.0.0.1:5000`

**Keep this terminal window open!**

## Step 2: Start Frontend (Terminal 2)

Open a **NEW** PowerShell window and run:

```powershell
cd C:\Users\achin\OneDrive\Desktop\Projects\DCP\frontend
npm install
npm start
```

The browser will automatically open to `http://localhost:3000`

## That's It! 🎉

You should now see:
- Backend running on: http://localhost:5000
- Frontend running on: http://localhost:3000
- Browser opened to the login page

## Troubleshooting

### "npm: command not found"
- Make sure Node.js is installed
- Check: `node --version` should show v20+

### "npm install" takes too long
- This is normal, first time install can take 2-5 minutes
- Make sure you have internet connection

### Port 3000 already in use
- Close any other React apps running
- Or change port in package.json scripts

