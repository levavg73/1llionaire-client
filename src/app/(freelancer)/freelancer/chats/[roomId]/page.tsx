import { ChatRoomView } from "@/components/chat/ChatRoomView";

export default function FreelancerChatRoomPage({ params }: { params: { roomId: string } }) {
  return <ChatRoomView roomId={params.roomId} basePath="/freelancer/chats" />;
}
