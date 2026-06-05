import type {
  BackendListResponse,
  BackendResponse,
  ChatMessage,
  ChatRoom,
  ChatRoomDetail,
} from "../lib/api-contracts";
import http, { toQueryParams } from "../http";

export const chatApi = {
  getRooms: (params?: Record<string, unknown>) =>
    http.get<BackendListResponse<ChatRoom>>("/api/chat/rooms", {
      params: toQueryParams(params),
    }),

  getRoomMessages: (roomId: string) =>
    http.get<BackendResponse<ChatRoomDetail>>(`/api/chat/rooms/${roomId}/messages`),

  sendMessage: (roomId: string, message: string) =>
    http.post<BackendResponse<ChatMessage>>(`/api/chat/rooms/${roomId}/messages`, {
      message,
    }),

  markRoomAsRead: (roomId: string) =>
    http.patch<BackendResponse<null>>(`/api/chat/rooms/${roomId}/read`),
};
