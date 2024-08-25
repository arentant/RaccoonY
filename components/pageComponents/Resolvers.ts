
export const terrainResolver = (terrain: number | undefined) => {
    switch (terrain) {
        case Terrains.Mountain:
            return "mountains";
        case Terrains.Forest:
            return "forest";
        case Terrains.Water:
            return "water";
        case Terrains.DeepWater:
            return "deepWater";
        case Terrains.Flat:
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


export enum Terrains { None, Forest, DeepWater, Water, Flat, Mountain }


export enum Buildings {
    VendorShop,
    RecipeShop,
    Tavern,
    Brothel,
    Residential
}
