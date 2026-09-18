import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get('folder') || 'products';

    const baseDir = path.join(process.cwd(), 'public', 'uploads');
    const targetDir = path.join(baseDir, folder);

    const images: { url: string; name: string }[] = [];

    const scanDir = (dir: string, relPath: string) => {
      if (!fs.existsSync(dir)) return;
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          const nextRel = relPath ? `${relPath}/${file}` : file;
          scanDir(fullPath, nextRel);
        } else if (/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file)) {
          const cleanUrl = `/uploads/${relPath ? relPath + '/' : ''}${file}`.replace(/\/+/g, '/');
          images.push({
            url: cleanUrl,
            name: file,
          });
        }
      }
    };

    scanDir(baseDir, '');

    return NextResponse.json({ success: true, images });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { driveUrl } = await req.json();
    if (!driveUrl) {
      return NextResponse.json({ success: false, error: 'Google Drive URL is required' }, { status: 400 });
    }

    // Fetch the drive folder or file page
    const res = await fetch(driveUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();

    // Extract all candidate drive image IDs (33 chars)
    const matches = Array.from(html.matchAll(/"([a-zA-Z0-9_-]{33})"/g)).map(m => m[1]);
    const uniqueIds = Array.from(new Set(matches)).filter(id => !driveUrl.includes(id));

    const directUrls = uniqueIds.map(id => `https://lh3.googleusercontent.com/d/${id}`);

    return NextResponse.json({
      success: true,
      count: directUrls.length,
      images: directUrls
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
