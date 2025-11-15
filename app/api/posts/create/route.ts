import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const POSTS_PATH = path.join(process.cwd(), 'data', 'posts.json');

interface CreatePostPayload {
  type: string;
  title: string;
  content: string;
  author: string;
  freedomImpact: number[];
  orderImpact: number[];
  trustImpact: number[];
  diversityImpact: number[];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreatePostPayload;
    const { type, title, content, author, freedomImpact, orderImpact, trustImpact, diversityImpact } = body;

    // 유효성 검사
    if (!type || !title || !content || !author) {
      return NextResponse.json(
        { success: false, error: '모든 필수 필드를 입력해주세요.' },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(freedomImpact) || freedomImpact.length !== 3 ||
      !Array.isArray(orderImpact) || orderImpact.length !== 3 ||
      !Array.isArray(trustImpact) || trustImpact.length !== 3 ||
      !Array.isArray(diversityImpact) || diversityImpact.length !== 3
    ) {
      return NextResponse.json(
        { success: false, error: '모든 영향 값은 3개의 숫자 배열이어야 합니다.' },
        { status: 400 }
      );
    }

    const parsedFreedom = freedomImpact.map(v => Number(v));
    const parsedOrder = orderImpact.map(v => Number(v));
    const parsedTrust = trustImpact.map(v => Number(v));
    const parsedDiversity = diversityImpact.map(v => Number(v));

    if (
      parsedFreedom.some(v => Number.isNaN(v)) ||
      parsedOrder.some(v => Number.isNaN(v)) ||
      parsedTrust.some(v => Number.isNaN(v)) ||
      parsedDiversity.some(v => Number.isNaN(v))
    ) {
      return NextResponse.json(
        { success: false, error: '모든 영향 값은 숫자여야 합니다.' },
        { status: 400 }
      );
    }

    // 게시글 목록 로드
    const postsData = fs.readFileSync(POSTS_PATH, 'utf-8');
    const posts = JSON.parse(postsData) as Array<Record<string, any>>;

    // 새 ID 생성 (기존 최대 ID + 1)
    const maxId = posts.length > 0 ? Math.max(...posts.map(p => p.id || 0)) : 0;
    const newId = maxId + 1;

    // 새 게시글 생성
    const newPost = {
      id: newId,
      type: type.trim(),
      title: title.trim(),
      content: content.trim(),
      author: author.trim(),
      freedomImpact: parsedFreedom,
      orderImpact: parsedOrder,
      trustImpact: parsedTrust,
      diversityImpact: parsedDiversity,
    };

    posts.push(newPost);

    // 저장
    fs.writeFileSync(POSTS_PATH, JSON.stringify(posts, null, 2), 'utf-8');

    return NextResponse.json({ success: true, post: newPost });
  } catch (error) {
    console.error('[POSTS_CREATE_ERROR]', error);
    return NextResponse.json(
      { success: false, error: '게시글을 생성할 수 없습니다.' },
      { status: 500 }
    );
  }
}

