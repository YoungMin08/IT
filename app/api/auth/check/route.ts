import { NextResponse } from 'next/server';

// GET: 인증 상태 확인 (간단한 구현)
export async function GET() {
  // 실제로는 세션이나 토큰으로 인증 상태를 확인해야 하지만
  // 교육용이므로 간단하게 구현
  return NextResponse.json({
    success: true,
    authenticated: false,
  });
}

