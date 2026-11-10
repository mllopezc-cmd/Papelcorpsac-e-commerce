export type CheckoutItem = {
  productId: string;
  quantity: number;
};

export type CheckoutRequest = {
  idempotencyKey: string;
  items: CheckoutItem[];
};

export type CheckoutSuccessResponse = {
  success: true;
  order: {
    id: string;
    status: "pending";
    currency: "PEN";
    totalCents: number;
  };
  replayed: boolean;
};

export type CheckoutErrorResponse = {
  success: false;
  error:
    | "Invalid Request"
    | "Unauthorized"
    | "Conflict"
    | "Service Unavailable"
    | "Internal Server Error";
};

export type CheckoutResponse = CheckoutSuccessResponse | CheckoutErrorResponse;
