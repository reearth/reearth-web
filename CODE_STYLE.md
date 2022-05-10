<!--

Before editing this document:

- Discuss any revisions, updates, or deletions with the Re:Earth core team prior to making a PR.
- Remember to update the table of contents if sections are added or removed.
- Use tables for side-by-side code samples. See below.

Code Samples (copied from uber's nice Golang style guide):

Use 2 spaces to indent. Horizontal real estate is important in side-by-side
samples.

For side-by-side code samples, use the following snippet.

~~~
<table>
<thead><tr><th>Bad</th><th>Good</th></tr></thead>
<tbody>
<tr><td>

```go
BAD CODE GOES HERE
```

</td><td>

```go
GOOD CODE GOES HERE
```

</td></tr>
</tbody></table>
~~~

(You need the empty lines between the <td> and code samples for it to be
treated as Markdown.)

If you need to add labels or descriptions below the code samples, add another
row before the </tbody></table> line.

~~~
<tr>
<td>DESCRIBE BAD CODE</td>
<td>DESCRIBE GOOD CODE</td>
</tr>
~~~

-->

# Re:Earth Front-end Style Guide

## Table of Contents

- [Introduction](#introduction)
- [Guidelines](#guidelines)
  - [React](#react)
  - [GraphQL](#graphql)
  - [Functions](#functions)
  - [Variables](#variables)
  - [Commenting](#commenting)
  - [Atomic Design](#atomic-design)
  - [How to write paths](#how-to-write-paths)
  - [Spacing and order](#spacing-and-order)
  - [Destructuring](#destructuring)
  - [Spread and Rest syntax](#spread-and-rest-syntax)

## Introduction
---

For any development on Re:Earth's front-end, please follow the guidelines that follow. Our goal with this guide is to keep the source code as readable and clear as possible, as well as allow for new developers (both core and community) to be able to create high-quality PRs without too much headache.

*Note: Due to having eslint setup to catch quite a few syntax and code layout issues out of the box, we have not included those here. Please make sure your IDE is setup properly.*

## Guidelines
---

### React

**useMemo**

Use to avoid unnecessary re-rendering of processed objects or variables, but only use it when computational cost is high (think **more than** `O(n)` in cost).

<table>
<thead><tr><th>Bad</th><th>Good</th></tr></thead>
<tbody>
<tr><td>

```TypeScript
const item = data?.find(d => d.id === id);
```

</td><td>

```TypeScript
const item = useMemo(() => {
  return data?.find(d => d.id === id);
}, [data, id]);
```

</td></tr>
</tbody></table>

**useCallback**

Use for MOST functions within a React component to better handle renders based on dependencies. Even if no dependencies, a useCallback will make sure React knows the function will always be the same, so don’t need to re-render

### GraphQL

Query and mutation exports should live inside the `src/gql/queries` directory only.  *Contents* of each file should be queries, followed by mutations. 

Naming of queries and mutations should be in PascalCase.

The exports should be named in uppercase, with underscores. 

<table>
<thead><tr><th>Bad</th><th>Good</th></tr></thead>
<tbody>
<tr><td>

```TypeScript
export const Import_Dataset = gql`
  mutation importAllDataset($file: Upload!, $sceneId: ID!, $datasetSchemaId: ID) {
    importDataset(input: { file: $file, sceneId: $sceneId, datasetSchemaId: $datasetSchemaId }) {
      datasetSchema {
        id
        name
      }
    }
  }
`;
```

</td><td>

```TypeScript
export const IMPORT_DATASET = gql`
  mutation ImportDataset($file: Upload!, $sceneId: ID!, $datasetSchemaId: ID) {
    importDataset(input: { file: $file, sceneId: $sceneId, datasetSchemaId: $datasetSchemaId }) {
      datasetSchema {
        id
        name
      }
    }
  }
`;
```

</td></tr>
</tbody></table>

### Functions

**Naming**

We have two styles when naming functions: `onXXXX` and `handleXXXX`. Note both are camelCase. We use `onXXXX` for functional props, and we use `handleXXXX` when we are locally declaring the function.

**Word order**

Should be `nounVerb`. Combining this with deliberate prop or export order keeps things very easy to read.

<table>
<thead><tr><th>Bad</th><th>Good</th></tr></thead>
<tbody>
<tr><td>

```TypeScript
onRemoveAsset
onHandleAddDataset
OnUpdatetheme
handleSyncDataset
updateProject
fetchuser
```

</td><td>

```TypeScript
onAssetAdd
onAssetRemove
onAssetUpdate

handleProjectAdd
handleProjectRemove
handleProjectUpdate
```

</td></tr>
</tbody></table>


### Variables

**Naming**

Descriptive over short. Context matters, of course, so generic code can and should have `name` instead of `teamName`. But typically `teamName` is preferable over `name`.

### Commenting

Follow Clean Code unless absolutely necessary. Which, in a nutshell, is "If you need a comment, either your function or variable isn't named appropriately, or your function is doing too much and should be broken down into simpler functions".

### Atomic design

Re:Earth is broken up into 4 component categories: `Pages`, `Organisms`, `Molecules` and `Atoms`. See the component directory's [README](https://github.com/reearth/reearth-web/blob/main/src/components/README.md) for details specific to Re:Earth.

### How to write paths

Unless heavily nested and used only in its own or its parent directory, start from the `@reearth/` alias for the src directory.

<table>
<thead><tr><th>Bad</th><th>Good</th></tr></thead>
<tbody>
<tr><td>

```TypeScript
import CoolComponent from "../../../../CoolComponent;
```

</td><td>

```TypeScript
import CoolComponent from "@reearth/components/atoms/CoolComponent;
```

</td></tr>
</tbody></table>

### Spacing and order

*NOTE: Often ESlint will catch spacing issues on save, but not always. Because of this, be mindful of your spacing as it affects the file's readability immensely. For order, ESlint will only fix import order.*

Since file content varies in size, complexity, whether it is a component or utility, hooks, etc., it is hard to set specific rules for spacing and order. We only ask that you be deliberate (and take time refactoring before opening a PR) and be open to suggestions on spacing or order during PR review to keep code as readable and accessible to new eyes as possible.

### Destructuring

When possible, use destructuring.

<table>
<thead><tr><th>Bad</th><th>Good</th></tr></thead>
<tbody>
<tr><td>

```TypeScript
const title = article[0]; 
const body = article[1]
const footer = article[2]
```

</td><td>

```TypeScript
const [title, body, footer] = getArticle()
```

</td></tr>
</tbody></table>

### Spread and Rest syntax

When possible use spread and rest syntax. If props, write `...props`, not `...rest` or another word.