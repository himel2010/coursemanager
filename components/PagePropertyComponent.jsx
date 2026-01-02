// components/PagePropertyComponent.jsx
"use client"

import { propertyDefinitions } from "@/lib/events/propertyDefinitions"

/**
 * PagePropertyComponent - Dynamic Property Renderer
 *
 * Optimization:
 * 1. Dynamic component rendering based on property definitions
 * 2. No hardcoded logic - fully driven by propertyDefinitions
 * 3. Each property type has its own isolated component
 * 4. Only renders properties that exist in pageProperties
 *
 * Architecture:
 * - Iterates through pageProperties
 * - Looks up definition in propertyDefinitions
 * - Renders the appropriate component from definition.renderComponent
 * - Passes all necessary props to child component
 */
const PagePropertyComponent = ({ pageProperties, event }) => {
  if (!pageProperties || Object.keys(pageProperties).length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-2">
      {Object.entries(pageProperties).map(([key, value]) => {
        // Look up the property definition
        const definition = propertyDefinitions[key]

        // Skip if no definition found or no render component specified
        if (!definition || !definition.renderComponent) {
          // Fallback for properties without custom components
          return (
            <div key={key} className="grid grid-cols-[1fr_4fr] text-sm">
              <div className="font-medium text-muted-foreground">{key}</div>
              <div>{value?.toString() || "—"}</div>
            </div>
          )
        }

        // Get the component from the definition
        const PropertyComponent = definition.renderComponent

        // Render the property component
        return (
          <PropertyComponent
            key={key}
            propertyKey={key}
            value={value}
            event={event}
            pageProperties={pageProperties}
            definition={definition}
          />
        )
      })}
    </div>
  )
}

export default PagePropertyComponent
