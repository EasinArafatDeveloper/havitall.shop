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

    const trimmed = String(driveUrl).trim();

    // 1. Check if it's a single file link: /file/d/FILE_ID or ?id=FILE_ID
    const singleFileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (singleFileMatch && singleFileMatch[1] && !trimmed.includes('/folders/')) {
      const fileId = singleFileMatch[1];
      
      try {
        const fileRes = await fetch(`https://drive.google.com/file/d/${fileId}/view?usp=sharing`, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        const html = await fileRes.text();
        const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i) || html.match(/<title>([^<]+)<\/title>/i);
        const fileName = titleMatch ? titleMatch[1] : '';
        const isVideo = /\.(mp4|mov|webm|mkv|avi|m4v|3gp|flv)$/i.test(fileName) || html.includes('video/mp4') || html.includes('drive-viewer-video') || html.includes('video_player');

        if (isVideo) {
          return NextResponse.json({
            success: true,
            isVideo: true,
            fileId,
            name: fileName || 'Google Drive Video',
            videoUrl: `https://drive.google.com/file/d/${fileId}/preview`,
            thumbnail: `https://lh3.googleusercontent.com/d/${fileId}`,
          });
        }
      } catch (e) {
        console.error('Error inspecting single Drive file:', e);
      }

      const directUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
      return NextResponse.json({
        success: true,
        isVideo: false,
        count: 1,
        images: [directUrl],
      });
    }

    // 2. Otherwise it's a Drive Folder or collection: fetch and extract files
    const res = await fetch(trimmed, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();

    // Extract all candidate drive image IDs (33 chars)
    const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    const folderId = folderMatch ? folderMatch[1] : '';

    const matches = Array.from(html.matchAll(/"([a-zA-Z0-9_-]{33})"/g)).map(m => m[1]);
    const uniqueIds = Array.from(new Set(matches)).filter(id => id !== folderId);

    const directUrls = uniqueIds.map(id => `https://lh3.googleusercontent.com/d/${id}`);

    return NextResponse.json({
      success: true,
      isVideo: false,
      count: directUrls.length,
      images: directUrls,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
