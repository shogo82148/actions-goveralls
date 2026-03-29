import type * as execModule from "@actions/exec";
import { jest } from "@jest/globals";

export const exec = jest.fn<typeof execModule.exec>();
export const getExecOutput = jest.fn<typeof execModule.getExecOutput>();
