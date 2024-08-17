import { App, Plugin, TFile, PluginManifest } from 'obsidian';

export default class Tasks4Today extends Plugin {
    constructor(app: App, manifest: PluginManifest) {
        super(app, manifest);
    }

    async onload() {
        console.log('Loading Tasks4Today plugin');

        this.app.workspace.onLayoutReady(() => {
            if (this.isDailyNotesEnabled()) {
                console.log('Daily notes functionality is available');
                // Your logic for working with daily notes
            } else {
                console.log('Daily notes functionality is not available');
            }
        });

        // Add your commands and other functionality here
        this.addCommand({
            id: 'transfer-old-tasks',
            name: 'Transfer Old Tasks',
            callback: () => this.transferOldTasks(),
        });
    }

    isDailyNotesEnabled(): boolean {
        // Check if the daily notes functionality is available
        // This checks for the existence of the getDailyNote function
        return 'getDailyNote' in this.app.workspace;
    }

    async transferOldTasks() {
        // Implement your task transfer logic here
        console.log('Transferring old tasks');
        // You'll need to implement the logic to find old tasks and move them
        // This might involve searching through files, parsing their content, etc.
    }

    onunload() {
        console.log('Unloading Tasks4Today plugin');
    }
}