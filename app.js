const CLOUDFLARE_API = 'https://zen-stress.toxiclikith.workers.dev/';
let count = 0;
let userId = localStorage.getItem('userId') || null;

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
    menuItems.innerHTML = userId ? `
        <div class="menu-item">👤 ${userId}</div>
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
    navigator.vibrate?.(50);
    
    if(count % 100 === 0) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }

    if(userId) {
        await fetch(`${CLOUDFLARE_API}update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, count })
        });
    }

    if(!userId && (count === 100 || count % 500 === 0)) {
        showAuthModal();
    }
}

// Auth Functions
async function handleAuth() {
    const userIdInput = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch(`${CLOUDFLARE_API}auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: userIdInput, password, count })
});

const data = await response.json().catch(() => null); // Catch JSON parse errors

console.log("Auth API response status:", response.status);
console.log("Auth API response data:", data);

    
    if(data.success) {
        userId = userIdInput;
        localStorage.setItem('userId', userId);
        updateMenu();
        closeAuthModal();
        loadUserData();
    }
}

async function loadUserData() {
    const response = await fetch(`${CLOUDFLARE_API}data?userId=${userId}`);
    const data = await response.json();
    count = data.count;
    document.getElementById('count').textContent = count;
}

function logout() {
    localStorage.removeItem('userId');
    userId = null;
    updateMenu();
}

function showAuthModal() {
    document.getElementById('authModal').style.display = 'block';
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}
