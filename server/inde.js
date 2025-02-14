const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = 5000;

// PostgreSQL connection pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'world', // Update with your actual database name
  password: 'dolphin', // Update with your actual password
  port: 5432,
});

app.use(bodyParser.json());

// Endpoint to handle fetching booked vehicles for a specific user
app.post('/fetch-booked-vehicles', async (req, res) => {
  const { user_id } = req.body;

  try {
    // Query to fetch booked vehicles for the specified user
    const query = `
      SELECT * FROM booked
      WHERE user_id = $1
    `;

    const { rows } = await pool.query(query, [user_id.toString()]); // Convert user_id to string
    res.json(rows);
  } catch (error) {
    console.error('Error fetching booked vehicles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
