---
title: WTF is Lang?
position: 5
---

# WTF is Lang?

"Lang" is the name of the expression language used within Orchestra.

## Playground

Under [Flows](/flows) there is a playground that allows you to experiment with the Lang language.

## Usage

Lang usage is different in certain cases:

### Inline Usage (with interpolation)

When wanting to use Lang expressions in a node like "Send message to agent" or "Output to main", you must surround the expression in `#`.

**Example:**
```
#EQ("true", "true")#
```

**Important:** Lang uses double speech marks not single.

### Direct Usage (without interpolation)

When using it in nodes like Variable or Conditional, because there isn't a need for interpolation, you can write the expression directly in the box.

## Two Core Concepts

Lang is made up of two different concepts: replacement and execution.

### Replacement

Replacement is the simplest. When typing `%context_key%` the whole statement is replaced if the value is found in context.

**This can be used in all input boxes.**

### Execution

Execution is used to run actions like code to get a value. When running this statement in a place where a message is constructed like "Send message to agent" or "Output to main", inline execution using `#` is needed.

When using it as conditional, variable value, or question input, there is no need for the `#` as it's not running inline.

## Lang Functions

The following are the current functions Lang can execute. The example flows contain many uses of Lang and can be used as reference.

### ARR

Get the index value from an inputted array.

**Usage:**
```
ARR(%arr_in_context%, 1)
```

**Arguments:**
- First argument: A key for context where the array is stored
- Second argument: The index

**Returns:** Indexed value or null

---

### EQ

Checks if a is equal to b.

**Usage:**
```
EQ(%foo%, "hello")
EQ("hello", "hello")
```

**Returns:** true or false

---

### NULL

Checks if the value is null.

**Usage:**
```
NULL(%foo%)
```

**Returns:** true or false

---

### NOT

Negates the value passed in. Particularly helpful for the conditional node to check "If NOT(NULL()) do this".

**Usage:**
```
NOT(true)
NOT(NULL(%foo%))
```

**Returns:** true or false

---

### TRIM

Trims the input value of un-needed whitespace.

**Usage:**
```
TRIM("HELLO     ")
```

**Returns:** A string

---

### REPL

Replaces within the inputted string.

**Usage:**
```
REPL("Hello", "lo", "no")
REPL("Hello", "lo", "no", "ig")
```

**Arguments:**
- Arg1: Input string
- Arg2: String to find (in this case find "lo")
- Arg3: Replace with
- Arg4: Flags - `i` (for ignore case), `g` (for all instances/global) [optional]

**Returns:** A string (e.g., "Helno")

---

### TODAY

Returns today's date. An optional format string can be passed to control the output. If no format is provided, the date is returned in ISO format (`yyyy-mm-dd`).

**Usage:**
```
TODAY()
TODAY("dd/mm/yyyy")
TODAY("dd-mm-yyyy")
TODAY("yyyy/mm/dd")
```

**Arguments:**
- Arg1: Format string [optional]. Composed of any combination of the following tokens along with any separator characters you like:

| Token | Description | Example |
|-------|-------------|---------|
| `dd` | Day with leading zero | `05` |
| `d` | Day without leading zero | `5` |
| `mm` | Month with leading zero | `03` |
| `m` | Month without leading zero | `3` |
| `yyyy` | Full 4-digit year | `2026` |
| `yy` | Short 2-digit year | `26` |

**Returns:** A string representing today's date

---

## Chaining Expressions

It's possible to chain Lang expressions together:

```
NOT(NULL(ARR(["hello"], 0)))
```

This will return `true` as the index 0 is not null.

## Context Variables

Lang also allows the usage of variables using `%context_key%`. These variables are replaced with their values from the flow context wherever they appear.
