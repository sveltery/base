<script lang="ts">
	class Tabs {
		readOnValueChange(): ((value: string) => void) | undefined {
			return undefined;
		}
		get onValueChange() {
			return this.readOnValueChange();
		}
		activate(next: string) {
			this.onValueChange?.(next);
		}
	}
	void Tabs;
</script>
