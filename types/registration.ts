export type RegistrationStatus = "AVAILABLE" | "WINNER";

export interface Registrant {
  timestamp: string;

  firstName: string;
  lastName: string;
  nickname: string;

  phone: string;
  email: string;

  uuid: string;

  status: RegistrationStatus;
  winner: boolean;
}

export interface RegistrationFormValues {
  firstName: string;
  lastName: string;

  nickname: string;

  phone: string;
  email: string;

  clientRequestId: string;
}

export interface ImportRegistrant {
  firstName: string;
  lastName: string;

  nickname: string;

  phone: string;
  email: string;
}

export interface ImportResult {
  inserted: number;
  skipped: number;
  errors: string[];
}