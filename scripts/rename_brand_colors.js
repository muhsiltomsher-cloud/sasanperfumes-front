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
let totalUpdated = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const old = content;

    // Rename semantic Tailwind classes to brand-* namespace
    // (these were replaced from hex codes in the previous step)
    content = content
        // primary → brand-primary  (bg-primary, text-primary, border-primary, ring-primary, hover:bg-primary, etc.)
        .replace(/\bbg-primary\b/g, 'bg-brand-primary')
        .replace(/\btext-primary\b/g, 'text-brand-primary')
        .replace(/\bborder-primary\b/g, 'border-brand-primary')
        .replace(/\bring-primary\b/g, 'ring-brand-primary')
        .replace(/\bhover:bg-primary\b/g, 'hover:bg-brand-primary')
        .replace(/\bhover:text-primary\b/g, 'hover:text-brand-primary')
        .replace(/\bhover:border-primary\b/g, 'hover:border-brand-primary')
        .replace(/\bfocus:bg-primary\b/g, 'focus:bg-brand-primary')
        .replace(/\bfocus:text-primary\b/g, 'focus:text-brand-primary')
        // orange → brand-gold
        .replace(/\bbg-orange\b/g, 'bg-brand-gold')
        .replace(/\btext-orange\b/g, 'text-brand-gold')
        .replace(/\bborder-orange\b/g, 'border-brand-gold')
        .replace(/\bhover:bg-orange\b/g, 'hover:bg-brand-gold')
        .replace(/\bhover:text-orange\b/g, 'hover:text-brand-gold')
        .replace(/\bhover:border-orange\b/g, 'hover:border-brand-gold')
        // beige → brand-beige
        .replace(/\bbg-beige\b/g, 'bg-brand-beige')
        .replace(/\btext-beige\b/g, 'text-brand-beige')
        .replace(/\bborder-beige\b/g, 'border-brand-beige')
        .replace(/\bhover:bg-beige\b/g, 'hover:bg-brand-beige')
        // beige-dark → brand-beige-dark
        .replace(/\bbg-beige-dark\b/g, 'bg-brand-beige-dark')
        .replace(/\bhover:bg-beige-dark\b/g, 'hover:bg-brand-beige-dark')
        // brown → brand-brown
        .replace(/\bbg-brown\b/g, 'bg-brand-brown')
        .replace(/\btext-brown\b/g, 'text-brand-brown')
        .replace(/\bborder-brown\b/g, 'border-brand-brown')
        .replace(/\bhover:bg-brown\b/g, 'hover:bg-brand-brown')
        // brown-light → brand-brown-light
        .replace(/\bbg-brown-light\b/g, 'bg-brand-brown-light')
        .replace(/\bhover:bg-brown-light\b/g, 'hover:bg-brand-brown-light');

    if (content !== old) {
        fs.writeFileSync(file, content);
        totalUpdated++;
        console.log('Updated ' + file);
    }
});

console.log('\nTotal files updated: ' + totalUpdated);
