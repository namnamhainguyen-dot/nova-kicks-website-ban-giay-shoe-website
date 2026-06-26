import ProductFilter from "@/components/ProductFilter";

async function getProducts() {
  const res = await fetch("http://localhost:3000/api/products", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Không thể tải danh sách sản phẩm");
  }

  return res.json();
}

export default async function ProductsPage({ searchParams }) {
  // Giải nén categoryID từ searchParams
  const { categoryID } = await searchParams;

  // Lấy danh sách sản phẩm đã lọc từ API
  const products = await getProducts(categoryID);

  return (
    <main
      className="container py-5"
      style={{ paddingTop: "90px", minHeight: "100vh" }}
    >
      <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
        <h1 className="fw-bold text-uppercase m-0">
          {categoryID ? `Danh mục: ${categoryID}` : "Tất cả sản phẩm"}
        </h1>
        <span className="text-secondary">{products.length} sản phẩm</span>
      </div>

      {/* THÊM KEY Ở ĐÂY: Mỗi khi đổi categoryID, ProductFilter sẽ tự làm mới hoàn toàn */}
      <ProductFilter key={categoryID || "all"} products={products} />
    </main>
  );
} 
