import AddToCart from "@/components/AddToCart";

async function getProducts() {
  const res = await fetch("http://localhost:3000/api/products", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Không thể tải danh sách sản phẩm");
  }

  return res.json();
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main
      className="container py-5"
      style={{ paddingTop: "90px", minHeight: "100vh" }}
    >
      <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
        <h1 className="fw-bold text-uppercase m-0">
          Tất cả sản phẩm
        </h1>
        <span className="text-secondary">
          {products.length} sản phẩm
        </span>
      </div>

      <div className="row g-4">
        {products.map((p) => (
          <div key={p._id} className="col-sm-6 col-md-4 col-lg-3">
            <div
              className="card h-100 border-0 shadow-sm"
              style={{ backgroundColor: "var(--surface-card)" }}
            >
              <div
                className="d-flex align-items-center justify-content-center overflow-hidden"
                style={{
                  height: "250px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <img
                  src={p.image || "/img/no-image.png"}
                  alt={p.name}
                  className="img-fluid"
                  style={{
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>

              <div className="card-body">
                <h5
                  className="fw-bold text-truncate"
                  title={p.name}
                >
                  {p.name}
                </h5>

                <p
                  className="small text-secondary"
                  style={{
                    minHeight: "48px",
                    overflow: "hidden",
                  }}
                >
                  {p.description}
                </p>

                <div className="fw-bold text-danger fs-5 mb-3">
                  {Number(p.price).toLocaleString("vi-VN")} VND
                </div>

                <AddToCart product={p}>
                  <span className="btn btn-dark w-100">
                    Thêm vào giỏ hàng
                  </span>
                </AddToCart>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-5">
          <h4>Chưa có sản phẩm nào</h4>
        </div>
      )}
    </main>
  );
}