---
title: Creating Flows
position: 4
---

# Creating Flows

Flows are created under [Flows](/flows) under the "Create Flow" tab. The editor allows the creation of nodes that can be linked together storing and passing data for connected nodes to consume.

**Important:** Each flow must have a "Starting Node" and at least one "Ending Node".

## Node Types

### Starting Node

This node is where the flow starts from. You can set it up to accept parameters which will be requested from the user when the flow is executed.

- **In connections:** None
- **Out connections:** One

### Create Agent Node

This node will take in the current stored agents and allow one of them to be selected. When this node is triggered during execution of the flow, the agent will be created with the prompt stored.

See [Creating Agents](/docs/creating-agents) for further details on agent creation.

- **In connections:** One
- **Out connections:** One

### Send Message to Agent

This node will send the contents of the node to the agent selected. The text area allows the inputting of any context variables from connected nodes as well as plain text.

For more information on interpolation, see [WTF is Lang?](/docs/lang) documentation.

- **In connections:** Multiple
- **Out connections:** One
- **Context output:** Stores text response

### Conditional

This node acts like an "if" statement and allows the checking of a condition. If true do x and if false do y.

The conditional node uses "Lang" to execute the statement and picking which branch to follow. Further reading in [WTF is Lang?](/docs/lang) documentation.

- **In connections:** Multiple
- **Out connections:** Two (one for true, one for false)

### Extract String

This node will allow the selection of an attached key that will be in context. Then providing a regex to be ran on that string.

Under the hood `RegEx.exec` is called providing an array group of matches.

#### Example Usage

A powerful regex that is used in the examples is:

```
/\`\`\`ticket\n([\s\S]*?)\n\`\`\`/
```

Note: "ticket" can be replaced with any word.

This will look for a markdown codeblock style:

````
```ticket
contents
```
````

This extracts both the whole block (index 0) and the contents (index 1). This allows the usage of the content as well as removing the message from the agent response.

The "Hello World" example has an example of this in action.

- **In connections:** Multiple
- **Out connections:** One
- **Context output:** Stores the result of `exec`

### Variable

This node allows the manual creation of an item inside of the flow context. This node is powerful in cases you want to create a loop and override the value inside of that loop.

Variable is also powerful when using the `%prev_output%` keyword. This will find the last node that would have outputted a value and use that value in its place.

The uses of this node can also be seen in the "Hello World" example.

**Note:** This node doesn't directly produce any output and therefore does not affect the `%prev_output%` value.

- **In connections:** One
- **Out connections:** One
- **Context output:** None (doesn't affect `%prev_output%`)

### Ask for User Input

This node will ask the user via an input modal, the question that is provided within the node. When the user has responded the flow will continue to execute as normal.

- **In connections:** Multiple
- **Out connections:** One
- **Context output:** The response to the question

### Output to Main

This node's sole responsibility is to write to the main output of the chat window. Whatever value is passed into the string will be displayed in the "Main Window" of the chat. This can be used for anything but is usually used for the final output of a flow.

[Lang](/docs/lang) can be used within this textarea.

#### Message Level

Each output node has a **Level** selector that controls the background colour of the message in the main window:

| Level | Colour |
|-------|--------|
| **Info** (default) | Blue |
| **Warning** | Yellow |
| **Error** | Red |

Existing flows that were saved before this feature was introduced will automatically use the **Info** level. Messages that are not produced by this node (e.g. user input confirmations) will have a plain white background.

- **In connections:** Multiple
- **Out connections:** One

### Ending Node

This node will allow the ending of a flow. Every flow must have at least one.

- **In connections:** Multiple
- **Out connections:** None
