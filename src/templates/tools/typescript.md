### TypeScript Guidelines

- **Strict Mode**: Enable strict mode in tsconfig.json for better type safety
- **Interface vs Type**: Use interfaces for object shapes, types for unions/primitives
- **Generic Constraints**: Use generic constraints for reusable type-safe functions
- **Utility Types**: Leverage built-in utility types (Pick, Omit, Partial, etc.)

```typescript
// Type-safe API response handling
interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
}

// Generic constraint example
function updateEntity<T extends { id: string }>(entity: T, updates: Partial<T>): T {
  return { ...entity, ...updates };
}
```

#### TypeScript-Specific Prompts

```bash
# TypeScript analysis
gemini -p "@src/ *.ts How can TypeScript usage be improved in this project?"

# Type safety audit
gemini -p "@src/ Find any TypeScript type safety issues or improvements"
```