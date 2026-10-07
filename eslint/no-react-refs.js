/**
 * Reject React element and lifecycle refs in Svelte source.
 *
 * Element access is `let el = $state()` plus `bind:this={el}`.
 * Element side effects are `{@attach}` or `createAttachmentKey`.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
const rule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Disallow React-style refs. Hold elements with $state and bind:this, and run element side effects with attachments.'
		},
		schema: [],
		messages: {
			reactRef:
				'Svelte has no React refs. Hold an element with `let el = $state()` and `bind:this={el}`. Run element side effects with `{@attach}` or `createAttachmentKey`.'
		}
	},
	create(context) {
		const factories = new Set(['useRef', 'createRef', 'forwardRef']);
		/** Local names bound to `useRef` / `createRef` / `forwardRef`, including aliases. */
		const factoryLocals = new Set();

		/**
		 * @param {unknown} node
		 * @returns {string | null}
		 */
		function nameOf(node) {
			if (!node || typeof node !== 'object') return null;
			const value =
				/** @type {{ type?: string, name?: string, value?: unknown, expressions?: unknown[], quasis?: { value?: { cooked?: string | null } }[] }} */ (
					node
				);
			if (
				value.type === 'Identifier' ||
				value.type === 'SvelteName' ||
				value.type === 'PrivateIdentifier'
			) {
				return typeof value.name === 'string' ? value.name : null;
			}
			if (
				value.type === 'Literal' &&
				(typeof value.value === 'string' || typeof value.value === 'number')
			) {
				return String(value.value);
			}
			if (
				value.type === 'TemplateLiteral' &&
				value.expressions?.length === 0 &&
				value.quasis?.length === 1
			) {
				return value.quasis[0]?.value?.cooked ?? null;
			}
			return null;
		}

		/**
		 * `elementRef` / `formRef` / `controlRef` / `submitCountRef`, and the bare React `ref`.
		 * @param {string | null} name
		 */
		function isRefBagName(name) {
			return name === 'ref' || (name != null && /Ref$/.test(name));
		}

		/**
		 * @param {unknown} node
		 */
		function unwrap(node) {
			let current = /** @type {{ type?: string, expression?: unknown } | null} */ (node);
			while (
				current &&
				(current.type === 'TSAsExpression' ||
					current.type === 'TSSatisfiesExpression' ||
					current.type === 'TSNonNullExpression' ||
					current.type === 'TSTypeAssertion' ||
					current.type === 'ChainExpression' ||
					current.type === 'ParenthesizedExpression')
			) {
				current = /** @type {{ type?: string, expression?: unknown }} */ (current.expression);
			}
			return current;
		}

		/**
		 * @param {unknown} node
		 */
		function unwrapType(node) {
			let current = /** @type {{ type?: string, typeAnnotation?: unknown } | null} */ (node);
			while (current && current.type === 'TSParenthesizedType') {
				current = /** @type {{ type?: string, typeAnnotation?: unknown }} */ (
					current.typeAnnotation
				);
			}
			return current;
		}

		/**
		 * A mutable `{ current: ... }` bag, including `get current()`.
		 * @param {unknown} node
		 */
		function hasCurrentMember(node) {
			const value = unwrap(unwrapType(node));
			if (!value || typeof value !== 'object') return false;
			if (value.type === 'ObjectExpression') {
				const properties = /** @type {{ properties?: { type?: string, key?: unknown }[] }} */ (
					value
				).properties;
				return (
					properties?.some((prop) => prop.type === 'Property' && nameOf(prop.key) === 'current') ??
					false
				);
			}
			if (value.type === 'TSTypeLiteral') {
				const members = /** @type {{ members?: { type?: string, key?: unknown }[] }} */ (value)
					.members;
				return (
					members?.some(
						(member) =>
							(member.type === 'TSPropertySignature' || member.type === 'TSMethodSignature') &&
							nameOf(member.key) === 'current'
					) ?? false
				);
			}
			return false;
		}

		/**
		 * @param {unknown} node
		 * @returns {string | null}
		 */
		function bagName(node) {
			const value = unwrap(node);
			if (!value || typeof value !== 'object') return null;
			if (value.type === 'Identifier') return nameOf(value);
			if (value.type === 'MemberExpression') {
				return nameOf(/** @type {{ property?: unknown }} */ (value).property);
			}
			return null;
		}

		/**
		 * @param {{ type?: string, callee?: { type?: string, name?: string } } | null | undefined} node
		 */
		function isPropsCall(node) {
			return Boolean(
				node &&
				node.type === 'CallExpression' &&
				node.callee?.type === 'Identifier' &&
				node.callee.name === '$props'
			);
		}

		/**
		 * @param {import('estree').Node} node
		 */
		function report(node) {
			context.report({ node, messageId: 'reactRef' });
		}

		/**
		 * @param {unknown} pattern
		 */
		function reportRefBindings(pattern) {
			if (!pattern || typeof pattern !== 'object') return;
			if (/** @type {{ type?: string }} */ (pattern).type !== 'ObjectPattern') return;
			const properties =
				/** @type {{ properties?: { type?: string, key?: import('estree').Node }[] }} */ (pattern)
					.properties;
			for (const prop of properties ?? []) {
				if (prop.type === 'Property' && nameOf(prop.key) === 'ref' && prop.key) report(prop.key);
			}
		}

		/**
		 * @param {import('estree').Node} node
		 */
		function isPublicRefType(node) {
			let current =
				/** @type {{ type?: string, id?: { name?: string }, init?: unknown, parent?: unknown } | undefined} */ (
					node.parent
				);
			while (current) {
				if (
					(current.type === 'TSInterfaceDeclaration' ||
						current.type === 'TSTypeAliasDeclaration') &&
					typeof current.id?.name === 'string'
				) {
					return /Props$/.test(current.id.name);
				}
				if (
					current.type === 'VariableDeclarator' &&
					isPropsCall(
						/** @type {{ type?: string, callee?: { type?: string, name?: string } }} */ (
							current.init
						)
					)
				) {
					return true;
				}
				current = /** @type {{ type?: string, parent?: unknown }} */ (current).parent;
			}
			return false;
		}

		return {
			ImportSpecifier(node) {
				const imported = nameOf(node.imported);
				if (imported && factories.has(imported)) {
					report(node);
					const local = nameOf(node.local);
					if (local) factoryLocals.add(local);
				}
			},
			ExportNamedDeclaration(node) {
				if (!node.source) return;
				for (const spec of node.specifiers) {
					if (spec.type !== 'ExportSpecifier') continue;
					if (factories.has(nameOf(spec.local) ?? '')) report(spec);
				}
			},
			'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator'(node) {
				if (node.id.type === 'Identifier' && node.id.name === 'ref') report(node.id);
			},
			FunctionDeclaration(node) {
				if (node.id && factories.has(node.id.name)) report(node.id);
			},
			CallExpression(node) {
				const callee = unwrap(node.callee);
				const name =
					callee && typeof callee === 'object' && callee.type === 'MemberExpression'
						? nameOf(/** @type {{ property?: unknown }} */ (callee).property)
						: nameOf(callee);
				if (!name) return;
				if (factories.has(name) || factoryLocals.has(name)) report(node.callee);
			},
			VariableDeclarator(node) {
				if (node.id.type === 'Identifier') {
					if (factories.has(node.id.name)) report(node.id);
					const typeNode =
						node.id.typeAnnotation &&
						/** @type {{ typeAnnotation?: unknown }} */ (node.id.typeAnnotation).typeAnnotation;
					if (
						isRefBagName(node.id.name) &&
						(hasCurrentMember(node.init) || hasCurrentMember(typeNode))
					) {
						report(node.id);
					}
				}
				if (node.id.type === 'ObjectPattern' && isRefBagName(bagName(node.init))) {
					for (const prop of node.id.properties) {
						if (prop.type === 'Property' && nameOf(prop.key) === 'current' && prop.key) {
							report(prop.key);
						}
					}
				}
				if (isPropsCall(node.init)) reportRefBindings(node.id);
			},
			Property(node) {
				if (node.parent?.type === 'ObjectPattern') return;
				const name = nameOf(node.key);
				if (isRefBagName(name) && hasCurrentMember(node.value)) report(node.key);
			},
			PropertyDefinition(node) {
				const name = nameOf(node.key);
				if (isRefBagName(name) && hasCurrentMember(node.value)) report(node.key);
			},
			AssignmentExpression(node) {
				const name = bagName(node.left);
				if (name && isRefBagName(name) && hasCurrentMember(node.right)) report(node.left);
			},
			MemberExpression(node) {
				const propertyName = node.computed
					? node.property.type === 'Literal'
						? nameOf(node.property)
						: null
					: nameOf(node.property);
				if (propertyName !== 'current') return;
				const name = bagName(node.object);
				if (name && isRefBagName(name)) report(node);
			},
			TSPropertySignature(node) {
				const name = nameOf(node.key);
				if (!name || !node.key) return;
				const typeNode =
					node.typeAnnotation &&
					/** @type {{ typeAnnotation?: unknown }} */ (node.typeAnnotation).typeAnnotation;
				if (isRefBagName(name) && hasCurrentMember(typeNode)) {
					report(node.key);
					return;
				}
				if (name === 'ref' && isPublicRefType(node)) report(node.key);
			},
			TSTypeAliasDeclaration(node) {
				if (isRefBagName(node.id.name) && hasCurrentMember(node.typeAnnotation)) report(node.id);
			},
			TSInterfaceDeclaration(node) {
				if (!isRefBagName(node.id.name)) return;
				const holdsCurrent = node.body.body.some(
					(member) =>
						(member.type === 'TSPropertySignature' || member.type === 'TSMethodSignature') &&
						nameOf(member.key) === 'current'
				);
				if (holdsCurrent) report(node.id);
			},
			SvelteAttribute(node) {
				if (nameOf(/** @type {{ key?: unknown }} */ (node).key) === 'ref') report(node);
			},
			SvelteShorthandAttribute(node) {
				if (nameOf(/** @type {{ key?: unknown }} */ (node).key) === 'ref') report(node);
			},
			JSXAttribute(node) {
				if (node.name.type === 'JSXIdentifier' && node.name.name === 'ref') report(node);
			}
		};
	}
};

export default rule;
