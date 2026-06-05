const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const adminDir = 'd:\\ProjectCode\\TheMCHub\\MC_Voice_Training_Frontend\\src\\pages\\admin';

walkDir(adminDir, (filePath) => {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace emerald (green) with grayscale
    content = content.replace(/bg-emerald-50/g, 'bg-[--bg-elevated]');
    content = content.replace(/text-emerald-[67]00/g, 'text-[--text-primary]');
    content = content.replace(/border-emerald-200/g, 'border-[--border-subtle]');
    content = content.replace(/bg-emerald-500/g, 'bg-[--text-primary]');
    content = content.replace(/hover:bg-emerald-100/g, 'hover:bg-gray-200');

    // Replace red with grayscale
    content = content.replace(/bg-red-50/g, 'bg-[--bg-elevated]');
    content = content.replace(/text-red-[567]00/g, 'text-[--text-primary]');
    content = content.replace(/border-red-200/g, 'border-[--border-subtle]');
    content = content.replace(/bg-red-500/g, 'bg-[--text-primary]');
    content = content.replace(/hover:bg-red-100/g, 'hover:bg-gray-200');
    content = content.replace(/hover:text-red-400/g, 'hover:text-[--text-primary]');
    content = content.replace(/hover:border-red-900\/40/g, 'hover:border-[--border-subtle]');

    // Replace blue with grayscale
    content = content.replace(/bg-blue-50/g, 'bg-[--bg-elevated]');
    content = content.replace(/text-blue-[67]00/g, 'text-[--text-primary]');
    content = content.replace(/border-blue-200/g, 'border-[--border-subtle]');
    content = content.replace(/bg-blue-600/g, 'bg-gray-800');
    content = content.replace(/hover:bg-blue-700/g, 'hover:bg-gray-900');
    content = content.replace(/hover:bg-blue-100/g, 'hover:bg-gray-200');
    content = content.replace(/text-blue-400/g, 'text-[--text-primary]');
    content = content.replace(/bg-blue-950\/20/g, 'bg-[--bg-elevated]');
    content = content.replace(/bg-blue-950\/40/g, 'bg-[--bg-elevated]');
    content = content.replace(/border-blue-900\/40/g, 'border-[--border-subtle]');

    // Replace amber with gold
    content = content.replace(/bg-amber-50/g, 'bg-gold/10');
    content = content.replace(/text-amber-[67]00/g, 'text-gold');
    content = content.replace(/border-amber-200/g, 'border-gold/30');

    // Replace purple/indigo if any
    content = content.replace(/bg-purple-50/g, 'bg-[--bg-elevated]');
    content = content.replace(/text-purple-[67]00/g, 'text-[--text-primary]');
    content = content.replace(/border-purple-200/g, 'border-[--border-subtle]');
    content = content.replace(/bg-indigo-50/g, 'bg-[--bg-elevated]');
    content = content.replace(/text-indigo-[67]00/g, 'text-[--text-primary]');
    content = content.replace(/border-indigo-200/g, 'border-[--border-subtle]');
    
    // Any remaining green/red text
    content = content.replace(/text-green-[456]00/g, 'text-[--text-primary]');
    
    // Add specific tweaks for gold/white where appropriate
    content = content.replace(/#f5a623/g, 'gold'); // although this is already gold, it normalizes it if needed but let's be careful. Wait, I'll just use text-gold if it's #f5a623 in class.
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
