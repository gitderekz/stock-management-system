# Task: Build a Flutter Mobile App from the Existing React Frontend

I have an existing production-ready application consisting of:

* **Backend:** Node.js
* **Web frontend:** React.js
* **API:** The React frontend already communicates with the Node.js backend through existing APIs.

I now want to create a **Flutter mobile application that acts as an alternative frontend/client for the existing backend**.

The Flutter application must NOT replace or modify the existing backend unless absolutely necessary. The goal is to reproduce the existing React application's **flows, functionality, business behavior, and visual design** in Flutter.

The existing React frontend should be treated as the **primary source of truth** for the mobile application's requirements.

---

## 1. Primary Objective

Build a Flutter application that provides the same user experience and functionality as the existing React application.

The Flutter app should:

* Use the existing Node.js APIs.
* Implement the same business flows.
* Implement the same authentication behavior.
* Implement the same permissions/authorization behavior.
* Implement the same validations.
* Implement the same CRUD operations.
* Implement the same search/filter/sort behavior.
* Implement the same pagination/infinite scrolling behavior where applicable.
* Implement the same loading states.
* Implement the same empty states.
* Implement the same error states.
* Implement the same success states.
* Implement the same navigation flow.
* Implement equivalent forms and form validation.
* Implement equivalent modals/dialogs/bottom sheets.
* Implement equivalent notifications/toasts/snackbars.
* Implement equivalent file/image upload functionality where present.
* Implement equivalent logout/session-expiration behavior.
* Preserve the existing API contracts.

The final Flutter app should feel like the **mobile version of the existing React application**, not a new application with approximately similar functionality.

---

# 2. IMPORTANT: Analyze Before Coding

Do NOT immediately start generating Flutter code.

First inspect and understand the existing project.

Analyze:

### Backend/API

Identify:

* API base URL
* Authentication mechanism
* Login/logout flow
* Token/session handling
* Refresh-token behavior
* API headers
* Request/response structures
* HTTP methods
* Endpoints
* Query parameters
* Path parameters
* Request bodies
* Response models
* Error response formats
* HTTP status-code handling
* File upload/download behavior
* Pagination
* Filtering
* Sorting
* Search
* Role/permission handling

Do not invent new API contracts if an existing API already supports the required functionality.

---

### React Frontend

Systematically inspect the entire React application.

Identify:

* All routes
* All pages/screens
* Nested routes
* Protected routes
* Public routes
* Navigation structure
* Components
* Reusable components
* Forms
* Form validation
* Tables
* Lists
* Cards
* Modals
* Dialogs
* Drawers
* Dropdowns
* Tabs
* Search
* Filters
* Sorting
* Pagination
* Infinite scrolling
* Uploads
* Images
* Empty states
* Loading states
* Error states
* Success states
* Notifications
* Authentication
* Authorization
* User roles
* Permissions
* Local storage usage
* Cookies
* Session handling
* API services
* Global state
* Context/state management
* Business logic
* Utility functions
* Date/time handling
* Formatting
* Theme
* Colors
* Typography
* Icons
* Images/assets
* Responsive behavior

Trace each important user flow from:

**UI → state → API/service → response → state update → UI**

Do not infer functionality solely from filenames. Read the actual implementation.

---

# 3. Create a Feature/Screen Inventory First

Before implementing the application, create an inventory such as:

| React Route | Flutter Screen    | Purpose        | API Endpoints  | State           | User Actions  |
| ----------- | ----------------- | -------------- | -------------- | --------------- | ------------- |
| /login      | LoginScreen       | Authentication | POST /login    | AuthBloc        | Login         |
| /dashboard  | DashboardScreen   | Overview       | GET /dashboard | DashboardBloc   | View data     |
| /users      | UsersScreen       | User list      | GET /users     | UsersBloc       | Search/filter |
| /users/:id  | UserDetailsScreen | User details   | GET /users/:id | UserDetailsBloc | Edit/delete   |

The actual inventory must be based on the codebase, not assumptions.

Also identify dependencies between screens and flows.

For example:

Login
→ authentication state
→ dashboard
→ user list
→ user details
→ edit user
→ API update
→ refresh user list

This analysis should be completed before substantial Flutter implementation begins.

---

# 4. Flutter Architecture

Use a clean, maintainable Flutter architecture.

Prefer a structure similar to:

lib/
├── core/
│   ├── constants/
│   ├── errors/
│   ├── network/
│   ├── storage/
│   ├── theme/
│   ├── utils/
│   └── widgets/
│
├── features/
│   ├── auth/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   │       ├── bloc/
│   │       ├── pages/
│   │       └── widgets/
│   │
│   ├── dashboard/
│   ├── users/
│   ├── settings/
│   └── ...
│
└── main.dart

Adapt the structure to the actual project rather than blindly following this example.

---

# 5. State Management — BLoC

**BLoC is mandatory.**

Use the `flutter_bloc` ecosystem.

Do not implement application/business state using:

* Provider
* Riverpod
* GetX
* MobX
* Redux
* ad-hoc global variables
* excessive StatefulWidget state

Use BLoC/Cubit appropriately.

For each feature, determine whether a `Bloc` or `Cubit` is more appropriate.

Examples:

* AuthBloc
* LoginCubit
* DashboardBloc
* UsersBloc
* UserDetailsBloc
* SettingsCubit

Keep business logic out of widgets.

Widgets should primarily:

* render state
* dispatch events/actions
* collect user input
* display feedback

BLoCs/Cubits should handle state transitions and coordinate with repositories/use cases.

---

# 6. Recommended Layering

Where appropriate, use:

**Presentation → BLoC/Cubit → Repository → Data Source/API → Node.js Backend**

For example:

Flutter UI
↓
UsersBloc
↓
UsersRepository
↓
UsersRemoteDataSource
↓
HTTP client
↓
Existing Node.js API

Keep API-specific implementation out of UI widgets.

---

# 7. API Integration

The existing Node.js backend is the source of truth for backend functionality.

Do not create duplicate business logic in Flutter when the backend already owns that logic.

Create appropriate:

* API client
* interceptors
* DTO/model classes
* repositories
* error handling
* authentication handling
* serialization/deserialization

Use the API's existing request and response formats.

If the React app already has an API service layer, use it to understand the exact API contracts.

Do NOT arbitrarily rename fields, alter payloads, or change endpoint behavior.

---

# 8. Authentication

Reproduce the React application's authentication flow exactly.

Determine:

* Login
* Logout
* Token storage
* Token refresh
* Session expiration
* Unauthorized responses
* Startup authentication check
* Redirect/navigation after authentication
* Protected screens
* Role-based access
* Permission-based UI

Use secure mobile storage where appropriate.

The Flutter application should correctly restore authentication state after being restarted if the React application does so.

---

# 9. UI/UX Reproduction

The existing React UI should be treated as the visual reference.

Reproduce as closely as reasonably possible:

* Colors
* Typography
* Font weights
* Font sizes
* Spacing
* Padding
* Margins
* Border radius
* Borders
* Shadows
* Cards
* Buttons
* Inputs
* Icons
* Images
* App bars
* Navigation
* Tabs
* Dialogs
* Bottom sheets
* Lists
* Empty states
* Loading indicators
* Error messages
* Success messages

However, do NOT blindly copy desktop layouts onto a phone.

The goal is:

**same design language + same functionality + same flow, adapted properly to mobile.**

For example:

React desktop table
→ appropriate Flutter mobile list/card representation

React sidebar
→ appropriate mobile navigation/drawer/bottom navigation

React modal
→ appropriate Flutter dialog/bottom sheet

Preserve the meaning and functionality while adapting the interaction model to mobile.

---

# 10. Responsive/Mobile Design

The Flutter application must be designed specifically for mobile devices.

Support at minimum:

* Small phones
* Standard phones
* Large phones

Avoid hardcoded dimensions wherever possible.

Handle:

* different screen widths
* keyboard appearance
* safe areas
* scrolling
* orientation where appropriate
* long text
* dynamic content
* accessibility/text scaling where practical

Do not create layouts that only work on the device used during development.

---

# 11. Navigation

Reproduce the React application's navigation logic.

Document and implement:

* public routes
* authenticated routes
* nested routes
* navigation guards
* role-based navigation
* deep navigation
* back behavior
* logout navigation
* post-login navigation
* post-action navigation

Use a consistent Flutter navigation solution.

Do not scatter navigation logic throughout arbitrary widgets.

---

# 12. Forms

Every React form should be analyzed and reproduced.

Preserve:

* Required fields
* Validation rules
* Input formats
* Default values
* Error messages
* Disabled states
* Loading states
* Submission behavior
* Reset behavior
* Success behavior
* API validation errors

Do not simplify forms just because the Flutter implementation is different.

---

# 13. Loading / Error / Empty States

Every API-driven screen should explicitly handle:

### Loading

Display an appropriate loading UI.

### Success

Display the actual data.

### Empty

Display the equivalent empty state from the React application.

### Error

Display an understandable error state/message.

### Retry

Where the React app supports retrying, implement equivalent retry behavior.

Do not leave screens blank while network requests are executing.

---

# 14. Assets

Inspect the React project for:

* logos
* SVGs
* PNGs
* JPGs
* icons
* fonts
* illustrations

Reuse the existing assets where licensing/project ownership permits.

If an asset cannot be directly used in Flutter, determine the appropriate equivalent rather than silently replacing it with an unrelated icon.

---

# 15. Dependencies

Choose stable and actively maintained Flutter packages.

At minimum, evaluate:

* flutter_bloc
* dio/http
* secure storage
* routing
* JSON serialization
* image/file handling

Do not add unnecessary dependencies.

Before introducing a package, determine whether Flutter's standard library can reasonably handle the requirement.

---

# 16. Do Not Change the Backend Unnecessarily

The backend already works.

Therefore:

**Do not modify the Node.js backend simply to make Flutter development easier.**

If you encounter an API limitation:

1. Verify how the React frontend handles it.
2. Determine whether the existing API already supports the requirement.
3. Prefer implementing the Flutter side according to the existing API.
4. Only propose a backend change if it is genuinely required.
5. Clearly explain the reason before making such a change.

---

# 17. Preserve Existing Business Behavior

The Flutter application must not accidentally change business rules.

For every feature, compare:

React behavior
→ Flutter behavior

Check:

* What happens when the user taps the action?
* What API is called?
* What parameters are sent?
* What happens while waiting?
* What happens on success?
* What happens on failure?
* What happens if the API returns no data?
* What happens if the user lacks permission?
* What happens after the operation?
* Does the screen refresh?
* Does navigation occur?
* Is a notification displayed?

Reproduce these behaviors.

---

# 18. Implementation Process

Work incrementally.

### Phase 1 — Discovery

Analyze the existing React project and backend.

Produce:

* route inventory
* feature inventory
* API inventory
* authentication flow
* navigation flow
* state-management mapping
* asset inventory
* UI/theme inventory
* dependency inventory

Do not begin blindly implementing screens.

### Phase 2 — Architecture

Define:

* Flutter folder structure
* models
* repositories
* API client
* authentication infrastructure
* BLoCs/Cubits
* navigation
* theme
* shared widgets

### Phase 3 — Foundation

Implement:

* Flutter project configuration
* theme
* API client
* error handling
* secure storage
* authentication
* navigation
* shared components
* common widgets

### Phase 4 — Features

Implement features one by one.

For every feature:

1. Understand the React implementation.
2. Identify its API dependencies.
3. Identify its state.
4. Create models.
5. Create data source/repository.
6. Create BLoC/Cubit.
7. Create Flutter screen.
8. Create reusable widgets.
9. Implement validation.
10. Implement loading/error/empty/success states.
11. Test the complete user flow.
12. Compare behavior against React.

### Phase 5 — Verification

After implementation, perform a complete feature-by-feature comparison.

---

# 19. Verification Checklist

For every React screen, verify:

### Functionality

* [ ] Screen exists
* [ ] Navigation works
* [ ] API calls work
* [ ] Correct HTTP methods are used
* [ ] Correct request parameters are used
* [ ] Correct response fields are mapped
* [ ] Authentication works
* [ ] Authorization works
* [ ] Forms work
* [ ] Validation matches
* [ ] Search works
* [ ] Filtering works
* [ ] Sorting works
* [ ] Pagination works
* [ ] CRUD operations work
* [ ] Uploads work
* [ ] Logout works
* [ ] Session expiration works

### UI

* [ ] Layout matches the intended design
* [ ] Colors match
* [ ] Typography matches
* [ ] Spacing is consistent
* [ ] Buttons match
* [ ] Inputs match
* [ ] Icons match
* [ ] Images/assets match
* [ ] Dialogs match
* [ ] Bottom sheets match
* [ ] Loading states match
* [ ] Empty states match
* [ ] Error states match
* [ ] Success feedback matches

### Mobile

* [ ] Small screen works
* [ ] Large screen works
* [ ] Keyboard does not break forms
* [ ] Scrolling works
* [ ] Safe areas are handled
* [ ] Long content works
* [ ] Back navigation works
* [ ] Network failures are handled

---

# 20. Important Development Rules

Follow these rules throughout the implementation:

1. **Do not guess when the existing code can answer the question.**
2. Inspect the React implementation before reproducing functionality.
3. Inspect the backend/API before creating API integrations.
4. Reuse existing API contracts.
5. Do not duplicate business logic unnecessarily.
6. Keep business logic out of UI widgets.
7. Use BLoC/Cubit for state management.
8. Keep widgets reasonably small and reusable.
9. Avoid giant screens/files containing everything.
10. Avoid unnecessary abstractions.
11. Avoid premature optimization.
12. Avoid unnecessary dependencies.
13. Handle all API states explicitly.
14. Preserve existing error messages/behavior where appropriate.
15. Do not remove functionality simply because it is inconvenient to implement on mobile.
16. If desktop functionality needs a mobile-specific UI pattern, preserve the functionality while adapting the presentation.
17. Do not silently invent functionality.
18. If something is ambiguous, inspect more of the existing code before deciding.
19. If something genuinely cannot be determined, clearly state the assumption.
20. Keep the Flutter code production-quality and maintainable.

---

# 21. Code Quality

The final code should:

* Follow Dart/Flutter conventions.
* Be null-safe.
* Be strongly typed.
* Avoid unnecessary `dynamic`.
* Avoid duplicated API logic.
* Avoid duplicated UI logic.
* Have clear separation of concerns.
* Use meaningful names.
* Handle exceptions properly.
* Provide useful error states.
* Avoid memory leaks.
* Dispose resources correctly.
* Avoid unnecessary rebuilds.
* Keep BLoCs/Cubits testable.
* Keep repositories testable.
* Keep API communication testable.

---

# 22. Testing

Where practical, add:

* Unit tests for important business logic.
* BLoC/Cubit tests.
* Repository tests.
* Widget tests for important screens.
* Integration tests for critical user journeys.

Prioritize critical flows such as:

* Login
* Logout
* Authentication restoration
* Main navigation
* Core CRUD operations
* Important forms
* Important API interactions

---

# 23. Handling Unknowns

If you encounter something that is unclear:

Do not immediately invent a solution.

Instead:

1. Search the React codebase.
2. Search the backend codebase.
3. Trace the API call.
4. Inspect related components/services.
5. Determine the existing behavior.
6. Implement the Flutter equivalent.

If it still cannot be determined, explicitly report:

* What is unknown
* What you inspected
* The assumption you propose
* Why the assumption is reasonable

Then continue with the rest of the implementation without hiding the uncertainty.

---

# 24. Working With the Existing Repository

When modifying the repository:

* First inspect the existing project structure.
* Do not overwrite existing files unnecessarily.
* Do not delete existing functionality.
* Do not modify React code unless specifically required.
* Keep the Flutter application isolated from the existing frontend where practical.
* Reuse documentation/configuration/API information where appropriate.

Before creating duplicate models or API definitions, check whether equivalent definitions already exist.

---

# 25. Definition of Done

The project is complete only when:

1. Every relevant React user flow has a Flutter equivalent.
2. Every required API integration works.
3. Authentication works.
4. Navigation works.
5. BLoC/Cubit state management is consistently used.
6. Forms and validation work.
7. Loading/error/empty/success states are implemented.
8. Core business functionality matches the React application.
9. Mobile UI faithfully follows the React application's design language.
10. Mobile-specific layouts are properly adapted.
11. No important functionality has been silently omitted.
12. The application builds successfully.
13. Static analysis has no significant errors.
14. Tests for critical functionality pass.
15. The final implementation is maintainable and production-ready.

---

# 26. How You Should Work With Me

Do not attempt to generate the entire application blindly in one response.

Work in stages.

Start by **analyzing the existing React frontend and Node.js backend**.

First give me:

1. A complete application/feature inventory.
2. A route/screen mapping.
3. An API inventory.
4. An authentication-flow analysis.
5. A navigation-flow analysis.
6. A proposed Flutter architecture.
7. A BLoC/Cubit mapping.
8. Required Flutter packages.
9. Potential implementation risks or ambiguities.
10. A phased implementation plan.

Do not start writing large amounts of Flutter code until this analysis is complete.

After I approve the architecture, implement the application feature-by-feature.

For each feature, explain briefly:

* What you found in React.
* Which API endpoints it uses.
* Which Flutter files will be created/modified.
* Which BLoC/Cubit handles the state.
* How the Flutter implementation corresponds to the React implementation.

Then implement it.

**The existing React frontend is the behavioral and visual reference. The existing Node.js backend is the API/business-system reference. Flutter is a new client, not a new backend.**
