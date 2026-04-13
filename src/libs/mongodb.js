import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // Trong môi trường dev, dùng biến toàn cục để bảo toàn kết nối khi HMR (Hot Module Replacement)
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // Trong môi trường production, tốt nhất là không dùng biến toàn cục
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Xuất khẩu một MongoClient promise đã được share (singleton)
export default clientPromise;