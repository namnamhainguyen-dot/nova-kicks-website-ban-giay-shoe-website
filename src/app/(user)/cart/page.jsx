// /src/app/(user)/cart/page.jsx
"use client";
import { CartContext } from "@/components/CartContext";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";

export default function Cart() {
  const { cart, setCart } = useContext(CartContext);
  const [tableList, setTableList] = useState([]);
  const [inputTable, setInputTable] = useState(null);
  const router = useRouter();

  // Lấy danh sách bàn từ API khi mount
  useEffect(() => {
    async function fetchTable() {
      try {
        const res = await fetch("http://localhost:3000/api/tables");
        const tables = await res.json();
        setTableList(tables);
      } catch (err) {
        console.error("Lỗi lấy danh sách bàn:", err);
      }
    }
    fetchTable();
  }, []);

  // Cập nhật số lượng sản phẩm
  const handleQuantity = (id, value) => {
    const newCart = [...cart];
    const index = newCart.findIndex((p) => p._id === id);
    if (index >= 0) {
      newCart[index].quantity = Number(value);
      setCart(newCart);
    }
  };

  // Xóa một sản phẩm
  const handleRemove = (id) => {
    const newCart = cart.filter((p) => p._id !== id);
    setCart(newCart);
  };

  // Xóa toàn bộ giỏ hàng
  const handleRemoveAll = () => {
    setCart([]);
  };

  // Tổng tiền
  const total = cart.reduce((sum, product) => sum + product.price * product.quantity, 0);

  // Thanh toán
  const handleOrder = async () => {
    const order = {
      name: "Tên Khách", // sau này lấy từ thông tin đăng nhập
      table_id: inputTable,
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
    <main className="container mt-5 pt-5">
      <h1 className="text-center mb-4">Giỏ hàng của bạn</h1>
      <div className="table-responsive">
        <table className="table table-bordered align-middle">
          <thead className="table-dark">
            <tr>
              <th>Sản phẩm</th>
              <th>Số lượng</th>
              <th>Giá</th>
              <th>Tổng</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((product) => (
              <tr key={product._id}>
                <td>{product.name}</td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={product.quantity}
                    min="1"
                    onChange={(e) => handleQuantity(product._id, e.target.value)}
                  />
                </td>
                <td>{product.price.toLocaleString("vi-VN")}đ</td>
                <td>{(product.quantity * product.price).toLocaleString("vi-VN")}đ</td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleRemove(product._id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th colSpan={3}>TỔNG TIỀN</th>
              <th>{total.toLocaleString("vi-VN")}đ</th>
              <th>
                <button className="btn btn-danger btn-sm" onClick={handleRemoveAll}>
                  Xóa hết
                </button>
              </th>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="row mt-4">
        <div className="col-md-6 offset-md-6">
          <label htmlFor="tableSelect" className="form-label">
            Chọn vị trí bàn:
          </label>
          <select
            className="form-select"
            id="tableSelect"
            onChange={(e) => setInputTable(e.target.value)}
            defaultValue={-1}
          >
            <option value={-1} disabled>
              -- Vui lòng chọn bàn --
            </option>
            {tableList.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name} ({t.location})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="d-flex justify-content-end mt-3">
        <button className="btn btn-success" onClick={handleOrder}>
          Thanh toán
        </button>
      </div>
    </main>
  );
}