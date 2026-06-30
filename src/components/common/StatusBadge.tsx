import { Badge } from "@/components/ui/badge";
import {
  FreelancerStatus,
  RequestStatus,
  BookingStatus,
  PaymentStatus,
  SettlementStatus,
  ReviewStatus,
  EscrowStatus,
  ContractStatus,
  TransactionStatus,
  TransactionStatusInput,
  FREELANCER_STATUS_LABEL,
  REQUEST_STATUS_LABEL,
  BOOKING_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
  SETTLEMENT_STATUS_LABEL,
  REVIEW_STATUS_LABEL,
  ESCROW_STATUS_LABEL,
  CONTRACT_STATUS_LABEL,
  TRANSACTION_STATUS_LABEL,
  getTransactionStatus,
} from "@/types";

type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning"
  | "info"
  | "gold";

// 상태 → variant 매핑
const freelancerVariant: Record<FreelancerStatus, BadgeVariant> = {
  draft: "outline",
  pending_review: "warning",
  approved: "success",
  rejected: "destructive",
  hidden: "secondary",
  suspended: "destructive",
};

const requestVariant: Record<RequestStatus, BadgeVariant> = {
  submitted: "info",
  reviewing: "warning",
  recommending: "warning",
  recommended: "gold",
  consulting: "info",
  booked: "success",
  completed: "success",
  reviewed: "success",
  canceled: "secondary",
  disputed: "destructive",
};

const bookingVariant: Record<BookingStatus, BadgeVariant> = {
  pending: "warning",
  negotiating: "info",
  accepted: "warning",
  rejected: "destructive",
  payment_pending: "gold",
  confirmed: "info",
  completion_requested: "warning",
  completed: "success",
  canceled: "secondary",
  disputed: "destructive",
};

const transactionVariant: Record<TransactionStatus, BadgeVariant> = {
  contract_pending: "warning",
  in_progress: "info",
  completed: "success",
  canceled: "secondary",
};

const paymentVariant: Record<PaymentStatus, BadgeVariant> = {
  unpaid: "destructive",
  deposit_paid: "warning",
  fully_paid: "success",
  refunded: "secondary",
  failed: "destructive",
};

const settlementVariant: Record<SettlementStatus, BadgeVariant> = {
  pending: "warning",
  scheduled: "info",
  completed: "success",
  held: "destructive",
  failed: "destructive",
};

const reviewVariant: Record<ReviewStatus, BadgeVariant> = {
  pending: "warning",
  published: "success",
  hidden: "secondary",
  reported: "destructive",
};

const escrowVariant: Record<EscrowStatus, BadgeVariant> = {
  none: "secondary",
  held: "warning",
  released: "success",
  refunded: "secondary",
};

const contractVariant: Record<ContractStatus, BadgeVariant> = {
  draft: "secondary",
  pending_customer: "warning",
  pending_freelancer: "warning",
  fully_signed: "success",
  voided: "destructive",
};

export function FreelancerStatusBadge({ status }: { status: FreelancerStatus }) {
  return <Badge variant={freelancerVariant[status]}>{FREELANCER_STATUS_LABEL[status]}</Badge>;
}

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  return <Badge variant={requestVariant[status]}>{REQUEST_STATUS_LABEL[status]}</Badge>;
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return <Badge variant={bookingVariant[status]}>{BOOKING_STATUS_LABEL[status]}</Badge>;
}

export function TransactionStatusBadge({ booking }: { booking: TransactionStatusInput }) {
  const status = getTransactionStatus(booking);
  return <Badge variant={transactionVariant[status]}>{TRANSACTION_STATUS_LABEL[status]}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge variant={paymentVariant[status]}>{PAYMENT_STATUS_LABEL[status]}</Badge>;
}

export function SettlementStatusBadge({ status }: { status: SettlementStatus }) {
  return <Badge variant={settlementVariant[status]}>{SETTLEMENT_STATUS_LABEL[status]}</Badge>;
}

export function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  return <Badge variant={reviewVariant[status]}>{REVIEW_STATUS_LABEL[status]}</Badge>;
}

export function EscrowStatusBadge({ status }: { status: EscrowStatus }) {
  if (status === "none") {
    return null;
  }

  return <Badge variant={escrowVariant[status]}>{ESCROW_STATUS_LABEL[status]}</Badge>;
}

export function ContractStatusBadge({ status }: { status: ContractStatus }) {
  return <Badge variant={contractVariant[status]}>{CONTRACT_STATUS_LABEL[status]}</Badge>;
}

export function UserRoleBadge({ role }: { role: "customer" | "freelancer" | "admin" }) {
  const map = { customer: "고객", freelancer: "프리랜서", admin: "관리자" };
  const variantMap: Record<string, BadgeVariant> = {
    customer: "info",
    freelancer: "gold",
    admin: "default",
  };

  return <Badge variant={variantMap[role]}>{map[role]}</Badge>;
}
