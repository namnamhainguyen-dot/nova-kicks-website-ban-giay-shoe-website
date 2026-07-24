import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userMessage, products } = await req.json();

    // 1. Chuyển tin nhắn của khách về chữ thường để dễ so sánh
    const message = userMessage.toLowerCase();
    const activeProducts = products || [];

    // 2. Phân tích nhanh từ khóa trong tin nhắn (Tìm size, tìm màu)
    // Tìm số có 2 chữ số (ví dụ: 40, 41, 42) để đoán size
    const sizeMatch = message.match(/\b\d{2}\b/); 
    const requestedSize = sizeMatch ? parseInt(sizeMatch[0]) : null;

    // Một số từ khóa màu sắc cơ bản
    const colors = ["trắng", "đen", "đỏ", "xanh", "vàng", "hồng", "xám"];
    const requestedColor = colors.find(color => message.includes(color));

    // 3. Lọc sản phẩm bằng code Javascript thường
    const matchedProducts = activeProducts.filter(product => {
      // Kiểm tra khớp tên sản phẩm
      const matchName = product.name && message.includes(product.name.toLowerCase());
      
      // Kiểm tra khớp size
      const productSizes = product.availableSizes || product.displaySizes || [];
      const matchSize = requestedSize ? productSizes.includes(requestedSize) : false;

      // Kiểm tra khớp màu sắc
      const productColors = (product.availableColors?.map(c => c.color) || product.displayColors || []).map(c => c.toLowerCase());
      const matchColor = requestedColor ? productColors.some(c => c.includes(requestedColor)) : false;

      // Nếu khách tìm cụ thể cái gì thì phải khớp cái đó, nếu tin nhắn chung chung thì bỏ qua
      if (requestedSize && requestedColor) return matchSize && matchColor;
      if (requestedSize) return matchSize;
      if (requestedColor) return matchColor;
      return matchName;
    });

    // Lấy danh sách ID của các sản phẩm khớp được
    const matchedIds = matchedProducts.map(p => p._id?.$oid || p._id || p.id);

    // 4. Tạo câu trả lời tự động tùy theo kết quả tìm kiếm
    let reply = "";
    if (matchedIds.length > 0) {
      reply = `Mình đã tìm thấy ${matchedIds.length} mẫu giày phù hợp với yêu cầu của bạn rồi nè! Bạn xem danh sách bên dưới nhé.`;
    } else {
      reply = "Hiện tại mình chưa tìm thấy mẫu giày nào khớp chính xác với lựa chọn này rồi. Bạn thử tìm màu hoặc size khác xem sao nha!";
    }

    // Trả về đúng cấu trúc JSON mà giao diện cũ đang cần nhận
    return NextResponse.json({
      reply,
      matchedIds
    });

  } catch (error) {
    console.error("Lỗi API Route thường:", error);
    return NextResponse.json(
      { reply: "Có lỗi xảy ra khi tìm kiếm sản phẩm. Bạn thử lại nhé!", matchedIds: [] },
      { status: 500 }
    );
  }
}