---
name: add-jsdoc-tag
description: Add or change a custom JSDoc tag (like @status, @requires, @provide) that Laazys parses from Vue/JS files and shows in the docs UI. Use when a new tag must be supported or an existing tag's parsing/output changes.
paths:
    - 'packages/laazys/utils/**'
    - 'packages/laazys-app/src/types/**'
    - 'packages/laazys-app/src/components/**'
---

A custom tag travels through four places. Change them in this order, or the UI silently shows nothing.

1. **Parser.** In `packages/laazys/utils/doc-parser.ts`, add `parseX`. Reuse `_parseSingleLine` for one-line values or `_parseMultiLine` for free text. Write a dedicated regex only for structured tags, as `parseMethod` does.
2. **Registration.** In `packages/laazys/utils/get-documentations.ts`:
    - Add `'@x': parseX` to `tagToParser`. `_parseList` stores the result under the tag name without `@`.
    - If a component can contain the tag more than once, collect the values into an array the way `@method` → `customMethods` does. `documentation.set` overwrites.
3. **Output.** Destructure the key from `docVue` in `_generateList` and add it to the returned object. Keys not listed there never reach `/files`.
    - For `.js` files, tags are read in `_parseCommentParser` in `get-all-files.ts`, with comment-parser and not the regexes. Mirror the change there if the tag applies to composables.
4. **UI.** Add the field to `File` in `packages/laazys-app/src/types/file.type.ts`, then render it. Header-level values go in `AppFileHeader.vue`; lists go through `AppFileProperties.vue` in `pages/File.vue`.

Add an example of the tag to a file in `packages/laazys/test/`, then run the `verify-docs-output` skill and check that the new key appears in `/files` with the expected value.
