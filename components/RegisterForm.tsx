'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { API_ENDPOINTS } from '@/config/api';
import { fetchJsonWithLogs } from '@/lib/apiClient';

interface RegisterFormProps {
  onRegister: (user: { id: number; username: string }) => void;
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onRegister, onSwitchToLogin }: RegisterFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await fetchJsonWithLogs<{
        success: boolean;
        error?: string;
        user?: { id: number; username: string };
      }>(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        label: 'POST /api/auth/register',
      });

      if (data?.success && data.user) {
        onRegister(data.user);
      } else {
        setError(data?.error || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      setError('회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-blue-500/30 bg-blue-950/10 max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-mono text-blue-400 text-center">
          회원가입
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-mono text-gray-300 block mb-2">
              사용자명 (3자 이상)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-gray-100 font-mono text-sm focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="text-sm font-mono text-gray-300 block mb-2">
              비밀번호 (4자 이상)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-gray-100 font-mono text-sm focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          {error && (
            <div className="text-sm text-red-400 font-mono text-center">
              {error}
            </div>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-mono"
          >
            {loading ? '가입 중...' : '회원가입'}
          </Button>
          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-sm text-blue-400 hover:text-blue-300 font-mono underline"
            >
              로그인
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

