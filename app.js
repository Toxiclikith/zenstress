const CLOUDFLARE_API = 'https://zen-stress.toxiclikith.workers.dev/';
let count = 0;
let user = JSON.parse(localStorage.getItem('user')) || null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.menu-btn').addEventListener('click', toggleMenu);
    document.getElementById('clickBtn').addEventListener('click', handleClick);
    document.getElementById('authAction').addEventListener('click', handleAuth);
    updateMenu();
});

// Menu Management
function toggleMenu() {
    const menu = document.querySelector('.menu-content');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    updateMenu();
}

function updateMenu() {
    const menuItems = document.getElementById('menu-items');
    menuItems.innerHTML = user ? `
        <div class="menu-item">👤 ${user.username}</div>
        <div class="menu-item">🏆 Achievements</div>
        <div class="menu-item" onclick="logout()">🚪 Logout</div>
    ` : `
        <div class="menu-item" onclick="showAuthModal()">📝 Sign Up</div>
        <div class="menu-item" onclick="showAuthModal()">🔑 Login</div>
    `;
}

// Click Handler
async function handleClick() {
    count++;
    document.getElementById('count').textContent = count;
    
    // Vibration
    navigator.vibrate?.(50);
    
    // Confetti every 100 clicks
    if(count % 100 === 0) {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }

    // Save progress
    if(user) {
        await fetch(`${CLOUDFLARE_API}update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({ count })
        });
    }

    // Show signup prompt
    if(!user && (count === 100 || count % 500 === 0)) {
        showAuthModal();
    }
}

// Auth Functions
async function handleAuth() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch(`${CLOUDFLARE_API}auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, count })
    });

    const data = await response.json();
    
    if(data.success) {
        user = { username, token: data.token };
        localStorage.setItem('user', JSON.stringify(user));
        updateMenu();
        closeAuthModal();
        loadUserData();
    }
}

async function loadUserData() {
    const response = await fetch(`${CLOUDFLARE_API}data`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
    });
    const data = await response.json();
    count = data.count;
    document.getElementById('count').textContent = count;
}

function logout() {
    localStorage.removeItem('user');
    user = null;
    updateMenu();
}

function showAuthModal() {
    document.getElementById('authModal').style.display = 'block';
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}