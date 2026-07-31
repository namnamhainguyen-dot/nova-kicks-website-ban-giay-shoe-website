import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center px-3" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="text-center">
        <h1 className="display-5 fw-bold mb-3">403</h1>
        <h3 className="fw-bold mb-3">Bạn không có quyền truy cập trang này</h3>
        <p className="text-muted mb-4">Chỉ tài khoản quản trị mới được phép mở khu vực admin.</p>
        <div className="d-flex justify-content-center gap-2">
          <Link href="/" className="btn btn-dark">Về trang chủ</Link>
          <Link href="/login" className="btn btn-outline-dark">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
