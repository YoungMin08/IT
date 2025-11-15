'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GameGaugeProps {
  freedom: number;
  order: number;
  trust: number;
  diversity: number;
}

export function GameGauge({ freedom, order, trust, diversity }: GameGaugeProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Card className="border-blue-500/30 bg-blue-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-mono text-blue-400 flex items-center gap-2">
            <span className="text-xs">[자유도]</span>
            <span className="text-lg">{Math.round(freedom)}%</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-blue-300/60 mb-2 leading-relaxed">
            표현의 자유 수준. 높을수록 다양한 의견이 자유롭게 표현됩니다.
          </p>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-blue-900/30">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${freedom}%` }}
            />
          </div>
        </CardContent>
      </Card>
      <Card className="border-gray-500/30 bg-gray-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-mono text-gray-400 flex items-center gap-2">
            <span className="text-xs">[질서도]</span>
            <span className="text-lg">{Math.round(order)}%</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-gray-300/60 mb-2 leading-relaxed">
            커뮤니티의 질서 수준. 높을수록 안정적이지만 과도하면 억압적일 수 있습니다.
          </p>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-900/30">
            <div 
              className="h-full bg-gray-500 transition-all duration-300"
              style={{ width: `${order}%` }}
            />
          </div>
        </CardContent>
      </Card>
      <Card className="border-emerald-500/30 bg-emerald-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-mono text-emerald-400 flex items-center gap-2">
            <span className="text-xs">[신뢰도]</span>
            <span className="text-lg">{Math.round(trust)}%</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-emerald-300/60 mb-2 leading-relaxed">
            사용자들의 신뢰 수준. 적절한 규칙과 공정한 운영이 신뢰를 높입니다.
          </p>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-emerald-900/30">
            <div 
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${trust}%` }}
            />
          </div>
        </CardContent>
      </Card>
      <Card className="border-purple-500/30 bg-purple-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-mono text-purple-400 flex items-center gap-2">
            <span className="text-xs">[다양성]</span>
            <span className="text-lg">{Math.round(diversity)}%</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-purple-300/60 mb-2 leading-relaxed">
            의견의 다양성 수준. 다양한 목소리가 존재할수록 건강한 커뮤니티입니다.
          </p>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-purple-900/30">
            <div 
              className="h-full bg-purple-500 transition-all duration-300"
              style={{ width: `${diversity}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

