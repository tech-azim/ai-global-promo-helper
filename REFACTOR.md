Refactor & Technical Debt Notes
This document tracks planned architectural improvements and code quality enhancements for the Kopi Kita CRM project.

1. State Management & Data Fetching
Implement TanStack Query (React Query): Replace manual useEffect fetching with useQuery. This will provide out-of-the-box caching, automatic background refetching, and better loading/error states.

Debounced Search: Currently, the search input triggers an API call on almost every keystroke. Implementing a custom useDebounce hook will significantly reduce server load and improve UI responsiveness.

Optimistic Updates: Implement optimistic UI patterns for Delete and Edit actions so the UI updates instantly before the server confirms the change.

2. Component Architecture
Component Decomposition: The CustomersPage.tsx is becoming a "Mega Component" (>300 lines). It should be split into smaller, focused components:

CustomerSearch.tsx: Handles search input and interest filtering.

CustomerGrid.tsx: Manages the layout and empty states.

CustomerFormModal.tsx: Encapsulates the modal logic and form state.

Zod Schema Validation: Integrate Zod with Ant Design's Form for robust client-side and server-side validation.

3. Database & API Optimization
Multi-Interest Filtering: Enhance GET /api/customers to support multiple interest tags using the PostgreSQL .overlaps() operator instead of a single .contains() filter.

Pagination / Infinite Scroll: As the database grows beyond 100+ customers, implement server-side pagination to keep the initial load time fast.

Unified Embedding Logic: Finalize the removal of all legacy 768-dimension code. Ensure all internal utilities strictly use the 1536 dimension standard for text-embedding-3-small.

4. UI/UX & Styling
Design System Consistency: Extract inline styles into a centralized theme.ts or transition to Tailwind CSS to ensure the "Kopi Kita" brand aesthetic (browns/coffees) is consistent across all pages.

Enhanced Empty States: Replace the basic empty state with more helpful onboarding tips or a "Getting Started" guide for new users.

Why these changes?
Scalability: Preparing the app to handle thousands of customers without performance degradation.

Maintainability: Making the codebase easier for other developers (or future-you) to understand and modify.

Accuracy: By moving to native 1536 dimensions and better filtering, the AI Chatbot (Mimi) will provide much more precise context-aware answers.