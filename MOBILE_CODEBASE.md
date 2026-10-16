# React Native Mobile Application - Codebase Architecture

## Technology Stack

- React Native
- TypeScript
- Expo / React Native CLI
- React Navigation
- TanStack Query
- Zustand
- React Hook Form
- Zod
- Axios
- AsyncStorage / MMKV
- Secure Storage for sensitive credentials
- Firebase / Push Notifications
- Jest
- React Native Testing Library
- ESLint
- Prettier

---

# Project Structure

```text
src/
│
├── app/
│   ├── App.tsx
│   ├── providers/
│   │   ├── QueryProvider.tsx
│   │   ├── ThemeProvider.tsx
│   │   └── AuthProvider.tsx
│   └── config/
│       └── app.config.ts
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── components/
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   └── templates/
│
├── features/
│   ├── auth/
│   ├── profile/
│   ├── students/
│   ├── courses/
│   └── notifications/
│
├── screens/
│   ├── Auth/
│   │   ├── LoginScreen.tsx
│   │   └── ForgotPasswordScreen.tsx
│   ├── Home/
│   │   └── HomeScreen.tsx
│   ├── Students/
│   │   ├── StudentListScreen.tsx
│   │   └── StudentDetailScreen.tsx
│   └── Profile/
│       └── ProfileScreen.tsx
│
├── navigation/
│   ├── RootNavigator.tsx
│   ├── AuthNavigator.tsx
│   ├── AppNavigator.tsx
│   ├── types.ts
│   └── linking.ts
│
├── hooks/
│   ├── useAuth.ts
│   ├── useDebounce.ts
│   ├── useKeyboard.ts
│   └── useNetworkStatus.ts
│
├── services/
│   ├── api/
│   │   ├── apiClient.ts
│   │   └── apiConfig.ts
│   ├── auth/
│   ├── storage/
│   ├── notifications/
│   ├── permissions/
│   └── device/
│
├── store/
│   ├── auth.store.ts
│   ├── app.store.ts
│   └── ui.store.ts
│
├── schemas/
│   ├── auth.schema.ts
│   └── student.schema.ts
│
├── types/
│   ├── auth.types.ts
│   ├── student.types.ts
│   └── navigation.types.ts
│
├── constants/
│   ├── routes.ts
│   ├── messages.ts
│   └── app.constants.ts
│
├── utils/
│   ├── date.ts
│   ├── validation.ts
│   ├── storage.ts
│   └── permissions.ts
│
├── theme/
│   ├── colors.ts
│   ├── spacing.ts
│   ├── typography.ts
│   ├── radius.ts
│   └── shadows.ts
│
└── App.tsx
```

# Atomic Design

## Atoms

Smallest reusable UI components.

Examples:

- Button
- Text
- Input
- Icon
- Avatar
- Badge
- Checkbox
- Radio
- Switch
- Loader
- Divider
- Image

Use React Native primitives internally.

Example:

```tsx
<Button
  variant="primary"
  size="large"
  loading={isLoading}
  onPress={handleSubmit}
>
  Login
</Button>
```

## Molecules

Combination of atoms.

Examples:

- FormField
- SearchBar
- PasswordField
- SelectField
- UserInfo
- ListItem
- EmptyState
- ErrorState
- LoadingState
- ConfirmationDialog

## Organisms

Large reusable UI sections.

Examples:

- Header
- BottomTabBar
- StudentCard
- StudentList
- ProfileHeader
- LoginForm
- DashboardStats
- FilterPanel
- NotificationList

## Templates

Reusable screen layouts.

Examples:

- AuthTemplate
- MainTemplate
- DashboardTemplate
- DetailTemplate
- FormTemplate

---

# Screens

Screens should primarily compose templates and features.

Example:

```text
StudentListScreen
        ↓
StudentListTemplate
        ↓
StudentList
        ↓
StudentCard
        ↓
Atoms
```

Avoid putting API/business logic directly inside Screen components.

---

# Navigation

```text
navigation/
├── RootNavigator.tsx
├── AuthNavigator.tsx
├── AppNavigator.tsx
├── types.ts
└── linking.ts
```

Recommended flow:

```text
RootNavigator
│
├── AuthNavigator
│   ├── Login
│   ├── Register
│   └── ForgotPassword
│
└── AppNavigator
    ├── Home
    ├── Students
    ├── Notifications
    └── Profile
```

---

# API Architecture

```text
Screen
  ↓
Feature Hook
  ↓
Feature Service
  ↓
API Client
  ↓
Backend API
```

Example:

```text
useStudents()
      ↓
student.service.ts
      ↓
apiClient.ts
      ↓
REST API
```

---

# Storage

Do not directly access AsyncStorage/MMKV from screens or UI components.

Bad:

```tsx
await AsyncStorage.setItem(
  "token",
  token
);
```

Good:

```tsx
await authStorage.saveToken(token);
```

Architecture:

```text
Component
  ↓
Auth Service
  ↓
Storage Service
  ↓
Secure Storage / MMKV / AsyncStorage
```

Use secure storage for sensitive credentials/tokens where appropriate.

---

# Authentication

Recommended structure:

```text
features/auth/
├── components/
│   ├── LoginForm/
│   └── ForgotPasswordForm/
├── hooks/
│   ├── useLogin.ts
│   └── useAuth.ts
├── services/
│   └── auth.service.ts
├── storage/
│   └── auth.storage.ts
├── schemas/
│   └── auth.schema.ts
└── types/
    └── auth.types.ts
```

Authentication flow:

```text
Login
  ↓
API
  ↓
Access Token
  ↓
Secure Storage
  ↓
Auth Store
  ↓
Navigation
```

---

# Device Services

Keep native/device APIs isolated.

```text
services/
├── device/
│   ├── device.service.ts
│   └── app-info.service.ts
│
├── permissions/
│   ├── camera.permission.ts
│   ├── location.permission.ts
│   └── notification.permission.ts
│
└── notifications/
    ├── push.service.ts
    └── notification.handler.ts
```

Components should not directly manage native APIs.

---

# Offline Support

Mobile applications should handle:

- No Internet
- Slow Internet
- API timeout
- Retry
- Cached data
- Offline UI
- Network recovery

Use TanStack Query for server caching where appropriate.

Example:

```text
Online
  ↓
API
  ↓
Cache

Offline
  ↓
Cache
  ↓
Offline UI
```

---

# Mobile UI Rules

Every screen should consider:

- Safe Area
- Keyboard handling
- Different screen sizes
- Android back button
- Loading state
- Empty state
- Error state
- Offline state
- Accessibility
- Dark mode
- Orientation requirements
- Small/large devices

---

# Testing

```text
tests/
├── components/
├── features/
├── screens/
├── hooks/
└── services/
```

Test:

- Components
- Navigation
- Forms
- API behavior
- Authentication
- Critical user flows
- Native/device-related logic where practical

---

# Naming Convention

```text
Screens:    StudentListScreen.tsx
Components: StudentCard.tsx
Hooks:      useStudents.ts
Services:   student.service.ts
Storage:    auth.storage.ts
Types:      student.types.ts
Schemas:    student.schema.ts
Tests:      StudentCard.test.tsx
```

---

# Import Rules

Prefer aliases:

```text
@/components
@/features
@/hooks
@/services
@/types
@/utils
```

Avoid:

```text
../../../components/Button
```

---

# Architecture Rule

Screens should compose features.

```text
Screen
  ↓
Template
  ↓
Organism
  ↓
Molecule
  ↓
Atom
```

Screens should not contain:

- API implementation
- Storage implementation
- Large business logic
- Native API implementation

---

# Web and Mobile Separation

This is an independent React Native codebase.

Do not depend on the React Web project.

Keep:

- Separate repositories
- Separate package.json
- Separate build/deployment pipeline
- Separate platform configuration
- Separate UI implementations

The architecture and naming conventions should remain conceptually consistent between Web and Mobile, while platform-specific behavior stays native to each project.
