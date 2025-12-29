# Contributing to Toy Marketplace India

Thank you for your interest in contributing to Toy Marketplace India! 🧸🇮🇳

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Harassment, trolling, or discriminatory comments
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

## Getting Started

### Prerequisites

- Node.js 20+
- PNPM 8+
- PostgreSQL 16+
- Redis 7+
- Docker (optional)

### Fork and Clone

1. Fork the repository
2. Clone your fork:
```bash
git clone https://github.com/YOUR_USERNAME/toy-marketplace-india.git
cd toy-marketplace-india
```

3. Add upstream remote:
```bash
git remote add upstream https://github.com/harikapadia999/toy-marketplace-india.git
```

## Development Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup Environment Variables

```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Setup Database

```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Run migrations
pnpm db:migrate

# Seed database (optional)
pnpm db:seed
```

### 4. Start Development Servers

```bash
# Start all services
pnpm dev

# Or start individually
pnpm dev:web    # Web frontend
pnpm dev:api    # API backend
pnpm dev:mobile # Mobile app
```

## How to Contribute

### Types of Contributions

1. **Bug Fixes** - Fix existing bugs
2. **Features** - Add new features
3. **Documentation** - Improve docs
4. **Tests** - Add or improve tests
5. **Performance** - Optimize code
6. **Refactoring** - Improve code quality

### Contribution Workflow

1. **Create an Issue** (if one doesn't exist)
2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

3. **Make Changes**
   - Write clean, readable code
   - Follow coding standards
   - Add tests
   - Update documentation

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Define proper types (avoid `any`)
- Use interfaces for object shapes

### Code Style

- Use Prettier for formatting
- Use ESLint for linting
- Follow existing code patterns
- Write self-documenting code

### Naming Conventions

- **Files**: kebab-case (`user-profile.tsx`)
- **Components**: PascalCase (`UserProfile`)
- **Functions**: camelCase (`getUserProfile`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Types/Interfaces**: PascalCase (`UserProfile`)

### File Structure

```
apps/
  web/
    src/
      components/    # Reusable components
      pages/        # Next.js pages
      lib/          # Utilities
      hooks/        # Custom hooks
      contexts/     # React contexts
      types/        # TypeScript types
  api/
    src/
      routes/       # API routes
      lib/          # Utilities
      middleware/   # Middleware
      types/        # TypeScript types
```

## Testing Guidelines

### Unit Tests

```bash
pnpm test
```

- Test individual functions/components
- Mock external dependencies
- Aim for 80%+ coverage

### Integration Tests

```bash
pnpm test:integration
```

- Test API endpoints
- Test database operations
- Test service integrations

### E2E Tests

```bash
pnpm test:e2e
```

- Test complete user flows
- Test critical paths
- Test cross-browser compatibility

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest';

describe('UserProfile', () => {
  it('should render user name', () => {
    // Arrange
    const user = { name: 'John Doe' };
    
    // Act
    const { getByText } = render(<UserProfile user={user} />);
    
    // Assert
    expect(getByText('John Doe')).toBeInTheDocument();
  });
});
```

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Tests pass (`pnpm test`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Type checking passes (`pnpm type-check`)
- [ ] Documentation updated
- [ ] Commit messages follow convention

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

**Examples:**
```
feat(auth): add social login
fix(cart): resolve quantity update bug
docs(readme): update installation steps
```

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass
```

### Review Process

1. **Automated Checks** - CI/CD runs tests
2. **Code Review** - Maintainers review code
3. **Feedback** - Address review comments
4. **Approval** - Get approval from maintainers
5. **Merge** - Maintainers merge PR

## Issue Guidelines

### Creating Issues

Use issue templates:
- **Bug Report** - Report bugs
- **Feature Request** - Suggest features
- **Question** - Ask questions

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 120]
- Version: [e.g. 1.0.0]
```

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Description of the problem

**Describe the solution**
How should it work?

**Describe alternatives**
Other solutions considered

**Additional context**
Any other information
```

## Development Tips

### Hot Reload

All services support hot reload:
- Web: Automatic refresh
- API: Nodemon restart
- Mobile: Expo fast refresh

### Debugging

**VS Code:**
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug API",
  "program": "${workspaceFolder}/apps/api/src/index.ts",
  "runtimeArgs": ["-r", "ts-node/register"],
  "env": {
    "NODE_ENV": "development"
  }
}
```

**Chrome DevTools:**
- Web: Built-in React DevTools
- API: Node.js inspector

### Performance

- Use React.memo for expensive components
- Implement pagination for large lists
- Use lazy loading for images
- Optimize database queries
- Use caching where appropriate

## Community

### Communication Channels

- **GitHub Issues** - Bug reports, features
- **GitHub Discussions** - Questions, ideas
- **Email** - dev@toymarketplace.in

### Getting Help

- Check existing issues
- Read documentation
- Ask in discussions
- Contact maintainers

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Toy Marketplace India!** 🧸🇮🇳

For questions, contact: dev@toymarketplace.in
