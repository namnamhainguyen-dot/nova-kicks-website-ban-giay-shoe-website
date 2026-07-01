import clientPromise from "@/libs/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("Nova-kicks");
    const { id } = await params; // 'id' ở đây có thể là userId hoặc email tùy thuộc vào dữ liệu bạn lưu lúc mua hàng

    let query = {};

    // Kiểm tra xem tham số truyền vào là ObjectId (userId) hay là Chuỗi Email
    if (ObjectId.isValid(id)) {
      query = { userId: new ObjectId(id) }; // Nếu database lưu dạng ObjectId
    } else if (id.includes("@")) {
      query = { email: id }; // Tìm theo email nếu truyền vào email
    } else {
      query = { userId: id }; // Nếu database lưu userId ở dạng String thông thường
    }

    // Tìm tất cả các đơn hàng thỏa mãn và sắp xếp đơn mới nhất lên đầu
    const orders = await db.collection("orders")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return Response.json(orders, { status: 200 });
  } catch (error) {
    console.error("Lỗi lấy danh sách đơn hàng của user:", error);
    return Response.json({ error: "Không thể lấy dữ liệu đơn hàng" }, { status: 500 });
  }
}