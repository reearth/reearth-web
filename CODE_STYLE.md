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

- [Introduction](#intro)
- [Guidelines](#guidelines)
  - [Primary](#primary)
    - [React](#react)
    - [Functions](#functions)
    - [Variables](#variables)
    - [Commenting](#commenting)
    - [Atomic Design](#atomic)
    - [How to write paths](#paths)
  - [Secondary](#secondary)

## Introduction
---

For any development on Re:Earth's front-end, please follow the guidelines that follow. Our goal with this guide is to keep the source code as readable and clear as possible, as well as allow for new developers (both core and community) to be able to create high-quality PRs without too much headache.

*Note: Due to having eslint setup to catch quite a few syntax and code layout issues out of the box, we have not included those here. Please make sure your IDE is setup properly.*

## Guidelines
---

### Primary

#### React-specific

##### Hooks

- useMemo
- useCallback

#### Functions

##### Naming

- onXXXX vs handleXXXX
- Word order

#### Variables

##### Naming

#### Commenting

#### Atomic design

#### How to write paths

### Secondary

#### Destructuring

#### Spread and Rest syntax