const pdfLib = require('pdf-parse');

async function test() {
    console.log('--- Debugging pdf-parse ---');
    try {
        console.log('1. Trying direct call...');
        // await pdfLib(Buffer.from('dummy')); 
        console.log('   (Skipped because typeof is object)');
    } catch (e) { console.log('   Failed:', e.message); }

    try {
        console.log('2. Trying new pdfLib.PDFParse(buffer)...');
        // Mock buffer logic might fail inside if real PDF structure needed
        // but we want to see if it INSTANTIATES
    } catch (e) { console.log('   Failed:', e.message); }

    // Check if main entry point is hidden
    try {
        const deep = require('pdf-parse/lib/pdf-parse.js');
        console.log('3. Deep require type:', typeof deep);
    } catch (e) { console.log('3. Deep require failed:', e.message); }
}

test();
