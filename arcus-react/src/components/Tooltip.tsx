import { PropsWithChildren, useState } from 'react';

type TooltipProps = PropsWithChildren<{ title: string; description?: string }>;

export default function Tooltip({ title, description, children }: TooltipProps) {
	const [open, setOpen] = useState(false);
	return (
		<span
			className="tooltip"
			onMouseEnter={() => setOpen(true)}
			onMouseLeave={() => setOpen(false)}
			aria-haspopup="true"
			aria-expanded={open}
		>
			<span className="tag">{children}</span>
			{open && (
				<div role="tooltip" className="tooltip-bubble">
					<strong>{title}</strong>
					{description && <div style={{ marginTop: 6, color: 'var(--muted)' }}>{description}</div>}
				</div>
			)}
		</span>
	);
}



