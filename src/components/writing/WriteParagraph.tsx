import { Component, createRef } from "preact";
import { JSXInternal } from "preact/src/jsx";
import ReactMarkdown from "react-markdown";
import App from "../../app";
import { addHistoryItem, replaceHistoryItem } from "../../scripts/history";
import "./WriteParagraph.css";

type WriteParagraphProps = {
    parent: App,
    editing: boolean,
    text: string,
    index: number
}

export default class WriteParagraph extends Component<WriteParagraphProps> {

    viewingElem = (text: string) => <ReactMarkdown>{text}</ReactMarkdown>;

    editingElem = (text: string) => <textarea 
        className="write-area-input" value={text} 
        onInput={e => {
            this.update((e.target as any).value);
        }}
        onKeyDown={this.handleKeys}
        onKeyUp={e => {
            switch (e.key) {
                case 'Shift':   this.modifiers.shift = false; break;
                case 'Control': this.modifiers.shift = false; break;
                case 'Alt':     this.modifiers.shift = false; break;
            }
        }}
        onBlur={() => this.setViewing()}
        ref={this.textareaRef}
    />;

    textareaRef = createRef();
    modifiers = {
        shift: false,
        ctrl:  false,
        alt:   false
    }
    
    throttle = 0;

    render () {
        this.focus();
        return <div className="write-container" onMouseDown={() => this.setEditing()}>
            { this.props.editing ? this.editingElem(this.props.text) : this.viewingElem(this.props.text) }
        </div>;
    }

    setEditing () {
        this.props.parent.moveToParagraph(this.props.index);
        this.updateSize();
    }

    setViewing () {
        this.props.parent.unfocusParagraph();
    }

    update (text: string) {
        this.props.parent.state.paragraphs[this.props.index].text = text;
        this.updateSize();

        if (this.throttle <= 0) {
            addHistoryItem(this.props.parent);
            this.throttle = 20;
        } else {
            replaceHistoryItem(this.props.parent);
            this.throttle--;
        }
    }

    updateSize () {
        if (this.textareaRef.current) {
            this.textareaRef.current.style.height = 0;
            this.textareaRef.current.style.height = this.textareaRef.current.scrollHeight + "px";
        }
    }

    handleKeys = (e: JSXInternal.TargetedKeyboardEvent<HTMLTextAreaElement>) => {
        switch (e.key) {
            case 'Enter': {
                if (this.isAtBottom(this.textareaRef.current) && !this.modifiers.shift) {
                    this.props.parent.addParagraphAfter(this.props.index);
                    e.preventDefault();
                }
                break;
            }

            case 'ArrowRight':
            case 'ArrowDown': {
                if (this.isAtBottom(this.textareaRef.current)) {
                    this.props.parent.moveToParagraph(this.props.index+1);
                }
                break;
            }

            case 'ArrowLeft':
            case 'ArrowUp': {
                if (this.isAtTop(this.textareaRef.current)) {
                    this.props.parent.moveToParagraph(this.props.index-1);
                }
                break;
            }

            case 'Escape': {
                this.props.parent.unfocusParagraph();
                break;
            }

            case 'Backspace': {
                if (this.isAtTop(this.textareaRef.current)) {
                    if (this.isAtBottom(this.textareaRef.current))
                        this.props.parent.deleteParagraph(this.props.index, true, -1);
                    else
                        this.props.parent.mergeParagraphs(this.props.index-1, this.props.index);
                }
                break;
            }

            case 'Delete': {
                if (this.isAtBottom(this.textareaRef.current)) {
                    if (this.isAtTop(this.textareaRef.current))
                        this.props.parent.deleteParagraph(this.props.index, true, 0);
                    else
                        this.props.parent.mergeParagraphs(this.props.index, this.props.index+1);
                }
                break;
            }

            case 'Shift':   this.modifiers.shift = true; break;
            case 'Control': this.modifiers.shift = true; break;
            case 'Alt':     this.modifiers.shift = true; break;
        }
    }

    isAtBottom (ref: any) {
        return ref.selectionStart == ref.selectionEnd && ref.selectionStart == ref.value.length;
    }

    isAtTop (ref: any) {
        return ref.selectionStart == ref.selectionEnd && ref.selectionStart == 0;
    }

    focus () {
        setTimeout(() => {
            if (this.props.editing) this.textareaRef.current?.focus();
            this.updateSize();
        }, 1);
    }

}