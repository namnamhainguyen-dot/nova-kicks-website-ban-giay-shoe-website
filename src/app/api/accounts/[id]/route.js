import { NextResponse } from "next/server";
import clientPromise, { dbName } from "@/libs/mongodb";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

// Hàm hỗ trợ tạo query tìm kiếm an toàn (hỗ trợ cả ObjectId và mã định dạng riêng)
function getSafeQuery(id) {
  if (ObjectId.isValid(id)) {
    return { $or: [{ _id: new ObjectId(id) }, { id: id }] };
  }
  return { id: id };
}

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    const client = await clientPromise;
    const db = client.db(dbName);
    
    const user = await db.collection("users").findOne(getSafeQuery(id));

    if (!user) {
      return NextResponse.json({ message: "Không tìm thấy tài khoản" }, { status: 404 });
    }

    const sanitizedUser = {
      ...user,
      _id: user._id.toString(),
      name: user.fullname || user.name || user.email || "Không rõ",
      role: user.role || "MEMBER",
      status: user.status || "active",
      avatar: user.avatar || "https://i.pravatar.cc/80?img=32",
    };

    return NextResponse.json(sanitizedUser, { status: 200 });
  } catch (error) {
    console.error("Lỗi GET /api/accounts/[id]:", error);
    return NextResponse.json({ message: "Lỗi Server" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();
    
    const client = await clientPromise;
    const db = client.db(dbName);

    const updateData = { ...body, updatedAt: new Date() };

    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 10);
    }

    if (body.name) {
      updateData.fullname = body.name;
      updateData.name = body.name;
    }

    const result = await db.collection("users").updateOne(
      getSafeQuery(id), 
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Không tìm thấy tài khoản để cập nhật" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Lỗi PUT /api/accounts/[id]:", error);
    return NextResponse.json({ message: "Lỗi Server" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    const client = await clientPromise;
    const db = client.db(dbName);

    const result = await db.collection("users").deleteOne(getSafeQuery(id));

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Không tìm thấy tài khoản để xóa" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Lỗi DELETE /api/accounts/[id]:", error);
    return NextResponse.json({ message: "Lỗi Server" }, { status: 500 });
  }
}