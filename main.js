const Rx = require('rxjs/Rx');
const R = require('ramda');
const gpio = require('rpi-gpio');

const pinNumbers = require('./pin_numbers');

const message = process.argv.slice(2)[0];

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

// Set GPIO pin numbers mode
gpio.setMode(gpio.MODE_BCM);

// Will enable a LED and disable it after 2 seconds
const writeDigit = (boolArray) => {
  pinNumbers.forEach((pinNumber, index) => {
    gpio.write(pinNumber, boolArray[index], function(err) {
      if (err) throw err;
    });

    setTimeout(() => {
      gpio.write(pinNumber, false, function(err) {
        if (err) throw err;
      });
    }, 1500);
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
})).then(() => {
  const stream = Rx.Observable
    .from(stringToBinArray(message))
    .bufferCount(8)
    .zip(
      Rx.Observable.interval(4000),
      package => package
    );

  stream.subscribe(writeDigit);
});
