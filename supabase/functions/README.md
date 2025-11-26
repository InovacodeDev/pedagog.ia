# Supabase Edge Functions Configuration

## Environment Variables Required

The following environment variables must be set for the Edge Functions to work:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (has admin access)
- `RESEND_API_KEY`: (Optional) For email notifications
- `OPENAI_API_KEY`: (Future) For real OCR processing

## Local Development

```bash
# Serve all functions locally
npx supabase functions serve --no-verify-jwt

# Serve specific function
npx supabase functions serve process-job --no-verify-jwt

# Test the function
curl -X POST http://localhost:54321/functions/v1/process-job \
  -H "Content-Type: application/json" \
  -d '{"job_id": "your-job-id-here"}'
```

## Deployment

```bash
# Deploy all functions
npx supabase functions deploy

# Deploy specific function
npx supabase functions deploy process-job
```

## Notes

- The `--no-verify-jwt` flag is for local development only
- In production, the trigger automatically passes the service role key
- Mock AI pipelines are used until OpenAI integration is added
