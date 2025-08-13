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



