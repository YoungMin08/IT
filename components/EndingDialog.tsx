'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface EndingDialogProps {
  isOpen: boolean;
  ending: {
    type: string;
    message: string;
  } | null;
  onGoToLeaderboard: () => void;
}

export function EndingDialog({ isOpen, ending, onGoToLeaderboard }: EndingDialogProps) {
  if (!ending) return null;

  return (
    <Dialog open={isOpen}>
      <DialogContent className="bg-gray-900 border-gray-700 text-gray-100 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-mono text-blue-400 mb-2">
            [엔딩: {ending.type}]
          </DialogTitle>
          <DialogDescription className="text-gray-300 leading-relaxed">
            {ending.message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={onGoToLeaderboard}
            className="bg-blue-600 hover:bg-blue-700 text-white font-mono"
          >
            리더보드로 이동
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

