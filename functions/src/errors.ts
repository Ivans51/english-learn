export interface ErrorResponse {
  error: string;
}

export function createErrorResponse(
  error: string,
  status: number,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({ error }),
    {
      status,
      headers: { ...corsHeaders, 'content-type': 'application/json' }
    }
  );
}

export function createSuccessResponse(
  data: unknown,
  status: number,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: { ...corsHeaders, 'content-type': 'application/json' }
    }
  );
}

// Common error responses
export const ErrorResponses = {
  badRequest: (message: string, corsHeaders: Record<string, string>) =>
    createErrorResponse(message, 400, corsHeaders),
  
  notFound: (message: string, corsHeaders: Record<string, string>) =>
    createErrorResponse(message, 404, corsHeaders),
  
  internalServerError: (message: string, corsHeaders: Record<string, string>) =>
    createErrorResponse(message, 500, corsHeaders),
  
  invalidRequestBody: (corsHeaders: Record<string, string>) =>
    createErrorResponse('Invalid request body', 400, corsHeaders),
  
  missingRequiredField: (field: string, corsHeaders: Record<string, string>) =>
    createErrorResponse(`Missing required field: ${field}`, 400, corsHeaders),
  
  missingRequiredFields: (fields: string, corsHeaders: Record<string, string>) =>
    createErrorResponse(`Missing required fields: ${fields}`, 400, corsHeaders),
};

// Common success responses
export const SuccessResponses = {
  created: (data: unknown, corsHeaders: Record<string, string>) =>
    createSuccessResponse(data, 201, corsHeaders),
  
  ok: (data: unknown, corsHeaders: Record<string, string>) =>
    createSuccessResponse(data, 200, corsHeaders),
};

// Log error with consistent formatting
export function logError(context: string, error: unknown): void {
  console.error(`Error in ${context}:`, error);
}

// Validate required fields in request body
export function validateRequiredFields(
  body: Record<string, unknown> | any,
  requiredFields: string[],
  corsHeaders: Record<string, string>
): Response | null {
  const missingFields = requiredFields.filter(field => !body[field]);
  
  if (missingFields.length > 0) {
    return ErrorResponses.missingRequiredFields(
      missingFields.join(', '),
      corsHeaders
    );
  }
  
  return null;
}