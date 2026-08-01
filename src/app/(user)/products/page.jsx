import clientPromise, { dbName } from "@/libs/mongodb"; // Kiểm tra kỹ chữ libs hay lib

async function getRawProducts() {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    
    // Tìm tất cả sản phẩm không qua lọc
    const raw = await db.collection("products").find({}).toArray();
    return JSON.parse(JSON.stringify(raw));
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