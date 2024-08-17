import { App, Plugin, TFile, moment } from 'obsidian';

export default class Tasks4TodayPlugin extends Plugin {
    async onload() {
        console.log('Loading Tasks4TodayPlugin');
        
        this.addCommand({
            id: 'transfer-old-tasks',
            name: 'Transfer Old Tasks to Today\'s Note',
            callback: () => this.transferOldTasks(),
        });

        console.log('Tasks4TodayPlugin loaded');
    }

    async transferOldTasks() {
        console.log('Starting task transfer...');
        const dailyNotes = await this.getDailyNotes();
        console.log(`Found ${dailyNotes.length} daily notes`);

        const today = moment().startOf('day');
        const todayNote = await this.getTodayNote();

        if (!todayNote) {
            console.error('Today\'s note not found');
            return;
        }
        console.log(`Today's note: ${todayNote.path}`);

        for (const file of dailyNotes) {
            if (file === todayNote) continue;

            console.log(`Processing file: ${file.path}`);
            const content = await this.app.vault.read(file);
            const tasks = this.extractOldTasks(content, today);

            console.log(`Found ${tasks.length} old tasks in ${file.path}`);
            if (tasks.length > 0) {
                await this.appendTasksToToday(todayNote, tasks, file.basename);
                console.log(`Appended ${tasks.length} tasks to today's note`);
            }
        }
        console.log('Task transfer complete');
    }

    async getDailyNotes(): Promise<TFile[]> {
        const dailyNotePlugin = this.app.internalPlugins.getPluginById('daily-notes');
        if (!dailyNotePlugin) {
            console.log('Daily notes plugin not found');
            return [];
        }

        const { folder, format } = dailyNotePlugin.instance.options;
        const dailyNotesFolder = folder || '/';

        console.log(`Daily notes folder: ${dailyNotesFolder}`);
        console.log(`Daily notes format: ${format}`);

        return this.app.vault.getMarkdownFiles().filter(file => {
            const filePath = file.path.split('/');
            return filePath[filePath.length - 2] === dailyNotesFolder && 
                   moment(file.basename, format, true).isValid();
        });
    }

    async getTodayNote(): Promise<TFile | null> {
        const dailyNotePlugin = this.app.internalPlugins.getPluginById('daily-notes');
        if (!dailyNotePlugin) {
            console.log('Daily notes plugin not found');
            return null;
        }

        const { folder, format } = dailyNotePlugin.instance.options;
        const filename = moment().format(format) + '.md';
        const filePath = folder ? `${folder}/${filename}` : filename;
        console.log(`Looking for today's note at: ${filePath}`);
        return this.app.vault.getAbstractFileByPath(filePath) as TFile;
    }

    extractOldTasks(content: string, today: moment.Moment): string[] {
        const lines = content.split('\n');
        const tasks: string[] = [];
        let isInCodeBlock = false;

        for (const line of lines) {
            if (line.startsWith('```')) {
                isInCodeBlock = !isInCodeBlock;
            }

            if (!isInCodeBlock && line.trim().startsWith('- [ ]')) {
                const taskDate = this.extractDateFromTask(line);
                if (taskDate && taskDate.isBefore(today)) {
                    tasks.push(line);
                }
            }
        }

        return tasks;
    }

    extractDateFromTask(taskLine: string): moment.Moment | null {
        // This is a placeholder implementation. Adjust according to your date format.
        const dateMatch = taskLine.match(/\d{4}-\d{2}-\d{2}/);
        if (dateMatch) {
            console.log(`Found date in task: ${dateMatch[0]}`);
            return moment(dateMatch[0]);
        }
        return null;
    }

    async appendTasksToToday(todayNote: TFile, tasks: string[], sourceFileName: string) {
        const content = await this.app.vault.read(todayNote);
        const newContent = content + '\n\n## Tasks from ' + sourceFileName + '\n' + tasks.join('\n');
        await this.app.vault.modify(todayNote, newContent);
        console.log(`Appended ${tasks.length} tasks from ${sourceFileName} to today's note`);
    }
}
