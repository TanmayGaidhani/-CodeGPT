# ✅ Clean User Registration Schema

## Simple 3-Field Registration

### Required Fields Only:
1. **Full Name** - Minimum 2 characters
2. **Email** - Valid email format (unique)
3. **Password** - Minimum 6 characters

## Database Schema (MongoDB)

```javascript
{
  id: String,
  name: String (required, min 2 chars),
  email: String (required, unique, lowercase),
  passwordHash: String (required),
  profilePicture: String (default: ''),
  createdAt: Date (auto),
  lastLogin: Date (auto)
}
```

## Registration Form

**public/login.html:**
```
1. Full Name      [text input]     - Required
2. Email Address  [email input]    - Required
3. Password       [password input] - Required (min 6 chars)
```

## API Response

**Success Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "profilePicture": ""
  }
}
```

## Validation Rules

### Backend (server.js):
- ✅ Name: minimum 2 characters, trimmed
- ✅ Email: valid format, unique, lowercase
- ✅ Password: minimum 6 characters, hashed with bcrypt

### Frontend (public/login.html):
- ✅ Name validation (min 2 chars)
- ✅ Email format validation
- ✅ Password length validation (min 6 chars)
- ✅ User-friendly error messages

## How to Test

1. **Open**: http://localhost:3000/login.html
2. **Click**: "Create one"
3. **Fill in**:
   - Full Name: John Doe
   - Email: john@example.com
   - Password: password123
4. **Submit**: Creates account and logs in
5. **Redirects**: to /chat

## Features

✅ Simple 3-field registration
✅ Email uniqueness validation
✅ Password hashing with bcrypt
✅ JWT token authentication
✅ User profile data storage
✅ Profile picture support (for future)
✅ Automatic timestamps
✅ Clean and minimal design

**Removed fields:**
- ❌ Username (removed)
- ❌ Bio (removed)

**Final schema: Name, Email, Password only!**