import type { RegistrationStatus } from "@/types/registration";

export type SortDirection = "asc" | "desc";
export type RegistrantSortKey = "timestamp" | "firstName" | "lastName" | "status" | "winner";
export type StatusFilter = "ALL" | RegistrationStatus;

export interface TableState {
  search: string;
  status: StatusFilter;
  sortKey: RegistrantSortKey;
  sortDirection: SortDirection;
  page: number;
  pageSize: number;
}

export interface DashboardCounts {
  totalRegistered: number;
  remaining: number;
  winnerCount: number;
}
