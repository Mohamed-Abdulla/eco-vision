type Reward = {
  id: string;
  userId: number;
  points: number;
  level: number;
  createdAt: Date;
  userName: string | null;
};
type Transaction = {
  id: string;
  type: "earned_report" | "earned_collect" | "redeemed";
  amount: number;
  description: string;
  date: string;
};
