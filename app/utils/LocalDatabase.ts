import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'app/data/db.json');

export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  token: string;
  created: string;
  usedToday: number;
  dailyLimit: number;
}

export interface PaymentLog {
  id: string;
  userId: string;
  planName: string;
  amount: number;
  razorpayId: string;
  created: string;
}

export interface UsageMetric {
  userId: string;
  tokensUsed: number;
  runHours: number;
}

interface DatabaseSchema {
  apiKeys: ApiKey[];
  payments: PaymentLog[];
  usage: Record<string, UsageMetric>;
}

// Guarantee directory and database file exist
function initializeDb(): DatabaseSchema {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const initialData: DatabaseSchema = {
      apiKeys: [],
      payments: [],
      usage: {}
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    const initialData: DatabaseSchema = {
      apiKeys: [],
      payments: [],
      usage: {}
    };
    return initialData;
  }
}

export const LocalDb = {
  read(): DatabaseSchema {
    return initializeDb();
  },

  write(data: DatabaseSchema) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  },

  // --- API KEYS ---
  getApiKeys(userId: string): ApiKey[] {
    const db = this.read();
    return db.apiKeys.filter(k => k.userId === userId);
  },

  addApiKey(userId: string, name: string): ApiKey {
    const db = this.read();
    const randChars = Array.from({ length: 24 }, () => Math.floor(Math.random() * 36).toString(36)).join('');
    const token = `px_live_${randChars}`;
    const newKey: ApiKey = {
      id: Math.random().toString(36).substring(2),
      userId,
      name,
      token,
      created: new Date().toLocaleDateString(),
      usedToday: 0,
      dailyLimit: 1000
    };
    db.apiKeys.push(newKey);
    this.write(db);
    return newKey;
  },

  revokeApiKey(userId: string, id: string): boolean {
    const db = this.read();
    const beforeLength = db.apiKeys.length;
    db.apiKeys = db.apiKeys.filter(k => !(k.id === id && k.userId === userId));
    this.write(db);
    return db.apiKeys.length < beforeLength;
  },

  validateKey(token: string): ApiKey | null {
    const db = this.read();
    const key = db.apiKeys.find(k => k.token === token);
    return key || null;
  },

  incrementKeyUsage(token: string, tokens: number) {
    const db = this.read();
    const keyIndex = db.apiKeys.findIndex(k => k.token === token);
    if (keyIndex !== -1) {
      db.apiKeys[keyIndex].usedToday += tokens;
      this.write(db);
      
      // Update global user usage telemetry as well
      const userId = db.apiKeys[keyIndex].userId;
      this.incrementUserUsage(userId, tokens, 0.05);
    }
  },

  // --- PAYMENTS ---
  getPayments(userId: string): PaymentLog[] {
    const db = this.read();
    return db.payments.filter(p => p.userId === userId);
  },

  addPayment(userId: string, planName: string, amount: number, razorpayId: string): PaymentLog {
    const db = this.read();
    const newPayment: PaymentLog = {
      id: `inv_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      userId,
      planName,
      amount,
      razorpayId,
      created: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    db.payments.push(newPayment);
    this.write(db);
    return newPayment;
  },

  // --- USAGE TELEMETRY ---
  getUserUsage(userId: string): UsageMetric {
    const db = this.read();
    if (!db.usage[userId]) {
      db.usage[userId] = {
        userId,
        tokensUsed: 0,
        runHours: 0
      };
      this.write(db);
    }
    return db.usage[userId];
  },

  incrementUserUsage(userId: string, tokens: number, hours: number) {
    const db = this.read();
    if (!db.usage[userId]) {
      db.usage[userId] = {
        userId,
        tokensUsed: 0,
        runHours: 0
      };
    }
    db.usage[userId].tokensUsed += tokens;
    db.usage[userId].runHours += hours;
    this.write(db);
  }
};
