
const { PHASE_EXPORT } = require('next/constants')

module.exports = (phase, { defaultConfig }) => {
    if (process.env.npm_lifecycle_event === 'export')
    {
        return {
            assetPrefix: './',
            images: {
                unoptimized: true
            }
        };
    }

    return {}
}
