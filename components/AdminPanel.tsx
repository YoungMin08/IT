'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { API_ENDPOINTS } from '@/config/api';
import { Post } from '@/types/game';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { fetchJsonWithLogs } from '@/lib/apiClient';

interface AdminPanelProps {
  onGoToMenu?: () => void;
}

export function AdminPanel({ onGoToMenu }: AdminPanelProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [selectedType, setSelectedType] = useState<string>('전체');
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<Post | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    title: '',
    content: '',
    freedomImpact: ['', '', ''], // [approve, warn, delete]
    orderImpact: ['', '', ''],
    trustImpact: ['', '', ''],
    diversityImpact: ['', '', ''],
  });
  const [createValues, setCreateValues] = useState({
    type: '허위정보',
    title: '',
    content: '',
    author: '',
    freedomImpact: ['', '', ''], // [approve, warn, delete]
    orderImpact: ['', '', ''],
    trustImpact: ['', '', ''],
    diversityImpact: ['', '', ''],
  });

  const postTypes = useMemo(
    () => ['전체', '허위정보', '선동', '비판', '논쟁', '유익한글'],
    []
  );

  useEffect(() => {
    if (selectedType !== '전체') {
      // 타입이 선택되면 해당 타입만 로드
      loadPostsByType(selectedType);
    } else {
      // 전체는 모든 게시글 로드
      loadPosts();
    }
  }, [selectedType]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const { data } = await fetchJsonWithLogs<Post[]>(API_ENDPOINTS.POSTS, {
        label: 'GET /api/posts [admin:all]',
      });
      const postsData: Post[] = Array.isArray(data) ? (data as Post[]) : [];
      setPosts(postsData);
      setFilteredPosts(postsData);
    } catch (error) {
      console.error('게시글 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPostsByType = async (type: string) => {
    setLoading(true);
    try {
      const { data } = await fetchJsonWithLogs<Post[]>(API_ENDPOINTS.POSTS, {
        label: `GET /api/posts [admin:${type}]`,
      });
      const postsData: Post[] = Array.isArray(data) ? (data as Post[]) : [];
      const filtered = postsData.filter((post: Post) => post.type === type);
      setPosts(postsData);
      setFilteredPosts(filtered);
    } catch (error) {
      console.error('게시글 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (post: Post) => {
    setEditTarget(post);
    const toArray = (value: number | number[]) => {
      if (Array.isArray(value)) {
        return value.map(v => v.toString());
      }
      return [value.toString(), (value * 0.5).toString(), (-Math.abs(value) * 1.5).toString()];
    };
    setEditValues({
      title: post.title,
      content: post.content,
      freedomImpact: toArray(post.freedomImpact),
      orderImpact: toArray(post.orderImpact),
      trustImpact: toArray(post.trustImpact),
      diversityImpact: toArray(post.diversityImpact),
    });
    setEditError(null);
    setIsEditOpen(true);
  };

  const handleEditChange = (
    field:
      | 'title'
      | 'content'
      | 'freedomImpact'
      | 'orderImpact'
      | 'trustImpact'
      | 'diversityImpact',
    value: string | string[],
    index?: number
  ) => {
    setEditValues(prev => {
      if (index !== undefined && Array.isArray(prev[field])) {
        const newArray = [...(prev[field] as string[])];
        newArray[index] = value as string;
        return {
          ...prev,
          [field]: newArray,
        };
      }
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleSaveEdit = async () => {
    if (!editTarget) return;
    setIsSaving(true);
    setEditError(null);

    const trimmedTitle = editValues.title.trim();
    const trimmedContent = editValues.content.trim();
    
    const parseArray = (arr: string[]): number[] => {
      return arr.map(v => {
        const num = Number(v.trim());
        return Number.isNaN(num) ? 0 : num;
      });
    };

    const freedomValues = parseArray(editValues.freedomImpact);
    const orderValues = parseArray(editValues.orderImpact);
    const trustValues = parseArray(editValues.trustImpact);
    const diversityValues = parseArray(editValues.diversityImpact);

    if (!trimmedTitle) {
      setEditError('제목을 입력해주세요.');
      setIsSaving(false);
      return;
    }

    if (!trimmedContent) {
      setEditError('내용을 입력해주세요.');
      setIsSaving(false);
      return;
    }

    if (freedomValues.some(v => Number.isNaN(v)) || orderValues.some(v => Number.isNaN(v)) ||
        trustValues.some(v => Number.isNaN(v)) || diversityValues.some(v => Number.isNaN(v))) {
      setEditError('모든 영향 값은 숫자로 입력해주세요.');
      setIsSaving(false);
      return;
    }

    try {
      const { data, response } = await fetchJsonWithLogs<{
        success: boolean;
        error?: string;
        post?: Post;
      }>(API_ENDPOINTS.UPDATE_POST, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editTarget.id,
          title: trimmedTitle,
          content: trimmedContent,
          freedomImpact: freedomValues,
          orderImpact: orderValues,
          trustImpact: trustValues,
          diversityImpact: diversityValues,
        }),
        label: 'POST /api/posts/update',
      });
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || '게시글 수정에 실패했습니다.');
      }

      if (selectedType === '전체') {
        await loadPosts();
      } else {
        await loadPostsByType(selectedType);
      }

      setIsEditOpen(false);
      setEditTarget(null);
    } catch (error: unknown) {
      console.error('게시글 수정 실패:', error);
      setEditError(
        error instanceof Error ? error.message : '게시글 수정 중 오류가 발생했습니다.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditOpenChange = (open: boolean) => {
    setIsEditOpen(open);
    if (!open) {
      setEditTarget(null);
      setEditError(null);
    }
  };

  const handleOpenCreate = () => {
    setCreateValues({
      type: '허위정보',
      title: '',
      content: '',
      author: '',
      freedomImpact: ['', '', ''],
      orderImpact: ['', '', ''],
      trustImpact: ['', '', ''],
      diversityImpact: ['', '', ''],
    });
    setCreateError(null);
    setIsCreateOpen(true);
  };

  const handleCreateChange = (
    field:
      | 'type'
      | 'title'
      | 'content'
      | 'author'
      | 'freedomImpact'
      | 'orderImpact'
      | 'trustImpact'
      | 'diversityImpact',
    value: string | string[],
    index?: number
  ) => {
    setCreateValues(prev => {
      if (index !== undefined && Array.isArray(prev[field])) {
        const newArray = [...(prev[field] as string[])];
        newArray[index] = value as string;
        return {
          ...prev,
          [field]: newArray,
        };
      }
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleSaveCreate = async () => {
    setIsSaving(true);
    setCreateError(null);

    const trimmedTitle = createValues.title.trim();
    const trimmedContent = createValues.content.trim();
    const trimmedAuthor = createValues.author.trim();
    
    const parseArray = (arr: string[]): number[] => {
      return arr.map(v => {
        const num = Number(v.trim());
        return Number.isNaN(num) ? 0 : num;
      });
    };

    const freedomValues = parseArray(createValues.freedomImpact);
    const orderValues = parseArray(createValues.orderImpact);
    const trustValues = parseArray(createValues.trustImpact);
    const diversityValues = parseArray(createValues.diversityImpact);

    if (!trimmedTitle) {
      setCreateError('제목을 입력해주세요.');
      setIsSaving(false);
      return;
    }

    if (!trimmedContent) {
      setCreateError('내용을 입력해주세요.');
      setIsSaving(false);
      return;
    }

    if (!trimmedAuthor) {
      setCreateError('작성자를 입력해주세요.');
      setIsSaving(false);
      return;
    }

    if (freedomValues.some(v => Number.isNaN(v)) || orderValues.some(v => Number.isNaN(v)) ||
        trustValues.some(v => Number.isNaN(v)) || diversityValues.some(v => Number.isNaN(v))) {
      setCreateError('모든 영향 값은 숫자로 입력해주세요.');
      setIsSaving(false);
      return;
    }

    try {
      const { data, response } = await fetchJsonWithLogs<{
        success: boolean;
        error?: string;
        post?: Post;
      }>(API_ENDPOINTS.CREATE_POST, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: createValues.type,
          title: trimmedTitle,
          content: trimmedContent,
          author: trimmedAuthor,
          freedomImpact: freedomValues,
          orderImpact: orderValues,
          trustImpact: trustValues,
          diversityImpact: diversityValues,
        }),
        label: 'POST /api/posts/create',
      });
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || '게시글 생성에 실패했습니다.');
      }

      if (selectedType === '전체' || selectedType === createValues.type) {
        if (selectedType === '전체') {
          await loadPosts();
        } else {
          await loadPostsByType(selectedType);
        }
      }

      setIsCreateOpen(false);
    } catch (error: unknown) {
      console.error('게시글 생성 실패:', error);
      setCreateError(
        error instanceof Error ? error.message : '게시글 생성 중 오류가 발생했습니다.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDelete = (post: Post) => {
    setDeleteTarget(post);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      const { data, response } = await fetchJsonWithLogs<{
        success: boolean;
        error?: string;
      }>(API_ENDPOINTS.DELETE_POST, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: deleteTarget.id,
        }),
        label: 'POST /api/posts/delete',
      });
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || '게시글 삭제에 실패했습니다.');
      }

      if (selectedType === '전체') {
        await loadPosts();
      } else {
        await loadPostsByType(selectedType);
      }

      setIsDeleteOpen(false);
      setDeleteTarget(null);
    } catch (error: unknown) {
      console.error('게시글 삭제 실패:', error);
      alert(error instanceof Error ? error.message : '게시글 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateOpenChange = (open: boolean) => {
    setIsCreateOpen(open);
    if (!open) {
      setCreateError(null);
    }
  };

  const handleDeleteOpenChange = (open: boolean) => {
    setIsDeleteOpen(open);
    if (!open) {
      setDeleteTarget(null);
    }
  };

  const typeColors: Record<string, string> = {
    '허위정보': 'bg-red-500/20 text-red-400 border-red-500/30',
    '선동': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    '비판': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    '논쟁': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    '유익한글': 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400 font-mono">게시글 로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8 border-b border-blue-500/30 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-mono font-bold text-blue-400 tracking-wider">
                관리자 페이지
              </h1>
              <p className="text-sm text-blue-300/80 font-mono italic">
                게시글 타입별 필터링 및 관리
              </p>
            </div>
            {onGoToMenu && (
              <Button
                onClick={onGoToMenu}
                variant="outline"
                className="border-gray-700 text-gray-400 hover:bg-gray-800 font-mono text-xs"
              >
                메인으로
              </Button>
            )}
          </div>
        </div>

        {/* 필터 버튼 및 생성 버튼 */}
        <Card className="border-blue-500/30 bg-blue-950/10 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-mono text-blue-400">
                [필터]
              </CardTitle>
              <Button
                onClick={handleOpenCreate}
                className="bg-green-600 hover:bg-green-700 text-white font-mono text-xs"
                size="sm"
              >
                <Plus className="h-3 w-3 mr-1" />
                게시글 생성
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {postTypes.map(type => (
                <Button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  variant={selectedType === type ? 'default' : 'outline'}
                  className={
                    selectedType === type
                      ? 'bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs'
                      : 'border-gray-700 text-gray-400 hover:bg-gray-800 font-mono text-xs'
                  }
                >
                  {type}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 게시글 목록 */}
        <Card className="border-gray-500/30 bg-gray-950/10">
          <CardHeader>
            <CardTitle className="text-sm font-mono text-gray-400">
              [{selectedType} 게시글 목록]
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPosts.length === 0 ? (
              <div className="text-center text-gray-400 font-mono text-sm py-8">
                해당 타입의 게시글이 없습니다.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map(post => (
                  <Card
                    key={post.id}
                    className="border-gray-700 bg-gray-900/50"
                  >
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
                            <span className="text-xs text-gray-500 font-mono">
                              ID: {post.id} | 작성자: @{post.author}
                            </span>
                          </div>
                          <h3 className="text-base font-semibold text-gray-100 mb-2">
                            {post.title}
                          </h3>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-white"
                            onClick={() => handleOpenEdit(post)}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:text-red-300"
                            onClick={() => handleOpenDelete(post)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-300 leading-relaxed mb-3">
                        {post.content}
                      </p>
                      <div className="space-y-2 text-xs text-gray-400 font-mono pt-2 border-t border-gray-700">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            자유도: [
                            {Array.isArray(post.freedomImpact) ? (
                              post.freedomImpact.map((v, i) => (
                                <span key={i} className={v >= 0 ? 'text-blue-400' : 'text-red-400'}>
                                  {v > 0 ? '+' : ''}{v}{i < 2 ? ', ' : ''}
                                </span>
                              ))
                            ) : (
                              <span className={post.freedomImpact >= 0 ? 'text-blue-400' : 'text-red-400'}>
                                {post.freedomImpact > 0 ? '+' : ''}{post.freedomImpact}
                              </span>
                            )}
                            ]
                          </div>
                          <div>
                            질서도: [
                            {Array.isArray(post.orderImpact) ? (
                              post.orderImpact.map((v, i) => (
                                <span key={i} className={v >= 0 ? 'text-gray-400' : 'text-red-400'}>
                                  {v > 0 ? '+' : ''}{v}{i < 2 ? ', ' : ''}
                                </span>
                              ))
                            ) : (
                              <span className={post.orderImpact >= 0 ? 'text-gray-400' : 'text-red-400'}>
                                {post.orderImpact > 0 ? '+' : ''}{post.orderImpact}
                              </span>
                            )}
                            ]
                          </div>
                          <div>
                            신뢰도: [
                            {Array.isArray(post.trustImpact) ? (
                              post.trustImpact.map((v, i) => (
                                <span key={i} className={v >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                                  {v > 0 ? '+' : ''}{v}{i < 2 ? ', ' : ''}
                                </span>
                              ))
                            ) : (
                              <span className={post.trustImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                                {post.trustImpact > 0 ? '+' : ''}{post.trustImpact}
                              </span>
                            )}
                            ]
                          </div>
                          <div>
                            다양성: [
                            {Array.isArray(post.diversityImpact) ? (
                              post.diversityImpact.map((v, i) => (
                                <span key={i} className={v >= 0 ? 'text-purple-400' : 'text-red-400'}>
                                  {v > 0 ? '+' : ''}{v}{i < 2 ? ', ' : ''}
                                </span>
                              ))
                            ) : (
                              <span className={post.diversityImpact >= 0 ? 'text-purple-400' : 'text-red-400'}>
                                {post.diversityImpact > 0 ? '+' : ''}{post.diversityImpact}
                              </span>
                            )}
                            ]
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 italic">
                          [통과, 경고, 삭제] 순서
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditOpen} onOpenChange={handleEditOpenChange}>
        <DialogContent className="font-mono bg-gray-950 border border-blue-500/30 text-gray-200">
          <DialogHeader>
            <DialogTitle className="text-blue-400 text-lg tracking-wide">
              게시글 수정
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400">
              제목, 내용, 네 가지 영향 수치를 수정한 뒤 저장을 눌러주세요.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-title" className="text-xs text-gray-300">
                제목
              </Label>
              <Input
                id="edit-title"
                value={editValues.title}
                onChange={event => handleEditChange('title', event.target.value)}
                className="bg-gray-900 border-gray-700 text-gray-100"
                placeholder="제목을 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-content" className="text-xs text-gray-300">
                내용
              </Label>
              <Textarea
                id="edit-content"
                rows={6}
                value={editValues.content}
                onChange={event => handleEditChange('content', event.target.value)}
                className="bg-gray-900 border-gray-700 text-gray-100"
                placeholder="게시글 내용을 입력하세요"
              />
            </div>

            <div className="space-y-4">
              <div className="text-xs text-gray-400 font-mono border-b border-gray-700 pb-2">
                영향 수치: [통과, 경고, 삭제] 순서로 입력하세요
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-gray-300">자유도 영향</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      value={editValues.freedomImpact[0] ?? ''}
                      onChange={event =>
                        handleEditChange('freedomImpact', event.target.value, 0)
                      }
                      className="bg-gray-900 border-gray-700 text-gray-100 text-xs"
                      placeholder="통과"
                    />
                    <Input
                      value={editValues.freedomImpact[1] ?? ''}
                      onChange={event =>
                        handleEditChange('freedomImpact', event.target.value, 1)
                      }
                      className="bg-gray-900 border-gray-700 text-gray-100 text-xs"
                      placeholder="경고"
                    />
                    <Input
                      value={editValues.freedomImpact[2] ?? ''}
                      onChange={event =>
                        handleEditChange('freedomImpact', event.target.value, 2)
                      }
                      className="bg-gray-900 border-gray-700 text-gray-100 text-xs"
                      placeholder="삭제"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-300">질서도 영향</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      value={editValues.orderImpact[0] ?? ''}
                      onChange={event =>
                        handleEditChange('orderImpact', event.target.value, 0)
                      }
                      className="bg-gray-900 border-gray-700 text-gray-100 text-xs"
                      placeholder="통과"
                    />
                    <Input
                      value={editValues.orderImpact[1] ?? ''}
                      onChange={event =>
                        handleEditChange('orderImpact', event.target.value, 1)
                      }
                      className="bg-gray-900 border-gray-700 text-gray-100 text-xs"
                      placeholder="경고"
                    />
                    <Input
                      value={editValues.orderImpact[2] ?? ''}
                      onChange={event =>
                        handleEditChange('orderImpact', event.target.value, 2)
                      }
                      className="bg-gray-900 border-gray-700 text-gray-100 text-xs"
                      placeholder="삭제"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-300">신뢰도 영향</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      value={editValues.trustImpact[0] ?? ''}
                      onChange={event =>
                        handleEditChange('trustImpact', event.target.value, 0)
                      }
                      className="bg-gray-900 border-gray-700 text-gray-100 text-xs"
                      placeholder="통과"
                    />
                    <Input
                      value={editValues.trustImpact[1] ?? ''}
                      onChange={event =>
                        handleEditChange('trustImpact', event.target.value, 1)
                      }
                      className="bg-gray-900 border-gray-700 text-gray-100 text-xs"
                      placeholder="경고"
                    />
                    <Input
                      value={editValues.trustImpact[2] ?? ''}
                      onChange={event =>
                        handleEditChange('trustImpact', event.target.value, 2)
                      }
                      className="bg-gray-900 border-gray-700 text-gray-100 text-xs"
                      placeholder="삭제"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-300">다양성 영향</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      value={editValues.diversityImpact[0] ?? ''}
                      onChange={event =>
                        handleEditChange('diversityImpact', event.target.value, 0)
                      }
                      className="bg-gray-900 border-gray-700 text-gray-100 text-xs"
                      placeholder="통과"
                    />
                    <Input
                      value={editValues.diversityImpact[1] ?? ''}
                      onChange={event =>
                        handleEditChange('diversityImpact', event.target.value, 1)
                      }
                      className="bg-gray-900 border-gray-700 text-gray-100 text-xs"
                      placeholder="경고"
                    />
                    <Input
                      value={editValues.diversityImpact[2] ?? ''}
                      onChange={event =>
                        handleEditChange('diversityImpact', event.target.value, 2)
                      }
                      className="bg-gray-900 border-gray-700 text-gray-100 text-xs"
                      placeholder="삭제"
                    />
                  </div>
                </div>
              </div>
            </div>

            {editError && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
                {editError}
              </p>
            )}
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
              onClick={() => handleEditOpenChange(false)}
              disabled={isSaving}
            >
              취소
            </Button>
            <Button
              type="button"
              onClick={handleSaveEdit}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSaving ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 생성 다이얼로그 */}
      <Dialog open={isCreateOpen} onOpenChange={handleCreateOpenChange}>
        <DialogContent className="font-mono bg-gray-950 border border-green-500/30 text-gray-200 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-green-400 text-lg tracking-wide">
              게시글 생성
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400">
              새 게시글의 정보를 입력한 뒤 생성 버튼을 눌러주세요.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="create-type" className="text-xs text-gray-300">
                타입
              </Label>
              <select
                id="create-type"
                value={createValues.type}
                onChange={event => handleCreateChange('type', event.target.value)}
                className="w-full bg-gray-900 border border-gray-700 text-gray-100 rounded-md px-3 py-2 text-sm"
              >
                {postTypes.filter(t => t !== '전체').map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-title" className="text-xs text-gray-300">
                제목
              </Label>
              <Input
                id="create-title"
                value={createValues.title}
                onChange={event => handleCreateChange('title', event.target.value)}
                className="bg-gray-900 border-gray-700 text-gray-100"
                placeholder="제목을 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-content" className="text-xs text-gray-300">
                내용
              </Label>
              <Textarea
                id="create-content"
                rows={6}
                value={createValues.content}
                onChange={event => handleCreateChange('content', event.target.value)}
                className="bg-gray-900 border-gray-700 text-gray-100"
                placeholder="게시글 내용을 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-author" className="text-xs text-gray-300">
                작성자
              </Label>
              <Input
                id="create-author"
                value={createValues.author}
                onChange={event => handleCreateChange('author', event.target.value)}
                className="bg-gray-900 border-gray-700 text-gray-100"
                placeholder="작성자 이름을 입력하세요"
              />
            </div>

            <div className="space-y-4">
              <div className="text-xs text-gray-400 font-mono border-b border-gray-700 pb-2">
                영향 수치: [통과, 경고, 삭제] 순서로 입력하세요
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-gray-300">자유도 영향</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      value={createValues.freedomImpact[0] ?? ''}
                      onChange={event =>
                        handleCreateChange('freedomImpact', event.target.value, 0)
                      }
                      className="bg-gray-900 border-gray-700 text-gray-100 text-xs"
                      placeholder="통과"
                    />
                    <Input
                      value={createValues.freedomImpact[1] ?? ''}
                      onChange={event =>
                        handleCreateChange('freedomImpact', event.target.value, 1)
                      }
                      className="bg-gray-900 border-gray-700 text-gray-100 text-xs"
                      placeholder="경고"
                    />
                    <Input
                      value={createValues.freedomImpact[2] ?? ''}
                      onChange={event =>
                        handleCreateChange('freedomImpact', event.target.value, 2)
                      }
                      className="bg-gray-900 border-gray-700 text-gray-100 text-xs"
                      placeholder="삭제"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-300">질서도 영향</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      value={createValues.orderImpact[0] ?? ''}
                      onChange={event =>
                        handleCreateChange('orderImpact', event.target.value, 0)
                      }
                      className="bg-gray-900 border-gray-700 text-gray-100 text-xs"
                      placeholder="통과"
                    />
                    <Input
                      value={createValues.orderImpact[1] ?? ''}
                      onChange={event =>
                        handleCreateChange('orderImpact', event.target.value, 1)
                      }
                      className="bg-gray-900 border-gray-700 text-gray-100 text-xs"
                      placeholder="경고"
                    />
                    <Input
                      value={createValues.orderImpact[2] ?? ''}
                      onChange={event =>
                        handleCreateChange('orderImpact', event.target.value, 2)
                      }
                      className="bg-gray-900 border-gray-700 text-gray-100 text-xs"
                      placeholder="삭제"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-300">신뢰도 영향</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      value={createValues.trustImpact[0] ?? ''}
                      onChange={event =>
                        handleCreateChange('trustImpact', event.target.value, 0)
                      }
                      className="bg-gray-900 border-gray-700 text-gray-100 text-xs"
                      placeholder="통과"
                    />
                    <Input
                      value={createValues.trustImpact[1] ?? ''}
                      onChange={event =>
                        handleCreateChange('trustImpact', event.target.value, 1)
                      }
                      className="bg-gray-900 border-gray-700 text-gray-100 text-xs"
                      placeholder="경고"
                    />
                    <Input
                      value={createValues.trustImpact[2] ?? ''}
                      onChange={event =>
                        handleCreateChange('trustImpact', event.target.value, 2)
                      }
                      className="bg-gray-900 border-gray-700 text-gray-100 text-xs"
                      placeholder="삭제"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-300">다양성 영향</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      value={createValues.diversityImpact[0] ?? ''}
                      onChange={event =>
                        handleCreateChange('diversityImpact', event.target.value, 0)
                      }
                      className="bg-gray-900 border-gray-700 text-gray-100 text-xs"
                      placeholder="통과"
                    />
                    <Input
                      value={createValues.diversityImpact[1] ?? ''}
                      onChange={event =>
                        handleCreateChange('diversityImpact', event.target.value, 1)
                      }
                      className="bg-gray-900 border-gray-700 text-gray-100 text-xs"
                      placeholder="경고"
                    />
                    <Input
                      value={createValues.diversityImpact[2] ?? ''}
                      onChange={event =>
                        handleCreateChange('diversityImpact', event.target.value, 2)
                      }
                      className="bg-gray-900 border-gray-700 text-gray-100 text-xs"
                      placeholder="삭제"
                    />
                  </div>
                </div>
              </div>
            </div>

            {createError && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
                {createError}
              </p>
            )}
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
              onClick={() => handleCreateOpenChange(false)}
              disabled={isSaving}
            >
              취소
            </Button>
            <Button
              type="button"
              onClick={handleSaveCreate}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSaving ? '생성 중...' : '생성'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={isDeleteOpen} onOpenChange={handleDeleteOpenChange}>
        <DialogContent className="font-mono bg-gray-950 border border-red-500/30 text-gray-200">
          <DialogHeader>
            <DialogTitle className="text-red-400 text-lg tracking-wide">
              게시글 삭제 확인
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400">
              정말로 이 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>

          {deleteTarget && (
            <div className="py-4">
              <p className="text-sm text-gray-300 mb-2">
                <span className="text-gray-500">ID:</span> {deleteTarget.id}
              </p>
              <p className="text-sm text-gray-300 mb-2">
                <span className="text-gray-500">타입:</span> {deleteTarget.type}
              </p>
              <p className="text-sm text-gray-300">
                <span className="text-gray-500">제목:</span> {deleteTarget.title}
              </p>
            </div>
          )}

          <DialogFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
              onClick={() => handleDeleteOpenChange(false)}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

