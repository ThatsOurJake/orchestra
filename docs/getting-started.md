---
title: Getting Started
position: 2
---

# Getting Started

## Setting up Chrome AI

The Chrome AI agent will download the first time you use it. This will take some time depending on your internet speed and take up roughly 10GB of space.

### Requirements

You must ensure the following:

1. Navigate to `chrome://flags/#prompt-api-for-gemini-nano` and set it to **Enabled**
2. Check if the model has downloaded under `chrome://on-device-internals`

For a more detailed guide, visit: [Chrome AI Getting Started Guide](https://developer.chrome.com/docs/ai/get-started)

## Default Agents

There are 3 default agents shipped with Orchestra:

- **Business Analyst**
- **Junior Developer**
- **Junior Tester**

These are used with the "Ticket Writer" example found in the repository.

Learn more about agents in [Creating Agents](/docs/creating-agents).

## Example Flows

The repository ships with example flows to help you get started:

### Ticket Writer

Uses all three default agents to work together on creating tickets.

### Hello World

Shows off a basic back and forth chat. This is a great starting point to understand how flows work.

## Next Steps

Now that you have Orchestra set up, you can:

- Learn how to create your own agents in [Creating Agents](/docs/creating-agents)
- Build custom workflows in [Creating Flows](/docs/creating-flows)
- Understand the expression language in [WTF is Lang?](/docs/lang)
