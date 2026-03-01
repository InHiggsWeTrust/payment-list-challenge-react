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

## Step 2 & 3: Search and Clear Filters

To implement the Search capability and the Clear Filters capability, we focused on controlled inputs and debouncing API calls to prevent unnecessary network requests.

### 1. Updated the Data Fetching Hook
**Action**: Modified `usePayments` in `src/hooks/usePayments.ts` to accept a `searchTerm` parameter.
**Choice/Reasoning**: 
- We appended the `searchTerm` to the React Query `queryKey` (`["payments", page, pageSize, searchTerm]`). This is crucial because it tells React Query: "If the search term changes, this is a distinct query, so you must re-fetch the data."
- We dynamically appended the `search` query parameter to the URL `fetch` call only if `searchTerm` is truthy, keeping the API call clean when no search is active.

### 2. Managed State in the Smart Component
**Action**: Added two pieces of state in `PaymentsPage.tsx`: `searchInput` and `activeSearchTerm`.
**Choice/Reasoning**:
- **`searchInput`**: This is tied directly to the `<input>` element. As the user types, this state updates instantly, making the input responsive (a "controlled component").
- **`activeSearchTerm`**: This state is what is *actually* passed to the `usePayments` hook. 
- **Why two states?** If we passed `searchInput` directly to the hook, we would fire an API request *every single time the user hit a key*. By separating them, the API call only triggers when the user explicitly clicks the "Search" button (which copies `searchInput` into `activeSearchTerm`).

### 3. Built the Search UI
**Action**: Added a text input and a 'Search' button above the table.
**Choice/Reasoning**:
- We heavily relied on Tailwind for styling, ensuring it matched the aesthetic of the table (`ring-1`, `shadow-sm`, focus states).
- We added an `onKeyDown` handler to the input so pressing "Enter" also triggers the search, which is a standard accessibility/UX pattern.
- We strictly used `I18N.SEARCH_PLACEHOLDER`, `I18N.SEARCH_LABEL`, and `I18N.SEARCH_BUTTON` for all text.

### 4. Implemented Clear Filters
**Action**: Added a conditionally rendered "Clear Filters" button in `PaymentsPage.tsx`.
**Choice/Reasoning**:
- **Conditional Logic**: We created a simple boolean check `const isFilterActive = activeSearchTerm !== ""`. The clear button only mounts if this is true, keeping the UI clean by default.
- **The Clear Action**: The `handleClearFilters` function simply resets both `searchInput` and `activeSearchTerm` back to empty strings `""`. Because `activeSearchTerm` changes back to `""`, React Query automatically detects the change in the `queryKey` and re-fetches the default, unfiltered page 1 data.

### 5. Verification
**Action**: Ran `vitest -t "Step 2:"` and `vitest -t "Step 3:"`.
**Choice/Reasoning**: This proved our `searchInput` updated correctly, the API call fired with the correct parameters, and the Clear button successfully reset the state and removed itself from the DOM.

## Step 4 & 5: Error Handling (404 & 500)

We needed the application to robustly handle different types of API failures and present clear, styled feedback to the user.

### 1. Updated the Custom Hook
**Action**: Modified the `fetch` response checking in `usePayments`.
**Choice/Reasoning**:
- Instead of just checking `!response.ok` and throwing a generic error, we specifically look for `response.status === 404`. If matched, we throw an error with the `I18N.PAYMENT_NOT_FOUND` string.
- For any other non-ok response (like a 500 Internal Server error), we fall back to throwing `I18N.INTERNAL_SERVER_ERROR`.
- **Why throw errors here?** React Query catches these thrown errors automatically. It sets the `isError` boolean to true and populates the `error` object returned from the hook with the exact message we threw.

### 2. Handled UI Rendering
**Action**: The UI was already set up to conditionally render an error alert if `isError` is true. We just ensured the layout leverages the mapped `error.message`.
**Choice/Reasoning**: 
- In `PaymentsPage.tsx`, the block `{isError && (...) }` catches the boolean.
- Inside that block, we render `{error?.message || I18N.INTERNAL_SERVER_ERROR}`. Because our hook throws the exact I18N string, the UI seamlessly displays "Payment not found." or "Internal server error." depending on the API's HTTP status code.

### 3. Verification
**Action**: Ran `vitest -t "Step 4:"` and `vitest -t "Step 5:"`.
**Choice/Reasoning**: This validated that typing `pay_404` and `pay_500` (which MSW intercepts to purposefully return 404 and 500 errors) correctly triggers our custom hook logic and renders the respective error strings on the screen.

## Step 6 & 7: Currency Filtering & Combined Filters

To implement currency filtering, we expanded our existing controlled input pattern to include a dropdown.

### 1. Updated the Custom Hook
**Action**: Added `currency = ""` as the fourth parameter to `usePayments`.
**Choice/Reasoning**:
- Added `currency` to the React Query `queryKey` so it tracks changes to this value.
- Made the URL builder dynamically append `&currency=...` if a currency is provided. This naturally satisfies Step 7 (Combined Filters) because if *both* `searchTerm` and `currency` exist, the URL will simply append both query parameters (`?page=1&pageSize=5&search=foo&currency=USD`).

### 2. Built the Dropdown UI
**Action**: Added a `<select>` dropdown next to the search input in `PaymentsPage.tsx`.
**Choice/Reasoning**:
- We imported `CURRENCIES` from `src/constants/index.ts` to map out the `<option>` elements, adhering to the challenge rules to use constants.
- Like the search bar, this is a controlled component tied to a new `currency` useState variable.
- We set the `onChange` handler to immediately `setCurrency(e.target.value)`. Unlike text search, a dropdown doesn't need a "Submit" button or debouncing because selecting an option *is* the explicit user action.

### 3. Handled Clear Filters Expansion
**Action**: We updated the `isFilterActive` logic and the `handleClearFilters` function.
**Choice/Reasoning**:
- `isFilterActive = activeSearchTerm !== "" || currency !== ""` ensures the clear button appears if *either* filter is used.
- Clearing now resets all three states: `searchInput`, `activeSearchTerm`, and `currency`.

### 4. Verification
**Action**: Ran `vitest -t "Step 6:"` and `vitest -t "Step 7:"`.
**Choice/Reasoning**: The test suite confirms the dropdown renders correctly, filters by currency alone, and handles the intersection of both search input and currency dropdown queries correctly.

## Step 8: Pagination

The final step required adding pagination controls to navigate through the data returned by the API.

### 1. Managed Pagination State
**Action**: Added `const [currentPage, setCurrentPage] = useState(1);` to `PaymentsPage.tsx`.
**Choice/Reasoning**: 
- `currentPage` dictates which page the API should fetch.
- We passed `currentPage` directly to our `usePayments` hook. React Query automatically updates the cache and triggers a new API request whenever this value changes because `currentPage` is the first element in the hook's `queryKey`.

### 2. Resetting Pages on Filter Changes
**Action**: Updated `handleSearch`, `handleClearFilters`, and added `handleCurrencyChange`.
**Choice/Reasoning**: 
- If a user is on page 3 and then applies a search filter, staying on page 3 might result in an empty screen (if the search results only have 1 page). Therefore, whenever the user applies a search term, changes the currency, or clears the filters, we forcefully reset `setCurrentPage(1)` to ensure they see the first page of the new result set.

### 3. Calculating the "Next" State
**Action**: Added `const totalResults = data?.total || 0;` and `const hasNextPage = currentPage * pageSize < totalResults;`.
**Choice/Reasoning**: 
- The API response (`PaymentSearchResponse`) returns the `total` number of available records.
- By multiplying the current page by the fixed page size (5), we can determine if we have viewed all available records. If `currentPage * pageSize` is still less than `totalResults`, there must be a "Next" page.
- This calculation is used to dynamically disable the "Next" button.

### 4. Built the Pagination UI
**Action**: Added the `PaginationRow` and `PaginationButton` components below the `PaymentsTable`.
**Choice/Reasoning**: 
- We only render these controls if `!isLoading && !isError && data?.payments?.length > 0`. It doesn't make sense to show pagination for errors, loading screens, or entirely empty data sets.
- The "Previous" button is strictly disabled if `currentPage === 1`.
- The `onClick` handlers use a callback function (`p => Math.max(1, p - 1)`) to ensure state updates are strictly bound to the previous state value, preventing edge-case bugs. We also use `Math.max` as a defensive coding measure so the page can never drop below 1.

### 5. Verification
**Action**: Ran `vitest -t "Step 8:"`.
**Choice/Reasoning**: The automated tests validated that the buttons render correctly with I18N labels, and that the "Previous" button is correctly disabled when initialized on page 1.

## Step 9: URL Query Parameter Synchronization (Bonus)

To make the page state shareable and persistent across refreshes, we synced our React `useState` hooks with the browser's URL using the `URLSearchParams` API.

### 1. Initializing State from URL
**Action**: Replaced the initial values in `useState` with lazily loaded initialization functions.
**Choice/Reasoning**:
- By parsing `window.location.search` during the initial render state using `() => { ... }`, we can extract `"search"`, `"currency"`, and `"page"` directly from the URL. 
- If a parameter isn't present, the initialization falls back to the default empty string `""` or page `1`.
- For the page parameter, we added an extra defensive `parseInt` wrapping, with a fallback condition `isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage` to prevent broken URLs from breaking the application. Let's say a user changes the URL manually to `?page=-5` or `?page=apple`; the application will safely correct it to `1`.

### 2. Pushing State Changes to the URL
**Action**: Added a new `useEffect` hook that listens to changes on `activeSearchTerm`, `currency`, and `currentPage`.
**Choice/Reasoning**:
- Inside the effect, we rebuild a `URLSearchParams` object based on the current state values.
- If a state is truthy (or `> 1` for `currentPage`), we `set()` it. If it is falsy (meaning the user cleared the filter or reset to page 1), we `delete()` it to keep the URL as clean and short as possible.
- Finally, we call `window.history.replaceState({}, "", newUrl)` instead of `pushState`. We chose `replaceState` here because every single typed character (although debounced) pushes state changes. Using `replaceState` prevents cluttering the user's browser back-history with dozens of minor query param updates, ensuring a smooth navigation experience.

### 3. Verification
**Action**: Ran `npm run test`.
**Choice/Reasoning**: Ensuring that our extensive URL synchronization logic didn't accidentally break any of the requirements built up in Steps 1-8. All 11 tests continue to pass perfectly.
