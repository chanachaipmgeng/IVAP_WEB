# Testing Services

This folder contains services that are used only for testing, development, and quality assurance purposes.

## ⚠️ Important Notice

**These services should NOT be imported or used in production code.**

They are kept here for:
- Development and testing environments only
- QA and UAT processes
- Performance testing and benchmarking
- Security testing
- System integration testing

## Services in this folder:

### Testing Services
- `system-integration-testing.service.ts` - System integration testing utilities
- `security-testing.service.ts` - Security testing and vulnerability scanning
- `user-acceptance-testing.service.ts` - UAT testing utilities
- `performance-testing.service.ts` - Performance testing and benchmarking

### Deployment Services
- `deployment-preparation.service.ts` - Deployment preparation utilities
- `production-readiness.service.ts` - Production readiness checks

### Documentation Services
- `documentation-completion.service.ts` - Documentation completion tracking

### Optimization Services
- `database-optimization.service.ts` - Database optimization utilities

## Usage

These services can be conditionally loaded based on environment:

```typescript
import { environment } from '@env/environment';

if (!environment.production) {
  // Load testing services
  import('./testing/services/performance-testing.service').then(...);
}
```

## Production Build

Make sure these services are excluded from production builds by:
1. Not importing them in production code
2. Using environment flags to conditionally load them
3. Tree-shaking will automatically remove unused imports

---

**Created:** November 16, 2025  
**Purpose:** Separate testing/development services from production code
