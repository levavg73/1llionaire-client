import { ChatRoomList } from "@/components/chat/ChatRoomList";

export default function FreelancerChatsPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">상담</h1>
        <p className="mt-1 text-sm text-muted-foreground">고객과 예약 상담 및 가격 협상을 진행하세요.</p>
      </div>
      <ChatRoomList basePath="/freelancer/chats" />
    </div>
  );
}
