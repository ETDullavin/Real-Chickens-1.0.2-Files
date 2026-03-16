import { world, system, ItemStack, EntityComponentTypes } from "@minecraft/server";

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