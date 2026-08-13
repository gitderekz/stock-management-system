# Deployment Guidance

## Development

```bash
cd backend && npm start
npm --prefix frontend run dev
```

## Production

- Build the React frontend with `npm --prefix frontend run build`.
- Serve the Express API through a production Node.js process.
- Configure environment variables through `.env` or environment injection.
- Ensure database access is secure and permissioned.
- Use TLS to protect credentials and API traffic.
