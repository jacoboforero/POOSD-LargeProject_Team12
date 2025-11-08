import axios from 'axios';

export interface RegisterRequest {
  name: string;
  email: string;
  password?: string;
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
    name?: string;
    email: string;
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
 * Check if user exists (for showing password field)
 */
export const checkUserExists = async (email: string): Promise<boolean> => {
  try {
    const response = await axios.post('/api/auth/check-user', {
      email: email.toLowerCase().trim(),
    });
    return response.data.exists || false;
  } catch (error) {
    console.error('Error checking user:', error);
    return false;
  }
};

/**
 * Login with email and password (sends OTP after verification)
 */
export const loginWithPassword = async (email: string, password: string): Promise<RegisterResponse> => {
  const response = await axios.post<RegisterResponse>('/api/auth/login-password', {
    email: email.toLowerCase().trim(),
    password: password,
  });
  return response.data;
};

/**
 * Register a new user
 * Matches the backend schema: User model preferences and Briefing model request structure
 */
export const registerUser = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const response = await axios.post<RegisterResponse>('/api/auth/register', {
    name: data.name.trim(),
    email: data.email.toLowerCase().trim(),
    password: data.password,
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
 * Login existing user (legacy OTP method)
 */
export const loginUser = async (email: string): Promise<RegisterResponse> => {
  const response = await axios.post<RegisterResponse>('/api/auth/login', {
    email: email.toLowerCase().trim(),
  });
  return response.data;
};

/**
 * Request password reset (sends OTP code to console)
 */
export const requestPasswordReset = async (email: string): Promise<RegisterResponse> => {
  const response = await axios.post<RegisterResponse>('/api/auth/forgot-password', {
    email: email.toLowerCase().trim(),
  });
  return response.data;
};

/**
 * Verify password reset code
 */
export const verifyResetCode = async (email: string, code: string): Promise<RegisterResponse> => {
  const response = await axios.post<RegisterResponse>('/api/auth/verify-reset-code', {
    email: email.toLowerCase().trim(),
    code: code,
  });
  return response.data;
};

/**
 * Reset password with verified code
 */
export const resetPassword = async (email: string, code: string, newPassword: string): Promise<RegisterResponse> => {
  const response = await axios.post<RegisterResponse>('/api/auth/reset-password', {
    email: email.toLowerCase().trim(),
    code: code,
    newPassword: newPassword,
  });
  return response.data;
};

