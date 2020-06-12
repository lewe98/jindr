import {describe, it, expect} from 'jest-without-globals';
import {Tile} from "../models/tile";
const server = require('../server.js');
const User = require('../models/user');
let germanMap: Tile[] = [];

describe('Prepare User Test', () => {
    it('should remove password and deviceID',() => {
       const res = server.prepareUser(new User({firstName: 'Test', lastName: 'Test', email: 'test@test.de', password: 'test123', deviceID: 'abc123'}));
       expect(res.password).toBe(undefined);
       expect(res.deviceID).toBe(undefined);
       expect(res.firstName).toBe('Test');
    });
});

describe('Map raster tests', () => {
    const southWest = {lat: 47.344777, lng: 5.888672}; // coordinates for southWestern point of a rectangle containing germany
    const northEast = {lat: 54.41893, lng: 14.888671}; // coordinates for northEastern point of a rectangle containing germany
    const maxRadius = 50; // Max search radius users can set in the app
    it ('should create a raster of germany', () => {
        germanMap = server.rasterizeMap(maxRadius, southWest, northEast);
        expect(germanMap.length).toEqual(208);
    });
});

describe('Get bounding areas', () => {
    it ('should get all bounding areas of a tile', () => {
        const neighbours = server.getBoundingAreas(30, 13, 16);
        expect(neighbours).toEqual([29, 31, 17, 16, 18, 43, 42, 44]);
    });
    it('should not return neighbors on border areas', () => {
        const neighbors2 = server.getBoundingAreas(196, 13, 16);
        expect(neighbors2).toEqual([195, 197, 183, 182, 184]);
        const neighbors3 = server.getBoundingAreas(195, 13, 16);
        expect(neighbors3).toEqual([196, 182, 183]);
        const neighbors4 = server.getBoundingAreas(207, 13, 16);
        expect(neighbors4).toEqual([206, 194, 193]);
        const neighbors5 = server.getBoundingAreas(0, 13, 16);
        expect(neighbors5).toEqual([1, 13, 14]);
    });
});
