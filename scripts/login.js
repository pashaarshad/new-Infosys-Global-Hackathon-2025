// Login functionality
document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // Admin modal functions
    window.toggleAdminModal = function() {
        document.getElementById('adminModal').style.display = 'block';
    };

    window.closeAdminModal = function() {
        document.getElementById('adminModal').style.display = 'none';
    };

    // Close modal when clicking outside
    window.onclick = function(event) {
        const modal = document.getElementById('adminModal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };

    // User login form submission
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Simulate login validation
        if (email && password) {
            // Check against registered users
            const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
            const user = registeredUsers.find(u => u.email === email && u.password === password);
            
            if (user) {
                // Store user data in localStorage
                localStorage.setItem('userLoggedIn', 'true');
                localStorage.setItem('userEmail', email);
                localStorage.setItem('userType', 'user');
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                // Show success message
                showMessage('Login successful! Redirecting...', 'success');
                
                // Redirect to dashboard after 1.5 seconds
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                showMessage('Invalid email or password. Please check your credentials.', 'error');
            }
        } else {
            showMessage('Please fill in all fields', 'error');
        }
    });

    // Admin login form submission
    document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;
        
        // Check admin credentials (updated credentials)
        if (email === 'admin@smartrecycle.com' && (password === 'ADMIN' || password === 'admin')) {
            localStorage.setItem('userLoggedIn', 'true');
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userType', 'admin');
            
            showMessage('Admin login successful! Redirecting...', 'success');
            
            setTimeout(() => {
                window.location.href = 'admin-dashboard.html';
            }, 1500);
        } else {
            showMessage('Invalid admin credentials. Please use ADMIN/ADMIN', 'error');
        }
    });

    // Registration form submission
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const phone = document.getElementById('regPhone').value;
        const address = document.getElementById('regAddress').value;
        const password = document.getElementById('regPassword').value;
        
        // Basic validation
        if (!name || !email || !phone || !address || !password) {
            showMessage('Please fill in all fields', 'error');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage('Please enter a valid email address', 'error');
            return;
        }
        
        // Password validation
        if (password.length < 6) {
            showMessage('Password must be at least 6 characters long', 'error');
            return;
        }
        
        // Store registration data
        const userData = {
            id: Date.now(), // Simple ID generation
            name: name,
            email: email,
            phone: phone,
            address: address,
            password: password,
            points: 100, // Welcome bonus points
            registrationDate: new Date().toISOString(),
            profileComplete: true
        };
        
        // Store in localStorage (in real app, this would be sent to backend)
        let users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
        
        // Check if user already exists
        if (users.find(user => user.email === email)) {
            showMessage('User already exists with this email', 'error');
            return;
        }
        
        users.push(userData);
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        
        showMessage('Registration successful! Welcome! You received 100 welcome points. Please login with your credentials.', 'success');
        
        // Switch to login tab and auto-fill email
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        document.querySelector('[data-tab="login"]').classList.add('active');
        document.getElementById('login').classList.add('active');
        document.getElementById('loginEmail').value = email;
        
        // Clear form
        document.getElementById('registerForm').reset();
    });

    // Message display function
    function showMessage(message, type) {
        // Remove existing messages
        const existingMsg = document.querySelector('.message');
        if (existingMsg) {
            existingMsg.remove();
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 20px;
            border-radius: 12px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            max-width: 350px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            line-height: 1.4;
        `;
        
        if (type === 'success') {
            messageDiv.style.background = 'linear-gradient(135deg, #48bb78, #38a169)';
        } else {
            messageDiv.style.background = 'linear-gradient(135deg, #f56565, #e53e3e)';
        }
        
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => {
                    if (messageDiv.parentNode) {
                        messageDiv.remove();
                    }
                }, 300);
            }
        }, 4000);
    }

    // Add CSS for message animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideOutRight {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }
    `;
    document.head.appendChild(style);

    // Initialize demo data if not present
    initializeDemoData();
});

// Initialize demo data for testing
function initializeDemoData() {
    if (!localStorage.getItem('registeredUsers')) {
        const demoUsers = [
            {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                phone: '+1234567890',
                address: '123 Green Street, Eco City, EC 12345',
                password: 'password123',
                points: 250,
                registrationDate: new Date().toISOString(),
                profileComplete: true
            },
            {
                id: 2,
                name: 'Jane Smith',
                email: 'jane@example.com',
                phone: '+1234567891',
                address: '456 Recycle Avenue, Green Town, GT 54321',
                password: 'password123',
                points: 180,
                registrationDate: new Date().toISOString(),
                profileComplete: true
            }
        ];
        localStorage.setItem('registeredUsers', JSON.stringify(demoUsers));
    }
}

// Check if user is already logged in
if (localStorage.getItem('userLoggedIn') === 'true') {
    const userType = localStorage.getItem('userType');
    if (userType === 'admin') {
        window.location.href = 'admin-dashboard.html';
    } else {
        window.location.href = 'dashboard.html';
    }
}
