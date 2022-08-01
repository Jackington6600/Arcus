function initTooltip() {
	const tooltips = Array.from(document.querySelectorAll('[data-tooltip-container]'));

	tooltips.map(tooltip => {
		tooltip.addEventListener('mouseover', handleMouseOver);
	})

	function handleMouseOver() {
		const tooltipbox = createTooltipBox(this);

		handleMouseMove.tooltipbox = tooltipbox;
		this.addEventListener('mousemove', handleMouseMove);

		handleMouseLeave.tooltipbox = tooltipbox;
		handleMouseLeave.element = this;
		this.addEventListener('mouseleave', handleMouseLeave);
	}

	const handleMouseLeave = {
		handleEvent() {
			this.tooltipbox.remove();
			this.element.removeEventListener('mousemove', handleMouseMove);
			this.element.removeEventListener('mouseleave', handleMouseLeave);
		}
	}

	const handleMouseMove = {
		handleEvent(e) {
			this.tooltipbox.style.top = e.clientY + 25 + 'px';
			this.tooltipbox.style.left = e.clientX - 70 +'px';
		}
	}

	function createTooltipBox(el) {
		let tooltip = document.createElement('div');
		// let id = el.getAttribute("id");

		switch (el.innerText.toLowerCase()) {
			case "cover": case "in cover": 
				tooltip.innerText = "The creature is visible, but at least 3/4 of it's body is obscured by either the terrain or an obstacle that would block the attack. Ranged attacks against this creature have DisAdv (-). You cannot cover behind creatures.";
				break;
			case "hide": case "hidden":
				tooltip.innerText = "An attack against a creature that you are hidden from has Adv (++). This grade of Adv may vary based on GM's discretion. Being hidden can be broken in many ways such as by making noise, being seen, or dealing damage.";
				break;                  
			case "invisible": case "invisibility":
				tooltip.innerText = "The creature cannot be seen with the naked eye. The creature becomes visible when they take damage, make an attack, deal damage or use an ability of any kind (unless stated otherwise).";
				break;
			case "immovable":
				tooltip.innerText = "The creature cannot be pushed or pulled involuntarily.";
				break;
			case "immutable":
				tooltip.innerText = "The creature cannot be teleported involuntarily.";
				break;
			case "resistant":
				tooltip.innerText = "The creature becomes resistant to a specified damage type (such as physical, fire or psychic). All incoming damage of that type is reduced by half (rounded down).";
				break;
			case "immune":
				tooltip.innerText = "The creature becomes immune to a specified damage type (such as physical, fire or psychic) or specified conditions. All incoming damage of that type is reduced to 0, or the creature is unaffected by that type of condition (resist at no cost).";
				break;
			case "invulnerable":
				tooltip.innerText = "All damage dealt to the creature is reduced to 0.";
				break;
			case "invincible":
				tooltip.innerText = "All damage dealt to the creature is reduced to 0. It also cannot be affected by any conditions.";
				break;
			case "blind": case "blinded":
				tooltip.innerText = "The creature cannot see. The creature automatically fails on all checks requiring sight. The creature will have appropriate levels of DisAdv for other checks that partially involve sight (DMs discretion). All attacks against the creature have Adv (+).";
				break;
			case "deaf": case "deafened": case "deafen":
				tooltip.innerText = "The creature cannot hear. The creature automatically fails on all checks requiring hearing. The creature will have appropriate levels of DisAdv for other checks that partially involve hearing (DMs discretion).";
				break;
			case "marked": case "mark":
				tooltip.innerText = "The creature has a mark placed on it. The effects of this mark are dependent on the ability it is associated with. Many abilities will have bonuses when used against the creature (such as surprise attack). The creature cannot enter stealth or become invisible while it has this condition. A hidden or invisible creature that gains this condition immediately becomes visible.";
				break;
			case "charmed": case "charm":
				tooltip.innerText = "The creature cannot attack the creature that has charmed it (the charmer) or target them with harmful abilities or magical effects. The creature treats the charmer as though they were a close friend. The charmer has Adv (+) on any ability check to interact socially with the creature.";
				break;
			case "dominated": case "dominate":
				tooltip.innerText = "The creature is completely controlled by another creature (the dominator). Dominated creatures can attempt to harm themselves but will still need to make attack rolls as they struggle against the domination. When it comes to the dominated creature’s turn in combat - the dominator takes their turn for them. All movement the creature makes is considered voluntary for the duration.";
				break;
			case "taunted": case "taunt":
				tooltip.innerText = "The creature is forced to attack the creature that has taunted it (the taunter). The creature must do as much damage as possible to the taunter. This may include AOE or collateral damage so long as it still aims to maximise damage to the taunter.";
				break;
			case "frightened": case "fear": case "frighten":
				tooltip.innerText = "The creature must use 2AP worth of regular movement to safely run as far away from a creature as possible (waste 2AP cowering in fear if nowhere to run). This movement is considered voluntary. DisAdv (-) on all ability checks and attacks while the creature can see the source of the fear.";
				break;
			case "prone":
				tooltip.innerText = "The creature’s movement speed is halved and rounded down. This includes movement for abilities. Ranged attacks have DisAdv (-) against the creature, but melee attacks have Adv (+). The creature's attacks have DisAdv (-). 1AP must be spent to stand up. The creature cannot use abilities that involve movement except for teleportation which is still possible - the creature can still be pushed/pulled while prone.";
				break;
			case "hobbled": case "hobble":
				tooltip.innerText = "The creature’s movement speed is halved and rounded down. This includes movement for abilities.";
				break;
			case "immobilised": case "immobilise": case "immobilisation":
				tooltip.innerText = "The creature’s base movement speed becomes 0ft. The creature cannot use abilities that involve movement except for teleportation which is still possible. The creature can also be pushed/pulled unless the GM deems it unreasonable.";
				break;
			case "stunned": case "stun":
				tooltip.innerText = "The creature starts it’s next turn with 2AP fewer and cannot take reactions while stunned. See Negative Conditions for more info.";
				break;
			case "silenced": case "silence":
				tooltip.innerText = "The creature cannot use abilities. Passive abilities work as normal.";
				break;
			case "restrained": case "restrain":
				tooltip.innerText = "The creature can only spend AP on movement or restraint specific actions such as escaping from the restraint.";
				break;
			case "incapacitated": case "incapacitation":
				tooltip.innerText = "The creature can only spend AP on movement or restraint specific actions such as escaping from the restraint. The creature also cannot talk.";
				break;
			case "paralysed": case "paralyse": case "paralysis":
				tooltip.innerText = "The creature becomes rigid and cannot do anything while paralysed. All attack rolls against the creature have Adv (++). Any attack that hits the creature is a critical hit if the attacker is within 5ft of the creature.";
				break;
			case "weak":
				tooltip.innerText = "The creature becomes weak to a specified damage type (such as physical, fire or psychic). All incoming damage of that type is increased by 50% (half the incoming damage, round down, and add it to the incoming damage).";
				break;
			case "vulnerable":
				tooltip.innerText = "The creature becomes vulnerable to a specified damage type (such as physical, fire or psychic). All incoming damage of that type is increased by 100% (double the incoming damage).";
				break;
			case "unconscious":
				tooltip.innerText = "The creature falls limp and Prone and cannot do anything while unconscious. It is unaware of its surroundings and all attacks against the creature have Adv (++). Any attack that hits the creature is a critical hit if the attacker is within 5ft of the creature. The creature remains unconscious until it is helped by another creature.";
				break;
			default:
				tooltip.innerText = "Unrecognised: cannot provide tooltip. Please report this to an Arcus developer thanks :)"
				break;
		}

		tooltip.classList.add('tooltip');
		tooltip.style.opacity="1";

		document.body.appendChild(tooltip);
		
		return tooltip;
	}
}

initTooltip();