export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;
        const USERS = env.USERS;
  
        // CORS headers
        const headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
    const { username, password, count } = await request.json();
    
    const userKey = `user:${username}`;
    const existingUser = await users.get(userKey);
    
    if (existingUser) {
        const userData = JSON.parse(existingUser);
        if (userData.password === password) {
            return successResponse({ token: 'generated-jwt-token' }, headers);
        }
        return errorResponse('Invalid credentials', headers);
    }
    
    // New user
    await users.put(userKey, JSON.stringify({
        password,
        count: count || 0,
        createdAt: Date.now()
    }));
    
    return successResponse({ token: 'generated-jwt-token' }, headers);
  }
  
  async function handleData(request, users, headers) {
    const username = 'extracted-from-jwt';
    const userData = JSON.parse(await users.get(`user:${username}`));
    return successResponse({ count: userData.count }, headers);
  }
  
  async function handleUpdate(request, users, headers) {
    const { count } = await request.json();
    const username = 'extracted-from-jwt';
    await users.put(`user:${username}`, JSON.stringify({
        count: parseInt(count)
    }));
    return successResponse({ success: true }, headers);
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
  