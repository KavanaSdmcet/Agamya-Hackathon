const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
try {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log('✅ Created data directory');
    }
} catch (error) {
    console.error('❌ Error creating data directory:', error.message);
    console.log('💡 Using in-memory database instead');
}

// Try file-based database, fallback to memory
let DB_PATH;
try {
    DB_PATH = path.join(dataDir, 'tasks.db');
    // Test if we can write to this location
    fs.accessSync(dataDir, fs.constants.W_OK);
    console.log('📁 Database path:', DB_PATH);
} catch (error) {
    console.log('⚠️ Cannot write to data directory, using in-memory database');
    DB_PATH = ':memory:';
}

function initDatabase() {
    const db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error('❌ Database connection failed:', err.message);
            return;
        }
        console.log('✅ Database connected successfully');
    });
    
    db.serialize(() => {
        // Create users table
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE,
                name TEXT,
                access_token TEXT,
                refresh_token TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) console.error('Error creating users table:', err.message);
            else console.log('✅ Users table ready');
        });
        
        // Create meetings table
        db.run(`
            CREATE TABLE IF NOT EXISTS meetings (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                subject TEXT,
                start_time DATETIME,
                end_time DATETIME,
                transcript_processed BOOLEAN DEFAULT FALSE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        `, (err) => {
            if (err) console.error('Error creating meetings table:', err.message);
            else console.log('✅ Meetings table ready');
        });
        
        // Create tasks table
        db.run(`
            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                meeting_id TEXT,
                description TEXT NOT NULL,
                assignee TEXT,
                deadline DATE,
                status TEXT DEFAULT 'pending',
                confidence REAL,
                original_sentence TEXT,
                extracted_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (meeting_id) REFERENCES meetings (id)
            )
        `, (err) => {
            if (err) console.error('Error creating tasks table:', err.message);
            else console.log('✅ Tasks table ready');
        });
    });
    
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('🎉 Database initialization complete');
        }
    });
}

module.exports = { initDatabase };