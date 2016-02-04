## JSON as Trees

The crucial theoretical concept to *grok* for `JEQUEL` is the fact that all JSONs are treated like `tree`s.

Eg this JSON:

```js

[
	{
		k1: '1', k2: 'somedata', k3: [
			{id: 'a' e2a1: 'something a'}
			{id: 'b' e2a1: 'something b'}
			{id: 'c' e2a1: 'something c'}
		]
	},
	{
		k1: '2' k2: 'anothersomedata' k3: [
			{id: 'i' 	e2a1: 'something i'}
			{id: 'ii' 	e2a1: 'something ii'}
			{id: 'iii' 	e2a1: 'something iii'}
			{id: 'iv' 	e2a1: 'something iv'}
		]
	}
]
```

Can be represented as a tree with the following properties:

1. Arrays can be thought of as Objects having numeric keys.
2. A variable is a node.
3. A key is an edge.
4. Only String, Boolean, Number, Empty Array and Empty Object can be leaf nodes.

Graphically,

<img src="./docs/out/public/images/tree.svg" />

### JSON Pointer Notation

Any position in this tree can be specified with a JSON Pointer. For details consult [RFC6901](https://tools.ietf.org/html/rfc6901).

#### JSON Pointer extension.

Taking a cue from JSONPath, we have built a couple of extensions on JSON Pointer.

1. The wildcard `*` is used to match all keys.
2. The wildcard `$` is used to represent the root node of the JSON tree.
