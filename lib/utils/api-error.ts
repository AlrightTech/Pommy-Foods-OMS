/**
 * Standard API error response format
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message)
    this.name = "ApiError"
  }

  toJSON() {
    return {
      error: this.message,
      ...(this.details && { details: this.details }),
    }
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(400, message, details)
    this.name = "ValidationError"
  }
}

/**
 * Unauthorized error (401)
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string = "Unauthorized") {
    super(401, message)
    this.name = "UnauthorizedError"
  }
}

/**
 * Forbidden error (403)
 */
export class ForbiddenError extends ApiError {
  constructor(message: string = "Forbidden") {
    super(403, message)
    this.name = "ForbiddenError"
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends ApiError {
  constructor(resource: string = "Resource") {
    super(404, `${resource} not found`)
    this.name = "NotFoundError"
  }
}

/**
 * Conflict error (409)
 */
export class ConflictError extends ApiError {
  constructor(message: string) {
    super(409, message)
    this.name = "ConflictError"
  }
}

/**
 * Internal server error (500)
 */
export class InternalServerError extends ApiError {
  constructor(message: string = "Internal server error", details?: any) {
    super(500, message, details)
    this.name = "InternalServerError"
  }
}

