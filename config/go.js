// Transient data store, will need to use a real database in future.
import _ from 'lodash';
const goBoard = {};
const config = {
    sockets: {
        on: [
            {
                name: 'fullGoBoard',
                callback: function (socket, packet, seq) {
                    // eslint-disable-line
                    socket.broadcast.emit('fullGoBoard', packet);
                    _.merge(goBoard, {
                        [packet.name]: packet.data,
                    });
                },
            },
        ],
        emit: [
            (socket, seq) => {
                socket.emit('fullGoBoard', goBoard);
            }, // eslint-disable-line
        ],
    },
};
export { config };
//# sourceMappingURL=go.js.map