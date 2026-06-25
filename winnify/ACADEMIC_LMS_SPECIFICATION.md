# Academic LMS - Complete Specification

## Overview
This document outlines the complete specification for the Academic LMS based on the provided requirements.

---

## 1. Content Management

### 1.1 Faculty Module Base Content

#### Winnify Standard Content
- **Source**: AICTE book (standardized curriculum)
- **Features**:
  - Pre-populated course structure
  - Standard topics and subtopics
  - Default learning outcomes
  - Aligned with AICTE guidelines

#### Accredited Content
- **Source**: Institution's own choice
- **Features**:
  - Custom course structure
  - Institution-specific topics
  - Custom learning outcomes
  - Separate copy from standard content

#### Course Plan → Course Outcome Mapping
- Map each lecture/topic to specific Course Outcomes (COs)
- Track CO coverage throughout the course
- Generate CO attainment reports

---

## 2. HOD Module

### 2.1 HOD Login Dashboard
Three main management areas:
1. **Course Management**
2. **Faculty Management**
3. **Student Management**

### 2.2 Course Management

#### Create Course
**Flow**: Add Course → Course Info → Assign Faculty

**Course Info Options**:
1. **Add New**: Manual entry of all course details
2. **Upload**: Upload course structure (CSV/Excel)
3. **Auto-populated from DB**: Select from existing templates

**Course Details**:
- Course Code
- Course Name
- Credits
- Type (Theory/Lab/Theory+Lab)
- Department
- Section
- Regulation
- BOS Document
- Course Outcomes (COs)
- CO-PO-PSO Mapping

**Faculty Assignment**:
- Assign Primary Faculty
- Assign Co-Faculty (optional)
- Set faculty permissions

#### Content Control Settings
- **Enable/Disable Faculty Uploaded Content**
  - Toggle to allow/restrict faculty from uploading custom content
  - If disabled, faculty can only use generated content

#### Pre-Lecture Faculty Assessment
- **Options**: Optional / Mandatory / Disable
- If enabled, faculty must complete assessment before starting lecture
- Assessment can include:
  - Topic readiness check
  - Resource review confirmation
  - Prerequisite verification

#### Lecture Planning
**Option 1: Generate Plan Automatically**
- System generates lecture plan based on:
  - Total lectures available
  - Topics from BOS
  - Recommended hours per topic
  - Academic calendar

**Option 2: Create Manually**
- HOD manually creates lecture schedule
- Assign topics to lectures
- Set tentative dates
- Define lecture hours

**Lectures Per Topic/Unit**:
- HOD can specify number of lectures per topic
- System distributes topics across lectures
- Adjustable based on topic complexity

#### Edit Plan (Kanban View)
- **Kanban Board** with columns:
  - Not Started
  - In Progress
  - Completed
  - Postponed
- Drag-and-drop lectures
- Edit lecture details inline
- Adjust dates and topics

#### Faculty Review Workflow
1. **Send to Faculty Review**
   - HOD sends plan to faculty for review
   - Faculty receives notification

2. **Faculty Edit Permission**
   - **Option**: Give faculty permission to edit (Yes/No)
   - If Yes: Faculty can modify timeline
   - If No: Faculty can only view

3. **Publish to Faculty**
   - After review, HOD publishes final plan
   - Faculty can start lecture delivery

### 2.3 Faculty Management

#### Faculty Dashboard (HOD View)
- **Course Completion Dashboard**
  - % of lectures completed per faculty
  - % of topics covered per faculty
  - Behind schedule alerts
  - Pending resource publications

- **Topic Coverage Dashboard**
  - Overall topic coverage across all courses
  - Topic-wise completion status
  - Subtopic coverage breakdown
  - Removed topics tracking

**Metrics**:
- Total lectures planned vs completed
- Coverage percentage per course
- Resource publication rate
- Quiz creation rate
- Student performance correlation

### 2.4 Student Management

#### Student Dashboard (HOD View)
- **Quiz Completion Coverage**
  - % of students who completed each quiz
  - Average quiz scores
  - Low performers identification
  - Quiz-wise completion rates

**Metrics**:
- Total quizzes assigned
- Average completion rate
- Average scores per quiz
- Topic-wise student performance
- At-risk students list

---

## 3. Faculty Module

### 3.1 Faculty Login

#### Timeline Editing (Kanban View)
- **Editable if HOD allows**
- Faculty can:
  - Adjust lecture dates
  - Modify lecture hours
  - Reorder lectures
  - Add/remove topics (if permitted)
- **Publish** button to finalize changes
- Changes require HOD approval (optional setting)

### 3.2 Two View Modes

#### View 1: Lecture View (Default)
**Lecture-wise organization**

#### View 2: Topic View
**Topic-wise organization**

---

## 4. Lecture View (Faculty)

### 4.1 Lecture Detailed Info
**Display**:
- Lecture Number (e.g., Lecture 5)
- Topic (e.g., Trees)
- Subtopic (e.g., Binary Trees, Tree Traversal)
- Tentative Date
- Duration (hours)
- Status (Planned/In Progress/Completed)

### 4.2 Resource Generation

#### Default State
- **All resources are empty by default**
- **Option to Generate Resources** button visible

#### Resource Types
1. **Faculty Notes**
   - Generated by AI or uploaded by faculty
   - Comprehensive lecture notes
   - Mapped to topic + subtopic

2. **Slides**
   - Generated by AI
   - **Can be replaced by uploaded slides**
   - PPT/PDF format
   - Mapped to topic + subtopic

3. **Student Notes**
   - **Faculty Notes loaded by default**
   - **Can be replaced by uploaded notes**
   - Simplified version for students
   - Mapped to topic + subtopic

4. **Student Quiz**
   - **Empty by default**
   - **Option to Create Quiz** button
   - See Quiz Generation section below

5. **Additional Resources**
   - **Empty by default**
   - **Option to Upload** button
   - Can include: Videos, PDFs, Links, Code files
   - Mapped to topic + subtopic

#### Resource Mapping
- **Every artifact must be mapped to Topic + Subtopic**
- Ensures traceability
- Enables topic-wise resource stitching

### 4.3 Student Quiz Generation

#### Quiz Creation Flow
**Step 1: Quiz Details**
- Name
- Start Time
- End Time
- Duration (minutes)
- Cohort (Section/Group)
- Number of Questions

**Step 2: Configure Quiz**
Two options for question selection:

**Option A: Lecture-based Selection**
- **Left Side**: List of lectures
- Can select single or multiple lectures
- Questions pulled from selected lectures' topics

**Option B: Topic-based Selection**
- **Right Side**: Topic and Subtopic tree
- Select specific topics/subtopics
- Questions pulled from selected topics

**Question Source**:
- **Manual Selection**: Choose questions from question bank
- **Generate from DB**: Auto-generate based on selection

#### Question Management
**Questions List Display**:
- Question text
- Options (for MCQ)
- Correct answer (Key)
- Solution/Explanation
- Topic + Subtopic mapping
- Difficulty level
- Marks

**Actions**:
- **Add**: Add new question manually
- **Delete**: Remove question
- **Edit**: Modify question details
- **Replace**: Replace with another question
- **Regenerate Quiz**: Generate new set of questions

**Publish to Students**:
- Review all questions
- Set quiz live
- Students receive notification

### 4.4 Resource Status Tracking

#### Status Types
1. **Not Reviewed**: Resource generated but not reviewed by faculty
2. **Reviewed but Not Published**: Faculty reviewed but not published to students
3. **Published**: Live and accessible to students

#### Review & Publish Workflow
- **Option to Review Uploaded Resources**
  - Faculty can review each resource
  - Mark as reviewed
  - Edit if needed

- **Publish All Resources**
  - Bulk publish all reviewed resources
  - Single click to make all resources live
  - Students receive notification

### 4.5 Topic Assessment (Pre-Lecture)

#### Assessment Options
- **Before Start**: Complete assessment before lecture begins
- **During Lecture**: Complete assessment during lecture
- **Skip**: If optional, can be skipped

#### Warning Banner
- **Dismissible warning** if assessment not completed
- Shows: "Topic assessment pending. Complete before starting lecture."
- Can be dismissed but remains visible

### 4.6 Lecture Completion

#### Edit Lecture Status
- **Option to mark lecture as "Completed"**
- Triggers:
  - Coverage percentage update
  - Resource publication check
  - Attendance verification
  - Topic completion update

---

## 5. Topic View (Faculty)

### 5.1 Overall Topic Coverage Dashboard

#### Coverage Metrics (wrt BOS)
- **% of Subtopics Covered**: Completed subtopics / Total subtopics
- **% Yet to Cover**: Pending subtopics / Total subtopics
- **% Removed from Course**: Excluded subtopics / Total subtopics

**Visual Representation**:
- Progress bars for each topic
- Color-coded status (Green: Covered, Orange: Partial, Red: Not Covered, Gray: Removed)
- Subtopic-level breakdown

### 5.2 Overall Topic Resources

#### Resource Generation Status

**Not Generated**:
- **Generate Button** visible
- Click to generate all resources for topic

**If Generated**:
- **Stitched Comprehensive Resources** view
- All resources combined into single view per topic

#### Resource Types (Topic-wise)
1. **Faculty Notes**: Comprehensive notes for entire topic
2. **Slides**: Combined slides for all lectures in topic
3. **Student Notes**: Simplified notes for students
4. **Additional Resources**: All uploaded resources for topic
5. **Flash Cards**: Quick revision cards per topic
6. **Interview Questions**: Powered by WinSpeak

### 5.3 WinSpeak Integration

#### Interview Questions per Topic
- **Directly sourced from Flash Cards**
- AI-generated interview questions
- Difficulty levels: Easy, Medium, Hard
- Practice mode for students
- Voice-based practice (WinSpeak feature)

### 5.4 Topic-wise Artifact Generation

#### Generation Options
1. **Generate All**: Generate all resources for topic
2. **Generate Specific**: Select which resources to generate
3. **Upload Artifacts**: Upload custom resources
4. **Publish**: Make resources live for students

#### Publishing Workflow
- Review generated resources
- Edit if needed
- Publish to students
- Track publication status

---

## 6. Student Module

### 6.1 Student Login

#### Main Navigation
- **Courses Dashboard** (Default view)
- **My Courses** (List of enrolled courses)
- **Quizzes** (All quizzes)
- **Resources** (All resources)
- **Profile**

### 6.2 Courses Dashboard

#### Overview Metrics
- **Total Courses**: Number of enrolled courses
- **Lectures Attended**: Total lectures attended
- **Attendance %**: Overall attendance percentage
- **Quizzes Completed**: Number of quizzes completed
- **Average Score**: Average quiz score

#### Today's Lectures
- **If lectures today**: Show today's schedule
- **If no lectures today**: Show upcoming lectures
- Display:
  - Course name
  - Lecture topic
  - Time
  - Location/Link
  - Faculty name

#### Pending Quizzes
- List of quizzes with upcoming deadlines
- Display:
  - Quiz name
  - Course
  - Deadline
  - Duration
  - Status (Not Started/In Progress)

#### Active Courses List
- All enrolled courses
- Display:
  - Course name
  - Current or upcoming lecture
  - Next lecture date/time
  - Coverage progress
  - Pending quizzes count

### 6.3 Course Detail View

#### Vertical Timeline View
- **Timeline of all lectures** (vertical layout)
- Each lecture shows:
  - Lecture number
  - Topic
  - Date
  - Status (Upcoming/Completed)
  - Resources available

#### Current Lecture Info
**Lecture Information**:
- Lecture number
- Topic and subtopics
- Date and time
- Duration
- Faculty name
- Status

**Resources Available**:
1. **Student Notes**: Simplified lecture notes
2. **Slides**: Presentation slides
3. **Additional Resources**: Videos, PDFs, links
4. **Quiz**: If available, link to quiz

**Actions**:
- Download resources
- View slides
- Take quiz
- Mark as reviewed

### 6.4 Topic Overview (Student)

#### Overall Topic Resources
**Stitched Comprehensive Resources per Topic**:
- All resources combined for easy access
- Single view for entire topic

**Resource Types**:
1. **Slides**: All slides for topic
2. **Student Notes**: Comprehensive notes
3. **Additional Resources**: All supplementary materials
4. **Flash Cards**: Quick revision cards
5. **Interview Questions**: WinSpeak-powered practice questions

**Features**:
- Download all resources
- Bookmark important resources
- Track resource consumption
- Practice with flash cards
- Practice interview questions (voice-based)

---

## 7. Admin Module

### 7.1 Admin Login

#### Complete Overview
- **Same as HOD** but with additional HOD management
- Can view all departments
- Can view all HODs
- Can view all faculty
- Can view all students

### 7.2 HOD Management

#### HOD Management Page
**On Opening**:
- Show list of all HODs
- Display:
  - HOD name
  - Department
  - Number of courses
  - Number of faculty
  - Number of students
  - Overall metrics

**Individual HOD Management**:
- Click on HOD to view their dashboard
- See all courses under HOD
- See all faculty under HOD
- See all students in department
- View HOD's performance metrics

**Actions**:
- Add new HOD
- Edit HOD details
- Assign/Reassign HOD to department
- View HOD activity logs
- Generate HOD performance reports

---

## 8. Key Features Summary

### 8.1 Content Types
1. **Winnify Standard Content** (AICTE-based)
2. **Accredited Content** (Institution-specific)

### 8.2 Resource Types
1. Faculty Notes
2. Slides
3. Student Notes
4. Quizzes
5. Additional Resources
6. Flash Cards
7. Interview Questions (WinSpeak)

### 8.3 View Modes
1. **Lecture View**: Lecture-wise organization
2. **Topic View**: Topic-wise organization

### 8.4 User Roles
1. **Admin**: Complete system access + HOD management
2. **HOD**: Course, Faculty, Student management
3. **Faculty**: Lecture delivery, Resource creation, Quiz creation
4. **Student**: Course access, Resource consumption, Quiz taking

### 8.5 Workflows
1. **Course Creation**: HOD creates → Assigns faculty → Publishes
2. **Lecture Planning**: HOD generates/creates → Faculty edits → Publishes
3. **Resource Generation**: Faculty generates → Reviews → Publishes
4. **Quiz Creation**: Faculty creates → Configures → Publishes
5. **Lecture Delivery**: Faculty starts → Takes attendance → Completes

---

## 9. Technical Requirements

### 9.1 UI Components Needed
- **Kanban Board**: For timeline editing
- **Timeline View**: Vertical timeline for students
- **Resource Viewer**: PDF/PPT viewer
- **Quiz Builder**: Question bank integration
- **Flash Card Viewer**: Swipeable cards
- **Dashboard Charts**: Coverage, completion metrics
- **Status Badges**: Not Reviewed/Reviewed/Published
- **Warning Banners**: Dismissible alerts

### 9.2 Data Models
- Course (with content type: Standard/Accredited)
- Lecture (with topic + subtopic mapping)
- Resource (with status: Not Reviewed/Reviewed/Published)
- Quiz (with lecture/topic selection)
- Question (with topic + subtopic mapping)
- Topic (with coverage metrics)
- Subtopic (with coverage status)
- Flash Card (linked to topics)
- Interview Question (WinSpeak integration)

### 9.3 Integrations
- **AICTE Content Database**: For standard content
- **WinSpeak**: For interview questions
- **AI Generation**: For resource generation
- **File Storage**: For uploaded resources
- **Notification System**: For alerts

---

## 10. Implementation Priority

### Phase 1: Core Setup (Week 1-2)
- [ ] Content type selection (Standard/Accredited)
- [ ] Course creation with auto-population
- [ ] Faculty assignment
- [ ] Basic lecture planning

### Phase 2: HOD Features (Week 3-4)
- [ ] Kanban board for plan editing
- [ ] Faculty review workflow
- [ ] Faculty management dashboard
- [ ] Student management dashboard

### Phase 3: Faculty Features (Week 5-6)
- [ ] Lecture view with resource generation
- [ ] Topic view with stitched resources
- [ ] Quiz builder with lecture/topic selection
- [ ] Resource status tracking

### Phase 4: Student Features (Week 7-8)
- [ ] Student dashboard with metrics
- [ ] Vertical timeline view
- [ ] Topic overview with resources
- [ ] Quiz taking interface

### Phase 5: Advanced Features (Week 9-10)
- [ ] Flash cards generation
- [ ] WinSpeak interview questions
- [ ] Pre-lecture assessment
- [ ] Admin HOD management

### Phase 6: Polish & Testing (Week 11-12)
- [ ] UI/UX refinement
- [ ] Performance optimization
- [ ] User acceptance testing
- [ ] Bug fixes and deployment

---

## 11. Success Metrics

### For HOD
- Course creation time < 10 minutes
- Plan generation time < 5 minutes
- Faculty coverage visibility in real-time
- Student quiz completion tracking

### For Faculty
- Resource generation time < 2 minutes per lecture
- Quiz creation time < 5 minutes
- Lecture completion workflow < 3 minutes
- Topic coverage dashboard always up-to-date

### For Students
- Resource access time < 10 seconds
- Quiz taking experience smooth
- Flash card practice engaging
- Interview question practice effective

---

## 12. Next Steps

1. **Review this specification** with stakeholders
2. **Prioritize features** based on business needs
3. **Create detailed wireframes** for each screen
4. **Set up development environment** with proper architecture
5. **Start Phase 1 implementation**

---

**Document Version**: 1.0  
**Last Updated**: May 7, 2026  
**Status**: Ready for Implementation
