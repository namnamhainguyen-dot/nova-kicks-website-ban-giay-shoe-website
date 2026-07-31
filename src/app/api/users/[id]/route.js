import clientPromise from "@/libs/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

function getValidObjectId(idStr) {
  if (!idStr || typeof idStr !== "string" || !ObjectId.isValid(idStr)) {
    return null;
  }
  return new ObjectId(idStr);
}

export async function PUT(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    const resolvedParams = params instanceof Promise ? await params : params;
    const id = resolvedParams?.id;

    const queryId = getValidObjectId(id);
    if (!queryId) {
      return NextResponse.json(
        { message: "ID người dùng không hợp lệ" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Loại bỏ các field không nên update đè
    delete body._id;
    delete body.password;

    body.updatedAt = new Date();

    const result = await db.collection("users").findOneAndUpdate(
      { _id: queryId },
      { $set: body },
      { returnDocument: "after", projection: { password: 0 } }
    );

    if (!result) {
      return NextResponse.json(
        { message: "Không tìm thấy người dùng để cập nhật" },
        { status: 404 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Lỗi PUT /api/users/[id]:", error);
    return NextResponse.json(
      { message: "Lỗi máy chủ khi cập nhật thông tin" },
      { status: 500 }
    );
  }
}