import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/libs/mongodb"; // Hoặc file connect db mongodb native của bạn

export const maxDuration = 60;

// Hàm hỗ trợ lấy Database instance
async function getDb() {
  const client = await clientPromise;
  // Điền tên database của bạn nếu trong connection string chưa có (ví dụ: client.db("nova_kicks"))
  return client.db();
}

// 1. LẤY BÀI VIẾT (GET)
export async function GET(request) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const isAdmin = searchParams.get("admin");

    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, error: "ID không hợp lệ" },
          { status: 400 }
        );
      }
      const article = await db
        .collection("news")
        .findOne({ _id: new ObjectId(id) });

      if (!article) {
        return NextResponse.json(
          { success: false, error: "Không tìm thấy bài viết" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: article });
    }

    const filter = isAdmin === "true" ? {} : { isHidden: { $ne: true } };
    const news = await db
      .collection("news")
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: news });
  } catch (error) {
    console.error("Lỗi GET /api/news:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 2. TẠO BÀI VIẾT MỚI (POST) - Giải quyết lỗi 405 Method Not Allowed
export async function POST(request) {
  try {
    const db = await getDb();
    const body = await request.json();

    // Loại bỏ _id nếu client lỡ gửi lên
    delete body._id;

    const newArticle = {
      ...body,
      createdAt: body.createdAt ? new Date(body.createdAt) : new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("news").insertOne(newArticle);

    return NextResponse.json(
      { success: true, data: { _id: result.insertedId, ...newArticle } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Lỗi POST /api/news:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 3. CẬP NHẬT BÀI VIẾT (PUT)
export async function PUT(request) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "ID bài viết không hợp lệ" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Trong MongoDB Native Driver, BẮT BUỘC xóa trường _id khỏi object update
    delete body._id;
    delete body.updatedAt;

    if (body.createdAt) {
      body.createdAt = new Date(body.createdAt);
    }

    const result = await db.collection("news").findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...body,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy bài viết" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Lỗi PUT /api/news:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 4. XÓA BÀI VIẾT (DELETE)
export async function DELETE(request) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "ID không hợp lệ" },
        { status: 400 }
      );
    }

    await db.collection("news").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      message: "Xóa bài viết thành công",
    });
  } catch (error) {
    console.error("Lỗi DELETE /api/news:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}