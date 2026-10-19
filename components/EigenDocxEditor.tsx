'use client';

import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from 'react';
import dynamic from 'next/dynamic';
import { blankDocumentBytes, runChromePrint } from '@docx-editor.dev/core';
import '@docx-editor.dev/core/styles/editor.css';
import { Loader2 } from 'lucide-react';

export interface EigenDocxEditorHandle {
  loadDocument: (source: Uint8Array | ArrayBuffer | 'blank') => void;
  saveDocument: () => Promise<ArrayBuffer | null>;
  getRawEditor: () => any;
  printDocument: () => Promise<void>;
  focus: () => void;
}

interface EigenDocxEditorProps {
  initialBytes?: Uint8Array | ArrayBuffer | null;
  documentTitle: string;
  isDark?: boolean;
  onChange?: () => void;
  onReady?: () => void;
  className?: string;
}

// Dynamically load DocxEditor client-side to prevent SSR window/document access
const DynamicDocxEditor = dynamic(
  () => import('@docx-editor.dev/react').then(mod => mod.DocxEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 w-full h-full flex flex-col items-center justify-center min-h-[500px] bg-slate-50 dark:bg-slate-950 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
        <span className="text-xs font-semibold">Initializing EigenPal DOCX Engine...</span>
      </div>
    ),
  }
);

export const EigenDocxEditor = forwardRef<EigenDocxEditorHandle, EigenDocxEditorProps>(
  (
    {
      initialBytes,
      documentTitle,
      isDark = false,
      onChange,
      onReady,
      className = '',
    },
    ref
  ) => {
    const editorComponentRef = useRef<any>(null);
    const editorInstanceRef = useRef<any>(null);
    const [currentSource, setCurrentSource] = useState<Uint8Array | ArrayBuffer | 'blank'>(() => {
      if (initialBytes) return initialBytes;
      try {
        return blankDocumentBytes();
      } catch {
        return 'blank';
      }
    });
    const [isEngineReady, setIsEngineReady] = useState(false);

    // Update document if initialBytes changes from parent
    useEffect(() => {
      if (initialBytes && initialBytes !== currentSource) {
        setCurrentSource(initialBytes);
        if (editorComponentRef.current?.load) {
          try {
            editorComponentRef.current.load(initialBytes);
          } catch (e) {
            console.warn('DocxEditor.load call error:', e);
          }
        }
      }
    }, [initialBytes, currentSource]);

    // Handle Editor Ready
    const handleEditorReady = useCallback((editor: any) => {
      editorInstanceRef.current = editor;
      setIsEngineReady(true);
      if (onReady) {
        onReady();
      }
    }, [onReady]);

    // Expose imperative handle to parent
    useImperativeHandle(
      ref,
      () => ({
        loadDocument: (source: Uint8Array | ArrayBuffer | 'blank') => {
          setCurrentSource(source);
          if (editorComponentRef.current?.load) {
            try {
              editorComponentRef.current.load(source);
            } catch (e) {
              console.warn('Failed to load into mounted editor:', e);
            }
          }
        },
        saveDocument: async (): Promise<ArrayBuffer | null> => {
          if (editorComponentRef.current?.save) {
            try {
              return await editorComponentRef.current.save();
            } catch (err) {
              console.error('Failed to save DOCX from editor:', err);
              return null;
            }
          }
          return null;
        },
        getRawEditor: () => {
          return editorInstanceRef.current || editorComponentRef.current?.getEditor?.();
        },
        printDocument: async () => {
          const raw = editorInstanceRef.current || editorComponentRef.current?.getEditor?.();
          if (raw && typeof runChromePrint === 'function') {
            try {
              await runChromePrint(raw);
              return;
            } catch (err) {
              console.warn('runChromePrint failed, falling back to window.print():', err);
            }
          }
          window.print();
        },
        focus: () => {
          editorComponentRef.current?.focus?.();
        },
      }),
      []
    );

    return (
      <div className={`w-full h-full min-h-[600px] flex flex-col ${className}`}>
        <DynamicDocxEditor
          ref={editorComponentRef}
          document={currentSource}
          colorMode={isDark ? 'dark' : 'light'}
          chrome={true}
          onReady={handleEditorReady}
          onChange={() => {
            if (onChange) onChange();
          }}
        />
      </div>
    );
  }
);

EigenDocxEditor.displayName = 'EigenDocxEditor';
