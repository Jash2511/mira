import dotenv from 'dotenv';
import app from '../src/app.js';
import { connectDB } from '../src/utils/db.js';

// Ensure env vars are loaded when running on Vercel
dotenv.config();

// Lazy connect to DB once per serverless instance
let dbPromise;
function ensureDB() {
  if (!dbPromise) dbPromise = connectDB().catch((e) => {
    console.error('DB connection error', e);
    // Re-throw to surface error to platform
    throw e;
  });
  return dbPromise;
}

export default async function handler(req, res) {
  await ensureDB();
  return app(req, res);
}
