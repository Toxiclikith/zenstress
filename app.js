// Cloudflare API URL
const CLOUDFLARE_API = 'https://zen-stress.toxiclikith.workers.dev/';
let count = 0;
let user = JSON.parse(localStorage.getItem('user')) || null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('clickBtn').addEventListener('click', handleClick);
    document.getElementById('authAction').addEventListener('click', handleAuth);
    updateMenu();
});

// Update UI Menu
function updateMenu() {
    document.getElementById('menu-items').innerHTML = user ?
        `<div class="menu-item">👤 ${user.username}</div>
         <div class="menu-item" onclick="logout()">🚪 Logout</div>` :
        `<div class="menu-item" onclick="showAuthModal()">📝 Sign Up / Login</div>`;
}

// Handle Click Event
async function handleClick() {
    count++;
    document.getElementById('count').textContent = count;

    if (user) {
        await fetch(`${CLOUDFLARE_API}/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user.username, count })
        });
    }
}

// Handle Signup/Login
async function handleAuth() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch(`${CLOUDFLARE_API}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, count })
    });

    const data = await response.json();
    if (data.success) {
        user = { username };
        localStorage.setItem('user', JSON.stringify(user));
        updateMenu();
        closeAuthModal();
        loadUserData();
    }
}

// Load User Data
async function loadUserData() {
    if (!user) return;
    const response = await fetch(`${CLOUDFLARE_API}/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username })
    });
    const data = await response.json();
    if (data.success) {
        count = data.count;
        document.getElementById('count').textContent = count;
    }
}

// Logout Function
function logout() {
    localStorage.removeItem('user');
    user = null;
    updateMenu();
}

// Show/Hide Authentication Modal
function showAuthModal() { document.getElementById('authModal').style.display = 'block'; }
function closeAuthModal() { document.getElementById('authModal').style.display = 'none'; }
