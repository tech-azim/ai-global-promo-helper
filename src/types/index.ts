export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  contact?: string;
  favorite_drink?: string;
  tags: string[];
  embedding?: number[];
  created_at: string;
  updated_at: string;
}

export interface CustomerFormData {
  name: string;
  contact?: string;
  favorite_drink?: string;
  tags: string[];
}

export interface PromoTheme {
  theme: string;
  segment_description: string;
  target_tags: string[];
  target_count: number;
  why_now: string;
  message: string;
  best_time?: string;
}

export interface PromoCampaign {
  id: string;
  theme: string;
  segment_description: string;
  target_tags: string[];
  target_count: number;
  why_now: string;
  message: string;
  best_time?: string;
  week_label: string;
  generated_at: string;
}

export interface TagCount {
  tag: string;
  count: number;
}

export interface DashboardData {
  total_customers: number;
  new_customers_this_week: number;
  top_interests: TagCount[];
  this_week_campaigns: PromoCampaign[];
}

export type DashboardStats = {
  total_customers: number;
  new_customers_this_week: number;
  top_interests: Record<string, number>;
  this_week_campaigns: PromoCampaign[];
};

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
