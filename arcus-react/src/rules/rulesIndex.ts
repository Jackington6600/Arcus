import classesYaml from './yaml/classes.yaml?url';
import basicYaml from './yaml/basic.yaml?url';
import yaml from 'js-yaml';

export type RuleChild = {
	id: string;
	title: string;
	body?: string | string[];
	children?: RuleChild[]; // Support for nested children
};

export type RuleSection = {
	id: string;
	title: string;
	summary?: string;
	children?: RuleChild[];
};

export type RulesIndex = {
    sections: RuleSection[];
    classes: ClassesIndex;
};

// Map phrases to rule ids for auto-tooltips
export type TooltipMap = Record<string, string>; // phrase -> id
export const TOOLTIP_MAP: TooltipMap = {
    // Example mappings; extend freely
    'Stunned': 'stunned',
    'Prone': 'prone',
    'Conditions': 'conditions',
    'Condition Mechanics': 'condition-mechanics',
    'Character Classes': 'classes',
    'Core Loop': 'core-loop',
    'What is Arcus?': 'what-is-arcus',
    'Warrior': 'class-warrior',
    'Scoundrel': 'class-scoundrel',
    'Marksman': 'class-marksman',
    'Elemental': 'class-elemental',
    'Mortality': 'class-mortality',
    'Arcane': 'class-arcane',
    'Psionic': 'class-psionic',
    'Push for Success': 'push-for-success',
    'Advantage and Disadvantage': 'advantage-disadvantage',
    'Outcome Resolution': 'outcome-resolution',
    'Attributes': 'attributes',
    'Energy': 'energy',
    'Combat': 'combat',
    'Core Abilities': 'core-abilities',
};

// Map phrases to wiki anchors (id) that should be turned into links on the Wiki page
export type LinkMap = Record<string, string>; // phrase -> id
export const WIKI_LINK_MAP: LinkMap = {
    // Add phrases you want to become links in the Wiki content
    'What is Arcus?': 'what-is-arcus',
    'Core Loop': 'core-loop',
    'Conditions': 'conditions',
    'Condition Mechanics': 'condition-mechanics',
    'Character Classes': 'classes',
    'Warrior': 'class-warrior',
    'Scoundrel': 'class-scoundrel',
    'Marksman': 'class-marksman',
    'Elemental': 'class-elemental',
    'Mortality': 'class-mortality',
    'Arcane': 'class-arcane',
    'Psionic': 'class-psionic',
    'Stunned': 'stunned',
    'Prone': 'prone',
    'Push for Success': 'push-for-success',
    'Advantage and Disadvantage': 'advantage-disadvantage',
    'Outcome Resolution': 'outcome-resolution',
    'Attributes': 'attributes',
    'Energy': 'energy',
    'Combat': 'combat',
    'Core Abilities': 'core-abilities',
};

// Extended class ability schema
export type AbilityEnergyCost = {
    base?: string; // e.g., "1 FORT", "2 REFL"; freeform for now
    optional?: string; // e.g., "Spend 1 FORT: ..." kept in description too
};

export type AbilityAttack = {
    power?: string; // e.g., Light/Medium/Heavy + modifiers
    targetsEnergy?: 'FORT' | 'REFL' | 'WILL' | string;
};

export type AbilityCondition = { name: string; resistEnergy: 'FORT' | 'REFL' | 'WILL' | string };

export type ClassAbility = {
    level: 'Core' | number | string;
    name: string;
    description: string[]; // paragraphs
    target: string; // e.g., "A+E, 5ft, Single target"
    apCost: number | 'Pass' | 'React' | string;
    energyCost?: AbilityEnergyCost;
    attack?: AbilityAttack;
    conditions?: AbilityCondition[];
    tags?: string[];
};

export type ClassInfo = {
    id: string;
    name: string;
    type: string;
    attributes: string;
    summary: string;
    abilities: ClassAbility[];
};

export type ClassesIndex = Record<string, ClassInfo>;

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
    const classes: ClassesIndex = {};
	for (const doc of docs) {
		if (!doc) continue;
		if (Array.isArray(doc.sections)) {
			for (const s of doc.sections) {
				sections.push({
					id: s.id,
					title: s.title,
					summary: s.summary,
					children: processChildren(s.children) ?? [],
				});
			}
		}
        if (doc.classes && typeof doc.classes === 'object') {
            for (const [key, value] of Object.entries<any>(doc.classes)) {
                if (!value) continue;
                const info: ClassInfo = {
                    id: key,
                    name: value.name ?? key,
                    type: value.type ?? '',
                    attributes: value.attributes ?? '',
                    summary: value.summary ?? '',
                    abilities: Array.isArray(value.abilities) ? value.abilities.map((a: any) => ({
                        level: a.level,
                        name: a.name,
                        description: Array.isArray(a.description)
                            ? a.description.map((d: any) =>
                                typeof d === 'string'
                                    ? d
                                    : d && typeof d === 'object'
                                        ? Object.entries(d).map(([k, v]) => `${k}: ${String(v ?? '')}`).join('; ')
                                        : String(d)
                              )
                            : (a.description ? [String(a.description)] : []),
                        target: a.target ?? '',
                        apCost: a.apCost,
                        energyCost: a.energyCost,
                        attack: a.attack,
                        conditions: a.conditions,
                        tags: a.tags,
                    })) : [],
                };
                classes[key] = info;
            }
        }
	}
    return { sections, classes };
}

// Helper function to recursively process children and nested children
function processChildren(children: any[] | undefined): RuleChild[] | undefined {
	if (!Array.isArray(children)) return undefined;
	
	return children.map(child => ({
		id: child.id,
		title: child.title,
		body: child.body,
		children: processChildren(child.children), // Recursively process nested children
	}));
}

const rules: RulesIndex = load();
export default rules;



