import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const POSTS_PATH = path.join(process.cwd(), 'data', 'posts.json');

interface UpdatePostPayload {
  id: number;
  title?: string;
  content?: string;
  freedomImpact?: number[];
  orderImpact?: number[];
  trustImpact?: number[];
  diversityImpact?: number[];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as UpdatePostPayload;
    const { id } = body;

    if (typeof id !== 'number' || Number.isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '유효한 게시글 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const postsData = fs.readFileSync(POSTS_PATH, 'utf-8');
    const posts = JSON.parse(postsData) as Array<Record<string, any>>;
    const postIndex = posts.findIndex(post => post.id === id);

    if (postIndex === -1) {
      return NextResponse.json(
        { success: false, error: '해당 게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const updatedPost = { ...posts[postIndex] };

    if (typeof body.title === 'string') {
      updatedPost.title = body.title.trim();
    }

    if (typeof body.content === 'string') {
      updatedPost.content = body.content.trim();
    }

    if (body.freedomImpact !== undefined) {
      if (!Array.isArray(body.freedomImpact) || body.freedomImpact.length !== 3) {
        return NextResponse.json(
          { success: false, error: '자유도 영향 값은 3개의 숫자 배열이어야 합니다.' },
          { status: 400 }
        );
      }
      const parsedFreedom = body.freedomImpact.map(v => Number(v));
      if (parsedFreedom.some(v => Number.isNaN(v))) {
        return NextResponse.json(
          { success: false, error: '자유도 영향 값은 숫자여야 합니다.' },
          { status: 400 }
        );
      }
      updatedPost.freedomImpact = parsedFreedom;
    }

    if (body.orderImpact !== undefined) {
      if (!Array.isArray(body.orderImpact) || body.orderImpact.length !== 3) {
        return NextResponse.json(
          { success: false, error: '질서도 영향 값은 3개의 숫자 배열이어야 합니다.' },
          { status: 400 }
        );
      }
      const parsedOrder = body.orderImpact.map(v => Number(v));
      if (parsedOrder.some(v => Number.isNaN(v))) {
        return NextResponse.json(
          { success: false, error: '질서도 영향 값은 숫자여야 합니다.' },
          { status: 400 }
        );
      }
      updatedPost.orderImpact = parsedOrder;
    }

    if (body.trustImpact !== undefined) {
      if (!Array.isArray(body.trustImpact) || body.trustImpact.length !== 3) {
        return NextResponse.json(
          { success: false, error: '신뢰도 영향 값은 3개의 숫자 배열이어야 합니다.' },
          { status: 400 }
        );
      }
      const parsedTrust = body.trustImpact.map(v => Number(v));
      if (parsedTrust.some(v => Number.isNaN(v))) {
        return NextResponse.json(
          { success: false, error: '신뢰도 영향 값은 숫자여야 합니다.' },
          { status: 400 }
        );
      }
      updatedPost.trustImpact = parsedTrust;
    }

    if (body.diversityImpact !== undefined) {
      if (!Array.isArray(body.diversityImpact) || body.diversityImpact.length !== 3) {
        return NextResponse.json(
          { success: false, error: '다양성 영향 값은 3개의 숫자 배열이어야 합니다.' },
          { status: 400 }
        );
      }
      const parsedDiversity = body.diversityImpact.map(v => Number(v));
      if (parsedDiversity.some(v => Number.isNaN(v))) {
        return NextResponse.json(
          { success: false, error: '다양성 영향 값은 숫자여야 합니다.' },
          { status: 400 }
        );
      }
      updatedPost.diversityImpact = parsedDiversity;
    }

    posts[postIndex] = updatedPost;

    fs.writeFileSync(POSTS_PATH, JSON.stringify(posts, null, 2), 'utf-8');

    return NextResponse.json({ success: true, post: updatedPost });
  } catch (error) {
    console.error('[POSTS_UPDATE_ERROR]', error);
    return NextResponse.json(
      { success: false, error: '게시글을 수정할 수 없습니다.' },
      { status: 500 }
    );
  }
}


