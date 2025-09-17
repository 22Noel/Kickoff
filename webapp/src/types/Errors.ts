export class UnexistingSessionUserError extends Error {
    constructor(message: string = "JWT token belongs to a non-existent user.") {
        super(message);
        this.name = "UnexistingSessionUserError";
    }
}

export class ExpiredSessionError extends Error {
    constructor(message: string = "JWT token has expired.") {
        super(message);
        this.name = "ExpiredSessionError";
    }
}

export class MissingTokenError extends Error {
    constructor(message: string = "JWT token is missing.") {
        super(message);
        this.name = "MissingTokenError";
    }
}
