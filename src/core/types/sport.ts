export type SportId =
  | "football"
  | "futsal"
  | "basketball"
  | "volleyball"
  | "handball"
  | "tennis"
  | "referee"
  | "other";

export interface Sport {
  id: SportId;
  name: string;
  icon: string;
  courtImage?: string;
}