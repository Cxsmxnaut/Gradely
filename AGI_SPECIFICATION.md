# Gradely AGI Specification for UI Builder

## 🎯 **Application Overview**
**Name**: Gradely  
**Type**: Advanced Grade Calculator for StudentVUE  
**Architecture**: SvelteKit + TypeScript + TailwindCSS  
**Purpose**: Interface with StudentVUE® to provide grade analysis, hypothetical calculations, and comprehensive student data visualization

---

## 🏗️ **Technical Requirements**

### **Framework & Dependencies**
```json
{
  "framework": "SvelteKit 2.50.0",
  "language": "TypeScript 5.9.3",
  "styling": "TailwindCSS 4.1.18",
  "ui_library": "shadcn/ui",
  "charts": "LayerChart 2.0.0-next.43",
  "icons": "Lucide Svelte 0.562.0",
  "animations": "NumberFlow 0.3.9",
  "build_tool": "Vite 7.3.1"
}
```

### **Core Dependencies**
- @sveltejs/kit, svelte, typescript
- tailwindcss, @tailwindcss/vite
- @lucide/svelte, @number-flow/svelte
- bits-ui, layerchart, clsx
- fast-xml-parser, file-type
- msw (for development mocking)

---

## 📁 **Project Structure**
```
src/
├── routes/
│   ├── +page.svelte              # Landing page with feature showcase
│   ├── (authed)/                 # Protected routes layout
│   │   ├── +layout.svelte        # Authenticated layout with sidebar
│   │   ├── AppSidebar.svelte     # Navigation sidebar
│   │   ├── grades/               # Grade management section
│   │   │   ├── +page.svelte     # Course selection page
│   │   │   ├── [index]/         # Individual course grades
│   │   │   │   ├── +page.svelte # Main grade interface
│   │   │   │   ├── AssignmentCard.svelte
│   │   │   │   ├── AssignmentTabs.svelteru
│   │   │   │   ├── GradeChart.svelte
│   │   │   │   ├── TargetGradeCalculator.svelte
│   │   │   │   ├── GradeCategoryTable.svelte
│   │   │   │   └── CalculationError.svelte
│   │   ├── attendance/           # Attendance tracking
│   │   ├── documents/            # Document management
│   │   ├── mail/                 # Mail system
│   │   ├── studentinfo/         # Student information
│   │   └── feedback/             # Feedback system
│   ├── login/+page.svelte       # Authentication page
│   ├── signup/                   # Registration flow
│   ├── privacy/+page.svelte      # Privacy policy
│   └── feedback/+page.svelte     # Feedback form
├── lib/
│   ├── components/ui/            # shadcn/ui component library
│   ├── grades/                   # Grade calculation engine
│   ├── synergy.ts                # StudentVUE API integration
│   ├── mocks/                    # Development mocking system
│   └── types/                    # TypeScript definitions
```

---

## 🔐 **Authentication System**

### **Login Page Requirements**
```typescript
// Form Fields
- username: string (StudentVUE username)
- password: string (StudentVUE password) 
- domain: string (StudentVUE district domain)
- disclaimer: checkbox (required)

// Features
- Domain helper dialog (paste URL to extract domain)
- Error handling with toast notifications
- Loading state during authentication
- Auto-redirect if already logged in
- Local storage credential management
```

### **Account Management**
```typescript
interface StudentAccount {
  domain: string;
  username: string;
  password: string;
}

// Storage
- localStorage token management
- Session persistence
- Auto-login on page load
- Secure credential handling
```

---

## 📊 **Grade Calculation Engine**

### **Core Data Models**
```typescript
interface Assignment {
  id: string;
  name: string;
  pointsEarned?: number;
  pointsPossible?: number;
  unscaledPoints?: { pointsEarned: number; pointsPossible: number };
  extraCredit: boolean;
  gradePercentageChange?: number;
  notForGrade: boolean;
  hidden: boolean;
  category?: string;
  date: Date;
  newHypothetical: boolean;
  description?: string;
  comments?: string;
}

interface Category {
  name: string;
  weightPercentage: number;
  pointsEarned: number;
  pointsPossible: number;
  weightedPercentage: number;
  gradeLetter: string;
}
```

### **Calculation Functions**
```typescript
// Core calculations
- calculateGradePercentage(pointsEarned, pointsPossible)
- calculateCourseGradePercentageFromCategories(pointsByCategory, gradeCategories)
- calculateCourseGradePercentageFromTotals(assignments)
- calculateAssignmentGPCs(assignments, gradeCategories)
- calculatePointsNeededForTargetGrade(options)

// Assignment processing
- parseSynergyAssignment(synergyData)
- getCalculableAssignments(assignments)
- getHiddenAssignmentsFromCategories(categories, pointsByCategory)
- gradesMatch(calculatedGrade, synergyGrade)
```

---

## 🧮 **Hypothetical Mode System**

### **Main Grade Interface**
```typescript
// State Management
let hypotheticalMode = $state(false);
let calculatedGrade = $state(NaN);
let hypotheticalGrade = $state(NaN);
let reactiveAssignments: ReactiveAssignment[] = $state([]);

// Core Functions
- initReactiveAssignments()
- recalculateGradePercentage()
- addHypotheticalAssignment()
```

### **Assignment Card Component**
```typescript
// Editable Fields (in hypothetical mode)
- pointsEarned: number | undefined
- pointsPossible: number | undefined
- category: string | undefined
- extraCredit: boolean
- notForGrade: boolean

// Display Fields
- name: string
- date: Date
- gradePercentageChange: number | undefined
- description?: string
- comments?: string
- hidden: boolean
- newHypothetical: boolean
```

### **Target Grade Calculator**
```typescript
interface TargetGradeCalculatorProps {
  initialGradePercentage?: number;
  assignments: ReactiveAssignment[];
  categoryColors: Map<string, BadgeColor>;
  gradeCategoryWeightProportions?: Map<string, number>;
}

// Features
- Target grade percentage input
- Assignment selection dropdown
- Points needed calculation
- Category-aware calculations
- Real-time updates
```

---

## 📈 **Data Visualization**

### **Grade Chart Component**
```typescript
interface GradeChartProps {
  assignments: Assignment[];
  gradeCategories?: Category[];
  animate: boolean;
  error?: boolean;
}

// Chart Features
- Time-series grade progression
- Assignment impact visualization
- Interactive points with hover details
- Category breakdown visualization
- New assignment highlighting
- Smooth animations with NumberFlow
```

### **Chart Implementation**
```typescript
// Using LayerChart
- AreaChart for grade progression
- LinearGradient for grade ranges
- Points for assignment markers
- Responsive design
- Error state handling
```

---

## 🎨 **UI Component Requirements**

### **Design System**
```css
/* TailwindCSS Configuration */
- Dark/Light mode support
- Responsive breakpoints (xs, sm, md, lg, xl, 2xl)
- Color palette (primary, secondary, muted, tertiary)
- Typography scale
- Spacing system
- Animation utilities
```

### **Component Library (shadcn/ui)**
```typescript
// Required Components
- Alert (error/info messages)
- Button (primary, secondary, ghost, card variants)
- Card (with header, content, footer)
- Dialog (modals for forms/calculators)
- Field (form input containers)
- Input (text, number, password)
- Label (form labels)
- Sidebar (navigation system)
- Spinner (loading indicators)
- Table (data display)
- Tabs (content organization)
- Checkbox (toggle options)
- Dropdown Menu (selection interfaces)
- Progress (grade visualization)
- Badge (category indicators)
```

### **Layout Components**
```typescript
// AppSidebar
- Course listing from gradebook
- Navigation items (Grades, Attendance, Documents, Mail, StudentInfo)
- User menu with theme toggle and logout
- PWA install prompt
- Mobile responsive design

// AssignmentTabs
- Tab navigation (All, by Category)
- Assignment filtering
- Hypothetical mode support
- Category color coding
```

---

## 🔌 **API Integration**

### **StudentVUE API Methods**
```typescript
// Core API Endpoints
- Gradebook: Fetch assignments and grades
- Attendance: Get attendance records
- StudentInfo: Retrieve student data
- Documents: Access report cards and documents
- Mail: Get student mail and attachments
- GenerateAuthToken: Authentication

// API Implementation
- SOAP/XML communication protocol
- Envelope wrapping for requests
- XML parsing with fast-xml-parser
- Error handling and validation
- Response type safety
```

### **Data Processing**
```typescript
// XML Configuration
const alwaysArray = [
  'Gradebook.Courses.Course',
  'Gradebook.Courses.Course.Marks.Mark',
  'Gradebook.Courses.Course.Marks.Mark.Assignments.Assignment',
  'Gradebook.ReportingPeriods.ReportPeriod',
  'Attendance.Absences.Absence'
];

// Parser Configuration
- Attribute handling with prefix '_'
- Boolean value processing
- Array normalization
- Type safety with TypeScript
```

---

## 📱 **Page Specifications**

### **Landing Page (/)**
```typescript
// Features Section
- Grade Chart visualization
- Grade Calculator description
- Attendance and more features
- Private Login security explanation

// Layout
- Hero section with app branding
- Feature cards grid (responsive)
- Demo images (light/dark mode)
- Call-to-action buttons (Login/Signup)
- GitHub repository link
- Footer with disclaimer
```

### **Grades Page (/grades)**
```typescript
// Course Selection
- Course buttons with names
- Report period switcher
- Loading states
- Error handling

// Navigation
- Sidebar with course list
- Mobile responsive menu
- Breadcrumb navigation
```

### **Individual Course Page (/grades/[index])**
```typescript
// Main Components
- Grade display with percentage
- Hypothetical mode toggle
- Grade chart (pinnable to top)
- Assignment tabs (All, by Category)
- Category table (if categories exist)
- Target grade calculator button
- Calculation error warnings

// Assignment Management
- Add hypothetical assignment
- Reset to original data
- Filter by category
- Sort options
- Search functionality
```

---

## 🎯 **Interactive Features**

### **Hypothetical Mode Interactions**
```typescript
// User Actions
- Toggle hypothetical mode (checkbox)
- Edit assignment points (number inputs)
- Change assignment categories (dropdown)
- Toggle extra credit (checkbox)
- Mark not for grade (checkbox)
- Add new hypothetical assignments
- Calculate target grades

// Real-time Updates
- Grade recalculation on changes
- Chart updates
- Category table updates
- Grade percentage change indicators
```

### **Chart Interactions**
```typescript
// User Interactions
- Hover over points for details
- Click to focus on assignment
- Pin chart to top of screen
- Toggle animation
- Zoom/pan capabilities

// Visual Feedback
- Tooltips with assignment info
- Highlight new assignments
- Grade change indicators
- Error state visualization
```

---

## 🔧 **Development Requirements**

### **Build Configuration**
```typescript
// Vite Configuration
- SvelteKit plugin
- TailwindCSS plugin
- PWA assets generator
- Development server configuration
- Build optimization

// Environment Variables
PUBLIC_DISABLE_MSW=true          # Disable mocking
PUBLIC_MOCK_STUDENTVUE_ORIGIN=   # Mock domain (if needed)
STUDENTVUE_DOMAIN=               # StudentVUE domain
STUDENTVUE_USERNAME=             # Username (for mocks)
STUDENTVUE_PASSWORD=             # Password (for mocks)
```

### **Mocking System**
```typescript
// MSW Configuration
- Service worker setup
- Mock data generation
- XML response handling
- Development mode only
- Environment variable control

// Mock Data Structure
- AttachmentXML.xml
- Attendance.xml
- DocumentData.xml
- Gradebook.xml
- StudentDocuments.xml
- StudentInfo.xml
- SynergyMailDataXML.xml
```

---

## 🌐 **Deployment & Performance**

### **Build Optimization**
```typescript
// SvelteKit Configuration
- Auto adapter detection
- Static site generation
- Code splitting by routes
- Asset optimization
- PWA manifest generation
- Service worker registration
```

### **Performance Features**
- Lazy loading for routes
- Image optimization
- Component lazy loading
- Efficient state management
- Minimal bundle size
- Fast initial load

---

## 📋 **Complete Implementation Checklist**

### **Core Functionality**
✅ StudentVUE authentication system  
✅ Grade calculation engine with category support  
✅ Hypothetical mode with real-time updates  
✅ Target grade calculator  
✅ Grade progression charts  
✅ Assignment impact tracking  
✅ Hidden assignment detection  
✅ Category-based analysis  

### **User Interface**
✅ Responsive design for all screen sizes  
✅ Dark/light mode toggle  
✅ Interactive data visualizations  
✅ Tabbed assignment views  
✅ Number flow animations  
✅ Loading states and error handling  
✅ Mobile navigation sidebar  
✅ Search and filter functionality  

### **Data Management**
✅ Local credential storage  
✅ Session persistence  
✅ Data validation and sanitization  
✅ Error boundary handling  
✅ Offline capability considerations  
✅ Export functionality  
✅ Bulk operations support  

### **Security & Privacy**
✅ Zero-knowledge architecture  
✅ Direct API connection (no intermediaries)  
✅ Local storage only  
✅ Privacy policy implementation  
✅ Secure authentication flow  
✅ Token management  
✅ Session security  

### **Development Features**
✅ TypeScript throughout  
✅ ESLint and Prettier configuration  
✅ Mock data system for development  
✅ Hot module replacement  
✅ Environment variable management  
✅ Build optimization  
✅ PWA support  

---

## 🚀 **Getting Started Commands**

```bash
# Installation
bun install

# Development
bun run dev

# Build
bun run build

# Preview
bun run preview

# Type Checking
bun run check

# Linting
bun run lint

# Format
bun run format

# Generate Mock Data
bun run generate-mocks
```

---

**This specification provides a complete blueprint for recreating Gradely with all its features, maintaining the same architecture, user experience, and technical standards.**
