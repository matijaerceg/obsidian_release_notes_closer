import { Plugin, WorkspaceLeaf, debounce } from "obsidian";

export default class ReleaseNotesCloserPlugin extends Plugin {
	private DEBUG = false; // Set to true for debugging

	// Debounced version to avoid excessive checks on rapid events
	private debouncedClose = debounce(
		() => this.closeReleaseNotesLeaves(),
		100,
		true
	);

	async onload() {
		if (this.DEBUG) console.log("Release Notes Closer plugin loaded");

		// Check existing leaves on startup (in case plugin loads after release notes opened)
		this.app.workspace.onLayoutReady(() => {
			this.closeReleaseNotesLeaves();
		});

		// Listen for new leaves being created
		this.registerEvent(
			this.app.workspace.on("layout-change", () => {
				this.debouncedClose();
			})
		);

		// Also check when active leaf changes
		this.registerEvent(
			this.app.workspace.on("active-leaf-change", () => {
				this.debouncedClose();
			})
		);
	}

	onunload() {
		if (this.DEBUG) console.log("Release Notes Closer plugin unloaded");
	}

	private closeReleaseNotesLeaves() {
		// Collect leaves to close first, then close them (avoids mutation during iteration)
		const leavesToClose: WorkspaceLeaf[] = [];

		// Check all leaves regardless of type
		this.app.workspace.iterateAllLeaves((leaf: WorkspaceLeaf) => {
			if (this.isReleaseNotesLeaf(leaf)) {
				leavesToClose.push(leaf);
			}
		});

		// Close collected leaves
		for (const leaf of leavesToClose) {
			if (this.DEBUG) console.log("Closing release notes tab");
			leaf.detach();
		}
	}

	private isReleaseNotesLeaf(leaf: WorkspaceLeaf): boolean {
		try {
			// Method 1: Check the view type - Obsidian uses "release-notes" for this
			// This is the most reliable method
			const viewType = leaf.view?.getViewType();
			if (viewType === "release-notes") {
				return true;
			}

			// Method 2: Check display text in the tab header
			// Release notes tab shows "Release Notes [version]" pattern (e.g., "Release Notes 1.5.0")
			const displayText = leaf.getDisplayText();
			if (displayText && /^Release Notes\s+\d+\.\d+/i.test(displayText)) {
				return true;
			}

			// Method 3: Check the container element for the specific changelog link
			// This is specific to Obsidian's release notes page
			const containerEl = leaf.view?.containerEl;
			if (containerEl) {
				// Look for the changelog link that's specific to release notes
				const changelogLink = containerEl.querySelector(
					'a[href="https://obsidian.md/changelog/"]'
				);
				if (changelogLink) {
					return true;
				}
			}

			return false;
		} catch (e) {
			// If we encounter any error checking a leaf, just skip it
			if (this.DEBUG) console.error("Error checking leaf:", e);
			return false;
		}
	}
}
