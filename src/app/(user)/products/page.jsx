import clientPromise, { dbName } from "@/libs/mongodb"; // Kiểm tra kỹ chữ libs hay lib

async function getRawProducts() {
  try {
    const client = await clientPromise;
    
    // 1. Quét danh sách tất cả Database đang có trên Cluster Atlas
    const adminDb = client.db().admin();
    const dbsList = await adminDb.listDatabases();
    const allDbNames = dbsList.databases.map(d => d.name);

    // 2. Lấy DB Nova-kicks
    const db = client.db("Nova-kicks");
    
    // 3. Quét danh sách các Collection trong DB Nova-kicks
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    // 4. Thử lấy sản phẩm từ collection "products"
    const rawProducts = await db.collection("products").find({}).toArray();

    return {
      allDbNames,
      collectionNames,
      productsCount: rawProducts.length,
      sampleData: JSON.parse(JSON.stringify(rawProducts.slice(0, 2)))
    };
  } catch (error) {
    return { error: String(error.message || error) };
  }
}

export default async function TestProductsPage() {
  const result = await getRawProducts();

  return (
    <div style={{ paddingTop: "120px", paddingLeft: "30px", fontFamily: "sans-serif" }}>
      <h2>🔍 MÀN HÌNH TEST KẾT NỐI DATABASE</h2>
      
      {result.error ? (
        <div style={{ color: "red", background: "#fee", padding: "15px", borderRadius: "8px" }}>
          ❌ <strong>LỖI KẾT NỐI MONGO:</strong> {result.error}
        </div>
      ) : (
        <div>
          <h3>✅ Kết nối DB thành công!</h3>
          <p><strong>Số lượng sản phẩm lấy được:</strong> {result.length}</p>
          <pre style={{ background: "#f4f4f4", padding: "15px", borderRadius: "8px", maxHeight: "400px", overflow: "auto" }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}