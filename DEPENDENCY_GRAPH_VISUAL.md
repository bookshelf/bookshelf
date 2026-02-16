# Bookshelf.js - Visual Dependency Graph (Mermaid)

This file contains Mermaid diagrams showing the dependencies in Bookshelf.js

## Main Module Dependencies

```mermaid
graph TD
    A[bookshelf.js<br/>Entry Point] --> B[lib/model.js]
    A --> C[lib/collection.js]
    A --> D[lib/relation.js]
    A --> E[lib/base/events.js]
    A --> F[lib/errors.js]
    
    B --> G[lib/sync.js]
    B --> H[lib/helpers.js]
    B --> I[lib/eager.js]
    B --> F
    B --> J[lib/base/model.js]
    
    C --> G
    C --> H
    C --> I
    C --> F
    C --> K[lib/base/collection.js]
    
    D --> H
    D --> L[lib/constants.js]
    D --> J
    D --> M[lib/base/relation.js]
    
    J --> E
    J --> N[lodash<br/>3rd party]
    J --> O[bluebird<br/>3rd party]
    
    K --> E
    K --> N
    K --> O
    
    M --> E
    M --> N
    M --> O
    
    E --> N
    
    G --> N
    G --> O
    
    H --> N
    
    I --> N
    
    F --> P[create-error<br/>3rd party]
    
    D --> Q[inflection<br/>3rd party]
    
    style A fill:#ff9999
    style N fill:#99ccff
    style O fill:#99ccff
    style P fill:#99ccff
    style Q fill:#99ccff
```

## Circular Dependencies

```mermaid
graph LR
    A[Model] -->|references for collection| B[Collection]
    B -->|model property| A
    
    C[Model] -->|references for relations| D[Relation]
    D -->|type checking| C
    
    style A fill:#ffcc99
    style B fill:#ffcc99
    style C fill:#ffcc99
    style D fill:#ffcc99
```

## Dependency Layers

```mermaid
graph TD
    subgraph Layer1["Layer 1: Foundation"]
        A[constants.js]
        B[extend.js]
        C[helpers.js]
        D[errors.js]
    end
    
    subgraph Layer2["Layer 2: Base Classes"]
        E[base/events.js]
        F[base/model.js]
        G[base/collection.js]
        H[base/relation.js]
    end
    
    subgraph Layer3["Layer 3: Utilities"]
        I[sync.js]
        J[eager.js]
    end
    
    subgraph Layer4["Layer 4: Core Classes"]
        K[model.js]
        L[collection.js]
        M[relation.js]
    end
    
    subgraph Layer5["Layer 5: Entry Point"]
        N[bookshelf.js]
    end
    
    C --> E
    D --> E
    E --> F
    E --> G
    E --> H
    F --> I
    G --> I
    C --> K
    D --> K
    I --> K
    C --> L
    D --> L
    I --> L
    C --> M
    A --> M
    K --> N
    L --> N
    M --> N
    
    style Layer1 fill:#e1f5ff
    style Layer2 fill:#f3e5f5
    style Layer3 fill:#fff3e0
    style Layer4 fill:#fce4ec
    style Layer5 fill:#e8f5e9
```

## Data Flow: Model Creation

```mermaid
sequenceDiagram
    participant User
    participant bookshelf.js
    participant Model
    participant Collection
    participant Relation
    
    User->>bookshelf.js: bookshelf.model('Name', {...})
    bookshelf.js->>Model: extend({...})
    Model->>Collection: Model.prototype.Collection = Collection
    bookshelf.js->>Collection: extend({...})
    Collection->>Model: Collection.prototype.model = Model
    bookshelf.js->>Relation: extend({Model, Collection})
    Relation->>Model: injected as dependency
```

## External Package Integration

```mermaid
graph TB
    A[Bookshelf] 
    
    subgraph External["External Packages"]
        L[lodash]
        B[bluebird]
        K[knex]
        I[inflection]
        CE[create-error]
    end
    
    A -->|utility functions| L
    A -->|promises| B
    A -->|query building| K
    A -->|string manipulation| I
    A -->|error creation| CE
    
    style External fill:#e0e0e0
    style A fill:#fff9c4
```

## Complexity Hierarchy

```mermaid
graph TD
    A["🔴 High Complexity<br/>model.js<br/>relation.js<br/>base/model.js<br/>base/collection.js<br/>bookshelf.js"]
    
    B["🟡 Medium Complexity<br/>collection.js<br/>sync.js<br/>eager.js"]
    
    C["🟢 Low Complexity<br/>helpers.js<br/>errors.js<br/>constants.js<br/>extend.js"]
    
    style A fill:#ffcccc
    style B fill:#ffffcc
    style C fill:#ccffcc
```

