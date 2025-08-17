import React from 'react';

interface SearchBarProps {
	query: string;
	onQueryChange: (query: string) => void;
	placeholder?: string;
	className?: string;
}

export default function SearchBar({ query, onQueryChange, placeholder = "Search...", className = "" }: SearchBarProps) {
	return (
		<div className={`searchbar ${className}`}>
			<input
				className="input"
				placeholder={placeholder}
				value={query}
				onChange={(e) => onQueryChange(e.target.value)}
			/>
			{query && (
				<button 
					className="search-clear" 
					onClick={() => onQueryChange('')}
					aria-label="Clear search"
				>
					×
				</button>
			)}
		</div>
	);
}
