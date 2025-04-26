// server.js
// A simple Express.js backend for a Todo list API

const express = require('express');
const path = require('path')
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Middle ware to inlcude static content
app.use(express.static('public'))

const db = new sqlite3.Database('./todos.db', (err) => {
  if (err) {
    console.error('Error opening database ' + err.message);
  } else {
    console.log(' ✅ Connected to the SQLite database.');
  }
});

db.run(`CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  priority TEXT DEFAULT 'low',
  isComplete BOOLEAN DEFAULT false,
  isFun BOOLEAN DEFAULT false
)`);

// server index.html
app.get('/', (req, res) => {
    res.sendFile('index.html')
})

// GET all todo items
app.get('/todos', (req, res) => {
    db.all('SELECT * FROM todos', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        res.json(rows);
    });
  
    //res.json(todos);
});

// GET a specific todo item by ID
app.get('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  db.get('SELECT * FROM todos WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err.message });
    }
    if (row) {
      res.json(row);
    } else {
      res.status(404).json({ message: 'Todo item not found' });
    }
  });
});

// POST a new todo item
app.post('/todos', (req, res) => {
  const { name, priority = 'low', isFun } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }
  // find the next available ID
  db.all('SELECT id FROM todos ORDER BY id ASC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err.message });
    }
  let nextId = 1;
    for (const row of rows) {
      if (row.id === nextId) {
        nextId++;
      } else {
        break;
      }   
}

  const query = `INSERT INTO todos (id, name, priority, isComplete, isFun) VALUES (?, ?, ?, ?, ?)`;
  db.run(query, [nextId, name, priority, false, isFun], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Database run error', error: err.message });
    }
    res.status(201).json({ id: nextId, name, priority, isComplete: false, isFun });
  });
});
});

// DELETE a todo item by ID
app.delete('/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);

    const query = `DELETE FROM todos WHERE id = ?`;
  
    db.run(query, [id], function (err) {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Todo item not found' });
      }
      res.json({ message: `Todo item ${id} deleted.` });
    });
  });
  
  // Start the server
  app.listen(port, () => {
    console.log(`🚀 Todo API server running at http://localhost:${port}`);
  });