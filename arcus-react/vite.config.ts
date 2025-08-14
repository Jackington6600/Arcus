// @ts-nocheck
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Detect GitHub Pages repository base when building in Actions
// Example: GITHUB_REPOSITORY="owner/repo" -> base="/repo/"
const githubRepository = process.env.GITHUB_REPOSITORY;
const [ghOwner, ghRepo] = githubRepository ? githubRepository.split('/') : [undefined, undefined];
const isUserOrOrgPagesRepo = ghRepo ? /\.(github|githubusercontent)\.io$/i.test(ghRepo) : false;
const isBuildingInGithubActions = Boolean(githubRepository);

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
		},
	},
	// If building on Actions and it's a regular project pages repo, use "/repo/".
	// If it's a user/org pages repo like "jackm.github.io", base should be "/".
	base: isBuildingInGithubActions
		? (isUserOrOrgPagesRepo ? '/' : `/${ghRepo}/`)
		: '/',
});


