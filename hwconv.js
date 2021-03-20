// Nodejs v5.2.0
// For Cygwin: Win32 Environment
if(process.argv.length != 4){
	console.log('Incorrect arguments.\n\nUsage: <pipe_to_stdout> |node hwconv.js <outputTxtFile>');
	process.exit(1);
}
require('./JuRw.js')
var fs = require('fs')

// Usage: pipe something |node hwconv.js [outputTxt]
/** Data Structure (part) Of document.xml
	<w:document>
		<w:body>
			<w:tblGrid>
			<w:tr>	<== Define a row
				<w:tc>	<== Define a colum
					<w:p>	<== Define a paragraph (aka. line, add newline character)
						<w:t>	<== Define texts
							Text
						</w:t>
				</w:tc>
			</w:tr>
		</w:body>
	</w:document>
*/

var xhwGrid = new XML(fs.readFileSync(process.argv[2],'utf-8').toString('binary'));

var xlines = xhwGrid.getByTagName('w:tr');

var txt='';

var subjmod='';
var compactWeb = {};
var subjs=['c','m','e','z','b','p'];
var subjpos=0;

// get line
for(var i=0,n=xlines.length;i<n;++i){
	var xline = xlines[i];

	// get colum
	var xcols = xline.getByTagName('w:tc');
	for(var j=0,nn=xcols.length;j<nn;++j){
		var xitem = xcols[j];
		var item = '';

		// parse paragraphs
		var xparas = xitem.getByTagName('w:p');
		for(var k=0,nnn=xparas.length;k<nnn;++k){
			var xpara = xparas[k];

			// get texts
			var xtexts = xpara.getByTagName('w:t');
			for(var q=0,qn=xtexts.length;q<qn;++q){
				item += xtexts[q].innerHTML;
			}
			item += '\n\t';	// paragraph end, add a new line
		}

		switch(j){
		default:
			console.log('Warning: Table overflow on row '+(i+1)+' colum '+(j+1));
			break;
		case 0:
			// Subject
			txt += item;
			console.log(item.replace(new RegExp('\n\t','g'),''));
			// switch subj mode
			/* switch(item.trim().replace(new RegExp('\n\t','g'),'').trim()){
				case '语文': subjmod = 'c';break;
					break;
				case '数学': subjmod = 'm';break;
					break;
				case '英语': subjmod = 'e';break;
					break;
				case '地理': subjmod = 'p';break;
					break;
				case '生物': subjmod = 'b';break;
					break;
				case '历史': subjmod = 'z';break;
					break;
			}*/
			subjmod = subjs[subjpos++];
			break;
		case 1:
			// Content
			// to fix per-line has no TAB, has added TAB to line 48
			txt += item + '\n';
			compactWeb[subjmod] = item.trim().replace(new RegExp('\t','g'), '');
			break;
		}
	}
}

fs.writeFileSync(process.argv[3], txt, {encoding:'utf-8'});

// Add Homework Wallpaper Support
var d = new Date();
fs.writeFileSync('C:\\c8api\\data\\'+d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate()+'.json', JSON.stringify(compactWeb));
