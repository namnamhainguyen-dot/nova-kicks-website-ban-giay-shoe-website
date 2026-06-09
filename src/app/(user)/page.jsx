import AddToCart from "@/components/AddToCart";

export default async function Menu() {
  // Thêm cache: 'no-store' để đảm bảo lấy dữ liệu mới nhất từ Mongo khi F5 (Giữ nguyên logic)
  const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api"/products', { cache: 'no-store' });
  const productList = await res.json();

  // Kiểm tra xem productList có thực sự là mảng không để tránh lỗi .map (Giữ nguyên logic)
  const isArray = Array.isArray(productList);

  return (
    <main className="bg-black text-white min-vh-100" style={{ paddingTop: "70px" }}>
      
      {/* ================= HERO BANNER SECTION ================= */}
      <section 
        className="position-relative text-white d-flex align-items-center" 
        style={{ 
          height: "80vh", 
          backgroundImage: "url('/img/hero-banner.jpg')", // Bạn thay ảnh nền giày ngầu tại đây
          backgroundSize: "cover", 
          backgroundPosition: "center" 
        }}
      >
        {/* Lớp phủ mờ màu đen để nổi bật chữ */}
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-black opacity-50"></div>
        
        <div className="container position-relative z-3 px-4">
          <div className="col-lg-6">
            <h1 className="display-4 fw-black text-uppercase tracking-wider mb-3" style={{ lineHeight: "1.2" }}>
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
            <div className="bg-dark text-white p-5 d-flex align-items-end position-relative overflow-hidden" style={{ height: "180px" }}>
              <h4 className="fw-bold m-0 text-uppercase tracking-wide">NEW ARRIVALS</h4>
              <small className="position-absolute end-0 bottom-0 p-3 text-secondary text-uppercase tracking-widest fs-7">Xem ngay &rarr;</small>
            </div>
          </div>
          <div className="col-md-6">
            <div className="bg-dark text-white p-5 d-flex align-items-end position-relative overflow-hidden" style={{ height: "180px" }}>
              <h4 className="fw-bold m-0 text-uppercase tracking-wide">BEST SELLERS</h4>
              <small className="position-absolute end-0 bottom-0 p-3 text-secondary text-uppercase tracking-widest fs-7">Xem ngay &rarr;</small>
            </div>
          </div>
        </div>
      </section>

      {/* ================= DYNAMIC PRODUCT LIST: HÀNG MỚI VỀ ================= */}
      <section className="container my-5">
        <div className="d-flex justify-content-between align-items-center border-bottom border-secondary pb-2 mb-4">
          <h3 className="text-uppercase fw-black tracking-wide m-0 fs-4">HÀNG MỚI VỀ</h3>
          <a href="#" className="text-secondary text-decoration-none small text-uppercase tracking-wider">Xem tất cả</a>
        </div>

        <div className="row g-4">
          {isArray ? (
            productList.map((p) => (
              <div key={p._id} className="col-sm-6 col-md-4 col-lg-3">
                <div className="card h-100 bg-black border-0 rounded-0 text-white">
                  <div className="overflow-hidden bg-dark d-flex align-items-center justify-content-center" style={{ height: "240px" }}>
                    <img 
                      src={`/img/${p.image}`} 
                      className="card-img-top rounded-0 img-fluid img-hover-scale" 
                      alt={p.name} 
                      style={{ objectFit: "contain", maxHeight: "100%" }}
                    />
                  </div>
                  <div className="card-body px-0 pt-3 text-start">
                    <h6 className="card-title fw-bold text-uppercase text-truncate mb-1">{p.name}</h6>
                    <p className="text-secondary small text-truncate mb-2">{p.description}</p>
                    <p className="fw-black text-danger mb-3 fs-5">{p.price?.toLocaleString('vi-VN')} VND</p>
                    
                    <AddToCart product={p}>
                      <span className="btn btn-light w-100 rounded-0 fw-bold btn-sm text-uppercase py-2">Thêm vào giỏ hàng</span>
                    </AddToCart>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center my-5 py-4 border border-secondary bg-dark text-white rounded-0">
              <p className="text-danger fw-bold m-0">Dữ liệu từ Database đang gặp lỗi hoặc không phải định dạng danh sách!</p>
              <small className="text-secondary">Vui lòng kiểm tra lại kết nối MongoDB trong file .env.local và API.</small>
            </div>
          )}
        </div>
      </section>

      {/* ================= FLASH SALE SECTION (STATIC/DEMO THEO ẢNH) ================= */}
      <section className="py-5 my-5" style={{ backgroundColor: "#1e1e1e" }}>
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
            <div className="d-flex align-items-center gap-3">
              <h3 className="text-uppercase fw-black tracking-wide m-0 fs-4">FLASH SALE</h3>
              <div className="d-flex gap-2 text-white font-monospace small fw-bold">
                <span className="bg-black px-2 py-1">04</span>:
                <span className="bg-black px-2 py-1">20</span>:
                <span className="bg-black px-2 py-1">13</span>
              </div>
            </div>
            <a href="#" className="text-secondary text-decoration-none small text-uppercase tracking-wider mt-2 mt-md-0">Xem thêm</a>
          </div>

          <div className="row g-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="col-sm-6 col-md-3">
                <div className="card h-100 bg-transparent border-0 rounded-0 text-white text-center">
                  <div className="bg-dark p-3" style={{ height: "200px" }}>
                    <img src="/img/giay-sneaker-classic.png" className="img-fluid h-100 object-fit-contain opacity-50" alt="Flash Sale" />
                  </div>
                  <div className="card-body px-0 pt-2">
                    <h6 className="fw-bold text-uppercase m-0">NOVA AIR ONE</h6>
                    <p className="text-danger fw-bold m-0">3.200.000 VND</p>
                    <del className="text-secondary small">4.500.000 VND</del>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ĐANG HOT HIỆN TẠI (STATIC GRID) ================= */}
      <section className="container my-5">
        <div className="d-flex justify-content-between align-items-center border-bottom border-secondary pb-2 mb-4">
          <h3 className="text-uppercase fw-black tracking-wide m-0 fs-4">ĐANG HOT HIỆN TẠI</h3>
        </div>
        <div className="row g-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div key={item} className="col-sm-6 col-md-4 col-lg-3">
              <div className="card h-100 bg-black border-0 rounded-0 text-white text-center">
                <div className="bg-dark p-4" style={{ height: "200px" }}>
                  <img src="/img/giay-running-pro.png" className="img-fluid h-100 object-fit-contain opacity-40" alt="Hot item" />
                </div>
                <div className="card-body px-0 pt-2">
                  <h6 className="fw-bold text-uppercase mb-1">NOVA AIR ONE</h6>
                  <p className="text-danger fw-bold small m-0">3.200.000 VND</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= TIN TỨC & BIÊN TẬP ================= */}
      <section className="container my-5 pt-4 border-top border-secondary">
        <h4 className="text-uppercase text-center fw-black tracking-widest mb-5 fs-4">TIN TỨC & BIÊN TẬP</h4>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="mb-3 overflow-hidden bg-dark" style={{ height: "180px" }}>
              <img src="/img/news-1.jpg" className="w-100 h-100 object-fit-cover opacity-50" alt="News" />
            </div>
            <h6 className="fw-bold text-uppercase">Nghệ thuật chế tác giày thủ công</h6>
            <p className="small text-secondary">Từng đường kim mũi chỉ tạo nên giá trị độc bản bền bỉ cùng thời gian thực tế.</p>
          </div>
          <div className="col-md-4">
            <div className="mb-3 overflow-hidden bg-dark" style={{ height: "180px" }}>
              <img src="/img/news-2.jpg" className="w-100 h-100 object-fit-cover opacity-50" alt="News" />
            </div>
            <h6 className="fw-bold text-uppercase">Xu hướng Techwear 2026</h6>
            <p className="small text-secondary">Khám phá phong cách đường phố tối giản kết hợp công nghệ tối tân nhất.</p>
          </div>
          <div className="col-md-4">
            <div className="mb-3 overflow-hidden bg-dark" style={{ height: "180px" }}>
              <img src="/img/news-3.jpg" className="w-100 h-100 object-fit-cover opacity-50" alt="News" />
            </div>
            <h6 className="fw-bold text-uppercase">Đế giày cấu trúc tương lai</h6>
            <p className="small text-secondary">Công nghệ phản hồi lực tiên tiến bảo vệ đôi chân trên mọi bề mặt địa hình.</p>
          </div>
        </div>
      </section>

      {/* ================= TRẢI NGHIỆM TRỰC TIẾP (MAP AREA) ================= */}
      <section className="bg-dark py-5 my-5">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-md-5">
              <h4 className="fw-black text-uppercase tracking-wider">TRẢI NGHIỆM TRỰC TIẾP</h4>
              <p className="text-secondary small mt-3">Cửa hàng flagship trưng bày đầy đủ các phiên bản giới hạn độc quyền.</p>
              <p className="m-0 fw-bold">123 Phố Tràng Tiền, Quận Hoàn Kiếm, Hà Nội</p>
              <p className="text-secondary small">Mở cửa: 09:00 AM - 10:00 PM</p>
            </div>
            <div className="col-md-7">
              <div className="bg-black text-secondary d-flex align-items-center justify-content-center border border-secondary" style={{ height: "250px" }}>
                <span className="small text-uppercase tracking-widest">[ Bản đồ Google Maps / Hình ảnh showroom ]</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= BRAND LOGOS ================= */}
      <section className="container my-5 py-4 text-center">
        <div className="row align-items-center justify-content-center g-5 opacity-50 gray-scale-logos">
          <div className="col-4 col-md-2 fw-black tracking-widest fs-5">NIKE</div>
          <div className="col-4 col-md-2 fw-black tracking-widest fs-5">ADIDAS</div>
          <div className="col-4 col-md-2 fw-black tracking-widest fs-5">PUMA</div>
          <div className="col-4 col-md-2 fw-black tracking-widest fs-5">NEW BALANCE</div>
          <div className="col-4 col-md-2 fw-black tracking-widest fs-5">REEBOK</div>
        </div>
      </section>

      {/* ================= ĐÓNG GÓP Ý KIẾN ================= */}
      <section className="container my-5 py-5 text-center border-top border-secondary">
        <h5 className="text-uppercase fw-bold tracking-widest mb-3">ĐÓNG GÓP Ý KIẾN</h5>
        <p className="small text-secondary mb-4">Mọi phản hồi của bạn giúp chúng tôi hoàn thiện chất lượng dịch vụ tốt hơn.</p>
        <div className="d-flex justify-content-center">
          <div className="input-group w-50 min-w-300">
            <input type="email" className="form-control bg-dark text-white border-secondary rounded-0" placeholder="Nhập email của bạn..." />
            <button className="btn btn-light rounded-0 text-uppercase fw-bold px-4" type="button">Gửi</button>
          </div>
        </div>
      </section>

    </main>
  );
}
