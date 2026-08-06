import { NextResponse } from "next/server";
import clientPromise from "@/libs/mongodb";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

export async function PUT(request) {
  try {
    const { userId, oldPassword, newPassword } = await request.json();

    if (!userId || !oldPassword || !newPassword) {
      return NextResponse.json({ error: "Vui lòng điền đầy đủ thông tin!" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("Nova-kicks");
    const usersCollection = db.collection("users");

    let queryId;
    try {
      queryId = new ObjectId(userId);
    } catch {
      queryId = userId;
    }

    const user = await usersCollection.findOne({ _id: queryId });
    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng!" }, { status: 404 });
    }

    // Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Mật khẩu cũ không chính xác!" }, { status: 400 });
    }

    // Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    await usersCollection.updateOne(
      { _id: queryId },
      { $set: { password: hashedNewPassword } }
    );

    return NextResponse.json({ message: "Đổi mật khẩu thành công!" }, { status: 200 });
  } catch (error) {
    console.error("Lỗi đổi mật khẩu:", error);
    return NextResponse.json({ error: "Lỗi hệ thống máy chủ!" }, { status: 500 });
  }
}