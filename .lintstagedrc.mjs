import path from 'node:path';

const repoRoot = process.cwd();
const ESLINT_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);
const PRETTIER_EXT = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
  '.md',
  '.css',
  '.scss',
  '.yml',
  '.yaml',
  '.html',
]);

function groupByPackage(files) {
  const byPkg = new Map();
  const rootFiles = [];
  for (const abs of files) {
    const rel = path.relative(repoRoot, abs);
    const parts = rel.split(path.sep);
    if (parts[0] === 'packages' && parts[1]) {
      const pkg = parts[1];
      const relToPkg = parts.slice(2).join(path.sep);
      if (!byPkg.has(pkg)) byPkg.set(pkg, []);
      byPkg.get(pkg).push(relToPkg);
    } else {
      rootFiles.push(rel);
    }
  }
  return { byPkg, rootFiles };
}

function quote(files) {
  return files.map((f) => `"${f}"`).join(' ');
}

export default (allStaged) => {
  const { byPkg } = groupByPackage(allStaged);
  const commands = [];

  for (const [pkg, files] of byPkg) {
    const eslintFiles = files.filter((f) => ESLINT_EXT.has(path.extname(f)));
    const prettierFiles = files.filter((f) =>
      PRETTIER_EXT.has(path.extname(f))
    );
    const filter = `--filter ./packages/${pkg}`;

    if (eslintFiles.length > 0) {
      commands.push(
        `pnpm ${filter} exec eslint --max-warnings 0 --no-warn-ignored ${quote(eslintFiles)}`
      );
    }
    if (prettierFiles.length > 0) {
      commands.push(
        `pnpm ${filter} exec prettier --check ${quote(prettierFiles)}`
      );
    }
    if (eslintFiles.length > 0) {
      commands.push(`pnpm ${filter} run lint:types`);
    }
  }

  return commands;
};
