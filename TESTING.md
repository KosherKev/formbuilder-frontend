# Quick Start Guide - Testing Phase 1

## Before You Begin

Ensure your backend API is running:
```bash
cd /Users/kevinafenyo/Documents/GitHub/formbuilder-platform/backend
npm run dev
```

The backend should be running on `http://localhost:5001`

## Starting the Frontend

Open a new terminal window and run:

```bash
cd /Users/kevinafenyo/Documents/GitHub/formbuilder-platform/frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:3000`

## Test Sequence

### Step 1: Initial Load
1. Open browser to `http://localhost:3000`
2. You should be automatically redirected to `/login`

### Step 2: Create Account
1. Click "Sign up" link at the bottom
2. Fill in registration form:
   - Name: Your Name
   - Email: test@example.com
   - Password: password123
   - Confirm Password: password123
3. Click "Create Account"
4. You should be redirected to `/dashboard`

### Step 3: Explore Dashboard
1. Check the stats cards (should show 0 forms, 0 published, etc.)
2. You'll see "No forms yet" message
3. Note your name appears in the header
4. Note the plan shows "Free"

### Step 4: Create First Form
1. Click "Create Your First Form" or "Create Form" button
2. A new form will be created with title "Untitled Form"
3. You'll be redirected to `/dashboard/forms/[id]/edit`
4. Since Phase 2 isn't built yet, you'll see a 404 page
5. Click browser back button to return to dashboard

### Step 5: View Forms List
1. Back on dashboard, you should now see 1 form
2. Form card shows:
   - Title: "Untitled Form"
   - Status badge: "draft"
   - 0 views, 0 responses
   - Created date
3. "Edit" and chart icon buttons are visible

### Step 6: Test Logout
1. Click "Logout" button in header
2. You should be redirected to `/login`
3. Token is cleared from localStorage

### Step 7: Test Login
1. Enter your credentials
2. Click "Sign In"
3. You should return to `/dashboard` with your form still there

## Expected Behavior

### Authentication
- Login page has blue theme with form icon
- Register page has purple theme with user-plus icon
- Form validation works (password length, matching passwords)
- Error messages display in red boxes
- Loading states show "Signing in..." / "Creating account..."

### Dashboard
- Clean, professional layout with white header
- Four stat cards in a grid
- Forms list shows in a card below stats
- Each form card is clickable and has hover effect
- Mobile responsive (try resizing browser)

### Navigation
- Clicking form card navigates to edit page (will 404 for now)
- Edit button does the same
- Chart button navigates to responses page (will 404 for now)
- Logo/title in header stays on dashboard

## Common Issues

### "Failed to fetch forms"
- Backend is not running
- Check backend console for errors
- Verify MongoDB is connected

### "Network Error" on login
- CORS issue - check backend CORS configuration
- Should allow `http://localhost:3000`

### Redirects to login after successful registration
- Check browser console for errors
- Token might not be saved properly
- Try clearing localStorage and trying again

### Styles not loading
- Run `npm install` to ensure TailwindCSS is installed
- Restart dev server

## Next Steps

Once Phase 1 is working correctly, you can proceed to Phase 2 which will include:
- Form builder interface
- Drag-and-drop questions
- Question type editors
- Form settings
- Templates gallery
- Preview mode

Let me know when you're ready for Phase 2!
