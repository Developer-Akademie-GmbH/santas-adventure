const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 Minuten Fenster
    max: 200, // Limit auf 100 Requests pro IP innerhalb 15 Minuten
});

const app = express();
app.use(express.json());
app.use(cors());
app.use(limiter);
app.use(express.static('public'));

// Geheimschlüssel zur Signierung
const SECRET_KEY = "SUPER_GEHEIMES_PASSWORT"; // sollte in der Praxis in Umgebungsvariablen liegen

// Datenbank initialisieren
const db = new sqlite3.Database('scores.db', (err) => {
    if (err) {
        console.error('Fehler beim Öffnen der Datenbank:', err);
    } else {
        db.run(`
      CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        score INTEGER NOT NULL
      )
    `);
    }
});

// Hilfsfunktion, um Signatur zu erstellen
function createSignature(username, score) {
    return crypto
        .createHmac('sha256', SECRET_KEY)
        .update(username + score)
        .digest('hex');
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// POST /score: Speichert den Punktestand eines Spielers
app.post('/score', (req, res) => {
    const { username, score, signature } = req.body;

    if (typeof username !== 'string' || typeof score !== 'number' || typeof signature !== 'string') {
        return res.status(400).json({ error: 'Ungültige Daten' });
    }

    // Signatur überprüfen
    const expectedSignature = createSignature(username, score);
    if (signature !== expectedSignature) {
        return res.status(403).json({ error: 'Signatur ungültig. Mögliche Manipulation.' });
    }

    // Daten sicher einfügen (prepared statement)
    const stmt = db.prepare('INSERT INTO scores (username, score) VALUES (?, ?)');
    stmt.run(username, score, function (err) {
        if (err) {
            console.error('Datenbankfehler:', err);
            return res.status(500).json({ error: 'Interner Serverfehler' });
        }
        return res.json({ success: true, id: this.lastID });
    });
});

// GET /top20: Gibt die 20 besten Spieler zurück
app.get('/top20', (req, res) => {
    db.all('SELECT username, score FROM scores ORDER BY score DESC LIMIT 20', [], (err, rows) => {
        if (err) {
            console.error('Datenbankfehler:', err);
            return res.status(500).json({ error: 'Interner Serverfehler' });
        }
        return res.json(rows);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});
