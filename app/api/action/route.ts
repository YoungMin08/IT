import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const GAME_STATE_PATH = path.join(process.cwd(), 'data', 'game-state.json');
const POSTS_PATH = path.join(process.cwd(), 'data', 'posts.json');

// POST: 게시글에 대한 액션 처리 (통과/경고/삭제)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { postId, action } = body; // action: 'approve', 'warn', 'delete'

    // 게임 상태와 게시글 로드
    const gameStateData = fs.readFileSync(GAME_STATE_PATH, 'utf-8');
    const gameState = JSON.parse(gameStateData);
    const postsData = fs.readFileSync(POSTS_PATH, 'utf-8');
    const posts = JSON.parse(postsData);

    // 현재 게시글 찾기
    const currentPost = posts.find((p: any) => p.id === postId);
    if (!currentPost) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 배열 형태의 영향값 가져오기 (기존 단일 값과 호환성 유지)
    const getImpactValue = (impact: any, index: number): number => {
      if (Array.isArray(impact)) {
        return typeof impact[index] === 'number' ? impact[index] : Number(impact[index]) || 0;
      }
      // 기존 단일 값 형태와 호환 (마이그레이션용)
      const singleValue = typeof impact === 'number' ? impact : Number(impact) || 0;
      if (index === 0) return singleValue; // approve
      if (index === 1) return singleValue * 0.5; // warn
      return -Math.abs(singleValue) * 1.5; // delete (자유도 기준)
    };

    // 액션에 따른 배열 인덱스 결정
    let actionIndex = 0; // approve
    if (action === 'warn') {
      actionIndex = 1;
    } else if (action === 'delete') {
      actionIndex = 2;
    }

    // 액션에 따른 영향 계산 (배열에서 직접 가져오기)
    const freedomChange = getImpactValue(currentPost.freedomImpact, actionIndex);
    const orderChange = getImpactValue(currentPost.orderImpact, actionIndex);
    const trustChange = getImpactValue(currentPost.trustImpact, actionIndex);
    const diversityChange = getImpactValue(currentPost.diversityImpact, actionIndex);

    // 게임 상태 업데이트
    gameState.freedom = Math.max(0, Math.min(100, gameState.freedom + freedomChange));
    gameState.order = Math.max(0, Math.min(100, gameState.order + orderChange));
    gameState.trust = Math.max(0, Math.min(100, (typeof gameState.trust === 'number' ? gameState.trust : 50) + trustChange));
    gameState.diversity = Math.max(0, Math.min(100, (typeof gameState.diversity === 'number' ? gameState.diversity : 50) + diversityChange));
    gameState.currentPostIndex += 1;
    gameState.processedPosts.push({
      postId,
      action,
      timestamp: new Date().toISOString()
    });

    // 엔딩 조건 체크
    // 하나의 지표가 0이 되면 즉시 해당 지표에 대한 엔딩
    if (gameState.freedom <= 0) {
      gameState.gameStatus = 'ended';
      gameState.endings.push({
        type: '무정부',
        message: '자유가 완전히 사라졌습니다. 무정부 상태가 되었습니다. 커뮤니티가 혼란에 빠졌습니다.'
      });
    } else if (gameState.order <= 0) {
      gameState.gameStatus = 'ended';
      gameState.endings.push({
        type: '질서 붕괴',
        message: '질서가 완전히 무너졌습니다. 커뮤니티가 혼란과 무질서에 빠졌습니다.'
      });
    } else if (gameState.trust <= 0) {
      gameState.gameStatus = 'ended';
      gameState.endings.push({
        type: '신뢰 상실',
        message: '사용자들의 신뢰가 완전히 사라졌습니다. 커뮤니티는 더 이상 신뢰받지 못합니다.'
      });
    } else if (gameState.diversity <= 0) {
      gameState.gameStatus = 'ended';
      gameState.endings.push({
        type: '다양성 소멸',
        message: '다양성이 완전히 사라졌습니다. 모든 목소리가 같아져 커뮤니티가 메아리실(Echo Chamber)이 되었습니다.'
      });
    } else if (gameState.currentPostIndex >= posts.length) {
      // 모든 게시글 처리 완료 (30턴 완료)
      // 아무 지표도 0이 안 되면 트루엔딩
      gameState.gameStatus = 'ended';
      gameState.endings.push({
        type: '트루엔딩',
        message: '모든 게시글을 처리하면서도 모든 지표를 유지했습니다. 이상적인 커뮤니티의 균형을 이루었습니다.'
      });
    }
    // 100% 도달 시에는 즉시 엔딩이 되지 않음 (제거됨)

    // 게임 상태 저장
    fs.writeFileSync(GAME_STATE_PATH, JSON.stringify(gameState, null, 2));

    // 게임이 끝났을 때 리더보드에 추가
    if (gameState.gameStatus === 'ended') {
      const LEADERBOARD_PATH = path.join(process.cwd(), 'data', 'leaderboard.json');
      
      // 점수 계산: 모든 수치의 합계
      const score = gameState.freedom + gameState.order + gameState.trust + gameState.diversity;
      
      // 엔딩 타입
      const endingType = gameState.endings.length > 0 ? gameState.endings[gameState.endings.length - 1].type : '';
      
      // 리더보드 데이터 로드
      let leaderboard: any[] = [];
      try {
        const leaderboardData = fs.readFileSync(LEADERBOARD_PATH, 'utf-8');
        leaderboard = JSON.parse(leaderboardData);
      } catch (error) {
        leaderboard = [];
      }
      
      // 새 기록 추가
      const newRecord = {
        score,
        freedom: gameState.freedom,
        order: gameState.order,
        trust: gameState.trust,
        diversity: gameState.diversity,
        ending: endingType,
        completedAt: new Date().toISOString(),
        processedPosts: gameState.processedPosts.length,
      };
      
      leaderboard.push(newRecord);
      
      // 점수순으로 정렬 (내림차순)
      leaderboard.sort((a, b) => (b.score || 0) - (a.score || 0));
      
      // 최대 100개만 유지
      if (leaderboard.length > 100) {
        leaderboard = leaderboard.slice(0, 100);
      }
      
      // 저장
      fs.writeFileSync(LEADERBOARD_PATH, JSON.stringify(leaderboard, null, 2));
    }

    return NextResponse.json({ success: true, gameState });
  } catch (error) {
    return NextResponse.json(
      { error: '액션을 처리할 수 없습니다.' },
      { status: 500 }
    );
  }
}

