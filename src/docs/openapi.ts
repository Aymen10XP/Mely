import { env } from '../config/env.js';

const jsonContent = {
  'application/json': {
    schema: {
      type: 'object',
    },
  },
};

export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'MELY Backend API',
    version: '1.0.0',
    description:
      'Multi-tenant backend for bank employee workflows, authentication, password reset, and Zakat calculations.',
  },
  servers: [{ url: env.APP_BASE_URL }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    parameters: {
      tenantHeader: {
        name: 'x-tenant-id',
        in: 'header',
        required: false,
        schema: {
          type: 'string',
          format: 'uuid',
        },
        description:
          'Optional when the JWT already contains the tenant. If both header and JWT are provided, they must match.',
      },
    },
    schemas: {
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          name: { type: 'string', description: 'Bank name' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password', 'tenantId'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          tenantId: { type: 'string', format: 'uuid' },
        },
      },
      ForgotPasswordRequest: {
        type: 'object',
        required: ['email', 'tenantId'],
        properties: {
          email: { type: 'string', format: 'email' },
          tenantId: { type: 'string', format: 'uuid' },
        },
      },
      ResetPasswordRequest: {
        type: 'object',
        required: ['token', 'newPassword', 'tenantId'],
        properties: {
          token: { type: 'string' },
          newPassword: { type: 'string', minLength: 8 },
          tenantId: { type: 'string', format: 'uuid' },
        },
      },
      ZakatCalculationRequest: {
        type: 'object',
        required: ['assetType', 'grossAmount', 'nisabAmount'],
        properties: {
          assetType: {
            type: 'string',
            enum: ['gold', 'cash', 'business_assets'],
          },
          grossAmount: { type: 'number', minimum: 0 },
          deductions: { type: 'number', minimum: 0, default: 0 },
          nisabAmount: { type: 'number', minimum: 0 },
          notes: { type: 'string' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          details: {
            oneOf: [
              { type: 'string' },
              { type: 'object', additionalProperties: true },
              { type: 'array', items: { type: 'object', additionalProperties: true } },
            ],
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        responses: {
          '200': {
            description: 'Service is healthy',
            content: jsonContent,
          },
        },
      },
    },
    '/api/auth/register': {
      post: {
        summary: 'Register a bank admin and create a tenant',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Tenant and admin created',
            content: jsonContent,
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Authenticate a tenant-scoped user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: jsonContent,
          },
          '401': {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/auth/forgot-password': {
      post: {
        summary: 'Create a dev-only password reset token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ForgotPasswordRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Reset token generated in dev mode',
            content: jsonContent,
          },
        },
      },
    },
    '/api/auth/reset-password': {
      post: {
        summary: 'Reset a password with a valid token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ResetPasswordRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Password updated',
            content: jsonContent,
          },
          '400': {
            description: 'Invalid or expired token',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/zakat/calculate': {
      post: {
        summary: 'Calculate and persist a Zakat breakdown',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/tenantHeader' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ZakatCalculationRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Calculation stored successfully',
            content: jsonContent,
          },
          '401': {
            description: 'Missing or invalid JWT',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description: 'Tenant missing or mismatched',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
  },
} as const;

export const apiDocsHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>MELY API Docs</title>
    <link
      rel="stylesheet"
      href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"
    />
    <style>
      body {
        margin: 0;
        background: #f5f7fb;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '/api-docs.json',
        dom_id: '#swagger-ui',
      });
    </script>
  </body>
</html>`;
