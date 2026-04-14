# Headless Editor System - Questions & Answers Editing and Generation

## Overview

The Headless Editor system is a powerful, reusable batch editing framework for managing questions and answers in the MindStack application. It provides a unified state management approach with advanced features including drag-and-drop sorting, text comparison with multilingual stemming, real-time change tracking, and seamless integration with AI generation workflows.

**Version:** 0.1.4 (2026-04-14)  
**Related Issue:** [#80](https://github.com/lilliputten/mindstack/issues/80)

---

## Architecture

### Core Components

The headless editor system follows a "headless" design pattern, separating state management logic from UI rendering. This allows maximum flexibility and reusability across different contexts.

```
src/entities/HeadlessEditor/
├── HeadlessEditor.tsx              # Core editor component (renders items list)
├── HeadlessEditorItem.tsx          # Individual item wrapper with DnD support
├── HeadlessEditorControls.tsx      # Control panel with filters and actions
├── useHeadlessEditorState.tsx      # Main state management hook
├── useComparator.ts                # Text comparison with stemming
├── CmpQuestion.tsx                 # Question item renderer
├── CmpAnswer.tsx                   # Answer item renderer
├── constants.ts                    # Configuration constants
├── types.ts                        # TypeScript type definitions
├── helpers.ts                      # Utility functions
└── demo/                           # Demo components and fixtures
    ├── HeadlessQuestionsEditorDemo.tsx
    ├── HeadlessAnswersEditorDemo.tsx
    └── ...
```

### Key Design Principles

1. **Headless Architecture**: State management (`useHeadlessEditorState`) is completely separated from UI rendering, allowing custom UI implementations while maintaining consistent behavior.

2. **Immutable State Tracking**: All changes (additions, updates, deletions, reorderings) are tracked using immutable Set-based indices, enabling efficient change detection and undo operations.

3. **Incremental Updates**: The system supports partial updates without requiring full data reloads, optimizing performance for large datasets.

4. **Multilingual Support**: Integrated text comparison uses WebAssembly-based multilingual stemmer modules for accurate similarity detection across languages.

5. **Drag-and-Drop Native**: Built on `@dnd-kit/core` for smooth, accessible reordering with visual feedback.

---

## Core Features

### 1. Batch Editing Capabilities

#### User Stories

**As a content creator, I want to:**
- Edit multiple questions or answers in a single session without saving after each change
- See which items have been modified before committing changes
- Revert all changes back to the original state if needed
- Add new items alongside existing ones in the same editing session
- Delete unwanted items and have those deletions tracked until save

**Implementation:**
- Change tracking via `updatedIds`, `addedIds`, `deletedIds`, and `reorderedIds` sets
- Visual indicators: dashed borders for updated items, green borders for new items
- "Restore Defaults" action to undo all pending changes
- Bulk save operation that processes all change types in a single API call

### 2. Drag-and-Drop Reordering

#### User Stories

**As a content organizer, I want to:**
- Reorder questions and answers by dragging them to new positions
- See visual feedback during drag operations
- Have reordered items automatically tracked as changed
- Sort items by different criteria (alphabetically, by date, etc.)
- Choose between ascending and descending sort orders

**Implementation:**
- `SortableWrapper` component integrating `@dnd-kit/core`
- Automatic order property updates when items are moved
- Multiple reorder modes configurable via `reorderModes` prop
- Visual overlay during drag with opacity reduction
- Smooth animations for newly added items scrolling into view

### 3. Smart Text Comparison & Filtering

#### User Stories

**As a content reviewer, I want to:**
- Compare items to detect duplicates or similar content
- Filter items by similarity to a selected reference item
- Search items using exact text matching or smart token-based comparison
- Filter by change status (updated, added, selected, targeted)
- See comparison scores normalized across the dataset

**Implementation:**
- `useComparator` hook with multilingual stemming support
- Two comparison modes:
  - **Exact text matching**: Simple substring search (fast)
  - **Smart token comparison**: N-gram based similarity with stemming (accurate)
- Real-time filtering with debounced text input
- Comparison target selection with toggle behavior
- Normalized vs. raw comparison score display option

**Technical Details:**
```typescript
// Comparison value thresholds
const minCmpValue = 0.01; // Minimum value to consider as "matched"

// Tokenization approaches
- Small texts: Direct token splitting
- Large texts: N-gram extraction (configurable via `largeTexts` prop)
```

### 4. Item Lifecycle Management

#### User Stories

**As a user, I want to:**
- See clear visual distinction between new, updated, and existing items
- Have newly added items automatically scroll into view with animation
- Track items through their lifecycle from creation to persistence
- Prevent accidental loss of unsaved changes

**Implementation:**
- **Fresh Items Animation**: Newly added items get a temporary highlight (2 seconds) with smooth fade-out
- **Auto-scroll**: Bottom element reference ensures new items are visible
- **Lifecycle States**:
  - `isFresh`: Just added, showing animation
  - `isAdded`: Tracked as new but not yet animated
  - `isUpdated`: Modified from original state
  - `isReordered`: Position changed from original
  - `isSelected`: Currently selected for batch operations

### 5. Nested Editor Support

#### User Stories

**As a topic manager, I want to:**
- Edit answers directly within the question editing interface
- Pass parent context (like question ID) to nested editors
- Maintain consistency between parent and child item states
- Save related data (questions + answers) in coordinated operations

**Implementation:**
- `extraParams` prop forwarding through the entire editor tree
- `CmpQuestion` component embeds `AnswersEditorCore` for inline answer editing
- Parent-child data synchronization via callback props
- Coordinated save operations handling both questions and their answers

**Example:**
```tsx
// In CmpQuestion component
<AnswersEditorCore
  topicId={topicId}
  questionId={id}
  answers={toHeadlessAnswerRows(id, answers)}
  extraParams={{ question: item }} // Pass parent context
  saveData={handleSaveAnswers}
/>
```

### 6. AI Generation Integration

#### User Stories

**As an AI-assisted content creator, I want to:**
- Generate questions or answers using AI based on topic context
- Review and edit generated content before saving
- Mix AI-generated items with manually created ones
- Track which items were AI-generated vs. manually written
- See my AI generation quota and usage status

**Implementation:**
- Dedicated generation pages (`GenerateQuestionsPage`, `GenerateAnswersPage`)
- Generated items marked with `isGenerated: true` and temporary IDs (`__new*`)
- Seamless integration with headless editor for post-generation editing
- `AIGenerationsStatusInfo` component showing quota details
- Server-side generation with client-side result merging

**Generation Workflow:**
1. User fills generation form (count, temperature, extra context)
2. AI generates content server-side
3. Results returned with temporary IDs
4. Items loaded into headless editor for review/editing
5. User can modify, add, or delete items
6. Final save commits all changes atomically

### 7. React Query Integration

#### User Stories

**As a developer, I want to:**
- Automatically invalidate cached queries after saves
- Optimistically update UI with server-returned data
- Handle loading and error states gracefully
- Support infinite query pagination with local updates

**Implementation:**
- Custom `updateItemsQueryData` functions for each editor type
- Query key prefix invalidation strategy
- Local cache updates mapping temporary IDs to permanent server IDs
- Automatic refetch control to prevent overwriting local edits

**Example Pattern:**
```typescript
const updateQuestionsQueryData = (results: TUpdateQuestionsDataViaParamsResults) => {
  const { added, autoAddedIds, updated, deletedIds } = results;
  
  queryClient.setQueryData<TGetResultsInfiniteQueryData<T>>(queryKey, (oldData) => {
    // Map temporary IDs to permanent IDs
    // Update modified items
    // Remove deleted items
    // Append new items to last page
    return updatedPages;
  });
};
```

### 8. Responsive & Adaptive UI

#### User Stories

**As a mobile user, I want to:**
- Use the editor effectively on small screens
- Have controls adapt to available screen space
- Access all functionality regardless of device size

**Implementation:**
- `forceCompact` prop for narrow layouts
- Automatic compact mode detection via `useMediaMinDevices` hook
- Collapsible control panels
- Dropdown menus for secondary actions on mobile
- Touch-friendly drag handles and checkboxes

---

## Component API Reference

### `useHeadlessEditorState<T>`

The central hook managing all editor state. Returns state values, setters, handlers, and pre-configured render components.

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `defaultItems` | `T[]` | Yes | Initial items array |
| `getItemText` | `(item: T) => string` | Yes | Extracts text for comparison |
| `RenderItem` | `(props: TCmpItemProps<T>) => JSX.Element` | Yes | Component to render each item |
| `lang` | `string` | Yes | Locale for text comparison |
| `saveData` | `(params: TSaveDataParams<T>) => Promise<unknown>` | No | Save handler function |
| `isReady` | `boolean` | No | Data loading status |
| `isLoading` | `boolean` | No | Loading indicator state |
| `largeTexts` | `boolean` | No | Use n-grams for comparison |
| `showNormalized` | `boolean` | No | Display normalized scores |
| `setShowNormalized` | `Dispatch<SetStateAction<boolean>>` | No | Setter for normalized display |
| `reorderModes` | `TReorderModes<T>` | No | Custom sort configurations |
| `calculateChanges` | `boolean` | No | Derive hasChanges from totalChangedCount |
| `extraParams` | `unknown` | No | Arbitrary data passed to RenderItem |
| `filterText` | `string` | No | Current filter text |
| `filterTextSmart` | `boolean` | No | Enable smart token comparison |
| `filterTargeted` | `boolean` | No | Show only compared items |
| `filterUpdated` | `boolean` | No | Show only updated items |
| `filterAdded` | `boolean` | No | Show only added items |
| `filterSelected` | `boolean` | No | Show only selected items |

#### Return Value

```typescript
interface THeadlessEditorState<T> {
  // Data
  items: T[];
  
  // State
  compareTargetId?: T['id'];
  totalChangedCount: number;
  hasChanges: boolean;
  
  // Setters
  setItems: Dispatch<SetStateAction<T[]>>;
  setCompareTargetId: Dispatch<SetStateAction<TCmpItemId | undefined>>;
  setSelectedIds: Dispatch<SetStateAction<Set<TCmpItemId> | undefined>>;
  setUpdatedIds: Dispatch<SetStateAction<Set<TCmpItemId> | undefined>>;
  setDeletedIds: Dispatch<SetStateAction<Set<TCmpItemId> | undefined>>;
  setAddedIds: Dispatch<SetStateAction<Set<TCmpItemId> | undefined>>;
  setReorderedIds: Dispatch<SetStateAction<Set<TCmpItemId> | undefined>>;
  
  // Indices (tracked sets)
  updatedIds?: Set<TCmpItemId>;
  deletedIds?: Set<TCmpItemId>;
  addedIds?: Set<TCmpItemId>;
  reorderedIds?: Set<TCmpItemId>;
  selectedIds?: Set<TCmpItemId>;
  
  // Handlers
  restoreDefaults: () => void;
  addNewItem: (newBaseItem: TNew<T>) => void;
  deleteSelected: () => void;
  reorderItems: (reorderId?: string) => void;
  getUniqueNewId: () => TCmpItemId;
  
  // Pre-configured components
  RenderHeadlessEditor: (props: TRenderProps) => JSX.Element;
  RenderHeadlessEditorControls: (props: THeadlessEditorControlsExternalProps<T>) => JSX.Element;
}
```

### `HeadlessEditor<T>`

Core component rendering the items list with comparison and filtering.

#### Key Props

| Prop | Type | Description |
|------|------|-------------|
| `items` | `T[]` | Items to display |
| `isReady` | `boolean` | Shows skeletons until true |
| `hasChanges` | `boolean` | Indicates unsaved modifications |
| `RenderItem` | Component | Item renderer |
| `updateItems` | `(its: T[]) => void` | Update handler |
| `updateReordered` | `(its: T[]) => void` | Reorder handler |
| `selectedIds` | `Set<TCmpItemId>` | Currently selected items |
| `compareTargetId` | `TCmpItemId` | Reference item for comparison |
| `filterText` | `string` | Search text |
| `filterTargeted` | `boolean` | Filter by comparison |
| `filterUpdated` | `boolean` | Show only updated |
| `filterAdded` | `boolean` | Show only added |
| `filterSelected` | `boolean` | Show only selected |

### `HeadlessEditorControls<T>`

Control panel component with filters, actions, and reorder options.

#### External Props (from parent)

```typescript
interface THeadlessEditorControlsExternalProps<T> {
  className?: string;
  reorderTitles?: Record<string, string>;
  onSaveData?: () => void;
  onAddAction?: () => void;
  onDeleteAction?: () => void;
  onReload?: () => void;
  setFilterTargeted: Dispatch<SetStateAction<boolean>>;
  setFilterUpdated: Dispatch<SetStateAction<boolean>>;
  setFilterAdded: Dispatch<SetStateAction<boolean>>;
  setFilterSelected: Dispatch<SetStateAction<boolean>>;
  setFilterText: Dispatch<SetStateAction<string | undefined>>;
  setFilterTextSmart: Dispatch<SetStateAction<boolean>>;
}
```

### `CmpQuestion` & `CmpAnswer`

Item renderer components for questions and answers respectively.

#### Features

- Inline editing forms with validation
- Markdown text rendering
- Context menu with actions (edit, delete, navigate)
- Compact mode for responsive layouts
- Metadata display (dates, counts, generation status)
- Nested editor support (answers within questions)

#### Props

```typescript
interface TCmpItemProps<T> {
  className?: string;
  item: T;
  updateItem?: (it: T) => void;
  hasChanges?: boolean;
  compact?: boolean;
  extraParams?: unknown;
}
```

---

## Usage Examples

### Example 1: Basic Questions Editor

```tsx
import { useHeadlessEditorState } from '@/entities/HeadlessEditor';
import { CmpQuestion } from '@/entities/HeadlessEditor/CmpQuestion';
import { useAvailableQuestions } from '@/hooks';

function QuestionsEditor({ topicId }: { topicId: string }) {
  const { allQuestions, queryKey, refetch } = useAvailableQuestions({
    topicId,
    includeAnswers: true,
  });

  const editorState = useHeadlessEditorState({
    defaultItems: allQuestions,
    lang: 'en',
    getItemText: (q) => q.text,
    RenderItem: CmpQuestion,
    saveData: async (params) => {
      // Call your save API here
      const result = await updateQuestionsDataViaParams({
        updatedItems: [...params.updatedItems.values()],
        addedItems: [...params.addedItems.values()],
        deletedIds: [...params.deletedIds.values()],
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey });
      return result;
    },
  });

  return (
    <div>
      <editorState.RenderHeadlessEditorControls
        onAddAction={() => {/* Open add modal */}}
        onDeleteAction={() => editorState.deleteSelected()}
        onReload={() => refetch()}
        setFilterUpdated={/* state setter */}
        setFilterAdded={/* state setter */}
        setFilterSelected={/* state setter */}
        setFilterText={/* state setter */}
        setFilterTextSmart={/* state setter */}
        setFilterTargeted={/* state setter */}
      />
      <editorState.RenderHeadlessEditor />
    </div>
  );
}
```

### Example 2: AI Generation Page with Editor

```tsx
function GenerateAnswersPage({ questionId }: { questionId: string }) {
  const [generatedAnswers, setGeneratedAnswers] = useState<TNewOrOldAnswer[]>();
  const [isGenerated, setGenerated] = useState(false);
  
  const availableAnswersQuery = useAvailableAnswers({ questionId });
  const { allAnswers } = availableAnswersQuery;
  
  // Combine existing + generated answers
  const combinedAnswers = useMemo(
    () => [...allAnswers, ...(generatedAnswers || [])],
    [allAnswers, generatedAnswers]
  );

  const editorState = useHeadlessEditorState({
    defaultItems: combinedAnswers,
    lang: 'en',
    getItemText: (a) => a.text,
    RenderItem: CmpAnswer,
    extraParams: { question: currentQuestion },
    saveData: async (params) => {
      // Save all changes including generated items
      const result = await updateAnswersDataViaParams({
        updatedItems: [...params.updatedItems.values()],
        addedItems: [...params.addedItems.values()],
        deletedIds: [...params.deletedIds.values()],
      });
      return result;
    },
  });

  const handleGenerate = async (formData: TFormData) => {
    // Call AI generation API
    const generated = await generateAnswersAPI({
      questionId,
      count: formData.answersCountMin,
      temperature: formData.temperature,
    });
    
    // Mark as generated with temp IDs
    const markedAnswers = generated.map((a, idx) => ({
      ...a,
      id: `__new-${idx}`,
      isNew: true,
      isGenerated: true,
      questionId,
    }));
    
    setGeneratedAnswers(markedAnswers);
    setGenerated(true);
  };

  return (
    <>
      {!isGenerated ? (
        <GenerateAnswersForm onSubmit={handleGenerate} />
      ) : (
        <>
          <editorState.RenderHeadlessEditorControls
            /* ... props ... */
          />
          <editorState.RenderHeadlessEditor />
          <Button onClick={() => editorState.restoreDefaults()}>
            Discard Generated
          </Button>
          <Button onClick={() => {/* trigger save */}}>
            Save All Answers
          </Button>
        </>
      )}
    </>
  );
}
```

### Example 3: Nested Editors (Question with Answers)

```tsx
function CmpQuestion({ item, updateItem, extraParams }: TCmpItemProps<TQuestion>) {
  const { id: questionId, answers } = item;
  
  // Convert answers to headless format
  const answerRows = useMemo(
    () => toHeadlessAnswerRows(questionId, answers),
    [questionId, answers]
  );

  return (
    <div>
      {/* Question editing UI */}
      <EditQuestionForm question={item} onUpdate={updateItem} />
      
      {/* Nested answers editor */}
      <AnswersEditorCore
        topicId={item.topicId}
        questionId={questionId}
        answers={answerRows}
        extraParams={{ question: item }}
        saveData={async (params) => {
          // Save answers for this specific question
          await updateAnswersForQuestion(questionId, params);
        }}
      />
    </div>
  );
}
```

---

## Data Flow

### Item Lifecycle

```
1. INITIALIZATION
   ├─ defaultItems passed to useHeadlessEditorState
   ├─ Added IDs detected (isNew or __new* prefix)
   └─ Items sorted by order property

2. USER INTERACTION
   ├─ Edit item → added to updatedIds
   ├─ Add item → added to addedIds, triggers fresh animation
   ├─ Delete item → added to deletedIds, removed from items array
   ├─ Reorder item → added to reorderedIds, order property updated
   └─ Select item → added to selectedIds for batch operations

3. FILTERING
   ├─ Text filter applied (exact or smart)
   ├─ Status filters (updated/added/selected/targeted)
   └─ Display items = filtered subset of ordered items

4. SAVE OPERATION
   ├─ saveData(params) called with categorized changes
   ├─ Server processes updates, returns permanent IDs
   ├─ Local cache updated (temp IDs → permanent IDs)
   ├─ Tracked indices cleared (updatedIds, addedIds, etc.)
   └─ Queries invalidated for fresh data

5. RESTORE DEFAULTS
   ├─ Items reset to defaultItems
   ├─ All tracked indices cleared
   └─ Changes count reset to 0
```

### Save Parameters Structure

```typescript
interface TSaveDataParams<T> {
  // Complete current items list
  items: T[];
  
  // Categorized by change type
  updatedItems?: Set<T>;      // Modified existing items
  deletedItems?: Set<T>;      // Items marked for deletion
  addedItems?: Set<TNew<T>>;  // New items (may lack permanent ID)
  
  // ID sets for quick lookups
  updatedIds?: Set<T['id']>;
  deletedIds?: Set<T['id']>;
  addedIds?: Set<T['id']>;
  reorderedIds?: Set<T['id']>;
  selectedIds?: Set<T['id']>;
}
```

---

## Advanced Features

### Multilingual Text Comparison

The system uses WebAssembly-based stemmer modules for language-aware text comparison:

```typescript
// In useComparator hook
const { compareItemTokens, getCachedItemTokens } = useComparator({
  lang: 'ru', // or 'en', 'es', etc.
  largeTexts: false, // Use n-grams for long texts
  items,
  getItemText,
});

// Comparison process:
// 1. Text tokenized based on language rules
// 2. Stems extracted (e.g., "running" → "run")
// 3. Tokens compared using Jaccard similarity or n-gram overlap
// 4. Score cached for performance
```

**Supported Languages:** English, Russian, Spanish (via `multilingual-stemmer` package)

### Drag-and-Drop Implementation

Built on `@dnd-kit/core` with custom sortable wrapper:

```typescript
// In HeadlessEditor component
<SortableWrapper
  items={filteredItems}
  RenderItem={RenderEditorItem}
  changeItemsOrder={(moveId, overId) => {
    // Calculate new order values
    // Update affected items' order properties
    // Track as reordered
  }}
>
  {/* Items rendered here */}
</SortableWrapper>

// In HeadlessEditorItem
const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

<div
  ref={setNodeRef}
  style={{ transform: CSS.Translate.toString(transform), transition }}
  {...attributes}
  {...listeners}
>
  {/* Item content */}
</div>
```

### Temporary ID Management

New items receive temporary IDs with `__new` prefix:

```typescript
// Constants
export const newItemIdPrefix = '__new';

// ID generation
const getUniqueNewId = () => {
  const usedIds = new Set([...deletedIds, ...items.map(({ id }) => id)]);
  return getUniqueIdForSet(usedIds); // Returns "__new1", "__new2", etc.
};

// Before save: filter out temp IDs from deleted list
const deletedIds = [...params.deletedIds.values()].filter(
  (id) => !String(id).startsWith(newItemIdPrefix)
);

// After save: map temp IDs to permanent IDs
const autoAddedIds = {
  '__new1': 'permanent-id-123',
  '__new2': 'permanent-id-456',
};
```

---

## Performance Optimizations

### 1. Memoization Strategy

- `useMemo` for expensive calculations (comparison scores, filtered lists)
- `useCallback` for stable handler references
- Cached token maps to avoid re-tokenization

### 2. Incremental Rendering

- Skeleton loaders during data fetch
- Conditional rendering based on `isReady` flag
- Virtual scrolling consideration for large lists (future enhancement)

### 3. Efficient Change Tracking

- Set-based indices for O(1) lookups
- Minimal re-renders via precise state updates
- Debounced text input for filter operations

### 4. Query Optimization

- Infinite query pagination support
- Selective cache invalidation using key prefixes
- Stale time configuration to balance freshness and performance

---

## Testing & Debugging

### Demo Components

Cosmos fixtures provide isolated testing environments:

```tsx
// src/entities/HeadlessEditor/demo/HeadlessQuestionsEditorDemo.fixture.tsx
export default {
  name: 'HeadlessQuestionsEditorDemo',
  component: HeadlessQuestionsEditorDemo,
  props: {
    lang: 'en',
    largeTexts: false,
  },
};
```

**Run Cosmos:**
```bash
pnpm cosmos
```

### Debug Mode

Enable debug overlays in development:

```typescript
// In HeadlessEditor.tsx
const __showDebug = isDev && true; // Enable debug panel

// Debug panel shows:
// - Total items count
// - Comparison min/max values
// - Current compare target
// - Tracked indices sizes
```

### Logging Best Practices

Following project conventions:
- Important data logged first
- Non-blocking async logging calls
- Structured JSON data sent as text files via `logJsonData`

---

## Migration Guide

### From Modal-Based to Page-Based Editors

**Before (v0.1.3):**
```tsx
// Modal approach
<GenerateAnswersModal
  questionId={questionId}
  onClose={() => closeModal()}
  onSave={(answers) => saveAnswers(answers)}
/>
```

**After (v0.1.4):**
```tsx
// Page approach with headless editor
<GenerateAnswersPageWrapper
  scope={scope}
  topicId={topicId}
  questionId={questionId}
/>
// Uses HeadlessEditor internally with full editing capabilities
```

### Benefits

1. **Better UX**: Full-page layout with more screen real estate
2. **Enhanced Editing**: Batch operations, drag-and-drop, comparison
3. **Consistent Patterns**: Same editor used in generation and regular editing
4. **Improved State Management**: React Query integration with proper invalidation

---

## Known Limitations & Future Enhancements

### Current Limitations

1. **No Undo/Redo Stack**: Only "Restore Defaults" available (resets to initial state)
2. **Single Selection Target**: Only one item can be comparison target at a time
3. **No Collaborative Editing**: Single-user assumption
4. **Limited Virtualization**: Performance may degrade with 1000+ items

### Planned Enhancements

1. **Undo/Redo History**: Implement command pattern for granular undo
2. **Multi-Target Comparison**: Compare against multiple reference items
3. **Bulk Operations**: Apply transformations to selected items (e.g., mark all as correct)
4. **Export/Import**: JSON export for backup and sharing
5. **Keyboard Shortcuts**: Navigate and edit using keyboard
6. **Collaborative Cursors**: Real-time multi-user editing indicators
7. **Advanced Filters**: Regex support, date ranges, category filters
8. **Performance**: Virtual scrolling for large datasets

---

## Troubleshooting

### Common Issues

**Issue: New items not appearing after add**
- **Cause**: `addNewItem` not called or state not updating
- **Solution**: Verify `addNewItem` is invoked with proper item structure including required fields

**Issue: Changes not persisting after save**
- **Cause**: Query cache not invalidated or save handler not returning results
- **Solution**: Ensure `saveData` returns server response and queries are invalidated using `invalidateKeysByPrefixes`

**Issue: Drag-and-drop not working**
- **Cause**: Missing `SortableWrapper` or incorrect `id` property
- **Solution**: Verify items have unique `id` field and component is wrapped in `SortableWrapper`

**Issue: Comparison scores all zero**
- **Cause**: Comparator not ready or `getItemText` returning empty strings
- **Solution**: Check `isComparatorReady` flag and verify `getItemText` implementation

**Issue: Temporary IDs not replaced after save**
- **Cause**: `autoAddedIds` mapping not returned from server
- **Solution**: Ensure server returns mapping of temporary to permanent IDs in response

### Error Handling

All save operations include comprehensive error handling:

```typescript
try {
  const results = await saveDataMutationHandler(saveParams);
  updateSavedDataResults(results);
} catch (error) {
  const details = getErrorText(error);
  console.error('[Editor:saveData]', details, { error, saveParams });
  toast.error('Cannot save changes');
}
```

---

## Related Documentation

- [React Query Keys](./README.react-query-keys.md) - Query key conventions and invalidation strategies
- [Feature-Sliced Design](./README.FSD.md) - Project architecture overview
- [AI Generation Types](./src/features/ai/types/GenerateAnswersTypes.ts) - AI generation parameter schemas
- [Issue #80](https://github.com/lilliputten/mindstack/issues/80) - Original feature request and discussion

---

## Changelog

### v0.1.4 (2026-04-14)

**Added:**
- Headless editor system for batch editing questions and answers
- Drag-and-drop support with `@dnd-kit/core`
- Multilingual stemmer support for text comparison (WebAssembly)
- `useHeadlessEditorState` custom hook for unified state management
- `CmpQuestion` and `CmpAnswer` item renderer components
- AI generation status badge and detailed information display
- Fresh items animation and auto-scroll on addition
- Comparison filtering with smart token-based matching
- Nested editor support (answers within questions)

**Changed:**
- Refactored generate questions/answers from modals to dedicated pages
- Updated all React Query hooks to support unmounts and request aborts
- Improved language filtering with current locale defaults
- Enhanced category filtering with 'ANY' status handling

**Fixed:**
- URL filter parameters parsing (`?langCode=-&langCustom=undefined` bug)
- Scrollbar visibility in modals
- Not-found pages server-client props handling

**Technical:**
- Extracted `BusySplash` component for loading states
- Created `MediumCategoriesListByCategoryIds` for enhanced display
- Implemented text comparison with multilingual stemming
- Added comprehensive TypeScript types for all editor components

---

## Contributing

When extending the headless editor system:

1. **Maintain Type Safety**: All new components must use strict TypeScript types (no `any`)
2. **Follow Headless Pattern**: Separate state logic from UI rendering
3. **Preserve Immutability**: Use Set-based tracking for change indices
4. **Test with Cosmos**: Add fixtures for new components
5. **Document APIs**: Update this README with new props and behaviors
6. **Consider Accessibility**: Ensure DnD and controls work with keyboard/screen readers

---

## License

This project is part of MindStack. See the main repository license for details.
