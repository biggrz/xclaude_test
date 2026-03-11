#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(path.dirname(process.argv[1] || __dirname), 'todos.json');

function load() {
  if (!fs.existsSync(DATA_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function save(todos) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2), 'utf8');
}

function cmdAdd(text) {
  if (!text || !text.trim()) {
    console.error('Error: task text is required');
    process.exit(1);
  }
  const todos = load();
  todos.push({ text: text.trim(), done: false });
  save(todos);
  console.log(`Added: "${text.trim()}"`);
}

function cmdList() {
  const todos = load();
  if (todos.length === 0) {
    console.log('No tasks.');
    return;
  }
  todos.forEach((t, i) => {
    const status = t.done ? '[x]' : '[ ]';
    console.log(`${i + 1}. ${status} ${t.text}`);
  });
}

function cmdDone(indexStr) {
  const index = parseInt(indexStr, 10);
  if (isNaN(index)) {
    console.error('Error: index must be a number');
    process.exit(1);
  }
  const todos = load();
  if (index < 1 || index > todos.length) {
    console.error(`Error: no task at index ${index}`);
    process.exit(1);
  }
  todos[index - 1].done = true;
  save(todos);
  console.log(`Done: "${todos[index - 1].text}"`);
}

function cmdRemove(indexStr) {
  const index = parseInt(indexStr, 10);
  if (isNaN(index)) {
    console.error('Error: index must be a number');
    process.exit(1);
  }
  const todos = load();
  if (index < 1 || index > todos.length) {
    console.error(`Error: no task at index ${index}`);
    process.exit(1);
  }
  const [removed] = todos.splice(index - 1, 1);
  save(todos);
  console.log(`Removed: "${removed.text}"`);
}

function usage() {
  console.log('Usage:');
  console.log('  node todo.js add "<task>"   Add a new task');
  console.log('  node todo.js list           List all tasks');
  console.log('  node todo.js done <index>   Mark task as complete');
  console.log('  node todo.js remove <index> Remove a task');
}

const [, , command, ...args] = process.argv;

switch (command) {
  case 'add':
    cmdAdd(args.join(' '));
    break;
  case 'list':
    cmdList();
    break;
  case 'done':
    cmdDone(args[0]);
    break;
  case 'remove':
    cmdRemove(args[0]);
    break;
  default:
    usage();
    if (command) process.exit(1);
}
