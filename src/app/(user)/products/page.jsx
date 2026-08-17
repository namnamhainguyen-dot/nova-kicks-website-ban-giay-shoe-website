import ProductFilter from "@/components/ProductFilter";
import ProductChatbox from "@/components/ProductChatbox";
import Link from "next/link";
import clientPromise from "@/libs/mongodb";

const DB_NAME = "Nova-kicks";
const COLLECTION_NAME = "products";
const ITEMS_PER_PAGE = 10;

// Hàm Query kết hợp lấy sản phẩm và thông tin Flash Sale (nếu có)
async function getFilteredProductsFromDB(categoryID, filterIdsParam, searchQuery) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const filter = {};
    
    if (categoryID) {
      filter.categoryID = categoryID;
    }

    if (filterIdsParam) {
      const { ObjectId } = require("mongodb");
      const ids = filterIdsParam.split(",").map((id) => {
        try {
          return new ObjectId(id.trim());
        } catch {
          return id;
        }
      });
      filter._id = { $in: ids };
    }

    if (searchQuery) {
      filter.name = { $regex: searchQuery, $options: "i" };
    }

    const rawProducts = await db
      .collection(COLLECTION_NAME)
      .find(filter)
      .sort({ _id: -1 })
      .toArray();

    const allRawProducts = await db
      .collection(COLLECTION_NAME)
      .find({})
      .sort({ _id: -1 })
      .toArray();

    return {
      filtered: JSON.parse(JSON.stringify(rawProducts)),
      all: JSON.parse(JSON.stringify(allRawProducts)),
    };
  } catch (error) {
    console.error("[MongoDB Query Error] Lỗi kết nối hoặc lấy dữ liệu:", error);
    return { filtered: [], all: [] };
  }
}

// Hàm chuẩn hóa dữ liệu, tính toán giá Flash Sale theo tuần
function formatProducts(rawList) {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const currentWeekNumber = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);

  return (rawList || []).map((product) => {
    const availableColors =
      product.variants?.map((v) => ({
        color: v.color,
        quantity: v.quantity ?? 0,
      })) || [];

    const availableSizes = product.variants?.[0]?.sizes || product.sizes || [];

    const originalPrice = product.price || 0;
    const rawFlashSalePrice = product.flashSalePrice || product.salePrice || null;
    const productWeek = product.flashSaleBatch ? Number(product.flashSaleBatch) : null;
    const isWeekValid = productWeek ? productWeek === currentWeekNumber : true;

    const isFlashSale = Boolean(
      (product.isFlashSale === true || product.isFlashSale === "true") && 
      isWeekValid && 
      rawFlashSalePrice && 
      Number(rawFlashSalePrice) < Number(originalPrice)
    );

    const flashSalePrice = isFlashSale ? Number(rawFlashSalePrice) : null;
    const discountPercent = isFlashSale 
      ? Math.round(((originalPrice - flashSalePrice) / originalPrice) * 100) 
      : 0;

    return {
      ...product,
      _id: String(product._id),
      availableColors,
      availableSizes,
      description: product.description || "Chưa có mô tả cho sản phẩm này.",
      price: isFlashSale ? flashSalePrice : originalPrice,
      originalPrice: originalPrice, 
      flashSalePrice: flashSalePrice,
      isFlashSale: isFlashSale, 
      discountPercent: discountPercent,
    };
  });
}

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;
  const categoryID = params?.categoryID;
  const filterIdsParam = params?.filterIds;
  const searchQuery = params?.search;
  
  const currentPage = Math.max(1, parseInt(params?.page || "1", 10));

  const { filtered: rawFiltered, all: rawAll } = await getFilteredProductsFromDB(
    categoryID,
    filterIdsParam,
    searchQuery
  );

  const products = formatProducts(rawAll);
  const filteredProducts = formatProducts(rawFiltered);

  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const validPage = Math.min(currentPage, totalPages);

  const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayedProducts = filteredProducts.slice(startIndex, endIndex);

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
      style={{ 
        paddingTop: "110px", 
        minHeight: "100vh",
        fontFamily: "var(--bs-body-font-family, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif)"
      }}
    >
      <style>{`
        /* --- ĐỒNG BỘ TYPOGRAPHY & UI COMPONENTS --- */
        body {
          letter-spacing: -0.01em;
        }

        .nk-card, .card-product, [class*="card"] {
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), 
                      box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
          position: relative;
          overflow: hidden;
          border-radius: 16px !important;
          border: 1px solid rgba(0, 0, 0, 0.06) !important;
          background-color: #ffffff !important;
        }
        
        .nk-card:hover, .card-product:hover, [class*="card"]:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.07) !important;
        }

        .product-image-container, [class*="card"] .ratio, [class*="card"] .img-wrapper {
          background-color: #f8f9fa !important;
          border-radius: 16px 16px 0 0;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
        }

        .img-hover-scale, [class*="card"] img {
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) !important;
          width: 100%;
          height: 200px;
          object-fit: contain;
        }

        .nk-card:hover .img-hover-scale, 
        .card-product:hover [class*="card"] img,
        [class*="card"]:hover img {
          transform: scale(1.05);
        }

        /* --- TIÊU ĐỀ SECTION THANH LỊCH --- */
        .products-header-title {
          position: relative;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #111827;
        }
        
        .products-subtext {
          font-size: 0.875rem;
          letter-spacing: 0.05em;
          color: #6b7280;
        }

        /* --- PHÂN TRANG HIỆN ĐẠI --- */
        .pagination .page-link {
          color: #374151;
          border-radius: 10px;
          margin: 0 3px;
          border: 1px solid #e5e7eb;
          font-weight: 500;
          font-size: 0.875rem;
          padding: 8px 14px;
          transition: all 0.2s ease;
        }
        .pagination .page-item.active .page-link {
          background-color: var(--accent, #d87c3c);
          border-color: var(--accent, #d87c3c);
          color: #fff;
          box-shadow: 0 4px 12px rgba(216, 124, 60, 0.2);
        }
        .pagination .page-link:hover {
          background-color: #f3f4f6;
          color: var(--accent, #d87c3c);
          border-color: #d1d5db;
        }
      `}</style>

      {/* HEADER TIÊU ĐỀ */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center align-items-start gap-3 pb-4 mb-4 border-bottom border-light">
        <div>
          <span className="text-uppercase products-subtext fw-semibold d-block mb-1">
            Bộ sưu tập chính thức
          </span>
          <h1
            className="text-uppercase m-0 products-header-title"
            style={{ fontSize: "1.85rem" }}
          >
            {categoryID ? `Danh mục sản phẩm` : "Tất cả sản phẩm"}
          </h1>
        </div>
        <div className="bg-white px-3 py-2 rounded-pill shadow-xs border d-flex align-items-center gap-2">
          <i className="fas fa-box-open text-warning fs-7"></i>
          <span className="text-secondary fw-medium" style={{ fontSize: "0.85rem" }}>
            Hiển thị <strong className="text-dark">{displayedProducts.length}</strong> / <strong className="text-dark">{totalItems}</strong> sản phẩm
          </span>
        </div>
      </div>

      {/* BANNER THÔNG BÁO AI CHATBOX */}
      {filterIdsParam && (
        <div
          className="alert d-flex justify-content-between align-items-center mb-5 p-3 rounded-4 border-0 shadow-sm"
          style={{ backgroundColor: "#fffaf5", borderLeft: "4px solid #d87c3c" }}
        >
          <div className="d-flex align-items-center gap-3">
            <div className="bg-warning bg-opacity-10 p-2 rounded-circle text-warning d-flex align-items-center justify-content-center" style={{ width: "42px", height: "42px" }}>
              <i className="fas fa-robot fs-5"></i>
            </div>
            <div>
              <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: "0.95rem" }}>Trợ lý AI đã tìm kiếm thông minh</h6>
              <p className="mb-0 text-secondary" style={{ fontSize: "0.85rem" }}>
                Tìm thấy <strong>{filteredProducts.length}</strong> sản phẩm phù hợp hoàn hảo với yêu cầu của bạn.
              </p>
            </div>
          </div>
          <Link
            href={categoryID ? `/products?categoryID=${categoryID}` : "/products"}
            className="btn btn-sm btn-dark px-3 rounded-pill fw-medium shadow-xs"
            style={{ fontSize: "0.8rem" }}
          >
            Xóa bộ lọc AI <i className="fas fa-times ms-1"></i>
          </Link>
        </div>
      )}

      {/* LƯỚI HIỂN THỊ SẢN PHẨM */}
      <ProductFilter
        key={`${categoryID || "all"}-${filterIdsParam || "none"}-page-${validPage}`}
        products={displayedProducts}
      />

      {/* TRƯỜNG HỢP KHÔNG CÓ SẢN PHẨM */}
      {displayedProducts.length === 0 && (
        <div className="text-center py-5 my-5 bg-light rounded-4 border border-dashed">
          <div className="mb-3 text-muted opacity-50" style={{ fontSize: "2.5rem" }}>
            <i className="fas fa-search"></i>
          </div>
          <h5 className="fw-bold text-dark mb-1">Không tìm thấy sản phẩm nào</h5>
          <p className="text-secondary small mb-4">Rất tiếc, không có sản phẩm nào khớp với tiêu chí tìm kiếm hiện tại của bạn.</p>
          <Link href="/products" className="btn btn-dark btn-sm rounded-pill px-4 fw-medium">
            Xem tất cả sản phẩm
          </Link>
        </div>
      )}

      {/* PHÂN TRANG */}
      {totalPages > 1 && (
        <nav className="d-flex justify-content-center mt-5 pt-3">
          <ul className="pagination shadow-xs rounded-4 bg-white p-2 border border-light">
            <li className={`page-item ${validPage <= 1 ? "disabled" : ""}`}>
              <Link className="page-link" href={createPageUrl(validPage - 1)}>
                <i className="fas fa-chevron-left me-1" style={{ fontSize: "0.75rem" }}></i> Trước
              </Link>
            </li>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <li key={pageNum} className={`page-item ${pageNum === validPage ? "active" : ""}`}>
                <Link className="page-link" href={createPageUrl(pageNum)}>
                  {pageNum}
                </Link>
              </li>
            ))}

            <li className={`page-item ${validPage >= totalPages ? "disabled" : ""}`}>
              <Link className="page-link" href={createPageUrl(validPage + 1)}>
                Sau <i className="fas fa-chevron-right ms-1" style={{ fontSize: "0.75rem" }}></i>
              </Link>
            </li>
          </ul>
        </nav>
      )}

      <ProductChatbox products={products} />
    </main>
  );
}