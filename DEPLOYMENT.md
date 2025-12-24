# Deployment Guide

## Pre-Deployment Checklist

### Environment Setup
- [ ] Supabase project created and configured
- [ ] Database migrations applied
- [ ] Edge functions deployed
- [ ] Environment variables configured
- [ ] GROQ_API_KEY added to Supabase secrets

### Database
- [ ] All migrations successfully applied
- [ ] RLS policies verified
- [ ] Indexes created for performance
- [ ] Badges seeded in achievement_badges table
- [ ] Test data cleaned from production

### Edge Functions
- [ ] All functions deployed to Supabase
- [ ] CORS headers configured correctly
- [ ] Function URLs accessible
- [ ] API keys configured in secrets

### Security
- [ ] RLS enabled on all tables
- [ ] All policies tested
- [ ] No sensitive data in client code
- [ ] HTTPS enforced
- [ ] Authentication working correctly

### Performance
- [ ] Build completed without errors
- [ ] Bundle size optimized
- [ ] Images optimized
- [ ] Database queries indexed
- [ ] Caching configured

### Testing
- [ ] All features tested
- [ ] Authentication flows working
- [ ] Quiz generation working
- [ ] Study groups functional
- [ ] Leaderboard updating
- [ ] Badges awarding correctly
- [ ] Study path generating
- [ ] Concept maps displaying

## Deployment Steps

### 1. Build Application

```bash
npm run build
```

### 2. Deploy to Hosting Platform

#### Option A: Vercel (Recommended)

```bash
npm install -g vercel
vercel login
vercel --prod
```

#### Option B: Netlify

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

#### Option C: Custom Server

```bash
# Copy dist folder to server
scp -r dist/* user@server:/var/www/html/
```

### 3. Configure Environment Variables

On your hosting platform, set:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Database Setup

```sql
-- Verify all migrations applied
SELECT * FROM supabase_migrations.schema_migrations;

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Verify badges exist
SELECT COUNT(*) FROM achievement_badges;
```

### 5. Edge Functions Deployment

Edge functions are already deployed via the `mcp__supabase__deploy_edge_function` tool during development.

Verify all functions are deployed:
- extract-text
- summarize
- generate-quiz
- generate-quiz-groq
- analyze-papers
- generate-paper
- predict-paper

### 6. Post-Deployment Verification

Test these critical flows:

1. **Authentication**
   - Sign up new user
   - Sign in existing user
   - Sign out

2. **Notes**
   - Upload document
   - Extract text
   - Generate summary

3. **Quizzes**
   - Generate quiz from notes
   - Answer questions
   - Submit quiz
   - View results

4. **Stats & Badges**
   - Check user stats created
   - Verify streak tracking
   - Confirm badges award

5. **Community**
   - Create study group
   - Join group
   - View leaderboard

6. **Study Features**
   - View study path
   - Create concept map
   - Use Pomodoro timer

## Environment Variables

### Required

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Supabase Secrets (Server-side only)

```bash
GROQ_API_KEY=your_groq_api_key
```

Add to Supabase via:
Settings → Project Settings → Secrets

## Database Migrations

All migrations in `supabase/migrations/` are applied automatically when you run:

```bash
supabase db push
```

Or manually via the Supabase dashboard.

## Monitoring

### Health Checks

Monitor these endpoints:
- Application homepage: `https://your-domain.com`
- API health: Check edge functions via Supabase dashboard

### Logs

View logs in:
- Supabase Dashboard → Logs
- Hosting platform logs
- Browser console for client errors

### Metrics

Track:
- User registrations
- Quiz completions
- Active users
- Error rates
- API response times

## Rollback Plan

If issues occur:

1. **Revert Application**: Redeploy previous version
2. **Revert Database**: Supabase automatic backups available
3. **Revert Edge Functions**: Redeploy previous versions

## Scaling Considerations

### Database
- Supabase automatically scales
- Add indexes as needed
- Monitor query performance

### Edge Functions
- Automatically scale with traffic
- Monitor execution times
- Optimize slow functions

### Frontend
- CDN automatically handles traffic
- Enable caching headers
- Use image optimization

## Maintenance

### Regular Tasks

- Update dependencies monthly
- Review security advisories
- Monitor error logs
- Check database size
- Review slow queries
- Clean up old data

### Backup Strategy

Supabase provides:
- Automatic daily backups (30-day retention)
- Point-in-time recovery
- Manual backups available

## Support

For deployment issues:
- Check Supabase status: status.supabase.com
- Review application logs
- Check database migrations
- Verify environment variables
- Test edge functions individually

## Success Criteria

Deployment is successful when:
- [ ] Application loads without errors
- [ ] Users can sign up and sign in
- [ ] All features functional
- [ ] No console errors
- [ ] Performance is acceptable (<3s load)
- [ ] Database queries completing
- [ ] Edge functions responding
- [ ] RLS protecting data correctly
