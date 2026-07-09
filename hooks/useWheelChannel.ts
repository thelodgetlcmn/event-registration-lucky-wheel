"use client";

import { useEffect, useRef } from "react";

import type { Registrant } from "@/types/registration";

const CHANNEL_NAME = "lucky-wheel-sync";

export type WheelSyncMessage =
  | { type: "spin"; spinKey: number; targetUuid: string; participants: Registrant[] }
  | { type: "close-celebration" }
  | { type: "reset" };

export function useWheelChannel(onMessage?: (message: WheelSyncMessage) => void) {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
      return;
    }

    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;

    channel.onmessage = (event: MessageEvent<WheelSyncMessage>) => {
      onMessageRef.current?.(event.data);
    };

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, []);

  function postMessage(message: WheelSyncMessage) {
    channelRef.current?.postMessage(message);
  }

  return { postMessage };
}