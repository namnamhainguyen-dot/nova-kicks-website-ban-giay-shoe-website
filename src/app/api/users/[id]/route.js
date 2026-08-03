import clientPromise from "@/libs/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

// GET: Lấy thông tin user
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID sai định dạng" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    const user = await db.collection("users").findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0, resetToken: 0 } }
    );

    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("API GET user error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// PUT: Cập nhật thông tin user theo ID
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID sai định dạng" }, { status: 400 });
    }

    const body = await request.json();

    // Loại bỏ các trường nhạy cảm
    const { password, email, _id, resetToken, ...updateData } = body;

    // Kiểm tra nếu không có dữ liệu nào hợp lệ để cập nhật
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Không có dữ liệu hợp lệ để cập nhật" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    // Cập nhật và trả về luôn document MỚI NHẤT (after update)
    const result = await db.collection("users").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: {
          ...updateData,
          updatedAt: new Date() // Thêm thời gian cập nhật
        } 
      },
      { 
        returnDocument: "after", // Trả về data sau khi cập nhật
        projection: { password: 0, resetToken: 0 } // Mật khẩu vẫn được giấu
      }
    );

    if (!result) {
      return NextResponse.json({ error: "Không tìm thấy người dùng trong CSDL" }, { status: 404 });
    }

    // Trả về cả message lẫn object user mới nhất
    return NextResponse.json({
      success: true,
      message: "Cập nhật thành công",
      user: result
    }, { status: 200 });

  } catch (error) {
    console.error("API update error:", error);
    return NextResponse.json({ error: "Lỗi cập nhật dữ liệu" }, { status: 500 });
  }
}