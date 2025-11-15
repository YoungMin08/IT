'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { API_ENDPOINTS } from '@/config/api';
import { fetchJsonWithLogs } from '@/lib/apiClient';

interface LeaderboardEntry {
  score: number;
  freedom: number;
  order: number;
  trust: number;
  diversity: number;
  ending: string;
  completedAt: string;
  processedPosts: number;
}

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const { data } = await fetchJsonWithLogs<{
        success: boolean;
        leaderboard: LeaderboardEntry[];
      }>(API_ENDPOINTS.LEADERBOARD, {
        label: 'GET /api/leaderboard',
      });

      if (data?.success) {
        const entries: LeaderboardEntry[] = Array.isArray(data.leaderboard)
          ? (data.leaderboard as LeaderboardEntry[])
          : [];
        setLeaderboard(entries);
      } else {
        setLeaderboard([]);
      }
    } catch (error) {
      console.error('리더보드 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const endingColors: Record<string, string> = {
    '트루엔딩': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    '무정부': 'bg-red-500/20 text-red-400 border-red-500/30',
    '질서 붕괴': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    '신뢰 상실': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    '다양성 소멸': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };

  if (loading) {
    return (
      <Card className="border-blue-500/30 bg-blue-950/10">
        <CardContent className="pt-6">
          <div className="text-center text-gray-400 font-mono">리더보드 로딩 중...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-500/30 bg-blue-950/10">
      <CardHeader>
        <CardTitle className="text-lg font-mono text-blue-400">
          [리더보드]
        </CardTitle>
        <p className="text-xs text-blue-300/60 mt-2">
          점수 = 자유도 + 질서도 + 신뢰도 + 다양성의 합계
        </p>
      </CardHeader>
      <CardContent>
        {leaderboard.length === 0 ? (
          <div className="text-center text-gray-400 font-mono text-sm py-8">
            아직 기록이 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <div
                key={index}
                className="border border-gray-700 bg-gray-900/50 rounded p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-mono text-blue-400">
                      #{index + 1}
                    </span>
                    <span className="text-xl font-mono font-bold text-blue-300">
                      {Math.round(entry.score)}점
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        endingColors[entry.ending] ||
                        'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }
                    >
                      {entry.ending}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs text-gray-300 font-mono">
                  <div>
                    <span className="text-blue-400">자유:</span> {Math.round(entry.freedom)}
                  </div>
                  <div>
                    <span className="text-gray-400">질서:</span> {Math.round(entry.order)}
                  </div>
                  <div>
                    <span className="text-emerald-400">신뢰:</span> {Math.round(entry.trust)}
                  </div>
                  <div>
                    <span className="text-purple-400">다양:</span> {Math.round(entry.diversity)}
                  </div>
                </div>
                <div className="text-xs text-gray-500 font-mono mt-1">
                  처리한 게시글: {entry.processedPosts}개
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

