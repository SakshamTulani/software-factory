---
name: sf-test
description: Run TDD workflow — write failing tests, implement, verify. For bugs, use the Prove-It pattern.
disable-model-invocation: true
---

Invoke the test-driven-development skill.

For new features:
1. Write tests that describe the expected behavior (they should FAIL)
2. Implement the code to make them pass
3. Refactor while keeping tests green

For bug fixes (Prove-It pattern):
1. Write a test that reproduces the bug (must FAIL)
2. Confirm the test fails
3. Implement the fix
4. Confirm the test passes
5. Run the full test suite for regressions

For browser-related issues, also invoke browser-testing-with-devtools to verify with Chrome DevTools MCP.

In this project, write the tests as the project's testing skill says (`frontend-testing`). This is the light path's step for a bug fix or refactor; never edit an existing test to make it pass. After committing, prove the new test with `prove-test.sh` (`test-driven-development`), then run `/sf-review`.
