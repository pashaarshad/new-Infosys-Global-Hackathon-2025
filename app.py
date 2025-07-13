from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_mysqldb import MySQL
import MySQLdb.cursors
import hashlib
import datetime
import json
import os

# Import SMS notification system with error handling
try:
    from smstext import SmartRecycleNotifications
    SMS_ENABLED = True
    print("📱 SMS Notifications: ENABLED")
except ImportError as e:
    print(f"⚠️  SMS Notifications: DISABLED (smstext module not found: {e})")
    SMS_ENABLED = False
    class SmartRecycleNotifications:
        def send_pickup_request_notification(self, **kwargs):
            return {'status': 'disabled', 'message': 'SMS disabled'}
        def send_detailed_pickup_confirmation(self, user_data):
            return {'status': 'disabled', 'message': 'SMS disabled'}
        def send_pickup_completed_notification(self, **kwargs):
            return {'status': 'disabled', 'message': 'SMS disabled'}
        def send_pickup_approved_notification(self, **kwargs):
            return {'status': 'disabled', 'message': 'SMS disabled'}
        def send_offline_donation_notification(self, **kwargs):
            return {'status': 'disabled', 'message': 'SMS disabled'}
        def send_notification(self, **kwargs):
            return {'status': 'disabled', 'message': 'SMS disabled'}

app = Flask(__name__)

# Change this to your secret key (it can be anything, it's for extra protection)
app.secret_key = 'your-secret-key-here'

# MySQL configurations
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'arshad'
app.config['MYSQL_PASSWORD'] = 'arshad'
app.config['MYSQL_DB'] = 'smart_recycle'

mysql = MySQL(app)

# Initialize SMS notification system
sms_notifications = SmartRecycleNotifications()

def init_database():
    """Initialize database tables if they don't exist"""
    try:
        cursor = mysql.connection.cursor()
        
        # Create users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                address TEXT,
                points INT DEFAULT 0,
                registration_date DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create pickup_requests table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS pickup_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                user_name VARCHAR(100),
                user_email VARCHAR(100),
                pickup_date DATE,
                pickup_time VARCHAR(20),
                waste_types TEXT,
                special_instructions TEXT,
                status ENUM('pending', 'approved', 'completed', 'rejected') DEFAULT 'pending',
                request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        ''')
        
        # Create offline_entries table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS offline_entries (
                id INT AUTO_INCREMENT PRIMARY KEY,
                collector_name VARCHAR(100),
                waste_weight DECIMAL(10,2),
                waste_types TEXT,
                food_provided ENUM('Yes', 'No'),
                entry_date DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        mysql.connection.commit()
        print("✅ Database tables initialized successfully")
        
    except Exception as e:
        print(f"❌ Database initialization error: {e}")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    if 'loggedin' in session:
        return render_template('dashboard.html')
    return redirect(url_for('index'))

@app.route('/admin-dashboard')
def admin_dashboard():
    if 'loggedin' in session and session['user_type'] == 'admin':
        return render_template('admin-dashboard.html')
    return redirect(url_for('index'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    msg = ''
    if request.method == 'POST' and 'email' in request.form and 'password' in request.form:
        email = request.form['email']
        password = request.form['password']
        
        # Check if it's admin login
        if email == 'admin@gmail.com' and password == 'Admin':
            session['loggedin'] = True
            session['id'] = 0
            session['email'] = email
            session['user_type'] = 'admin'
            return jsonify({'success': True, 'user_type': 'admin'})
        
        # Hash password for comparison
        hash_password = hashlib.sha256(password.encode()).hexdigest()
        
        # Check if account exists using MySQL
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM users WHERE email = %s AND password = %s', (email, hash_password,))
        account = cursor.fetchone()
        
        if account:
            session['loggedin'] = True
            session['id'] = account['id']
            session['email'] = account['email']
            session['name'] = account['name']
            session['user_type'] = 'user'
            return jsonify({'success': True, 'user_type': 'user'})
        else:
            msg = 'Incorrect email/password!'
    
    return jsonify({'success': False, 'message': msg})

@app.route('/register', methods=['GET', 'POST'])
def register():
    msg = ''
    if request.method == 'POST' and 'name' in request.form and 'password' in request.form and 'email' in request.form:
        name = request.form['name']
        password = request.form['password']
        email = request.form['email']
        phone = request.form['phone']
        address = request.form['address']
        
        # Check if account exists using MySQL
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM users WHERE email = %s', (email,))
        account = cursor.fetchone()
        
        if account:
            msg = 'Account already exists!'
        else:
            # Hash the password
            hash_password = hashlib.sha256(password.encode()).hexdigest()
            
            # Account doesn't exist and the form data is valid, now insert new account into users table
            cursor.execute('INSERT INTO users (name, email, password, phone, address, points, registration_date) VALUES (%s, %s, %s, %s, %s, %s, %s)', 
                         (name, email, hash_password, phone, address, 0, datetime.datetime.now()))
            mysql.connection.commit()
            msg = 'You have successfully registered!'
            return jsonify({'success': True, 'message': msg})
    
    return jsonify({'success': False, 'message': msg})

@app.route('/logout')
def logout():
    session.pop('loggedin', None)
    session.pop('id', None)
    session.pop('email', None)
    session.pop('name', None)
    session.pop('user_type', None)
    return redirect(url_for('index'))

@app.route('/api/pickup-request', methods=['POST'])
def pickup_request():
    if 'loggedin' in session:
        data = request.get_json()
        
        try:
            cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
            cursor.execute('''INSERT INTO pickup_requests 
                             (user_id, user_name, user_email, pickup_date, pickup_time, waste_types, status, request_date) 
                             VALUES (%s, %s, %s, %s, %s, %s, %s, %s)''', 
                          (session['id'], data['userName'], data['userEmail'], data['date'], 
                           data['time'], json.dumps(data['wasteTypes']), 'pending', datetime.datetime.now()))
            mysql.connection.commit()
            
            # Get user's phone and address from database
            cursor.execute('SELECT phone, address FROM users WHERE id = %s', (session['id'],))
            user_info = cursor.fetchone()
            phone = user_info['phone'] if user_info else 'Not provided'
            address = user_info['address'] if user_info else data.get('address', 'Not specified')
            
            # Send SMS notification to admin
            try:
                sms_result = sms_notifications.send_pickup_request_notification(
                    user_name=data['userName'],
                    user_email=data['userEmail'],
                    pickup_date=data['date'],
                    pickup_time=data['time'],
                    waste_types=data['wasteTypes'],
                    address=address,
                    phone=phone,
                    special_instructions=data.get('special_instructions', '')
                )
                
                print(f"SMS Notification Result: {sms_result}")
                
                if sms_result['status'] == 'success':
                    print("✅ SMS notification sent successfully to admin!")
                else:
                    print(f"❌ SMS notification failed: {sms_result.get('message', 'Unknown error')}")
                    
            except Exception as sms_error:
                print(f"❌ SMS notification error: {str(sms_error)}")
            
            # Send confirmation SMS to user
            try:
                user_data = {
                    'name': data['userName'],
                    'email': data['userEmail'],
                    'phone': phone,
                    'address': address,
                    'date': data['date'],
                    'time': data['time'],
                    'waste_types': data['wasteTypes']
                }
                
                confirmation_result = sms_notifications.send_detailed_pickup_confirmation(user_data)
                print(f"User Confirmation SMS: {confirmation_result}")
                
            except Exception as conf_error:
                print(f"❌ Confirmation SMS error: {str(conf_error)}")
            
            return jsonify({
                'success': True, 
                'message': 'Pickup request submitted successfully! Admin has been notified via SMS.'
            })
            
        except Exception as e:
            print(f"Database error: {str(e)}")
            return jsonify({'success': False, 'message': f'Database error: {str(e)}'})
    
    return jsonify({'success': False, 'message': 'Not logged in'})

@app.route('/api/pickup-requests')
def get_pickup_requests():
    if 'loggedin' in session and session['user_type'] == 'admin':
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM pickup_requests ORDER BY request_date DESC')
        requests = cursor.fetchall()
        
        # Convert datetime objects to strings for JSON serialization
        for req in requests:
            req['pickup_date'] = req['pickup_date'].strftime('%Y-%m-%d') if req['pickup_date'] else None
            req['request_date'] = req['request_date'].strftime('%Y-%m-%d %H:%M:%S') if req['request_date'] else None
            req['waste_types'] = json.loads(req['waste_types']) if req['waste_types'] else []
        
        return jsonify(requests)
    
    return jsonify([])

@app.route('/api/update-request-status', methods=['POST'])
def update_request_status():
    if 'loggedin' in session and session['user_type'] == 'admin':
        data = request.get_json()
        request_id = data['request_id']
        new_status = data['status']
        
        try:
            cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
            
            # Get request details for SMS notification
            cursor.execute('SELECT * FROM pickup_requests WHERE id = %s', (request_id,))
            pickup_request = cursor.fetchone()
            
            cursor.execute('UPDATE pickup_requests SET status = %s WHERE id = %s', (new_status, request_id))
            
            # If completed, award points to user and send completion SMS
            if new_status == 'completed':
                cursor.execute('SELECT user_id FROM pickup_requests WHERE id = %s', (request_id,))
                result = cursor.fetchone()
                if result:
                    user_id = result['user_id']
                    cursor.execute('UPDATE users SET points = points + 500 WHERE id = %s', (user_id,))
                    
                    # Send completion notification SMS
                    try:
                        waste_types_list = json.loads(pickup_request['waste_types']) if pickup_request['waste_types'] else []
                        waste_collected = ', '.join(waste_types_list)
                        
                        completion_result = sms_notifications.send_pickup_completed_notification(
                            user_name=pickup_request['user_name'],
                            points_earned=500,
                            waste_collected=waste_collected
                        )
                        print(f"Completion SMS Result: {completion_result}")
                        
                    except Exception as sms_error:
                        print(f"❌ Completion SMS error: {str(sms_error)}")
            
            # If approved, send approval SMS
            elif new_status == 'approved':
                try:
                    approval_result = sms_notifications.send_pickup_approved_notification(
                        user_name=pickup_request['user_name'],
                        pickup_date=pickup_request['pickup_date'].strftime('%Y-%m-%d') if pickup_request['pickup_date'] else 'TBD'
                    )
                    print(f"Approval SMS Result: {approval_result}")
                    
                except Exception as sms_error:
                    print(f"❌ Approval SMS error: {str(sms_error)}")
            
            mysql.connection.commit()
            
            return jsonify({
                'success': True, 
                'message': f'Request status updated to {new_status}! SMS notifications sent.'
            })
            
        except Exception as e:
            print(f"Status update error: {str(e)}")
            return jsonify({'success': False, 'message': f'Error: {str(e)}'})
    
    return jsonify({'success': False, 'message': 'Unauthorized'})

@app.route('/api/offline-entry', methods=['POST'])
def offline_entry():
    if 'loggedin' in session and session['user_type'] == 'admin':
        data = request.get_json()
        
        try:
            cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
            cursor.execute('''INSERT INTO offline_entries 
                             (collector_name, waste_weight, waste_types, food_provided, entry_date) 
                             VALUES (%s, %s, %s, %s, %s)''', 
                          (data['collectorName'], data['wasteWeight'], json.dumps(data['wasteTypes']), 
                           data['foodProvided'], datetime.datetime.now()))
            mysql.connection.commit()
            
            # Send offline donation notification SMS
            try:
                waste_types_list = data.get('wasteTypes', [])
                waste_amount = f"{data['wasteWeight']} kg ({', '.join(waste_types_list)})"
                
                offline_result = sms_notifications.send_offline_donation_notification(
                    person_name=data['collectorName'],
                    waste_amount=waste_amount,
                    location="Smart Recycle Center",
                    food_provided=data['foodProvided']
                )
                print(f"Offline Donation SMS Result: {offline_result}")
                
            except Exception as sms_error:
                print(f"❌ Offline donation SMS error: {str(sms_error)}")
            
            return jsonify({
                'success': True, 
                'message': 'Offline entry recorded successfully! Notification sent.'
            })
            
        except Exception as e:
            print(f"Offline entry error: {str(e)}")
            return jsonify({'success': False, 'message': f'Error: {str(e)}'})
    
    return jsonify({'success': False, 'message': 'Unauthorized'})

# Add test SMS endpoint for debugging
@app.route('/api/test-sms')
def test_sms():
    if 'loggedin' in session and session['user_type'] == 'admin':
        try:
            test_result = sms_notifications.send_notification(
                message="🧪 Test SMS from Smart Recycle Platform!\n\nThis is a test notification to verify SMS functionality is working correctly.",
                title="🧪 SMS Test",
                priority=0
            )
            
            return jsonify({
                'success': test_result['status'] == 'success',
                'result': test_result,
                'message': 'SMS test completed. Check your Pushover app!'
            })
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'SMS test failed'
            })
    
    return jsonify({'success': False, 'message': 'Unauthorized'})

@app.route('/api/users')
def get_users():
    if 'loggedin' in session and session['user_type'] == 'admin':
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT id, name, email, phone, points, registration_date FROM users ORDER BY registration_date DESC')
        users = cursor.fetchall()
        
        # Convert datetime objects to strings for JSON serialization
        for user in users:
            user['registration_date'] = user['registration_date'].strftime('%Y-%m-%d') if user['registration_date'] else None
        
        return jsonify(users)
    
    return jsonify([])

@app.route('/api/dashboard-stats')
def dashboard_stats():
    if 'loggedin' in session and session['user_type'] == 'admin':
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        
        # Get total users
        cursor.execute('SELECT COUNT(*) as count FROM users')
        total_users = cursor.fetchone()['count']
        
        # Get total requests
        cursor.execute('SELECT COUNT(*) as count FROM pickup_requests')
        total_requests = cursor.fetchone()['count']
        
        # Get total waste collected (estimated)
        cursor.execute('SELECT COUNT(*) as completed FROM pickup_requests WHERE status = "completed"')
        completed_requests = cursor.fetchone()['completed']
        
        cursor.execute('SELECT SUM(waste_weight) as total FROM offline_entries')
        offline_waste = cursor.fetchone()['total'] or 0
        
        total_waste = (completed_requests * 5) + offline_waste  # 5kg average per pickup
        
        # Calculate revenue (₹15 per kg)
        total_revenue = total_waste * 15
        
        return jsonify({
            'total_users': total_users,
            'total_requests': total_requests,
            'total_waste': int(total_waste),
            'total_revenue': int(total_revenue)
        })
    
    return jsonify({})

@app.route('/api/user-profile')
def user_profile():
    if 'loggedin' in session and session['user_type'] == 'user':
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT name, email, points FROM users WHERE id = %s', (session['id'],))
        user = cursor.fetchone()
        
        return jsonify(user)
    
    return jsonify({})

if __name__ == '__main__':
    print("🌱 Starting Smart Recycle Flask Application...")
    
    # Initialize database tables
    with app.app_context():
        try:
            init_database()
        except Exception as e:
            print(f"❌ Failed to initialize database: {e}")
            print("Make sure MySQL is running and the database 'smart_recycle' exists")
    
    if SMS_ENABLED:
        print("📱 SMS Notifications: ENABLED")
    else:
        print("⚠️  SMS Notifications: DISABLED")
    
    print("🔗 Access: http://localhost:5000")
    print("👤 Admin Login: admin@gmail.com / Admin")
    app.run(debug=True, host='0.0.0.0', port=5000)
