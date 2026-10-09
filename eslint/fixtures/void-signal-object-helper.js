export function useOpen(read) {
	const { enabled } = read();
	return enabled;
}
