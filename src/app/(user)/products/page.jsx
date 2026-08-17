import ProductFilter from "@/components/ProductFilter";
import ProductChatbox from "@/components/ProductChatbox";
import Link from "next/link";
import clientPromise from "@/libs/mongodb";

const DB_NAME = "Nova-kicks";
const COLLECTION_NAME = "products";

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

  // Hàm chuẩn hóa dữ liệu, tính toán giá Flash Sale khớp với định dạng "Tháng-Tuần"
  function formatProducts(rawList) {
    const currentMonth = new Date().getMonth() + 1; 
    
    const now = new Date();
    const dayOfMonth = now.getDate();
    const currentWeekOfMonth = Math.ceil(dayOfMonth / 7); 
    
    const currentBatchString = `${currentMonth}-${currentWeekOfMonth}`;

    return (rawList || []).map((product) => {
      const availableColors =
        product.variants?.map((v) => ({
          color: v.color,
          quantity: v.quantity ?? 0,
        })) || [];

      const rawVariantSizes = product.variants?.flatMap((v) => v.sizes || v.size || []) || [];
      const availableSizes = [...new Set([...(product.sizes || []), ...rawVariantSizes])].filter(Boolean);

      const originalPrice = product.price || 0;
      const rawFlashSalePrice = product.flashSalePrice || product.salePrice || null;
      
      const productBatch = product.flashSaleBatch ? String(product.flashSaleBatch).trim() : null;
      const isBatchValid = productBatch ? productBatch === currentBatchString : false;

      const isFlashSale = Boolean(
        (product.isFlashSale === true || product.isFlashSale === "true") && 
        isBatchValid && 
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
        sizes: availableSizes,
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

  const { filtered: rawFiltered, all: rawAll } = await getFilteredProductsFromDB(
    categoryID,
    filterIdsParam,
    searchQuery
  );

  const products = formatProducts(rawAll);
  const filteredProducts = formatProducts(rawFiltered);

  const totalItems = filteredProducts.length;

  return (
    <main
      className="container py-5"
      style={{ paddingTop: "110px", minHeight: "100vh" }}
    >
      <style>{`
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

        .product-image-container, [class*="card"] .ratio, [class*="card"] .img-wrapper {
          background-color: #ffffff !important;
          border-radius: 12px 12px 0 0;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          position: relative;
        }

        .img-hover-scale, [class*="card"] img {
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) !important;
          width: 100%;
          height: 190px;
          object-fit: contain;
          mix-blend-mode: multiply;
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
            Tổng số <strong className="text-dark">{totalItems}</strong> sản phẩm
          </span>
        </div>
      </div>

      {/* BANNER THÔNG BÁO AI CHATBOX */}
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
            href={categoryID ? `/products?categoryID=${categoryID}` : "/products"}
            className="btn btn-sm btn-dark px-3 rounded-pill fw-semibold shadow-sm"
          >
            Xóa bộ lọc AI <i className="fas fa-times ms-1"></i>
          </Link>
        </div>
      )}

      {/* LƯỚI HIỂN THỊ SẢN PHẨM & BỘ LỌC */}
      <ProductFilter
        key={`${categoryID || "all"}-${filterIdsParam || "none"}`}
        products={filteredProducts}
        allProducts={products}
      />

      <ProductChatbox products={products} />
    </main>
  );
}