import clientPromise from "@/libs/mongodb";

export async function GET(request) {
    try {
        const client = await clientPromise;
        // SỬA TẠI ĐÂY: Điền tên database khớp với Compass (1 chữ f)
        const db = client.db("Nova-kicks"); 
        const tableList = await db.collection("tables").find({}).toArray();
        return Response.json(tableList);
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Failed to fetch products' }, { status: 500 });   
    }

}
export async function POST(request) {
    try {
        const client = await clientPromise;
        // SỬA TẠI ĐÂY: Điền tên database khớp với Compass (1 chữ f)
        const db = client.db("Nova-kicks"); 
        const body = await request.json();
        const { name, location } = body;
        if (!name || !location) {
            return Response.json({ error: "Thiếu thông tin cửa hàng" }, { status: 400 });
        }
        const newLocation = {
            name,
            location
        }
        const result = await db.collection("tables").insertOne(newLocation);
        return Response.json({message:"Cửa hàng đã được tạo mới thành công!", code: "success"});
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Failed to fetch products' }, { status: 500 });   
    }
    
}


