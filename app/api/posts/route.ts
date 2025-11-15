import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const POSTS_PATH = path.join(process.cwd(), 'data', 'posts.json');

// GET: 게시글 목록 조회
export async function GET() {
  try {
    const postsData = fs.readFileSync(POSTS_PATH, 'utf-8');
    const posts = JSON.parse(postsData);
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json(
      { error: '게시글을 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}

