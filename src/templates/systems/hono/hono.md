## Hono Guidelines

### Modern Hono Framework Patterns

**Basic Application Setup**
```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { jwt } from 'hono/jwt';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Routes with validation
const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

app.post('/users', zValidator('json', userSchema), async (c) => {
  const user = c.req.valid('json');
  
  // Create user logic
  const newUser = await createUser(user);
  
  return c.json({ data: newUser }, 201);
});

export default app;
```

**JWT Authentication**
```typescript
import { jwt, sign, verify } from 'hono/jwt';

// Protected routes
app.use('/api/*', jwt({ secret: 'your-secret-key' }));

// Login endpoint
app.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');
  
  const user = await authenticateUser(email, password);
  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }
  
  const token = await sign({ userId: user.id, email: user.email }, 'your-secret-key');
  
  return c.json({ token });
});

// Access user in protected route
app.get('/api/profile', (c) => {
  const payload = c.get('jwtPayload');
  return c.json({ userId: payload.userId });
});
```

**Database Integration (Drizzle ORM)**
```typescript
import { drizzle } from 'drizzle-orm/d1';
import { users, posts } from './schema';
import { eq } from 'drizzle-orm';

// Cloudflare Workers with D1
type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('/users', async (c) => {
  const db = drizzle(c.env.DB);
  const allUsers = await db.select().from(users);
  
  return c.json({ data: allUsers });
});

app.get('/users/:id', async (c) => {
  const id = c.req.param('id');
  const db = drizzle(c.env.DB);
  
  const user = await db.select().from(users).where(eq(users.id, Number(id)));
  
  if (user.length === 0) {
    return c.json({ error: 'User not found' }, 404);
  }
  
  return c.json({ data: user[0] });
});
```

**Middleware Patterns**
```typescript
// Custom middleware
const authMiddleware = async (c: Context, next: Next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return c.json({ error: 'Authorization required' }, 401);
  }
  
  try {
    const payload = await verify(token, 'your-secret-key');
    c.set('user', payload);
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
};

// Error handling middleware
app.onError((err, c) => {
  console.error(err);
  
  if (err instanceof z.ZodError) {
    return c.json({ 
      error: 'Validation Error', 
      details: err.errors 
    }, 400);
  }
  
  return c.json({ error: 'Internal Server Error' }, 500);
});
```

**Cloudflare Workers Deployment**
```typescript
// wrangler.toml
name = "my-hono-app"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "my-database"
database_id = "your-database-id"

[vars]
JWT_SECRET = "your-jwt-secret"
```

**File Upload Handling**
```typescript
app.post('/upload', async (c) => {
  const body = await c.req.formData();
  const file = body.get('file') as File;
  
  if (!file) {
    return c.json({ error: 'No file uploaded' }, 400);
  }
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    return c.json({ error: 'Only images allowed' }, 400);
  }
  
  // Store file (Cloudflare R2, S3, etc.)
  const fileUrl = await uploadFile(file);
  
  return c.json({ url: fileUrl });
});
```

### Performance & Deployment
- **Ultra-fast**: Built for edge computing (Cloudflare Workers, Deno Deploy)
- **TypeScript-first**: Full type safety out of the box
- **Minimal overhead**: Designed for serverless environments
- **Web Standard APIs**: Uses standard Request/Response objects
- **Multi-runtime**: Works on Cloudflare Workers, Bun, Node.js, Deno