# Security Notes

- JWT authentication is used for protected routes.
- Passwords are expected to be hashed server-side before storage.
- All sensitive APIs are protected behind backend authorization middleware.
- Express Helmet and CORS are enabled.
- Rate limiting is enabled.
- File uploads are expected to validate MIME type, file extension, and size.
- Never expose database credentials or password hashes through API responses.
