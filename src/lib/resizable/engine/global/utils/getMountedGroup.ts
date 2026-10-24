import type { RegisteredGroup } from '../../components/group/types.js';
import { assert } from '../../utils/assert.js';
import { read } from '../mutableState.js';

export function getMountedGroup(group: RegisteredGroup) {
	const { mountedGroups } = read();

	const mountedGroup = mountedGroups.get(group);
	assert(mountedGroup, `Mounted Group ${group.id} not found`);

	return mountedGroup;
}
