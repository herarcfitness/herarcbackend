require('dotenv').config();
const mongoose = require('mongoose');

//Stripe webhook setup//
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const bodyParser = require('body-parser');
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

const allowedOrigins = [
  'http://localhost:5173',
  'https://herarccoach.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

//Add code before express.json//
app.post('/webhook', bodyParser.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle event types here
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('✅ Payment received:', session);
    // Save to DB later
  }

  res.status(200).json({ received: true });
});

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