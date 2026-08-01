import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'Không có file được upload' },
        { status: 400 }
      );
    }

    // Kiểm tra loại file
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Chỉ hỗ trợ file ảnh (JPEG, PNG, WEBP, GIF)' },
        { status: 400 }
      );
    }

    // Kiểm tra kích thước file (tối đa 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Kích thước file vượt quá 5MB' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Tạo tên file duy nhất
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const ext = path.extname(file.name);
    const fileName = `${timestamp}-${random}${ext}`;
    
    // Đường dẫn thư mục upload
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadDir, fileName);
    
    // Tạo thư mục nếu chưa tồn tại
    await mkdir(uploadDir, { recursive: true });
    
    // Lưu file
    await writeFile(filePath, buffer);

    // Trả về URL của ảnh
    const url = `/uploads/${fileName}`;
    
    return NextResponse.json({ 
      success: true, 
      url,
      message: 'Upload ảnh thành công' 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi upload ảnh: ' + error.message },
      { status: 500 }
    );
  }
}

// Cấu hình để hỗ trợ file lớn
export const config = {
  api: {
    bodyParser: false,
  },
};