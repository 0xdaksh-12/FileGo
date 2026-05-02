# Contributing to FileGo 🤝

First off, thank you for considering contributing to FileGo! It's people like you that make FileGo such a great tool.

## 🚀 Getting Started

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/FileGo.git
   cd FileGo
   ```
3. **Set up the environment**:
   ```bash
   make install
   cp server/.env.example server/.env
   ```
4. **Create a branch** for your feature or bugfix:
   ```bash
   git checkout -b feature/my-cool-feature
   ```

## 🛠️ Development Workflow

- Use `make dev` to run the stack.
- Follow the existing code style (Prettier is enforced via Husky).
- Write tests for new features.

## 🧪 Testing

Before submitting a PR, ensure all tests pass:
```bash
make test
```

## 📝 Commit Message Standards

We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `refactor:` for code changes that neither fix a bug nor add a feature
- `test:` for adding missing tests

## 📬 Submitting a Pull Request

1. **Push your changes** to your fork.
2. **Open a Pull Request** against the `main` branch.
3. Provide a clear description of the changes and link any relevant issues.

## 📜 Code of Conduct

Please be respectful and professional in all interactions.

---
Happy Coding! 🚀
