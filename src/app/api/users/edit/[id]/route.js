import clientPromise from "@/libs/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

// PATCH: Cập nhật thông tin người dùng
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    
    // Kiểm tra định dạng ID
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID người dùng không hợp lệ" }, { status: 400 });
    }

    const body = await request.json();
    const { fullname, phone, address, status, role } = body;

    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    // Chỉ cập nhật những trường có giá trị được gửi lên
    const updateData = {};
    if (fullname !== undefined) updateData.fullname = fullname;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (status !== undefined) updateData.status = status;
    if (role !== undefined) updateData.role = role;
    updateData.updatedAt = new Date();

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Cập nhật thành công" });
  } catch (error) {
    console.error("Lỗi API Edit User:", error);
    return NextResponse.json({ error: "Lỗi hệ thống máy chủ" }, { status: 500 });
  }
}

// DELETE: Xóa người dùng
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    const result = await db.collection("users").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Không tìm thấy người dùng để xóa" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Đã xóa tài khoản thành công" });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}