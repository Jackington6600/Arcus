function getContent(innerText) {
	switch (innerText) {
		case "cover": case "in cover": 
			return "The creature is visible, but at least 3/4 of it's body is obscured by either the terrain or an obstacle that would block the attack. Ranged attacks against this creature have DisAdv (-). You cannot cover behind creatures.";

		case "hide": case "hidden":
			return "An attack against a creature that you are hidden from has Adv (++). This grade of Adv may vary based on GM's discretion. Being hidden can be broken in many ways such as by making noise, being seen, or dealing damage.";
                  
		case "invisible": case "invisibility":
			return "The creature cannot be seen with the naked eye. The creature becomes visible when they take damage, make an attack, deal damage or use an ability of any kind (unless stated otherwise).";

		case "immovable":
			return "The creature cannot be pushed or pulled involuntarily.";

		case "immutable":
			return "The creature cannot be teleported involuntarily.";

		case "resistant":
			return "The creature becomes resistant to a specified damage type (such as physical, fire or psychic). All incoming damage of that type is reduced by half (rounded down).";

		case "immune":
			return "The creature becomes immune to a specified damage type (such as physical, fire or psychic) or specified conditions. All incoming damage of that type is reduced to 0, or the creature is unaffected by that type of condition (resist at no cost).";

		case "invulnerable":
			return "All damage dealt to the creature is reduced to 0.";

		case "invincible":
			return "All damage dealt to the creature is reduced to 0. It also cannot be affected by any conditions.";

		case "blind": case "blinded":
			return "The creature cannot see. The creature automatically fails on all checks requiring sight. The creature will have appropriate levels of DisAdv for other checks that partially involve sight (DMs discretion). All attacks against the creature have Adv (+).";

		case "deaf": case "deafened": case "deafen":
			return "The creature cannot hear. The creature automatically fails on all checks requiring hearing. The creature will have appropriate levels of DisAdv for other checks that partially involve hearing (DMs discretion).";

		case "marked": case "mark":
			return "The creature has a mark placed on it. The effects of this mark are dependent on the ability it is associated with. Many abilities will have bonuses when used against the creature (such as surprise attack). The creature cannot enter stealth or become invisible while it has this condition. A hidden or invisible creature that gains this condition immediately becomes visible.";

		case "charmed": case "charm":
			return "The creature cannot attack the creature that has charmed it (the charmer) or target them with harmful abilities or magical effects. The creature treats the charmer as though they were a close friend. The charmer has Adv (+) on any ability check to interact socially with the creature.";

		case "dominated": case "dominate":
			return "The creature is completely controlled by another creature (the dominator). Dominated creatures can attempt to harm themselves but will still need to make attack rolls as they struggle against the domination. When it comes to the dominated creature’s turn in combat - the dominator takes their turn for them. All movement the creature makes is considered voluntary for the duration.";

		case "taunted": case "taunt":
			return "The creature is forced to attack the creature that has taunted it (the taunter). The creature must do as much damage as possible to the taunter. This may include AOE or collateral damage so long as it still aims to maximise damage to the taunter.";

		case "frightened": case "fear": case "frighten":
			return "The creature must use 2AP worth of regular movement to safely run as far away from a creature as possible (waste 2AP cowering in fear if nowhere to run). This movement is considered voluntary. DisAdv (-) on all ability checks and attacks while the creature can see the source of the fear.";

		case "prone":
			return "The creature’s movement speed is halved and rounded down. This includes movement for abilities. Ranged attacks have DisAdv (-) against the creature, but melee attacks have Adv (+). The creature's attacks have DisAdv (-). 1AP must be spent to stand up. The creature cannot use abilities that involve movement except for teleportation which is still possible - the creature can still be pushed/pulled while prone.";

		case "hobbled": case "hobble":
			return "The creature’s movement speed is halved and rounded down. This includes movement for abilities.";

		case "immobilised": case "immobilise": case "immobilisation":
			return "The creature’s base movement speed becomes 0ft. The creature cannot use abilities that involve movement except for teleportation which is still possible. The creature can also be pushed/pulled unless the GM deems it unreasonable.";

		case "stunned": case "stun":
			return "The creature starts it’s next turn with 2AP fewer and cannot take reactions while stunned. See Negative Conditions for more info.";

		case "silenced": case "silence":
			return "The creature cannot use abilities. Passive abilities work as normal.";

		case "restrained": case "restrain":
			return "The creature can only spend AP on movement or restraint specific actions such as escaping from the restraint.";

		case "incapacitated": case "incapacitation":
			return "The creature can only spend AP on movement or restraint specific actions such as escaping from the restraint. The creature also cannot talk.";

		case "paralysed": case "paralyse": case "paralysis":
			return "The creature becomes rigid and cannot do anything while paralysed. All attack rolls against the creature have Adv (++). Any attack that hits the creature is a critical hit if the attacker is within 5ft of the creature.";

		case "poisoned": case "poison": 
			return "The creature cannot heal or regain health.";

		case "feeble": case "enfeebled": case "enfeeblement": 
			return "All damage this creature deals is glancing damage. This can still be increased to normal damage on a critical hit.";

		case "weak":
			return "The creature becomes weak to a specified damage type (such as physical, fire or psychic). All incoming damage of that type is increased by 50% (half the incoming damage, round down, and add it to the incoming damage).";

		case "vulnerable":
			return "The creature becomes vulnerable to a specified damage type (such as physical, fire or psychic). All incoming damage of that type is increased by 100% (double the incoming damage).";

		case "unconscious":
			return "The creature falls limp and Prone and cannot do anything while unconscious. It is unaware of its surroundings and all attacks against the creature have Adv (++). Any attack that hits the creature is a critical hit if the attacker is within 5ft of the creature. The creature remains unconscious until it is helped by another creature.";

		default:
			return "Unrecognised: cannot provide tooltip. Please report this to an Arcus developer thanks :)"
	}
}

const p = tippy('.condition', {
	placement: "bottom",
	arrow: true,
	arrowType: "sharp",
	animation: "fade",
	content: (reference) => getContent(reference.innerText.toLowerCase()),
	flipOnUpdate: true,
  });