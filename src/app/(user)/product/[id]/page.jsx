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
                setProduct(data);
                setLoading(false);

                setSelectedSize(data.sizes?.[0] || '');
                setSelectedColor(data.colors?.[0] || '');
            })
            
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);console.log(JSON.stringify(product, null, 2));

    if (loading)
        return (
            <div className="text-center py-10">
                Đang tải sản phẩm...
            </div>
        );

    if (!product)
        return (
            <div className="text-center py-10">
                Không tìm thấy sản phẩm!
            </div>
        );

    return (
        <div className="max-w-7xl mx-auto px-5 py-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                {/* Hình ảnh */}
                <div>
                    <div className="border rounded-xl overflow-hidden">
                        <img
                            src={product.image || '/placeholder.png'}
                            alt={product.name}
                            className="w-full h-[500px] object-cover"
                        />
                    </div>
                </div>

                {/* Thông tin */}
                <div>
                    <h1 className="text-4xl font-bold mb-3">
                        {product.name}
                    </h1>

                    <div className="flex items-center gap-2 mb-4">
                        ⭐⭐⭐⭐⭐
                        <span className="text-gray-500">
                            (125 đánh giá)
                        </span>
                    </div>

                    <p className="text-3xl font-bold text-red-600 mb-6">
                        {product.price?.toLocaleString()} đ
                    </p>

                    {/* Màu sắc */}
                    <div className="mb-6">
                        <h3 className="font-semibold mb-3">
                            Màu sắc
                        </h3>

                        <div className="flex gap-3">
                            {product.colors?.map((color) => (
                                <button
                                    key={color}
                                    onClick={() =>
                                        setSelectedColor(color)
                                    }
                                    className={`px-4 py-2 border rounded-lg ${
                                        selectedColor === color
                                            ? 'border-black bg-black text-white'
                                            : ''
                                    }`}
                                >
                                    {color}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Size */}
                    <div className="mb-6">
                        <h3 className="font-semibold mb-3">
                            Kích thước
                        </h3>

                        <div className="flex gap-3">
                            {product.sizes?.map((size) => (
                                <button
                                    key={size}
                                    onClick={() =>
                                        setSelectedSize(size)
                                    }
                                    className={`w-12 h-12 border rounded-lg ${
                                        selectedSize === size
                                            ? 'bg-black text-white'
                                            : ''
                                    }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Số lượng */}
                    <div className="mb-6">
                        <h3 className="font-semibold mb-3">
                            Số lượng
                        </h3>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() =>
                                    quantity > 1 &&
                                    setQuantity(quantity - 1)
                                }
                                className="border px-3 py-1 rounded"
                            >
                                -
                            </button>

                            <span>{quantity}</span>

                            <button
                                onClick={() =>
                                    setQuantity(quantity + 1)
                                }
                                className="border px-3 py-1 rounded"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Nút */}
                    <div className="flex gap-4">
                        <button className="flex-1 bg-black text-white py-3 rounded-lg hover:bg-gray-800">
                            Thêm vào giỏ hàng
                        </button>

                        <button className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700">
                            Mua ngay
                        </button>
                    </div>

                    {/* Mô tả */}
                    <div className="mt-10">
                        <h3 className="text-xl font-semibold mb-3">
                            Mô tả sản phẩm
                        </h3>

                        <p className="text-gray-600 leading-7">
                            {product.description ||
                                'Chưa có mô tả sản phẩm'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}