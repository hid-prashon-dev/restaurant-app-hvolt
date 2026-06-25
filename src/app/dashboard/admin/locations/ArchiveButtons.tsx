'use client';

import { useActionState, useState } from 'react';
import { archiveServiceArea, archiveServiceLocation } from '@/app/actions/locations';
import { Button } from '@/components/ui/button';

function ConfirmArchiveModal({ isOpen, onClose, onConfirm, title, message, isPending }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border shadow-lg rounded-xl max-w-md w-full p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </div>
          <h2 className="text-xl font-bold font-heading text-foreground">{title}</h2>
          <p className="text-muted-foreground text-sm">
            {message}
          </p>
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="destructive" disabled={isPending} className="flex-1">
            {isPending ? 'Archiving...' : 'Archive'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ArchiveAreaButton({ id, name }: { id: string, name: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(archiveServiceArea, { success: false, error: null });

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setIsOpen(true)}
        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        Archive Area
      </Button>

      <form action={formAction}>
        <input type="hidden" name="id" value={id} />
        {isOpen && (
          <ConfirmArchiveModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title="Archive Area"
            message={`Are you sure you want to archive "${name}"? All locations inside this area will also be archived.`}
            isPending={isPending}
          />
        )}
      </form>
    </>
  );
}

export function ArchiveLocationButton({ id, name }: { id: string, name: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(archiveServiceLocation, { success: false, error: null });

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setIsOpen(true)}
        className="text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 h-6 px-1.5 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        Archive
      </Button>

      <form action={formAction}>
        <input type="hidden" name="id" value={id} />
        {isOpen && (
          <ConfirmArchiveModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title="Archive Location"
            message={`Are you sure you want to archive "${name}"? It will no longer be available for assignment.`}
            isPending={isPending}
          />
        )}
      </form>
    </>
  );
}
