"use server";

import clientPromise from "@/libs/mongodb";

export async function getTablesAction() {
  try {
    const client = await clientPromise;
    const db = client.db("Nova-kicks");
    
    const tableList = await db.collection("tables").find({}).toArray();

    // Chuyển đổi ObjectId thành dạng string thuần để tránh lỗi Serialization của React Client Component
    return JSON.parse(JSON.stringify(tableList));
  } catch (error) {
    console.error("[Server Action Error] getTablesAction:", error);
    return [];
  }
}