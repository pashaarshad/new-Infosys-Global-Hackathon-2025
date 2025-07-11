// Admin Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if admin is logged in
    if (localStorage.getItem('userLoggedIn') !== 'true' || localStorage.getItem('userType') !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    // Initialize dashboard
    initializeDashboard();
    loadPickupRequests();
    loadUsers();
    initializeCharts();
    loadOfflineEntries();
    updateStats();
});

// Initialize dashboard data
function initializeDashboard() {
    // Generate sample data if not exists
    if (!localStorage.getItem('sampleDataGenerated')) {
        generateSampleData();
        localStorage.setItem('sampleDataGenerated', 'true');
    }
    
    updateDashboardStats();
    loadRecentActivity();
}

// Generate sample data for demonstration
function generateSampleData() {
    // Sample users
    const sampleUsers = [
        {
            name: 'Arshad Pasha',
            email: 'arshad@example.com',
            phone: '+91 98765 43210',
            address: 'Koramangala, Bangalore',
            points: 1500,
            registrationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active'
        },
        {
            name: 'Priya Sharma',
            email: 'priya@example.com',
            phone: '+91 98765 43211',
            address: 'Indiranagar, Bangalore',
            points: 2300,
            registrationDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active'
        },
        {
            name: 'Raj Kumar',
            email: 'raj@example.com',
            phone: '+91 98765 43212',
            address: 'Whitefield, Bangalore',
            points: 800,
            registrationDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active'
        },
        {
            name: 'Meera Iyer',
            email: 'meera@example.com',
            phone: '+91 98765 43213',
            address: 'Jayanagar, Bangalore',
            points: 3200,
            registrationDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active'
        },
        {
            name: 'Vikram Singh',
            email: 'vikram@example.com',
            phone: '+91 98765 43214',
            address: 'HSR Layout, Bangalore',
            points: 1100,
            registrationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active'
        }
    ];
    
    localStorage.setItem('registeredUsers', JSON.stringify(sampleUsers));
    
    // Sample pickup requests
    const sampleRequests = [
        {
            userName: 'Arshad Pasha',
            userEmail: 'arshad@example.com',
            date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: '07:00-08:00',
            wasteTypes: ['plastic', 'paper'],
            status: 'pending',
            requestDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
            userName: 'Priya Sharma',
            userEmail: 'priya@example.com',
            date: new Date().toISOString().split('T')[0],
            time: '08:00-09:00',
            wasteTypes: ['organic', 'metal'],
            status: 'in-progress',
            requestDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        },
        {
            userName: 'Raj Kumar',
            userEmail: 'raj@example.com',
            date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: '06:00-07:00',
            wasteTypes: ['plastic', 'electronic'],
            status: 'completed',
            requestDate: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString()
        }
    ];
    
    localStorage.setItem('pickupRequests', JSON.stringify(sampleRequests));
    
    // Sample offline entries
    const sampleOfflineEntries = [
        {
            collectorName: 'Ramesh',
            wasteWeight: 2.5,
            wasteTypes: ['plastic', 'paper'],
            foodProvided: 'lunch',
            date: new Date().toISOString()
        },
        {
            collectorName: 'Sunita',
            wasteWeight: 1.8,
            wasteTypes: ['organic'],
            foodProvided: 'breakfast',
            date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        }
    ];
    
    localStorage.setItem('offlineEntries', JSON.stringify(sampleOfflineEntries));
}

// Update dashboard statistics
function updateDashboardStats() {
    const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const requests = JSON.parse(localStorage.getItem('pickupRequests')) || [];
    const offlineEntries = JSON.parse(localStorage.getItem('offlineEntries')) || [];
    
    // Calculate stats
    const totalUsers = users.length;
    const totalRequests = requests.length;
    const totalWaste = requests.length * 5 + offlineEntries.reduce((sum, entry) => sum + entry.wasteWeight, 0); // Estimated
    const totalRevenue = Math.floor(totalWaste * 15); // ₹15 per kg estimated
    
    // Animate numbers
    animateNumber('totalUsers', 0, totalUsers);
    animateNumber('totalRequests', 0, totalRequests);
    animateNumber('totalWaste', 0, Math.floor(totalWaste));
    
    // Update revenue with currency
    document.getElementById('totalRevenue').textContent = `₹${totalRevenue.toLocaleString()}`;
}

// Load recent activity
function loadRecentActivity() {
    const requests = JSON.parse(localStorage.getItem('pickupRequests')) || [];
    const offlineEntries = JSON.parse(localStorage.getItem('offlineEntries')) || [];
    
    const activities = [];
    
    // Add recent requests
    requests.slice(-3).forEach(request => {
        activities.push({
            icon: 'truck',
            title: `New pickup request from ${request.userName}`,
            time: formatTimeAgo(new Date(request.requestDate))
        });
    });
    
    // Add recent offline entries
    offlineEntries.slice(-2).forEach(entry => {
        activities.push({
            icon: 'hands-helping',
            title: `Offline collection by ${entry.collectorName} - ${entry.wasteWeight}kg`,
            time: formatTimeAgo(new Date(entry.date))
        });
    });
    
    const activityList = document.getElementById('activityList');
    activityList.innerHTML = '';
    
    activities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="activity-icon">
                <i class="fas fa-${activity.icon}"></i>
            </div>
            <div class="activity-info">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        `;
        activityList.appendChild(activityItem);
    });
}

// Section navigation
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionName).classList.add('active');
    
    // Add active class to clicked nav link
    event.target.classList.add('active');
}

// Load pickup requests
function loadPickupRequests() {
    const requests = JSON.parse(localStorage.getItem('pickupRequests')) || [];
    const tableBody = document.getElementById('requestsTableBody');
    
    tableBody.innerHTML = '';
    
    requests.forEach((request, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${request.userName}<br><small>${request.userEmail}</small></td>
            <td>${formatDate(request.date)}<br><small>${request.time}</small></td>
            <td>${request.wasteTypes.join(', ')}</td>
            <td><span class="status-badge status-${request.status}">${request.status}</span></td>
            <td>
                ${request.status === 'pending' ? 
                    `<button class="action-btn btn-approve" onclick="updateRequestStatus(${index}, 'in-progress')">Approve</button>` : ''}
                ${request.status === 'in-progress' ? 
                    `<button class="action-btn btn-complete" onclick="updateRequestStatus(${index}, 'completed')">Complete</button>` : ''}
                <button class="action-btn btn-view" onclick="viewRequest(${index})">View</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Update request status
function updateRequestStatus(index, newStatus) {
    const requests = JSON.parse(localStorage.getItem('pickupRequests')) || [];
    
    if (requests[index]) {
        requests[index].status = newStatus;
        
        // If completed, award points to user
        if (newStatus === 'completed') {
            awardPointsToUser(requests[index].userEmail, 500);
        }
        
        localStorage.setItem('pickupRequests', JSON.stringify(requests));
        loadPickupRequests();
        updateDashboardStats();
        
        showMessage(`Request ${newStatus} successfully!`, 'success');
    }
}

// Award points to user
function awardPointsToUser(userEmail, points) {
    const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const userIndex = users.findIndex(user => user.email === userEmail);
    
    if (userIndex !== -1) {
        users[userIndex].points = (users[userIndex].points || 0) + points;
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        
        // If it's the current logged user, update their points too
        if (localStorage.getItem('userEmail') === userEmail) {
            localStorage.setItem('userPoints', users[userIndex].points.toString());
        }
    }
}

// Filter requests
function filterRequests() {
    const statusFilter = document.getElementById('statusFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    const requests = JSON.parse(localStorage.getItem('pickupRequests')) || [];
    
    let filteredRequests = requests;
    
    if (statusFilter !== 'all') {
        filteredRequests = filteredRequests.filter(req => req.status === statusFilter);
    }
    
    if (dateFilter) {
        filteredRequests = filteredRequests.filter(req => req.date === dateFilter);
    }
    
    // Update table with filtered results
    const tableBody = document.getElementById('requestsTableBody');
    tableBody.innerHTML = '';
    
    filteredRequests.forEach((request, index) => {
        const originalIndex = requests.indexOf(request);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${request.userName}<br><small>${request.userEmail}</small></td>
            <td>${formatDate(request.date)}<br><small>${request.time}</small></td>
            <td>${request.wasteTypes.join(', ')}</td>
            <td><span class="status-badge status-${request.status}">${request.status}</span></td>
            <td>
                ${request.status === 'pending' ? 
                    `<button class="action-btn btn-approve" onclick="updateRequestStatus(${originalIndex}, 'in-progress')">Approve</button>` : ''}
                ${request.status === 'in-progress' ? 
                    `<button class="action-btn btn-complete" onclick="updateRequestStatus(${originalIndex}, 'completed')">Complete</button>` : ''}
                <button class="action-btn btn-view" onclick="viewRequest(${originalIndex})">View</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Offline form submission
document.getElementById('offlineForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        collectorName: document.getElementById('collectorName').value,
        wasteWeight: parseFloat(document.getElementById('wasteWeight').value),
        wasteTypes: Array.from(document.querySelectorAll('#offline input[type="checkbox"]:checked')).map(cb => cb.value),
        foodProvided: document.getElementById('foodProvided').value,
        date: new Date().toISOString()
    };
    
    if (formData.wasteTypes.length === 0) {
        showMessage('Please select at least one waste type', 'error');
        return;
    }
    
    // Store offline entry
    let offlineEntries = JSON.parse(localStorage.getItem('offlineEntries')) || [];
    offlineEntries.push(formData);
    localStorage.setItem('offlineEntries', JSON.stringify(offlineEntries));
    
    // Reset form
    this.reset();
    
    // Update UI
    updateOfflineStats();
    loadOfflineEntries();
    updateDashboardStats();
    
    showMessage('Offline entry recorded successfully!', 'success');
});

// Update offline stats
function updateOfflineStats() {
    const entries = JSON.parse(localStorage.getItem('offlineEntries')) || [];
    const today = new Date().toDateString();
    
    const todayEntries = entries.filter(entry => 
        new Date(entry.date).toDateString() === today
    );
    
    const mealsToday = todayEntries.length;
    const wasteToday = todayEntries.reduce((sum, entry) => sum + entry.wasteWeight, 0);
    const peopleToday = todayEntries.length;
    
    animateNumber('offlineMeals', 0, mealsToday);
    animateNumber('offlineWasteToday', 0, Math.floor(wasteToday * 10) / 10);
    animateNumber('offlinePeopleToday', 0, peopleToday);
}

// Load offline entries
function loadOfflineEntries() {
    const entries = JSON.parse(localStorage.getItem('offlineEntries')) || [];
    const entriesList = document.getElementById('offlineEntriesList');
    
    entriesList.innerHTML = '';
    
    entries.slice(-5).reverse().forEach(entry => {
        const entryItem = document.createElement('div');
        entryItem.className = 'entry-item';
        entryItem.innerHTML = `
            <div class="entry-header">
                <div class="entry-name">${entry.collectorName}</div>
                <div class="entry-time">${formatTimeAgo(new Date(entry.date))}</div>
            </div>
            <div class="entry-details">
                ${entry.wasteWeight}kg waste (${entry.wasteTypes.join(', ')}) - ${entry.foodProvided} provided
            </div>
        `;
        entriesList.appendChild(entryItem);
    });
}

// Load users
function loadUsers() {
    const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const tableBody = document.getElementById('usersTableBody');
    
    tableBody.innerHTML = '';
    
    users.forEach((user, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>${user.points || 0}</td>
            <td>${formatDate(user.registrationDate)}</td>
            <td><span class="user-status status-${user.status}">${user.status}</span></td>
            <td>
                <button class="action-btn btn-view" onclick="viewUser(${index})">View</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Filter users
function filterUsers() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    
    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm) || 
        user.email.toLowerCase().includes(searchTerm)
    );
    
    const tableBody = document.getElementById('usersTableBody');
    tableBody.innerHTML = '';
    
    filteredUsers.forEach((user, index) => {
        const originalIndex = users.indexOf(user);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>${user.points || 0}</td>
            <td>${formatDate(user.registrationDate)}</td>
            <td><span class="user-status status-${user.status}">${user.status}</span></td>
            <td>
                <button class="action-btn btn-view" onclick="viewUser(${originalIndex})">View</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Initialize charts
function initializeCharts() {
    // Requests chart
    const requestsCtx = document.getElementById('requestsChart').getContext('2d');
    new Chart(requestsCtx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Pickup Requests',
                data: [12, 19, 8, 15, 22, 18, 14],
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Waste type chart
    const wasteTypeCtx = document.getElementById('wasteTypeChart').getContext('2d');
    new Chart(wasteTypeCtx, {
        type: 'doughnut',
        data: {
            labels: ['Plastic', 'Paper', 'Metal', 'Organic', 'Electronic'],
            datasets: [{
                data: [30, 25, 15, 20, 10],
                backgroundColor: [
                    '#4CAF50',
                    '#2196F3',
                    '#FF9800',
                    '#8BC34A',
                    '#9C27B0'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Initialize analytics charts
    initializeAnalyticsCharts();
}

// Initialize analytics charts
function initializeAnalyticsCharts() {
    // Revenue chart
    const revenueCtx = document.getElementById('revenueChart').getContext('2d');
    new Chart(revenueCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Revenue (₹)',
                data: [15000, 23000, 18000, 28000, 35000, 42000],
                backgroundColor: '#4CAF50'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Impact chart
    const impactCtx = document.getElementById('impactChart').getContext('2d');
    new Chart(impactCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Trees Saved',
                data: [45, 68, 52, 81, 95, 120],
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)'
            }, {
                label: 'Water Saved (L)',
                data: [1200, 1800, 1400, 2200, 2600, 3200],
                borderColor: '#2196F3',
                backgroundColor: 'rgba(33, 150, 243, 0.1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // User growth chart
    const userGrowthCtx = document.getElementById('userGrowthChart').getContext('2d');
    new Chart(userGrowthCtx, {
        type: 'area',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'New Users',
                data: [10, 18, 15, 25, 32, 28],
                borderColor: '#FF9800',
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Efficiency chart
    const efficiencyCtx = document.getElementById('efficiencyChart').getContext('2d');
    new Chart(efficiencyCtx, {
        type: 'radar',
        data: {
            labels: ['Collection', 'Processing', 'Recycling', 'Distribution', 'Customer Satisfaction'],
            datasets: [{
                label: 'Efficiency %',
                data: [85, 78, 92, 88, 94],
                borderColor: '#9C27B0',
                backgroundColor: 'rgba(156, 39, 176, 0.1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

// Utility functions
function animateNumber(elementId, start, end) {
    const element = document.getElementById(elementId);
    const duration = 2000;
    const increment = (end - start) / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN');
}

function formatTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}

// View functions
function viewRequest(index) {
    const requests = JSON.parse(localStorage.getItem('pickupRequests')) || [];
    const request = requests[index];
    
    if (request) {
        alert(`Request Details:\n\nUser: ${request.userName}\nEmail: ${request.userEmail}\nDate: ${request.date}\nTime: ${request.time}\nWaste Types: ${request.wasteTypes.join(', ')}\nStatus: ${request.status}`);
    }
}

function viewUser(index) {
    const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const user = users[index];
    
    if (user) {
        alert(`User Details:\n\nName: ${user.name}\nEmail: ${user.email}\nPhone: ${user.phone}\nAddress: ${user.address}\nPoints: ${user.points || 0}\nJoined: ${formatDate(user.registrationDate)}\nStatus: ${user.status}`);
    }
}

// Time range selector
function selectTimeRange(range) {
    document.querySelectorAll('.time-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Here you would typically reload charts with different data based on the time range
    console.log(`Selected time range: ${range}`);
}

// Logout functionality
function logout() {
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userType');
    window.location.href = 'index.html';
}

// Message display function
function showMessage(message, type) {
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
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        max-width: 350px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;
    
    if (type === 'success') {
        messageDiv.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
    } else {
        messageDiv.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a24)';
    }
    
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
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

// Update stats periodically
function updateStats() {
    updateDashboardStats();
    updateOfflineStats();
    loadRecentActivity();
}

// Make functions globally available
window.showSection = showSection;
window.logout = logout;
window.updateRequestStatus = updateRequestStatus;
window.filterRequests = filterRequests;
window.filterUsers = filterUsers;
window.viewRequest = viewRequest;
window.viewUser = viewUser;
window.selectTimeRange = selectTimeRange;

// Add CSS for animations
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
