'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useContext, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CartContext } from "@/components/CartContext";

export default function ProductDetailPage() {
    const { cart, setCart } = useContext(CartContext);
    const params = useParams();
    const router = useRouter();
    const id = params?.id;

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [addedToCart, setAddedToCart] = useState(false);
    
    // Auth State
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Product Variant State
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [hoveredColor, setHoveredColor] = useState(null);
    const [isImageChanging, setIsImageChanging] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [currentImage, setCurrentImage] = useState('');
    const [stockAvailable, setStockAvailable] = useState(0);

    // Reviews State
    const [reviews, setReviews] = useState([]);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    // Lấy thông tin User từ localStorage an toàn
    useEffect(() => {
        try {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                const user = JSON.parse(savedUser);
                setCurrentUser(user);
                if (user?.role === 'admin') setIsAdmin(true);
            }
        } catch (e) {
            console.error("Lỗi đọc user từ localStorage:", e);
        }
    }, []);

    // Fetch dữ liệu sản phẩm & đánh giá
    useEffect(() => {
        if (!id) return;

        let isMounted = true;
        setLoading(true);

        const fetchProductData = async () => {
            try {
                const [resProduct, resReviews] = await Promise.all([
                    fetch(`/api/products/${id}`, { cache: 'no-store' }),
                    fetch(`/api/products/${id}/reviews`, { cache: 'no-store' })
                ]);

                if (!resProduct.ok) throw new Error("Không thể tải sản phẩm");

                const productData = await resProduct.json();
                const reviewsData = resReviews.ok ? await resReviews.json() : [];

                if (isMounted) {
                    setProduct(productData);
                    setReviews(reviewsData);
                    setCurrentImage(productData.image || '/placeholder.png');

                    if (productData.variants && productData.variants.length > 0) {
                        const firstVariant = productData.variants[0];
                        setSelectedColor(firstVariant.color || '');
                        setStockAvailable(firstVariant.quantity ?? 0);
                        if (firstVariant.image) setCurrentImage(firstVariant.image);
                        if (firstVariant.sizes?.length > 0) setSelectedSize(firstVariant.sizes[0]);
                    } else {
                        setStockAvailable(productData.quantity ?? 0);
                        if (productData.sizes?.length > 0) setSelectedSize(productData.sizes[0]);
                    }
                }
            } catch (err) {
                console.error("Lỗi tải chi tiết sản phẩm:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchProductData();

        return () => { isMounted = false; };
    }, [id]);

    // Đổi ảnh mượt
    const changeImageSmoothly = useCallback((newImageSrc) => {
        if (!newImageSrc || newImageSrc === currentImage) return;
        setIsImageChanging(true);
        setTimeout(() => {
            setCurrentImage(newImageSrc);
            setIsImageChanging(false);
        }, 150);
    }, [currentImage]);

    const handleColorHover = (color) => {
        setHoveredColor(color);
        const matchedVariant = product?.variants?.find(v => v.color === color);
        const targetImage = matchedVariant?.image || product?.image;
        changeImageSmoothly(targetImage);
    };

    const handleColorMouseLeave = () => {
        setHoveredColor(null);
        const matchedVariant = product?.variants?.find(v => v.color === selectedColor);
        const targetImage = matchedVariant?.image || product?.image;
        changeImageSmoothly(targetImage);
    };

    const handleColorChange = (color) => {
        setSelectedColor(color);
        setQuantity(1); 

        const matchedVariant = product?.variants?.find(v => v.color === color);
        if (matchedVariant) {
            const targetImage = matchedVariant.image || product?.image || '/placeholder.png';
            changeImageSmoothly(targetImage);
            setStockAvailable(matchedVariant.quantity ?? 0);
            
            if (matchedVariant.sizes?.length > 0) {
                if (!matchedVariant.sizes.includes(selectedSize)) {
                    setSelectedSize(matchedVariant.sizes[0]);
                }
            } else {
                setSelectedSize('');
            }
        }
    };

    const availableSizes = useMemo(() => {
        return product?.variants?.find(v => v.color === selectedColor)?.sizes || product?.sizes || [];
    }, [product, selectedColor]);

    const handleIncreaseQuantity = () => {
        if (quantity < stockAvailable) setQuantity(prev => prev + 1);
    };

    const handleDecreaseQuantity = () => {
        if (quantity > 1) setQuantity(prev => prev - 1);
    };

    const handleQuantityChange = (e) => {
        const value = e.target.value;
        if (value === '') {
            setQuantity('');
            return;
        }
        const parsed = parseInt(value, 10);
        if (!isNaN(parsed)) {
            setQuantity(parsed > stockAvailable ? stockAvailable : parsed);
        }
    };

    const handleQuantityBlur = () => {
        if (quantity === '' || quantity < 1) {
            setQuantity(1);
        } else if (quantity > stockAvailable) {
            setQuantity(stockAvailable);
        }
    };

    const handleAddToCart = () => {
        if (stockAvailable <= 0 || isAdmin) return; 
        const buyQuantity = typeof quantity === 'number' && quantity >= 1 ? quantity : 1;

        const newCart = [...cart];
        const existingIndex = cart.findIndex(
            (item) =>
                item._id === product._id &&
                item.selectedSize === selectedSize &&
                item.selectedColor === selectedColor
        );

        if (existingIndex !== -1) {
            newCart[existingIndex].quantity += buyQuantity;
        } else {
            newCart.push({
                _id: product._id,
                name: product.name,
                price: product.price,
                image: currentImage, 
                selectedSize,
                selectedColor,
                quantity: buyQuantity,
                categoryID: product.categoryID || '',
            });
        }

        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        window.dispatchEvent(new Event('cartUpdated'));

        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const handleBuyNow = () => {
        if (stockAvailable <= 0 || isAdmin) return;
        handleAddToCart();
        router.push('/cart');
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !currentUser) return;

        setSubmittingReview(true);
        try {
            const res = await fetch(`/api/products/${id}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rating: newRating,
                    comment: newComment.trim(),
                    userName: currentUser?.name || currentUser?.email?.split('@')[0] || 'Khách hàng',
                }),
            });

            if (res.ok) {
                const addedReview = await res.json();
                setReviews(prev => [addedReview, ...prev]);
                setNewComment('');
                setNewRating(5);
            } else {
                alert('Có lỗi xảy ra khi gửi bình luận.');
            }
        } catch (err) {
            console.error("Lỗi gửi bình luận:", err);
        } finally {
            setSubmittingReview(false);
        }
    };

    const averageRating = useMemo(() => {
        if (!reviews || reviews.length === 0) return "5.0";
        return (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1);
    }, [reviews]);

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', border: '3px solid #e5e7eb', borderTop: '3px solid #111827', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ color: '#6b7280', fontWeight: '500' }}>Đang tải sản phẩm...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!product) {
        return (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>
                    Không tìm thấy sản phẩm hoặc sản phẩm đã bị xóa!
                </h2>
                <Link href="/products" style={{ color: '#2563eb', marginTop: '12px', display: 'inline-block' }}>
                    ← Quay lại danh sách sản phẩm
                </Link>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '40px 20px', fontFamily: 'sans-serif' }}>
            <nav style={{ marginBottom: '28px', fontSize: '13px', color: '#6b7280' }}>
                <Link href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Trang chủ</Link>
                <span style={{ margin: '0 8px' }}>›</span>
                <Link href="/products" style={{ color: '#6b7280', textDecoration: 'none' }}>Sản phẩm</Link>
                <span style={{ margin: '0 8px' }}>›</span>
                <span style={{ color: '#111827', fontWeight: '500' }}>{product.name}</span>
            </nav>

            <div style={{ display: 'flex', gap: '50px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                {/* Khung Ảnh Sản Phẩm */}
                <div style={{ flex: '1 1 45%', minWidth: '300px', position: 'sticky', top: '20px' }}>
                    <div style={{
                        width: '100%', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e5e7eb',
                        backgroundColor: '#f9fafb', position: 'relative', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
                    }}>
                        <img
                            src={currentImage}
                            alt={product.name}
                            style={{
                                width: '100%', height: 'auto', display: 'block', objectFit: 'cover',
                                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                                opacity: isImageChanging ? 0.3 : 1,
                                transform: isImageChanging ? 'scale(0.97)' : (hoveredColor ? 'scale(1.02)' : 'scale(1)'),
                            }}
                        />

                        {hoveredColor && hoveredColor !== selectedColor && (
                            <div style={{
                                position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
                                backgroundColor: 'rgba(17, 24, 39, 0.85)', color: '#fff', padding: '6px 14px',
                                borderRadius: '20px', fontSize: '12px', fontWeight: '500', backdropFilter: 'blur(4px)',
                                pointerEvents: 'none', animation: 'fadeIn 0.2s ease',
                            }}>
                                👀 Xem trước: <span style={{ fontWeight: '700' }}>{hoveredColor}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Thông tin Chi tiết */}
                <div style={{ flex: '1 1 50%', minWidth: '300px', display: 'flex', flexDirection: 'column' }}>
                    <h1 style={{
                        fontSize: '28px', fontWeight: '800', color: '#030712', margin: '0 0 10px 0', 
                        textTransform: 'uppercase', fontFamily: 'system-ui, -apple-system, sans-serif',
                    }}>
                        {product.name}
                    </h1>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                        <span style={{ color: '#fbbf24' }}>⭐ {averageRating}</span>
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>({reviews.length} đánh giá)</span>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <p style={{ fontSize: '30px', fontWeight: '900', color: '#e11d48', margin: 0 }}>
                            {product.price?.toLocaleString('vi-VN')}
                            <span style={{ fontSize: '18px', fontWeight: '700' }}> đ</span>
                        </p>
                    </div>

                    {/* Chọn màu sắc */}
                    {product.variants?.length > 0 && (
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', color: '#111827', marginBottom: '12px' }}>
                                Màu sắc: <span style={{ fontWeight: '600', color: hoveredColor ? '#2563eb' : '#111827', transition: 'color 0.2s' }}>
                                    {hoveredColor || selectedColor}
                                </span>
                                <span style={{ fontSize: '13px', fontWeight: '500', color: stockAvailable > 0 ? '#16a34a' : '#dc2626', marginLeft: '8px', textTransform: 'none' }}>
                                    ({stockAvailable > 0 ? `Còn ${stockAvailable} sản phẩm` : 'Hết hàng'})
                                </span>
                            </h3>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                {product.variants.map((v) => {
                                    const isSelected = selectedColor === v.color;
                                    const isHovered = hoveredColor === v.color;

                                    return (
                                        <button
                                            key={v.color}
                                            onClick={() => handleColorChange(v.color)}
                                            onMouseEnter={() => handleColorHover(v.color)}
                                            onMouseLeave={handleColorMouseLeave}
                                            style={{
                                                padding: '9px 18px', fontSize: '14px', fontWeight: '600', borderRadius: '12px',
                                                cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                                border: isSelected ? '2px solid #111827' : isHovered ? '2px solid #2563eb' : '1.5px solid #e5e7eb',
                                                backgroundColor: isSelected ? '#111827' : '#ffffff',
                                                color: isSelected ? '#ffffff' : isHovered ? '#2563eb' : '#374151',
                                                transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                                                boxShadow: isHovered ? '0 6px 12px -2px rgba(37, 99, 235, 0.25)' : isSelected ? '0 4px 10px rgba(0,0,0,0.15)' : 'none',
                                            }}
                                        >
                                            {v.color} 
                                            <span style={{ fontSize: '11px', marginLeft: '4px', opacity: isSelected ? 0.8 : 0.6 }}>
                                                ({v.quantity})
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Kích thước */}
                    {availableSizes.length > 0 && (
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', color: '#111827', marginBottom: '10px' }}>
                                Kích thước: <span style={{ fontWeight: '400', color: '#6b7280' }}>{selectedSize}</span>
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {availableSizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        style={{
                                            minWidth: '44px', height: '44px', padding: '0 10px',
                                            fontSize: '14px', fontWeight: '600',
                                            border: selectedSize === size ? '2px solid #000' : '1px solid #e5e7eb',
                                            borderRadius: '12px', cursor: 'pointer',
                                            backgroundColor: selectedSize === size ? '#000' : '#fff',
                                            color: selectedSize === size ? '#fff' : '#374151',
                                            transition: 'all 0.2s ease',
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
                        <h3 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', color: '#111827', marginBottom: '10px' }}>
                            Số lượng
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <div style={{
                                display: 'flex', alignItems: 'center',
                                border: '1.5px solid #e5e7eb', borderRadius: '12px',
                                backgroundColor: '#f9fafb', padding: '3px', width: '130px', overflow: 'hidden',
                            }}>
                                <button 
                                    type="button"
                                    onClick={handleDecreaseQuantity}
                                    disabled={quantity <= 1 || stockAvailable <= 0}
                                    style={{
                                        width: '36px', height: '36px', border: 'none', background: 'none',
                                        fontSize: '16px', fontWeight: 'bold',
                                        cursor: (quantity <= 1 || stockAvailable <= 0) ? 'not-allowed' : 'pointer',
                                        color: (quantity <= 1 || stockAvailable <= 0) ? '#d1d5db' : '#111827',
                                        borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}
                                >
                                    −
                                </button>

                                <input
                                    type="number"
                                    min="1"
                                    max={stockAvailable}
                                    value={quantity}
                                    onChange={handleQuantityChange}
                                    onBlur={handleQuantityBlur}
                                    disabled={stockAvailable <= 0}
                                    style={{
                                        width: '100%', border: 'none', background: 'transparent',
                                        textAlign: 'center', fontWeight: '700', fontSize: '15px', color: '#111827', outline: 'none',
                                    }}
                                />

                                <button 
                                    type="button"
                                    onClick={handleIncreaseQuantity}
                                    disabled={quantity >= stockAvailable || stockAvailable <= 0}
                                    style={{
                                        width: '36px', height: '36px', border: 'none', background: 'none',
                                        fontSize: '16px', fontWeight: 'bold',
                                        cursor: (quantity >= stockAvailable || stockAvailable <= 0) ? 'not-allowed' : 'pointer',
                                        color: (quantity >= stockAvailable || stockAvailable <= 0) ? '#d1d5db' : '#111827',
                                        borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}
                                >
                                    +
                                </button>
                            </div>

                            {quantity >= stockAvailable && stockAvailable > 0 && (
                                <span style={{ fontSize: '12px', color: '#ea580c', fontWeight: '500' }}>
                                    Đã đạt số lượng tối đa trong kho
                                </span>
                            )}
                        </div>
                    </div>

                    {addedToCart && (
                        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', borderRadius: '10px', padding: '10px 16px', marginBottom: '16px', fontSize: '14px', fontWeight: '500' }}>
                            ✅ Đã thêm vào giỏ hàng!
                        </div>
                    )}

                    {/* Nút thao tác */}
                    <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
                        <button
                            onClick={handleAddToCart}
                            disabled={isAdmin || stockAvailable <= 0}
                            style={{
                                flex: 1, backgroundColor: (isAdmin || stockAvailable <= 0) ? '#e5e7eb' : '#fff',
                                border: (isAdmin || stockAvailable <= 0) ? '1.5px solid #d1d5db' : '1.5px solid #111827', 
                                color: (isAdmin || stockAvailable <= 0) ? '#9ca3af' : '#111827',
                                fontWeight: '600', padding: '13px 0', borderRadius: '12px',
                                cursor: (isAdmin || stockAvailable <= 0) ? 'not-allowed' : 'pointer',
                                fontSize: '14px', transition: 'all 0.2s',
                            }}
                        >
                            {stockAvailable <= 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
                        </button>
                        <button
                            onClick={handleBuyNow}
                            disabled={isAdmin || stockAvailable <= 0}
                            style={{
                                flex: 1, backgroundColor: (isAdmin || stockAvailable <= 0) ? '#d1d5db' : '#111827',
                                border: 'none', color: '#fff', fontWeight: '600', padding: '13px 0',
                                borderRadius: '12px', cursor: (isAdmin || stockAvailable <= 0) ? 'not-allowed' : 'pointer',
                                fontSize: '14px', transition: 'all 0.2s',
                            }}
                        >
                            {isAdmin ? 'Admin không thể mua' : stockAvailable <= 0 ? 'Tạm hết hàng' : 'Mua ngay'}
                        </button>
                    </div>

                    <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f3f4f6' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#030712', marginBottom: '10px' }}>Mô tả sản phẩm</h3>
                        <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: '1.8', whiteSpace: 'pre-line', margin: 0 }}>
                            {product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* KHU VỰC ĐÁNH GIÁ VÀ BÌNH LUẬN */}
            <div style={{ marginTop: '60px', paddingTop: '40px', borderTop: '1px solid #e5e7eb' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', marginBottom: '24px' }}>
                    Đánh giá & Bình luận ({reviews.length})
                </h2>

                {/* Form gửi bình luận */}
                <form onSubmit={handleReviewSubmit} style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', marginBottom: '40px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                        Viết đánh giá của bạn
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>Đánh giá:</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setNewRating(star)}
                                    style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: 0 }}
                                >
                                    {star <= newRating ? '⭐' : '☆'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <textarea
                        rows={4}
                        placeholder={currentUser ? "Chia sẻ cảm nhận của bạn về sản phẩm này..." : "Vui lòng đăng nhập để để lại đánh giá..."}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={!currentUser || submittingReview}
                        style={{
                            width: '100%', padding: '12px 16px', borderRadius: '10px',
                            border: '1px solid #d1d5db', fontSize: '14px', outline: 'none',
                            fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box',
                            backgroundColor: !currentUser ? '#f3f4f6' : '#fff'
                        }}
                    />

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                        <button
                            type="submit"
                            disabled={!currentUser || submittingReview || !newComment.trim()}
                            style={{
                                backgroundColor: (!currentUser || !newComment.trim()) ? '#9ca3af' : '#111827',
                                color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px',
                                fontWeight: '600', fontSize: '14px', cursor: (!currentUser || !newComment.trim()) ? 'not-allowed' : 'pointer',
                                transition: 'background-color 0.2s',
                            }}
                        >
                            {submittingReview ? 'Đang gửi...' : 'Gửi bình luận'}
                        </button>
                    </div>
                </form>

                {/* Danh sách bình luận */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {reviews.length === 0 ? (
                        <p style={{ color: '#6b7280', fontSize: '14px', fontStyle: 'italic' }}>
                            Chưa có bình luận nào cho sản phẩm này. Hãy là người đầu tiên đánh giá!
                        </p>
                    ) : (
                        reviews.map((rev, idx) => (
                            <div key={rev._id || idx} style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{
                                            width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#111827',
                                            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: '700', fontSize: '14px', textTransform: 'uppercase'
                                        }}>
                                            {(rev.userName || 'U')[0]}
                                        </div>
                                        <div>
                                            <span style={{ fontWeight: '700', fontSize: '14px', color: '#111827', display: 'block' }}>
                                                {rev.userName || 'Khách hàng'}
                                            </span>
                                            <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                                                {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('vi-VN') : 'Mới đây'}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ fontSize: '14px', color: '#fbbf24' }}>
                                        {'⭐'.repeat(rev.rating || 5)}
                                    </div>
                                </div>

                                <p style={{ color: '#374151', fontSize: '14px', lineHeight: '1.6', margin: '8px 0 0 46px' }}>
                                    {rev.comment}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <style>{`
                input[type=number]::-webkit-inner-spin-button, 
                input[type=number]::-webkit-outer-spin-button { 
                    -webkit-appearance: none; 
                    margin: 0; 
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translate(-50%, 6px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }
            `}</style>
        </div>
    );
}