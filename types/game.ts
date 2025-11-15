export interface Post {
  id: number;
  type: string;
  title: string;
  content: string;
  author: string;
  freedomImpact: number[]; // [approve, warn, delete]
  orderImpact: number[]; // [approve, warn, delete]
  trustImpact: number[]; // [approve, warn, delete]
  diversityImpact: number[]; // [approve, warn, delete]
}

export interface GameState {
  day: number;
  freedom: number;
  order: number;
  trust: number; // 신뢰도
  diversity: number; // 다양성
  currentPostIndex: number;
  processedPosts: Array<{
    postId: number;
    action: string;
    timestamp: string;
  }>;
  gameStatus: 'playing' | 'ended';
  endings: Array<{
    type: string;
    message: string;
  }>;
}

