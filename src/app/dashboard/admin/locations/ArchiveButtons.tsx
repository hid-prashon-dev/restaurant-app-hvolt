'use client';

import { useState, useTransition } from 'react';
import { archiveServiceArea, archiveServiceLocation, restoreServiceArea, restoreServiceLocation } from '@/app/actions/locations';
import { Button } from '@/components/ui/button';

function ConfirmModal({ isOpen, onClose, onConfirm, title, message }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border shadow-lg rounded-xl max-w-md w-full p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </div>
          <h2 className="text-xl font-bold font-heading text-foreground">{title}</h2>
          <p className="text-muted-foreground text-sm">{message}</p>
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} className="flex-1">
            Archive
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ArchiveAreaButton({ id, name, onOptimistic, onError }: { id: string, name: string, onOptimistic?: () => void, onError?: (err: string | null) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    setIsOpen(false);
    startTransition(async () => {
      onOptimistic?.();
      const fd = new FormData();
      fd.append('id', id);
      const res = await archiveServiceArea(null, fd);
      if (!res.success) {
        onError?.(res.error);
      }
    });
  };

  return (
    <>
      <div className="flex flex-col items-end">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsOpen(true)}
          disabled={isPending}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          Archive Area
        </Button>
      </div>

      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title="Archive Area"
        message={`Are you sure you want to archive "${name}"? All locations inside this area will also be archived.`}
      />
    </>
  );
}

export function ArchiveLocationButton({ id, name, onOptimistic, onError }: { id: string, name: string, onOptimistic?: () => void, onError?: (err: string | null) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    setIsOpen(false);
    startTransition(async () => {
      onOptimistic?.();
      const fd = new FormData();
      fd.append('id', id);
      const res = await archiveServiceLocation(null, fd);
      if (!res.success) {
        onError?.(res.error);
      }
    });
  };

  return (
    <>
      <div className="flex flex-col items-end">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsOpen(true)}
          disabled={isPending}
          className="text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 h-6 px-1.5 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          Archive
        </Button>
      </div>

      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title="Archive Location"
        message={`Are you sure you want to archive "${name}"? It will no longer be available for assignment.`}
      />
    </>
  );
}

export function RestoreAreaButton({ id, name, onOptimistic, onError }: { id: string, name: string, onOptimistic?: () => void, onError?: (err: string | null) => void }) {
  const [isPending, startTransition] = useTransition();

  const handleRestore = () => {
    startTransition(async () => {
      onOptimistic?.();
      const fd = new FormData();
      fd.append('id', id);
      const res = await restoreServiceArea(null, fd);
      if (!res.success) {
        onError?.(res.error);
      }
    });
  };

  return (
    <div className="flex flex-col items-end">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleRestore}
        disabled={isPending}
        className="h-7 px-3 text-xs font-bold disabled:opacity-50"
      >
        Restore Area
      </Button>
    </div>
  );
}

export function RestoreLocationButton({ id, name, parentAreaActive, onOptimistic, onError }: { id: string, name: string, parentAreaActive: boolean, onOptimistic?: () => void, onError?: (err: string | null) => void }) {
  const [isPending, startTransition] = useTransition();

  const handleRestore = () => {
    if (!parentAreaActive) {
      onError?.('Restore the parent area before restoring this location.');
      return;
    }
    startTransition(async () => {
      onOptimistic?.();
      const fd = new FormData();
      fd.append('id', id);
      const res = await restoreServiceLocation(null, fd);
      if (!res.success) {
        onError?.(res.error);
      }
    });
  };

  return (
    <div className="flex flex-col items-end">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleRestore}
        disabled={isPending}
        className="h-7 px-3 text-xs font-bold disabled:opacity-50"
      >
        Restore Location
      </Button>
    </div>
  );
}
