import Link from 'next/link';
import Image from 'next/image';
import CountdownTimer from "@/components/CountdownTimer";
import HeroBannerSlider from "@/components/HeroBannerSlider";
import { headers } from "next/headers";

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

export default async function Menu() {
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  let productList = [];
  let newsArticles = [];

  try {
    const res = await fetch(`${baseUrl}/api/products`, { cache: 'no-store' });
    if (res.ok) {
      productList = await res.json();
    }
  } catch (err) {
    console.error("Lỗi fetch products:", err);
  }

  try {
    const newsRes = await fetch(`${baseUrl}/api/news`, { cache: 'no-store' });
    if (newsRes.ok) {
      const newsData = await newsRes.json();
      newsArticles = Array.isArray(newsData?.data) ? newsData.data.slice(0, 3) : [];
    }
  } catch (err) {
    console.error("Lỗi fetch news:", err);
  }

  const isArray = Array.isArray(productList);
  const displayProducts = isArray ? productList : [];

  const firstNewProductImage = displayProducts[0]?.image;
  const firstBestProductImage = displayProducts[1]?.image || displayProducts[0]?.image;

  const flashSaleData = displayProducts.filter(p => p.isFlashSale === true);
  const regularProducts = displayProducts.filter(p => !p.isFlashSale);
  const newArrivalsData = regularProducts.slice(0, 4); 
  const hotProductsData = regularProducts.slice(4, 12); 

  return (
    <main className="min-vh-100" style={{ backgroundColor: "var(--background)" }}>
      
      {/* ================= HERO BANNER SLIDER SECTION ================= */}
      <HeroBannerSlider />

      {/* ================= CATEGORIES MINI BANNERS ================= */}
      <section className="container my-5 py-2">
        <div className="row g-4">
          
          {/* Ô NEW ARRIVALS */}
          <div className="col-md-6">
            <Link href="/products" className="text-decoration-none">
              <div className="p-4 rounded-4 d-flex align-items-center justify-content-between position-relative overflow-hidden border shadow-sm transition-all hover-shadow" style={{ height: "190px", backgroundColor: "var(--surface-card)" }}>
                <div className="z-1 pe-2">
                  <span className="text-muted fw-bold text-uppercase" style={{ fontSize: "0.7rem", letterSpacing: "1px" }}>Xu Hướng</span>
                  <h3 className="fw-black m-0 text-uppercase tracking-wide text-dark mt-1" style={{ fontSize: "1.5rem" }}>Hàng Mới Về</h3>
                  <span className="d-inline-flex align-items-center gap-1 text-uppercase fw-bold fs-7 mt-3 text-dark">
                    Xem ngay <i className="bi bi-arrow-right"></i>
                  </span>
                </div>
                <div className="position-absolute end-0 top-0 bottom-0 d-flex align-items-center justify-content-center me-3" style={{ width: "50%", height: "100%" }}>
                  <img 
                    src={firstNewProductImage || "https://myshoes.vn/image/catalog/2026/nike/526/giay-nike-downshifter-14-nam-trang-xanh-01.jpg"} 
                    className="img-fluid h-100 object-fit-contain img-hover-scale" 
                    alt="New Arrival Showcase" 
                    style={{ maxHeight: "150px" }}
                  />
                </div>
              </div>
            </Link>
          </div>

          {/* Ô BEST SELLERS */}
          <div className="col-md-6">
            <Link href="/products" className="text-decoration-none">
              <div className="p-4 rounded-4 d-flex align-items-center justify-content-between position-relative overflow-hidden border shadow-sm transition-all hover-shadow" style={{ height: "190px", backgroundColor: "var(--surface-card)" }}>
                <div className="z-1 pe-2">
                  <span className="text-muted fw-bold text-uppercase" style={{ fontSize: "0.7rem", letterSpacing: "1px" }}>Được Săn Lùng</span>
                  <h3 className="fw-black m-0 text-uppercase tracking-wide text-dark mt-1" style={{ fontSize: "1.5rem" }}>Bán Chạy Nhất</h3>
                  <span className="d-inline-flex align-items-center gap-1 text-uppercase fw-bold fs-7 mt-3 text-dark">
                    Khám phá <i className="bi bi-arrow-right"></i>
                  </span>
                </div>
                <div className="position-absolute end-0 top-0 bottom-0 d-flex align-items-center justify-content-center me-3" style={{ width: "50%", height: "100%" }}>
                  <img 
                    src={firstBestProductImage || "https://myshoes.vn/image/catalog/2026/nike/526/giay-nike-pegasus-42-nam-trang-xanh-cam-01.jpg"} 
                    className="img-fluid h-100 object-fit-contain img-hover-scale" 
                    alt="Best Seller Showcase" 
                    style={{ maxHeight: "150px" }}
                  />
                </div>
              </div>
            </Link>
          </div>

        </div>
      </section>

      {/* ================= DYNAMIC PRODUCT LIST: HÀNG MỚI VỀ ================= */}
      <section className="container my-5 pt-3">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <span className="text-uppercase fw-bold text-muted" style={{ fontSize: "0.7rem", letterSpacing: "1.5px" }}>Sản Phẩm Tuyển Chọn</span>
            <h3 className="text-uppercase fw-black tracking-wide m-0 fs-3 text-dark">HÀNG MỚI VỀ</h3>
          </div>
          <Link href="/products" className="text-decoration-none fw-bold small text-uppercase tracking-wider text-dark border-bottom border-dark pb-1">Xem tất cả &rarr;</Link>
        </div>

        <div className="row g-4">
          {newArrivalsData.length > 0 ? (
            newArrivalsData.map((p) => (
              <div key={p._id} className="col-sm-6 col-md-4 col-lg-3">
                <div className="card h-100 border-0 rounded-4 shadow-sm overflow-hidden bg-white transition-all">
                  <Link href={`/products/${p._id}`} className="text-decoration-none d-block position-relative">
                    <div className="p-4 overflow-hidden d-flex align-items-center justify-content-center bg-light" style={{ height: "220px" }}>
                      <img 
                        src={p.image || "/img/hero-banner.jpg"} 
                        className="img-fluid h-100 object-fit-contain img-hover-scale" 
                        alt={p.name} 
                      />
                    </div>
                  </Link>
                  <div className="card-body p-4 d-flex flex-column justify-content-between">
                    <div>
                      <h6 className="card-title fw-bold text-uppercase text-truncate mb-2 text-dark" style={{ fontSize: "0.9rem" }}>{p.name}</h6>
                      <p className="small text-truncate text-muted mb-3" style={{ fontSize: "0.78rem" }}>{p.description || "Thiết kế trẻ trung, ôm chân tuyệt đối."}</p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mt-2 pt-3 border-top">
                      <span className="fw-black text-danger fs-6 m-0">{Number(p.price)?.toLocaleString('vi-VN')} đ</span>
                      <Link href={`/products/${p._id}`} className="btn btn-outline-dark rounded-pill btn-sm px-3 fw-bold text-uppercase" style={{ fontSize: "0.7rem" }}>
                        Chi Tiết
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center my-5 py-4 border rounded-4 bg-white">
              <p className="text-muted fw-bold m-0">Không có sản phẩm để hiển thị.</p>
            </div>
          )}
        </div>
      </section>

      {/* ================= FLASH SALE SECTION ================= */}
      <section className="py-5 my-5 bg-danger text-white">
        <div className="container py-3">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-2 border-bottom border-light border-opacity-25">
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <h3 className="text-uppercase fw-black tracking-wide m-0 fs-3 text-warning">⚡ FLASH SALE</h3>
              <CountdownTimer /> 
            </div>
          <Link href="/products" className="text-decoration-none small text-uppercase tracking-wider mt-2 mt-md-0 text-light opacity-75">Xem tất cả &rarr;</Link>
          </div>

          <div className="row g-4">
            {flashSaleData.length > 0 ? (
              flashSaleData.map((p) => {
                const oldPrice = p.originalPrice ? Number(p.originalPrice) : Number(p.price) * 1.35; 
                return (
                  <div key={p._id} className="col-sm-6 col-md-3">
                    <div className="card h-100 border-0 rounded-4 text-center d-flex flex-column bg-white overflow-hidden shadow-sm">
                      <Link href={`/products/${p._id}`} className="text-decoration-none d-block flex-grow-1">
                        <div className="p-4 overflow-hidden d-flex align-items-center justify-content-center bg-light" style={{ height: "200px" }}>
                          <img src={p.image || "/img/hero-banner.jpg"} className="img-fluid h-100 object-fit-contain img-hover-scale" alt={p.name} />
                        </div>
                        <div className="card-body p-3 text-start">
                          <h6 className="fw-bold text-uppercase text-truncate mb-2 text-dark" style={{ fontSize: "0.85rem" }}>{p.name}</h6>
                          <div className="d-flex align-items-center gap-2">
                            <span className="text-danger fw-black fs-6">{Number(p.price)?.toLocaleString('vi-VN')} đ</span>
                            <del className="small text-muted" style={{ fontSize: "0.75rem" }}>{Math.round(oldPrice).toLocaleString('vi-VN')} đ</del>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              [1, 2, 3, 4].map((item, index) => (
                <div key={index} className="col-sm-6 col-md-3">
                  <Link href={`/products`} className="text-decoration-none d-block h-100">
                    <div className="card h-100 border-0 rounded-4 text-center bg-white overflow-hidden shadow-sm">
                      <div className="p-4 bg-light" style={{ height: "200px" }}>
                        <img src={`https://myshoes.vn/image/catalog/2026/nike/526/giay-nike-downshifter-14-nam-trang-xanh-0${item}.jpg`} className="img-fluid h-100 object-fit-contain img-hover-scale" alt="Flash Sale Fake" />
                      </div>
                      <div className="card-body p-3 text-start">
                        <h6 className="fw-bold text-uppercase m-0 text-truncate text-dark" style={{ fontSize: "0.85rem" }}>NOVA RUNNER V{item}</h6>
                        <p className="text-danger fw-bold m-0 mt-1">2.450.000 đ</p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ================= ĐANG HOT HIỆN TẠI ================= */}
      <section className="container my-5">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <span className="text-uppercase fw-bold text-muted" style={{ fontSize: "0.7rem", letterSpacing: "1.5px" }}>Xu Hướng Thị Trường</span>
            <h3 className="text-uppercase fw-black tracking-wide m-0 fs-3 text-dark">ĐANG HOT HIỆN TẠI</h3>
          </div>
          <Link href="/products" className="text-decoration-none fw-bold small text-uppercase tracking-wider text-dark border-bottom border-dark pb-1">Xem tất cả &rarr;</Link>
        </div>
        
        <div className="row g-4">
          {hotProductsData.length > 0 ? (
            hotProductsData.map((p) => (
              <div key={p._id} className="col-sm-6 col-md-4 col-lg-3">
                <div className="card h-100 border-0 rounded-4 shadow-sm overflow-hidden bg-white">
                  <Link href={`/products/${p._id}`} className="text-decoration-none d-block">
                    <div className="p-4 overflow-hidden d-flex align-items-center justify-content-center bg-light" style={{ height: "200px" }}>
                      <img src={p.image || "/img/hero-banner.jpg"} className="img-fluid h-100 object-fit-contain img-hover-scale" alt={p.name} />
                    </div>
                    <div className="card-body p-3">
                      <h6 className="fw-bold text-uppercase text-truncate mb-2 text-dark" style={{ fontSize: "0.85rem" }}>{p.name}</h6>
                      <p className="text-danger fw-black m-0" style={{ fontSize: "0.95rem" }}>{Number(p.price)?.toLocaleString('vi-VN')} đ</p>
                    </div>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            [
              { id: 1, name: "Nike Air Max Plus", price: 4200000 },
              { id: 2, name: "Adidas Samba OG", price: 3100000 },
              { id: 3, name: "Puma Palermo Sneaker", price: 2600000 },
              { id: 4, name: "New Balance 9060", price: 4800000 }
            ].map((item) => (
              <div key={item.id} className="col-sm-6 col-md-4 col-lg-3">
                <Link href={`/products`} className="text-decoration-none d-block h-100">
                  <div className="card h-100 border-0 rounded-4 shadow-sm overflow-hidden bg-white text-center">
                    <div className="p-4 bg-light" style={{ height: "200px" }}>
                      <img src="https://myshoes.vn/image/catalog/2026/nike/526/giay-nike-pegasus-42-nam-trang-xanh-cam-01.jpg" className="img-fluid h-100 object-fit-contain img-hover-scale" alt={item.name} />
                    </div>
                    <div className="card-body p-3 text-start">
                      <h6 className="fw-bold text-uppercase mb-1 text-truncate text-dark" style={{ fontSize: "0.85rem" }}>{item.name}</h6>
                      <p className="text-danger fw-bold m-0">{item.price.toLocaleString('vi-VN')} đ</p>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ================= TIN TỨC & BIÊN TẬP ================= */}
      <section className="container my-5 pt-4 border-top">
        <div className="text-center mb-5">
          <span className="text-uppercase fw-bold text-muted" style={{ fontSize: "0.7rem", letterSpacing: "1.5px" }}>Góc Phong Cách</span>
          <h4 className="text-uppercase fw-black tracking-widest mt-1 fs-3 text-dark">TIN TỨC & BIÊN TẬP</h4>
        </div>
        <div className="row g-4">
          {newsArticles.length > 0 ? newsArticles.map((article) => (
            <div className="col-md-4" key={article._id}>
              <Link href={`/news/${article._id}`} className="text-decoration-none text-dark">
                <div className="mb-3 overflow-hidden rounded-4 shadow-sm" style={{ height: "200px" }}>
                  <img src={article.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop'} className="w-100 h-100 object-fit-cover img-hover-scale" alt={article.title} />
                </div>
                <small className="text-muted fw-bold" style={{ fontSize: "0.75rem" }}>{formatDate(article.createdAt)}</small>
                <h6 className="fw-bold text-uppercase mt-1 text-dark" style={{ fontSize: "0.95rem" }}>{article.title}</h6>
                <p className="small text-muted text-truncate-2 mt-1" style={{ fontSize: "0.8rem" }}>{article.summary}</p>
              </Link>
            </div>
          )) : (
            <div className="col-12 text-center text-muted">Chưa có bài viết nào.</div>
          )}
        </div>
      </section>

      {/* ================= TRẢI NGHIỆM TRỰC TIẾP ================= */}
      <section className="py-5 my-5 bg-white border-top border-bottom">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-md-5">
              <span className="text-uppercase fw-bold text-muted" style={{ fontSize: "0.7rem", letterSpacing: "1.5px" }}>Flagship Store</span>
              <h4 className="fw-black text-uppercase tracking-wider mt-1 mb-3">TRẢI NGHIỆM TRỰC TIẾP</h4>
              <p className="small text-muted mb-3" style={{ fontSize: "0.85rem" }}>Cửa hàng trưng bày đầy đủ các bộ sưu tập giày độc quyền và hỗ trợ đo size chân chuẩn xác nhất.</p>
              <p className="m-0 fw-bold text-dark"><i className="bi bi-geo-alt-fill text-danger me-2"></i>123 CVPM Quang Trung, Quận 12, TP.HCM</p>
              <p className="small text-muted mt-2"><i className="bi bi-clock-fill text-secondary me-2"></i>Mở cửa: 09:00 AM - 10:00 PM</p>
            </div>
            <div className="col-md-7">
              <div 
                className="overflow-hidden shadow-sm rounded-4 border" 
                style={{ height: "300px" }}
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.4436614833214!2d106.62524727573752!3d10.854920057758362!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752bee0b0cd9e5%3A0xa1dcd919199401f4!2zQ8O0bmcgdmnDqm4gcGjhuqduIG3hu4FtIFF1YW5nIFRydW5n!5e0!3m2!1svi!2!4v1715000000000!5m2!1svi!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= BRAND LOGOS ================= */}
      <section className="container my-5 py-4 text-center">
        <div className="row align-items-center justify-content-center g-4 g-lg-5">
          {[
            { name: "Nike", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg", href: "/products?brand=nike" },
            { name: "Adidas", logo: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg", href: "/products?brand=adidas" },
            { name: "Puma", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/puma.svg", href: "/products?brand=puma" },
            { name: "New Balance", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/newbalance.svg", href: "/products?brand=newbalance" },
            { name: "Reebok", logo: "https://upload.wikimedia.org/wikipedia/commons/5/53/Reebok_2019_logo.svg", href: "/products?brand=reebok" },
          ].map((brand, index) => (
            <div className="col-4 col-md-2" key={index}>
              <Link href={brand.href} className="d-block text-decoration-none">
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={140}
                  height={55}
                  style={{
                    objectFit: "contain",
                    maxHeight: "48px",
                    width: "100%",
                    filter: "grayscale(100%) opacity(0.6)",
                    transition: "all 0.3s ease",
                  }}
                  className="brand-logo-img"
                />
              </Link>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}