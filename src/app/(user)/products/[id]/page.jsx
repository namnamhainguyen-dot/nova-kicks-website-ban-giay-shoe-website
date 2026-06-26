'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useContext } from "react";
import { CartContext } from "@/components/CartContext";

export default function ProductDetailPage() {
    const { cart, setCart } = useContext(CartContext);
    const params = useParams();
    const router = useRouter();
    const id = params.id;

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [addedToCart, setAddedToCart] = useState(false);

    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (!id) return;

        fetch(`/api/products/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setProduct(data);
                setLoading(false);
                setSelectedSize(data.sizes?.[0] ?? '');
                setSelectedColor(data.colors?.[0] ?? '');
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    // ─── Thêm vào giỏ hàng ───────────────────────────────────────────────────
    const handleAddToCart = () => {
        const newCart = [...cart];

        const existingIndex = cart.findIndex(
            (item) =>
                item._id === product._id &&
                item.selectedSize === selectedSize &&
                item.selectedColor === selectedColor
        );

        if (existingIndex !== -1) {
            cart[existingIndex].quantity += quantity;
        } else {
            cart.push({
                _id: product._id,
                name: product.name,
                price: product.price,
                image: product.image,
                selectedSize,
                selectedColor,
                quantity,
                categoryID: product.categoryID || '',
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));

        // Dispatch event để header/cart icon cập nhật số lượng ngay lập tức
        window.dispatchEvent(new Event('cartUpdated'));

        // Hiện thông báo thêm thành công tạm thời
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    // ─── Mua ngay ────────────────────────────────────────────────────────────
    const handleBuyNow = () => {
        handleAddToCart();
        router.push('/cart');
    };

    // ─── Loading ─────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                minHeight: '60vh', gap: '12px',
            }}>
                <div style={{
                    width: '36px', height: '36px',
                    border: '3px solid #e5e7eb',
                    borderTop: '3px solid #111827',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }} />
                <p style={{ color: '#6b7280', fontWeight: '500' }}>Đang tải sản phẩm...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!product) {
        return (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>
                    Không tìm thấy sản phẩm!
                </h2>
                <Link href="/products" style={{ color: '#2563eb', marginTop: '12px', display: 'inline-block' }}>
                    ← Quay lại danh sách sản phẩm
                </Link>
            </div>
        );
    }

    return (
        <div style={{
            width: '100%', maxWidth: '1280px',
            margin: '0 auto', padding: '40px 20px',
            fontFamily: 'sans-serif',
        }}>

            {/* Breadcrumb */}
            <nav style={{ marginBottom: '28px', fontSize: '13px', color: '#6b7280' }}>
                <Link href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Trang chủ</Link>
                <span style={{ margin: '0 8px' }}>›</span>
                <Link href="/products" style={{ color: '#6b7280', textDecoration: 'none' }}>Sản phẩm</Link>
                <span style={{ margin: '0 8px' }}>›</span>
                <span style={{ color: '#111827', fontWeight: '500' }}>{product.name}</span>
            </nav>

            {/* Layout 2 cột */}
            <div style={{ display: 'flex', gap: '50px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

                {/* ── CỘT TRÁI: Ảnh sản phẩm ── */}
                <div style={{ flex: '1 1 45%', minWidth: '300px' }}>
                    <div style={{
                        width: '100%', borderRadius: '16px',
                        overflow: 'hidden', border: '1px solid #e5e7eb',
                        backgroundColor: '#f9fafb',
                    }}>
                        <img
                            src={product.image || '/placeholder.png'}
                            alt={product.name}
                            style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
                        />
                    </div>
                </div>

                {/* ── CỘT PHẢI: Thông tin chi tiết ── */}
                <div style={{ flex: '1 1 50%', minWidth: '300px', display: 'flex', flexDirection: 'column' }}>

                    {/* Tên sản phẩm */}
                    <h1 style={{
                        fontSize: '28px', fontWeight: '800', color: '#030712',
                        margin: '0 0 10px 0', textTransform: 'uppercase',
                    }}>
                        {product.name}
                    </h1>

                    {/* Đánh giá */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                        <span style={{ color: '#fbbf24' }}>⭐⭐⭐⭐⭐</span>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>(125 đánh giá)</span>
                    </div>

                    {/* Giá */}
                    <div style={{ marginBottom: '24px' }}>
                        <p style={{ fontSize: '30px', fontWeight: '900', color: '#e11d48', margin: 0 }}>
                            {product.price?.toLocaleString('vi-VN')}
                            <span style={{ fontSize: '18px', fontWeight: '700' }}> đ</span>
                        </p>
                    </div>

                    {/* Màu sắc */}
                    {product.colors?.length > 0 && (
                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={{
                                fontSize: '14px', fontWeight: '700',
                                textTransform: 'uppercase', color: '#111827', marginBottom: '10px',
                            }}>
                                Màu sắc:{' '}
                                <span style={{ fontWeight: '400', color: '#6b7280' }}>{selectedColor}</span>
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {product.colors.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setSelectedColor(color)}
                                        style={{
                                            padding: '8px 16px', fontSize: '14px', fontWeight: '500',
                                            border: selectedColor === color ? '2px solid #000' : '1px solid #e5e7eb',
                                            borderRadius: '12px', cursor: 'pointer', transition: '0.2s',
                                            backgroundColor: selectedColor === color ? '#000' : '#fff',
                                            color: selectedColor === color ? '#fff' : '#374151',
                                        }}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Kích thước */}
                    {product.sizes?.length > 0 && (
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{
                                fontSize: '14px', fontWeight: '700',
                                textTransform: 'uppercase', color: '#111827', marginBottom: '10px',
                            }}>
                                Kích thước:{' '}
                                <span style={{ fontWeight: '400', color: '#6b7280' }}>{selectedSize}</span>
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {product.sizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        style={{
                                            minWidth: '44px', height: '44px', padding: '0 10px',
                                            fontSize: '14px', fontWeight: '600',
                                            border: selectedSize === size ? '2px solid #000' : '1px solid #e5e7eb',
                                            borderRadius: '12px', cursor: 'pointer', transition: '0.2s',
                                            backgroundColor: selectedSize === size ? '#000' : '#fff',
                                            color: selectedSize === size ? '#fff' : '#374151',
                                        }}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Số lượng */}
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{
                            fontSize: '14px', fontWeight: '700',
                            textTransform: 'uppercase', color: '#111827', marginBottom: '10px',
                        }}>
                            Số lượng
                        </h3>
                        <div style={{
                            display: 'flex', alignItems: 'center', width: '112px',
                            border: '1px solid #e5e7eb', borderRadius: '12px',
                            backgroundColor: '#f9fafb', padding: '2px',
                        }}>
                            <button
                                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                                style={{
                                    width: '36px', height: '36px', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                    border: 'none', background: 'none',
                                    fontWeight: 'bold', cursor: quantity > 1 ? 'pointer' : 'not-allowed',
                                    color: quantity > 1 ? '#111827' : '#d1d5db', fontSize: '18px',
                                }}
                            >
                                −
                            </button>
                            <span style={{
                                flex: 1, textAlign: 'center',
                                fontWeight: '600', fontSize: '14px',
                                color: '#111827', userSelect: 'none',
                            }}>
                                {quantity}
                            </span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                style={{
                                    width: '36px', height: '36px', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                    border: 'none', background: 'none',
                                    fontWeight: 'bold', cursor: 'pointer',
                                    color: '#111827', fontSize: '18px',
                                }}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Thông báo thêm giỏ thành công */}
                    {addedToCart && (
                        <div style={{
                            backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0',
                            color: '#15803d', borderRadius: '10px',
                            padding: '10px 16px', marginBottom: '16px',
                            fontSize: '14px', fontWeight: '500',
                            display: 'flex', alignItems: 'center', gap: '8px',
                        }}>
                            ✅ Đã thêm vào giỏ hàng!
                        </div>
                    )}

                    {/* Nút hành động */}
                    <div style={{
                        display: 'flex', gap: '12px',
                        borderTop: '1px solid #f3f4f6', paddingTop: '16px',
                    }}>
                        <button
                            onClick={handleAddToCart}
                            style={{
                                flex: 1, backgroundColor: '#fff',
                                border: '1.5px solid #111827', color: '#111827',
                                fontWeight: '600', padding: '13px 0',
                                borderRadius: '12px', cursor: 'pointer',
                                fontSize: '14px', transition: '0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                        >
                            Thêm vào giỏ hàng
                        </button>
                        <button
                            onClick={handleBuyNow}
                            style={{
                                flex: 1, backgroundColor: '#111827',
                                border: 'none', color: '#fff',
                                fontWeight: '600', padding: '13px 0',
                                borderRadius: '12px', cursor: 'pointer',
                                fontSize: '14px', transition: '0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#111827'}
                        >
                            Mua ngay
                        </button>
                    </div>

                    {/* Mô tả sản phẩm */}
                    <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f3f4f6' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#030712', marginBottom: '10px' }}>
                            Mô tả sản phẩm
                        </h3>
                        <p style={{
                            color: '#4b5563', fontSize: '14px',
                            lineHeight: '1.8', whiteSpace: 'pre-line', margin: 0,
                        }}>
                            {product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
