// backend/routes/bible.js
const express = require('express');
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./randomverse.db"); // your SQLite setup file

// 1. Get all books
router.get('/books', (req, res) => {
  db.all('SELECT DISTINCT book FROM bible ORDER BY id', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(r => r.book));
  });
});

// 2. Get chapters for a specific book
router.get('/chapters/:book', (req, res) => {
  const book = req.params.book;
  db.all('SELECT DISTINCT chapter FROM bible WHERE book = ? ORDER BY chapter', [book], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(r => r.chapter));
  });
});

// 3. Get verses for a specific book + chapter
router.get('/verses/:book/:chapter', (req, res) => {
  const { book, chapter } = req.params;
  db.all('SELECT verse, text FROM bible WHERE book = ? AND chapter = ? ORDER BY verse', [book, chapter], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 4. Get a single verse (for ?ref= deep links)
router.get('/verse/:book/:chapter/:verse', (req, res) => {
  const { book, chapter, verse } = req.params;
  db.get('SELECT text FROM bible WHERE book = ? AND chapter = ? AND verse = ?', [book, chapter, verse], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Verse not found' });
    res.json(row);
  });
});

module.exports = router;
