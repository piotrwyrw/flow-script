# FlowScript

FlowScript is a minimal, dynamically typed, expression-oriented scripting language designed for controlling the *Flow* particle simulation software.

---

## Overview

FlowScript is expression-based. Everything evaluates to a value at runtime, including control flow and function calls. This makes constructs composable and uniform.

The language is dynamically typed:
- Variables can change type at runtime
- No type annotations are required or supported
- Runtime keeps type information for inspection and checks

FlowScript includes a small standard library with core utilities such as printing and math functions.

---

## Hello World

```ts
print("Hello, World!");
```

---

## Dynamic Types

Values carry runtime type information and can be inspected with `is`.

```ts
let foo = "Hello, World!";

if foo is string {
    print("Foo is a string");
} else {
    print("Foo is not a string");
};
```

---

## Functions and Closures

Functions are first-class and support closures.

```rust
fn makeAdder(x) {
    fn add(y) {
        return x + y;
    };

    return add;
};

let addFive = makeAdder(5);
addFive(10);
```

---

## Syntax Rules

- All expressions must end with a semicolon `;`
- This includes:
    - variable declarations
    - function definitions
    - control flow expressions (`if`, `for`, `while`)
    - standalone expressions
- Control flow keywords do not require parentheses around conditions

```js
let x = 0;

while x < 10 {
    print(x);
    x = x + 1;
};

let list = [1, 2, 3, 4, ...];

for item in list {
    print(item);
};
```

---

## Scoping Rules

- `let` is block-scoped
- Re-declaration is allowed only in different blocks
- No standalone blocks `{ ... }` are allowed
- Nested blocks exist only as part of `if`, `for`, `while`, and functions
- Variables are resolved in nearest enclosing scope
- Reassignment updates the nearest binding
- Closures capture variables from outer scopes

---

## Return Semantics

- Blocks evaluate to their last expression
- Functions may use explicit `return`
- `return` is only valid inside functions
- `return` immediately exits the nearest function, even inside nested constructs

```rust
fn test(x) {
    for i in [1, 2, 3] {
        if i == x {
            return i;
        };
    };

    return 0;
};
```

---

## Design Goals

- Minimal and embeddable
- Expression-oriented semantics
- Dynamic typing with runtime checks
- Simple scripting for Flow simulation logic
- Fast iteration and experimentation

---

## Notes

FlowScript is intentionally small and tightly scoped for embedding in Flow rather than general-purpose programming.