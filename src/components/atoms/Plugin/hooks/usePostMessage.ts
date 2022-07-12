import { RefObject, useCallback, useEffect, useRef } from "react";

import type { Ref } from "../IFrame";

export function usePostMessage(iFrameRef: RefObject<Ref>) {
  const messageQueue = useRef<any[]>([]);
  const iframeAvailable = useRef(false);
  const postMessage = useCallback(
    (msg: any) => {
      try {
        const message = JSON.parse(JSON.stringify(msg));
        if (iFrameRef.current) {
          iFrameRef.current.postMessage(message);
        } else {
          messageQueue.current.push(message);
        }
      } catch (err) {
        console.error("plugin error: failed to post message", err);
      }
    },
    [iFrameRef],
  );

  useEffect(() => {
    if (!iframeAvailable.current && iFrameRef.current) {
      if (messageQueue.current.length) {
        messageQueue.current.forEach(message => {
          iFrameRef.current?.postMessage(message);
        });
        messageQueue.current = [];
      }
    }
    iframeAvailable.current = !!iFrameRef.current;
  }, [iFrameRef]);

  return postMessage;
}
