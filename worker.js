export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const USERS = env.USERS;
        const headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Content-Type': 'application/json'
        };
        if (request.method === 'OPTIONS') return new Response(null, { headers });
        if (url.pathname === '/auth') return handleAuth(request, USERS, headers);
        if (url.pathname === '/data') return handleData(request, USERS, headers);
        if (url.pathname === '/update') return handleUpdate(request, USERS, headers);
        return new Response('Not found', { status: 404, headers });
    }
};

async function handleAuth(request, users, headers) {
    const { username, password, count } = await request.json();
    const userKey = `user:${username}`;
    const existingUser = await users.get(userKey);
    if (existingUser) {
        const userData = JSON.parse(existingUser);
        if (userData.password !== password) return errorResponse('Invalid credentials', headers);
    } else {
        await users.put(userKey, JSON.stringify({ password, count: count || 0 }));
    }
    return successResponse({ success: true }, headers);
}

async function handleData(request, users, headers) {
    const { username } = await request.json();
    const userData = await users.get(`user:${username}`);
    if (!userData) return errorResponse('User not found', headers);
    return successResponse({ count: JSON.parse(userData).count }, headers);
}

async function handleUpdate(request, users, headers) {
    const { username, count } = await request.json();
    const userData = await users.get(`user:${username}`);
    if (!userData) return errorResponse('User not found', headers);
    await users.put(`user:${username}`, JSON.stringify({ ...JSON.parse(userData), count }));
    return successResponse({ success: true }, headers);
}

function successResponse(data, headers) {
    return new Response(JSON.stringify({ success: true, ...data }), { headers });
}

function errorResponse(message, headers) {
    return new Response(JSON.stringify({ success: false, error: message }), { status: 400, headers });
}
