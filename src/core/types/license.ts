import type { SportId } from "./sport";

export type LicensePlan =
  | "FREE"
  | "SINGLE"
  | "MULTI"
  | "ULTIMATE";

export interface License {
  plan: LicensePlan;
  sports: SportId[];
  features: string[];
}