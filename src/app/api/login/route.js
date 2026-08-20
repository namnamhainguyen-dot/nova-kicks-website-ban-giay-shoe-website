import { NextResponse } from "next/server";
import clientPromise, { dbName } from "@/libs/mongodb";
import bcrypt from "bcryptjs";

const DEMO_ADMIN = {
  email: "admin@novakicks.com",
  password: "Admin@123",
  fullname: "Administrator",
};

export async function POST(request) {
  try {
    const body = await request.json();
    const identifier = body?.identifier?.trim();
    const password = body?.password;

    if (!identifier || !password) {
      return NextResponse.json(
        { message: "Vui lòng nhập đầy đủ tài khoản và mật khẩu!" },
        { status: 400 }
      );
    }

    const isDemoAdminLogin =
      identifier.toLowerCase() === DEMO_ADMIN.email && password === DEMO_ADMIN.password;

    if (isDemoAdminLogin) {
      try {
        const client = await clientPromise;
        const db = client.db(dbName);
        const existingAdmin = await db.collection("users").findOne({ email: DEMO_ADMIN.email });

        if (!existingAdmin) {
          await db.collection("users").insertOne({
            fullname: DEMO_ADMIN.fullname,
            email: DEMO_ADMIN.email,
            password: await bcrypt.hash(DEMO_ADMIN.password, 10),
            role: "admin",
            avatar: "", // Khởi tạo avatar rỗng cho admin
            addresses: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      } catch (seedError) {
        console.warn("Demo admin seed skipped:", seedError.message);
      }

      return NextResponse.json(
        {
          message: "Đăng nhập thành công!",
          user: {
            id: "demo-admin",
            fullname: DEMO_ADMIN.fullname,
            email: DEMO_ADMIN.email,
            phone: null,
            role: "admin",
            avatar: "", // 👈 Bổ sung avatar cho admin demo
            addresses: [],
          },
          token: "demo-admin-token",
        },
        { status: 200 }
      );
    }

    const client = await clientPromise;
    const db = client.db(dbName);

    const user = await db.collection("users").findOne({
      $or: [
        { email: identifier },
        { phone: identifier },
      ],
    });

    if (!user) {
      return NextResponse.json(
        { message: "Tài khoản hoặc mật khẩu không chính xác!" },
        { status: 401 }
      );
    }

    // 🛑 THÊM CHỐT CHẶN NÀY: Kiểm tra nếu tài khoản bị khóa
    if (user.status === "inactive") {
      return NextResponse.json(
        { message: "Tài khoản của bạn đã bị khóa bởi quản trị viên." },
        { status: 403 } // 403 Forbidden
      );
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return NextResponse.json(
        { message: "Tài khoản hoặc mật khẩu không chính xác!" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        message: "Đăng nhập thành công!",
        user: {
          id: user._id,
          fullname: user.fullname,
          email: user.email || null,
          phone: user.phone || null,
          role: user.role || "user",
          avatar: user.avatar || "", // 👈 ĐÃ BỔ SUNG: Trả về avatar từ Database
          addresses: user.addresses || [], // 👈 ĐÃ BỔ SUNG: Trả về danh sách địa chỉ luôn nếu cần dùng
        },
        token: user._id.toString(), 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Lỗi Đăng nhập MongoDB Driver:", error);
    return NextResponse.json(
      { message: "Lỗi hệ thống máy chủ, vui lòng thử lại!" },
      { status: 500 }
    );
  }
}