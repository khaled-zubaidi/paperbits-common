import { OfflineOptions } from "./offlineOptions";
import { IObjectStorage, OfflineObjectStorage, SavingHandler } from "../persistence";
import { IInjector, IInjectorModule } from "../injection";
import { IToolButton } from "../ui";
import { IEventManager } from "../events";

export class UndoToolButton implements IToolButton {
    public iconClass: string = "paperbits-icon paperbits-undo-25";
    public title: string = "Undo";

    constructor(private readonly eventManager: IEventManager) { }

    public onActivate(): void {
        this.eventManager.dispatchEvent("onUndo");
    }
}

export class RedoToolButton implements IToolButton {
    public iconClass: string = "paperbits-icon paperbits-redo-26";
    public title: string = "Redo";

    constructor(private readonly eventManager: IEventManager) { }

    public onActivate(): void {
        this.eventManager.dispatchEvent("onRedo");
    }
}

/**
 * Module registering components required for offline work.
 */
export class OfflineModule implements IInjectorModule {
    constructor(private readonly options?: OfflineOptions) {
        this.register = this.register.bind(this);
    }

    public register(injector: IInjector): void {
        injector.bindToCollection("trayCommands", UndoToolButton);
        injector.bindToCollection("trayCommands", RedoToolButton);

        // injector.bindSingleton("offlineServiceWorker", OfflineServiceWorker);
        injector.bindSingleton("offlineObjectStorage", OfflineObjectStorage);

        const underlyingObjectStorage = injector.resolve<IObjectStorage>("objectStorage");

        injector.bindSingletonFactory<IObjectStorage>("objectStorage", (ctx: IInjector) => {
            const offlineObjectStorage = ctx.resolve<OfflineObjectStorage>("offlineObjectStorage");
            offlineObjectStorage.registerUnderlyingStorage(underlyingObjectStorage);
            offlineObjectStorage.autosave = this.options ? this.options.autosave : false;

            return offlineObjectStorage;
        });

        injector.bindToCollection("autostart", SavingHandler);
    }
}