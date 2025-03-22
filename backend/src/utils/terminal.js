const chalk = require('chalk');
const boxen = require('boxen');

// Custom theme
const successStyle = { 
  padding: 1,
  margin: 1,
  borderStyle: 'round',
  borderColor: 'green',
  backgroundColor: '#555555'
};

const warningStyle = {
  padding: 1,
  borderStyle: 'double',
  borderColor: 'yellow',
}

// Formatted messages
const logger = {
  success: (message) => {
    console.log(
      boxen(
        chalk.green.bold(`✓ ${message}`),
        successStyle
      )
    );
  },

  warning: (message) => {
    console.log(
      boxen(
        chalk.yellow(`⚠ ${message}`),
        warningStyle
      )
    );
  },

  error: (message) => {
    console.log(
      chalk.white.bgRed.bold(` ERROR `) + 
      chalk.red(` ${message}`)
    );
  },

  info: (message) => {
    console.log(
      chalk.blue(`ℹ ${message}`)
    );
  }
};

module.exports = logger;