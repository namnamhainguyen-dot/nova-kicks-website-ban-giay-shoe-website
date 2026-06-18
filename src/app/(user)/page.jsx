import AddToCart from "@/components/AddToCart";
import '../(user)/layout.jsx'; // Đảm bảo import CSS toàn cục nếu cần thiết

export default async function Menu() {
  // Thêm cache: 'no-store' để đảm bảo lấy dữ liệu mới nhất từ Mongo khi F5 (Giữ nguyên logic)
  const res = await fetch('http://localhost:3000/api/products', { cache: 'no-store' });
  const productList = await res.json();

  // Kiểm tra xem productList có thực sự là mảng không để tránh lỗi .map (Giữ nguyên logic)
  const isArray = Array.isArray(productList);
  const featuredProducts = isArray ? productList.filter((product) => product.showOnHome) : [];
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : (isArray ? productList : []);

  return (
    /* 1. SỬA MÀU NỀN TỔNG THỂ: Gỡ bỏ class text-white và mã màu tối #121212, thay bằng màu nền từ hệ thống biến tự động */
    <main className="min-vh-100" style={{ paddingTop: "70px", backgroundColor: "var(--background)" }}>
      
      {/* ================= HERO BANNER SECTION ================= */}
      {/* Giữ chữ trắng độc lập trên ảnh Hero bằng class nk-text-white-forced hoặc ép style để không bị chìm trên banner ảnh */}
      <section 
        className="position-relative text-white d-flex align-items-center" 
        style={{ 
          height: "80vh", 
          backgroundImage: "url('https://myshoes.vn/image/catalog/2026/nike/526/giay-nike-downshifter-14-nam-trang-xanh-01.jpg')",
          backgroundSize: "cover", 
          backgroundPosition: "center" 
        }}
      >
        {/* Lớp phủ mờ màu đen để nổi bật chữ trên banner */}
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-black opacity-50"></div>
        
        <div className="container position-relative z-3 px-4">
          <div className="col-lg-6">
            <h1 className="display-4 fw-black text-uppercase tracking-wider mb-3 nk-text-white-forced" style={{ lineHeight: "1.2" }}>
              THIẾT KẾ CHUYÊN DỤNG<br />CHO ĐƯỜNG PHỐ
            </h1>
            <div className="d-flex gap-2">
              <span className="bg-white text-black d-inline-block px-1 mb-4" style={{ width: "30px", height: "4px" }}></span>
              <span className="bg-secondary d-inline-block px-1 mb-4" style={{ width: "30px", height: "4px" }}></span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CATEGORIES MINI BANNERS ================= */}
      <section className="container my-5">
        <div className="row g-4">
          <div className="col-md-6">
            {/* Sử dụng biến màu của hệ thống kính mờ Light Mode */}
            <div className="glass-card p-5 d-flex align-items-end position-relative overflow-hidden" style={{ height: "180px" }}>
              <h4 className="fw-bold m-0 text-uppercase tracking-wide">NEW ARRIVALS</h4>
              <small className="position-absolute end-0 bottom-0 p-3 text-uppercase tracking-widest fs-7" style={{ color: "var(--text-secondary)" }}>Xem ngay &rarr;</small>
            </div>
          </div>
          <div className="col-md-6">
            <div className="glass-card p-5 d-flex align-items-end position-relative overflow-hidden" style={{ height: "180px" }}>
              <h4 className="fw-bold m-0 text-uppercase tracking-wide">BEST SELLERS</h4>
              <small className="position-absolute end-0 bottom-0 p-3 text-uppercase tracking-widest fs-7" style={{ color: "var(--text-secondary)" }}>Xem ngay &rarr;</small>
            </div>
          </div>
        </div>
      </section>

      {/* ================= DYNAMIC PRODUCT LIST: HÀNG MỚI VỀ ================= */}
      <section className="container my-5">
        <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-4" style={{ borderColor: "var(--border-light)" }}>
          <h3 className="text-uppercase fw-black tracking-wide m-0 fs-4">HÀNG MỚI VỀ</h3>
          <a href="#" className="text-decoration-none small text-uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Xem tất cả</a>
        </div>

        <div className="row g-4">
          {displayProducts.length > 0 ? (
            displayProducts.slice(0, 8).map((p) => (
              <div key={p._id} className="col-sm-6 col-md-4 col-lg-3">
                {/* 2. SỬA MÀU NỀN THẺ SẢN PHẨM: Gỡ bỏ text-white và màu nền #1e1e1e, dùng biến --surface-card (màu trắng) từ layout */}
                <div className="card h-100 card-product nk-card border-0 rounded-0" style={{ backgroundColor: "var(--surface-card)" }}>
                  {/* Khu vực chứa ảnh giày đổi sang nền xám nhạt tinh tế nhẹ nhàng */}
                  <div className="overflow-hidden d-flex align-items-center justify-content-center" style={{ height: "240px", backgroundColor: "#f9f9f9" }}>
                    <img 
                      src={p.image || "/img/hero-banner.jpg"} 
                      className="card-img-top rounded-0 img-fluid img-hover-scale" 
                      alt={p.name} 
                      style={{ objectFit: "contain", maxHeight: "100%" }}
                    />
                  </div>
                  <div className="card-body p-3 text-start">
                    <h6 className="card-title fw-bold text-uppercase text-truncate mb-1" style={{ color: "var(--text-primary)" }}>{p.name}</h6>
                    <p className="small text-truncate mb-2" style={{ color: "var(--text-secondary)" }}>{p.description}</p>
                    <p className="fw-black text-danger mb-3 fs-5">{Number(p.price)?.toLocaleString('vi-VN')} VND</p>
                    
                    <AddToCart product={p}>
                      {/* Đổi nút thêm vào giỏ hàng từ btn-light sang btn-dark để tạo điểm nhấn tương phản trên thẻ màu trắng */}
                      <span className="btn btn-dark w-100 rounded-0 fw-bold btn-sm text-uppercase py-2">Thêm vào giỏ hàng</span>
                    </AddToCart>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center my-5 py-4 border rounded-0" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-light)" }}>
              <p className="text-danger fw-bold m-0">Không có sản phẩm trang chủ để hiển thị.</p>
              <small style={{ color: "var(--text-secondary)" }}>Hãy thêm sản phẩm và bật hiển thị trang chủ trong trang quản trị.</small>
            </div>
          )}
        </div>
      </section>

      {/* ================= FLASH SALE SECTION (STATIC/DEMO THEO ẢNH) ================= */}
      {/* 3. SỬA NỀN VÙNG FLASH SALE: Thay đổi nền tối #161616 thành nền xám nhạt phụ của hệ thống sáng (var(--surface)) */}
      <section className="py-5 my-5" style={{ backgroundColor: "var(--surface)" }}>
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
            <div className="d-flex align-items-center gap-3">
              <h3 className="text-uppercase fw-black tracking-wide m-0 fs-4">FLASH SALE</h3>
              <div className="d-flex gap-2 font-monospace small fw-bold">
                <span className="bg-dark text-white px-2 py-1">04</span>:
                <span className="bg-dark text-white px-2 py-1">20</span>:
                <span className="bg-dark text-white px-2 py-1">13</span>
              </div>
            </div>
            <a href="#" className="text-decoration-none small text-uppercase tracking-wider mt-2 mt-md-0" style={{ color: "var(--text-secondary)" }}>Xem thêm</a>
          </div>

          <div className="row g-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="col-sm-6 col-md-3">
                {/* Đổi nền card Flash sale sang màu trắng cao cấp đồng bộ */}
                <div className="card h-100 nk-card border-0 rounded-0 text-center" style={{ backgroundColor: "var(--surface-card)" }}>
                  <div className="p-3" style={{ height: "200px", backgroundColor: "#f9f9f9" }}>
                    <img src="https://myshoes.vn/image/catalog/2026/nike/526/giay-nike-downshifter-14-nam-trang-xanh-01.jpg" className="img-fluid h-100 object-fit-contain img-hover-scale" alt="Flash Sale" />
                  </div>
                  <div className="card-body p-3">
                    <h6 className="fw-bold text-uppercase m-0" style={{ color: "var(--text-primary)" }}>NOVA AIR ONE</h6>
                    <p className="text-danger fw-bold m-0">3.200.000 VND</p>
                    <del className="small" style={{ color: "var(--text-muted)" }}>4.500.000 VND</del>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ĐANG HOT HIỆN TẠI (STATIC GRID) ================= */}
      <section className="container my-5">
        <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-4" style={{ borderColor: "var(--border-light)" }}>
          <h3 className="text-uppercase fw-black tracking-wide m-0 fs-4">ĐANG HOT HIỆN TẠI</h3>
        </div>
        <div className="row g-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div key={item} className="col-sm-6 col-md-4 col-lg-3">
              {/* Đổi nền card khu vực Đang Hot sang màu trắng */}
              <div className="card h-100 nk-card border-0 rounded-0 text-center" style={{ backgroundColor: "var(--surface-card)" }}>
                <div className="p-4" style={{ height: "200px", backgroundColor: "#f9f9f9" }}>
                  <img src="https://myshoes.vn/image/catalog/2026/nike/526/giay-nike-pegasus-42-nam-trang-xanh-cam-01.jpg" className="img-fluid h-100 object-fit-contain img-hover-scale" alt="Hot item" />
                </div>
                <div className="card-body p-3">
                  <h6 className="fw-bold text-uppercase mb-1" style={{ color: "var(--text-primary)" }}>NOVA AIR ONE</h6>
                  <p className="text-danger fw-bold small m-0">3.200.000 VND</p>
                </div>
              </div>
            </div>
          ))}
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

      {/* ================= TRẢI NGHIỆM TRỰC TIẾP (MAP AREA) ================= */}
      {/* 4. SỬA NỀN KHU VỰC BẢN ĐỒ: Thay màu đen sẫm bằng màu nền phụ sáng (var(--surface)) */}
      <section className="py-5 my-5" style={{ backgroundColor: "var(--surface)" }}>
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-md-5">
              <h4 className="fw-black text-uppercase tracking-wider">TRẢI NGHIỆM TRỰC TIẾP</h4>
              <p className="small mt-3" style={{ color: "var(--text-secondary)" }}>Cửa hàng flagship trưng bày đầy đủ các phiên bản giới hạn độc quyền.</p>
              <p className="m-0 fw-bold" style={{ color: "var(--text-primary)" }}>123 Phố Tràng Tiền, Quận Hoàn Kiếm, Hà Nội</p>
              <p className="small" style={{ color: "var(--text-secondary)" }}>Mở cửa: 09:00 AM - 10:00 PM</p>
            </div>
            <div className="col-md-7">
              <div className="text-secondary d-flex align-items-center justify-content-center border" style={{ height: "250px", backgroundColor: "var(--surface-card)", borderColor: "var(--border-light)" }}>
                <span className="small text-uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>[ Bản đồ Google Maps / Hình ảnh showroom ]</span>
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
            {/* Input đổi màu border đồng bộ Light Mode */}
            <input type="email" className="form-control bg-white border rounded-0" placeholder="Nhập email của bạn..." style={{ color: "var(--text-primary)", borderColor: "var(--border-medium)" }} />
            <button className="btn btn-dark rounded-0 text-uppercase fw-bold px-4" type="button">Gửi</button>
          </div>
        </div>
      </section>

    </main>
  );
}