/**
 * LocalStorage Wrapper Providing Exception Handling Strategies
 */
export class StorageService {
    constructor(storageKey = 'sys_workspace_manifest') {
        this.storageKey = storageKey;
    }

    fetch() {
        try {
            const payload = localStorage.getItem(this.storageKey);
            return payload ? JSON.parse(payload) : [];
        } catch (error) {
            console.error("Storage interface hardware reading fault configuration dropped:", error);
            return [];
        }
    }

    persist(dataset) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(dataset));
        } catch (error) {
            console.error("Storage write operational commitment failure:", error);
        }
    }
}