# todo — command-line task manager

A minimal command-line todo app in Node.js with no external dependencies.
Tasks are stored in `todos.json` in the same directory as `todo.js`.

## Requirements

- Node.js (any recent version)
- No npm install needed

## Commands

### Add a task

```sh
node todo.js add "buy milk"
# Added: "buy milk"
```

### List all tasks

```sh
node todo.js list
# 1. [ ] buy milk
# 2. [x] call dentist
```

Tasks show their 1-based index and done status (`[ ]` = pending, `[x]` = done).

### Mark a task as done

```sh
node todo.js done 1
# Done: "buy milk"
```

### Remove a task

```sh
node todo.js remove 1
# Removed: "buy milk"
```

## Running tests

```sh
node todo.test.js
```

All tests run with Node.js built-ins — no test framework required.

## Data storage

Tasks persist between runs in `todos.json` (created automatically on first use).
The file uses plain JSON; you can inspect or edit it directly if needed.
