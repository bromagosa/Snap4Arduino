Arduino.prototype.attemptConnection = function () {
    var myself = this,
        networkPortsEnabled = Arduino.prototype.networkPortsEnabled;

    if (!this.connecting) {
        if (this.board === undefined) {
            // Get list of ports (Arduino compatible)
            world.Arduino.getSerialPorts(function (ports) {
                var portMenu = new MenuMorph(this, 'select a port'),
                    portCount = Object.keys(ports).length;

                if (portCount >= 1) {
                    Object.keys(ports).forEach(function (each) {
                        portMenu.addItem(each, function () { 
                            myself.connect(ports[each]);
                        })
                    });
                }
                if (networkPortsEnabled) {
                    portMenu.addLine();
                    portMenu.addItem('Network port', function () {
                        myself.networkDialog();
                    });
                }
                if (networkPortsEnabled || portCount > 1) {
                    portMenu.popUpAtHand(world);
                } else if (!networkPortsEnabled && portCount === 1) {
                    myself.connect(ports[0]);
                }
            });
        } else {
            ide.inform(myself.name, localize('There is already a board connected to this sprite'));
        }
    }

    if (this.justConnected) {
        this.justConnected = undefined;
        return;
    }
};
