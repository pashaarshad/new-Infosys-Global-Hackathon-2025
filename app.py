from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_mysqldb import MySQL
import MySQLdb.cursors
import hashlib
import datetime
import json
import os

app = Flask(__name__)

# Change this to your secret key (it can be anything, it's for extra protection)
app.secret_key = 'your-secret-key-here'

# MySQL configurations
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'arshad'
app.config['MYSQL_PASSWORD'] = 'arshad'
app.config['MYSQL_DB'] = 'smart_recycle'

mysql = MySQL(app)

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
        
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('''INSERT INTO pickup_requests 
                         (user_id, user_name, user_email, pickup_date, pickup_time, waste_types, status, request_date) 
                         VALUES (%s, %s, %s, %s, %s, %s, %s, %s)''', 
                      (session['id'], data['userName'], data['userEmail'], data['date'], 
                       data['time'], json.dumps(data['wasteTypes']), 'pending', datetime.datetime.now()))
        mysql.connection.commit()
        
        return jsonify({'success': True, 'message': 'Pickup request submitted successfully!'})
    
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
        
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('UPDATE pickup_requests SET status = %s WHERE id = %s', (new_status, request_id))
        
        # If completed, award points to user
        if new_status == 'completed':
            cursor.execute('SELECT user_id FROM pickup_requests WHERE id = %s', (request_id,))
            result = cursor.fetchone()
            if result:
                user_id = result['user_id']
                cursor.execute('UPDATE users SET points = points + 500 WHERE id = %s', (user_id,))
        
        mysql.connection.commit()
        
        return jsonify({'success': True, 'message': 'Request status updated successfully!'})
    
    return jsonify({'success': False, 'message': 'Unauthorized'})

@app.route('/api/offline-entry', methods=['POST'])
def offline_entry():
    if 'loggedin' in session and session['user_type'] == 'admin':
        data = request.get_json()
        
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('''INSERT INTO offline_entries 
                         (collector_name, waste_weight, waste_types, food_provided, entry_date) 
                         VALUES (%s, %s, %s, %s, %s)''', 
                      (data['collectorName'], data['wasteWeight'], json.dumps(data['wasteTypes']), 
                       data['foodProvided'], datetime.datetime.now()))
        mysql.connection.commit()
        
        return jsonify({'success': True, 'message': 'Offline entry recorded successfully!'})
    
    return jsonify({'success': False, 'message': 'Unauthorized'})

@app.route('/api/offline-entries')
def get_offline_entries():
    if 'loggedin' in session and session['user_type'] == 'admin':
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM offline_entries ORDER BY entry_date DESC LIMIT 10')
        entries = cursor.fetchall()
        
        # Convert datetime objects to strings for JSON serialization
        for entry in entries:
            entry['entry_date'] = entry['entry_date'].strftime('%Y-%m-%d %H:%M:%S') if entry['entry_date'] else None
            entry['waste_types'] = json.loads(entry['waste_types']) if entry['waste_types'] else []
        
        return jsonify(entries)
    
    return jsonify([])

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
    app.run(debug=True)
