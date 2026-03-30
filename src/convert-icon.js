
import fs from 'fs';
import pngToIco from 'png-to-ico';
import path from 'path';

// Using paths relative to script location in src/
const inputPath = path.join(process.cwd(), '../public/Dark.PNG');
const outputPath = path.join(process.cwd(), '../public/icon.ico');

pngToIco(inputPath)
    .then(buf => {
        fs.writeFileSync(outputPath, buf);
        console.log('Successfully created icon.ico');
    })
    .catch(err => {
        console.error('Error creating icon:', err);
        process.exit(1);
    });
