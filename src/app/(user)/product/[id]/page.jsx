'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProductDetailPage() {
    const params = useParams();
    const id = params.id;

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [quantity, setQuantity] = useState(1);

useEffect(() => {
    if (!id) return;

    fetch(`/api/products/${id}`)
        .then((res) => res.json())
        .then((data) => {
            // TỰ ĐỘNG BÙ DỮ LIỆU MẪU NẾU API TRẢ VỀ BỊ THIẾU
            const chuẩn_hóa_data = {
                ...data,
                // Nếu API chưa có colors, ta tự thêm mảng màu mẫu vào để test giao diện
                colors: data.colors && data.colors.length > 0 ? data.colors : ['Trắng', 'Đen', 'Xanh Dương'],
                // Nếu API chưa có sizes, ta tự thêm mảng size mẫu vào
                sizes: data.sizes && data.sizes.length > 0 ? data.sizes : ['39', '40', '41', '42']
            };

            setProduct(chuẩn_hóa_data);
            setLoading(false);

            // Chọn phần tử đầu tiên làm mặc định
            setSelectedSize(chuẩn_hóa_data.sizes[0] || '');
            setSelectedColor(chuẩn_hóa_data.colors[0] || '');
        })
        .catch((err) => {
            console.error(err);
            setLoading(false);
        });
}, [id]);

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '12px' }}>
                <p style={{ color: '#6b7280', fontWeight: '500' }}>Đang tải sản phẩm...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>Không tìm thấy sản phẩm!</h2>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '40px 20px', fontFamily: 'sans-serif' }}>
            
            {/* ÉP BUỘC CHIA 2 CỘT BẰNG STYLE INLINE THUẦN */}
            <div style={{ display: 'flex', gap: '50px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

                {/* BÊN TRÁI: HÌNH ẢNH SẢN PHẨM (Chiếm 45% chiều rộng) */}
                <div style={{ flex: '1 1 45%', minWidth: '300px' }}>
                    <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                        <img
                            src={product.image || '/placeholder.png'}
                            alt={product.name}
                            style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
                        />
                    </div>
                </div>

                {/* BÊN PHẢI: TOÀN BỘ THÔNG TIN CHI TIẾT (Chiếm 50% chiều rộng) */}
                <div style={{ flex: '1 1 50%', minWidth: '300px', display: 'flex', flexDirection: 'column' }}>
                    
                    {/* Tên sản phẩm */}
                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#030712', margin: '0 0 10px 0', textTransform: 'uppercase' }}>
                        {product.name}
                    </h1>

                    {/* Đánh giá */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                        <span style={{ color: '#fbbf24' }}>⭐⭐⭐⭐⭐</span>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>(125 đánh giá)</span>
                    </div>

                    {/* Giá tiền */}
                    <div style={{ marginBottom: '24px' }}>
                        <p style={{ fontSize: '30px', fontWeight: '900', color: '#e11d48', margin: 0 }}>
                            {product.price?.toLocaleString()} <span style={{ fontSize: '18px', fontWeight: '700' }}>đ</span>
                        </p>
                    </div>

                    {/* Chọn Màu sắc */}
                    {product.colors && product.colors.length > 0 && (
                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', color: '#111827', marginBottom: '10px' }}>
                                Màu sắc: <span style={{ fontWeight: '400', color: '#6b7280' }}>{selectedColor}</span>
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {product.colors.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setSelectedColor(color)}
                                        style={{
                                            padding: '8px 16px', fontSize: '14px', fontWeight: '500', border: '1px solid #e5e7eb', borderRadius: '12px', cursor: 'pointer', transition: '0.2s',
                                            backgroundColor: selectedColor === color ? '#000' : '#fff',
                                            color: selectedColor === color ? '#fff' : '#374151'
                                        }}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Chọn Kích thước */}
                    {product.sizes && product.sizes.length > 0 && (
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', color: '#111827', marginBottom: '10px' }}>
                                Kích thước: <span style={{ fontWeight: '400', color: '#6b7280' }}>{selectedSize}</span>
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {product.sizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        style={{
                                            minWidth: '44px', height: '44px', padding: '0 10px', fontSize: '14px', fontWeight: '600', border: '1px solid #e5e7eb', borderRadius: '12px', cursor: 'pointer', transition: '0.2s',
                                            backgroundColor: selectedSize === size ? '#000' : '#fff',
                                            color: selectedSize === size ? '#fff' : '#374151'
                                        }}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Chọn Số lượng */}
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', color: '#111827', marginBottom: '10px' }}>
                            Số lượng
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', width: '112px', border: '1px solid #e5e7eb', borderRadius: '12px', backgroundColor: '#f9fafb', padding: '2px' }}>
                            <button
                                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                                style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'none', fontWeight: 'bold', cursor: 'pointer', color: '#4b5563' }}
                            >
                                −
                            </button>
                            <span style={{ flex: 1, textAlign: 'center', fontWeight: '600', fontSize: '14px', color: '#111827', userSelect: 'none' }}>
                                {quantity}
                            </span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'none', fontWeight: 'bold', cursor: 'pointer', color: '#4b5563' }}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Các nút bấm Mua hàng */}
                    <div style={{ display: 'flex', gap: '12px', paddingVerical: '16px', borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
                        <button style={{ flex: 1, backgroundColor: '#fff', border: '1px solid #000', color: '#000', fontWeight: '600', padding: '12px 0', borderRadius: '12px', cursor: 'pointer', fontSize: '14px' }}>
                            Thêm vào giỏ hàng
                        </button>
                        <button style={{ flex: 1, backgroundColor: '#000', border: 'none', color: '#fff', fontWeight: '600', padding: '12px 0', borderRadius: '12px', cursor: 'pointer', fontSize: '14px' }}>
                            Mua ngay
                        </button>
                    </div>

                    {/* Phần Mô tả sản phẩm */}
                    <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f3f4f6' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#030712', marginBottom: '10px' }}>
                            Mô tả sản phẩm
                        </h3>
                        <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-line', margin: 0 }}>
                            {product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}
                        </p>
                    </div>

                </div>

            </div>
        </div>
    );
}