import { useState, useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useData } from '@/contexts/DataContext';
import { TooltipText } from '../Tooltip/TooltipText';
import type { DisplayFormat, SortDirection, TooltipsConfig } from '@/types';

export type TableData = Record<string, any>[];

interface TabledRuleProps {
  data: TableData;
  visibleFields?: string[];
  title?: string;
  sourceFile?: string;
}

/**
 * Generates a unique row ID based on sourceFile and row data
 * This matches the ID format used in search results
 */
export function generateRowId(sourceFile: string | undefined, row: any): string | null {
  if (!sourceFile) return null;
  
  switch (sourceFile) {
    case 'armour.yaml':
      return row.type ? `armour-${row.type}` : null;
    case 'weapons.yaml':
      return row.weapon ? `weapon-${row.weapon}` : null;
    case 'traits.yaml':
      // Traits table is flattened with groupId included
      if (row.name && row.groupId) {
        return `trait-${row.groupId}-${row.name}`;
      }
      // Fallback if groupId not available
      return row.name ? `trait-${row.name}` : null;
    case 'core_abilities.yaml':
      return row.name ? `core-ability-${row.name}` : null;
    case 'class_abilities.yaml':
      // For class abilities, use classId if available
      if (row.name && row.classId) {
        return `class-ability-${row.classId}-${row.name}`;
      }
      // Fallback if classId not available
      if (row.name && row.className) {
        // Convert className to a classId-like format (lowercase, replace spaces with hyphens)
        const classId = row.className.toLowerCase().replace(/\s+/g, '-');
        return `class-ability-${classId}-${row.name}`;
      }
      return row.name ? `class-ability-${row.name}` : null;
    default:
      return null;
  }
}

/**
 * Component for displaying rule data in table, card, or text format
 */
export function TabledRule({ data, visibleFields, title, sourceFile }: TabledRuleProps) {
  const { preferences } = useTheme();
  const { data: appData } = useData();
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('default');

  // Determine display format - use user preference unless sourceFile indicates it's configurable
  const displayFormat: DisplayFormat = sourceFile
    ? preferences.displayFormat
    : 'text';

  // Get fields to display
  const fields = useMemo(() => {
    if (visibleFields && visibleFields.length > 0) {
      return visibleFields;
    }
    if (data.length > 0) {
      return Object.keys(data[0]);
    }
    return [];
  }, [data, visibleFields]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortField || sortDirection === 'default') {
      return data;
    }

    return [...data].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (aVal === bVal) return 0;

      const comparison = aVal < bVal ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      // Cycle through: default -> asc -> desc -> default
      if (sortDirection === 'default') {
        setSortDirection('asc');
      } else if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortField(null);
        setSortDirection('default');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const tooltips = appData?.tooltips?.tooltips;

  if (displayFormat === 'table') {
    return (
      <TableDisplay
        data={sortedData}
        fields={fields}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        title={title}
        sourceFile={sourceFile}
        tooltips={tooltips}
      />
    );
  }

  if (displayFormat === 'card') {
    return <CardDisplay data={sortedData} fields={fields} title={title} sourceFile={sourceFile} tooltips={tooltips} />;
  }

  return <TextDisplay data={sortedData} fields={fields} title={title} sourceFile={sourceFile} tooltips={tooltips} />;
}

interface TableDisplayProps {
  data: TableData;
  fields: string[];
  sortField: string | null;
  sortDirection: SortDirection;
  onSort: (field: string) => void;
  title?: string;
  sourceFile?: string;
  tooltips?: TooltipsConfig['tooltips'];
}

function TableDisplay({
  data: sortedData,
  fields,
  sortField,
  sortDirection,
  onSort,
  title,
  sourceFile,
  tooltips,
}: TableDisplayProps) {

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 ml-1 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    if (sortDirection === 'asc') {
      return (
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    }
    if (sortDirection === 'desc') {
      return (
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      );
    }
    return null;
  };

  return (
    <div className="my-8">
      {title && (
        <h3 className="text-2xl font-semibold text-text-primary mb-4 font-cinzel">{title}</h3>
      )}
      <div className="overflow-x-auto min-w-0 max-w-4xl">
        <table className="w-full border-separate border-spacing-0 bg-surface rounded-medium shadow-medium table-auto min-w-[750px]">
          <thead>
            <tr>
              {fields.map((field) => (
                <th
                  key={field}
                  onClick={() => onSort(field)}
                  className="px-4 py-3 text-left text-sm font-semibold text-text-primary cursor-pointer hover:bg-surface-tertiary transition-smooth select-none bg-surface-secondary border-b-2 border-border-light first:rounded-tl-medium last:rounded-tr-medium break-words whitespace-normal"
                >
                  <div className="flex items-center">
                    {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                    {getSortIcon(field)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row: any, index: number) => {
              const rowId = generateRowId(sourceFile, row);
              return (
                <tr
                  key={index}
                  id={rowId || undefined}
                  className={`
                    transition-smooth
                    ${index % 2 === 0 ? 'bg-surface' : 'bg-surface-secondary'}
                    hover:bg-surface-tertiary
                  `}
                >
                {fields.map((field) => {
                  const cellValue = String(row[field] || '-');
                  return (
                    <td 
                      key={field} 
                      className="px-4 py-3 text-sm text-text-secondary border-b border-border-light break-words whitespace-normal"
                    >
                      {tooltips ? (
                        <TooltipText text={cellValue} tooltips={tooltips} />
                      ) : (
                        cellValue
                      )}
                    </td>
                  );
                })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface CardDisplayProps {
  data: TableData;
  fields: string[];
  title?: string;
  sourceFile?: string;
  tooltips?: TooltipsConfig['tooltips'];
}

interface TextDisplayProps {
  data: TableData;
  fields: string[];
  title?: string;
  sourceFile?: string;
  tooltips?: TooltipsConfig['tooltips'];
}

function CardDisplay({ data: sortedData, fields, title, sourceFile, tooltips }: CardDisplayProps) {
  return (
    <div className="my-8">
      {title && (
        <h3 className="text-2xl font-semibold text-text-primary mb-6 font-cinzel">{title}</h3>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedData.map((row: any, index: number) => {
          const rowId = generateRowId(sourceFile, row);
          return (
            <div
              key={index}
              id={rowId || undefined}
              className="bg-surface border border-border-light rounded-medium p-4 shadow-soft hover:shadow-medium transition-smooth"
            >
            {fields.map((field) => {
              const fieldValue = String(row[field] || '-');
              return (
                <div key={field} className="mb-2 last:mb-0">
                  <span className="text-xs font-semibold text-text-tertiary uppercase">
                    {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}:
                  </span>
                  <span className="ml-2 text-sm text-text-secondary">
                    {tooltips ? (
                      <TooltipText text={fieldValue} tooltips={tooltips} />
                    ) : (
                      fieldValue
                    )}
                  </span>
                </div>
              );
            })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TextDisplay({ data: sortedData, fields, title, sourceFile, tooltips }: TextDisplayProps) {
  return (
    <div className="my-8">
      {title && (
        <h3 className="text-2xl font-semibold text-text-primary mb-6 font-cinzel">{title}</h3>
      )}
      <div className="space-y-6">
        {sortedData.map((row: any, index: number) => {
          const rowId = generateRowId(sourceFile, row);
          return (
            <div
              key={index}
              id={rowId || undefined}
              className="bg-surface-secondary rounded-medium p-6 border border-border-light"
            >
            {fields.map((field) => {
              const fieldValue = String(row[field] || '-');
              return (
                <div key={field} className="mb-3 last:mb-0">
                  <span className="font-semibold text-text-primary">
                    {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}:
                  </span>
                  <span className="ml-2 text-text-secondary">
                    {tooltips ? (
                      <TooltipText text={fieldValue} tooltips={tooltips} />
                    ) : (
                      fieldValue
                    )}
                  </span>
                </div>
              );
            })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

