import React from 'react';

/**
 * Renders YAML body content consistently across the application.
 * If the body is an array (list), each item is rendered as a separate paragraph.
 * If the body is a string, it's rendered as-is.
 * 
 * @param body - The body content from YAML (string or string[])
 * @param renderContent - Function to render the actual content (e.g., with tooltips, wiki links)
 * @returns React element(s) representing the rendered content
 */
export function renderBodyContent(
  body: string | string[] | undefined,
  renderContent: (text: string) => React.ReactNode
): React.ReactNode {
  if (!body) return null;
  
  // If body is an array, render each item as a separate paragraph
  if (Array.isArray(body)) {
    return (
      <React.Fragment>
        {body.map((item, index) => (
          <p key={index} style={{ marginBottom: '1em' }}>
            {renderContent(item)}
          </p>
        ))}
      </React.Fragment>
    );
  }
  
  // If body is a string, render as a single paragraph
  return <p>{renderContent(body)}</p>;
}

/**
 * Renders YAML body content without wrapping in paragraph tags.
 * Useful for components that need to handle their own paragraph structure.
 * 
 * @param body - The body content from YAML (string or string[])
 * @param renderContent - Function to render the actual content
 * @returns React element(s) representing the rendered content
 */
export function renderBodyContentRaw(
  body: string | string[] | undefined,
  renderContent: (text: string) => React.ReactNode
): React.ReactNode {
  if (!body) return null;
  
  // If body is an array, render each item separately
  if (Array.isArray(body)) {
    return (
      <React.Fragment>
        {body.map((item, index) => (
          <React.Fragment key={index}>
            {renderContent(item)}
          </React.Fragment>
        ))}
      </React.Fragment>
    );
  }
  
  // If body is a string, render as-is
  return renderContent(body);
}
