export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;
        const USERS = env.USERS;

        // CORS headers
        const headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Content-Type': 'application/json'
        };

        // Handle preflight (CORS pre-check)
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers });
        }

        // Routes
        if (path === '/signup') return handleSignup(request, USERS, headers);
        if (path === '/login') return handleLogin(request, USERS, headers);
        if (path === '/data') return handleData(request, USERS, headers);
        if (path === '/update') return handleUpdate(request, USERS, headers);

        return new Response('Not found', { status: 404, headers });
    }
};

// Signup Handler
async function handleSignup(request, users, headers) {
    const { userId, password } = await request.json();
    const userKey = `user:${userId}`;
    
    const existingUser = await users.get(userKey);
    if (existingUser) {
        return errorResponse('User already exists', headers);
    }

    // Create new user
    await users.put(userKey, JSON.stringify({ password, count: 0, createdAt: Date.now() }));
    return successResponse({ message: 'Signup successful' }, headers);
}

// Login Handler
async function handleLogin(request, users, headers) {
    const { userId, password } = await request.json();
    const userKey = `user:${userId}`;

    const userData = await users.get(userKey);
    if (!userData) {
        return errorResponse('User not found', headers);
    }

    const user = JSON.parse(userData);
    if (user.password !== password) {
        return errorResponse('Invalid password', headers);
    }

    return successResponse({ message: 'Login successful' }, headers);
}

// Fetch User Data
async function handleData(request, users, headers) {
    const { userId } = await request.json();
    const userKey = `user:${userId}`;

    const userData = await users.get(userKey);
    if (!userData) {
        return errorResponse('User not found', headers);
    }

    const user = JSON.parse(userData);
    return successResponse({ count: user.count }, headers);
}

// Update Count
async function handleUpdate(request, users, headers) {
    const { userId, count } = await request.json();
    const userKey = `user:${userId}`;

    const userData = await users.get(userKey);
    if (!userData) {
        return errorResponse('User not found', headers);
    }

    const user = JSON.parse(userData);
    user.count = count;

    await users.put(userKey, JSON.stringify(user));
    return successResponse({ message: 'Count updated successfully' }, headers);
}

// Success and Error Response
function successResponse(data, headers) {
    return new Response(JSON.stringify({ success: true, ...data }), { headers });
}

function errorResponse(message, headers) {
    return new Response(JSON.stringify({ success: false, error: message }), {
        status: 400,
        headers
    });
}
