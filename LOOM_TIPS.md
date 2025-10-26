# 🎬 Loom Video: Do's and Don'ts

## ❌ DON'T Say These (Sounds Defensive/Unnecessary)

### 1. Justifying Required Technologies
❌ **Don't:** "I chose tRPC over REST because it provides better type safety..."
✅ **Do:** "I implemented tRPC with comprehensive Zod validation for all inputs..."

**Why:** tRPC was REQUIRED in the assessment. Justifying it sounds like you didn't read the requirements or you're defending an unnecessary choice.

---

### 2. Comparing Technologies Unprompted
❌ **Don't:** "I used Zustand because it's simpler than Redux..."
✅ **Do:** "I used Zustand for UI state and React Query for server state - clean separation of concerns."

**Why:** Sounds like you're justifying or comparing when you should just be showing your implementation.

---

### 3. Apologizing for Missing Features
❌ **Don't:** "I didn't implement authentication because I ran out of time..."
✅ **Do:** [Don't mention it at all - it wasn't required]

**Why:** Authentication wasn't required. Mentioning it makes it seem like you think it was missing.

---

### 4. Making Excuses
❌ **Don't:** "I would have added pagination to the dashboard but ran out of time..."
✅ **Do:** "The dashboard includes grid/list views, search, and optimistic updates..."

**Why:** Focus on what you DID, not what you DIDN'T do. Pagination on dashboard is a bonus feature anyway.

---

### 5. Over-Explaining Obvious Things
❌ **Don't:** "I used TypeScript because it helps catch errors at compile time and provides better IDE support..."
✅ **Do:** "I enabled TypeScript strict mode for maximum type safety."

**Why:** They know what TypeScript does. Show that you used it WELL, not why it exists.

---

### 6. Humble Bragging
❌ **Don't:** "This was pretty easy for me because I've built 10 similar projects..."
✅ **Do:** "I've built similar systems before, which helped me make informed architecture decisions."

**Why:** Balance confidence with humility. Show expertise without sounding cocky.

---

### 7. Negative Self-Talk
❌ **Don't:** "This part could probably be better but..."
❌ **Don't:** "I'm not sure if this is the best approach but..."
❌ **Don't:** "Sorry, this code is a bit messy here..."
✅ **Do:** State facts confidently or don't mention issues at all

**Why:** You're presenting your work. Confidence matters. If you're not confident, they won't be either.

---

## ✅ DO Say These (Confident & Professional)

### 1. Focus on Implementation Quality
✅ **"I implemented end-to-end type safety using tRPC's automatic type inference."**
✅ **"See how this Zod schema validates all inputs - change it here, TypeScript updates everywhere."**
✅ **"I structured the tRPC routers by domain - posts and categories are logically separated."**

---

### 2. Highlight Architecture Decisions
✅ **"I organized the codebase with clear separation of concerns - server logic, client components, and shared types."**
✅ **"I used Zustand for UI state and React Query for server state - each tool solving what it does best."**
✅ **"Custom hooks like `useDebounce` make this pattern reusable across components."**

---

### 3. Show Performance Awareness
✅ **"Optimistic updates provide instant user feedback - the UI responds immediately."**
✅ **"Debouncing the search reduces API calls by 90% during user input."**
✅ **"React Query's caching means data loads instantly on repeat visits."**

---

### 4. Demonstrate Problem-Solving
✅ **"I implemented a many-to-many relationship for categories because posts need flexibility."**
✅ **"The search filters across title, content, and author - all server-side for performance."**
✅ **"I added optimistic updates with automatic rollback if the server fails."**

---

### 5. Emphasize Production Readiness
✅ **"Every post includes OpenGraph tags and Twitter cards for social sharing."**
✅ **"Pre-commit hooks ensure code quality - ESLint and Prettier run automatically."**
✅ **"The application is fully responsive and includes dark mode support."**

---

### 6. Show Modern React Expertise
✅ **"I used `useMemo` and `useCallback` strategically for performance optimization."**
✅ **"Notice how components are memoized to prevent unnecessary re-renders."**
✅ **"The custom `useDebounce` hook demonstrates reusable logic patterns."**

---

### 7. Demonstrate Best Practices
✅ **"I centralized types in `/types` for a single source of truth."**
✅ **"Database migrations are tracked in Git for proper version control."**
✅ **"Every async operation has loading states, error states, and empty states."**

---

## 🎯 Script Structure (What to Cover)

### Part 1: Overview (30 seconds)
✅ "I built a full-stack blogging platform with Next.js 15, tRPC, and PostgreSQL."
✅ "Let me walk through the architecture and key features."

### Part 2: Architecture (2-3 minutes)
✅ Show folder structure
✅ Explain tRPC router organization
✅ Demonstrate type safety in action
✅ Show database schema (many-to-many)

### Part 3: Features (3-4 minutes)
✅ Create a blog post (show editor)
✅ Assign categories (show multi-select)
✅ Demonstrate search and filtering
✅ Show dashboard with optimistic updates
✅ Toggle dark mode
✅ Show mobile responsiveness

### Part 4: Code Quality (1-2 minutes)
✅ Show performance optimizations (useMemo, debouncing)
✅ Demonstrate error handling
✅ Show pre-commit hooks
✅ Explain state management strategy

### Part 5: Closing (30 seconds)
✅ Summarize key features
✅ Mention deployment link
✅ Thank them for their time

---

## 🗣️ Tone & Delivery Tips

### Voice
✅ **Confident but not arrogant**
✅ **Enthusiastic but not over-the-top**
✅ **Clear and articulate**
✅ **Conversational but professional**

### Pace
✅ **Not too fast** - They need to absorb information
✅ **Not too slow** - Respect their time
✅ **Pause between sections** - Let points sink in

### Energy
✅ **Start strong** - First impression matters
✅ **Stay engaged** - No monotone reading
✅ **Smile** - Energy translates on camera
✅ **End confident** - Leave strong impression

---

## 📊 Time Allocation

| Section | Time | Content |
|---------|------|---------|
| **Opening** | 0:30 | Introduction + overview |
| **Architecture** | 2:30 | Folder structure, tRPC, types, DB |
| **Features** | 3:30 | Live demo of key features |
| **Code Quality** | 1:30 | Performance, error handling, hooks |
| **Closing** | 0:30 | Summary + thank you |
| **Total** | **8:30** | Perfect length |

---

## 🎬 Recording Checklist

### Before You Record
- [ ] Practice 2-3 times without recording
- [ ] Test microphone and camera
- [ ] Close all unnecessary tabs/apps
- [ ] Disable notifications
- [ ] Have glass of water nearby
- [ ] Prepare browser bookmarks
- [ ] Pre-open VS Code files you'll reference
- [ ] Check lighting
- [ ] Clear browser history/bookmarks bar

### During Recording
- [ ] Smile at the start
- [ ] Speak clearly and with energy
- [ ] Point to things you're discussing (cursor)
- [ ] Don't rush - take your time
- [ ] Breathe between sections
- [ ] Show, don't just tell
- [ ] Maintain consistent energy throughout

### After Recording
- [ ] Watch it once before submitting
- [ ] Check audio quality
- [ ] Verify screen is readable
- [ ] Ensure demo works properly
- [ ] Confirm time is 8-10 minutes
- [ ] Make sure GitHub link is visible
- [ ] Confirm deployment link works

---

## 💡 What Makes a GREAT Loom Video

### Content
✅ **Show your thinking process** - Not just features
✅ **Demonstrate expertise** - Deep dive on 1-2 things
✅ **Balance breadth and depth** - Cover everything, go deep on key points
✅ **Tell a story** - Beginning, middle, end

### Delivery
✅ **Professional setup** - Good audio, clear screen
✅ **Engaging voice** - Not monotone, varied inflection
✅ **Confident without arrogance** - "I implemented" not "I think maybe..."
✅ **Respect their time** - Dense with value, no fluff

### Technical
✅ **Working demo** - No "imagine this works..."
✅ **Clean code** - Well-formatted, easy to read on screen
✅ **Smooth navigation** - Don't waste time searching for files
✅ **Highlighted key parts** - Point out important sections

---

## 🚫 Red Flags to AVOID

### In Speech
❌ "Um," "uh," "like" excessively
❌ Apologizing for anything
❌ Making excuses
❌ Comparing to other candidates
❌ Criticizing your own work
❌ Justifying obvious choices

### In Demo
❌ Broken features
❌ Console errors visible
❌ Unformatted code
❌ Debug console.logs
❌ Searching for files on camera
❌ Technical difficulties

### In Attitude
❌ Overconfident/cocky
❌ Defensive
❌ Uncertain/hesitant
❌ Negative about anything
❌ Rambling without structure

---

## ✅ Green Flags to SHOW

### Technical Excellence
✅ Type safety throughout
✅ Error handling everywhere
✅ Performance optimizations
✅ Production-ready code
✅ Best practices followed

### Communication
✅ Clear explanations
✅ Structured presentation
✅ Confident delivery
✅ Technical depth when needed
✅ High-level overview when appropriate

### Professionalism
✅ Respectful of their time
✅ Prepared and organized
✅ Enthusiastic about the work
✅ Humble but confident
✅ Team-oriented thinking

---

## 🎯 Your Strongest Selling Points

Based on your implementation, emphasize:

1. **Type Safety:** "Complete end-to-end type safety with tRPC"
2. **Performance:** "Optimistic updates, debouncing, React Query caching"
3. **Architecture:** "Clean separation, reusable patterns, scalable structure"
4. **Best Practices:** "Pre-commit hooks, strict TypeScript, comprehensive error handling"
5. **Production Ready:** "SEO optimized, responsive, dark mode, deployed"

---

## 📝 Final Script Structure

```
1. OPENING (30s)
   - "Hi, I'm [Name]. I built a production-ready blogging platform..."
   
2. QUICK OVERVIEW (30s)
   - "Let me show you what I built and how I think about code..."
   
3. ARCHITECTURE (2:30)
   - Folder structure (30s)
   - tRPC implementation (60s)
   - Database design (30s)
   - Type safety (30s)
   
4. FEATURES DEMO (3:30)
   - Create post (60s)
   - Dashboard management (60s)
   - Search and filtering (30s)
   - Responsive + dark mode (30s)
   - Performance features (30s)
   
5. CODE QUALITY (1:30)
   - Performance patterns (45s)
   - Error handling (45s)
   
6. CLOSING (30s)
   - Summary
   - Links to repo and deployment
   - Thank you
```

---

**Remember: They're not just evaluating your code - they're evaluating if they want to WORK with you. Show competence, professionalism, and positive energy!** 🚀

**Key Message:** "I don't just write code that works - I write code that's maintainable, performant, and production-ready."
