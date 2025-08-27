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
  
  // Handle case where body might be an object or other unexpected type
  if (typeof body !== 'string' && !Array.isArray(body)) {
    console.warn('Unexpected body type:', body);
    return null;
  }
  
  // If body is an array, render each item as a separate paragraph
  if (Array.isArray(body)) {
    return (
      <React.Fragment>
        {body.map((item, index) => {
          // Handle case where item might be an object or invalid type
          if (typeof item !== 'string') {
            console.warn('Invalid body item type:', item);
            return null;
          }
          
          // Skip empty strings
          if (!item.trim()) {
            return null;
          }
          
          return (
            <p key={index} style={{ marginBottom: '1em' }}>
              {renderContent(item)}
            </p>
          );
        })}
      </React.Fragment>
    );
  }
  
  // If body is a string, render as a single paragraph
  if (typeof body === 'string') {
    return <p>{renderContent(body)}</p>;
  }
  
  // Handle unexpected types gracefully
  console.warn('Unexpected body type:', body);
  return null;
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
  
  // Handle case where body might be an object or other unexpected type
  if (typeof body !== 'string' && !Array.isArray(body)) {
    console.warn('Unexpected body type:', body);
    return null;
  }
  
  // If body is an array, render each item separately
  if (Array.isArray(body)) {
    return (
      <React.Fragment>
        {body.map((item, index) => {
          // Handle case where item might be an object or invalid type
          if (typeof item !== 'string') {
            console.warn('Invalid body item type:', item);
            return null;
          }
          
          // Skip empty strings
          if (!item.trim()) {
            return null;
          }
          
          return (
            <React.Fragment key={index}>
              {renderContent(item)}
            </React.Fragment>
          );
        })}
      </React.Fragment>
    );
  }
  
  // If body is a string, render as-is
  if (typeof body === 'string') {
    return renderContent(body);
  }
  
  // Handle unexpected types gracefully
  console.warn('Unexpected body type:', body);
  return null;
}
