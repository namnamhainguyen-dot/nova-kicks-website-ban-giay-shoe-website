"use client";
import { useEffect, useState } from "react";

export default function Table() {
  const [locations, setLocationsList] = useState([]);
  const [locationName, setLocationName] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [locationId, setLocationId] = useState(null);

  // Hàm lấy danh sách cửa hàng
  async function fetchLocations() {
    try {
      const res = await fetch('/api/tables'); // ✅ FIX: Sửa lỗi cú pháp chuỗi hỏng
      if (res.ok) {
        const data = await res.json();
        setLocationsList(data);
      }
    } catch (error) {
      console.error("Lỗi khi fetch locations:", error);
    }
  }

  useEffect(() => {
    fetchLocations();
  }, []);

  // Hàm Xử lý Thêm hoặc Sửa cửa hàng
  const handleSubmit = async (e) => {
    e.preventDefault();

    const locationData = {
      name: locationName,
      location: locationAddress
    };

    try {
      if (!locationId) {
        // ---- CHỨC NĂNG: THÊM MỚI (POST) ----
        const res = await fetch('/api/tables', { // ✅ FIX: Sửa lỗi cú pháp chuỗi
          method: 'POST',
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(locationData)
        });

        const result = await res.json();
        // Kiểm tra linh hoạt cả result.status hoặc res.ok tùy backend của bạn
        if (result.status === "success" || res.ok) {
          fetchLocations();
          handleReset();
        }
      } else {
        // ---- CHỨC NĂNG: CẬP NHẬT (PATCH) ----
        const res = await fetch(`/api/tables/${locationId}`, {
          method: 'PATCH',
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(locationData) // ✅ FIX: Đổi từ updatedTable sang locationData đồng nhất
        });

        const result = await res.json();
        if (result.status === "success" || res.ok) {
          await fetchLocations();
          handleReset();
        }
      }
    } catch (error) {
      console.error("Lỗi khi xử lý biểu mẫu:", error);
    }
  };

  // ---- CHỨC NĂNG: XÓA CỬA HÀNG (DELETE) ----
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa cửa hàng này không?")) {
      try {
        const res = await fetch(`/api/tables/${id}`, {
          method: 'DELETE'
        });
        const result = await res.json();
        if (result.status === "success" || res.ok) {
          fetchLocations();
          if (locationId === id) handleReset(); // Nếu đang sửa mà bị xóa thì reset form
        }
      } catch (error) {
        console.error("Lỗi khi xóa location:", error);
      }
    }
  };

  // Đổ dữ liệu vào form khi bấm nút Sửa
  const handleUpdate = (location) => {
    setLocationId(location._id);
    setLocationName(location.name);
    setLocationAddress(location.location || "");
  };

  // Reset trạng thái form về mặc định
  const handleReset = () => {
    setLocationId(null);
    setLocationName("");
    setLocationAddress("");
  };

  return (
    <div className="content p-4">
      <div className="row">
        
        {/* CỘT TRÁI: DANH SÁCH CỬA HÀNG */}
        <div className="col-md-8">
          <div className="card shadow mb-4">
            <div className="card-body">
              <h4 className="card-title mb-3 fw-bold">Danh sách cửa hàng</h4>
              <div className="table-responsive">
                <table className="table table-bordered align-middle">
                  <thead className="table-dark">
                    <tr>
                      <th style={{ width: "70px" }}>STT</th>
                      <th>ID</th>
                      <th>Tên cửa hàng</th>
                      <th style={{ width: "160px" }}>Hành động</th>
                    </tr>
                  </thead>  
                  <tbody>
                    {locations.length > 0 ? (
                      locations.map((location, index) => (
                        <tr key={location._id}>
                          <td>{index + 1}</td>
                          <td className="small text-muted">{location._id}</td>
                          <td className="fw-semibold">{location.name}</td>
                          <td>
                            <button 
                              className="btn btn-warning btn-sm me-2" 
                              onClick={() => handleUpdate(location)}
                            >
                              Sửa
                            </button>
                            <button 
                              className="btn btn-danger btn-sm" 
                              onClick={() => handleDelete(location._id)} // ✅ ĐÃ THÊM: Kích hoạt nút xóa
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center text-muted py-3">
                          Chưa có cửa hàng nào trong hệ thống.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: FORM THÊM / SỬA */}
        <div className="col-md-4">
          <div className="card shadow">
            <div className="card-body">
              <h4 className="card-title mb-3 fw-bold text-dark">
                {locationId ? "📝 Sửa" : "➕ Thêm"} cửa hàng
              </h4>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="locationName" className="form-label small fw-bold">
                    Tên cửa hàng
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="locationName"
                    placeholder="Ví dụ: Nova Store - Quận 1"
                    required
                    onChange={(e) => setLocationName(e.target.value)}
                    value={locationName}
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="locationAddress" className="form-label small fw-bold">
                    Địa chỉ cửa hàng
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="locationAddress"
                    placeholder="Ví dụ: 123 Nguyễn Huệ, Q.1"
                    required
                    onChange={(e) => setLocationAddress(e.target.value)}
                    value={locationAddress}
                  />
                </div>

                <div className="d-flex pt-2">
                  <button type="submit" className="btn btn-dark me-2 flex-grow-1 fw-semibold">
                    Lưu thay đổi
                  </button>
                  <button type="button" className="btn btn-outline-secondary" onClick={handleReset}>
                    Hủy
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}