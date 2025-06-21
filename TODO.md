# Security & Authentication TODO

## 🚨 CRITICAL - Fix Immediately

### 2. Sanitize Error Messages
- **File**: `fastapi/api/auth.py` (lines 28, 89)
- **Action**: Replace `detail=f"Invalid authentication credentials: {str(e)}"` with generic message
- **Risk**: Information disclosure, system details leaked

### 3. Update CORS for Production
- **File**: `fastapi/api/main.py` (line 13)
- **Action**: Replace `http://localhost:3000` with actual production domains
- **Risk**: Authentication will fail in production

## ⚠️ HIGH PRIORITY - Before Production

### 4. Add Rate Limiting
- **Location**: FastAPI authentication endpoints
- **Action**: Implement rate limiting middleware (slowapi or similar)
- **Benefit**: Prevent brute force attacks

### 5. Sanitize Logging
- **Files**: `fastapi/api/auth.py` (lines 74, 79)
- **Action**: Remove sensitive data from log outputs (API keys, tokens)
- **Risk**: Credential exposure in log files

### 6. Add Token Expiration Checks
- **File**: `fastapi/api/auth.py`
- **Action**: Add explicit JWT expiration validation
- **Benefit**: Prevent race conditions during token refresh

## 📋 MEDIUM PRIORITY - Improvements

### 7. Implement Token Refresh
- **File**: `nextjs/src/utils/auth.ts`
- **Action**: Add automatic token refresh logic
- **Benefit**: Better user experience, session continuity

### 8. Add Session Timeout
- **Location**: Frontend auth context
- **Action**: Configure session timeout and auto-logout
- **Benefit**: Enhanced security for idle sessions

### 9. Input Validation
- **Location**: All FastAPI endpoints
- **Action**: Add Pydantic models for request validation
- **Benefit**: Prevent injection attacks, data integrity

### 10. Environment Configuration
- **Files**: Both frontend and backend
- **Action**: Audit all environment variables, add `.env.example` files
- **Benefit**: Proper configuration management

## 🔮 FUTURE ENHANCEMENTS

### 11. Role-Based Access Control (RBAC)
- **Action**: Implement granular permissions beyond school-based access
- **Benefit**: Fine-grained authorization control

### 12. Audit Logging
- **Action**: Log all authentication events and sensitive operations
- **Benefit**: Security monitoring and compliance

### 13. API Key Rotation
- **Action**: Implement automatic API key rotation mechanism
- **Benefit**: Reduced exposure window for compromised keys

### 14. Request Signing
- **Action**: Add HMAC signing for sensitive API calls
- **Benefit**: Additional layer of request integrity

## 📊 Current Security Score: 6.5/10

**Blockers for Production:**
- Items 1, 2, 3 must be completed
- Items 4, 5, 6 strongly recommended

**Notes:**
- Core authentication architecture is solid
- Supabase integration is well-implemented
- Main issues are operational security practices