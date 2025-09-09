// Google Analytics Privacy Compliance Guide for PitchMoto

## PII PROTECTION MEASURES IMPLEMENTED:

### ✅ 1. URL Sanitization
- Removes query parameters that might contain PII
- Only allows marketing UTM parameters
- Strips email addresses from URLs

### ✅ 2. Page Title Sanitization  
- Removes email addresses from page titles
- Removes credit card patterns
- Removes SSN patterns

### ✅ 3. Event Label Sanitization
- All event labels are sanitized before sending
- PII patterns are replaced with placeholders like [email], [card]

### ✅ 4. Privacy Settings Enabled
- `anonymize_ip: true` - IP addresses are anonymized
- `allow_google_signals: false` - Disables cross-device tracking
- `allow_ad_personalization_signals: false` - Prevents ad targeting

### ✅ 5. Safe Event Tracking
- User IDs are never sent to GA4
- Only non-PII business metrics are tracked
- Pitch IDs are sanitized if they contain any PII patterns

## WHAT WE TRACK (PII-SAFE):
- Page views (sanitized URLs only)
- User actions (signup, pitch_view, upvote)
- Business metrics (conversion events)
- Marketing campaign data (UTM parameters only)

## WHAT WE DON'T TRACK:
- ❌ Email addresses
- ❌ Real names  
- ❌ Phone numbers
- ❌ Credit card information
- ❌ User-generated content with PII
- ❌ Internal user IDs that could identify individuals

## SUPABASE USER IDS:
- Supabase UUIDs are technically not PII as they're random
- However, we avoid sending them to GA4 as best practice
- Only use hashed/anonymized identifiers if needed

## RECOMMENDED PRACTICES:
1. Never pass user email/name to tracking functions
2. Always sanitize any user input before tracking
3. Use generic labels like 'user_action' instead of specific user data
4. Regular audits of what data is being sent to GA4

## GDPR/CCPA COMPLIANCE:
This configuration helps with privacy law compliance by:
- Minimizing data collection
- Anonymizing IP addresses  
- Preventing cross-device tracking
- Not collecting personal identifiers
