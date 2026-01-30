// Database configuration file
import pg from "pg"; // PostgreSQL client library for Node.js
import dotenv from "dotenv"; // Loads environment variables from .env file

// Load environment variables from .env file (for local development)
// In production, Render provides these variables automatically
dotenv.config();

const { Pool } = pg; //extracts the Pool class from the pg module - pg.Pool. See https://node-postgres.com/apis/pool

//create a new pool instance.
const pool = new Pool({
  // Database connection details (host, port, user, password, database name)
  // Stored in DATABASE_URL environment variable for security and flexibility
  connectionString: process.env.DATABASE_URL,

  // SSL configuration that varies by environment:
  // - Production: Must use SSL with self-signed certificate acceptance
  // - Development: No SSL needed for local database connections
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } // Accept any certificate (required for Render PostgreSQL)
    : false // No SSL for local development
});

export default pool;