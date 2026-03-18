// Fix SWC native binding detection on systems where /usr/bin/ldd falsely reports musl
const fs = require('fs');
const path = require('path');

const bindingPath = path.join(__dirname, '..', 'node_modules', '@swc', 'core', 'binding.js');

try {
  if (!fs.existsSync(bindingPath)) {
    process.exit(0);
  }
  
  let content = fs.readFileSync(bindingPath, 'utf8');
  
  // Force isMuslFromFilesystem to return null so it falls through to the report-based check
  const original = "const isMuslFromFilesystem = () => {";
  const patched = "const isMuslFromFilesystem = () => { return null;";
  
  if (content.includes(original) && !content.includes(patched)) {
    content = content.replace(original, patched);
    fs.writeFileSync(bindingPath, content);
    console.log('✓ Patched @swc/core binding.js for correct libc detection');
  }
} catch (e) {
  // Non-critical, skip silently
}
