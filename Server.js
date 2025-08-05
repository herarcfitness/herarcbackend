const mongoose = require('mongoose');

// MongoDB connection with better error handling
const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb+srv://imjaydaharris:28NewLife%21@herarc.2xz1s8t.mongodb.net/herarc?retryWrites=true&w=majority&appName=HerArc', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB:', conn.connection.host);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const Client = require('./Models/Client');

// Create a new client
app.post('/api/clients', async (req, res) => {
  try {
    const newClient = new Client(req.body);
    const savedClient = await newClient.save();
    res.status(201).json(savedClient);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// Get all clients
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// Update a client
app.put('/api/clients/:id', async (req, res) => {
  try {
    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // return the updated client
    );

    if (!updatedClient) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json(updatedClient);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// Delete a client
app.delete('/api/clients/:id', async (req, res) => {
  try {
    const deletedClient = await Client.findByIdAndDelete(req.params.id);

    if (!deletedClient) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ message: 'Client deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete client' });
  }
});
// Example in-memory "database"
let message = 'Hello from the backend!';

// GET endpoint
app.get('/api/message', (req, res) => {
  res.json({ message });
});

// POST endpoint to update the message
app.post('/api/message', (req, res) => {
  const { newMessage } = req.body;
  if (newMessage) {
    message = newMessage;
    res.json({ success: true, updated: message });
  } else {
    res.status(400).json({ success: false, error: 'Missing newMessage' });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));