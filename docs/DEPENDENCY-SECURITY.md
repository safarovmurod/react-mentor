# Dependency remediation

The production dependency audit identified published critical advisories affecting the previous pinned Next.js 16.3.8 and DOMPurify 3.4.15 dependency of Monaco 0.57.0.

- Next.js and eslint-config-next are aligned at the patched 16.4.2 release.
- npm overrides pin DOMPurify to the reviewed 3.4.17 release.
- Monaco also **vendors** DOMPurify in its shipped ESM and minified files. A dependency override alone would leave that copy in the browser. `scripts/prepare-editor.mjs` therefore bundles Monaco ESM and its workers locally with esbuild, resolves the exact vendored sanitizer import to the patched npm artifact, verifies bundle input metadata excludes the vendored module, preserves licenses and generates a SHA-256 manifest. The old prebuilt min/AMD directory is removed from generated public assets.
- Installed package integrity and TLS verification remain enabled. No checksum or audit assertion is suppressed.

The sanitizer version gate intentionally fails on an unreviewed version. Review a newer upstream patch and update both the override and the gate together; do not remove the exclusion assertion to make a build pass.

The editor remains lazy-loaded; page/catalog startup does not download editor assets. Validate real completion, diagnostics, HTML preview and isolated execution after any editor or framework upgrade.

A clean dependency audit is one check, not proof that the application or every dependency is free of vulnerabilities. Live deployment, authentication, database configuration, payments and operational limits need separate validation.

The full development-tool audit also flagged Vite 8.3.2 and the `braces` glob parser transitively used by eslint-config-next. Vite is pinned by override to patched **8.3.5**. The latest published braces version is still **3.0.3**, which remains covered by GHSA-vfj7-8cjw-p6xm; no patched release was available during the check. Its downstream development-tool packages are consequently reported as affected too. This path is used for developer-controlled lint glob patterns, is not included in the production dependency set, and is not exposed to learner input. Do not run developer tools on untrusted, deeply nested glob patterns. Track the upstream patch; the development audit is not claimed clean.
