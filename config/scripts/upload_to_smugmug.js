"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AwesomePhoto = require('../db_bootstrap').seq.AwesomePhoto;
const https_1 = __importDefault(require("https"));
AwesomePhoto.findAll({
    where: {
        smugmug_key: null,
    },
    limit: 30,
    order: [['id', 'DESC']],
}).then((photos) => {
    checkPhotosAndUpdate();
    checkPhotosAndUpdate();
    checkPhotosAndUpdate();
    checkPhotosAndUpdate();
    function checkPhotosAndUpdate() {
        if (photos.length > 0) {
            const photo = photos.pop();
            updatePhoto(photo, function () {
                checkPhotosAndUpdate();
            });
        }
    }
});
function updatePhoto(photo, callback) {
    console.log(`Updating photo ${photo.id} ${photo.url}`);
    https_1.default.get('https://upload.david-ma.net/uploadByUrl', {
        headers: {
            target: photo.url,
            caption: photo.caption,
        },
    }, (res) => {
        let rawData = '';
        res.on('data', (d) => {
            rawData += d;
        });
        res.on('end', () => {
            const data = JSON.parse(rawData);
            photo
                .update({
                smugmug_url: data.smugmug_url,
                smugmug_key: data.smugmug_key,
                smugmug_album: data.smugmug_album,
            })
                .then((data) => {
                console.log(`Updated photo ${photo.id} ${data.smugmug_url}`);
                callback();
            });
        });
    });
}
