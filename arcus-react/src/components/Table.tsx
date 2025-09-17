import React from 'react';

export type TableColumn<T = any> = {
    key: string;
    header: string;
    render?: (value: any, row: T, index: number) => React.ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
};

export type TableProps<T = any> = {
    title?: string;
    subtitle?: string;
    columns: TableColumn<T>[];
    rows: T[];
    getNameHref?: (row: T, index: number) => string | undefined;
    className?: string;
    showRowCount?: boolean;
    rowCountLabel?: string;
};

export default function Table<T = any>({ 
    title, 
    subtitle,
    columns, 
    rows, 
    getNameHref,
    className = '',
    showRowCount = true,
    rowCountLabel
}: TableProps<T>) {
    const countLabel = rowCountLabel || (title ? `${rows.length} items` : `${rows.length} rows`);
    
    return (
        <div className={`generic-table ${className}`} style={{ padding: 0 }}>
            {(title || subtitle) && (
                <div style={{ 
                    padding: '12px 14px', 
                    borderBottom: '1px solid var(--border-light)', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                }}>
                    <div>
                        {title && <strong>{title}</strong>}
                        {subtitle && (
                            <div style={{ 
                                color: 'var(--muted)', 
                                fontSize: 12, 
                                marginTop: 2 
                            }}>
                                {subtitle}
                            </div>
                        )}
                    </div>
                    {showRowCount && (
                        <span style={{ 
                            color: 'var(--muted)', 
                            fontSize: 12 
                        }}>
                            {countLabel}
                        </span>
                    )}
                </div>
            )}
            <div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--surface-tertiary)' }}>
                            {columns.map((column) => (
                                <th 
                                    key={column.key}
                                    style={{
                                        ...th,
                                        textAlign: column.align || 'left',
                                        width: column.width
                                    }}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr 
                                key={i} 
                                style={{ 
                                    borderTop: '1px solid var(--border-light)',
                                    background: i % 2 === 0 ? 'var(--surface-primary)' : 'var(--surface-secondary)'
                                }}
                                id={getNameHref ? getNameHref(row, i)?.replace('#', '') : undefined}
                            >
                                {columns.map((column) => (
                                    <td 
                                        key={column.key}
                                        style={{
                                            ...td,
                                            textAlign: column.align || 'left'
                                        }}
                                    >
                                        {column.render ? 
                                            column.render(row[column.key as keyof T], row, i) : 
                                            String(row[column.key as keyof T] || '')
                                        }
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const th: React.CSSProperties = { 
    textAlign: 'left', 
    padding: '10px 12px', 
    borderBottom: '1px solid var(--border-light)', 
    fontSize: 13, 
    color: 'var(--muted)' 
};

const td: React.CSSProperties = { 
    padding: '10px 12px', 
    verticalAlign: 'top' 
};

// Legacy type for backward compatibility
export type AbilityRow = {
    level: string | number;
    name: string;
    description: string[];
    target: string;
    apCost: string | number;
    tags?: string[];
};

// New type for traits table
export type TraitRow = {
    name: string;
    desc: string;
    usage: string;
    requirements: string;
};

// New type for trait groups
export type TraitGroup = {
    name: string;
    id: string;
    description: string;
    traits: TraitRow[];
};

// New types for weapons/armour/core abilities
export type WeaponRow = {
    weapon: string;
    notes: string;
    modifier: string;
    range: string;
};

export type ArmourRow = {
    type: string;
    energy: string;
    movement: string;
    notes: string;
    requirements: string;
};

export type CoreAbilityRow = {
    level: string;
    name: string;
    description: string;
    target: string;
    apCost: string | number;
};

// Helper function to create columns for the old ClassTable format
export function createClassTableColumns(getNameHref?: (row: AbilityRow, index: number) => string | undefined): TableColumn<AbilityRow>[] {
    return [
        {
            key: 'level',
            header: 'Level',
            width: '80px'
        },
        {
            key: 'name',
            header: 'Name',
            render: (value, row, index) => (
                getNameHref ? (
                    <a href={getNameHref(row, index)}>{value}</a>
                ) : (
                    <span style={{ fontWeight: 600 }}>{value}</span>
                )
            )
        },
        {
            key: 'description',
            header: 'Description',
            render: (value) => (
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {value.map((p: string, idx: number) => (
                        <li key={idx} style={{ margin: '6px 0' }}>{p}</li>
                    ))}
                </ul>
            )
        },
        {
            key: 'target',
            header: 'Target'
        },
        {
            key: 'apCost',
            header: 'AP',
            width: '60px'
        },
        {
            key: 'tags',
            header: 'Tags',
            render: (value) => value?.join(', ') || ''
        }
    ];
}

// Helper function to create columns for traits table
export function createTraitsTableColumns(): TableColumn<TraitRow>[] {
    return [
        {
            key: 'name',
            header: 'Name',
            render: (value) => <span style={{ fontWeight: 600 }}>{value}</span>
        },
        {
            key: 'desc',
            header: 'Description',
            render: (value) => (
                <div style={{ 
                    lineHeight: 1.4, 
                    maxWidth: '400px',
                    wordBreak: 'break-word'
                }}>
                    {value}
                </div>
            )
        },
        {
            key: 'usage',
            header: 'Usage',
            width: '120px',
            align: 'center'
        },
        {
            key: 'requirements',
            header: 'Requirements',
            width: '120px',
            align: 'center'
        }
    ];
}

// Helper function to render a trait group table
export function renderTraitGroupTable(group: TraitGroup, className?: string) {
    return (
        <Table 
            title={group.name}
            subtitle={group.description}
            rows={group.traits}
            columns={createTraitsTableColumns()}
            showRowCount={true}
            rowCountLabel={`${group.traits.length} traits available`}
            className={className}
        />
    );
}

// Helper function to create columns for weapons table
export function createWeaponsTableColumns(): TableColumn<WeaponRow>[] {
    return [
        { key: 'weapon', header: 'Weapon', render: (v) => <span style={{ fontWeight: 600 }}>{v}</span> },
        { key: 'notes', header: 'Notes' },
        { key: 'modifier', header: 'Modifier', width: '220px' },
        { key: 'range', header: 'Range', width: '200px' },
    ];
}

// Helper function to create columns for armour table
export function createArmourTableColumns(): TableColumn<ArmourRow>[] {
    return [
        { key: 'type', header: 'Type', width: '100px', render: (v) => <span style={{ fontWeight: 600 }}>{v}</span> },
        { key: 'energy', header: 'Armour Energy Values', width: '200px' },
        { key: 'movement', header: 'Movement Speed', width: '180px' },
        { key: 'notes', header: 'Notes', width: '200px' },
        { key: 'requirements', header: 'Requirements', width: '170px' },
    ];
}

// Helper function to create columns for core abilities table
export function createCoreAbilitiesTableColumns(): TableColumn<CoreAbilityRow>[] {
    return [
        { key: 'level', header: 'Level', width: '80px' },
        { key: 'name', header: 'Name', render: (v) => <span style={{ fontWeight: 600 }}>{v}</span> },
        { key: 'description', header: 'Description' },
        { key: 'target', header: 'Target', width: '160px' },
        { key: 'apCost', header: 'AP Cost', width: '100px', align: 'center' },
    ];
}
