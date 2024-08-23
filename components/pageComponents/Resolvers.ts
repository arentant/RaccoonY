
export const terrainResolver = (terrain: number | undefined) => {
    switch (terrain) {
        case Terrains.Mountains:
            return "mountains";
        case Terrains.Forest:
            return "forest";
        case Terrains.Water:
            return "water";
        case Terrains.DeepWater:
            return "deepWater";
        case Terrains.Sand:
            return "sand";
        case Terrains.Grass:
            return "grass";

        default: return "deepWater";
    }
}

export const buildingResolver = (building: number | undefined) => {
    switch (building) {
        case Buildings.VendorShop:
            return "vendorShop";
        case Buildings.RecipeShop:
            return "recipeShop";
        case Buildings.Tavern:
            return "tavern";
        case Buildings.Brothel:
            return "brothel";
        case Buildings.Residential:
            return "residential";

        default: return "brothel";
    }
}


export enum Terrains {
    Mountains,
    Forest,
    Water,
    DeepWater,
    Sand,
    Grass
}

export enum Buildings {
    VendorShop,
    RecipeShop,
    Tavern,
    Brothel,
    Residential
}
