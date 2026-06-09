import clientPromise from "@/libs/mongodb";

export async function GET(request) {
    try {
        const client = await clientPromise;
        
        // SỬA TẠI ĐÂY: Điền tên database khớp với Compass (1 chữ f)
        const db = client.db("Nova-kicks"); 
        
        const productsList = await db.collection("products").find({}).toArray();
        return Response.json(productsList);
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Failed to fetch products' }, { status: 500 });   
    }
}

export function POST(request) {
    // Để trống hoặc viết logic thêm sản phẩm ở đây
}
