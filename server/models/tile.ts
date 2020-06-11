export class Tile {
    public index: number;
    public neighbours: number[];
    public southWest: Coords;
    public northEast: Coords;
}

export class Coords {
    public lat: number;
    public lng: number;
}
