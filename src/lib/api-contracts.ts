import type {
  ApiListResponse,
  ApiResponse,
  Booking,
  BookingStatus,
  BookingOffer,
  ChatMessage,
  ChatRoom,
  ChatRoomDetail,
  PricingMarketData,
  PricingAnalysis,
  FreelancerReview,
  EscrowStatus,
  ContractStatus,
  Contract,
  EventRequest,
  FreelancerProfile,
  PaymentStatus,
  Portfolio,
  Quote,
  Recommendation,
  RequestStatus,
  NotificationItem,
  Review,
  SavedFreelancer,
  ReviewStatus,
  SettlementStatus,
  User,
} from "@/types";

export type BackendResponse<T> = ApiResponse<T>;
export type BackendListResponse<T> = ApiListResponse<T>;

export type AuthUser = Pick<User, "id" | "name" | "email" | "user_type"> &
  Partial<
    Pick<
      User,
      | "phone"
      | "provider"
      | "has_password"
      | "needs_password_setup"
      | "is_active"
      | "created_at"
      | "customer_profile"
      | "freelancer_profile"
    >
  >;

export interface AuthSession {
  user: AuthUser;
  auth: {
    type: "httpOnlyCookie";
  };
}

export interface AdminDashboardData {
  new_requests: number;
  pending_recommendation: number;
  pending_freelancers: number;
  confirmed_bookings: number;
  completed_bookings: number;
  unpaid_payments: number;
  pending_settlements: number;
  pending_reviews: number;
}

export type AdminFreelancerRow = FreelancerProfile & {
  user?: Pick<User, "id" | "name" | "email" | "phone">;
};

export type AdminRequestRow = EventRequest & {
  customer?: Pick<User, "id" | "name" | "email">;
  _count?: {
    recommendations: number;
  };
};

export type AdminRequestDetail = Omit<EventRequest, "recommendations"> & {
  customer?: Pick<User, "id" | "name" | "email" | "phone"> & {
    customer_profile?: unknown;
  };
  recommendations?: Array<{
    id: string;
    display_order: number;
    recommendation_reason?: string;
    status?: string;
    request_id?: string;
    freelancer_id?: string;
    recommended_by?: string;
    freelancer: FreelancerProfile;
  }>;
  quotes?: Array<Quote & { freelancer?: Pick<FreelancerProfile, "id" | "display_name"> }>;
  bookings?: Array<Pick<Booking, "id" | "booking_status" | "final_price">>;
};

export type AdminBookingRow = Booking & {
  customer?: Pick<User, "id" | "name" | "email">;
  freelancer?: Pick<FreelancerProfile, "id" | "display_name" | "profile_image_url" | "profile_image_path">;
};

export interface AdminPaymentRow {
  id: string;
  event_title: string;
  event_date: string;
  final_price: number;
  platform_fee: number;
  payment_status: PaymentStatus;
  booking_status: BookingStatus;
  escrow_status?: EscrowStatus;
  customer?: Pick<User, "name" | "email">;
  freelancer?: Pick<FreelancerProfile, "display_name">;
}

export interface AdminSettlementRow {
  id: string;
  event_title: string;
  event_date: string;
  final_price: number;
  platform_fee: number;
  freelancer_amount: number;
  payment_status: PaymentStatus;
  settlement_status: SettlementStatus;
  escrow_status?: EscrowStatus;
  escrow_held_at?: string | null;
  escrow_released_at?: string | null;
  freelancer?: Pick<FreelancerProfile, "id" | "display_name">;
}

export type AdminReviewRow = Review & {
  customer?: Pick<User, "name" | "email">;
  freelancer?: Pick<FreelancerProfile, "display_name">;
  booking?: Pick<Booking, "event_title">;
};

export type BookingDetail = Booking & {
  quote?: Quote | null;
};

export interface FreelancerRequestItem {
  id: string;
  status: string;
  request?: Pick<
    EventRequest,
    | "id"
    | "event_title"
    | "event_type"
    | "event_date"
    | "region"
    | "budget_min"
    | "budget_max"
    | "status"
  >;
}

export interface FreelancerSettlementRow {
  id: string;
  event_title: string;
  event_date: string;
  final_price: number;
  platform_fee: number;
  freelancer_amount: number;
  booking_status: BookingStatus;
  payment_status: PaymentStatus;
  settlement_status: SettlementStatus;
  escrow_status?: EscrowStatus;
  escrow_held_at?: string | null;
  escrow_released_at?: string | null;
}

export interface PaymentPreparePayload {
  order_id: string;
  amount: number;
  order_name: string;
  customer_key: string;
  client_key: string;
}

export interface PaymentConfirmPayload {
  payment_key: string;
  order_id: string;
  amount: number;
  method?: string;
  approved_at?: string;
  status: "DONE";
  escrow_status?: EscrowStatus;
}

export type TossPaymentStatus =
  | "READY"
  | "IN_PROGRESS"
  | "WAITING_FOR_DEPOSIT"
  | "DONE"
  | "CANCELED"
  | "PARTIAL_CANCELED"
  | "ABORTED"
  | "EXPIRED";

export interface PaymentDetail {
  id: string;
  booking_id: string;
  order_id: string;
  payment_key?: string | null;
  amount: number;
  method?: string | null;
  status: TossPaymentStatus;
  requested_at?: string | null;
  approved_at?: string | null;
  failure_code?: string | null;
  failure_message?: string | null;
  created_at: string;
  updated_at: string;
  booking: Pick<
    Booking,
    | "id"
    | "event_title"
    | "event_date"
    | "final_price"
    | "customer_id"
    | "booking_status"
    | "payment_status"
    | "escrow_status"
    | "escrow_held_at"
    | "escrow_released_at"
  >;
}


export interface PricingAnalysisRequest {
  event_type: string;
  region: string;
  categories: string[];
  career_years_min?: number;
  career_years_max?: number;
  budget_min?: number;
  budget_max?: number;
  duration_hours?: number;
  request_id?: string;
}

export interface PricingAnalysisResult {
  analysis: PricingAnalysis;
  market_data: PricingMarketData;
}

export interface FreelancerReviewCreatePayload {
  booking_id: string;
  professionalism_score: number;
  communication_score: number;
  payment_promptness_score: number;
  respect_score: number;
  would_work_again: boolean;
  comment?: string;
}

export type StatusUpdatePayload = Partial<{
  booking_status: BookingStatus;
  payment_status: PaymentStatus;
  settlement_status: SettlementStatus;
  cancel_reason: string;
}>;

export type {
  Booking,
  BookingStatus,
  BookingOffer,
  ChatMessage,
  ChatRoom,
  ChatRoomDetail,
  PricingMarketData,
  PricingAnalysis,
  FreelancerReview,
  EscrowStatus,
  ContractStatus,
  Contract,
  EventRequest,
  FreelancerProfile,
  PaymentStatus,
  Portfolio,
  Quote,
  Recommendation,
  RequestStatus,
  NotificationItem,
  Review,
  SavedFreelancer,
  ReviewStatus,
  SettlementStatus,
};