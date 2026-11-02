import path from "node:path";
import dotenv from "dotenv";
import postgres from '@prisma/orm-postgres/runtime';
import { contractFromJson } from '@prisma/orm-postgres/static';
import type { Contract } from './contract.d';
import contractJson from './contract.json' with { type: 'json' };

// Ensure .env is loaded regardless of whether the app was started from repo root,
// packages/server, or packages/database.
if (!process.env['DATABASE_URL']) {
  dotenv.config();
  if (!process.env['DATABASE_URL']) {
    dotenv.config({ path: path.resolve(import.meta.dirname, '../../.env') });
  }
  if (!process.env['DATABASE_URL']) {
    dotenv.config({ path: path.resolve(import.meta.dirname, '../../../../.env') });
  }
}

const databaseUrl = process.env['DATABASE_URL'];
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not defined in environment variables or .env file. Please check your .env configuration."
  );
}

export const contract = contractFromJson<Contract>(contractJson);

export const db = postgres({
  contract,
  url: databaseUrl,
});
