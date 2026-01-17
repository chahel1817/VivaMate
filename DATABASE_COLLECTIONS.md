# VivaMate Database Collections Guide

## Essential Collections (Keep These)

### 1. **users**
- **Purpose**: Stores user account information
- **Used by**: Authentication system
- **Fields**: username, email, password (hashed), createdAt
- **Keep**: ✅ YES

### 2. **posts**
- **Purpose**: Stores forum posts and comments
- **Used by**: Forum page (`/forum`)
- **Fields**: title, content, author, comments[], date
- **Keep**: ✅ YES
- **API Endpoints**: 
  - GET `/api/forum` - Fetch all posts
  - POST `/api/forum` - Create new post
  - POST `/api/forum/:id/comment` - Add comment to post

### 3. **feedbacks**
- **Purpose**: Stores user feedback on interviews
- **Used by**: Analytics page feedback feature
- **Fields**: interviewId, userId, rating, comment, date
- **Keep**: ✅ YES
- **API Endpoint**: POST `/api/feedback`

### 4. **messages**
- **Purpose**: Stores user-to-user messages
- **Used by**: Messaging system
- **Fields**: sender, recipient, content, read, createdAt
- **Keep**: ✅ YES
- **API Endpoints**:
  - GET `/api/messages` - Get user messages
  - POST `/api/messages` - Send message

### 5. **interviewsessions**
- **Purpose**: Stores complete interview session data with scores
- **Used by**: Dashboard analytics, performance tracking
- **Fields**: user, sessionId, topic, difficulty, overallScore, averageTechnical, averageClarity, averageConfidence, perQuestionFeedback[], skillMetrics[], timestamps
- **Keep**: ✅ YES
- **API Endpoint**: GET `/api/dashboard/stats`

### 6. **responses**
- **Purpose**: Stores individual question-answer responses
- **Used by**: Interview sessions, detailed analytics
- **Fields**: sessionId, question, transcript, scores (technical, clarity, confidence), feedback
- **Keep**: ✅ YES

## Duplicate/Unnecessary Collections (Can Delete)

### ❌ **feedback** (singular)
- **Reason**: Duplicate of `feedbacks` (plural)
- **Action**: Delete this collection, keep `feedbacks`

### ❌ **interviews** (if exists separately from interviewsessions)
- **Reason**: Replaced by `interviewsessions` which has more comprehensive data
- **Action**: Delete if it's a duplicate/old version

## How to Clean Up Database

### Using MongoDB Compass:
1. Connect to your MongoDB database
2. Navigate to your database (likely named `vivamate` or similar)
3. Delete these collections:
   - `feedback` (singular - keep `feedbacks` plural)
   - `interviews` (if it exists and is different from `interviewsessions`)

### Using MongoDB Shell:
```javascript
use vivamate  // or your database name
db.feedback.drop()  // Delete singular feedback
db.interviews.drop()  // Delete if duplicate
```

## Data Flow

### Forum Posts:
```
User creates post → POST /api/forum → Saved to `posts` collection → Displayed on /forum page
```

### Interview Results:
```
User completes interview → POST /api/interview/summary → Saved to `interviewsessions` collection → Displayed on /analytics dashboard
```

### User Feedback:
```
User rates interview → POST /api/feedback → Saved to `feedbacks` collection → Stored for future analysis
```

### Messages:
```
User sends message → POST /api/messages → Saved to `messages` collection → Retrieved via GET /api/messages
```

## Verification

To verify data is being stored correctly:

1. **Check server logs** - Look for "Post saved:", "Feedback saved:", etc.
2. **Check browser console** - Look for "Post created in database:", "Fetched posts from database:"
3. **Check MongoDB Compass** - View documents in each collection to see real data
4. **Test the flow**:
   - Create a forum post → Check `posts` collection
   - Complete an interview → Check `interviewsessions` collection
   - Submit feedback → Check `feedbacks` collection

## Current Status

✅ All essential collections are properly configured
✅ API routes are connected to database models
✅ Frontend is connected to backend APIs
✅ Real-time updates enabled (10-second polling on analytics)
