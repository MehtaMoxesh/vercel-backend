import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.stack || err);
  process.exit(1);
});

async function checkDB() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/sweetsdb';
  console.log('Node version:', process.version);
  console.log('Using MONGO_URI:', uri);
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB:', uri);

    const adminDb = mongoose.connection.db.admin();
    const dbs = await adminDb.listDatabases();
    console.log('Databases:', dbs.databases.map((d) => d.name));

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in current DB:', collections.map((c) => c.name));

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('DB Check failed:');
    console.error(err && err.stack ? err.stack : err);
    console.error('If this is a deprecation (punycode) warning, it can be ignored — it is non-fatal.');
    // If it looks like the server refused an IPv6 connection (::1), suggest trying 127.0.0.1
    if (err && err.message && err.message.includes('ECONNREFUSED') && uri.includes('localhost')) {
      const ipv4Uri = uri.replace('localhost', '127.0.0.1');
      console.log(`Retrying using IPv4 address: ${ipv4Uri}`);
      try {
        await mongoose.connect(ipv4Uri, { serverSelectionTimeoutMS: 5000 });
        console.log('Connected using 127.0.0.1; your MongoDB is likely bound only to IPv4.');
        const adminDb = mongoose.connection.db.admin();
        const dbs = await adminDb.listDatabases();
        console.log('Databases:', dbs.databases.map((d) => d.name));
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections in current DB:', collections.map((c) => c.name));
        await mongoose.disconnect();
        process.exit(0);
      } catch (err2) {
        console.error('Retry with 127.0.0.1 also failed:');
        console.error(err2 && err2.stack ? err2.stack : err2);
      }
    }
    process.exit(1);
  }
}

checkDB();
