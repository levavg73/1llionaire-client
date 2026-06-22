// ─── 공통 API 타입 ───────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
}

export interface ApiListResponse<T = unknown> {
  success: boolean;
  data: {
    items: T[];
    pagination: Pagination;
  };
  message: string;
}

export interface ApiError {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details: { field: string; message: string }[];
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "SERVER_ERROR";

// ─── 사용자 ──────────────────────────────────────────────────

export type UserType = "customer" | "freelancer" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  user_type: UserType;
  phone?: string;
  provider?: string | null;
  has_password?: boolean;
  needs_password_setup?: boolean;
  is_active: boolean;
  created_at: string;
  customer_profile?: CustomerProfile | null;
  freelancer_profile?: FreelancerProfileSummary | null;
}

export interface CustomerProfile {
  id: string;
  customer_type?: string;
  company_name?: string;
  department?: string;
  manager_name?: string;
}

export interface FreelancerProfileSummary {
  id: string;
  display_name?: string;
  profile_image_url?: string | null;
  profile_image_path?: string | null;
  headline?: string;
  status: FreelancerStatus;
  avg_rating?: number;
  review_count: number;
}

// ─── 프리랜서 ────────────────────────────────────────────────

export type FreelancerStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "hidden"
  | "suspended";

export interface FreelancerProfile {
  id: string;
  user_id: string;
  display_name?: string;
  profile_image_url?: string | null;
  profile_image_path?: string | null;
  headline?: string;
  bio?: string;
  region?: string;
  available_regions: string[];
  categories: string[];
  styles: string[];
  career_years?: number;
  base_price_min?: number;
  base_price_max?: number;
  languages: string[];
  script_writing_available: boolean;
  rehearsal_available: boolean;
  travel_available: boolean;
  status: FreelancerStatus;
  avg_rating?: number;
  review_count: number;
  approved_at?: string;
  rejected_reason?: string;
  portfolios?: Portfolio[];
}

export interface Portfolio {
  id: string;
  freelancer_id: string;
  portfolio_type: "intro_video" | "event_video" | "audio_sample" | "other";
  title: string;
  description?: string;
  media_url: string;
  thumbnail_url?: string;
  category?: string;
  is_representative: boolean;
  is_public: boolean;
}

export interface SavedFreelancer {
  id: string;
  customer_id: string;
  freelancer_id: string;
  created_at: string;
  freelancer: FreelancerProfile;
}

// ─── 고객 요청서 ─────────────────────────────────────────────

export type RequestStatus =
  | "submitted"
  | "reviewing"
  | "recommending"
  | "recommended"
  | "consulting"
  | "booked"
  | "completed"
  | "reviewed"
  | "canceled"
  | "disputed";

export interface EventRequest {
  id: string;
  customer_id: string;
  event_title: string;
  event_type: string;
  event_date: string;
  start_time: string;
  end_time: string;
  region: string;
  venue?: string;
  budget_min?: number;
  budget_max?: number;
  preferred_freelancer_type: string[];
  preferred_styles: string[];
  required_language?: string;
  script_required: boolean;
  rehearsal_required: boolean;
  travel_required: boolean;
  description?: string;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
  recommendations?: Recommendation[];
  customer?: Pick<User, "id" | "name" | "email">;
}

// ─── 추천 후보 ───────────────────────────────────────────────

export type RecommendationStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "consultation_requested"
  | "selected"
  | "rejected";

export interface Recommendation {
  id: string;
  request_id: string;
  freelancer_id: string;
  recommended_by: string;
  recommendation_reason?: string;
  display_order: number;
  status: RecommendationStatus;
  freelancer: FreelancerProfile;
}

// ─── 견적 ────────────────────────────────────────────────────

export type QuoteStatus = "proposed" | "accepted" | "rejected" | "expired" | "canceled";

export interface Quote {
  id: string;
  request_id: string;
  freelancer_id: string;
  price: number;
  platform_fee: number;
  total_price: number;
  included_services?: string;
  script_included: boolean;
  rehearsal_included: boolean;
  travel_fee_included: boolean;
  message?: string;
  valid_until?: string;
  status: QuoteStatus;
  created_at: string;
}

// ─── 예약 ────────────────────────────────────────────────────

export type BookingStatus =
  | "pending"
  | "negotiating"
  | "accepted"
  | "rejected"
  | "payment_pending"
  | "confirmed"
  | "completion_requested"
  | "completed"
  | "canceled"
  | "disputed";
export type PaymentStatus = "unpaid" | "deposit_paid" | "fully_paid" | "refunded" | "failed";
export type SettlementStatus = "pending" | "scheduled" | "completed" | "held" | "failed";
export type EscrowStatus = "none" | "held" | "released" | "refunded";
export type ContractStatus = "draft" | "pending_customer" | "pending_freelancer" | "fully_signed" | "voided";

export interface Booking {
  id: string;
  customer_id: string;
  freelancer_id: string;
  event_title: string;
  event_date: string;
  start_time: string;
  end_time: string;
  venue?: string;
  final_price: number;
  platform_fee: number;
  freelancer_amount: number;
  booking_status: BookingStatus;
  payment_status: PaymentStatus;
  settlement_status: SettlementStatus;
  escrow_status?: EscrowStatus;
  escrow_held_at?: string | null;
  escrow_released_at?: string | null;
  completion_requested_at?: string | null;
  completed_at?: string | null;
  cancel_reason?: string;
  created_at: string;
  customer?: Pick<User, "id" | "name">;
  freelancer?: Pick<FreelancerProfile, "id" | "display_name" | "profile_image_url" | "profile_image_path">;
  chat_room?: ChatRoom | null;
  offers?: BookingOffer[];
  reviews?: Review[];
  contract?: Pick<
    Contract,
    | "id"
    | "status"
    | "customer_signed_at"
    | "freelancer_signed_at"
    | "fully_signed_at"
  > | null;
}

// ─── 후기 ────────────────────────────────────────────────────

export type ReviewStatus = "pending" | "published" | "hidden" | "reported";

export interface Review {
  id: string;
  booking_id: string;
  customer_id: string;
  freelancer_id: string;
  punctuality_score: number;
  voice_delivery_score: number;
  event_understanding_score: number;
  atmosphere_score: number;
  script_score: number;
  response_score: number;
  communication_score: number;
  total_score: number;
  rehire_intent: boolean;
  comment?: string;
  status: ReviewStatus;
  created_at: string;
  customer?: Pick<User, "name">;
  booking?: Pick<Booking, "event_title" | "event_date">;
}


// ─── 알림/상담/가격 제안 ─────────────────────────────────────

export interface NotificationItem {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link_url?: string | null;
  is_read: boolean;
  created_at: string;
  unread_count?: number;
}

export interface ChatRoom {
  id: string;
  booking_id: string;
  customer_id: string;
  freelancer_id: string;
  last_message_at?: string | null;
  created_at: string;
  updated_at: string;
  booking?: Pick<Booking, "id" | "event_title" | "event_date" | "booking_status" | "payment_status" | "final_price">;
  customer?: Pick<User, "id" | "name">;
  freelancer?: Pick<FreelancerProfile, "id" | "display_name">;
  messages?: ChatMessage[];
}

export interface BookingOffer {
  id: string;
  booking_id: string;
  sender_id: string;
  receiver_id: string;
  amount: number;
  message?: string | null;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  responded_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id?: string | null;
  message: string;
  message_type: "text" | "system" | "offer";
  offer_id?: string | null;
  is_read: boolean;
  created_at: string;
  sender?: Pick<User, "id" | "name" | "user_type"> | null;
  offer?: BookingOffer | null;
}

export interface ChatRoomDetail {
  room: ChatRoom;
  messages: ChatMessage[];
}


// ─── 계약서/에스크로/AI/의뢰인 후기 ─────────────────────────

export interface Contract {
  id: string;
  booking_id: string;
  content_json: Record<string, unknown>;
  status: ContractStatus;
  customer_signed_at?: string | null;
  customer_signature_hash?: string | null;
  freelancer_signed_at?: string | null;
  freelancer_signature_hash?: string | null;
  fully_signed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PricingAnalysisLineItem {
  name: string;
  description: string;
  estimated_price: number;
  reason: string;
}

export interface PricingAnalysis {
  event_summary: string;
  line_items: PricingAnalysisLineItem[];
  recommended_min: number;
  recommended_max: number;
  recommended_center: number;
  confidence: "high" | "medium" | "low";
  assumptions: string[];
  caution_notes: string[];
  generated_at: string;
}

export interface PricingMarketData {
  sample_count: number;
  avg_price_min: number;
  avg_price_max: number;
  market_min: number;
  market_max: number;
  avg_rating: string;
}

export interface FreelancerReview {
  id: string;
  booking_id: string;
  freelancer_id: string;
  customer_id: string;
  professionalism_score: number;
  communication_score: number;
  payment_promptness_score: number;
  respect_score: number;
  total_score: number;
  would_work_again: boolean;
  comment?: string | null;
  status: ReviewStatus;
  created_at: string;
  updated_at?: string;
  freelancer?: Pick<FreelancerProfile, "display_name">;
  customer?: Pick<User, "name">;
  booking?: Pick<Booking, "event_title" | "event_date">;
}

// ─── 상태 레이블 ─────────────────────────────────────────────

export const FREELANCER_STATUS_LABEL: Record<FreelancerStatus, string> = {
  draft: "작성 중",
  pending_review: "검수 대기",
  approved: "승인 완료",
  rejected: "반려",
  hidden: "비공개",
  suspended: "정지",
};

export const REQUEST_STATUS_LABEL: Record<RequestStatus, string> = {
  submitted: "접수 완료",
  reviewing: "검토 중",
  recommending: "후보 선정 중",
  recommended: "후보 추천 완료",
  consulting: "상담 진행 중",
  booked: "예약 완료",
  completed: "행사 완료",
  reviewed: "후기 등록",
  canceled: "취소",
  disputed: "분쟁",
};

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "수락 대기",
  negotiating: "가격 협상 중",
  accepted: "수락 완료",
  rejected: "거절",
  payment_pending: "결제 대기",
  confirmed: "예약 확정",
  completion_requested: "완료 승인 대기",
  completed: "행사 완료",
  canceled: "취소",
  disputed: "분쟁",
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  unpaid: "미결제",
  deposit_paid: "계약금 납부",
  fully_paid: "전액 납부",
  refunded: "환불",
  failed: "결제 실패",
};

export const SETTLEMENT_STATUS_LABEL: Record<SettlementStatus, string> = {
  pending: "정산 대기",
  scheduled: "정산 예정",
  completed: "정산 완료",
  held: "정산 보류",
  failed: "정산 실패",
};

export const ESCROW_STATUS_LABEL: Record<EscrowStatus, string> = {
  none: "에스크로 없음",
  held: "에스크로 보관",
  released: "정산 완료",
  refunded: "환불 완료",
};

export const CONTRACT_STATUS_LABEL: Record<ContractStatus, string> = {
  draft: "작성 중",
  pending_customer: "고객 서명 대기",
  pending_freelancer: "프리랜서 서명 대기",
  fully_signed: "서명 완료",
  voided: "무효",
};

export const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  pending: "검수 대기",
  published: "공개",
  hidden: "비공개",
  reported: "신고됨",
};
