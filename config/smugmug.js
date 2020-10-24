exports.config = {
    services: {
        "test": function (res, req, db, type) {
            res.end("Hello World");
        }
    }
};
