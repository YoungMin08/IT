import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

// POST: 회원가입
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

    if (username.length < 3) {
      return NextResponse.json(
        { success: false, error: '사용자명은 3자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { success: false, error: '비밀번호는 4자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // 사용자 목록 로드
    let users: any[] = [];
    try {
      const usersData = fs.readFileSync(USERS_FILE, 'utf-8');
      users = JSON.parse(usersData);
    } catch (error) {
      // 파일이 없으면 빈 배열로 시작
      users = [];
    }

    // 중복 확인
    const existingUser = users.find((u: any) => u.username === username);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: '이미 존재하는 사용자명입니다.' },
        { status: 400 }
      );
    }

    // 새 사용자 추가
    const newUser = {
      id: users.length + 1,
      username,
      password, // 교육용이므로 평문 저장 (보안은 고려하지 않음)
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

    return NextResponse.json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      user: { id: newUser.id, username: newUser.username },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '회원가입 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

