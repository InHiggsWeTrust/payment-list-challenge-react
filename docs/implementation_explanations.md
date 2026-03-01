# Implementation Explanations

This document tracks the detailed actions and design choices made during each step of the Payment List Challenge.

## Step 1: Basic Payment List

To complete Step 1, we took a systematic approach focused on defensive coding, strong typing, and separation of concerns. Let's walk through the key actions and why they were taken:

### 1. Defined Strict TypeScript Interfaces
**Action**: We created `Payment` and `PaymentSearchResponse` interfaces in `src/types/payment.ts`.
**Choice/Reasoning**: The challenge requires a "Zero 'any' Policy". By analyzing `mockPaymentsData.ts` and `handlers.ts`, we identified the exact shape of the data. This provides autocomplete in our IDE, catches errors at compile time, and ensures we know exactly what data we have access to (e.g., that `amount` is a number, and `currency` is a string).

### 2. Created a Custom Hook for Data Fetching
**Action**: We created `usePayments` in `src/hooks/usePayments.ts`.
**Choice/Reasoning**: The rules mandated "Component Composition: Logic should live in custom hooks". We used React Query (which was already set up in the App) to handle the fetching.
- **Why React Query?** It automatically manages loading (`isLoading`), error (`isError`), and data states for us, making the custom hook very clean. It also handles caching and refetching seamlessly.
- We specifically fetched `/api/payments?page=1&pageSize=5` as requested in Step 1.

### 3. Built the "Dumb" Presentational Table Component
**Action**: We created `PaymentsTable.tsx` entirely isolated from data fetching.
**Choice/Reasoning**: The rules stated "UI should be 'dumb' and presentational". This component accepts `payments` and `isLoading` as props and only cares about how to display them, not how to get them.
- **Tailwind CSS**: We used standard Tailwind utility classes to build a responsive, native-looking table with hover states and badging for payment statuses.
- **Defensive Coding**: We added checks for `if (isLoading)` and `if (!payments || payments.length === 0)` to handle empty/loading states gracefully.
- **Formatting**: We used native browser APIs `Intl.NumberFormat` and `Intl.DateTimeFormat` directly in the component to render the amount as currency and the date in a readable format.

### 4. Integrated the UI and Logic in `PaymentsPage.tsx`
**Action**: We connected our `usePayments` hook to the `PaymentsTable`.
**Choice/Reasoning**: This is our "Smart" component. It calls the custom hook, handles the error states (displaying a user-friendly error message using the I18N constants if the API fails), and passes the raw data down to the "Dumb" `PaymentsTable`.

### 5. Strict I18N Usage
**Action**: Throughout `PaymentsPage.tsx` and `PaymentsTable.tsx`, we used variables like `I18N.TABLE_HEADER_AMOUNT`.
**Choice/Reasoning**: The rules explicitly required that all user-facing strings come from `src/constants/i18n.ts`.

### 6. Verification
**Action**: We ran `vitest -t "Step 1:"`.
**Choice/Reasoning**: We ran the automated tests specific to Step 1 to prove that our table headers rendered, our data fetched correctly, and the 5 table rows were displayed as expected.

By splitting the data fetching logic (hook) from the rendering logic (table) and tying them together securely with TypeScript and I18N constants, we set a scalable architectural foundation for the rest of the steps!
