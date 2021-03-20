// JuRt for network

const HTTP = require('http');
const HTTPS = require('https');
const URL = require('url');
// const readline = require('readline');
const fs = require('fs');

const modpt = __dirname;

function GFILE(url){
	var Purl = url.split("?",1)[0];
	var Purl2 = url.split("#",1)[0];
	if(Purl2.length!=0 && (Purl2.length < Purl.length)) Purl = Purl2;
	return Purl.substring(Purl.lastIndexOf("/")+1);
}

function WGET(url, calb){
	
	var callback = calb;
	
	if(!url){
		console.log('Parse Error.');
		return;
	}
	
	var up = URL.parse(url);
	this.ops = {
		host: up.hostname,
		port: up.port,
		path: up.path || '/',
		method: 'GET'
	};
	
	var body = '';
	var error = false;
	var err;
	var fin = false;
	
	var clbk = function(res){
		res.on('data', function(dat){
			body += dat;
		});
		res.on('end', function(dat){
			fin = true;
			if(callback) callback(err, body);
		});
	}
	
	switch(up.protocol){
		default:
			console.log('Unknown protocol, trying HTTP...');
		case 'http:':
			this.ops.port = this.ops.port || '80';
			var req = HTTP.request(this.ops, clbk);
			break;
		case 'https:':
		this.ops.port = this.ops.port || '443';
			var req = HTTPS.request(this.ops, clbk);
			break;
	}
	req.on('error', function(er){
		console.log('Error:', er);
		error = true;
		err = er;
		if(this.callback) this.callback(err);
	});
	req.end();
	
	this.getData = function(){
		if(error) return ['error', err];
		if(!fin) return ['unfinished'];
		return ['ok', body];
	}
	
	this.onDone = function(cb){
		callback = cb;
	}
}

function XML(content){
	
	var c = content.toString();
	this.tago = [];
	
	// init
	var i=0;
	this.iSpace = function(ch){
		if( ch==' ' || ch=='\n' || ch=='\r' || ch=='\t') return true;
		return false;
	}
	this.iNum = function(ch){
		var ich = ch.charCodeAt();
		return ( (ich>=48 && ich<=57) || ch=='.' || ch=='-' );
	}
	this.sKntil = function(ch, dat){
		var d = dat || c;
		while(d.charAt(i) != ch) ++i;
	}
	this.sKntilRev = function(ch, dat){
		var d = dat || c;
		while(true){
			if(d.charAt(i) == ch){
				if(d.charAt(i-1) != '\\') break;
			}
			++i;
		}
		
	}
	this.sKpace = function(dat){
		var d = dat || c;
		while(this.iSpace(d.charAt(i))) ++i;
	}
	this.iEnd = function(ch){
		if( ch==' ' || ch=='>' || ch=='/' || ch=='\t' || ch=='=') return true;
		return false;
	}
	this.sKnd = function(dat){
		var d = dat || c;
		while(!this.iEnd(d.charAt(i))) ++i;
	}
	
	this.mkObj = function(part, putInner){
		var stend = this.tago[part];
		var cont = c.substring(stend.start, stend.end);
		// var obj = {};
		var obj = new XML(cont);
		
		// parse
		i = 0;
		var attrs = cont.substring(0,cont.indexOf('>')+1);
		attrs = attrs.substring(attrs.indexOf('<'), attrs.length);
		var n = attrs.length;
		
		this.sKpace(attrs);
		
		// var start = i;
		this.sKnd(attrs);
		i++;
		// obj.tagName = attrs.substring(start+1, i-1).toUpperCase();
		obj.tagName = stend.name;	// .toUpperCase();

		attrloop:
		while(i < n){
			this.sKpace(attrs);
			
			var start = i;
			this.sKnd(attrs);
			switch(attrs.charAt(i)){
				case '/':
					++i;
				case '>':
					// end
					++i;
					break attrloop;
			}
			var attrNs = attrs.substring(start, i);
			if(attrs.charAt(i)=='='){
				// has value
				start = ++i;
				if(attrs.charAt(i) == '"'){
					++i;
					this.sKntilRev('"', attrs);
					++i;
					obj[attrNs] = attrs.substring(start+1, i-1);
				}
			}else{
				obj[attrNs] = true;
			}
		}
		if(stend.inner && putInner){
			// has inner
			// this.sKntilRev('>', cont);
			// ++i;
			this.sKpace(cont);
			start = i;
			var end = cont.lastIndexOf('<');
			obj.innerHTML = cont.substring(start, end);
		}
		
		return obj;
	}
	
	
	// tago[n] = {tagname, start, end, hasinnerHTML}
	
	this.load = function(d){
		d = d || 0;
		this.sKpace();
		
		var start = c.indexOf('<',i);
		mainloop:
		while(start >= 0){
			i = start = c.indexOf('<',i)	// tag start
			if(start<0) break;
			switch(c.charAt(start+1)){
				default:
					// get tagname
					// var start = i+1;
					var sta = i+1;
					this.sKnd();
					var tagName = c.substring(sta, i);
					break;
				case '?':
				case '!':
					this.sKntil('>');
					continue mainloop;
				case '/':
					// outHTML end sign
					//i--;
					// fix previous tag
					// wanna find it by tag name
					i+=2;
					var tgs = i;
					this.sKnd();
					var tgName = c.substring(tgs, i);
					var n = this.tago.length;
					for(var j = n-1; j >= 0; --j){
						var tag = this.tago[j];
						if(tag.name == tgName && tag.inner == undefined){
							tag.end = i+1;
							tag.inner = true;
							break;
						}
					}
					this.sKntil('>');
					i++;
					continue mainloop;
					// break mainloop;
			}
			this.sKntil('>');	// tag end
			var hasInner = undefined;
			// strict mode
			if(c.charAt(i-1) == '/'){
				hasInner = false;
			}
			// make a object first, change it later
			this.sKntil('>');
			i++;
			// this.tago.push([tagName, start, i, hasInner, ]);
			this.tago.push({
				name: tagName,
				start: start,
				end: i,
				inner: hasInner
			});
		}
	}
	
	this.load();
	
	this.getByTagName = function(name, putInner){
		if(putInner == undefined) putInner = true;
		name = name.toString();
		var ret = [];
		var n = this.tago.length;
		for(var x=0;x<n;++x){
			if(this.tago[x].name == name){
				ret.push(this.mkObj(x,putInner));
			}
		}
		return ret;
	}
	
	this.getByAttr = function(attr,v, putInner){
		if(putInner == undefined) putInner = true;
		var ret = [];
		var n = this.tago.length;
		for(var x=0;x<n;++x){
			var obj = this.mkObj(x, putInner);
			var attrs = Object.keys(obj);
			var nn = attrs.length;
			checkloop:
			for(var j=0;j<nn;++j){
				var y = attrs[j];
				switch(y){
					case attr:
						if(obj[y] == v){
							ret.push(obj);
							break checkloop;
						}
						break;
					case 'innerHTML':
					case 'tagName':
						break;
				}
			}
		}
		return ret;
	}
}


/* format@path:
	[ [ cmd, [ x, y ], ... ], ... ]
*/
function SVG(d,scale,offX,offY){
	this.scale = scale || 1;
	this.path = [];
	this.length = 0;
	this.offX = offX || 0;
	this.offY = offY || 0;
	
	if(!d) d = 'z';
	d = d.toString().trim();
	
	// boolean: absolute ; boolean: push?
	this.Donfig = {
		'M': [1, true, false],
		'm': [1,false, false],
		
		'C': [3, true, true],
		'c': [3, false, true],
		
		'S': [2, true, true],
		's': [2, false, true],
		
		'L': [1, true, true],
		'l': [1, false, true],
		
		'Z': [0, true, true],
		'z': [0, true, true],
		
		'Q': [2, true, true],
		'q': [2, false, true],
		
		'T': [1, true, true],
		't': [1, false, true],
		
		'H': [-1, true, true, 'x'],
		'h': [-1, false, true, 'x'],
		
		'V': [-1, true, true, 'y'],
		'v': [-1, false, true, 'y']
	}
	this.DL = [0];
	tmPoint = [0,0];
	
	/* INIT */
	// parse PATH
	var i = 0;
	this.iSpace = function(ch){
		if( ch==' ' || ch=='\n' || ch=='\r' || ch==',' || ch=='\t') return true;
		return false;
	}
	this.iNum = function(ch){
		var ich = ch.charCodeAt();
		return ( (ich>=48 && ich<=57) || ch=='.' || ch=='-' );
	}
	this.sKpace = function(){
		while(this.iSpace(d.charAt(i))) ++i;
	}
	this.getCmd = function(){
		this.sKpace();
		return d.charAt(i++);
	}
	this.next = function(save, rel){
		this.sKpace();
		var ch = d.charAt(i);
		var sti = i;
		var num = 0;
		var neg = false;
		var flt = -1;
		while( this.iNum(ch) ){
			var ich = ch.charCodeAt();
			if(ch == '-'){
				if(sti==i)neg = true;
				else break;
			}
			else if(ch == '.') flt = 0;
			else if( flt != -1){
				// float
				num += (ich-48) * Math.pow(0.1, ++flt);
			}else{
				num *= 10;
				num += (ich-48);
			}
			ch = d.charAt(++i);
		}
		
		num = neg?-num:num;
		
		if(save == 'x') save = 1;
		if(save == 'y') save = 2;
		if(save){
			save--;
			if(rel) num += tmPoint[save];
			// tmPoint[save] = num;
			var bkp = tmPoint.slice();
			bkp[save] = num;
			tmPoint = bkp;
		}
		return num;
	}
	this.nextps = function(n, rel){
		var points = [tmPoint];
		var x = tmPoint[0];
		var y = tmPoint[1];
		if(rel){
			for(var i=0;i<n; ++i){
				points.push( [ x+this.next() , y+this.next() ] );
			}
		}else{
			for(var i = 0;i<n; ++i){
				points.push( [ this.next() , this.next() ] );
			}
		}
		tmPoint = points[n];
		return points;
	}
	/* this.nextpsRelative = function(n){
		var points = [tmPoint];
		var x = tmPoint[0];
		var y = tmPoint[1];
		for(var i=0;i<n; ++i){
			points.push( [ x+this.next() , y+this.next() ] );
		}
		tmPoint = points[n];
		return points;
	}*/

	var mvStart = [0,0];
	while( i<d.length ){
		var ch = this.getCmd();
		if(this.Donfig[ch][0] >= 0) var dat = this.nextps(this.Donfig[ch][0], !this.Donfig[ch][1])
		else var dat = [tmPoint, (this.Donfig[ch][3]=='x')?[this.next(this.Donfig[ch][3], !this.Donfig[ch][1]), tmPoint[1]]:[tmPoint[0], this.next(this.Donfig[ch][3], !this.Donfig[ch][1])]];
		
		var cmd = ch.toUpperCase();
		/* Fixs */
		switch(cmd){
			case 'Z':
				dat.push(tmPoint = /*this.path[0][1][0]*/mvStart);
				// ch = 'L';
				break;
			case 'S':
			case 'T':
				var ldat = this.path[this.path.length-1];
				var indep = false;
				if(ldat){
					var ld = ldat[1];
					switch(ldat[0]){
						default:
							// indep
							indep = true;
							break;
						case 'T':
						case 'Q':
							if(cmd != 'T'){indep = true;break;}
							//dat = [[2*ld[1][0]-ld[0][0], 2*ld[1][1]-ld[0][1]]].concat(dat);
							// dat = [[2*ld[2][0]-ld[1][0], 2*ld[2][1]-ld[1][1]]].concat(dat);
							dat = [dat[0]].concat([[2*ld[2][0]-ld[1][0], 2*ld[2][1]-ld[1][1]]]).concat(dat.slice(1));
							break;
						case 'S':
						case 'C':
							if(cmd != 'S'){indep = true;break;}
							// dat = [[2*ld[2][0]-ld[1][0], 2*ld[2][1]-ld[1][1]]].concat(dat);
							dat = [dat[0]].concat([[2*ld[3][0]-ld[2][0], 2*ld[3][1]-ld[2][1]]]).concat(dat.slice(1));
							break;
					}
				}else{
					// indep
					indep = true;
				}
				if(indep){
					// dat.concat(dat);
					dat = [ldat[1][ldat[1].length-1]].concat(dat);
				}
				break;
			case 'M':
				mvStart = dat[1].slice();
				break;
		}
		// console.log(JSON.stringify(dat))
		
		if(this.Donfig[ch][2]) this.path.push( [cmd, dat] );
	}
	
	// console.log(JSON.stringify(this.path).replace(new RegExp(']]','g'),']]\n'))
	
	
	this.calcPoint = function(parg, per){
		var CMD = this.path[parg];
		var ps = CMD[1];
		var tmp = 1 - per;
		switch(CMD[0]){
			case 'S':
			case 'C':
				return { x: ps[0][0] * Math.pow(tmp,3) + 3 * ps[1][0] * per * tmp * tmp + 3 * ps[2][0] * per * per * tmp + ps[3][0] * Math.pow(per,3), y: ps[0][1] * Math.pow(tmp,3) + 3 * ps[1][1] * per * tmp * tmp + 3 * ps[2][1] * per * per * tmp + ps[3][1] * Math.pow(per,3) }
			case 'T':
			case 'Q':
				return { x: ps[0][0] * tmp * tmp + 2 * ps[1][0] * tmp * per + ps[2][0] * per * per, y: ps[0][1] * tmp * tmp + 2 * ps[1][1] * tmp * per + ps[2][1] * per * per }
			case 'V':
			case 'H':
			case 'Z':
			case 'L':
				return { x: per*ps[1][0] + tmp*ps[0][0], y: per*ps[1][1] + tmp*ps[0][1] }
		}
	}
	
	// Calculate Length
	// vars: DL
	var samp = 0.01;
	
	function calcLength(a,b){
		var dx = Math.abs(b.x-a.x);
		var dy = Math.abs(b.y-a.y);
		return Math.sqrt(dx*dx + dy*dy);
	}
	
	for (var i=0;i<this.path.length;++i){
		var k = i+1;
		var dp = this.path[i];
		//this.DL.push(0);
		this.DL[k] = 0;
		switch(dp[0]){
			case 'S':
			case 'T':
			case 'Q':
			case 'C':
				var lst = this.calcPoint(i, 0);
				for(var j=samp;j<=1;j+=samp){
					var st = this.calcPoint(i, j);
					this.DL[k] += calcLength(st,lst);
					lst = st;
				}
				break;
			case 'V':
			case 'H':
			case 'Z':
			case 'L':
				var p = dp[1];
				this.DL[k] = calcLength({x: p[0][0], y:p[0][1]}, {x: p[1][0], y:p[1][1]});
				break;
		}
		this.length = (this.DL[k] += this.DL[i]);
	}
	
	this.getPointAtLength = function(l){
		var lstl = this.DL[this.DL.length-1];
		while(lstl < l) l-=lstl;
		
		var parg = 0;
		// Fixed for d=undefined
		while(this.DL[parg] <= l && this.DL[parg+1] != undefined) ++parg;
		parg--;
		
		return this.calcPoint(parg, (l - this.DL[parg])/(this.DL[parg+1]-this.DL[parg]));
	}
	
	
	this.f = function(t){
		var p = this.getPointAtLength(this.length*t);
		return new C(p.x, p.y).time(this.scale).plus(new C(this.offX,this.offY));
	}
	
	this.getPoints = function(samp){
		samp = samp || 0.001;
		points = [];
		for(var i=0;i<=1;i+=samp){
			var c = this.f(i);
			points.push([c.a, c.b]);
		}
		return points;
	}
}
SVG.parseFile = function(path,scale,offX,offY){
	try{
		var content = fs.readFileSync(path).toString();
	}catch(e){
		process.stderr.write('Error when loading svg file.\n');
		// process.exit(1);
		return;
	}
	var start = content.indexOf(' d="');
	if(start < 0) start = content.indexOf('\nd="');
	content = content.substring(start+4,content.length);
	return new SVG(content.substring(0,content.indexOf('"')),scale,offX,offY);
}

function setInterv(cb, time, ROOT){
	return new Promise(function(resolve, reject){
		setTimeout(function(){
			if(cb.bind(ROOT)()) setTimeout(arguments.callee, time);
			else resolve();
		},time);
	});
}

/* untested */
function readlineSync(input){
	var ret = '';
	if(input == null || input == undefined) input = process.stdin;
	// if(output == null || output == undefined) output = process.stdout;
	try{process.stdin.setRawMode(true);}catch(e){}
	/* var x = new Promise(function(res, rej){
		readline.createInterface({
			input: input,
			output: output
		}).question(quest, function(ans){
			ret = ans;
			try{rl.close()}catch(e){}
			res();
		});
	});*/
	var buf = new Buffer(1);
	try{
		while(fs.readSync(input.fd, buf, 0, 1)){
			if(String.fromCharCode(buf[0]) == '\n') break;
			ret += buf.toString('binary');
		}
	}catch(e){}
	return ret;
}

GLOBAL.GFILE = GFILE;
GLOBAL.XML = XML;
GLOBAL.SVG = SVG;
GLOBAL.WGET = WGET;

GLOBAL.setInterv = setInterv;
GLOBAL.readlineSync = readlineSync;
