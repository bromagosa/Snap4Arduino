Process.prototype.setPinMode = function (pin, mode) {
    var sprite = this.homeContext.receiver;
    sprite.world().send({ command: 'setPinMode', args: [pin, mode] });
};

Process.prototype.servoWrite = function (pin, value) {
    var sprite = this.homeContext.receiver;
    sprite.world().send({ command: 'servoWrite', args: [pin, value] });
};

Process.prototype.reportAnalogReading = function (pin) {
    var sprite = this.homeContext.receiver;
    sprite.world().send({ command: 'reportAnalogReading', args: [pin] });
};

Process.prototype.reportDigitalReading = function (pin) {
    var sprite = this.homeContext.receiver;
    sprite.world().send({ command: 'reportDigitalReading', args: [pin] });
};

Process.prototype.digitalWrite = function (pin, booleanValue) {
    var sprite = this.homeContext.receiver;
    sprite.world().send({ command: 'digitalWrite', args: [pin, booleanValue] });
};

Process.prototype.pwmWrite = function (pin, value) {
    var sprite = this.homeContext.receiver;
    sprite.world().send({ command: 'pwmWrite', args: [pin, value] });
};

