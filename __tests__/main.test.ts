/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * To mock dependencies in ESM, you can create fixtures that export mock
 * functions and objects. For example, the core module is mocked in this test,
 * so that the actual '@actions/core' module is not imported.
 */
import { jest } from "@jest/globals";
import * as core from "../__fixtures__/core.js";

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule("@actions/core", () => core);
jest.unstable_mockModule("@actions/exec", () => ({
  exec: jest.fn(),
}));

// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const { run } = await import("../src/main.js");

describe("main.ts", () => {
  beforeEach(() => {
    // Set the action's inputs as return values from core.getInput().
    core.getInput.mockReturnValue("");
    core.getBooleanInput.mockReturnValue(false);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("runs without error", async () => {
    await run();
  });
});
