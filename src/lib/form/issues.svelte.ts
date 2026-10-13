// Which source issues are visible, and when Form asks the source to validate again.
// Kit's public issues carry no server flag, so server issues are told apart by when they
// arrived: the ones present at mount or when a server round trip ends.

import { untrack } from 'svelte';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import { allIssues, pathKey, type FieldHandle, type FormIssue, type FormSource } from './source.js';
import type { FormValidationMode } from './types.js';

/** What a Field claims: the issue path it shows, and whether it found it through `name`. */
interface Claim {
	key: string;
	byName: boolean;
}

function messages(issues: readonly FormIssue[] | undefined): string[] {
	return issues?.map((issue) => issue.message) ?? [];
}

function issueId(issue: FormIssue) {
	return `${pathKey(issue.path)}\u0000${issue.message}`;
}

/** The path key a handle submits under: its `as()` name without Kit's type prefix, `[]` or form id. */
export function handlePath(handle: FieldHandle): string {
	const { name } = handle.as('hidden', '') as { name?: unknown };
	if (typeof name !== 'string') return '';
	return name
		.replace(/\/.*$/s, '')
		.replace(/^[nbi]:/, '')
		.replace(/\[\]$/, '');
}

/** One Form's issue state. Form owns it, each Field reads it through a `FieldIssues`. */
export class IssueSession {
	/** True after a submit attempt reached field validation, until reset. */
	private submittedLocally = $state(false);
	/** True once Form asked the source to validate fields the user has not reached. */
	aheadValidated = $state(false);
	private readonly fields = new SvelteSet<FieldIssues>();
	private readonly claims = new SvelteMap<object, Claim>();
	/** Issues present when the session started, which render before any submit (SSR, JS off). */
	private initial = $state.raw<readonly string[]>([]);
	private revalidateQueued = false;

	constructor(readonly getSource: () => FormSource | undefined) {
		this.initial = untrack(() => {
			const source = getSource();
			return source ? allIssues(source).map(issueId) : [];
		});
	}

	get source() {
		return this.getSource();
	}

	get submitted(): boolean {
		return this.submittedLocally || Boolean(this.source?.submitted);
	}

	/** A submit reached field validation. A field edited since the last round trip shows every issue again. */
	submitAttempted() {
		this.submittedLocally = true;
		for (const field of this.fields) field.forgetStaleSnapshot();
	}

	/** A server round trip ended. The issues each field holds now are server issues. */
	roundTripEnded() {
		for (const field of this.fields) field.takeSnapshot();
	}

	reset() {
		this.submittedLocally = false;
		this.aheadValidated = false;
		this.initial = [];
	}

	/** Re-runs the source's client validation for every field, once per microtask. */
	revalidate() {
		const source = this.source;
		if (!source || this.revalidateQueued) return;
		this.revalidateQueued = true;
		queueMicrotask(() => {
			this.revalidateQueued = false;
			this.aheadValidated = true;
			void source.validate({ all: true, preflightOnly: true });
		});
	}

	/** Issues no mounted Field shows, root issues included. Shown after a submit or when present at mount. */
	get unclaimedIssues(): FormIssue[] {
		const source = this.source;
		if (!source) return [];
		const claimed = Array.from(this.claims.values(), (claim) => claim.key);
		const submitted = this.submitted;
		return allIssues(source).filter(
			(issue) =>
				!claimed.includes(pathKey(issue.path)) &&
				(submitted || this.initial.includes(issueId(issue)))
		);
	}

	/** Paths Fields found through `name`. A misspelled one never claims its issues. */
	get nameClaims(): string[] {
		const keys: string[] = [];
		for (const claim of this.claims.values()) if (claim.byName) keys.push(claim.key);
		return keys;
	}

	/** Whether a registered Field has this Base `name`, so `errors[name]` already shows there. */
	isClaimed(key: string) {
		for (const claim of this.claims.values()) if (claim.key === key) return true;
		return false;
	}

	/** Registers a field's issue state and claim. Call from an effect, return the cleanup. */
	register(field: FieldIssues, claim: Claim | undefined) {
		const token = {};
		this.fields.add(field);
		if (claim) this.claims.set(token, claim);
		return () => {
			this.fields.delete(field);
			this.claims.delete(token);
		};
	}
}

interface Snapshot {
	/** The path the snapshot was taken for. A Field bound to another path has none. */
	path: string;
	messages: string[];
	/** The field's value changed after the snapshot, so its messages are stale. */
	changed: boolean;
}

export interface FieldIssuesOptions {
	binding: () => FieldHandle | undefined;
	path: () => string;
	validationMode: () => FormValidationMode;
	dirty: () => boolean;
	touched: () => boolean;
}

/**
 * One Field's view of the session. Server issues follow Base UI's clear-on-change rule:
 * hidden once the field's value changes, until the next round trip. Issues the source found
 * by validating ahead show by mode: `onChange` once dirty, `onBlur` once touched, and every
 * issue after a submit.
 */
export class FieldIssues {
	private snapshot = $state.raw<Snapshot | null>(null);

	constructor(
		private readonly session: IssueSession,
		private readonly options: FieldIssuesOptions
	) {
		untrack(() => this.takeSnapshot());
	}

	/** Messages the Field shows now. */
	get visible(): string[] {
		const binding = this.options.binding();
		if (!binding) return [];
		const current = messages(binding.issues());
		if (current.length === 0) return current;

		const snapshot = this.snapshot?.path === this.options.path() ? this.snapshot : null;
		const hideAhead = this.session.aheadValidated && !this.session.submitted && !this.reached();
		return current.filter((message) =>
			snapshot?.messages.includes(message) ? !snapshot.changed : !hideAhead
		);
	}

	private reached() {
		switch (this.options.validationMode()) {
			case 'onChange':
				return this.options.dirty();
			case 'onBlur':
				return this.options.touched();
			default:
				return false;
		}
	}

	markChanged() {
		const snapshot = this.snapshot;
		if (snapshot && !snapshot.changed) this.snapshot = { ...snapshot, changed: true };
	}

	takeSnapshot() {
		const binding = this.options.binding();
		this.snapshot = binding
			? { path: this.options.path(), messages: messages(binding.issues()), changed: false }
			: null;
	}

	forgetStaleSnapshot() {
		if (this.snapshot?.changed) this.snapshot = null;
	}

	clear() {
		this.snapshot = null;
	}
}
