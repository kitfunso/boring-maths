/**
 * withTrailingSlash - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { withTrailingSlash } from '../../src/lib/url';

describe('withTrailingSlash', () => {
  it('adds a trailing slash when absent', () => {
    expect(withTrailingSlash('/foo')).toBe('/foo/');
  });

  it('is idempotent when a trailing slash is already present', () => {
    expect(withTrailingSlash('/foo/')).toBe('/foo/');
  });

  it('leaves the root path unchanged', () => {
    expect(withTrailingSlash('/')).toBe('/');
  });
});
