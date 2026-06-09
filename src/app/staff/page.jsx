"use client";
import AddToCart from "@/components/AddToCart";
import StaffOrder from "@/components/StaffOrder";
import { useEffect, useState } from "react";

export default function Pos() {
  const [productList, setProductList] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 4;

  // FILTER (Giữ nguyên logic cũ)
  const filteredProductList = productList.filter(
    (p) =>
      p.name.toLowerCase().includes(keyword.toLowerCase()) ||
      p._id.toLowerCase().includes(keyword.toLowerCase())
  );

  // PAGINATION (Giữ nguyên logic cũ)
  const totalPages = Math.ceil(filteredProductList.length / itemsPerPage);
  const currentItems = filteredProductList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // FETCH API (Giữ nguyên logic cũ)
  useEffect(() => {
    const fetchProductList = async () => {
      const res = await fetch("http:///api/products");
      const data = await res.json();
      setProductList(data);
    };
    fetchProductList();
  }, []);

  return (
    <main className="bg-black text-white min-vh-100" style={{ paddingTop: "56px" }}>
      
      {/* 1. HERO BANNER SECTION (Theo hình ảnh) */}
      <section className="position-relative bg-dark text-white d-flex align-items-center justify-content-center text-center" style={{ height: "70vh", backgroundImage: "url('/img/hero-banner.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="position-absolute w-100 h-100 bg-black opacity-50"></div>
        <div className="position-relative z-3 px-3">
          <h1 className="display-4 fw-black text-uppercase tracking-wider mb-3">THIẾT KẾ CHUYÊN DỤNG<br/>CHO ĐƯỜNG PHỐ</h1>
          <button className="btn btn-outline-light px-4 py-2 text-uppercase fw-bold rounded-0">Khám phá ngay</button>
        </div>
      </section>

      {/* 2. CATEGORIES BANNER MINI */}
      <section className="container my-5">
        <div className="row g-4">
          <div className="col-md-6">
            <div className="bg-secondary position-relative text-white p-5 d-flex align-items-end" style={{ height: "200px", backgroundImage: "url('/img/new-arrivals.jpg')", backgroundSize: "cover" }}>
              <h4 className="fw-bold m-0 text-uppercase tracking-wide text-shadow">New Arrivals</h4>
            </div>
          </div>
          <div className="col-md-6">
            <div className="bg-secondary position-relative text-white p-5 d-flex align-items-end" style={{ height: "200px", backgroundImage: "url('/img/best-sellers.jpg')", backgroundSize: "cover" }}>
              <h4 className="fw-bold m-0 text-uppercase tracking-wide text-shadow">Best Sellers</h4>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER CHO LOGIC CŨ */}
      <div className="container my-5">
        <div className="row g-5">

          {/* LEFT CONTENT: DANH SÁCH GIÀY & BỘ LỌC */}
          <div className="col-lg-8">

            {/* BỘ LỌC SEARCH - CHUYỂN SANG TEXT GIÀY */}
            <div className="d-flex flex-column flex-md-row mb-4 justify-content-between align-items-md-center gap-3 border-bottom border-secondary pb-3">
              <h2 className="text-uppercase fw-bold m-0">Hàng mới về</h2>

              <form className="w-100 w-md-50" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="search"
                  className="form-control bg-dark text-white border-secondary rounded-0"
                  placeholder="Tìm kiếm mẫu giày hoặc mã ID..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </form>
            </div>

            {/* PRODUCT LIST GRID - STYLE MINIMALIST ĐEN TRẮNG */}
            <div className="row g-4">
              {currentItems.map((p) => (
                <div key={p._id} className="col-sm-6 col-md-4 col-lg-3">
                  <div className="card h-100 bg-black border-0 rounded-0 text-white group">
                    <div className="overflow-hidden bg-dark position-relative">
                      <img 
                        src={`/img/${p.image}`} 
                        className="card-img-top rounded-0 img-fluid transform transition duration-500 hover-scale" 
                        alt={p.name}
                        style={{ objectFit: "cover", height: "220px" }}
                      />
                    </div>
                    <div className="card-body px-0 pt-3 text-center">
                      <h6 className="card-title fw-bold text-uppercase text-truncate mb-1">{p.name}</h6>
                      <p className="text-danger fw-bold mb-3">{p.price.toLocaleString("vi-VN")} VND</p>
                      <AddToCart product={p}>
                        <span className="btn btn-light w-100 rounded-0 fw-bold btn-sm text-uppercase">Thêm vào hóa đơn</span>
                      </AddToCart>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION STYLE TỐI MÀU */}
            <nav className="d-flex mt-5">
              <ul className="pagination mx-auto">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link bg-dark text-white border-secondary rounded-0"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  >
                    &laquo;
                  </button>
                </li>

                {Array.from({ length: totalPages }, (_, i) => (
                  <li
                    key={i}
                    className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                  >
                    <button 
                      className={`page-link border-secondary rounded-0 ${currentPage === i + 1 ? "bg-white text-black" : "bg-dark text-white"}`} 
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}

                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button 
                    className="page-link bg-dark text-white border-secondary rounded-0" 
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    &raquo;
                  </button>
                </li>
              </ul>
            </nav>

          </div>

          {/* RIGHT CONTENT: HÓA ĐƠN & THÔNG TIN (Dành cho nhân viên quản lý POS) */}
          <div className="col-lg-4 border-start border-secondary">
            
            <div className="d-flex mb-4 justify-content-between align-items-center">
              <h4 className="mb-0 text-uppercase fw-bold text-secondary fs-5">Khách hàng</h4>
              <div className="btn-group rounded-0">
                <div className="btn btn-light btn-sm rounded-0 fw-bold">Khách lẻ</div>
                <div className="btn btn-outline-light btn-sm rounded-0">Thành viên</div>
              </div>
            </div>

            <div className="mb-4">
              <input
                type="search"
                className="form-control bg-dark text-white border-secondary rounded-0"
                placeholder="Nhập tên hoặc số điện thoại..."
              />
            </div>

            <div className="position-sticky" style={{ top: "80px" }}>
              <h4 className="mb-3 text-uppercase fw-bold text-secondary fs-5">Hóa đơn kiểm hàng</h4>
              <div className="card bg-dark border-secondary text-white rounded-0">
                <div className="card-body">
                  <StaffOrder />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 3. SECTION FLASH SALE & TIN TỨC TRONG ẢNH */}
      <section className="bg-dark py-5 border-top border-secondary">
        <div className="container text-center">
          <h3 className="text-uppercase fw-black mb-4 tracking-wider">Tin tức & Biên tập</h3>
          <div className="row g-4 text-start">
            <div className="col-md-4">
              <div className="bg-black p-3 border border-secondary h-100">
                <h6 className="fw-bold text-uppercase text-danger">Xu hướng Techwear 2026</h6>
                <p className="small text-secondary m-0">Khám phá phong cách đường phố tối giản kết hợp công nghệ tối tân.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="bg-black p-3 border border-secondary h-100">
                <h6 className="fw-bold text-uppercase text-danger">Nghệ thuật chế tác thủ công</h6>
                <p className="small text-secondary m-0">Từng đường kim mũi chỉ tạo nên giá trị độc bản bền bỉ cùng thời gian.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="bg-black p-3 border border-secondary h-100">
                <h6 className="fw-bold text-uppercase text-danger">Đế giày cấu trúc tương lai</h6>
                <p className="small text-secondary m-0">Công nghệ phản hồi lực tiên tiến bảo vệ đôi chân trên mọi bề mặt địa hình.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}