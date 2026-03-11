#!/usr/bin/env node
'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TODO = path.join(__dirname, 'todo.js');
const DATA = path.join(__dirname, 'todos.json');

let passed = 0;
let failed = 0;

function run(args) {
  try {
    return {
      stdout: execSync(`node "${TODO}" ${args}`, { encoding: 'utf8', cwd: __dirname }),
      code: 0,
    };
  } catch (e) {
    return {
      stdout: e.stdout || '',
      stderr: e.stderr || '',
      code: e.status || 1,
    };
  }
}

function assert(condition, message) {
  if (condition) {
    console.log(`  PASS: ${message}`);
    passed++;
  } else {
    console.error(`  FAIL: ${message}`);
    failed++;
  }
}

function setup() {
  if (fs.existsSync(DATA)) fs.unlinkSync(DATA);
}

// --- Tests ---

console.log('\nTest: add command');
setup();
{
  const r = run('add "buy milk"');
  assert(r.code === 0, 'exits 0');
  assert(r.stdout.includes('buy milk'), 'prints confirmation with task text');
  const todos = JSON.parse(fs.readFileSync(DATA, 'utf8'));
  assert(todos.length === 1, 'saves one task');
  assert(todos[0].text === 'buy milk', 'saves correct text');
  assert(todos[0].done === false, 'task starts as not done');
}

console.log('\nTest: list command — empty');
setup();
{
  const r = run('list');
  assert(r.code === 0, 'exits 0 with no tasks');
  assert(r.stdout.includes('No tasks'), 'prints empty message');
}

console.log('\nTest: list command — with tasks');
setup();
{
  run('add "task one"');
  run('add "task two"');
  const r = run('list');
  assert(r.code === 0, 'exits 0');
  assert(r.stdout.includes('1.'), 'shows index 1');
  assert(r.stdout.includes('2.'), 'shows index 2');
  assert(r.stdout.includes('task one'), 'shows first task text');
  assert(r.stdout.includes('task two'), 'shows second task text');
  assert(r.stdout.includes('[ ]'), 'shows undone status');
}

console.log('\nTest: done command');
setup();
{
  run('add "buy milk"');
  const r = run('done 1');
  assert(r.code === 0, 'exits 0');
  assert(r.stdout.includes('buy milk'), 'prints task text');
  const todos = JSON.parse(fs.readFileSync(DATA, 'utf8'));
  assert(todos[0].done === true, 'marks task as done');
  const listR = run('list');
  assert(listR.stdout.includes('[x]'), 'list shows done marker');
}

console.log('\nTest: remove command');
setup();
{
  run('add "task one"');
  run('add "task two"');
  const r = run('remove 1');
  assert(r.code === 0, 'exits 0');
  assert(r.stdout.includes('task one'), 'prints removed task text');
  const todos = JSON.parse(fs.readFileSync(DATA, 'utf8'));
  assert(todos.length === 1, 'one task remains');
  assert(todos[0].text === 'task two', 'correct task remains');
}

console.log('\nTest: persistence across runs');
setup();
{
  run('add "persist me"');
  const r = run('list');
  assert(r.stdout.includes('persist me'), 'task persists to disk between runs');
}

console.log('\nTest: done with invalid index');
setup();
{
  run('add "only task"');
  const r = run('done 5');
  assert(r.code !== 0, 'exits non-zero for out-of-range index');
}

console.log('\nTest: remove with invalid index');
setup();
{
  run('add "only task"');
  const r = run('remove 99');
  assert(r.code !== 0, 'exits non-zero for out-of-range index');
}

// Cleanup
if (fs.existsSync(DATA)) fs.unlinkSync(DATA);

// Summary
console.log(`\n${'='.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('All tests passed!');
}
