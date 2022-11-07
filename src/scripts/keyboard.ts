const keys: Set<string> = new Set();
const shortcuts: { keys: string[], func: Function, args: any[] }[] = [];

document.addEventListener('keydown', e => {
    if (keys.has(e.key)) return;
    keys.add(e.key);
    const sorted = Array.from(keys).sort();
    const targetShortcut = shortcuts.filter(f => f.keys.join() == sorted.join())[0];
    if (targetShortcut) {
        targetShortcut.func(...targetShortcut.args);
        e.preventDefault();
    }
});
document.addEventListener('keyup', e => {
    keys.delete(e.key);
});
window.addEventListener('blur', () => {
    keys.clear();
});
window.addEventListener('focus', () => {
    keys.clear();
});

export function addShortcut (keys: string[], func: Function, ...args: any[]) {
    shortcuts.push({ keys, func, args });
}

export function getKeys () {
    return Array.from(keys).sort();
}