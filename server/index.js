const express = require("express");
const { Pool } = require("pg");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "dolphin",
  port: 5432,
});

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

app.post("/signup", async (req, res) => {
  const { name, dob, mobile, address, user_id, password, d_l_n } = req.body;
  
  // Simple validation to check if required fields are provided
  if (!name || !dob || !mobile || !address || !user_id || !password || !d_l_n) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Check if the user already exists in the database
    const existingUser = await pool.query("SELECT * FROM users WHERE user_id = $1", [user_id]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Insert new user into the database
    const newUser = await pool.query(
      "INSERT INTO users(name, dob, mobile, address, user_id, password, d_l_n) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [name, dob, mobile, address, user_id, password, d_l_n]
    );
    
    // Return the newly created user
    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error("Error signing up user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.post('/login', async (req, res) => {
  const { user_id, password } = req.body;

  try {
    // Check if the user exists with the provided user_id and password
    const userQuery = await pool.query('SELECT * FROM users WHERE user_id = $1 AND password = $2', [user_id, password]);
    const user = userQuery.rows[0];

    if (!user) {
      // If no user found with the provided user_id and password, return an error
      return res.status(401).json({ error: 'Invalid user_id or password' });
    }

    // If user exists and password is correct, return user data
    res.json(user);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Define route to handle PUT requests to update user profile
app.put('/updateProfile', async (req, res) => {
  const { user_id, name, dob, mobile, address, password, d_l_n } = req.body;

  try {
    // Update the user profile in the database
    const result = await pool.query(`
      UPDATE users 
      SET name = $1, dob = $2, mobile = $3, address = $4, password = $5, d_l_n = $6 
      WHERE user_id = $7`,
      [name, dob, mobile, address, password, d_l_n, user_id]
    );

    if (result.rowCount === 1) {
      res.status(200).json({ message: 'Profile updated successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});





// Endpoint to get user data
app.get('/userData', (req, res) => {
  res.json(users);
});

app.get('/bookings/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const { start_date, end_date } = req.query;

  try {
    // Query to fetch bookings for the specified user and dates
    const query = {
      text: `
        SELECT * 
        FROM booked 
        WHERE user_id = $1 
        AND start_date >= $2 
        AND end_date <= $3
      `,
      values: [user_id, start_date, end_date]
    };

    const result = await pool.query(query);

    res.json(result.rows); // Return the fetched bookings as JSON response
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Assuming you have initialized the pool correctly, as shown in the previous code snippet

app.get('/upcomingBookings', async (req, res) => {
  const { user_id } = req.query;

  try {
    // Fetch upcoming bookings from the database
    const queryText = `
      SELECT vehicle_id,  start_date, end_date, booking_id
      FROM booked
      WHERE user_id = $1 AND start_date > current_date
    `;
    const { rows } = await pool.query(queryText, [user_id]);

    // Send the retrieved bookings as a JSON response
    res.json(rows);
  } catch (error) {
    console.error('Error fetching upcoming bookings:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/deleteBooking/:id', async (req, res) => {
  const bookingId = parseInt(req.params.id);

  try {
    // Delete the booking from the database
    const result = await pool.query('DELETE FROM booked WHERE booking_id = $1', [bookingId]);

    if (result.rowCount === 1) {
      // If one row is deleted, send success response
      res.sendStatus(204); // No content - successful deletion
    } else {
      // If no rows were deleted (booking not found), send not found response
      res.status(404).json({ message: "Booking not found" });
    }
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get('/getBookingDetails', async (req, res) => {
  const { bookingId } = req.query;

  try {
    // Fetch booking details from the database
    const queryText = `
      SELECT vehicle_id, start_date, end_date,
      FROM booked
      WHERE booking_id = $1
    `;
    const { rows } = await pool.query(queryText, [bookingId]);

    if (rows.length === 0) {
      // If no booking found with the provided ID
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Send the retrieved booking details as a JSON response
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching booking details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/bookings/:id', async (req, res) => {
  const { id } = req.params;
  const { start_date, end_date } = req.query;

  try {
    const { rows } = await pool.query('SELECT * FROM booked WHERE user_id = $1 AND start_date >= $2 AND end_date <= $3', [id, start_date, end_date]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




// Define route to handle DELETE requests to delete a booking by ID
app.delete('/bookings/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Delete the booking from the database
    const result = await pool.query('DELETE FROM booked WHERE booking_id = $1', [id]);
    if (result.rowCount === 1) {
      res.status(200).json({ message: 'Booking deleted successfully' });
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/getAvailableDates', async (req, res) => {
  const { vehicleId, startDate } = req.body;

  // Calculate 30 days before and after the start date
  const thirtyDaysBeforeStartDate = new Date(startDate);
  thirtyDaysBeforeStartDate.setDate(thirtyDaysBeforeStartDate.getDate() - 30);

  const thirtyDaysAfterStartDate = new Date(startDate);
  thirtyDaysAfterStartDate.setDate(thirtyDaysAfterStartDate.getDate() + 30);

  try {
    const queryText = `
      SELECT start_date, end_date
      FROM booked
      WHERE vehicle_id = $1
      AND start_date >= $2 AND start_date <= $3
      AND end_date >= $4
    `;
    const { rows } = await pool.query(queryText, [vehicleId, thirtyDaysBeforeStartDate, thirtyDaysAfterStartDate, startDate]);

    let bookedDates = [];
    rows.forEach(row => {
      const startDate = new Date(row.start_date);
      const endDate = new Date(row.end_date);
      const datesInRange = getDatesInRange(startDate, endDate);
      bookedDates = [...bookedDates, ...datesInRange];
    });

    // Get unique dates
    const uniqueBookedDates = Array.from(new Set(bookedDates.map(date => date.toISOString().slice(0, 10))));

    // Get available dates
    const availableDates = getAvailableDates(thirtyDaysBeforeStartDate, thirtyDaysAfterStartDate, uniqueBookedDates);

    res.json(availableDates);
  } catch (error) {
    console.error('Error fetching available dates:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

function getDatesInRange(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}

function getAvailableDates(startDate, endDate, bookedDates) {
  const availableDates = [];
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateString = currentDate.toISOString().slice(0, 10);
    if (!bookedDates.includes(dateString)) {
      availableDates.push(dateString);
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return availableDates;
}

app.put('/updateBooking', async (req, res) => {
  const { bookingId, startDate, endDate } = req.body;

  try {
    // Perform the update in the database
    const queryText = `
      UPDATE booked
      SET start_date = $1, end_date = $2
      WHERE booking_id = $3
    `;
    await pool.query(queryText, [startDate, endDate, bookingId]);

    res.status(200).json({ message: 'Booking updated successfully' });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/modifyBooking', async (req, res) => {
  const { vehicleId, startDate, endDate } = req.body;

  try {
    
    const updateQuery = `
      UPDATE booked
      SET start_date = $1, end_date = $2
      WHERE vehicle_id = $3
    `;
    await pool.query(updateQuery, [startDate, endDate, vehicleId]);

    // Fetch all bookings for the specified vehicle
    const queryText = `
      SELECT start_date, end_date
      FROM booked
      WHERE vehicle_id = $1
    `;
    const { rows } = await pool.query(queryText, [vehicleId]);

    // Extract booked dates
    const bookedDates = rows.map(row => ({
      start: new Date(row.start_date),
      end: new Date(row.end_date),
    }));

    // Calculate available dates based on booked dates
    const availableDates = getAvailableDates(bookedDates, startDate, endDate);

    res.json(availableDates);
  } catch (error) {
    console.error('Error modifying booking:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/search-vehicles', async (req, res) => {
  try {
    console.log(req.body);
    const startDate = req.body.start_date;
    const endDate = req.body.end_date;
    const Model = req.body.model;
    const user_id = req.body.user_id; // corrected variable name

    console.log(startDate, endDate, Model, user_id);

    const client = await pool.connect();
    
    const bookedResult = await client.query('SELECT DISTINCT vehicle_id FROM booked WHERE start_date <= $1 AND end_date >= $2', [startDate, endDate]);
    console.log(bookedResult.rows);
    const bookedVehicleIds = bookedResult.rows.map(row => row.vehicle_id);
    console.log(bookedVehicleIds);
    
    const availableResult = await client.query('SELECT * FROM vehicle WHERE model = $1 AND vehicle_id NOT IN (SELECT unnest($2::int[]))', [Model, bookedVehicleIds]);
    console.log(availableResult.rows);

    client.release();
    res.json(availableResult.rows);
  } catch (error) {
    console.error('Error fetching booked vehicles:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/check-user/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    
    const userExistsQuery = 'SELECT EXISTS(SELECT 1 FROM users WHERE user_id = $1)';
    const { rows } = await pool.query(userExistsQuery, [user_id]);
    const userExists = rows[0].exists;

    if (!userExists) {
      return res.status(400).json({ exists: false, error: 'User does not exist. Please register first.' });
    }

    res.status(200).json({ exists: true });
  } catch (error) {
    console.error('Error checking user:', error);
    res.status(500).json({ exists: false, error: 'Error checking user' });
  }
});


app.post('/book-vehicle', async (req, res) => {
  try {
    const { user_id, start_date, end_date, vehicle_id } = req.body;
    
    const userExistsQuery = 'SELECT EXISTS(SELECT 1 FROM users WHERE user_id = $1)';
    const { rows } = await pool.query(userExistsQuery, [user_id]);
    const userExists = rows[0].exists;

    if (!userExists) {
      return res.status(400).json({ error: 'User does not exist. Please register first.' });
    }
    
    const existingBookingQuery = 'SELECT * FROM booked WHERE user_id = $1 AND start_date <= $3 AND end_date >= $2';
    const existingBookingResult = await pool.query(existingBookingQuery, [user_id, start_date, end_date]);
    if (existingBookingResult.rows.length > 0) {
      return res.status(400).json({ error: 'You already have a booking between the entered dates.' });
    }
   
    const query = 'INSERT INTO booked (user_id, start_date, end_date, vehicle_id) VALUES ($1, $2,  $3, $4) RETURNING booking_id';
    const result = await pool.query(query, [user_id, start_date, end_date,  vehicle_id]);
    const bookingId = result.rows[0].booking_id;
    res.status(200).json({ booking_id: bookingId });
  } catch (error) {
    console.error('Error booking vehicle:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




app.get('/vehicles', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM vehicle');
    client.release();
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/booking/:id', async (req, res) => {
  const bookingId = req.params.id;
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM booked WHERE booking_id = $1', [bookingId]);
    client.release();
    res.json(result.rows);
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/vehicle/:id', async (req, res) => {
  const vehicleId = req.params.id;
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM vehicle WHERE vehicle_id = $1', [vehicleId]);
    client.release();
    res.json(result.rows);
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.post('/payment', async (req, res) => {
  const { payment_id, bill_id, booking_id, total_amount } = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO payment (payment_id, bill_id, booking_id, total_amount) VALUES ($1, $2, $3, $4)',
      [payment_id, bill_id, booking_id, total_amount]
    );
    client.release();
    res.status(201).send('Payment successful');
  } catch (error) {
    console.error('Error inserting payment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/addVehicle', async (req, res) => {
  const { vehicle_id, model, secu_deposit, rent, distance_travelled } = req.body;

  try {
    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO vehicle (vehicle_id, model, secu_deposit, rent, distance_travelled) VALUES ($1, $2, $3, $4, $5)',
      [vehicle_id, model, secu_deposit, rent, distance_travelled]
    );

    client.release();
    res.status(201).json({ message: 'Vehicle added successfully' });
  } catch (error) {
    console.error('Error adding vehicle', error);
    res.status(500).json({ error: 'Failed to add vehicle' });
  }
});

app.delete('/api/vehicles/:id', async (req, res) => {
  const vehicle_id = req.params.id;

  try {
   
    const result = await pool.query('SELECT * FROM vehicle WHERE vehicle_id = $1', [vehicle_id]);
    const vehicle = result.rows[0];

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    // Delete the vehicle
    await pool.query('DELETE FROM vehicle WHERE vehicle_id = $1', [vehicle_id]);
    res.status(200).json({ success: true, message: 'Vehicle removed successfully.' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ success: false, message: 'An error occurred while deleting the vehicle.' });
  }
});




app.get('/api/bookedVehicles', async (req, res) => {
  const { start_date, end_date } = req.query;

  if (!start_date || !end_date) {
    return res.status(400).json({ error: 'Start date and end date are required' });
  }

  try {
    // Fetch all fields of booked vehicles from the database between the given dates
    const result = await pool.query('SELECT * FROM booked WHERE start_date >= $1 AND end_date <= $2', [start_date, end_date]);
    const bookedVehicles = result.rows;
    res.json(bookedVehicles);
  } catch (error) {
    console.error('Error fetching booked vehicles:', error);
    res.status(500).json({ error: 'Failed to fetch booked vehicles' });
  }
});

app.post('/AvailableVehicles', async (req, res) => {
  try {
    const { start_date, end_date } = req.body;

    const client = await pool.connect();

    const bookedResult = await client.query('SELECT DISTINCT vehicle_id FROM booked WHERE start_date <= $1 AND end_date >= $2', [end_date, start_date]);
    const bookedVehicleIds = bookedResult.rows.map(row => row.vehicle_id);

    const availableVehiclesResult = await client.query('SELECT * FROM vehicle WHERE vehicle_id NOT IN (SELECT vehicle_id FROM booked WHERE start_date <= $1 AND end_date >= $2)', [end_date, start_date]);
    const availableVehicles = availableVehiclesResult.rows;

    client.release();
    
    res.json(availableVehicles);
  } catch (error) {
    console.error('Error fetching available vehicles:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/vehicles/:id', async (req, res) => {
  const { id } = req.params;
  const { model, distance_travelled, rent, secu_deposit } = req.body;

  try {
    const client = await pool.connect();

    // Update the vehicle data in the database
    const result = await client.query(
      'UPDATE vehicle SET model = $1, distance_travelled = $2, rent = $3, secu_deposit = $4 WHERE vehicle_id = $5',
      [model, distance_travelled, rent, secu_deposit, id]
    );

    client.release();

    res.status(200).json({ message: 'Vehicle data updated successfully' });
  } catch (error) {
    console.error('Error updating vehicle data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.delete('/users/:user_id', async (req, res) => {
  const userId = req.params.user_id; // No need to parse, it's already a string
  
  try {
    const result = await pool.query('DELETE FROM users WHERE user_id = $1', [userId]);

    if (result.rowCount > 0) {
      res.sendStatus(200); // User deleted successfully
    } else {
      res.status(404).send(`User with ID ${userId} does not exist.`);
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send('Error deleting user');
  }
});

app.get('/usersByModel/:model', async (req, res) => {
  const { model } = req.params;
  
  try {
    const query = `
      SELECT DISTINCT b.user_id
      FROM booked b
      JOIN vehicle v ON b.vehicle_id = v.vehicle_id
      WHERE v.model = $1
    `;
    const { rows } = await pool.query(query, [model]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
});


app.get('/vehiclesByUser/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const query = `
      SELECT DISTINCT  v.model
      FROM booked b
      JOIN vehicle v ON b.vehicle_id = v.vehicle_id
      WHERE b.user_id = $1
    `;
    const { rows } = await pool.query(query, [userId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: 'Error fetching vehicles' });
  }
});







app.get("/", (req, res) => {
  res.send("Welcome to API of website");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
