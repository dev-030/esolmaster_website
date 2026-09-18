import { axios } from "@/lib/axios";
import { CompleteProfileDtoRequestDto, SignUpDtoRequestDto } from "@/types/auth";

export const signUp = async (signUpData: SignUpDtoRequestDto) => {
  const { data } = await axios.post("/auth/signup", signUpData);
  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data } = await axios.post("/auth/signin", { email, password });
  return data;
};

export const forgetPassword = async (email: string) => {
  const { data } = await axios.post("/auth/forget-password", { email });
  return data;
};

export const verifyResetCode = async (email: string, code: string) => {
  const { data } = await axios.post("/auth/verify-reset-code", { email, code });
  return data as { message: string; resetToken: string };
};

export const resetPassword = async (
  password: string,
  confirmPassword: string,
  resetToken: string,
) => {
  const { data } = await axios.post("/auth/reset-password", {
    password,
    confirmPassword,
    resetToken,
  });
  return data;
};

export const refreshToken = async () => {
  const { data } = await axios.post("/auth/refresh_token");
  return data;
};

export const signOut = async () => {
  const { data } = await axios.post("/auth/logout");
  return data;
};

export const getMe = async () => {
  const { data } = await axios.get("/auth/me");
  return data;
};

export const checkUsername = async (username: string) => {
  const { data } = await axios.get("/auth/check-username", {
    params: { username },
  });
  return data;
};

export const completeProfile = async (payload:CompleteProfileDtoRequestDto) => {
  const { data } = await axios.post("/auth/complete-profile", payload);
  return data;
}

export const myProfile = async () => {
  const { data } = await axios.get("/auth/my-profile");
  return data;
};

export const updateMyProfile = async (payload: {
  firstName?: string;
  lastName?: string;
  institution?: string;
  bio?: string;
}) => {
  const { data } = await axios.patch("/auth/my-profile", payload);
  return data;
};

export const changePassword = async (payload: {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  const { data } = await axios.post("/auth/change-password", payload);
  return data;
};

export const sendEmailOtp = async (payload: { newEmail: string }) => {
  const { data } = await axios.post("/auth/send-email-otp", payload);
  return data;
};

export const verifyEmailOtp = async (payload: { newEmail: string; code: string }) => {
  const { data } = await axios.post("/auth/verify-email-otp", payload);
  return data;
};

export interface UserSessionDto {
  id: string;
  browser: string;
  os: string;
  deviceType: "desktop" | "mobile" | "tablet";
  ipAddress: string;
  city: string;
  country: string;
  lastActiveAt: string;
  createdAt: string;
  isCurrent: boolean;
}

export const getSessions = async () => {
  const { data } = await axios.get<UserSessionDto[]>("/auth/sessions");
  return data;
};

export const revokeSession = async (sessionId: string) => {
  const { data } = await axios.delete(`/auth/sessions/${sessionId}`);
  return data;
};

export const revokeAllOtherSessions = async () => {
  const { data } = await axios.delete("/auth/sessions/all-other");
  return data;
};