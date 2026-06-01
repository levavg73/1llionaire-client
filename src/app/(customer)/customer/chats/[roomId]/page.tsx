import { ChatRoomView } from "@/components/chat/ChatRoomView";

export default function CustomerChatRoomPage({ params }: { params: { roomId: string } }) {
  return <ChatRoomView roomId={params.roomId} basePath="/customer/chats" />;
}
