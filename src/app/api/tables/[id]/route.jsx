import clientPromise from "@/libs/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH(request, { params }) {
    try {
        const client = await clientPromise;
        // SỬA TẠI ĐÂY: Điền tên database khớp với Compass (1 chữ f)
        const db = client.db("Nova-kicks"); 
        const { id } = await params;
        const body = await request.json();
        const { name, location } = body;
        if (!name || !location) {
            return Response.json({ error: "Thiếu thông tin cửa hàng" }, { status: 400 });
        }   
        const locationList = await db.collection("tables").updateOne(
            { _id: new ObjectId(id) },
            { $set: { name, location } }
        );
        return Response.json({message:"Cửa hàng đã được cập nhật thành công!", code: "success"});
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Failed to fetch products' }, { status: 500 });   
    }

}
export async function DELETE(request, { params }) {
    try {
        const client = await clientPromise;
        // SỬA TẠI ĐÂY: Điền tên database khớp với Compass (1 chữ f)
        const db = client.db("Nova-kicks"); 
        const { id } = await params;
        const result = await db.collection("tables").deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            return Response.json({ error: "Không tìm thấy cửa hàng để xóa" }, { status: 404 });
        }
        
        return Response.json({message:"Cửa hàng đã được xóa thành công!", code: "success"});
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Failed to fetch products' }, { status: 500 });   
    }
}
    
    


