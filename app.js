const { Client } = require('pg');

async function runDatabaseTask() {
    // 1. Connection config matching our docker-compose environment variables
    const client = new Client({
        connectionString: 'postgresql://myuser:mypassword@localhost:5432/mydb'
    });

    try {
        await client.connect();
        console.log("[x] Successfully connected to PostgreSQL!");

        // 2. Create a table if it doesn't exist yet
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 3. Grab the custom name from the terminal command arguments
        const inputName = process.argv.slice(2).join(' ') || 'Anonymous Learner';

        // 4. Insert data using a parameterized query (protects against SQL Injection)
        await client.query('INSERT INTO users (name) VALUES ($1)', [inputName]);
        console.log(`[x] Inserted user row: '${inputName}'`);

        // 5. Query and display all entries
        const result = await client.query('SELECT * FROM users ORDER BY id ASC');
        
        console.log('\n--- Current Database Table Contents ---');
        result.rows.forEach(row => {
            console.log(`ID: ${row.id} | Name: ${row.name} | Joined: ${row.created_at}`);
        });
        console.log('---------------------------------------\n');

    } catch (error) {
        console.error("Database Operation Error:", error);
    } finally {
        // 6. Always close the pool/client connection when done
        await client.end();
        console.log("[x] Disconnected from database cleanly.");
    }
}

runDatabaseTask();