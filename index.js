// ==============================
// Simple Student CRUD (Vercel + MongoDB Data API)
// ==============================

// Load environment variables
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

// ====== Helper Function ======
async function callDataAPI(action, body) {
  const response = await fetch(`${process.env.DATA_API_URL}/action/${action}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.DATA_API_KEY,
    },
    body: JSON.stringify({
      dataSource: process.env.DATA_API_DATASOURCE, // usually "Cluster0"
      database: process.env.DATA_API_DATABASE,     // your DB name
      collection: process.env.DATA_API_COLLECTION, // "students"
      ...body,
    }),
  });
  return response.json();
}

// ====== Routes ======

// Root route
app.get('/', (req, res) => {
  res.send('✅ Student CRUD API (MongoDB Data API version) is running!');
});

// Create student
app.post('/students', async (req, res) => {
  try {
    const result = await callDataAPI('insertOne', { document: req.body });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Read all students
app.get('/students', async (req, res) => {
  try {
    const result = await callDataAPI('find', { sort: { createdAt: -1 } });
    res.json(result.documents || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Read one student
app.get('/students/:id', async (req, res) => {
  try {
    const result = await callDataAPI('findOne', {
      filter: { _id: { $oid: req.params.id } },
    });
    if (!result.document) return res.status(404).json({ message: 'Student not found' });
    res.json(result.document);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update student
app.put('/students/:id', async (req, res) => {
  try {
    const result = await callDataAPI('updateOne', {
      filter: { _id: { $oid: req.params.id } },
      update: { $set: req.body },
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete student
app.delete('/students/:id', async (req, res) => {
  try {
    const result = await callDataAPI('deleteOne', {
      filter: { _id: { $oid: req.params.id } },
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ====== Export for Vercel ======
module.exports = app;
