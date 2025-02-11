/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */
'use strict';

import { describe, it, expect } from 'vitest';

describe('These tests', function () {
  it('should always pass', function () {
    expect(1).to.toBe(1);
  });

  const p = new Promise((resolve) => {
    setTimeout(() => resolve(42), 100);
  });
  it('also the promise should always pass', async function () {
    await expect(p).resolves.toBe(42);
  });
});
