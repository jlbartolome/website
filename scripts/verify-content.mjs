import { verifyContent } from './content-files.mjs';
try {
  const collections = await verifyContent();
  const count = Object.values(collections).reduce((sum, items) => sum + items.length, 0);
  console.log(`PASS: ${count} Markdown files; selected publications and section references are valid.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
