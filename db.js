const { Pool } = require('pg');
require('dotenv').config();

const client = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
});

client.on('connect', () => {
  console.log('Connected to the database');
});

const createTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      "name" VARCHAR NOT NULL,
      age INTEGER NOT NULL,
      address JSONB,
      additional_info JSONB
    );
  `;

  try {
    await client.query(queryText);
    console.log('Users table created');
  } catch (err) {
    console.error('Error creating table:', err);
  }
};

const insertUser = async (user) => {
  const queryText = `
    INSERT INTO users (name, age, address, additional_info)
    VALUES ($1, $2, $3, $4);
  `;

  console.log("Inserting User:", user); // Debugging log

  const values = [user.name, user.age, user.address, user.additional_info];

  try {
    await client.query(queryText, values);
  } catch (err) {
    console.error('Error inserting user:', err);
  }
};

const getAllUsers = async () => {
  const queryText = 'SELECT * FROM users;';

  try {
    const res = await client.query(queryText);
    return res.rows;
  } catch (err) {
    console.error('Error getting users:', err);
    return [];
  }
};

module.exports = {
  createTable,
  insertUser,
  getAllUsers,
};
