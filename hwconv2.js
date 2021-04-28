// Nodejs v5.2.0
// For Cygwin: Win32 Environment
if(process.argv.length != 3){
	console.log('Incorrect arguments.\n\nUsage: node hwconv.js <inputTxtFile>');
	process.exit(1);
}
require('./JuRw.js')
var fs = require('fs')

// just send them to c8api
// hwconv v2 powered by jurt v5
// based on hwconv v1

// Usage: pipe something |node hwconv.js [inputTxt]
// inputTxt is somewhere the output of C15Support

var Txt = fs.readFileSync(process.argv[2], 'utf-8');
var txts = Txt.split('\n');

var subjmod = -1;
var compactWeb = {};
var subjs=['c','m','e','z','b','p'];
var subjLnk = ['语文','数学','英语','历史','生物','地理'];


// init
for(var x of subjs){
	compactWeb[x] = '';
}

// get line
for(var i=0,n=txts.length;i<n;++i){
	var xline = txts[i];
	
	if(xline.trim() != ''){
		if(new RegExp('[ \t]+').test(xline)){
			// is not a subj, just ignore or put
			if(subjmod != -1){
				// put
				try{
					compactWeb[subjs[subjmod]] += xline.replace(new RegExp('\t','g'), '') + '\n';	// and ignore tabs
				}catch(e){
					console.log(e);
				}
			}
		}else{
			subjmod++;
		}
	}
}

console.log(compactWeb);

// Add Homework Wallpaper Support
var d = new Date();
fs.writeFileSync('C:\\c8api\\data\\'+d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate()+'.json', JSON.stringify(compactWeb));
