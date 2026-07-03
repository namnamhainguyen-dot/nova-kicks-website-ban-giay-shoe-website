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
      {/* Tích hợp CSS Hover trực tiếp cho các item sản phẩm bên trong ProductFilter */}
      <style>{`
        /* 1. Hiệu ứng trượt và đổ bóng mượt mà cho toàn bộ card sản phẩm */
        .nk-card, .card-product, [class*="card"] {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
                      box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
          position: relative;
          overflow: hidden;
        }

        .nk-card:hover, .card-product:hover, [class*="card"]:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 36px rgba(0,0,0,0.08), 0 4px 14px rgba(0,0,0,0.02) !important;
        }

        /* 2. Hiệu ứng phóng to hình ảnh giày một cách nghệ thuật */
        .img-hover-scale, [class*="card"] img {
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        .nk-card:hover .img-hover-scale, 
        .card-product:hover [class*="card"] img,
        [class*="card"]:hover img {
          transform: scale(1.07);
        }

        /* 3. Hiệu ứng chuyển màu chữ tiêu đề sản phẩm sang màu cam thương hiệu khi hover */
        .nk-card:hover .card-title,
        .card-product:hover [class*="title"],
        [class*="card"]:hover h6, [class*="card"]:hover h5 {
          color: var(--accent, #d87c3c) !important;
          transition: color 0.3s ease;
        }

        /* 4. Thêm một đường line mỏng tinh tế chạy dưới số lượng sản phẩm */
        .border-bottom {
          position: relative;
        }
        .border-bottom::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; width: 60px; height: 3px;
          background-color: var(--accent, #d87c3c);
        }
      `}</style>

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