'use client';

import { useState, useEffect } from 'react';
import { PostCard } from './PostCard';
import { GameGauge } from './GameGauge';
import { EndingDialog } from './EndingDialog';
import { Leaderboard } from './Leaderboard';
import { Post, GameState } from '@/types/game';
import { Button } from '@/components/ui/button';
import { API_ENDPOINTS } from '@/config/api';
import { fetchJsonWithLogs } from '@/lib/apiClient';

interface GameBoardProps {
  onGoToMenu?: () => void;
  onGoToLeaderboard?: () => void;
}

export function GameBoard({ onGoToMenu, onGoToLeaderboard }: GameBoardProps) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ending, setEnding] = useState<{ type: string; message: string } | null>(null);
  const [showEnding, setShowEnding] = useState(false);
  const [refreshLeaderboard, setRefreshLeaderboard] = useState(0);

  // 게임 상태와 게시글 로드
  useEffect(() => {
    loadGame();
  }, []);

  const loadGame = async () => {
    try {
      const [gameStateResult, postsResult] = await Promise.all([
        fetchJsonWithLogs<GameState>(API_ENDPOINTS.GAME_STATE, {
          label: 'GET /api/game-state [game]',
        }),
        fetchJsonWithLogs<Post[]>(API_ENDPOINTS.POSTS, {
          label: 'GET /api/posts [game]',
        }),
      ]);

      const gameStateData = gameStateResult.data;
      const postsData: Post[] = Array.isArray(postsResult.data)
        ? (postsResult.data as Post[])
        : [];

      if (!gameStateData) {
        throw new Error('게임 상태 데이터를 불러오지 못했습니다.');
      }

      setGameState(gameStateData);
      setPosts(postsData);

      // 현재 게시글 설정
      if (gameStateData.currentPostIndex < postsData.length) {
        setCurrentPost(postsData[gameStateData.currentPostIndex]);
      }

      // 엔딩이 있으면 표시
      if (gameStateData.gameStatus === 'ended' && gameStateData.endings.length > 0) {
        setEnding(gameStateData.endings[gameStateData.endings.length - 1]);
        setShowEnding(true);
      }
    } catch (error) {
      console.error('게임 로드 실패:', error);
    }
  };

  const handleAction = async (action: 'approve' | 'warn' | 'delete') => {
    if (!currentPost || !gameState || isLoading) return;

    setIsLoading(true);

    try {
      const { data, response } = await fetchJsonWithLogs<{
        success: boolean;
        gameState: GameState;
      }>(API_ENDPOINTS.ACTION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: currentPost.id,
          action,
        }),
        label: `POST /api/action [${action}]`,
      });

      if (response.ok && data?.success) {
        const updatedState = data.gameState;
        setGameState(updatedState);

        // 다음 게시글 설정
        if (updatedState.currentPostIndex < posts.length) {
          setCurrentPost(posts[updatedState.currentPostIndex]);
        }

        // 엔딩 확인
        if (updatedState.gameStatus === 'ended' && updatedState.endings.length > 0) {
          setEnding(updatedState.endings[updatedState.endings.length - 1]);
          setShowEnding(true);
          // 리더보드 새로고침을 위한 트리거
          setRefreshLeaderboard(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('액션 처리 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      await fetchJsonWithLogs(API_ENDPOINTS.RESET, {
        method: 'POST',
        label: 'POST /api/reset [game]',
      });
      setShowEnding(false);
      setEnding(null);
      await loadGame();
      // 리더보드 새로고침
      setRefreshLeaderboard(prev => prev + 1);
    } catch (error) {
      console.error('게임 리셋 실패:', error);
    }
  };

  if (!gameState || !currentPost) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400 font-mono">게임 로딩 중...</div>
      </div>
    );
  }

  // 로그인 체크는 상위 컴포넌트에서 처리됨

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8 border-b border-blue-500/30 pb-6">
          <div className="flex flex-col gap-2 mb-4">
            <h1 className="text-4xl font-mono font-bold text-blue-400 tracking-wider">
              ECHO CHAMBER
            </h1>
            <p className="text-sm text-blue-300/80 font-mono italic">
              커뮤니티가 붕괴하지 않도록 관리하라.
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-400 font-mono flex items-center gap-4">
              <span>Day {gameState.day}</span>
              <span className="text-gray-600">|</span>
              <span>게시글 {gameState.currentPostIndex + 1}/{posts.length}</span>
            </div>
            {onGoToMenu && (
              <Button
                onClick={onGoToMenu}
                variant="outline"
                className="text-xs font-mono border-gray-700 text-gray-400 hover:bg-gray-800"
              >
                메인으로
              </Button>
            )}
          </div>
        </div>

        {/* 게이지 */}
        <GameGauge 
          freedom={gameState.freedom} 
          order={gameState.order}
          trust={typeof gameState.trust === 'number' ? gameState.trust : 50}
          diversity={typeof gameState.diversity === 'number' ? gameState.diversity : 50}
        />

        {/* 게시글 카드 */}
        <div className="mb-6">
          <PostCard 
            post={currentPost} 
            onAction={handleAction}
            isLoading={isLoading}
          />
        </div>

        {/* 리셋 버튼 */}
        <div className="flex justify-end mb-6">
          <Button
            onClick={handleReset}
            variant="outline"
            className="text-xs font-mono border-gray-700 text-gray-400 hover:bg-gray-800"
          >
            게임 리셋
          </Button>
        </div>

        {/* 리더보드 */}
        <div className="mb-6" key={refreshLeaderboard}>
          <Leaderboard />
        </div>

        {/* 엔딩 다이얼로그 */}
        <EndingDialog
          isOpen={showEnding}
          ending={ending}
          onGoToLeaderboard={async () => {
            // 게임 종료 API 호출 (이미 action API에서 리더보드에 저장됨)
            // 리더보드로 이동
            if (onGoToLeaderboard) {
              onGoToLeaderboard();
            } else if (onGoToMenu) {
              // 리더보드가 별도 페이지가 아니면 메인으로 이동
              onGoToMenu();
            }
          }}
        />
      </div>
    </div>
  );
}

