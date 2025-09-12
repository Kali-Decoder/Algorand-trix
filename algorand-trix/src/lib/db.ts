import mongoose from 'mongoose';

// const MONGODB_URI = process.env.MONGODB_URI as string;

// if (!MONGODB_URI) {
//   throw new Error('Please define the MONGODB_URI environment variable');
// }

// Correct global type declaration
declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  };
}

// Initialize cached connection
const cached = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function dbConnect() {
  // if (cached.conn) {
  //   return cached.conn;
  // }

  // if (!cached.promise) {
  //   const opts = {
  //     bufferCommands: false,
  //   };

  //   cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
  //     return mongoose.connection;
  //   });
  // }
  
  // cached.conn = await cached.promise;
  // return cached.conn;
}

export default dbConnect;