import React from 'react';

export interface TocToggleButtonProps {
	isOpen: boolean;
	onToggle: () => void;
	label: string;
	className?: string;
}

export default function TocToggleButton({ 
	isOpen, 
	onToggle, 
	label, 
	className = "" 
}: TocToggleButtonProps) {
	return (
		<button 
			className={`toc-toggle ${className}`} 
			onClick={onToggle} 
			aria-expanded={isOpen}
		>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
				<path d="M4 19.5V6.5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2V19.5l-3-1.5-3 1.5-3-1.5-3 1.5Z"/>
			</svg>
			{label}
		</button>
	);
}
