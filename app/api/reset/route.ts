import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const GAME_STATE_PATH = path.join(process.cwd(), 'data', 'game-state.json');

// POST: 게임 리셋
export async function POST() {
  try {
    const defaultGameState = {
      day: 1,
      freedom: 50,
      order: 50,
      trust: 50,
      diversity: 50,
      currentPostIndex: 0,
      processedPosts: [],
      gameStatus: "playing",
      endings: []
    };

    fs.writeFileSync(GAME_STATE_PATH, JSON.stringify(defaultGameState, null, 2));

    return NextResponse.json({ success: true, gameState: defaultGameState });
  } catch (error) {
    return NextResponse.json(
      { error: '게임을 리셋할 수 없습니다.' },
      { status: 500 }
    );
  }
}

