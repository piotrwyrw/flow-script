# FlowScript
A minimal, dynamically-typed scripting language specifically designed for controlling
the _Flow_ particle simulation software.
<br></br>
---
### Introduction
**FlowScript** is an expression-oriented scripting language.<br/>
Every language construct resolves to a value at runtime, and can
be processed in code like any regular expression.

The language is dynamically-typed. Variables can be reassigned with an expression
of a different data type.

A set of builtin functions is provided for things like console output
and mathematical functions.

A typical _Hello World_ program in FlowScript makes use of the `print(string)` builtin.
```css
print("Hello, World!");
```

Although the language is dynamically-typed and does not require nor allow
explicit type specifications for variables or function parameters, the runtime
still keeps track of value types, which can be tested at runtime.
```js
let foo = "Hello, World!";

if foo is string {
    print("Foo is a string");
} else {
    print("Foo is not a string");
}
```

Since everything in FlowScript is an expression, functions are naturally
first-class objects:
```rust
fn forEach(array, callback) {
    for element in array {
        callback(element);
    };
};

forEach(["Foo", "Bar", "Baz"], fn(element) {
    print(element);
});
```