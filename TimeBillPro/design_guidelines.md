# Design Guidelines: Property Grant Analyzer Platform

## Design Approach

**Selected Approach**: Design System - Carbon Design System with Linear influences

**Justification**: This is a data-intensive enterprise productivity tool requiring clarity, consistency, and efficient information hierarchy. Carbon Design excels at data-heavy applications while Linear's modern aesthetic brings contemporary polish to project management interfaces.

**Key Design Principles**:
- Data clarity over decoration
- Consistent interaction patterns for professional workflows
- Information hierarchy through typography and spacing, not color
- Purposeful use of space to reduce cognitive load
- Enterprise-grade accessibility and keyboard navigation

---

## Core Design Elements

### A. Color Palette

**Light Mode**:
- **Primary Brand**: 212 100% 47% (Deep Blue - professional, trustworthy)
- **Background**: 0 0% 100% (Pure White - maximum contrast for data)
- **Surface**: 220 14% 96% (Light Gray - cards and panels)
- **Border**: 220 13% 91% (Subtle separation)
- **Text Primary**: 220 13% 18% (Near Black)
- **Text Secondary**: 220 9% 46% (Medium Gray)
- **Success**: 142 76% 36% (FEMA approval green)
- **Warning**: 38 92% 50% (Compliance alerts)
- **Error**: 0 84% 60% (Critical flood zones)

**Dark Mode**:
- **Primary Brand**: 212 100% 57% (Lighter blue for contrast)
- **Background**: 220 13% 12% (Dark charcoal)
- **Surface**: 220 13% 16% (Elevated panels)
- **Border**: 220 9% 24% (Subtle lines)
- **Text Primary**: 0 0% 95% (Off-white)
- **Text Secondary**: 220 9% 65% (Medium gray)
- **Success**: 142 76% 45%
- **Warning**: 38 92% 60%
- **Error**: 0 84% 70%

### B. Typography

**Font Stack**:
- **Primary**: "Inter", system-ui, sans-serif (clean, readable at all sizes)
- **Monospace**: "JetBrains Mono", monospace (for coordinates, IDs, data fields)

**Type Scale**:
- **Page Titles**: text-3xl font-semibold (36px, 600 weight)
- **Section Headings**: text-xl font-semibold (20px, 600 weight)
- **Subsection Headings**: text-lg font-medium (18px, 500 weight)
- **Body**: text-base (16px, 400 weight)
- **Labels**: text-sm font-medium (14px, 500 weight)
- **Captions/Meta**: text-sm text-secondary (14px, normal)
- **Data Values**: text-base font-mono (16px, monospace for precision)

### C. Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16**

**Common Patterns**:
- **Page Padding**: p-6 on mobile, p-8 on desktop
- **Card Padding**: p-6
- **Component Spacing**: space-y-6 for vertical stacks
- **Form Field Spacing**: space-y-4
- **Button Spacing**: px-6 py-2.5
- **Section Gaps**: gap-8 between major sections

**Grid System**:
- **Dashboard**: 3-column grid on desktop (grid-cols-3), 1-column on mobile
- **Data Tables**: Full-width with horizontal scroll on mobile
- **Form Layouts**: 2-column on desktop (grid-cols-2 gap-6), 1-column on mobile
- **Queue Management**: Kanban columns use grid-cols-3 with equal width

**Container Constraints**:
- **Max Width**: max-w-7xl mx-auto (dashboard, main content)
- **Forms**: max-w-2xl (optimal input width)
- **Data Tables**: Full width within container

### D. Component Library

**Navigation**:
- **Top Bar**: Horizontal navigation with logo left, user menu right, height h-16, border-b
- **Dashboard Cards**: Large clickable cards with icons, shadows on hover (shadow-lg), min-height h-48

**Forms & Inputs**:
- **Text Input**: Consistent border (border-2), rounded-lg, p-3, focus ring (ring-2 ring-primary)
- **Address Search**: Prominent search bar with icon, rounded-full for hero placement
- **Submit Buttons**: Primary color, px-6 py-3, rounded-lg, font-medium
- **Coordinate Inputs**: Two-column grid (Latitude/Longitude) with monospace font

**Data Display**:
- **Property Reports**: Card-based layout with labeled data pairs (Key: Value format)
- **Data Grid**: 2-column grid for property attributes (Label on left, Value on right)
- **Badges**: Rounded-full px-3 py-1 text-sm for flood zones (color-coded by severity)
- **Dividers**: border-t my-6 to separate report sections

**Project Management (Queue)**:
- **Kanban Columns**: Three fixed columns (To-Do, In Progress, Done) with gray backgrounds
- **Task Cards**: White/dark surface, p-4, rounded-lg, draggable appearance
- **Status Badges**: Small rounded pills with status-specific colors
- **Assignment Avatars**: Circular, w-8 h-8, with initials or icons

**Tables (Compliance/Session Lists)**:
- **Header**: Sticky top-0, bg-surface with stronger border-b
- **Rows**: Hover state (hover:bg-surface/50), border-b for separation
- **Cells**: p-4, text-left alignment
- **Action Buttons**: Icon-only buttons in right column (text-gray-600 hover:text-primary)

**Modals & Overlays**:
- **Modal Background**: backdrop-blur-sm bg-black/50
- **Modal Panel**: bg-white dark:bg-surface, rounded-xl, p-6, max-w-2xl
- **Close Button**: Absolute top-4 right-4, icon-only

**Empty States**:
- **Centered Content**: flex flex-col items-center justify-center with icon, heading, description
- **Muted Colors**: text-secondary for descriptions
- **CTA Button**: Primary button to initiate action

### E. Animations

**Purposeful Motion Only**:
- **Page Transitions**: None - instant navigation for efficiency
- **Card Hover**: transition-shadow duration-200 (subtle lift effect)
- **Button Hover**: transition-colors duration-150
- **Modal Entry**: fade-in only, no slide animations
- **Loading States**: Spinner or skeleton screens, no elaborate animations
- **Drag & Drop (Queue)**: Browser default visual feedback

---

## Module-Specific Guidelines

**Login Page**:
- Centered card (max-w-md) with logo, form fields, and primary CTA
- Minimal branding, focus on function
- No decorative background, solid color only

**Dashboard**:
- Three equal-width cards in grid layout
- Each card has large icon (w-12 h-12), title, and brief description
- Hover effect reveals subtle shadow elevation

**Technical Service Page**:
- Prominent search section at top with address/coordinate inputs
- Two-panel layout: Input form (left), Results list (right) on desktop
- Property reports display in expandable cards with structured data grid
- Session list shows recent analyses as compact list items

**Compliance Module**:
- Checklist-style interface with sections and checkboxes
- Progress indicator showing completion percentage
- Clear section headers with collapsible panels

**Queue Management**:
- Kanban board with three columns of equal width
- Filter/search bar above columns
- Task cards show title, assignee, status badge, and timestamp
- Add task button at top of each column