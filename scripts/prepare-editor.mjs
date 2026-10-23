import { cp, mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import { build } from 'esbuild';

const root = fileURLToPath(new URL('../', import.meta.url));
const monacoRoot = path.join(root, 'node_modules/monaco-editor');
const sanitizerRoot = path.join(root, 'node_modules/dompurify');
const sanitizer = path.join(sanitizerRoot, 'dist/purify.es.mjs');
const packageJson = async directory => JSON.parse(await readFile(path.join(directory, 'package.json'), 'utf8'));
const [monacoPackage, sanitizerPackage] = await Promise.all([packageJson(monacoRoot), packageJson(sanitizerRoot)]);
// Monaco 0.57 vendors a vulnerable sanitizer. Refuse to rebuild with it, even if
// an npm override appeared to make the dependency audit clean.
assert.equal(sanitizerPackage.version, '3.4.17', 'Editor requires the reviewed DOMPurify 3.4.17 patch; update this gate deliberately when reviewing a newer release.');
const output = path.join(root, 'public/monaco');
const stage = path.join(root, 'public/.monaco-build-' + process.pid);
await rm(stage, { recursive: true, force: true });
await mkdir(stage, { recursive: true });
const patchedSanitizer = {
  name: 'replace-monaco-vendored-dompurify',
  setup(builder) {
    builder.onResolve({ filter: /dompurify\/dompurify\.js$/ }, args => {
      const resolved = path.resolve(args.resolveDir, args.path);
      assert.equal(resolved, path.join(monacoRoot, 'esm/vs/base/browser/dompurify/dompurify.js'), 'Unexpected sanitizer replacement target');
      return { path: sanitizer };
    });
  },
};
const common = { absWorkingDir: root, bundle: true, platform: 'browser', format: 'iife', target: 'es2022', minify: true, sourcemap: false, metafile: true, legalComments: 'eof', loader: { '.ttf': 'file', '.svg': 'dataurl', '.png': 'dataurl' }, assetNames: 'assets/[name]-[hash]', plugins: [patchedSanitizer], logLevel: 'warning' };
const metadata = [];
try {
  metadata.push(await build({ ...common, entryPoints: [path.join(monacoRoot, 'esm/vs/editor/editor.main.js')], globalName: 'DevAtlasMonaco', outfile: path.join(stage, 'editor.js') }));
  const workers = {
    editor: 'esm/vs/editor/editor.worker.js',
    json: 'esm/vs/languages/features/json/json.worker.js',
    css: 'esm/vs/languages/features/css/css.worker.js',
    html: 'esm/vs/languages/features/html/html.worker.js',
    typescript: 'esm/vs/languages/features/typescript/ts.worker.js',
  };
  for (const [name, entry] of Object.entries(workers)) metadata.push(await build({ ...common, entryPoints: [path.join(monacoRoot, entry)], outfile: path.join(stage, name + '.worker.js') }));
  const inputs = metadata.flatMap(result => Object.keys(result.metafile.inputs));
  assert(inputs.some(input => path.resolve(root, input) === sanitizer), 'Patched DOMPurify was not bundled');
  assert(!inputs.some(input => /monaco-editor\/esm\/vs\/base\/browser\/dompurify\//.test(input.replaceAll('\\', '/'))), 'Vulnerable vendored DOMPurify must never be packaged');
  await cp(path.join(monacoRoot, 'LICENSE'), path.join(stage, 'MONACO-LICENSE'));
  await cp(path.join(sanitizerRoot, 'LICENSE'), path.join(stage, 'DOMPURIFY-LICENSE'));
  const files = {};
  for (const filename of await readdir(stage)) {
    if (!/\.(js|css)$/.test(filename)) continue;
    const bytes = await readFile(path.join(stage, filename));
    assert(!bytes.includes(Buffer.from('@license DOMPurify 3.4.15')), 'Vulnerable sanitizer license unexpectedly found in packaged output');
    files[filename] = createHash('sha256').update(bytes).digest('hex');
  }
  await writeFile(path.join(stage, 'manifest.json'), JSON.stringify({ monacoVersion: monacoPackage.version, dompurifyVersion: sanitizerPackage.version, vendoredSanitizerExcluded: true, files }, null, 2) + '\n');
  // Replace all old AMD/min assets; never leave the vulnerable copied files served.
  await rm(output, { recursive: true, force: true });
  await rename(stage, output);
} catch (error) {
  await rm(stage, { recursive: true, force: true });
  throw error;
}
