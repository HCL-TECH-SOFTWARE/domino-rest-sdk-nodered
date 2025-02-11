/* ========================================================================== *
 * Copyright (C) 2023, 2025 HCL America Inc.                                  *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */
'use strict';

let expect;

describe('These tests', function () {
  before(async () => {
    expect = (await import ('chai')).expect;
    const use = (await import('chai')).use;
    const chaiAsPromised = (await import('chai-as-promised')).default;
    use(chaiAsPromised);
  });

  it('should always pass', function () {
    expect(1).to.equal(1);
  });

  const p = new Promise((resolve) => {
    setTimeout(() => resolve(42), 100);
  });
  it('also the promise should always pass', function (done) {
    expect(p).to.eventually.be.eql(42).notify(done);
  });
});
