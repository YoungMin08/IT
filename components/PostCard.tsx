'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Post } from '@/types/game';

interface PostCardProps {
  post: Post;
  onAction: (action: 'approve' | 'warn' | 'delete') => void;
  isLoading?: boolean;
}

const typeColors: Record<string, string> = {
  '허위정보': 'bg-red-500/20 text-red-400 border-red-500/30',
  '선동': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  '비판': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  '논쟁': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  '유익한글': 'bg-green-500/20 text-green-400 border-green-500/30',
};

export function PostCard({ post, onAction, isLoading = false }: PostCardProps) {
  const [isCooldown, setIsCooldown] = useState(false);
  const cooldownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownTimer.current) {
        clearTimeout(cooldownTimer.current);
      }
    };
  }, []);

  const handleAction = (action: 'approve' | 'warn' | 'delete') => {
    if (isLoading || isCooldown) {
      return;
    }
    onAction(action);
    setIsCooldown(true);
    if (cooldownTimer.current) {
      clearTimeout(cooldownTimer.current);
    }
    cooldownTimer.current = setTimeout(() => {
      setIsCooldown(false);
    }, 1000);
  };

  return (
    <Card className="border-gray-700 bg-gray-900/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant="outline" 
                className={typeColors[post.type] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}
              >
                {post.type}
              </Badge>
              <span className="text-xs text-gray-400 font-mono">@{post.author}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-100 mb-2 leading-tight">
              {post.title}
            </h3>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
          {post.content}
        </p>
        
        <div className="pt-4 border-t border-gray-700">
          <div className="flex gap-2">
            <Button
              onClick={() => handleAction('approve')}
              disabled={isLoading || isCooldown}
              className="flex-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/30 font-mono text-xs"
              variant="outline"
            >
              ✓ 통과
            </Button>
            <Button
              onClick={() => handleAction('warn')}
              disabled={isLoading || isCooldown}
              className="flex-1 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 border border-yellow-500/30 font-mono text-xs"
              variant="outline"
            >
              ⚠ 경고
            </Button>
            <Button
              onClick={() => handleAction('delete')}
              disabled={isLoading || isCooldown}
              className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 font-mono text-xs"
              variant="outline"
            >
              ✗ 삭제
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

