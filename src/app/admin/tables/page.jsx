  "use client";
  import { useEffect, useState } from "react";
  export default function Table() {
    const [locations, setLocationsList] = useState([]);
      async function fetchLocations() {
        const res = await fetch('http:///api/tables');
        const data = await res.json();
        setLocationsList(data);
      }
      const [locationName, setLocationName] = useState("");
      const [locationAddress, setLocationAddress] = useState("");
      const [locationId, setLocationId] = useState(null);



      useEffect(() => {
        fetchLocations();
      }, [])


      const handleSubmit = async (e) => {
            e.preventDefault();

            if (!locationId) {
              const newLocation = {
                name: locationName,
                location: locationAddress
              };

              const res = await fetch('http:///api/tables', {
                method: 'POST',
                headers: {
                  "content-type": "application/json"
                },
                body: JSON.stringify(newLocation)
              });

              const result = await res.json();

              if (result.status === "success") {
                fetchLocations();
              }
            } else {
              const updatedLocation = {
                name: locationName,
                location: locationAddress
              };
              const res = await fetch(`http:///api/tables/${locationId}`, {
                method: 'PATCH',
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedTable)
              });
              const result = await res.json();
              if (result.status === "success") {
                await fetchLocations()
                handleReset();

              }

            }
          };
const handleUpdate = (location) => {
        setLocationId(location._id);
        setLocationName(location.name);
        setLocationAddress(location.location);
      }

      const handleReset = () => {
        setLocationId(null);
        setLocationName("");
        setLocationAddress("");
      }



    return (
      <div className="content">
        <div className="row">
          <div className="col-md-8">
            <div className="card shadow mb-4">
              <div className="card-body">
                <h4 className="card-title mb-3">Danh sách cửa hàng</h4>
                <div className="table-responsive">
                  <table className="table table-bordered align-middle">
                    <thead className="table-dark">
                          <tr>
                            <th>STT</th>
                            <th>ID</th>
                            <th>Tên cửa hàng</th>
                            <th>Hành động</th>
                          </tr>
                        </thead>  
                    <tbody>
                      {locations.map((location, index) => (
                        <tr key={location._id}>
                          <td>{index + 1}</td>
                          <td>{location._id}</td>
                          <td>{location.name}</td>
                          <td>
                            <button className="btn btn-warning btn-sm" onClick={(e) => handleUpdate(location)}>Sửa</button>
                            <button className="btn btn-danger btn-sm">Xóa</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow">
              <div className="card-body">
                <h4 className="card-title mb-3">{locationId ? "Sửa" : "Thêm"} cửa hàng</h4>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    {/* 🔥 FIX ở đây */}
                    <label htmlFor="locationName" className="form-label">
                      Tên cửa hàng
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="locationName"
                      placeholder="Ví dụ: Nova Store - Quận 1"
                      required
                      onChange={(e)=>setLocationName(e.target.value)}
                      value={locationName}
                    />
                  </div>
                  <div className="mb-3">
                    {/* 🔥 FIX ở đây */}
                    <label htmlFor="locationAddress" className="form-label">
                      Địa chỉ cửa hàng
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="locationAddress"
                      placeholder="Ví dụ: 123 Nguyễn Huệ, Q.1"
                      required
                      onChange={(e)=>setLocationAddress(e.target.value)}
                      value={locationAddress}
                    />
                  </div>

                  <button type="submit" className="btn btn-dark me-2">
                    Lưu thay đổi
                  </button>
                  <button type="reset" className="btn btn-outline-secondary" onClick={handleReset}>
                    Hủy
                  </button>
                </form>

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
