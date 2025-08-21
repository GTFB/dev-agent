# Version Release Protocol

This document defines the high-stakes workflow for preparing, finalizing, and publishing a new version of the product. This protocol is executed by a Release Manager and is heavily automated by the Dev Agent to minimize human error.

## Guiding Principles

- **Releases are Predictable:** The process is standardized and repeatable.
- **Zero-Error Tolerance:** All steps are designed to be safe and reversible where possible.
- **Clarity is Paramount:** Versioning and tagging must be explicit and unambiguous.

## Branching Model & Git Flow

This diagram illustrates the flow of code during a release.

```mermaid
graph LR
    subgraph develop
        direction LR
        A[feat] --> B(develop)
        C[refactor] --> B
    end

    subgraph main
        direction LR
        F[v1.1.0] --> G(main)
    end

    subgraph release
        direction LR
        D[release/1.2.0]
    end

    B -- 1. agent release start --> D
    D -- 2. Hotfixes --> D
    D -- 3. agent release finish --> H{v1.2.0}
    H -- Merge to main --> G
    H -- Merge back to develop --> B

    style A fill:#cde4ff
    style C fill:#cde4ff
    style D fill:#ffe4b8
    style H fill:#b8ffc3
```