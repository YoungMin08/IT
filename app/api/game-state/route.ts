import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const GAME_STATE_PATH = path.join(process.cwd(), 'data', 'game-state.json');

// GET: 게임 상태 조회
export async function GET() {
  try {
    const gameStateData = fs.readFileSync(GAME_STATE_PATH, 'utf-8');
    const gameState = JSON.parse(gameStateData);
    // 새 지표 기본값 보정
    if (typeof gameState.trust !== 'number') gameState.trust = 50;
    if (typeof gameState.diversity !== 'number') gameState.diversity = 50;
    return NextResponse.json(gameState);
  } catch (error) {
    return NextResponse.json(
      { error: '게임 상태를 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}

// POST: 게임 상태 업데이트
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 게임 상태 파일 업데이트
    fs.writeFileSync(GAME_STATE_PATH, JSON.stringify(body, null, 2));
    
    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    return NextResponse.json(
      { error: '게임 상태를 저장할 수 없습니다.' },
      { status: 500 }
    );
  }
}

