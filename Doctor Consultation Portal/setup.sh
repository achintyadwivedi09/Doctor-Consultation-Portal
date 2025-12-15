#!/bin/bash
echo "Setting up Doctor Appointment Portal..."
echo

echo "[1/4] Setting up backend..."
cd backend
echo "Creating virtual environment..."
python3 -m venv venv
echo "Activating virtual environment..."
source venv/bin/activate
echo "Installing Python dependencies..."
pip install -r requirements.txt
echo
echo "Creating .env file..."
if [ ! -f .env ]; then
    cat > .env << EOF
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306
DB_NAME=doctor_portal
SECRET_KEY=your-secret-key-change-this-in-production
EOF
    echo ".env file created. Please update with your MySQL credentials."
fi
echo
echo "Initializing database..."
python init_db.py
cd ..
echo

echo "[2/4] Setting up frontend..."
cd frontend
echo "Installing Node dependencies..."
npm install
cd ..
echo

echo "[3/4] Setup complete!"
echo
echo "[4/4] Next steps:"
echo "1. Update backend/.env with your MySQL credentials"
echo "2. Make sure MySQL is running"
echo "3. Run backend: cd backend && source venv/bin/activate && python main.py"
echo "4. Run frontend: cd frontend && npm run dev"
echo
echo "Default admin credentials:"
echo "Email: admin@doctorportal.com"
echo "Password: admin123"
echo

