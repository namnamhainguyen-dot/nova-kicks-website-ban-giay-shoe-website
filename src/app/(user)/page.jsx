import AddToCart from "@/components/AddToCart";

export default async function Menu() {
  // Thêm cache: 'no-store' để đảm bảo lấy dữ liệu mới nhất từ Mongo khi F5
  const res = await fetch('http://localhost:3000/api/products', { cache: 'no-store' });
  const productList = await res.json();

  // Kiểm tra xem productList có thực sự là mảng không để tránh lỗi .map
  const isArray = Array.isArray(productList);

  return (
    <main className="container mt-5 pt-5">
      <h1 className="text-center mb-4">Menu Sản Phẩm</h1>
      <div className="row">
        {isArray ? (
          productList.map((p) => (
            <div key={p._id} className="col-md-3 mb-4">
              <div className="card h-100">
                <img src={`/img/${p.image}`} className="card-img-top" alt={p.name} />
                <div className="card-body">
                  <h5 className="card-title">{p.name}</h5>
                  <p className="card-text">
                    {/* Dùng p.price? để an toàn nếu dữ liệu thiếu */}
                    <strong>{p.price?.toLocaleString('vi-VN')}đ</strong><br />
                    {p.description}
                  </p>
                  <AddToCart product={p}>Thêm giỏ hàng</AddToCart>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center">
            <p className="text-danger fw-bold">Dữ liệu từ Database đang gặp lỗi hoặc không phải định dạng danh sách!</p>
            <p>Vui lòng kiểm tra lại kết nối MongoDB trong file .env.local và API.</p>
          </div>
        )}
      </div>
    </main>
  );
}