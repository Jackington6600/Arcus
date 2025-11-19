import React, { useState, useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useData } from '@/contexts/DataContext';
import { TooltipText } from '../Tooltip/TooltipText';
import type { DisplayFormat, SortDirection, TooltipsConfig, AggregateColumnConfig } from '@/types';

export type TableData = Record<string, any>[];

interface TabledRuleProps {
  data: TableData;
  visibleFields?: string[];
  title?: string;
  sourceFile?: string;
  aggregateColumns?: AggregateColumnConfig[];
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
 * Helper function to render formatted text (bold/italic)
 * Can accept either a string or React.ReactNode (for wrapping TooltipText results)
 */
export function renderFormattedText(text: string | React.ReactNode, formats?: ('bold' | 'italic')[]): JSX.Element {
  let content: React.ReactNode = text;
  
  if (formats) {
    formats.forEach((format) => {
      if (format === 'bold') {
        content = <strong>{content}</strong>;
      } else if (format === 'italic') {
        content = <em className="italic" style={{ fontStyle: 'italic' }}>{content}</em>;
      }
    });
  }
  
  return <>{content}</>;
}

/**
 * Component for displaying rule data in table, card, or text format
 */
export function TabledRule({ data, visibleFields, title, sourceFile, aggregateColumns }: TabledRuleProps) {
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
    let baseFields: string[] = [];
    
    if (visibleFields && visibleFields.length > 0) {
      baseFields = visibleFields;
    } else if (data.length > 0) {
      baseFields = Object.keys(data[0]);
    }
    
    // If we have aggregate columns, exclude fields that are in aggregate columns
    // unless they're explicitly in visibleFields
    if (aggregateColumns && aggregateColumns.length > 0) {
      const aggregateFieldNames = new Set(
        aggregateColumns.flatMap((col) => col.fields.map((f) => f.field))
      );
      const aggregateColumnNames = new Set(
        aggregateColumns.map((col) => col.name)
      );
      
      // Filter out aggregate fields unless they're explicitly in visibleFields
      // Also preserve aggregate column names if they're already in visibleFields
      // (so we don't duplicate them when appending)
      baseFields = baseFields.filter((field) => {
        const isAggregateColumnName = aggregateColumnNames.has(field);
        const isAggregateField = aggregateFieldNames.has(field);
        const isExplicitlyVisible = visibleFields && visibleFields.includes(field);
        
        // If it's an aggregate column name already in visibleFields, keep it
        if (isAggregateColumnName && isExplicitlyVisible) {
          return true;
        }
        
        // If it's a regular field in an aggregate column, exclude unless explicitly visible
        if (isAggregateField) {
          return isExplicitlyVisible;
        }
        
        // Keep regular fields
        return true;
      });
      
      // Add aggregate column names that aren't already in visibleFields
      // This preserves the order: if aggregate column names are in visibleFields,
      // they stay in that position; otherwise, append them at the end
      const existingAggregateColumns = new Set(
        baseFields.filter((field) => aggregateColumnNames.has(field))
      );
      const aggregateColumnNamesToAdd = aggregateColumns
        .map((col) => col.name)
        .filter((name) => !existingAggregateColumns.has(name));
      baseFields = [...baseFields, ...aggregateColumnNamesToAdd];
    }
    
    return baseFields;
  }, [data, visibleFields, aggregateColumns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortField || sortDirection === 'default') {
      return data;
    }

    // Check if sorting by an aggregate column
    const aggregateColumn = aggregateColumns?.find((col) => col.name === sortField);
    const sortByField = aggregateColumn && aggregateColumn.fields.length > 0
      ? aggregateColumn.fields[0].field // Sort by first field in aggregate column
      : sortField;

    return [...data].sort((a, b) => {
      const aVal = a[sortByField];
      const bVal = b[sortByField];

      if (aVal === bVal) return 0;

      const comparison = aVal < bVal ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortField, sortDirection, aggregateColumns]);

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
        aggregateColumns={aggregateColumns}
      />
    );
  }

  if (displayFormat === 'card') {
    return <CardDisplay data={sortedData} fields={fields} title={title} sourceFile={sourceFile} tooltips={tooltips} aggregateColumns={aggregateColumns} />;
  }

  return <TextDisplay data={sortedData} fields={fields} title={title} sourceFile={sourceFile} tooltips={tooltips} aggregateColumns={aggregateColumns} />;
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
  aggregateColumns?: AggregateColumnConfig[];
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
  aggregateColumns,
}: TableDisplayProps) {
  
  /**
   * Helper function to find aggregate column by name
   */
  const getAggregateColumn = (name: string): AggregateColumnConfig | undefined => {
    return aggregateColumns?.find((col) => col.name === name);
  };
  
  /**
   * Helper function to render aggregate column content
   */
  const renderAggregateColumn = (row: any, columnConfig: AggregateColumnConfig): JSX.Element => {
    const fieldElements: JSX.Element[] = [];
    
    columnConfig.fields.forEach((fieldConfig, index) => {
      const fieldValue = row[fieldConfig.field];
      
      // Skip empty/missing fields
      if (fieldValue === undefined || fieldValue === null || fieldValue === '' || String(fieldValue).trim() === '') {
        return;
      }
      
      const valueText = String(fieldValue);
      const hasLabel = fieldConfig.label && fieldConfig.label.trim() !== '';
      
      const content = (
        <div key={fieldConfig.field} className={index > 0 ? 'mt-2' : ''}>
          {hasLabel ? (
            <>
              <span className="text-text-primary">
                {renderFormattedText(fieldConfig.label || '', fieldConfig.labelFormat)}
                {': '}
              </span>
              <span className="text-text-secondary">
                {tooltips ? (
                  <TooltipText text={valueText} tooltips={tooltips} formats={fieldConfig.valueFormat} />
                ) : (
                  renderFormattedText(valueText, fieldConfig.valueFormat)
                )}
              </span>
            </>
          ) : (
            <span className="text-text-secondary">
              {tooltips ? (
                <TooltipText text={valueText} tooltips={tooltips} formats={fieldConfig.valueFormat} />
              ) : (
                renderFormattedText(valueText, fieldConfig.valueFormat)
              )}
            </span>
          )}
        </div>
      );
      
      fieldElements.push(content);
    });
    
    return <div className="space-y-1">{fieldElements}</div>;
  };

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
                  const aggregateColumn = getAggregateColumn(field);
                  
                  // If this is an aggregate column, render it specially
                  if (aggregateColumn) {
                    return (
                      <td 
                        key={field} 
                        className="px-4 py-3 text-sm border-b border-border-light break-words whitespace-normal"
                      >
                        {renderAggregateColumn(row, aggregateColumn)}
                      </td>
                    );
                  }
                  
                  // Regular column rendering
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
  aggregateColumns?: AggregateColumnConfig[];
}

interface TextDisplayProps {
  data: TableData;
  fields: string[];
  title?: string;
  sourceFile?: string;
  tooltips?: TooltipsConfig['tooltips'];
  aggregateColumns?: AggregateColumnConfig[];
}

function CardDisplay({ data: sortedData, fields, title, sourceFile, tooltips, aggregateColumns }: CardDisplayProps) {
  /**
   * Helper function to find aggregate column by name
   */
  const getAggregateColumn = (name: string): AggregateColumnConfig | undefined => {
    return aggregateColumns?.find((col) => col.name === name);
  };
  
  /**
   * Helper function to render aggregate column content for cards
   */
  const renderAggregateColumn = (row: any, columnConfig: AggregateColumnConfig): JSX.Element => {
    const fieldElements: JSX.Element[] = [];
    
    columnConfig.fields.forEach((fieldConfig) => {
      const fieldValue = row[fieldConfig.field];
      
      // Skip empty/missing fields
      if (fieldValue === undefined || fieldValue === null || fieldValue === '' || String(fieldValue).trim() === '') {
        return;
      }
      
      const valueText = String(fieldValue);
      const hasLabel = fieldConfig.label && fieldConfig.label.trim() !== '';
      
      const content = (
        <div key={fieldConfig.field} className="mb-2 last:mb-0">
          {hasLabel ? (
            <>
              <span className="text-xs font-semibold text-text-tertiary uppercase">
                {renderFormattedText(fieldConfig.label || '', fieldConfig.labelFormat)}
                {': '}
              </span>
              <span className="ml-2 text-sm text-text-secondary">
                {tooltips ? (
                  <TooltipText text={valueText} tooltips={tooltips} formats={fieldConfig.valueFormat} />
                ) : (
                  renderFormattedText(valueText, fieldConfig.valueFormat)
                )}
              </span>
            </>
          ) : (
            <span className="text-sm text-text-secondary">
              {tooltips ? (
                <TooltipText text={valueText} tooltips={tooltips} formats={fieldConfig.valueFormat} />
              ) : (
                renderFormattedText(valueText, fieldConfig.valueFormat)
              )}
            </span>
          )}
        </div>
      );
      
      fieldElements.push(content);
    });
    
    return <>{fieldElements}</>;
  };
  
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
              const aggregateColumn = getAggregateColumn(field);
              
              // If this is an aggregate column, render it specially
              if (aggregateColumn) {
                return (
                  <div key={field} className="mb-2 last:mb-0">
                    <span className="text-xs font-semibold text-text-tertiary uppercase mb-2 block">
                      {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}:
                    </span>
                    <div className="ml-2">
                      {renderAggregateColumn(row, aggregateColumn)}
                    </div>
                  </div>
                );
              }
              
              // Regular field rendering
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

function TextDisplay({ data: sortedData, fields, title, sourceFile, tooltips, aggregateColumns }: TextDisplayProps) {
  /**
   * Helper function to find aggregate column by name
   */
  const getAggregateColumn = (name: string): AggregateColumnConfig | undefined => {
    return aggregateColumns?.find((col) => col.name === name);
  };
  
  /**
   * Helper function to render aggregate column content for text display
   */
  const renderAggregateColumn = (row: any, columnConfig: AggregateColumnConfig): JSX.Element => {
    const fieldElements: JSX.Element[] = [];
    
    columnConfig.fields.forEach((fieldConfig) => {
      const fieldValue = row[fieldConfig.field];
      
      // Skip empty/missing fields
      if (fieldValue === undefined || fieldValue === null || fieldValue === '' || String(fieldValue).trim() === '') {
        return;
      }
      
      const valueText = String(fieldValue);
      const hasLabel = fieldConfig.label && fieldConfig.label.trim() !== '';
      
      const content = (
        <div key={fieldConfig.field} className="mb-2 last:mb-0">
          {hasLabel ? (
            <>
              <span className="font-semibold text-text-primary">
                {renderFormattedText(fieldConfig.label || '', fieldConfig.labelFormat)}
                {': '}
              </span>
              <span className="ml-2 text-text-secondary">
                {tooltips ? (
                  <TooltipText text={valueText} tooltips={tooltips} formats={fieldConfig.valueFormat} />
                ) : (
                  renderFormattedText(valueText, fieldConfig.valueFormat)
                )}
              </span>
            </>
          ) : (
            <span className="text-text-secondary">
              {tooltips ? (
                <TooltipText text={valueText} tooltips={tooltips} formats={fieldConfig.valueFormat} />
              ) : (
                renderFormattedText(valueText, fieldConfig.valueFormat)
              )}
            </span>
          )}
        </div>
      );
      
      fieldElements.push(content);
    });
    
    return <>{fieldElements}</>;
  };
  
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
              const aggregateColumn = getAggregateColumn(field);
              
              // If this is an aggregate column, render it specially
              if (aggregateColumn) {
                return (
                  <div key={field} className="mb-3 last:mb-0">
                    <span className="font-semibold text-text-primary mb-2 block">
                      {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}:
                    </span>
                    <div className="ml-2">
                      {renderAggregateColumn(row, aggregateColumn)}
                    </div>
                  </div>
                );
              }
              
              // Regular field rendering
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

