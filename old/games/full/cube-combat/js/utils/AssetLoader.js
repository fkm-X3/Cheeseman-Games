/**
 * AssetLoader.js - Manages loading and caching of game assets
 */

export class AssetLoader {
    constructor() {
        this.assets = {
            images: new Map(),
            sounds: new Map(),
            music: new Map(),
            data: new Map(),
        };
        
        this.loadingQueue = [];
        this.loaded = 0;
        this.total = 0;
        this.onProgressCallbacks = [];
        this.onCompleteCallbacks = [];
    }

    // Load an image
    loadImage(key, path) {
        return new Promise((resolve, reject) => {
            if (this.assets.images.has(key)) {
                resolve(this.assets.images.get(key));
                return;
            }

            const img = new Image();
            img.onload = () => {
                this.assets.images.set(key, img);
                this.incrementLoaded();
                resolve(img);
            };
            img.onerror = () => {
                console.error(`[AssetLoader] Failed to load image: ${path}`);
                reject(new Error(`Failed to load image: ${path}`));
            };
            img.src = path;
        });
    }

    // Load an audio file
    loadSound(key, path) {
        return new Promise((resolve, reject) => {
            if (this.assets.sounds.has(key)) {
                resolve(this.assets.sounds.get(key));
                return;
            }

            const audio = new Audio();
            audio.addEventListener('canplaythrough', () => {
                this.assets.sounds.set(key, audio);
                this.incrementLoaded();
                resolve(audio);
            }, { once: true });
            
            audio.addEventListener('error', () => {
                console.error(`[AssetLoader] Failed to load sound: ${path}`);
                reject(new Error(`Failed to load sound: ${path}`));
            });
            
            audio.src = path;
            audio.load();
        });
    }

    // Load music (same as sound, but different category)
    loadMusic(key, path) {
        return this.loadSound(key, path).then(audio => {
            this.assets.music.set(key, audio);
            this.assets.sounds.delete(key);
            return audio;
        });
    }

    // Load JSON data
    async loadJSON(key, path) {
        if (this.assets.data.has(key)) {
            return this.assets.data.get(key);
        }

        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            this.assets.data.set(key, data);
            this.incrementLoaded();
            return data;
        } catch (error) {
            console.error(`[AssetLoader] Failed to load JSON: ${path}`, error);
            throw error;
        }
    }

    // Batch load assets
    async loadAssets(assetList) {
        this.total = assetList.length;
        this.loaded = 0;

        const promises = assetList.map(asset => {
            switch (asset.type) {
                case 'image':
                    return this.loadImage(asset.key, asset.path);
                case 'sound':
                    return this.loadSound(asset.key, asset.path);
                case 'music':
                    return this.loadMusic(asset.key, asset.path);
                case 'json':
                    return this.loadJSON(asset.key, asset.path);
                default:
                    console.warn(`[AssetLoader] Unknown asset type: ${asset.type}`);
                    return Promise.resolve();
            }
        });

        try {
            await Promise.all(promises);
            this.notifyComplete();
            console.log(`[AssetLoader] Loaded ${this.loaded}/${this.total} assets`);
        } catch (error) {
            console.error('[AssetLoader] Error loading assets:', error);
            throw error;
        }
    }

    incrementLoaded() {
        this.loaded++;
        this.notifyProgress();
    }

    notifyProgress() {
        const progress = this.total > 0 ? this.loaded / this.total : 0;
        this.onProgressCallbacks.forEach(cb => cb(progress, this.loaded, this.total));
    }

    notifyComplete() {
        this.onCompleteCallbacks.forEach(cb => cb());
    }

    onProgress(callback) {
        this.onProgressCallbacks.push(callback);
    }

    onComplete(callback) {
        this.onCompleteCallbacks.push(callback);
    }

    // Getters
    getImage(key) {
        return this.assets.images.get(key);
    }

    getSound(key) {
        return this.assets.sounds.get(key);
    }

    getMusic(key) {
        return this.assets.music.get(key);
    }

    getData(key) {
        return this.assets.data.get(key);
    }

    // Check if asset exists
    hasImage(key) {
        return this.assets.images.has(key);
    }

    hasSound(key) {
        return this.assets.sounds.has(key);
    }

    hasData(key) {
        return this.assets.data.has(key);
    }

    // Clear assets
    clearImages() {
        this.assets.images.clear();
    }

    clearSounds() {
        this.assets.sounds.clear();
    }

    clearAll() {
        this.assets.images.clear();
        this.assets.sounds.clear();
        this.assets.music.clear();
        this.assets.data.clear();
    }

    // Get loading progress
    getProgress() {
        return {
            loaded: this.loaded,
            total: this.total,
            percent: this.total > 0 ? (this.loaded / this.total) * 100 : 0,
        };
    }
}

// Singleton instance
export const assetLoader = new AssetLoader();
