var gpio = require('rpi-gpio');

// Set GPIO pin numbers mode
gpio.setMode(gpio.MODE_BCM);

// GPIO Pins we're gonna use
const pinNumbers = [15, 18, 24, 23];

// Will enable a LED and disable it after 2 seconds
const perform = () => {
  pinNumbers.forEach((pinNumber) => {
    gpio.write(pinNumber, true, function(err) {
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
})).then(perform);
