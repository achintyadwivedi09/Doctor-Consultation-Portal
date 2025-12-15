@echo off
echo Setting up Doctor Appointment Portal...
echo.

echo [1/4] Setting up backend...
cd backend
echo Creating virtual environment...
python -m venv venv
echo Activating virtual environment...
call venv\Scripts\activate
echo Installing Python dependencies...
pip install -r requirements.txt
echo.
echo Creating .env file...
if not exist .env (
    echo DB_USER=root > .env
    echo DB_PASSWORD= >> .env
    echo DB_HOST=localhost >> .env
    echo DB_PORT=3306 >> .env
    echo DB_NAME=doctor_portal >> .env
    echo SECRET_KEY=your-secret-key-change-this-in-production >> .env
    echo .env file created. Please update with your MySQL credentials.
)
echo.
echo Initializing database...
python init_db.py
cd ..
echo.

echo [2/4] Setting up frontend...
cd frontend
echo Installing Node dependencies...
call npm install
cd ..
echo.

echo [3/4] Setup complete!
echo.
echo [4/4] Next steps:
echo 1. Update backend/.env with your MySQL credentials
echo 2. Make sure MySQL is running
echo 3. Run backend: cd backend ^&^& venv\Scripts\activate ^&^& python main.py
echo 4. Run frontend: cd frontend ^&^& npm run dev
echo.
echo Default admin credentials:
echo Email: admin@doctorportal.com
echo Password: admin123
echo.
pause

