const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/tasks.db');

const saveUser = (userData) => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH);
        
        db.run(
            `INSERT OR REPLACE INTO users 
             (id, email, name, access_token, refresh_token) 
             VALUES (?, ?, ?, ?, ?)`,
            [userData.id, userData.email, userData.name, userData.accessToken, userData.refreshToken],
            function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            }
        );
        
        db.close();
    });
};

const getUserById = (userId) => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH);
        
        db.get(
            'SELECT * FROM users WHERE id = ?',
            [userId],
            (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            }
        );
        
        db.close();
    });
};

module.exports = {
    saveUser,
    getUserById
};