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
		let id = el.getAttribute("id");

		switch (el.innerText) {
			case "stunned":
				tooltip.innerText = "The creature starts it’s next turn with 2AP fewer and cannot take reactions while stunned. See Negative Conditions for more info.";
		}

		tooltip.classList.add('tooltip');

		document.body.appendChild(tooltip);
		
		return tooltip;
	}
}

initTooltip();