﻿import { IHyperlink } from "../permalinks/IHyperlink";
import { SelectionState } from "./selectionState";

export var formattableStates = ["bold", "italic", "underlined", "hyperlink", "h1", "h2", "h3", "h4", "h5", "h6",
    "quote", "code", "ol", "ul", "alignedLeft", "alignedRight", "alignedCenter", "justified"];

export interface ISelectionPosition {
    anchorKey: string;
    anchorOffset: number;
    focusKey: string;
    focusOffset: number;
}

export interface IHtmlEditor {
    attachToElement(element: HTMLElement): void;
    detachFromElement(): void;
    getSelectionState(): SelectionState;
    toggleBold(): void;
    toggleItalic(): void;
    toggleUnderlined(): void;
    toggleH1(): void;
    toggleH2(): void;
    toggleH3(): void;
    toggleH4(): void;
    toggleH5(): void;
    toggleH6(): void;
    toggleQuote(): void;
    toggleCode(): void;
    toggleSize(): void;
    toggleOrderedList(): void;
    toggleUnorderedList(): void;
    alignLeft(): void;
    alignCenter(): void;
    alignRight(): void;
    justify(): void;
    setTypegraphy(font: string): void;
    resetToNormal(): void;
    setHyperlink(hyperlink: IHyperlink, selectionPosition?: ISelectionPosition): void;
    setAnchor(hash: string, anchorKey: string): void
    removeAnchor(): void;
    removeHyperlink(): void;
    getHyperlink(): IHyperlink;
    setSelection(selection: Selection): void;
    expandSelection(): void;
    getState(): Object;
    setState(state: Object): void;
    getSelectionText(): string;
    increaseIndent(): void;
    decreaseIndent(): void;

    /* Events */
    addSelectionChangeListener(callback: () => void): void;
    removeSelectionChangeListener(callback: () => void): void;
}