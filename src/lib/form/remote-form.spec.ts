import { describe, expect, it } from 'vitest';
import { remoteSpreadPath } from '../field/spread-checks.js';
import { fieldPathKey, isWithinField, parseFieldPath, resolveFieldNode } from './remote-form.js';

describe('field paths', () => {
	it('parses and prints dotted and indexed paths', () => {
		expect(parseFieldPath('members[0].email')).toEqual(['members', 0, 'email']);
		expect(parseFieldPath('email')).toEqual(['email']);
		expect(parseFieldPath('members.0.email')).toEqual(['members', 0, 'email']);
		expect(fieldPathKey(['members', 0, 'email'])).toBe('members[0].email');
		expect(fieldPathKey(['tags', 1])).toBe('tags[1]');
	});

	it('scopes a path to itself and the paths below it', () => {
		expect(isWithinField('members[0].email', 'members')).toBe(true);
		expect(isWithinField('members[0]', 'members')).toBe(true);
		expect(isWithinField('membership', 'members')).toBe(false);
		expect(isWithinField('email', 'email')).toBe(true);
		expect(isWithinField('anything', '')).toBe(true);
	});

	it('walks a fields proxy by path', () => {
		const leaf = { value: () => 'x' };
		expect(resolveFieldNode({ members: [{ email: leaf }] }, ['members', 0, 'email'])).toBe(leaf);
		expect(resolveFieldNode({ members: [] }, ['members', 3, 'email'])).toBeUndefined();
		expect(resolveFieldNode(undefined, ['email'])).toBeUndefined();
	});
});

describe('remoteSpreadPath', () => {
	it('reads the path out of a name Kit built', () => {
		expect(remoteSpreadPath('email/abc')).toBe('email');
		expect(remoteSpreadPath('n:price[0]/abc')).toBe('price[0]');
		expect(remoteSpreadPath('b:agree/abc')).toBe('agree');
		expect(remoteSpreadPath('tags[]/abc')).toBe('tags');
		expect(remoteSpreadPath('a.b/form/with/slashes')).toBe('a.b');
	});

	it('ignores any other name', () => {
		expect(remoteSpreadPath('email')).toBeNull();
		expect(remoteSpreadPath('/abc')).toBeNull();
		expect(remoteSpreadPath(undefined)).toBeNull();
	});
});
