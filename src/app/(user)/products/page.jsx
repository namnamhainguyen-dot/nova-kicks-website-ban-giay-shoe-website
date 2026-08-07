import ProductFilter from "@/components/ProductFilter";
import ProductChatbox from "@/components/ProductChatbox";
import Link from "next/link";
import clientPromise from "@/libs/mongodb";

const DB_NAME = "Nova-kicks";
const COLLECTION_NAME = "products";
const ITEMS_PER_PAGE = 10; // Số lượng sản phẩm trên 1 trang

// 1. Hàm Query Trực Tiếp MongoDB Native Driver
async function getProductsFromDB(categoryID) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const filter = {};
    if (categoryID) {
      filter.categoryID = categoryID;
    }

    const rawProducts = await db
      .collection(COLLECTION_NAME)
      .find(filter)
      .sort({ _id: -1 })
      .toArray();

    return JSON.parse(JSON.stringify(rawProducts));
  } catch (error) {
    console.error("[MongoDB Query Error] Lỗi kết nối hoặc lấy dữ liệu:", error);
    return [];
  }
}

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;
  const categoryID = params?.categoryID;
  const filterIdsParam = params?.filterIds;
  const searchQuery = params?.search;
  
  // Lấy trang hiện tại từ URL (Mặc định là trang 1)
  const currentPage = Math.max(1, parseInt(params?.page || "1", 10));

  // 1. Lấy dữ liệu từ Database
  const rawProducts = await getProductsFromDB(categoryID);

  // 2. CHUẨN HÓA DỮ LIỆU
  const products = (rawProducts || []).map((product) => {
    const availableColors =
      product.variants?.map((v) => ({
        color: v.color,
        quantity: v.quantity ?? 0,
      })) || [];

    const availableSizes = product.variants?.[0]?.sizes || product.sizes || [];

    return {
      ...product,
      _id: String(product._id),
      availableColors,
      availableSizes,
      description: product.description || "Chưa có mô tả cho sản phẩm này.",
    };
  });

  // 3. LỌC SẢN PHẨM TỪ AI CHATBOX HOẶC TÌM KIẾM TỰ DO
  let filteredProducts = products;

  if (filterIdsParam) {
    const filterIds = filterIdsParam.split(",");
    filteredProducts = products.filter((p) => filterIds.includes(p._id));
  } else if (searchQuery) {
    filteredProducts = products.filter((p) =>
      p.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // 4. TÍNH TOÁN PHÂN TRANG
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const validPage = Math.min(currentPage, totalPages);

  const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  
  // Danh sách sản phẩm của trang hiện tại
  const displayedProducts = filteredProducts.slice(startIndex, endIndex);

  // Hàm hỗ trợ tạo URL khi bấm chuyển trang (giữ lại các query params cũ)
  const createPageUrl = (pageNumber) => {
    const query = new URLSearchParams();
    if (categoryID) query.set("categoryID", categoryID);
    if (filterIdsParam) query.set("filterIds", filterIdsParam);
    if (searchQuery) query.set("search", searchQuery);
    query.set("page", pageNumber.toString());

    return `/products?${query.toString()}`;
  };

  return (
    <main
      className="container py-5"
      style={{ paddingTop: "110px", minHeight: "100vh" }}
    >
      <style>{`
        /* --- TỐI ƯU CARD VÀ HIỂN THỊ ẢNH SẢN PHẨM --- */
        .nk-card, .card-product, [class*="card"] {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
                      box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
          position: relative;
          overflow: hidden;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.05);
          background-color: #ffffff !important;
        }
        
        .nk-card:hover, .card-product:hover, [class*="card"]:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 32px rgba(0,0,0,0.08) !important;
        }

        /* Đồng bộ khung chứa ảnh thành màu trắng và tạo khoảng đệm */
        .product-image-container, [class*="card"] .ratio, [class*="card"] .img-wrapper {
          background-color: #ffffff !important;
          border-radius: 12px 12px 0 0;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        /* Tối ưu kích thước và hiệu ứng ảnh giày */
        .img-hover-scale, [class*="card"] img {
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) !important;
          width: 100%;
          height: 190px;
          object-fit: contain;
          mix-blend-mode: multiply; /* Giúp hòa trộn nền trắng của ảnh với nền khung card */
        }

        .nk-card:hover .img-hover-scale, 
        .card-product:hover [class*="card"] img,
        [class*="card"]:hover img {
          transform: scale(1.06);
        }

        .products-header-title {
          position: relative;
          display: inline-block;
        }
        .products-header-title::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 0;
          width: 50px;
          height: 3px;
          background-color: var(--accent, #d87c3c);
          border-radius: 2px;
        }
        .pagination .page-link {
          color: #212529;
          border-radius: 10px;
          margin: 0 4px;
          border: 1px solid #dee2e6;
          font-weight: 600;
          font-size: 0.9rem;
          padding: 8px 14px;
          transition: all 0.2s ease;
        }
        .pagination .page-item.active .page-link {
          background-color: var(--accent, #d87c3c);
          border-color: var(--accent, #d87c3c);
          color: #fff;
          box-shadow: 0 4px 12px rgba(216, 124, 60, 0.25);
        }
        .pagination .page-link:hover {
          background-color: #f8f9fa;
          color: var(--accent, #d87c3c);
          border-color: var(--accent, #d87c3c);
        }
        .pagination .page-item.disabled .page-link {
          background-color: #f1f3f5;
          border-color: #e9ecef;
          color: #adb5bd;
        }
      `}</style>

      {/* HEADER TIÊU ĐỀ */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center align-items-start gap-3 pb-4 mb-4 border-bottom">
        <div>
          <span className="text-uppercase text-muted fw-bold tracking-wider fs-7 d-block mb-1">
            Bộ sưu tập chính thức
          </span>
          <h1
            className="fw-black text-uppercase m-0 products-header-title font-monospace"
            style={{ fontSize: "2rem", letterSpacing: "-0.5px" }}
          >
            {categoryID ? `Danh mục sản phẩm` : "Tất cả sản phẩm"}
          </h1>
        </div>
        <div className="bg-light px-3 py-2 rounded-pill border d-flex align-items-center gap-2">
          <i className="fas fa-box-open text-warning fs-7"></i>
          <span className="text-secondary fw-semibold" style={{ fontSize: "0.85rem" }}>
            Hiển thị <strong className="text-dark">{displayedProducts.length}</strong> trên tổng số <strong className="text-dark">{totalItems}</strong> sản phẩm
          </span>
        </div>
      </div>

      {/* BANNER THÔNG BÁO KHI DÙNG BỘ LỌC TỪ AI CHATBOX */}
      {filterIdsParam && (
        <div
          className="alert d-flex justify-content-between align-items-center mb-5 p-3 rounded-4 border-0 shadow-sm"
          style={{ backgroundColor: "#fff5ee", borderLeft: "4px solid #d87c3c" }}
        >
          <div className="d-flex align-items-center gap-3">
            <div className="bg-warning bg-opacity-10 p-2 rounded-circle text-warning d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
              <i className="fas fa-robot fs-5"></i>
            </div>
            <div>
              <h6 className="mb-0 fw-bold text-dark">Trợ lý AI đã tìm kiếm thông minh</h6>
              <p className="mb-0 text-secondary" style={{ fontSize: "0.85rem" }}>
                Tìm thấy <strong>{filteredProducts.length}</strong> sản phẩm phù hợp hoàn hảo với yêu cầu của bạn.
              </p>
            </div>
          </div>
          <Link
            href={
              categoryID
                ? `/products?categoryID=${categoryID}`
                : "/products"
            }
            className="btn btn-sm btn-dark px-3 rounded-pill fw-semibold shadow-sm"
            style={{ backgroundColor: "#212529" }}
          >
            Xóa bộ lọc AI <i className="fas fa-times ms-1"></i>
          </Link>
        </div>
      )}

      {/* BỘ LỌC VÀ LƯỚI HIỂN THỊ SẢN PHẨM */}
      <ProductFilter
        key={`${categoryID || "all"}-${filterIdsParam || "none"}-page-${validPage}`}
        products={displayedProducts}
      />

      {/* TRƯỜNG HỢP KHÔNG CÓ SẢN PHẨM NÀO */}
      {displayedProducts.length === 0 && (
        <div className="text-center py-5 my-5 bg-light rounded-4 border border-dashed">
          <div className="mb-3 text-muted opacity-50" style={{ fontSize: "3rem" }}>
            <i className="fas fa-search"></i>
          </div>
          <h5 className="fw-bold text-dark mb-1">Không tìm thấy sản phẩm nào</h5>
          <p className="text-secondary small mb-4">Rất tiếc, không có sản phẩm nào khớp với tiêu chí tìm kiếm hiện tại của bạn.</p>
          <Link href="/products" className="btn btn-dark btn-sm rounded-pill px-4 fw-semibold">
            Xem tất cả sản phẩm
          </Link>
        </div>
      )}

      {/* THANH PHÂN TRANG (PAGINATION) */}
      {totalPages > 1 && (
        <nav className="d-flex justify-content-center mt-5 pt-3">
          <ul className="pagination shadow-sm rounded-3 bg-white p-2 border">
            {/* Nút Trước */}
            <li className={`page-item ${validPage <= 1 ? "disabled" : ""}`}>
              <Link
                className="page-link"
                href={createPageUrl(validPage - 1)}
                aria-label="Previous"
              >
                <i className="fas fa-chevron-left me-1 fs-8"></i> Trước
              </Link>
            </li>

            {/* Các nút số trang */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <li
                key={pageNum}
                className={`page-item ${pageNum === validPage ? "active" : ""}`}
              >
                <Link className="page-link" href={createPageUrl(pageNum)}>
                  {pageNum}
                </Link>
              </li>
            ))}

            {/* Nút Sau */}
            <li className={`page-item ${validPage >= totalPages ? "disabled" : ""}`}>
              <Link
                className="page-link"
                href={createPageUrl(validPage + 1)}
                aria-label="Next"
              >
                Sau <i className="fas fa-chevron-right ms-1 fs-8"></i>
              </Link>
            </li>
          </ul>
        </nav>
      )}

      {/* CHATBOX AI: Vẫn giữ full danh sách sản phẩm để AI tư vấn toàn kho */}
      <ProductChatbox products={products} />
    </main>
  );
}