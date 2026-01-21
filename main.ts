import { Plugin, WorkspaceLeaf } from "obsidian";

export default class ReleaseNotesCloserPlugin extends Plugin {
	async onload() {
		console.log("Release Notes Closer plugin loaded");

		// Check existing leaves on startup (in case plugin loads after release notes opened)
		this.app.workspace.onLayoutReady(() => {
			this.closeReleaseNotesLeaves();
		});

		// Listen for new leaves being created
		this.registerEvent(
			this.app.workspace.on("layout-change", () => {
				this.closeReleaseNotesLeaves();
			})
		);

		// Also check when active leaf changes
		this.registerEvent(
			this.app.workspace.on("active-leaf-change", () => {
				this.closeReleaseNotesLeaves();
			})
		);
	}

	onunload() {
		console.log("Release Notes Closer plugin unloaded");
	}

	private closeReleaseNotesLeaves() {
		const leaves = this.app.workspace.getLeavesOfType("markdown");

		for (const leaf of leaves) {
			if (this.isReleaseNotesLeaf(leaf)) {
				console.log("Closing release notes tab");
				leaf.detach();
				return; // Exit after closing to avoid iteration issues
			}
		}

		// Also check all leaves regardless of type, as release notes might have a special type
		this.app.workspace.iterateAllLeaves((leaf: WorkspaceLeaf) => {
			if (this.isReleaseNotesLeaf(leaf)) {
				console.log("Closing release notes tab (from iterate)");
				leaf.detach();
			}
		});
	}

	private isReleaseNotesLeaf(leaf: WorkspaceLeaf): boolean {
		try {
			// Method 1: Check the view type - Obsidian uses "release-notes" for this
			const viewType = leaf.view?.getViewType();
			if (viewType === "release-notes") {
				return true;
			}

			// Method 2: Check display text in the tab header
			// Release notes tab shows "Release Notes [version]" pattern
			const displayText = leaf.getDisplayText();
			if (displayText && /^Release Notes\s*\d/i.test(displayText)) {
				return true;
			}

			// Method 3: Check the view's state/data if available
			const state = leaf.view?.getState();
			if (state) {
				// Check if it's related to release notes or changelog
				const stateStr = JSON.stringify(state).toLowerCase();
				if (
					stateStr.includes("release") &&
					stateStr.includes("notes")
				) {
					return true;
				}
				if (stateStr.includes("changelog")) {
					return true;
				}
			}

			// Method 4: Check the container element for changelog links
			const containerEl = leaf.view?.containerEl;
			if (containerEl) {
				// Look for the changelog link that's specific to release notes
				const changelogLink = containerEl.querySelector(
					'a[href*="obsidian.md/changelog"]'
				);
				if (changelogLink) {
					return true;
				}

				// Check if the content mentions release notes prominently
				const text = containerEl.textContent || "";
				if (
					text.includes("obsidian.md/changelog") ||
					(text.toLowerCase().includes("release notes") &&
						text.toLowerCase().includes("what's new"))
				) {
					return true;
				}
			}

			return false;
		} catch (e) {
			// If we encounter any error checking a leaf, just skip it
			console.error("Error checking leaf:", e);
			return false;
		}
	}
}
