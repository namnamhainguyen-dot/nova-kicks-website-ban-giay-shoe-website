"use client";
import { useEffect, useState } from "react";

export default function Order() {
  const [orderList, setOrderList] = useState([]);

  async function fetchOrderList() {
    const res = await fetch("http://localhost:3000/api/orders");
    const data = await res.json();
    setOrderList(data);
  }

  useEffect(() => {
    fetchOrderList();
  }, []);

  const handleConfirm = async (order) => {
    const statusList = {
      "don-moi": "che-bien",
      "che-bien": "cho-giao",
      "cho-giao": "hoan-thanh"
    };

    const res = await fetch(`http://localhost:3000/api/orders/${order._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        status: statusList[order.status]
      })
    });

    const data = await res.json();

    if (data.status === "success") {
      fetchOrderList(); // 🔥 reload lại data
    }
  }; // ✅ ĐÃ ĐÓNG NGOẶC

  const handleCancel = async (order) => {
    const res = await fetch(`http://localhost:3000/api/orders/${order._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        status: "da-huy"
      })
    });

    const data = await res.json();

    if (data.status === "success") {
      await fetchOrderList(); // 🔥 reload lại data
    }
  };

  return (
    <main className="container-fluid mt-5 pt-5">
      <h3 className="text-center mb-4">Danh sách đơn hàng tại quầy</h3>

      <div className="table-responsive">
        <table className="table table-bordered align-middle">
          <thead className="table-dark">
            <tr>
              <th>Mã đơn</th>
              <th>Bàn/Khách</th>
              <th>Sản phẩm</th>
              <th>Thời gian gọi</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>
            {orderList.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.table_info?.name || "Không xác định"}</td>

                <td>
                  {order.order_items?.map((item) => (
                    <div key={item._id}>
                      {item.name} x{item.quantity}
                    </div>
                  ))}
                </td>

                <td>{new Date(order.created_at).toLocaleString()}</td>

                <td>
                  {
                    order.status === "don-moi" ? (
                      <span className="badge text-bg-primary">Đơn mới</span>
                    ) : order.status === "che-bien" ? (
                      <span className="badge text-bg-warning">Đang chế biến</span>
                    ) : order.status === "cho-giao" ? (
                      <span className="badge text-bg-info">Chờ giao</span>
                    ) : order.status === "hoan-thanh" ? (
                      <span className="badge text-bg-success">Hoàn thành</span>
                    ) : (
                      <span className="badge text-bg-danger">Đã huỷ</span>
                    )
                  }
                </td>

               <td>
                  {
                    order.status !== "hoan-thanh" && order.status !== "da-huy" ? (
                      <>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleConfirm(order)}
                        >
                          Xác nhận
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleCancel(order)}
                        >
                          Hủy
                        </button>
                      </>
                    ) : (
                      ""
                    )
                  }
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </main>
  );
}