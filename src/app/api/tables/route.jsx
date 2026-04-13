import clientPromise from "@/libs/mongodb";

export async function GET(request) {
    try {
        const client = await clientPromise;
        // SỬA TẠI ĐÂY: Điền tên database khớp với Compass (1 chữ f)
        const db = client.db("susan-coffee"); 
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
        const db = client.db("susan-coffee"); 
        const body = await request.json();
        const { name, location } = body;
        if (!name || !location) {
            return Response.json({ error: "Thiếu thông tin bàn" }, { status: 400 });
        }
        const newTable = {
            name,
            location
        }
        const result = await db.collection("tables").insertOne(newTable);
        return Response.json({message:"Bàn đã được tạo mới thành công!", code: "success"});
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Failed to fetch products' }, { status: 500 });   
    }
    
}


