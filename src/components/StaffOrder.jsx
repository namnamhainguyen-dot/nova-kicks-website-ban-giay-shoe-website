// /src/components/StaffOrder.jsx
"use client";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { CartContext } from "./CartContext";

export default function StaffOrder() {
  const { cart, setCart } = useContext(CartContext);
  const router = useRouter();

  // Tính tổng tiền
  const total = cart.reduce((sum, p) => sum + p.price * p.quantity, 0);

  // Hủy hóa đơn
  const handleRemoveAll = () => {
    setCart([]); 
    // Không cần gọi localStorage trực tiếp ở đây,
    // vì CartProvider đã có useEffect để tự động đồng bộ cart -> localStorage
  };

  // Thanh toán
  const handleOrder = async () => {
    const order = {
      name: "Tên Khách",
      order_items: cart,
      total,
    };

    try {
      const res = await fetch("http://localhost:3000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
      const result = await res.json();

      if (result.code === "success") {
        handleRemoveAll();
        router.push("/success");
      } else {
        alert("Có lỗi xảy ra khi thêm đơn hàng!");
      }
    } catch (err) {
      console.error(err);
      alert("Không thể kết nối tới server!");
    }
  };

  return (
    <div>
      <table className="table table-sm">
        <thead>
          <tr>
            <th>Món</th>
            <th>SL</th>
            <th>Giá</th>
            <th>Tổng</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((p) => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>{p.quantity}</td>
              <td>{p.price.toLocaleString("vi-VN")}đ</td>
              <td>{(p.quantity * p.price).toLocaleString("vi-VN")}đ</td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr />
      <h5 className="text-end">
        Tổng cộng: {total.toLocaleString("vi-VN")}đ
      </h5>
      <div className="d-flex mt-3 justify-content-between">
        <button className="btn btn-outline-danger" onClick={handleRemoveAll}>
          Hủy hóa đơn
        </button>
        <button className="btn btn-success w-50" onClick={handleOrder}>
          Thanh toán
        </button>
      </div>
    </div>
  );
}