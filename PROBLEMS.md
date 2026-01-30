# Problems in src/index.js

- Literal string attributes on Nho custom elements are not supported because props are read from Nho._c by numeric index; non-numeric values become undefined. See [index.js:L216-L226](file:///Users/anhle/Desktop/nho/src/index.js#L216-L226).
- No escaping for text interpolations; inserting untrusted values can inject raw HTML. See [index.js:L141-L160](file:///Users/anhle/Desktop/nho/src/index.js#L141-L160).
- Event handler binding via attributes relies on string indices; if attributes are reordered or reused incorrectly, handlers can mismatch. See [index.js:L170-L176](file:///Users/anhle/Desktop/nho/src/index.js#L170-L176).
- Updating child Nho components by calling _ga/_u directly bypasses connectedCallback semantics and may skip setup or lifecycle expectations. See [index.js:L116-L123](file:///Users/anhle/Desktop/nho/src/index.js#L116-L123).
- Recursive patching does not handle node reordering; it assumes stable index order, so keyed list updates can produce wrong DOM. See [index.js:L100-L125](file:///Users/anhle/Desktop/nho/src/index.js#L100-L125).
