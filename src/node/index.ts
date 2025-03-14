import { createServer } from 'vite'
import cac from 'cac';
import pkg from '../../package.json';
import path from 'path';
import { pluginIndexHtml } from './plugin-island/indexHtml';

const cli = cac("my-land")
    .version(pkg.version)
    .help();

cli.command('dev <path>', 'Dev server').action(async (pathInput) => {

    await main(path.resolve(pathInput))
})

cli.parse()



async function main(root: string) {
    const server = await createServer({
        // any valid user config options, plus `mode` and `configFile`
        configFile: false,
        "plugins": [pluginIndexHtml()],
        root,
        server: {
            port: 1337,
        },
    })
    await server.listen()

    server.printUrls()
    server.bindCLIShortcuts({ print: true })
}
