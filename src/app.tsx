import { Component, createRef } from 'preact';
import './app.css';
import NotificationManager from './components/notification/NotificationManager';
import WriteParagraph from './components/writing/WriteParagraph';
import { exportMd, load, newFile, save, saveAs } from './scripts/files';
import { addHistoryItem, redo, undo } from './scripts/history';
import { addShortcut } from './scripts/keyboard';

export default class App extends Component {

    state = {
        paragraphs: [{
            editing: false,
            key: 0,
            text: 'Begin Writing'
        }]
    }

    activeParagraph = -1;
    globalKeys = 1;

    notificationManagerRef = createRef();

    render () {
        return (
            <>
                <div className="ribbon">
                    <div className="ribbon-content">
                        <div className="ribbon-left">
                            <div className="ribbon-item" onClick={() => newFile(this)}>New</div>
                            <div className="ribbon-item" onClick={() => save(this)}>Save</div>
                            <div className="ribbon-item" onClick={() => saveAs(this)}>Save As</div>
                            <div className="ribbon-item" onClick={() => load(this)}>Load</div>
                        </div>
                        <div className="ribbon-right">
                            <div className="ribbon-item" onClick={() => undo(this)}>Undo</div>
                            <div className="ribbon-item" onClick={() => redo(this)}>Redo</div>
                            <div className="ribbon-item" onClick={() => exportMd(this)}>Export</div>
                        </div>
                    </div>
                </div>
                <div className="write-area">
                    { this.state.paragraphs.map((m, i) =>
                        <WriteParagraph parent={this} editing={m.editing} text={m.text} index={i} key={m.key} />
                    ) }
                </div>
                <NotificationManager ref={this.notificationManagerRef} />
                <div className="info">Alpha v0.1.0</div>
            </>
        );
    }

    componentDidMount() {
        addShortcut(['Control', 's'], save, this);
        addShortcut(['Control', 'S', 'Shift'], saveAs, this);
        addShortcut(['Control', 'o'], load, this);
        addShortcut(['Control', 'e'], exportMd, this);
        addShortcut(['Control', 'z'], undo, this);
        addShortcut(['Control', 'Shift', 'Z'], redo, this);
        addHistoryItem(this);
    }

    addParagraphAfter (index: number) {
        const paragraphs = this.state.paragraphs;
        if (this.activeParagraph >= 0) 
            paragraphs[this.activeParagraph].editing = false;
        paragraphs.splice(index+1, 0, { editing: true, key: this.globalKeys++, text: '' });
        this.setState({ paragraphs });
        this.setActiveParagraph(index+1);
        addHistoryItem(this);
    }

    moveToParagraph (index: number) {
        index = Math.max(0, Math.min(index, this.state.paragraphs.length-1));
        if (index != this.activeParagraph) 
            this.unfocusParagraph();
        this.setActiveParagraph(index);
    }

    unfocusParagraph () {
        if (this.activeParagraph >= 0) {
            const paragraphs = this.state.paragraphs;
            paragraphs[this.activeParagraph].editing = false;
            this.setState({ paragraphs });
        }
    }

    deleteParagraph (index: number, move: boolean = false, moveBy: number = 0) {
        const paragraphs = this.state.paragraphs;
        paragraphs.splice(index, 1);
        this.activeParagraph = -1;
        if (!paragraphs.length) 
            paragraphs.push({
                editing: false,
                key: 0,
                text: ''
            });
        this.setState({ paragraphs });
        if (move) this.setActiveParagraph(index+moveBy);
        addHistoryItem(this);
    }

    mergeParagraphs (target: number, source: number, swap: boolean = false) {
        const paragraphs = this.state.paragraphs;
        const sourceText = paragraphs[source]?.text || "";
        const targetText = paragraphs[target]?.text || "";
        let text = swap 
                     ? sourceText + ' ' + targetText 
                     : targetText + ' ' + sourceText;
        text = text.trim();
        const targetItem = paragraphs[target];

        paragraphs[target].text = text;
        paragraphs.splice(source, 1);

        this.activeParagraph = paragraphs.indexOf(targetItem);
        this.setState({ paragraphs });
        this.setActiveParagraph(this.activeParagraph);
        addHistoryItem(this);
    }

    protected setActiveParagraph (index: number) {
        setTimeout(() => {
            const paragraphs = this.state.paragraphs;

            if (this.activeParagraph >= 0) 
                paragraphs[this.activeParagraph].editing = false;
            paragraphs[index].editing = true;
            this.activeParagraph = index;

            this.setState({ paragraphs });
        }, 1);
    }

    notif (text: string, type?: string) {
        this.notificationManagerRef.current.addNotification(text, type);
    }

}
