import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import * as schema from '../utils/schema'
config({ path: ".env.local  " }); 


import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL);


export const db = drizzle(sql, { schema });
