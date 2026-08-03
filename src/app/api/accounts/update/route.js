import clientPromise from "@/libs/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    const users = await db
      .collection("users")
      .find({}, { projection: { password: 0 } })
      .toArray();

    const sanitizedUsers = users.map((user) => ({
      ...user,
      _id: user._id.toString(),
    }));

    return NextResponse.json(sanitizedUsers, { status: 200 });
  } catch (error) {
    console.error("Lỗi GET /api/accounts:", error);
    return NextResponse.json({ message: "Lỗi Server" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password, role, status, avatar } = body;

    if (!email || !password) {
      return NextResponse.json({ message: "Email và password là bắt buộc!" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    const exist = await db.collection("users").findOne({ email });
    if (exist) {
      return NextResponse.json({ message: "Email đã tồn tại!" }, { status: 400 });
    }

    const newUser = {
      name: name || email.split("@")[0],
      fullname: name || email.split("@")[0],
      email: email.trim(),
      password: password,
      role: role || "MEMBER",
      status: status || "Hoạt động",
      avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}`,
      createdAt: new Date(),
    };

    const result = await db.collection("users").insertOne(newUser);
    return NextResponse.json({ success: true, id: result.insertedId.toString() }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi Server" }, { status: 500 });
  }
}