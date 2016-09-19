/*
   Command keys are ints because we need to cut bottlenecks everywhere.

   0 → digital write
   1 → analog write
   2 → servo write
   3 → digital read
   4 → analog read
   5 → set pin mode

*/

Process.prototype.digitalWrite = function (pin, booleanValue) {
    world.send([0, pin, booleanValue ? 1 : 0]);
};

Process.prototype.pwmWrite = function (pin, value) {
    world.send([1, pin, value]);
};

Process.prototype.servoWrite = function (pin, value) {
    world.send([2, pin, value]);
};

Process.prototype.reportDigitalReading = function (pin) {
    world.send([3, pin]);
    return world.board.pins[pin].value || false;
};

Process.prototype.reportAnalogReading = function (pin) {
    world.send([4, pin]);
    return world.board.pins['A' + pin].value || 0;
};

Process.prototype.setPinMode = function (pin, mode) {
    world.send([5, pin, mode]);
};
