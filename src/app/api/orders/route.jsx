import clientPromise from "@/libs/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    // Do location_id giờ là chuỗi text địa chỉ (không còn là ObjectId), 
    // chúng ta không dùng $lookup với bảng tables nữa để tránh lỗi hoặc trả về rỗng.
    const orderList = await db.collection("orders").find({}).toArray();

    return Response.json(orderList);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
    try {
        const client = await clientPromise;
        const db = client.db("Nova-kicks"); 

        const body = await request.json();
        // Lấy thêm phone và note từ frontend gửi lên
        const { name, phone, location_id, note, order_items, total } = body;
        
        if (!name || !location_id || !order_items || !total) {
            return Response.json({ error: "Thiếu thông tin đơn hàng" }, { status: 400 });   
        }

        const newOrder = {
            name,
            phone: phone || "", // Lưu số điện thoại khách hàng
            location_id: location_id, // Giữ nguyên dạng chuỗi văn bản (Địa chỉ nhà), BỎ new ObjectId()
            note: note || "", // Lưu ghi chú size giày, màu sắc
            order_items,
            total,
            createdAt: new Date(), // Viết hoa chữ A để đồng bộ với thuộc tính frontend 'createdAt' ở các trang trước
            status: "pending" // Để "pending" để khớp với các bộ lọc Tab (Chờ xác nhận, Đang đóng gói...) ở trang lịch sử nhé
        };

        const result = await db.collection("orders").insertOne(newOrder);

        // Trả thêm thuộc tính _id hoặc id của đơn hàng vừa tạo để nút "Xem đơn hàng" hoạt động chính xác
        return Response.json({
            message: "Đơn hàng đã được tạo mới thành công!", 
            code: "success",
            _id: result.insertedId 
        });
    } catch (error) {
        console.error("LỖI TẠI SERVER API ORDERS:", error);
        return Response.json({ error: 'Failed to create order', detail: error.message }, { status: 500 });   
    }
}