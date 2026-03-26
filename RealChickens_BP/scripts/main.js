import { world, system, ItemStack, EntityComponentTypes } from "@minecraft/server";

world.afterEvents.entitySpawn.subscribe((eventData) => {
    const { entity } = eventData;

    // It's good practice to ensure the entity is valid before interacting with it
    if (!entity || !entity.isValid()) return;

    // Check if the newly spawned entity matches the specific typeId you are looking for
    if (entity.typeId === "real_chickens:temperate_hatch") {
        const eggTypes = ["real_chickens:egg"];

        // Assuming you already have your 'entity' object defined
        const dimension = entity.dimension;
        const location = entity.location;
        const searchRadius = 2; // Define how far around the entity to search for the egg block

        // Retrieve the block at the entity's exact location

        system.runTimeout(() => {
            const block = dimension.getBlock(location);

            if (block && block.typeId !== "real_chickens:egg") {

                for (let dx = -searchRadius; dx <= searchRadius; dx++) {
                    for (let dz = -searchRadius; dz <= searchRadius; dz++) {
                        for (let dy = -searchRadius; dy <= searchRadius; dy++) {
                            const checkLocation = {
                                x: Math.floor(location.x) + dx,
                                y: Math.floor(location.y) + dy,
                                z: Math.floor(location.z) + dz
                            };

                            const searchBlock = dimension.getBlock(checkLocation);

                            if (searchBlock && eggTypes.includes(searchBlock.typeId)) {

                                const entitiesAtEgg = dimension.getEntitiesAtBlockLocation(checkLocation);
                                const isOccupied = entitiesAtEgg.some(ent =>
                                    ent.typeId === "real_chickens:temperate_hatch"
                                );

                                // 4. Only teleport if no other hatch is already there
                                if (!isOccupied) {
                                    entity.teleport({
                                        x: checkLocation.x + 0.5,
                                        y: checkLocation.y + 0.25,
                                        z: checkLocation.z + 0.5
                                    });

                                    return; // Stop searching once we find a valid empty egg
                                }
                            }
                        }
                    }
                }
            }
        }, 1);

    } else if (entity.typeId === "real_chickens:cold_hatch") {
        const eggTypes = ["real_chickens:blue_egg"];

        // Assuming you already have your 'entity' object defined
        const dimension = entity.dimension;
        const location = entity.location;
        const searchRadius = 2; // Define how far around the entity to search for the egg block

        // Retrieve the block at the entity's exact location

        system.runTimeout(() => {
            const block = dimension.getBlock(location);

            if (block && block.typeId !== "real_chickens:blue_egg") {

                for (let dx = -searchRadius; dx <= searchRadius; dx++) {
                    for (let dz = -searchRadius; dz <= searchRadius; dz++) {
                        for (let dy = -searchRadius; dy <= searchRadius; dy++) {
                            const checkLocation = {
                                x: Math.floor(location.x) + dx,
                                y: Math.floor(location.y) + dy,
                                z: Math.floor(location.z) + dz
                            };

                            const searchBlock = dimension.getBlock(checkLocation);

                            if (searchBlock && eggTypes.includes(searchBlock.typeId)) {

                                const entitiesAtEgg = dimension.getEntitiesAtBlockLocation(checkLocation);
                                const isOccupied = entitiesAtEgg.some(ent =>
                                    ent.typeId === "real_chickens:cold_hatch"
                                );

                                // 4. Only teleport if no other hatch is already there
                                if (!isOccupied) {
                                    entity.teleport({
                                        x: checkLocation.x + 0.5,
                                        y: checkLocation.y + 0.25,
                                        z: checkLocation.z + 0.5
                                    });

                                    return; // Stop searching once we find a valid empty egg
                                }
                            }
                        }
                    }
                }
            }
        }, 1);

    } else if (entity.typeId === "real_chickens:warm_hatch") {
        const eggTypes = ["real_chickens:brown_egg"];

        // Assuming you already have your 'entity' object defined
        const dimension = entity.dimension;
        const location = entity.location;
        const searchRadius = 2; // Define how far around the entity to search for the egg block

        // Retrieve the block at the entity's exact location

        system.runTimeout(() => {
            const block = dimension.getBlock(location);

            if (block && block.typeId !== "real_chickens:brown_egg") {

                for (let dx = -searchRadius; dx <= searchRadius; dx++) {
                    for (let dz = -searchRadius; dz <= searchRadius; dz++) {
                        for (let dy = -searchRadius; dy <= searchRadius; dy++) {
                            const checkLocation = {
                                x: Math.floor(location.x) + dx,
                                y: Math.floor(location.y) + dy,
                                z: Math.floor(location.z) + dz
                            };

                            const searchBlock = dimension.getBlock(checkLocation);

                            if (searchBlock && eggTypes.includes(searchBlock.typeId)) {

                                const entitiesAtEgg = dimension.getEntitiesAtBlockLocation(checkLocation);
                                const isOccupied = entitiesAtEgg.some(ent =>
                                    ent.typeId === "real_chickens:warm_hatch"
                                );

                                // 4. Only teleport if no other hatch is already there
                                if (!isOccupied) {
                                    entity.teleport({
                                        x: checkLocation.x + 0.5,
                                        y: checkLocation.y + 0.25,
                                        z: checkLocation.z + 0.5
                                    });

                                    return; // Stop searching once we find a valid empty egg
                                }
                            }
                        }
                    }
                }
            }
        }, 1);
    }
});

world.afterEvents.entityDie.subscribe((eventData) => {
    const { deadEntity, damageSource } = eventData;

    // 1. Check if the entity still "exists" in the engine
    if (!deadEntity || !deadEntity.isValid()) {
        return;
    }

    // 2. Now it is safe to access the dimension
    const dimension = deadEntity.dimension;

    if (
        deadEntity.typeId === "real_chickens:temperate_hatch" ||
        deadEntity.typeId === "real_chickens:cold_hatch" ||
        deadEntity.typeId === "real_chickens:warm_hatch"
    ) {
        // Stop any chickens riding the hatch before it dies
        const ridingComponent = deadEntity.getComponent(EntityComponentTypes.Riding);
        if (ridingComponent) {
            const riders = ridingComponent.getRiders();
            for (const rider of riders) {
                if (rider.isValid() && rider.typeId === "minecraft:chicken") {
                    rider.runCommand("ride @s stop_riding");
                }
            }
        }

        const { x, y, z } = deadEntity.location;
        // Using runCommand on dimension is safer once we know dimension is valid
        dimension.runCommand(`setblock ${Math.floor(x)} ${Math.floor(y)} ${Math.floor(z)} air destroy`);
    }
});

world.afterEvents.playerBreakBlock.subscribe((eventData) => {
    const { block, brokenBlockPermutation } = eventData;
    const dimension = block.dimension;

    // Added gold_egg to the list of blocks that, when broken, remove their associated hatch entity
    if (
        brokenBlockPermutation.type.id === "real_chickens:egg" ||
        brokenBlockPermutation.type.id === "real_chickens:blue_egg" ||
        brokenBlockPermutation.type.id === "real_chickens:brown_egg"
        // ||
        // brokenBlockPermutation.type.id === "real_chickens:gold_egg"
    ) {
        const { x, y, z } = block.location;
        const entitiesAtLoc = dimension.getEntitiesAtBlockLocation({ x, y, z });

        for (const entity of entitiesAtLoc) {
            // Added gold_hatch to the check to ensure it is removed if the gold egg is broken
            if (
                entity.typeId === "real_chickens:temperate_hatch" ||
                entity.typeId === "real_chickens:cold_hatch" ||
                entity.typeId === "real_chickens:warm_hatch"
                // entity.typeId === "real_chickens:gold_hatch"
            ) {
                // Stop any chickens riding the hatch before removing it
                const ridingComponent = entity.getComponent(EntityComponentTypes.Riding);
                if (ridingComponent) {
                    ridingComponent.evictRiders();
                }

                // Remove the entity after a short delay to ensure riders are evicted
                system.runTimeout(() => {
                    if (entity.isValid()) {
                        entity.remove();
                    }
                }, 1);
            }
        }
    }
});

world.afterEvents.playerPlaceBlock.subscribe((eventData) => {
    const { block } = eventData;
    const dimension = block.dimension;
    const { x, y, z } = block.location;

    // Standard offsets to center the entity in the block
    const spawnX = x + 0.5;
    const spawnZ = z + 0.5;
    const spawnY = y + 0.25;

    // Handle different egg block types to summon the correct hatch entity
    if (block.typeId === "real_chickens:egg") {
        dimension.runCommand(`summon real_chickens:temperate_hatch ${spawnX} ${spawnY} ${spawnZ}`);
    } else if (block.typeId === "real_chickens:blue_egg") {
        dimension.runCommand(`summon real_chickens:cold_hatch ${spawnX} ${spawnY} ${spawnZ}`);
    } else if (block.typeId === "real_chickens:brown_egg") {
        dimension.runCommand(`summon real_chickens:warm_hatch ${spawnX} ${spawnY} ${spawnZ}`);
    }
    // else if (block.typeId === "real_chickens:gold_egg") {
    //     // Logic added for gold egg to summon the gold hatch entity
    //     dimension.runCommand(`summon real_chickens:gold_hatch ${spawnX} ${y} ${spawnZ}`);
    // }
});