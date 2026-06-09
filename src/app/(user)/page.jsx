import AddToCart from "@/components/AddToCart";
import clientPromise from "@/libs/mongodb";

export default async function Menu() {
  let productList = [];
  try {
    const client = await clientPromise;
    const db = client.db();
    productList = await db.collection("products").find({}).toArray();
    productList = JSON.parse(JSON.stringify(productList));
  } catch (e) {
    console.error(e);
  }

  return (
    <main className="bg-black text-white min-vh-100" style={{ paddingTop: "70px" }}>

      <section className="position-relative text-white d-flex align-items-center"
        style={{ height: "80vh", backgroundImage: "url('/img/hero-banner.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-black opacity-50"></div>
        <div className="container position-relative z-3 px-4">
          <div className="col-lg-6">
            <h1 className="display-4 fw-black text-uppercase mb-3" style={{ lineHeight: "1.2" }}>
              THIẾT KẾ CHUYÊN DỤNG<br />CHO ĐƯỜNG PHỐ
            </h1>
          </div>
        </div>
      </section>

      <section className="container my-5">
        <div className="d-flex justify-content-between align-items-center border-bottom border-secondary pb-2 mb-4">
          <h3 className="text-uppercase fw-black m-0 fs-4">HÀNG MỚI VỀ</h3>
        </div>
        <div className="row g-4">
          {productList.length > 0 ? productList.map((p) => (
            <div key={p._id} className="col-sm-6 col-md-4 col-lg-3">
              <div className="card h-100 bg-black border-0 rounded-0 text-white">
                <div className="overflow-hidden bg-dark d-flex align-items-center justify-content-center" style={{ height: "240px" }}>
                  <img src={`/img/${p.image}`} className="card-img-top rounded-0 img-fluid" alt={p.name}
                    style={{ objectFit: "contain", maxHeight: "100%" }} />
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
          )) : (
            <div className="col-12 text-center py-5 border border-secondary bg-dark rounded-0">
              <p className="text-danger fw-bold m-0">Không thể tải sản phẩm. Kiểm tra kết nối MongoDB.</p>
            </div>
          )}
        </div>
      </section>

    </main>
  );
}