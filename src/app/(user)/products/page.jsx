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
  
  // Danh sách 10 sản phẩm của trang hiện tại
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
        .pagination .page-link {
          color: #333;
          border-radius: 8px;
          margin: 0 3px;
          border: 1px solid #dee2e6;
          font-weight: 500;
        }
        .pagination .page-item.active .page-link {
          background-color: var(--accent, #d87c3c);
          border-color: var(--accent, #d87c3c);
          color: #fff;
        }
        .pagination .page-link:hover {
          background-color: #f8f9fa;
          color: var(--accent, #d87c3c);
        }
      `}</style>

      {/* HEADER TIÊU ĐỀ */}
      <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
        <h1
          className="fw-bold text-uppercase m-0"
          style={{ fontSize: "1.75rem", letterSpacing: "0.05em" }}
        >
          {categoryID ? `Danh mục sản phẩm` : "Tất cả sản phẩm"}
        </h1>
        <span className="text-secondary fw-semibold">
          Hiển thị {displayedProducts.length}/{totalItems} sản phẩm
        </span>
      </div>

      {/* BANNER THÔNG BÁO KHI DÙNG BỘ LỌC TỪ AI CHATBOX */}
      {filterIdsParam && (
        <div
          className="alert d-flex justify-content-between align-items-center mb-4 p-3 rounded-3 border-0 shadow-sm"
          style={{ backgroundColor: "#fff3eb", color: "#d87c3c" }}
        >
          <span className="fw-semibold">
            🤖 Trợ lý AI đã tìm thấy{" "}
            <strong>{filteredProducts.length}</strong> sản phẩm phù hợp với yêu cầu của bạn!
          </span>
          <Link
            href={
              categoryID
                ? `/products?categoryID=${categoryID}`
                : "/products"
            }
            className="btn btn-sm btn-dark px-3 rounded-pill"
            style={{ backgroundColor: "#d87c3c", borderColor: "#d87c3c" }}
          >
            Xóa bộ lọc AI ✕
          </Link>
        </div>
      )}

      {/* BỘ LỌC VÀ LƯỚI HIỂN THỊ 10 SẢN PHẨM TRÊN TRANG */}
      <ProductFilter
        key={`${categoryID || "all"}-${filterIdsParam || "none"}-page-${validPage}`}
        products={displayedProducts}
      />

      {/* THANH PHÂN TRANG (PAGINATION) */}
      {totalPages > 1 && (
        <nav className="d-flex justify-content-center mt-5">
          <ul className="pagination">
            {/* Nút Trước */}
            <li className={`page-item ${validPage <= 1 ? "disabled" : ""}`}>
              <Link
                className="page-link"
                href={createPageUrl(validPage - 1)}
                aria-label="Previous"
              >
                &laquo; Trước
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
                Sau &raquo;
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