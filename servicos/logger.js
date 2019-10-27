//const winston = require('winston');
const {transports, createLogger, format} = require('winston');

const path = require('path');


const filename = path.join('logs/', 'created-logfile.log');


const fs = require('fs');

if(!fs.existsSync('logs')) {
  fs.mkdirSync('logs');  
}

module.exports = createLogger({
  format: 
      format.combine(
        format.timestamp(),
        format.json()
      ),
    transports: [
      new transports.Console({'timestamp':true}),
      new transports.File({ filename })
    ]
  });

/*
logger.log('info', 'Log utilizando o parametro info');
logger.info('utilizando a função info');

// ***************
// Allows for JSON logging
// ***************

logger.log({
    level: 'info',
    message: 'Pass an object and this works',
    additional: 'properties',
    are: 'passed along'
  });
  
  logger.info({
    message: 'Use a helper method if you want',
    additional: 'properties',
    are: 'passed along'
  });
  
  // ***************
  // Allows for parameter-based logging
  // ***************
  
  logger.log('info', 'Pass a message and this works', {
    additional: 'properties',
    are: 'passed along'
  });
  
  logger.info('Use a helper method if you want', {
    additional: 'properties',
    are: 'passed along'
  });
  
  // ***************
  // Allows for string interpolation
  // ***************
  
  // info: test message my string {}
  logger.log('info', 'test message %s', 'my string');
  
  // info: test message my 123 {}
  logger.log('info', 'test message %d', 123);
  
  // info: test message first second {number: 123}
  logger.log('info', 'test message %s, %s', 'first', 'second', { number: 123 });
  
  // prints "Found error at %s"
  logger.info('Found %s at %s', 'error', new Date());
  logger.info('Found %s at %s', 'error', new Error('chill winston'));
  logger.info('Found %s at %s', 'error', /WUT/);
  logger.info('Found %s at %s', 'error', true);
  logger.info('Found %s at %s', 'error', 100.00);
  logger.info('Found %s at %s', 'error', ['1, 2, 3']);
  
  // ***************
  // Allows for logging Error instances
  // ***************
  
  logger.warn(new Error('Error passed as info'));
  logger.log('error', new Error('Error passed as message'));
  
  logger.warn('Maybe important error: ', new Error('Error passed as meta'));
  logger.log('error', 'Important error: ', new Error('Error passed as meta'));
  
  logger.error(new Error('Error as info'));
  */