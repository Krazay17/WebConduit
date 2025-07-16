const CURRENT_VERSION = 0.118;

export default {
    version: CURRENT_VERSION,
    name: { text: 'Hunter', color: '#FFFFFF' },
    location: { x: 0, y: 0 },
    area: 'Home',
    power: { money: 0, spent: 0, auraLevel: 1, },
    upgrades: {},
    stats: { healthMax: 25, health: 25 },
    weapons: { left: 'shurikan', right: 'sword', aura: 'zap' },
    volume: { master: 1, music: 1, voice: 1 },
    collectedItems: [],
    cards: [],
    flags: {
        seenIntro: false,
        devmode: false,
    },
    useLastLocation: false,

    save() {
        const data = {
            version: this.version,
            name: this.name,
            location: this.location,
            area: this.area,
            power: this.power,
            upgrades: this.upgrades,
            stats: this.stats,
            weapons: this.weapons,
            volume: this.volume,
            collectedItems: this.collectedItems,
            cards: this.cards,
            flags: this.flags,
            useLastLocation: this.useLastLocation,
        };
        localStorage.setItem('webConduitSave', JSON.stringify(data));
    },

    load() {
        const data = localStorage.getItem('webConduitSave');
        if (data) {
            const parsed = JSON.parse(data);

            if (parsed.version !== CURRENT_VERSION) {
                console.warn('Save version mismatch. Resetting progress.');

                this.reset({
                    keep: {
                        name: parsed.name,
                        volume: parsed.volume,
                        weapons: parsed.weapons,
                        power: parsed.power,
                        cards: parsed.cards,
                        //flags: parsed.flags,

                    }
                });

                return;
            }

            // Normal loading path
            this.version = parsed.version ?? CURRENT_VERSION;
            this.location = parsed.location ?? { x: 0, y: 0 };
            this.name = parsed.name ?? { text: 'Hunter', color: '#FFFFFF' };
            this.area = parsed.area ?? 'Home';
            this.power = parsed.power ?? { money: 0, spent: 0, auraLevel: 1, };
            this.upgrades = parsed.upgrades ?? {};
            this.stats = parsed.stats ?? { healthMax: 25, health: 25 };
            this.weapons = parsed.weapons ?? { left: 'shurikan', right: 'sword', aura: 'zap' };
            this.volume = parsed.volume ?? { master: 1, music: 1, voice: 1 };
            this.collectedItems = parsed.collectedItems ?? [];
            this.cards = parsed.cards ?? [];
            this.flags = parsed.flags ?? {};
            this.useLastLocation = parsed.useLastLocation ?? false;
        }
    },

    reset({ keep = {} } = {}) {
        // Merge preserved values first
        this.version = CURRENT_VERSION;
        this.name = keep.name ?? { text: 'Hunter', color: '#FFFFFF' };
        this.location = { x: 0, y: 0 };
        this.area = keep.area ?? 'Home';
        this.power = keep.power ?? { money: 0, spent: 0, auraLevel: 1, };
        this.upgrades = keep.upgrades ?? {};
        this.money = keep.money ?? 0;
        this.stats = keep.stats ?? { healthMax: 25, health: 25 };
        this.weapons = keep.weapons ?? { left: 'shurikan', right: 'sword', aura: 'zap' };
        this.volume = keep.volume ?? { master: 1, music: 1, voice: 1 };
        this.collectedItems = keep.collectedItems ?? [];
        this.cards = keep.cards ?? [];
        this.flags = keep.flags ?? {
            seenIntro: false,
            devmode: false,
        };

        this.save();
    },

    clear() {
        localStorage.removeItem('webConduitSave');
    },

    getNetworkData() {
        return {
            location: {
                x: this.location.x,
                y: this.location.y
            },
            name: {
                text: this.name?.text ?? 'Hunter',
                color: this.name?.color ?? '#ffffff'
            },
            power: {
                money: this.power?.money ?? 0,
                auraLevel: this.power?.auraLevel ?? 1
            },
            stats: {
                health: this.stats?.health ?? 25,
                healthMax: this.stats?.healthMax ?? 25
            }
        };
    },
}