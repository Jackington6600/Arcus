import React from 'react';

export type AbilityRow = {
    level: string | number;
    name: string;
    description: string[];
    target: string;
    apCost: string | number;
    tags?: string[];
};

export default function ClassTable({ title, rows, getNameHref }: { title: string; rows: AbilityRow[]; getNameHref?: (row: AbilityRow, index: number) => string | undefined }) {
    return (
        <div className="class-table" style={{ padding: 0 }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>{title}</strong>
                <span style={{ color: 'var(--muted)', fontSize: 12 }}>{rows.length} abilities</span>
            </div>
            <div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                    <tr style={{ background: 'var(--surface-tertiary)' }}>
                            <th style={th}>Level</th>
                            <th style={th}>Name</th>
                            <th style={th}>Description</th>
                            <th style={th}>Target</th>
                            <th style={th}>AP</th>
                            <th style={th}>Tags</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r, i) => (
                            <tr 
                                key={i} 
                                style={{ 
                                    borderTop: '1px solid var(--border-light)',
                                    background: i % 2 === 0 ? 'var(--surface-primary)' : 'var(--surface-secondary)'
                                }}
                                id={getNameHref ? getNameHref(r, i)?.replace('#', '') : undefined}
                            >
                                <td style={td}>{r.level}</td>
                                <td style={{ ...td, fontWeight: 600 }}>
                                    {getNameHref ? (
                                        <a href={getNameHref(r, i)}>{r.name}</a>
                                    ) : (
                                        r.name
                                    )}
                                </td>
                                <td style={{ ...td, whiteSpace: 'pre-wrap' }}>
                                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                                        {r.description.map((p, idx) => (
                                            <li key={idx} style={{ margin: '6px 0' }}>{p}</li>
                                        ))}
                                    </ul>
                                </td>
                                <td style={td}>{r.target}</td>
                                <td style={td}>{r.apCost}</td>
                                <td style={td}>{r.tags?.join(', ')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const th: React.CSSProperties = { textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid var(--border-light)', fontSize: 13, color: 'var(--muted)' };
const td: React.CSSProperties = { padding: '10px 12px', verticalAlign: 'top' };


