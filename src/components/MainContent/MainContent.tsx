import { useEffect, useRef, useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { TabledRule } from '../TabledRule/TabledRule';
import { TooltipText } from '../Tooltip/TooltipText';
import type { MainRuleSection, ContentSection, Heading, TableFilter } from '@/types';

interface MainContentProps {
  onHeadingsChange: (headings: Heading[]) => void;
  onCurrentHeadingChange: (id: string | null) => void;
}

/**
 * Main content component that renders rules based on contentConfig
 */
export function MainContent({ onHeadingsChange, onCurrentHeadingChange }: MainContentProps) {
  const { data } = useData();
  const contentRef = useRef<HTMLDivElement>(null);
  const [headings, setHeadings] = useState<Heading[]>([]);

  // Extract headings from rendered content
  useEffect(() => {
    if (!contentRef.current) return;

    const headingElements = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const extractedHeadings: Heading[] = [];

    headingElements.forEach((element) => {
      const id = element.id;
      const title = element.textContent || '';
      const level = parseInt(element.tagName.charAt(1));

      if (id) {
        extractedHeadings.push({
          id,
          title,
          level,
          element: element as HTMLElement,
        });
      }
    });

    setHeadings(extractedHeadings);
    onHeadingsChange(extractedHeadings);
  }, [data, onHeadingsChange]);

  // Track current heading on scroll
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            onCurrentHeadingChange(id);
            break;
          }
        }
      },
      {
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0,
      }
    );

    headings.forEach((heading) => {
      if (heading.element) {
        observer.observe(heading.element);
      }
    });

    return () => {
      headings.forEach((heading) => {
        if (heading.element) {
          observer.unobserve(heading.element);
        }
      });
    };
  }, [headings, onCurrentHeadingChange]);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-text-secondary">Loading rules...</div>
      </div>
    );
  }

  const renderSection = (section: MainRuleSection, level = 1): JSX.Element | null => {
    const HeadingTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
    const headingSizes = {
      1: 'text-4xl font-bold',
      2: 'text-3xl font-bold',
      3: 'text-2xl font-bold',
      4: 'text-xl font-bold',
      5: 'text-lg font-bold',
      6: 'text-base font-bold',
    };
    const headingSize = headingSizes[level as keyof typeof headingSizes] || headingSizes[3];

    return (
      <div key={section.id} className="mb-8 min-w-0 max-w-full">
        <HeadingTag 
          id={section.id} 
          className={`${headingSize} mt-8 mb-3 font-cinzel text-text-primary`}
        >
          {section.title}
        </HeadingTag>
        {section.summary && (
          <p className="text-base text-text-secondary mb-4 italic font-normal break-words">
            {data?.tooltips ? (
              <TooltipText text={section.summary} tooltips={data.tooltips.tooltips} />
            ) : (
              section.summary
            )}
          </p>
        )}
        {section.body && (
          <div className="prose prose-lg max-w-none min-w-0 break-words">
            {Array.isArray(section.body) ? (
              section.body.map((paragraph, index) => (
                <p key={index} className="mb-4 text-text-primary break-words">
                  {data?.tooltips ? (
                    <TooltipText text={paragraph} tooltips={data.tooltips.tooltips} />
                  ) : (
                    paragraph
                  )}
                </p>
              ))
            ) : (
              <p className="mb-4 text-text-primary break-words">
                {data?.tooltips ? (
                  <TooltipText text={section.body} tooltips={data.tooltips.tooltips} />
                ) : (
                  section.body
                )}
              </p>
            )}
          </div>
        )}
        {section.children && (
          <div className="ml-4 mt-4">
            {section.children.map((child) => renderSection(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Filter table data based on filter configuration
  const filterTableData = (tableData: any[], filter: TableFilter | undefined, sourceFile: string): any[] => {
    if (!filter || tableData.length === 0) {
      return tableData;
    }

    // Filter class abilities by class IDs
    if (sourceFile === 'class_abilities.yaml' && filter.classIds && filter.classIds.length > 0) {
      return tableData.filter((row) => filter.classIds!.includes(row.classId));
    }

    // Filter traits by group IDs
    if (sourceFile === 'traits.yaml' && filter.groupIds && filter.groupIds.length > 0) {
      return tableData.filter((row) => filter.groupIds!.includes(row.groupId));
    }

    // Filter by field values for other tables
    if (filter.field && filter.values && filter.values.length > 0) {
      return tableData.filter((row) => filter.values!.includes(String(row[filter.field!])));
    }

    return tableData;
  };

  // Get metadata for a group from the first row (all rows in a group have the same metadata)
  const getGroupMetadata = (groupRows: any[], metadataFields: string[]): Record<string, any> => {
    if (groupRows.length === 0) return {};
    const firstRow = groupRows[0];
    const metadata: Record<string, any> = {};
    
    metadataFields.forEach((field) => {
      // Handle prefixed fields (e.g., classType, classAttributes, groupDescription)
      const prefixedField = `class${field.charAt(0).toUpperCase() + field.slice(1)}`;
      const groupPrefixedField = `group${field.charAt(0).toUpperCase() + field.slice(1)}`;
      
      if (firstRow[prefixedField] !== undefined) {
        metadata[field] = firstRow[prefixedField];
      } else if (firstRow[groupPrefixedField] !== undefined) {
        metadata[field] = firstRow[groupPrefixedField];
      } else if (firstRow[field] !== undefined) {
        metadata[field] = firstRow[field];
      }
    });
    
    return metadata;
  };

  // Render grouped table with metadata
  const renderGroupedTable = (
    configSection: ContentSection,
    tableData: any[],
    level: number,
    sourceFile: string,
    parentTitle: string
  ): JSX.Element | null => {
    if (!configSection.splitBy || !configSection.groupTitleField || tableData.length === 0) {
      return null;
    }

    // Group data by splitBy field
    const groupedData = new Map<string, any[]>();
    tableData.forEach((row) => {
      const groupKey = row[configSection.splitBy!];
      if (groupKey) {
        if (!groupedData.has(groupKey)) {
          groupedData.set(groupKey, []);
        }
        groupedData.get(groupKey)!.push(row);
      }
    });

    if (groupedData.size === 0) {
      return null;
    }

    const ParentHeadingTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
    const ChildHeadingTag = `h${Math.min(level + 1, 6)}` as keyof JSX.IntrinsicElements;
    const headingSizes = {
      1: 'text-4xl font-bold',
      2: 'text-3xl font-bold',
      3: 'text-2xl font-bold',
      4: 'text-xl font-bold',
      5: 'text-lg font-bold',
      6: 'text-base font-bold',
    };
    const parentHeadingSize = headingSizes[level as keyof typeof headingSizes] || headingSizes[3];
    const childHeadingSize = headingSizes[(level + 1) as keyof typeof headingSizes] || headingSizes[4];

    // Generate section ID prefix based on source file
    const sectionIdPrefix = sourceFile === 'class_abilities.yaml' ? 'class' : 
                            sourceFile === 'traits.yaml' ? 'trait-group' : 
                            'group';

    const shouldShowInNavigation = configSection.showInNavigation !== false;

    return (
      <div key={configSection.id} className="min-w-0">
        {/* Parent heading for the table section */}
        {shouldShowInNavigation && (
          <ParentHeadingTag 
            id={configSection.id} 
            className={`${parentHeadingSize} mt-8 mb-3 font-cinzel text-text-primary`}
          >
            {parentTitle}
          </ParentHeadingTag>
        )}
        {Array.from(groupedData.entries()).map(([groupKey, groupRows]) => {
          const groupTitle = groupRows[0]?.[configSection.groupTitleField!] || groupKey;
          const sectionId = `${sectionIdPrefix}-${groupKey}`;
          const metadata = configSection.metadataFields 
            ? getGroupMetadata(groupRows, configSection.metadataFields)
            : {};

          return (
            <div key={groupKey} className="mb-8 min-w-0">
              {shouldShowInNavigation && (
                <ChildHeadingTag 
                  id={sectionId} 
                  className={`${childHeadingSize} mt-8 mb-3 font-cinzel text-text-primary`}
                >
                  {groupTitle}
                </ChildHeadingTag>
              )}
              {configSection.metadataFields && configSection.metadataFields.length > 0 && (
                <div className="mb-4 space-y-2">
                  {configSection.metadataFields.map((field) => {
                    const value = metadata[field];
                    if (value === undefined || value === null || value === '') return null;
                    
                    // Format field name (capitalize first letter, add spaces before capitals)
                    const fieldLabel = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');
                    
                    return (
                      <p key={field} className="text-base text-text-secondary break-words">
                        <span className="font-semibold text-text-primary">{fieldLabel}:</span>{' '}
                        {data?.tooltips ? (
                          <TooltipText text={String(value)} tooltips={data.tooltips.tooltips} />
                        ) : (
                          String(value)
                        )}
                      </p>
                    );
                  })}
                </div>
              )}
              <TabledRule
                data={groupRows}
                visibleFields={configSection.visibleFields}
                title={undefined} // Don't show title since we have the heading
                sourceFile={configSection.sourceFile}
              />
            </div>
          );
        })}
        {/* Render children sections if they exist */}
        {configSection.children && (
          <div className="ml-4 mt-4">
            {configSection.children.map((child) => renderContentSection(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderContentSection = (configSection: ContentSection, level = 1): JSX.Element | null => {
    // Find matching section in main rules
    const findSectionById = (
      sections: MainRuleSection[],
      id: string
    ): MainRuleSection | null => {
      for (const section of sections) {
        if (section.id === id) {
          return section;
        }
        if (section.children) {
          const found = findSectionById(section.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    // Handle tabled rules
    if (configSection.sourceFile) {
      let tableData: any[] = [];
      let title = '';

      switch (configSection.sourceFile) {
        case 'armour.yaml':
          tableData = data.armour.armour;
          title = 'Armour Types';
          break;
        case 'weapons.yaml':
          tableData = data.weapons.weapons;
          title = 'Weapons';
          break;
        case 'traits.yaml':
          // Flatten trait groups
          tableData = data.traits.trait_groups.flatMap((group) =>
            group.traits.map((trait) => ({
              ...trait,
              group: group.name,
              groupId: group.id, // Include group ID for row ID generation
              groupDescription: group.description, // Include description for metadata display
            }))
          );
          title = 'Traits';
          break;
        case 'core_abilities.yaml':
          tableData = data.coreAbilities.core_abilities;
          title = 'Core Abilities';
          break;
        case 'class_abilities.yaml':
          // Flatten class abilities
          tableData = Object.entries(data.classAbilities.classes).flatMap(([classId, classData]: [string, any]) =>
            classData.abilities.map((ability: any) => ({
              ...ability,
              className: classData.name,
              classId: classId, // Include class ID for row ID generation
              classType: classData.type, // Include type for metadata display
              classAttributes: classData.attributes, // Include attributes for metadata display
              classSummary: classData.summary, // Include summary for metadata display
            }))
          );
          title = 'Class Abilities';
          break;
      }

      // Apply filtering if configured
      tableData = filterTableData(tableData, configSection.filter, configSection.sourceFile);

      if (tableData.length > 0) {
        // Check if we should split the table into groups
        if (configSection.splitBy && configSection.groupTitleField) {
          return renderGroupedTable(configSection, tableData, level, configSection.sourceFile, title);
        }

        // Render single table (existing behavior)
        const HeadingTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
        const headingSizes = {
          1: 'text-4xl font-bold',
          2: 'text-3xl font-bold',
          3: 'text-2xl font-bold',
          4: 'text-xl font-bold',
          5: 'text-lg font-bold',
          6: 'text-base font-bold',
        };
        const headingSize = headingSizes[level as keyof typeof headingSizes] || headingSizes[3];
        
        // Only create heading if showInNavigation is true (defaults to true for backward compatibility)
        const shouldShowInNavigation = configSection.showInNavigation !== false;
        
        return (
          <div key={configSection.id} className="mb-8 min-w-0">
            {shouldShowInNavigation && (
              <HeadingTag 
                id={configSection.id} 
                className={`${headingSize} mt-8 mb-3 font-cinzel text-text-primary`}
              >
                {title}
              </HeadingTag>
            )}
            <TabledRule
              data={tableData}
              visibleFields={configSection.visibleFields}
              title={title}
              sourceFile={configSection.sourceFile}
            />
          </div>
        );
      }
    }

    // Handle text sections
    const section = findSectionById(data.mainRules.sections, configSection.id);
    if (section) {
      return renderSection(section, level);
    }

    // Handle nested config sections
    if (configSection.children) {
    return (
      <div key={configSection.id} className="min-w-0">
        {configSection.children.map((child) => renderContentSection(child, level + 1))}
      </div>
    );
    }

    return null;
  };

  return (
    <div ref={contentRef} className="max-w-4xl mx-auto px-4 py-8 min-w-0">
      {data.contentConfig.sections
        .filter((section) => section.visible)
        .map((section) => renderContentSection(section))}
    </div>
  );
}

