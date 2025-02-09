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
        if (path === '/auth') return handleAuth(request, USERS, headers);
        if (path === '/data') return handleData(request, USERS, headers);
        if (path === '/update') return handleUpdate(request, USERS, headers);

        return new Response('Not found', { status: 404, headers });
    }
};

async function handleAuth(request, users, headers) {
    const { userId, password, count } = await request.json();
    
    const userKey = `user:${userId}`;
    const existingUser = await users.get(userKey);
    
    if (existingUser) {
        const userData = JSON.parse(existingUser);
        if (userData.password === password) {
            return successResponse({ message: 'Login successful' }, headers);
        }
        return errorResponse('Invalid credentials', headers);
    }
    
    // New user
    await users.put(userKey, JSON.stringify({
        password,
        count: count || 0,
        createdAt: Date.now()
    }));
    
    return successResponse({ message: 'Signup successful' }, headers);
}

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

async function handleUpdate(request, users, headers) {
    const { userId, count } = await request.json();
    const userKey = `user:${userId}`;

    const userData = await users.get(userKey);
    if (!userData) {
        return errorResponse('User not found', headers);
    }

    const user = JSON.parse(userData);
    user.count = parseInt(count);

    await users.put(userKey, JSON.stringify(user));
    return successResponse({ message: 'Count updated successfully' }, headers);
}

function successResponse(data, headers) {
    return new Response(JSON.stringify({ success: true, ...data }), { headers });
}

function errorResponse(message, headers) {
    return new Response(JSON.stringify({ success: false, error: message }), {
        status: 400,
        headers
    });
}
