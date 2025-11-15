import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const LEADERBOARD_FILE = path.join(process.cwd(), 'data', 'leaderboard.json');

// GET: 리더보드 조회
export async function GET() {
  try {
    let leaderboard: any[] = [];
    
    try {
      const leaderboardData = fs.readFileSync(LEADERBOARD_FILE, 'utf-8');
      leaderboard = JSON.parse(leaderboardData);
    } catch (error) {
      // 파일이 없으면 빈 배열로 시작
      leaderboard = [];
    }

    // 점수순으로 정렬 (내림차순)
    leaderboard.sort((a, b) => (b.score || 0) - (a.score || 0));

    // 상위 10개만 반환
    const top10 = leaderboard.slice(0, 10);

    return NextResponse.json({ success: true, leaderboard: top10 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '리더보드를 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}

