export const readmore = (text) => {
  const [text1, text2] = text.split('|');
  if (!text2) return null;
  return text1 + String.fromCharCode(8206).repeat(4001) + `\n${text2}`;
};

export const flipCoin = () => {
  return Math.random() > 0.5 ? 'Heads' : 'Tails';
};

export const rollDiceWithAnimation = (sides = 6) => {
  const diceFaces = [
    '⚀', // 1
    '⚁', // 2
    '⚂', // 3
    '⚃', // 4
    '⚄', // 5
    '⚅', // 6
  ];

  const frames = [];
  for (let i = 0; i < 10; i++) {
    const randomValue = Math.floor(Math.random() * sides) + 1;
    frames.push(diceFaces[randomValue - 1]);
  }
  return frames;
};

export const countdown = (seconds) => {
  const interval = setInterval(() => {
    if (seconds <= 0) {
      clearInterval(interval);
      console.log('Time’s up!');
    } else {
      console.log(seconds--);
    }
  }, 1000);
};

export const celsiusToFahrenheit = (celsius) => {
  return (celsius * 9) / 5 + 32;
};

export const isStrongPassword = (password) => {
  return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
};

export const randomColor = () => {
  const letters = '0123456789ABCDEF';
  return '#' + [...Array(6)].map(() => letters[Math.floor(Math.random() * 16)]).join('');
};

export const yesOrNo = () => {
  return Math.random() > 0.5 ? 'Yes' : 'No';
};
