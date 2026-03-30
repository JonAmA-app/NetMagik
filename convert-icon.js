
import fs from 'fs';
import pngToIco from 'png-to-ico';
import path from 'path';

const inputPath = 'public/Dark.PNG';
const outputPath = 'public/icon.ico';

pngToIco(inputPath)
    .then(buf => {
        fs.writeFileSync(outputPath, buf);
        console.log('Successfully created icon.ico');
    })
    .catch(err => {
        console.error('Error creating icon:', err);
        process.exit(1);
    });
