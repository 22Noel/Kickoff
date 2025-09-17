export default class UnexistingUserError extends Error {
  constructor(userId: number) {
    super(`User with ID ${userId} does not exist.`);
    this.name = "UnexistingUserError";
    this.message = `User with ID ${userId} does not exist.`;
  }
}
