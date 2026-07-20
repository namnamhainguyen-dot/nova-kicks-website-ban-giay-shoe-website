import ProductFilter from "@/components/ProductFilter";
import ProductChatbox from "@/components/ProductChatbox"; // 1. IMPORT CHATBOX VÀO ĐÂY

// 1. Hàm lấy danh sách sản phẩm từ API
async function getProducts(categoryID) {
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
  const { categoryID } = await searchParams;
  const rawProducts = await getProducts(categoryID);

  // CHUẨN HÓA DỮ LIỆU
  const products = (rawProducts || []).map(product => {
    const availableColors = product.variants?.map(v => ({
      color: v.color,
      quantity: v.quantity ?? 0
    })) || [];

    const availableSizes = product.variants?.[0]?.sizes || product.sizes || [];

    return {
      ...product,
      availableColors,
      availableSizes,
      description: product.description || "Chưa có mô tả cho sản phẩm này."
    };
  });

  return (
    <main
      className="container py-5"
      style={{ paddingTop: "90px", minHeight: "100vh" }}
    >
      <style>{`
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
        .img-hover-scale, [class*="card"] img {
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .nk-card:hover .img-hover-scale, 
        .card-product:hover [class*="card"] img,
        [class*="card"]:hover img {
          transform: scale(1.07);
        }
        .nk-card:hover .card-title,
        .card-product:hover [class*="title"],
        [class*="card"]:hover h6, [class*="card"]:hover h5 {
          color: var(--accent, #d87c3c) !important;
          transition: color 0.3s ease;
        }
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

      <ProductFilter key={categoryID || "all"} products={products} />

      {/* 2. CHÈN CHATBOX ĐỂ TỰ ĐỘNG TÌM KIẾM SẢN PHẨM */}
      <ProductChatbox products={products} />
    </main>
  );
}