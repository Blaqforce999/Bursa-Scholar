/**
 * Bursa Scholar Design Token Converter
 *
 * Reads design tokens from JSON files exported from Figma and converts
 * them into clean, structured CSS custom properties (CSS variables).
 *
 * Usage:
 *   node build-tokens.js
 */

const fs = require('fs');
const path = require('path');

const WORKING_DIR = __dirname;
const OUTPUT_FILE = path.join(WORKING_DIR, 'tokens.css');

const TOKEN_FILES = [
  'color-tokens.tokens.json',
  'spacing-border-token.json',
  'typography-tokens.tokens.json'
];

/**
 * Convert string to kebab-case.
 */
function toKebabCase(str) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
}

/**
 * Format CSS variable name from path array.
 * Deduplicates consecutive identical segments (e.g. gradient-gradient -> gradient).
 */
function formatVarName(pathSegments) {
  const segments = pathSegments.map(toKebabCase).filter(Boolean);
  const deduplicated = [];
  for (let i = 0; i < segments.length; i++) {
    if (i === 0 || segments[i] !== segments[i - 1]) {
      deduplicated.push(segments[i]);
    }
  }
  return `--${deduplicated.join('-')}`;
}

/**
 * Format gradient token object to CSS linear-gradient string.
 */
function formatGradient(grad) {
  const angle = grad.rotation !== undefined ? `${grad.rotation}deg` : '180deg';
  const stops = (grad.stops || [])
    .map(s => {
      const pos = Math.round((s.position ?? 0) * 100);
      return `${s.color} ${pos}%`;
    })
    .join(', ');
  return `${grad.gradientType || 'linear'}-gradient(${angle}, ${stops})`;
}

/**
 * Format font family string with fallbacks.
 */
function formatFontFamily(family) {
  if (!family) return 'sans-serif';
  const cleaned = family.replace(/["']/g, '');
  const needsQuotes = /\s/.test(cleaned);
  const quoted = needsQuotes ? `'${cleaned}'` : cleaned;

  if (cleaned.toLowerCase().includes('mono')) {
    return `${quoted}, monospace`;
  }
  return `${quoted}, sans-serif`;
}

/**
 * Format dimension value (numbers converted to px, preserving 0).
 */
function formatDimension(val) {
  if (typeof val === 'number') {
    return val === 0 ? '0' : `${val}px`;
  }
  if (typeof val === 'string') {
    if (!isNaN(Number(val))) {
      const num = Number(val);
      return num === 0 ? '0' : `${num}px`;
    }
    return val;
  }
  return `${val}`;
}

/**
 * Storage for extracted CSS tokens grouped by section.
 */
const tokenSections = {
  'Color Tokens': [],
  'Gradient Tokens': [],
  'Spacing Tokens': [],
  'Border Tokens': [],
  'Typography & Font Tokens': [],
  'Other Tokens': []
};

const seenVariables = new Set();

/**
 * Add a generated CSS variable rule ensuring uniqueness.
 */
function pushCssRule(sectionKey, varName, cssValue, description) {
  if (seenVariables.has(varName)) {
    return;
  }
  seenVariables.add(varName);

  const comment = description ? `  /* ${description} */\n` : '';
  const rule = `${comment}  ${varName}: ${cssValue};`;
  tokenSections[sectionKey].push(rule);
}

/**
 * Recursively parse token JSON objects.
 */
function parseNode(node, currentPath = []) {
  if (node === null || node === undefined) return;

  // Case 1: Primitive value (e.g. spacing / border numbers)
  if (typeof node !== 'object') {
    addPrimitiveToken(currentPath, node);
    return;
  }

  // Case 2: Custom Gradient token
  if (node.type === 'custom-gradient' && node.value) {
    const varName = formatVarName(currentPath);
    const cssVal = formatGradient(node.value);
    pushCssRule('Gradient Tokens', varName, cssVal, node.description);
    return;
  }

  // Case 3: Custom Font Style Composite token
  if (node.type === 'custom-fontStyle' && typeof node.value === 'object') {
    const baseVarName = formatVarName(currentPath);
    const v = node.value;
    const desc = node.description ? `Typography Style: ${currentPath.join(' > ')} - ${node.description}` : undefined;

    if (v.fontFamily) {
      pushCssRule('Typography & Font Tokens', `${baseVarName}-font-family`, formatFontFamily(v.fontFamily), desc);
    }
    if (v.fontSize !== undefined) {
      pushCssRule('Typography & Font Tokens', `${baseVarName}-font-size`, formatDimension(v.fontSize));
    }
    if (v.fontWeight !== undefined) {
      pushCssRule('Typography & Font Tokens', `${baseVarName}-font-weight`, `${v.fontWeight}`);
    }
    if (v.lineHeight !== undefined) {
      pushCssRule('Typography & Font Tokens', `${baseVarName}-line-height`, formatDimension(v.lineHeight));
    }
    if (v.letterSpacing !== undefined) {
      pushCssRule('Typography & Font Tokens', `${baseVarName}-letter-spacing`, formatDimension(v.letterSpacing));
    }
    if (v.textDecoration && v.textDecoration !== 'none') {
      pushCssRule('Typography & Font Tokens', `${baseVarName}-text-decoration`, v.textDecoration);
    }
    if (v.fontStyle && v.fontStyle !== 'normal') {
      pushCssRule('Typography & Font Tokens', `${baseVarName}-font-style`, v.fontStyle);
    }
    // Composite font shorthand
    if (v.fontSize && v.fontFamily && v.fontWeight) {
      const lh = v.lineHeight ? `/${formatDimension(v.lineHeight)}` : '';
      const shorthandVal = `${v.fontWeight} ${formatDimension(v.fontSize)}${lh} ${formatFontFamily(v.fontFamily)}`;
      pushCssRule('Typography & Font Tokens', baseVarName, shorthandVal);
    }
    return;
  }

  // Case 4: Standard token object with `value` property
  if ('value' in node && (node.type || typeof node.value !== 'object')) {
    addStandardToken(currentPath, node.value, node.type, node.description);
    return;
  }

  // Case 5: Container object
  for (const key of Object.keys(node)) {
    if (key === 'extensions' || key === 'description' || key === 'blendMode') continue;
    parseNode(node[key], [...currentPath, key]);
  }
}

/**
 * Helper for primitive values (e.g. spacing or border scale)
 */
function addPrimitiveToken(pathSegments, value) {
  const varName = formatVarName(pathSegments);
  const rootKey = pathSegments[0]?.toLowerCase();

  if (rootKey === 'spacing') {
    pushCssRule('Spacing Tokens', varName, formatDimension(value));
  } else if (rootKey === 'border') {
    pushCssRule('Border Tokens', varName, formatDimension(value));
  } else {
    pushCssRule('Other Tokens', varName, `${value}`);
  }
}

/**
 * Helper for standard tokens with value and type
 */
function addStandardToken(pathSegments, value, type, description) {
  const varName = formatVarName(pathSegments);
  const rootKey = pathSegments[0]?.toLowerCase();
  const lastKey = pathSegments[pathSegments.length - 1]?.toLowerCase();

  if (type === 'color' || rootKey === 'color') {
    pushCssRule('Color Tokens', varName, value, description);
  } else if (rootKey === 'spacing') {
    pushCssRule('Spacing Tokens', varName, formatDimension(value), description);
  } else if (rootKey === 'border') {
    pushCssRule('Border Tokens', varName, formatDimension(value), description);
  } else if (
    type === 'dimension' ||
    ['fontsize', 'lineheight', 'letterspacing', 'paragraphspacing', 'paragraphindent'].includes(lastKey)
  ) {
    pushCssRule('Typography & Font Tokens', varName, formatDimension(value), description);
  } else if (type === 'string' && lastKey === 'fontfamily') {
    pushCssRule('Typography & Font Tokens', varName, formatFontFamily(value), description);
  } else if (rootKey === 'typography' || rootKey === 'font') {
    pushCssRule('Typography & Font Tokens', varName, `${value}`, description);
  } else {
    pushCssRule('Other Tokens', varName, `${value}`, description);
  }
}

/**
 * Main Build Runner
 */
function main() {
  console.log('🚀 Converting Bursa Scholar JSON design tokens to CSS variables...\n');

  let totalTokensCount = 0;

  TOKEN_FILES.forEach(file => {
    const filePath = path.join(WORKING_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ Warning: Token file "${file}" not found at ${filePath}`);
      return;
    }

    console.log(`📄 Reading: ${file}`);
    const rawData = fs.readFileSync(filePath, 'utf8');
    try {
      const jsonObj = JSON.parse(rawData);
      parseNode(jsonObj);
    } catch (err) {
      console.error(`❌ Error parsing JSON file "${file}":`, err.message);
    }
  });

  // Construct CSS Output
  const header = `/**
 * Bursa Scholar Design Tokens
 * 
 * Auto-generated from Figma Design Tokens JSON files.
 * Source Files:
${TOKEN_FILES.map(f => ` *  - ${f}`).join('\n')}
 * 
 * DO NOT EDIT THIS CSS FILE DIRECTLY.
 * Run \`node build-tokens.js\` to regenerate.
 */

:root {
`;

  const footer = `}\n`;

  const sectionsContent = [];

  for (const [sectionName, rules] of Object.entries(tokenSections)) {
    if (rules.length === 0) continue;
    totalTokensCount += rules.length;
    const sectionBanner = `  /* ==========================================================================
     ${sectionName} (${rules.length} variables)
     ========================================================================== */\n`;
    sectionsContent.push(sectionBanner + rules.join('\n\n'));
  }

  const fullCss = header + sectionsContent.join('\n\n') + '\n' + footer;

  fs.writeFileSync(OUTPUT_FILE, fullCss, 'utf8');

  console.log(`\n✅ Successfully generated CSS variables!`);
  console.log(`📦 Output File: ${OUTPUT_FILE}`);
  console.log(`📊 Total CSS Variables Created: ${seenVariables.size}`);
}

main();
