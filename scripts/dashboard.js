// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (localStorage.getItem('userLoggedIn') !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    // Load user data
    loadUserData();
    
    // Initialize charts
    initializeCharts();
    
    // Load pickup requests
    loadPickupRequests();
    
    // Load nearby centers
    loadNearbyCenters();
    
    // Update offline stats
    updateOfflineStats();
    
    // Set minimum date for pickup to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('pickupDate').setAttribute('min', today);
});

// Load user data and populate UI
function loadUserData() {
    const userEmail = localStorage.getItem('userEmail') || 'user@email.com';
    const userName = localStorage.getItem('userName') || getUserNameFromEmail(userEmail);
    const userPoints = parseInt(localStorage.getItem('userPoints')) || 0;
    
    // Update UI elements
    document.getElementById('userName').textContent = `Welcome, ${userName}!`;
    document.getElementById('userWelcome').textContent = `Welcome, ${userName}!`;
    document.getElementById('pickupUserName').textContent = userName;
    document.getElementById('pickupUserEmail').textContent = userEmail;
    document.getElementById('userPoints').textContent = userPoints;
    
    // Update impact numbers based on points
    updateImpactNumbers(userPoints);
}

function getUserNameFromEmail(email) {
    if (email === 'admin@gmail.com') return 'Admin';
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
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

// Initialize charts
function initializeCharts() {
    // Waste generation chart
    const wasteCtx = document.getElementById('wasteChart').getContext('2d');
    new Chart(wasteCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            datasets: [{
                label: 'Waste Generated (tons)',
                data: [120, 135, 128, 145, 132, 125, 118],
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                tension: 0.4
            }, {
                label: 'Waste Recycled (tons)',
                data: [85, 95, 92, 108, 98, 102, 95],
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Waste (tons)'
                    }
                }
            }
        }
    });

    // Impact chart
    const impactCtx = document.getElementById('impactChart').getContext('2d');
    new Chart(impactCtx, {
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
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Update impact numbers
function updateImpactNumbers(points) {
    // Calculate impact based on points (simplified calculation)
    const trees = Math.floor(points / 100);
    const water = Math.floor(points * 2.5);
    const energy = Math.floor(points * 1.8);
    
    // Animate numbers
    animateNumber('treesSaved', 0, trees);
    animateNumber('waterSaved', 0, water);
    animateNumber('energySaved', 0, energy);
    animateNumber('pointsEarned', 0, points);
}

function animateNumber(elementId, start, end) {
    const element = document.getElementById(elementId);
    const duration = 2000; // 2 seconds
    const increment = (end - start) / (duration / 16); // 60 fps
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

// Pickup form submission
document.getElementById('pickupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        userName: document.getElementById('pickupUserName').textContent,
        userEmail: document.getElementById('pickupUserEmail').textContent,
        date: document.getElementById('pickupDate').value,
        time: document.getElementById('pickupTime').value,
        wasteTypes: Array.from(document.querySelectorAll('input[name="wasteType"]:checked')).map(cb => cb.value),
        status: 'pending',
        requestDate: new Date().toISOString()
    };
    
    if (formData.wasteTypes.length === 0) {
        showMessage('Please select at least one waste type', 'error');
        return;
    }
    
    // Store pickup request
    let pickupRequests = JSON.parse(localStorage.getItem('pickupRequests')) || [];
    pickupRequests.push(formData);
    localStorage.setItem('pickupRequests', JSON.stringify(pickupRequests));
    
    // Send notification (simulated)
    sendPickupNotification(formData);
    
    showMessage('Pickup request submitted successfully! You will receive a confirmation soon.', 'success');
    
    // Reset form
    this.reset();
});

function sendPickupNotification(requestData) {
    // Simulate API call to Pushover or SMS service
    console.log('Sending notification to admin:', requestData);
    
    // In a real application, this would make an API call to:
    // - Pushover API for push notifications
    // - SMS service for text notifications
    // - Email service for email notifications
    
    // Store notification for admin dashboard
    let adminNotifications = JSON.parse(localStorage.getItem('adminNotifications')) || [];
    adminNotifications.push({
        type: 'pickup_request',
        data: requestData,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('adminNotifications', JSON.stringify(adminNotifications));
}

// Rewards functionality
function claimReward(pointsRequired, itemName) {
    const userPoints = parseInt(localStorage.getItem('userPoints')) || 0;
    
    if (userPoints < pointsRequired) {
        showMessage(`You need ${pointsRequired - userPoints} more points to claim this reward`, 'error');
        return;
    }
    
    // Deduct points
    const newPoints = userPoints - pointsRequired;
    localStorage.setItem('userPoints', newPoints.toString());
    
    // Record claimed reward
    let claimedRewards = JSON.parse(localStorage.getItem('claimedRewards')) || [];
    claimedRewards.push({
        item: itemName,
        points: pointsRequired,
        date: new Date().toISOString()
    });
    localStorage.setItem('claimedRewards', JSON.stringify(claimedRewards));
    
    // Update UI
    document.getElementById('userPoints').textContent = newPoints;
    updateRewardButtons();
    
    showMessage(`Successfully claimed ${itemName}! Remaining points: ${newPoints}`, 'success');
}

function updateRewardButtons() {
    const userPoints = parseInt(localStorage.getItem('userPoints')) || 0;
    document.querySelectorAll('.claim-btn').forEach(btn => {
        const requiredPoints = parseInt(btn.parentElement.dataset.points);
        if (userPoints < requiredPoints) {
            btn.disabled = true;
            btn.textContent = 'Insufficient Points';
        } else {
            btn.disabled = false;
            btn.textContent = 'Claim';
        }
    });
}

// Nearby centers functionality
function updateRadius() {
    const slider = document.getElementById('radiusSlider');
    const value = slider.value;
    document.getElementById('radiusValue').textContent = value;
    loadNearbyCenters(value);
}

function loadNearbyCenters(radius = 5) {
    const centers = [
        {
            name: 'Green Waste Solutions',
            address: 'Koramangala, Bangalore',
            phone: '+91 80 1234 5678',
            distance: '1.2 km'
        },
        {
            name: 'EcoClean Services',
            address: 'Indiranagar, Bangalore',
            phone: '+91 80 2345 6789',
            distance: '2.8 km'
        },
        {
            name: 'Sustainable Waste Management',
            address: 'Whitefield, Bangalore',
            phone: '+91 80 3456 7890',
            distance: '4.5 km'
        },
        {
            name: 'Clean City Initiative',
            address: 'Jayanagar, Bangalore',
            phone: '+91 80 4567 8901',
            distance: '3.1 km'
        },
        {
            name: 'Recycle Right',
            address: 'HSR Layout, Bangalore',
            phone: '+91 80 5678 9012',
            distance: '2.3 km'
        }
    ];
    
    // Filter centers based on radius (simplified)
    const filteredCenters = centers.filter(center => {
        const distance = parseFloat(center.distance);
        return distance <= radius;
    });
    
    const centersGrid = document.getElementById('centersGrid');
    centersGrid.innerHTML = '';
    
    filteredCenters.forEach(center => {
        const centerCard = document.createElement('div');
        centerCard.className = 'center-card';
        centerCard.innerHTML = `
            <h3><i class="fas fa-recycle"></i> ${center.name}</h3>
            <div class="center-info">
                <span><i class="fas fa-map-marker-alt"></i> ${center.address}</span>
                <span><i class="fas fa-phone"></i> ${center.phone}</span>
                <span><i class="fas fa-route"></i> ${center.distance}</span>
            </div>
        `;
        centersGrid.appendChild(centerCard);
    });
}

// Load pickup requests (for tracking)
function loadPickupRequests() {
    const requests = JSON.parse(localStorage.getItem('pickupRequests')) || [];
    const userEmail = localStorage.getItem('userEmail');
    
    // Filter requests for current user
    const userRequests = requests.filter(req => req.userEmail === userEmail);
    
    // Update any UI elements that show request status
    console.log('User pickup requests:', userRequests);
}

// Update offline stats
function updateOfflineStats() {
    // Simulate offline program data
    const offlineData = {
        meals: 1247,
        waste: 3450,
        people: 284
    };
    
    animateNumber('offlineMeals', 0, offlineData.meals);
    animateNumber('offlineWaste', 0, offlineData.waste);
    animateNumber('offlinePeople', 0, offlineData.people);
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

// Simulate earning points when admin approves pickup
function simulateEarnPoints() {
    const currentPoints = parseInt(localStorage.getItem('userPoints')) || 0;
    const newPoints = currentPoints + 500;
    localStorage.setItem('userPoints', newPoints.toString());
    
    // Update UI
    document.getElementById('userPoints').textContent = newPoints;
    updateImpactNumbers(newPoints);
    updateRewardButtons();
    
    showMessage('Congratulations! You earned 500 points for your waste pickup!', 'success');
}

// Make functions globally available
window.showSection = showSection;
window.logout = logout;
window.claimReward = claimReward;
window.updateRadius = updateRadius;
window.simulateEarnPoints = simulateEarnPoints;
