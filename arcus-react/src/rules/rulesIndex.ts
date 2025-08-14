import classesYaml from './yaml/classes.yaml?url';
import basicYaml from './yaml/basic.yaml?url';
import yaml from 'js-yaml';

export type RuleSection = {
	id: string;
	title: string;
	summary?: string;
	children?: { id: string; title: string; body?: string }[];
};

export type RulesIndex = {
	sections: RuleSection[];
};

// Map phrases to rule ids for auto-tooltips
export type TooltipMap = Record<string, string>; // phrase -> id
export const TOOLTIP_MAP: TooltipMap = {
    // Example mappings; extend freely
    'Stunned': 'stunned',
    'Prone': 'prone',
    'Conditions': 'conditions',
    'Character Classes': 'classes',
    'Core Loop': 'core-loop',
    'What is Arcus?': 'what-is-arcus',
};

// Map phrases to wiki anchors (id) that should be turned into links on the Wiki page
export type LinkMap = Record<string, string>; // phrase -> id
export const WIKI_LINK_MAP: LinkMap = {
    // Add phrases you want to become links in the Wiki content
    'What is Arcus?': 'what-is-arcus',
    'Core Loop': 'core-loop',
    'Conditions': 'conditions',
    'Character Classes': 'classes',
    'Battlemage': 'battlemage',
    'Warden': 'warden',
};

// Load YAML files at build time via Vite. We keep data DRY so both Full Rules and Wiki share it.
function fetchYamlText(url: string): string {
	const req = new XMLHttpRequest();
	req.open('GET', url, false);
	req.send(null);
	return req.responseText;
}

function load(): RulesIndex {
	const docs: any[] = [];
	for (const url of [basicYaml, classesYaml]) {
		const text = fetchYamlText(url);
		docs.push(yaml.load(text));
	}
	const sections: RuleSection[] = [];
	for (const doc of docs) {
		if (!doc) continue;
		if (Array.isArray(doc.sections)) {
			for (const s of doc.sections) {
				sections.push({
					id: s.id,
					title: s.title,
					summary: s.summary,
					children: s.children ?? [],
				});
			}
		}
	}
	return { sections };
}

const rules: RulesIndex = load();
export default rules;



