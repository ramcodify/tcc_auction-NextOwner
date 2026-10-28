import mongoose from 'mongoose';

let lastError = null;

const stateLabels = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting'
};

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    lastError = 'MONGODB_URI environment variable is not defined.';
    console.error(`[MongoDB] ${lastError}`);
    return false;
  }

  try {
    mongoose.connection.on('connected', () => {
      lastError = null;
      console.log(`[MongoDB] Connected to database: ${mongoose.connection.name}`);
    });

    mongoose.connection.on('error', (err) => {
      lastError = err.message || String(err);
      console.error(`[MongoDB] Runtime error: ${lastError}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Disconnected from database.');
    });

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
      autoIndex: true
    });

    return true;
  } catch (error) {
    lastError = error.message || String(error);
    console.error(`[MongoDB] Connection failed: ${lastError}`);
    return false;
  }
};

export const getDatabaseStatus = () => {
  const readyState = mongoose.connection.readyState;
  return {
    stateCode: readyState,
    state: stateLabels[readyState] || 'unknown',
    isConnected: readyState === 1,
    host: mongoose.connection.host || null,
    databaseName: mongoose.connection.name || null,
    lastError: lastError
  };
};
