import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const POSTS_PATH = path.join(process.cwd(), 'data', 'posts.json');

interface DeletePostPayload {
  id: number;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DeletePostPayload;
    const { id } = body;

    if (typeof id !== 'number' || Number.isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '유효한 게시글 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 게시글 목록 로드
    const postsData = fs.readFileSync(POSTS_PATH, 'utf-8');
    const posts = JSON.parse(postsData) as Array<Record<string, any>>;

    // 삭제할 게시글 찾기
    const postIndex = posts.findIndex(post => post.id === id);

    if (postIndex === -1) {
      return NextResponse.json(
        { success: false, error: '해당 게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 게시글 삭제
    posts.splice(postIndex, 1);

    // 저장
    fs.writeFileSync(POSTS_PATH, JSON.stringify(posts, null, 2), 'utf-8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[POSTS_DELETE_ERROR]', error);
    return NextResponse.json(
      { success: false, error: '게시글을 삭제할 수 없습니다.' },
      { status: 500 }
    );
  }
}

