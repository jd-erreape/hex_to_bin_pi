var gpio = require('rpi-gpio');
var hex2Bool = require('./hex_to_bin');

// Set GPIO pin numbers mode
gpio.setMode(gpio.MODE_BCM);

// GPIO Pins we're gonna use
// they are in the same order as a binary
const pinNumbers = [23, 24, 15, 18];
const boolRepresentation = hex2Bool('D');

// Will enable a LED and disable it after 2 seconds
const writeDigit = () => {
  pinNumbers.forEach((pinNumber, index) => {
    gpio.write(pinNumber, boolRepresentation[index], function(err) {
      if (err) throw err;
      console.log('Written to pin');
    });

    setTimeout(() => {
      gpio.write(pinNumber, false, function(err) {
        if (err) throw err;
        console.log('Written to pin');
      });
    }, 2000);
  })
};

// Seems like setup operation is async and we could try to write on a
// pin before it has been setup.
// We're resolving a promise when the setup has been completed and
// waiting for all the pins to be setup before executing our program logic
//

Promise.all(pinNumbers.map((pinNumber) => {
  return new Promise((resolve) => {
    gpio.setup(pinNumber, gpio.DIR_OUT, resolve);
  })
})).then(writeDigit);
