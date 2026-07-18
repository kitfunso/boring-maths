// Single recursive file walker shared by the SEO checkers, the codemods, and
// the em-dash guard test so they all enumerate the same file set the same way.
//
// Importing this module has NO side effects (no walking, no I/O at load time).
import fs from 'node:fs';
import path from 'node:path';

/**
 * Recursively collect files under `dir` that pass `filter`, in directory
 * (depth-first) order.
 *
 * @param {string} dir - directory to walk.
 * @param {RegExp | ((name: string, fullPath: string) => boolean)} filter -
 *   a RegExp tested against each file's basename, or a predicate callback
 *   receiving (basename, fullPath).
 * @param {string[]} [out] - accumulator (internal; used by recursion).
 * @returns {string[]} full paths (joined onto `dir`) of matching files.
 */
export function walkFiles(dir, filter, out = []) {
  const matches = filter instanceof RegExp ? (name) => filter.test(name) : filter;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(p, filter, out);
    else if (matches(entry.name, p)) out.push(p);
  }
  return out;
}
