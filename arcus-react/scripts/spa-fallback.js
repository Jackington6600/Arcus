import { promises as fs } from 'node:fs';
import path from 'node:path';

async function ensureSpaFallback() {
	const distDir = path.resolve(process.cwd(), 'dist');
	const indexHtml = path.join(distDir, 'index.html');
	const notFoundHtml = path.join(distDir, '404.html');

	try {
		const html = await fs.readFile(indexHtml, 'utf8');
		await fs.writeFile(notFoundHtml, html, 'utf8');
		console.log('Created 404.html for SPA fallback');
	} catch (err) {
		console.error('Failed to create SPA fallback 404.html:', err);
		process.exitCode = 1;
	}
}

ensureSpaFallback();

