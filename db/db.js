import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg; //extracts the Pool class from the pg module - pg.Pool. See https://node-postgres.com/apis/pool

//create a new pool instance.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export default pool;