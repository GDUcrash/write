import App from "../app";

type HistoryItem = {
    state: any,
    activeParagraph: number,
    globalKeys: number
};

type History = HistoryItem[];

export let history: History = [];
export let historyPosition = 0;

export function addHistoryItem (app: App) {
    history.splice(0, historyPosition);
    history.unshift({
        state: JSON.stringify(app.state), 
        activeParagraph: app.activeParagraph, 
        globalKeys: app.globalKeys
    });
    historyPosition = 0;
}

export function replaceHistoryItem (app: App) {
    history[0] = {
        state: JSON.stringify(app.state), 
        activeParagraph: app.activeParagraph, 
        globalKeys: app.globalKeys
    };
}

export function undo (app: App) {
    historyPosition++;
    historyPosition = Math.min(historyPosition, history.length-1);
    updateApp(app);
}

export function redo (app: App) {
    historyPosition--;
    historyPosition = Math.max(historyPosition, 0);
    updateApp(app);
}

export function clearHistory () {
    history = [];
    historyPosition = 0;
}

function updateApp (app: App) {
    const currentItem = history[historyPosition];
    app.setState(JSON.parse(currentItem.state));
    app.activeParagraph = currentItem.activeParagraph;
    app.globalKeys = currentItem.globalKeys;
    app.render();
}