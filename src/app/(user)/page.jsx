import Link from 'next/link'; 
import CountdownTimer from "@/components/CountdownTimer";
import '../(user)/layout.jsx'; 

export default async function Menu() {
  // Lấy dữ liệu mới nhất từ database
  const res = await fetch('http://localhost:3000/api/products', { cache: 'no-store' });
  const productList = await res.json();

  const isArray = Array.isArray(productList);
  
  const displayProducts = isArray ? productList : [];

  // Ảnh đại diện cho 2 ô banner phụ dựa trên dữ liệu thật
  const firstNewProductImage = displayProducts[0]?.image;
  const firstBestProductImage = displayProducts[1]?.image || displayProducts[0]?.image;

  // PHÂN CHIA DỮ LIỆU ĐỘNG CHO TỪNG KHU VỰC ĐỂ KHÔNG BỊ TRÙNG LẶP
  const newArrivalsData = displayProducts.slice(0, 4); 
  const flashSaleData = displayProducts.slice(6, 10);
  const hotProductsData = displayProducts.slice(10).concat(displayProducts.slice(0, 5)); // 8 sản phẩm tiếp theo

  return (
    <main className="min-vh-100" style={{ paddingTop: "70px", backgroundColor: "var(--background)" }}>
      
      {/* ================= HERO BANNER SECTION ================= */}
      <section 
        className="position-relative text-white d-flex align-items-center" 
        style={{ 
          height: "80vh", 
          backgroundImage: "url('/img/Gemini_Generated_Image_jqml2cjqml2cjqml.png')", 
          backgroundSize: "cover", 
          backgroundPosition: "center" 
        }}
      >
      </section>

      {/* ================= CATEGORIES MINI BANNERS ================= */}
      <section className="container my-5">
        <div className="row g-4">
          
          {/* Ô NEW ARRIVALS */}
          <div className="col-md-6">
            <Link href="/products" className="text-decoration-none text-dark">
              <div className="glass-card p-4 d-flex align-items-center justify-content-between position-relative overflow-hidden" style={{ height: "180px", backgroundColor: "var(--surface-card)" }}>
                <div className="z-1">
                  <h4 className="fw-black m-0 text-uppercase tracking-wide" style={{ color: "var(--text-primary)" }}>NEW ARRIVALS</h4>
                  <small className="text-uppercase tracking-widest fs-7 d-block mt-2" style={{ color: "var(--text-secondary)" }}>Xem ngay &rarr;</small>
                </div>
                <div className="position-absolute end-0 top-0 bottom-0 d-flex align-items-center justify-content-center me-3" style={{ width: "45%", height: "100%" }}>
                  <img 
                    src={firstNewProductImage || "https://myshoes.vn/image/catalog/2026/nike/526/giay-nike-downshifter-14-nam-trang-xanh-01.jpg"} 
                    className="img-fluid h-100 object-fit-contain img-hover-scale" 
                    alt="New Arrival Showcase" 
                    style={{ maxHeight: "140px" }}
                  />
                </div>
              </div>
            </Link>
          </div>

          {/* Ô BEST SELLERS */}
          <div className="col-md-6">
            <Link href="/products" className="text-decoration-none text-dark">
              <div className="glass-card p-4 d-flex align-items-center justify-content-between position-relative overflow-hidden" style={{ height: "180px", backgroundColor: "var(--surface-card)" }}>
                <div className="z-1">
                  <h4 className="fw-black m-0 text-uppercase tracking-wide" style={{ color: "var(--text-primary)" }}>BEST SELLERS</h4>
                  <small className="text-uppercase tracking-widest fs-7 d-block mt-2" style={{ color: "var(--text-secondary)" }}>Xem ngay &rarr;</small>
                </div>
                <div className="position-absolute end-0 top-0 bottom-0 d-flex align-items-center justify-content-center me-3" style={{ width: "45%", height: "100%" }}>
                  <img 
                    src={firstBestProductImage || "https://myshoes.vn/image/catalog/2026/nike/526/giay-nike-pegasus-42-nam-trang-xanh-cam-01.jpg"} 
                    className="img-fluid h-100 object-fit-contain img-hover-scale" 
                    alt="Best Seller Showcase" 
                    style={{ maxHeight: "140px" }}
                  />
                </div>
              </div>
            </Link>
          </div>

        </div>
      </section>

      {/* ================= DYNAMIC PRODUCT LIST: HÀNG MỚI VỀ ================= */}
      <section className="container my-5">
        <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-4" style={{ borderColor: "var(--border-light)" }}>
          <h3 className="text-uppercase fw-black tracking-wide m-0 fs-4">HÀNG MỚI VỀ</h3>
          <Link href="/products" className="text-decoration-none small text-uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Xem tất cả</Link>
        </div>

        <div className="row g-4">
          {newArrivalsData.length > 0 ? (
            newArrivalsData.map((p) => (
              <div key={p._id} className="col-sm-6 col-md-4 col-lg-3">
                <div className="card h-100 card-product nk-card border-0 rounded-0" style={{ backgroundColor: "var(--surface-card)" }}>
                  <Link href={`/products/${p._id}`} className="text-decoration-none text-start d-block flex-grow-1">
                    <div className="overflow-hidden d-flex align-items-center justify-content-center" style={{ height: "240px", backgroundColor: "#f9f9f9" }}>
                      <img 
                        src={p.image || "/img/hero-banner.jpg"} 
                        className="card-img-top rounded-0 img-fluid img-hover-scale" 
                        alt={p.name} 
                        style={{ objectFit: "contain", maxHeight: "100%" }}
                      />
                    </div>
                    <div className="p-3 pb-3"> 
                      <h6 className="card-title fw-bold text-uppercase text-truncate mb-1" style={{ color: "var(--text-primary)" }}>{p.name}</h6>
                      <p className="small text-truncate mb-2" style={{ color: "var(--text-secondary)" }}>{p.description}</p>
                      <p className="fw-black text-danger m-0 fs-5">{Number(p.price)?.toLocaleString('vi-VN')} VND</p>
                    </div>
                  </Link>
                  
                  <div className="card-body p-3 pt-0 text-start">
                    <Link href={`/products/${p._id}`} className="text-decoration-none">
                      <span className="btn btn-dark w-100 rounded-0 fw-bold btn-sm text-uppercase py-2">XEM CHI TIẾT</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center my-5 py-4 border rounded-0" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-light)" }}>
              <p className="text-danger fw-bold m-0">Không có sản phẩm để hiển thị.</p>
            </div>
          )}
        </div>
      </section>

      {/* ================= FLASH SALE SECTION ================= */}
      <section className="py-5 my-5" style={{ backgroundColor: "var(--surface)" }}>
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
            <div className="d-flex align-items-center gap-3">
              <h3 className="text-uppercase fw-black tracking-wide m-0 fs-4">FLASH SALE</h3>
              <CountdownTimer /> 
            </div>
            <Link href="/products" className="text-decoration-none small text-uppercase tracking-wider mt-2 mt-md-0" style={{ color: "var(--text-secondary)" }}>Xem thêm</Link>
          </div>

          <div className="row g-4">
            {flashSaleData.length > 0 ? (
              flashSaleData.map((p) => {
                const originalPrice = Number(p.price) * 1.35; 
                return (
                  <div key={p._id} className="col-sm-6 col-md-3">
                    <div className="card h-100 nk-card border-0 rounded-0 text-center d-flex flex-column" style={{ backgroundColor: "var(--surface-card)" }}>
                      <Link href={`/products/${p._id}`} className="text-decoration-none d-block flex-grow-1 pb-3">
                        <div className="p-3 overflow-hidden d-flex align-items-center justify-content-center" style={{ height: "200px", backgroundColor: "#f9f9f9" }}>
                          <img src={p.image || "/img/hero-banner.jpg"} className="img-fluid h-100 object-fit-contain img-hover-scale" alt={p.name} />
                        </div>
                        <div className="card-body p-3 pb-0 text-start">
                          <h6 className="fw-bold text-uppercase text-truncate mb-1" style={{ color: "var(--text-primary)" }}>{p.name}</h6>
                          <p className="text-danger fw-black m-0 fs-5">{Number(p.price)?.toLocaleString('vi-VN')} VND</p>
                          <del className="small" style={{ color: "var(--text-muted)" }}>{Math.round(originalPrice).toLocaleString('vi-VN')} VND</del>
                        </div>
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              [1, 2, 3, 4].map((item, index) => (
                <div key={index} className="col-sm-6 col-md-3">
                  <Link href={`/products/${item}`} className="text-decoration-none d-block h-100">
                    <div className="card h-100 nk-card border-0 rounded-0 text-center" style={{ backgroundColor: "var(--surface-card)" }}>
                      <div className="p-3" style={{ height: "200px", backgroundColor: "#f9f9f9" }}>
                        <img src={`https://myshoes.vn/image/catalog/2026/nike/526/giay-nike-downshifter-14-nam-trang-xanh-0${item}.jpg`} className="img-fluid h-100 object-fit-contain img-hover-scale" alt="Flash Sale Fake" />
                      </div>
                      <div className="card-body p-3">
                        <h6 className="fw-bold text-uppercase m-0" style={{ color: "var(--text-primary)" }}>NOVA RUNNER V{item}</h6>
                        <p className="text-danger fw-bold m-0">2.450.000 VND</p>
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
        <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-4" style={{ borderColor: "var(--border-light)" }}>
          <h3 className="text-uppercase fw-black tracking-wide m-0 fs-4">ĐANG HOT HIỆN TẠI</h3>
        </div>
        <div className="row g-4">
          {hotProductsData.length > 0 ? (
            hotProductsData.map((p) => (
              <div key={p._id} className="col-sm-6 col-md-4 col-lg-3">
                <div className="card h-100 nk-card border-0 rounded-0 text-center d-flex flex-column" style={{ backgroundColor: "var(--surface-card)" }}>
                  <Link href={`/products/${p._id}`} className="text-decoration-none d-block flex-grow-1 pb-3">
                    <div className="p-4 overflow-hidden d-flex align-items-center justify-content-center" style={{ height: "200px", backgroundColor: "#f9f9f9" }}>
                      <img src={p.image || "/img/hero-banner.jpg"} className="img-fluid h-100 object-fit-contain img-hover-scale" alt={p.name} />
                    </div>
                    <div className="card-body p-3 pb-0 text-start">
                      <h6 className="fw-bold text-uppercase text-truncate mb-1" style={{ color: "var(--text-primary)" }}>{p.name}</h6>
                      <p className="text-danger fw-black small m-0">{Number(p.price)?.toLocaleString('vi-VN')} VND</p>
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
              { id: 4, name: "New Balance 9060", price: 4800000 },
              { id: 5, name: "Asics Gel-Kayano 14", price: 3900000 },
              { id: 6, name: "Converse Chuck 70", price: 2100000 },
              { id: 7, name: "Vans Old Skool Classic", price: 1850000 },
              { id: 8, name: "Nike Dunk Low Panda", price: 3500000 }
            ].map((item) => (
              <div key={item.id} className="col-sm-6 col-md-4 col-lg-3">
                <Link href={`/products/${item.id}`} className="text-decoration-none d-block h-100">
                  <div className="card h-100 nk-card border-0 rounded-0 text-center" style={{ backgroundColor: "var(--surface-card)" }}>
                    <div className="p-4" style={{ height: "200px", backgroundColor: "#f9f9f9" }}>
                      <img src="https://myshoes.vn/image/catalog/2026/nike/526/giay-nike-pegasus-42-nam-trang-xanh-cam-01.jpg" className="img-fluid h-100 object-fit-contain img-hover-scale" alt={item.name} />
                    </div>
                    <div className="card-body p-3 text-start">
                      <h6 className="fw-bold text-uppercase mb-1 text-truncate" style={{ color: "var(--text-primary)" }}>{item.name}</h6>
                      <p className="text-danger fw-bold small m-0">{item.price.toLocaleString('vi-VN')} VND</p>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ================= TIN TỨC & BIÊN TẬP ================= */}
      <section className="container my-5 pt-4 border-top" style={{ borderColor: "var(--border-light)" }}>
        <h4 className="text-uppercase text-center fw-black tracking-widest mb-5 fs-4">TIN TỨC & BIÊN TẬP</h4>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="mb-3 overflow-hidden glass-card" style={{ height: "180px" }}>
              <img src="https://myshoes.vn/image/catalog/2026/nike/526/giay-nike-pegasus-42-nam-trang-xanh-cam-01.jpg" className="w-100 h-100 object-fit-cover" alt="News" />
            </div>
            <h6 className="fw-bold text-uppercase">Nghệ thuật chế tác giày thủ công</h6>
            <p className="small" style={{ color: "var(--text-secondary)" }}>Từng đường kim mũi chỉ tạo nên giá trị độc bản bền bỉ cùng thời gian thực tế.</p>
          </div>
          <div className="col-md-4">
            <div className="mb-3 overflow-hidden glass-card" style={{ height: "180px" }}>
              <img src="https://myshoes.vn/image/catalog/2026/nike/526/giay-nike-metcon-10-nam-xanh-den-01.jpg" className="w-100 h-100 object-fit-cover" alt="News" />
            </div>
            <h6 className="fw-bold text-uppercase">Xu hướng Techwear 2026</h6>
            <p className="small" style={{ color: "var(--text-secondary)" }}>Khám phá phong cách đường phố tối giản kết hợp công nghệ tối tân nhất.</p>
          </div>
          <div className="col-md-4">
            <div className="mb-3 overflow-hidden glass-card" style={{ height: "180px" }}>
              <img src="https://myshoes.vn/image/catalog/2026/nike/526/giay-nike-downshifter-14-nam-trang-xanh-01.jpg" className="w-100 h-100 object-fit-cover" alt="News" />
            </div>
            <h6 className="fw-bold text-uppercase">Đế giày cấu trúc tương lai</h6>
            <p className="small" style={{ color: "var(--text-secondary)" }}>Công nghệ phản hồi lực tiên tiến bảo vệ đôi chân trên mọi bề mặt địa hình.</p>
          </div>
        </div>
      </section>

      {/* ================= TRẢI NGHIỆM TRỰC TIẾP (ĐÃ UPDATE GOOGLE MAPS) ================= */}
      <section className="py-5 my-5" style={{ backgroundColor: "var(--surface)" }}>
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-md-5">
              <h4 className="fw-black text-uppercase tracking-wider">TRẢI NGHIỆM TRỰC TIẾP</h4>
              <p className="small mt-3" style={{ color: "var(--text-secondary)" }}>Cửa hàng flagship trưng bày đầy đủ các phiên bản giới hạn độc quyền.</p>
              <p className="m-0 fw-bold" style={{ color: "var(--text-primary)" }}>123 CVPM Quang Trung, Quận 12, TP.HCM</p>
              <p className="small" style={{ color: "var(--text-secondary)" }}>Mở cửa: 09:00 AM - 10:00 PM</p>
            </div>
            <div className="col-md-7">
              {/* Thẻ iframe nhúng bản đồ trực tiếp có bo viền chuẩn UI */}
              <div 
                className="overflow-hidden shadow-sm border" 
                style={{ 
                  height: "300px", 
                  backgroundColor: "var(--surface-card)", 
                  borderColor: "var(--border-light)" 
                }}
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.4436614833214!2d106.62524727573752!3d10.854920057758362!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752bee0b0cd9e5%3A0xa1dcd919199401f4!2zQ8O0bmcgdmnDqm4gcGjhuqduIG3hu4FtIFF1YW5nIFRydW5n!5e0!3m2!1svi!2s!4v1715000000000!5m2!1svi!2s"
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
        <div className="row align-items-center justify-content-center g-5 opacity-75 gray-scale-logos">
          <div className="col-4 col-md-2 fw-black tracking-widest fs-5" style={{ color: "var(--text-primary)" }}>NIKE</div>
          <div className="col-4 col-md-2 fw-black tracking-widest fs-5" style={{ color: "var(--text-primary)" }}>ADIDAS</div>
          <div className="col-4 col-md-2 fw-black tracking-widest fs-5" style={{ color: "var(--text-primary)" }}>PUMA</div>
          <div className="col-4 col-md-2 fw-black tracking-widest fs-5" style={{ color: "var(--text-primary)" }}>NEW BALANCE</div>
          <div className="col-4 col-md-2 fw-black tracking-widest fs-5" style={{ color: "var(--text-primary)" }}>REEBOK</div>
        </div>
      </section>

      {/* ================= ĐÓNG GÓP Ý KIẾN ================= */}
      <section className="container my-5 py-5 text-center border-top" style={{ borderColor: "var(--border-light)" }}>
        <h5 className="text-uppercase fw-bold tracking-widest mb-3">ĐÓNG GÓP Ý KIẾN</h5>
        <p className="small mb-4" style={{ color: "var(--text-secondary)" }}>Mọi phản hồi của bạn giúp chúng tôi hoàn thiện chất lượng dịch vụ tốt hơn.</p>
        <div className="d-flex justify-content-center">
          <div className="input-group w-50 min-w-300">
            <input type="email" className="form-control bg-white border rounded-0" placeholder="Nhập email của bạn..." style={{ color: "var(--text-primary)", borderColor: "var(--border-medium)" }} />
            <button className="btn btn-dark rounded-0 text-uppercase fw-bold px-4" type="button">Gửi</button>
          </div>
        </div>
      </section>

    </main>
  );
}