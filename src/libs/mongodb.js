import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'Nova-kicks';

const options = {
  serverSelectionTimeoutMS: 5000,
};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error('Vui lòng thêm biến MONGODB_URI vào file .env.local hoặc Vercel Environment Variables');
}

if (process.env.NODE_ENV === 'development') {
  // Trong môi trường dev, dùng biến global để giữ kết nối qua các lần HMR (Hot Module Replacement)
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // Trong môi trường production (Vercel)
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export { dbName };
export default clientPromise;