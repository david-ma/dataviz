"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AwesomePhoto = require('../db_bootstrap').seq.AwesomePhoto;
const https_1 = __importDefault(require("https"));
const blacklist = [
    626, 628, 629, 630, 631, 632, 640, 645, 649, 662, 664, 663, 665, 666, 637, 8,
    4, 9, 10, 29, 25, 22, 13, 240, 239, 238, 235, 711, 684, 677, 580, 573, 561, 295
];
const bannedFiletypes = ['.avif', '.webp'];
AwesomePhoto.findAll({
    where: {
        smugmug_key: null,
    },
    limit: 300,
    order: [['id', 'ASC']],
}).then((photos) => {
    checkPhotosAndUpdate();
    checkPhotosAndUpdate();
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
function updatePhoto(photo, next) {
    console.log(`Photo ${photo.id} ${photo.url}`);
    if (blacklist.indexOf(photo.id) > -1) {
        console.log(`Blacklisted Photo ${photo.id} ${photo.url}`);
        next();
    }
    else if (photo.url.indexOf('https') !== 0 ||
        bannedFiletypes.some((filetype) => photo.url.indexOf(filetype) > -1)) {
        console.log(`Rejecting this photo ${photo.id} ${photo.url}`);
        next();
    }
    else {
        https_1.default.get('https://upload.david-ma.net/uploadByUrl', {
            headers: {
                target: photo.url,
                caption: photo.caption,
            },
            timeout: 120000,
        }, (res) => {
            let rawData = '';
            res.on('data', (d) => {
                rawData += d;
            });
            res.on('error', (e) => {
                console.log(`Error in photo upload ${photo.id} ${photo.url}`);
                console.error(e);
            });
            res.on('end', () => {
                try {
                    const data = JSON.parse(rawData);
                    console.log(`Got data for photo ${photo.id} ${photo.url}`);
                    console.log(data);
                    photo
                        .update({
                        smugmug_url: data.image_url,
                        smugmug_key: data.imageKey,
                        smugmug_album: data.albumId,
                    })
                        .then((newPhoto) => {
                        console.log(`Updated photo ${photo.id} ${newPhoto.dataValues.image_url}`);
                        next();
                    });
                }
                catch (e) {
                    console.log(`Error parsing JSON ${photo.id} ${photo.url}`);
                    console.log(rawData);
                    console.error(e.message);
                    setTimeout(next, 5000);
                }
            });
        });
    }
}
