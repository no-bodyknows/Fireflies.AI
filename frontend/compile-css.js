const { compile } = require('@tailwindcss/node');
const fs = require('fs');
const path = require('path');

function getAllFiles(dir, exts = ['.tsx', '.ts', '.jsx', '.js', '.html']) {
  let files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    if (item.name === 'node_modules' || item.name === '.next') continue;
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files = files.concat(getAllFiles(fullPath, exts));
    } else if (exts.includes(path.extname(item.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

async function buildCSS() {
  console.log('Scanning project files for Tailwind classes...');
  const appDir = path.join(__dirname, 'app');
  const componentsDir = path.join(__dirname, 'components');
  const libDir = path.join(__dirname, 'lib');

  const files = [
    ...getAllFiles(appDir),
    ...getAllFiles(componentsDir),
    ...getAllFiles(libDir),
  ];

  console.log(`Found ${files.length} source files.`);

  const candidateSet = new Set();
  const tokenRegex = /[^<>"'`\s]*[^<>"'`\s:]/g;

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const matches = content.match(tokenRegex) || [];
    for (const match of matches) {
      if (match.length > 1 && !match.startsWith('//') && !match.startsWith('/*')) {
        candidateSet.add(match);
      }
    }
  }

  const candidates = Array.from(candidateSet);
  console.log(`Extracted ${candidates.length} unique candidate tokens.`);

  const inputCSS = `
@import "tailwindcss";

:root {
  --background: #f8fafc;
  --foreground: #0f172a;
  --fireflies-primary: #5832e6;
  --fireflies-primary-hover: #4c28d4;
  --fireflies-accent: #8b5cf6;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #090a10;
    --foreground: #f1f5f9;
  }
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background: var(--background);
  color: var(--foreground);
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(140, 140, 160, 0.3);
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(140, 140, 160, 0.5);
}
`;

  const compiler = await compile(inputCSS, {
    base: __dirname,
    onDependency: () => {}
  });

  const generatedCSS = compiler.build(candidates);
  console.log(`Compiled Tailwind CSS bundle size: ${generatedCSS.length} bytes.`);

  const outputPath = path.join(__dirname, 'app', 'globals.css');
  fs.writeFileSync(outputPath, generatedCSS, 'utf8');
  console.log(`Wrote compiled Tailwind CSS successfully to ${outputPath}`);
}

buildCSS().catch(console.error);
