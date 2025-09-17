import { users } from "../drizzle/schema.js";
import jwt from "jsonwebtoken";
import { eq, or} from "drizzle-orm";
import bcrypt from "bcrypt";
import { db } from "./db.js";

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

interface User {
  id: number;
  username: string;
  email: string;
  password: string; // This should be a hashed password
}

export async function getAllUsers(): Promise<User[]> {
  const result = await db.select().from(users).execute();
  return result;
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  const result = await db.select().from(users).where(eq(users.username, username)).execute();
  return result[0];
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const result = await db.select().from(users).where(eq(users.email, email)).execute();
  return result[0];
}

export async function login(username: string, password: string): Promise<string | null> {
  try {
    // Only search by username, we'll verify password manually
    const result = await db.select().from(users).where(eq(users.username, username)).execute();
    
    if (result[0]) {
      // Compare the provided password with the stored hash
      const isValidPassword = await bcrypt.compare(password, result[0].password);
      
      if (isValidPassword) {
        const token = jwt.sign({ userId: result[0].id, username }, SECRET_KEY, { expiresIn: "3h" });
        return token;
      }
    }
  } catch(error) {
    console.error("Error during login:", error);
    return null;
  }
  
  return null;
}

export async function register(username: string, email: string, password: string): Promise<string | null> {
  try {
    const existingUser = await db.select().from(users).where(or(eq(users.username, username), eq(users.email, email))).execute();
    if (existingUser[0]) {
      return null; // User already exists
    }
    
    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await db.insert(users)
      .values({ username, password: hashedPassword, email })
      .returning()
      .execute();
      
    if (result[0]) {
      const token = jwt.sign({ userId: result[0].id, username }, SECRET_KEY, { expiresIn: "3h" });
      return token;
    }
  } catch(error) {
    console.error("Error during registration:", error);
    return null;
  }
  
  return null;
}

export async function updateUserInfo(userId: number, email: string, username: string): Promise<boolean> {
  try {
    await db.update(users)
      .set({ email, username })
      .where(eq(users.id, userId))
      .execute();
    return true;
  } catch (error) {
    console.error("Error updating user info:", error);
    return false;
  }
}

export async function updateUserPassword(userId: number, newPassword: string): Promise<boolean> {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId))
      .execute();
    return true;
  } catch (error) {
    console.error("Error updating user password:", error);
    return false;
  }
}
