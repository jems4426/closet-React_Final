import mongoose from 'mongoose';

export async function connectToDatabase() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/closet';
  if (!mongoUri) {
    throw new Error('MONGODB_URI not set');
  }
  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => {
    const { host, port, name } = mongoose.connection;
    console.log(`MongoDB connected → ${host}:${port}/${name}`);
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });

  await mongoose.connect(mongoUri, {
    autoIndex: true
  });
}

export function isDatabaseConnected() {
  // 1 = connected, 2 = connecting
  return mongoose.connection.readyState === 1;
}

export function getDatabaseStatus() {
  const { readyState, host, port, name } = mongoose.connection;
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  return { readyState, state: states[readyState] || 'unknown', host, port, name };
}


