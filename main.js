const Rx = require('rxjs/Rx');
const R = require('ramda');
const gpio = require('rpi-gpio');

// -------- Pad a string with 0 for length 8
const pad = R.curry((n, string) => (Array(n).join('0') + string).slice(-n));
const pad8 = pad(8);

// -------- Single char to bin string
const charToBin = R.compose(
  pad8,
  R.invoker(1, 'toString')(2),
  R.invoker(1, 'charCodeAt')(0)
);

// -------- String to bin string
const stringToBin = R.compose(
  R.join(''),
  R.map(charToBin),
  R.split(''),
);

// -------- Bin string to Bin array
const stringToBinArray = R.compose(
  R.map(parseInt),
  R.split(''),
  stringToBin
);

// ------------------------------
//
// Observable that will convert the string to bin array as source, will buffer
// each 4 elements of the stream and will return the buffered packages every
// n milliseconds

const message = 'ABCDE';
const stream = Rx.Observable
  .from(stringToBinArray(message))
  .bufferCount(8)
  .zip(
    Rx.Observable.interval(500),
    package => package
  );

stream.subscribe(console.log);

// GPIO Pins we're gonna use
// they are in the same order as a binary

// const PIN_7 = 14;
// const PIN_6 = 15;
// const PIN_5 = 18;
// const PIN_4 = 23;
// const PIN_3 = 24;
// const PIN_2 = 25;
// const PIN_1 = 8;
// const PIN_0 = 7;
//
// const pinNumbers = [
//   PIN_7,
//   PIN_6,
//   PIN_5,
//   PIN_4,
//   PIN_3,
//   PIN_2,
//   PIN_1,
//   PIN_0
// ];

// Set GPIO pin numbers mode
gpio.setMode(gpio.MODE_BCM);

// GPIO Pins we're gonna use
// they are in the same order as a binary
const pinNumbers = [23, 24, 15, 18];
const boolRepresentation = [true, false, true, false];

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
