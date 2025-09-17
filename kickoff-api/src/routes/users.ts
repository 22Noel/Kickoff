import { login, register } from "../persistence/users_repository.js";
import { getUserByUsername, getUserByEmail, updateUserInfo, updateUserPassword } from "../persistence/users_repository.js";
import { Router } from "express"

const userRouter = Router();
const DEBUG = process.env.DEBUG === "true";

userRouter.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400).send({ message: "Username, email and password are required" });
    return;
  }
  if (DEBUG) {
    console.log("Register request for user:", username);
  }
  const existingUser = await getUserByUsername(username);
  if (existingUser) {
    res.status(409).send({ message: "Username already exists" });
    return;
  }

  const existingEmail = await getUserByEmail(email);
  if (existingEmail) {
    res.status(409).send({ message: "Email already exists" });
    return;
  }

  const token: string | null = await register(username, email, password);
  if (!token) {
    res.status(500).send({ message: "Error registering user" });
    return;
  }
  res.status(201).send({ message: "User registered successfully", token });
});

userRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).send({ message: "Username and password are required" });
    return;
  }
  if (DEBUG) {
    console.log("Login request for user:", username);
  }
  const token: string | null = await login(username, password);
  if (!token) {
    res.status(401).send({ message: "Unauthorized: User not found" });
    return;
  }
  res.status(200).send({ message: "Login successful", token });
  // Proceed with login logic
});

userRouter.get("/:username", async (req, res) => {
  const { username } = req.params;
  if (DEBUG) {
    console.log("Get user request for username:", username);
  }
  const user = await getUserByUsername(username);
  if (!user) {
    res.status(404).send({ message: "User not found" });
    return;
  }
  res.status(200).send(user);
});

userRouter.put("/:userId", async (req, res) => {
  const { userId } = req.params;
  const parsedId = parseInt(userId);
  const { username, email } = req.body;
  if (DEBUG) {
    console.log("Update user request for userId:", userId);
  }
  const updatedUser = await updateUserInfo(parsedId, username, email);
  if (!updatedUser) {
    res.status(404).send({ message: "User not found" });
    return;
  }
  res.status(200).send(updatedUser);
});

userRouter.put("/:userId/password", async (req, res) => {
  const { newPassword } = req.body;
  const { userId } = req.params;
  const parsedId = parseInt(userId);
  if (DEBUG) {
    console.log("Update user password request for userId:", userId);
  }
  const updatedUser = await updateUserPassword(parsedId, newPassword);
  if (!updatedUser) {
    res.status(404).send({ message: "User not found" });
    return;
  }
  res.status(200).send(updatedUser);
});

export default userRouter;
