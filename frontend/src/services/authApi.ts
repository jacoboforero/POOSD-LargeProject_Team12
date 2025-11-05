import axios from 'axios';

export interface RegisterRequest {
  email: string;
  name?: string;
  topics?: string[];
  interests?: string[];
  jobIndustry?: string;
  demographic?: string;
  location?: string;
  lifeStage?: string;
  newsStyle?: string;
  newsScope?: string;
  preferredHeadlines?: string[];
  scrollPastTopics?: string[];
}

export interface RegisterResponse {
  success: boolean;
  message: string;
}

export interface VerifyRequest {
  email: string;
  code: string;
}

export interface Session {
  token: string;
  user: {
    _id: string;
    email: string;
    name?: string;
    emailVerified: boolean;
    preferences: {
      topics: string[];
      interests: string[];
      jobIndustry?: string;
      demographic?: string;
    };
  };
}

/**
 * Register a new user
 * Matches the backend schema: User model preferences and Briefing model request structure
 */
export const registerUser = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const response = await axios.post<RegisterResponse>('/api/auth/register', {
    email: data.email.toLowerCase().trim(),
    name: data.name,
    topics: Array.isArray(data.topics) ? data.topics : (data.topics ? [data.topics] : []),
    interests: Array.isArray(data.interests) ? data.interests : (data.interests ? [data.interests] : []),
    jobIndustry: data.jobIndustry,
    demographic: data.demographic,
    location: data.location,
    lifeStage: data.lifeStage,
    newsStyle: data.newsStyle,
    newsScope: data.newsScope,
    preferredHeadlines: Array.isArray(data.preferredHeadlines) ? data.preferredHeadlines : (data.preferredHeadlines ? [data.preferredHeadlines] : []),
    scrollPastTopics: Array.isArray(data.scrollPastTopics) ? data.scrollPastTopics : (data.scrollPastTopics ? [data.scrollPastTopics] : []),
  });
  return response.data;
};

/**
 * Verify OTP code
 */
export const verifyOtp = async (data: VerifyRequest): Promise<Session> => {
  const response = await axios.post<Session>('/api/auth/verify', {
    email: data.email.toLowerCase().trim(),
    code: data.code,
  });
  return response.data;
};

/**
 * Login existing user
 */
export const loginUser = async (email: string): Promise<RegisterResponse> => {
  const response = await axios.post<RegisterResponse>('/api/auth/login', {
    email: email.toLowerCase().trim(),
  });
  return response.data;
};

/**
 * Generate a new briefing
 */
export const generateBriefing = async (token: string): Promise<{ briefingId: string }> => {
  const response = await axios.post<{ briefingId: string }>(
    '/api/briefings/generate',
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

/**
 * Get briefing status
 */
export const getBriefingStatus = async (
  briefingId: string,
  token: string
): Promise<{ status: string; progress?: number; statusReason?: string }> => {
  const response = await axios.get(`/api/briefings/${briefingId}/status`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Get complete briefing
 */
export const getBriefing = async (
  briefingId: string,
  token: string
): Promise<{ summary: { sections: Array<{ category?: string; text?: string }> } }> => {
  const response = await axios.get(`/api/briefings/${briefingId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

