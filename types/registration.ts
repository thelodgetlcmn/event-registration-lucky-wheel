export type RegistrationStatus = "AVAILABLE" | "WINNER";

export interface Registrant {
  timestamp: string;
  firstName: string;
  lastName: string;
  uuid: string;
  status: RegistrationStatus;
  winner: boolean;
}

export interface RegistrationFormValues {
  firstName: string;
  lastName: string;
  clientRequestId: string;
}

export interface ImportRegistrant {
  firstName: string;
  lastName: string;
}

export interface ImportResult {
  inserted: number;
  skipped: number;
  errors: string[];
}
