"use client";
import AddToCart from "@/components/AddToCart";
import StaffOrder from "@/components/StaffOrder";
import { useEffect, useState } from "react";

export default function Pos() {
  const [productList, setProductList] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 4;

  // FILTER
  const filteredProductList = productList.filter(
    (p) =>
      p.name.toLowerCase().includes(keyword.toLowerCase()) ||
      p._id.toLowerCase().includes(keyword.toLowerCase())
  );

  // PAGINATION
  const totalPages = Math.ceil(filteredProductList.length / itemsPerPage);
  const currentItems = filteredProductList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // FETCH API
  useEffect(() => {
    const fetchProductList = async () => {
      const res = await fetch("http://localhost:3000/api/products");
      const data = await res.json();
      setProductList(data);
    };
    fetchProductList();
  }, []);

  return (
    <main className="container-fluid mt-5 pt-4">
      <div className="row">

        {/* LEFT */}
        <div className="col-sm-6 col-md-8">

          {/* HEADER */}
          <div className="d-flex mb-3 justify-content-between">
            <h3 className="mb-0">Chọn món</h3>

            <form className="w-50" onSubmit={(e) => e.preventDefault()}>
              <input
                type="search"
                className="form-control"
                placeholder="Tìm món theo tên hoặc ID"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </form>
          </div>

          {/* PAGINATION */}
          <nav className="d-flex">
            <ul className="pagination mx-auto">

              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button
                  className="page-link"
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
                  <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                    {i + 1}
                  </button>
                </li>
              ))}

              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
                  &raquo;
                </button>
              </li>

            </ul>
          </nav>

          {/* PRODUCT LIST */}
          <div className="row">
            {currentItems.map((p) => (
              <div key={p._id} className="col-sm-4 col-md-3 mb-3">
                <div className="card h-100">
                  <img src={`/img/${p.image}`} className="card-img-top" />
                  <div className="card-body text-center">
                    <h6 className="card-title">{p.name}</h6>
                    <p>{p.price.toLocaleString("vi-VN")} VND</p>
                    <AddToCart product={p}>Thêm vào hóa đơn</AddToCart>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* RIGHT */}
        <div className="col-sm-6 col-md-4 border-start">

          <div className="d-flex mb-3 justify-content-between">
            <h3 className="mb-0">Khách hàng</h3>
            <div className="btn-group w-50">
              <div className="btn btn-dark w-50">Khách lẻ</div>
              <div className="btn btn-outline-dark w-50">Thành viên</div>
            </div>
          </div>

          <div className="mb-3">
            <input
              type="search"
              className="form-control"
              placeholder="Nhập tên hoặc số điện thoại"
            />
          </div>

          <div className="position-sticky" style={{ top: "20px" }}>
            <h3 className="mb-3">Hóa đơn</h3>
            <div className="card">
              <div className="card-body">
                <StaffOrder />
              </div>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}