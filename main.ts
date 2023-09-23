import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface NoosPluginSettings {
	solidFolder: string;
	webId: string;
}

const DEFAULT_SETTINGS: NoosPluginSettings = {
	solidFolder: 'https://spoggy-test2.solidcommunity.net/public/obsidian/',
	webId: 'https://spoggy-test2.solidcommunity.net/profile/card#me'
}

export default class NoosPlugin extends Plugin {
	settings: NoosPluginSettings;
	statusBarItemEl: HTMLSpanElement

	async onload() {
		await this.loadSettings();
		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		this.statusBarItemEl = this.addStatusBarItem();
		this.statusBarItemEl.setText('Status Bar Text');

		this.readActiveFileAndUpdateLineCount()

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Noos', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		const cloudOff = this.addRibbonIcon('cloud-off', 'Noos Connect', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('you arte connecting to Solid!');
		});
		// Perform additional things with the ribbon
		cloudOff.addClass('my-plugin-ribbon-class');



		const statusSolid = this.addStatusBarItem()
		statusSolid.setText("not logged")
		statusSolid.onClickEvent(() => {
			statusSolid.setText("logged")
		})


		// https://www.youtube.com/watch?v=AgXa03ZxJ88 8:00
		this.app.workspace.on('active-leaf-change', async () => {
			this.readActiveFileAndUpdateLineCount()
		})

		this.app.workspace.on('editor-change', async editor => {
			const content = editor.getDoc().getValue()
			this.updateLineCount(content)

		})






		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private updateLineCount(fileContent?: string) {
		const count = fileContent ? fileContent.split(/\r\n|\r|\n/).length : 0
		const linesWorld = count === 1 ? "line" : "lines"
		this.statusBarItemEl.setText(`${count} ${linesWorld}`)
	}

	private async readActiveFileAndUpdateLineCount() {
		const file = this.app.workspace.getActiveFile()
		if (file) {
			const content = await this.app.vault.read(file)
			console.log(content)
			this.updateLineCount(content)
		} else {
			this.updateLineCount(undefined)
		}
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: NoosPlugin;

	constructor(app: App, plugin: NoosPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Solid Folder')
			.setDesc('Where to store on Solid')
			.addText(text => text
				.setPlaceholder('https://spoggy-test2.solidcommunity.net/public/obsidian/')
				.setValue(this.plugin.settings.solidFolder)
				.onChange(async (value) => {
					this.plugin.settings.solidFolder = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Solid WebId')
			.setDesc('What is your WebId')
			.addText(text => text
				.setPlaceholder('https://spoggy-test2.solidcommunity.net/profile/card#me')
				.setValue(this.plugin.settings.webId)
				.onChange(async (value) => {
					this.plugin.settings.webId = value;
					await this.plugin.saveSettings();
				}));
	}
}
