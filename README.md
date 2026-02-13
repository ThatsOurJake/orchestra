# Orchestra

A visual workflow automation tool that enables the creation and execution of AI-powered agent flows through an intuitive node-based interface.

## Overview

Orchestra provides a flexible platform for designing and running automated workflows using AI agents. The application features a visual flow builder that allows users to construct complex logic chains through a node-based interface, similar to tools like n8n or Node-RED, but with a focus on AI agent orchestration.

### Architecture

The application is built with React and TypeScript, utilizing:

- **React Flow** for the visual node-based editor
- **Zustand** for state management
- **Chevrotain** for custom language parsing and interpretation
- **Vite** for build tooling and development server
- **TailwindCSS** for styling

## Getting Started

### Prerequisites

- Node.js (version 18 or higher recommended)
- pnpm package manager

### Installation

Clone the repository and install dependencies:

```bash
pnpm install
```

### Development

Start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:5173` (or the next available port).

### Building for Production

Create a production build:

```bash
pnpm build
```

Preview the production build locally:

```bash
pnpm preview
```

### Testing

Run the test suite:

```bash
pnpm test
```

### Code Quality

Format code:

```bash
pnpm format
```

Lint code:

```bash
pnpm lint
```
