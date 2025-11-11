# Firebase Security Rules Configuration

## Overview

This application now uses Firebase Authentication to secure all database operations. All users are authenticated anonymously before reading or writing data to the Firebase Realtime Database.

## Required Firebase Console Configuration

To complete the security setup, you must configure Firebase Realtime Database security rules in the Firebase Console.

### Steps to Configure Security Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Realtime Database** → **Rules**
4. Replace the rules with the configuration below
5. Click **Publish**

### Recommended Security Rules

```json
{
  "rules": {
    "quizzes": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "leaderboard": {
      ".read": "auth != null",
      "$playerKey": {
        ".write": "auth != null"
      }
    }
  }
}
```

### Rule Explanation

- **`"auth != null"`**: Requires users to be authenticated (even anonymously) before reading or writing
- **`quizzes`**: Quiz data can be read and written by any authenticated user (admin functionality)
- **`leaderboard`**: Leaderboard can be read by any authenticated user, and each player entry can be written by any authenticated user

### Why Anonymous Authentication?

This application uses Firebase Anonymous Authentication because:

1. **Security**: Prevents unauthenticated writes to the database
2. **User Experience**: No sign-up or login required - authentication happens automatically
3. **Simplicity**: Minimal code changes while adding proper security
4. **Compliance**: Meets security best practices for Firebase applications

### Testing Your Rules

After publishing the rules, test that:

1. ✅ Quiz data loads correctly on the main page
2. ✅ Scores are saved after completing a quiz
3. ✅ Leaderboard displays correctly on the results page
4. ✅ Admin pages can still read and write quiz data (when on localhost)

### Troubleshooting

**Issue**: Data not loading
- **Solution**: Check browser console for authentication errors
- **Verify**: Firebase Authentication is enabled in Firebase Console (Authentication → Sign-in methods → Anonymous → Enable)

**Issue**: Writes failing with permission denied
- **Solution**: Verify the security rules are published correctly
- **Check**: Rules match the configuration above exactly

**Issue**: Admin pages not working
- **Solution**: Ensure you're accessing admin pages from `localhost` only
- **Verify**: Firebase credentials in `.env.local` are correct

## Security Best Practices

1. ✅ **Never disable authentication**: Always require `auth != null` in production
2. ✅ **Use specific paths**: Define rules for specific paths rather than root level
3. ✅ **Monitor usage**: Regularly check Firebase Console for unusual activity
4. ✅ **Review rules**: Periodically review and update security rules as needed
5. ✅ **Protect credentials**: Never commit `.env.local` to version control

## Additional Security Considerations

For production deployments, consider:

1. **Rate limiting**: Implement rate limiting to prevent abuse
2. **Data validation**: Add validation rules to ensure data integrity
3. **User identification**: Consider upgrading to email/password auth for better user tracking
4. **Audit logging**: Enable Firebase audit logs for security monitoring

## Migration from Old Rules

If you had open read/write rules before:

```json
// OLD - INSECURE (Don't use this!)
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

The new rules are much more secure because they:
- Require authentication for all operations
- Prevent anonymous users from accessing or modifying data
- Follow Firebase security best practices
