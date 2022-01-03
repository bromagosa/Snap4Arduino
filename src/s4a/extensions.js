// Snap4Arduino extensions (s4a_):
SnapExtensions.primitives.set(
    's4a_i2cwrite(address, bytes, reg)',
    function (address, bytes, reg) {
        var board = this.arduino.board;
        if (!board.i2cEnabled) {
            board.i2cConfig();
            board.i2cEnabled = true;
        }
        board.i2cWrite(address, reg, bytes.asArray());
    }
);
SnapExtensions.primitives.set(
    's4a_i2csend(address, bytes)',
    function (address, bytes) {
        var board = this.arduino.board;
        if (!board.i2cEnabled) {
            board.i2cConfig();
            board.i2cEnabled = true;
        }
        board.i2cWrite(address, bytes.asArray());
    }
);
SnapExtensions.primitives.set(
    's4a_i2cread1(address, reg)',
    function (address, reg) {
        var board= this.arduino.board;
        board['i2cResponse-' + Number(address)] = null;
        if (!board.i2cEnabled) {
            board.i2cConfig();
            board.i2cEnabled = true;
        }
        board.i2cReadOnce(
            Number(address),
            Number(reg),
            function (response) {
                board['i2cResponse-' + Number(address)] = response;
            });
    }
);
SnapExtensions.primitives.set(
    's4a_i2cread2(address)',
    function (address) {
        var board = this.arduino.board;
        board.checkArduinoBoardParam('i2cResponse-' + Number(address));
        return board['i2cResponse-' + Number(address)] !== null;
    }
);
SnapExtensions.primitives.set(
    's4a_i2cread3(address)',
    function (address) {
        var board = this.arduino.board;
        board.getArduinoBoardParam('i2cResponse-' + Number(address));
        return new List(board['i2cResponse-' + Number(address)]);
    }
);
