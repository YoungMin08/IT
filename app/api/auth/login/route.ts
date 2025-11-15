import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

// POST: 로그인
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = (body.username || '').trim();
    const password = (body.password || '').trim();

    // 유효성 검사
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: '사용자명과 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 사용자 목록 로드
    let users: any[] = [];
    try {
      const usersData = fs.readFileSync(USERS_FILE, 'utf-8');
      users = JSON.parse(usersData);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: '사용자명 또는 비밀번호가 잘못되었습니다.' },
        { status: 401 }
      );
    }

    // 사용자 찾기
    const user = users.find((u: any) => u.username === username && u.password === password);

    if (!user) {
      return NextResponse.json(
        { success: false, error: '사용자명 또는 비밀번호가 잘못되었습니다.' },
        { status: 401 }
      );
    }

    // 로그인 성공
    return NextResponse.json({
      success: true,
      message: '로그인 성공',
      user: { id: user.id, username: user.username },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '로그인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

