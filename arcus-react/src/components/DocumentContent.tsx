import React from 'react';

export interface DocumentContentProps {
	children: React.ReactNode;
	className?: string;
	ref?: React.RefObject<HTMLDivElement>;
}

export default React.forwardRef<HTMLDivElement, DocumentContentProps>(
	function DocumentContent({ children, className = "" }, ref) {
		return (
			<article className={`doc ${className}`} ref={ref}>
				{children}
			</article>
		);
	}
);
