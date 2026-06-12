const userData = [
  {
    id: "NK-8821",
    name: "Hải Nam",
    email: "namnamhainguyen@gmail.com",
    role: "ADMIN",
    joined: "Oct 12, 2025",
    status: "Hoạt động",
    avatar: "https://i.pravatar.cc/80?img=32",
  },
  {
    id: "NK-8821",
    name: "Hồng Yến",
    email: "hongyen@gmail.com",
    role: "MEMBER",
    joined: "Dec 20, 2025",
    status: "Hoạt động",
    avatar: "https://i.pravatar.cc/80?img=12",
  },
  {
    id: "NK-8821",
    name: "Quốc Huy",
    email: "lequochuy@gmail.com",
    role: "MEMBER",
    joined: "Nov 15, 2025",
    status: "Bị cấm",
    avatar: "https://i.pravatar.cc/80?img=7",
  },
  {
    id: "NK-8821",
    name: "Thành Danh",
    email: "thanhdanh@gmail.com",
    role: "ADMIN",
    joined: "Oct 26, 2025",
    status: "Hoạt động",
    avatar: "https://i.pravatar.cc/80?img=15",
  },
];

export default function Account() {
  const totalUsers = 2842;
  const activeUsers = 2410;
  const newUsers = 158;
  const bannedUsers = 12;

  return (
    <div className="content admin-users-dashboard">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="display-6 fw-bold">Quản lý người dùng</h1>
          <p className="text-muted mb-0">Theo dõi nhanh số liệu người dùng, trạng thái tài khoản và quản lý quyền truy cập.</p>
        </div>
        <button className="btn btn-dark btn-lg px-4">+ Thêm quản trị viên mới</button>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100 stats-card">
            <div className="card-body">
              <small className="text-uppercase text-muted">Tổng người dùng</small>
              <h3 className="mt-3 mb-2">{totalUsers.toLocaleString()}</h3>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100 stats-card">
            <div className="card-body">
              <small className="text-uppercase text-muted">Thành viên còn hoạt động</small>
              <h3 className="mt-3 mb-2">{activeUsers.toLocaleString()}</h3>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100 stats-card">
            <div className="card-body">
              <small className="text-uppercase text-muted">Người dùng mới trong tháng</small>
              <h3 className="mt-3 mb-2">+{newUsers}</h3>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100 stats-card border-danger-subtle">
            <div className="card-body">
              <small className="text-uppercase text-muted">Người dùng bị cấm</small>
              <h3 className="mt-3 mb-2 text-danger">{bannedUsers}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center px-4 py-3 border-bottom">
            <div>
              <h5 className="mb-0">Hồ sơ người dùng</h5>
            </div>
            <div className="d-flex gap-2 w-100 w-md-auto mt-3 mt-md-0">
              <input type="text" className="form-control search-input" placeholder="Tìm kiếm bằng tên, email hoặc vai trò..." />
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-borderless align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Hồ sơ người dùng</th>
                  <th>EMAIL</th>
                  <th>VAI TRÒ</th>
                  <th>NGÀY GIA NHẬP</th>
                  <th>TRẠNG THÁI</th>
                  <th>HÀNH ĐỘNG</th>
                </tr>
              </thead>
              <tbody>
                {userData.map((user) => (
                  <tr key={user.name} className="align-middle">
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <img src={user.avatar} alt={user.name} className="rounded-circle user-avatar" />
                        <div>
                          <div className="fw-semibold">{user.name}</div>
                          <div className="text-muted small">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-muted">{user.email}</td>
                    <td>
                      <span className={`badge ${user.role === "ADMIN" ? "bg-dark" : "bg-secondary text-white"}`}>{user.role}</span>
                    </td>
                    <td className="text-muted">{user.joined}</td>
                    <td>
                      <span className={`badge ${user.status === "Hoạt động" ? "bg-success" : "bg-danger"}`}>{user.status}</span>
                    </td>
                    <td>
                      <button className="btn btn-outline-secondary btn-sm me-2">✎</button>
                      <button className={`btn btn-outline-${user.status === "Bị cấm" ? "danger" : "secondary"} btn-sm`}>{user.status === "Bị cấm" ? "↺" : "🗑"}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-top text-muted small">
            Hiển thị 1 đến 4 trong 2,842 kết quả
          </div>
        </div>
      </div>
    </div>
  );
}
