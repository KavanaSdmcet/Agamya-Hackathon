const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/tasks.db');

const saveTasks = (tasks) => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH);
        
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO tasks 
            (id, meeting_id, description, assignee, deadline, status, confidence, original_sentence, extracted_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            
            tasks.forEach(task => {
                stmt.run([
                    task.id,
                    task.meetingId,
                    task.description,
                    task.assignee,
                    task.deadline,
                    task.status,
                    task.confidence,
                    task.originalSentence,
                    task.extractedAt
                ]);
            });
            
            db.run('COMMIT', (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
        
        stmt.finalize();
        db.close();
    });
};

const getTasks = (userId, filters = {}) => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH);
        
        let query = `
            SELECT t.*, m.subject as meeting_subject, m.start_time as meeting_date
            FROM tasks t
            JOIN meetings m ON t.meeting_id = m.id
            WHERE m.user_id = ?
        `;
        
        const params = [userId];
        
        if (filters.status && filters.status !== 'all') {
            query += ' AND t.status = ?';
            params.push(filters.status);
        }
        
        if (filters.assignee) {
            query += ' AND t.assignee LIKE ?';
            params.push(`%${filters.assignee}%`);
        }
        
        query += ' ORDER BY t.created_at DESC';
        
        db.all(query, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
        
        db.close();
    });
};

const getTasksByMeeting = (meetingId) => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH);
        
        db.all(
            'SELECT * FROM tasks WHERE meeting_id = ? ORDER BY created_at DESC',
            [meetingId],
            (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            }
        );
        
        db.close();
    });
};

const updateTaskStatus = (taskId, status) => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH);
        
        db.run(
            'UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, taskId],
            function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            }
        );
        
        db.close();
    });
};

const deleteTask = (taskId) => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH);
        
        db.run(
            'DELETE FROM tasks WHERE id = ?',
            [taskId],
            function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            }
        );
        
        db.close();
    });
};

module.exports = {
    saveTasks,
    getTasks,
    getTasksByMeeting,
    updateTaskStatus,
    deleteTask
};