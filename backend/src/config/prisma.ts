import { PrismaClient, TransactionType } from '@prisma/client';
import { config } from './env';

const realPrisma = new PrismaClient({
  log: config.nodeEnv === 'development' ? ['error', 'warn'] : ['error'],
});

// Flag to track whether PostgreSQL server is reachable
let isDbOnline = true;

// In-memory fallback storage for environments without active PostgreSQL daemon
interface MemoryUser {
  id: string;
  email: string;
  passwordHash: string;
  firstName?: string | null;
  lastName?: string | null;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MemoryRefreshToken {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  revoked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const memoryStore = {
  users: new Map<string, MemoryUser>(),
  refreshTokens: new Map<string, MemoryRefreshToken>(),
};

const isConnectionError = (err: any): boolean => {
  if (!err) return false;
  const msg = String(err.message || '');
  return (
    err.name === 'PrismaClientInitializationError' ||
    msg.includes("Can't reach database server") ||
    msg.includes('Connection refused') ||
    msg.includes('ECONNREFUSED') ||
    err.code === 'P1001'
  );
};

const sanitizeUser = (user: MemoryUser, select?: Record<string, boolean>) => {
  if (!select) {
    const { passwordHash: _, ...rest } = user;
    return rest;
  }
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(select)) {
    if (val && key in user && key !== 'passwordHash') {
      result[key] = (user as any)[key];
    }
  }
  return result;
};

// User fallback implementation
const userFallback = {
  findUnique: async (args: { where: { email?: string; id?: string }; select?: any }) => {
    if (isDbOnline) {
      try {
        return await realPrisma.user.findUnique(args as any);
      } catch (err) {
        if (isConnectionError(err)) {
          isDbOnline = false;
        } else {
          throw err;
        }
      }
    }

    for (const u of memoryStore.users.values()) {
      if (args.where.email && u.email.toLowerCase() === args.where.email.toLowerCase()) {
        return args.select ? sanitizeUser(u, args.select) : u;
      }
      if (args.where.id && u.id === args.where.id) {
        return args.select ? sanitizeUser(u, args.select) : u;
      }
    }
    return null;
  },

  findFirst: async (args?: any) => {
    if (isDbOnline) {
      try {
        return await realPrisma.user.findFirst(args);
      } catch (err) {
        if (isConnectionError(err)) {
          isDbOnline = false;
        } else {
          throw err;
        }
      }
    }

    const first = memoryStore.users.values().next().value;
    return first || null;
  },

  create: async (args: { data: any; select?: any }) => {
    if (isDbOnline) {
      try {
        return await realPrisma.user.create(args as any);
      } catch (err) {
        if (isConnectionError(err)) {
          isDbOnline = false;
        } else {
          throw err;
        }
      }
    }

    const id = args.data.id || `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const record: MemoryUser = {
      id,
      email: args.data.email,
      passwordHash: args.data.passwordHash,
      firstName: args.data.firstName || null,
      lastName: args.data.lastName || null,
      currency: args.data.currency || 'USD',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.users.set(id, record);

    return args.select ? sanitizeUser(record, args.select) : record;
  },
};

// RefreshToken fallback implementation
const refreshTokenFallback = {
  create: async (args: { data: any }) => {
    if (isDbOnline) {
      try {
        return await realPrisma.refreshToken.create(args as any);
      } catch (err) {
        if (isConnectionError(err)) {
          isDbOnline = false;
        } else {
          throw err;
        }
      }
    }

    const id = `token_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const record: MemoryRefreshToken = {
      id,
      token: args.data.token,
      userId: args.data.userId,
      expiresAt: args.data.expiresAt,
      revoked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.refreshTokens.set(args.data.token, record);
    return record;
  },

  findUnique: async (args: { where: { token: string } }) => {
    if (isDbOnline) {
      try {
        return await realPrisma.refreshToken.findUnique(args as any);
      } catch (err) {
        if (isConnectionError(err)) {
          isDbOnline = false;
        } else {
          throw err;
        }
      }
    }

    return memoryStore.refreshTokens.get(args.where.token) || null;
  },

  update: async (args: { where: { id?: string }; data: any }) => {
    if (isDbOnline) {
      try {
        return await realPrisma.refreshToken.update(args as any);
      } catch (err) {
        if (isConnectionError(err)) {
          isDbOnline = false;
        } else {
          throw err;
        }
      }
    }

    for (const item of memoryStore.refreshTokens.values()) {
      if (item.id === args.where.id) {
        Object.assign(item, args.data, { updatedAt: new Date() });
        return item;
      }
    }
    return null;
  },

  updateMany: async (args: { where: { token?: string; userId?: string }; data: any }) => {
    if (isDbOnline) {
      try {
        return await realPrisma.refreshToken.updateMany(args as any);
      } catch (err) {
        if (isConnectionError(err)) {
          isDbOnline = false;
        } else {
          throw err;
        }
      }
    }

    let count = 0;
    for (const item of memoryStore.refreshTokens.values()) {
      if (
        (args.where.token && item.token === args.where.token) ||
        (args.where.userId && item.userId === args.where.userId)
      ) {
        Object.assign(item, args.data, { updatedAt: new Date() });
        count++;
      }
    }
    return { count };
  },
};

// Create transparent Proxy for Prisma
export const prisma = new Proxy(realPrisma, {
  get(target, prop, receiver) {
    if (prop === 'user') {
      return userFallback;
    }
    if (prop === 'refreshToken') {
      return refreshTokenFallback;
    }
    return Reflect.get(target, prop, receiver);
  },
});

export default prisma;
