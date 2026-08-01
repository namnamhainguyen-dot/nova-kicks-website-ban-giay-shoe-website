import ProductFilter from "@/components/ProductFilter";
import ProductChatbox from "@/components/ProductChatbox";
import Link from "next/link";

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
  const params = await searchParams;
  const categoryID = params?.categoryID;
  const filterIdsParam = params?.filterIds;
  const searchQuery = params?.search;
  
  // Lấy số trang hiện tại từ URL (mặc định là trang 1)
  const currentPage = Number(params?.page) || 1;
  const pageSize = 9; 

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
      _id: String(product._id),
      availableColors,
      availableSizes,
      description: product.description || "Chưa có mô tả cho sản phẩm này."
    };
  });

  // XỬ LÝ LỌC SẢN PHẨM TỪ AI (filterIds) HOẶC TÌM KIẾM (search)
  let displayedProducts = products;

  if (filterIdsParam) {
    const filterIds = filterIdsParam.split(",");
    displayedProducts = products.filter(p => filterIds.includes(p._id));
  } else if (searchQuery) {
    displayedProducts = products.filter(p => 
      p.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // --- PHÂN TRANG ---
  const totalProductsCount = displayedProducts.length;
  const totalPages = Math.ceil(totalProductsCount / pageSize);
  
  // Cắt mảng sản phẩm theo trang hiện tại (tối đa 10 sản phẩm)
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProducts = displayedProducts.slice(startIndex, startIndex + pageSize);

  // Hàm tạo link chuyển trang giữ lại các bộ lọc hiện tại
  const createPageUrl = (pageNumber) => {
    const queryParams = new URLSearchParams();
    if (categoryID) queryParams.set("categoryID", categoryID);
    if (filterIdsParam) queryParams.set("filterIds", filterIdsParam);
    if (searchQuery) queryParams.set("search", searchQuery);
    queryParams.set("page", pageNumber);
    return `/products?${queryParams.toString()}`;
  };

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

      {/* HEADER TIÊU ĐỀ */}
      <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
        <h1 className="fw-bold text-uppercase m-0" style={{ fontSize: "1.75rem", letterSpacing: "0.05em" }}>
          {categoryID ? `Danh mục sản phẩm` : "Tất cả sản phẩm"}
        </h1>
        <span className="text-secondary fw-semibold">{totalProductsCount} sản phẩm</span>
      </div>

      {/* BANNER THÔNG BÁO KHI ĐANG DÙNG BỘ LỌC TỪ AI CHATBOX */}
      {filterIdsParam && (
        <div 
          className="alert d-flex justify-content-between align-items-center mb-4 p-3 rounded-3 border-0 shadow-sm"
          style={{ backgroundColor: "#fff3eb", color: "#d87c3c" }}
        >
          <span className="fw-semibold">
            🤖 Trợ lý AI đã tìm thấy <strong>{totalProductsCount}</strong> sản phẩm phù hợp với yêu cầu của bạn!
          </span>
          <Link 
            href={categoryID ? `/products?categoryID=${categoryID}` : "/products"} 
            className="btn btn-sm btn-dark px-3 rounded-pill"
            style={{ backgroundColor: "#d87c3c", borderColor: "#d87c3c" }}
          >
            Xóa bộ lọc AI ✕
          </Link>
        </div>
      )}

      {/* BỘ LỌC VÀ LƯỚI HIỂN THỊ SẢN PHẨM (Tối đa 10 sản phẩm mỗi trang) */}
      <ProductFilter 
        key={`${categoryID || "all"}-${filterIdsParam || "none"}-${currentPage}`} 
        products={paginatedProducts} 
      />

      {/* THANH PHÂN TRANG */}
      {totalPages > 1 && (
        <nav className="d-flex justify-content-center mt-5">
          <ul className="pagination shadow-sm">
            {/* Nút Trước */}
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <Link 
                className="page-link text-dark" 
                href={currentPage > 1 ? createPageUrl(currentPage - 1) : "#"}
                style={{ borderColor: "#dee2e6" }}
              >
                Trước
              </Link>
            </li>

            {/* Các số trang */}
            {Array.from({ length: totalPages }, (_, index) => {
              const pageNum = index + 1;
              const isActive = currentPage === pageNum;
              return (
                <li key={pageNum} className={`page-item ${isActive ? "active" : ""}`}>
                  <Link
                    className="page-link"
                    href={createPageUrl(pageNum)}
                    style={
                      isActive
                        ? { backgroundColor: "#d87c3c", borderColor: "#d87c3c", color: "#fff" }
                        : { color: "#333" }
                    }
                  >
                    {pageNum}
                  </Link>
                </li>
              );
            })}

            {/* Nút Sau */}
            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <Link 
                className="page-link text-dark" 
                href={currentPage < totalPages ? createPageUrl(currentPage + 1) : "#"}
                style={{ borderColor: "#dee2e6" }}
              >
                Sau
              </Link>
            </li>
          </ul>
        </nav>
      )}

      {/* CHATBOX AI (TRUYỀN TOÀN BỘ DANH SÁCH SẢN PHẨM ĐỂ AI TÌM KIẾM CẢ KHO) */}
      <ProductChatbox products={products} />
    </main>
  );
}