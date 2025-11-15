'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface MainMenuProps {
  onStartGame: () => void;
  onGoToAdmin?: () => void;
  onGoToLogin?: () => void;
  onGoToLeaderboard?: () => void;
  currentUser?: { id: number; username: string } | null;
}

export function MainMenu({ onStartGame, onGoToAdmin, onGoToLogin, onGoToLeaderboard, currentUser }: MainMenuProps) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* 메인 타이틀 */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-mono font-bold text-blue-400 tracking-wider mb-4">
            ECHO CHAMBER
          </h1>
          <p className="text-lg text-blue-300/80 font-mono italic mb-2">
            커뮤니티가 붕괴하지 않도록 관리하라.
          </p>
          <p className="text-sm text-gray-400 font-mono">
            커뮤니티 관리 시뮬레이션 게임
          </p>
        </div>

        {/* 게임 설명 카드 */}
        <Card className="border-blue-500/30 bg-blue-950/10 mb-8">
          <CardContent className="pt-6">
            <div className="space-y-4 text-gray-300">
              <div>
                <h2 className="text-sm font-mono text-blue-400 mb-2">[게임 소개]</h2>
                <p className="text-xs leading-relaxed">
                  당신은 온라인 커뮤니티의 관리자입니다. 30개의 게시글을 검토하며 
                  <span className="text-blue-400"> 자유도</span>, 
                  <span className="text-gray-400"> 질서도</span>, 
                  <span className="text-emerald-400"> 신뢰도</span>, 
                  <span className="text-purple-400"> 다양성</span> 
                  사이의 균형을 유지해야 합니다.
                </p>
              </div>
              
              <div>
                <h2 className="text-sm font-mono text-blue-400 mb-2">[게임 방법]</h2>
                <ul className="text-xs leading-relaxed space-y-1 ml-4 list-disc">
                  <li>각 게시글에 대해 <span className="text-green-400">통과</span>, <span className="text-yellow-400">경고</span>, <span className="text-red-400">삭제</span> 중 하나를 선택하세요.</li>
                  <li>선택에 따라 4가지 지표가 변화합니다.</li>
                  <li>어떤 지표라도 0이 되면 게임이 종료됩니다.</li>
                  <li>30턴을 모두 완료하고 모든 지표가 0이 아니면 <span className="text-blue-400">트루엔딩</span>입니다.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-sm font-mono text-blue-400 mb-2">[엔딩]</h2>
                <p className="text-xs leading-relaxed">
                  총 5개의 엔딩이 있습니다. 균형을 유지하며 최선의 결과를 도출하세요.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 사용자 정보 */}
        {currentUser && (
          <Card className="border-blue-500/30 bg-blue-950/10 mb-6">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-mono text-blue-400">
                  로그인: <span className="text-blue-300">@{currentUser.username}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 버튼 */}
        <div className="flex flex-col gap-4 items-center">
          {currentUser ? (
            <>
              <Button
                onClick={onStartGame}
                className="bg-blue-600 hover:bg-blue-700 text-white font-mono px-8 py-6 text-lg"
                size="lg"
              >
                게임 시작
              </Button>
              {onGoToAdmin && (
                <Button
                  onClick={onGoToAdmin}
                  variant="outline"
                  className="border-gray-700 text-gray-400 hover:bg-gray-800 font-mono px-6 py-4"
                >
                  관리자 페이지
                </Button>
              )}
              {onGoToLeaderboard && (
                <Button
                  onClick={onGoToLeaderboard}
                  variant="outline"
                  className="border-blue-600 text-blue-400 hover:bg-blue-950 font-mono px-6 py-4"
                >
                  리더보드
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                onClick={onStartGame}
                disabled
                className="bg-gray-700 text-gray-500 font-mono px-8 py-6 text-lg cursor-not-allowed"
                size="lg"
              >
                게임 시작 (로그인 필요)
              </Button>
              {onGoToLogin && (
                <Button
                  onClick={onGoToLogin}
                  variant="outline"
                  className="border-blue-600 text-blue-400 hover:bg-blue-950 font-mono px-6 py-4"
                >
                  로그인 / 회원가입
                </Button>
              )}
              {onGoToAdmin && (
                <Button
                  onClick={onGoToAdmin}
                  variant="outline"
                  className="border-gray-700 text-gray-400 hover:bg-gray-800 font-mono px-6 py-4"
                >
                  관리자 페이지
                </Button>
              )}
              {onGoToLeaderboard && (
                <Button
                  onClick={onGoToLeaderboard}
                  variant="outline"
                  className="border-blue-600 text-blue-400 hover:bg-blue-950 font-mono px-6 py-4"
                >
                  리더보드
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

