from flask import Flask, request, jsonify, session
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from datetime import datetime
import os
from functools import wraps
from dotenv import load_dotenv

# Load environment variables from .env file (if exists)
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
CORS(app, supports_credentials=True)

# Database configuration
# You can set these as environment variables or update directly here
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_NAME', 'dr_portal'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', 'databaseAPY102611*')  # Update with your MySQL password
}

def get_db_connection():
    """Establish database connection with error handling"""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        if conn.is_connected():
            return conn
    except Error as e:
        print(f"❌ Error connecting to MySQL: {e}")
        print(f"   Host: {DB_CONFIG['host']}")
        print(f"   Database: {DB_CONFIG['database']}")
        print(f"   User: {DB_CONFIG['user']}")
        return None

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Please login'}), 401
        return f(*args, **kwargs)
    return decorated_function

# Authentication Routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    user_type = data.get('user_type')
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    
    if not all([user_type, name, email, password]):
        return jsonify({'error': 'All fields required'}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor()
    
    try:
        # Check if email exists
        if user_type == 'doctor':
            cursor.execute("SELECT email FROM doctor WHERE email = %s", (email,))
        elif user_type == 'patient':
            cursor.execute("SELECT email FROM patient WHERE email = %s", (email,))
        else:
            return jsonify({'error': 'Invalid user type'}), 400
        
        if cursor.fetchone():
            return jsonify({'error': 'Email already exists'}), 400
        
        # Store password as plain text
        hashed_password = password
        
        # Insert user
        if user_type == 'doctor':
            specialization = data.get('specialization', 'General')
            fees = data.get('fees', 500)
            availability = data.get('availability', '9:00 AM - 5:00 PM')
            cursor.execute(
                "INSERT INTO doctor (name, email, password, specialization, fees, availability) VALUES (%s, %s, %s, %s, %s, %s)",
                (name, email, hashed_password, specialization, fees, availability)
            )
        elif user_type == 'patient':
            age = data.get('age', 0)
            gender = data.get('gender', '')
            phone = data.get('phone', '')
            cursor.execute(
                "INSERT INTO patient (name, email, password, age, gender, phone) VALUES (%s, %s, %s, %s, %s, %s)",
                (name, email, hashed_password, age, gender, phone)
            )
        
        conn.commit()
        return jsonify({'message': 'Registration successful'}), 201
    except Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user_type = data.get('user_type')
    email = data.get('email')
    password = data.get('password')
    
    if not all([user_type, email, password]):
        return jsonify({'error': 'All fields required'}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor()
    
    try:
        if user_type == 'admin':
            cursor.execute("SELECT admin_id, username, password FROM admin WHERE username = %s", (email,))
        elif user_type == 'doctor':
            cursor.execute("SELECT doctor_id, name, email, password, specialization, fees, availability FROM doctor WHERE email = %s", (email,))
        elif user_type == 'patient':
            cursor.execute("SELECT patient_id, name, email, password, age, gender, phone FROM patient WHERE email = %s", (email,))
        else:
            return jsonify({'error': 'Invalid user type'}), 400
        
        user = cursor.fetchone()
        if not user:
            return jsonify({'error': 'Invalid credentials - User not found'}), 401
        
        # Check password
        stored_password = user[3] if user_type != 'admin' else user[2]  # Fixed index for patient/doctor
        if user_type == 'admin':
            # Simple check for admin (you should hash this in production)
            if password != stored_password:
                return jsonify({'error': 'Invalid credentials - Wrong password'}), 401
            session['user_id'] = user[0]
            session['user_type'] = 'admin'
            session['username'] = user[1]
            return jsonify({
                'message': 'Login successful',
                'user': {'id': user[0], 'username': user[1], 'type': 'admin'}
            }), 200
        else:
            # For patient and doctor - simple password check
            if password != stored_password:
                return jsonify({'error': 'Invalid credentials - Wrong password'}), 401
            
            session['user_id'] = user[0]
            session['user_type'] = user_type
            session['email'] = user[2]
            
            if user_type == 'doctor':
                return jsonify({
                    'message': 'Login successful',
                    'user': {
                        'id': user[0],
                        'name': user[1],
                        'email': user[2],
                        'specialization': user[4],
                        'fees': user[5],
                        'availability': user[6],
                        'type': 'doctor'
                    }
                }), 200
            else:
                return jsonify({
                    'message': 'Login successful',
                    'user': {
                        'id': user[0],
                        'name': user[1],
                        'email': user[2],
                        'age': user[4],
                        'gender': user[5],
                        'phone': user[6],
                        'type': 'patient'
                    }
                }), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out successfully'}), 200

@app.route('/api/user', methods=['GET'])
def get_current_user():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    return jsonify({
        'user_id': session['user_id'],
        'user_type': session['user_type']
    }), 200

# Doctor Routes
@app.route('/api/doctors', methods=['GET'])
def get_doctors():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT doctor_id, name, specialization, email, fees, availability FROM doctor")
        doctors = cursor.fetchall()
        return jsonify(doctors), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# Appointment Routes
@app.route('/api/appointments', methods=['GET'])
@login_required
def get_appointments():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor(dictionary=True)
    user_id = session['user_id']
    user_type = session['user_type']
    
    try:
        if user_type == 'patient':
            cursor.execute("""
                SELECT a.app_id, a.date, a.time, a.status, 
                       d.name as doctor_name, d.specialization, d.fees
                FROM appointments a
                JOIN doctor d ON a.doctor_id = d.doctor_id
                WHERE a.patient_id = %s
                ORDER BY a.date DESC, a.time DESC
            """, (user_id,))
        elif user_type == 'doctor':
            cursor.execute("""
                SELECT a.app_id, a.date, a.time, a.status,
                       p.name as patient_name, p.email, p.phone
                FROM appointments a
                JOIN patient p ON a.patient_id = p.patient_id
                WHERE a.doctor_id = %s
                ORDER BY a.date DESC, a.time DESC
            """, (user_id,))
        else:  # admin
            cursor.execute("""
                SELECT a.app_id, a.date, a.time, a.status,
                       d.name as doctor_name, p.name as patient_name
                FROM appointments a
                JOIN doctor d ON a.doctor_id = d.doctor_id
                JOIN patient p ON a.patient_id = p.patient_id
                ORDER BY a.date DESC, a.time DESC
            """)
        
        appointments = cursor.fetchall()
        # Convert datetime objects to strings for JSON serialization
        for appointment in appointments:
            if 'date' in appointment and appointment['date']:
                appointment['date'] = appointment['date'].isoformat()
            if 'time' in appointment and appointment['time']:
                # Convert timedelta to HH:MM format
                if isinstance(appointment['time'], str):
                    pass  # Already a string
                else:
                    total_seconds = int(appointment['time'].total_seconds())
                    hours = total_seconds // 3600
                    minutes = (total_seconds % 3600) // 60
                    appointment['time'] = f"{hours:02d}:{minutes:02d}"
        return jsonify(appointments), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/appointments', methods=['POST'])
@login_required
def create_appointment():
    if session['user_type'] != 'patient':
        return jsonify({'error': 'Only patients can book appointments'}), 403
    
    data = request.json
    doctor_id = data.get('doctor_id')
    date = data.get('date')
    time = data.get('time')
    
    if not all([doctor_id, date, time]):
        return jsonify({'error': 'All fields required'}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO appointments (doctor_id, patient_id, date, time, status) VALUES (%s, %s, %s, %s, %s)",
            (doctor_id, session['user_id'], date, time, 'Booked')
        )
        conn.commit()
        return jsonify({'message': 'Appointment booked successfully'}), 201
    except Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/appointments/<int:app_id>/status', methods=['PUT'])
@login_required
def update_appointment_status(app_id):
    if session['user_type'] not in ['doctor', 'admin']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.json
    status = data.get('status')
    
    if status not in ['approved', 'declined', 'cancelled', 'completed']:
        return jsonify({'error': 'Invalid status'}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor()
    try:
        cursor.execute(
            "UPDATE appointments SET status = %s WHERE app_id = %s",
            (status, app_id)
        )
        conn.commit()
        return jsonify({'message': 'Appointment status updated'}), 200
    except Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/appointments/<int:app_id>', methods=['DELETE'])
@login_required
def delete_appointment(app_id):
    if session['user_type'] not in ['patient', 'admin']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM appointments WHERE app_id = %s", (app_id,))
        conn.commit()
        return jsonify({'message': 'Appointment deleted'}), 200
    except Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# Admin Routes
@app.route('/api/admin/doctors', methods=['GET'])
@login_required
def get_all_doctors():
    if session['user_type'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT doctor_id, name, specialization, email, fees, availability FROM doctor")
        doctors = cursor.fetchall()
        return jsonify(doctors), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/admin/doctors/<int:doctor_id>', methods=['DELETE'])
@login_required
def delete_doctor(doctor_id):
    if session['user_type'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM doctor WHERE doctor_id = %s", (doctor_id,))
        conn.commit()
        return jsonify({'message': 'Doctor removed'}), 200
    except Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# Health check and database connection test endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Check if backend and database are accessible"""
    conn = get_db_connection()
    if conn:
        conn.close()
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'message': 'Backend and database are working'
        }), 200
    else:
        return jsonify({
            'status': 'unhealthy',
            'database': 'disconnected',
            'message': 'Database connection failed'
        }), 503

@app.route('/api/test-db', methods=['GET'])
def test_database():
    """Test database connection and show status"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({
                'success': False,
                'message': 'Failed to connect to database',
                'error': 'Check database configuration in app.py'
            }), 500
        
        cursor = conn.cursor()
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        table_names = [table[0] for table in tables]
        
        cursor.close()
        conn.close()
        
        required_tables = ['admin', 'doctor', 'patient', 'appointments']
        missing_tables = [t for t in required_tables if t not in table_names]
        
        return jsonify({
            'success': True,
            'message': 'Database connection successful',
            'tables_found': len(tables),
            'table_names': table_names,
            'required_tables': required_tables,
            'missing_tables': missing_tables,
            'all_tables_present': len(missing_tables) == 0
        }), 200
    except Error as e:
        return jsonify({
            'success': False,
            'message': 'Database error',
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("=" * 50)
    print("Starting Flask Backend Server...")
    print("=" * 50)
    print(f"Database: {DB_CONFIG['database']}")
    print(f"Host: {DB_CONFIG['host']}")
    print(f"User: {DB_CONFIG['user']}")
    print("-" * 50)
    
    # Test connection on startup
    conn = get_db_connection()
    if conn:
        print("✅ Database connection successful!")
        conn.close()
    else:
        print("❌ Database connection failed!")
        print("   Please check your database configuration in app.py")
        print("   Or run: python test_db_connection.py")
        print("-" * 50)
    
    print("🚀 Server starting on http://localhost:5000")
    print("=" * 50)
    app.run(debug=True, port=5000)

