// global.d.ts — put this at the project root

// allow any import so external lib types won't break JSX checking
declare module "*"

// loosen JSX props so components with strong TS types (shadcn, radix, etc.)
// won't force rare required props like `className`
declare namespace JSX {
    interface IntrinsicAttributes {
        className?: any
        variant?: any
        size?: any
        asChild?: any
        [key: string]: any
    }
}
