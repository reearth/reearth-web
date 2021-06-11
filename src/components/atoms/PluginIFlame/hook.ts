import { Ref, RefObject, useCallback, useEffect, useImperativeHandle, useRef } from "react";

export type RefType = {
  postMessage: (message: any) => void;
};

export default function useHook({
  html,
  ref,
  onLoad,
  onMessage,
}: {
  html?: string;
  ref?: Ref<RefType>;
  onLoad?: () => void;
  onMessage?: (message: any) => void;
} = {}): {
  loaded?: boolean;
  iframeRef: RefObject<HTMLIFrameElement>;
  onLoad?: () => void;
} {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      postMessage: (message: any) => {
        if (!iframeRef.current?.contentWindow) return;
        iframeRef.current.contentWindow.postMessage(message, "*");
      },
    }),
    [],
  );

  useEffect(() => {
    const cb = (ev: MessageEvent<any>) => {
      if (!iframeRef.current?.contentWindow) return;
      if (ev.source === iframeRef.current.contentWindow) {
        onMessage?.(ev.data);
      }
    };
    window.addEventListener("message", cb);
    return () => {
      window.removeEventListener("message", cb);
    };
  }, [onMessage]);

  const onIframeLoad = useCallback(() => {
    const body = iframeRef.current?.contentDocument?.body;
    if (!body) return;
    body.innerHTML = html;
    // exec scripts
    Array.from(body.querySelectorAll("script"))
      .map<[HTMLScriptElement, HTMLScriptElement]>(oldScript => {
        const newScript = document.createElement("script");
        for (const attr of oldScript.attributes) {
          newScript.setAttribute(attr.name, attr.value);
        }
        newScript.appendChild(document.createTextNode(oldScript.innerText));
        return [oldScript, newScript];
      })
      .forEach(([oldScript, newScript]) => {
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });
    onLoad?.();
  }, [html, onLoad]);

  return { iframeRef, onLoad: onIframeLoad };
}
