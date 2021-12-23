import log from 'npmlog';
import ConfigurationManager from '../ConfigurationManager';

// setup date string for logging https://github.com/npm/npmlog/issues/33#issuecomment-342785666
Object.defineProperty(log, 'heading', {
    get: () => {
        return new Date().toISOString()
    }
})

log.headingStyle = {bg: '', fg: 'white'}
log.level = ConfigurationManager.get('log:level');

export = log;
