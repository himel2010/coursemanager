// components/PagePropertyComponent.jsx
"use client"

import { propertyDefinitions } from "@/lib/events/propertyDefinitions"

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
