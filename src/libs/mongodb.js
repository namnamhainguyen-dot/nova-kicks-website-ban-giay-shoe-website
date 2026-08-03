import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'Nova-kicks';

// 🟢 CẢNH BÁO RÕ RÀNG NẾU QUÊN CÀI BIẾN MÔI TRƯỜNG
if (!uri) {
  throw new Error('⚠️ Vui lòng cấu hình MONGODB_URI trong file .env.local hoặc Vercel Environment Variables!');
}

const options = {
  serverSelectionTimeoutMS: 10000, // Tăng timeout lên 10s cho Vercel Cloud
};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // Trong môi trường Dev, dùng global variable để giữ kết nối qua các lần HMR (Hot Module Replacement)
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // Trong môi trường Production (Vercel)
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export { dbName };
export default clientPromise;