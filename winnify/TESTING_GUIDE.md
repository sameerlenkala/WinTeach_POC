# Academic LMS - Testing Guide

**Version**: 2.0  
**Date**: May 7, 2026  
**Status**: Ready for User Acceptance Testing

---

## 🚀 Quick Start

### Prerequisites
1. Navigate to the winnify project directory
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Open browser: `http://localhost:5174`

---

## 🧪 Testing New Features (Week 1-2)

### 1. Content Type Selector

**Route**: `/academic/hod/course/select-type`

**How to Test**:
1. Navigate to Sign In page: `http://localhost:5174/signin`
2. Click "HOD" button
3. Click "Courses" in sidebar
4. Click "Create Course" button
5. You should see the Content Type Selector page

**What to Test**:
- ✅ Two cards displayed: "Winnify Standard Content" and "Accredited Content"
- ✅ Click on each card to select (should show checkmark)
- ✅ Only one can be selected at a time
- ✅ "Continue" button is disabled until selection is made
- ✅ Click "Continue" navigates to course creation page
- ✅ Selected content type is passed to next page

**Expected Behavior**:
- Beautiful card-based UI
- Visual feedback on selection
- Smooth navigation
- Responsive design

---

### 2. Enhanced Course Creation Wizard

**Route**: `/academic/hod/course/create`

**How to Test**:
1. Follow steps from Content Type Selector
2. Select a content type and click "Continue"
3. You should see the Enhanced Course Creation page

**What to Test**:

#### Step 1: Method Selection
- ✅ Three cards displayed: "Add New", "Upload", "From Database"
- ✅ Click "Add New" → proceeds to Basic Info step
- ✅ Click "Upload" → shows file input (select CSV/Excel)
- ✅ Click "From Database" → shows template list
- ✅ Select a template → auto-fills course data

#### Step 2: Basic Information
- ✅ Form fields: Code, Name, Credits, Type
- ✅ Dropdowns: Academic Year, Semester, Regulation, Section
- ✅ All fields are editable
- ✅ "Back" button returns to method selection
- ✅ "Next" button proceeds to Outcomes step

#### Step 3: Course Outcomes
- ✅ Default 3 COs displayed
- ✅ "Add CO" button adds new CO
- ✅ Each CO has: Code, Description, Bloom's Level
- ✅ All fields are editable
- ✅ "Back" and "Next" buttons work

#### Step 4-6: Mapping, Faculty, Settings
- ✅ Placeholder pages displayed
- ✅ Navigation works correctly

#### Step 7: Review
- ✅ Summary of all entered data
- ✅ "Back" button returns to previous step
- ✅ "Create Course" button shows success message

**Expected Behavior**:
- Smooth multi-step wizard
- Progress indicator updates
- Data persists across steps
- Validation at each step

---

### 3. Timeline Kanban Board

**Route**: `/academic/hod/course/:courseId/timeline` or `/academic/faculty/course/:courseId/timeline`

**How to Test**:
1. Navigate to HOD Dashboard
2. Click "Courses" in sidebar
3. Click on any course card
4. Click "Timeline" tab (or add a button to navigate)
5. Alternatively, directly navigate to: `http://localhost:5174/academic/hod/course/course-1/timeline`

**What to Test**:

#### Kanban Board
- ✅ Four columns displayed: Planned, In Progress, Completed, Postponed
- ✅ Each column shows lecture count badge
- ✅ Lectures are displayed as cards in respective columns
- ✅ Each lecture card shows:
  - Lecture number and topic
  - Subtopics as badges
  - Date and duration
  - Prerequisites count
  - Status badge

#### Drag & Drop
- ✅ Grab a lecture card (cursor changes to move)
- ✅ Drag to another column
- ✅ Drop the card (should move to new column)
- ✅ Status updates automatically
- ✅ Column counts update

#### Statistics
- ✅ Four stat cards at top:
  - Total Lectures
  - Completed
  - In Progress
  - Total Hours
- ✅ Numbers update when lectures are moved

#### Actions
- ✅ "Save Draft" button shows success message
- ✅ "Send for Review" button shows success and navigates back
- ✅ "Add Lecture" button in Planned column (placeholder)

**Expected Behavior**:
- Smooth drag-and-drop
- Visual feedback during drag
- Automatic updates
- Responsive layout

---

### 4. Enhanced Quiz Builder with Dual Selection

**Route**: `/academic/faculty/quiz/create`

**How to Test**:
1. Navigate to Sign In page
2. Click "Faculty" button
3. Click "Quizzes" in sidebar
4. Click "Create Quiz" button
5. You should see the Enhanced Quiz Builder

**What to Test**:

#### Step 1: Quiz Details
- ✅ Form fields: Name, Cohort, Duration, Number of Questions
- ✅ Deadline picker (datetime-local)
- ✅ Attempts Allowed input
- ✅ Randomize checkbox
- ✅ "Next" button proceeds to Configure step

#### Step 2: Configure Quiz (KEY FEATURE)

**Lecture-Based Selection (Left Side)**:
- ✅ Click "Lectures" button to switch mode
- ✅ List of 5 lectures displayed
- ✅ Click on a lecture card to select (border turns blue)
- ✅ Checkbox updates
- ✅ Can select multiple lectures
- ✅ Subtopics shown as badges
- ✅ "Available Questions" panel updates in real-time

**Topic-Based Selection (Right Side)**:
- ✅ Click "Topics" button to switch mode
- ✅ List of 6 topics displayed
- ✅ Click on a topic to select
- ✅ Subtopics expand below selected topic
- ✅ Click on subtopics to select specific ones
- ✅ Can select multiple topics/subtopics
- ✅ "Available Questions" panel updates in real-time

**Question Bank Preview**:
- ✅ Shows total questions available based on selection
- ✅ Displays first 5 questions as preview
- ✅ Each question shows: text, topic, subtopic, difficulty, marks
- ✅ Updates when selection changes

#### Step 3: Questions Management
- ✅ Click "Generate Quiz" to proceed
- ✅ Questions list displayed (based on selection)
- ✅ Each question shows:
  - Question number badge
  - Type and difficulty badges
  - Question text
  - Options (for MCQ)
  - Topic, subtopic, CO badges
  - Marks
- ✅ "Remove" button (trash icon) removes question
- ✅ "Regenerate" button (placeholder)
- ✅ "Back" and "Next" buttons work

#### Step 4: Preview
- ✅ Summary stats displayed: Duration, Questions, Total Marks, Attempts
- ✅ "Back to Edit" button returns to questions step
- ✅ "Save Draft" button shows success message
- ✅ "Publish Quiz" button shows success and navigates to quiz list

**Expected Behavior**:
- Smooth mode switching (Lectures ↔ Topics)
- Real-time question filtering
- Visual selection feedback
- Accurate question count
- Smooth navigation

---

## 🎯 Test Scenarios

### Scenario 1: HOD Creates a New Course
1. Sign in as HOD
2. Navigate to Courses
3. Click "Create Course"
4. Select "Winnify Standard Content"
5. Choose "From Database" method
6. Select "Data Structures and Algorithms" template
7. Review auto-filled data
8. Proceed through all steps
9. Create course

**Expected**: Course created successfully with all data

---

### Scenario 2: HOD Edits Course Timeline
1. Sign in as HOD
2. Navigate to Courses
3. Click on a course
4. Navigate to Timeline (add button or direct URL)
5. Drag "Lecture 4" from "Planned" to "In Progress"
6. Drag "Lecture 2" from "Completed" to "Postponed"
7. Click "Save Draft"

**Expected**: Lectures move smoothly, status updates, save successful

---

### Scenario 3: Faculty Creates Quiz from Lectures
1. Sign in as Faculty
2. Navigate to Quizzes
3. Click "Create Quiz"
4. Enter quiz details (name, duration, etc.)
5. Click "Next"
6. Select "Lectures" mode
7. Select "Lecture 1" and "Lecture 3"
8. Verify question count updates
9. Click "Generate Quiz"
10. Review questions
11. Click "Preview"
12. Click "Publish Quiz"

**Expected**: Quiz created with questions from selected lectures

---

### Scenario 4: Faculty Creates Quiz from Topics
1. Sign in as Faculty
2. Navigate to Quizzes
3. Click "Create Quiz"
4. Enter quiz details
5. Click "Next"
6. Select "Topics" mode
7. Select "Trees" topic
8. Select "Binary Trees" and "Tree Traversal" subtopics
9. Verify question count updates
10. Click "Generate Quiz"
11. Review questions (should be from selected subtopics)
12. Click "Publish Quiz"

**Expected**: Quiz created with questions from selected topics/subtopics

---

## 🐛 Known Issues & Limitations

### Current Limitations
1. **Mock Data Only**: All data is hardcoded, no backend integration
2. **No Persistence**: Data resets on page refresh
3. **File Upload**: UI ready but parsing not implemented
4. **No Validation**: Form validation is basic (HTML5 only)
5. **No Error Handling**: No try-catch blocks or error boundaries
6. **No Loading States**: No spinners or skeletons

### Expected Errors
- File upload shows alert but doesn't parse
- "Create Course" shows alert but doesn't save to database
- "Publish Quiz" shows alert but doesn't actually publish
- Timeline changes don't persist on refresh

---

## ✅ Acceptance Criteria

### Content Type Selector
- [ ] Both content types are clearly displayed
- [ ] Selection is intuitive
- [ ] Navigation works correctly
- [ ] UI is responsive

### Enhanced Course Creation
- [ ] All 7 steps are accessible
- [ ] Data persists across steps
- [ ] All three methods work (Add/Upload/Database)
- [ ] Form validation works
- [ ] Navigation is smooth

### Timeline Kanban
- [ ] Drag-and-drop works smoothly
- [ ] Status updates correctly
- [ ] Statistics are accurate
- [ ] UI is intuitive
- [ ] Responsive on mobile

### Enhanced Quiz Builder
- [ ] Both selection modes work (Lectures/Topics)
- [ ] Question filtering is accurate
- [ ] Real-time updates work
- [ ] Question management works
- [ ] Preview is accurate
- [ ] Navigation is smooth

---

## 📝 Feedback Template

### Feature: [Feature Name]

**What worked well**:
- 

**What needs improvement**:
- 

**Bugs found**:
- 

**Suggestions**:
- 

**Overall Rating**: ⭐⭐⭐⭐⭐ (1-5 stars)

---

## 🔧 Troubleshooting

### Issue: Page not loading
**Solution**: Check if dev server is running (`npm run dev`)

### Issue: Routes not working
**Solution**: Check browser console for errors, verify route in App.tsx

### Issue: Drag-and-drop not working
**Solution**: Ensure you're clicking and holding on the lecture card

### Issue: Questions not filtering
**Solution**: Ensure you've selected at least one lecture or topic

### Issue: Data not persisting
**Solution**: This is expected (mock data only, no backend)

---

## 📞 Support

For issues or questions:
1. Check console for errors (F12 → Console tab)
2. Review this testing guide
3. Check IMPLEMENTATION_PROGRESS.md for feature status
4. Contact development team

---

**Happy Testing! 🎉**

---

**Last Updated**: May 7, 2026  
**Version**: 2.0  
**Status**: Ready for UAT
