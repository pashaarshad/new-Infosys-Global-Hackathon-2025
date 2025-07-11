"""
Smart Recycle Notification System

COMPLETE SETUP AND RUN COMMANDS:
================================

FOR HTML/JAVASCRIPT FRONTEND:
-----------------------------
1. Navigate to project directory:
   cd "/home/arshad/Desktop/new Infosys Global Hackathon 2025"

2. Start a local web server (choose one):
   # Python 3 built-in server
   python3 -m http.server 8000
   
   # OR Node.js live-server (if installed)
   npx live-server
   
   # OR PHP built-in server (if PHP installed)
   php -S localhost:8000

3. Open browser and go to:
   http://localhost:8000

FOR PYTHON FLASK BACKEND:
------------------------
1. Create virtual environment:
   python3 -m venv .venv

2. Activate virtual environment:
   source .venv/bin/activate

3. Install Flask and dependencies:
   pip install flask flask-cors requests

4. Run Flask app:
   python3 app.py

5. Open browser and go to:
   http://localhost:5000

COMPLETE ONE-LINE COMMANDS:
==========================

HTML Version:
cd "/home/arshad/Desktop/new Infosys Global Hackathon 2025" && python3 -m http.server 8000

Flask Version:
cd "/home/arshad/Desktop/new Infosys Global Hackathon 2025" && python3 -m venv .venv && source .venv/bin/activate && pip install flask flask-cors requests && python3 app.py

Test Notifications:
cd "/home/arshad/Desktop/new Infosys Global Hackathon 2025" && python3 -m venv .venv && source .venv/bin/activate && python3 smstext.py

PRODUCTION DEPLOYMENT:
=====================
1. Install Gunicorn for production:
   pip install gunicorn

2. Run with Gunicorn:
   gunicorn -w 4 -b 0.0.0.0:5000 app:app

FILE STRUCTURE CHECK:
====================
Your project should have:
├── index.html (main entry point)
├── login.html (login page)
├── dashboard.html (user dashboard)
├── admin-dashboard.html (admin panel)
├── app.py (Flask backend - optional)
├── smstext.py (notification system)
├── styles/
│   ├── style.css
│   ├── dashboard.css
│   └── admin-dashboard.css
├── scripts/
│   ├── app.js
│   ├── dashboard.js
│   └── admin-dashboard.js
└── assets/ (images, icons)
"""

import http.client
import urllib.parse
import json
import datetime
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('notifications.log'),
        logging.StreamHandler()
    ]
)

class SmartRecycleNotifications:
    def __init__(self):
        # Pushover API credentials
        self.token = "ax7744vnowjsxmmih7otm15cadeyv4"
        self.user = "uhtpk4vhqqkgcndoujik9g1ttjksun"
        self.api_url = "api.pushover.net:443"
        
    def send_notification(self, message, title="Smart Recycle Alert", priority=0):
        """
        Send notification via Pushover API
        
        Args:
            message (str): The notification message
            title (str): Notification title
            priority (int): Priority level (-2 to 2)
        
        Returns:
            dict: Response data or error information
        """
        try:
            conn = http.client.HTTPSConnection(self.api_url)
            
            # Prepare notification data
            notification_data = {
                "token": self.token,
                "user": self.user,
                "message": message,
                "title": title,
                "priority": priority,
                "timestamp": int(datetime.datetime.now().timestamp())
            }
            
            # Send the request
            conn.request("POST", "/1/messages.json",
                urllib.parse.urlencode(notification_data),
                {"Content-type": "application/x-www-form-urlencoded"})
            
            response = conn.getresponse()
            response_data = response.read().decode()
            
            if response.status == 200:
                logging.info(f"Notification sent successfully: {title}")
                return {"status": "success", "data": json.loads(response_data)}
            else:
                logging.error(f"Failed to send notification: {response.status} - {response_data}")
                return {"status": "error", "code": response.status, "message": response_data}
                
        except Exception as e:
            logging.error(f"Exception occurred while sending notification: {str(e)}")
            return {"status": "error", "message": str(e)}
        finally:
            if 'conn' in locals():
                conn.close()
    
    def send_pickup_request_notification(self, user_name, user_email, pickup_date, pickup_time, waste_types, address="", phone="", special_instructions=""):
        """Send comprehensive notification for new pickup request with GUI icons"""
        
        # Format waste types with appropriate icons
        waste_icons = {
            "plastic": "🥤",
            "paper": "📄", 
            "metal": "🔩",
            "glass": "🍾",
            "organic": "🍃",
            "electronic": "💻",
            "cardboard": "📦",
            "batteries": "🔋"
        }
        
        formatted_waste_types = []
        for waste_type in waste_types:
            icon = waste_icons.get(waste_type.lower(), "♻️")
            formatted_waste_types.append(f"{icon} {waste_type}")
        
        # Create comprehensive message with GUI icons
        message = f"""
🌟 NEW WASTE PICKUP REQUEST SUBMITTED 🌟

┌─────────────────────────────────────┐
│           👤 USER DETAILS           │
└─────────────────────────────────────┘
🏷️ Name: {user_name}
📧 Email: {user_email}
📱 Phone: {phone if phone else 'Not provided'}

┌─────────────────────────────────────┐
│         📅 PICKUP SCHEDULE          │
└─────────────────────────────────────┘
🗓️ Date: {pickup_date}
⏰ Time: {pickup_time}
🏠 Address: {address if address else 'Not specified'}

┌─────────────────────────────────────┐
│          ♻️ WASTE DETAILS           │
└─────────────────────────────────────┘
{chr(10).join(formatted_waste_types)}

┌─────────────────────────────────────┐
│       📝 SPECIAL INSTRUCTIONS       │
└─────────────────────────────────────┘
💬 Notes: {special_instructions if special_instructions else 'None'}

┌─────────────────────────────────────┐
│          🚀 NEXT ACTIONS            │
└─────────────────────────────────────┘
✅ Review request in admin dashboard
📋 Assign pickup team
🚛 Schedule route optimization
📱 Send confirmation to user

⏱️ Request Time: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
🌍 Smart Recycle Platform - Making World Greener!
        """.strip()
        
        return self.send_notification(
            message=message,
            title="🚛 NEW PICKUP REQUEST",
            priority=1
        )
    
    def send_detailed_pickup_confirmation(self, user_data):
        """Send detailed pickup confirmation with all submitted information"""
        message = f"""
✨ PICKUP REQUEST CONFIRMATION ✨

┌─────────────────────────────────────┐
│        🎯 REQUEST CONFIRMED         │
└─────────────────────────────────────┘

📋 Request ID: #SR{datetime.datetime.now().strftime('%Y%m%d%H%M')}
👤 User: {user_data.get('name', 'N/A')}
📧 Contact: {user_data.get('email', 'N/A')}

┌─────────────────────────────────────┐
│         📍 PICKUP LOCATION          │
└─────────────────────────────────────┘
🏠 {user_data.get('address', 'Address not provided')}
📱 {user_data.get('phone', 'Phone not provided')}

┌─────────────────────────────────────┐
│          ⏰ SCHEDULE INFO           │
└─────────────────────────────────────┘
📅 Date: {user_data.get('date', 'TBD')}
🕒 Time: {user_data.get('time', 'TBD')}
⚡ Status: PENDING APPROVAL

┌─────────────────────────────────────┐
│         ♻️ WASTE SUMMARY            │
└─────────────────────────────────────┘
📊 Types: {len(user_data.get('waste_types', []))} categories selected
🗑️ Items: {', '.join(user_data.get('waste_types', []))}

┌─────────────────────────────────────┐
│          🎁 EXPECTED REWARDS        │
└─────────────────────────────────────┘
⭐ Base Points: 500 points
🎯 Bonus Points: Up to 200 (quality dependent)
🌱 Environmental Impact: Trees saved, CO2 reduced

🚀 WHAT'S NEXT?
1️⃣ Admin review (within 2 hours)
2️⃣ Team assignment & route planning
3️⃣ SMS confirmation with pickup details
4️⃣ Pickup execution & points reward

💚 Thank you for choosing Smart Recycle!
🌍 Together we're making the world greener!
        """.strip()
        
        return self.send_notification(
            message=message,
            title="✅ PICKUP CONFIRMED",
            priority=0
        )

# Initialize notification system
notifications = SmartRecycleNotifications()

# Test function with enhanced pickup request
def test_notifications():
    """Test all notification types including enhanced pickup request"""
    print("Testing Smart Recycle Notification System...")
    
    # Test basic notification
    result1 = notifications.send_notification("Smart Recycle system is online and ready!", "🌱 System Online")
    print(f"Basic notification: {result1['status']}")
    
    # Test enhanced pickup request notification
    result2 = notifications.send_pickup_request_notification(
        user_name="Arshad Pasha",
        user_email="arshad.pasha@example.com",
        pickup_date="2025-01-15",
        pickup_time="09:00 AM - 12:00 PM",
        waste_types=["Plastic", "Paper", "Metal", "Electronic"],
        address="123 Green Street, Koramangala, Bangalore - 560034",
        phone="+91 98765 43210",
        special_instructions="Please call before arrival. Gate code: 1234. Waste is in the basement."
    )
    print(f"Enhanced pickup request notification: {result2['status']}")
    
    # Test detailed confirmation
    user_data = {
        'name': 'Arshad Pasha',
        'email': 'arshad.pasha@example.com',
        'phone': '+91 98765 43210',
        'address': '123 Green Street, Koramangala, Bangalore - 560034',
        'date': '2025-01-15',
        'time': '09:00 AM - 12:00 PM',
        'waste_types': ['Plastic Bottles', 'Paper Documents', 'Metal Cans', 'Electronic Items']
    }
    
    result3 = notifications.send_detailed_pickup_confirmation(user_data)
    print(f"Detailed confirmation notification: {result3['status']}")
    
    # Test system alert
    result4 = notifications.send_system_alert(
        alert_type="High Volume",
        message="Unusual high number of pickup requests today. Consider deploying additional teams.",
        priority=1
    )
    print(f"System alert: {result4['status']}")

# Add a new function for easy command-line testing
def run_notification_demo():
    """Run a complete demonstration of the notification system"""
    print("=" * 60)
    print("🌱 SMART RECYCLE NOTIFICATION SYSTEM DEMO")
    print("=" * 60)
    print("Setting up virtual environment...")
    print("Commands to run:")
    print("1. python3 -m venv .venv")
    print("2. source .venv/bin/activate")
    print("3. python3 smstext.py")
    print("=" * 60)
    
    # Run the existing test
    test_notifications()
    
    print("=" * 60)
    print("✅ Demo completed successfully!")
    print("Check your Pushover app for notifications.")
    print("=" * 60)

def run_complete_application():
    """Run complete Smart Recycle application with all components"""
    print("🌱" + "="*58 + "🌱")
    print("   SMART RECYCLE - COMPLETE APPLICATION LAUNCHER")
    print("🌱" + "="*58 + "🌱")
    
    print("\n📋 AVAILABLE RUN OPTIONS:")
    print("1️⃣  HTML/JavaScript Frontend (Port 8000)")
    print("2️⃣  Python Flask Backend (Port 5000)")
    print("3️⃣  Test Notification System")
    print("4️⃣  Run All Components")
    
    print("\n🚀 QUICK LAUNCH COMMANDS:")
    print("┌" + "─"*60 + "┐")
    print("│  HTML Frontend:                                        │")
    print("│  python3 -m http.server 8000                          │")
    print("│                                                        │")
    print("│  Flask Backend:                                        │")
    print("│  python3 app.py                                       │")
    print("│                                                        │")
    print("│  Test Notifications:                                   │")
    print("│  python3 smstext.py                                   │")
    print("└" + "─"*60 + "┘")
    
    print("\n🌐 ACCESS URLS:")
    print("├── Frontend: http://localhost:8000")
    print("├── Backend API: http://localhost:5000")
    print("├── Login Page: http://localhost:8000/login.html")
    print("├── User Dashboard: http://localhost:8000/dashboard.html")
    print("└── Admin Panel: http://localhost:8000/admin-dashboard.html")
    
    print("\n📱 FEATURES AVAILABLE:")
    print("✅ User Registration & Login")
    print("✅ Waste Pickup Requests")
    print("✅ Points & Rewards System")
    print("✅ Admin Dashboard")
    print("✅ Real-time SMS Notifications")
    print("✅ Offline Waste Collection")
    print("✅ Analytics & Reporting")
    print("✅ Nearby Centers Locator")
    
    print("\n🔧 DEVELOPMENT COMMANDS:")
    print("# Setup virtual environment")
    print("python3 -m venv .venv && source .venv/bin/activate")
    print("\n# Install dependencies")
    print("pip install flask flask-cors requests")
    print("\n# Run development server")
    print("python3 app.py")
    print("\n# Test notification system")
    print("python3 smstext.py")
    
    print("\n💡 TIPS:")
    print("• Use Ctrl+C to stop any running server")
    print("• Check browser console for any JavaScript errors")
    print("• Monitor notifications.log for SMS delivery status")
    print("• Admin login: admin@gmail.com / Admin")
    
    print("\n🌍 INFOSYS GLOBAL HACKATHON 2025")
    print("Theme: Tech for Good - Circular Economy Platform")
    print("🌱" + "="*58 + "🌱")
    
    # Run the notification test
    print("\n🧪 TESTING NOTIFICATION SYSTEM...")
    test_notifications()

if __name__ == "__main__":
    # Run complete application launcher
    run_complete_application()