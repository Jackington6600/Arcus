import React from 'react';

export interface SearchResult {
	id: string;
	title: string;
	preview: string;
	category: string;
}

interface SearchResultsProps {
	results: SearchResult[];
	onClear: () => void;
	onItemClick?: (id: string) => void;
}

export default function SearchResults({ results, onClear, onItemClick }: SearchResultsProps) {
	if (!results.length) {
		return (
			<div className="accordion-item" style={{ marginBottom: 10 }}>
				<div className="accordion-header" style={{ cursor: 'default' }}>
					<strong>Search Results</strong>
					<span aria-hidden>0</span>
				</div>
				<div className="accordion-content">
					<p style={{ color: 'var(--muted)', margin: '6px 0 0' }}>No matches. Try different terms.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="accordion-item" style={{ marginBottom: 10 }}>
			<div className="accordion-header" onClick={onClear}>
				<strong>Search Results ({results.length})</strong>
				<span aria-hidden>×</span>
			</div>
			<div className="accordion-content">
				{results.map((e) => (
					<div 
						key={e.id} 
						className="search-result-item"
						style={{ 
							padding: '8px 0', 
							borderBottom: '1px solid var(--border)',
							cursor: 'pointer'
						}}
						onClick={onItemClick ? () => onItemClick(e.id) : undefined}
					>
						<div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
							<span style={{ fontWeight: 600 }}>
								{e.title}
							</span>
							<span className="tag">{e.category}</span>
						</div>
						{e.preview && (
							<p style={{ margin: '6px 0 0', color: 'var(--muted)' }}>
								{e.preview.slice(0, 160)}{e.preview.length > 160 ? '…' : ''}
							</p>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
