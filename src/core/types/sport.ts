export type SportId =
  | "football"
  | "futsal"
  | "basketball"
  | "volleyball"
  | "handball"
  | "hockey";

export interface Sport {
  id: SportId;
  name: string;
  icon: string;
  courtImage?: string;
}