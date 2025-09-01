'use client'

import { createContext, useContext, useRef, useCallback, ReactNode } from 'react';

interface IframeManagerContextType {
  transferIframe: (targetContainerId: string, iframeId: string) => boolean;
  createPreloadedIframe: (src: string, iframeId: string) => void;
  isIframeLoaded: (iframeId: string) => boolean;
}

const IframeManagerContext = createContext<IframeManagerContextType | null>(null);

export function IframeManagerProvider({ children }: { children: ReactNode }) {
  const preloadContainerRef = useRef<HTMLDivElement>(null);

  const createPreloadedIframe = useCallback((src: string, iframeId: string) => {
    if (!preloadContainerRef.current) return;
    
    // 检查是否已经存在
    const existingIframe = document.getElementById(iframeId);
    if (existingIframe) return;

    const iframe = document.createElement('iframe');
    iframe.id = iframeId;
    iframe.src = src;
    iframe.title = 'Preloaded Iframe';
    iframe.className = 'w-full h-full border-0';
    iframe.allow = 'microphone';
    iframe.tabIndex = -1;
    iframe.setAttribute('aria-hidden', 'true');
    
    iframe.onload = () => {
      iframe.setAttribute('data-loaded', 'true');
    };

    preloadContainerRef.current.appendChild(iframe);
  }, []);

  const transferIframe = useCallback((targetContainerId: string, iframeId: string) => {
    const iframe = document.getElementById(iframeId);
    const targetContainer = document.getElementById(targetContainerId);
    
    if (!iframe || !targetContainer) {
      return false;
    }

    // 移除所有隐藏样式，准备显示
    iframe.style.position = '';
    iframe.style.left = '';
    iframe.style.top = '';
    iframe.style.width = '';
    iframe.style.height = '';
    iframe.style.visibility = '';
    iframe.style.pointerEvents = '';
    iframe.className = 'w-full h-full border-0';
    iframe.tabIndex = 0;
    iframe.removeAttribute('aria-hidden');

    // 将iframe移动到目标容器
    targetContainer.appendChild(iframe);
    return true;
  }, []);

  const isIframeLoaded = useCallback((iframeId: string) => {
    const iframe = document.getElementById(iframeId);
    return iframe?.getAttribute('data-loaded') === 'true';
  }, []);

  return (
    <IframeManagerContext.Provider value={{ 
      transferIframe, 
      createPreloadedIframe, 
      isIframeLoaded 
    }}>
      {children}
      {/* 隐藏的预加载容器 */}
      <div 
        ref={preloadContainerRef}
        className="absolute -left-[9999px] -top-[9999px] w-px h-px invisible pointer-events-none"
      />
    </IframeManagerContext.Provider>
  );
}

export function useIframeManager() {
  const context = useContext(IframeManagerContext);
  if (!context) {
    throw new Error('useIframeManager must be used within IframeManagerProvider');
  }
  return context;
}
