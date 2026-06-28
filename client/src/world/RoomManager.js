export class RoomManager {

    constructor() {

        // In-memory room cache
        this.cache = {};

        // Future hooks
        this.roomCreated = null;
        this.roomLoaded = null;
        this.roomSaved = null;
    }

    key(depth, roomX, roomY) {
        return `${depth}:${roomX}:${roomY}`;
    }

    get(depth, roomX, roomY, generator) {

        const key = this.key(depth, roomX, roomY);

        // First visit
        if (!this.cache[key]) {

            const room = generator();

            // Metadata container
            room.meta ??= {};

            room.meta.roomId = key;
            room.meta.depth = depth;
            room.meta.roomX = roomX;
            room.meta.roomY = roomY;

            room.meta.created =
                room.meta.created ||
                Date.now();

            room.meta.lastVisited =
                Date.now();

            room.meta.visits = 1;

            room.meta.discovered = true;

            this.cache[key] = room;

            // Hook
            if (typeof this.roomCreated === "function") {
                this.roomCreated(room);
            }

        } else {

            const room = this.cache[key];

            room.meta ??= {};

            room.meta.visits =
                (room.meta.visits || 0) + 1;

            room.meta.lastVisited =
                Date.now();

            // Hook
            if (typeof this.roomLoaded === "function") {
                this.roomLoaded(room);
            }
        }

        return this.cache[key];
    }

    has(depth, roomX, roomY) {

        return !!this.cache[
            this.key(depth, roomX, roomY)
        ];

    }

    save(depth, roomX, roomY) {

        const room =
            this.cache[
                this.key(depth, roomX, roomY)
            ];

        if (!room)
            return false;

        if (typeof this.roomSaved === "function") {
            this.roomSaved(room);
        }

        return true;
    }

    remove(depth, roomX, roomY) {

        delete this.cache[
            this.key(depth, roomX, roomY)
        ];

    }

    clear() {

        this.cache = {};

    }

}