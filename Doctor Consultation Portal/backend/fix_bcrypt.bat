@echo off
echo Fixing bcrypt compatibility issue...
echo.
echo Step 1: Activating virtual environment...
call venv\Scripts\activate
echo.
echo Step 2: Uninstalling incompatible bcrypt...
pip uninstall bcrypt -y
echo.
echo Step 3: Installing compatible bcrypt version...
pip install bcrypt==4.1.2
echo.
echo Step 4: Reinstalling passlib with bcrypt support...
pip install --force-reinstall passlib[bcrypt]==1.7.4
echo.
echo Done! Now try running: python init_db.py
pause

