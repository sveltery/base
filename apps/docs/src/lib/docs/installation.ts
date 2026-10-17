/** Base UI's `InstallationBlock/model.ts`: the tabs of an install command, in order. */
export const INSTALLATION_PACKAGE_MANAGERS = [
	{ value: 'pnpm', label: 'pnpm', command: 'add' },
	{ value: 'npm', label: 'npm', command: 'i' },
	{ value: 'yarn', label: 'yarn', command: 'add' },
	{ value: 'bun', label: 'bun', command: 'add' }
] as const;

export type InstallationPackageManager = (typeof INSTALLATION_PACKAGE_MANAGERS)[number];

export const getInstallCommand = (manager: InstallationPackageManager, name: string) =>
	`${manager.value} ${manager.command} ${name}`;
