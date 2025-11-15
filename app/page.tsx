'use client';

import { useState } from 'react';
import { MainMenu } from '@/components/MainMenu';
import { GameBoard } from '@/components/GameBoard';
import { AdminPanel } from '@/components/AdminPanel';
import { LoginForm } from '@/components/LoginForm';
import { RegisterForm } from '@/components/RegisterForm';
import { Leaderboard } from '@/components/Leaderboard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { API_ENDPOINTS } from '@/config/api';
import { fetchJsonWithLogs } from '@/lib/apiClient';

type ViewMode = 'menu' | 'game' | 'admin' | 'login' | 'register' | 'leaderboard';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('menu');
  const [currentUser, setCurrentUser] = useState<{ id: number; username: string } | null>(null);

  const handleStartGame = async () => {
    // 로그인 체크
    if (!currentUser) {
      setViewMode('login');
      return;
    }
    
    try {
      await fetchJsonWithLogs(API_ENDPOINTS.RESET, {
        method: 'POST',
        label: 'POST /api/reset [start-game]',
      });
    } catch (e) {
      // ignore and proceed; defaults will be applied by server
    }
    setViewMode('game');
  };

  const handleGoToAdmin = () => {
    setViewMode('admin');
  };

  const handleGoToMenu = () => {
    setViewMode('menu');
  };

  const handleGoToLeaderboard = () => {
    setViewMode('leaderboard');
  };

  const handleGoToLogin = () => {
    setViewMode('login');
  };

  const handleGoToRegister = () => {
    setViewMode('register');
  };

  const handleLogin = (user: { id: number; username: string }) => {
    setCurrentUser(user);
    setViewMode('menu');
  };

  const handleRegister = (user: { id: number; username: string }) => {
    setCurrentUser(user);
    setViewMode('menu');
  };

  if (viewMode === 'login') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <LoginForm onLogin={handleLogin} onSwitchToRegister={handleGoToRegister} />
      </div>
    );
  }

  if (viewMode === 'register') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <RegisterForm onRegister={handleRegister} onSwitchToLogin={handleGoToLogin} />
      </div>
    );
  }

  if (viewMode === 'menu') {
    return (
      <MainMenu 
        onStartGame={handleStartGame} 
        onGoToAdmin={handleGoToAdmin}
        onGoToLogin={handleGoToLogin}
        onGoToLeaderboard={handleGoToLeaderboard}
        currentUser={currentUser}
      />
    );
  }

  if (viewMode === 'admin') {
    return <AdminPanel onGoToMenu={handleGoToMenu} />;
  }

  if (viewMode === 'leaderboard') {
    return (
      <div className="min-h-screen bg-black p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 border-b border-blue-500/30 pb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-mono font-bold text-blue-400 tracking-wider">
                  리더보드
                </h1>
                <p className="text-sm text-blue-300/80 font-mono italic">
                  상위 점수 기록
                </p>
              </div>
              <Button
                onClick={handleGoToMenu}
                variant="outline"
                className="border-gray-700 text-gray-400 hover:bg-gray-800 font-mono text-xs"
              >
                메인으로
              </Button>
            </div>
          </div>
          <Leaderboard />
        </div>
      </div>
    );
  }

  // 게임 화면 접근 시 로그인 체크
  if (viewMode === 'game' && !currentUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="border-red-500/30 bg-red-950/10 max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-lg font-mono text-red-400 mb-4">
                게임을 시작하려면 로그인이 필요합니다.
              </p>
              <Button
                onClick={handleGoToLogin}
                className="bg-blue-600 hover:bg-blue-700 text-white font-mono"
              >
                로그인하러 가기
              </Button>
              <div>
                <Button
                  onClick={handleGoToMenu}
                  variant="outline"
                  className="border-gray-700 text-gray-400 hover:bg-gray-800 font-mono text-xs mt-2"
                >
                  메인으로
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <GameBoard onGoToMenu={handleGoToMenu} onGoToLeaderboard={handleGoToLeaderboard} />;
}
