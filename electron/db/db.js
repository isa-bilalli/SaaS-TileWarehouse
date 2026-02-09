import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'logiNOW123!',
  multipleStatements: true, // Allow multiple SQL statements
};

let pool = null;

/**
 * Check if database exists
 */
async function databaseExists(connection, dbName) {
  try {
    const [rows] = await connection.query(
      'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?',
      [dbName]
    );
    return rows.length > 0;
  } catch (error) {
    console.error('Error checking database existence:', error);
    return false;
  }
}

/**
 * Initialize database connection and create schema if needed
 */
export async function initializeDatabase() {
  try {
    // First, connect without a database to check if it exists
    const connection = await mysql.createConnection(dbConfig);
    
    const dbName = 'arta-commerce';
    const escapedDbName = '`arta-commerce`';
    const exists = await databaseExists(connection, dbName);
    
    if (!exists) {
      // Create database with escaped name
      await connection.query(`CREATE DATABASE IF NOT EXISTS ${escapedDbName}`);
      
      // Read schema file
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      // Split by semicolons and filter out CREATE DATABASE and USE statements
      const statements = schema
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => {
          const upper = stmt.toUpperCase();
          return stmt.length > 0 && 
                 !upper.startsWith('CREATE DATABASE') && 
                 !upper.startsWith('USE');
        });
      
      // Connect to the database
      await connection.query(`USE ${escapedDbName}`);
      
      // Execute each table creation statement
      for (const statement of statements) {
        if (statement.length > 0) {
          await connection.query(statement + ';');
        }
      }
    }
    
    await connection.end();
    
    // Now create connection pool with the database
    pool = mysql.createPool({
      ...dbConfig,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    
    return pool;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

/**
 * Get the database connection pool
 * Make sure to call initializeDatabase() first
 */
export function getPool() {
  if (!pool) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return pool;
}

/**
 * Close all database connections
 */
export async function closeDatabase() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

