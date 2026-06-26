import ProductFilter from "@/components/ProductFilter";

// 1. Đưa về chuẩn JavaScript (xóa bỏ định nghĩa kiểu dữ liệu TypeScript)
async function getProducts(categoryID) {
  // Tạo URL động: Nếu có categoryID thì nối thêm query string, ngược lại gọi tất cả
  const url = categoryID 
    ? `http://localhost:3000/api/products?categoryID=${categoryID}`
    : "http://localhost:3000/api/products";

  const res = await fetch(url, {
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
        <h1 className="fw-bold text-uppercase m-0" style={{ fontSize: "1.75rem", letterSpacing: "0.05em" }}>
          {categoryID ? `Danh mục sản phẩm` : "Tất cả sản phẩm"}
        </h1>
        <span className="text-secondary fw-semibold">{products.length} sản phẩm</span>
      </div>

      {/* Mỗi khi đổi categoryID, ProductFilter sẽ tự remount và nhận dữ liệu mới */}
      <ProductFilter key={categoryID || "all"} products={products} />
    </main>
  );
}