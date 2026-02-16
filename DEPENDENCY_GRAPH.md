# Bookshelf.js Dependency Graph

## Overview
This document provides a comprehensive dependency graph of the Bookshelf ORM library, showing how modules depend on each other.

## Module Dependencies

### External Dependencies
```
lodash (3rd party)
bluebird (3rd party)
knex (3rd party)
inflection (3rd party)
create-error (3rd party)
```

## Core Module Structure

```
bookshelf.js (Entry Point)
│
├── lib/bookshelf.js
│   ├── ./model.js
│   ├── ./collection.js
│   ├── ./relation.js
│   ├── ./base/events.js
│   └── ./errors.js
│
├── lib/model.js
│   ├── ./sync.js
│   ├── ./helpers.js
│   ├── ./eager.js
│   ├── ./errors.js
│   ├── ./base/model.js
│   ├── lodash
│   ├── bluebird
│   └── create-error
│
├── lib/collection.js
│   ├── ./sync.js
│   ├── ./helpers.js
│   ├── ./eager.js
│   ├── ./errors.js
│   ├── ./base/collection.js
│   ├── lodash
│   ├── bluebird
│   └── create-error
│
├── lib/relation.js
│   ├── ./helpers.js
│   ├── ./base/model.js
│   ├── ./base/relation.js
│   ├── ./constants.js
│   ├── lodash
│   ├── bluebird
│   └── inflection
│
├── lib/sync.js
│   ├── lodash
│   └── bluebird
│
├── lib/helpers.js
│   └── lodash
│
├── lib/eager.js
│   └── lodash
│
├── lib/errors.js
│   └── create-error
│
├── lib/extend.js
│   └── (Utility for class extension)
│
├── lib/constants.js
│   └── (Constants definition)
│
└── Base Classes
    ├── lib/base/model.js
    │   ├── lodash
    │   ├── bluebird
    │   ├── ./events.js
    │   └── ./relation.js
    │
    ├── lib/base/collection.js
    │   ├── lodash
    │   ├── bluebird
    │   ├── ./events.js
    │   └── ./model.js (circular reference)
    │
    ├── lib/base/relation.js
    │   ├── lodash
    │   ├── bluebird
    │   └── ./events.js
    │
    └── lib/base/events.js
        └── lodash
```

## Dependency Flow Diagram (Text Representation)

### Entry Point
```
┌──────────────────────┐
│  bookshelf.js        │
│  (Entry Point)       │
└──────────────────────┘
         │
    ┌────┼────┬─────────┬──────────┐
    │    │    │         │          │
    v    v    v         v          v
  Model Collection Relation Events Errors
  (lib)  (lib)    (lib)    (base)  (lib)
```

### Model Dependencies
```
┌──────────────────────┐
│   lib/model.js       │
└──────────────────────┘
         │
    ┌────┼────┬──────┬──────┬─────────┐
    │    │    │      │      │         │
    v    v    v      v      v         v
  sync helpers eager errors base/model base/events
```

### Collection Dependencies
```
┌──────────────────────────┐
│   lib/collection.js      │
└──────────────────────────┘
         │
    ┌────┼────┬──────┬──────┬─────────┬───────────┐
    │    │    │      │      │         │           │
    v    v    v      v      v         v           v
  sync helpers eager errors base/collection base/events
```

### Relation Dependencies
```
┌──────────────────────┐
│   lib/relation.js    │
└──────────────────────┘
         │
    ┌────┼────┬──────────┬────────────┬──────────┐
    │    │    │          │            │          │
    v    v    v          v            v          v
 helpers constants base/model base/relation base/events
```

## Circular Dependencies

### Known Circular References
1. **Model ↔ Collection**: 
   - Model references Collection for collection() method
   - Collection references Model for model property

2. **Model ↔ Relation**:
   - Model references Relation for relation methods
   - Relation references Model for type checking

## External Package Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| lodash | * | Utility functions (pick, extend, etc.) |
| bluebird | * | Promise library |
| knex | * | Query builder (passed as parameter) |
| inflection | * | String inflection (pluralize, singularize) |
| create-error | * | Error class creation |

## File Dependency Matrix

| File | Depends On | Used By |
|------|-----------|---------|
| bookshelf.js | model, collection, relation, base/events, errors | (Entry point) |
| model.js | sync, helpers, eager, errors, base/model | bookshelf.js, relation.js |
| collection.js | sync, helpers, eager, errors, base/collection | bookshelf.js, model.js |
| relation.js | helpers, base/model, base/relation, constants | bookshelf.js, model.js |
| sync.js | (external only) | model.js, collection.js |
| helpers.js | lodash | model.js, collection.js, relation.js |
| eager.js | lodash | model.js, collection.js |
| errors.js | create-error | bookshelf.js, model.js, collection.js |
| extend.js | (utility) | (internal usage) |
| constants.js | (constants) | relation.js |
| base/model.js | lodash, bluebird, events | model.js |
| base/collection.js | lodash, bluebird, events | collection.js |
| base/relation.js | lodash, bluebird, events | relation.js |
| base/events.js | lodash | All base classes |

## Dependency Depth

### Shallow Dependencies (0-1 levels deep)
- extend.js
- constants.js
- errors.js
- helpers.js
- eager.js

### Medium Dependencies (1-2 levels deep)
- sync.js
- base/events.js
- base/relation.js

### Deep Dependencies (2-3+ levels deep)
- base/model.js
- base/collection.js
- model.js
- collection.js
- relation.js
- bookshelf.js

## Module Load Order

Recommended order for understanding the codebase:

1. **Foundation**
   - lib/constants.js
   - lib/extend.js
   - lib/helpers.js
   - lib/errors.js

2. **Base Classes**
   - lib/base/events.js
   - lib/base/model.js
   - lib/base/collection.js
   - lib/base/relation.js
   - lib/base/eager.js

3. **Utilities**
   - lib/eager.js
   - lib/sync.js

4. **Core Classes**
   - lib/model.js
   - lib/collection.js
   - lib/relation.js

5. **Entry Point**
   - lib/bookshelf.js

## Key Integration Points

### 1. Model-Collection Relationship
```javascript
// In bookshelf.js
Collection.prototype.model = Model;
Model.prototype.Collection = Collection;
```

### 2. Relation Integration
```javascript
// In bookshelf.js
const Relation = BookshelfRelation.extend({Model, Collection});
```

### 3. Event System
```javascript
// Extends across all main classes
_.extend(bookshelf, Events, errors, {...});
```

## Size Analysis

| Module | Lines | Complexity |
|--------|-------|-----------|
| lib/model.js | ~1569 | High |
| lib/relation.js | ~948 | High |
| lib/collection.js | ~546 | Medium |
| lib/sync.js | Unknown | Medium |
| lib/eager.js | Unknown | Medium |
| lib/helpers.js | Unknown | Low |
| lib/base/model.js | ~803 | High |
| lib/base/collection.js | ~803 | High |
| lib/bookshelf.js | ~559 | High |

