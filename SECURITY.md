# Security Documentation

## Overview

This document outlines the security measures implemented in the AI Study Companion app to protect user data and prevent unauthorized access.

## Database Security

### Row Level Security (RLS)

All database tables have RLS enabled with restrictive policies:

#### Notes Table
- Users can only view, create, update, and delete their own notes
- No cross-user data access

#### Quiz Attempts Table
- Users can only view and create their own quiz attempts
- Quiz results are private to each user

#### User Stats Table
- Users can only view and update their own statistics
- Streak and mastery scores are protected

#### Study Sessions Table
- Users can only view and create their own study sessions
- Session data is private

#### Achievements & Badges
- Badge definitions are public (read-only)
- Users can only view their own earned achievements
- System-awarded badges cannot be manually created by users

#### Leaderboard
- Public read access for all authenticated users
- System-managed, no user write access

#### Study Groups
- Public groups visible to all authenticated users
- Private groups only visible to creator
- Only creators can update/delete groups
- Users can only join/leave groups they have access to

### Data Protection

1. **Authentication Required**: All operations require valid authentication
2. **User ID Verification**: All policies verify `auth.uid()` matches user_id
3. **No Direct Database Access**: All access goes through Supabase RLS
4. **Cascade Deletes**: Foreign key constraints prevent orphaned data

## API Security

### Edge Functions

All edge functions implement:

1. **CORS Protection**: Proper CORS headers configured
2. **Authentication**: Bearer token verification required
3. **Input Validation**: All inputs validated before processing
4. **Error Handling**: Errors logged but sensitive info not exposed
5. **Rate Limiting**: Automatic rate limiting by Supabase

### Environment Variables

Sensitive credentials stored in environment variables:
- `VITE_SUPABASE_URL`: Supabase project URL (public)
- `VITE_SUPABASE_ANON_KEY`: Anon key (public, RLS-protected)
- `GROQ_API_KEY`: Server-side only, never exposed to client

## Frontend Security

### Data Validation

- All user inputs sanitized before submission
- Type checking with TypeScript
- Client-side validation before API calls

### Session Management

- Automatic session refresh
- Secure token storage via Supabase SDK
- Auto-logout on session expiration

### XSS Protection

- React's built-in XSS protection
- No `dangerouslySetInnerHTML` usage
- All user content properly escaped

## Backend Security

### SQL Injection Prevention

- Supabase uses parameterized queries
- No raw SQL with user input
- All database functions use safe parameters

### Function Security

All database functions:
- Use `SECURITY DEFINER` where appropriate
- Validate all parameters
- Check user permissions
- Handle errors gracefully

## Automatic Security Features

### Stats Updates

- Streak tracking prevents manipulation
- Mastery scores calculated server-side
- Badge awards triggered automatically
- Leaderboard computed from verified data

### Data Integrity

- Triggers ensure consistency
- Foreign keys maintain relationships
- Check constraints validate data
- Default values prevent null issues

## Best Practices Implemented

1. **Principle of Least Privilege**: Users only access their own data
2. **Defense in Depth**: Multiple security layers
3. **Fail Secure**: Errors don't expose data
4. **Audit Trail**: Created_at timestamps on all records
5. **Data Minimization**: Only collect necessary data

## Security Checklist

- [x] RLS enabled on all tables
- [x] Restrictive policies on all tables
- [x] Authentication required for all operations
- [x] Input validation on all forms
- [x] CORS properly configured
- [x] No secrets in client code
- [x] Error messages don't leak sensitive info
- [x] Automatic session management
- [x] SQL injection prevention
- [x] XSS protection
- [x] CSRF protection (via Supabase)

## Reporting Security Issues

If you discover a security vulnerability, please report it immediately to the development team. Do not create public issues for security vulnerabilities.

## Regular Security Updates

- Dependencies updated monthly
- Security patches applied immediately
- Regular security audits
- Continuous monitoring of Supabase security advisories
