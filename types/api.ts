export interface ApiResponse<TData> {
  success: boolean;
  message: string;
  data: TData;
  error: string | null;
  statusCode: number;
}

export interface ApiErrorPayload {
  message: string;
  statusCode: number;
}

export interface CsrfTokenResponse {
  token: string;
}
