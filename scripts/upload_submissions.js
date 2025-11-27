const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const MIGRATION_FILE = path.resolve(__dirname, '..', 'migrated_submissions.json');

async function main() {
    // Get URI from argument or environment variable
    const uri = process.argv[2] || process.env.MONGODB_URI;

    if (!uri) {
        console.error('Please provide the MongoDB connection string as an argument or MONGODB_URI environment variable.');
        console.error('Usage: node scripts/upload_submissions.js <CONNECTION_STRING>');
        process.exit(1);
    }

    if (!fs.existsSync(MIGRATION_FILE)) {
        console.error(`Migration file not found at ${MIGRATION_FILE}`);
        process.exit(1);
    }

    console.log(`Reading submissions from ${MIGRATION_FILE}...`);
    const submissions = JSON.parse(fs.readFileSync(MIGRATION_FILE, 'utf8'));
    console.log(`Read ${submissions.length} submissions.`);

    const client = new MongoClient(uri);

    try {
        console.log('Connecting to MongoDB...');
        await client.connect();
        console.log('Connected.');

        const db = client.db(); // Uses the DB from the connection string
        const collection = db.collection('artSubmissions');

        console.log(`Uploading ${submissions.length} documents to 'artSubmissions' collection...`);

        // Use ordered: false to continue inserting even if some fail (e.g. duplicates)
        const result = await collection.insertMany(submissions, { ordered: false });
        console.log(`Successfully inserted ${result.insertedCount} documents.`);

    } catch (error) {
        console.error('Error uploading submissions:', error);
    } finally {
        await client.close();
        console.log('Connection closed.');
    }
}

main();
