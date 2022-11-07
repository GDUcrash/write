import App from "../app";
import { addHistoryItem, clearHistory } from "./history";

export let currentSaveTarget: FileSystemFileHandle | null = null;

export async function saveAs (app: App) {
    const text = createSaveString(app);

    const newFile = await window.showSaveFilePicker({
        types: [{
            description: 'Write file',
            accept: {
                'text/write': ['.write']
            }
        }],
        suggestedName: 'myDoc.write'
    });
    const stream = await newFile.createWritable();
    await stream.write(text);
    await stream.close();
    app.notif("Saved as new!", "success");

    currentSaveTarget = newFile;
}

export async function save (app: App) {
    if (!currentSaveTarget) await saveAs(app);
    else {
        const text = createSaveString(app);

        const stream = await currentSaveTarget.createWritable();
        await stream.write(text);
        await stream.close();
        app.notif("Saved!", "success");
    }
}

export async function exportMd (app: App) {
    const text = createMarkdownString(app);

    const newFile = await window.showSaveFilePicker({
        types: [{
            description: 'Markdown file',
            accept: {
                'text/markdown': ['.md']
            }
        }],
        suggestedName: 'myDoc.md'
    });
    const stream = await newFile.createWritable();
    await stream.write(text);
    await stream.close();
}

export async function load (app: App) {
    [currentSaveTarget] = await window.showOpenFilePicker({
        types: [{
            description: 'Write file',
            accept: {
                'text/write': ['.write']
            },
            multiple: false
        }]
    } as any);
    const fileData = await currentSaveTarget.getFile();
    const text = await fileData.text();
    loadSaveString(app, text);
}

export function newFile (app: App) {
    app.setState({ paragraphs: [{
        editing: false,
        key: 0,
        text: 'Begin Writing'
    }] });
    app.activeParagraph = -1;
    app.globalKeys = 1;
    clearHistory();
    setTimeout(() => addHistoryItem(app), 10);
}

export function loadSaveString (app: App, text: string) {
    try {
        const obj = JSON.parse(text);
        app.setState(obj.state);
        app.activeParagraph = obj.activeParagraph;
        app.globalKeys = obj.globalKeys;
        clearHistory();
        setTimeout(() => addHistoryItem(app), 10);
    } catch {
        app.notif("Error opening this file", "error");
    }
}

export function createSaveString (app: App) {
    const obj = {
        state: app.state,
        activeParagraph: app.activeParagraph,
        globalKeys: app.globalKeys
    }
    return JSON.stringify(obj);
}

export function createMarkdownString (app: App) {
    const items = app.state.paragraphs.map(m => m.text);
    return items.join('\n\n');
}