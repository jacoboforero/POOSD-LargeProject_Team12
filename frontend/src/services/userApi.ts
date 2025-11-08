import axios from "axios";

export interface UserPreferences {
  topics: string[];
  interests: string[];
  jobIndustry?: string;
  demographic?: string;
  location?: string;
  lifeStage?: string;
  newsStyle?: string;
  newsScope?: string;
  preferredHeadlines?: string[];
  scrollPastTopics?: string[];
}

export interface UserLimits {
  dailyGenerateCap: number;
  generatedCountToday: number;
  resetAt: string;
}

export interface UserProfile {
  _id: string;
  name?: string;
  email: string;
  emailVerified: boolean;
  preferences: UserPreferences;
  limits: UserLimits;
  timezone?: string;
  notificationPrefs: {
    onBriefingReady: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProfileUpdatePayload {
  name?: string;
  timezone?: string;
  preferences?: Partial<UserPreferences>;
  notificationPrefs?: {
    onBriefingReady?: boolean;
  };
}

const withAuth = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getCurrentUserProfile = async (): Promise<UserProfile> => {
  const response = await axios.get<UserProfile>("/api/me", withAuth());
  localStorage.setItem("user", JSON.stringify(response.data));
  return response.data;
};

export const updateUserProfile = async (payload: ProfileUpdatePayload): Promise<UserProfile> => {
  const response = await axios.put<UserProfile>("/api/me", payload, withAuth());
  localStorage.setItem("user", JSON.stringify(response.data));
  return response.data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
