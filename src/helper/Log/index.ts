import log from 'npmlog';

// setup date string for logging https://github.com/npm/npmlog/issues/33#issuecomment-342785666
Object.defineProperty(log, 'heading', {
    get: () => {
        return new Date().toISOString()
    }
})

log.headingStyle = {bg: '', fg: 'white'}

export = log;
