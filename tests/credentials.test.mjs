import test from "node:test";
import assert from "node:assert/strict";
import { validateCredentials } from "../src/lib/credentials.ts";

function form(values) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

test("rejects malformed email before contacting Auth", () => {
  assert.equal(validateCredentials(form({ email: "invalid", password: "Correct-Password-123" })), "Enter a valid email address.");
});
test("rejects an empty password", () => {
  assert.equal(validateCredentials(form({ email: "demo-test@example.test", password: "" })), "Enter your password.");
});
test("signup enforces a 12-character password", () => {
  assert.equal(validateCredentials(form({ email: "demo-test@example.test", password: "short", confirmPassword: "short" }), true), "Use at least 12 characters.");
});
test("signup rejects mismatched confirmation", () => {
  assert.equal(validateCredentials(form({ email: "demo-test@example.test", password: "Correct-Password-123", confirmPassword: "Different-Password" }), true), "Passwords do not match.");
});
test("signup allows only fictional sandbox addresses", () => {
  assert.equal(validateCredentials(form({ email: "person@example.org", password: "Correct-Password-123", confirmPassword: "Correct-Password-123" }), true), "Use a fictional demo-…@example.test address.");
});
test("valid signup and login pass validation", () => {
  const data = form({ email: "demo-test@example.test", password: "Correct-Password-123", confirmPassword: "Correct-Password-123" });
  assert.equal(validateCredentials(data, true), null);
  assert.equal(validateCredentials(data), null);
});
