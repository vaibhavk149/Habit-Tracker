# Habit Pulse OS

---

## 1. Context and Role

You are a senior full-stack developer building a realistic habit-management product for students and early-career professionals who want structured daily execution instead of a generic checklist.

Build a **Habit Manager Project** named **Habit Pulse OS**. The product should let a user choose a goal protocol, track daily task proof, recover missed work, and receive browser reminders using IST date tracking.

---

## 2. Objective

Create a production-quality habit manager that supports goal-specific programs such as fat loss, DSA interview preparation, deep study, and English speaking confidence. The app enables users to:

1. Select one protocol from predefined options
2. Track daily task completion with proof
3. Recover missed days without losing streaks
4. Receive browser reminders at custom times
5. View progress metrics and streaks
6. Manage task status (Done, Recovered, Clear)

---

## 3. Input and Output

### Input Sources
- User selections (protocol, task status, proof notes, reminder settings)
- Browser permissions (notifications)
- Manual user interactions (buttons, forms, text input)

### Output Forms
- Dashboard UI with protocol, tasks, metrics display
- JSON file persistence (data/habit-pulse.json)
- Browser notifications (reminders)
- API responses (JSON with status codes)

---

## 4. Data Processing

### Data Flow
1. User selects protocol → Frontend calls `/api/plan` POST
2. Backend validates and stores in JSON
3. Frontend fetches daily tasks from `/api/plan` GET
4. User marks tasks → Frontend calls `/api/tasks/[taskId]` PATCH
5. Backend updates status, recalculates metrics
6. User saves proof → Frontend calls `/api/proof` POST
7. Backend stores proof text with IST date

### Processing Rules
- All dates processed in India Standard Time (IST)
- Date format: YYYY-MM-DD
- Task status changes are atomic (done/recovered/clear)
- Streak calculation happens on every task update
- Metrics updated in real-time

---

## 5. Backend Data Handling

### Data Storage Architecture
```
data/habit-pulse.json
├── activePlan (current protocol selection)
├── tasks (daily task statuses by date)
├── proofNotes (user proof text entries)
├── reminderSettings (notification configuration)
└── metrics (calculated streaks and stats)
```

### Data Operations
- **Read**: Fetch plan, tasks, programs on page load
- **Write**: Create/update plan, save task status, store proof
- **Update**: Modify task status, reminder settings
- **Delete**: Remove plan when user resets
- **Validate**: Check dates, task IDs, proof content

### File Initialization
```
If data/habit-pulse.json does not exist:
1. Create file with default structure
2. Initialize empty plan, tasks, proofNotes
3. Set reminder defaults (disabled, 08:00)
4. Return success response
```

---

## 6. Error Handling and Input Validation

### Validation Rules

| Input | Validation | Error Code |
|-------|-----------|-----------|
| Proof Text | Non-empty string | 400 |
| Task ID | Must exist in protocol | 400 |
| Action | "done" OR "recovered" OR "clear" | 400 |
| Program ID | Must be valid protocol ID | 404 |
| Reminder Time | Valid HH:MM format | 400 |
| Date | Valid IST date YYYY-MM-DD | 400 |

### Error Responses

```json
{
  "error": "Error message",
  "code": 400,
  "timestamp": "2026-05-26T08:30:00Z"
}
```

### Error Scenarios
- Empty proof text → 400 Bad Request
- Unknown program ID → 404 Not Found
- Invalid task action → 400 Bad Request
- Mutually exclusive status (done + recovered same day) → 400 Bad Request
- Missing required fields → 400 Bad Request
- File system error → 500 Internal Server Error

---

## 7. Tech Stack

### Frontend
- Next.js 15 App Router
- React 18+
- TypeScript
- Tailwind CSS
- Client-side hooks for state management

### Backend
- Next.js 15 API Routes
- TypeScript
- Node.js file system (fs)
- JSON for persistence

### Development Tools
- npm / yarn
- TypeScript compiler
- Tailwind CSS CLI
- Git for version control

### Runtime Environment
- Node.js 18+
- Modern browsers (Chrome, Firefox, Safari, Edge)
- No external databases
- No authentication frameworks
- No third-party APIs

---

## 8. Project Structure

### Root Structure
```
habit-tracker/
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── hooks/
│   └── types/
├── client/
├── data/
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

### Frontend Directory Structure

```
src/app/
├── layout.tsx                        # Root layout wrapper
├── page.tsx                          # Main dashboard page
├── globals.css                       # Global styles

src/components/
├── Dashboard.tsx                     # Main coordinator
├── ProtocolSelector.tsx              # Protocol dropdown
├── TaskCard.tsx                      # Individual task
├── TaskCheckpoints.tsx               # Grouped sections
├── MetricsPanel.tsx                  # Stats display
├── ProofLedger.tsx                   # Proof input
├── ReminderSettings.tsx              # Notification controls
└── ui/
    ├── Button.tsx
    ├── Input.tsx
    └── Card.tsx
```

### Backend Directory Structure

```
src/app/api/
├── programs/
│   └── route.ts                      # GET: List protocols
├── plan/
│   └── route.ts                      # GET/POST/DELETE plan
├── tasks/
│   └── [taskId]/
│       └── route.ts                  # PATCH: Update task
├── proof/
│   └── route.ts                      # POST: Save proof
└── reminder/
    └── route.ts                      # PATCH: Update reminder
```

### Library Structure

```
src/lib/
├── types.ts                          # TypeScript interfaces
├── programs.ts                       # Protocol definitions
├── storage.ts                        # File I/O
├── istUtils.ts                       # Date helpers
├── streakCalculator.ts               # Streak logic
└── validators.ts                     # Input validation

src/hooks/
├── usePlan.ts                        # Plan management
├── useTasks.ts                       # Task operations
└── useReminder.ts                    # Reminder management

src/types/
├── protocol.ts
├── task.ts
├── plan.ts
└── reminder.ts
```

### Client Directory (Optional)

```
client/
├── src/
│   ├── pages/
│   ├── components/
│   ├── styles/
│   └── utils/
├── package.json
└── tsconfig.json
```

---

## 9. Features Required

### Core Features
1. Protocol Selection
   - Display 4 protocols (Fat Loss, DSA, Deep Study, English)
   - User selects one protocol
   - App creates daily tasks for selected protocol
   - User can switch protocols (resets current plan)

2. Task Management
   - Display all tasks grouped by checkpoint
   - Show task details: title, checkpoint, action, proof requirement, recovery action, time, difficulty
   - Mark task as Done / Recovered / Clear
   - Only one status per task per day (mutually exclusive)
   - Display task status with visual indicators

3. Proof Tracking
   - Text input for daily proof notes
   - Save proof linked to task or general day proof
   - Display proof history
   - Validate non-empty proof text

4. Metrics Dashboard
   - Completion percentage (tasks done today)
   - Resilience percentage (tasks recovered)
   - Current streak (consecutive days with activity)
   - Current program day (day number in protocol)
   - Show historical streaks

5. Browser Notifications
   - Request notification permission
   - Set reminder time (HH:MM)
   - Customize reminder message
   - Enable/disable reminders
   - Send browser notification at specified time

6. Data Persistence
   - Save all data in JSON file
   - Auto-create JSON file on first run
   - Read data on app load
   - Update data on every action
   - No database required

### UI Features
- Single page dashboard
- Responsive design (mobile, tablet, desktop)
- Clean, professional interface
- Smooth animations and transitions
- Dark mode support (optional)
- Clear visual hierarchy

---

## 10. Backend API Requirements

### API Endpoints

```
GET /api/programs
├── Returns: Array of 4 protocol objects
├── Each contains: id, name, description, tasks, checkpoints
├── Status: 200 OK
└── Example Response: [{ id: "fat-loss", name: "Fat Loss Protocol", tasks: [...] }]

GET /api/plan
├── Returns: Current active plan data
├── Contains: protocol ID, start date, current day, metrics
├── Status: 200 OK or 404 if no plan
└── Example Response: { programId: "dsa-100", startDate: "2026-05-20", currentDay: 7 }

POST /api/plan
├── Request: { programId: "protocol-id" }
├── Creates: New plan in JSON file
├── Returns: { success: true, plan: {...} }
├── Status: 201 Created
└── Validation: Check if programId exists

DELETE /api/plan
├── Deletes: Current active plan
├── Returns: { success: true, message: "Plan deleted" }
├── Status: 200 OK or 404 if no plan
└── Clears: All tasks for that plan

PATCH /api/tasks/[taskId]
├── Request: { action: "done" | "recovered" | "clear", proof?: "text" }
├── Updates: Task status for current IST date
├── Recalculates: Streak, resilience, completion %
├── Status: 200 OK
├── Validation: Check mutually exclusive status
└── Error: 400 if action invalid, 404 if taskId not found

POST /api/proof
├── Request: { text: "proof notes" }
├── Stores: Proof notes for current IST date
├── Returns: { success: true, proof: {...} }
├── Status: 201 Created
└── Validation: Non-empty proof text (400 error if empty)

PATCH /api/reminder
├── Request: { enabled: boolean, time: "HH:MM", message: "text" }
├── Updates: Reminder settings in JSON
├── Returns: { success: true, settings: {...} }
├── Status: 200 OK
└── Validation: Valid time format (400 error if invalid)
```

### API Response Format

Success:
```json
{
  "success": true,
  "data": { },
  "message": "Operation completed",
  "timestamp": "2026-05-26T08:30:00Z"
}
```

Error:
```json
{
  "success": false,
  "error": "Error message",
  "code": 400,
  "timestamp": "2026-05-26T08:30:00Z"
}
```

---

## 11. Database Requirements

### Data Schema

```json
{
  "activePlan": {
    "programId": "string",
    "programName": "string",
    "startDate": "YYYY-MM-DD",
    "currentDay": "number"
  },

  "tasks": {
    "YYYY-MM-DD": {
      "task-id": {
        "status": "done | recovered | clear",
        "proof": "string (optional)",
        "timestamp": "ISO-8601"
      }
    }
  },

  "proofNotes": {
    "YYYY-MM-DD": "string"
  },

  "reminderSettings": {
    "enabled": "boolean",
    "time": "HH:MM",
    "message": "string",
    "notificationPermission": "granted | denied | default"
  },

  "metrics": {
    "currentStreak": "number",
    "longestStreak": "number",
    "resilience": "number (percentage)",
    "completionToday": "number (percentage)",
    "totalDays": "number"
  }
}
```

### Data Storage Location
```
data/habit-pulse.json
```

### File Management
- Auto-create if missing
- Read entire file on GET requests
- Write entire file on POST/PATCH/DELETE
- Atomic writes (no partial updates)
- Backup not required for local dev

---

## 12. Security Requirements

### Input Security
- Validate all user inputs before processing
- Sanitize proof text (remove dangerous characters if needed)
- Validate date formats
- Check task IDs exist in protocol
- Validate action values (enum: done, recovered, clear)

### Data Security
- No authentication required (local use only)
- No sensitive data transmission
- JSON stored locally
- No external API calls
- CORS not required (same-origin only)

### Browser Security
- Use Content Security Policy (CSP) headers
- Sanitize DOM operations
- No eval() or dynamic script injection
- Validate notification permissions

---

## 13. Files to Create

### Client Files

```
client/
├── package.json
├── tsconfig.json
├── README.md
└── (optional - can merge with src/)
```

### Src Structure

```
src/
├── types/
│   ├── protocol.ts               # Protocol interface
│   ├── task.ts                   # Task interface
│   ├── plan.ts                   # Plan interface
│   └── reminder.ts               # Reminder interface
│
├── lib/
│   ├── types.ts                  # All TypeScript interfaces
│   ├── programs.ts               # 4 protocol definitions
│   ├── storage.ts                # JSON file operations
│   ├── istUtils.ts               # IST date utilities
│   ├── streakCalculator.ts       # Streak calculation
│   └── validators.ts             # Input validation
│
├── hooks/
│   ├── usePlan.ts
│   ├── useTasks.ts
│   └── useReminder.ts
│
├── components/
│   ├── Dashboard.tsx
│   ├── ProtocolSelector.tsx
│   ├── TaskCard.tsx
│   ├── TaskCheckpoints.tsx
│   ├── MetricsPanel.tsx
│   ├── ProofLedger.tsx
│   ├── ReminderSettings.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Card.tsx
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── api/
│       ├── programs/route.ts
│       ├── plan/route.ts
│       ├── tasks/[taskId]/route.ts
│       ├── proof/route.ts
│       └── reminder/route.ts
│
└── utils/ (optional)
    └── constants.ts              # Constants, enums
```

### Config Files

```
package.json                       # Dependencies and scripts
tsconfig.json                      # TypeScript configuration
tailwind.config.js                 # Tailwind CSS config
next.config.js                     # Next.js configuration
.gitignore                         # Git ignore rules
.env.local                         # Environment variables (if needed)
```

---

## 14. Performance and Scalability

### Performance Targets
- Dashboard load time: < 1 second
- API response time: < 200ms
- Task update instant (< 100ms)
- Memory usage: < 50MB
- JSON file size: < 1MB (for 1 year of data)

### Optimization Strategies
1. Client-side Caching
   - Cache protocol data in memory
   - Use React hooks for state management
   - Avoid unnecessary re-renders

2. API Optimization
   - Minimize JSON file reads (cache in memory)
   - Send only required data
   - Use gzip compression

3. Database Optimization
   - Keep JSON file organized
   - Archive old data periodically (if needed)
   - Efficient date indexing

4. Frontend Optimization
   - Lazy load components (if needed)
   - Use CSS efficiently
   - Optimize images/assets
   - Minify CSS/JS

### Scalability Considerations
- Current: Single JSON file per user
- Future: Database migration (MongoDB, PostgreSQL)
- Multi-user support (add user ID to schema)
- Cloud deployment ready
- No hard limits on task count

---

## 15. Extra Features

### Optional Enhancements
1. **Dark Mode**
   - Toggle dark/light theme
   - Save preference in localStorage
   - Apply to entire UI

2. **Data Export**
   - Export progress to CSV
   - Export as PDF report
   - Email summary

3. **Analytics Dashboard**
   - Weekly/monthly progress charts
   - Completion trends
   - Resilience insights
   - Best performing protocols

4. **Goal Customization**
   - Create custom protocols
   - Add personal tasks
   - Modify checkpoint structure

5. **Social Features**
   - Share progress
   - Join challenges
   - Leaderboard (local)

6. **Mobile App**
   - React Native version
   - Offline support
   - Push notifications

---

## 16. Code Requirements

### Code Quality Standards
- Write in TypeScript (no JavaScript)
- Use functional components (React)
- Proper error handling everywhere
- Clear, descriptive variable names
- Comments for complex logic
- No console.log in production code
- No TODO or FIXME comments
- Consistent formatting (Prettier)

### File Organization
- One component per file
- Related functions grouped in lib files
- Interfaces in separate types file
- Constants in dedicated file
- API logic separate from components

### Naming Conventions
- Files: camelCase (components), PascalCase (React components)
- Variables: camelCase
- Constants: UPPER_SNAKE_CASE
- Functions: camelCase
- React components: PascalCase
- Interfaces: PascalCase with I prefix (ITask, IPlan)

### Best Practices
- Use async/await for API calls
- Proper TypeScript typing
- Error boundaries for components
- Reusable components
- DRY principle (Don't Repeat Yourself)
- SOLID principles
- Separation of concerns

---

## 17. Implementation Requirements

### Step-by-Step Implementation
1. Setup project structure
2. Configure TypeScript and Tailwind
3. Create TypeScript interfaces
4. Build protocol definitions
5. Create storage utilities
6. Build API routes
7. Create React hooks
8. Build UI components
9. Integrate frontend with backend
10. Add browser notifications
11. Test all features
12. Optimize performance

### Testing Strategy
- Unit tests for utilities (streaks, validation)
- Component tests for UI
- API tests for endpoints
- Manual testing of workflows
- Cross-browser testing

### Documentation Requirements
- README with setup instructions
- Inline code comments
- API documentation
- Component documentation
- Data schema documentation

---

## 18. Development Flow

### Local Development Workflow
```
1. Clone repository
2. Install dependencies (npm install)
3. Configure environment variables (.env.local)
4. Start development server (npm run dev)
5. Open http://localhost:3000
6. Test features
7. Make changes
8. Test again
9. Commit changes
```

### Development Commands
```bash
npm install                        # Install dependencies
npm run dev                        # Start dev server
npm run build                      # Build for production
npm start                          # Start production server
npm run lint                       # Check code quality
npm run type-check                 # TypeScript check
```

### Git Workflow
```
- Create feature branch
- Make changes
- Test locally
- Commit with clear message
- Push to repository
- Create pull request
- Code review
- Merge to main
```

---

## 19. Deployment Requirements

### Deployment Options

**Local Deployment (Current)**
- Run on local machine
- No external services needed
- Data stored locally

**Production Deployment (Future)**
- Deploy to Vercel (recommended for Next.js)
- Deploy to AWS, Azure, or GCP
- Setup CI/CD pipeline
- Add database (MongoDB Atlas, PostgreSQL)
- Setup environment variables
- Enable logging and monitoring

### Pre-Deployment Checklist
- All tests passing
- No console errors
- No TODO comments
- Performance optimized
- Security validated
- Documentation complete
- Environment variables configured
- Backup strategy in place

### Deployment Commands
```bash
npm run build                      # Create production build
npm start                          # Start production server
vercel deploy                      # Deploy to Vercel (if using)
```

---

## 20. Final Output Required

### Deliverables

1. **Complete Source Code**
   - All files properly organized
   - TypeScript interfaces defined
   - Components fully functional
   - API routes implemented
   - Utilities and helpers created

2. **Working Application**
   - Single page dashboard
   - Protocol selector functional
   - Task management working
   - Proof tracking operational
   - Metrics calculated and displayed
   - Reminders configured

3. **Documentation**
   - README.md with setup steps
   - Project structure explained
   - API documentation
   - Code comments where needed
   - Data schema documented

4. **Configuration Files**
   - package.json with dependencies
   - tsconfig.json configured
   - tailwind.config.js setup
   - next.config.js ready
   - .gitignore configured

5. **Data File**
   - data/habit-pulse.json template
   - Example data with structure
   - Auto-creation logic implemented

6. **Executable Project**
   - No external API dependencies
   - No database setup required
   - Runs on local machine
   - Works in modern browsers
   - Cross-platform compatible

---

## 21. Final Goal

### What You're Building

**Habit Pulse OS** is a production-quality, single-page habit-tracking application that helps students and professionals maintain consistent daily execution through:

- Goal-specific protocols (not generic to-do lists)
- Daily task tracking with proof requirements
- Streak persistence through recovery mechanics
- Real-time progress metrics and visualization
- Browser-based reminders for accountability
- Complete local data persistence (no backend needed)

### Success Criteria

✓ Application loads without errors
✓ Users can select and switch protocols
✓ Users can mark tasks Done/Recovered/Clear
✓ Proof notes saved and displayed
✓ Metrics calculated correctly (streak, resilience, completion %)
✓ Browser notifications work at scheduled time
✓ All data persists in JSON file
✓ Responsive design works on mobile and desktop
✓ Code is clean, typed, and well-organized
✓ No third-party API calls or databases needed

### Key Philosophy

The app teaches **consistency over perfection** by allowing task recovery without breaking streaks. It focuses on achievable daily execution rather than zero-tolerance perfection, making habit-building sustainable and realistic.

### Future Roadmap

Phase 1: Complete local implementation (Current)
Phase 2: Add multi-user support
Phase 3: Migrate to real database
Phase 4: Mobile app development
Phase 5: Community features and analytics

---

**Status: Ready for Implementation**

This specification provides everything needed to build Habit Pulse OS from scratch. Follow the structure, implement features systematically, and you'll have a complete habit management system.
