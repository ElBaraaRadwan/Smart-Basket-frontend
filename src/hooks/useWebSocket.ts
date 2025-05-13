import { useEffect, useRef, useCallback } from "react";
import config from "../config/environment";

export interface WebSocketMessage<T = unknown> {
  type: string;
  payload: T;
}

interface WebSocketOptions {
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useWebSocket<T = unknown>(
  path: string,
  onMessage: (message: WebSocketMessage<T>) => void,
  options: WebSocketOptions = {}
) {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const {
    onOpen,
    onClose,
    onError,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
  } = options;

  const connect = useCallback(() => {
    if (ws.current?.readyState !== WebSocket.OPEN) {
      const fullUrl = `${config.WS_URL}${path}`;
      ws.current = new WebSocket(fullUrl);

      ws.current.onopen = () => {
        console.log("WebSocket connected");
        reconnectAttempts.current = 0;
        if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current);
        }
        onOpen?.();
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          onMessage(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.current.onclose = (event) => {
        console.log("WebSocket disconnected, attempting to reconnect...");
        onClose?.();

        if (reconnectAttempts.current < maxReconnectAttempts) {
          if (reconnectTimeout.current) {
            clearTimeout(reconnectTimeout.current);
          }
          reconnectTimeout.current = setTimeout(() => {
            reconnectAttempts.current += 1;
            connect();
          }, reconnectInterval);
        } else {
          console.error("Max reconnection attempts reached");
        }
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        onError?.(error);
        ws.current?.close();
      };
    }
  }, [
    path,
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnectInterval,
    maxReconnectAttempts,
  ]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: WebSocketMessage<T>) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not connected");
    }
  }, []);

  return {
    sendMessage,
    isConnected: ws.current?.readyState === WebSocket.OPEN,
    reconnect: connect,
  };
}
