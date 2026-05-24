const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('src');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const old = content;
    
    // Replace hardcoded arbitrary Tailwind colors with theme variables
    content = content.replace(/bg-\[\#3B172D\]/g, 'bg-primary')
                     .replace(/text-\[\#3B172D\]/g, 'text-primary')
                     .replace(/border-\[\#3B172D\]/g, 'border-primary')
                     .replace(/ring-\[\#3B172D\]/g, 'ring-primary')
                     .replace(/bg-\[\#C89445\]/g, 'bg-orange')
                     .replace(/text-\[\#C89445\]/g, 'text-orange')
                     .replace(/border-\[\#C89445\]/g, 'border-orange')
                     .replace(/bg-\[\#E4D8C7\]/g, 'bg-beige')
                     .replace(/text-\[\#5B3528\]/g, 'text-brown')
                     .replace(/bg-\[\#D6C4AD\]/g, 'bg-beige-dark')
                     .replace(/bg-\[\#A66A5B\]/g, 'bg-brown-light');

    if (content !== old) {
        fs.writeFileSync(file, content);
        console.log('Updated ' + file);
    }
});
