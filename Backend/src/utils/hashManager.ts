import argon2 from "argon2";
export const hashPassword = async (password: string): Promise<string> => {
  try {
    return await argon2.hash(password);
  } catch (error) {
    throw new Error("Password hashing failed");
  }
};
