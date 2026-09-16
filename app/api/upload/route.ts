import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { verifyAdminSession } from '@/lib/auth';

export async function POST(request: Request) {
  const session = verifyAdminSession(request);
  if (!session.authenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No image file provided' }, { status: 400 });
    }

    // Verify file type
    const mimeType = file.type;
    if (!mimeType.startsWith('image/')) {
      return NextResponse.json({ success: false, error: 'File must be an image (PNG, JPG, WEBP, GIF, SVG).' }, { status: 400 });
    }

    // Limit file size (max 8MB)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    if (buffer.length > 8 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'Image size must be less than 8MB.' }, { status: 400 });
    }

    // Determine extension
    let ext = path.extname(file.name) || '.webp';
    if (!ext || ext === '.') {
      ext = mimeType === 'image/png' ? '.png' : mimeType === 'image/jpeg' ? '.jpg' : '.webp';
    }

    const filename = `poster_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    // Ensure upload directory exists
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      size: buffer.length,
      mimeType,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('File upload error:', err.message);
    return NextResponse.json({ success: false, error: 'Failed to upload image file: ' + err.message }, { status: 500 });
  }
}
