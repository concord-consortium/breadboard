!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.sparks=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function(){var d=function(){this.components=[];this.nodeMap={};this.nodes=[];this.voltageSources=[];this.AMatrix=[];this.ZMatrix=[];this.referenceNode=null;this.referenceNodeIndex=null};d.prototype.getLinkedComponents=function(e){return this.nodeMap[e]};d.prototype.getDiagonalMatrixElement=function(h,k){var l=this.nodeMap[h],e=$Comp(0,0),g,f;for(f=l.length-1;f>=0;f--){g=l[f].getImpedance(k);e=e.add(g.inverse())}return e};d.prototype.getNodeIndexes=function(f){var e=[];e[0]=this.getNodeIndex(f.nodes[0]);e[1]=this.getNodeIndex(f.nodes[1]);return e};d.prototype.getNodeIndex=function(f){var e=this.nodes.indexOf(f);if(e===this.referenceNodeIndex){return -1}if(e>this.referenceNodeIndex){return e-1}return e};var b=function(h,f,g,e){this.id=h;this.type=f;this.value=g;this.nodes=e};var c=2*Math.PI;b.prototype.getImpedance=function(f){var e=$Comp(0,0);if(this.type==="Resistor"){e.real=this.value;e.imag=0}else{if(this.type=="Capacitor"){e.real=0;e.imag=-1/(c*f*this.value)}else{if(this.type=="Inductor"){e.real=0;e.imag=c*f*this.value}}}return e};b.prototype.getOffDiagonalMatrixElement=function(e){return this.getImpedance(e).inverse().negative()};var a=function(i,h,f,e,g){this.id=i;this.voltage=h;this.positiveNode=f;this.negativeNode=e;this.frequency=g||0};d.prototype.addComponent=function(n,h,m,l){var e=new b(n,h,m,l),f,g,k;this.components.push(e);for(f=0,g=l.length;f<g;f++){k=l[f];if(!this.nodeMap[k]){this.nodeMap[k]=[];this.nodes.push(k)}this.nodeMap[k].push(e)}};d.prototype.addVoltageSource=function(k,i,f,e,h){var g=new a(k,i,f,e,h);this.voltageSources.push(g);if(!this.nodeMap[f]){this.nodeMap[f]=[];this.nodes.push(f)}if(!this.nodeMap[e]){this.nodeMap[e]=[];this.nodes.push(e)}if(!this.referenceNode){this.setReferenceNode(e)}};d.prototype.setReferenceNode=function(e){this.referenceNode=e;this.referenceNodeIndex=this.nodes.indexOf(e)};d.prototype.createAMatrix=function(){this.createEmptyAMatrix();this.addGMatrix();this.addBCMatrix()};d.prototype.createEmptyAMatrix=function(){var g=$Comp(0,0),k=this.nodes.length,e=this.voltageSources.length,l=k-1+e,h,f;this.AMatrix=[];for(h=0;h<l;h++){this.AMatrix[h]=[];for(f=0;f<l;f++){this.AMatrix[h][f]=g.copy()}}};d.prototype.addGMatrix=function(){var l,m,h,g,k,f,n,e;if(this.voltageSources.length>0){l=this.voltageSources[0];m=l.frequency}for(h=0;h<this.nodes.length;h++){k=this.nodes[h];if(k===this.referenceNode){continue}f=this.getNodeIndex(k);this.AMatrix[f][f]=this.getDiagonalMatrixElement(k,m)}for(h=0;h<this.components.length;h++){n=this.getNodeIndexes(this.components[h])[0];e=this.getNodeIndexes(this.components[h])[1];if(n===-1||e===-1){continue}this.AMatrix[n][e]=this.AMatrix[e][n]=this.AMatrix[n][e].add(this.components[h].getOffDiagonalMatrixElement(m))}};d.prototype.addBCMatrix=function(){if(this.voltageSources.length===0){return}var g=$Comp(1,0),n=g.negative(),e=this.voltageSources,k,l,h,m,f;for(f=0;f<e.length;f++){k=e[f];l=k.positiveNode;if(l!==this.referenceNode){m=this.getNodeIndex(l);this.AMatrix[this.nodes.length-1+f][m]=g.copy();this.AMatrix[m][this.nodes.length-1+f]=g.copy()}h=k.negativeNode;if(h!==this.referenceNode){m=this.getNodeIndex(h);this.AMatrix[this.nodes.length-1+f][m]=n.copy();this.AMatrix[m][this.nodes.length-1+f]=n.copy()}}};d.prototype.createZMatrix=function(){var g=$Comp(0,0),k=this.nodes.length,e=this.voltageSources.length,l=k-1+e,f=this.voltageSources,h;this.ZMatrix=[[]];for(h=0;h<l;h++){this.ZMatrix[0][h]=g.copy()}for(h=0;h<f.length;h++){this.ZMatrix[0][k-1+h].real=f[h].voltage}};d.prototype.cleanCircuit=function(){var f=this.nodes,q=this.nodeMap,m=this.components,r,o=this.referenceNode,s=[],e,g,h,t;function p(u){var w=[];for(var v in u){w[v]=u[v]}return w}q=p(q);function k(u){var x=[];for(var v=0,w=u.length;v<w;v++){if(u[v]!==null){x.push(u[v])}}return x}function n(v,B){var x=B[v],C,w,D=[],u,z,E,y,A;if(v===o){return true}if(~s.indexOf(v)){return true}if(!x||x.length===0){return false}delete B[v];for(z=0,E=x.length;z<E;z++){C=x[z];w=p(C.nodes);w.splice(w.indexOf(v),1);D=D.concat(w)}for(y=0,A=D.length;y<A;y++){if(n(D[y],B)){s.push(v);return true}}return false}for(h=0,t=f.length;h<t;h++){g=f[h];if(g){if(!n(g,q)){f[h]=null}}}this.nodes=k(f);q=this.nodeMap;function l(u,y){var x=p(q[y]),v,w;q[y]=[];for(v=0,w=x.length;v<w;v++){if(x[v].id!==u.id){q[y].push(x[v])}}}for(h=0,t=m.length;h<t;h++){r=m[h];if(!(~f.indexOf(r.nodes[0])&&~f.indexOf(r.nodes[1]))){l(r,r.nodes[0]);l(r,r.nodes[1]);m[h]=null}}this.components=k(m);for(h=0,t=this.voltageSources.length;h<t;h++){e=this.voltageSources[h];if(!(~f.indexOf(e.positiveNode)&&~f.indexOf(e.negativeNode))){this.voltageSources[h]=null}}this.voltageSources=k(this.voltageSources);this.referenceNodeIndex=this.nodes.indexOf(o)};d.prototype.solve=function(){this.cleanCircuit();this.createAMatrix();this.createZMatrix();aM=$M(this.AMatrix);zM=$M(this.ZMatrix);invAM=aM.inv();res=zM.x(invAM);return res};d.prototype.getVoltageAt=function(g){if(g===this.referenceNode){return $Comp(0)}try{var f=this.solve();return f.elements[0][this.getNodeIndex(g)]}catch(h){return $Comp(0)}};d.prototype.getVoltageBetween=function(f,e){return this.getVoltageAt(f).subtract(this.getVoltageAt(e))};d.prototype.getCurrent=function(n){var k,g,f=null,h,l;try{k=this.solve()}catch(m){return $Comp(0)}g=this.voltageSources;for(h=0,l=g.length;h<l;h++){if(g[h].id==n){f=h;break}}if(f===null){try{throw Error("No voltage source "+n)}catch(m){return $Comp(0)}}try{return k.elements[0][this.nodes.length-1+f]}catch(m){return $Comp(0)}};window.CiSo=d})();var Complex=function(b,a){if(!(this instanceof Complex)){return new Complex(b,a)}if(typeof b==="string"&&a===null){return Complex.parse(b)}this.real=b||0;this.imag=a||0;this.magnitude=Math.sqrt(this.real*this.real+this.imag*this.imag);this.angle=Math.atan2(this.imag,this.real)};Complex.prototype={copy:function(){return new Complex(this.real,this.imag)},add:function(a){var c,b;if(a instanceof Complex){c=a.real;b=a.imag}else{c=a;b=0}return new Complex(this.real+c,this.imag+b)},subtract:function(a){var c,b;if(a instanceof Complex){c=a.real;b=a.imag}else{c=a;b=0}return new Complex(this.real-c,this.imag-b)},multiply:function(a){var e,d,c,b;if(a instanceof Complex){e=a.real;d=a.imag}else{e=a;d=0}c=this.real*e-this.imag*d;b=this.real*d+this.imag*e;return new Complex(c,b)},divide:function(a){var f,e,b,d,c;if(a instanceof Complex){f=a.real;e=a.imag}else{f=a;e=0}b=f*f+e*e;d=(this.real*f+this.imag*e)/b;c=(this.imag*f-this.real*e)/b;return new Complex(d,c)},inverse:function(){var a=new Complex(1,0);return a.divide(this)},negative:function(){var a=new Complex(0,0);return a.subtract(this)},equals:function(a){if(a instanceof Complex){return this.real===a.real&&this.imag===a.imag}else{if(typeof a==="number"){return this.real===a&&this.imag===0}}return false},toString:function(){return this.real+"i"+this.imag}};Complex.parse=function(c){if(!c){return null}var b=/(.*)([+,\-].*i)/.exec(c),d,a;if(b&&b.length===3){d=parseFloat(b[1]);a=parseFloat(b[2].replace("i",""))}else{d=parseFloat(c);a=0}if(isNaN(d)||isNaN(a)){throw new Error("Invalid input to Complex.parse, expecting a + bi format, instead was: "+c)}return new Complex(d,a)};$Comp=function(){if(typeof arguments[0]==="string"){return Complex.parse(arguments[0])}return new Complex(arguments[0],arguments[1])};var Sylvester={version:"0.1.3-cc",precision:0.000001};function Matrix(){}Matrix.prototype={dup:function(){return Matrix.create(this.elements)},canMultiplyFromLeft:function(a){var b=a.elements||a;if(typeof(b[0][0])=="undefined"){b=Matrix.create(b).elements}return(this.elements[0].length==b.length)},multiply:function(q){if(!q.elements){return this.map(function(c){return c.multiply(q)})}var h=q.modulus?true:false;var n=q.elements||q;if(typeof(n[0][0])=="undefined"){n=Matrix.create(n).elements}if(!this.canMultiplyFromLeft(n)){return null}var e=this.elements.length,f=e,l,b,d=n[0].length,g;var p=this.elements[0].length,a=[],m,k,o;do{l=f-e;a[l]=[];b=d;do{g=d-b;m=$Comp(0,0);k=p;do{o=p-k;m=m.add(this.elements[l][o].multiply(n[o][g]))}while(--k);a[l][g]=m}while(--b)}while(--e);var n=Matrix.create(a);return h?n.col(1):n},x:function(a){return this.multiply(a)},isSquare:function(){return(this.elements.length==this.elements[0].length)},toRightTriangular:function(){var f=this.dup(),d;var b=this.elements.length,c=b,e,g,h=this.elements[0].length,a;do{e=c-b;if(f.elements[e][e].equals(0)){for(j=e+1;j<c;j++){if(!f.elements[j][e].equals(0)){d=[];g=h;do{a=h-g;d.push(f.elements[e][a].add(f.elements[j][a]))}while(--g);f.elements[e]=d;break}}}if(!f.elements[e][e].equals(0)){for(j=e+1;j<c;j++){var l=f.elements[j][e].divide(f.elements[e][e]);d=[];g=h;do{a=h-g;d.push(a<=e?$Comp(0):f.elements[j][a].subtract(f.elements[e][a].multiply(l)))}while(--g);f.elements[j]=d}}}while(--b);return f},toUpperTriangular:function(){return this.toRightTriangular()},determinant:function(){if(!this.isSquare()){return null}var e=this.toRightTriangular();var c=e.elements[0][0],d=e.elements.length-1,a=d,b;do{b=a-d+1;c=c.multiply(e.elements[b][b])}while(--d);return c},det:function(){return this.determinant()},isSingular:function(){return(this.isSquare()&&this.determinant().equals(0))},augment:function(l){var h=l.elements||l;if(typeof(h[0][0])=="undefined"){h=Matrix.create(h).elements}var e=this.dup(),k=e.elements[0].length;var c=e.elements.length,d=c,g,a,b=h[0].length,f;if(c!=h.length){return null}do{g=d-c;a=b;do{f=b-a;e.elements[g][k+f]=h[g][f]}while(--a)}while(--c);return e},inverse:function(){if(!this.isSquare()||this.isSingular()){return null}var c=this.elements.length,d=c,h,g;var k=this.augment(Matrix.I(c)).toRightTriangular();var l,m=k.elements[0].length,a,f,b;var n=[],e;do{h=c-1;f=[];l=m;n[h]=[];b=k.elements[h][h];do{a=m-l;e=k.elements[h][a].divide(b);f.push(e);if(a>=d){n[h].push(e)}}while(--l);k.elements[h]=f;for(g=0;g<h;g++){f=[];l=m;do{a=m-l;f.push(k.elements[g][a].subtract(k.elements[h][a].multiply(k.elements[g][h])))}while(--l);k.elements[g]=f}}while(--c);return Matrix.create(n)},inv:function(){return this.inverse()},setElements:function(h){var m,a=h.elements||h;if(typeof(a[0][0])!="undefined"){var d=a.length,f=d,b,c,l;this.elements=[];do{m=f-d;b=a[m].length;c=b;this.elements[m]=[];do{l=c-b;this.elements[m][l]=a[m][l]}while(--b)}while(--d);return this}var e=a.length,g=e;this.elements=[];do{m=g-e;this.elements.push([a[m]])}while(--e);return this}};Matrix.create=function(a){var b=new Matrix();return b.setElements(a)};Matrix.I=function(f){var e=[],a=f,d,c,b;do{d=a-f;e[d]=[];c=a;do{b=a-c;e[d][b]=(d==b)?$Comp(1,0):$Comp(0)}while(--c)}while(--f);return Matrix.create(e)};var $M=Matrix.create;
},{}],2:[function(require,module,exports){
/*!
 * jQuery Nearest plugin v1.3.0
 *
 * Finds elements closest to a single point based on screen location and pixel dimensions
 * http://gilmoreorless.github.io/jquery-nearest/
 * Open source under the MIT licence: http://gilmoreorless.mit-license.org/2011/
 *
 * Requires jQuery 1.4 or above
 * Also supports Ben Alman's "each2" plugin for faster looping (if available)
 */
!function(t,e){function n(e,n,h){e||(e="div");var a,i,o,s=t(n.container),c=s.offset()||{left:0,top:0},f=[s.width()||0,s.height()||0],u={x:[c.left,c.left+f[0]],y:[c.top,c.top+f[1]],w:[0,f[0]],h:[0,f[1]]};for(a in u)u.hasOwnProperty(a)&&(o=r.exec(n[a]),o&&(i=u[a],n[a]=(i[1]-i[0])*o[1]/100+i[0]));n.sameX===!1&&n.checkHoriz===!1&&(n.sameX=!n.checkHoriz),n.sameY===!1&&n.checkVert===!1&&(n.sameY=!n.checkVert);var l=s.find(e),d=[],p=!!n.furthest,m=!n.sameX,y=!n.sameY,v=!!n.onlyX,x=!!n.onlyY,g=p?0:1/0,k=parseFloat(n.x)||0,w=parseFloat(n.y)||0,X=parseFloat(k+n.w)||k,Y=parseFloat(w+n.h)||w,F=parseFloat(n.tolerance)||0,S=!!t.fn.each2,H=Math.min,M=Math.max;!n.includeSelf&&h&&(l=l.not(h)),0>F&&(F=0),l[S?"each2":"each"](function(e,n){var r,h,a,i,o=S?n:t(this),s=o.offset(),c=s.left,f=s.top,u=o.outerWidth(),l=o.outerHeight(),j=c+u,z=f+l,O=M(c,k),P=H(j,X),V=M(f,w),W=H(z,Y),b=P>=O,q=W>=V;(m&&y||!m&&!y&&b&&q||m&&q||y&&b||m&&v||y&&x)&&(r=b?0:O-P,h=q?0:V-W,a=v||x?v?r:h:b||q?M(r,h):Math.sqrt(r*r+h*h),i=p?a>=g-F:g+F>=a,i&&(g=p?M(g,a):H(g,a),d.push({node:this,dist:a})))});var j,z,O,P,V=d.length,W=[];if(V)for(p?(j=g-F,z=g):(j=g,z=g+F),O=0;V>O;O++)P=d[O],P.dist>=j&&P.dist<=z&&W.push(P.node);return W}var r=/^([\d.]+)%$/;t.each(["nearest","furthest","touching"],function(r,h){var a={x:0,y:0,w:0,h:0,tolerance:1,container:document,furthest:"furthest"==h,includeSelf:!1,sameX:"touching"===h,sameY:"touching"===h,onlyX:!1,onlyY:!1};t[h]=function(r,h,i){if(!r||r.x===e||r.y===e)return t([]);var o=t.extend({},a,r,i||{});return t(n(h,o))},t.fn[h]=function(e,r){if(!this.length)return this.pushStack([]);var h;if(e&&t.isPlainObject(e))return h=t.extend({},a,e,r||{}),this.pushStack(n(this,h));var i=this.offset(),o={x:i.left,y:i.top,w:this.outerWidth(),h:this.outerHeight()};return h=t.extend({},a,o,r||{}),this.pushStack(n(e,h,this))}})}(jQuery);

},{}],3:[function(require,module,exports){
/*!
 * jQuery JavaScript Library v1.8.1
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: Thu Aug 30 2012 17:17:22 GMT-0400 (Eastern Daylight Time)
 */
(function( window, undefined ) {
var
	// A central reference to the root jQuery(document)
	rootjQuery,

	// The deferred used on DOM ready
	readyList,

	// Use the correct document accordingly with window argument (sandbox)
	document = window.document,
	location = window.location,
	navigator = window.navigator,

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$,

	// Save a reference to some core methods
	core_push = Array.prototype.push,
	core_slice = Array.prototype.slice,
	core_indexOf = Array.prototype.indexOf,
	core_toString = Object.prototype.toString,
	core_hasOwn = Object.prototype.hasOwnProperty,
	core_trim = String.prototype.trim,

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		return new jQuery.fn.init( selector, context, rootjQuery );
	},

	// Used for matching numbers
	core_pnum = /[\-+]?(?:\d*\.|)\d+(?:[eE][\-+]?\d+|)/.source,

	// Used for detecting and trimming whitespace
	core_rnotwhite = /\S/,
	core_rspace = /\s+/,

	// Make sure we trim BOM and NBSP (here's looking at you, Safari 5.0 and IE)
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	rquickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,

	// Match a standalone tag
	rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,

	// JSON RegExp
	rvalidchars = /^[\],:{}\s]*$/,
	rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
	rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
	rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d\d*\.|)\d+(?:[eE][\-+]?\d+|)/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return ( letter + "" ).toUpperCase();
	},

	// The ready event handler and self cleanup method
	DOMContentLoaded = function() {
		if ( document.addEventListener ) {
			document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
			jQuery.ready();
		} else if ( document.readyState === "complete" ) {
			// we're here because readyState === "complete" in oldIE
			// which is good enough for us to call the dom ready!
			document.detachEvent( "onreadystatechange", DOMContentLoaded );
			jQuery.ready();
		}
	},

	// [[Class]] -> type pairs
	class2type = {};

jQuery.fn = jQuery.prototype = {
	constructor: jQuery,
	init: function( selector, context, rootjQuery ) {
		var match, elem, ret, doc;

		// Handle $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Handle $(DOMElement)
		if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					context = context instanceof jQuery ? context[0] : context;
					doc = ( context && context.nodeType ? context.ownerDocument || context : document );

					// scripts is true for back-compat
					selector = jQuery.parseHTML( match[1], doc, true );
					if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
						this.attr.call( selector, context, true );
					}

					return jQuery.merge( this, selector );

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[2] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id !== match[2] ) {
							return rootjQuery.find( selector );
						}

						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return rootjQuery.ready( selector );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	},

	// Start with an empty selector
	selector: "",

	// The current version of jQuery being used
	jquery: "1.8.1",

	// The default length of a jQuery object is 0
	length: 0,

	// The number of elements contained in the matched element set
	size: function() {
		return this.length;
	},

	toArray: function() {
		return core_slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num == null ?

			// Return a 'clean' array
			this.toArray() :

			// Return just the object
			( num < 0 ? this[ this.length + num ] : this[ num ] );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems, name, selector ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		ret.context = this.context;

		if ( name === "find" ) {
			ret.selector = this.selector + ( this.selector ? " " : "" ) + selector;
		} else if ( name ) {
			ret.selector = this.selector + "." + name + "(" + selector + ")";
		}

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	ready: function( fn ) {
		// Add the callback
		jQuery.ready.promise().done( fn );

		return this;
	},

	eq: function( i ) {
		i = +i;
		return i === -1 ?
			this.slice( i ) :
			this.slice( i, i + 1 );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	slice: function() {
		return this.pushStack( core_slice.apply( this, arguments ),
			"slice", core_slice.call(arguments).join(",") );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: core_push,
	sort: [].sort,
	splice: [].splice
};

// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( length === i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({
	noConflict: function( deep ) {
		if ( window.$ === jQuery ) {
			window.$ = _$;
		}

		if ( deep && window.jQuery === jQuery ) {
			window.jQuery = _jQuery;
		}

		return jQuery;
	},

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
		if ( !document.body ) {
			return setTimeout( jQuery.ready, 1 );
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		if ( jQuery.fn.trigger ) {
			jQuery( document ).trigger("ready").off("ready");
		}
	},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	isArray: Array.isArray || function( obj ) {
		return jQuery.type(obj) === "array";
	},

	isWindow: function( obj ) {
		return obj != null && obj == obj.window;
	},

	isNumeric: function( obj ) {
		return !isNaN( parseFloat(obj) ) && isFinite( obj );
	},

	type: function( obj ) {
		return obj == null ?
			String( obj ) :
			class2type[ core_toString.call(obj) ] || "object";
	},

	isPlainObject: function( obj ) {
		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		try {
			// Not own constructor property must be Object
			if ( obj.constructor &&
				!core_hasOwn.call(obj, "constructor") &&
				!core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
		} catch ( e ) {
			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.

		var key;
		for ( key in obj ) {}

		return key === undefined || core_hasOwn.call( obj, key );
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	error: function( msg ) {
		throw new Error( msg );
	},

	// data: string of html
	// context (optional): If specified, the fragment will be created in this context, defaults to document
	// scripts (optional): If true, will include scripts passed in the html string
	parseHTML: function( data, context, scripts ) {
		var parsed;
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		if ( typeof context === "boolean" ) {
			scripts = context;
			context = 0;
		}
		context = context || document;

		// Single tag
		if ( (parsed = rsingleTag.exec( data )) ) {
			return [ context.createElement( parsed[1] ) ];
		}

		parsed = jQuery.buildFragment( [ data ], context, scripts ? null : [] );
		return jQuery.merge( [],
			(parsed.cacheable ? jQuery.clone( parsed.fragment ) : parsed.fragment).childNodes );
	},

	parseJSON: function( data ) {
		if ( !data || typeof data !== "string") {
			return null;
		}

		// Make sure leading/trailing whitespace is removed (IE can't handle it)
		data = jQuery.trim( data );

		// Attempt to parse using the native JSON parser first
		if ( window.JSON && window.JSON.parse ) {
			return window.JSON.parse( data );
		}

		// Make sure the incoming data is actual JSON
		// Logic borrowed from http://json.org/json2.js
		if ( rvalidchars.test( data.replace( rvalidescape, "@" )
			.replace( rvalidtokens, "]" )
			.replace( rvalidbraces, "")) ) {

			return ( new Function( "return " + data ) )();

		}
		jQuery.error( "Invalid JSON: " + data );
	},

	// Cross-browser xml parsing
	parseXML: function( data ) {
		var xml, tmp;
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		try {
			if ( window.DOMParser ) { // Standard
				tmp = new DOMParser();
				xml = tmp.parseFromString( data , "text/xml" );
			} else { // IE
				xml = new ActiveXObject( "Microsoft.XMLDOM" );
				xml.async = "false";
				xml.loadXML( data );
			}
		} catch( e ) {
			xml = undefined;
		}
		if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
			jQuery.error( "Invalid XML: " + data );
		}
		return xml;
	},

	noop: function() {},

	// Evaluates a script in a global context
	// Workarounds based on findings by Jim Driscoll
	// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
	globalEval: function( data ) {
		if ( data && core_rnotwhite.test( data ) ) {
			// We use execScript on Internet Explorer
			// We use an anonymous function so that context is window
			// rather than jQuery in Firefox
			( window.execScript || function( data ) {
				window[ "eval" ].call( window, data );
			} )( data );
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
	},

	// args is for internal usage only
	each: function( obj, callback, args ) {
		var name,
			i = 0,
			length = obj.length,
			isObj = length === undefined || jQuery.isFunction( obj );

		if ( args ) {
			if ( isObj ) {
				for ( name in obj ) {
					if ( callback.apply( obj[ name ], args ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < length; ) {
					if ( callback.apply( obj[ i++ ], args ) === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isObj ) {
				for ( name in obj ) {
					if ( callback.call( obj[ name ], name, obj[ name ] ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < length; ) {
					if ( callback.call( obj[ i ], i, obj[ i++ ] ) === false ) {
						break;
					}
				}
			}
		}

		return obj;
	},

	// Use native String.trim function wherever possible
	trim: core_trim && !core_trim.call("\uFEFF\xA0") ?
		function( text ) {
			return text == null ?
				"" :
				core_trim.call( text );
		} :

		// Otherwise use our own trimming functionality
		function( text ) {
			return text == null ?
				"" :
				text.toString().replace( rtrim, "" );
		},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var type,
			ret = results || [];

		if ( arr != null ) {
			// The window, strings (and functions) also have 'length'
			// Tweaked logic slightly to handle Blackberry 4.7 RegExp issues #6930
			type = jQuery.type( arr );

			if ( arr.length == null || type === "string" || type === "function" || type === "regexp" || jQuery.isWindow( arr ) ) {
				core_push.call( ret, arr );
			} else {
				jQuery.merge( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		var len;

		if ( arr ) {
			if ( core_indexOf ) {
				return core_indexOf.call( arr, elem, i );
			}

			len = arr.length;
			i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

			for ( ; i < len; i++ ) {
				// Skip accessing in sparse arrays
				if ( i in arr && arr[ i ] === elem ) {
					return i;
				}
			}
		}

		return -1;
	},

	merge: function( first, second ) {
		var l = second.length,
			i = first.length,
			j = 0;

		if ( typeof l === "number" ) {
			for ( ; j < l; j++ ) {
				first[ i++ ] = second[ j ];
			}

		} else {
			while ( second[j] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, inv ) {
		var retVal,
			ret = [],
			i = 0,
			length = elems.length;
		inv = !!inv;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			retVal = !!callback( elems[ i ], i );
			if ( inv !== retVal ) {
				ret.push( elems[ i ] );
			}
		}

		return ret;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var value, key,
			ret = [],
			i = 0,
			length = elems.length,
			// jquery objects are treated as arrays
			isArray = elems instanceof jQuery || length !== undefined && typeof length === "number" && ( ( length > 0 && elems[ 0 ] && elems[ length -1 ] ) || length === 0 || jQuery.isArray( elems ) ) ;

		// Go through the array, translating each of the items to their
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}

		// Go through every key on the object,
		} else {
			for ( key in elems ) {
				value = callback( elems[ key ], key, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}
		}

		// Flatten any nested arrays
		return ret.concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var tmp, args, proxy;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = core_slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context, args.concat( core_slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || proxy.guid || jQuery.guid++;

		return proxy;
	},

	// Multifunctional method to get and set values of a collection
	// The value/s can optionally be executed if it's a function
	access: function( elems, fn, key, value, chainable, emptyGet, pass ) {
		var exec,
			bulk = key == null,
			i = 0,
			length = elems.length;

		// Sets many values
		if ( key && typeof key === "object" ) {
			for ( i in key ) {
				jQuery.access( elems, fn, i, key[i], 1, emptyGet, value );
			}
			chainable = 1;

		// Sets one value
		} else if ( value !== undefined ) {
			// Optionally, function values get executed if exec is true
			exec = pass === undefined && jQuery.isFunction( value );

			if ( bulk ) {
				// Bulk operations only iterate when executing function values
				if ( exec ) {
					exec = fn;
					fn = function( elem, key, value ) {
						return exec.call( jQuery( elem ), value );
					};

				// Otherwise they run against the entire set
				} else {
					fn.call( elems, value );
					fn = null;
				}
			}

			if ( fn ) {
				for (; i < length; i++ ) {
					fn( elems[i], key, exec ? value.call( elems[i], i, fn( elems[i], key ) ) : value, pass );
				}
			}

			chainable = 1;
		}

		return chainable ?
			elems :

			// Gets
			bulk ?
				fn.call( elems ) :
				length ? fn( elems[0], key ) : emptyGet;
	},

	now: function() {
		return ( new Date() ).getTime();
	}
});

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called after the browser event has already occurred.
		// we once tried to use readyState "interactive" here, but it caused issues like the one
		// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			setTimeout( jQuery.ready, 1 );

		// Standards-based browsers support DOMContentLoaded
		} else if ( document.addEventListener ) {
			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", jQuery.ready, false );

		// If IE event model is used
		} else {
			// Ensure firing before onload, maybe late but safe also for iframes
			document.attachEvent( "onreadystatechange", DOMContentLoaded );

			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", jQuery.ready );

			// If IE and not a frame
			// continually check to see if the document is ready
			var top = false;

			try {
				top = window.frameElement == null && document.documentElement;
			} catch(e) {}

			if ( top && top.doScroll ) {
				(function doScrollCheck() {
					if ( !jQuery.isReady ) {

						try {
							// Use the trick by Diego Perini
							// http://javascript.nwbox.com/IEContentLoaded/
							top.doScroll("left");
						} catch(e) {
							return setTimeout( doScrollCheck, 50 );
						}

						// and execute any waiting functions
						jQuery.ready();
					}
				})();
			}
		}
	}
	return readyList.promise( obj );
};

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

// All jQuery objects should point back to these
rootjQuery = jQuery(document);
// String to Object options format cache
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
function createOptions( options ) {
	var object = optionsCache[ options ] = {};
	jQuery.each( options.split( core_rspace ), function( _, flag ) {
		object[ flag ] = true;
	});
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		( optionsCache[ options ] || createOptions( options ) ) :
		jQuery.extend( {}, options );

	var // Last fire value (for non-forgettable lists)
		memory,
		// Flag to know if list was already fired
		fired,
		// Flag to know if list is currently firing
		firing,
		// First callback to fire (used internally by add and fireWith)
		firingStart,
		// End of the loop when firing
		firingLength,
		// Index of currently firing callback (modified by remove if needed)
		firingIndex,
		// Actual callback list
		list = [],
		// Stack of fire calls for repeatable lists
		stack = !options.once && [],
		// Fire callbacks
		fire = function( data ) {
			memory = options.memory && data;
			fired = true;
			firingIndex = firingStart || 0;
			firingStart = 0;
			firingLength = list.length;
			firing = true;
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
					memory = false; // To prevent further calls using add
					break;
				}
			}
			firing = false;
			if ( list ) {
				if ( stack ) {
					if ( stack.length ) {
						fire( stack.shift() );
					}
				} else if ( memory ) {
					list = [];
				} else {
					self.disable();
				}
			}
		},
		// Actual Callbacks object
		self = {
			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {
					// First, we save the current length
					var start = list.length;
					(function add( args ) {
						jQuery.each( args, function( _, arg ) {
							var type = jQuery.type( arg );
							if ( type === "function" && ( !options.unique || !self.has( arg ) ) ) {
								list.push( arg );
							} else if ( arg && arg.length && type !== "string" ) {
								// Inspect recursively
								add( arg );
							}
						});
					})( arguments );
					// Do we need to add the callbacks to the
					// current firing batch?
					if ( firing ) {
						firingLength = list.length;
					// With memory, if we're not firing then
					// we should call right away
					} else if ( memory ) {
						firingStart = start;
						fire( memory );
					}
				}
				return this;
			},
			// Remove a callback from the list
			remove: function() {
				if ( list ) {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );
							// Handle firing indexes
							if ( firing ) {
								if ( index <= firingLength ) {
									firingLength--;
								}
								if ( index <= firingIndex ) {
									firingIndex--;
								}
							}
						}
					});
				}
				return this;
			},
			// Control if a given callback is in the list
			has: function( fn ) {
				return jQuery.inArray( fn, list ) > -1;
			},
			// Remove all callbacks from the list
			empty: function() {
				list = [];
				return this;
			},
			// Have the list do nothing anymore
			disable: function() {
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled?
			disabled: function() {
				return !list;
			},
			// Lock the list in its current state
			lock: function() {
				stack = undefined;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			// Is it locked?
			locked: function() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				args = args || [];
				args = [ context, args.slice ? args.slice() : args ];
				if ( list && ( !fired || stack ) ) {
					if ( firing ) {
						stack.push( args );
					} else {
						fire( args );
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},
			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};
jQuery.extend({

	Deferred: function( func ) {
		var tuples = [
				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks("memory") ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jQuery.Deferred(function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							var action = tuple[ 0 ],
								fn = fns[ i ];
							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[1] ]( jQuery.isFunction( fn ) ?
								function() {
									var returned = fn.apply( this, arguments );
									if ( returned && jQuery.isFunction( returned.promise ) ) {
										returned.promise()
											.done( newDefer.resolve )
											.fail( newDefer.reject )
											.progress( newDefer.notify );
									} else {
										newDefer[ action + "With" ]( this === deferred ? newDefer : this, [ returned ] );
									}
								} :
								newDefer[ action ]
							);
						});
						fns = null;
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return typeof obj === "object" ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[1] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(function() {
					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ] = list.fire
			deferred[ tuple[0] ] = list.fire;
			deferred[ tuple[0] + "With" ] = list.fireWith;
		});

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = core_slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred. If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? core_slice.call( arguments ) : value;
					if( values === progressValues ) {
						deferred.notifyWith( contexts, values );
					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject )
						.progress( updateFunc( i, progressContexts, progressValues ) );
				} else {
					--remaining;
				}
			}
		}

		// if we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
});
jQuery.support = (function() {

	var support,
		all,
		a,
		select,
		opt,
		input,
		fragment,
		eventName,
		i,
		isSupported,
		clickFn,
		div = document.createElement("div");

	// Preliminary tests
	div.setAttribute( "className", "t" );
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";

	all = div.getElementsByTagName("*");
	a = div.getElementsByTagName("a")[ 0 ];
	a.style.cssText = "top:1px;float:left;opacity:.5";

	// Can't get basic test support
	if ( !all || !all.length || !a ) {
		return {};
	}

	// First batch of supports tests
	select = document.createElement("select");
	opt = select.appendChild( document.createElement("option") );
	input = div.getElementsByTagName("input")[ 0 ];

	support = {
		// IE strips leading whitespace when .innerHTML is used
		leadingWhitespace: ( div.firstChild.nodeType === 3 ),

		// Make sure that tbody elements aren't automatically inserted
		// IE will insert them into empty tables
		tbody: !div.getElementsByTagName("tbody").length,

		// Make sure that link elements get serialized correctly by innerHTML
		// This requires a wrapper element in IE
		htmlSerialize: !!div.getElementsByTagName("link").length,

		// Get the style information from getAttribute
		// (IE uses .cssText instead)
		style: /top/.test( a.getAttribute("style") ),

		// Make sure that URLs aren't manipulated
		// (IE normalizes it by default)
		hrefNormalized: ( a.getAttribute("href") === "/a" ),

		// Make sure that element opacity exists
		// (IE uses filter instead)
		// Use a regex to work around a WebKit issue. See #5145
		opacity: /^0.5/.test( a.style.opacity ),

		// Verify style float existence
		// (IE uses styleFloat instead of cssFloat)
		cssFloat: !!a.style.cssFloat,

		// Make sure that if no value is specified for a checkbox
		// that it defaults to "on".
		// (WebKit defaults to "" instead)
		checkOn: ( input.value === "on" ),

		// Make sure that a selected-by-default option has a working selected property.
		// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
		optSelected: opt.selected,

		// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
		getSetAttribute: div.className !== "t",

		// Tests for enctype support on a form(#6743)
		enctype: !!document.createElement("form").enctype,

		// Makes sure cloning an html5 element does not cause problems
		// Where outerHTML is undefined, this still works
		html5Clone: document.createElement("nav").cloneNode( true ).outerHTML !== "<:nav></:nav>",

		// jQuery.support.boxModel DEPRECATED in 1.8 since we don't support Quirks Mode
		boxModel: ( document.compatMode === "CSS1Compat" ),

		// Will be defined later
		submitBubbles: true,
		changeBubbles: true,
		focusinBubbles: false,
		deleteExpando: true,
		noCloneEvent: true,
		inlineBlockNeedsLayout: false,
		shrinkWrapBlocks: false,
		reliableMarginRight: true,
		boxSizingReliable: true,
		pixelPosition: false
	};

	// Make sure checked status is properly cloned
	input.checked = true;
	support.noCloneChecked = input.cloneNode( true ).checked;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Test to see if it's possible to delete an expando from an element
	// Fails in Internet Explorer
	try {
		delete div.test;
	} catch( e ) {
		support.deleteExpando = false;
	}

	if ( !div.addEventListener && div.attachEvent && div.fireEvent ) {
		div.attachEvent( "onclick", clickFn = function() {
			// Cloning a node shouldn't copy over any
			// bound event handlers (IE does this)
			support.noCloneEvent = false;
		});
		div.cloneNode( true ).fireEvent("onclick");
		div.detachEvent( "onclick", clickFn );
	}

	// Check if a radio maintains its value
	// after being appended to the DOM
	input = document.createElement("input");
	input.value = "t";
	input.setAttribute( "type", "radio" );
	support.radioValue = input.value === "t";

	input.setAttribute( "checked", "checked" );

	// #11217 - WebKit loses check when the name is after the checked attribute
	input.setAttribute( "name", "t" );

	div.appendChild( input );
	fragment = document.createDocumentFragment();
	fragment.appendChild( div.lastChild );

	// WebKit doesn't clone checked state correctly in fragments
	support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Check if a disconnected checkbox will retain its checked
	// value of true after appended to the DOM (IE6/7)
	support.appendChecked = input.checked;

	fragment.removeChild( input );
	fragment.appendChild( div );

	// Technique from Juriy Zaytsev
	// http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
	// We only care about the case where non-standard event systems
	// are used, namely in IE. Short-circuiting here helps us to
	// avoid an eval call (in setAttribute) which can cause CSP
	// to go haywire. See: https://developer.mozilla.org/en/Security/CSP
	if ( div.attachEvent ) {
		for ( i in {
			submit: true,
			change: true,
			focusin: true
		}) {
			eventName = "on" + i;
			isSupported = ( eventName in div );
			if ( !isSupported ) {
				div.setAttribute( eventName, "return;" );
				isSupported = ( typeof div[ eventName ] === "function" );
			}
			support[ i + "Bubbles" ] = isSupported;
		}
	}

	// Run tests that need a body at doc ready
	jQuery(function() {
		var container, div, tds, marginDiv,
			divReset = "padding:0;margin:0;border:0;display:block;overflow:hidden;",
			body = document.getElementsByTagName("body")[0];

		if ( !body ) {
			// Return for frameset docs that don't have a body
			return;
		}

		container = document.createElement("div");
		container.style.cssText = "visibility:hidden;border:0;width:0;height:0;position:static;top:0;margin-top:1px";
		body.insertBefore( container, body.firstChild );

		// Construct the test element
		div = document.createElement("div");
		container.appendChild( div );

		// Check if table cells still have offsetWidth/Height when they are set
		// to display:none and there are still other visible table cells in a
		// table row; if so, offsetWidth/Height are not reliable for use when
		// determining if an element has been hidden directly using
		// display:none (it is still safe to use offsets if a parent element is
		// hidden; don safety goggles and see bug #4512 for more information).
		// (only IE 8 fails this test)
		div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
		tds = div.getElementsByTagName("td");
		tds[ 0 ].style.cssText = "padding:0;margin:0;border:0;display:none";
		isSupported = ( tds[ 0 ].offsetHeight === 0 );

		tds[ 0 ].style.display = "";
		tds[ 1 ].style.display = "none";

		// Check if empty table cells still have offsetWidth/Height
		// (IE <= 8 fail this test)
		support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );

		// Check box-sizing and margin behavior
		div.innerHTML = "";
		div.style.cssText = "box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;";
		support.boxSizing = ( div.offsetWidth === 4 );
		support.doesNotIncludeMarginInBodyOffset = ( body.offsetTop !== 1 );

		// NOTE: To any future maintainer, we've window.getComputedStyle
		// because jsdom on node.js will break without it.
		if ( window.getComputedStyle ) {
			support.pixelPosition = ( window.getComputedStyle( div, null ) || {} ).top !== "1%";
			support.boxSizingReliable = ( window.getComputedStyle( div, null ) || { width: "4px" } ).width === "4px";

			// Check if div with explicit width and no margin-right incorrectly
			// gets computed margin-right based on width of container. For more
			// info see bug #3333
			// Fails in WebKit before Feb 2011 nightlies
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			marginDiv = document.createElement("div");
			marginDiv.style.cssText = div.style.cssText = divReset;
			marginDiv.style.marginRight = marginDiv.style.width = "0";
			div.style.width = "1px";
			div.appendChild( marginDiv );
			support.reliableMarginRight =
				!parseFloat( ( window.getComputedStyle( marginDiv, null ) || {} ).marginRight );
		}

		if ( typeof div.style.zoom !== "undefined" ) {
			// Check if natively block-level elements act like inline-block
			// elements when setting their display to 'inline' and giving
			// them layout
			// (IE < 8 does this)
			div.innerHTML = "";
			div.style.cssText = divReset + "width:1px;padding:1px;display:inline;zoom:1";
			support.inlineBlockNeedsLayout = ( div.offsetWidth === 3 );

			// Check if elements with layout shrink-wrap their children
			// (IE 6 does this)
			div.style.display = "block";
			div.style.overflow = "visible";
			div.innerHTML = "<div></div>";
			div.firstChild.style.width = "5px";
			support.shrinkWrapBlocks = ( div.offsetWidth !== 3 );

			container.style.zoom = 1;
		}

		// Null elements to avoid leaks in IE
		body.removeChild( container );
		container = div = tds = marginDiv = null;
	});

	// Null elements to avoid leaks in IE
	fragment.removeChild( div );
	all = a = select = opt = input = fragment = div = null;

	return support;
})();
var rbrace = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
	rmultiDash = /([A-Z])/g;

jQuery.extend({
	cache: {},

	deletedIds: [],

	// Please use with caution
	uuid: 0,

	// Unique for each copy of jQuery on the page
	// Non-digits removed to match rinlinejQuery
	expando: "jQuery" + ( jQuery.fn.jquery + Math.random() ).replace( /\D/g, "" ),

	// The following elements throw uncatchable exceptions if you
	// attempt to add expando properties to them.
	noData: {
		"embed": true,
		// Ban all objects except for Flash (which handle expandos)
		"object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
		"applet": true
	},

	hasData: function( elem ) {
		elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];
		return !!elem && !isEmptyDataObject( elem );
	},

	data: function( elem, name, data, pvt /* Internal Use Only */ ) {
		if ( !jQuery.acceptData( elem ) ) {
			return;
		}

		var thisCache, ret,
			internalKey = jQuery.expando,
			getByName = typeof name === "string",

			// We have to handle DOM nodes and JS objects differently because IE6-7
			// can't GC object references properly across the DOM-JS boundary
			isNode = elem.nodeType,

			// Only DOM nodes need the global jQuery cache; JS object data is
			// attached directly to the object so GC can occur automatically
			cache = isNode ? jQuery.cache : elem,

			// Only defining an ID for JS objects if its cache already exists allows
			// the code to shortcut on the same path as a DOM node with no cache
			id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey;

		// Avoid doing any more work than we need to when trying to get data on an
		// object that has no data at all
		if ( (!id || !cache[id] || (!pvt && !cache[id].data)) && getByName && data === undefined ) {
			return;
		}

		if ( !id ) {
			// Only DOM nodes need a new unique ID for each element since their data
			// ends up in the global cache
			if ( isNode ) {
				elem[ internalKey ] = id = jQuery.deletedIds.pop() || ++jQuery.uuid;
			} else {
				id = internalKey;
			}
		}

		if ( !cache[ id ] ) {
			cache[ id ] = {};

			// Avoids exposing jQuery metadata on plain JS objects when the object
			// is serialized using JSON.stringify
			if ( !isNode ) {
				cache[ id ].toJSON = jQuery.noop;
			}
		}

		// An object can be passed to jQuery.data instead of a key/value pair; this gets
		// shallow copied over onto the existing cache
		if ( typeof name === "object" || typeof name === "function" ) {
			if ( pvt ) {
				cache[ id ] = jQuery.extend( cache[ id ], name );
			} else {
				cache[ id ].data = jQuery.extend( cache[ id ].data, name );
			}
		}

		thisCache = cache[ id ];

		// jQuery data() is stored in a separate object inside the object's internal data
		// cache in order to avoid key collisions between internal data and user-defined
		// data.
		if ( !pvt ) {
			if ( !thisCache.data ) {
				thisCache.data = {};
			}

			thisCache = thisCache.data;
		}

		if ( data !== undefined ) {
			thisCache[ jQuery.camelCase( name ) ] = data;
		}

		// Check for both converted-to-camel and non-converted data property names
		// If a data property was specified
		if ( getByName ) {

			// First Try to find as-is property data
			ret = thisCache[ name ];

			// Test for null|undefined property data
			if ( ret == null ) {

				// Try to find the camelCased property
				ret = thisCache[ jQuery.camelCase( name ) ];
			}
		} else {
			ret = thisCache;
		}

		return ret;
	},

	removeData: function( elem, name, pvt /* Internal Use Only */ ) {
		if ( !jQuery.acceptData( elem ) ) {
			return;
		}

		var thisCache, i, l,

			isNode = elem.nodeType,

			// See jQuery.data for more information
			cache = isNode ? jQuery.cache : elem,
			id = isNode ? elem[ jQuery.expando ] : jQuery.expando;

		// If there is already no cache entry for this object, there is no
		// purpose in continuing
		if ( !cache[ id ] ) {
			return;
		}

		if ( name ) {

			thisCache = pvt ? cache[ id ] : cache[ id ].data;

			if ( thisCache ) {

				// Support array or space separated string names for data keys
				if ( !jQuery.isArray( name ) ) {

					// try the string as a key before any manipulation
					if ( name in thisCache ) {
						name = [ name ];
					} else {

						// split the camel cased version by spaces unless a key with the spaces exists
						name = jQuery.camelCase( name );
						if ( name in thisCache ) {
							name = [ name ];
						} else {
							name = name.split(" ");
						}
					}
				}

				for ( i = 0, l = name.length; i < l; i++ ) {
					delete thisCache[ name[i] ];
				}

				// If there is no data left in the cache, we want to continue
				// and let the cache object itself get destroyed
				if ( !( pvt ? isEmptyDataObject : jQuery.isEmptyObject )( thisCache ) ) {
					return;
				}
			}
		}

		// See jQuery.data for more information
		if ( !pvt ) {
			delete cache[ id ].data;

			// Don't destroy the parent cache unless the internal data object
			// had been the only thing left in it
			if ( !isEmptyDataObject( cache[ id ] ) ) {
				return;
			}
		}

		// Destroy the cache
		if ( isNode ) {
			jQuery.cleanData( [ elem ], true );

		// Use delete when supported for expandos or `cache` is not a window per isWindow (#10080)
		} else if ( jQuery.support.deleteExpando || cache != cache.window ) {
			delete cache[ id ];

		// When all else fails, null
		} else {
			cache[ id ] = null;
		}
	},

	// For internal use only.
	_data: function( elem, name, data ) {
		return jQuery.data( elem, name, data, true );
	},

	// A method for determining if a DOM node can handle the data expando
	acceptData: function( elem ) {
		var noData = elem.nodeName && jQuery.noData[ elem.nodeName.toLowerCase() ];

		// nodes accept data unless otherwise specified; rejection can be conditional
		return !noData || noData !== true && elem.getAttribute("classid") === noData;
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var parts, part, attr, name, l,
			elem = this[0],
			i = 0,
			data = null;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = jQuery.data( elem );

				if ( elem.nodeType === 1 && !jQuery._data( elem, "parsedAttrs" ) ) {
					attr = elem.attributes;
					for ( l = attr.length; i < l; i++ ) {
						name = attr[i].name;

						if ( name.indexOf( "data-" ) === 0 ) {
							name = jQuery.camelCase( name.substring(5) );

							dataAttr( elem, name, data[ name ] );
						}
					}
					jQuery._data( elem, "parsedAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each(function() {
				jQuery.data( this, key );
			});
		}

		parts = key.split( ".", 2 );
		parts[1] = parts[1] ? "." + parts[1] : "";
		part = parts[1] + "!";

		return jQuery.access( this, function( value ) {

			if ( value === undefined ) {
				data = this.triggerHandler( "getData" + part, [ parts[0] ] );

				// Try to fetch any internally stored data first
				if ( data === undefined && elem ) {
					data = jQuery.data( elem, key );
					data = dataAttr( elem, key, data );
				}

				return data === undefined && parts[1] ?
					this.data( parts[0] ) :
					data;
			}

			parts[1] = value;
			this.each(function() {
				var self = jQuery( this );

				self.triggerHandler( "setData" + part, parts );
				jQuery.data( this, key, value );
				self.triggerHandler( "changeData" + part, parts );
			});
		}, null, value, arguments.length > 1, null, false );
	},

	removeData: function( key ) {
		return this.each(function() {
			jQuery.removeData( this, key );
		});
	}
});

function dataAttr( elem, key, data ) {
	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {

		var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();

		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
				data === "false" ? false :
				data === "null" ? null :
				// Only convert to a number if it doesn't change the string
				+data + "" === data ? +data :
				rbrace.test( data ) ? jQuery.parseJSON( data ) :
					data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
			jQuery.data( elem, key, data );

		} else {
			data = undefined;
		}
	}

	return data;
}

// checks a cache object for emptiness
function isEmptyDataObject( obj ) {
	var name;
	for ( name in obj ) {

		// if the public data object is empty, the private is still empty
		if ( name === "data" && jQuery.isEmptyObject( obj[name] ) ) {
			continue;
		}
		if ( name !== "toJSON" ) {
			return false;
		}
	}

	return true;
}
jQuery.extend({
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = jQuery._data( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray(data) ) {
					queue = jQuery._data( elem, type, jQuery.makeArray(data) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// not intended for public consumption - generates a queueHooks object, or returns the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return jQuery._data( elem, key ) || jQuery._data( elem, key, {
			empty: jQuery.Callbacks("once memory").add(function() {
				jQuery.removeData( elem, type + "queue", true );
				jQuery.removeData( elem, key, true );
			})
		});
	}
});

jQuery.fn.extend({
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[0], type );
		}

		return data === undefined ?
			this :
			this.each(function() {
				var queue = jQuery.queue( this, type, data );

				// ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[0] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			});
	},
	dequeue: function( type ) {
		return this.each(function() {
			jQuery.dequeue( this, type );
		});
	},
	// Based off of the plugin by Clint Helfers, with permission.
	// http://blindsignals.com/index.php/2009/07/jquery-delay/
	delay: function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
		type = type || "fx";

		return this.queue( type, function( next, hooks ) {
			var timeout = setTimeout( next, time );
			hooks.stop = function() {
				clearTimeout( timeout );
			};
		});
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},
	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while( i-- ) {
			tmp = jQuery._data( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
});
var nodeHook, boolHook, fixSpecified,
	rclass = /[\t\r\n]/g,
	rreturn = /\r/g,
	rtype = /^(?:button|input)$/i,
	rfocusable = /^(?:button|input|object|select|textarea)$/i,
	rclickable = /^a(?:rea|)$/i,
	rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,
	getSetAttribute = jQuery.support.getSetAttribute;

jQuery.fn.extend({
	attr: function( name, value ) {
		return jQuery.access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each(function() {
			jQuery.removeAttr( this, name );
		});
	},

	prop: function( name, value ) {
		return jQuery.access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		name = jQuery.propFix[ name ] || name;
		return this.each(function() {
			// try/catch handles cases where IE balks (such as removing a property on window)
			try {
				this[ name ] = undefined;
				delete this[ name ];
			} catch( e ) {}
		});
	},

	addClass: function( value ) {
		var classNames, i, l, elem,
			setClass, c, cl;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).addClass( value.call(this, j, this.className) );
			});
		}

		if ( value && typeof value === "string" ) {
			classNames = value.split( core_rspace );

			for ( i = 0, l = this.length; i < l; i++ ) {
				elem = this[ i ];

				if ( elem.nodeType === 1 ) {
					if ( !elem.className && classNames.length === 1 ) {
						elem.className = value;

					} else {
						setClass = " " + elem.className + " ";

						for ( c = 0, cl = classNames.length; c < cl; c++ ) {
							if ( !~setClass.indexOf( " " + classNames[ c ] + " " ) ) {
								setClass += classNames[ c ] + " ";
							}
						}
						elem.className = jQuery.trim( setClass );
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var removes, className, elem, c, cl, i, l;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).removeClass( value.call(this, j, this.className) );
			});
		}
		if ( (value && typeof value === "string") || value === undefined ) {
			removes = ( value || "" ).split( core_rspace );

			for ( i = 0, l = this.length; i < l; i++ ) {
				elem = this[ i ];
				if ( elem.nodeType === 1 && elem.className ) {

					className = (" " + elem.className + " ").replace( rclass, " " );

					// loop over each item in the removal list
					for ( c = 0, cl = removes.length; c < cl; c++ ) {
						// Remove until there is nothing to remove,
						while ( className.indexOf(" " + removes[ c ] + " ") > -1 ) {
							className = className.replace( " " + removes[ c ] + " " , " " );
						}
					}
					elem.className = value ? jQuery.trim( className ) : "";
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value,
			isBool = typeof stateVal === "boolean";

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( i ) {
				jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
			});
		}

		return this.each(function() {
			if ( type === "string" ) {
				// toggle individual class names
				var className,
					i = 0,
					self = jQuery( this ),
					state = stateVal,
					classNames = value.split( core_rspace );

				while ( (className = classNames[ i++ ]) ) {
					// check each className given, space separated list
					state = isBool ? state : !self.hasClass( className );
					self[ state ? "addClass" : "removeClass" ]( className );
				}

			} else if ( type === "undefined" || type === "boolean" ) {
				if ( this.className ) {
					// store className if set
					jQuery._data( this, "__className__", this.className );
				}

				// toggle whole className
				this.className = this.className || value === false ? "" : jQuery._data( this, "__className__" ) || "";
			}
		});
	},

	hasClass: function( selector ) {
		var className = " " + selector + " ",
			i = 0,
			l = this.length;
		for ( ; i < l; i++ ) {
			if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) > -1 ) {
				return true;
			}
		}

		return false;
	},

	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[0];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?
					// handle most common string cases
					ret.replace(rreturn, "") :
					// handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each(function( i ) {
			var val,
				self = jQuery(this);

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, self.val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";
			} else if ( typeof val === "number" ) {
				val += "";
			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map(val, function ( value ) {
					return value == null ? "" : value + "";
				});
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		});
	}
});

jQuery.extend({
	valHooks: {
		option: {
			get: function( elem ) {
				// attributes.value is undefined in Blackberry 4.7 but
				// uses .value. See #6932
				var val = elem.attributes.value;
				return !val || val.specified ? elem.value : elem.text;
			}
		},
		select: {
			get: function( elem ) {
				var value, i, max, option,
					index = elem.selectedIndex,
					values = [],
					options = elem.options,
					one = elem.type === "select-one";

				// Nothing was selected
				if ( index < 0 ) {
					return null;
				}

				// Loop through all the selected options
				i = one ? index : 0;
				max = one ? index + 1 : options.length;
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// Don't return options that are disabled or in a disabled optgroup
					if ( option.selected && (jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) &&
							(!option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" )) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				// Fixes Bug #2551 -- select.val() broken in IE after form.reset()
				if ( one && !values.length && options.length ) {
					return jQuery( options[ index ] ).val();
				}

				return values;
			},

			set: function( elem, value ) {
				var values = jQuery.makeArray( value );

				jQuery(elem).find("option").each(function() {
					this.selected = jQuery.inArray( jQuery(this).val(), values ) >= 0;
				});

				if ( !values.length ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	},

	// Unused in 1.8, left in so attrFn-stabbers won't die; remove in 1.9
	attrFn: {},

	attr: function( elem, name, value, pass ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// don't get/set attributes on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		if ( pass && jQuery.isFunction( jQuery.fn[ name ] ) ) {
			return jQuery( elem )[ name ]( value );
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === "undefined" ) {
			return jQuery.prop( elem, name, value );
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( notxml ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] || ( rboolean.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {

			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return;

			} else if ( hooks && "set" in hooks && notxml && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				elem.setAttribute( name, "" + value );
				return value;
			}

		} else if ( hooks && "get" in hooks && notxml && (ret = hooks.get( elem, name )) !== null ) {
			return ret;

		} else {

			ret = elem.getAttribute( name );

			// Non-existent attributes return null, we normalize to undefined
			return ret === null ?
				undefined :
				ret;
		}
	},

	removeAttr: function( elem, value ) {
		var propName, attrNames, name, isBool,
			i = 0;

		if ( value && elem.nodeType === 1 ) {

			attrNames = value.split( core_rspace );

			for ( ; i < attrNames.length; i++ ) {
				name = attrNames[ i ];

				if ( name ) {
					propName = jQuery.propFix[ name ] || name;
					isBool = rboolean.test( name );

					// See #9699 for explanation of this approach (setting first, then removal)
					// Do not do this for boolean attributes (see #10870)
					if ( !isBool ) {
						jQuery.attr( elem, name, "" );
					}
					elem.removeAttribute( getSetAttribute ? name : propName );

					// Set corresponding property to false for boolean attributes
					if ( isBool && propName in elem ) {
						elem[ propName ] = false;
					}
				}
			}
		}
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				// We can't allow the type property to be changed (since it causes problems in IE)
				if ( rtype.test( elem.nodeName ) && elem.parentNode ) {
					jQuery.error( "type property can't be changed" );
				} else if ( !jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
					// Setting the type on a radio button after the value resets the value in IE6-9
					// Reset value to it's default in case type is set after value
					// This is for element creation
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		},
		// Use the value property for back compat
		// Use the nodeHook for button elements in IE6/7 (#1954)
		value: {
			get: function( elem, name ) {
				if ( nodeHook && jQuery.nodeName( elem, "button" ) ) {
					return nodeHook.get( elem, name );
				}
				return name in elem ?
					elem.value :
					null;
			},
			set: function( elem, value, name ) {
				if ( nodeHook && jQuery.nodeName( elem, "button" ) ) {
					return nodeHook.set( elem, value, name );
				}
				// Does not return so that setAttribute is also used
				elem.value = value;
			}
		}
	},

	propFix: {
		tabindex: "tabIndex",
		readonly: "readOnly",
		"for": "htmlFor",
		"class": "className",
		maxlength: "maxLength",
		cellspacing: "cellSpacing",
		cellpadding: "cellPadding",
		rowspan: "rowSpan",
		colspan: "colSpan",
		usemap: "useMap",
		frameborder: "frameBorder",
		contenteditable: "contentEditable"
	},

	prop: function( elem, name, value ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// don't get/set properties on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		if ( notxml ) {
			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				return ( elem[ name ] = value );
			}

		} else {
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
				return ret;

			} else {
				return elem[ name ];
			}
		}
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {
				// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
				// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				var attributeNode = elem.getAttributeNode("tabindex");

				return attributeNode && attributeNode.specified ?
					parseInt( attributeNode.value, 10 ) :
					rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
						0 :
						undefined;
			}
		}
	}
});

// Hook for boolean attributes
boolHook = {
	get: function( elem, name ) {
		// Align boolean attributes with corresponding properties
		// Fall back to attribute presence where some booleans are not supported
		var attrNode,
			property = jQuery.prop( elem, name );
		return property === true || typeof property !== "boolean" && ( attrNode = elem.getAttributeNode(name) ) && attrNode.nodeValue !== false ?
			name.toLowerCase() :
			undefined;
	},
	set: function( elem, value, name ) {
		var propName;
		if ( value === false ) {
			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			// value is true since we know at this point it's type boolean and not false
			// Set boolean attributes to the same name and set the DOM property
			propName = jQuery.propFix[ name ] || name;
			if ( propName in elem ) {
				// Only set the IDL specifically if it already exists on the element
				elem[ propName ] = true;
			}

			elem.setAttribute( name, name.toLowerCase() );
		}
		return name;
	}
};

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !getSetAttribute ) {

	fixSpecified = {
		name: true,
		id: true,
		coords: true
	};

	// Use this for any attribute in IE6/7
	// This fixes almost every IE6/7 issue
	nodeHook = jQuery.valHooks.button = {
		get: function( elem, name ) {
			var ret;
			ret = elem.getAttributeNode( name );
			return ret && ( fixSpecified[ name ] ? ret.value !== "" : ret.specified ) ?
				ret.value :
				undefined;
		},
		set: function( elem, value, name ) {
			// Set the existing or create a new attribute node
			var ret = elem.getAttributeNode( name );
			if ( !ret ) {
				ret = document.createAttribute( name );
				elem.setAttributeNode( ret );
			}
			return ( ret.value = value + "" );
		}
	};

	// Set width and height to auto instead of 0 on empty string( Bug #8150 )
	// This is for removals
	jQuery.each([ "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			set: function( elem, value ) {
				if ( value === "" ) {
					elem.setAttribute( name, "auto" );
					return value;
				}
			}
		});
	});

	// Set contenteditable to false on removals(#10429)
	// Setting to empty string throws an error as an invalid value
	jQuery.attrHooks.contenteditable = {
		get: nodeHook.get,
		set: function( elem, value, name ) {
			if ( value === "" ) {
				value = "false";
			}
			nodeHook.set( elem, value, name );
		}
	};
}


// Some attributes require a special call on IE
if ( !jQuery.support.hrefNormalized ) {
	jQuery.each([ "href", "src", "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			get: function( elem ) {
				var ret = elem.getAttribute( name, 2 );
				return ret === null ? undefined : ret;
			}
		});
	});
}

if ( !jQuery.support.style ) {
	jQuery.attrHooks.style = {
		get: function( elem ) {
			// Return undefined in the case of empty string
			// Normalize to lowercase since IE uppercases css property names
			return elem.style.cssText.toLowerCase() || undefined;
		},
		set: function( elem, value ) {
			return ( elem.style.cssText = "" + value );
		}
	};
}

// Safari mis-reports the default selected property of an option
// Accessing the parent's selectedIndex property fixes it
if ( !jQuery.support.optSelected ) {
	jQuery.propHooks.selected = jQuery.extend( jQuery.propHooks.selected, {
		get: function( elem ) {
			var parent = elem.parentNode;

			if ( parent ) {
				parent.selectedIndex;

				// Make sure that it also works with optgroups, see #5701
				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
			return null;
		}
	});
}

// IE6/7 call enctype encoding
if ( !jQuery.support.enctype ) {
	jQuery.propFix.enctype = "encoding";
}

// Radios and checkboxes getter/setter
if ( !jQuery.support.checkOn ) {
	jQuery.each([ "radio", "checkbox" ], function() {
		jQuery.valHooks[ this ] = {
			get: function( elem ) {
				// Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
				return elem.getAttribute("value") === null ? "on" : elem.value;
			}
		};
	});
}
jQuery.each([ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = jQuery.extend( jQuery.valHooks[ this ], {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
			}
		}
	});
});
var rformElems = /^(?:textarea|input|select)$/i,
	rtypenamespace = /^([^\.]*|)(?:\.(.+)|)$/,
	rhoverHack = /(?:^|\s)hover(\.\S+|)\b/,
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|contextmenu)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	hoverHack = function( events ) {
		return jQuery.event.special.hover ? events : events.replace( rhoverHack, "mouseenter$1 mouseleave$1" );
	};

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	add: function( elem, types, handler, data, selector ) {

		var elemData, eventHandle, events,
			t, tns, type, namespaces, handleObj,
			handleObjIn, handlers, special;

		// Don't attach events to noData or text/comment nodes (allow plain objects tho)
		if ( elem.nodeType === 3 || elem.nodeType === 8 || !types || !handler || !(elemData = jQuery._data( elem )) ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		events = elemData.events;
		if ( !events ) {
			elemData.events = events = {};
		}
		eventHandle = elemData.handle;
		if ( !eventHandle ) {
			elemData.handle = eventHandle = function( e ) {
				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" && (!e || jQuery.event.triggered !== e.type) ?
					jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
					undefined;
			};
			// Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
			eventHandle.elem = elem;
		}

		// Handle multiple events separated by a space
		// jQuery(...).bind("mouseover mouseout", fn);
		types = jQuery.trim( hoverHack(types) ).split( " " );
		for ( t = 0; t < types.length; t++ ) {

			tns = rtypenamespace.exec( types[t] ) || [];
			type = tns[1];
			namespaces = ( tns[2] || "" ).split( "." ).sort();

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend({
				type: type,
				origType: tns[1],
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				namespace: namespaces.join(".")
			}, handleObjIn );

			// Init the event handler queue if we're the first
			handlers = events[ type ];
			if ( !handlers ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener/attachEvent if the special events handler returns false
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					// Bind the global event handler to the element
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );

					} else if ( elem.attachEvent ) {
						elem.attachEvent( "on" + type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	global: {},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var t, tns, type, origType, namespaces, origCount,
			j, events, special, eventType, handleObj,
			elemData = jQuery.hasData( elem ) && jQuery._data( elem );

		if ( !elemData || !(events = elemData.events) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = jQuery.trim( hoverHack( types || "" ) ).split(" ");
		for ( t = 0; t < types.length; t++ ) {
			tns = rtypenamespace.exec( types[t] ) || [];
			type = origType = tns[1];
			namespaces = tns[2];

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector? special.delegateType : special.bindType ) || type;
			eventType = events[ type ] || [];
			origCount = eventType.length;
			namespaces = namespaces ? new RegExp("(^|\\.)" + namespaces.split(".").sort().join("\\.(?:.*\\.|)") + "(\\.|$)") : null;

			// Remove matching events
			for ( j = 0; j < eventType.length; j++ ) {
				handleObj = eventType[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					 ( !handler || handler.guid === handleObj.guid ) &&
					 ( !namespaces || namespaces.test( handleObj.namespace ) ) &&
					 ( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
					eventType.splice( j--, 1 );

					if ( handleObj.selector ) {
						eventType.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( eventType.length === 0 && origCount !== eventType.length ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			delete elemData.handle;

			// removeData also checks for emptiness and clears the expando if empty
			// so use it instead of delete
			jQuery.removeData( elem, "events", true );
		}
	},

	// Events that are safe to short-circuit if no handlers are attached.
	// Native DOM events should not be added, they may have inline handlers.
	customEvent: {
		"getData": true,
		"setData": true,
		"changeData": true
	},

	trigger: function( event, data, elem, onlyHandlers ) {
		// Don't do events on text and comment nodes
		if ( elem && (elem.nodeType === 3 || elem.nodeType === 8) ) {
			return;
		}

		// Event object or event type
		var cache, exclusive, i, cur, old, ontype, special, handle, eventPath, bubbleType,
			type = event.type || event,
			namespaces = [];

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf( "!" ) >= 0 ) {
			// Exclusive events trigger only for the exact event (no namespaces)
			type = type.slice(0, -1);
			exclusive = true;
		}

		if ( type.indexOf( "." ) >= 0 ) {
			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split(".");
			type = namespaces.shift();
			namespaces.sort();
		}

		if ( (!elem || jQuery.event.customEvent[ type ]) && !jQuery.event.global[ type ] ) {
			// No jQuery handlers for this event type, and it can't have inline handlers
			return;
		}

		// Caller can pass in an Event, Object, or just an event type string
		event = typeof event === "object" ?
			// jQuery.Event object
			event[ jQuery.expando ] ? event :
			// Object literal
			new jQuery.Event( type, event ) :
			// Just the event type (string)
			new jQuery.Event( type );

		event.type = type;
		event.isTrigger = true;
		event.exclusive = exclusive;
		event.namespace = namespaces.join( "." );
		event.namespace_re = event.namespace? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)") : null;
		ontype = type.indexOf( ":" ) < 0 ? "on" + type : "";

		// Handle a global trigger
		if ( !elem ) {

			// TODO: Stop taunting the data cache; remove global events and always attach to document
			cache = jQuery.cache;
			for ( i in cache ) {
				if ( cache[ i ].events && cache[ i ].events[ type ] ) {
					jQuery.event.trigger( event, data, cache[ i ].handle.elem, true );
				}
			}
			return;
		}

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data != null ? jQuery.makeArray( data ) : [];
		data.unshift( event );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		eventPath = [[ elem, special.bindType || type ]];
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			cur = rfocusMorph.test( bubbleType + type ) ? elem : elem.parentNode;
			for ( old = elem; cur; cur = cur.parentNode ) {
				eventPath.push([ cur, bubbleType ]);
				old = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( old === (elem.ownerDocument || document) ) {
				eventPath.push([ old.defaultView || old.parentWindow || window, bubbleType ]);
			}
		}

		// Fire handlers on the event path
		for ( i = 0; i < eventPath.length && !event.isPropagationStopped(); i++ ) {

			cur = eventPath[i][0];
			event.type = eventPath[i][1];

			handle = ( jQuery._data( cur, "events" ) || {} )[ event.type ] && jQuery._data( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}
			// Note that this is a bare JS function and not a jQuery handler
			handle = ontype && cur[ ontype ];
			if ( handle && jQuery.acceptData( cur ) && handle.apply( cur, data ) === false ) {
				event.preventDefault();
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( (!special._default || special._default.apply( elem.ownerDocument, data ) === false) &&
				!(type === "click" && jQuery.nodeName( elem, "a" )) && jQuery.acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Can't use an .isFunction() check here because IE6/7 fails that test.
				// Don't do default actions on window, that's where global variables be (#6170)
				// IE<9 dies on focus/blur to hidden element (#1486)
				if ( ontype && elem[ type ] && ((type !== "focus" && type !== "blur") || event.target.offsetWidth !== 0) && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					old = elem[ ontype ];

					if ( old ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					elem[ type ]();
					jQuery.event.triggered = undefined;

					if ( old ) {
						elem[ ontype ] = old;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event || window.event );

		var i, j, cur, ret, selMatch, matched, matches, handleObj, sel, related,
			handlers = ( (jQuery._data( this, "events" ) || {} )[ event.type ] || []),
			delegateCount = handlers.delegateCount,
			args = [].slice.call( arguments ),
			run_all = !event.exclusive && !event.namespace,
			special = jQuery.event.special[ event.type ] || {},
			handlerQueue = [];

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[0] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers that should run if there are delegated events
		// Avoid non-left-click bubbling in Firefox (#3861)
		if ( delegateCount && !(event.button && event.type === "click") ) {

			for ( cur = event.target; cur != this; cur = cur.parentNode || this ) {

				// Don't process clicks (ONLY) on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.disabled !== true || event.type !== "click" ) {
					selMatch = {};
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];
						sel = handleObj.selector;

						if ( selMatch[ sel ] === undefined ) {
							selMatch[ sel ] = jQuery( sel, this ).index( cur ) >= 0;
						}
						if ( selMatch[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push({ elem: cur, matches: matches });
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( handlers.length > delegateCount ) {
			handlerQueue.push({ elem: this, matches: handlers.slice( delegateCount ) });
		}

		// Run delegates first; they may want to stop propagation beneath us
		for ( i = 0; i < handlerQueue.length && !event.isPropagationStopped(); i++ ) {
			matched = handlerQueue[ i ];
			event.currentTarget = matched.elem;

			for ( j = 0; j < matched.matches.length && !event.isImmediatePropagationStopped(); j++ ) {
				handleObj = matched.matches[ j ];

				// Triggered event must either 1) be non-exclusive and have no namespace, or
				// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
				if ( run_all || (!event.namespace && !handleObj.namespace) || event.namespace_re && event.namespace_re.test( handleObj.namespace ) ) {

					event.data = handleObj.data;
					event.handleObj = handleObj;

					ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
							.apply( matched.elem, args );

					if ( ret !== undefined ) {
						event.result = ret;
						if ( ret === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	// *** attrChange attrName relatedNode srcElement  are not normalized, non-W3C, deprecated, will be removed in 1.8 ***
	props: "attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split(" "),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
		filter: function( event, original ) {
			var eventDoc, doc, body,
				button = original.button,
				fromElement = original.fromElement;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add relatedTarget, if necessary
			if ( !event.relatedTarget && fromElement ) {
				event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop,
			originalEvent = event,
			fixHook = jQuery.event.fixHooks[ event.type ] || {},
			copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = jQuery.Event( originalEvent );

		for ( i = copy.length; i; ) {
			prop = copy[ --i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Fix target property, if necessary (#1925, IE 6/7/8 & Safari2)
		if ( !event.target ) {
			event.target = originalEvent.srcElement || document;
		}

		// Target should not be a text node (#504, Safari)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		// For mouse/key events, metaKey==false if it's undefined (#3368, #11328; IE6/7/8)
		event.metaKey = !!event.metaKey;

		return fixHook.filter? fixHook.filter( event, originalEvent ) : event;
	},

	special: {
		load: {
			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},

		focus: {
			delegateType: "focusin"
		},
		blur: {
			delegateType: "focusout"
		},

		beforeunload: {
			setup: function( data, namespaces, eventHandle ) {
				// We only want to do this special case on windows
				if ( jQuery.isWindow( this ) ) {
					this.onbeforeunload = eventHandle;
				}
			},

			teardown: function( namespaces, eventHandle ) {
				if ( this.onbeforeunload === eventHandle ) {
					this.onbeforeunload = null;
				}
			}
		}
	},

	simulate: function( type, elem, event, bubble ) {
		// Piggyback on a donor event to simulate a different one.
		// Fake originalEvent to avoid donor's stopPropagation, but if the
		// simulated event prevents default then we do the same on the donor.
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{ type: type,
				isSimulated: true,
				originalEvent: {}
			}
		);
		if ( bubble ) {
			jQuery.event.trigger( e, null, elem );
		} else {
			jQuery.event.dispatch.call( elem, e );
		}
		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

// Some plugins are using, but it's undocumented/deprecated and will be removed.
// The 1.7 special event interface should provide all the hooks needed now.
jQuery.event.handle = jQuery.event.dispatch;

jQuery.removeEvent = document.removeEventListener ?
	function( elem, type, handle ) {
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle, false );
		}
	} :
	function( elem, type, handle ) {
		var name = "on" + type;

		if ( elem.detachEvent ) {

			// #8545, #7054, preventing memory leaks for custom events in IE6-8 –
			// detachEvent needed property on element, by name of that event, to properly expose it to GC
			if ( typeof elem[ name ] === "undefined" ) {
				elem[ name ] = null;
			}

			elem.detachEvent( name, handle );
		}
	};

jQuery.Event = function( src, props ) {
	// Allow instantiation without the 'new' keyword
	if ( !(this instanceof jQuery.Event) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = ( src.defaultPrevented || src.returnValue === false ||
			src.getPreventDefault && src.getPreventDefault() ) ? returnTrue : returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

function returnFalse() {
	return false;
}
function returnTrue() {
	return true;
}

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	preventDefault: function() {
		this.isDefaultPrevented = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}

		// if preventDefault exists run it on the original event
		if ( e.preventDefault ) {
			e.preventDefault();

		// otherwise set the returnValue property of the original event to false (IE)
		} else {
			e.returnValue = false;
		}
	},
	stopPropagation: function() {
		this.isPropagationStopped = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}
		// if stopPropagation exists run it on the original event
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}
		// otherwise set the cancelBubble property of the original event to true (IE)
		e.cancelBubble = true;
	},
	stopImmediatePropagation: function() {
		this.isImmediatePropagationStopped = returnTrue;
		this.stopPropagation();
	},
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse
};

// Create mouseenter/leave events using mouseover/out and event-time checks
jQuery.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj,
				selector = handleObj.selector;

			// For mousenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
});

// IE submit delegation
if ( !jQuery.support.submitBubbles ) {

	jQuery.event.special.submit = {
		setup: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Lazy-add a submit handler when a descendant form may potentially be submitted
			jQuery.event.add( this, "click._submit keypress._submit", function( e ) {
				// Node name check avoids a VML-related crash in IE (#9807)
				var elem = e.target,
					form = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ? elem.form : undefined;
				if ( form && !jQuery._data( form, "_submit_attached" ) ) {
					jQuery.event.add( form, "submit._submit", function( event ) {
						event._submit_bubble = true;
					});
					jQuery._data( form, "_submit_attached", true );
				}
			});
			// return undefined since we don't need an event listener
		},

		postDispatch: function( event ) {
			// If form was submitted by the user, bubble the event up the tree
			if ( event._submit_bubble ) {
				delete event._submit_bubble;
				if ( this.parentNode && !event.isTrigger ) {
					jQuery.event.simulate( "submit", this.parentNode, event, true );
				}
			}
		},

		teardown: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Remove delegated handlers; cleanData eventually reaps submit handlers attached above
			jQuery.event.remove( this, "._submit" );
		}
	};
}

// IE change delegation and checkbox/radio fix
if ( !jQuery.support.changeBubbles ) {

	jQuery.event.special.change = {

		setup: function() {

			if ( rformElems.test( this.nodeName ) ) {
				// IE doesn't fire change on a check/radio until blur; trigger it on click
				// after a propertychange. Eat the blur-change in special.change.handle.
				// This still fires onchange a second time for check/radio after blur.
				if ( this.type === "checkbox" || this.type === "radio" ) {
					jQuery.event.add( this, "propertychange._change", function( event ) {
						if ( event.originalEvent.propertyName === "checked" ) {
							this._just_changed = true;
						}
					});
					jQuery.event.add( this, "click._change", function( event ) {
						if ( this._just_changed && !event.isTrigger ) {
							this._just_changed = false;
						}
						// Allow triggered, simulated change events (#11500)
						jQuery.event.simulate( "change", this, event, true );
					});
				}
				return false;
			}
			// Delegated event; lazy-add a change handler on descendant inputs
			jQuery.event.add( this, "beforeactivate._change", function( e ) {
				var elem = e.target;

				if ( rformElems.test( elem.nodeName ) && !jQuery._data( elem, "_change_attached" ) ) {
					jQuery.event.add( elem, "change._change", function( event ) {
						if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
							jQuery.event.simulate( "change", this.parentNode, event, true );
						}
					});
					jQuery._data( elem, "_change_attached", true );
				}
			});
		},

		handle: function( event ) {
			var elem = event.target;

			// Swallow native change events from checkbox/radio, we already triggered them above
			if ( this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox") ) {
				return event.handleObj.handler.apply( this, arguments );
			}
		},

		teardown: function() {
			jQuery.event.remove( this, "._change" );

			return !rformElems.test( this.nodeName );
		}
	};
}

// Create "bubbling" focus and blur events
if ( !jQuery.support.focusinBubbles ) {
	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler while someone wants focusin/focusout
		var attaches = 0,
			handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
			};

		jQuery.event.special[ fix ] = {
			setup: function() {
				if ( attaches++ === 0 ) {
					document.addEventListener( orig, handler, true );
				}
			},
			teardown: function() {
				if ( --attaches === 0 ) {
					document.removeEventListener( orig, handler, true );
				}
			}
		};
	});
}

jQuery.fn.extend({

	on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
		var origFn, type;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {
			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) { // && selector != null
				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				this.on( type, selector, data, types[ type ], one );
			}
			return this;
		}

		if ( data == null && fn == null ) {
			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {
				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {
				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return this;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {
				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};
			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return this.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		});
	},
	one: function( types, selector, data, fn ) {
		return this.on( types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {
			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {
			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {
			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each(function() {
			jQuery.event.remove( this, types, fn, selector );
		});
	},

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	live: function( types, data, fn ) {
		jQuery( this.context ).on( types, this.selector, data, fn );
		return this;
	},
	die: function( types, fn ) {
		jQuery( this.context ).off( types, this.selector || "**", fn );
		return this;
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {
		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length == 1? this.off( selector, "**" ) : this.off( types, selector || "**", fn );
	},

	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},
	triggerHandler: function( type, data ) {
		if ( this[0] ) {
			return jQuery.event.trigger( type, data, this[0], true );
		}
	},

	toggle: function( fn ) {
		// Save reference to arguments for access in closure
		var args = arguments,
			guid = fn.guid || jQuery.guid++,
			i = 0,
			toggler = function( event ) {
				// Figure out which function to execute
				var lastToggle = ( jQuery._data( this, "lastToggle" + fn.guid ) || 0 ) % i;
				jQuery._data( this, "lastToggle" + fn.guid, lastToggle + 1 );

				// Make sure that clicks stop
				event.preventDefault();

				// and execute the function
				return args[ lastToggle ].apply( this, arguments ) || false;
			};

		// link all the functions, so any of them can unbind this click handler
		toggler.guid = guid;
		while ( i < args.length ) {
			args[ i++ ].guid = guid;
		}

		return this.click( toggler );
	},

	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
});

jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		if ( fn == null ) {
			fn = data;
			data = null;
		}

		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};

	if ( rkeyEvent.test( name ) ) {
		jQuery.event.fixHooks[ name ] = jQuery.event.keyHooks;
	}

	if ( rmouseEvent.test( name ) ) {
		jQuery.event.fixHooks[ name ] = jQuery.event.mouseHooks;
	}
});
/*!
 * Sizzle CSS Selector Engine
 *  Copyright 2012 jQuery Foundation and other contributors
 *  Released under the MIT license
 *  http://sizzlejs.com/
 */
(function( window, undefined ) {

var dirruns,
	cachedruns,
	assertGetIdNotName,
	Expr,
	getText,
	isXML,
	contains,
	compile,
	sortOrder,
	hasDuplicate,

	baseHasDuplicate = true,
	strundefined = "undefined",

	expando = ( "sizcache" + Math.random() ).replace( ".", "" ),

	document = window.document,
	docElem = document.documentElement,
	done = 0,
	slice = [].slice,
	push = [].push,

	// Augment a function for special use by Sizzle
	markFunction = function( fn, value ) {
		fn[ expando ] = value || true;
		return fn;
	},

	createCache = function() {
		var cache = {},
			keys = [];

		return markFunction(function( key, value ) {
			// Only keep the most recent entries
			if ( keys.push( key ) > Expr.cacheLength ) {
				delete cache[ keys.shift() ];
			}

			return (cache[ key ] = value);
		}, cache );
	},

	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),

	// Regex

	// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",
	// http://www.w3.org/TR/css3-syntax/#characters
	characterEncoding = "(?:\\\\.|[-\\w]|[^\\x00-\\xa0])+",

	// Loosely modeled on CSS identifier characters
	// An unquoted value should be a CSS identifier (http://www.w3.org/TR/css3-selectors/#attribute-selectors)
	// Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = characterEncoding.replace( "w", "w#" ),

	// Acceptable operators http://www.w3.org/TR/selectors/#attribute-selectors
	operators = "([*^$|!~]?=)",
	attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace +
		"*(?:" + operators + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]",

	// Prefer arguments not in parens/brackets,
	//   then attribute selectors and non-pseudos (denoted by :),
	//   then anything else
	// These preferences are here to reduce the number of selectors
	//   needing tokenize in the PSEUDO preFilter
	pseudos = ":(" + characterEncoding + ")(?:\\((?:(['\"])((?:\\\\.|[^\\\\])*?)\\2|([^()[\\]]*|(?:(?:" + attributes + ")|[^:]|\\\\.)*|.*))\\)|)",

	// For matchExpr.POS and matchExpr.needsContext
	pos = ":(nth|eq|gt|lt|first|last|even|odd)(?:\\(((?:-\\d)?\\d*)\\)|)(?=[^-]|$)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([\\x20\\t\\r\\n\\f>+~])" + whitespace + "*" ),
	rpseudo = new RegExp( pseudos ),

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w\-]+)|(\w+)|\.([\w\-]+))$/,

	rnot = /^:not/,
	rsibling = /[\x20\t\r\n\f]*[+~]/,
	rendsWithNot = /:not\($/,

	rheader = /h\d/i,
	rinputs = /input|select|textarea|button/i,

	rbackslash = /\\(?!\\)/g,

	matchExpr = {
		"ID": new RegExp( "^#(" + characterEncoding + ")" ),
		"CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
		"NAME": new RegExp( "^\\[name=['\"]?(" + characterEncoding + ")['\"]?\\]" ),
		"TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|nth|last|first)-child(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"POS": new RegExp( pos, "ig" ),
		// For use in libraries implementing .is()
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|" + pos, "i" )
	},

	// Support

	// Used for testing something on an element
	assert = function( fn ) {
		var div = document.createElement("div");

		try {
			return fn( div );
		} catch (e) {
			return false;
		} finally {
			// release memory in IE
			div = null;
		}
	},

	// Check if getElementsByTagName("*") returns only elements
	assertTagNameNoComments = assert(function( div ) {
		div.appendChild( document.createComment("") );
		return !div.getElementsByTagName("*").length;
	}),

	// Check if getAttribute returns normalized href attributes
	assertHrefNotNormalized = assert(function( div ) {
		div.innerHTML = "<a href='#'></a>";
		return div.firstChild && typeof div.firstChild.getAttribute !== strundefined &&
			div.firstChild.getAttribute("href") === "#";
	}),

	// Check if attributes should be retrieved by attribute nodes
	assertAttributes = assert(function( div ) {
		div.innerHTML = "<select></select>";
		var type = typeof div.lastChild.getAttribute("multiple");
		// IE8 returns a string for some attributes even when not present
		return type !== "boolean" && type !== "string";
	}),

	// Check if getElementsByClassName can be trusted
	assertUsableClassName = assert(function( div ) {
		// Opera can't find a second classname (in 9.6)
		div.innerHTML = "<div class='hidden e'></div><div class='hidden'></div>";
		if ( !div.getElementsByClassName || !div.getElementsByClassName("e").length ) {
			return false;
		}

		// Safari 3.2 caches class attributes and doesn't catch changes
		div.lastChild.className = "e";
		return div.getElementsByClassName("e").length === 2;
	}),

	// Check if getElementById returns elements by name
	// Check if getElementsByName privileges form controls or returns elements by ID
	assertUsableName = assert(function( div ) {
		// Inject content
		div.id = expando + 0;
		div.innerHTML = "<a name='" + expando + "'></a><div name='" + expando + "'></div>";
		docElem.insertBefore( div, docElem.firstChild );

		// Test
		var pass = document.getElementsByName &&
			// buggy browsers will return fewer than the correct 2
			document.getElementsByName( expando ).length === 2 +
			// buggy browsers will return more than the correct 0
			document.getElementsByName( expando + 0 ).length;
		assertGetIdNotName = !document.getElementById( expando );

		// Cleanup
		docElem.removeChild( div );

		return pass;
	});

// If slice is not available, provide a backup
try {
	slice.call( docElem.childNodes, 0 )[0].nodeType;
} catch ( e ) {
	slice = function( i ) {
		var elem, results = [];
		for ( ; (elem = this[i]); i++ ) {
			results.push( elem );
		}
		return results;
	};
}

function Sizzle( selector, context, results, seed ) {
	results = results || [];
	context = context || document;
	var match, elem, xml, m,
		nodeType = context.nodeType;

	if ( nodeType !== 1 && nodeType !== 9 ) {
		return [];
	}

	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	xml = isXML( context );

	if ( !xml && !seed ) {
		if ( (match = rquickExpr.exec( selector )) ) {
			// Speed-up: Sizzle("#ID")
			if ( (m = match[1]) ) {
				if ( nodeType === 9 ) {
					elem = context.getElementById( m );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE, Opera, and Webkit return items
						// by name instead of ID
						if ( elem.id === m ) {
							results.push( elem );
							return results;
						}
					} else {
						return results;
					}
				} else {
					// Context is not a document
					if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
						contains( context, elem ) && elem.id === m ) {
						results.push( elem );
						return results;
					}
				}

			// Speed-up: Sizzle("TAG")
			} else if ( match[2] ) {
				push.apply( results, slice.call(context.getElementsByTagName( selector ), 0) );
				return results;

			// Speed-up: Sizzle(".CLASS")
			} else if ( (m = match[3]) && assertUsableClassName && context.getElementsByClassName ) {
				push.apply( results, slice.call(context.getElementsByClassName( m ), 0) );
				return results;
			}
		}
	}

	// All others
	return select( selector, context, results, seed, xml );
}

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	return Sizzle( expr, null, null, [ elem ] ).length > 0;
};

// Returns a function to use in pseudos for input types
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

// Returns a function to use in pseudos for buttons
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( nodeType ) {
		if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
			// Use textContent for elements
			// innerText usage removed for consistency of new lines (see #11153)
			if ( typeof elem.textContent === "string" ) {
				return elem.textContent;
			} else {
				// Traverse its children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
					ret += getText( elem );
				}
			}
		} else if ( nodeType === 3 || nodeType === 4 ) {
			return elem.nodeValue;
		}
		// Do not include comment or processing instruction nodes
	} else {

		// If no nodeType, this is expected to be an array
		for ( ; (node = elem[i]); i++ ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	}
	return ret;
};

isXML = Sizzle.isXML = function isXML( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

// Element contains another
contains = Sizzle.contains = docElem.contains ?
	function( a, b ) {
		var adown = a.nodeType === 9 ? a.documentElement : a,
			bup = b && b.parentNode;
		return a === bup || !!( bup && bup.nodeType === 1 && adown.contains && adown.contains(bup) );
	} :
	docElem.compareDocumentPosition ?
	function( a, b ) {
		return b && !!( a.compareDocumentPosition( b ) & 16 );
	} :
	function( a, b ) {
		while ( (b = b.parentNode) ) {
			if ( b === a ) {
				return true;
			}
		}
		return false;
	};

Sizzle.attr = function( elem, name ) {
	var attr,
		xml = isXML( elem );

	if ( !xml ) {
		name = name.toLowerCase();
	}
	if ( Expr.attrHandle[ name ] ) {
		return Expr.attrHandle[ name ]( elem );
	}
	if ( assertAttributes || xml ) {
		return elem.getAttribute( name );
	}
	attr = elem.getAttributeNode( name );
	return attr ?
		typeof elem[ name ] === "boolean" ?
			elem[ name ] ? name : null :
			attr.specified ? attr.value : null :
		null;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	order: new RegExp( "ID|TAG" +
		(assertUsableName ? "|NAME" : "") +
		(assertUsableClassName ? "|CLASS" : "")
	),

	// IE6/7 return a modified href
	attrHandle: assertHrefNotNormalized ?
		{} :
		{
			"href": function( elem ) {
				return elem.getAttribute( "href", 2 );
			},
			"type": function( elem ) {
				return elem.getAttribute("type");
			}
		},

	find: {
		"ID": assertGetIdNotName ?
			function( id, context, xml ) {
				if ( typeof context.getElementById !== strundefined && !xml ) {
					var m = context.getElementById( id );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					return m && m.parentNode ? [m] : [];
				}
			} :
			function( id, context, xml ) {
				if ( typeof context.getElementById !== strundefined && !xml ) {
					var m = context.getElementById( id );

					return m ?
						m.id === id || typeof m.getAttributeNode !== strundefined && m.getAttributeNode("id").value === id ?
							[m] :
							undefined :
						[];
				}
			},

		"TAG": assertTagNameNoComments ?
			function( tag, context ) {
				if ( typeof context.getElementsByTagName !== strundefined ) {
					return context.getElementsByTagName( tag );
				}
			} :
			function( tag, context ) {
				var results = context.getElementsByTagName( tag );

				// Filter out possible comments
				if ( tag === "*" ) {
					var elem,
						tmp = [],
						i = 0;

					for ( ; (elem = results[i]); i++ ) {
						if ( elem.nodeType === 1 ) {
							tmp.push( elem );
						}
					}

					return tmp;
				}
				return results;
			},

		"NAME": function( tag, context ) {
			if ( typeof context.getElementsByName !== strundefined ) {
				return context.getElementsByName( name );
			}
		},

		"CLASS": function( className, context, xml ) {
			if ( typeof context.getElementsByClassName !== strundefined && !xml ) {
				return context.getElementsByClassName( className );
			}
		}
	},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( rbackslash, "" );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[4] || match[5] || "" ).replace( rbackslash, "" );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr.CHILD
				1 type (only|nth|...)
				2 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				3 xn-component of xn+y argument ([+-]?\d*n|)
				4 sign of xn-component
				5 x of xn-component
				6 sign of y-component
				7 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1] === "nth" ) {
				// nth-child requires argument
				if ( !match[2] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[3] = +( match[3] ? match[4] + (match[5] || 1) : 2 * ( match[2] === "even" || match[2] === "odd" ) );
				match[4] = +( ( match[6] + match[7] ) || match[2] === "odd" );

			// other types prohibit arguments
			} else if ( match[2] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match, context, xml ) {
			var unquoted, excess;
			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			if ( match[3] ) {
				match[2] = match[3];
			} else if ( (unquoted = match[4]) ) {
				// Only check arguments that contain a pseudo
				if ( rpseudo.test(unquoted) &&
					// Get excess from tokenize (recursively)
					(excess = tokenize( unquoted, context, xml, true )) &&
					// advance to the next closing parenthesis
					(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

					// excess is a negative index
					unquoted = unquoted.slice( 0, excess );
					match[0] = match[0].slice( 0, excess );
				}
				match[2] = unquoted;
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {
		"ID": assertGetIdNotName ?
			function( id ) {
				id = id.replace( rbackslash, "" );
				return function( elem ) {
					return elem.getAttribute("id") === id;
				};
			} :
			function( id ) {
				id = id.replace( rbackslash, "" );
				return function( elem ) {
					var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
					return node && node.value === id;
				};
			},

		"TAG": function( nodeName ) {
			if ( nodeName === "*" ) {
				return function() { return true; };
			}
			nodeName = nodeName.replace( rbackslash, "" ).toLowerCase();

			return function( elem ) {
				return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
			};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ expando ][ className ];
			if ( !pattern ) {
				pattern = classCache( className, new RegExp("(^|" + whitespace + ")" + className + "(" + whitespace + "|$)") );
			}
			return function( elem ) {
				return pattern.test( elem.className || (typeof elem.getAttribute !== strundefined && elem.getAttribute("class")) || "" );
			};
		},

		"ATTR": function( name, operator, check ) {
			if ( !operator ) {
				return function( elem ) {
					return Sizzle.attr( elem, name ) != null;
				};
			}

			return function( elem ) {
				var result = Sizzle.attr( elem, name ),
					value = result + "";

				if ( result == null ) {
					return operator === "!=";
				}

				switch ( operator ) {
					case "=":
						return value === check;
					case "!=":
						return value !== check;
					case "^=":
						return check && value.indexOf( check ) === 0;
					case "*=":
						return check && value.indexOf( check ) > -1;
					case "$=":
						return check && value.substr( value.length - check.length ) === check;
					case "~=":
						return ( " " + value + " " ).indexOf( check ) > -1;
					case "|=":
						return value === check || value.substr( 0, check.length + 1 ) === check + "-";
				}
			};
		},

		"CHILD": function( type, argument, first, last ) {

			if ( type === "nth" ) {
				var doneName = done++;

				return function( elem ) {
					var parent, diff,
						count = 0,
						node = elem;

					if ( first === 1 && last === 0 ) {
						return true;
					}

					parent = elem.parentNode;

					if ( parent && (parent[ expando ] !== doneName || !elem.sizset) ) {
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								node.sizset = ++count;
								if ( node === elem ) {
									break;
								}
							}
						}

						parent[ expando ] = doneName;
					}

					diff = elem.sizset - last;

					if ( first === 0 ) {
						return diff === 0;

					} else {
						return ( diff % first === 0 && diff / first >= 0 );
					}
				};
			}

			return function( elem ) {
				var node = elem;

				switch ( type ) {
					case "only":
					case "first":
						while ( (node = node.previousSibling) ) {
							if ( node.nodeType === 1 ) {
								return false;
							}
						}

						if ( type === "first" ) {
							return true;
						}

						node = elem;

						/* falls through */
					case "last":
						while ( (node = node.nextSibling) ) {
							if ( node.nodeType === 1 ) {
								return false;
							}
						}

						return true;
				}
			};
		},

		"PSEUDO": function( pseudo, argument, context, xml ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.pseudos[ pseudo.toLowerCase() ];

			if ( !fn ) {
				Sizzle.error( "unsupported pseudo: " + pseudo );
			}

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( !fn[ expando ] ) {
				if ( fn.length > 1 ) {
					args = [ pseudo, pseudo, "", argument ];
					return function( elem ) {
						return fn( elem, 0, args );
					};
				}
				return fn;
			}

			return fn( argument, context, xml );
		}
	},

	pseudos: {
		"not": markFunction(function( selector, context, xml ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var matcher = compile( selector.replace( rtrim, "$1" ), context, xml );
			return function( elem ) {
				return !matcher( elem );
			};
		}),

		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is only affected by element nodes and content nodes(including text(3), cdata(4)),
			//   not comment, processing instructions, or others
			// Thanks to Diego Perini for the nodeName shortcut
			//   Greater than "@" means alpha characters (specifically not starting with "#" or "?")
			var nodeType;
			elem = elem.firstChild;
			while ( elem ) {
				if ( elem.nodeName > "@" || (nodeType = elem.nodeType) === 3 || nodeType === 4 ) {
					return false;
				}
				elem = elem.nextSibling;
			}
			return true;
		},

		"contains": markFunction(function( text ) {
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"text": function( elem ) {
			var type, attr;
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
			// use getAttribute instead to test this case
			return elem.nodeName.toLowerCase() === "input" &&
				(type = elem.type) === "text" &&
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === type );
		},

		// Input types
		"radio": createInputPseudo("radio"),
		"checkbox": createInputPseudo("checkbox"),
		"file": createInputPseudo("file"),
		"password": createInputPseudo("password"),
		"image": createInputPseudo("image"),

		"submit": createButtonPseudo("submit"),
		"reset": createButtonPseudo("reset"),

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"focus": function( elem ) {
			var doc = elem.ownerDocument;
			return elem === doc.activeElement && (!doc.hasFocus || doc.hasFocus()) && !!(elem.type || elem.href);
		},

		"active": function( elem ) {
			return elem === elem.ownerDocument.activeElement;
		}
	},

	setFilters: {
		"first": function( elements, argument, not ) {
			return not ? elements.slice( 1 ) : [ elements[0] ];
		},

		"last": function( elements, argument, not ) {
			var elem = elements.pop();
			return not ? elements : [ elem ];
		},

		"even": function( elements, argument, not ) {
			var results = [],
				i = not ? 1 : 0,
				len = elements.length;
			for ( ; i < len; i = i + 2 ) {
				results.push( elements[i] );
			}
			return results;
		},

		"odd": function( elements, argument, not ) {
			var results = [],
				i = not ? 0 : 1,
				len = elements.length;
			for ( ; i < len; i = i + 2 ) {
				results.push( elements[i] );
			}
			return results;
		},

		"lt": function( elements, argument, not ) {
			return not ? elements.slice( +argument ) : elements.slice( 0, +argument );
		},

		"gt": function( elements, argument, not ) {
			return not ? elements.slice( 0, +argument + 1 ) : elements.slice( +argument + 1 );
		},

		"eq": function( elements, argument, not ) {
			var elem = elements.splice( +argument, 1 );
			return not ? elements : elem;
		}
	}
};

function siblingCheck( a, b, ret ) {
	if ( a === b ) {
		return ret;
	}

	var cur = a.nextSibling;

	while ( cur ) {
		if ( cur === b ) {
			return -1;
		}

		cur = cur.nextSibling;
	}

	return 1;
}

sortOrder = docElem.compareDocumentPosition ?
	function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		return ( !a.compareDocumentPosition || !b.compareDocumentPosition ?
			a.compareDocumentPosition :
			a.compareDocumentPosition(b) & 4
		) ? -1 : 1;
	} :
	function( a, b ) {
		// The nodes are identical, we can exit early
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// Fallback to using sourceIndex (in IE) if it's available on both nodes
		} else if ( a.sourceIndex && b.sourceIndex ) {
			return a.sourceIndex - b.sourceIndex;
		}

		var al, bl,
			ap = [],
			bp = [],
			aup = a.parentNode,
			bup = b.parentNode,
			cur = aup;

		// If the nodes are siblings (or identical) we can do a quick check
		if ( aup === bup ) {
			return siblingCheck( a, b );

		// If no parents were found then the nodes are disconnected
		} else if ( !aup ) {
			return -1;

		} else if ( !bup ) {
			return 1;
		}

		// Otherwise they're somewhere else in the tree so we need
		// to build up a full list of the parentNodes for comparison
		while ( cur ) {
			ap.unshift( cur );
			cur = cur.parentNode;
		}

		cur = bup;

		while ( cur ) {
			bp.unshift( cur );
			cur = cur.parentNode;
		}

		al = ap.length;
		bl = bp.length;

		// Start walking down the tree looking for a discrepancy
		for ( var i = 0; i < al && i < bl; i++ ) {
			if ( ap[i] !== bp[i] ) {
				return siblingCheck( ap[i], bp[i] );
			}
		}

		// We ended someplace up the tree so do a sibling check
		return i === al ?
			siblingCheck( a, bp[i], -1 ) :
			siblingCheck( ap[i], b, 1 );
	};

// Always assume the presence of duplicates if sort doesn't
// pass them to our comparison function (as in Google Chrome).
[0, 0].sort( sortOrder );
baseHasDuplicate = !hasDuplicate;

// Document sorting and removing duplicates
Sizzle.uniqueSort = function( results ) {
	var elem,
		i = 1;

	hasDuplicate = baseHasDuplicate;
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		for ( ; (elem = results[i]); i++ ) {
			if ( elem === results[ i - 1 ] ) {
				results.splice( i--, 1 );
			}
		}
	}

	return results;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

function tokenize( selector, context, xml, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, group, i,
		preFilters, filters,
		checkContext = !xml && context !== document,
		// Token cache should maintain spaces
		key = ( checkContext ? "<s>" : "" ) + selector.replace( rtrim, "$1<s>" ),
		cached = tokenCache[ expando ][ key ];

	if ( cached ) {
		return parseOnly ? 0 : slice.call( cached, 0 );
	}

	soFar = selector;
	groups = [];
	i = 0;
	preFilters = Expr.preFilter;
	filters = Expr.filter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				soFar = soFar.slice( match[0].length );
				tokens.selector = group;
			}
			groups.push( tokens = [] );
			group = "";

			// Need to make sure we're within a narrower context if necessary
			// Adding a descendant combinator will generate what is needed
			if ( checkContext ) {
				soFar = " " + soFar;
			}
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			group += match[0];
			soFar = soFar.slice( match[0].length );

			// Cast descendant combinators to space
			matched = tokens.push({
				part: match.pop().replace( rtrim, " " ),
				string: match[0],
				captures: match
			});
		}

		// Filters
		for ( type in filters ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				( match = preFilters[ type ](match, context, xml) )) ) {

				group += match[0];
				soFar = soFar.slice( match[0].length );
				matched = tokens.push({
					part: type,
					string: match.shift(),
					captures: match
				});
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Attach the full group as a selector
	if ( group ) {
		tokens.selector = group;
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			slice.call( tokenCache(key, groups), 0 );
}

function addCombinator( matcher, combinator, context, xml ) {
	var dir = combinator.dir,
		doneName = done++;

	if ( !matcher ) {
		// If there is no matcher to check, check against the context
		matcher = function( elem ) {
			return elem === context;
		};
	}
	return combinator.first ?
		function( elem ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 ) {
					return matcher( elem ) && elem;
				}
			}
		} :
		xml ?
			function( elem ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 ) {
						if ( matcher( elem ) ) {
							return elem;
						}
					}
				}
			} :
			function( elem ) {
				var cache,
					dirkey = doneName + "." + dirruns,
					cachedkey = dirkey + "." + cachedruns;
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 ) {
						if ( (cache = elem[ expando ]) === cachedkey ) {
							return elem.sizset;
						} else if ( typeof cache === "string" && cache.indexOf(dirkey) === 0 ) {
							if ( elem.sizset ) {
								return elem;
							}
						} else {
							elem[ expando ] = cachedkey;
							if ( matcher( elem ) ) {
								elem.sizset = true;
								return elem;
							}
							elem.sizset = false;
						}
					}
				}
			};
}

function addMatcher( higher, deeper ) {
	return higher ?
		function( elem ) {
			var result = deeper( elem );
			return result && higher( result === true ? elem : result );
		} :
		deeper;
}

// ["TAG", ">", "ID", " ", "CLASS"]
function matcherFromTokens( tokens, context, xml ) {
	var token, matcher,
		i = 0;

	for ( ; (token = tokens[i]); i++ ) {
		if ( Expr.relative[ token.part ] ) {
			matcher = addCombinator( matcher, Expr.relative[ token.part ], context, xml );
		} else {
			matcher = addMatcher( matcher, Expr.filter[ token.part ].apply(null, token.captures.concat( context, xml )) );
		}
	}

	return matcher;
}

function matcherFromGroupMatchers( matchers ) {
	return function( elem ) {
		var matcher,
			j = 0;
		for ( ; (matcher = matchers[j]); j++ ) {
			if ( matcher(elem) ) {
				return true;
			}
		}
		return false;
	};
}

compile = Sizzle.compile = function( selector, context, xml ) {
	var group, i, len,
		cached = compilerCache[ expando ][ selector ];

	// Return a cached group function if already generated (context dependent)
	if ( cached && cached.context === context ) {
		return cached;
	}

	// Generate a function of recursive functions that can be used to check each element
	group = tokenize( selector, context, xml );
	for ( i = 0, len = group.length; i < len; i++ ) {
		group[i] = matcherFromTokens(group[i], context, xml);
	}

	// Cache the compiled function
	cached = compilerCache( selector, matcherFromGroupMatchers(group) );
	cached.context = context;
	cached.runs = cached.dirruns = 0;
	return cached;
};

function multipleContexts( selector, contexts, results, seed ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results, seed );
	}
}

function handlePOSGroup( selector, posfilter, argument, contexts, seed, not ) {
	var results,
		fn = Expr.setFilters[ posfilter.toLowerCase() ];

	if ( !fn ) {
		Sizzle.error( posfilter );
	}

	if ( selector || !(results = seed) ) {
		multipleContexts( selector || "*", contexts, (results = []), seed );
	}

	return results.length > 0 ? fn( results, argument, not ) : [];
}

function handlePOS( groups, context, results, seed ) {
	var group, part, j, groupLen, token, selector,
		anchor, elements, match, matched,
		lastIndex, currentContexts, not,
		i = 0,
		len = groups.length,
		rpos = matchExpr["POS"],
		// This is generated here in case matchExpr["POS"] is extended
		rposgroups = new RegExp( "^" + rpos.source + "(?!" + whitespace + ")", "i" ),
		// This is for making sure non-participating
		// matching groups are represented cross-browser (IE6-8)
		setUndefined = function() {
			var i = 1,
				len = arguments.length - 2;
			for ( ; i < len; i++ ) {
				if ( arguments[i] === undefined ) {
					match[i] = undefined;
				}
			}
		};

	for ( ; i < len; i++ ) {
		group = groups[i];
		part = "";
		elements = seed;
		for ( j = 0, groupLen = group.length; j < groupLen; j++ ) {
			token = group[j];
			selector = token.string;
			if ( token.part === "PSEUDO" ) {
				// Reset regex index to 0
				rpos.exec("");
				anchor = 0;
				while ( (match = rpos.exec( selector )) ) {
					matched = true;
					lastIndex = rpos.lastIndex = match.index + match[0].length;
					if ( lastIndex > anchor ) {
						part += selector.slice( anchor, match.index );
						anchor = lastIndex;
						currentContexts = [ context ];

						if ( rcombinators.test(part) ) {
							if ( elements ) {
								currentContexts = elements;
							}
							elements = seed;
						}

						if ( (not = rendsWithNot.test( part )) ) {
							part = part.slice( 0, -5 ).replace( rcombinators, "$&*" );
							anchor++;
						}

						if ( match.length > 1 ) {
							match[0].replace( rposgroups, setUndefined );
						}
						elements = handlePOSGroup( part, match[1], match[2], currentContexts, elements, not );
					}
					part = "";
				}

			}

			if ( !matched ) {
				part += selector;
			}
			matched = false;
		}

		if ( part ) {
			if ( rcombinators.test(part) ) {
				multipleContexts( part, elements || [ context ], results, seed );
			} else {
				Sizzle( part, context, results, seed ? seed.concat(elements) : elements );
			}
		} else {
			push.apply( results, elements );
		}
	}

	// Do not sort if this is a single filter
	return len === 1 ? results : Sizzle.uniqueSort( results );
}

function select( selector, context, results, seed, xml ) {
	// Remove excessive whitespace
	selector = selector.replace( rtrim, "$1" );
	var elements, matcher, cached, elem,
		i, tokens, token, lastToken, findContext, type,
		match = tokenize( selector, context, xml ),
		contextNodeType = context.nodeType;

	// POS handling
	if ( matchExpr["POS"].test(selector) ) {
		return handlePOS( match, context, results, seed );
	}

	if ( seed ) {
		elements = slice.call( seed, 0 );

	// To maintain document order, only narrow the
	// set if there is one group
	} else if ( match.length === 1 ) {

		// Take a shortcut and set the context if the root selector is an ID
		if ( (tokens = slice.call( match[0], 0 )).length > 2 &&
				(token = tokens[0]).part === "ID" &&
				contextNodeType === 9 && !xml &&
				Expr.relative[ tokens[1].part ] ) {

			context = Expr.find["ID"]( token.captures[0].replace( rbackslash, "" ), context, xml )[0];
			if ( !context ) {
				return results;
			}

			selector = selector.slice( tokens.shift().string.length );
		}

		findContext = ( (match = rsibling.exec( tokens[0].string )) && !match.index && context.parentNode ) || context;

		// Reduce the set if possible
		lastToken = "";
		for ( i = tokens.length - 1; i >= 0; i-- ) {
			token = tokens[i];
			type = token.part;
			lastToken = token.string + lastToken;
			if ( Expr.relative[ type ] ) {
				break;
			}
			if ( Expr.order.test(type) ) {
				elements = Expr.find[ type ]( token.captures[0].replace( rbackslash, "" ), findContext, xml );
				if ( elements == null ) {
					continue;
				} else {
					selector = selector.slice( 0, selector.length - lastToken.length ) +
						lastToken.replace( matchExpr[ type ], "" );

					if ( !selector ) {
						push.apply( results, slice.call(elements, 0) );
					}

					break;
				}
			}
		}
	}

	// Only loop over the given elements once
	if ( selector ) {
		matcher = compile( selector, context, xml );
		dirruns = matcher.dirruns++;
		if ( elements == null ) {
			elements = Expr.find["TAG"]( "*", (rsibling.test( selector ) && context.parentNode) || context );
		}

		for ( i = 0; (elem = elements[i]); i++ ) {
			cachedruns = matcher.runs++;
			if ( matcher(elem) ) {
				results.push( elem );
			}
		}
	}

	return results;
}

if ( document.querySelectorAll ) {
	(function() {
		var disconnectedMatch,
			oldSelect = select,
			rescape = /'|\\/g,
			rattributeQuotes = /\=[\x20\t\r\n\f]*([^'"\]]*)[\x20\t\r\n\f]*\]/g,
			rbuggyQSA = [],
			// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
			// A support test would require too much code (would include document ready)
			// just skip matchesSelector for :active
			rbuggyMatches = [":active"],
			matches = docElem.matchesSelector ||
				docElem.mozMatchesSelector ||
				docElem.webkitMatchesSelector ||
				docElem.oMatchesSelector ||
				docElem.msMatchesSelector;

		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explictly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			div.innerHTML = "<select><option selected=''></option></select>";

			// IE8 - Some boolean attributes are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:checked|disabled|ismap|multiple|readonly|selected|value)" );
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here (do not put tests after this one)
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}
		});

		assert(function( div ) {

			// Opera 10-12/IE9 - ^= $= *= and empty values
			// Should not select anything
			div.innerHTML = "<p test=''></p>";
			if ( div.querySelectorAll("[test^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:\"\"|'')" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here (do not put tests after this one)
			div.innerHTML = "<input type='hidden'/>";
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push(":enabled", ":disabled");
			}
		});

		rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );

		select = function( selector, context, results, seed, xml ) {
			// Only use querySelectorAll when not filtering,
			// when this is not xml,
			// and when no QSA bugs apply
			if ( !seed && !xml && (!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
				if ( context.nodeType === 9 ) {
					try {
						push.apply( results, slice.call(context.querySelectorAll( selector ), 0) );
						return results;
					} catch(qsaError) {}
				// qSA works strangely on Element-rooted queries
				// We can work around this by specifying an extra ID on the root
				// and working up from there (Thanks to Andrew Dupont for the technique)
				// IE 8 doesn't work on object elements
				} else if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
					var groups, i, len,
						old = context.getAttribute("id"),
						nid = old || expando,
						newContext = rsibling.test( selector ) && context.parentNode || context;

					if ( old ) {
						nid = nid.replace( rescape, "\\$&" );
					} else {
						context.setAttribute( "id", nid );
					}

					groups = tokenize(selector, context, xml);
					// Trailing space is unnecessary
					// There is always a context check
					nid = "[id='" + nid + "']";
					for ( i = 0, len = groups.length; i < len; i++ ) {
						groups[i] = nid + groups[i].selector;
					}
					try {
						push.apply( results, slice.call( newContext.querySelectorAll(
							groups.join(",")
						), 0 ) );
						return results;
					} catch(qsaError) {
					} finally {
						if ( !old ) {
							context.removeAttribute("id");
						}
					}
				}
			}

			return oldSelect( selector, context, results, seed, xml );
		};

		if ( matches ) {
			assert(function( div ) {
				// Check to see if it's possible to do matchesSelector
				// on a disconnected node (IE 9)
				disconnectedMatch = matches.call( div, "div" );

				// This should fail with an exception
				// Gecko does not error, returns false instead
				try {
					matches.call( div, "[test!='']:sizzle" );
					rbuggyMatches.push( matchExpr["PSEUDO"].source, matchExpr["POS"].source, "!=" );
				} catch ( e ) {}
			});

			// rbuggyMatches always contains :active, so no need for a length check
			rbuggyMatches = /* rbuggyMatches.length && */ new RegExp( rbuggyMatches.join("|") );

			Sizzle.matchesSelector = function( elem, expr ) {
				// Make sure that attribute selectors are quoted
				expr = expr.replace( rattributeQuotes, "='$1']" );

				// rbuggyMatches always contains :active, so no need for an existence check
				if ( !isXML( elem ) && !rbuggyMatches.test( expr ) && (!rbuggyQSA || !rbuggyQSA.test( expr )) ) {
					try {
						var ret = matches.call( elem, expr );

						// IE 9's matchesSelector returns false on disconnected nodes
						if ( ret || disconnectedMatch ||
								// As well, disconnected nodes are said to be in a document
								// fragment in IE 9
								elem.document && elem.document.nodeType !== 11 ) {
							return ret;
						}
					} catch(e) {}
				}

				return Sizzle( expr, null, null, [ elem ] ).length > 0;
			};
		}
	})();
}

// Deprecated
Expr.setFilters["nth"] = Expr.setFilters["eq"];

// Back-compat
Expr.filters = Expr.pseudos;

// Override sizzle attribute retrieval
Sizzle.attr = jQuery.attr;
jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.pseudos;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;


})( window );
var runtil = /Until$/,
	rparentsprev = /^(?:parents|prev(?:Until|All))/,
	isSimple = /^.[^:#\[\.,]*$/,
	rneedsContext = jQuery.expr.match.needsContext,
	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend({
	find: function( selector ) {
		var i, l, length, n, r, ret,
			self = this;

		if ( typeof selector !== "string" ) {
			return jQuery( selector ).filter(function() {
				for ( i = 0, l = self.length; i < l; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			});
		}

		ret = this.pushStack( "", "find", selector );

		for ( i = 0, l = this.length; i < l; i++ ) {
			length = ret.length;
			jQuery.find( selector, this[i], ret );

			if ( i > 0 ) {
				// Make sure that the results are unique
				for ( n = length; n < ret.length; n++ ) {
					for ( r = 0; r < length; r++ ) {
						if ( ret[r] === ret[n] ) {
							ret.splice(n--, 1);
							break;
						}
					}
				}
			}
		}

		return ret;
	},

	has: function( target ) {
		var i,
			targets = jQuery( target, this ),
			len = targets.length;

		return this.filter(function() {
			for ( i = 0; i < len; i++ ) {
				if ( jQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	not: function( selector ) {
		return this.pushStack( winnow(this, selector, false), "not", selector);
	},

	filter: function( selector ) {
		return this.pushStack( winnow(this, selector, true), "filter", selector );
	},

	is: function( selector ) {
		return !!selector && (
			typeof selector === "string" ?
				// If this is a positional/relative selector, check membership in the returned set
				// so $("p:first").is("p:last") won't return true for a doc with two "p".
				rneedsContext.test( selector ) ?
					jQuery( selector, this.context ).index( this[0] ) >= 0 :
					jQuery.filter( selector, this ).length > 0 :
				this.filter( selector ).length > 0 );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			ret = [],
			pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			cur = this[i];

			while ( cur && cur.ownerDocument && cur !== context && cur.nodeType !== 11 ) {
				if ( pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors) ) {
					ret.push( cur );
					break;
				}
				cur = cur.parentNode;
			}
		}

		ret = ret.length > 1 ? jQuery.unique( ret ) : ret;

		return this.pushStack( ret, "closest", selectors );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[0] && this[0].parentNode ) ? this.prevAll().length : -1;
		}

		// index in selector
		if ( typeof elem === "string" ) {
			return jQuery.inArray( this[0], jQuery( elem ) );
		}

		// Locate the position of the desired element
		return jQuery.inArray(
			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[0] : elem, this );
	},

	add: function( selector, context ) {
		var set = typeof selector === "string" ?
				jQuery( selector, context ) :
				jQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),
			all = jQuery.merge( this.get(), set );

		return this.pushStack( isDisconnected( set[0] ) || isDisconnected( all[0] ) ?
			all :
			jQuery.unique( all ) );
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter(selector)
		);
	}
});

jQuery.fn.andSelf = jQuery.fn.addBack;

// A painfully simple check to see if an element is disconnected
// from a document (should be improved, where feasible).
function isDisconnected( node ) {
	return !node || !node.parentNode || node.parentNode.nodeType === 11;
}

function sibling( cur, dir ) {
	do {
		cur = cur[ dir ];
	} while ( cur && cur.nodeType !== 1 );

	return cur;
}

jQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild );
	},
	contents: function( elem ) {
		return jQuery.nodeName( elem, "iframe" ) ?
			elem.contentDocument || elem.contentWindow.document :
			jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var ret = jQuery.map( this, fn, until );

		if ( !runtil.test( name ) ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			ret = jQuery.filter( selector, ret );
		}

		ret = this.length > 1 && !guaranteedUnique[ name ] ? jQuery.unique( ret ) : ret;

		if ( this.length > 1 && rparentsprev.test( name ) ) {
			ret = ret.reverse();
		}

		return this.pushStack( ret, name, core_slice.call( arguments ).join(",") );
	};
});

jQuery.extend({
	filter: function( expr, elems, not ) {
		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		return elems.length === 1 ?
			jQuery.find.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] :
			jQuery.find.matches(expr, elems);
	},

	dir: function( elem, dir, until ) {
		var matched = [],
			cur = elem[ dir ];

		while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
			if ( cur.nodeType === 1 ) {
				matched.push( cur );
			}
			cur = cur[dir];
		}
		return matched;
	},

	sibling: function( n, elem ) {
		var r = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				r.push( n );
			}
		}

		return r;
	}
});

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, keep ) {

	// Can't pass null or undefined to indexOf in Firefox 4
	// Set to 0 to skip string check
	qualifier = qualifier || 0;

	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep(elements, function( elem, i ) {
			var retVal = !!qualifier.call( elem, i, elem );
			return retVal === keep;
		});

	} else if ( qualifier.nodeType ) {
		return jQuery.grep(elements, function( elem, i ) {
			return ( elem === qualifier ) === keep;
		});

	} else if ( typeof qualifier === "string" ) {
		var filtered = jQuery.grep(elements, function( elem ) {
			return elem.nodeType === 1;
		});

		if ( isSimple.test( qualifier ) ) {
			return jQuery.filter(qualifier, filtered, !keep);
		} else {
			qualifier = jQuery.filter( qualifier, filtered );
		}
	}

	return jQuery.grep(elements, function( elem, i ) {
		return ( jQuery.inArray( elem, qualifier ) >= 0 ) === keep;
	});
}
function createSafeFragment( document ) {
	var list = nodeNames.split( "|" ),
	safeFrag = document.createDocumentFragment();

	if ( safeFrag.createElement ) {
		while ( list.length ) {
			safeFrag.createElement(
				list.pop()
			);
		}
	}
	return safeFrag;
}

var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|" +
		"header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
	rinlinejQuery = / jQuery\d+="(?:null|\d+)"/g,
	rleadingWhitespace = /^\s+/,
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
	rtagName = /<([\w:]+)/,
	rtbody = /<tbody/i,
	rhtml = /<|&#?\w+;/,
	rnoInnerhtml = /<(?:script|style|link)/i,
	rnocache = /<(?:script|object|embed|option|style)/i,
	rnoshimcache = new RegExp("<(?:" + nodeNames + ")[\\s/>]", "i"),
	rcheckableType = /^(?:checkbox|radio)$/,
	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptType = /\/(java|ecma)script/i,
	rcleanScript = /^\s*<!(?:\[CDATA\[|\-\-)|[\]\-]{2}>\s*$/g,
	wrapMap = {
		option: [ 1, "<select multiple='multiple'>", "</select>" ],
		legend: [ 1, "<fieldset>", "</fieldset>" ],
		thead: [ 1, "<table>", "</table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
		col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
		area: [ 1, "<map>", "</map>" ],
		_default: [ 0, "", "" ]
	},
	safeFragment = createSafeFragment( document ),
	fragmentDiv = safeFragment.appendChild( document.createElement("div") );

wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

// IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
// unless wrapped in a div with non-breaking characters in front of it.
if ( !jQuery.support.htmlSerialize ) {
	wrapMap._default = [ 1, "X<div>", "</div>" ];
}

jQuery.fn.extend({
	text: function( value ) {
		return jQuery.access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().append( ( this[0] && this[0].ownerDocument || document ).createTextNode( value ) );
		}, null, value, arguments.length );
	},

	wrapAll: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapAll( html.call(this, i) );
			});
		}

		if ( this[0] ) {
			// The elements to wrap the target around
			var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);

			if ( this[0].parentNode ) {
				wrap.insertBefore( this[0] );
			}

			wrap.map(function() {
				var elem = this;

				while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
					elem = elem.firstChild;
				}

				return elem;
			}).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapInner( html.call(this, i) );
			});
		}

		return this.each(function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		});
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each(function(i) {
			jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
		});
	},

	unwrap: function() {
		return this.parent().each(function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		}).end();
	},

	append: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 ) {
				this.appendChild( elem );
			}
		});
	},

	prepend: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 ) {
				this.insertBefore( elem, this.firstChild );
			}
		});
	},

	before: function() {
		if ( !isDisconnected( this[0] ) ) {
			return this.domManip(arguments, false, function( elem ) {
				this.parentNode.insertBefore( elem, this );
			});
		}

		if ( arguments.length ) {
			var set = jQuery.clean( arguments );
			return this.pushStack( jQuery.merge( set, this ), "before", this.selector );
		}
	},

	after: function() {
		if ( !isDisconnected( this[0] ) ) {
			return this.domManip(arguments, false, function( elem ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			});
		}

		if ( arguments.length ) {
			var set = jQuery.clean( arguments );
			return this.pushStack( jQuery.merge( this, set ), "after", this.selector );
		}
	},

	// keepData is for internal use only--do not document
	remove: function( selector, keepData ) {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			if ( !selector || jQuery.filter( selector, [ elem ] ).length ) {
				if ( !keepData && elem.nodeType === 1 ) {
					jQuery.cleanData( elem.getElementsByTagName("*") );
					jQuery.cleanData( [ elem ] );
				}

				if ( elem.parentNode ) {
					elem.parentNode.removeChild( elem );
				}
			}
		}

		return this;
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			// Remove element nodes and prevent memory leaks
			if ( elem.nodeType === 1 ) {
				jQuery.cleanData( elem.getElementsByTagName("*") );
			}

			// Remove any remaining nodes
			while ( elem.firstChild ) {
				elem.removeChild( elem.firstChild );
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function () {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		});
	},

	html: function( value ) {
		return jQuery.access( this, function( value ) {
			var elem = this[0] || {},
				i = 0,
				l = this.length;

			if ( value === undefined ) {
				return elem.nodeType === 1 ?
					elem.innerHTML.replace( rinlinejQuery, "" ) :
					undefined;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				( jQuery.support.htmlSerialize || !rnoshimcache.test( value )  ) &&
				( jQuery.support.leadingWhitespace || !rleadingWhitespace.test( value ) ) &&
				!wrapMap[ ( rtagName.exec( value ) || ["", ""] )[1].toLowerCase() ] ) {

				value = value.replace( rxhtmlTag, "<$1></$2>" );

				try {
					for (; i < l; i++ ) {
						// Remove element nodes and prevent memory leaks
						elem = this[i] || {};
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( elem.getElementsByTagName( "*" ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch(e) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function( value ) {
		if ( !isDisconnected( this[0] ) ) {
			// Make sure that the elements are removed from the DOM before they are inserted
			// this can help fix replacing a parent with child elements
			if ( jQuery.isFunction( value ) ) {
				return this.each(function(i) {
					var self = jQuery(this), old = self.html();
					self.replaceWith( value.call( this, i, old ) );
				});
			}

			if ( typeof value !== "string" ) {
				value = jQuery( value ).detach();
			}

			return this.each(function() {
				var next = this.nextSibling,
					parent = this.parentNode;

				jQuery( this ).remove();

				if ( next ) {
					jQuery(next).before( value );
				} else {
					jQuery(parent).append( value );
				}
			});
		}

		return this.length ?
			this.pushStack( jQuery(jQuery.isFunction(value) ? value() : value), "replaceWith", value ) :
			this;
	},

	detach: function( selector ) {
		return this.remove( selector, true );
	},

	domManip: function( args, table, callback ) {

		// Flatten any nested arrays
		args = [].concat.apply( [], args );

		var results, first, fragment, iNoClone,
			i = 0,
			value = args[0],
			scripts = [],
			l = this.length;

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( !jQuery.support.checkClone && l > 1 && typeof value === "string" && rchecked.test( value ) ) {
			return this.each(function() {
				jQuery(this).domManip( args, table, callback );
			});
		}

		if ( jQuery.isFunction(value) ) {
			return this.each(function(i) {
				var self = jQuery(this);
				args[0] = value.call( this, i, table ? self.html() : undefined );
				self.domManip( args, table, callback );
			});
		}

		if ( this[0] ) {
			results = jQuery.buildFragment( args, this, scripts );
			fragment = results.fragment;
			first = fragment.firstChild;

			if ( fragment.childNodes.length === 1 ) {
				fragment = first;
			}

			if ( first ) {
				table = table && jQuery.nodeName( first, "tr" );

				// Use the original fragment for the last item instead of the first because it can end up
				// being emptied incorrectly in certain situations (#8070).
				// Fragments from the fragment cache must always be cloned and never used in place.
				for ( iNoClone = results.cacheable || l - 1; i < l; i++ ) {
					callback.call(
						table && jQuery.nodeName( this[i], "table" ) ?
							findOrAppend( this[i], "tbody" ) :
							this[i],
						i === iNoClone ?
							fragment :
							jQuery.clone( fragment, true, true )
					);
				}
			}

			// Fix #11809: Avoid leaking memory
			fragment = first = null;

			if ( scripts.length ) {
				jQuery.each( scripts, function( i, elem ) {
					if ( elem.src ) {
						if ( jQuery.ajax ) {
							jQuery.ajax({
								url: elem.src,
								type: "GET",
								dataType: "script",
								async: false,
								global: false,
								"throws": true
							});
						} else {
							jQuery.error("no ajax");
						}
					} else {
						jQuery.globalEval( ( elem.text || elem.textContent || elem.innerHTML || "" ).replace( rcleanScript, "" ) );
					}

					if ( elem.parentNode ) {
						elem.parentNode.removeChild( elem );
					}
				});
			}
		}

		return this;
	}
});

function findOrAppend( elem, tag ) {
	return elem.getElementsByTagName( tag )[0] || elem.appendChild( elem.ownerDocument.createElement( tag ) );
}

function cloneCopyEvent( src, dest ) {

	if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
		return;
	}

	var type, i, l,
		oldData = jQuery._data( src ),
		curData = jQuery._data( dest, oldData ),
		events = oldData.events;

	if ( events ) {
		delete curData.handle;
		curData.events = {};

		for ( type in events ) {
			for ( i = 0, l = events[ type ].length; i < l; i++ ) {
				jQuery.event.add( dest, type, events[ type ][ i ] );
			}
		}
	}

	// make the cloned public data object a copy from the original
	if ( curData.data ) {
		curData.data = jQuery.extend( {}, curData.data );
	}
}

function cloneFixAttributes( src, dest ) {
	var nodeName;

	// We do not need to do anything for non-Elements
	if ( dest.nodeType !== 1 ) {
		return;
	}

	// clearAttributes removes the attributes, which we don't want,
	// but also removes the attachEvent events, which we *do* want
	if ( dest.clearAttributes ) {
		dest.clearAttributes();
	}

	// mergeAttributes, in contrast, only merges back on the
	// original attributes, not the events
	if ( dest.mergeAttributes ) {
		dest.mergeAttributes( src );
	}

	nodeName = dest.nodeName.toLowerCase();

	if ( nodeName === "object" ) {
		// IE6-10 improperly clones children of object elements using classid.
		// IE10 throws NoModificationAllowedError if parent is null, #12132.
		if ( dest.parentNode ) {
			dest.outerHTML = src.outerHTML;
		}

		// This path appears unavoidable for IE9. When cloning an object
		// element in IE9, the outerHTML strategy above is not sufficient.
		// If the src has innerHTML and the destination does not,
		// copy the src.innerHTML into the dest.innerHTML. #10324
		if ( jQuery.support.html5Clone && (src.innerHTML && !jQuery.trim(dest.innerHTML)) ) {
			dest.innerHTML = src.innerHTML;
		}

	} else if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
		// IE6-8 fails to persist the checked state of a cloned checkbox
		// or radio button. Worse, IE6-7 fail to give the cloned element
		// a checked appearance if the defaultChecked value isn't also set

		dest.defaultChecked = dest.checked = src.checked;

		// IE6-7 get confused and end up setting the value of a cloned
		// checkbox/radio button to an empty string instead of "on"
		if ( dest.value !== src.value ) {
			dest.value = src.value;
		}

	// IE6-8 fails to return the selected option to the default selected
	// state when cloning options
	} else if ( nodeName === "option" ) {
		dest.selected = src.defaultSelected;

	// IE6-8 fails to set the defaultValue to the correct value when
	// cloning other types of input fields
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;

	// IE blanks contents when cloning scripts
	} else if ( nodeName === "script" && dest.text !== src.text ) {
		dest.text = src.text;
	}

	// Event data gets referenced instead of copied if the expando
	// gets copied too
	dest.removeAttribute( jQuery.expando );
}

jQuery.buildFragment = function( args, context, scripts ) {
	var fragment, cacheable, cachehit,
		first = args[ 0 ];

	// Set context from what may come in as undefined or a jQuery collection or a node
	// Updated to fix #12266 where accessing context[0] could throw an exception in IE9/10 &
	// also doubles as fix for #8950 where plain objects caused createDocumentFragment exception
	context = context || document;
	context = !context.nodeType && context[0] || context;
	context = context.ownerDocument || context;

	// Only cache "small" (1/2 KB) HTML strings that are associated with the main document
	// Cloning options loses the selected state, so don't cache them
	// IE 6 doesn't like it when you put <object> or <embed> elements in a fragment
	// Also, WebKit does not clone 'checked' attributes on cloneNode, so don't cache
	// Lastly, IE6,7,8 will not correctly reuse cached fragments that were created from unknown elems #10501
	if ( args.length === 1 && typeof first === "string" && first.length < 512 && context === document &&
		first.charAt(0) === "<" && !rnocache.test( first ) &&
		(jQuery.support.checkClone || !rchecked.test( first )) &&
		(jQuery.support.html5Clone || !rnoshimcache.test( first )) ) {

		// Mark cacheable and look for a hit
		cacheable = true;
		fragment = jQuery.fragments[ first ];
		cachehit = fragment !== undefined;
	}

	if ( !fragment ) {
		fragment = context.createDocumentFragment();
		jQuery.clean( args, context, fragment, scripts );

		// Update the cache, but only store false
		// unless this is a second parsing of the same content
		if ( cacheable ) {
			jQuery.fragments[ first ] = cachehit && fragment;
		}
	}

	return { fragment: fragment, cacheable: cacheable };
};

jQuery.fragments = {};

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			i = 0,
			ret = [],
			insert = jQuery( selector ),
			l = insert.length,
			parent = this.length === 1 && this[0].parentNode;

		if ( (parent == null || parent && parent.nodeType === 11 && parent.childNodes.length === 1) && l === 1 ) {
			insert[ original ]( this[0] );
			return this;
		} else {
			for ( ; i < l; i++ ) {
				elems = ( i > 0 ? this.clone(true) : this ).get();
				jQuery( insert[i] )[ original ]( elems );
				ret = ret.concat( elems );
			}

			return this.pushStack( ret, name, insert.selector );
		}
	};
});

function getAll( elem ) {
	if ( typeof elem.getElementsByTagName !== "undefined" ) {
		return elem.getElementsByTagName( "*" );

	} else if ( typeof elem.querySelectorAll !== "undefined" ) {
		return elem.querySelectorAll( "*" );

	} else {
		return [];
	}
}

// Used in clean, fixes the defaultChecked property
function fixDefaultChecked( elem ) {
	if ( rcheckableType.test( elem.type ) ) {
		elem.defaultChecked = elem.checked;
	}
}

jQuery.extend({
	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var srcElements,
			destElements,
			i,
			clone;

		if ( jQuery.support.html5Clone || jQuery.isXMLDoc(elem) || !rnoshimcache.test( "<" + elem.nodeName + ">" ) ) {
			clone = elem.cloneNode( true );

		// IE<=8 does not properly clone detached, unknown element nodes
		} else {
			fragmentDiv.innerHTML = elem.outerHTML;
			fragmentDiv.removeChild( clone = fragmentDiv.firstChild );
		}

		if ( (!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) &&
				(elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem) ) {
			// IE copies events bound via attachEvent when using cloneNode.
			// Calling detachEvent on the clone will also remove the events
			// from the original. In order to get around this, we use some
			// proprietary methods to clear the events. Thanks to MooTools
			// guys for this hotness.

			cloneFixAttributes( elem, clone );

			// Using Sizzle here is crazy slow, so we use getElementsByTagName instead
			srcElements = getAll( elem );
			destElements = getAll( clone );

			// Weird iteration because IE will replace the length property
			// with an element if you are cloning the body and one of the
			// elements on the page has a name or id of "length"
			for ( i = 0; srcElements[i]; ++i ) {
				// Ensure that the destination node is not null; Fixes #9587
				if ( destElements[i] ) {
					cloneFixAttributes( srcElements[i], destElements[i] );
				}
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			cloneCopyEvent( elem, clone );

			if ( deepDataAndEvents ) {
				srcElements = getAll( elem );
				destElements = getAll( clone );

				for ( i = 0; srcElements[i]; ++i ) {
					cloneCopyEvent( srcElements[i], destElements[i] );
				}
			}
		}

		srcElements = destElements = null;

		// Return the cloned set
		return clone;
	},

	clean: function( elems, context, fragment, scripts ) {
		var i, j, elem, tag, wrap, depth, div, hasBody, tbody, len, handleScript, jsTags,
			safe = context === document && safeFragment,
			ret = [];

		// Ensure that context is a document
		if ( !context || typeof context.createDocumentFragment === "undefined" ) {
			context = document;
		}

		// Use the already-created safe fragment if context permits
		for ( i = 0; (elem = elems[i]) != null; i++ ) {
			if ( typeof elem === "number" ) {
				elem += "";
			}

			if ( !elem ) {
				continue;
			}

			// Convert html string into DOM nodes
			if ( typeof elem === "string" ) {
				if ( !rhtml.test( elem ) ) {
					elem = context.createTextNode( elem );
				} else {
					// Ensure a safe container in which to render the html
					safe = safe || createSafeFragment( context );
					div = context.createElement("div");
					safe.appendChild( div );

					// Fix "XHTML"-style tags in all browsers
					elem = elem.replace(rxhtmlTag, "<$1></$2>");

					// Go to html and back, then peel off extra wrappers
					tag = ( rtagName.exec( elem ) || ["", ""] )[1].toLowerCase();
					wrap = wrapMap[ tag ] || wrapMap._default;
					depth = wrap[0];
					div.innerHTML = wrap[1] + elem + wrap[2];

					// Move to the right depth
					while ( depth-- ) {
						div = div.lastChild;
					}

					// Remove IE's autoinserted <tbody> from table fragments
					if ( !jQuery.support.tbody ) {

						// String was a <table>, *may* have spurious <tbody>
						hasBody = rtbody.test(elem);
							tbody = tag === "table" && !hasBody ?
								div.firstChild && div.firstChild.childNodes :

								// String was a bare <thead> or <tfoot>
								wrap[1] === "<table>" && !hasBody ?
									div.childNodes :
									[];

						for ( j = tbody.length - 1; j >= 0 ; --j ) {
							if ( jQuery.nodeName( tbody[ j ], "tbody" ) && !tbody[ j ].childNodes.length ) {
								tbody[ j ].parentNode.removeChild( tbody[ j ] );
							}
						}
					}

					// IE completely kills leading whitespace when innerHTML is used
					if ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
						div.insertBefore( context.createTextNode( rleadingWhitespace.exec(elem)[0] ), div.firstChild );
					}

					elem = div.childNodes;

					// Take out of fragment container (we need a fresh div each time)
					div.parentNode.removeChild( div );
				}
			}

			if ( elem.nodeType ) {
				ret.push( elem );
			} else {
				jQuery.merge( ret, elem );
			}
		}

		// Fix #11356: Clear elements from safeFragment
		if ( div ) {
			elem = div = safe = null;
		}

		// Reset defaultChecked for any radios and checkboxes
		// about to be appended to the DOM in IE 6/7 (#8060)
		if ( !jQuery.support.appendChecked ) {
			for ( i = 0; (elem = ret[i]) != null; i++ ) {
				if ( jQuery.nodeName( elem, "input" ) ) {
					fixDefaultChecked( elem );
				} else if ( typeof elem.getElementsByTagName !== "undefined" ) {
					jQuery.grep( elem.getElementsByTagName("input"), fixDefaultChecked );
				}
			}
		}

		// Append elements to a provided document fragment
		if ( fragment ) {
			// Special handling of each script element
			handleScript = function( elem ) {
				// Check if we consider it executable
				if ( !elem.type || rscriptType.test( elem.type ) ) {
					// Detach the script and store it in the scripts array (if provided) or the fragment
					// Return truthy to indicate that it has been handled
					return scripts ?
						scripts.push( elem.parentNode ? elem.parentNode.removeChild( elem ) : elem ) :
						fragment.appendChild( elem );
				}
			};

			for ( i = 0; (elem = ret[i]) != null; i++ ) {
				// Check if we're done after handling an executable script
				if ( !( jQuery.nodeName( elem, "script" ) && handleScript( elem ) ) ) {
					// Append to fragment and handle embedded scripts
					fragment.appendChild( elem );
					if ( typeof elem.getElementsByTagName !== "undefined" ) {
						// handleScript alters the DOM, so use jQuery.merge to ensure snapshot iteration
						jsTags = jQuery.grep( jQuery.merge( [], elem.getElementsByTagName("script") ), handleScript );

						// Splice the scripts into ret after their former ancestor and advance our index beyond them
						ret.splice.apply( ret, [i + 1, 0].concat( jsTags ) );
						i += jsTags.length;
					}
				}
			}
		}

		return ret;
	},

	cleanData: function( elems, /* internal */ acceptData ) {
		var data, id, elem, type,
			i = 0,
			internalKey = jQuery.expando,
			cache = jQuery.cache,
			deleteExpando = jQuery.support.deleteExpando,
			special = jQuery.event.special;

		for ( ; (elem = elems[i]) != null; i++ ) {

			if ( acceptData || jQuery.acceptData( elem ) ) {

				id = elem[ internalKey ];
				data = id && cache[ id ];

				if ( data ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Remove cache only if it was not already removed by jQuery.event.remove
					if ( cache[ id ] ) {

						delete cache[ id ];

						// IE does not allow us to delete expando properties from nodes,
						// nor does it have a removeAttribute function on Document nodes;
						// we must handle all of these cases
						if ( deleteExpando ) {
							delete elem[ internalKey ];

						} else if ( elem.removeAttribute ) {
							elem.removeAttribute( internalKey );

						} else {
							elem[ internalKey ] = null;
						}

						jQuery.deletedIds.push( id );
					}
				}
			}
		}
	}
});
// Limit scope pollution from any deprecated API
(function() {

var matched, browser;

// Use of jQuery.browser is frowned upon.
// More details: http://api.jquery.com/jQuery.browser
// jQuery.uaMatch maintained for back-compat
jQuery.uaMatch = function( ua ) {
	ua = ua.toLowerCase();

	var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
		/(webkit)[ \/]([\w.]+)/.exec( ua ) ||
		/(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
		/(msie) ([\w.]+)/.exec( ua ) ||
		ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
		[];

	return {
		browser: match[ 1 ] || "",
		version: match[ 2 ] || "0"
	};
};

matched = jQuery.uaMatch( navigator.userAgent );
browser = {};

if ( matched.browser ) {
	browser[ matched.browser ] = true;
	browser.version = matched.version;
}

// Chrome is Webkit, but Webkit is also Safari.
if ( browser.chrome ) {
	browser.webkit = true;
} else if ( browser.webkit ) {
	browser.safari = true;
}

jQuery.browser = browser;

jQuery.sub = function() {
	function jQuerySub( selector, context ) {
		return new jQuerySub.fn.init( selector, context );
	}
	jQuery.extend( true, jQuerySub, this );
	jQuerySub.superclass = this;
	jQuerySub.fn = jQuerySub.prototype = this();
	jQuerySub.fn.constructor = jQuerySub;
	jQuerySub.sub = this.sub;
	jQuerySub.fn.init = function init( selector, context ) {
		if ( context && context instanceof jQuery && !(context instanceof jQuerySub) ) {
			context = jQuerySub( context );
		}

		return jQuery.fn.init.call( this, selector, context, rootjQuerySub );
	};
	jQuerySub.fn.init.prototype = jQuerySub.fn;
	var rootjQuerySub = jQuerySub(document);
	return jQuerySub;
};

})();
var curCSS, iframe, iframeDoc,
	ralpha = /alpha\([^)]*\)/i,
	ropacity = /opacity=([^)]*)/,
	rposition = /^(top|right|bottom|left)$/,
	// swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
	// see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rmargin = /^margin/,
	rnumsplit = new RegExp( "^(" + core_pnum + ")(.*)$", "i" ),
	rnumnonpx = new RegExp( "^(" + core_pnum + ")(?!px)[a-z%]+$", "i" ),
	rrelNum = new RegExp( "^([-+])=(" + core_pnum + ")", "i" ),
	elemdisplay = {},

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: 0,
		fontWeight: 400
	},

	cssExpand = [ "Top", "Right", "Bottom", "Left" ],
	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ],

	eventsToggle = jQuery.fn.toggle;

// return a css property mapped to a potentially vendor prefixed property
function vendorPropName( style, name ) {

	// shortcut for names that are not vendor prefixed
	if ( name in style ) {
		return name;
	}

	// check for vendor prefixed names
	var capName = name.charAt(0).toUpperCase() + name.slice(1),
		origName = name,
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in style ) {
			return name;
		}
	}

	return origName;
}

function isHidden( elem, el ) {
	elem = el || elem;
	return jQuery.css( elem, "display" ) === "none" || !jQuery.contains( elem.ownerDocument, elem );
}

function showHide( elements, show ) {
	var elem, display,
		values = [],
		index = 0,
		length = elements.length;

	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		values[ index ] = jQuery._data( elem, "olddisplay" );
		if ( show ) {
			// Reset the inline display of this element to learn if it is
			// being hidden by cascaded rules or not
			if ( !values[ index ] && elem.style.display === "none" ) {
				elem.style.display = "";
			}

			// Set elements which have been overridden with display: none
			// in a stylesheet to whatever the default browser style is
			// for such an element
			if ( elem.style.display === "" && isHidden( elem ) ) {
				values[ index ] = jQuery._data( elem, "olddisplay", css_defaultDisplay(elem.nodeName) );
			}
		} else {
			display = curCSS( elem, "display" );

			if ( !values[ index ] && display !== "none" ) {
				jQuery._data( elem, "olddisplay", display );
			}
		}
	}

	// Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for ( index = 0; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
			elem.style.display = show ? values[ index ] || "" : "none";
		}
	}

	return elements;
}

jQuery.fn.extend({
	css: function( name, value ) {
		return jQuery.access( this, function( elem, name, value ) {
			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	},
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state, fn2 ) {
		var bool = typeof state === "boolean";

		if ( jQuery.isFunction( state ) && jQuery.isFunction( fn2 ) ) {
			return eventsToggle.apply( this, arguments );
		}

		return this.each(function() {
			if ( bool ? state : isHidden( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		});
	}
});

jQuery.extend({
	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {
					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;

				}
			}
		}
	},

	// Exclude the following css properties to add px
	cssNumber: {
		"fillOpacity": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		// normalize float css property
		"float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {
		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// convert relative number strings (+= or -=) to relative numbers. #7345
			if ( type === "string" && (ret = rrelNum.exec( value )) ) {
				value = ( ret[1] + 1 ) * ret[2] + parseFloat( jQuery.css( elem, name ) );
				// Fixes bug #9237
				type = "number";
			}

			// Make sure that NaN and null values aren't set. See: #7116
			if ( value == null || type === "number" && isNaN( value ) ) {
				return;
			}

			// If a number was passed in, add 'px' to the (except for certain CSS properties)
			if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
				value += "px";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value, extra )) !== undefined ) {
				// Wrapped to prevent IE from throwing errors when 'invalid' values are provided
				// Fixes bug #5509
				try {
					style[ name ] = value;
				} catch(e) {}
			}

		} else {
			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, numeric, extra ) {
		var val, num, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( elem.style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name );
		}

		//convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Return, converting to number if forced or a qualifier was provided and val looks numeric
		if ( numeric || extra !== undefined ) {
			num = parseFloat( val );
			return numeric || jQuery.isNumeric( num ) ? num || 0 : val;
		}
		return val;
	},

	// A method for quickly swapping in/out CSS properties to get correct calculations
	swap: function( elem, options, callback ) {
		var ret, name,
			old = {};

		// Remember the old values, and insert the new ones
		for ( name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		ret = callback.call( elem );

		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}

		return ret;
	}
});

// NOTE: To any future maintainer, we've window.getComputedStyle
// because jsdom on node.js will break without it.
if ( window.getComputedStyle ) {
	curCSS = function( elem, name ) {
		var ret, width, minWidth, maxWidth,
			computed = window.getComputedStyle( elem, null ),
			style = elem.style;

		if ( computed ) {

			ret = computed[ name ];
			if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
				ret = jQuery.style( elem, name );
			}

			// A tribute to the "awesome hack by Dean Edwards"
			// Chrome < 17 and Safari 5.0 uses "computed value" instead of "used value" for margin-right
			// Safari 5.1.7 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
			// this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
			if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {
				width = style.width;
				minWidth = style.minWidth;
				maxWidth = style.maxWidth;

				style.minWidth = style.maxWidth = style.width = ret;
				ret = computed.width;

				style.width = width;
				style.minWidth = minWidth;
				style.maxWidth = maxWidth;
			}
		}

		return ret;
	};
} else if ( document.documentElement.currentStyle ) {
	curCSS = function( elem, name ) {
		var left, rsLeft,
			ret = elem.currentStyle && elem.currentStyle[ name ],
			style = elem.style;

		// Avoid setting ret to empty string here
		// so we don't default to auto
		if ( ret == null && style && style[ name ] ) {
			ret = style[ name ];
		}

		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

		// If we're not dealing with a regular pixel number
		// but a number that has a weird ending, we need to convert it to pixels
		// but not position css attributes, as those are proportional to the parent element instead
		// and we can't measure the parent instead because it might trigger a "stacking dolls" problem
		if ( rnumnonpx.test( ret ) && !rposition.test( name ) ) {

			// Remember the original values
			left = style.left;
			rsLeft = elem.runtimeStyle && elem.runtimeStyle.left;

			// Put in the new values to get a computed value out
			if ( rsLeft ) {
				elem.runtimeStyle.left = elem.currentStyle.left;
			}
			style.left = name === "fontSize" ? "1em" : ret;
			ret = style.pixelLeft + "px";

			// Revert the changed values
			style.left = left;
			if ( rsLeft ) {
				elem.runtimeStyle.left = rsLeft;
			}
		}

		return ret === "" ? "auto" : ret;
	};
}

function setPositiveNumber( elem, value, subtract ) {
	var matches = rnumsplit.exec( value );
	return matches ?
			Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
			value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox ) {
	var i = extra === ( isBorderBox ? "border" : "content" ) ?
		// If we already have the right measurement, avoid augmentation
		4 :
		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

		val = 0;

	for ( ; i < 4; i += 2 ) {
		// both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			// we use jQuery.css instead of curCSS here
			// because of the reliableMarginRight CSS hook!
			val += jQuery.css( elem, extra + cssExpand[ i ], true );
		}

		// From this point on we use curCSS for maximum performance (relevant in animations)
		if ( isBorderBox ) {
			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= parseFloat( curCSS( elem, "padding" + cssExpand[ i ] ) ) || 0;
			}

			// at this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= parseFloat( curCSS( elem, "border" + cssExpand[ i ] + "Width" ) ) || 0;
			}
		} else {
			// at this point, extra isn't content, so add padding
			val += parseFloat( curCSS( elem, "padding" + cssExpand[ i ] ) ) || 0;

			// at this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += parseFloat( curCSS( elem, "border" + cssExpand[ i ] + "Width" ) ) || 0;
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		valueIsBorderBox = true,
		isBorderBox = jQuery.support.boxSizing && jQuery.css( elem, "boxSizing" ) === "border-box";

	// some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {
		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test(val) ) {
			return val;
		}

		// we need the check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox && ( jQuery.support.boxSizingReliable || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox
		)
	) + "px";
}


// Try to determine the default display value of an element
function css_defaultDisplay( nodeName ) {
	if ( elemdisplay[ nodeName ] ) {
		return elemdisplay[ nodeName ];
	}

	var elem = jQuery( "<" + nodeName + ">" ).appendTo( document.body ),
		display = elem.css("display");
	elem.remove();

	// If the simple way fails,
	// get element's real default display by attaching it to a temp iframe
	if ( display === "none" || display === "" ) {
		// Use the already-created iframe if possible
		iframe = document.body.appendChild(
			iframe || jQuery.extend( document.createElement("iframe"), {
				frameBorder: 0,
				width: 0,
				height: 0
			})
		);

		// Create a cacheable copy of the iframe document on first call.
		// IE and Opera will allow us to reuse the iframeDoc without re-writing the fake HTML
		// document to it; WebKit & Firefox won't allow reusing the iframe document.
		if ( !iframeDoc || !iframe.createElement ) {
			iframeDoc = ( iframe.contentWindow || iframe.contentDocument ).document;
			iframeDoc.write("<!doctype html><html><body>");
			iframeDoc.close();
		}

		elem = iframeDoc.body.appendChild( iframeDoc.createElement(nodeName) );

		display = curCSS( elem, "display" );
		document.body.removeChild( iframe );
	}

	// Store the correct default display
	elemdisplay[ nodeName ] = display;

	return display;
}

jQuery.each([ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {
				// certain elements can have dimension info if we invisibly show them
				// however, it must have a current display style that would benefit from this
				if ( elem.offsetWidth === 0 && rdisplayswap.test( curCSS( elem, "display" ) ) ) {
					return jQuery.swap( elem, cssShow, function() {
						return getWidthOrHeight( elem, name, extra );
					});
				} else {
					return getWidthOrHeight( elem, name, extra );
				}
			}
		},

		set: function( elem, value, extra ) {
			return setPositiveNumber( elem, value, extra ?
				augmentWidthOrHeight(
					elem,
					name,
					extra,
					jQuery.support.boxSizing && jQuery.css( elem, "boxSizing" ) === "border-box"
				) : 0
			);
		}
	};
});

if ( !jQuery.support.opacity ) {
	jQuery.cssHooks.opacity = {
		get: function( elem, computed ) {
			// IE uses filters for opacity
			return ropacity.test( (computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "" ) ?
				( 0.01 * parseFloat( RegExp.$1 ) ) + "" :
				computed ? "1" : "";
		},

		set: function( elem, value ) {
			var style = elem.style,
				currentStyle = elem.currentStyle,
				opacity = jQuery.isNumeric( value ) ? "alpha(opacity=" + value * 100 + ")" : "",
				filter = currentStyle && currentStyle.filter || style.filter || "";

			// IE has trouble with opacity if it does not have layout
			// Force it by setting the zoom level
			style.zoom = 1;

			// if setting opacity to 1, and no other filters exist - attempt to remove filter attribute #6652
			if ( value >= 1 && jQuery.trim( filter.replace( ralpha, "" ) ) === "" &&
				style.removeAttribute ) {

				// Setting style.filter to null, "" & " " still leave "filter:" in the cssText
				// if "filter:" is present at all, clearType is disabled, we want to avoid this
				// style.removeAttribute is IE Only, but so apparently is this code path...
				style.removeAttribute( "filter" );

				// if there there is no filter style applied in a css rule, we are done
				if ( currentStyle && !currentStyle.filter ) {
					return;
				}
			}

			// otherwise, set new filter values
			style.filter = ralpha.test( filter ) ?
				filter.replace( ralpha, opacity ) :
				filter + " " + opacity;
		}
	};
}

// These hooks cannot be added until DOM ready because the support test
// for it is not run until after DOM ready
jQuery(function() {
	if ( !jQuery.support.reliableMarginRight ) {
		jQuery.cssHooks.marginRight = {
			get: function( elem, computed ) {
				// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
				// Work around by temporarily setting element display to inline-block
				return jQuery.swap( elem, { "display": "inline-block" }, function() {
					if ( computed ) {
						return curCSS( elem, "marginRight" );
					}
				});
			}
		};
	}

	// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
	// getComputedStyle returns percent when specified for top/left/bottom/right
	// rather than make the css module depend on the offset module, we just check for it here
	if ( !jQuery.support.pixelPosition && jQuery.fn.position ) {
		jQuery.each( [ "top", "left" ], function( i, prop ) {
			jQuery.cssHooks[ prop ] = {
				get: function( elem, computed ) {
					if ( computed ) {
						var ret = curCSS( elem, prop );
						// if curCSS returns percentage, fallback to offset
						return rnumnonpx.test( ret ) ? jQuery( elem ).position()[ prop ] + "px" : ret;
					}
				}
			};
		});
	}

});

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.hidden = function( elem ) {
		return ( elem.offsetWidth === 0 && elem.offsetHeight === 0 ) || (!jQuery.support.reliableHiddenOffsets && ((elem.style && elem.style.display) || curCSS( elem, "display" )) === "none");
	};

	jQuery.expr.filters.visible = function( elem ) {
		return !jQuery.expr.filters.hidden( elem );
	};
}

// These hooks are used by animate to expand properties
jQuery.each({
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i,

				// assumes a single number if not a string
				parts = typeof value === "string" ? value.split(" ") : [ value ],
				expanded = {};

			for ( i = 0; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
});
var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rinput = /^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,
	rselectTextarea = /^(?:select|textarea)/i;

jQuery.fn.extend({
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map(function(){
			return this.elements ? jQuery.makeArray( this.elements ) : this;
		})
		.filter(function(){
			return this.name && !this.disabled &&
				( this.checked || rselectTextarea.test( this.nodeName ) ||
					rinput.test( this.type ) );
		})
		.map(function( i, elem ){
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val, i ){
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					}) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		}).get();
	}
});

//Serialize an array of form elements or a set of
//key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {
			// If value is a function, invoke it and return its value
			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// Set traditional to true for jQuery <= 1.3.2 behavior.
	if ( traditional === undefined ) {
		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		});

	} else {
		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
};

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {
		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// If array item is non-scalar (array or object), encode its
				// numeric index to resolve deserialization ambiguity issues.
				// Note that rack (as of 1.0.0) can't currently deserialize
				// nested arrays properly, and attempting to do so may cause
				// a server error. Possible fixes are to modify rack's
				// deserialization algorithm or to provide an option or flag
				// to force array serialization to be shallow.
				buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {
		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}
var // Document location
	ajaxLocation,
	// Document location segments
	ajaxLocParts,

	rhash = /#.*$/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rquery = /\?/,
	rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
	rts = /([?&])_=[^&]*/,
	rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,

	// Keep a copy of the old load method
	_load = jQuery.fn.load,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = ["*/"] + ["*"];

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
try {
	ajaxLocation = location.href;
} catch( e ) {
	// Use the href attribute of an A element
	// since IE will modify it given document.location
	ajaxLocation = document.createElement( "a" );
	ajaxLocation.href = "";
	ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType, list, placeBefore,
			dataTypes = dataTypeExpression.toLowerCase().split( core_rspace ),
			i = 0,
			length = dataTypes.length;

		if ( jQuery.isFunction( func ) ) {
			// For each dataType in the dataTypeExpression
			for ( ; i < length; i++ ) {
				dataType = dataTypes[ i ];
				// We control if we're asked to add before
				// any existing element
				placeBefore = /^\+/.test( dataType );
				if ( placeBefore ) {
					dataType = dataType.substr( 1 ) || "*";
				}
				list = structure[ dataType ] = structure[ dataType ] || [];
				// then we add to the structure accordingly
				list[ placeBefore ? "unshift" : "push" ]( func );
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR,
		dataType /* internal */, inspected /* internal */ ) {

	dataType = dataType || options.dataTypes[ 0 ];
	inspected = inspected || {};

	inspected[ dataType ] = true;

	var selection,
		list = structure[ dataType ],
		i = 0,
		length = list ? list.length : 0,
		executeOnly = ( structure === prefilters );

	for ( ; i < length && ( executeOnly || !selection ); i++ ) {
		selection = list[ i ]( options, originalOptions, jqXHR );
		// If we got redirected to another dataType
		// we try there if executing only and not done already
		if ( typeof selection === "string" ) {
			if ( !executeOnly || inspected[ selection ] ) {
				selection = undefined;
			} else {
				options.dataTypes.unshift( selection );
				selection = inspectPrefiltersOrTransports(
						structure, options, originalOptions, jqXHR, selection, inspected );
			}
		}
	}
	// If we're only executing or nothing was selected
	// we try the catchall dataType if not done already
	if ( ( executeOnly || !selection ) && !inspected[ "*" ] ) {
		selection = inspectPrefiltersOrTransports(
				structure, options, originalOptions, jqXHR, "*", inspected );
	}
	// unnecessary when only executing (prefilters)
	// but it'll be ignored by the caller in that case
	return selection;
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};
	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}
}

jQuery.fn.load = function( url, params, callback ) {
	if ( typeof url !== "string" && _load ) {
		return _load.apply( this, arguments );
	}

	// Don't do a request if no elements are being requested
	if ( !this.length ) {
		return this;
	}

	var selector, type, response,
		self = this,
		off = url.indexOf(" ");

	if ( off >= 0 ) {
		selector = url.slice( off, url.length );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// Request the remote document
	jQuery.ajax({
		url: url,

		// if "type" variable is undefined, then "GET" method will be used
		type: type,
		dataType: "html",
		data: params,
		complete: function( jqXHR, status ) {
			if ( callback ) {
				self.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );
			}
		}
	}).done(function( responseText ) {

		// Save response for use in complete callback
		response = arguments;

		// See if a selector was specified
		self.html( selector ?

			// Create a dummy div to hold the results
			jQuery("<div>")

				// inject the contents of the document in, removing the scripts
				// to avoid any 'Permission Denied' errors in IE
				.append( responseText.replace( rscript, "" ) )

				// Locate the specified elements
				.find( selector ) :

			// If not, just inject the full result
			responseText );

	});

	return this;
};

// Attach a bunch of functions for handling common AJAX events
jQuery.each( "ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split( " " ), function( i, o ){
	jQuery.fn[ o ] = function( f ){
		return this.on( o, f );
	};
});

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			type: method,
			url: url,
			data: data,
			success: callback,
			dataType: type
		});
	};
});

jQuery.extend({

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		if ( settings ) {
			// Building a settings object
			ajaxExtend( target, jQuery.ajaxSettings );
		} else {
			// Extending ajaxSettings
			settings = target;
			target = jQuery.ajaxSettings;
		}
		ajaxExtend( target, settings );
		return target;
	},

	ajaxSettings: {
		url: ajaxLocation,
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		type: "GET",
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		processData: true,
		async: true,
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			xml: "application/xml, text/xml",
			html: "text/html",
			text: "text/plain",
			json: "application/json, text/javascript",
			"*": allTypes
		},

		contents: {
			xml: /xml/,
			html: /html/,
			json: /json/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText"
		},

		// List of data converters
		// 1) key format is "source_type destination_type" (a single space in-between)
		// 2) the catchall symbol "*" can be used for source_type
		converters: {

			// Convert anything to text
			"* text": window.String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			context: true,
			url: true
		}
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var // ifModified key
			ifModifiedKey,
			// Response headers
			responseHeadersString,
			responseHeaders,
			// transport
			transport,
			// timeout handle
			timeoutTimer,
			// Cross-domain detection vars
			parts,
			// To know if global events are to be dispatched
			fireGlobals,
			// Loop variable
			i,
			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events
			// It's the callbackContext if one was provided in the options
			// and if it's a DOM node or a jQuery collection
			globalEventContext = callbackContext !== s &&
				( callbackContext.nodeType || callbackContext instanceof jQuery ) ?
						jQuery( callbackContext ) : jQuery.event,
			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks( "once memory" ),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},
			// The jqXHR state
			state = 0,
			// Default abort message
			strAbort = "canceled",
			// Fake xhr
			jqXHR = {

				readyState: 0,

				// Caches the header
				setRequestHeader: function( name, value ) {
					if ( !state ) {
						var lname = name.toLowerCase();
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match === undefined ? null : match;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					statusText = statusText || strAbort;
					if ( transport ) {
						transport.abort( statusText );
					}
					done( 0, statusText );
					return this;
				}
			};

		// Callback for when everything is done
		// It is defined here because jslint complains if it is declared
		// at the end of the function (which would be more logical and readable)
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// If successful, handle type chaining
			if ( status >= 200 && status < 300 || status === 304 ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {

					modified = jqXHR.getResponseHeader("Last-Modified");
					if ( modified ) {
						jQuery.lastModified[ ifModifiedKey ] = modified;
					}
					modified = jqXHR.getResponseHeader("Etag");
					if ( modified ) {
						jQuery.etag[ ifModifiedKey ] = modified;
					}
				}

				// If not modified
				if ( status === 304 ) {

					statusText = "notmodified";
					isSuccess = true;

				// If we have data
				} else {

					isSuccess = ajaxConvert( s, response );
					statusText = isSuccess.state;
					success = isSuccess.data;
					error = isSuccess.error;
					isSuccess = !error;
				}
			} else {
				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if ( !statusText || status ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = "" + ( nativeStatusText || statusText );

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajax" + ( isSuccess ? "Success" : "Error" ),
						[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		// Attach deferreds
		deferred.promise( jqXHR );
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;
		jqXHR.complete = completeDeferred.add;

		// Status-dependent callbacks
		jqXHR.statusCode = function( map ) {
			if ( map ) {
				var tmp;
				if ( state < 2 ) {
					for ( tmp in map ) {
						statusCode[ tmp ] = [ statusCode[tmp], map[tmp] ];
					}
				} else {
					tmp = map[ jqXHR.status ];
					jqXHR.always( tmp );
				}
			}
			return this;
		};

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
		// We also use the url parameter if available
		s.url = ( ( url || s.url ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().split( core_rspace );

		// Determine if a cross-domain request is in order
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] != ajaxLocParts[ 1 ] || parts[ 2 ] != ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? 80 : 443 ) ) !=
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? 80 : 443 ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( state === 2 ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		fireGlobals = s.global;

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.data;
				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Get ifModifiedKey before adding the anti-cache parameter
			ifModifiedKey = s.url;

			// Add anti-cache in url if needed
			if ( s.cache === false ) {

				var ts = jQuery.now(),
					// try replacing _= if it is there
					ret = s.url.replace( rts, "$1_=" + ts );

				// if nothing was replaced, add timestamp to the end
				s.url = ret + ( ( ret === s.url ) ? ( rquery.test( s.url ) ? "&" : "?" ) + "_=" + ts : "" );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			ifModifiedKey = ifModifiedKey || s.url;
			if ( jQuery.lastModified[ ifModifiedKey ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ ifModifiedKey ] );
			}
			if ( jQuery.etag[ ifModifiedKey ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ ifModifiedKey ] );
			}
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
				s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
				// Abort if not done already and return
				return jqXHR.abort();

		}

		// aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;
			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}
			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = setTimeout( function(){
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch (e) {
				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		return jqXHR;
	},

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {}

});

/* Handles responses to an ajax request:
 * - sets all responseXXX fields accordingly
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var ct, type, finalDataType, firstDataType,
		contents = s.contents,
		dataTypes = s.dataTypes,
		responseFields = s.responseFields;

	// Fill responseXXX fields
	for ( type in responseFields ) {
		if ( type in responses ) {
			jqXHR[ responseFields[type] ] = responses[ type ];
		}
	}

	// Remove auto dataType and get content-type in the process
	while( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "content-type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}
		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

// Chain conversions given the request and the original response
function ajaxConvert( s, response ) {

	var conv, conv2, current, tmp,
		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice(),
		prev = dataTypes[ 0 ],
		converters = {},
		i = 0;

	// Apply the dataFilter if provided
	if ( s.dataFilter ) {
		response = s.dataFilter( response, s.dataType );
	}

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	// Convert to each sequential dataType, tolerating list modification
	for ( ; (current = dataTypes[++i]); ) {

		// There's only work to do if current dataType is non-auto
		if ( current !== "*" ) {

			// Convert response if prev dataType is non-auto and differs from current
			if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split(" ");
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {
								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.splice( i--, 0, current );
								}

								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s["throws"] ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
						}
					}
				}
			}

			// Update prev for next iteration
			prev = current;
		}
	}

	return { state: "success", data: response };
}
var oldCallbacks = [],
	rquestion = /\?/,
	rjsonp = /(=)\?(?=&|$)|\?\?/,
	nonce = jQuery.now();

// Default jsonp settings
jQuery.ajaxSetup({
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		data = s.data,
		url = s.url,
		hasCallback = s.jsonp !== false,
		replaceInUrl = hasCallback && rjsonp.test( url ),
		replaceInData = hasCallback && !replaceInUrl && typeof data === "string" &&
			!( s.contentType || "" ).indexOf("application/x-www-form-urlencoded") &&
			rjsonp.test( data );

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( s.dataTypes[ 0 ] === "jsonp" || replaceInUrl || replaceInData ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;
		overwritten = window[ callbackName ];

		// Insert callback into url or form data
		if ( replaceInUrl ) {
			s.url = url.replace( rjsonp, "$1" + callbackName );
		} else if ( replaceInData ) {
			s.data = data.replace( rjsonp, "$1" + callbackName );
		} else if ( hasCallback ) {
			s.url += ( rquestion.test( url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters["script json"] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always(function() {
			// Restore preexisting value
			window[ callbackName ] = overwritten;

			// Save back as free
			if ( s[ callbackName ] ) {
				// make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		});

		// Delegate to script
		return "script";
	}
});
// Install script dataType
jQuery.ajaxSetup({
	accepts: {
		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /javascript|ecmascript/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
});

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
		s.global = false;
	}
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function(s) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {

		var script,
			head = document.head || document.getElementsByTagName( "head" )[0] || document.documentElement;

		return {

			send: function( _, callback ) {

				script = document.createElement( "script" );

				script.async = "async";

				if ( s.scriptCharset ) {
					script.charset = s.scriptCharset;
				}

				script.src = s.url;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function( _, isAbort ) {

					if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;

						// Remove the script
						if ( head && script.parentNode ) {
							head.removeChild( script );
						}

						// Dereference the script
						script = undefined;

						// Callback if not abort
						if ( !isAbort ) {
							callback( 200, "success" );
						}
					}
				};
				// Use insertBefore instead of appendChild  to circumvent an IE6 bug.
				// This arises when a base node is used (#2709 and #4378).
				head.insertBefore( script, head.firstChild );
			},

			abort: function() {
				if ( script ) {
					script.onload( 0, 1 );
				}
			}
		};
	}
});
var xhrCallbacks,
	// #5280: Internet Explorer will keep connections alive if we don't abort on unload
	xhrOnUnloadAbort = window.ActiveXObject ? function() {
		// Abort all pending requests
		for ( var key in xhrCallbacks ) {
			xhrCallbacks[ key ]( 0, 1 );
		}
	} : false,
	xhrId = 0;

// Functions to create xhrs
function createStandardXHR() {
	try {
		return new window.XMLHttpRequest();
	} catch( e ) {}
}

function createActiveXHR() {
	try {
		return new window.ActiveXObject( "Microsoft.XMLHTTP" );
	} catch( e ) {}
}

// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject ?
	/* Microsoft failed to properly
	 * implement the XMLHttpRequest in IE7 (can't request local files),
	 * so we use the ActiveXObject when it is available
	 * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
	 * we need a fallback.
	 */
	function() {
		return !this.isLocal && createStandardXHR() || createActiveXHR();
	} :
	// For all other browsers, use the standard XMLHttpRequest object
	createStandardXHR;

// Determine support properties
(function( xhr ) {
	jQuery.extend( jQuery.support, {
		ajax: !!xhr,
		cors: !!xhr && ( "withCredentials" in xhr )
	});
})( jQuery.ajaxSettings.xhr() );

// Create transport if the browser can provide an xhr
if ( jQuery.support.ajax ) {

	jQuery.ajaxTransport(function( s ) {
		// Cross domain only allowed if supported through XMLHttpRequest
		if ( !s.crossDomain || jQuery.support.cors ) {

			var callback;

			return {
				send: function( headers, complete ) {

					// Get a new xhr
					var handle, i,
						xhr = s.xhr();

					// Open the socket
					// Passing null username, generates a login popup on Opera (#2865)
					if ( s.username ) {
						xhr.open( s.type, s.url, s.async, s.username, s.password );
					} else {
						xhr.open( s.type, s.url, s.async );
					}

					// Apply custom fields if provided
					if ( s.xhrFields ) {
						for ( i in s.xhrFields ) {
							xhr[ i ] = s.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( s.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( s.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !s.crossDomain && !headers["X-Requested-With"] ) {
						headers[ "X-Requested-With" ] = "XMLHttpRequest";
					}

					// Need an extra try/catch for cross domain requests in Firefox 3
					try {
						for ( i in headers ) {
							xhr.setRequestHeader( i, headers[ i ] );
						}
					} catch( _ ) {}

					// Do send the request
					// This may raise an exception which is actually
					// handled in jQuery.ajax (so no try/catch here)
					xhr.send( ( s.hasContent && s.data ) || null );

					// Listener
					callback = function( _, isAbort ) {

						var status,
							statusText,
							responseHeaders,
							responses,
							xml;

						// Firefox throws exceptions when accessing properties
						// of an xhr when a network error occurred
						// http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
						try {

							// Was never called and is aborted or complete
							if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

								// Only called once
								callback = undefined;

								// Do not keep as active anymore
								if ( handle ) {
									xhr.onreadystatechange = jQuery.noop;
									if ( xhrOnUnloadAbort ) {
										delete xhrCallbacks[ handle ];
									}
								}

								// If it's an abort
								if ( isAbort ) {
									// Abort it manually if needed
									if ( xhr.readyState !== 4 ) {
										xhr.abort();
									}
								} else {
									status = xhr.status;
									responseHeaders = xhr.getAllResponseHeaders();
									responses = {};
									xml = xhr.responseXML;

									// Construct response list
									if ( xml && xml.documentElement /* #4958 */ ) {
										responses.xml = xml;
									}

									// When requesting binary data, IE6-9 will throw an exception
									// on any attempt to access responseText (#11426)
									try {
										responses.text = xhr.responseText;
									} catch( _ ) {
									}

									// Firefox throws an exception when accessing
									// statusText for faulty cross-domain requests
									try {
										statusText = xhr.statusText;
									} catch( e ) {
										// We normalize with Webkit giving an empty statusText
										statusText = "";
									}

									// Filter status for non standard behaviors

									// If the request is local and we have data: assume a success
									// (success with no data won't get notified, that's the best we
									// can do given current implementations)
									if ( !status && s.isLocal && !s.crossDomain ) {
										status = responses.text ? 200 : 404;
									// IE - #1450: sometimes returns 1223 when it should be 204
									} else if ( status === 1223 ) {
										status = 204;
									}
								}
							}
						} catch( firefoxAccessException ) {
							if ( !isAbort ) {
								complete( -1, firefoxAccessException );
							}
						}

						// Call complete if needed
						if ( responses ) {
							complete( status, statusText, responses, responseHeaders );
						}
					};

					if ( !s.async ) {
						// if we're in sync mode we fire the callback
						callback();
					} else if ( xhr.readyState === 4 ) {
						// (IE6 & IE7) if it's in cache and has been
						// retrieved directly we need to fire the callback
						setTimeout( callback, 0 );
					} else {
						handle = ++xhrId;
						if ( xhrOnUnloadAbort ) {
							// Create the active xhrs callbacks list if needed
							// and attach the unload handler
							if ( !xhrCallbacks ) {
								xhrCallbacks = {};
								jQuery( window ).unload( xhrOnUnloadAbort );
							}
							// Add to list of active xhrs callbacks
							xhrCallbacks[ handle ] = callback;
						}
						xhr.onreadystatechange = callback;
					}
				},

				abort: function() {
					if ( callback ) {
						callback(0,1);
					}
				}
			};
		}
	});
}
var fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rfxnum = new RegExp( "^(?:([-+])=|)(" + core_pnum + ")([a-z%]*)$", "i" ),
	rrun = /queueHooks$/,
	animationPrefilters = [ defaultPrefilter ],
	tweeners = {
		"*": [function( prop, value ) {
			var end, unit, prevScale,
				tween = this.createTween( prop, value ),
				parts = rfxnum.exec( value ),
				target = tween.cur(),
				start = +target || 0,
				scale = 1;

			if ( parts ) {
				end = +parts[2];
				unit = parts[3] || ( jQuery.cssNumber[ prop ] ? "" : "px" );

				// We need to compute starting value
				if ( unit !== "px" && start ) {
					// Iteratively approximate from a nonzero starting point
					// Prefer the current property, because this process will be trivial if it uses the same units
					// Fallback to end or a simple constant
					start = jQuery.css( tween.elem, prop, true ) || end || 1;

					do {
						// If previous iteration zeroed out, double until we get *something*
						// Use a string for doubling factor so we don't accidentally see scale as unchanged below
						prevScale = scale = scale || ".5";

						// Adjust and apply
						start = start / scale;
						jQuery.style( tween.elem, prop, start + unit );

						// Update scale, tolerating zeroes from tween.cur()
						scale = tween.cur() / target;

					// Stop looping if we've hit the mark or scale is unchanged
					} while ( scale !== 1 && scale !== prevScale );
				}

				tween.unit = unit;
				tween.start = start;
				// If a +=/-= token was provided, we're doing a relative animation
				tween.end = parts[1] ? start + ( parts[1] + 1 ) * end : end;
			}
			return tween;
		}]
	};

// Animations created synchronously will run synchronously
function createFxNow() {
	setTimeout(function() {
		fxNow = undefined;
	}, 0 );
	return ( fxNow = jQuery.now() );
}

function createTweens( animation, props ) {
	jQuery.each( props, function( prop, value ) {
		var collection = ( tweeners[ prop ] || [] ).concat( tweeners[ "*" ] ),
			index = 0,
			length = collection.length;
		for ( ; index < length; index++ ) {
			if ( collection[ index ].call( animation, prop, value ) ) {

				// we're done with this property
				return;
			}
		}
	});
}

function Animation( elem, properties, options ) {
	var result,
		index = 0,
		tweenerIndex = 0,
		length = animationPrefilters.length,
		deferred = jQuery.Deferred().always( function() {
			// don't match elem in the :animated selector
			delete tick.elem;
		}),
		tick = function() {
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
				percent = 1 - ( remaining / animation.duration || 0 ),
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length ; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ]);

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise({
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, { specialEasing: {} }, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end, easing ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,
					// if we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;

				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// resolve when we played the last frame
				// otherwise, reject
				if ( gotoEnd ) {
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		}),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length ; index++ ) {
		result = animationPrefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			return result;
		}
	}

	createTweens( animation, props );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			anim: animation,
			queue: animation.opts.queue,
			elem: elem
		})
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// not quite $.extend, this wont overwrite keys already present.
			// also - reusing 'index' from above because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

jQuery.Animation = jQuery.extend( Animation, {

	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.split(" ");
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length ; index++ ) {
			prop = props[ index ];
			tweeners[ prop ] = tweeners[ prop ] || [];
			tweeners[ prop ].unshift( callback );
		}
	},

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			animationPrefilters.unshift( callback );
		} else {
			animationPrefilters.push( callback );
		}
	}
});

function defaultPrefilter( elem, props, opts ) {
	var index, prop, value, length, dataShow, tween, hooks, oldfire,
		anim = this,
		style = elem.style,
		orig = {},
		handled = [],
		hidden = elem.nodeType && isHidden( elem );

	// handle queue: false promises
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always(function() {
			// doing this makes sure that the complete handler will be called
			// before this completes
			anim.always(function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			});
		});
	}

	// height/width overflow pass
	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {
		// Make sure that nothing sneaks out
		// Record all 3 overflow attributes because IE does not
		// change the overflow attribute when overflowX and
		// overflowY are set to the same value
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Set display property to inline-block for height/width
		// animations on inline elements that are having width/height animated
		if ( jQuery.css( elem, "display" ) === "inline" &&
				jQuery.css( elem, "float" ) === "none" ) {

			// inline-level elements accept inline-block;
			// block-level elements need to be inline with layout
			if ( !jQuery.support.inlineBlockNeedsLayout || css_defaultDisplay( elem.nodeName ) === "inline" ) {
				style.display = "inline-block";

			} else {
				style.zoom = 1;
			}
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		if ( !jQuery.support.shrinkWrapBlocks ) {
			anim.done(function() {
				style.overflow = opts.overflow[ 0 ];
				style.overflowX = opts.overflow[ 1 ];
				style.overflowY = opts.overflow[ 2 ];
			});
		}
	}


	// show/hide pass
	for ( index in props ) {
		value = props[ index ];
		if ( rfxtypes.exec( value ) ) {
			delete props[ index ];
			if ( value === ( hidden ? "hide" : "show" ) ) {
				continue;
			}
			handled.push( index );
		}
	}

	length = handled.length;
	if ( length ) {
		dataShow = jQuery._data( elem, "fxshow" ) || jQuery._data( elem, "fxshow", {} );
		if ( hidden ) {
			jQuery( elem ).show();
		} else {
			anim.done(function() {
				jQuery( elem ).hide();
			});
		}
		anim.done(function() {
			var prop;
			jQuery.removeData( elem, "fxshow", true );
			for ( prop in orig ) {
				jQuery.style( elem, prop, orig[ prop ] );
			}
		});
		for ( index = 0 ; index < length ; index++ ) {
			prop = handled[ index ];
			tween = anim.createTween( prop, hidden ? dataShow[ prop ] : 0 );
			orig[ prop ] = dataShow[ prop ] || jQuery.style( elem, prop );

			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = tween.start;
				if ( hidden ) {
					tween.end = tween.start;
					tween.start = prop === "width" || prop === "height" ? 1 : 0;
				}
			}
		}
	}
}

function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || "swing";
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			if ( tween.elem[ tween.prop ] != null &&
				(!tween.elem.style || tween.elem.style[ tween.prop ] == null) ) {
				return tween.elem[ tween.prop ];
			}

			// passing any value as a 4th parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails
			// so, simple values such as "10px" are parsed to Float.
			// complex values such as "rotate(1rad)" are returned as is.
			result = jQuery.css( tween.elem, tween.prop, false, "" );
			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {
			// use step hook for back compat - use cssHook if its there - use .style if its
			// available and use plain properties where available
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.style && ( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null || jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Remove in 2.0 - this supports IE8's panic based approach
// to setting things on disconnected nodes

Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.each([ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ||
			// special check for .toggle( handler, handler, ... )
			( !i && jQuery.isFunction( speed ) && jQuery.isFunction( easing ) ) ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
});

jQuery.fn.extend({
	fadeTo: function( speed, to, easing, callback ) {

		// show any hidden elements after setting opacity to 0
		return this.filter( isHidden ).css( "opacity", 0 ).show()

			// animate to the value specified
			.end().animate({ opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {
				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations resolve immediately
				if ( empty ) {
					anim.stop( true );
				}
			};

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each(function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = jQuery._data( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// start the next in the queue if the last step wasn't forced
			// timers currently will call their complete callbacks, which will dequeue
			// but only if they were gotoEnd
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		});
	}
});

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		attrs = { height: type },
		i = 0;

	// if we include width, step value is 1 to do all cssExpand values,
	// if we don't include width, step value is 2 to skip over Left and Right
	includeWidth = includeWidth? 1 : 0;
	for( ; i < 4 ; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

// Generate shortcuts for custom animations
jQuery.each({
	slideDown: genFx("show"),
	slideUp: genFx("hide"),
	slideToggle: genFx("toggle"),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
});

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
		opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

	// normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p*Math.PI ) / 2;
	}
};

jQuery.timers = [];
jQuery.fx = Tween.prototype.init;
jQuery.fx.tick = function() {
	var timer,
		timers = jQuery.timers,
		i = 0;

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];
		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
};

jQuery.fx.timer = function( timer ) {
	if ( timer() && jQuery.timers.push( timer ) && !timerId ) {
		timerId = setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.interval = 13;

jQuery.fx.stop = function() {
	clearInterval( timerId );
	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,
	// Default speed
	_default: 400
};

// Back Compat <1.8 extension point
jQuery.fx.step = {};

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.animated = function( elem ) {
		return jQuery.grep(jQuery.timers, function( fn ) {
			return elem === fn.elem;
		}).length;
	};
}
var rroot = /^(?:body|html)$/i;

jQuery.fn.offset = function( options ) {
	if ( arguments.length ) {
		return options === undefined ?
			this :
			this.each(function( i ) {
				jQuery.offset.setOffset( this, options, i );
			});
	}

	var box, docElem, body, win, clientTop, clientLeft, scrollTop, scrollLeft, top, left,
		elem = this[ 0 ],
		doc = elem && elem.ownerDocument;

	if ( !doc ) {
		return;
	}

	if ( (body = doc.body) === elem ) {
		return jQuery.offset.bodyOffset( elem );
	}

	docElem = doc.documentElement;

	// Make sure we're not dealing with a disconnected DOM node
	if ( !jQuery.contains( docElem, elem ) ) {
		return { top: 0, left: 0 };
	}

	box = elem.getBoundingClientRect();
	win = getWindow( doc );
	clientTop  = docElem.clientTop  || body.clientTop  || 0;
	clientLeft = docElem.clientLeft || body.clientLeft || 0;
	scrollTop  = win.pageYOffset || docElem.scrollTop;
	scrollLeft = win.pageXOffset || docElem.scrollLeft;
	top  = box.top  + scrollTop  - clientTop;
	left = box.left + scrollLeft - clientLeft;

	return { top: top, left: left };
};

jQuery.offset = {

	bodyOffset: function( body ) {
		var top = body.offsetTop,
			left = body.offsetLeft;

		if ( jQuery.support.doesNotIncludeMarginInBodyOffset ) {
			top  += parseFloat( jQuery.css(body, "marginTop") ) || 0;
			left += parseFloat( jQuery.css(body, "marginLeft") ) || 0;
		}

		return { top: top, left: left };
	},

	setOffset: function( elem, options, i ) {
		var position = jQuery.css( elem, "position" );

		// set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		var curElem = jQuery( elem ),
			curOffset = curElem.offset(),
			curCSSTop = jQuery.css( elem, "top" ),
			curCSSLeft = jQuery.css( elem, "left" ),
			calculatePosition = ( position === "absolute" || position === "fixed" ) && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1,
			props = {}, curPosition = {}, curTop, curLeft;

		// need to be able to calculate position if either top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;
		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );
		} else {
			curElem.css( props );
		}
	}
};


jQuery.fn.extend({

	position: function() {
		if ( !this[0] ) {
			return;
		}

		var elem = this[0],

		// Get *real* offsetParent
		offsetParent = this.offsetParent(),

		// Get correct offsets
		offset       = this.offset(),
		parentOffset = rroot.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();

		// Subtract element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		offset.top  -= parseFloat( jQuery.css(elem, "marginTop") ) || 0;
		offset.left -= parseFloat( jQuery.css(elem, "marginLeft") ) || 0;

		// Add offsetParent borders
		parentOffset.top  += parseFloat( jQuery.css(offsetParent[0], "borderTopWidth") ) || 0;
		parentOffset.left += parseFloat( jQuery.css(offsetParent[0], "borderLeftWidth") ) || 0;

		// Subtract the two offsets
		return {
			top:  offset.top  - parentOffset.top,
			left: offset.left - parentOffset.left
		};
	},

	offsetParent: function() {
		return this.map(function() {
			var offsetParent = this.offsetParent || document.body;
			while ( offsetParent && (!rroot.test(offsetParent.nodeName) && jQuery.css(offsetParent, "position") === "static") ) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent || document.body;
		});
	}
});


// Create scrollLeft and scrollTop methods
jQuery.each( {scrollLeft: "pageXOffset", scrollTop: "pageYOffset"}, function( method, prop ) {
	var top = /Y/.test( prop );

	jQuery.fn[ method ] = function( val ) {
		return jQuery.access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? (prop in win) ? win[ prop ] :
					win.document.documentElement[ method ] :
					elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : jQuery( win ).scrollLeft(),
					 top ? val : jQuery( win ).scrollTop()
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length, null );
	};
});

function getWindow( elem ) {
	return jQuery.isWindow( elem ) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
}
// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name }, function( defaultExtra, funcName ) {
		// margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return jQuery.access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {
					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/jquery/jquery/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height], whichever is greatest
					// unfortunately, this causes bug #3838 in IE6/8 only, but there is currently no good, small way to fix it.
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?
					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, value, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	});
});
// Expose jQuery to the global object
window.jQuery = window.$ = jQuery;

// Expose jQuery as an AMD module, but only for AMD loaders that
// understand the issues with loading multiple versions of jQuery
// in a page that all might call define(). The loader will indicate
// they have special allowances for multiple jQuery versions by
// specifying define.amd.jQuery = true. Register as a named module,
// since jQuery can be concatenated with other files that may use define,
// but not use a proper concatenation script that understands anonymous
// AMD modules. A named AMD is safest and most robust way to register.
// Lowercase jquery is used because AMD module names are derived from
// file names, and jQuery is normally delivered in a lowercase file name.
// Do this after creating the global so that if an AMD module wants to call
// noConflict to hide this version of jQuery, it will work.
if ( typeof define === "function" && define.amd && define.amd.jQuery ) {
	define( "jquery", [], function () { return jQuery; } );
}

})( window );

},{}],4:[function(require,module,exports){
/*
 * Raphael 1.4.7 - JavaScript Vector Library
 *
 * Copyright (c) 2010 Dmitry Baranovskiy (http://raphaeljs.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */
Raphael=function(){function l(){if(l.is(arguments[0],U)){for(var a=arguments[0],b=Ca[K](l,a.splice(0,3+l.is(a[0],P))),c=b.set(),d=0,f=a[o];d<f;d++){var e=a[d]||{};sb.test(e.type)&&c[F](b[e.type]().attr(e))}return c}return Ca[K](l,arguments)}l.version="1.4.7";var V=/[, ]+/,sb=/^(circle|rect|path|ellipse|text|image)$/,p="prototype",z="hasOwnProperty",C=document,aa=window,Qa={was:Object[p][z].call(aa,"Raphael"),is:aa.Raphael};function H(){}var x="appendChild",K="apply",M="concat",Da="createTouch"in C,
A="",N=" ",D=String,G="split",Ra="click dblclick mousedown mousemove mouseout mouseover mouseup touchstart touchmove touchend orientationchange touchcancel gesturestart gesturechange gestureend"[G](N),Ea={mousedown:"touchstart",mousemove:"touchmove",mouseup:"touchend"},R="join",o="length",fa=String[p].toLowerCase,v=Math,Y=v.max,ba=v.min,P="number",ga="string",U="array",O="toString",ca="fill",tb=Object[p][O],E=v.pow,F="push",ja=/^(?=[\da-f]$)/,Sa=/^url\(['"]?([^\)]+?)['"]?\)$/i,ub=/^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgba?\(\s*([\d\.]+\s*,\s*[\d\.]+\s*,\s*[\d\.]+(?:\s*,\s*[\d\.]+)?)\s*\)|rgba?\(\s*([\d\.]+%\s*,\s*[\d\.]+%\s*,\s*[\d\.]+%(?:\s*,\s*[\d\.]+%)?)\s*\)|hsb\(\s*([\d\.]+(?:deg|\xb0)?\s*,\s*[\d\.]+\s*,\s*[\d\.]+)\s*\)|hsb\(\s*([\d\.]+(?:deg|\xb0|%)\s*,\s*[\d\.]+%\s*,\s*[\d\.]+%)\s*\)|hsl\(\s*([\d\.]+(?:deg|\xb0)?\s*,\s*[\d\.]+\s*,\s*[\d\.]+)\s*\)|hsl\(\s*([\d\.]+(?:deg|\xb0|%)\s*,\s*[\d\.]+%\s*,\s*[\d\.]+%)\s*\))\s*$/i,
Q=v.round,W="setAttribute",y=parseFloat,ha=parseInt,Fa=" progid:DXImageTransform.Microsoft",sa=String[p].toUpperCase,ta={blur:0,"clip-rect":"0 0 1e9 1e9",cursor:"default",cx:0,cy:0,fill:"#fff","fill-opacity":1,font:'10px "Arial"',"font-family":'"Arial"',"font-size":"10","font-style":"normal","font-weight":400,gradient:0,height:0,href:"http://raphaeljs.com/",opacity:1,path:"M0,0",r:0,rotation:0,rx:0,ry:0,scale:"1 1",src:"",stroke:"#000","stroke-dasharray":"","stroke-linecap":"butt","stroke-linejoin":"butt",
"stroke-miterlimit":0,"stroke-opacity":1,"stroke-width":1,target:"_blank","text-anchor":"middle",title:"Raphael",translation:"0 0",width:0,x:0,y:0},Ga={along:"along",blur:P,"clip-rect":"csv",cx:P,cy:P,fill:"colour","fill-opacity":P,"font-size":P,height:P,opacity:P,path:"path",r:P,rotation:"csv",rx:P,ry:P,scale:"csv",stroke:"colour","stroke-opacity":P,"stroke-width":P,translation:"csv",width:P,x:P,y:P},I="replace";l.type=aa.SVGAngle||C.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure",
"1.1")?"SVG":"VML";if(l.type=="VML"){var da=C.createElement("div");da.innerHTML='<v:shape adj="1"/>';da=da.firstChild;da.style.behavior="url(#default#VML)";if(!(da&&typeof da.adj=="object"))return l.type=null;da=null}l.svg=!(l.vml=l.type=="VML");H[p]=l[p];l._id=0;l._oid=0;l.fn={};l.is=function(a,b){b=fa.call(b);return b=="object"&&a===Object(a)||b=="undefined"&&typeof a==b||b=="null"&&a==null||b=="array"&&Array.isArray&&Array.isArray(a)||fa.call(tb.call(a).slice(8,-1))==b};l.setWindow=function(a){aa=
a;C=aa.document};function ua(a){if(l.vml){var b=/^\s+|\s+$/g;ua=Z(function(d){var f;d=D(d)[I](b,A);try{var e=new aa.ActiveXObject("htmlfile");e.write("<body>");e.close();f=e.body}catch(g){f=aa.createPopup().document.body}e=f.createTextRange();try{f.style.color=d;var h=e.queryCommandValue("ForeColor");h=(h&255)<<16|h&65280|(h&16711680)>>>16;return"#"+("000000"+h[O](16)).slice(-6)}catch(i){return"none"}})}else{var c=C.createElement("i");c.title="Rapha\u00ebl Colour Picker";c.style.display="none";C.body[x](c);
ua=Z(function(d){c.style.color=d;return C.defaultView.getComputedStyle(c,A).getPropertyValue("color")})}return ua(a)}function Ta(){return"hsb("+[this.h,this.s,this.b]+")"}function vb(){return"hsl("+[this.h,this.s,this.l]+")"}function wb(){return this.hex}l.hsb2rgb=function(a,b,c){if(l.is(a,"object")&&"h"in a&&"s"in a&&"b"in a){c=a.b;b=a.s;a=a.h}return l.hsl2rgb(a,b,c/2)};l.hsl2rgb=function(a,b,c){if(l.is(a,"object")&&"h"in a&&"s"in a&&"l"in a){c=a.l;b=a.s;a=a.h}var d={},f=["r","g","b"],e;if(b){b=
c<0.5?c*(1+b):c+b-c*b;c=2*c-b;for(var g=0,h=f.length;g<h;g++){e=a+1/3*-(g-1);e<0&&e++;e>1&&e--;d[f[g]]=e*6<1?c+(b-c)*6*e:e*2<1?b:e*3<2?c+(b-c)*(2/3-e)*6:c}}else d={r:c,g:c,b:c};d.r*=255;d.g*=255;d.b*=255;a=(~~d.r)[O](16);f=(~~d.g)[O](16);b=(~~d.b)[O](16);a=a[I](ja,"0");f=f[I](ja,"0");b=b[I](ja,"0");d.hex="#"+a+f+b;d.toString=wb;return d};l.rgb2hsb=function(a,b,c){if(b==null&&l.is(a,"object")&&"r"in a&&"g"in a&&"b"in a){c=a.b;b=a.g;a=a.r}if(b==null&&l.is(a,ga)){var d=l.getRGB(a);a=d.r;b=d.g;c=d.b}if(a>
1||b>1||c>1){a/=255;b/=255;c/=255}var f=Y(a,b,c),e=ba(a,b,c);d=f;if(e==f)return{h:0,s:0,b:f,toString:Ta};else{var g=f-e;e=g/f;a=a==f?(b-c)/g:b==f?2+(c-a)/g:4+(a-b)/g;a/=6;a<0&&a++;a>1&&a--}return{h:a,s:e,b:d,toString:Ta}};l.rgb2hsl=function(a,b,c){if(b==null&&l.is(a,"object")&&"r"in a&&"g"in a&&"b"in a){c=a.b;b=a.g;a=a.r}if(b==null&&l.is(a,ga)){var d=l.getRGB(a);a=d.r;b=d.g;c=d.b}if(a>1||b>1||c>1){a/=255;b/=255;c/=255}var f=Y(a,b,c),e=ba(a,b,c);d=(f+e)/2;if(e==f)a={h:0,s:0,l:d};else{var g=f-e;e=d<
0.5?g/(f+e):g/(2-f-e);a=a==f?(b-c)/g:b==f?2+(c-a)/g:4+(a-b)/g;a/=6;a<0&&a++;a>1&&a--;a={h:a,s:e,l:d}}a.toString=vb;return a};var xb=/,?([achlmqrstvxz]),?/gi,ka=/\s*,\s*/,yb={hs:1,rg:1};l._path2string=function(){return this.join(",")[I](xb,"$1")};function Z(a,b,c){function d(){var f=Array[p].slice.call(arguments,0),e=f[R]("\u25ba"),g=d.cache=d.cache||{},h=d.count=d.count||[];if(g[z](e))return c?c(g[e]):g[e];h[o]>=1000&&delete g[h.shift()];h[F](e);g[e]=a[K](b,f);return c?c(g[e]):g[e]}return d}l.getRGB=
Z(function(a){if(!a||(a=D(a)).indexOf("-")+1)return{r:-1,g:-1,b:-1,hex:"none",error:1};if(a=="none")return{r:-1,g:-1,b:-1,hex:"none"};!(yb[z](a.substring(0,2))||a.charAt()=="#")&&(a=ua(a));var b,c,d,f,e;if(a=a.match(ub)){if(a[2]){d=ha(a[2].substring(5),16);c=ha(a[2].substring(3,5),16);b=ha(a[2].substring(1,3),16)}if(a[3]){d=ha((e=a[3].charAt(3))+e,16);c=ha((e=a[3].charAt(2))+e,16);b=ha((e=a[3].charAt(1))+e,16)}if(a[4]){a=a[4][G](ka);b=y(a[0]);c=y(a[1]);d=y(a[2]);f=y(a[3])}if(a[5]){a=a[5][G](ka);b=
y(a[0])*2.55;c=y(a[1])*2.55;d=y(a[2])*2.55;f=y(a[3])}if(a[6]){a=a[6][G](ka);b=y(a[0]);c=y(a[1]);d=y(a[2]);(a[0].slice(-3)=="deg"||a[0].slice(-1)=="\u00b0")&&(b/=360);return l.hsb2rgb(b,c,d)}if(a[7]){a=a[7][G](ka);b=y(a[0])*2.55;c=y(a[1])*2.55;d=y(a[2])*2.55;(a[0].slice(-3)=="deg"||a[0].slice(-1)=="\u00b0")&&(b/=360*2.55);return l.hsb2rgb(b,c,d)}if(a[8]){a=a[8][G](ka);b=y(a[0]);c=y(a[1]);d=y(a[2]);(a[0].slice(-3)=="deg"||a[0].slice(-1)=="\u00b0")&&(b/=360);return l.hsl2rgb(b,c,d)}if(a[9]){a=a[9][G](ka);
b=y(a[0])*2.55;c=y(a[1])*2.55;d=y(a[2])*2.55;(a[0].slice(-3)=="deg"||a[0].slice(-1)=="\u00b0")&&(b/=360*2.55);return l.hsl2rgb(b,c,d)}a={r:b,g:c,b:d};b=(~~b)[O](16);c=(~~c)[O](16);d=(~~d)[O](16);b=b[I](ja,"0");c=c[I](ja,"0");d=d[I](ja,"0");a.hex="#"+b+c+d;isFinite(y(f))&&(a.o=f);return a}return{r:-1,g:-1,b:-1,hex:"none",error:1}},l);l.getColor=function(a){a=this.getColor.start=this.getColor.start||{h:0,s:1,b:a||0.75};var b=this.hsb2rgb(a.h,a.s,a.b);a.h+=0.075;if(a.h>1){a.h=0;a.s-=0.2;a.s<=0&&(this.getColor.start=
{h:0,s:1,b:a.b})}return b.hex};l.getColor.reset=function(){delete this.start};var zb=/([achlmqstvz])[\s,]*((-?\d*\.?\d*(?:e[-+]?\d+)?\s*,?\s*)+)/ig,Ab=/(-?\d*\.?\d*(?:e[-+]?\d+)?)\s*,?\s*/ig;l.parsePathString=Z(function(a){if(!a)return null;var b={a:7,c:6,h:1,l:2,m:2,q:4,s:4,t:2,v:1,z:0},c=[];if(l.is(a,U)&&l.is(a[0],U))c=va(a);c[o]||D(a)[I](zb,function(d,f,e){var g=[];d=fa.call(f);e[I](Ab,function(h,i){i&&g[F](+i)});if(d=="m"&&g[o]>2){c[F]([f][M](g.splice(0,2)));d="l";f=f=="m"?"l":"L"}for(;g[o]>=
b[d];){c[F]([f][M](g.splice(0,b[d])));if(!b[d])break}});c[O]=l._path2string;return c});l.findDotsAtSegment=function(a,b,c,d,f,e,g,h,i){var j=1-i,m=E(j,3)*a+E(j,2)*3*i*c+j*3*i*i*f+E(i,3)*g;j=E(j,3)*b+E(j,2)*3*i*d+j*3*i*i*e+E(i,3)*h;var n=a+2*i*(c-a)+i*i*(f-2*c+a),r=b+2*i*(d-b)+i*i*(e-2*d+b),q=c+2*i*(f-c)+i*i*(g-2*f+c),k=d+2*i*(e-d)+i*i*(h-2*e+d);a=(1-i)*a+i*c;b=(1-i)*b+i*d;f=(1-i)*f+i*g;e=(1-i)*e+i*h;h=90-v.atan((n-q)/(r-k))*180/v.PI;(n>q||r<k)&&(h+=180);return{x:m,y:j,m:{x:n,y:r},n:{x:q,y:k},start:{x:a,
y:b},end:{x:f,y:e},alpha:h}};var xa=Z(function(a){if(!a)return{x:0,y:0,width:0,height:0};a=wa(a);for(var b=0,c=0,d=[],f=[],e,g=0,h=a[o];g<h;g++){e=a[g];if(e[0]=="M"){b=e[1];c=e[2];d[F](b);f[F](c)}else{b=Bb(b,c,e[1],e[2],e[3],e[4],e[5],e[6]);d=d[M](b.min.x,b.max.x);f=f[M](b.min.y,b.max.y);b=e[5];c=e[6]}}a=ba[K](0,d);e=ba[K](0,f);return{x:a,y:e,width:Y[K](0,d)-a,height:Y[K](0,f)-e}});function va(a){var b=[];if(!l.is(a,U)||!l.is(a&&a[0],U))a=l.parsePathString(a);for(var c=0,d=a[o];c<d;c++){b[c]=[];for(var f=
0,e=a[c][o];f<e;f++)b[c][f]=a[c][f]}b[O]=l._path2string;return b}var Ha=Z(function(a){if(!l.is(a,U)||!l.is(a&&a[0],U))a=l.parsePathString(a);var b=[],c=0,d=0,f=0,e=0,g=0;if(a[0][0]=="M"){c=a[0][1];d=a[0][2];f=c;e=d;g++;b[F](["M",c,d])}g=g;for(var h=a[o];g<h;g++){var i=b[g]=[],j=a[g];if(j[0]!=fa.call(j[0])){i[0]=fa.call(j[0]);switch(i[0]){case "a":i[1]=j[1];i[2]=j[2];i[3]=j[3];i[4]=j[4];i[5]=j[5];i[6]=+(j[6]-c).toFixed(3);i[7]=+(j[7]-d).toFixed(3);break;case "v":i[1]=+(j[1]-d).toFixed(3);break;case "m":f=
j[1];e=j[2];default:for(var m=1,n=j[o];m<n;m++)i[m]=+(j[m]-(m%2?c:d)).toFixed(3)}}else{b[g]=[];if(j[0]=="m"){f=j[1]+c;e=j[2]+d}i=0;for(m=j[o];i<m;i++)b[g][i]=j[i]}j=b[g][o];switch(b[g][0]){case "z":c=f;d=e;break;case "h":c+=+b[g][j-1];break;case "v":d+=+b[g][j-1];break;default:c+=+b[g][j-2];d+=+b[g][j-1]}}b[O]=l._path2string;return b},0,va),oa=Z(function(a){if(!l.is(a,U)||!l.is(a&&a[0],U))a=l.parsePathString(a);var b=[],c=0,d=0,f=0,e=0,g=0;if(a[0][0]=="M"){c=+a[0][1];d=+a[0][2];f=c;e=d;g++;b[0]=["M",
c,d]}g=g;for(var h=a[o];g<h;g++){var i=b[g]=[],j=a[g];if(j[0]!=sa.call(j[0])){i[0]=sa.call(j[0]);switch(i[0]){case "A":i[1]=j[1];i[2]=j[2];i[3]=j[3];i[4]=j[4];i[5]=j[5];i[6]=+(j[6]+c);i[7]=+(j[7]+d);break;case "V":i[1]=+j[1]+d;break;case "H":i[1]=+j[1]+c;break;case "M":f=+j[1]+c;e=+j[2]+d;default:for(var m=1,n=j[o];m<n;m++)i[m]=+j[m]+(m%2?c:d)}}else{m=0;for(n=j[o];m<n;m++)b[g][m]=j[m]}switch(i[0]){case "Z":c=f;d=e;break;case "H":c=i[1];break;case "V":d=i[1];break;case "M":f=b[g][b[g][o]-2];e=b[g][b[g][o]-
1];default:c=b[g][b[g][o]-2];d=b[g][b[g][o]-1]}}b[O]=l._path2string;return b},null,va);function ya(a,b,c,d){return[a,b,c,d,c,d]}function Ua(a,b,c,d,f,e){var g=1/3,h=2/3;return[g*a+h*c,g*b+h*d,g*f+h*c,g*e+h*d,f,e]}function Va(a,b,c,d,f,e,g,h,i,j){var m=v.PI,n=m*120/180,r=m/180*(+f||0),q=[],k,t=Z(function(J,ia,za){var Cb=J*v.cos(za)-ia*v.sin(za);J=J*v.sin(za)+ia*v.cos(za);return{x:Cb,y:J}});if(j){w=j[0];k=j[1];e=j[2];B=j[3]}else{k=t(a,b,-r);a=k.x;b=k.y;k=t(h,i,-r);h=k.x;i=k.y;v.cos(m/180*f);v.sin(m/
180*f);k=(a-h)/2;w=(b-i)/2;B=k*k/(c*c)+w*w/(d*d);if(B>1){B=v.sqrt(B);c=B*c;d=B*d}B=c*c;var L=d*d;B=(e==g?-1:1)*v.sqrt(v.abs((B*L-B*w*w-L*k*k)/(B*w*w+L*k*k)));e=B*c*w/d+(a+h)/2;var B=B*-d*k/c+(b+i)/2,w=v.asin(((b-B)/d).toFixed(7));k=v.asin(((i-B)/d).toFixed(7));w=a<e?m-w:w;k=h<e?m-k:k;w<0&&(w=m*2+w);k<0&&(k=m*2+k);if(g&&w>k)w-=m*2;if(!g&&k>w)k-=m*2}m=k-w;if(v.abs(m)>n){q=k;m=h;L=i;k=w+n*(g&&k>w?1:-1);h=e+c*v.cos(k);i=B+d*v.sin(k);q=Va(h,i,c,d,f,0,g,m,L,[k,q,e,B])}m=k-w;f=v.cos(w);e=v.sin(w);g=v.cos(k);
k=v.sin(k);m=v.tan(m/4);c=4/3*c*m;m=4/3*d*m;d=[a,b];a=[a+c*e,b-m*f];b=[h+c*k,i-m*g];h=[h,i];a[0]=2*d[0]-a[0];a[1]=2*d[1]-a[1];if(j)return[a,b,h][M](q);else{q=[a,b,h][M](q)[R]()[G](",");j=[];h=0;for(i=q[o];h<i;h++)j[h]=h%2?t(q[h-1],q[h],r).y:t(q[h],q[h+1],r).x;return j}}function la(a,b,c,d,f,e,g,h,i){var j=1-i;return{x:E(j,3)*a+E(j,2)*3*i*c+j*3*i*i*f+E(i,3)*g,y:E(j,3)*b+E(j,2)*3*i*d+j*3*i*i*e+E(i,3)*h}}var Bb=Z(function(a,b,c,d,f,e,g,h){var i=f-2*c+a-(g-2*f+c),j=2*(c-a)-2*(f-c),m=a-c,n=(-j+v.sqrt(j*
j-4*i*m))/2/i;i=(-j-v.sqrt(j*j-4*i*m))/2/i;var r=[b,h],q=[a,g];v.abs(n)>1000000000000&&(n=0.5);v.abs(i)>1000000000000&&(i=0.5);if(n>0&&n<1){n=la(a,b,c,d,f,e,g,h,n);q[F](n.x);r[F](n.y)}if(i>0&&i<1){n=la(a,b,c,d,f,e,g,h,i);q[F](n.x);r[F](n.y)}i=e-2*d+b-(h-2*e+d);j=2*(d-b)-2*(e-d);m=b-d;n=(-j+v.sqrt(j*j-4*i*m))/2/i;i=(-j-v.sqrt(j*j-4*i*m))/2/i;v.abs(n)>1000000000000&&(n=0.5);v.abs(i)>1000000000000&&(i=0.5);if(n>0&&n<1){n=la(a,b,c,d,f,e,g,h,n);q[F](n.x);r[F](n.y)}if(i>0&&i<1){n=la(a,b,c,d,f,e,g,h,i);
q[F](n.x);r[F](n.y)}return{min:{x:ba[K](0,q),y:ba[K](0,r)},max:{x:Y[K](0,q),y:Y[K](0,r)}}}),wa=Z(function(a,b){var c=oa(a),d=b&&oa(b);a={x:0,y:0,bx:0,by:0,X:0,Y:0,qx:null,qy:null};b={x:0,y:0,bx:0,by:0,X:0,Y:0,qx:null,qy:null};function f(q,k){var t;if(!q)return["C",k.x,k.y,k.x,k.y,k.x,k.y];!(q[0]in{T:1,Q:1})&&(k.qx=k.qy=null);switch(q[0]){case "M":k.X=q[1];k.Y=q[2];break;case "A":q=["C"][M](Va[K](0,[k.x,k.y][M](q.slice(1))));break;case "S":t=k.x+(k.x-(k.bx||k.x));k=k.y+(k.y-(k.by||k.y));q=["C",t,k][M](q.slice(1));
break;case "T":k.qx=k.x+(k.x-(k.qx||k.x));k.qy=k.y+(k.y-(k.qy||k.y));q=["C"][M](Ua(k.x,k.y,k.qx,k.qy,q[1],q[2]));break;case "Q":k.qx=q[1];k.qy=q[2];q=["C"][M](Ua(k.x,k.y,q[1],q[2],q[3],q[4]));break;case "L":q=["C"][M](ya(k.x,k.y,q[1],q[2]));break;case "H":q=["C"][M](ya(k.x,k.y,q[1],k.y));break;case "V":q=["C"][M](ya(k.x,k.y,k.x,q[1]));break;case "Z":q=["C"][M](ya(k.x,k.y,k.X,k.Y));break}return q}function e(q,k){if(q[k][o]>7){q[k].shift();for(var t=q[k];t[o];)q.splice(k++,0,["C"][M](t.splice(0,6)));
q.splice(k,1);i=Y(c[o],d&&d[o]||0)}}function g(q,k,t,L,B){if(q&&k&&q[B][0]=="M"&&k[B][0]!="M"){k.splice(B,0,["M",L.x,L.y]);t.bx=0;t.by=0;t.x=q[B][1];t.y=q[B][2];i=Y(c[o],d&&d[o]||0)}}for(var h=0,i=Y(c[o],d&&d[o]||0);h<i;h++){c[h]=f(c[h],a);e(c,h);d&&(d[h]=f(d[h],b));d&&e(d,h);g(c,d,a,b,h);g(d,c,b,a,h);var j=c[h],m=d&&d[h],n=j[o],r=d&&m[o];a.x=j[n-2];a.y=j[n-1];a.bx=y(j[n-4])||a.x;a.by=y(j[n-3])||a.y;b.bx=d&&(y(m[r-4])||b.x);b.by=d&&(y(m[r-3])||b.y);b.x=d&&m[r-2];b.y=d&&m[r-1]}return d?[c,d]:c},null,
va),Wa=Z(function(a){for(var b=[],c=0,d=a[o];c<d;c++){var f={},e=a[c].match(/^([^:]*):?([\d\.]*)/);f.color=l.getRGB(e[1]);if(f.color.error)return null;f.color=f.color.hex;e[2]&&(f.offset=e[2]+"%");b[F](f)}c=1;for(d=b[o]-1;c<d;c++)if(!b[c].offset){a=y(b[c-1].offset||0);e=0;for(f=c+1;f<d;f++)if(b[f].offset){e=b[f].offset;break}if(!e){e=100;f=d}e=y(e);for(e=(e-a)/(f-c+1);c<f;c++){a+=e;b[c].offset=a+"%"}}return b});function Xa(a,b,c,d){if(l.is(a,ga)||l.is(a,"object")){a=l.is(a,ga)?C.getElementById(a):
a;if(a.tagName)return b==null?{container:a,width:a.style.pixelWidth||a.offsetWidth,height:a.style.pixelHeight||a.offsetHeight}:{container:a,width:b,height:c}}else return{container:1,x:a,y:b,width:c,height:d}}function Ia(a,b){var c=this;for(var d in b)if(b[z](d)&&!(d in a))switch(typeof b[d]){case "function":(function(f){a[d]=a===c?f:function(){return f[K](c,arguments)}})(b[d]);break;case "object":a[d]=a[d]||{};Ia.call(this,a[d],b[d]);break;default:a[d]=b[d];break}}function ma(a,b){a==b.top&&(b.top=
a.prev);a==b.bottom&&(b.bottom=a.next);a.next&&(a.next.prev=a.prev);a.prev&&(a.prev.next=a.next)}function Ya(a,b){if(b.top!==a){ma(a,b);a.next=null;a.prev=b.top;b.top.next=a;b.top=a}}function Za(a,b){if(b.bottom!==a){ma(a,b);a.next=b.bottom;a.prev=null;b.bottom.prev=a;b.bottom=a}}function $a(a,b,c){ma(a,c);b==c.top&&(c.top=a);b.next&&(b.next.prev=a);a.next=b.next;a.prev=b;b.next=a}function ab(a,b,c){ma(a,c);b==c.bottom&&(c.bottom=a);b.prev&&(b.prev.next=a);a.prev=b.prev;b.prev=a;a.next=b}function bb(a){return function(){throw new Error("Rapha\u00ebl: you are calling to method \u201c"+
a+"\u201d of removed object");}}var cb=/^r(?:\(([^,]+?)\s*,\s*([^\)]+?)\))?/;l.pathToRelative=Ha;if(l.svg){H[p].svgns="http://www.w3.org/2000/svg";H[p].xlink="http://www.w3.org/1999/xlink";Q=function(a){return+a+(~~a===a)*0.5};var u=function(a,b){if(b)for(var c in b)b[z](c)&&a[W](c,D(b[c]));else{a=C.createElementNS(H[p].svgns,a);a.style.webkitTapHighlightColor="rgba(0,0,0,0)";return a}};l[O]=function(){return"Your browser supports SVG.\nYou are running Rapha\u00ebl "+this.version};var db=function(a,
b){var c=u("path");b.canvas&&b.canvas[x](c);b=new s(c,b);b.type="path";ea(b,{fill:"none",stroke:"#000",path:a});return b},pa=function(a,b,c){var d="linear",f=0.5,e=0.5,g=a.style;b=D(b)[I](cb,function(m,n,r){d="radial";if(n&&r){f=y(n);e=y(r);m=(e>0.5)*2-1;E(f-0.5,2)+E(e-0.5,2)>0.25&&(e=v.sqrt(0.25-E(f-0.5,2))*m+0.5)&&e!=0.5&&(e=e.toFixed(5)-1.0E-5*m)}return A});b=b[G](/\s*\-\s*/);if(d=="linear"){var h=b.shift();h=-y(h);if(isNaN(h))return null;h=[0,0,v.cos(h*v.PI/180),v.sin(h*v.PI/180)];var i=1/(Y(v.abs(h[2]),
v.abs(h[3]))||1);h[2]*=i;h[3]*=i;if(h[2]<0){h[0]=-h[2];h[2]=0}if(h[3]<0){h[1]=-h[3];h[3]=0}}b=Wa(b);if(!b)return null;i=a.getAttribute(ca);(i=i.match(/^url\(#(.*)\)$/))&&c.defs.removeChild(C.getElementById(i[1]));i=u(d+"Gradient");i.id="r"+(l._id++)[O](36);u(i,d=="radial"?{fx:f,fy:e}:{x1:h[0],y1:h[1],x2:h[2],y2:h[3]});c.defs[x](i);c=0;for(h=b[o];c<h;c++){var j=u("stop");u(j,{offset:b[c].offset?b[c].offset:!c?"0%":"100%","stop-color":b[c].color||"#fff"});i[x](j)}u(a,{fill:"url(#"+i.id+")",opacity:1,
"fill-opacity":1});g.fill=A;g.opacity=1;return g.fillOpacity=1},Ja=function(a){var b=a.getBBox();u(a.pattern,{patternTransform:l.format("translate({0},{1})",b.x,b.y)})},ea=function(a,b){var c={"":[0],none:[0],"-":[3,1],".":[1,1],"-.":[3,1,1,1],"-..":[3,1,1,1,1,1],". ":[1,3],"- ":[4,3],"--":[8,3],"- .":[4,3,1,3],"--.":[8,3,1,3],"--..":[8,3,1,3,1,3]},d=a.node,f=a.attrs,e=a.rotate();function g(k,t){if(t=c[fa.call(t)]){var L=k.attrs["stroke-width"]||"1";k={round:L,square:L,butt:0}[k.attrs["stroke-linecap"]||
b["stroke-linecap"]]||0;for(var B=[],w=t[o];w--;)B[w]=t[w]*L+(w%2?1:-1)*k;u(d,{"stroke-dasharray":B[R](",")})}}b[z]("rotation")&&(e=b.rotation);var h=D(e)[G](V);if(h.length-1){h[1]=+h[1];h[2]=+h[2]}else h=null;y(e)&&a.rotate(0,true);for(var i in b)if(b[z](i))if(ta[z](i)){var j=b[i];f[i]=j;switch(i){case "blur":a.blur(j);break;case "rotation":a.rotate(j,true);break;case "href":case "title":case "target":var m=d.parentNode;if(fa.call(m.tagName)!="a"){var n=u("a");m.insertBefore(n,d);n[x](d);m=n}m.setAttributeNS(a.paper.xlink,
i,j);break;case "cursor":d.style.cursor=j;break;case "clip-rect":m=D(j)[G](V);if(m[o]==4){a.clip&&a.clip.parentNode.parentNode.removeChild(a.clip.parentNode);var r=u("clipPath");n=u("rect");r.id="r"+(l._id++)[O](36);u(n,{x:m[0],y:m[1],width:m[2],height:m[3]});r[x](n);a.paper.defs[x](r);u(d,{"clip-path":"url(#"+r.id+")"});a.clip=n}if(!j){(j=C.getElementById(d.getAttribute("clip-path")[I](/(^url\(#|\)$)/g,A)))&&j.parentNode.removeChild(j);u(d,{"clip-path":A});delete a.clip}break;case "path":if(a.type==
"path")u(d,{d:j?(f.path=oa(j)):"M0,0"});break;case "width":d[W](i,j);if(f.fx){i="x";j=f.x}else break;case "x":if(f.fx)j=-f.x-(f.width||0);case "rx":if(i=="rx"&&a.type=="rect")break;case "cx":h&&(i=="x"||i=="cx")&&(h[1]+=j-f[i]);d[W](i,j);a.pattern&&Ja(a);break;case "height":d[W](i,j);if(f.fy){i="y";j=f.y}else break;case "y":if(f.fy)j=-f.y-(f.height||0);case "ry":if(i=="ry"&&a.type=="rect")break;case "cy":h&&(i=="y"||i=="cy")&&(h[2]+=j-f[i]);d[W](i,j);a.pattern&&Ja(a);break;case "r":a.type=="rect"?
u(d,{rx:j,ry:j}):d[W](i,j);break;case "src":a.type=="image"&&d.setAttributeNS(a.paper.xlink,"href",j);break;case "stroke-width":d.style.strokeWidth=j;d[W](i,j);f["stroke-dasharray"]&&g(a,f["stroke-dasharray"]);break;case "stroke-dasharray":g(a,j);break;case "translation":j=D(j)[G](V);j[0]=+j[0]||0;j[1]=+j[1]||0;if(h){h[1]+=j[0];h[2]+=j[1]}Aa.call(a,j[0],j[1]);break;case "scale":j=D(j)[G](V);a.scale(+j[0]||1,+j[1]||+j[0]||1,isNaN(y(j[2]))?null:+j[2],isNaN(y(j[3]))?null:+j[3]);break;case ca:if(m=D(j).match(Sa)){r=
u("pattern");var q=u("image");r.id="r"+(l._id++)[O](36);u(r,{x:0,y:0,patternUnits:"userSpaceOnUse",height:1,width:1});u(q,{x:0,y:0});q.setAttributeNS(a.paper.xlink,"href",m[1]);r[x](q);j=C.createElement("img");j.style.cssText="position:absolute;left:-9999em;top-9999em";j.onload=function(){u(r,{width:this.offsetWidth,height:this.offsetHeight});u(q,{width:this.offsetWidth,height:this.offsetHeight});C.body.removeChild(this);a.paper.safari()};C.body[x](j);j.src=m[1];a.paper.defs[x](r);d.style.fill="url(#"+
r.id+")";u(d,{fill:"url(#"+r.id+")"});a.pattern=r;a.pattern&&Ja(a);break}m=l.getRGB(j);if(m.error){if(({circle:1,ellipse:1}[z](a.type)||D(j).charAt()!="r")&&pa(d,j,a.paper)){f.gradient=j;f.fill="none";break}}else{delete b.gradient;delete f.gradient;!l.is(f.opacity,"undefined")&&l.is(b.opacity,"undefined")&&u(d,{opacity:f.opacity});!l.is(f["fill-opacity"],"undefined")&&l.is(b["fill-opacity"],"undefined")&&u(d,{"fill-opacity":f["fill-opacity"]})}m[z]("o")&&u(d,{"fill-opacity":m.o/100});case "stroke":m=
l.getRGB(j);d[W](i,m.hex);i=="stroke"&&m[z]("o")&&u(d,{"stroke-opacity":m.o/100});break;case "gradient":(({circle:1,ellipse:1})[z](a.type)||D(j).charAt()!="r")&&pa(d,j,a.paper);break;case "opacity":case "fill-opacity":if(f.gradient){if(m=C.getElementById(d.getAttribute(ca)[I](/^url\(#|\)$/g,A))){m=m.getElementsByTagName("stop");m[m[o]-1][W]("stop-opacity",j)}break}default:i=="font-size"&&(j=ha(j,10)+"px");m=i[I](/(\-.)/g,function(k){return sa.call(k.substring(1))});d.style[m]=j;d[W](i,j);break}}Db(a,
b);if(h)a.rotate(h.join(N));else y(e)&&a.rotate(e,true)},eb=1.2,Db=function(a,b){if(!(a.type!="text"||!(b[z]("text")||b[z]("font")||b[z]("font-size")||b[z]("x")||b[z]("y")))){var c=a.attrs,d=a.node,f=d.firstChild?ha(C.defaultView.getComputedStyle(d.firstChild,A).getPropertyValue("font-size"),10):10;if(b[z]("text")){for(c.text=b.text;d.firstChild;)d.removeChild(d.firstChild);b=D(b.text)[G]("\n");for(var e=0,g=b[o];e<g;e++)if(b[e]){var h=u("tspan");e&&u(h,{dy:f*eb,x:c.x});h[x](C.createTextNode(b[e]));
d[x](h)}}else{b=d.getElementsByTagName("tspan");e=0;for(g=b[o];e<g;e++)e&&u(b[e],{dy:f*eb,x:c.x})}u(d,{y:c.y});a=a.getBBox();(a=c.y-(a.y+a.height/2))&&isFinite(a)&&u(d,{y:c.y+a})}},s=function(a,b){this[0]=a;this.id=l._oid++;this.node=a;a.raphael=this;this.paper=b;this.attrs=this.attrs||{};this.transformations=[];this._={tx:0,ty:0,rt:{deg:0,cx:0,cy:0},sx:1,sy:1};!b.bottom&&(b.bottom=this);(this.prev=b.top)&&(b.top.next=this);b.top=this;this.next=null};s[p].rotate=function(a,b,c){if(this.removed)return this;
if(a==null){if(this._.rt.cx)return[this._.rt.deg,this._.rt.cx,this._.rt.cy][R](N);return this._.rt.deg}var d=this.getBBox();a=D(a)[G](V);if(a[o]-1){b=y(a[1]);c=y(a[2])}a=y(a[0]);if(b!=null)this._.rt.deg=a;else this._.rt.deg+=a;c==null&&(b=null);this._.rt.cx=b;this._.rt.cy=c;b=b==null?d.x+d.width/2:b;c=c==null?d.y+d.height/2:c;if(this._.rt.deg){this.transformations[0]=l.format("rotate({0} {1} {2})",this._.rt.deg,b,c);this.clip&&u(this.clip,{transform:l.format("rotate({0} {1} {2})",-this._.rt.deg,b,
c)})}else{this.transformations[0]=A;this.clip&&u(this.clip,{transform:A})}u(this.node,{transform:this.transformations[R](N)});return this};s[p].hide=function(){!this.removed&&(this.node.style.display="none");return this};s[p].show=function(){!this.removed&&(this.node.style.display="");return this};s[p].remove=function(){if(!this.removed){ma(this,this.paper);this.node.parentNode.removeChild(this.node);for(var a in this)delete this[a];this.removed=true}};s[p].getBBox=function(){if(this.removed)return this;
if(this.type=="path")return xa(this.attrs.path);if(this.node.style.display=="none"){this.show();var a=true}var b={};try{b=this.node.getBBox()}catch(c){}finally{b=b||{}}if(this.type=="text"){b={x:b.x,y:Infinity,width:0,height:0};for(var d=0,f=this.node.getNumberOfChars();d<f;d++){var e=this.node.getExtentOfChar(d);e.y<b.y&&(b.y=e.y);e.y+e.height-b.y>b.height&&(b.height=e.y+e.height-b.y);e.x+e.width-b.x>b.width&&(b.width=e.x+e.width-b.x)}}a&&this.hide();return b};s[p].attr=function(a,b){if(this.removed)return this;
if(a==null){a={};for(var c in this.attrs)if(this.attrs[z](c))a[c]=this.attrs[c];this._.rt.deg&&(a.rotation=this.rotate());(this._.sx!=1||this._.sy!=1)&&(a.scale=this.scale());a.gradient&&a.fill=="none"&&(a.fill=a.gradient)&&delete a.gradient;return a}if(b==null&&l.is(a,ga)){if(a=="translation")return Aa.call(this);if(a=="rotation")return this.rotate();if(a=="scale")return this.scale();if(a==ca&&this.attrs.fill=="none"&&this.attrs.gradient)return this.attrs.gradient;return this.attrs[a]}if(b==null&&
l.is(a,U)){b={};c=0;for(var d=a.length;c<d;c++)b[a[c]]=this.attr(a[c]);return b}if(b!=null){c={};c[a]=b;ea(this,c)}else a!=null&&l.is(a,"object")&&ea(this,a);return this};s[p].toFront=function(){if(this.removed)return this;this.node.parentNode[x](this.node);var a=this.paper;a.top!=this&&Ya(this,a);return this};s[p].toBack=function(){if(this.removed)return this;if(this.node.parentNode.firstChild!=this.node){this.node.parentNode.insertBefore(this.node,this.node.parentNode.firstChild);Za(this,this.paper)}return this};
s[p].insertAfter=function(a){if(this.removed)return this;var b=a.node||a[a.length].node;b.nextSibling?b.parentNode.insertBefore(this.node,b.nextSibling):b.parentNode[x](this.node);$a(this,a,this.paper);return this};s[p].insertBefore=function(a){if(this.removed)return this;var b=a.node||a[0].node;b.parentNode.insertBefore(this.node,b);ab(this,a,this.paper);return this};s[p].blur=function(a){var b=this;if(+a!==0){var c=u("filter"),d=u("feGaussianBlur");b.attrs.blur=a;c.id="r"+(l._id++)[O](36);u(d,{stdDeviation:+a||
1.5});c.appendChild(d);b.paper.defs.appendChild(c);b._blur=c;u(b.node,{filter:"url(#"+c.id+")"})}else{if(b._blur){b._blur.parentNode.removeChild(b._blur);delete b._blur;delete b.attrs.blur}b.node.removeAttribute("filter")}};var fb=function(a,b,c,d){var f=u("circle");a.canvas&&a.canvas[x](f);a=new s(f,a);a.attrs={cx:b,cy:c,r:d,fill:"none",stroke:"#000"};a.type="circle";u(f,a.attrs);return a},gb=function(a,b,c,d,f,e){var g=u("rect");a.canvas&&a.canvas[x](g);a=new s(g,a);a.attrs={x:b,y:c,width:d,height:f,
r:e||0,rx:e||0,ry:e||0,fill:"none",stroke:"#000"};a.type="rect";u(g,a.attrs);return a},hb=function(a,b,c,d,f){var e=u("ellipse");a.canvas&&a.canvas[x](e);a=new s(e,a);a.attrs={cx:b,cy:c,rx:d,ry:f,fill:"none",stroke:"#000"};a.type="ellipse";u(e,a.attrs);return a},ib=function(a,b,c,d,f,e){var g=u("image");u(g,{x:c,y:d,width:f,height:e,preserveAspectRatio:"none"});g.setAttributeNS(a.xlink,"href",b);a.canvas&&a.canvas[x](g);a=new s(g,a);a.attrs={x:c,y:d,width:f,height:e,src:b};a.type="image";return a},
jb=function(a,b,c,d){var f=u("text");u(f,{x:b,y:c,"text-anchor":"middle"});a.canvas&&a.canvas[x](f);a=new s(f,a);a.attrs={x:b,y:c,"text-anchor":"middle",text:d,font:ta.font,stroke:"none",fill:"#000"};a.type="text";ea(a,a.attrs);return a},kb=function(a,b){this.width=a||this.width;this.height=b||this.height;this.canvas[W]("width",this.width);this.canvas[W]("height",this.height);return this},Ca=function(){var a=Xa[K](0,arguments),b=a&&a.container,c=a.x,d=a.y,f=a.width;a=a.height;if(!b)throw new Error("SVG container not found.");
var e=u("svg");c=c||0;d=d||0;f=f||512;a=a||342;u(e,{xmlns:"http://www.w3.org/2000/svg",version:1.1,width:f,height:a});if(b==1){e.style.cssText="position:absolute;left:"+c+"px;top:"+d+"px";C.body[x](e)}else b.firstChild?b.insertBefore(e,b.firstChild):b[x](e);b=new H;b.width=f;b.height=a;b.canvas=e;Ia.call(b,b,l.fn);b.clear();return b};H[p].clear=function(){for(var a=this.canvas;a.firstChild;)a.removeChild(a.firstChild);this.bottom=this.top=null;(this.desc=u("desc"))[x](C.createTextNode("Created with Rapha\u00ebl"));
a[x](this.desc);a[x](this.defs=u("defs"))};H[p].remove=function(){this.canvas.parentNode&&this.canvas.parentNode.removeChild(this.canvas);for(var a in this)this[a]=bb(a)}}if(l.vml){var lb={M:"m",L:"l",C:"c",Z:"x",m:"t",l:"r",c:"v",z:"x"},Eb=/([clmz]),?([^clmz]*)/gi,Fb=/-?[^,\s-]+/g,qa=1000+N+1000,na=10,ra={path:1,rect:1},Gb=function(a){var b=/[ahqstv]/ig,c=oa;D(a).match(b)&&(c=wa);b=/[clmz]/g;if(c==oa&&!D(a).match(b))return a=D(a)[I](Eb,function(i,j,m){var n=[],r=fa.call(j)=="m",q=lb[j];m[I](Fb,function(k){if(r&&
n[o]==2){q+=n+lb[j=="m"?"l":"L"];n=[]}n[F](Q(k*na))});return q+n});b=c(a);var d;a=[];for(var f=0,e=b[o];f<e;f++){c=b[f];d=fa.call(b[f][0]);d=="z"&&(d="x");for(var g=1,h=c[o];g<h;g++)d+=Q(c[g]*na)+(g!=h-1?",":A);a[F](d)}return a[R](N)};l[O]=function(){return"Your browser doesn\u2019t support SVG. Falling down to VML.\nYou are running Rapha\u00ebl "+this.version};db=function(a,b){var c=S("group");c.style.cssText="position:absolute;left:0;top:0;width:"+b.width+"px;height:"+b.height+"px";c.coordsize=
b.coordsize;c.coordorigin=b.coordorigin;var d=S("shape"),f=d.style;f.width=b.width+"px";f.height=b.height+"px";d.coordsize=qa;d.coordorigin=b.coordorigin;c[x](d);d=new s(d,c,b);f={fill:"none",stroke:"#000"};a&&(f.path=a);d.isAbsolute=true;d.type="path";d.path=[];d.Path=A;ea(d,f);b.canvas[x](c);return d};ea=function(a,b){a.attrs=a.attrs||{};var c=a.node,d=a.attrs,f=c.style,e;e=(b.x!=d.x||b.y!=d.y||b.width!=d.width||b.height!=d.height||b.r!=d.r)&&a.type=="rect";var g=a;for(var h in b)if(b[z](h))d[h]=
b[h];if(e){d.path=mb(d.x,d.y,d.width,d.height,d.r);a.X=d.x;a.Y=d.y;a.W=d.width;a.H=d.height}b.href&&(c.href=b.href);b.title&&(c.title=b.title);b.target&&(c.target=b.target);b.cursor&&(f.cursor=b.cursor);"blur"in b&&a.blur(b.blur);if(b.path&&a.type=="path"||e)c.path=Gb(d.path);b.rotation!=null&&a.rotate(b.rotation,true);if(b.translation){e=D(b.translation)[G](V);Aa.call(a,e[0],e[1]);if(a._.rt.cx!=null){a._.rt.cx+=+e[0];a._.rt.cy+=+e[1];a.setBox(a.attrs,e[0],e[1])}}if(b.scale){e=D(b.scale)[G](V);a.scale(+e[0]||
1,+e[1]||+e[0]||1,+e[2]||null,+e[3]||null)}if("clip-rect"in b){e=D(b["clip-rect"])[G](V);if(e[o]==4){e[2]=+e[2]+ +e[0];e[3]=+e[3]+ +e[1];h=c.clipRect||C.createElement("div");var i=h.style,j=c.parentNode;i.clip=l.format("rect({1}px {2}px {3}px {0}px)",e);if(!c.clipRect){i.position="absolute";i.top=0;i.left=0;i.width=a.paper.width+"px";i.height=a.paper.height+"px";j.parentNode.insertBefore(h,j);h[x](j);c.clipRect=h}}if(!b["clip-rect"])c.clipRect&&(c.clipRect.style.clip=A)}if(a.type=="image"&&b.src)c.src=
b.src;if(a.type=="image"&&b.opacity){c.filterOpacity=Fa+".Alpha(opacity="+b.opacity*100+")";f.filter=(c.filterMatrix||A)+(c.filterOpacity||A)}b.font&&(f.font=b.font);b["font-family"]&&(f.fontFamily='"'+b["font-family"][G](",")[0][I](/^['"]+|['"]+$/g,A)+'"');b["font-size"]&&(f.fontSize=b["font-size"]);b["font-weight"]&&(f.fontWeight=b["font-weight"]);b["font-style"]&&(f.fontStyle=b["font-style"]);if(b.opacity!=null||b["stroke-width"]!=null||b.fill!=null||b.stroke!=null||b["stroke-width"]!=null||b["stroke-opacity"]!=
null||b["fill-opacity"]!=null||b["stroke-dasharray"]!=null||b["stroke-miterlimit"]!=null||b["stroke-linejoin"]!=null||b["stroke-linecap"]!=null){c=a.shape||c;f=c.getElementsByTagName(ca)&&c.getElementsByTagName(ca)[0];e=false;!f&&(e=f=S(ca));if("fill-opacity"in b||"opacity"in b){a=((+d["fill-opacity"]+1||2)-1)*((+d.opacity+1||2)-1)*((+l.getRGB(b.fill).o+1||2)-1);a<0&&(a=0);a>1&&(a=1);f.opacity=a}b.fill&&(f.on=true);if(f.on==null||b.fill=="none")f.on=false;if(f.on&&b.fill)if(a=b.fill.match(Sa)){f.src=
a[1];f.type="tile"}else{f.color=l.getRGB(b.fill).hex;f.src=A;f.type="solid";if(l.getRGB(b.fill).error&&(g.type in{circle:1,ellipse:1}||D(b.fill).charAt()!="r")&&pa(g,b.fill)){d.fill="none";d.gradient=b.fill}}e&&c[x](f);f=c.getElementsByTagName("stroke")&&c.getElementsByTagName("stroke")[0];e=false;!f&&(e=f=S("stroke"));if(b.stroke&&b.stroke!="none"||b["stroke-width"]||b["stroke-opacity"]!=null||b["stroke-dasharray"]||b["stroke-miterlimit"]||b["stroke-linejoin"]||b["stroke-linecap"])f.on=true;(b.stroke==
"none"||f.on==null||b.stroke==0||b["stroke-width"]==0)&&(f.on=false);a=l.getRGB(b.stroke);f.on&&b.stroke&&(f.color=a.hex);a=((+d["stroke-opacity"]+1||2)-1)*((+d.opacity+1||2)-1)*((+a.o+1||2)-1);h=(y(b["stroke-width"])||1)*0.75;a<0&&(a=0);a>1&&(a=1);b["stroke-width"]==null&&(h=d["stroke-width"]);b["stroke-width"]&&(f.weight=h);h&&h<1&&(a*=h)&&(f.weight=1);f.opacity=a;b["stroke-linejoin"]&&(f.joinstyle=b["stroke-linejoin"]||"miter");f.miterlimit=b["stroke-miterlimit"]||8;b["stroke-linecap"]&&(f.endcap=
b["stroke-linecap"]=="butt"?"flat":b["stroke-linecap"]=="square"?"square":"round");if(b["stroke-dasharray"]){a={"-":"shortdash",".":"shortdot","-.":"shortdashdot","-..":"shortdashdotdot",". ":"dot","- ":"dash","--":"longdash","- .":"dashdot","--.":"longdashdot","--..":"longdashdotdot"};f.dashstyle=a[z](b["stroke-dasharray"])?a[b["stroke-dasharray"]]:A}e&&c[x](f)}if(g.type=="text"){f=g.paper.span.style;d.font&&(f.font=d.font);d["font-family"]&&(f.fontFamily=d["font-family"]);d["font-size"]&&(f.fontSize=
d["font-size"]);d["font-weight"]&&(f.fontWeight=d["font-weight"]);d["font-style"]&&(f.fontStyle=d["font-style"]);g.node.string&&(g.paper.span.innerHTML=D(g.node.string)[I](/</g,"&#60;")[I](/&/g,"&#38;")[I](/\n/g,"<br>"));g.W=d.w=g.paper.span.offsetWidth;g.H=d.h=g.paper.span.offsetHeight;g.X=d.x;g.Y=d.y+Q(g.H/2);switch(d["text-anchor"]){case "start":g.node.style["v-text-align"]="left";g.bbx=Q(g.W/2);break;case "end":g.node.style["v-text-align"]="right";g.bbx=-Q(g.W/2);break;default:g.node.style["v-text-align"]=
"center";break}}};pa=function(a,b){a.attrs=a.attrs||{};var c="linear",d=".5 .5";a.attrs.gradient=b;b=D(b)[I](cb,function(i,j,m){c="radial";if(j&&m){j=y(j);m=y(m);E(j-0.5,2)+E(m-0.5,2)>0.25&&(m=v.sqrt(0.25-E(j-0.5,2))*((m>0.5)*2-1)+0.5);d=j+N+m}return A});b=b[G](/\s*\-\s*/);if(c=="linear"){var f=b.shift();f=-y(f);if(isNaN(f))return null}var e=Wa(b);if(!e)return null;a=a.shape||a.node;b=a.getElementsByTagName(ca)[0]||S(ca);!b.parentNode&&a.appendChild(b);if(e[o]){b.on=true;b.method="none";b.color=e[0].color;
b.color2=e[e[o]-1].color;a=[];for(var g=0,h=e[o];g<h;g++)e[g].offset&&a[F](e[g].offset+N+e[g].color);b.colors&&(b.colors.value=a[o]?a[R]():"0% "+b.color);if(c=="radial"){b.type="gradientradial";b.focus="100%";b.focussize=d;b.focusposition=d}else{b.type="gradient";b.angle=(270-f)%360}}return 1};s=function(a,b,c){this[0]=a;this.id=l._oid++;this.node=a;a.raphael=this;this.Y=this.X=0;this.attrs={};this.Group=b;this.paper=c;this._={tx:0,ty:0,rt:{deg:0},sx:1,sy:1};!c.bottom&&(c.bottom=this);(this.prev=
c.top)&&(c.top.next=this);c.top=this;this.next=null};s[p].rotate=function(a,b,c){if(this.removed)return this;if(a==null){if(this._.rt.cx)return[this._.rt.deg,this._.rt.cx,this._.rt.cy][R](N);return this._.rt.deg}a=D(a)[G](V);if(a[o]-1){b=y(a[1]);c=y(a[2])}a=y(a[0]);if(b!=null)this._.rt.deg=a;else this._.rt.deg+=a;c==null&&(b=null);this._.rt.cx=b;this._.rt.cy=c;this.setBox(this.attrs,b,c);this.Group.style.rotation=this._.rt.deg;return this};s[p].setBox=function(a,b,c){if(this.removed)return this;var d=
this.Group.style,f=this.shape&&this.shape.style||this.node.style;a=a||{};for(var e in a)if(a[z](e))this.attrs[e]=a[e];b=b||this._.rt.cx;c=c||this._.rt.cy;var g=this.attrs,h;switch(this.type){case "circle":a=g.cx-g.r;e=g.cy-g.r;h=g=g.r*2;break;case "ellipse":a=g.cx-g.rx;e=g.cy-g.ry;h=g.rx*2;g=g.ry*2;break;case "image":a=+g.x;e=+g.y;h=g.width||0;g=g.height||0;break;case "text":this.textpath.v=["m",Q(g.x),", ",Q(g.y-2),"l",Q(g.x)+1,", ",Q(g.y-2)][R](A);a=g.x-Q(this.W/2);e=g.y-this.H/2;h=this.W;g=this.H;
break;case "rect":case "path":if(this.attrs.path){g=xa(this.attrs.path);a=g.x;e=g.y;h=g.width;g=g.height}else{e=a=0;h=this.paper.width;g=this.paper.height}break;default:e=a=0;h=this.paper.width;g=this.paper.height;break}b=b==null?a+h/2:b;c=c==null?e+g/2:c;b=b-this.paper.width/2;c=c-this.paper.height/2;var i;d.left!=(i=b+"px")&&(d.left=i);d.top!=(i=c+"px")&&(d.top=i);this.X=ra[z](this.type)?-b:a;this.Y=ra[z](this.type)?-c:e;this.W=h;this.H=g;if(ra[z](this.type)){f.left!=(i=-b*na+"px")&&(f.left=i);
f.top!=(i=-c*na+"px")&&(f.top=i)}else if(this.type=="text"){f.left!=(i=-b+"px")&&(f.left=i);f.top!=(i=-c+"px")&&(f.top=i)}else{d.width!=(i=this.paper.width+"px")&&(d.width=i);d.height!=(i=this.paper.height+"px")&&(d.height=i);f.left!=(i=a-b+"px")&&(f.left=i);f.top!=(i=e-c+"px")&&(f.top=i);f.width!=(i=h+"px")&&(f.width=i);f.height!=(i=g+"px")&&(f.height=i)}};s[p].hide=function(){!this.removed&&(this.Group.style.display="none");return this};s[p].show=function(){!this.removed&&(this.Group.style.display=
"block");return this};s[p].getBBox=function(){if(this.removed)return this;if(ra[z](this.type))return xa(this.attrs.path);return{x:this.X+(this.bbx||0),y:this.Y,width:this.W,height:this.H}};s[p].remove=function(){if(!this.removed){ma(this,this.paper);this.node.parentNode.removeChild(this.node);this.Group.parentNode.removeChild(this.Group);this.shape&&this.shape.parentNode.removeChild(this.shape);for(var a in this)delete this[a];this.removed=true}};s[p].attr=function(a,b){if(this.removed)return this;
if(a==null){a={};for(var c in this.attrs)if(this.attrs[z](c))a[c]=this.attrs[c];this._.rt.deg&&(a.rotation=this.rotate());(this._.sx!=1||this._.sy!=1)&&(a.scale=this.scale());a.gradient&&a.fill=="none"&&(a.fill=a.gradient)&&delete a.gradient;return a}if(b==null&&l.is(a,ga)){if(a=="translation")return Aa.call(this);if(a=="rotation")return this.rotate();if(a=="scale")return this.scale();if(a==ca&&this.attrs.fill=="none"&&this.attrs.gradient)return this.attrs.gradient;return this.attrs[a]}if(this.attrs&&
b==null&&l.is(a,U)){var d={};c=0;for(b=a[o];c<b;c++)d[a[c]]=this.attr(a[c]);return d}if(b!=null){d={};d[a]=b}b==null&&l.is(a,"object")&&(d=a);if(d){if(d.text&&this.type=="text")this.node.string=d.text;ea(this,d);if(d.gradient&&({circle:1,ellipse:1}[z](this.type)||D(d.gradient).charAt()!="r"))pa(this,d.gradient);(!ra[z](this.type)||this._.rt.deg)&&this.setBox(this.attrs)}return this};s[p].toFront=function(){!this.removed&&this.Group.parentNode[x](this.Group);this.paper.top!=this&&Ya(this,this.paper);
return this};s[p].toBack=function(){if(this.removed)return this;if(this.Group.parentNode.firstChild!=this.Group){this.Group.parentNode.insertBefore(this.Group,this.Group.parentNode.firstChild);Za(this,this.paper)}return this};s[p].insertAfter=function(a){if(this.removed)return this;if(a.constructor==X)a=a[a.length];a.Group.nextSibling?a.Group.parentNode.insertBefore(this.Group,a.Group.nextSibling):a.Group.parentNode[x](this.Group);$a(this,a,this.paper);return this};s[p].insertBefore=function(a){if(this.removed)return this;
if(a.constructor==X)a=a[0];a.Group.parentNode.insertBefore(this.Group,a.Group);ab(this,a,this.paper);return this};var Hb=/ progid:\S+Blur\([^\)]+\)/g;s[p].blur=function(a){var b=this.node.runtimeStyle,c=b.filter;c=c.replace(Hb,A);if(+a!==0){this.attrs.blur=a;b.filter=c+N+Fa+".Blur(pixelradius="+(+a||1.5)+")";b.margin=l.format("-{0}px 0 0 -{0}px",Q(+a||1.5))}else{b.filter=c;b.margin=0;delete this.attrs.blur}};fb=function(a,b,c,d){var f=S("group"),e=S("oval");f.style.cssText="position:absolute;left:0;top:0;width:"+
a.width+"px;height:"+a.height+"px";f.coordsize=qa;f.coordorigin=a.coordorigin;f[x](e);e=new s(e,f,a);e.type="circle";ea(e,{stroke:"#000",fill:"none"});e.attrs.cx=b;e.attrs.cy=c;e.attrs.r=d;e.setBox({x:b-d,y:c-d,width:d*2,height:d*2});a.canvas[x](f);return e};function mb(a,b,c,d,f){return f?l.format("M{0},{1}l{2},0a{3},{3},0,0,1,{3},{3}l0,{5}a{3},{3},0,0,1,{4},{3}l{6},0a{3},{3},0,0,1,{4},{4}l0,{7}a{3},{3},0,0,1,{3},{4}z",a+f,b,c-f*2,f,-f,d-f*2,f*2-c,f*2-d):l.format("M{0},{1}l{2},0,0,{3},{4},0z",a,
b,c,d,-c)}gb=function(a,b,c,d,f,e){var g=mb(b,c,d,f,e);a=a.path(g);var h=a.attrs;a.X=h.x=b;a.Y=h.y=c;a.W=h.width=d;a.H=h.height=f;h.r=e;h.path=g;a.type="rect";return a};hb=function(a,b,c,d,f){var e=S("group"),g=S("oval");e.style.cssText="position:absolute;left:0;top:0;width:"+a.width+"px;height:"+a.height+"px";e.coordsize=qa;e.coordorigin=a.coordorigin;e[x](g);g=new s(g,e,a);g.type="ellipse";ea(g,{stroke:"#000"});g.attrs.cx=b;g.attrs.cy=c;g.attrs.rx=d;g.attrs.ry=f;g.setBox({x:b-d,y:c-f,width:d*2,
height:f*2});a.canvas[x](e);return g};ib=function(a,b,c,d,f,e){var g=S("group"),h=S("image");g.style.cssText="position:absolute;left:0;top:0;width:"+a.width+"px;height:"+a.height+"px";g.coordsize=qa;g.coordorigin=a.coordorigin;h.src=b;g[x](h);h=new s(h,g,a);h.type="image";h.attrs.src=b;h.attrs.x=c;h.attrs.y=d;h.attrs.w=f;h.attrs.h=e;h.setBox({x:c,y:d,width:f,height:e});a.canvas[x](g);return h};jb=function(a,b,c,d){var f=S("group"),e=S("shape"),g=e.style,h=S("path"),i=S("textpath");f.style.cssText=
"position:absolute;left:0;top:0;width:"+a.width+"px;height:"+a.height+"px";f.coordsize=qa;f.coordorigin=a.coordorigin;h.v=l.format("m{0},{1}l{2},{1}",Q(b*10),Q(c*10),Q(b*10)+1);h.textpathok=true;g.width=a.width;g.height=a.height;i.string=D(d);i.on=true;e[x](i);e[x](h);f[x](e);g=new s(i,f,a);g.shape=e;g.textpath=h;g.type="text";g.attrs.text=d;g.attrs.x=b;g.attrs.y=c;g.attrs.w=1;g.attrs.h=1;ea(g,{font:ta.font,stroke:"none",fill:"#000"});g.setBox();a.canvas[x](f);return g};kb=function(a,b){var c=this.canvas.style;
a==+a&&(a+="px");b==+b&&(b+="px");c.width=a;c.height=b;c.clip="rect(0 "+a+" "+b+" 0)";return this};var S;C.createStyleSheet().addRule(".rvml","behavior:url(#default#VML)");try{!C.namespaces.rvml&&C.namespaces.add("rvml","urn:schemas-microsoft-com:vml");S=function(a){return C.createElement("<rvml:"+a+' class="rvml">')}}catch(Pb){S=function(a){return C.createElement("<"+a+' xmlns="urn:schemas-microsoft.com:vml" class="rvml">')}}Ca=function(){var a=Xa[K](0,arguments),b=a.container,c=a.height,d=a.width,
f=a.x;a=a.y;if(!b)throw new Error("VML container not found.");var e=new H,g=e.canvas=C.createElement("div"),h=g.style;f=f||0;a=a||0;d=d||512;c=c||342;d==+d&&(d+="px");c==+c&&(c+="px");e.width=1000;e.height=1000;e.coordsize=na*1000+N+na*1000;e.coordorigin="0 0";e.span=C.createElement("span");e.span.style.cssText="position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline;";g[x](e.span);h.cssText=l.format("width:{0};height:{1};display:inline-block;position:relative;clip:rect(0 {0} {1} 0);overflow:hidden",
d,c);if(b==1){C.body[x](g);h.left=f+"px";h.top=a+"px";h.position="absolute"}else b.firstChild?b.insertBefore(g,b.firstChild):b[x](g);Ia.call(e,e,l.fn);return e};H[p].clear=function(){this.canvas.innerHTML=A;this.span=C.createElement("span");this.span.style.cssText="position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline;";this.canvas[x](this.span);this.bottom=this.top=null};H[p].remove=function(){this.canvas.parentNode.removeChild(this.canvas);for(var a in this)this[a]=
bb(a);return true}}H[p].safari=navigator.vendor=="Apple Computer, Inc."&&(navigator.userAgent.match(/Version\/(.*?)\s/)[1]<4||aa.navigator.platform.slice(0,2)=="iP")?function(){var a=this.rect(-99,-99,this.width+99,this.height+99).attr({stroke:"none"});aa.setTimeout(function(){a.remove()})}:function(){};function Ib(){this.returnValue=false}function Jb(){return this.originalEvent.preventDefault()}function Kb(){this.cancelBubble=true}function Lb(){return this.originalEvent.stopPropagation()}var Mb=
function(){if(C.addEventListener)return function(a,b,c,d){var f=Da&&Ea[b]?Ea[b]:b;function e(g){if(Da&&Ea[z](b))for(var h=0,i=g.targetTouches&&g.targetTouches.length;h<i;h++)if(g.targetTouches[h].target==a){i=g;g=g.targetTouches[h];g.originalEvent=i;g.preventDefault=Jb;g.stopPropagation=Lb;break}return c.call(d,g)}a.addEventListener(f,e,false);return function(){a.removeEventListener(f,e,false);return true}};else if(C.attachEvent)return function(a,b,c,d){function f(g){g=g||aa.event;g.preventDefault=
g.preventDefault||Ib;g.stopPropagation=g.stopPropagation||Kb;return c.call(d,g)}a.attachEvent("on"+b,f);function e(){a.detachEvent("on"+b,f);return true}return e}}(),$=[];function Ka(a){for(var b=a.clientX,c=a.clientY,d,f=$.length;f--;){d=$[f];if(Da)for(var e=a.touches.length,g;e--;){g=a.touches[e];if(g.identifier==d.el._drag.id){b=g.clientX;c=g.clientY;(a.originalEvent?a.originalEvent:a).preventDefault();break}}else a.preventDefault();d.move&&d.move.call(d.el,b-d.el._drag.x,c-d.el._drag.y,b,c)}}
function La(){l.unmousemove(Ka).unmouseup(La);for(var a=$.length,b;a--;){b=$[a];b.el._drag={};b.end&&b.end.call(b.el)}$=[]}for(da=Ra[o];da--;)(function(a){l[a]=s[p][a]=function(b){if(l.is(b,"function")){this.events=this.events||[];this.events.push({name:a,f:b,unbind:Mb(this.shape||this.node||C,a,b,this)})}return this};l["un"+a]=s[p]["un"+a]=function(b){for(var c=this.events,d=c[o];d--;)if(c[d].name==a&&c[d].f==b){c[d].unbind();c.splice(d,1);!c.length&&delete this.events;return this}return this}})(Ra[da]);
s[p].hover=function(a,b){return this.mouseover(a).mouseout(b)};s[p].unhover=function(a,b){return this.unmouseover(a).unmouseout(b)};s[p].drag=function(a,b,c){this._drag={};this.mousedown(function(d){(d.originalEvent||d).preventDefault();this._drag.x=d.clientX;this._drag.y=d.clientY;this._drag.id=d.identifier;b&&b.call(this,d.clientX,d.clientY);!$.length&&l.mousemove(Ka).mouseup(La);$.push({el:this,move:a,end:c})});return this};s[p].undrag=function(a,b,c){for(b=$.length;b--;){$[b].el==this&&$[b].move==
a&&$[b].end==c&&$.splice(b,1);!$.length&&l.unmousemove(Ka).unmouseup(La)}};H[p].circle=function(a,b,c){return fb(this,a||0,b||0,c||0)};H[p].rect=function(a,b,c,d,f){return gb(this,a||0,b||0,c||0,d||0,f||0)};H[p].ellipse=function(a,b,c,d){return hb(this,a||0,b||0,c||0,d||0)};H[p].path=function(a){a&&!l.is(a,ga)&&!l.is(a[0],U)&&(a+=A);return db(l.format[K](l,arguments),this)};H[p].image=function(a,b,c,d,f){return ib(this,a||"about:blank",b||0,c||0,d||0,f||0)};H[p].text=function(a,b,c){return jb(this,
a||0,b||0,c||A)};H[p].set=function(a){arguments[o]>1&&(a=Array[p].splice.call(arguments,0,arguments[o]));return new X(a)};H[p].setSize=kb;H[p].top=H[p].bottom=null;H[p].raphael=l;function nb(){return this.x+N+this.y}s[p].resetScale=function(){if(this.removed)return this;this._.sx=1;this._.sy=1;this.attrs.scale="1 1"};s[p].scale=function(a,b,c,d){if(this.removed)return this;if(a==null&&b==null)return{x:this._.sx,y:this._.sy,toString:nb};b=b||a;!+b&&(b=a);var f,e,g=this.attrs;if(a!=0){var h=this.getBBox(),
i=h.x+h.width/2,j=h.y+h.height/2;f=a/this._.sx;e=b/this._.sy;c=+c||c==0?c:i;d=+d||d==0?d:j;h=~~(a/v.abs(a));var m=~~(b/v.abs(b)),n=this.node.style,r=c+(i-c)*f;j=d+(j-d)*e;switch(this.type){case "rect":case "image":var q=g.width*h*f,k=g.height*m*e;this.attr({height:k,r:g.r*ba(h*f,m*e),width:q,x:r-q/2,y:j-k/2});break;case "circle":case "ellipse":this.attr({rx:g.rx*h*f,ry:g.ry*m*e,r:g.r*ba(h*f,m*e),cx:r,cy:j});break;case "text":this.attr({x:r,y:j});break;case "path":i=Ha(g.path);for(var t=true,L=0,B=
i[o];L<B;L++){var w=i[L],J=sa.call(w[0]);if(!(J=="M"&&t)){t=false;if(J=="A"){w[i[L][o]-2]*=f;w[i[L][o]-1]*=e;w[1]*=h*f;w[2]*=m*e;w[5]=+!(h+m?!+w[5]:+w[5])}else if(J=="H"){J=1;for(var ia=w[o];J<ia;J++)w[J]*=f}else if(J=="V"){J=1;for(ia=w[o];J<ia;J++)w[J]*=e}else{J=1;for(ia=w[o];J<ia;J++)w[J]*=J%2?f:e}}}e=xa(i);f=r-e.x-e.width/2;e=j-e.y-e.height/2;i[0][1]+=f;i[0][2]+=e;this.attr({path:i});break}if(this.type in{text:1,image:1}&&(h!=1||m!=1))if(this.transformations){this.transformations[2]="scale("[M](h,
",",m,")");this.node[W]("transform",this.transformations[R](N));f=h==-1?-g.x-(q||0):g.x;e=m==-1?-g.y-(k||0):g.y;this.attr({x:f,y:e});g.fx=h-1;g.fy=m-1}else{this.node.filterMatrix=Fa+".Matrix(M11="[M](h,", M12=0, M21=0, M22=",m,", Dx=0, Dy=0, sizingmethod='auto expand', filtertype='bilinear')");n.filter=(this.node.filterMatrix||A)+(this.node.filterOpacity||A)}else if(this.transformations){this.transformations[2]=A;this.node[W]("transform",this.transformations[R](N));g.fx=0;g.fy=0}else{this.node.filterMatrix=
A;n.filter=(this.node.filterMatrix||A)+(this.node.filterOpacity||A)}g.scale=[a,b,c,d][R](N);this._.sx=a;this._.sy=b}return this};s[p].clone=function(){if(this.removed)return null;var a=this.attr();delete a.scale;delete a.translation;return this.paper[this.type]().attr(a)};var ob=Z(function(a,b,c,d,f,e,g,h,i){for(var j=0,m,n=0;n<1.01;n+=0.01){var r=la(a,b,c,d,f,e,g,h,n);n&&(j+=E(E(m.x-r.x,2)+E(m.y-r.y,2),0.5));if(j>=i)return r;m=r}});function Ma(a,b){return function(c,d,f){c=wa(c);for(var e,g,h,i,
j="",m={},n=0,r=0,q=c.length;r<q;r++){h=c[r];if(h[0]=="M"){e=+h[1];g=+h[2]}else{i=Nb(e,g,h[1],h[2],h[3],h[4],h[5],h[6]);if(n+i>d){if(b&&!m.start){e=ob(e,g,h[1],h[2],h[3],h[4],h[5],h[6],d-n);j+=["C",e.start.x,e.start.y,e.m.x,e.m.y,e.x,e.y];if(f)return j;m.start=j;j=["M",e.x,e.y+"C",e.n.x,e.n.y,e.end.x,e.end.y,h[5],h[6]][R]();n+=i;e=+h[5];g=+h[6];continue}if(!a&&!b){e=ob(e,g,h[1],h[2],h[3],h[4],h[5],h[6],d-n);return{x:e.x,y:e.y,alpha:e.alpha}}}n+=i;e=+h[5];g=+h[6]}j+=h}m.end=j;e=a?n:b?m:l.findDotsAtSegment(e,
g,h[1],h[2],h[3],h[4],h[5],h[6],1);e.alpha&&(e={x:e.x,y:e.y,alpha:e.alpha});return e}}var Nb=Z(function(a,b,c,d,f,e,g,h){for(var i={x:0,y:0},j=0,m=0;m<1.01;m+=0.01){var n=la(a,b,c,d,f,e,g,h,m);m&&(j+=E(E(i.x-n.x,2)+E(i.y-n.y,2),0.5));i=n}return j}),pb=Ma(1),Ba=Ma(),Na=Ma(0,1);s[p].getTotalLength=function(){if(this.type=="path"){if(this.node.getTotalLength)return this.node.getTotalLength();return pb(this.attrs.path)}};s[p].getPointAtLength=function(a){if(this.type=="path"){if(this.node.getPointAtLength)return this.node.getPointAtLength(a);
return Ba(this.attrs.path,a)}};s[p].getSubpath=function(a,b){if(this.type=="path"){if(v.abs(this.getTotalLength()-b)<1.0E-6)return Na(this.attrs.path,a).end;b=Na(this.attrs.path,b,1);return a?Na(b,a).end:b}};l.easing_formulas={linear:function(a){return a},"<":function(a){return E(a,3)},">":function(a){return E(a-1,3)+1},"<>":function(a){a*=2;if(a<1)return E(a,3)/2;a-=2;return(E(a,3)+2)/2},backIn:function(a){var b=1.70158;return a*a*((b+1)*a-b)},backOut:function(a){a-=1;var b=1.70158;return a*a*((b+
1)*a+b)+1},elastic:function(a){if(a==0||a==1)return a;var b=0.3,c=b/4;return E(2,-10*a)*v.sin((a-c)*2*v.PI/b)+1},bounce:function(a){var b=7.5625,c=2.75;if(a<1/c)a=b*a*a;else if(a<2/c){a-=1.5/c;a=b*a*a+0.75}else if(a<2.5/c){a-=2.25/c;a=b*a*a+0.9375}else{a-=2.625/c;a=b*a*a+0.984375}return a}};var T={length:0};function qb(){var a=+new Date;for(var b in T)if(b!="length"&&T[z](b)){var c=T[b];if(c.stop||c.el.removed){delete T[b];T[o]--}else{var d=a-c.start,f=c.ms,e=c.easing,g=c.from,h=c.diff,i=c.to,j=c.t,
m=c.prev||0,n=c.el,r=c.callback,q={},k;if(d<f){r=l.easing_formulas[e]?l.easing_formulas[e](d/f):d/f;for(var t in g)if(g[z](t)){switch(Ga[t]){case "along":k=r*f*h[t];i.back&&(k=i.len-k);e=Ba(i[t],k);n.translate(h.sx-h.x||0,h.sy-h.y||0);h.x=e.x;h.y=e.y;n.translate(e.x-h.sx,e.y-h.sy);i.rot&&n.rotate(h.r+e.alpha,e.x,e.y);break;case P:k=+g[t]+r*f*h[t];break;case "colour":k="rgb("+[Oa(Q(g[t].r+r*f*h[t].r)),Oa(Q(g[t].g+r*f*h[t].g)),Oa(Q(g[t].b+r*f*h[t].b))][R](",")+")";break;case "path":k=[];e=0;for(var L=
g[t][o];e<L;e++){k[e]=[g[t][e][0]];for(var B=1,w=g[t][e][o];B<w;B++)k[e][B]=+g[t][e][B]+r*f*h[t][e][B];k[e]=k[e][R](N)}k=k[R](N);break;case "csv":switch(t){case "translation":k=h[t][0]*(d-m);e=h[t][1]*(d-m);j.x+=k;j.y+=e;k=k+N+e;break;case "rotation":k=+g[t][0]+r*f*h[t][0];g[t][1]&&(k+=","+g[t][1]+","+g[t][2]);break;case "scale":k=[+g[t][0]+r*f*h[t][0],+g[t][1]+r*f*h[t][1],2 in i[t]?i[t][2]:A,3 in i[t]?i[t][3]:A][R](N);break;case "clip-rect":k=[];for(e=4;e--;)k[e]=+g[t][e]+r*f*h[t][e];break}break}q[t]=
k}n.attr(q);n._run&&n._run.call(n)}else{if(i.along){e=Ba(i.along,i.len*!i.back);n.translate(h.sx-(h.x||0)+e.x-h.sx,h.sy-(h.y||0)+e.y-h.sy);i.rot&&n.rotate(h.r+e.alpha,e.x,e.y)}(j.x||j.y)&&n.translate(-j.x,-j.y);i.scale&&(i.scale+=A);n.attr(i);delete T[b];T[o]--;n.in_animation=null;l.is(r,"function")&&r.call(n)}c.prev=d}}l.svg&&n&&n.paper&&n.paper.safari();T[o]&&aa.setTimeout(qb)}function Oa(a){return Y(ba(a,255),0)}function Aa(a,b){if(a==null)return{x:this._.tx,y:this._.ty,toString:nb};this._.tx+=
+a;this._.ty+=+b;switch(this.type){case "circle":case "ellipse":this.attr({cx:+a+this.attrs.cx,cy:+b+this.attrs.cy});break;case "rect":case "image":case "text":this.attr({x:+a+this.attrs.x,y:+b+this.attrs.y});break;case "path":var c=Ha(this.attrs.path);c[0][1]+=+a;c[0][2]+=+b;this.attr({path:c});break}return this}s[p].animateWith=function(a,b,c,d,f){T[a.id]&&(b.start=T[a.id].start);return this.animate(b,c,d,f)};s[p].animateAlong=rb();s[p].animateAlongBack=rb(1);function rb(a){return function(b,c,
d,f){var e={back:a};l.is(d,"function")?(f=d):(e.rot=d);b&&b.constructor==s&&(b=b.attrs.path);b&&(e.along=b);return this.animate(e,c,f)}}s[p].onAnimation=function(a){this._run=a||0;return this};s[p].animate=function(a,b,c,d){if(l.is(c,"function")||!c)d=c||null;var f={},e={},g={};for(var h in a)if(a[z](h))if(Ga[z](h)){f[h]=this.attr(h);f[h]==null&&(f[h]=ta[h]);e[h]=a[h];switch(Ga[h]){case "along":var i=pb(a[h]),j=Ba(a[h],i*!!a.back),m=this.getBBox();g[h]=i/b;g.tx=m.x;g.ty=m.y;g.sx=j.x;g.sy=j.y;e.rot=
a.rot;e.back=a.back;e.len=i;a.rot&&(g.r=y(this.rotate())||0);break;case P:g[h]=(e[h]-f[h])/b;break;case "colour":f[h]=l.getRGB(f[h]);i=l.getRGB(e[h]);g[h]={r:(i.r-f[h].r)/b,g:(i.g-f[h].g)/b,b:(i.b-f[h].b)/b};break;case "path":i=wa(f[h],e[h]);f[h]=i[0];j=i[1];g[h]=[];i=0;for(m=f[h][o];i<m;i++){g[h][i]=[0];for(var n=1,r=f[h][i][o];n<r;n++)g[h][i][n]=(j[i][n]-f[h][i][n])/b}break;case "csv":j=D(a[h])[G](V);i=D(f[h])[G](V);switch(h){case "translation":f[h]=[0,0];g[h]=[j[0]/b,j[1]/b];break;case "rotation":f[h]=
i[1]==j[1]&&i[2]==j[2]?i:[0,j[1],j[2]];g[h]=[(j[0]-f[h][0])/b,0,0];break;case "scale":a[h]=j;f[h]=D(f[h])[G](V);g[h]=[(j[0]-f[h][0])/b,(j[1]-f[h][1])/b,0,0];break;case "clip-rect":f[h]=D(f[h])[G](V);g[h]=[];for(i=4;i--;)g[h][i]=(j[i]-f[h][i])/b;break}e[h]=j}}this.stop();this.in_animation=1;T[this.id]={start:a.start||+new Date,ms:b,easing:c,from:f,diff:g,to:e,el:this,callback:d,t:{x:0,y:0}};++T[o]==1&&qb();return this};s[p].stop=function(){T[this.id]&&T[o]--;delete T[this.id];return this};s[p].translate=
function(a,b){return this.attr({translation:a+" "+b})};s[p][O]=function(){return"Rapha\u00ebl\u2019s object"};l.ae=T;function X(a){this.items=[];this[o]=0;this.type="set";if(a)for(var b=0,c=a[o];b<c;b++)if(a[b]&&(a[b].constructor==s||a[b].constructor==X)){this[this.items[o]]=this.items[this.items[o]]=a[b];this[o]++}}X[p][F]=function(){for(var a,b,c=0,d=arguments[o];c<d;c++)if((a=arguments[c])&&(a.constructor==s||a.constructor==X)){b=this.items[o];this[b]=this.items[b]=a;this[o]++}return this};X[p].pop=
function(){delete this[this[o]--];return this.items.pop()};for(var Pa in s[p])if(s[p][z](Pa))X[p][Pa]=function(a){return function(){for(var b=0,c=this.items[o];b<c;b++)this.items[b][a][K](this.items[b],arguments);return this}}(Pa);X[p].attr=function(a,b){if(a&&l.is(a,U)&&l.is(a[0],"object")){b=0;for(var c=a[o];b<c;b++)this.items[b].attr(a[b])}else{c=0;for(var d=this.items[o];c<d;c++)this.items[c].attr(a,b)}return this};X[p].animate=function(a,b,c,d){(l.is(c,"function")||!c)&&(d=c||null);var f=this.items[o],
e=f,g,h=this,i;d&&(i=function(){!--f&&d.call(h)});c=l.is(c,ga)?c:i;for(g=this.items[--e].animate(a,b,c,i);e--;)this.items[e].animateWith(g,a,b,c,i);return this};X[p].insertAfter=function(a){for(var b=this.items[o];b--;)this.items[b].insertAfter(a);return this};X[p].getBBox=function(){for(var a=[],b=[],c=[],d=[],f=this.items[o];f--;){var e=this.items[f].getBBox();a[F](e.x);b[F](e.y);c[F](e.x+e.width);d[F](e.y+e.height)}a=ba[K](0,a);b=ba[K](0,b);return{x:a,y:b,width:Y[K](0,c)-a,height:Y[K](0,d)-b}};
X[p].clone=function(a){a=new X;for(var b=0,c=this.items[o];b<c;b++)a[F](this.items[b].clone());return a};l.registerFont=function(a){if(!a.face)return a;this.fonts=this.fonts||{};var b={w:a.w,face:{},glyphs:{}},c=a.face["font-family"];for(var d in a.face)if(a.face[z](d))b.face[d]=a.face[d];if(this.fonts[c])this.fonts[c][F](b);else this.fonts[c]=[b];if(!a.svg){b.face["units-per-em"]=ha(a.face["units-per-em"],10);for(var f in a.glyphs)if(a.glyphs[z](f)){c=a.glyphs[f];b.glyphs[f]={w:c.w,k:{},d:c.d&&"M"+
c.d[I](/[mlcxtrv]/g,function(g){return{l:"L",c:"C",x:"z",t:"m",r:"l",v:"c"}[g]||"M"})+"z"};if(c.k)for(var e in c.k)if(c[z](e))b.glyphs[f].k[e]=c.k[e]}}return a};H[p].getFont=function(a,b,c,d){d=d||"normal";c=c||"normal";b=+b||{normal:400,bold:700,lighter:300,bolder:800}[b]||400;if(l.fonts){var f=l.fonts[a];if(!f){a=new RegExp("(^|\\s)"+a[I](/[^\w\d\s+!~.:_-]/g,A)+"(\\s|$)","i");for(var e in l.fonts)if(l.fonts[z](e))if(a.test(e)){f=l.fonts[e];break}}var g;if(f){e=0;for(a=f[o];e<a;e++){g=f[e];if(g.face["font-weight"]==
b&&(g.face["font-style"]==c||!g.face["font-style"])&&g.face["font-stretch"]==d)break}}return g}};H[p].print=function(a,b,c,d,f,e){e=e||"middle";var g=this.set(),h=D(c)[G](A),i=0;l.is(d,c)&&(d=this.getFont(d));if(d){c=(f||16)/d.face["units-per-em"];var j=d.face.bbox.split(V);f=+j[0];e=+j[1]+(e=="baseline"?j[3]-j[1]+ +d.face.descent:(j[3]-j[1])/2);j=0;for(var m=h[o];j<m;j++){var n=j&&d.glyphs[h[j-1]]||{},r=d.glyphs[h[j]];i+=j?(n.w||d.w)+(n.k&&n.k[h[j]]||0):0;r&&r.d&&g[F](this.path(r.d).attr({fill:"#000",
stroke:"none",translation:[i,0]}))}g.scale(c,c,f,e).translate(a-f,b-e)}return g};var Ob=/\{(\d+)\}/g;l.format=function(a,b){var c=l.is(b,U)?[0][M](b):arguments;a&&l.is(a,ga)&&c[o]-1&&(a=a[I](Ob,function(d,f){return c[++f]==null?A:c[f]}));return a||A};l.ninja=function(){Qa.was?(Raphael=Qa.is):delete Raphael;return l};l.el=s[p];return l}();

},{}],5:[function(require,module,exports){
/**
 * apMessageBox - apMessageBox is a JavaScript object designed to create quick,
 * easy popup messages in your JavaScript applications.
 *
 * http://www.adampresley.com
 *
 * This file is part of apMessageBox
 *
 * apMessageBox is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * apMessageBox is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with apMessageBox.  If not, see <http://www.gnu.org/licenses/>.
 *
 * @author Adam Presley
 * @copyright Copyright (c) 2010 Adam Presley
 * @param {Object} config
 */
var apMessageBox = apMessageBox || {};
(function($) {

	/**
	 * Basic messagebox functionality. Note that this code relies
	 * on jQuery 1.4 and jQuery UI 1.8. A config object tells this object
	 * how to behave. The config object takes the following arguments:
	 * 	* dialogEl - The name of the dialog <div>. Defaults to "messageDialog"
	 * 	* messageEl - The name of the message <p>. Defaults to "message"
	 * 	* errorImage - Path to an error image icon
	 *  	* informationImage - Path to an information image icon
	 * 	* messageType - Type of message being displayed. Valid values are
	 * 						 "error" and "information"
	 * 	* title - Dialog box title. Defaults to "Notice!"
	 * 	* width - Width of the dialog
	 * 	* height - Height of the dialog
	 * 	* message - The message to display
	 * 	* callback - A method to be executed once the dialog is closed
	 * 	* scope - The scope in which to call the callback method
	 *
	 * @author Adam Presley
	 * @class
	 */
	apMessageBox = function(config)
	{
		/**
		 * Initializes the message box. This uses jQuery UI to do the
		 * dialog box. When the box is closed the added DOM elements
		 * are detached from the DOM.
		 * @author Adam Presley
		 */
		this.initialize = function()
		{
			/*
			 * Call our DOM building method and pass a method to be executed
			 * once the DOM is built. This method will setup the jQuery UI
			 * dialog.
			 */
			__buildDOM(function() {

				$("#" + __config.messageEl).html(__config.message);

				$("#" + __config.dialogEl).dialog({
					modal: true,
					width: __config.width,
					height: __config.height,
					resizable: false,
					close: function(e, ui) {
						$("#" + __config.dialogEl).detach();

						/*
						 * Execute any defined callback.
						 */
						if (__config.callback !== null && __config.callback !== undefined)
						{
							if (__config.scope !== null && __config.scope !== undefined)
							{
								__config.callback.call(__config.scope);
							}
							else
							{
								__config.callback();
							}
						}
					},
					buttons: __config.buttons
				}).css("z-index","100");

			});
		};

		var __buildDOM = function(callback)
		{
			/*
			 * Outer message containing div and message <p>
			 */
			var outer = $("<div />");
			var pEl = $("<p />").attr({
				id: __config.messageEl
			}).css({ "text-align": "left" });
			var img = null;

			/*
			 * If this is an error message attach an error icon.
			 * Otherwise attach an information icon.
			 */
			if (__config.messageType == "error")
			{
				img = $("<img />").attr({
					src: __config.errorImage
				}).css({ "float": "left", "margin-right": "10px" });

				$(outer).append(img);
			}
			else
			{
				img = $("<img />").attr({
					src: __config.informationImage
				}).css({ "float": "left", "margin-right": "10px" });

				$(outer).append(img);
			}

			/*
			 * Append the <p> to the <div>
			 */
			$(outer).append(pEl);

			/*
			 * Build the dialog <div>. Attach the message and icon <div>
			 * to it, then attach the dialog <div> to the body.
			 */
			var dialogEl = $("<div />").attr({
				id: __config.dialogEl,
				title: __config.title
			}).css({
				display: "none"
			});

			$(dialogEl).append(outer);
			$("body").append(dialogEl);

			/*
			 * When all is ready execute our callback which
			 * uses jQuery UI to do the dialog box.
			 */
			$(document).ready(callback);
		};

		var __config = $.extend({
			dialogEl: "messageDialog",
			messageEl: "message",
			errorImage: apMessageBox.errorImage || "error.png",
			informationImage: apMessageBox.informationImage || "information.png",
			messageType: "information",
			title: "Notice!",
			width: 350,
			height: 200,
			message: "",
			callback: null,
			scope: null,
			buttons: {                          // NB: if you write your own buttons, add '$(this).dialog("close");' to the functions.
				Ok: function() {
					$(this).dialog("close");
				}
			}
		}, config);
		var __this = this;

		this.initialize();
	};

	apMessageBox.show = function(config)
	{
		var msg = new apMessageBox(config || {});
	};

	apMessageBox.error = function(config)
	{
		var newConfig = $.extend({
			messageType: "error",
			title: "Error!"
		}, config);

		apMessageBox.show(newConfig);
	};

	apMessageBox.information = function(config)
	{
		var newConfig = $.extend({
			messageType: "information",
			title: "Notice!"
		}, config);

		apMessageBox.show(newConfig);
	};


	window.apMessageBox = apMessageBox;


})(jQuery);

},{}],6:[function(require,module,exports){
/*! jQuery UI - v1.8.24 - 2012-09-28
* https://github.com/jquery/jquery-ui
* Includes: jquery.ui.core.js
* Copyright (c) 2012 AUTHORS.txt; Licensed MIT, GPL */
(function(a,b){function c(b,c){var e=b.nodeName.toLowerCase();if("area"===e){var f=b.parentNode,g=f.name,h;return!b.href||!g||f.nodeName.toLowerCase()!=="map"?!1:(h=a("img[usemap=#"+g+"]")[0],!!h&&d(h))}return(/input|select|textarea|button|object/.test(e)?!b.disabled:"a"==e?b.href||c:c)&&d(b)}function d(b){return!a(b).parents().andSelf().filter(function(){return a.curCSS(this,"visibility")==="hidden"||a.expr.filters.hidden(this)}).length}a.ui=a.ui||{};if(a.ui.version)return;a.extend(a.ui,{version:"1.8.24",keyCode:{ALT:18,BACKSPACE:8,CAPS_LOCK:20,COMMA:188,COMMAND:91,COMMAND_LEFT:91,COMMAND_RIGHT:93,CONTROL:17,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,INSERT:45,LEFT:37,MENU:93,NUMPAD_ADD:107,NUMPAD_DECIMAL:110,NUMPAD_DIVIDE:111,NUMPAD_ENTER:108,NUMPAD_MULTIPLY:106,NUMPAD_SUBTRACT:109,PAGE_DOWN:34,PAGE_UP:33,PERIOD:190,RIGHT:39,SHIFT:16,SPACE:32,TAB:9,UP:38,WINDOWS:91}}),a.fn.extend({propAttr:a.fn.prop||a.fn.attr,_focus:a.fn.focus,focus:function(b,c){return typeof b=="number"?this.each(function(){var d=this;setTimeout(function(){a(d).focus(),c&&c.call(d)},b)}):this._focus.apply(this,arguments)},scrollParent:function(){var b;return a.browser.msie&&/(static|relative)/.test(this.css("position"))||/absolute/.test(this.css("position"))?b=this.parents().filter(function(){return/(relative|absolute|fixed)/.test(a.curCSS(this,"position",1))&&/(auto|scroll)/.test(a.curCSS(this,"overflow",1)+a.curCSS(this,"overflow-y",1)+a.curCSS(this,"overflow-x",1))}).eq(0):b=this.parents().filter(function(){return/(auto|scroll)/.test(a.curCSS(this,"overflow",1)+a.curCSS(this,"overflow-y",1)+a.curCSS(this,"overflow-x",1))}).eq(0),/fixed/.test(this.css("position"))||!b.length?a(document):b},zIndex:function(c){if(c!==b)return this.css("zIndex",c);if(this.length){var d=a(this[0]),e,f;while(d.length&&d[0]!==document){e=d.css("position");if(e==="absolute"||e==="relative"||e==="fixed"){f=parseInt(d.css("zIndex"),10);if(!isNaN(f)&&f!==0)return f}d=d.parent()}}return 0},disableSelection:function(){return this.bind((a.support.selectstart?"selectstart":"mousedown")+".ui-disableSelection",function(a){a.preventDefault()})},enableSelection:function(){return this.unbind(".ui-disableSelection")}}),a("<a>").outerWidth(1).jquery||a.each(["Width","Height"],function(c,d){function h(b,c,d,f){return a.each(e,function(){c-=parseFloat(a.curCSS(b,"padding"+this,!0))||0,d&&(c-=parseFloat(a.curCSS(b,"border"+this+"Width",!0))||0),f&&(c-=parseFloat(a.curCSS(b,"margin"+this,!0))||0)}),c}var e=d==="Width"?["Left","Right"]:["Top","Bottom"],f=d.toLowerCase(),g={innerWidth:a.fn.innerWidth,innerHeight:a.fn.innerHeight,outerWidth:a.fn.outerWidth,outerHeight:a.fn.outerHeight};a.fn["inner"+d]=function(c){return c===b?g["inner"+d].call(this):this.each(function(){a(this).css(f,h(this,c)+"px")})},a.fn["outer"+d]=function(b,c){return typeof b!="number"?g["outer"+d].call(this,b):this.each(function(){a(this).css(f,h(this,b,!0,c)+"px")})}}),a.extend(a.expr[":"],{data:a.expr.createPseudo?a.expr.createPseudo(function(b){return function(c){return!!a.data(c,b)}}):function(b,c,d){return!!a.data(b,d[3])},focusable:function(b){return c(b,!isNaN(a.attr(b,"tabindex")))},tabbable:function(b){var d=a.attr(b,"tabindex"),e=isNaN(d);return(e||d>=0)&&c(b,!e)}}),a(function(){var b=document.body,c=b.appendChild(c=document.createElement("div"));c.offsetHeight,a.extend(c.style,{minHeight:"100px",height:"auto",padding:0,borderWidth:0}),a.support.minHeight=c.offsetHeight===100,a.support.selectstart="onselectstart"in c,b.removeChild(c).style.display="none"}),a.curCSS||(a.curCSS=a.css),a.extend(a.ui,{plugin:{add:function(b,c,d){var e=a.ui[b].prototype;for(var f in d)e.plugins[f]=e.plugins[f]||[],e.plugins[f].push([c,d[f]])},call:function(a,b,c){var d=a.plugins[b];if(!d||!a.element[0].parentNode)return;for(var e=0;e<d.length;e++)a.options[d[e][0]]&&d[e][1].apply(a.element,c)}},contains:function(a,b){return document.compareDocumentPosition?a.compareDocumentPosition(b)&16:a!==b&&a.contains(b)},hasScroll:function(b,c){if(a(b).css("overflow")==="hidden")return!1;var d=c&&c==="left"?"scrollLeft":"scrollTop",e=!1;return b[d]>0?!0:(b[d]=1,e=b[d]>0,b[d]=0,e)},isOverAxis:function(a,b,c){return a>b&&a<b+c},isOver:function(b,c,d,e,f,g){return a.ui.isOverAxis(b,d,f)&&a.ui.isOverAxis(c,e,g)}})})(jQuery);;/*! jQuery UI - v1.8.24 - 2012-09-28
* https://github.com/jquery/jquery-ui
* Includes: jquery.ui.widget.js
* Copyright (c) 2012 AUTHORS.txt; Licensed MIT, GPL */
(function(a,b){if(a.cleanData){var c=a.cleanData;a.cleanData=function(b){for(var d=0,e;(e=b[d])!=null;d++)try{a(e).triggerHandler("remove")}catch(f){}c(b)}}else{var d=a.fn.remove;a.fn.remove=function(b,c){return this.each(function(){return c||(!b||a.filter(b,[this]).length)&&a("*",this).add([this]).each(function(){try{a(this).triggerHandler("remove")}catch(b){}}),d.call(a(this),b,c)})}}a.widget=function(b,c,d){var e=b.split(".")[0],f;b=b.split(".")[1],f=e+"-"+b,d||(d=c,c=a.Widget),a.expr[":"][f]=function(c){return!!a.data(c,b)},a[e]=a[e]||{},a[e][b]=function(a,b){arguments.length&&this._createWidget(a,b)};var g=new c;g.options=a.extend(!0,{},g.options),a[e][b].prototype=a.extend(!0,g,{namespace:e,widgetName:b,widgetEventPrefix:a[e][b].prototype.widgetEventPrefix||b,widgetBaseClass:f},d),a.widget.bridge(b,a[e][b])},a.widget.bridge=function(c,d){a.fn[c]=function(e){var f=typeof e=="string",g=Array.prototype.slice.call(arguments,1),h=this;return e=!f&&g.length?a.extend.apply(null,[!0,e].concat(g)):e,f&&e.charAt(0)==="_"?h:(f?this.each(function(){var d=a.data(this,c),f=d&&a.isFunction(d[e])?d[e].apply(d,g):d;if(f!==d&&f!==b)return h=f,!1}):this.each(function(){var b=a.data(this,c);b?b.option(e||{})._init():a.data(this,c,new d(e,this))}),h)}},a.Widget=function(a,b){arguments.length&&this._createWidget(a,b)},a.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",options:{disabled:!1},_createWidget:function(b,c){a.data(c,this.widgetName,this),this.element=a(c),this.options=a.extend(!0,{},this.options,this._getCreateOptions(),b);var d=this;this.element.bind("remove."+this.widgetName,function(){d.destroy()}),this._create(),this._trigger("create"),this._init()},_getCreateOptions:function(){return a.metadata&&a.metadata.get(this.element[0])[this.widgetName]},_create:function(){},_init:function(){},destroy:function(){this.element.unbind("."+this.widgetName).removeData(this.widgetName),this.widget().unbind("."+this.widgetName).removeAttr("aria-disabled").removeClass(this.widgetBaseClass+"-disabled "+"ui-state-disabled")},widget:function(){return this.element},option:function(c,d){var e=c;if(arguments.length===0)return a.extend({},this.options);if(typeof c=="string"){if(d===b)return this.options[c];e={},e[c]=d}return this._setOptions(e),this},_setOptions:function(b){var c=this;return a.each(b,function(a,b){c._setOption(a,b)}),this},_setOption:function(a,b){return this.options[a]=b,a==="disabled"&&this.widget()[b?"addClass":"removeClass"](this.widgetBaseClass+"-disabled"+" "+"ui-state-disabled").attr("aria-disabled",b),this},enable:function(){return this._setOption("disabled",!1)},disable:function(){return this._setOption("disabled",!0)},_trigger:function(b,c,d){var e,f,g=this.options[b];d=d||{},c=a.Event(c),c.type=(b===this.widgetEventPrefix?b:this.widgetEventPrefix+b).toLowerCase(),c.target=this.element[0],f=c.originalEvent;if(f)for(e in f)e in c||(c[e]=f[e]);return this.element.trigger(c,d),!(a.isFunction(g)&&g.call(this.element[0],c,d)===!1||c.isDefaultPrevented())}}})(jQuery);;/*! jQuery UI - v1.8.24 - 2012-09-28
* https://github.com/jquery/jquery-ui
* Includes: jquery.ui.mouse.js
* Copyright (c) 2012 AUTHORS.txt; Licensed MIT, GPL */
(function(a,b){var c=!1;a(document).mouseup(function(a){c=!1}),a.widget("ui.mouse",{options:{cancel:":input,option",distance:1,delay:0},_mouseInit:function(){var b=this;this.element.bind("mousedown."+this.widgetName,function(a){return b._mouseDown(a)}).bind("click."+this.widgetName,function(c){if(!0===a.data(c.target,b.widgetName+".preventClickEvent"))return a.removeData(c.target,b.widgetName+".preventClickEvent"),c.stopImmediatePropagation(),!1}),this.started=!1},_mouseDestroy:function(){this.element.unbind("."+this.widgetName),this._mouseMoveDelegate&&a(document).unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate)},_mouseDown:function(b){if(c)return;this._mouseStarted&&this._mouseUp(b),this._mouseDownEvent=b;var d=this,e=b.which==1,f=typeof this.options.cancel=="string"&&b.target.nodeName?a(b.target).closest(this.options.cancel).length:!1;if(!e||f||!this._mouseCapture(b))return!0;this.mouseDelayMet=!this.options.delay,this.mouseDelayMet||(this._mouseDelayTimer=setTimeout(function(){d.mouseDelayMet=!0},this.options.delay));if(this._mouseDistanceMet(b)&&this._mouseDelayMet(b)){this._mouseStarted=this._mouseStart(b)!==!1;if(!this._mouseStarted)return b.preventDefault(),!0}return!0===a.data(b.target,this.widgetName+".preventClickEvent")&&a.removeData(b.target,this.widgetName+".preventClickEvent"),this._mouseMoveDelegate=function(a){return d._mouseMove(a)},this._mouseUpDelegate=function(a){return d._mouseUp(a)},a(document).bind("mousemove."+this.widgetName,this._mouseMoveDelegate).bind("mouseup."+this.widgetName,this._mouseUpDelegate),b.preventDefault(),c=!0,!0},_mouseMove:function(b){return!a.browser.msie||document.documentMode>=9||!!b.button?this._mouseStarted?(this._mouseDrag(b),b.preventDefault()):(this._mouseDistanceMet(b)&&this._mouseDelayMet(b)&&(this._mouseStarted=this._mouseStart(this._mouseDownEvent,b)!==!1,this._mouseStarted?this._mouseDrag(b):this._mouseUp(b)),!this._mouseStarted):this._mouseUp(b)},_mouseUp:function(b){return a(document).unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate),this._mouseStarted&&(this._mouseStarted=!1,b.target==this._mouseDownEvent.target&&a.data(b.target,this.widgetName+".preventClickEvent",!0),this._mouseStop(b)),!1},_mouseDistanceMet:function(a){return Math.max(Math.abs(this._mouseDownEvent.pageX-a.pageX),Math.abs(this._mouseDownEvent.pageY-a.pageY))>=this.options.distance},_mouseDelayMet:function(a){return this.mouseDelayMet},_mouseStart:function(a){},_mouseDrag:function(a){},_mouseStop:function(a){},_mouseCapture:function(a){return!0}})})(jQuery);;/*! jQuery UI - v1.8.24 - 2012-09-28
* https://github.com/jquery/jquery-ui
* Includes: jquery.ui.position.js
* Copyright (c) 2012 AUTHORS.txt; Licensed MIT, GPL */
(function(a,b){a.ui=a.ui||{};var c=/left|center|right/,d=/top|center|bottom/,e="center",f={},g=a.fn.position,h=a.fn.offset;a.fn.position=function(b){if(!b||!b.of)return g.apply(this,arguments);b=a.extend({},b);var h=a(b.of),i=h[0],j=(b.collision||"flip").split(" "),k=b.offset?b.offset.split(" "):[0,0],l,m,n;return i.nodeType===9?(l=h.width(),m=h.height(),n={top:0,left:0}):i.setTimeout?(l=h.width(),m=h.height(),n={top:h.scrollTop(),left:h.scrollLeft()}):i.preventDefault?(b.at="left top",l=m=0,n={top:b.of.pageY,left:b.of.pageX}):(l=h.outerWidth(),m=h.outerHeight(),n=h.offset()),a.each(["my","at"],function(){var a=(b[this]||"").split(" ");a.length===1&&(a=c.test(a[0])?a.concat([e]):d.test(a[0])?[e].concat(a):[e,e]),a[0]=c.test(a[0])?a[0]:e,a[1]=d.test(a[1])?a[1]:e,b[this]=a}),j.length===1&&(j[1]=j[0]),k[0]=parseInt(k[0],10)||0,k.length===1&&(k[1]=k[0]),k[1]=parseInt(k[1],10)||0,b.at[0]==="right"?n.left+=l:b.at[0]===e&&(n.left+=l/2),b.at[1]==="bottom"?n.top+=m:b.at[1]===e&&(n.top+=m/2),n.left+=k[0],n.top+=k[1],this.each(function(){var c=a(this),d=c.outerWidth(),g=c.outerHeight(),h=parseInt(a.curCSS(this,"marginLeft",!0))||0,i=parseInt(a.curCSS(this,"marginTop",!0))||0,o=d+h+(parseInt(a.curCSS(this,"marginRight",!0))||0),p=g+i+(parseInt(a.curCSS(this,"marginBottom",!0))||0),q=a.extend({},n),r;b.my[0]==="right"?q.left-=d:b.my[0]===e&&(q.left-=d/2),b.my[1]==="bottom"?q.top-=g:b.my[1]===e&&(q.top-=g/2),f.fractions||(q.left=Math.round(q.left),q.top=Math.round(q.top)),r={left:q.left-h,top:q.top-i},a.each(["left","top"],function(c,e){a.ui.position[j[c]]&&a.ui.position[j[c]][e](q,{targetWidth:l,targetHeight:m,elemWidth:d,elemHeight:g,collisionPosition:r,collisionWidth:o,collisionHeight:p,offset:k,my:b.my,at:b.at})}),a.fn.bgiframe&&c.bgiframe(),c.offset(a.extend(q,{using:b.using}))})},a.ui.position={fit:{left:function(b,c){var d=a(window),e=c.collisionPosition.left+c.collisionWidth-d.width()-d.scrollLeft();b.left=e>0?b.left-e:Math.max(b.left-c.collisionPosition.left,b.left)},top:function(b,c){var d=a(window),e=c.collisionPosition.top+c.collisionHeight-d.height()-d.scrollTop();b.top=e>0?b.top-e:Math.max(b.top-c.collisionPosition.top,b.top)}},flip:{left:function(b,c){if(c.at[0]===e)return;var d=a(window),f=c.collisionPosition.left+c.collisionWidth-d.width()-d.scrollLeft(),g=c.my[0]==="left"?-c.elemWidth:c.my[0]==="right"?c.elemWidth:0,h=c.at[0]==="left"?c.targetWidth:-c.targetWidth,i=-2*c.offset[0];b.left+=c.collisionPosition.left<0?g+h+i:f>0?g+h+i:0},top:function(b,c){if(c.at[1]===e)return;var d=a(window),f=c.collisionPosition.top+c.collisionHeight-d.height()-d.scrollTop(),g=c.my[1]==="top"?-c.elemHeight:c.my[1]==="bottom"?c.elemHeight:0,h=c.at[1]==="top"?c.targetHeight:-c.targetHeight,i=-2*c.offset[1];b.top+=c.collisionPosition.top<0?g+h+i:f>0?g+h+i:0}}},a.offset.setOffset||(a.offset.setOffset=function(b,c){/static/.test(a.curCSS(b,"position"))&&(b.style.position="relative");var d=a(b),e=d.offset(),f=parseInt(a.curCSS(b,"top",!0),10)||0,g=parseInt(a.curCSS(b,"left",!0),10)||0,h={top:c.top-e.top+f,left:c.left-e.left+g};"using"in c?c.using.call(b,h):d.css(h)},a.fn.offset=function(b){var c=this[0];return!c||!c.ownerDocument?null:b?a.isFunction(b)?this.each(function(c){a(this).offset(b.call(this,c,a(this).offset()))}):this.each(function(){a.offset.setOffset(this,b)}):h.call(this)}),a.curCSS||(a.curCSS=a.css),function(){var b=document.getElementsByTagName("body")[0],c=document.createElement("div"),d,e,g,h,i;d=document.createElement(b?"div":"body"),g={visibility:"hidden",width:0,height:0,border:0,margin:0,background:"none"},b&&a.extend(g,{position:"absolute",left:"-1000px",top:"-1000px"});for(var j in g)d.style[j]=g[j];d.appendChild(c),e=b||document.documentElement,e.insertBefore(d,e.firstChild),c.style.cssText="position: absolute; left: 10.7432222px; top: 10.432325px; height: 30px; width: 201px;",h=a(c).offset(function(a,b){return b}).offset(),d.innerHTML="",e.removeChild(d),i=h.top+h.left+(b?2e3:0),f.fractions=i>21&&i<22}()})(jQuery);;/*! jQuery UI - v1.8.24 - 2012-09-28
* https://github.com/jquery/jquery-ui
* Includes: jquery.ui.draggable.js
* Copyright (c) 2012 AUTHORS.txt; Licensed MIT, GPL */
(function(a,b){a.widget("ui.draggable",a.ui.mouse,{widgetEventPrefix:"drag",options:{addClasses:!0,appendTo:"parent",axis:!1,connectToSortable:!1,containment:!1,cursor:"auto",cursorAt:!1,grid:!1,handle:!1,helper:"original",iframeFix:!1,opacity:!1,refreshPositions:!1,revert:!1,revertDuration:500,scope:"default",scroll:!0,scrollSensitivity:20,scrollSpeed:20,snap:!1,snapMode:"both",snapTolerance:20,stack:!1,zIndex:!1},_create:function(){this.options.helper=="original"&&!/^(?:r|a|f)/.test(this.element.css("position"))&&(this.element[0].style.position="relative"),this.options.addClasses&&this.element.addClass("ui-draggable"),this.options.disabled&&this.element.addClass("ui-draggable-disabled"),this._mouseInit()},destroy:function(){if(!this.element.data("draggable"))return;return this.element.removeData("draggable").unbind(".draggable").removeClass("ui-draggable ui-draggable-dragging ui-draggable-disabled"),this._mouseDestroy(),this},_mouseCapture:function(b){var c=this.options;return this.helper||c.disabled||a(b.target).is(".ui-resizable-handle")?!1:(this.handle=this._getHandle(b),this.handle?(c.iframeFix&&a(c.iframeFix===!0?"iframe":c.iframeFix).each(function(){a('<div class="ui-draggable-iframeFix" style="background: #fff;"></div>').css({width:this.offsetWidth+"px",height:this.offsetHeight+"px",position:"absolute",opacity:"0.001",zIndex:1e3}).css(a(this).offset()).appendTo("body")}),!0):!1)},_mouseStart:function(b){var c=this.options;return this.helper=this._createHelper(b),this.helper.addClass("ui-draggable-dragging"),this._cacheHelperProportions(),a.ui.ddmanager&&(a.ui.ddmanager.current=this),this._cacheMargins(),this.cssPosition=this.helper.css("position"),this.scrollParent=this.helper.scrollParent(),this.offset=this.positionAbs=this.element.offset(),this.offset={top:this.offset.top-this.margins.top,left:this.offset.left-this.margins.left},a.extend(this.offset,{click:{left:b.pageX-this.offset.left,top:b.pageY-this.offset.top},parent:this._getParentOffset(),relative:this._getRelativeOffset()}),this.originalPosition=this.position=this._generatePosition(b),this.originalPageX=b.pageX,this.originalPageY=b.pageY,c.cursorAt&&this._adjustOffsetFromHelper(c.cursorAt),c.containment&&this._setContainment(),this._trigger("start",b)===!1?(this._clear(),!1):(this._cacheHelperProportions(),a.ui.ddmanager&&!c.dropBehaviour&&a.ui.ddmanager.prepareOffsets(this,b),this._mouseDrag(b,!0),a.ui.ddmanager&&a.ui.ddmanager.dragStart(this,b),!0)},_mouseDrag:function(b,c){this.position=this._generatePosition(b),this.positionAbs=this._convertPositionTo("absolute");if(!c){var d=this._uiHash();if(this._trigger("drag",b,d)===!1)return this._mouseUp({}),!1;this.position=d.position}if(!this.options.axis||this.options.axis!="y")this.helper[0].style.left=this.position.left+"px";if(!this.options.axis||this.options.axis!="x")this.helper[0].style.top=this.position.top+"px";return a.ui.ddmanager&&a.ui.ddmanager.drag(this,b),!1},_mouseStop:function(b){var c=!1;a.ui.ddmanager&&!this.options.dropBehaviour&&(c=a.ui.ddmanager.drop(this,b)),this.dropped&&(c=this.dropped,this.dropped=!1);var d=this.element[0],e=!1;while(d&&(d=d.parentNode))d==document&&(e=!0);if(!e&&this.options.helper==="original")return!1;if(this.options.revert=="invalid"&&!c||this.options.revert=="valid"&&c||this.options.revert===!0||a.isFunction(this.options.revert)&&this.options.revert.call(this.element,c)){var f=this;a(this.helper).animate(this.originalPosition,parseInt(this.options.revertDuration,10),function(){f._trigger("stop",b)!==!1&&f._clear()})}else this._trigger("stop",b)!==!1&&this._clear();return!1},_mouseUp:function(b){return a("div.ui-draggable-iframeFix").each(function(){this.parentNode.removeChild(this)}),a.ui.ddmanager&&a.ui.ddmanager.dragStop(this,b),a.ui.mouse.prototype._mouseUp.call(this,b)},cancel:function(){return this.helper.is(".ui-draggable-dragging")?this._mouseUp({}):this._clear(),this},_getHandle:function(b){var c=!this.options.handle||!a(this.options.handle,this.element).length?!0:!1;return a(this.options.handle,this.element).find("*").andSelf().each(function(){this==b.target&&(c=!0)}),c},_createHelper:function(b){var c=this.options,d=a.isFunction(c.helper)?a(c.helper.apply(this.element[0],[b])):c.helper=="clone"?this.element.clone().removeAttr("id"):this.element;return d.parents("body").length||d.appendTo(c.appendTo=="parent"?this.element[0].parentNode:c.appendTo),d[0]!=this.element[0]&&!/(fixed|absolute)/.test(d.css("position"))&&d.css("position","absolute"),d},_adjustOffsetFromHelper:function(b){typeof b=="string"&&(b=b.split(" ")),a.isArray(b)&&(b={left:+b[0],top:+b[1]||0}),"left"in b&&(this.offset.click.left=b.left+this.margins.left),"right"in b&&(this.offset.click.left=this.helperProportions.width-b.right+this.margins.left),"top"in b&&(this.offset.click.top=b.top+this.margins.top),"bottom"in b&&(this.offset.click.top=this.helperProportions.height-b.bottom+this.margins.top)},_getParentOffset:function(){this.offsetParent=this.helper.offsetParent();var b=this.offsetParent.offset();this.cssPosition=="absolute"&&this.scrollParent[0]!=document&&a.ui.contains(this.scrollParent[0],this.offsetParent[0])&&(b.left+=this.scrollParent.scrollLeft(),b.top+=this.scrollParent.scrollTop());if(this.offsetParent[0]==document.body||this.offsetParent[0].tagName&&this.offsetParent[0].tagName.toLowerCase()=="html"&&a.browser.msie)b={top:0,left:0};return{top:b.top+(parseInt(this.offsetParent.css("borderTopWidth"),10)||0),left:b.left+(parseInt(this.offsetParent.css("borderLeftWidth"),10)||0)}},_getRelativeOffset:function(){if(this.cssPosition=="relative"){var a=this.element.position();return{top:a.top-(parseInt(this.helper.css("top"),10)||0)+this.scrollParent.scrollTop(),left:a.left-(parseInt(this.helper.css("left"),10)||0)+this.scrollParent.scrollLeft()}}return{top:0,left:0}},_cacheMargins:function(){this.margins={left:parseInt(this.element.css("marginLeft"),10)||0,top:parseInt(this.element.css("marginTop"),10)||0,right:parseInt(this.element.css("marginRight"),10)||0,bottom:parseInt(this.element.css("marginBottom"),10)||0}},_cacheHelperProportions:function(){this.helperProportions={width:this.helper.outerWidth(),height:this.helper.outerHeight()}},_setContainment:function(){var b=this.options;b.containment=="parent"&&(b.containment=this.helper[0].parentNode);if(b.containment=="document"||b.containment=="window")this.containment=[b.containment=="document"?0:a(window).scrollLeft()-this.offset.relative.left-this.offset.parent.left,b.containment=="document"?0:a(window).scrollTop()-this.offset.relative.top-this.offset.parent.top,(b.containment=="document"?0:a(window).scrollLeft())+a(b.containment=="document"?document:window).width()-this.helperProportions.width-this.margins.left,(b.containment=="document"?0:a(window).scrollTop())+(a(b.containment=="document"?document:window).height()||document.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top];if(!/^(document|window|parent)$/.test(b.containment)&&b.containment.constructor!=Array){var c=a(b.containment),d=c[0];if(!d)return;var e=c.offset(),f=a(d).css("overflow")!="hidden";this.containment=[(parseInt(a(d).css("borderLeftWidth"),10)||0)+(parseInt(a(d).css("paddingLeft"),10)||0),(parseInt(a(d).css("borderTopWidth"),10)||0)+(parseInt(a(d).css("paddingTop"),10)||0),(f?Math.max(d.scrollWidth,d.offsetWidth):d.offsetWidth)-(parseInt(a(d).css("borderLeftWidth"),10)||0)-(parseInt(a(d).css("paddingRight"),10)||0)-this.helperProportions.width-this.margins.left-this.margins.right,(f?Math.max(d.scrollHeight,d.offsetHeight):d.offsetHeight)-(parseInt(a(d).css("borderTopWidth"),10)||0)-(parseInt(a(d).css("paddingBottom"),10)||0)-this.helperProportions.height-this.margins.top-this.margins.bottom],this.relative_container=c}else b.containment.constructor==Array&&(this.containment=b.containment)},_convertPositionTo:function(b,c){c||(c=this.position);var d=b=="absolute"?1:-1,e=this.options,f=this.cssPosition=="absolute"&&(this.scrollParent[0]==document||!a.ui.contains(this.scrollParent[0],this.offsetParent[0]))?this.offsetParent:this.scrollParent,g=/(html|body)/i.test(f[0].tagName);return{top:c.top+this.offset.relative.top*d+this.offset.parent.top*d-(a.browser.safari&&a.browser.version<526&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollTop():g?0:f.scrollTop())*d),left:c.left+this.offset.relative.left*d+this.offset.parent.left*d-(a.browser.safari&&a.browser.version<526&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():g?0:f.scrollLeft())*d)}},_generatePosition:function(b){var c=this.options,d=this.cssPosition=="absolute"&&(this.scrollParent[0]==document||!a.ui.contains(this.scrollParent[0],this.offsetParent[0]))?this.offsetParent:this.scrollParent,e=/(html|body)/i.test(d[0].tagName),f=b.pageX,g=b.pageY;if(this.originalPosition){var h;if(this.containment){if(this.relative_container){var i=this.relative_container.offset();h=[this.containment[0]+i.left,this.containment[1]+i.top,this.containment[2]+i.left,this.containment[3]+i.top]}else h=this.containment;b.pageX-this.offset.click.left<h[0]&&(f=h[0]+this.offset.click.left),b.pageY-this.offset.click.top<h[1]&&(g=h[1]+this.offset.click.top),b.pageX-this.offset.click.left>h[2]&&(f=h[2]+this.offset.click.left),b.pageY-this.offset.click.top>h[3]&&(g=h[3]+this.offset.click.top)}if(c.grid){var j=c.grid[1]?this.originalPageY+Math.round((g-this.originalPageY)/c.grid[1])*c.grid[1]:this.originalPageY;g=h?j-this.offset.click.top<h[1]||j-this.offset.click.top>h[3]?j-this.offset.click.top<h[1]?j+c.grid[1]:j-c.grid[1]:j:j;var k=c.grid[0]?this.originalPageX+Math.round((f-this.originalPageX)/c.grid[0])*c.grid[0]:this.originalPageX;f=h?k-this.offset.click.left<h[0]||k-this.offset.click.left>h[2]?k-this.offset.click.left<h[0]?k+c.grid[0]:k-c.grid[0]:k:k}}return{top:g-this.offset.click.top-this.offset.relative.top-this.offset.parent.top+(a.browser.safari&&a.browser.version<526&&this.cssPosition=="fixed"?0:this.cssPosition=="fixed"?-this.scrollParent.scrollTop():e?0:d.scrollTop()),left:f-this.offset.click.left-this.offset.relative.left-this.offset.parent.left+(a.browser.safari&&a.browser.version<526&&this.cssPosition=="fixed"?0:this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():e?0:d.scrollLeft())}},_clear:function(){this.helper.removeClass("ui-draggable-dragging"),this.helper[0]!=this.element[0]&&!this.cancelHelperRemoval&&this.helper.remove(),this.helper=null,this.cancelHelperRemoval=!1},_trigger:function(b,c,d){return d=d||this._uiHash(),a.ui.plugin.call(this,b,[c,d]),b=="drag"&&(this.positionAbs=this._convertPositionTo("absolute")),a.Widget.prototype._trigger.call(this,b,c,d)},plugins:{},_uiHash:function(a){return{helper:this.helper,position:this.position,originalPosition:this.originalPosition,offset:this.positionAbs}}}),a.extend(a.ui.draggable,{version:"1.8.24"}),a.ui.plugin.add("draggable","connectToSortable",{start:function(b,c){var d=a(this).data("draggable"),e=d.options,f=a.extend({},c,{item:d.element});d.sortables=[],a(e.connectToSortable).each(function(){var c=a.data(this,"sortable");c&&!c.options.disabled&&(d.sortables.push({instance:c,shouldRevert:c.options.revert}),c.refreshPositions(),c._trigger("activate",b,f))})},stop:function(b,c){var d=a(this).data("draggable"),e=a.extend({},c,{item:d.element});a.each(d.sortables,function(){this.instance.isOver?(this.instance.isOver=0,d.cancelHelperRemoval=!0,this.instance.cancelHelperRemoval=!1,this.shouldRevert&&(this.instance.options.revert=!0),this.instance._mouseStop(b),this.instance.options.helper=this.instance.options._helper,d.options.helper=="original"&&this.instance.currentItem.css({top:"auto",left:"auto"})):(this.instance.cancelHelperRemoval=!1,this.instance._trigger("deactivate",b,e))})},drag:function(b,c){var d=a(this).data("draggable"),e=this,f=function(b){var c=this.offset.click.top,d=this.offset.click.left,e=this.positionAbs.top,f=this.positionAbs.left,g=b.height,h=b.width,i=b.top,j=b.left;return a.ui.isOver(e+c,f+d,i,j,g,h)};a.each(d.sortables,function(f){this.instance.positionAbs=d.positionAbs,this.instance.helperProportions=d.helperProportions,this.instance.offset.click=d.offset.click,this.instance._intersectsWith(this.instance.containerCache)?(this.instance.isOver||(this.instance.isOver=1,this.instance.currentItem=a(e).clone().removeAttr("id").appendTo(this.instance.element).data("sortable-item",!0),this.instance.options._helper=this.instance.options.helper,this.instance.options.helper=function(){return c.helper[0]},b.target=this.instance.currentItem[0],this.instance._mouseCapture(b,!0),this.instance._mouseStart(b,!0,!0),this.instance.offset.click.top=d.offset.click.top,this.instance.offset.click.left=d.offset.click.left,this.instance.offset.parent.left-=d.offset.parent.left-this.instance.offset.parent.left,this.instance.offset.parent.top-=d.offset.parent.top-this.instance.offset.parent.top,d._trigger("toSortable",b),d.dropped=this.instance.element,d.currentItem=d.element,this.instance.fromOutside=d),this.instance.currentItem&&this.instance._mouseDrag(b)):this.instance.isOver&&(this.instance.isOver=0,this.instance.cancelHelperRemoval=!0,this.instance.options.revert=!1,this.instance._trigger("out",b,this.instance._uiHash(this.instance)),this.instance._mouseStop(b,!0),this.instance.options.helper=this.instance.options._helper,this.instance.currentItem.remove(),this.instance.placeholder&&this.instance.placeholder.remove(),d._trigger("fromSortable",b),d.dropped=!1)})}}),a.ui.plugin.add("draggable","cursor",{start:function(b,c){var d=a("body"),e=a(this).data("draggable").options;d.css("cursor")&&(e._cursor=d.css("cursor")),d.css("cursor",e.cursor)},stop:function(b,c){var d=a(this).data("draggable").options;d._cursor&&a("body").css("cursor",d._cursor)}}),a.ui.plugin.add("draggable","opacity",{start:function(b,c){var d=a(c.helper),e=a(this).data("draggable").options;d.css("opacity")&&(e._opacity=d.css("opacity")),d.css("opacity",e.opacity)},stop:function(b,c){var d=a(this).data("draggable").options;d._opacity&&a(c.helper).css("opacity",d._opacity)}}),a.ui.plugin.add("draggable","scroll",{start:function(b,c){var d=a(this).data("draggable");d.scrollParent[0]!=document&&d.scrollParent[0].tagName!="HTML"&&(d.overflowOffset=d.scrollParent.offset())},drag:function(b,c){var d=a(this).data("draggable"),e=d.options,f=!1;if(d.scrollParent[0]!=document&&d.scrollParent[0].tagName!="HTML"){if(!e.axis||e.axis!="x")d.overflowOffset.top+d.scrollParent[0].offsetHeight-b.pageY<e.scrollSensitivity?d.scrollParent[0].scrollTop=f=d.scrollParent[0].scrollTop+e.scrollSpeed:b.pageY-d.overflowOffset.top<e.scrollSensitivity&&(d.scrollParent[0].scrollTop=f=d.scrollParent[0].scrollTop-e.scrollSpeed);if(!e.axis||e.axis!="y")d.overflowOffset.left+d.scrollParent[0].offsetWidth-b.pageX<e.scrollSensitivity?d.scrollParent[0].scrollLeft=f=d.scrollParent[0].scrollLeft+e.scrollSpeed:b.pageX-d.overflowOffset.left<e.scrollSensitivity&&(d.scrollParent[0].scrollLeft=f=d.scrollParent[0].scrollLeft-e.scrollSpeed)}else{if(!e.axis||e.axis!="x")b.pageY-a(document).scrollTop()<e.scrollSensitivity?f=a(document).scrollTop(a(document).scrollTop()-e.scrollSpeed):a(window).height()-(b.pageY-a(document).scrollTop())<e.scrollSensitivity&&(f=a(document).scrollTop(a(document).scrollTop()+e.scrollSpeed));if(!e.axis||e.axis!="y")b.pageX-a(document).scrollLeft()<e.scrollSensitivity?f=a(document).scrollLeft(a(document).scrollLeft()-e.scrollSpeed):a(window).width()-(b.pageX-a(document).scrollLeft())<e.scrollSensitivity&&(f=a(document).scrollLeft(a(document).scrollLeft()+e.scrollSpeed))}f!==!1&&a.ui.ddmanager&&!e.dropBehaviour&&a.ui.ddmanager.prepareOffsets(d,b)}}),a.ui.plugin.add("draggable","snap",{start:function(b,c){var d=a(this).data("draggable"),e=d.options;d.snapElements=[],a(e.snap.constructor!=String?e.snap.items||":data(draggable)":e.snap).each(function(){var b=a(this),c=b.offset();this!=d.element[0]&&d.snapElements.push({item:this,width:b.outerWidth(),height:b.outerHeight(),top:c.top,left:c.left})})},drag:function(b,c){var d=a(this).data("draggable"),e=d.options,f=e.snapTolerance,g=c.offset.left,h=g+d.helperProportions.width,i=c.offset.top,j=i+d.helperProportions.height;for(var k=d.snapElements.length-1;k>=0;k--){var l=d.snapElements[k].left,m=l+d.snapElements[k].width,n=d.snapElements[k].top,o=n+d.snapElements[k].height;if(!(l-f<g&&g<m+f&&n-f<i&&i<o+f||l-f<g&&g<m+f&&n-f<j&&j<o+f||l-f<h&&h<m+f&&n-f<i&&i<o+f||l-f<h&&h<m+f&&n-f<j&&j<o+f)){d.snapElements[k].snapping&&d.options.snap.release&&d.options.snap.release.call(d.element,b,a.extend(d._uiHash(),{snapItem:d.snapElements[k].item})),d.snapElements[k].snapping=!1;continue}if(e.snapMode!="inner"){var p=Math.abs(n-j)<=f,q=Math.abs(o-i)<=f,r=Math.abs(l-h)<=f,s=Math.abs(m-g)<=f;p&&(c.position.top=d._convertPositionTo("relative",{top:n-d.helperProportions.height,left:0}).top-d.margins.top),q&&(c.position.top=d._convertPositionTo("relative",{top:o,left:0}).top-d.margins.top),r&&(c.position.left=d._convertPositionTo("relative",{top:0,left:l-d.helperProportions.width}).left-d.margins.left),s&&(c.position.left=d._convertPositionTo("relative",{top:0,left:m}).left-d.margins.left)}var t=p||q||r||s;if(e.snapMode!="outer"){var p=Math.abs(n-i)<=f,q=Math.abs(o-j)<=f,r=Math.abs(l-g)<=f,s=Math.abs(m-h)<=f;p&&(c.position.top=d._convertPositionTo("relative",{top:n,left:0}).top-d.margins.top),q&&(c.position.top=d._convertPositionTo("relative",{top:o-d.helperProportions.height,left:0}).top-d.margins.top),r&&(c.position.left=d._convertPositionTo("relative",{top:0,left:l}).left-d.margins.left),s&&(c.position.left=d._convertPositionTo("relative",{top:0,left:m-d.helperProportions.width}).left-d.margins.left)}!d.snapElements[k].snapping&&(p||q||r||s||t)&&d.options.snap.snap&&d.options.snap.snap.call(d.element,b,a.extend(d._uiHash(),{snapItem:d.snapElements[k].item})),d.snapElements[k].snapping=p||q||r||s||t}}}),a.ui.plugin.add("draggable","stack",{start:function(b,c){var d=a(this).data("draggable").options,e=a.makeArray(a(d.stack)).sort(function(b,c){return(parseInt(a(b).css("zIndex"),10)||0)-(parseInt(a(c).css("zIndex"),10)||0)});if(!e.length)return;var f=parseInt(e[0].style.zIndex)||0;a(e).each(function(a){this.style.zIndex=f+a}),this[0].style.zIndex=f+e.length}}),a.ui.plugin.add("draggable","zIndex",{start:function(b,c){var d=a(c.helper),e=a(this).data("draggable").options;d.css("zIndex")&&(e._zIndex=d.css("zIndex")),d.css("zIndex",e.zIndex)},stop:function(b,c){var d=a(this).data("draggable").options;d._zIndex&&a(c.helper).css("zIndex",d._zIndex)}})})(jQuery);;/*! jQuery UI - v1.8.24 - 2012-09-28
* https://github.com/jquery/jquery-ui
* Includes: jquery.ui.droppable.js
* Copyright (c) 2012 AUTHORS.txt; Licensed MIT, GPL */
(function(a,b){a.widget("ui.droppable",{widgetEventPrefix:"drop",options:{accept:"*",activeClass:!1,addClasses:!0,greedy:!1,hoverClass:!1,scope:"default",tolerance:"intersect"},_create:function(){var b=this.options,c=b.accept;this.isover=0,this.isout=1,this.accept=a.isFunction(c)?c:function(a){return a.is(c)},this.proportions={width:this.element[0].offsetWidth,height:this.element[0].offsetHeight},a.ui.ddmanager.droppables[b.scope]=a.ui.ddmanager.droppables[b.scope]||[],a.ui.ddmanager.droppables[b.scope].push(this),b.addClasses&&this.element.addClass("ui-droppable")},destroy:function(){var b=a.ui.ddmanager.droppables[this.options.scope];for(var c=0;c<b.length;c++)b[c]==this&&b.splice(c,1);return this.element.removeClass("ui-droppable ui-droppable-disabled").removeData("droppable").unbind(".droppable"),this},_setOption:function(b,c){b=="accept"&&(this.accept=a.isFunction(c)?c:function(a){return a.is(c)}),a.Widget.prototype._setOption.apply(this,arguments)},_activate:function(b){var c=a.ui.ddmanager.current;this.options.activeClass&&this.element.addClass(this.options.activeClass),c&&this._trigger("activate",b,this.ui(c))},_deactivate:function(b){var c=a.ui.ddmanager.current;this.options.activeClass&&this.element.removeClass(this.options.activeClass),c&&this._trigger("deactivate",b,this.ui(c))},_over:function(b){var c=a.ui.ddmanager.current;if(!c||(c.currentItem||c.element)[0]==this.element[0])return;this.accept.call(this.element[0],c.currentItem||c.element)&&(this.options.hoverClass&&this.element.addClass(this.options.hoverClass),this._trigger("over",b,this.ui(c)))},_out:function(b){var c=a.ui.ddmanager.current;if(!c||(c.currentItem||c.element)[0]==this.element[0])return;this.accept.call(this.element[0],c.currentItem||c.element)&&(this.options.hoverClass&&this.element.removeClass(this.options.hoverClass),this._trigger("out",b,this.ui(c)))},_drop:function(b,c){var d=c||a.ui.ddmanager.current;if(!d||(d.currentItem||d.element)[0]==this.element[0])return!1;var e=!1;return this.element.find(":data(droppable)").not(".ui-draggable-dragging").each(function(){var b=a.data(this,"droppable");if(b.options.greedy&&!b.options.disabled&&b.options.scope==d.options.scope&&b.accept.call(b.element[0],d.currentItem||d.element)&&a.ui.intersect(d,a.extend(b,{offset:b.element.offset()}),b.options.tolerance))return e=!0,!1}),e?!1:this.accept.call(this.element[0],d.currentItem||d.element)?(this.options.activeClass&&this.element.removeClass(this.options.activeClass),this.options.hoverClass&&this.element.removeClass(this.options.hoverClass),this._trigger("drop",b,this.ui(d)),this.element):!1},ui:function(a){return{draggable:a.currentItem||a.element,helper:a.helper,position:a.position,offset:a.positionAbs}}}),a.extend(a.ui.droppable,{version:"1.8.24"}),a.ui.intersect=function(b,c,d){if(!c.offset)return!1;var e=(b.positionAbs||b.position.absolute).left,f=e+b.helperProportions.width,g=(b.positionAbs||b.position.absolute).top,h=g+b.helperProportions.height,i=c.offset.left,j=i+c.proportions.width,k=c.offset.top,l=k+c.proportions.height;switch(d){case"fit":return i<=e&&f<=j&&k<=g&&h<=l;case"intersect":return i<e+b.helperProportions.width/2&&f-b.helperProportions.width/2<j&&k<g+b.helperProportions.height/2&&h-b.helperProportions.height/2<l;case"pointer":var m=(b.positionAbs||b.position.absolute).left+(b.clickOffset||b.offset.click).left,n=(b.positionAbs||b.position.absolute).top+(b.clickOffset||b.offset.click).top,o=a.ui.isOver(n,m,k,i,c.proportions.height,c.proportions.width);return o;case"touch":return(g>=k&&g<=l||h>=k&&h<=l||g<k&&h>l)&&(e>=i&&e<=j||f>=i&&f<=j||e<i&&f>j);default:return!1}},a.ui.ddmanager={current:null,droppables:{"default":[]},prepareOffsets:function(b,c){var d=a.ui.ddmanager.droppables[b.options.scope]||[],e=c?c.type:null,f=(b.currentItem||b.element).find(":data(droppable)").andSelf();g:for(var h=0;h<d.length;h++){if(d[h].options.disabled||b&&!d[h].accept.call(d[h].element[0],b.currentItem||b.element))continue;for(var i=0;i<f.length;i++)if(f[i]==d[h].element[0]){d[h].proportions.height=0;continue g}d[h].visible=d[h].element.css("display")!="none";if(!d[h].visible)continue;e=="mousedown"&&d[h]._activate.call(d[h],c),d[h].offset=d[h].element.offset(),d[h].proportions={width:d[h].element[0].offsetWidth,height:d[h].element[0].offsetHeight}}},drop:function(b,c){var d=!1;return a.each(a.ui.ddmanager.droppables[b.options.scope]||[],function(){if(!this.options)return;!this.options.disabled&&this.visible&&a.ui.intersect(b,this,this.options.tolerance)&&(d=this._drop.call(this,c)||d),!this.options.disabled&&this.visible&&this.accept.call(this.element[0],b.currentItem||b.element)&&(this.isout=1,this.isover=0,this._deactivate.call(this,c))}),d},dragStart:function(b,c){b.element.parents(":not(body,html)").bind("scroll.droppable",function(){b.options.refreshPositions||a.ui.ddmanager.prepareOffsets(b,c)})},drag:function(b,c){b.options.refreshPositions&&a.ui.ddmanager.prepareOffsets(b,c),a.each(a.ui.ddmanager.droppables[b.options.scope]||[],function(){if(this.options.disabled||this.greedyChild||!this.visible)return;var d=a.ui.intersect(b,this,this.options.tolerance),e=!d&&this.isover==1?"isout":d&&this.isover==0?"isover":null;if(!e)return;var f;if(this.options.greedy){var g=this.options.scope,h=this.element.parents(":data(droppable)").filter(function(){return a.data(this,"droppable").options.scope===g});h.length&&(f=a.data(h[0],"droppable"),f.greedyChild=e=="isover"?1:0)}f&&e=="isover"&&(f.isover=0,f.isout=1,f._out.call(f,c)),this[e]=1,this[e=="isout"?"isover":"isout"]=0,this[e=="isover"?"_over":"_out"].call(this,c),f&&e=="isout"&&(f.isout=0,f.isover=1,f._over.call(f,c))})},dragStop:function(b,c){b.element.parents(":not(body,html)").unbind("scroll.droppable"),b.options.refreshPositions||a.ui.ddmanager.prepareOffsets(b,c)}}})(jQuery);;/*! jQuery UI - v1.8.24 - 2012-09-28
* https://github.com/jquery/jquery-ui
* Includes: jquery.ui.resizable.js
* Copyright (c) 2012 AUTHORS.txt; Licensed MIT, GPL */
(function(a,b){a.widget("ui.resizable",a.ui.mouse,{widgetEventPrefix:"resize",options:{alsoResize:!1,animate:!1,animateDuration:"slow",animateEasing:"swing",aspectRatio:!1,autoHide:!1,containment:!1,ghost:!1,grid:!1,handles:"e,s,se",helper:!1,maxHeight:null,maxWidth:null,minHeight:10,minWidth:10,zIndex:1e3},_create:function(){var b=this,c=this.options;this.element.addClass("ui-resizable"),a.extend(this,{_aspectRatio:!!c.aspectRatio,aspectRatio:c.aspectRatio,originalElement:this.element,_proportionallyResizeElements:[],_helper:c.helper||c.ghost||c.animate?c.helper||"ui-resizable-helper":null}),this.element[0].nodeName.match(/canvas|textarea|input|select|button|img/i)&&(this.element.wrap(a('<div class="ui-wrapper" style="overflow: hidden;"></div>').css({position:this.element.css("position"),width:this.element.outerWidth(),height:this.element.outerHeight(),top:this.element.css("top"),left:this.element.css("left")})),this.element=this.element.parent().data("resizable",this.element.data("resizable")),this.elementIsWrapper=!0,this.element.css({marginLeft:this.originalElement.css("marginLeft"),marginTop:this.originalElement.css("marginTop"),marginRight:this.originalElement.css("marginRight"),marginBottom:this.originalElement.css("marginBottom")}),this.originalElement.css({marginLeft:0,marginTop:0,marginRight:0,marginBottom:0}),this.originalResizeStyle=this.originalElement.css("resize"),this.originalElement.css("resize","none"),this._proportionallyResizeElements.push(this.originalElement.css({position:"static",zoom:1,display:"block"})),this.originalElement.css({margin:this.originalElement.css("margin")}),this._proportionallyResize()),this.handles=c.handles||(a(".ui-resizable-handle",this.element).length?{n:".ui-resizable-n",e:".ui-resizable-e",s:".ui-resizable-s",w:".ui-resizable-w",se:".ui-resizable-se",sw:".ui-resizable-sw",ne:".ui-resizable-ne",nw:".ui-resizable-nw"}:"e,s,se");if(this.handles.constructor==String){this.handles=="all"&&(this.handles="n,e,s,w,se,sw,ne,nw");var d=this.handles.split(",");this.handles={};for(var e=0;e<d.length;e++){var f=a.trim(d[e]),g="ui-resizable-"+f,h=a('<div class="ui-resizable-handle '+g+'"></div>');h.css({zIndex:c.zIndex}),"se"==f&&h.addClass("ui-icon ui-icon-gripsmall-diagonal-se"),this.handles[f]=".ui-resizable-"+f,this.element.append(h)}}this._renderAxis=function(b){b=b||this.element;for(var c in this.handles){this.handles[c].constructor==String&&(this.handles[c]=a(this.handles[c],this.element).show());if(this.elementIsWrapper&&this.originalElement[0].nodeName.match(/textarea|input|select|button/i)){var d=a(this.handles[c],this.element),e=0;e=/sw|ne|nw|se|n|s/.test(c)?d.outerHeight():d.outerWidth();var f=["padding",/ne|nw|n/.test(c)?"Top":/se|sw|s/.test(c)?"Bottom":/^e$/.test(c)?"Right":"Left"].join("");b.css(f,e),this._proportionallyResize()}if(!a(this.handles[c]).length)continue}},this._renderAxis(this.element),this._handles=a(".ui-resizable-handle",this.element).disableSelection(),this._handles.mouseover(function(){if(!b.resizing){if(this.className)var a=this.className.match(/ui-resizable-(se|sw|ne|nw|n|e|s|w)/i);b.axis=a&&a[1]?a[1]:"se"}}),c.autoHide&&(this._handles.hide(),a(this.element).addClass("ui-resizable-autohide").hover(function(){if(c.disabled)return;a(this).removeClass("ui-resizable-autohide"),b._handles.show()},function(){if(c.disabled)return;b.resizing||(a(this).addClass("ui-resizable-autohide"),b._handles.hide())})),this._mouseInit()},destroy:function(){this._mouseDestroy();var b=function(b){a(b).removeClass("ui-resizable ui-resizable-disabled ui-resizable-resizing").removeData("resizable").unbind(".resizable").find(".ui-resizable-handle").remove()};if(this.elementIsWrapper){b(this.element);var c=this.element;c.after(this.originalElement.css({position:c.css("position"),width:c.outerWidth(),height:c.outerHeight(),top:c.css("top"),left:c.css("left")})).remove()}return this.originalElement.css("resize",this.originalResizeStyle),b(this.originalElement),this},_mouseCapture:function(b){var c=!1;for(var d in this.handles)a(this.handles[d])[0]==b.target&&(c=!0);return!this.options.disabled&&c},_mouseStart:function(b){var d=this.options,e=this.element.position(),f=this.element;this.resizing=!0,this.documentScroll={top:a(document).scrollTop(),left:a(document).scrollLeft()},(f.is(".ui-draggable")||/absolute/.test(f.css("position")))&&f.css({position:"absolute",top:e.top,left:e.left}),this._renderProxy();var g=c(this.helper.css("left")),h=c(this.helper.css("top"));d.containment&&(g+=a(d.containment).scrollLeft()||0,h+=a(d.containment).scrollTop()||0),this.offset=this.helper.offset(),this.position={left:g,top:h},this.size=this._helper?{width:f.outerWidth(),height:f.outerHeight()}:{width:f.width(),height:f.height()},this.originalSize=this._helper?{width:f.outerWidth(),height:f.outerHeight()}:{width:f.width(),height:f.height()},this.originalPosition={left:g,top:h},this.sizeDiff={width:f.outerWidth()-f.width(),height:f.outerHeight()-f.height()},this.originalMousePosition={left:b.pageX,top:b.pageY},this.aspectRatio=typeof d.aspectRatio=="number"?d.aspectRatio:this.originalSize.width/this.originalSize.height||1;var i=a(".ui-resizable-"+this.axis).css("cursor");return a("body").css("cursor",i=="auto"?this.axis+"-resize":i),f.addClass("ui-resizable-resizing"),this._propagate("start",b),!0},_mouseDrag:function(b){var c=this.helper,d=this.options,e={},f=this,g=this.originalMousePosition,h=this.axis,i=b.pageX-g.left||0,j=b.pageY-g.top||0,k=this._change[h];if(!k)return!1;var l=k.apply(this,[b,i,j]),m=a.browser.msie&&a.browser.version<7,n=this.sizeDiff;this._updateVirtualBoundaries(b.shiftKey);if(this._aspectRatio||b.shiftKey)l=this._updateRatio(l,b);return l=this._respectSize(l,b),this._propagate("resize",b),c.css({top:this.position.top+"px",left:this.position.left+"px",width:this.size.width+"px",height:this.size.height+"px"}),!this._helper&&this._proportionallyResizeElements.length&&this._proportionallyResize(),this._updateCache(l),this._trigger("resize",b,this.ui()),!1},_mouseStop:function(b){this.resizing=!1;var c=this.options,d=this;if(this._helper){var e=this._proportionallyResizeElements,f=e.length&&/textarea/i.test(e[0].nodeName),g=f&&a.ui.hasScroll(e[0],"left")?0:d.sizeDiff.height,h=f?0:d.sizeDiff.width,i={width:d.helper.width()-h,height:d.helper.height()-g},j=parseInt(d.element.css("left"),10)+(d.position.left-d.originalPosition.left)||null,k=parseInt(d.element.css("top"),10)+(d.position.top-d.originalPosition.top)||null;c.animate||this.element.css(a.extend(i,{top:k,left:j})),d.helper.height(d.size.height),d.helper.width(d.size.width),this._helper&&!c.animate&&this._proportionallyResize()}return a("body").css("cursor","auto"),this.element.removeClass("ui-resizable-resizing"),this._propagate("stop",b),this._helper&&this.helper.remove(),!1},_updateVirtualBoundaries:function(a){var b=this.options,c,e,f,g,h;h={minWidth:d(b.minWidth)?b.minWidth:0,maxWidth:d(b.maxWidth)?b.maxWidth:Infinity,minHeight:d(b.minHeight)?b.minHeight:0,maxHeight:d(b.maxHeight)?b.maxHeight:Infinity};if(this._aspectRatio||a)c=h.minHeight*this.aspectRatio,f=h.minWidth/this.aspectRatio,e=h.maxHeight*this.aspectRatio,g=h.maxWidth/this.aspectRatio,c>h.minWidth&&(h.minWidth=c),f>h.minHeight&&(h.minHeight=f),e<h.maxWidth&&(h.maxWidth=e),g<h.maxHeight&&(h.maxHeight=g);this._vBoundaries=h},_updateCache:function(a){var b=this.options;this.offset=this.helper.offset(),d(a.left)&&(this.position.left=a.left),d(a.top)&&(this.position.top=a.top),d(a.height)&&(this.size.height=a.height),d(a.width)&&(this.size.width=a.width)},_updateRatio:function(a,b){var c=this.options,e=this.position,f=this.size,g=this.axis;return d(a.height)?a.width=a.height*this.aspectRatio:d(a.width)&&(a.height=a.width/this.aspectRatio),g=="sw"&&(a.left=e.left+(f.width-a.width),a.top=null),g=="nw"&&(a.top=e.top+(f.height-a.height),a.left=e.left+(f.width-a.width)),a},_respectSize:function(a,b){var c=this.helper,e=this._vBoundaries,f=this._aspectRatio||b.shiftKey,g=this.axis,h=d(a.width)&&e.maxWidth&&e.maxWidth<a.width,i=d(a.height)&&e.maxHeight&&e.maxHeight<a.height,j=d(a.width)&&e.minWidth&&e.minWidth>a.width,k=d(a.height)&&e.minHeight&&e.minHeight>a.height;j&&(a.width=e.minWidth),k&&(a.height=e.minHeight),h&&(a.width=e.maxWidth),i&&(a.height=e.maxHeight);var l=this.originalPosition.left+this.originalSize.width,m=this.position.top+this.size.height,n=/sw|nw|w/.test(g),o=/nw|ne|n/.test(g);j&&n&&(a.left=l-e.minWidth),h&&n&&(a.left=l-e.maxWidth),k&&o&&(a.top=m-e.minHeight),i&&o&&(a.top=m-e.maxHeight);var p=!a.width&&!a.height;return p&&!a.left&&a.top?a.top=null:p&&!a.top&&a.left&&(a.left=null),a},_proportionallyResize:function(){var b=this.options;if(!this._proportionallyResizeElements.length)return;var c=this.helper||this.element;for(var d=0;d<this._proportionallyResizeElements.length;d++){var e=this._proportionallyResizeElements[d];if(!this.borderDif){var f=[e.css("borderTopWidth"),e.css("borderRightWidth"),e.css("borderBottomWidth"),e.css("borderLeftWidth")],g=[e.css("paddingTop"),e.css("paddingRight"),e.css("paddingBottom"),e.css("paddingLeft")];this.borderDif=a.map(f,function(a,b){var c=parseInt(a,10)||0,d=parseInt(g[b],10)||0;return c+d})}if(!a.browser.msie||!a(c).is(":hidden")&&!a(c).parents(":hidden").length)e.css({height:c.height()-this.borderDif[0]-this.borderDif[2]||0,width:c.width()-this.borderDif[1]-this.borderDif[3]||0});else continue}},_renderProxy:function(){var b=this.element,c=this.options;this.elementOffset=b.offset();if(this._helper){this.helper=this.helper||a('<div style="overflow:hidden;"></div>');var d=a.browser.msie&&a.browser.version<7,e=d?1:0,f=d?2:-1;this.helper.addClass(this._helper).css({width:this.element.outerWidth()+f,height:this.element.outerHeight()+f,position:"absolute",left:this.elementOffset.left-e+"px",top:this.elementOffset.top-e+"px",zIndex:++c.zIndex}),this.helper.appendTo("body").disableSelection()}else this.helper=this.element},_change:{e:function(a,b,c){return{width:this.originalSize.width+b}},w:function(a,b,c){var d=this.options,e=this.originalSize,f=this.originalPosition;return{left:f.left+b,width:e.width-b}},n:function(a,b,c){var d=this.options,e=this.originalSize,f=this.originalPosition;return{top:f.top+c,height:e.height-c}},s:function(a,b,c){return{height:this.originalSize.height+c}},se:function(b,c,d){return a.extend(this._change.s.apply(this,arguments),this._change.e.apply(this,[b,c,d]))},sw:function(b,c,d){return a.extend(this._change.s.apply(this,arguments),this._change.w.apply(this,[b,c,d]))},ne:function(b,c,d){return a.extend(this._change.n.apply(this,arguments),this._change.e.apply(this,[b,c,d]))},nw:function(b,c,d){return a.extend(this._change.n.apply(this,arguments),this._change.w.apply(this,[b,c,d]))}},_propagate:function(b,c){a.ui.plugin.call(this,b,[c,this.ui()]),b!="resize"&&this._trigger(b,c,this.ui())},plugins:{},ui:function(){return{originalElement:this.originalElement,element:this.element,helper:this.helper,position:this.position,size:this.size,originalSize:this.originalSize,originalPosition:this.originalPosition}}}),a.extend(a.ui.resizable,{version:"1.8.24"}),a.ui.plugin.add("resizable","alsoResize",{start:function(b,c){var d=a(this).data("resizable"),e=d.options,f=function(b){a(b).each(function(){var b=a(this);b.data("resizable-alsoresize",{width:parseInt(b.width(),10),height:parseInt(b.height(),10),left:parseInt(b.css("left"),10),top:parseInt(b.css("top"),10)})})};typeof e.alsoResize=="object"&&!e.alsoResize.parentNode?e.alsoResize.length?(e.alsoResize=e.alsoResize[0],f(e.alsoResize)):a.each(e.alsoResize,function(a){f(a)}):f(e.alsoResize)},resize:function(b,c){var d=a(this).data("resizable"),e=d.options,f=d.originalSize,g=d.originalPosition,h={height:d.size.height-f.height||0,width:d.size.width-f.width||0,top:d.position.top-g.top||0,left:d.position.left-g.left||0},i=function(b,d){a(b).each(function(){var b=a(this),e=a(this).data("resizable-alsoresize"),f={},g=d&&d.length?d:b.parents(c.originalElement[0]).length?["width","height"]:["width","height","top","left"];a.each(g,function(a,b){var c=(e[b]||0)+(h[b]||0);c&&c>=0&&(f[b]=c||null)}),b.css(f)})};typeof e.alsoResize=="object"&&!e.alsoResize.nodeType?a.each(e.alsoResize,function(a,b){i(a,b)}):i(e.alsoResize)},stop:function(b,c){a(this).removeData("resizable-alsoresize")}}),a.ui.plugin.add("resizable","animate",{stop:function(b,c){var d=a(this).data("resizable"),e=d.options,f=d._proportionallyResizeElements,g=f.length&&/textarea/i.test(f[0].nodeName),h=g&&a.ui.hasScroll(f[0],"left")?0:d.sizeDiff.height,i=g?0:d.sizeDiff.width,j={width:d.size.width-i,height:d.size.height-h},k=parseInt(d.element.css("left"),10)+(d.position.left-d.originalPosition.left)||null,l=parseInt(d.element.css("top"),10)+(d.position.top-d.originalPosition.top)||null;d.element.animate(a.extend(j,l&&k?{top:l,left:k}:{}),{duration:e.animateDuration,easing:e.animateEasing,step:function(){var c={width:parseInt(d.element.css("width"),10),height:parseInt(d.element.css("height"),10),top:parseInt(d.element.css("top"),10),left:parseInt(d.element.css("left"),10)};f&&f.length&&a(f[0]).css({width:c.width,height:c.height}),d._updateCache(c),d._propagate("resize",b)}})}}),a.ui.plugin.add("resizable","containment",{start:function(b,d){var e=a(this).data("resizable"),f=e.options,g=e.element,h=f.containment,i=h instanceof a?h.get(0):/parent/.test(h)?g.parent().get(0):h;if(!i)return;e.containerElement=a(i);if(/document/.test(h)||h==document)e.containerOffset={left:0,top:0},e.containerPosition={left:0,top:0},e.parentData={element:a(document),left:0,top:0,width:a(document).width(),height:a(document).height()||document.body.parentNode.scrollHeight};else{var j=a(i),k=[];a(["Top","Right","Left","Bottom"]).each(function(a,b){k[a]=c(j.css("padding"+b))}),e.containerOffset=j.offset(),e.containerPosition=j.position(),e.containerSize={height:j.innerHeight()-k[3],width:j.innerWidth()-k[1]};var l=e.containerOffset,m=e.containerSize.height,n=e.containerSize.width,o=a.ui.hasScroll(i,"left")?i.scrollWidth:n,p=a.ui.hasScroll(i)?i.scrollHeight:m;e.parentData={element:i,left:l.left,top:l.top,width:o,height:p}}},resize:function(b,c){var d=a(this).data("resizable"),e=d.options,f=d.containerSize,g=d.containerOffset,h=d.size,i=d.position,j=d._aspectRatio||b.shiftKey,k={top:0,left:0},l=d.containerElement;l[0]!=document&&/static/.test(l.css("position"))&&(k=g),i.left<(d._helper?g.left:0)&&(d.size.width=d.size.width+(d._helper?d.position.left-g.left:d.position.left-k.left),j&&(d.size.height=d.size.width/d.aspectRatio),d.position.left=e.helper?g.left:0),i.top<(d._helper?g.top:0)&&(d.size.height=d.size.height+(d._helper?d.position.top-g.top:d.position.top),j&&(d.size.width=d.size.height*d.aspectRatio),d.position.top=d._helper?g.top:0),d.offset.left=d.parentData.left+d.position.left,d.offset.top=d.parentData.top+d.position.top;var m=Math.abs((d._helper?d.offset.left-k.left:d.offset.left-k.left)+d.sizeDiff.width),n=Math.abs((d._helper?d.offset.top-k.top:d.offset.top-g.top)+d.sizeDiff.height),o=d.containerElement.get(0)==d.element.parent().get(0),p=/relative|absolute/.test(d.containerElement.css("position"));o&&p&&(m-=d.parentData.left),m+d.size.width>=d.parentData.width&&(d.size.width=d.parentData.width-m,j&&(d.size.height=d.size.width/d.aspectRatio)),n+d.size.height>=d.parentData.height&&(d.size.height=d.parentData.height-n,j&&(d.size.width=d.size.height*d.aspectRatio))},stop:function(b,c){var d=a(this).data("resizable"),e=d.options,f=d.position,g=d.containerOffset,h=d.containerPosition,i=d.containerElement,j=a(d.helper),k=j.offset(),l=j.outerWidth()-d.sizeDiff.width,m=j.outerHeight()-d.sizeDiff.height;d._helper&&!e.animate&&/relative/.test(i.css("position"))&&a(this).css({left:k.left-h.left-g.left,width:l,height:m}),d._helper&&!e.animate&&/static/.test(i.css("position"))&&a(this).css({left:k.left-h.left-g.left,width:l,height:m})}}),a.ui.plugin.add("resizable","ghost",{start:function(b,c){var d=a(this).data("resizable"),e=d.options,f=d.size;d.ghost=d.originalElement.clone(),d.ghost.css({opacity:.25,display:"block",position:"relative",height:f.height,width:f.width,margin:0,left:0,top:0}).addClass("ui-resizable-ghost").addClass(typeof e.ghost=="string"?e.ghost:""),d.ghost.appendTo(d.helper)},resize:function(b,c){var d=a(this).data("resizable"),e=d.options;d.ghost&&d.ghost.css({position:"relative",height:d.size.height,width:d.size.width})},stop:function(b,c){var d=a(this).data("resizable"),e=d.options;d.ghost&&d.helper&&d.helper.get(0).removeChild(d.ghost.get(0))}}),a.ui.plugin.add("resizable","grid",{resize:function(b,c){var d=a(this).data("resizable"),e=d.options,f=d.size,g=d.originalSize,h=d.originalPosition,i=d.axis,j=e._aspectRatio||b.shiftKey;e.grid=typeof e.grid=="number"?[e.grid,e.grid]:e.grid;var k=Math.round((f.width-g.width)/(e.grid[0]||1))*(e.grid[0]||1),l=Math.round((f.height-g.height)/(e.grid[1]||1))*(e.grid[1]||1);/^(se|s|e)$/.test(i)?(d.size.width=g.width+k,d.size.height=g.height+l):/^(ne)$/.test(i)?(d.size.width=g.width+k,d.size.height=g.height+l,d.position.top=h.top-l):/^(sw)$/.test(i)?(d.size.width=g.width+k,d.size.height=g.height+l,d.position.left=h.left-k):(d.size.width=g.width+k,d.size.height=g.height+l,d.position.top=h.top-l,d.position.left=h.left-k)}});var c=function(a){return parseInt(a,10)||0},d=function(a){return!isNaN(parseInt(a,10))}})(jQuery);;/*! jQuery UI - v1.8.24 - 2012-09-28
* https://github.com/jquery/jquery-ui
* Includes: jquery.ui.selectable.js
* Copyright (c) 2012 AUTHORS.txt; Licensed MIT, GPL */
(function(a,b){a.widget("ui.selectable",a.ui.mouse,{options:{appendTo:"body",autoRefresh:!0,distance:0,filter:"*",tolerance:"touch"},_create:function(){var b=this;this.element.addClass("ui-selectable"),this.dragged=!1;var c;this.refresh=function(){c=a(b.options.filter,b.element[0]),c.addClass("ui-selectee"),c.each(function(){var b=a(this),c=b.offset();a.data(this,"selectable-item",{element:this,$element:b,left:c.left,top:c.top,right:c.left+b.outerWidth(),bottom:c.top+b.outerHeight(),startselected:!1,selected:b.hasClass("ui-selected"),selecting:b.hasClass("ui-selecting"),unselecting:b.hasClass("ui-unselecting")})})},this.refresh(),this.selectees=c.addClass("ui-selectee"),this._mouseInit(),this.helper=a("<div class='ui-selectable-helper'></div>")},destroy:function(){return this.selectees.removeClass("ui-selectee").removeData("selectable-item"),this.element.removeClass("ui-selectable ui-selectable-disabled").removeData("selectable").unbind(".selectable"),this._mouseDestroy(),this},_mouseStart:function(b){var c=this;this.opos=[b.pageX,b.pageY];if(this.options.disabled)return;var d=this.options;this.selectees=a(d.filter,this.element[0]),this._trigger("start",b),a(d.appendTo).append(this.helper),this.helper.css({left:b.clientX,top:b.clientY,width:0,height:0}),d.autoRefresh&&this.refresh(),this.selectees.filter(".ui-selected").each(function(){var d=a.data(this,"selectable-item");d.startselected=!0,!b.metaKey&&!b.ctrlKey&&(d.$element.removeClass("ui-selected"),d.selected=!1,d.$element.addClass("ui-unselecting"),d.unselecting=!0,c._trigger("unselecting",b,{unselecting:d.element}))}),a(b.target).parents().andSelf().each(function(){var d=a.data(this,"selectable-item");if(d){var e=!b.metaKey&&!b.ctrlKey||!d.$element.hasClass("ui-selected");return d.$element.removeClass(e?"ui-unselecting":"ui-selected").addClass(e?"ui-selecting":"ui-unselecting"),d.unselecting=!e,d.selecting=e,d.selected=e,e?c._trigger("selecting",b,{selecting:d.element}):c._trigger("unselecting",b,{unselecting:d.element}),!1}})},_mouseDrag:function(b){var c=this;this.dragged=!0;if(this.options.disabled)return;var d=this.options,e=this.opos[0],f=this.opos[1],g=b.pageX,h=b.pageY;if(e>g){var i=g;g=e,e=i}if(f>h){var i=h;h=f,f=i}return this.helper.css({left:e,top:f,width:g-e,height:h-f}),this.selectees.each(function(){var i=a.data(this,"selectable-item");if(!i||i.element==c.element[0])return;var j=!1;d.tolerance=="touch"?j=!(i.left>g||i.right<e||i.top>h||i.bottom<f):d.tolerance=="fit"&&(j=i.left>e&&i.right<g&&i.top>f&&i.bottom<h),j?(i.selected&&(i.$element.removeClass("ui-selected"),i.selected=!1),i.unselecting&&(i.$element.removeClass("ui-unselecting"),i.unselecting=!1),i.selecting||(i.$element.addClass("ui-selecting"),i.selecting=!0,c._trigger("selecting",b,{selecting:i.element}))):(i.selecting&&((b.metaKey||b.ctrlKey)&&i.startselected?(i.$element.removeClass("ui-selecting"),i.selecting=!1,i.$element.addClass("ui-selected"),i.selected=!0):(i.$element.removeClass("ui-selecting"),i.selecting=!1,i.startselected&&(i.$element.addClass("ui-unselecting"),i.unselecting=!0),c._trigger("unselecting",b,{unselecting:i.element}))),i.selected&&!b.metaKey&&!b.ctrlKey&&!i.startselected&&(i.$element.removeClass("ui-selected"),i.selected=!1,i.$element.addClass("ui-unselecting"),i.unselecting=!0,c._trigger("unselecting",b,{unselecting:i.element})))}),!1},_mouseStop:function(b){var c=this;this.dragged=!1;var d=this.options;return a(".ui-unselecting",this.element[0]).each(function(){var d=a.data(this,"selectable-item");d.$element.removeClass("ui-unselecting"),d.unselecting=!1,d.startselected=!1,c._trigger("unselected",b,{unselected:d.element})}),a(".ui-selecting",this.element[0]).each(function(){var d=a.data(this,"selectable-item");d.$element.removeClass("ui-selecting").addClass("ui-selected"),d.selecting=!1,d.selected=!0,d.startselected=!0,c._trigger("selected",b,{selected:d.element})}),this._trigger("stop",b),this.helper.remove(),!1}}),a.extend(a.ui.selectable,{version:"1.8.24"})})(jQuery);;/*! jQuery UI - v1.8.24 - 2012-09-28
* https://github.com/jquery/jquery-ui
* Includes: jquery.ui.button.js
* Copyright (c) 2012 AUTHORS.txt; Licensed MIT, GPL */
(function(a,b){var c,d,e,f,g="ui-button ui-widget ui-state-default ui-corner-all",h="ui-state-hover ui-state-active ",i="ui-button-icons-only ui-button-icon-only ui-button-text-icons ui-button-text-icon-primary ui-button-text-icon-secondary ui-button-text-only",j=function(){var b=a(this).find(":ui-button");setTimeout(function(){b.button("refresh")},1)},k=function(b){var c=b.name,d=b.form,e=a([]);return c&&(d?e=a(d).find("[name='"+c+"']"):e=a("[name='"+c+"']",b.ownerDocument).filter(function(){return!this.form})),e};a.widget("ui.button",{options:{disabled:null,text:!0,label:null,icons:{primary:null,secondary:null}},_create:function(){this.element.closest("form").unbind("reset.button").bind("reset.button",j),typeof this.options.disabled!="boolean"?this.options.disabled=!!this.element.propAttr("disabled"):this.element.propAttr("disabled",this.options.disabled),this._determineButtonType(),this.hasTitle=!!this.buttonElement.attr("title");var b=this,h=this.options,i=this.type==="checkbox"||this.type==="radio",l="ui-state-hover"+(i?"":" ui-state-active"),m="ui-state-focus";h.label===null&&(h.label=this.buttonElement.html()),this.buttonElement.addClass(g).attr("role","button").bind("mouseenter.button",function(){if(h.disabled)return;a(this).addClass("ui-state-hover"),this===c&&a(this).addClass("ui-state-active")}).bind("mouseleave.button",function(){if(h.disabled)return;a(this).removeClass(l)}).bind("click.button",function(a){h.disabled&&(a.preventDefault(),a.stopImmediatePropagation())}),this.element.bind("focus.button",function(){b.buttonElement.addClass(m)}).bind("blur.button",function(){b.buttonElement.removeClass(m)}),i&&(this.element.bind("change.button",function(){if(f)return;b.refresh()}),this.buttonElement.bind("mousedown.button",function(a){if(h.disabled)return;f=!1,d=a.pageX,e=a.pageY}).bind("mouseup.button",function(a){if(h.disabled)return;if(d!==a.pageX||e!==a.pageY)f=!0})),this.type==="checkbox"?this.buttonElement.bind("click.button",function(){if(h.disabled||f)return!1;a(this).toggleClass("ui-state-active"),b.buttonElement.attr("aria-pressed",b.element[0].checked)}):this.type==="radio"?this.buttonElement.bind("click.button",function(){if(h.disabled||f)return!1;a(this).addClass("ui-state-active"),b.buttonElement.attr("aria-pressed","true");var c=b.element[0];k(c).not(c).map(function(){return a(this).button("widget")[0]}).removeClass("ui-state-active").attr("aria-pressed","false")}):(this.buttonElement.bind("mousedown.button",function(){if(h.disabled)return!1;a(this).addClass("ui-state-active"),c=this,a(document).one("mouseup",function(){c=null})}).bind("mouseup.button",function(){if(h.disabled)return!1;a(this).removeClass("ui-state-active")}).bind("keydown.button",function(b){if(h.disabled)return!1;(b.keyCode==a.ui.keyCode.SPACE||b.keyCode==a.ui.keyCode.ENTER)&&a(this).addClass("ui-state-active")}).bind("keyup.button",function(){a(this).removeClass("ui-state-active")}),this.buttonElement.is("a")&&this.buttonElement.keyup(function(b){b.keyCode===a.ui.keyCode.SPACE&&a(this).click()})),this._setOption("disabled",h.disabled),this._resetButton()},_determineButtonType:function(){this.element.is(":checkbox")?this.type="checkbox":this.element.is(":radio")?this.type="radio":this.element.is("input")?this.type="input":this.type="button";if(this.type==="checkbox"||this.type==="radio"){var a=this.element.parents().filter(":last"),b="label[for='"+this.element.attr("id")+"']";this.buttonElement=a.find(b),this.buttonElement.length||(a=a.length?a.siblings():this.element.siblings(),this.buttonElement=a.filter(b),this.buttonElement.length||(this.buttonElement=a.find(b))),this.element.addClass("ui-helper-hidden-accessible");var c=this.element.is(":checked");c&&this.buttonElement.addClass("ui-state-active"),this.buttonElement.attr("aria-pressed",c)}else this.buttonElement=this.element},widget:function(){return this.buttonElement},destroy:function(){this.element.removeClass("ui-helper-hidden-accessible"),this.buttonElement.removeClass(g+" "+h+" "+i).removeAttr("role").removeAttr("aria-pressed").html(this.buttonElement.find(".ui-button-text").html()),this.hasTitle||this.buttonElement.removeAttr("title"),a.Widget.prototype.destroy.call(this)},_setOption:function(b,c){a.Widget.prototype._setOption.apply(this,arguments);if(b==="disabled"){c?this.element.propAttr("disabled",!0):this.element.propAttr("disabled",!1);return}this._resetButton()},refresh:function(){var b=this.element.is(":disabled");b!==this.options.disabled&&this._setOption("disabled",b),this.type==="radio"?k(this.element[0]).each(function(){a(this).is(":checked")?a(this).button("widget").addClass("ui-state-active").attr("aria-pressed","true"):a(this).button("widget").removeClass("ui-state-active").attr("aria-pressed","false")}):this.type==="checkbox"&&(this.element.is(":checked")?this.buttonElement.addClass("ui-state-active").attr("aria-pressed","true"):this.buttonElement.removeClass("ui-state-active").attr("aria-pressed","false"))},_resetButton:function(){if(this.type==="input"){this.options.label&&this.element.val(this.options.label);return}var b=this.buttonElement.removeClass(i),c=a("<span></span>",this.element[0].ownerDocument).addClass("ui-button-text").html(this.options.label).appendTo(b.empty()).text(),d=this.options.icons,e=d.primary&&d.secondary,f=[];d.primary||d.secondary?(this.options.text&&f.push("ui-button-text-icon"+(e?"s":d.primary?"-primary":"-secondary")),d.primary&&b.prepend("<span class='ui-button-icon-primary ui-icon "+d.primary+"'></span>"),d.secondary&&b.append("<span class='ui-button-icon-secondary ui-icon "+d.secondary+"'></span>"),this.options.text||(f.push(e?"ui-button-icons-only":"ui-button-icon-only"),this.hasTitle||b.attr("title",c))):f.push("ui-button-text-only"),b.addClass(f.join(" "))}}),a.widget("ui.buttonset",{options:{items:":button, :submit, :reset, :checkbox, :radio, a, :data(button)"},_create:function(){this.element.addClass("ui-buttonset")},_init:function(){this.refresh()},_setOption:function(b,c){b==="disabled"&&this.buttons.button("option",b,c),a.Widget.prototype._setOption.apply(this,arguments)},refresh:function(){var b=this.element.css("direction")==="rtl";this.buttons=this.element.find(this.options.items).filter(":ui-button").button("refresh").end().not(":ui-button").button().end().map(function(){return a(this).button("widget")[0]}).removeClass("ui-corner-all ui-corner-left ui-corner-right").filter(":first").addClass(b?"ui-corner-right":"ui-corner-left").end().filter(":last").addClass(b?"ui-corner-left":"ui-corner-right").end().end()},destroy:function(){this.element.removeClass("ui-buttonset"),this.buttons.map(function(){return a(this).button("widget")[0]}).removeClass("ui-corner-left ui-corner-right").end().button("destroy"),a.Widget.prototype.destroy.call(this)}})})(jQuery);;/*! jQuery UI - v1.8.24 - 2012-09-28
* https://github.com/jquery/jquery-ui
* Includes: jquery.ui.dialog.js
* Copyright (c) 2012 AUTHORS.txt; Licensed MIT, GPL */
(function(a,b){var c="ui-dialog ui-widget ui-widget-content ui-corner-all ",d={buttons:!0,height:!0,maxHeight:!0,maxWidth:!0,minHeight:!0,minWidth:!0,width:!0},e={maxHeight:!0,maxWidth:!0,minHeight:!0,minWidth:!0};a.widget("ui.dialog",{options:{autoOpen:!0,buttons:{},closeOnEscape:!0,closeText:"close",dialogClass:"",draggable:!0,hide:null,height:"auto",maxHeight:!1,maxWidth:!1,minHeight:150,minWidth:150,modal:!1,position:{my:"center",at:"center",collision:"fit",using:function(b){var c=a(this).css(b).offset().top;c<0&&a(this).css("top",b.top-c)}},resizable:!0,show:null,stack:!0,title:"",width:300,zIndex:1e3},_create:function(){this.originalTitle=this.element.attr("title"),typeof this.originalTitle!="string"&&(this.originalTitle=""),this.options.title=this.options.title||this.originalTitle;var b=this,d=b.options,e=d.title||"&#160;",f=a.ui.dialog.getTitleId(b.element),g=(b.uiDialog=a("<div></div>")).appendTo(document.body).hide().addClass(c+d.dialogClass).css({zIndex:d.zIndex}).attr("tabIndex",-1).css("outline",0).keydown(function(c){d.closeOnEscape&&!c.isDefaultPrevented()&&c.keyCode&&c.keyCode===a.ui.keyCode.ESCAPE&&(b.close(c),c.preventDefault())}).attr({role:"dialog","aria-labelledby":f}).mousedown(function(a){b.moveToTop(!1,a)}),h=b.element.show().removeAttr("title").addClass("ui-dialog-content ui-widget-content").appendTo(g),i=(b.uiDialogTitlebar=a("<div></div>")).addClass("ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix").prependTo(g),j=a('<a href="#"></a>').addClass("ui-dialog-titlebar-close ui-corner-all").attr("role","button").hover(function(){j.addClass("ui-state-hover")},function(){j.removeClass("ui-state-hover")}).focus(function(){j.addClass("ui-state-focus")}).blur(function(){j.removeClass("ui-state-focus")}).click(function(a){return b.close(a),!1}).appendTo(i),k=(b.uiDialogTitlebarCloseText=a("<span></span>")).addClass("ui-icon ui-icon-closethick").text(d.closeText).appendTo(j),l=a("<span></span>").addClass("ui-dialog-title").attr("id",f).html(e).prependTo(i);a.isFunction(d.beforeclose)&&!a.isFunction(d.beforeClose)&&(d.beforeClose=d.beforeclose),i.find("*").add(i).disableSelection(),d.draggable&&a.fn.draggable&&b._makeDraggable(),d.resizable&&a.fn.resizable&&b._makeResizable(),b._createButtons(d.buttons),b._isOpen=!1,a.fn.bgiframe&&g.bgiframe()},_init:function(){this.options.autoOpen&&this.open()},destroy:function(){var a=this;return a.overlay&&a.overlay.destroy(),a.uiDialog.hide(),a.element.unbind(".dialog").removeData("dialog").removeClass("ui-dialog-content ui-widget-content").hide().appendTo("body"),a.uiDialog.remove(),a.originalTitle&&a.element.attr("title",a.originalTitle),a},widget:function(){return this.uiDialog},close:function(b){var c=this,d,e;if(!1===c._trigger("beforeClose",b))return;return c.overlay&&c.overlay.destroy(),c.uiDialog.unbind("keypress.ui-dialog"),c._isOpen=!1,c.options.hide?c.uiDialog.hide(c.options.hide,function(){c._trigger("close",b)}):(c.uiDialog.hide(),c._trigger("close",b)),a.ui.dialog.overlay.resize(),c.options.modal&&(d=0,a(".ui-dialog").each(function(){this!==c.uiDialog[0]&&(e=a(this).css("z-index"),isNaN(e)||(d=Math.max(d,e)))}),a.ui.dialog.maxZ=d),c},isOpen:function(){return this._isOpen},moveToTop:function(b,c){var d=this,e=d.options,f;return e.modal&&!b||!e.stack&&!e.modal?d._trigger("focus",c):(e.zIndex>a.ui.dialog.maxZ&&(a.ui.dialog.maxZ=e.zIndex),d.overlay&&(a.ui.dialog.maxZ+=1,d.overlay.$el.css("z-index",a.ui.dialog.overlay.maxZ=a.ui.dialog.maxZ)),f={scrollTop:d.element.scrollTop(),scrollLeft:d.element.scrollLeft()},a.ui.dialog.maxZ+=1,d.uiDialog.css("z-index",a.ui.dialog.maxZ),d.element.attr(f),d._trigger("focus",c),d)},open:function(){if(this._isOpen)return;var b=this,c=b.options,d=b.uiDialog;return b.overlay=c.modal?new a.ui.dialog.overlay(b):null,b._size(),b._position(c.position),d.show(c.show),b.moveToTop(!0),c.modal&&d.bind("keydown.ui-dialog",function(b){if(b.keyCode!==a.ui.keyCode.TAB)return;var c=a(":tabbable",this),d=c.filter(":first"),e=c.filter(":last");if(b.target===e[0]&&!b.shiftKey)return d.focus(1),!1;if(b.target===d[0]&&b.shiftKey)return e.focus(1),!1}),a(b.element.find(":tabbable").get().concat(d.find(".ui-dialog-buttonpane :tabbable").get().concat(d.get()))).eq(0).focus(),b._isOpen=!0,b._trigger("open"),b},_createButtons:function(b){var c=this,d=!1,e=a("<div></div>").addClass("ui-dialog-buttonpane ui-widget-content ui-helper-clearfix"),f=a("<div></div>").addClass("ui-dialog-buttonset").appendTo(e);c.uiDialog.find(".ui-dialog-buttonpane").remove(),typeof b=="object"&&b!==null&&a.each(b,function(){return!(d=!0)}),d&&(a.each(b,function(b,d){d=a.isFunction(d)?{click:d,text:b}:d;var e=a('<button type="button"></button>').click(function(){d.click.apply(c.element[0],arguments)}).appendTo(f);a.each(d,function(a,b){if(a==="click")return;a in e?e[a](b):e.attr(a,b)}),a.fn.button&&e.button()}),e.appendTo(c.uiDialog))},_makeDraggable:function(){function f(a){return{position:a.position,offset:a.offset}}var b=this,c=b.options,d=a(document),e;b.uiDialog.draggable({cancel:".ui-dialog-content, .ui-dialog-titlebar-close",handle:".ui-dialog-titlebar",containment:"document",start:function(d,g){e=c.height==="auto"?"auto":a(this).height(),a(this).height(a(this).height()).addClass("ui-dialog-dragging"),b._trigger("dragStart",d,f(g))},drag:function(a,c){b._trigger("drag",a,f(c))},stop:function(g,h){c.position=[h.position.left-d.scrollLeft(),h.position.top-d.scrollTop()],a(this).removeClass("ui-dialog-dragging").height(e),b._trigger("dragStop",g,f(h)),a.ui.dialog.overlay.resize()}})},_makeResizable:function(c){function h(a){return{originalPosition:a.originalPosition,originalSize:a.originalSize,position:a.position,size:a.size}}c=c===b?this.options.resizable:c;var d=this,e=d.options,f=d.uiDialog.css("position"),g=typeof c=="string"?c:"n,e,s,w,se,sw,ne,nw";d.uiDialog.resizable({cancel:".ui-dialog-content",containment:"document",alsoResize:d.element,maxWidth:e.maxWidth,maxHeight:e.maxHeight,minWidth:e.minWidth,minHeight:d._minHeight(),handles:g,start:function(b,c){a(this).addClass("ui-dialog-resizing"),d._trigger("resizeStart",b,h(c))},resize:function(a,b){d._trigger("resize",a,h(b))},stop:function(b,c){a(this).removeClass("ui-dialog-resizing"),e.height=a(this).height(),e.width=a(this).width(),d._trigger("resizeStop",b,h(c)),a.ui.dialog.overlay.resize()}}).css("position",f).find(".ui-resizable-se").addClass("ui-icon ui-icon-grip-diagonal-se")},_minHeight:function(){var a=this.options;return a.height==="auto"?a.minHeight:Math.min(a.minHeight,a.height)},_position:function(b){var c=[],d=[0,0],e;if(b){if(typeof b=="string"||typeof b=="object"&&"0"in b)c=b.split?b.split(" "):[b[0],b[1]],c.length===1&&(c[1]=c[0]),a.each(["left","top"],function(a,b){+c[a]===c[a]&&(d[a]=c[a],c[a]=b)}),b={my:c.join(" "),at:c.join(" "),offset:d.join(" ")};b=a.extend({},a.ui.dialog.prototype.options.position,b)}else b=a.ui.dialog.prototype.options.position;e=this.uiDialog.is(":visible"),e||this.uiDialog.show(),this.uiDialog.css({top:0,left:0}).position(a.extend({of:window},b)),e||this.uiDialog.hide()},_setOptions:function(b){var c=this,f={},g=!1;a.each(b,function(a,b){c._setOption(a,b),a in d&&(g=!0),a in e&&(f[a]=b)}),g&&this._size(),this.uiDialog.is(":data(resizable)")&&this.uiDialog.resizable("option",f)},_setOption:function(b,d){var e=this,f=e.uiDialog;switch(b){case"beforeclose":b="beforeClose";break;case"buttons":e._createButtons(d);break;case"closeText":e.uiDialogTitlebarCloseText.text(""+d);break;case"dialogClass":f.removeClass(e.options.dialogClass).addClass(c+d);break;case"disabled":d?f.addClass("ui-dialog-disabled"):f.removeClass("ui-dialog-disabled");break;case"draggable":var g=f.is(":data(draggable)");g&&!d&&f.draggable("destroy"),!g&&d&&e._makeDraggable();break;case"position":e._position(d);break;case"resizable":var h=f.is(":data(resizable)");h&&!d&&f.resizable("destroy"),h&&typeof d=="string"&&f.resizable("option","handles",d),!h&&d!==!1&&e._makeResizable(d);break;case"title":a(".ui-dialog-title",e.uiDialogTitlebar).html(""+(d||"&#160;"))}a.Widget.prototype._setOption.apply(e,arguments)},_size:function(){var b=this.options,c,d,e=this.uiDialog.is(":visible");this.element.show().css({width:"auto",minHeight:0,height:0}),b.minWidth>b.width&&(b.width=b.minWidth),c=this.uiDialog.css({height:"auto",width:b.width}).height(),d=Math.max(0,b.minHeight-c);if(b.height==="auto")if(a.support.minHeight)this.element.css({minHeight:d,height:"auto"});else{this.uiDialog.show();var f=this.element.css("height","auto").height();e||this.uiDialog.hide(),this.element.height(Math.max(f,d))}else this.element.height(Math.max(b.height-c,0));this.uiDialog.is(":data(resizable)")&&this.uiDialog.resizable("option","minHeight",this._minHeight())}}),a.extend(a.ui.dialog,{version:"1.8.24",uuid:0,maxZ:0,getTitleId:function(a){var b=a.attr("id");return b||(this.uuid+=1,b=this.uuid),"ui-dialog-title-"+b},overlay:function(b){this.$el=a.ui.dialog.overlay.create(b)}}),a.extend(a.ui.dialog.overlay,{instances:[],oldInstances:[],maxZ:0,events:a.map("focus,mousedown,mouseup,keydown,keypress,click".split(","),function(a){return a+".dialog-overlay"}).join(" "),create:function(b){this.instances.length===0&&(setTimeout(function(){a.ui.dialog.overlay.instances.length&&a(document).bind(a.ui.dialog.overlay.events,function(b){if(a(b.target).zIndex()<a.ui.dialog.overlay.maxZ)return!1})},1),a(document).bind("keydown.dialog-overlay",function(c){b.options.closeOnEscape&&!c.isDefaultPrevented()&&c.keyCode&&c.keyCode===a.ui.keyCode.ESCAPE&&(b.close(c),c.preventDefault())}),a(window).bind("resize.dialog-overlay",a.ui.dialog.overlay.resize));var c=(this.oldInstances.pop()||a("<div></div>").addClass("ui-widget-overlay")).appendTo(document.body).css({width:this.width(),height:this.height()});return a.fn.bgiframe&&c.bgiframe(),this.instances.push(c),c},destroy:function(b){var c=a.inArray(b,this.instances);c!=-1&&this.oldInstances.push(this.instances.splice(c,1)[0]),this.instances.length===0&&a([document,window]).unbind(".dialog-overlay"),b.remove();var d=0;a.each(this.instances,function(){d=Math.max(d,this.css("z-index"))}),this.maxZ=d},height:function(){var b,c;return a.browser.msie&&a.browser.version<7?(b=Math.max(document.documentElement.scrollHeight,document.body.scrollHeight),c=Math.max(document.documentElement.offsetHeight,document.body.offsetHeight),b<c?a(window).height()+"px":b+"px"):a(document).height()+"px"},width:function(){var b,c;return a.browser.msie?(b=Math.max(document.documentElement.scrollWidth,document.body.scrollWidth),c=Math.max(document.documentElement.offsetWidth,document.body.offsetWidth),b<c?a(window).width()+"px":b+"px"):a(document).width()+"px"},resize:function(){var b=a([]);a.each(a.ui.dialog.overlay.instances,function(){b=b.add(this)}),b.css({width:0,height:0}).css({width:a.ui.dialog.overlay.width(),height:a.ui.dialog.overlay.height()})}}),a.extend(a.ui.dialog.overlay.prototype,{destroy:function(){a.ui.dialog.overlay.destroy(this.$el)}})})(jQuery);;/*! jQuery UI - v1.8.24 - 2012-09-28
* https://github.com/jquery/jquery-ui
* Includes: jquery.ui.slider.js
* Copyright (c) 2012 AUTHORS.txt; Licensed MIT, GPL */
(function(a,b){var c=5;a.widget("ui.slider",a.ui.mouse,{widgetEventPrefix:"slide",options:{animate:!1,distance:0,max:100,min:0,orientation:"horizontal",range:!1,step:1,value:0,values:null},_create:function(){var b=this,d=this.options,e=this.element.find(".ui-slider-handle").addClass("ui-state-default ui-corner-all"),f="<a class='ui-slider-handle ui-state-default ui-corner-all' href='#'></a>",g=d.values&&d.values.length||1,h=[];this._keySliding=!1,this._mouseSliding=!1,this._animateOff=!0,this._handleIndex=null,this._detectOrientation(),this._mouseInit(),this.element.addClass("ui-slider ui-slider-"+this.orientation+" ui-widget"+" ui-widget-content"+" ui-corner-all"+(d.disabled?" ui-slider-disabled ui-disabled":"")),this.range=a([]),d.range&&(d.range===!0&&(d.values||(d.values=[this._valueMin(),this._valueMin()]),d.values.length&&d.values.length!==2&&(d.values=[d.values[0],d.values[0]])),this.range=a("<div></div>").appendTo(this.element).addClass("ui-slider-range ui-widget-header"+(d.range==="min"||d.range==="max"?" ui-slider-range-"+d.range:"")));for(var i=e.length;i<g;i+=1)h.push(f);this.handles=e.add(a(h.join("")).appendTo(b.element)),this.handle=this.handles.eq(0),this.handles.add(this.range).filter("a").click(function(a){a.preventDefault()}).hover(function(){d.disabled||a(this).addClass("ui-state-hover")},function(){a(this).removeClass("ui-state-hover")}).focus(function(){d.disabled?a(this).blur():(a(".ui-slider .ui-state-focus").removeClass("ui-state-focus"),a(this).addClass("ui-state-focus"))}).blur(function(){a(this).removeClass("ui-state-focus")}),this.handles.each(function(b){a(this).data("index.ui-slider-handle",b)}),this.handles.keydown(function(d){var e=a(this).data("index.ui-slider-handle"),f,g,h,i;if(b.options.disabled)return;switch(d.keyCode){case a.ui.keyCode.HOME:case a.ui.keyCode.END:case a.ui.keyCode.PAGE_UP:case a.ui.keyCode.PAGE_DOWN:case a.ui.keyCode.UP:case a.ui.keyCode.RIGHT:case a.ui.keyCode.DOWN:case a.ui.keyCode.LEFT:d.preventDefault();if(!b._keySliding){b._keySliding=!0,a(this).addClass("ui-state-active"),f=b._start(d,e);if(f===!1)return}}i=b.options.step,b.options.values&&b.options.values.length?g=h=b.values(e):g=h=b.value();switch(d.keyCode){case a.ui.keyCode.HOME:h=b._valueMin();break;case a.ui.keyCode.END:h=b._valueMax();break;case a.ui.keyCode.PAGE_UP:h=b._trimAlignValue(g+(b._valueMax()-b._valueMin())/c);break;case a.ui.keyCode.PAGE_DOWN:h=b._trimAlignValue(g-(b._valueMax()-b._valueMin())/c);break;case a.ui.keyCode.UP:case a.ui.keyCode.RIGHT:if(g===b._valueMax())return;h=b._trimAlignValue(g+i);break;case a.ui.keyCode.DOWN:case a.ui.keyCode.LEFT:if(g===b._valueMin())return;h=b._trimAlignValue(g-i)}b._slide(d,e,h)}).keyup(function(c){var d=a(this).data("index.ui-slider-handle");b._keySliding&&(b._keySliding=!1,b._stop(c,d),b._change(c,d),a(this).removeClass("ui-state-active"))}),this._refreshValue(),this._animateOff=!1},destroy:function(){return this.handles.remove(),this.range.remove(),this.element.removeClass("ui-slider ui-slider-horizontal ui-slider-vertical ui-slider-disabled ui-widget ui-widget-content ui-corner-all").removeData("slider").unbind(".slider"),this._mouseDestroy(),this},_mouseCapture:function(b){var c=this.options,d,e,f,g,h,i,j,k,l;return c.disabled?!1:(this.elementSize={width:this.element.outerWidth(),height:this.element.outerHeight()},this.elementOffset=this.element.offset(),d={x:b.pageX,y:b.pageY},e=this._normValueFromMouse(d),f=this._valueMax()-this._valueMin()+1,h=this,this.handles.each(function(b){var c=Math.abs(e-h.values(b));f>c&&(f=c,g=a(this),i=b)}),c.range===!0&&this.values(1)===c.min&&(i+=1,g=a(this.handles[i])),j=this._start(b,i),j===!1?!1:(this._mouseSliding=!0,h._handleIndex=i,g.addClass("ui-state-active").focus(),k=g.offset(),l=!a(b.target).parents().andSelf().is(".ui-slider-handle"),this._clickOffset=l?{left:0,top:0}:{left:b.pageX-k.left-g.width()/2,top:b.pageY-k.top-g.height()/2-(parseInt(g.css("borderTopWidth"),10)||0)-(parseInt(g.css("borderBottomWidth"),10)||0)+(parseInt(g.css("marginTop"),10)||0)},this.handles.hasClass("ui-state-hover")||this._slide(b,i,e),this._animateOff=!0,!0))},_mouseStart:function(a){return!0},_mouseDrag:function(a){var b={x:a.pageX,y:a.pageY},c=this._normValueFromMouse(b);return this._slide(a,this._handleIndex,c),!1},_mouseStop:function(a){return this.handles.removeClass("ui-state-active"),this._mouseSliding=!1,this._stop(a,this._handleIndex),this._change(a,this._handleIndex),this._handleIndex=null,this._clickOffset=null,this._animateOff=!1,!1},_detectOrientation:function(){this.orientation=this.options.orientation==="vertical"?"vertical":"horizontal"},_normValueFromMouse:function(a){var b,c,d,e,f;return this.orientation==="horizontal"?(b=this.elementSize.width,c=a.x-this.elementOffset.left-(this._clickOffset?this._clickOffset.left:0)):(b=this.elementSize.height,c=a.y-this.elementOffset.top-(this._clickOffset?this._clickOffset.top:0)),d=c/b,d>1&&(d=1),d<0&&(d=0),this.orientation==="vertical"&&(d=1-d),e=this._valueMax()-this._valueMin(),f=this._valueMin()+d*e,this._trimAlignValue(f)},_start:function(a,b){var c={handle:this.handles[b],value:this.value()};return this.options.values&&this.options.values.length&&(c.value=this.values(b),c.values=this.values()),this._trigger("start",a,c)},_slide:function(a,b,c){var d,e,f;this.options.values&&this.options.values.length?(d=this.values(b?0:1),this.options.values.length===2&&this.options.range===!0&&(b===0&&c>d||b===1&&c<d)&&(c=d),c!==this.values(b)&&(e=this.values(),e[b]=c,f=this._trigger("slide",a,{handle:this.handles[b],value:c,values:e}),d=this.values(b?0:1),f!==!1&&this.values(b,c,!0))):c!==this.value()&&(f=this._trigger("slide",a,{handle:this.handles[b],value:c}),f!==!1&&this.value(c))},_stop:function(a,b){var c={handle:this.handles[b],value:this.value()};this.options.values&&this.options.values.length&&(c.value=this.values(b),c.values=this.values()),this._trigger("stop",a,c)},_change:function(a,b){if(!this._keySliding&&!this._mouseSliding){var c={handle:this.handles[b],value:this.value()};this.options.values&&this.options.values.length&&(c.value=this.values(b),c.values=this.values()),this._trigger("change",a,c)}},value:function(a){if(arguments.length){this.options.value=this._trimAlignValue(a),this._refreshValue(),this._change(null,0);return}return this._value()},values:function(b,c){var d,e,f;if(arguments.length>1){this.options.values[b]=this._trimAlignValue(c),this._refreshValue(),this._change(null,b);return}if(!arguments.length)return this._values();if(!a.isArray(arguments[0]))return this.options.values&&this.options.values.length?this._values(b):this.value();d=this.options.values,e=arguments[0];for(f=0;f<d.length;f+=1)d[f]=this._trimAlignValue(e[f]),this._change(null,f);this._refreshValue()},_setOption:function(b,c){var d,e=0;a.isArray(this.options.values)&&(e=this.options.values.length),a.Widget.prototype._setOption.apply(this,arguments);switch(b){case"disabled":c?(this.handles.filter(".ui-state-focus").blur(),this.handles.removeClass("ui-state-hover"),this.handles.propAttr("disabled",!0),this.element.addClass("ui-disabled")):(this.handles.propAttr("disabled",!1),this.element.removeClass("ui-disabled"));break;case"orientation":this._detectOrientation(),this.element.removeClass("ui-slider-horizontal ui-slider-vertical").addClass("ui-slider-"+this.orientation),this._refreshValue();break;case"value":this._animateOff=!0,this._refreshValue(),this._change(null,0),this._animateOff=!1;break;case"values":this._animateOff=!0,this._refreshValue();for(d=0;d<e;d+=1)this._change(null,d);this._animateOff=!1}},_value:function(){var a=this.options.value;return a=this._trimAlignValue(a),a},_values:function(a){var b,c,d;if(arguments.length)return b=this.options.values[a],b=this._trimAlignValue(b),b;c=this.options.values.slice();for(d=0;d<c.length;d+=1)c[d]=this._trimAlignValue(c[d]);return c},_trimAlignValue:function(a){if(a<=this._valueMin())return this._valueMin();if(a>=this._valueMax())return this._valueMax();var b=this.options.step>0?this.options.step:1,c=(a-this._valueMin())%b,d=a-c;return Math.abs(c)*2>=b&&(d+=c>0?b:-b),parseFloat(d.toFixed(5))},_valueMin:function(){return this.options.min},_valueMax:function(){return this.options.max},_refreshValue:function(){var b=this.options.range,c=this.options,d=this,e=this._animateOff?!1:c.animate,f,g={},h,i,j,k;this.options.values&&this.options.values.length?this.handles.each(function(b,i){f=(d.values(b)-d._valueMin())/(d._valueMax()-d._valueMin())*100,g[d.orientation==="horizontal"?"left":"bottom"]=f+"%",a(this).stop(1,1)[e?"animate":"css"](g,c.animate),d.options.range===!0&&(d.orientation==="horizontal"?(b===0&&d.range.stop(1,1)[e?"animate":"css"]({left:f+"%"},c.animate),b===1&&d.range[e?"animate":"css"]({width:f-h+"%"},{queue:!1,duration:c.animate})):(b===0&&d.range.stop(1,1)[e?"animate":"css"]({bottom:f+"%"},c.animate),b===1&&d.range[e?"animate":"css"]({height:f-h+"%"},{queue:!1,duration:c.animate}))),h=f}):(i=this.value(),j=this._valueMin(),k=this._valueMax(),f=k!==j?(i-j)/(k-j)*100:0,g[d.orientation==="horizontal"?"left":"bottom"]=f+"%",this.handle.stop(1,1)[e?"animate":"css"](g,c.animate),b==="min"&&this.orientation==="horizontal"&&this.range.stop(1,1)[e?"animate":"css"]({width:f+"%"},c.animate),b==="max"&&this.orientation==="horizontal"&&this.range[e?"animate":"css"]({width:100-f+"%"},{queue:!1,duration:c.animate}),b==="min"&&this.orientation==="vertical"&&this.range.stop(1,1)[e?"animate":"css"]({height:f+"%"},c.animate),b==="max"&&this.orientation==="vertical"&&this.range[e?"animate":"css"]({height:100-f+"%"},{queue:!1,duration:c.animate}))}}),a.extend(a.ui.slider,{version:"1.8.24"})})(jQuery);;
},{}],7:[function(require,module,exports){
/*! 
 * jquery.event.drag - v 2.0.0 
 * Copyright (c) 2010 Three Dub Media - http://threedubmedia.com
 * Open Source MIT License - http://threedubmedia.com/code/license
 */
;(function(f){f.fn.drag=function(b,a,d){var e=typeof b=="string"?b:"",k=f.isFunction(b)?b:f.isFunction(a)?a:null;if(e.indexOf("drag")!==0)e="drag"+e;d=(b==k?a:d)||{};return k?this.bind(e,d,k):this.trigger(e)};var i=f.event,h=i.special,c=h.drag={defaults:{which:1,distance:0,not:":input",handle:null,relative:false,drop:true,click:false},datakey:"dragdata",livekey:"livedrag",add:function(b){var a=f.data(this,c.datakey),d=b.data||{};a.related+=1;if(!a.live&&b.selector){a.live=true;i.add(this,"draginit."+ c.livekey,c.delegate)}f.each(c.defaults,function(e){if(d[e]!==undefined)a[e]=d[e]})},remove:function(){f.data(this,c.datakey).related-=1},setup:function(){if(!f.data(this,c.datakey)){var b=f.extend({related:0},c.defaults);f.data(this,c.datakey,b);i.add(this,"mousedown",c.init,b);this.attachEvent&&this.attachEvent("ondragstart",c.dontstart)}},teardown:function(){if(!f.data(this,c.datakey).related){f.removeData(this,c.datakey);i.remove(this,"mousedown",c.init);i.remove(this,"draginit",c.delegate);c.textselect(true); this.detachEvent&&this.detachEvent("ondragstart",c.dontstart)}},init:function(b){var a=b.data,d;if(!(a.which>0&&b.which!=a.which))if(!f(b.target).is(a.not))if(!(a.handle&&!f(b.target).closest(a.handle,b.currentTarget).length)){a.propagates=1;a.interactions=[c.interaction(this,a)];a.target=b.target;a.pageX=b.pageX;a.pageY=b.pageY;a.dragging=null;d=c.hijack(b,"draginit",a);if(a.propagates){if((d=c.flatten(d))&&d.length){a.interactions=[];f.each(d,function(){a.interactions.push(c.interaction(this,a))})}a.propagates= a.interactions.length;a.drop!==false&&h.drop&&h.drop.handler(b,a);c.textselect(false);i.add(document,"mousemove mouseup",c.handler,a);return false}}},interaction:function(b,a){return{drag:b,callback:new c.callback,droppable:[],offset:f(b)[a.relative?"position":"offset"]()||{top:0,left:0}}},handler:function(b){var a=b.data;switch(b.type){case !a.dragging&&"mousemove":if(Math.pow(b.pageX-a.pageX,2)+Math.pow(b.pageY-a.pageY,2)<Math.pow(a.distance,2))break;b.target=a.target;c.hijack(b,"dragstart",a); if(a.propagates)a.dragging=true;case "mousemove":if(a.dragging){c.hijack(b,"drag",a);if(a.propagates){a.drop!==false&&h.drop&&h.drop.handler(b,a);break}b.type="mouseup"}case "mouseup":i.remove(document,"mousemove mouseup",c.handler);if(a.dragging){a.drop!==false&&h.drop&&h.drop.handler(b,a);c.hijack(b,"dragend",a)}c.textselect(true);if(a.click===false&&a.dragging){jQuery.event.triggered=true;setTimeout(function(){jQuery.event.triggered=false},20);a.dragging=false}break}},delegate:function(b){var a= [],d,e=f.data(this,"events")||{};f.each(e.live||[],function(k,j){if(j.preType.indexOf("drag")===0)if(d=f(b.target).closest(j.selector,b.currentTarget)[0]){i.add(d,j.origType+"."+c.livekey,j.origHandler,j.data);f.inArray(d,a)<0&&a.push(d)}});if(!a.length)return false;return f(a).bind("dragend."+c.livekey,function(){i.remove(this,"."+c.livekey)})},hijack:function(b,a,d,e,k){if(d){var j={event:b.originalEvent,type:b.type},n=a.indexOf("drop")?"drag":"drop",l,o=e||0,g,m;e=!isNaN(e)?e:d.interactions.length; b.type=a;b.originalEvent=null;d.results=[];do if(g=d.interactions[o])if(!(a!=="dragend"&&g.cancelled)){m=c.properties(b,d,g);g.results=[];f(k||g[n]||d.droppable).each(function(q,p){l=(m.target=p)?i.handle.call(p,b,m):null;if(l===false){if(n=="drag"){g.cancelled=true;d.propagates-=1}if(a=="drop")g[n][q]=null}else if(a=="dropinit")g.droppable.push(c.element(l)||p);if(a=="dragstart")g.proxy=f(c.element(l)||g.drag)[0];g.results.push(l);delete b.result;if(a!=="dropinit")return l});d.results[o]=c.flatten(g.results); if(a=="dropinit")g.droppable=c.flatten(g.droppable);a=="dragstart"&&!g.cancelled&&m.update()}while(++o<e);b.type=j.type;b.originalEvent=j.event;return c.flatten(d.results)}},properties:function(b,a,d){var e=d.callback;e.drag=d.drag;e.proxy=d.proxy||d.drag;e.startX=a.pageX;e.startY=a.pageY;e.deltaX=b.pageX-a.pageX;e.deltaY=b.pageY-a.pageY;e.originalX=d.offset.left;e.originalY=d.offset.top;e.offsetX=b.pageX-(a.pageX-e.originalX);e.offsetY=b.pageY-(a.pageY-e.originalY);e.drop=c.flatten((d.drop||[]).slice()); e.available=c.flatten((d.droppable||[]).slice());return e},element:function(b){if(b&&(b.jquery||b.nodeType==1))return b},flatten:function(b){return f.map(b,function(a){return a&&a.jquery?f.makeArray(a):a&&a.length?c.flatten(a):a})},textselect:function(b){f(document)[b?"unbind":"bind"]("selectstart",c.dontstart).attr("unselectable",b?"off":"on").css("MozUserSelect",b?"":"none")},dontstart:function(){return false},callback:function(){}};c.callback.prototype={update:function(){h.drop&&this.available.length&& f.each(this.available,function(b){h.drop.locate(this,b)})}};h.draginit=h.dragstart=h.dragend=c})(jQuery);
},{}],8:[function(require,module,exports){
var extend    = require('../helpers/util').extend,
    Component = require('./component');

Battery = function (props, breadboardController) {
  var range;

  Battery.parentConstructor.call(this, props, breadboardController);

  // if voltages are specified as an array, then if it has only value, set the
  // voltage to that value, otherwise set it to a random voltage between the first
  // and second values
  if (this.voltage && this.voltage.length) {
    if (this.voltage.length === 1) {
      this.voltage = this.voltage[0];
    } else {
      range = this.voltage[1] - this.voltage[0];
      this.voltage = this.voltage[0] + (Math.random() * range);
    }
  }
};

extend(Battery, Component, {
  addCiSoComponent: function (ciso) {
    var voltage = this.voltage || 0,
        nodes      = this.getNodes();

    ciso.addVoltageSource(this.UID, voltage, nodes[0], nodes[1]);
  }
});

module.exports = Battery;

},{"../helpers/util":30,"./component":11}],9:[function(require,module,exports){
//= require circuit/resistor
//= require circuit/variable-resistor
//= require circuit/component

/* FILE breadboard.js */

/*global sparks CiSo $ breadBoard window console*/

var util                  = require('../helpers/util'),
    Battery               = require('./battery'),
    Capacitor             = require('./capacitor'),
    FunctionGenerator     = require('./function-generator'),
    Inductor              = require('./inductor'),
    PowerLead             = require('./power-lead'),
    Resistor4band         = require('./resistor-4band'),
    Resistor              = require('./resistor'),
    VariableResistor      = require('./variable-resistor'),
    Component             = require('./component'),
    Wire                  = require('./wire'),
    workbenchController,


    defs = {
      rows            : 31,
      powerRailHoles  : 25
    },

    Hole,
    GhostHole,
    Strip,
    Breadboard;

////////////////////////////////////////////////////////////////////////////////
//// B R E A D - B O A R D - M O D E L /////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

//// BREADBOARD Prototype Model //////////////////////////////////////////////

Hole = function Hole( strip, name ){
  this.type ='hole';
  this.strip = strip;
  this.name = name;
  this.connections = [];
  return this;
};

Hole.prototype.nodeName = function() {
  return this.strip && this.strip.name;
};

Hole.prototype.getName = function() {
  return this.name;
};

GhostHole = function GhostHole(name) {
  this.name = name;
  return this;
};

GhostHole.prototype.nodeName = function() {
  return this.name;
};

GhostHole.prototype.getName = function() {
  return this.name;
};

Strip = function Strip( holes, name ){
  this.type ='strip';
  this.holes={};
  this.name = name;
  if (holes) {
    for (var i=0, l=holes; i < l; i++) {
      this.holes[''+i] = new Hole();
      this.holes[''+i].strip = this;
    }
  }
  return this;
};

Breadboard = function Breadboard(){
  var i, h, l, ll, a,
      side, sign,
      newStripL, newStripR,
      mapCode;

  this.type ='Breadboard';

  this.strips = [];
  this.components = {};
  this.holes = {};
  this.holeMap = {};
  this.faultyComponents = [];

  // Create power-rails
  this.powerRail = {
    left:{
      positive: new Strip( null, "powerPosL"),
      negative: new Strip( null, "gnd")
    },
    right:{
      positive: new Strip( null, "powerPosR" ),
      negative: new Strip( null, "gnd" )
    }
  };

  for (i=0, l=defs.powerRailHoles; i < l; i++) {
    for (side in this.powerRail) {
      if (!this.powerRail.hasOwnProperty(side)) continue;
      for (sign in this.powerRail[side]) {
        if (!this.powerRail[side].hasOwnProperty(sign)) continue;
        h = side + '_' + sign + i;
        this.powerRail[side][sign][h] = this.holes[h] = new Hole(this.powerRail[side][sign], h);
      }
    }
  }

  // Create board
  for (i=0, l=defs.rows; i < l; i++) {
    newStripL = this.makeStrip("L" + i);
    newStripR = this.makeStrip("R" + i);
    for (a=0, ll=5; a < ll; a++ ) {
      mapCode = String.fromCharCode(a+97)+i;
      newStripL.holes[mapCode] = this.holes[ mapCode ] = new Hole( newStripL, mapCode );
      mapCode = String.fromCharCode(a+102)+i;
      newStripR.holes[mapCode] = this.holes[ mapCode ] = new Hole( newStripR, mapCode );
    }
  }
};

Breadboard.prototype = {
  makeStrip: function (name) {
    var stripLen = this.strips.length;
    this.strips[ stripLen ] = new Strip(null, name);
    return this.strips[ stripLen ];
  },

  createGhostHole: function(hole) {
    return new GhostHole(hole);
  }
}

module.exports = Breadboard;

},{"../helpers/util":30,"./battery":8,"./capacitor":10,"./component":11,"./function-generator":12,"./inductor":13,"./power-lead":16,"./resistor":20,"./resistor-4band":19,"./variable-resistor":21,"./wire":22}],10:[function(require,module,exports){
var extend            = require('../helpers/util').extend,
    ReactiveComponent = require('./reactive-component');

Capacitor = function (props, breadboardController) {
  Capacitor.parentConstructor.call(this, props, breadboardController);
};

extend(Capacitor, ReactiveComponent, {

  getCapacitance: function () {
    return this.getComponentParameter('capacitance', this.capacitanceFromImpedance);
  },

  capacitanceFromImpedance: function (impedance, frequency) {
    return 1 / (impedance * 2 * Math.PI * frequency);
  },

  addCiSoComponent: function (ciso) {
    var capacitance = this.getCapacitance() || 0,
        nodes       = this.getNodes();
    ciso.addComponent(this.UID, "Capacitor", capacitance, nodes);
  },

  componentTypeName: "Capacitor",

  isEditable: true,

  editableProperty: {name: "capacitance", units: "F"},

  changeEditableValue: function(val) {
    this.capacitance = val;
  }
});

module.exports = Capacitor;

},{"../helpers/util":30,"./reactive-component":18}],11:[function(require,module,exports){
Component = function (props, breadboardController) {

  for (var i in props) {
    this[i]=props[i];
  }

  this.breadboardController = breadboardController;

  if (!this.label){
    this.label = !!this.UID.split("/")[1] ? this.UID.split("/")[1] : "";
  }

  if (typeof this.connections === "string") {
    this.connections = this.connections.replace(/ /g,'').split(",");
  }

  for (i in this.connections) {
    this.connections[i] = this.breadboardController.getHole(this.connections[i]);

    if (!!this.breadboardController.getHoles[this.connections[i]]) {
      this.breadboardController.getHoles[this.connections[i]].connections[this.breadboardController.getHoles[this.connections[i]].connections.length] = this;
    }
  }
  this._ensureFloat("resistance");
  this._ensureFloat("nominalResistance");
  this._ensureFloat("voltage");
  this._ensureFloat("capacitance");
  this._ensureFloat("inductance");
  this._ensureFloat("impedance");
  this.draggable = !!this.draggable;

  this.viewArguments = {
    type: this.type,
    UID: this.UID,
    connections: this.getLocation(),
    draggable: this.draggable
  };

  if (this.label) {
    this.viewArguments.label = this.label;
  }
};

Component.prototype = {
  setViewArguments: function (args) {
    for (var arg in args) {
      if (!args.hasOwnProperty(arg)) continue;
      this.viewArguments[arg] = args[arg];
    }
  },

  getViewArguments: function () {
    this.viewArguments.connections = this.getLocation(); // update location
    return this.viewArguments;
  },

  move: function (connections) {
    var i, j;
    for (i in this.connections) {
      for (j in this.connections[i].connections) {
        if (this.connections[i].connections[j] === this) {
          this.connections[i].connections = [];
        }
      }
      this.connections[i] = [];
    }
    this.connections = [];
    for (i in connections){
      this.connections[i] = this.breadboardController.getHoles[connections[i]];
      this.breadboardController.getHoles[connections[i]].connections[this.breadboardController.getHoles[connections[i]].connections.length] = this;
    }

    this.setViewArguments({connections: this.getLocation()});
  },

  destroy: function (){
    var i, j;
    for(i in this.connections){
      for(j in this.connections[i].connections ){
        if( this.connections[i].connections[j] === this ){
          this.connections[i].connections = [];
        }
      }
      this.connections[i] = [];
    }
    this.connections = [];
    this.breadboardController.deleteComponentFromMap(this.UID);
  },

  _ensureFloat: function (val) {
    if (this[val] && typeof this[val] === "string") {
      this[val] = parseFloat(this[val], 10);
    }
  },

  getNodes: function () {
    return $.map(this.connections, function (connection) {
      return connection.nodeName();
    });
  },

  // converts connections to string, for flash arguments
  getLocation: function () {
    return this.connections[0].getName() + "," + this.connections[1].getName();
  },

  canInsertIntoNetlist: function () {
    return true;
  },

  /**
    hasValidConnections: check that this component has connections that are valid for generating a QUCS netlist.

    The only check performed right now is that there be 2 connections, but this validity check could be enhanced
    to check, for example, that the two connections map to different nodes, etc.
  */
  hasValidConnections: function () {
    return this.connections.length === 2 || (this.type === "powerLead" && this.connections.length === 1);
  },

  getRequestedImpedance: function (spec, steps) {
    var min, max, factor, step, choosableSteps, i, len;

    if (typeof spec === 'string' || typeof spec === 'number') {
      return spec;
    }

    if (spec[0] !== 'uniform') {
      throw new Error("Only uniformly-distributed random impedances/resistances are supported right now; received " + spec);
    }
    if (spec.length < 3) throw new Error("Random impedance/resistance spec does not specify an upper and lower bound");
    if (typeof spec[1] !== 'number' || typeof spec[2] !== 'number') throw new Error("Random impedance/resistance spec lower and upper bound were not both numeric");

    min = Math.min(spec[1], spec[2]);
    max = Math.max(spec[1], spec[2]);

    // if steps array exists, it specifies allowable values, up to the order of magnitude
    if (steps) {
      // copy 'steps' array before sorting it so we don't modify the passed-in array
      steps = steps.slice().sort();

      factor = Math.pow(10, Math.orderOfMagnitude(min) - Math.orderOfMagnitude(steps[0]));
      choosableSteps = [];
      i = 0;
      len = steps.length;
      do {
        step = steps[i++] * factor;
        if (min <= step && step <= max) choosableSteps.push(step);

        if (i >= len) {
          factor *= 10;
          i = 0;
        }
      } while (step < max);

      if (choosableSteps.length > 0) {
        return choosableSteps[ Math.floor(Math.random() * choosableSteps.length) ];
      }
    }

    // if no steps were specified, or none were available between the requested min and max
    return min + Math.random() * (max - min);
  },

  addThisToFaults: function() {
    this.breadboardController.addFaultyComponent(this);
  },

  // used by the component edit view
  componentTypeName: "Component",

  // used by the component edit view
  isEditable: false,

  // used by the component edit view. Right now we assume any editable component
  // has only one single editable property. If we change this assumption, we may
  // want to set an array of properties
  //
  // Returns an array of the possible values this property can take
  getEditablePropertyValues: function() { return [0]; },
  // The name and base units of the editable property
  editableProperty: {name: "", units: ""},

  // used by the component edit view. Right now we assume any editable component
  // has only one single editable property. However, even if we have components with
  // multiple editable properties, we can keep this API and pass in an array
  changeEditableValue: function(val) { },

  serialize: function() {
    var jsonComp = {
      type: this.type,
      UID:  this.UID
    };

    if (this.label)             jsonComp.label = this.label;
    if (this.connections)       jsonComp.connections = this.getLocation();
    if (this.resistance)        jsonComp.resistance = this.resistance;
    if (this.nominalResistance) jsonComp.nominalResistance = this.nominalResistance;
    if (this.voltage)           jsonComp.voltage = this.voltage;
    if (this.amplitude)         jsonComp.amplitude = this.amplitude;
    if (this.frequencies)       jsonComp.frequencies = this.frequencies;
    if (this.initialFrequency)  jsonComp.initialFrequency = this.initialFrequency;
    if (this.frequency)         jsonComp.initialFrequency = this.frequency;
    if (this.capacitance)       jsonComp.capacitance = this.capacitance;
    if (this.inductance)        jsonComp.inductance = this.inductance;
    if (this.impedance)         jsonComp.impedance = this.impedance;
    if (this.draggable)         jsonComp.draggable = this.draggable;
    if (this.hidden)            jsonComp.hidden = this.hidden;

    return jsonComp;
  }

};

module.exports = Component;


},{}],12:[function(require,module,exports){
var extend              = require('../helpers/util').extend,
    Component           = require('./component'),
    LogEvent            = require('../models/log'),
    logController       = require('../controllers/log-controller');

FunctionGenerator = function (props, breadboardController, workbenchController) {
  FunctionGenerator.parentConstructor.call(this, props, breadboardController);

  this.workbenchController = workbenchController;

  this.amplitudeScaleFactor = 1;

  // NOTE on validation of initialFrequency.
  //
  // If the initial frequency is not in the frequencies we request QUCS to simulate, we only find out after we call
  // QUCS and get the simulation result back. It sounds like we're thereby missing an opportunity to validate
  // initialFrequency "up front" at object-creation time, but, really, we're not. From the perspective of an author
  // who creates a JSON circuit spec with such an invalid initialFrequency, the validation failure only occurs when
  // the student (or author) actually runs the activity, whether the validation is done when the FunctionGenerator
  // is created, or whether it is done when QUCS returns. Doing validation at object creation time (below) would
  // require pre-calculating the frequency list which QUCS generates from a sweep spec.
  this.frequency = props.initialFrequency;

  // get an initial frequency from the frequency-range specification, if one exists
  if ( ('undefined' === typeof this.frequency || this.frequency === null) && props.frequencies ) {
    if ('number' === typeof props.frequencies[0]) {
      this.frequency = props.frequencies[0];
    }
    else if (props.frequencies[0] === 'linear' || props.frequencies[0] === 'logarithmic') {
      this.frequency = props.frequencies[1];
    }
  }

  // store (and generate, if nec.) the set of possible frequencies, so that the view can slide through these
  if (props.frequencies) {
    if ('number' === typeof props.frequencies[0]) {
      this.possibleFrequencies = props.frequencies;
    }
    else if (props.frequencies[0] === 'linear' || props.frequencies[0] === 'logarithmic') {
      this.possibleFrequencies = this._calcPossibleFrequencies(props);
    }
  }

  // set a base frequency, so that we don't have to change NetList representation after changing frequency
  this.baseFrequency = this.frequency;

  if ('undefined' === typeof this.frequency || this.frequency === null) {
    throw new Error("FunctionGenerator: initialFrequency is undefined and an initial frequency could not be inferred from frequency range specification.");
  }

  var amplitude = props.amplitude;
  if ('number' === typeof amplitude){
    this.amplitude = amplitude;
  } else if (amplitude.length && amplitude.length >= 2) {
    this.minAmplitude = amplitude[0];
    this.maxAmplitude = amplitude[1];
    if (amplitude[2]) {
      this.amplitude = amplitude[2];
    } else {
      this.amplitude = (this.minAmplitude + this.maxAmplitude) / 2;
    }
  }
};

extend(FunctionGenerator, Component, {

  // for now, no validation on frequency. So we might set something QUCS isn't expecting from the given sim type
  setFrequency: function(frequency) {
    this.frequency = frequency;
    if (this.workbenchController.workbench.meter) {
      this.workbenchController.workbench.meter.update();
    }
    logController.addEvent(LogEvent.CHANGED_CIRCUIT, {
      "type": "changed frequency",
      "value": frequency
    });
  },

  // instead of modifying the base amplitude, which would cause us to re-ask QUCS for new values,
  // we simply modify a scale factor, which is read by all meters. This works so long as we have
  // linear circuits -- we'll need to revisit this for nonlinear circuits.
  setAmplitude: function(newAmplitude) {
    this.amplitudeScaleFactor = newAmplitude / this.amplitude;
    if (this.workbenchController.workbench.meter) {
      this.workbenchController.workbench.meter.update();
    }
    logController.addEvent(LogEvent.CHANGED_CIRCUIT, {
      "type": "changed amplitude",
      "value": newAmplitude
    });
  },

  getFrequency: function() {
    return this.frequency;
  },

  getAmplitude: function() {
    return this.amplitude * this.amplitudeScaleFactor;
  },

  getPossibleFrequencies: function() {
    return this.possibleFrequencies;
  },

  addCiSoComponent: function (ciso) {
    var amplitude   = this.amplitude || 0,
        nodes       = this.getNodes();

    ciso.addVoltageSource(this.UID,amplitude,nodes[0],nodes[1],this.frequency);
  },

  defaultFrequencySteps: 100,

  _calcPossibleFrequencies: function(props) {
    var startF   = props.frequencies[1],
        endF     = props.frequencies[2],
        steps    = props.frequencies[3],
        type     = props.frequencies[0],
        diff     = endF - startF,
        multiple = endF / startF,
        stepSize,
        i;

    var frequencies = [];
    if (type === 'linear') {
      stepSize = diff / (steps - 1);
      for (i = 0; i < steps; i++){
        frequencies.push(startF + (stepSize * i));
      }
    } else if (type === 'logarithmic') {
      for (i = 0; i < steps; i++){
        frequencies.push(startF * (Math.pow(multiple, ((i/(steps-1))))));
      }
    }
    return frequencies;
  },

  getViewArguments: null

});

module.exports = FunctionGenerator;

},{"../controllers/log-controller":24,"../helpers/util":30,"../models/log":35,"./component":11}],13:[function(require,module,exports){
var extend            = require('../helpers/util').extend,
    ReactiveComponent = require('./reactive-component');

Inductor = function (props, breadboardController) {
  Inductor.parentConstructor.call(this, props, breadboardController);
};

extend(Inductor, ReactiveComponent, {

  getInductance: function () {
    return this.getComponentParameter('inductance', this.inductanceFromImpedance);
  },

  inductanceFromImpedance: function (impedance, frequency) {
    return impedance / (2 * Math.PI * frequency);
  },

  addCiSoComponent: function (ciso) {
    var inductance = this.getInductance() || 0,
        nodes       = this.getNodes();
    ciso.addComponent(this.UID, "Inductor", inductance, nodes);
  },

  componentTypeName: "Inductor",

  isEditable: true,

  editableProperty: {name: "inductance", units: "H"},

  changeEditableValue: function(val) {
    this.inductance = val;
  }
});

module.exports = Inductor;

},{"../helpers/util":30,"./reactive-component":18}],14:[function(require,module,exports){
var workbenchController;

/*
 * Digital Multimeter
 * Base for the Centech DMM
 */
MultimeterBase = function () {
};

MultimeterBase.prototype = {

    modes : { ohmmeter : 0, voltmeter : 1, ammeter : 2 },

    init: function () {
        workbenchController   = require('../controllers/workbench-controller');

        this.mode = this.modes.ohmmeter;

        this.absoluteValue = 0;   // current absolute meter value
        this.value = 0;           // current real meter value
        
        this.displayText = '       ';

        this.redProbeConnection = null;
        this.blackProbeConnection = null;
        this.redPlugConnection = null;
        this.blackPlugConnecton = null;
        this.dialPosition = 'acv_750';
        this.powerOn = false;
        this.disabledPositions = [];
    },

    // @probe Either "red" or "black"
    // @location hole name (e.g. 'a1') or null
    setProbeLocation: function (probe, location) {
      if (probe === "probe_red") {
        this.redProbeConnection = location;
      } else if (probe === "probe_black") {
        this.blackProbeConnection = location;
      }
      this.update();
    },

    moveProbe: function(oldLoc, newLoc) {
      if (this.redProbeConnection === oldLoc) {
        this.redProbeConnection = newLoc;
      }
      if (this.blackProbeConnection === oldLoc) {
        this.blackProbeConnection = newLoc;
      }
      this.update();
    },

    update : function () {
    },

    updateDisplay : function () {
        var text = '',
            self = this,
            toSignedDisplayString = function (s, dec) {
              return self.toDisplayString((self.value < 0 ? '-' : '') + s, dec);
            },
            prependHV = function (s) {
              // if there is a leading negative place it in the second position so that both HV and the negative sign will display
              return s.substr(0, 1) === '-' ? 'h-' + text.substring(2) : 'h' + text.substring(1)
            },
            vm, imc, im;

        if (!this.powerOn) {
            this.displayText = '       ';
            return;
        }

        if (this.allConnected()) {
            if (this.dialPosition === 'dcv_20') {
                if (this.absoluteValue < 19.995) {
                    text = (Math.round(this.absoluteValue * 100) * 0.01).toString();
                    text = toSignedDisplayString(text, 2);
                }
                else {
                    text = ' 1 .   ';
                }
                this.currentUnits = "V";

            } else if (this.dialPosition === 'dcv_200') {
                if (this.absoluteValue < 199.95) {
                    text = (Math.round(this.absoluteValue * 10) * 0.1).toString();
                    text = toSignedDisplayString(text, 1);
                }
                else {
                    text = ' 1 .   ';
                }
                this.currentUnits = "V";

            } else if (this.dialPosition === 'dcv_1000') {
                 if (this.absoluteValue < 999.95) {
                    text = Math.round(this.absoluteValue).toString();
                    text = prependHV(toSignedDisplayString(text, 0));
                }
                else {
                    text = 'h1 .   ';
                }
                this.currentUnits = "V";

            } else if (this.dialPosition === 'dcv_2000m') {
                vm = this.absoluteValue * 1000;
                if (vm < 1999.5) {
                    text = Math.round(vm).toString();
                    text = toSignedDisplayString(text, 0);
                }
                else {
                    text = ' 1 .   ';
                }
                this.currentUnits = "mV";

            } else if (this.dialPosition === 'dcv_200m') {
                vm = this.absoluteValue * 1000;
                if (vm < 195){
                  text = (Math.round(vm * 100) * 0.01).toString();
                  text = toSignedDisplayString(text, 1);
                }
                else {
                    text = ' 1 .   ';
                }
                this.currentUnits = "mV";

            } else if (this.dialPosition === 'acv_200') {
                if (this.absoluteValue < 199.95) {
                    text = (Math.round(this.absoluteValue * 10) * 0.1).toString();
                    text = toSignedDisplayString(text, 1);
                }
                else {
                    text = ' 1 .   ';
                }
                this.currentUnits = "V";

            } else if (this.dialPosition === 'acv_750') {
                if (this.absoluteValue < 699.5) {
                    text = (Math.round(this.absoluteValue)).toString();
                    text = prependHV(toSignedDisplayString(text, 0));
                }
                else {
                    text = 'h1 .   ';
                }
                this.currentUnits = "V";

            } else if (this.dialPosition === 'r_200') {
                if (this.absoluteValue < 199.95) {
                    text = (Math.round(this.absoluteValue * 10) * 0.1).toString();
                    text = toSignedDisplayString(text, 1);
                }
                else {
                    text = ' 1   . ';
                }
                this.currentUnits = "Ohms";
            } else if (this.dialPosition === 'r_2000') {
                if (this.absoluteValue < 1999.5) {
                    text = Math.round(this.absoluteValue).toString();
                    text = toSignedDisplayString(text, 0);
                }
                else {
                    text = ' 1     ';
                }
                this.currentUnits = "Ohms";
            }
            else if (this.dialPosition === 'r_20k') {
                if (this.absoluteValue < 19995) {
                    text = (Math.round(this.absoluteValue * 0.1) * 0.01).toString();
                    text = toSignedDisplayString(text, 2);
                }
                else {
                    text = ' 1 .   ';
                }
                this.currentUnits = "kOhms";
            }
            else if (this.dialPosition === 'r_200k') {
                if (this.absoluteValue < 199950) {
                    text = (Math.round(this.absoluteValue * 0.01) * 0.1).toString();
                    text = toSignedDisplayString(text, 1);
                }
                else {
                    text = ' 1   . ';
                }
                this.currentUnits = "kOhms";
            }
            else if (this.dialPosition === 'r_2000k') {
                if (this.absoluteValue < 1999500) {
                    text = Math.round(this.absoluteValue * 0.001).toString();
                    text = toSignedDisplayString(text, 0);
                }
                else {
                    text = ' 1     ';
                }
                this.currentUnits = "kOhms";
            }
            else if (this.dialPosition === 'dca_200mc') {
              imc = this.absoluteValue * 1000000;
              if (imc < 195){
                text = (Math.round(imc * 100) * 0.01).toString();
                text = toSignedDisplayString(text, 1);
              }
              else {
                  text = ' 1     ';
              }
              this.currentUnits = "μA";
            }
            else if (this.dialPosition === 'dca_2000mc') {
              imc = this.absoluteValue * 1000000;
              if (imc < 1950){
                text = (Math.round(imc * 10) * 0.1).toString();
                text = toSignedDisplayString(text, 0);
              }
              else {
                  text = ' 1     ';
              }
              this.currentUnits = "μA";
            }
            else if (this.dialPosition === 'dca_20m') {
              im = this.absoluteValue * 1000;
              if (im < 19.5){
                text = (Math.round(im * 100) * 0.01).toString();
                text = toSignedDisplayString(text, 2);
              }
              else {
                  text = ' 1     ';
              }
              this.currentUnits = "mA";
            }
            else if (this.dialPosition === 'dca_200m') {
              im = this.absoluteValue * 1000;
              if (im < 195){
                text = (Math.round(im * 10) * 0.1).toString();
                text = toSignedDisplayString(text, 1);
              }
              else {
                  text = ' 1     ';
              }
              this.currentUnits = "mA";
            }
            else if (this.dialPosition === 'dcv_200m' || this.dialPosition === 'dcv_200' ||
                    this.dialPosition === 'acv_200' || this.dialPosition === 'p_9v' ||
                    this.dialPosition === 'dca_200mc' || this.dialPosition === 'dca_200m') {
                text = '  0 0.0';
            }
            else if (this.dialPosition === 'dcv_2000m' || this.dialPosition === 'dca_2000mc' ||
                    this.dialPosition === 'hfe') {
                text = '  0 0 0';
            }
            else if (this.dialPosition === 'dcv_20' || this.dialPosition === 'dca_20m' ||
                    this.dialPosition === 'c_10a') {
                text = '  0.0 0';
            }
            else if (this.dialPosition === 'dcv_1000' || this.dialPosition === 'acv_750') {
                text = 'h 0 0 0';
            }
            else if (this.dialPosition === 'diode') {
              text = ' 1     ';
            }
            else {
                text = '       ';
            }
        }
        else {    // if not connected
            if (this.dialPosition === 'dcv_20') {
                text = '  0.0 0';
            }
            else if (this.dialPosition === 'r_200') {
                text = ' 1   . ';
            }
            else if (this.dialPosition === 'r_2000' || this.dialPosition === 'diode') {
                text = ' 1     ';
            }
            else if (this.dialPosition === 'r_20k') {
                text = ' 1 .   ';
            }
            else if (this.dialPosition === 'r_200k') {
                text = ' 1   . ';
            }
            else if (this.dialPosition === 'r_2000k') {
                text = ' 1     ';
            }
            else if (this.dialPosition === 'dcv_200m' || this.dialPosition === 'dcv_200' ||
                    this.dialPosition === 'acv_200' || this.dialPosition === 'p_9v' ||
                    this.dialPosition === 'dca_200mc' || this.dialPosition === 'dca_200m') {
                text = '  0 0.0';
            }
            else if (this.dialPosition === 'dcv_2000m' || this.dialPosition === 'dca_2000mc' ||
                    this.dialPosition === 'hfe') {
                text = '  0 0 0';
            }
            else if (this.dialPosition === 'dcv_20' || this.dialPosition === 'dca_20m' ||
                    this.dialPosition === 'c_10a') {
                text = '  0.0 0';
            }
            else if (this.dialPosition === 'dcv_1000' || this.dialPosition === 'acv_750') {
                text = 'h 0 0 0';
            }
            else {
                text = '       ';
            }
        }
        text = this.disable_multimeter_position(text);
        if (text !== this.displayText) {
          if (workbenchController.breadboardView) {
            workbenchController.breadboardView.setDMMText(text);
          }
          this.displayText = text;
          this.currentValue = parseFloat(text.replace(/[^\d\.]/g, ""));
        }
    },


set_disable_multimeter_position: function (disabled) {
  this.disabledPositions = disabled.split(',');
  for(var i=0;i<this.disabledPositions.length;i++){
  }
},


    disable_multimeter_position : function (displayText) {
      var i;
      // how do I pass a variable from the "series" file into here?
      // something like: sparks.jsonSection.disable_multimeter_position  ??

      // right now this is hard wired to disable R dial positions
      switch (this.dialPosition)
      {
  case 'dcv_20':
  case 'dcv_200':
  case 'dcv_1000':
  case 'dcv_2000m':
  case 'dcv_200m':
    for(i=0;i<this.disabledPositions.length;i++){
      if(this.disabledPositions[i] == 'dcv'){
        displayText = '-------';
        break;
      }
    }
    break;
  case 'r_200':
  case 'r_2000':
  case 'r_20k':
  case 'r_200k':
  case 'r_2000k':
    for(i=0;i<this.disabledPositions.length;i++){
      if(this.disabledPositions[i] == 'r'){
        displayText = '-------';
        break;
      }
    }
    break;
  case 'dca_200mc':
  case 'dca_2000mc':
  case 'dca_20m':
  case 'dca_200m':
    for(i=0;i<this.disabledPositions.length;i++){
      if(this.disabledPositions[i] == 'dca'){
        displayText = '-------';
        break;
      }
    }
    break;
  case 'acv_750':
  case 'acv_200':
    for(i=0;i<this.disabledPositions.length;i++){
      if(this.disabledPositions[i] == 'acv'){
        displayText = '-------';
        break;
      }
    }
    break;
  case 'diode':
  case 'hfe':
  case 'c_10a':
  case 'p_9v':
  default:
      }
      return displayText;
    },

    toDisplayString : function (s, dec) {
        //console.log('s1=' + s + ' dec=' + dec);
        var i;
        var sign = s.charAt(0) === '-' ? s.charAt(0) : ' ';
        s = s.replace('-', '');

        //console.log('s2=' + s);
        var pointLoc = s.indexOf('.');
        var decLen = pointLoc == -1 ? 0 : s.substring(pointLoc+1).length;
        if (decLen === 0) {
            s = s.concat('.');
        }
        //console.log('s3=' + s);
        if (dec < decLen) {
            s = s.substring(0, pointLoc + dec + 1);
        }
        else {
            for (i = 0; i < dec - decLen; ++i) {
                s = s.concat('0');
            }
        }
        //console.log('s4=' + s);
        s = s.replace('.', '');
        //console.log('s5=' + s);
        var len = s.length;
        if (len < 4) {
            for (i = 0; i < 3 - len; ++i) {
                s = '0' + s;
            }
            s = ' ' + s;
        }
        //console.log('s6=' + s);

        var dot1;
        var dot2;

        switch (dec) {
        case 0:
            dot1 = ' ';
            dot2 = ' ';
            break;
        case 1:
            dot1 = ' ';
            dot2 = '.';
            break;
        case 2:
            dot1 = '.';
            dot2 = ' ';
            break;
        default:
            console.log('ERROR: invalid dec ' + dec);
        }

        s = sign + s.substring(0, 2) + dot1 + s.charAt(2) + dot2 + s.charAt(3);
        //console.log('s7=' + s);
        return s;

    },

    // Pad 0's to the number text
    // sig: number of significant digits
    // dec: number of digits after decimal points
    formatDecimalString : function (s, dec) {
        //console.log('s=' + s + ' dec=' + dec);
        var pointLoc = s.indexOf('.');
        //console.log('pointLoc=' + pointLoc);
        var decLen = pointLoc == -1 ? 0 : s.substring(pointLoc+1).length;
        //console.log('decLen=' + decLen);
        if (decLen === 0) {
            s = s.concat('.');
        }
        if (dec < decLen) {
            s = s.substring(0, pointLoc + dec + 1);
        }
        else {
            for (var i = 0; i < dec - decLen; ++i) {
                s = s.concat('0');
            }
        }
        //console.log('formatDecimalString: formatted=' + s);
        return s;
    },

    getDisplayText : function () {
        return this.displayText;
    },

    /*
     * Return value to be shown under optimal setting.
     * This value is to be compared with the student answer for grading.
     *
     * Take three significant digits, four if the first digit is 1.
     */
    makeDisplayText : function (value) {
        var text;
        if (value < 199.95) {
            text = (Math.round(value * 10) * 0.1).toString();
            text = this.formatDecimalString(text, 1);
        }
        else if (value < 1999.5) {
            text = Math.round(value).toString();
            text = this.formatDecimalString(text, 0);
        }
        else if (value < 19995) {
            text = (Math.round(value * 0.1) * 10).toString();
        }
        else if (value < 199950) {
            text = (Math.round(value * 0.01) * 100).toString();
        }
        else if (value < 1999500) {
            text = (Math.round(value * 0.001) * 1000).toString();
        }
        else {
            text = 'NaN';
        }
        return parseFloat(text);
    },

    allConnected : function () {
        return this.redProbeConnection !== null &&
            this.blackProbeConnection !== null &&
            this.redProbeConnection !== this.blackProbeConnection &&
            (this.redPlugConnection === 'voma_port' &&
             this.blackPlugConnection === 'common_port' ||
             this.redPlugConnection === 'common_port' &&
             this.blackPlugConnection === 'voma_port') &&
            this.powerOn;
    }
};

module.exports = MultimeterBase;

},{"../controllers/workbench-controller":25}],15:[function(require,module,exports){
require('../../lib/apMessageBox');

var LogEvent        = require('../models/log'),
    util            = require('../helpers/util'),
    logController   = require('../controllers/log-controller'),
    extend          = require('../helpers/util').extend,
    MultimeterBase  = require('./multimeter-base');

/*
 * Digital Multimeter for breadboard activities
 *
 */
Multimeter = function (breadboardController) {
  Multimeter.uber.init.apply(this);
  this.breadboardController = breadboardController;
  this.reset();
};

extend(Multimeter, MultimeterBase, {

  reset: function() {
    this.dialPosition = 'dcv_20';
    this.powerOn = true;
    this.redProbeConnection = null;
    this.blackProbeConnection = null;
    this.displayText = "";
    this.update();
  },

  currentMeasurement: null,

  update: function () {
    if (this.redProbeConnection && this.blackProbeConnection) {
      if (this.dialPosition.indexOf('dcv_') > -1){
        this.currentMeasurement = "voltage";
      } else if (this.dialPosition.indexOf('dca_') > -1){
        this.currentMeasurement = "current";
      } else if (this.dialPosition.indexOf('r_') > -1){
        this.currentMeasurement = "resistance";
      } else if (this.dialPosition.indexOf('acv_') > -1){
        this.currentMeasurement = "ac_voltage";
      } else {
        this.currentMeasurement = null;
      }

      if (!!this.currentMeasurement){
        this.breadboardController.query(this.currentMeasurement, this.redProbeConnection + ',' + this.blackProbeConnection, this.updateWithData, this);
      }
    } else {
      this.updateWithData();
    }
  },

  // this is called after update() is called and ciso returns
  updateWithData: function (ciso) {
    var measurement = this.currentMeasurement,
        source, b, p1, p2, v1, v2, current,
        result;

    if (ciso) {
      source = ciso.voltageSources[0],
      b  = this.breadboardController;
      p1 = b.getHole(this.redProbeConnection).nodeName();
      p2 = b.getHole(this.blackProbeConnection).nodeName();
      if (measurement === "resistance") {
        if (p1 === p2) {
          result = 0;
        } else {
          current = ciso.getCurrent('ohmmeterBattery');
          result = 1/current.magnitude;
        }
      } else if (measurement === "voltage" || measurement === "ac_voltage" || measurement === "current") {
          v1 = ciso.getVoltageAt(p1);   // complex
          v2 = ciso.getVoltageAt(p2);

        // exit quickly if ciso was not able to solve circuit
        if (!v1 || !v2) {
          this.value = 0;
          this.absoluteValue = 0;
          this.updateDisplay();
          return;
        }

        switch (measurement) {
          case "voltage":
            result = v1.real - v2.real;
            break;
          case "ac_voltage":
            result = v1.subtract(v2).magnitude;
            break;
          case "current":
            result = v1.subtract(v2).magnitude / 1e-6
            break;
        }
      }

      if (result){
        // if in wrong voltage mode for AC/DC voltage, show zero
        source = this.breadboardController.getComponents().source;
        if (!!source &&
           ((measurement === 'voltage' && source.frequency) ||
            (measurement === 'ac_voltage' && source.frequency === 0))) {
          result = 0;
        } else if (measurement === "ac_voltage" ||
                    (measurement === 'current' && source && source.frequency)){
          // the following applies to both RMS voltage and RMS current
          // first, if we are dealing with a function generator, scale by the appropriate scale factor
          if (!!source.amplitudeScaleFactor || source.amplitudeScaleFactor === 0){
            result = result * source.amplitudeScaleFactor;
          }
          result = result / Math.sqrt(2);         // RMS voltage or RMS current
        }
        result = Math.round(result*Math.pow(10,8))/Math.pow(10,8);

        // track both the value and the absolute value.  the absolute value lets us
        // make simpler one-sided comparisons to zero and the value lets us display
        // the negative sign
        this.value = result;
        this.absoluteValue = Math.abs(result);

        if (measurement === "current" && this.absoluteValue > 0.44){
          this.blowFuse();
        }
      } else {
        this.absoluteValue = 0;
      }
    } else {
      this.absoluteValue = 0;
    }

    this.updateDisplay();

    if (this.redProbeConnection && this.blackProbeConnection) {
      logController.addEvent(LogEvent.DMM_MEASUREMENT, {
        "measurement": measurement,
        "dial_position": this.dialPosition,
        "red_probe": this.redProbeConnection,
        "black_probe": this.blackProbeConnection,
        "result": this.displayText
      });
    }
  },

  blowFuse: function() {
    apMessageBox.error({
      title: "POW!",
      message: "<b>You just blew the fuse in your multimeter!</b><br><br> Remember not to pass too much current through it."+
      " We've replaced your fuse for you, but you lost some time.",
      errorImage: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAG10lEQVRYw71Xb2ib5Rb/nTQxTdokq123Ot2WNHVztTSSMoejZYQisusQZhdXLhQs84IfLniloOiQsQ+CA8XrFwfDD7IvBXuxH9ReQV1L6wqmNC7jdhdv2zVYR7tu3ZK8b5O+Sc577oe3b9osSe3uvdwHDs/h/T1/zvM7z3Pec4iZsZ2WX1523R8a+oMyMhLKxGIBbX6+SXI5NwCQzZay+3w3HYFAzBUKjdSdPDls3bVL2dbCzAxd1wv9Zp2ZoUQizTPd3ZciVmsqCugzgH7L7eaV1lY98dxznDh6lFdaWvRbHg/PAHoU0CNWa2qmu/uSEok0/976VIkBTiYdC/3951Y+//wvtSK23X4/POEw6NgxYP9+IJ8HstkN0TQgHodMTCB55QpuLyxAJcrVv/rqX/d+9NH5Ko8nU24fYmYQEUQERAQAWJ2a8s+Fw39DPN62b+9eeN55h/D880L5PCGbhWSzQtksSTYryGZh6pTLGbimCaamKPnll/Lr8jLg9V73Dw6eqmlvnwNQ2EtESg1QfvwxMHvixN9rU6lG3+nTUnX2LMhqJXPTsgbkcuXxdFp4eBjzk5Okut1LzV9/fdzV0RErMcBs6WjU/6+urvEdirLb+/bbQG9vMc0PSi63NW7Kzz8jPjaGhMt1+8APP3Q6g8G5EhfkEwnHjWBwwhGPB5rffFOot7eU4myWkMtVdsFWDE1Py+zUFGW83lhLNHrUumNHRkRgMX2y0N9/DvF4m++FFwSvvAJRFIGiAIpi6KoKUVUxv5fg631BV1WBqgKqauCNjfA98YQgHm9b6O8/JyIbDKSnppr/eeTIP5rr6myey5eBRx4ppZkZOHQIuH4dSCTKU+12A0eOAENDwOpqKb62huS1a5jN5XKHfvqp1dnePmsBgKULF96qFbF5enuJRAiqClJVgqoCigJKpwnt7aBgkKiri6DrIEUhKAoKY6urQWfOEB0/Tjh9GqRpZDJkjqV0mjz19VQrYlu6cOEtACBtcdEV27v3lt/trtnx6aeASLHVug50dgJPPw1YLMbNmZkBPvwQWFkxvu3ZA7zxBuDzmdENGB42xqhq8WXVNCSWlzFnsawGFhYer/qz339y9auv/ri/qwuWAweIMhlCJgOzxzPPgA4fJlgsoPWGRx8F1dYSPv4YuHsX9P77hJaWDZwI1NxsMPjNN6BkkpBMgpJJolSK7CK4o+t2m99/3aqMjIRcAKilBVCU4tNPTwOffWZIZ2dxCAuFgIEBwOMBgsHSEBeLAZ98Aty9Wxr9ALgAKCMjoao/5fNnPcnk47UvvmiE00zGkCtXgG+/Be7dM/pnnwX27SteyecDHnusdPNoFAiHgXi84j9IA5DK59mizc83VdfVGbSrKpGqEr7/HnT1KhUsXloi9PSAxseJjAOAzLi9SSeAKBolhMOgeJw2nXgDX9erAdLm55ssksu5qxwOMd+rRKOCSAQCiLmAAIKlJUhPj8j4uKzHjg18XZdoVCQcFsTjpfPXe1OvAkRyObe1wImiGLd6bKzyv7u6GqipqYwnk8b7f4hmIZstxWtrxjsdGyPK52kzbQXd6wUNDhIFg5VdEAoRDQwQGhpK5z/gAgaIbLaUxe7z3VxTVcEvv0Du3JHNdBUo9HoFg4OQYHADL+cCQCQUEgwMQBoatnTBGiB2n++mxREIxNKZDGF6usjCwgnWT45gcOOdm3g0CoyPY/PFJCJCKASTiUoMpAFyBAIxiysUGlFEIJpW3kl9fUBbW+Wn1tMDjI+X4p2dwJkzZZcUAAoAVyg0Am1x0RWxWlMrRgAtFbud+eJFZk3jQpucZPZ6N8Y0NjKPjm7gmmbMsduL13I6mQMBXgE4YrWmtMVFF5gZM93dl24Yg3Qd0Blgs2eAdbtd54sXWdc0XZ+c1NnrLcYBnRsbWR8d1XVNM8ba7cV4QwPrp07pfPiwfgPgme7uS2yYZWS+EaK1e5VYMJk4f7745A9KYyPzu++WnvzJJ5lfe4359df5ntPJEaI1M2MGM4OZMdfX98E1gLNbGfGwQsTc0cHc38/83nucbW3lawDP9fV9YO5bPiUDhAAyn4ypmzdYtoPX1JC89JLg4EGQ00kyOiqzw8MlKVn5pDSV2u3Ff9EOHgRefhnYuRNwOIDvvkN8aAgJt7tyUlo2LQek6mEYqKsjnDgBaW8XcjpJdF348mXMT0xsnZZvWZgA8BgbVzagoYHk2DGhjg6CywWxWgUTE5T84gv59f793y9MtlWaAfAQgZxOoL7eoHfPHuCpp4CmJmPSb79BYjEkr17F7URiW6XZf1acArxSXa0ndu7kxK5dvOJy6beI/rfF6f+rPP83fLrQt4Oy8N0AAAAASUVORK5CYII=",
      width: 400,
      height: 300
    });
    logController.addEvent(LogEvent.BLEW_FUSE);
  },

  allConnected: function () {
      return this.redProbeConnection !== null &&
          this.blackProbeConnection !== null &&
          this.powerOn;
  },

  _getResultsIndex: function (results) {
    var i = 0,
        source = this.breadboardController.getComponents().source;
    if (source && source.setFrequency && results.acfrequency){
      i = util.getClosestIndex(results.acfrequency, source.frequency, true);
    }
    return i;
  }
});

module.exports = Multimeter;

},{"../../lib/apMessageBox":5,"../controllers/log-controller":24,"../helpers/util":30,"../models/log":35,"./multimeter-base":14}],16:[function(require,module,exports){
var extend    = require('../helpers/util').extend,
    Component = require('./component');

PowerLead = function (props, breadboardController) {
  PowerLead.parentConstructor.call(this, props, breadboardController);
};

extend(PowerLead, Component, {

  getColor: function () {
    var location = this.getLocation();
    if (location.indexOf("positive") > -1) {
      return "redPowerWire";
    } else {
      return "blackPowerWire";
    }
  },

  getLocation: function () {
    return this.connections[0].getName() + ",a1";       // Flash coding issue means we need to give this a second argument...
  },

  addCiSoComponent: function () { },

  getViewArguments: null
});

module.exports = PowerLead;

},{"../helpers/util":30,"./component":11}],17:[function(require,module,exports){

// Allowable resistance values

r_values = {};

// For 1% tolerance (5-band)
r_values.r_values5band1pct = [
    1.00, 1.02, 1.05, 1.07, 1.10, 1.13, 1.15, 1.18, 1.21, 1.24, 1.27,
    1.30, 1.33, 1.37, 1.40, 1.43, 1.47, 1.50, 1.54, 1.58, 1.62, 1.65, 1.69,
    1.74, 1.78, 1.82, 1.87, 1.91, 1.96,
    2.00, 2.05, 2.10, 2.15, 2.21, 2.26, 2.32, 2.37, 2.43, 2.49, 2.55, 2.61,
    2.67, 2.74, 2.80, 2.87, 2.94,
    3.01, 3.09, 3.16, 3.24, 3.32, 3.40, 3.48, 3.57, 3.65, 3.74, 3.83, 3.92,
    4.02, 4.12, 4.22, 4.32, 4.42, 4.53, 4.64, 4.75, 4.87, 4.99,
    5.11, 5.23, 5.36, 5.49, 5.62, 5.76, 5.90, 6.04, 6.19, 6.34, 6.49, 6.65,
    6.81, 6.98, 7.15, 7.32, 7.50, 7.68, 7.87, 8.06, 8.25, 8.45, 8.66, 8.87,
    9.09, 9.31, 9.53, 9.76, 10.0, 10.2, 10.5, 10.7, 11.0, 11.3, 11.5, 11.8,
    12.1, 12.4, 12.7, 13.0, 13.3, 13.7, 14.0, 14.3, 14.7,
    15.0, 15.4, 15.8, 16.2, 16.5, 16.9, 17.4, 17.8, 18.2, 18.7, 19.1, 19.6,
    20.0, 20.5, 21.0, 21.5, 22.1, 22.6, 23.2, 23.7, 24.3, 24.9, 25.5, 26.1,
    26.7, 27.4, 28.0, 28.7, 29.4, 30.1, 30.9, 31.6, 32.4, 33.2, 34.0, 34.8,
    35.7, 36.5, 37.4, 38.3, 39.2, 40.2, 41.2, 42.2, 43.2, 44.2, 45.3, 46.4,
    47.5, 48.7, 49.9, 51.1, 52.3, 53.6, 54.9, 56.2, 57.6, 59.0,
    60.4, 61.9, 63.4, 64.9, 66.5, 68.1, 69.8, 71.5, 73.2, 75.0, 76.8, 78.7,
    80.6, 82.5, 84.5, 86.6, 88.7, 90.9, 93.1, 95.3, 97.6,
    100, 102, 105, 107, 110, 113, 115, 118, 121, 124,
    127, 130, 133, 137, 140, 143, 147, 150, 154, 158, 162, 165, 169,
    174, 178, 182, 187, 191, 196,
    200, 205, 210, 215, 221, 226, 232, 237, 243, 249, 255, 261, 267, 274,
    280, 287, 294, 301, 309, 316, 324, 332, 340, 348, 357, 365, 374, 383,
    392, 402, 412, 422, 432, 442, 453, 464, 475, 487, 499,
    511, 523, 536, 549, 562,
    576, 590, 604, 619, 634, 649, 665, 681, 698, 715, 732, 750, 768, 787,
    806, 825, 845, 866, 887, 909, 931, 953, 976,
    1000, 1020, 1050, 1070, 1100, 1130, 1150, 1180, 1210, 1240, 1270,
    1300, 1330, 1370, 1400, 1430, 1470, 1500, 1540, 1580, 1620, 1650, 1690,
    1740, 1780, 1820, 1870, 1910, 1960, 2000, 2050, 2100, 2150, 2210, 2260,
    2320, 2370, 2430, 2490, 2550, 2610, 2670, 2740, 2800, 2870, 2940,
    3010, 3090, 3160, 3240, 3320, 3400, 3480, 3570, 3650, 3740, 3830, 3920,
    4020, 4120, 4220, 4320, 4420, 4530, 4640, 4750, 4870, 4990,
    5110, 5230, 5360, 5490, 5620, 5760, 5900,
    6040, 6190, 6340, 6490, 6650, 6810, 6980, 7150, 7320, 7500, 7680, 7870,
    8060, 8250, 8450, 8660, 8870, 9090, 9310, 9530, 9760,
    10000, 10200, 10500, 10700, 11000, 11300, 11500, 11800, 12100, 12400,
    12700, 13000, 13300, 13700, 14000, 14300, 14700, 15000, 15400, 15800,
    16200, 16500, 16900, 17400, 17800, 18200, 18700, 19100, 19600,
    20000, 20500, 21000, 21500, 22100, 22600, 23200, 23700, 24300, 24900,
    25500, 26100, 26700, 27400, 28000, 28700, 29400, 30100, 30900, 31600,
    32400, 33200, 34000, 34800, 35700, 36500, 37400, 38300, 39200,
    40200, 41200, 42200, 43200, 44200, 45300, 46400, 47500, 48700, 49900,
    51100, 52300, 53600, 54900, 56200, 57600, 59000, 60400, 61900, 63400,
    64900, 66500, 68100, 69800, 71500, 73200, 75000, 76800, 78700,
    80600, 82500, 84500, 86600, 88700, 90900, 93100, 95300, 97600,
    100e3, 102e3, 105e3, 107e3, 110e3, 113e3, 115e3, 118e3, 121e3, 124e3,
    127e3, 130e3, 133e3, 137e3, 140e3, 143e3, 147e3, 150e3, 154e3, 158e3,
    162e3, 165e3, 169e3, 174e3, 178e3, 182e3, 187e3, 191e3, 196e3,
    200e3, 205e3, 210e3, 215e3, 221e3, 226e3, 232e3, 237e3, 243e3, 249e3,
    255e3, 261e3, 267e3, 274e3, 280e3, 287e3, 294e3,
    301e3, 309e3, 316e3, 324e3, 332e3, 340e3, 348e3, 357e3, 365e3, 374e3,
    383e3, 392e3,
    402e3, 412e3, 422e3, 432e3, 442e3, 453e3, 464e3, 475e3, 487e3, 499e3,
    511e3, 523e3, 536e3, 549e3, 562e3,
    576e3, 590e3, 604e3, 619e3, 634e3, 649e3, 665e3, 681e3, 698e3,
    715e3, 732e3, 750e3, 768e3, 787e3, 806e3, 825e3, 845e3, 866e3, 887e3,
    909e3, 931e3, 953e3, 976e3,
    1.00e6, 1.02e6, 1.05e6, 1.07e6, 1.10e6, 1.13e6, 1.15e6, 1.18e6,
    1.21e6, 1.24e6, 1.27e6, 1.30e6, 1.33e6, 1.37e6, 1.40e6, 1.43e6, 1.47e6,
    1.50e6, 1.54e6, 1.58e6, 1.62e6, 1.65e6, 1.69e6, 1.74e6, 1.78e6,
    1.82e6, 1.87e6, 1.91e6, 1.96e6,
    2.00e6, 2.05e6, 2.10e6, 2.15e6, 2.21e6, 2.26e6, 2.32e6, 2.37e6,
    2.43e6, 2.49e6, 2.55e6, 2.61e6, 2.67e6, 2.74e6, 2.80e6, 2.87e6, 2.94e6,
    3.01e6, 3.09e6, 3.16e6, 3.24e6, 3.32e6, 3.40e6, 3.48e6, 3.57e6, 3.65e6,
    3.74e6, 3.83e6, 3.92e6,
    4.02e6, 4.12e6, 4.22e6, 4.32e6, 4.42e6, 4.53e6, 4.64e6, 4.75e6, 4.87e6,
    4.99e6, 5.11e6, 5.23e6, 5.36e6, 5.49e6, 5.62e6, 5.76e6, 5.90e6,
    6.04e6, 6.19e6, 6.34e6, 6.49e6, 6.65e6, 6.81e6, 6.98e6,
    7.15e6, 7.32e6, 7.50e6, 7.68e6, 7.87e6, 8.06e6, 8.25e6, 8.45e6, 8.66e6,
    8.87e6, 9.09e6, 9.31e6, 9.53e6, 9.76e6,
    10.0e6, 10.2e6, 10.5e6, 10.7e6, 11.0e6, 11.3e6, 11.5e6, 11.8e6,
    12.1e6, 12.4e6, 12.7e6, 13.0e6, 13.3e6, 13.7e6, 14.0e6, 14.3e6, 14.7e6,
    15.0e6, 15.4e6, 15.8e6, 16.2e6, 16.5e6, 16.9e6, 17.4e6, 17.8e6,
    18.2e6, 18.7e6, 19.1e6, 19.6e6, 20.0e6, 20.5e6, 21.0e6, 21.5e6,
    22.1e6, 22.6e6, 23.2e6, 23.7e6, 24.3e6, 24.9e6, 25.5e6, 26.1e6, 26.7e6,
    27.4e6, 28.0e6, 28.7e6, 29.4e6, 30.1e6, 30.9e6, 31.6e6, 32.4e6, 33.2e6,
    34.0e6, 34.8e6, 35.7e6, 36.5e6, 37.4e6, 38.3e6, 39.2e6,
    40.2e6, 41.2e6, 42.2e6, 43.2e6, 44.2e6, 45.3e6, 46.4e6, 47.5e6, 48.7e6,
    49.9e6, 51.1e6, 52.3e6, 53.6e6, 54.9e6, 56.2e6, 57.6e6, 59.0e6,
    60.4e6, 61.9e6, 63.4e6, 64.9e6, 66.5e6, 68.1e6, 69.8e6, 71.5e6, 73.2e6,
    75.0e6, 76.8e6, 78.7e6, 80.6e6, 82.5e6, 84.5e6, 86.6e6, 88.7e6,
    90.9e6, 93.1e6, 95.3e6, 97.6e6,
    100e6, 102e6, 105e6, 107e6, 110e6, 113e6, 115e6, 118e6, 121e6, 124e6,
    127e6, 130e6, 133e6, 137e6, 140e6, 143e6, 147e6, 150e6, 154e6, 158e6,
    162e6, 165e6, 169e6, 174e6, 178e6, 182e6, 187e6, 191e6, 196e6, 200e6
];

// For 2% tolerance (5-band)
r_values.r_values5band2pct = [
    1.00, 1.05, 1.10, 1.15, 1.21, 1.27, 1.33, 1.40,
    1.47, 1.54, 1.62, 1.69, 1.78, 1.87, 1.96,
    2.05, 2.15, 2.26, 2.37, 2.49, 2.61, 2.74, 2.87,
    3.01, 3.16, 3.32, 3.48, 3.65, 3.83, 4.02, 4.22, 4.42, 4.64, 4.87,
    5.11, 5.36, 5.62, 5.90, 6.19, 6.49, 6.81, 7.15, 7.50, 7.87,
    8.25, 8.66, 9.09, 9.53, 10.0, 10.5, 11.0, 11.5, 12.1, 12.7, 13.3,
    14.0, 14.7, 15.4, 16.2, 16.9, 17.8, 18.7, 19.6,
    20.5, 21.5, 22.6, 23.7, 24.9, 26.1, 27.4,
    28.7, 30.1, 31.6, 33.2, 34.8, 36.5, 38.3, 40.2, 42.2, 44.2, 46.4, 48.7,
    51.1, 53.6, 56.2, 59.0, 61.9, 64.9, 68.1, 71.5, 75.0, 78.7, 82.5, 86.6,
    90.9, 95.3, 100, 105, 110, 115, 121, 127, 133, 140, 147, 154, 162, 169,
    178, 187, 196, 205, 215, 226, 237, 249, 261, 274, 287,
    301, 316, 332, 348, 365, 383, 402, 422, 442, 464, 487,
    511, 536, 562, 590, 619, 649, 681, 715, 750, 787, 825, 866, 909, 953,
    1000, 1050, 1100, 1150, 1210, 1270, 1330, 1400, 1470, 1540, 1620, 1690,
    1780, 1870, 1960, 2050, 2150, 2260, 2370, 2490, 2610, 2740, 2870,
    3010, 3160, 3320, 3480, 3650, 3830,
    4020, 4220, 4420, 4640, 4870, 5110, 5360, 5620, 5900, 6190, 6490, 6810,
    7150, 7500, 7870, 8250, 8660, 9090, 9530,
    10000, 10500, 11000, 11500, 12100, 12700, 13300, 14000, 14700, 15400,
    16200, 16900, 17800, 18700, 19600,
    20500, 21500, 22600, 23700, 24900, 26100, 27400, 28700,
    30100, 31600, 33200, 34800, 36500, 38300,
    40200, 42200, 44200, 46400, 48700,
    51100, 53600, 56200, 59000, 61900, 64900, 68100, 71500, 75000, 78700,
    82500, 86600, 90900, 95300, 100e3, 105e3, 110e3, 115e3, 121e3, 127e3,
    133e3, 140e3, 147e3, 154e3, 162e3, 169e3, 178e3, 187e3, 196e3,
    205e3, 215e3, 226e3, 237e3, 249e3, 261e3, 274e3, 287e3,
    301e3, 316e3, 332e3, 348e3, 365e3, 383e3, 402e3, 422e3, 442e3, 464e3,
    487e3, 511e3, 536e3, 562e3, 590e3, 619e3, 649e3, 681e3,
    715e3, 750e3, 787e3,
    825e3, 866e3, 909e3, 953e3, 1e6, 1.05e6, 1.1e6, 1.15e6, 1.21e6, 1.27e6,
    1.33e6, 1.40e6, 1.47e6, 1.54e6, 1.62e6, 1.69e6, 1.78e6, 1.87e6, 1.96e6,
    2.05e6, 2.15e6, 2.26e6, 2.37e6, 2.49e6, 2.61e6, 2.74e6, 2.87e6,
    3.01e6, 3.16e6, 3.32e6, 3.48e6, 3.65e6, 3.83e6,
    4.02e6, 4.22e6, 4.42e6, 4.64e6, 4.87e6, 5.11e6, 5.36e6, 5.62e6, 5.90e6,
    6.19e6, 6.49e6, 6.81e6, 7.15e6, 7.50e6, 7.87e6, 8.25e6, 8.66e6,
    9.09e6, 9.53e6, 10.0e6, 10.5e6, 11.0e6, 11.5e6, 12.1e6, 12.7e6, 13.3e6,
    14.0e6, 14.7e6, 15.4e6, 16.2e6, 16.9e6, 17.8e6, 18.7e6, 19.6e6,
    20.5e6, 21.5e6, 22.6e6, 23.7e6, 24.9e6, 26.1e6, 27.4e6, 28.7e6,
    30.1e6, 31.6e6, 33.2e6, 34.8e6, 36.5e6, 38.3e6,
    40.2e6, 42.2e6, 44.2e6, 46.4e6, 48.7e6, 51.1e6, 53.6e6, 56.2e6, 59.0e6,
    61.9e6, 64.9e6, 68.1e6, 71.5e6, 75e6, 78.7e6, 82.5e6, 86.6e6,
    90.9e6, 95.3e6,
    100e6, 105e6, 110e6, 115e6, 121e6, 127e6, 133e6, 140e6, 147e6, 154e6,
    162e6, 169e6, 178e6, 187e6, 196e6
];

// For 5% tolerance (4-band)
r_values.r_values4band5pct = [
    10, 11, 12, 13, 15, 16, 18, 20, 22, 24, 27, 30, 33, 36, 39,
    43, 47, 51, 56, 62, 68, 75, 82, 91
];

// For 10% tolerance (4-band)
r_values.r_values4band10pct = [
    10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82
];

module.exports = r_values;

},{}],18:[function(require,module,exports){
var extend    = require('../helpers/util').extend,
    Component = require('./component'),
    sparksMath = require('../helpers/sparks-math');

ReactiveComponent = function (props, breadboardController) {
  if (typeof props.impedance !== 'undefined') {
    props.impedance = this.getRequestedImpedance( props.impedance );
  }

  ReactiveComponent.parentConstructor.call(this, props, breadboardController);

  this.applyFaults();
};

extend(ReactiveComponent, Component, {

  // return named component parameter ('inductance' or 'capacitance') if it is set directly on the component;
  // otherwise, calculate the component parameter value from the impedance + referenceFrequency of this component.
  getComponentParameter: function (componentParameterName, componentParameterFromImpedance) {
    // use a directly specified component parameter if it exists
    if (typeof this[componentParameterName] !== 'undefined') {
      return this[componentParameterName];
    }

    // otherwise, if no cached value, calculate one
    if (typeof this._componentParameter === 'undefined') {
      if (typeof this.impedance === 'undefined' || typeof this.referenceFrequency === 'undefined') {
        throw new Error("An impedance/referenceFrequency pair is needed, but not defined.");
      }

      this._componentParameter = sparksMath.roundToSigDigits(componentParameterFromImpedance(this.impedance, this.referenceFrequency), 3);
    }

    return this._componentParameter;
  },

  applyFaults: function () {
    // if we're 'open' or 'shorted', we become a broken resistor
    if (!!this.open){
      this.resistance = 1e20;
      this.addThisToFaults();
    } else if (!!this.shorted) {
      this.resistance = 1e-6;
      this.addThisToFaults();
    } else {
      this.open = false;
      this.shorted = false;
    }

    if (this.resistance > 0) {
      var self = this;
    }
  },

  getEditablePropertyValues: function() {
    values = [];
    // standard cap values
    baseValues = [10, 11, 12, 13, 15, 16, 18,
                  20, 22, 24, 27, 30, 33, 36, 39,
                  43, 47, 51, 56, 62, 68, 75, 82, 91];

    for (i = -13; i < -1; i++) {
      for (j = 0; j < baseValues.length; j++) {
        values.push(baseValues[j] * Math.pow(10, i));
      }
    }

    return values;
  }

});

module.exports = ReactiveComponent;

},{"../helpers/sparks-math":28,"../helpers/util":30,"./component":11}],19:[function(require,module,exports){
var extend    = require('../helpers/util').extend,
    Resistor  = require('./resistor'),
    r_values  = require('./r-values');

Resistor4band = function (id, breadboardController) {
  var superclass = Resistor4band.uber;
  superclass.init.apply(this, [id]);
  this.numBands = 4;
  this.breadboardController = breadboardController;

  if (breadboardController.getResOrderOfMagnitude() < 0){
    var om = this.randInt(0, 3);
    breadboardController.setResOrderOfMagnitude(om);
  }

  this.r_values5pct = this.filter(r_values.r_values4band5pct);
  this.r_values10pct = this.filter(r_values.r_values4band10pct);
};

extend(Resistor4band, Resistor, {

  toleranceValues: [0.05, 0.1],

  randomize: function (options) {

      var value = 0;
      do {
        var ix = this.randInt(0, 1);
        var values;

        this.tolerance = this.toleranceValues[ix];

        if (options && options.rvalues) {
            values = options.rvalues;
        }
        else if (this.tolerance == 0.05) {
            values = this.r_values5pct;
        }
        else {
            values = this.r_values10pct;
        }

        var om = this.breadboardController.getResOrderOfMagnitude();
        var extra = this.randInt(0, 1);
        om = om + extra;

        value = values[this.randInt(0, values.length-1)];

        value = value * Math.pow(10,om);
      } while (!this._resistanceIsUnique(value));

      this.nominalValue = value;

      if (options && options.realEqualsNominal) {
          this.realValue = this.nominalValue;
      }
      else {
          this.realValue = this.calcRealValue(this.nominalValue, this.tolerance);
      }

      this.colors = this.getColors(this.nominalValue, this.tolerance);
  },

  _resistanceIsUnique: function (value) {
    var components = this.breadboardController.getComponents();

    for (var i in components){
      var resistor  = components[i];
      var resistance = resistor.nominalResistance;
      if (resistance == value){
        return false;
      }
    }
    return true;
  },

  // rvalue: resistance value
  getColors: function (ohms, tolerance) {
      var s = ohms.toString();
      var decIx = s.indexOf('.'); // real location of the dot in the string
      // virtual location of dot
      // e.g., for "324", decLoc is 3, and for "102000", 6
      var decLoc = decIx > -1 ? decIx : s.length;

      s = s.replace('.', '');
      var len = s.length;

      // Make sure there are at least three significant digits
      for (var i = 0; i < 2 - len; ++i) {
          s += '0';
      }

      var mult = decLoc > 1 ? decLoc - 2 : 10;

      return [ this.colorMap[s.charAt(0)],
               this.colorMap[s.charAt(1)],
               this.colorMap[decLoc - 2],
               this.toleranceColorMap[tolerance]
             ];
  }

});

module.exports = Resistor4band;

},{"../helpers/util":30,"./r-values":17,"./resistor":20}],20:[function(require,module,exports){
var extend                = require('../helpers/util').extend,
    Component             = require('./component'),
    r_values              = require('./r-values'),
    Resistor4band         = require('./resistor-4band'),
    workbenchController;

Resistor = function (props, breadboardController) {
  workbenchController   = require('../controllers/workbench-controller');

  var tolerance, steps;

  // translate the requested resistance (which may be of the form ["uniform", 10, 100] into a real number
  if (typeof props.resistance !== 'undefined') {
    tolerance = props.tolerance || 0.05;
    steps = (tolerance === 0.05) ? r_values.r_values4band5pct : r_values.r_values4band10pct;
    props.resistance = this.getRequestedImpedance( props.resistance, steps );
  }

  Resistor.parentConstructor.call(this, props, breadboardController);

  // if we have colors defined and not resistance
  if ((this.resistance === undefined) && this.colors){
    this.resistance = this.getResistance( this.colors );
  }

  // if we have neither colors nor resistance
  if ((this.resistance === undefined) && !this.colors) {
    var resistor = new Resistor4band(this.UID, breadboardController);
    resistor.randomize(null);
    this.resistance = resistor.getRealValue();
    this.tolerance = resistor.tolerance;
    this.colors = resistor.colors;
  }

  // if we have resistance and no colors
  if (!this.colors){
    this.colors = this.getColors4Band( this.resistance, (!!this.tolerance ? this.tolerance : 0.05));
  }

  // at this point, we must have both real resiatance and colors
  // calculate nominal resistance, unless nominalResistance is defined
  if (!this.nominalResistance){
    this.nominalResistance =  this.getResistance( this.colors );
  }

  // now that everything has been set, if we have a fault set it now
  this.applyFaults();

  if (this.resistance > 0) {
    this.setViewArguments({color: this.colors});
  } else {
    this.setViewArguments({type: "wire", color: "green"});      // represent as wire if resistance is zero
  }
};

extend(Resistor, Component,
{
  nominalValueMagnitude: -1,

    colorMap: { '-1': 'gold', '-2': 'silver',
        0 : 'black', 1 : 'brown', 2 : 'red', 3 : 'orange',
        4 : 'yellow', 5 : 'green', 6 : 'blue', 7 : 'violet', 8 : 'grey',
        9 : 'white' },

    toleranceColorMap: { 0.01 : 'brown', 0.02 : 'red', 5e-3 : 'green',
        2.5e-3 : 'blue', 1e-3 : 'violet', 5e-4 : 'gray', 5e-2 : 'gold',
        0.1 : 'silver', 0.2 : 'none' },

    toleranceValues: [ 0.01, 0.02 ],

    init: function (id) {
          this.id = id;
          this.nominalValue = 0.0; //resistance value specified by band colors;
          this.realValue = 0.0; //real resistance value in Ohms
          this.tolerance = 0.0; //tolerance value
          this.colors = []; //colors for each resistor band
    },

    getNumBands: function () {
        return this.numBands;
    },

    getNominalValue: function () {
        return this.nominalValue;
    },

    setNominalValue: function (value) {
        this.nominalValue = value;
    },

    getTolerance: function () {
        return this.tolerance;
    },

    setTolerance: function(value) {
        this.tolerance = value;
    },

    getRealValue: function () {
        return this.realValue;
    },

    setRealValue: function (value) {
        this.realValue = value;
    },

    setResistance: function (value) {
      this.resistance = value;
      this.updateColors();
    },

    updateColors: function (resistance, tolerance) {
        this.colors = this.getColors4Band( this.resistance, (!!this.tolerance ? this.tolerance : 0.05));
        this.setViewArguments({color: this.colors});
    },

    show : function() {
    },

    calcRealValue: function (nominalValue, tolerance) {
        var chance = Math.random();
        if (chance > 0.8) {
            var chance2 = Math.random();
            if (chance2 < 0.5) {
                return nominalValue + nominalValue * (tolerance + Math.random() * tolerance);
            }
            else {
                return nominalValue - nominalValue * (tolerance + Math.random() * tolerance);
            }
        }

        // Multiply 0.9 just to be comfortably within tolerance
        var realTolerance = tolerance * 0.9;
        return nominalValue * this.randFloat(1 - realTolerance, 1 + realTolerance);
    },

    randInt: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    randFloat: function (min, max) {
        return this.randPseudoGaussian(3) * (max - min) + min;
    },

    randPseudoGaussian: function (n) {
        var r = 0.0;
        for (var i = 0; i < n; ++i) {
            r += Math.random();
        }
        return r / n;
    },

    // Filter resistance values according to the requirements of this resistor
    filter: function (in_values) {
        var values = [];
        for (var i = 0; i < in_values.length; ++i) {
            if (in_values[i] >= 10.0 && in_values[i] < 2e6) {
                values.push(in_values[i]);
            }
        }
        return values;
    },

    getColors4Band: function (ohms, tolerance) {
        var s = ohms.toString(),
            decIx = s.indexOf('.'),
            decLoc = decIx > -1 ? decIx : s.length,
            len, i;
        s = s.replace('.', '');
        len = s.length;
        for (i = 0; i < 2 - len; ++i){ s += '0'; }
        return [ this.colorMap[s.charAt(0)],
                 this.colorMap[s.charAt(1)],
                 this.colorMap[decLoc - 2],
                 this.toleranceColorMap[tolerance]
               ];
    },

    getColors5Band: function (ohms, tolerance) {
        var s = ohms.toString(),
            decIx = s.indexOf('.'),
            decLoc = decIx > -1 ? decIx : s.length,
            len, i;
        s = s.replace('.', '');
        len = s.length;
        for (i = 0; i < 3 - len; ++i) { s += '0'; }
        return [ this.colorMap[s.charAt(0)],
                 this.colorMap[s.charAt(1)],
                 this.colorMap[s.charAt(2)],
                 this.colorMap[decLoc - 3],
                 this.toleranceColorMap[tolerance]
               ];
    },

    colorToNumber: function (color) {
      for (var n in this.colorMap) {
        if (this.colorMap[n] == color) { return parseInt(n,10); }
      }
      // alternate spelling...
      if (color == "gray") {
        return 8;
      }
      return null;
    },

    getResistance: function(colors){
      if (typeof(colors)==="string"){
        colors = colors.split(",");
      }
      var resistance = this.colorToNumber(colors[0]);
      for (var i = 1; i < colors.length - 2; i++) {
        resistance = resistance * 10;
        resistance += this.colorToNumber(colors[i]);
      }
      return resistance * Math.pow(10, this.colorToNumber(colors[i]));
    },

    addCiSoComponent: function (ciso) {
      var resistance  = this.resistance || 0,
          nodes       = this.getNodes();
      ciso.addComponent(this.UID, "Resistor", resistance, nodes);
    },

    applyFaults: function() {
      if (!!this.open){
        this.resistance = 1e20;
        this.addThisToFaults();
      } else if (!!this.shorted) {
        this.resistance = 1e-6;
        this.addThisToFaults();
      } else {
        this.open = false;
        this.shorted = false;
      }
    },

    componentTypeName: "Resistor",

    isEditable: true,

    editableProperty: {name: "resistance", units: "\u2126"},

    getEditablePropertyValues: function() {
      resValues = [];
      baseValues = r_values.r_values4band10pct;

      for (i = 0; i < 6; i++) {
        for (j = 0; j < baseValues.length; j++) {
          resValues.push(baseValues[j] * Math.pow(10, i));
        }
      }

      return resValues;
    },

    changeEditableValue: function(val) {
      this.setResistance(val);
      workbenchController.breadboardView.changeResistorColors(this.UID, this.getViewArguments().color);
    }
});

module.exports = Resistor;

},{"../controllers/workbench-controller":25,"../helpers/util":30,"./component":11,"./r-values":17,"./resistor-4band":19}],21:[function(require,module,exports){
var extend    = require('../helpers/util').extend,
    Resistor  = require('./resistor');

VariableResistor = function (props, breadboardController) {
  Resistor.parentConstructor.call(this, props, breadboardController);
  var superclass = VariableResistor.uber;
  superclass.init.apply(this, [props.UID]);
  this.resistance = this.minimumResistance;
};

extend(VariableResistor, Resistor, {

  getMinResistance: function() {
    return this.minimumResistance;
  },

  getMaxResistance: function() {
    return this.maximumResistance;
  },

  scaleResistance: function(value) {
    var perc = value / 10,       // values are 0-10
        range = this.maximumResistance - this.minimumResistance,
        newValue = this.minimumResistance + (range * perc);
    this.resistance = newValue;
  }

});

module.exports = VariableResistor;

},{"../helpers/util":30,"./resistor":20}],22:[function(require,module,exports){
var extend    = require('../helpers/util').extend,
    Component = require('./component');

Wire = function (props, breadboardController) {
  Wire.parentConstructor.call(this, props, breadboardController);
  this.setViewArguments({color: this.getColor()});
};

extend(Wire, Component, {

  getColor: function () {
    var location = this.getLocation();
    if (location.indexOf("positive") > -1) {
      return "red";
    } else if (location.indexOf("negative") > -1) {
      return "black";
    } else {
      if (Math.random() < 0.5){
        return "green";
      } else {
        return "blue";
      }
    }
  },

  addCiSoComponent: function (ciso) {
    var resistance  = 1e-6,
        nodes       = this.getNodes();
    ciso.addComponent(this.UID, "Resistor", resistance, nodes);
  }
});

module.exports = Wire;

},{"../helpers/util":30,"./component":11}],23:[function(require,module,exports){
var util                  = require('../helpers/util'),
    Breadboard            = require('../circuit/breadboard'),
    Battery               = require('../circuit/battery'),
    Capacitor             = require('../circuit/capacitor'),
    FunctionGenerator     = require('../circuit/function-generator'),
    Inductor              = require('../circuit/inductor'),
    PowerLead             = require('../circuit/power-lead'),
    Resistor4band         = require('../circuit/resistor-4band'),
    Resistor              = require('../circuit/resistor'),
    VariableResistor      = require('../circuit/variable-resistor'),
    Component             = require('../circuit/component'),
    Wire                  = require('../circuit/wire'),
    componentTypes = {
      "resistor": Resistor,
      "variable resistor": VariableResistor,
      "inductor": Inductor,
      "capacitor": Capacitor,
      "battery": Battery,
      "function generator": FunctionGenerator,
      "wire": Wire,
      "powerLead": PowerLead
    },
    breadboard,
    workbenchController,
    BreadboardController,
    breadboardController;



BreadboardController = function() {
  breadboard = new Breadboard();
}

BreadboardController.prototype = {

  init: function (_workbenchController) {
    workbenchController = _workbenchController;
  },

  component: function (props) {
    if(typeof props=='string'){
      return breadboard.components[props];
    } else {
      var component;

      if (componentTypes[props.kind]){
        component = new componentTypes[props.kind](props, this, workbenchController);
      } else {
        component = new Component(props, this);
      }
      breadboard.components[props.UID] = component;
      return component;
    }
  },

  clear: function () {
    var destroyed = 0,
        k;

    this.resOrderOfMagnitude = -1;
    for( k in breadboard.components ){
      if (!breadboard.components.hasOwnProperty(k)) continue;
      this.removeComponent(breadboard.components[k]);
    }
    breadboard.components = {};
    breadboard.faultyComponents = [];

    this.clearHoleMap();
  },

  // can pass either a hole or a string
  getHole: function(hole) {
    if (!hole) return;

    if (hole.name){
      if (!!breadboard.holeMap[hole.name]){
        return this.getHole(breadboard.holeMap[hole.getName()]);
      }
      return hole;
    }

    // should be a string

    // replace with mapped name
    if (!!breadboard.holeMap[hole]){
      hole = breadboard.holeMap[hole];
    }

    // return hole if it is in breadboard
    if (!!breadboard.holes[hole]){
      return breadboard.holes[hole];
    }

    // otherwise, make a new ghosthole
    return breadboard.createGhostHole(hole);
  },

  getHoles: function() {
    return breadboard.holes;
  },

  // Resets all connections, used when holeMap changes
  resetConnections: function(oldHoleName, newHoleName) {
    var i, j;

    for( i in breadboard.components ){
      if (!breadboard.components.hasOwnProperty(i)) continue;
      var comp = this.component(i);
      for (j in comp.connections){
        if (!comp.connections.hasOwnProperty(j)) continue;
        if (!!comp.connections[j] && comp.connections[j].getName() === oldHoleName) {
          comp.connections[j] = this.getHole(newHoleName);
        }
      }
    }
  },

  // Adds a fault to an existing circuit. A fault may affect one or
  // more components. If fault.component is set, it will be applied to
  // that component. Otherwise, if fault.count or fault.max are set, it
  // will be applied to a number of random components.
  addFault: function(fault) {
    if (!!fault.component){
      this.addFaultToComponent(fault, breadboard.components[fault.component]);
    } else {
      // find out how many components we should be applying this to
      var count;
      if (!!fault.count) {
        count = fault.count;
      } else if (!!fault.max) {
        count = Math.floor(Math.random() * fault.max) + 1;    // between 1 and max faults
      }


      // apply fault to valid components 'count' times, with no repitition. No checking is
      // done to see if there are sufficient valid components for this to be possible, so
      // application will hang if authored badly.
      var componentKeys = util.getKeys(breadboard.components);
      for (var i = 0; i < count; i++){
        var randomComponent = null;
        while (randomComponent === null) {
          var rand = Math.floor(Math.random() * componentKeys.length);
          var component = breadboard.components[componentKeys[rand]];
          if (!!component.applyFaults && (util.contains(breadboard.faultyComponents, component) === -1)){
            randomComponent = component;
          }
        }
        this.addFaultToComponent(fault, randomComponent);
      }
    }
  },

  // adds a fault to a specific component. If fault.type is an array, a random
  // type will be picked
  addFaultToComponent: function(fault, component) {
    var type;
    if (fault.type instanceof Array){
      type = fault.type[Math.floor(Math.random() * fault.type.length)];
    } else {
      type = fault.type;
    }

    if (type === "open") {
      component.open = true;
      component.shorted = false;
    } else if (type === "shorted") {
      component.shorted = true;
      component.open = false;
    }
    if (component.applyFaults) {
      component.applyFaults();
    }

    breadboard.faultyComponents.push(component);
  },

  addFaultyComponent: function(comp) {
    if (!~breadboard.faultyComponents.indexOf(this)) {
      brebreadboardadBoard.faultyComponents.push(this);
    }
  },

  getFaults: function() {
    return breadboard.faultyComponents;
  },

  getFault: function() {
    if (breadboard.faultyComponents.length > 0){
      return breadboard.faultyComponents[0];
    }
    return null;
  },



  // "Public" functions. These used to be the old "interfaces" object
  insertComponent: function(kind, properties){
    // copy props into a new obj, so we don't modify original
    var props = {};
    $.each(properties, function(key, property){
      props[key] = property;
    });

    props.kind = kind;

    // ensure no dupes, using either passed UID or type
    props.UID = this.getUID(!!props.UID ? props.UID : props.kind);

    // if uid is source, and no conections are specified, assume we are connecting to rails
    if (props.UID === "source" && !props.connections){
      props.connections = "left_positive21,left_negative21";
    }

    var newComponent = this.component(props);

    // update view
    if (workbenchController.breadboardView) {
      if (newComponent.getViewArguments && newComponent.hasValidConnections() && newComponent.kind !== "battery" && !newComponent.hidden) {
        workbenchController.breadboardView.addComponent(newComponent.getViewArguments());
      }
      if ((newComponent.kind == "battery" || newComponent.kind == "function generator") && !newComponent.hidden){ // FIXME
        workbenchController.breadboardView.addBattery("left_negative21,left_positive21");
      }
    }

    return newComponent.UID;
  },

  createCircuit: function(jsonCircuit) {
    var circuitHasReferenceFrequency = typeof jsonCircuit.referenceFrequency === 'number';
    var self = this;
    $.each(jsonCircuit, function(i, spec) {
      // allow each component spec to override the circuit-wide reference frequency, if author desires.
      if (circuitHasReferenceFrequency && typeof spec.referenceFrequency === 'undefined') {
        spec.referenceFrequency = jsonCircuit.referenceFrequency;
      }
      self.insertComponent(spec.type, spec);
    });

    this.insertComponent("powerLead", {
      UID: "blackPowerLead",
      type: "powerLead",
      connections: "left_negative21"
    });
  },

  addFaults: function(jsonFaults){
    var self = this;
    $.each(jsonFaults, function(i, fault){
      self.addFault(fault);
    });
  },

  getResOrderOfMagnitude: function(){
    return breadboard.resOrderOfMagnitude;
  },

  setResOrderOfMagnitude: function(om){
    breadboard.resOrderOfMagnitude = om;
  },

  checkLocation: function(comp){     // ensure that a component's leads aren't too close
    var minDistance = {
          resistor: 6,
          inductor: 5,
          capacitor: 3,
          wire: 3
        },
        yValue = {
          left_positive: 1,
          left_negative: 2,
          a: 4, b: 5, c: 6, d: 7, e: 8,
          f: 10, g: 11, h: 12, i: 13, j: 14,
          right_positive: 16,
          right_negative: 17
        },
        getCoordinate = function(hole) {      // returns [20, 4] for "a20"
          var name  = hole.name,
              split = /(\D*)(.*)/.exec(name),
              row   = yValue[split[1]];
          return [split[2]*1, row];
        },
        leadsAreTooClose = function() {
          var dx, dy, leadDistance;

          comp.coord = [];
          comp.coord[0] = getCoordinate(comp.connections[0]);
          comp.coord[1] = getCoordinate(comp.connections[1]);
          dx = comp.coord[1][0] - comp.coord[0][0];
          dy = comp.coord[1][1] - comp.coord[0][1];
          leadDistance = Math.sqrt(dx*dx + dy*dy);

          return (leadDistance < minDistance[comp.type]);
        },
        leadsWereTooClose = false;

    while (leadsAreTooClose()) {
      leadsWereTooClose = true;
      var rightLead = comp.coord[0][0] < comp.coord[1][0] ? 0 : 1,
          leftLead = (rightLead - 1) * -1,
          newX, newName;

      if (comp.coord[rightLead][0] > 1) {
        // move right lead one to the right
        newX = comp.coord[rightLead][0] - 1;
        newName = comp.connections[rightLead].name.replace(/\d*$/, newX);
        comp.connections[rightLead] = this.getHole(newName);
      } else {
        // move left lead one to the left
        newX = comp.coord[leftLead][0] + 1;
        newName = comp.connections[leftLead].name.replace(/\d*$/, newX);
        comp.connections[leftLead] = this.getHole(newName);
      }
    }

    // update view
    if (leadsWereTooClose && workbenchController.breadboardView) {
      workbenchController.breadboardView.removeComponent(comp.UID);
      workbenchController.breadboardView.addComponent(comp.getViewArguments());
    }

  },

  getUID: function(_name){
    var name = _name.replace(/ /g, "_");      // no spaces in qucs

    if (!breadboard.components[name]){
      return name;
    }

    var i = 0;
    while (!!breadboard.components[""+name+i]){
      i++;
    }
    return ""+name+i;
  },

  // clean up these three overlapping functions
  remove: function(type, connections){
    var comp = this.findComponent(type, connections);
    workbenchController.breadboardView.removeComponent(comp.uid);
    if (!!comp){
      comp.destroy();
    }
  },

  removeComponent: function(comp){
    var uid = comp.UID;
    comp.destroy();
    if (uid && workbenchController.breadboardView) {
      workbenchController.breadboardView.removeComponent(uid);
    }
  },

  deleteComponentFromMap: function(id) {
    delete breadboard.components[id];
  },

  findComponent: function(type, connections){
    var i, component;

    if (!!type && !!connections && connections.split(",").length === 2){
      connections = connections.split(",");
      for (i in breadboard.components){
        if (!breadboard.components.hasOwnProperty(i)) continue;
        component = breadboard.components[i];
        if (component.kind === type && !!component.connections[0] &&
          ((component.connections[0].getName() === connections[0] &&
            component.connections[1].getName() === connections[1]) ||
          (component.connections[0].getName() === connections[1] &&
            component.connections[1].getName() === connections[0]))){
            return component;
          }
      }
    }
    return null;
  },

  destroy: function(component){
    this.component(component).destroy();
  },

  move: function(component, connections){
    this.component(component).move(connections.split(','));
  },

  getGhostHole: function(name){
    return breadboard.createGhostHole(name);
  },

  mapHole: function(oldHoleName, newHoleName){
    breadboard.holeMap[oldHoleName] = newHoleName;
    this.resetConnections(oldHoleName, newHoleName);
  },

  unmapHole: function(oldHoleName){
    var newHoleName = breadboard.holeMap[oldHoleName];
    breadboard.holeMap[oldHoleName] = undefined;
    this.resetConnections(newHoleName, oldHoleName);
  },

  clearHoleMap: function(){
    breadboard.holeMap = {};
  },

  addRandomResistor: function(name, location, options){
    console.log("WARNING: addRandomResistor is deprecated");
    var resistor = new Resistor4band(name);
    resistor.randomize((options | null));
    this.insert('resistor', location, resistor.getRealValue(), name, resistor.colors);
    return resistor;
  },

  getComponents: function() {
    return breadboard.components;
  },

  // this method will modify the breadboard as necessary to create additional temporary components
  // that correspond to the measurement-type's circuit changes (e.g. large resistor for a voltmeter),
  // and then simply call qucsator.qucsate, and return the resulting results object.
  // NB: This function used to return the final value required by the DMM. It no longer does so, as
  // it does not assume a DMM is doing the requesting, and instead returns the entire results object.
  query: function(type, connections, callback, context, callbackArgs){
    var tempComponents = [],
        ghost, ohmmeterBattery,
        voltmeterResistor,
        ammeterResistor,
        oscopeResistor,
        ciso,
        node;

    // add DMM components as necessary
    if (type === 'resistance') {
      connections = connections.split(',');
      ghost = breadboard.createGhostHole();
      ohmmeterBattery = this.component({
        UID: 'ohmmeterBattery',
        kind: 'battery',
        voltage: 1,
        connections: [connections[0], connections[1]]});
      // var currentProbe = this.component({
      //   UID: 'meter',
      //   kind: 'iprobe',
      //   connections: [connections[1], ghost]});
      tempComponents.push(ohmmeterBattery);
    } else if (type === 'voltage'){
      voltmeterResistor = this.component({
        UID: 'voltmeterResistor',
        kind: 'resistor',
        resistance: 1e12,
        connections: connections.split(',')});
      tempComponents.push(voltmeterResistor);
    } else if (type === 'current'){
      ammeterResistor = this.component({
        UID: 'ammeterResistor',
        kind: 'resistor',
        resistance: 1e-6,
        connections: connections.split(',')});
      tempComponents.push(ammeterResistor);
    } else if (type === 'oscope') {
      oscopeResistor = this.component({
        UID: 'oscopeResistor',
        kind: 'resistor',
        resistance: 1e12,
        connections: [connections, "gnd"]});
      tempComponents.push(oscopeResistor);
    }

    ciso = new CiSo();

    $.each(breadboard.components, function(i, component) {
      component.addCiSoComponent(ciso);
    });

    // if ohmmeter, set reference node
    if (type === 'resistance') {
      node = this.getHole(connections[1]).nodeName();
      ciso.setReferenceNode(node);
    }
    // destroy the temporary DMM components
    $.each(tempComponents, function(i, component){
      component.destroy();
    });

    callback.call(context, ciso, callbackArgs);
  },

  updateView: function() {
    $.each(breadboard.components, function(i, component) {
      if (component.getViewArguments && component.hasValidConnections() && component.kind !== "battery" && !component.hidden) {
        workbenchController.breadboardView.addComponent(component.getViewArguments());
      }
      if ((component.kind == "battery" || component.kind == "function generator") && !component.hidden) { // FIXME
        workbenchController.breadboardView.addBattery("left_negative21,left_positive21");
      }
    });
  },

  // returns an array of serialized components
  serialize: function() {
    var circuit = [];

    $.each(breadboard.components, function(i, component) {
      circuit.push(component.serialize());
    });

    return circuit;
  }

}

//// BreadBoard Instance & Interface /////////////////////////////////////////
breadboardController = new BreadboardController();

module.exports = breadboardController;

},{"../circuit/battery":8,"../circuit/breadboard":9,"../circuit/capacitor":10,"../circuit/component":11,"../circuit/function-generator":12,"../circuit/inductor":13,"../circuit/power-lead":16,"../circuit/resistor":20,"../circuit/resistor-4band":19,"../circuit/variable-resistor":21,"../circuit/wire":22,"../helpers/util":30}],24:[function(require,module,exports){

var LogEvent  = require('../models/log'),
    util      = require('../helpers/util');

Log = function(startTime){
  this.events = [];
  this.startTime = startTime;
  this.endTime = -1;
};

LogController = function(){
  this.currentLog = null;
  this.listeners = [];
};

LogController.prototype = {

  startNewSession: function() {
    this.currentLog = new Log(new Date().valueOf());
  },

  endSession: function() {
    this.currentLog.endTime = new Date().valueOf();
  },

  addEvent: function (name, value) {
    var evt = new LogEvent(name, value, new Date().valueOf());
    this.currentLog.events.push(evt);
    for (i in this.listeners) {
      if (typeof this.listeners[i] == "function") {
        this.listeners[i](evt);
      }
    }
  },

  numEvents: function(log, name) {
    var count = 0;
    $.each(log.events, function(i, evt){
      if (evt.name == name){
        count ++;
      }
    });
    return count;
  },

  numUniqueMeasurements: function(log, type) {
    var count = 0;
    var positions = [];
    $.each(log.events, function(i, evt){
      if (evt.name == LogEvent.DMM_MEASUREMENT){
        if (evt.value.measurement == type) {
          var position = evt.value.red_probe + "" + evt.value.black_probe;
          if (util.contains(positions, position) === -1) {
            count++;
            positions.push(position);
          }
        }
      }
    });
    return count;
  },

  numConnectionChanges: function(log, type) {
    var count = 0;
    $.each(log.events, function(i, evt){
      if (evt.name == LogEvent.CHANGED_CIRCUIT && evt.value.type == type){
        count ++;
      }
    });
    return count;
  },

  addListener: function(func) {
    this.listeners.push(func);
  }

};

logController = new LogController();

module.exports = logController;

},{"../helpers/util":30,"../models/log":35}],25:[function(require,module,exports){
var Oscilloscope          = require('../models/oscilloscope'),
    Workbench             = require('../models/workbench'),
    Multimeter            = require('../circuit/multimeter'),
    logController         = require('./log-controller'),
    breadboardController  = require('./breadboard-controller');


WorkbenchController = function(){
  //this.workbenchMap = {}
  this.workbench = null;    // for now
  this.breadboardController = breadboardController;
  this.breadboardController.init(this);
  this.logController = logController;
};

WorkbenchController.prototype = {

  createWorkbench: function(props, elId) {
    var workbench = new Workbench(null, this.breadboardController);
    this.workbench = workbench;

    this.initialProperties = props;

    workbench.circuit = props.circuit;
    if (workbench.circuit) workbench.circuit.referenceFrequency = props.referenceFrequency;

    workbench.faults = props.faults;

    workbench.show_multimeter = !(!(props.show_multimeter) || props.show_multimeter === "false");     // may be a string
    workbench.show_oscilloscope = !(!(props.show_oscilloscope) || props.show_oscilloscope === "false");
    workbench.allow_move_yellow_probe = !(!(props.allow_move_yellow_probe) || props.allow_move_yellow_probe === "false");
    workbench.hide_pink_probe = !(!(props.hide_pink_probe) || props.hide_pink_probe === "false");
    workbench.disable_multimeter_position = props.disable_multimeter_position;

    workbench.showComponentDrawer = !(!(props.showComponentDrawer) || props.showComponentDrawer === "false");
    workbench.showComponentEditor = !(!(props.showComponentEditor) || props.showComponentEditor === "false");

    if (workbench.show_multimeter) {
      workbench.meter.dmm = new Multimeter(breadboardController);
      if(workbench.disable_multimeter_position){
        workbench.meter.dmm.set_disable_multimeter_position(workbench.disable_multimeter_position);
      }
    } else {
      workbench.meter.dmm = null;
    }

    if (workbench.show_oscilloscope) {
      workbench.meter.oscope = new Oscilloscope(breadboardController);
    } else {
      workbench.meter.oscope = null;
    }

    // this shouldn't be here
    logController.startNewSession();

    this.loadBreadboard();

    workbench.view.layout(elId);

    return workbench;
  },

  loadBreadboard: function() {
    var workbench = this.workbench;

    breadboardController.clear();

    if (!!workbench.circuit){
      breadboardController.createCircuit(workbench.circuit);
    }

    if (!!workbench.faults){
      breadboardController.addFaults(workbench.faults);
    }
  },

  setDMMVisibility: function(visible) {
    var workbench = this.workbench;
    if (visible) {
      workbench.meter.dmm = new Multimeter(breadboardController);
      if(workbench.disable_multimeter_position){
        workbench.meter.dmm.set_disable_multimeter_position(workbench.disable_multimeter_position);
      }
    } else {
      workbench.meter.dmm = null;
    }
    sparks.activity.view.showDMM(visible);
  },

  setOScopeVisibility: function(visible) {
    var workbench = this.workbench;
    if (visible) {
      workbench.meter.oscope = new Oscilloscope(breadboardController);
    } else {
      workbench.meter.oscope = null;
    }
    sparks.activity.view.showOScope(visible);
  },

  serialize: function() {
    var json = this.initialProperties;
    json.circuit = this.breadboardController.serialize();
    return JSON.stringify(json, null, '\t');
  }

};

//var workbenchController = new WorkbenchController();

module.exports = new WorkbenchController();

},{"../circuit/multimeter":15,"../models/oscilloscope":37,"../models/workbench":38,"./breadboard-controller":23,"./log-controller":24}],26:[function(require,module,exports){
var unit                  = require('./unit');

mathParser = {};

var p = mathParser;

p.standardizeUnits = function(string) {
  string = string.replace(/ohms/gi,"&#x2126;");
  string = string.replace("micro","&#x00b5;");
  string = string.replace("milli","m");
  string = string.replace("kilo","k");
  string = string.replace("mega","M");
  return string;
};

module.exports = mathParser;

},{"./unit":29}],27:[function(require,module,exports){
sound = {};

sound.mute = false;

sound.play = function (sound) {
  if (!!window.Audio && !sound.mute) {
    sound.play();
  }
}

module.exports = sound;

},{}],28:[function(require,module,exports){
//= require helpers/string

/*globals console sparks */

/* FILE math.js */

str = {};

str.strip = function (s) {
    s = s.replace(/\s*([^\s]*)\s*/, '$1');
    return s;
};

// Remove a dot in the string, and then remove 0's on both sides
// e.g. '20100' => '201', '0.0020440' => '2044'
str.stripZerosAndDots = function (s) {
    s = s.replace('.', '');
    s = s.replace(/0*([^0].*)/, '$1');
    s = s.replace(/(.*[^0])0*/, '$1');
    return s;
};

str.stripZeros = function (s) {
    s = s.replace(/0*([^0].*)/, '$1');
    s = s.replace(/(.*[^0])0*/, '$1');
    return s;
};

math = {};

// Return true if number x is 10^z times y where z is an int
math.equalExceptPowerOfTen = function(x, y) {
    var sx = str.stripZerosAndDots(x.toString());
    var sy = str.stripZerosAndDots(y.toString());

    return sx === sy;
};

 // Get 10's power of the most significant digit.
 // e.g. For 4: 0, for 77: 1, for 3753: 3, for 0.02.
 // NOTE: The most significant digit is assumed to be the first non-zero digit,
 // which may be unacceptable for certain applications.
 // NOTE: x is a non-negative number.
 math.leftMostPos = function (x) {
     x = Number(x);
     if (isNaN(x) || x < 0) {
         console.log('ERROR: math.leftMostPos: Invalid input ' + x);
         return 0;
     }
     if (x === 0) {
         return 0;
     }
     var n = 0;
     var y = x;
     if (x < 1) {
         while (y < 1) {
             y *= 10;
             n -= 1;
         }
     }
     else {
         while (y >= 10) {
             y /= 10;
             n += 1;
         }
     }
     return n;
 };

 // Round x to n significant digits
 // e.g. Returns 12700 for 12678 when n = 3.
math.roundToSigDigits = function(x, n) {
  if (x === 0) {
    return 0;
  }
  var order = Math.ceil(Math.log10(x)),
      factor;

  // Divide into 2 cases to get numerically sane results (i.e., no .xxx999999s)
  if (n - order > 0) {
    // Ex. order of x = 1e-4, n = 3 sig digs: so multiply by 1e7, round, then divide by 1e7
    factor = Math.pow(10, n - order);
    return Math.round(x * factor) / factor;
  } else {
    // Ex. order of x = 1e6, n = 2 sig digs: so divide by 1e4, round, then multiply by 1e4
    factor = Math.pow(10, order - n);
    return Math.round(x / factor) * factor;
  }
};

 // Similar to roundToSigDigits but returns number composed only of the n
 // significant digits; e.g., returns 127 for 12678 when n = 3.
 math.getRoundedSigDigits = function (x, n) {
     return Math.round(x * Math.pow(10, n - math.leftMostPos(x) - 1));
 };


 // *** extend the Math object with useful methods ***

 Math.log10 = function(x){
   return Math.log(x)/Math.LN10;
 };

 Math.orderOfMagnitude = function(x) {
   if (x === 0) return 0;
   return Math.floor( Math.log(Math.abs(x))/Math.LN10 );
 };

 Math.powNdigits = function(x,n){
   return Math.pow(10,Math.floor(Math.log(x)/Math.LN10-n+1));
 };

 // Rounds to n sig figs (including adding on trailing zeros if necessary),
 // and returns a string representation of the number.
 Math.toSigFigs = function(num, sigFigs) {
   num = num.toPrecision(sigFigs);
   return sigFigs > Math.log(num) * Math.LOG10E ? num : ""+parseFloat(num);
 };

 Math.close = function(num, expected, perc) {
   var perc = perc || 5,
        dif = expected * (perc/100);
   return (num >= (expected-dif) && num <= (expected+dif));
 };

 // *** extend the Array object with useful methods ***

 Array.max = function( array ){
     return Math.max.apply( Math, array );
 };
 Array.min = function( array ){
     return Math.min.apply( Math, array );
 };

 module.exports = math;


},{}],29:[function(require,module,exports){
unit = {};

var u = unit;

u.labels = { ohms : '\u2126', kilo_ohms : 'k\u2126', mega_ohms : 'M\u2126' };

u.toEngineering = function (value, units){
  value = Number(value);
  var isShort = (units.length === 1 || units === "Hz"),
      prefix  = "";

  if (value >= 1000000){
    prefix = isShort ? "M" : "mega";
    value = u.round(value/1000000,2);
  } else if (value >= 1000){
    prefix = isShort ? "k" : "kilo";
    value = u.round(value/1000,2);
  } else if (value === 0 ) {
    value = 0;
  } else if (value < 0.000000001){
    prefix = isShort ? "p" : "pico";
    value = u.round(value * 1000000000000,2);
  } else if (value < 0.000001){
    prefix = isShort ? "n" : "nano";
    value = u.round(value * 1000000000,2);
  } else if (value < 0.001){
    prefix = isShort ? "μ" : "micro";
    value = u.round(value * 1000000,2);
  } else if (value < 1) {
    prefix = isShort ? "m" : "milli";
    value = u.round(value * 1000,2);
  } else {
    value = u.round(value,2);
  }
  units = prefix + units;

  return {"value": value, "units": units};
};

u.round = function(num, dec) {
	var result = Math.round( Math.round( num * Math.pow( 10, dec + 2 ) ) / Math.pow( 10, 2 ) ) / Math.pow(10,dec);
	return result;
};

u.sigFigs = function(n, sig) {
    var mult = Math.pow(10,
        sig - Math.floor(Math.log(n) / Math.LN10) - 1);
    return Math.round(n * mult) / mult;
};

// returns true if string is of form "50 ohms" or "0.1V"
u.isMeasurement = function(string) {
  var isMeasurementPattern = /^\s?\d+.?\d*\s?\D+\s?$/
  var matched = string.match(isMeasurementPattern);
  return !!matched;
};

/**
* assumes this will be in the form ddd uu
* i.e. a pure number and a unit, separated by an optional space
* '50 ohms' and '50V' are both valid
*/
u.convertMeasurement = function(measurement) {
  if (!this.isMeasurement(measurement)){
    return measurement
  }

  var numPattern = /\d+\.?\d*/g
  var nmatched = measurement.match(numPattern);
  if (!nmatched){
    return measurement;
  }
  var value = nmatched[0];

  var unitPattern =  /(?=\d*.?\d*)[^\d\.\s]+/g
  var umatched = measurement.match(unitPattern);
  if (!umatched){
    return measurement;
  }
  var unit = umatched[0];

  var eng = u.toEngineering(value, unit)
  return eng.value + " " + eng.units;
};

u.normalizeToOhms = function (value, unit) {
    switch (unit) {
    case u.labels.ohms:
        return value;
    case u.labels.kilo_ohms:
        return value * 1000;
    case u.labels.mega_ohms:
        return value * 1e6;
    }
    return null;
};

u.ohmCompatible = function (unit) {
    if (unit == u.labels.ohms || unit == u.labels.kilo_ohms ||
        unit == u.labels.mega_ohms)
    {
        return true;
    }
    return false;
};

// Return a string with a unit representing the resistance value.
// value: resistance value in ohms
u.res_str = function (value) {
    var vstr, unit, val;

    if (typeof value !== 'number' || isNaN(Number(value))) {
        return 'Invalid Value ' + String(value);
    }

    if (value < 1000) {
        val = value;
        unit = u.labels.ohms;
    }
    else if (value < 1e6) {
        val = value / 1000;
        unit = u.labels.kilo_ohms;
    }
    else {
        val = value / 1e6;
        unit = u.labels.mega_ohms;
    }

    if (val.toFixed) {
        val = val.toFixed(6);
    }

    vstr = String(val).replace(/(\.[0-9]*[1-9])0*/, '$1');
    vstr = vstr.replace(/([0-9])\.0+$/, '$1');
    return vstr + ' ' + unit;
};

u.res_unit_str = function (value, mult) {
    var vstr;
    var unit = u.labels.ohms;

    if (mult === 'k') {
        vstr = String(value / 1000.0);
        unit = u.labels.kilo_ohms;
    }
    else if (mult === 'M') {
        vstr = String(value / 1000000.0);
        unit = u.labels.mega_ohms;
    }
    else {
        vstr = String(value);
        unit = u.labels.ohms;
    }
    return vstr + ' ' + unit;
};

u.pct_str = function (value) {
    return (value * 100) + ' %';
};

u.unitEquivalents = {
  "V": ["v", "volts", "volt", "vol", "vs"],
  "A": ["a", "amps", "amp", "amper", "ampers", "as"],
  "Ohms": ["ohms", "oms", "o", "Ω", "os"],
  "deg": ["deg", "degs", "degree", "degrees", "º"],
  "F": ["f", "farads", "farad", "fared", "fareds", "fered", "fereds", "feret", "ferets", "ferret", "ferrets", "fs"],
  "H": ["h", "henries", "henry", "henrys", "hs"],
  "Hz": ["hz", "herz", "hertz"],
  "%": ["%", "perc", "percent"]
}

u.prefixEquivalents = {
  "femto": ["femto", "fempto", "f"],
  "pico": ["pico", "picco", "p"],
  "nano": ["nano", "nanno", "n"],
  "micro": ["micro", "micron", "μ"],
  "milli": ["mili", "milli", "millli"],
  "kilo": ["kilo", "killo", "killlo", "k"],
  "mega": ["mega", "meg"],
  "giga": ["giga", "gigga", "g"]
};

u.prefixValues = {
  "femto": 1E-15,
  "pico": 1E-12,
  "nano": 1E-9,
  "micro": 1E-6,
  "milli": 1E-3,
  "kilo": 1E3,
  "mega": 1E6,
  "giga": 1E9
};

u.parse = function(string) {
  var value, units, prefix, currPrefix, unit, equivalents, equiv, regex;

  string = string.replace(/ /g, '');                    // rm all whitespace
  string = string.replace(/['";:,\/?\\]/g, '');         // rm all non-period, non-dash puncutation
  string = string.replace(/[^\d\.-]*(\d.*)/, '$1');      // if there are numbers, if there are letters before them remove them
  value =  string.match(/^-?[\d\.]+/);                  // find all numbers before the first letter, parse them to a number, store it
  if (value) {
    value = parseFloat(value[0]);
  }
  string = string.replace(/^-?[\d\.]*/, '');             // everything after the first value is the units
  string = string.replace(/['";:,\.\/?\\-]/g, '');       // rm all puncutation

  for (unit in this.unitEquivalents) {                // if the unit can be found in the equivalents table, replace
    equivalents = this.unitEquivalents[unit];
    if (equivalents.length > 0) {
      for (var i = 0, ii = equivalents.length; i<ii; i++) {
        equiv = equivalents[i];
        regex = new RegExp('.*('+equiv+')$', 'i');
        hasUnits =string.match(regex)
        if (hasUnits && hasUnits.length > 1){
          units = unit;
          string = string.replace(hasUnits[1], '');
          break;
        }
      }
    }
    if (units) {
      break;
    }
  }

  if (!units) {
    units = string;
  }

  for (currPrefix in this.prefixEquivalents) {                 // if we can find a prefix at the start of the string, store it and delete it
    equivalents = this.prefixEquivalents[currPrefix];
    if (equivalents.length > 0) {
      for (var i = 0, ii = equivalents.length; i<ii; i++) {
        equiv = equivalents[i];
        regex = new RegExp('^('+equiv+').*', 'i');
        prefixes = string.match(regex);
        if (prefixes && prefixes.length > 1){
          prefix = currPrefix;
          units = units.replace(prefixes[1], '');
          break;
        }
      }
    }
    if (prefix) {
      break;
    }
  }

  if (!prefix) {                                      // if we haven't found a prefix yet, check for case-sensitive m or M at start
    if (string.match(/^m/)) {
      prefix = "milli";
      units = units.replace(/^m/, "");
    } else if (string.match(/^M/)){
      prefix = "mega";
      units = units.replace(/^M/, "");
    }
  }

  if (prefix) {
    value = value * this.prefixValues[prefix];        // if we have a prefix, multiply by that;
  }

  if (!value) {
    value = NaN;
  }

  return {val: value, units: units}
};

module.exports = unit;


},{}],30:[function(require,module,exports){
var util = {};

/**
 * Naive deep-cloning of an object.
 * Doesn't check against infinite recursion.
 */
util.cloneSimpleObject = function (obj) {
    var ret, key;
    if (obj instanceof Array) {
        ret = [];
        for (key in obj) {
            ret.push(util.cloneSimpleObject(obj[key]));
        }
        return ret;
    }
    else if (typeof obj === 'object') {
        ret = {};
        for (key in obj) {
            ret[key] = util.cloneSimpleObject(obj[key]);
        }
        return ret;
    }
    else {
        return obj;
    }
};

// The "next" function returns a different value each time
// alternating between the two input values x, y.
util.Alternator = function (x, y)
{
    this.x = x;
    this.y = y;
    this.cnt = 0;
};
util.Alternator.prototype =
{
    next : function () {
        ++this.cnt;
        return this.cnt % 2 == 1 ? this.x : this.y;
    }
};

// Return a string representation of time lapsed between start and end
util.timeLapseStr = function (start, end) {
    var seconds = Math.floor((end - start) / 1000);
    var minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    var str = seconds + (seconds == 1 ? ' second' : ' seconds');
    if (minutes > 0) {
        str = minutes + (minutes == 1 ? ' minute ' : ' minutes ') + str;
    }
    return str;
};

/**
The initial version of this was copied from the serializeArray method of jQuery
this version returns a result object and uses the names of the input elements
as the actual keys in the result object.  This requires more careful naming but it
makes using the returned object easier.  It could be improved to handle dates and
numbers perhaps using style classes to tag them as such.
*/
util.serializeForm = function (form) {
    var result = {};
    form.map(function () {
        return this.elements ? jQuery.makeArray(this.elements) : this;
    }).filter(function () {
        return this.name &&
        (this.checked || (/select|textarea/i).test(this.nodeName) ||
        (/text|hidden|password|search/i).test(this.type));
    }).each(function (i) {
        var val = jQuery(this).val();
        if(val === null){
            return;
        }

        if (jQuery.isArray(val)) {
            result[this.name] = jQuery.makeArray(val);
        }
        else {
            result[this.name] = val;
        }
    });
    return result;
};

// Returns a string representation of the input date
// date: either a Date or a number in milliseconds
util.formatDate = function (date) {
    function fillZero(val) {
        return val < 10 ? '0' + val : String(val);
    }
    if (typeof date === 'number') {
        date = new Date(date);
    }
    var s = fillZero(date.getMonth() + 1) + '/';

    s += fillZero(date.getDate()) + '/';
    s += String(date.getFullYear()) + ' ';
    s += fillZero(date.getHours()) + ':';
    s += fillZero(date.getMinutes()) + ':';
    s += fillZero(date.getSeconds()) + ' ';
    return s;
};

util.todaysDate = function() {
  var monthNames = ["January","February","March","April","May","June","July",
                    "August","September","October","November","December"];

  var now = new Date();
  return monthNames[now.getMonth()] + " " +  now.getDate() + ", " + now.getFullYear();
}

// Pretty print an object. Mainly intended for debugging JSON objects
util.prettyPrint = function (obj, indent) {
    var t = '';
    if (typeof obj === 'object') {
        for (var key in obj) {
            if (typeof obj[key] !== 'function') {
                for (var i = 0; i < indent; ++i) {
                    t += ' ';
                }
                t += key + ': ';
                if (typeof obj[key] === 'object') {
                    t += '\n';
                }
                t += util.prettyPrint(obj[key], indent + 4);
            }
        }
        return t;
    }
    else {
        return obj + '\n';
    }
};

util.shuffle = function (o) {
  for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
};

util.contains = function (array, obj) {
  var i = array.length;
    while (i--) {
       if (array[i] === obj) {
           return i;
       }
    }
    return -1;
};

util.getKeys = function (json) {
  var keys = [];
  $.each(json, function(key){
    keys.push(key);
  })
  return keys;
};

// When we define, say, a logaritmic sweep of frequencies, we calculate them on our end
// for the function generator, and QUCS generates them on its end after being given a
// simulation type. These two series may not be exactly the same after accounting for
// different precisions, so we want to pick the QUCS value that's closest to what we
// think we're generating. So, if we think we're generating 1002.2 Hz, and QUCS comes back
// with [1000, 1002.22222, 1003.33333], we want to return the index '1'
//
// @array an array of numbers, complex or real
// @actual the number we want
// @isComplex whether the numbers in the array are complex or real
util.getClosestIndex = function(array, actual, isComplex) {
  var minDiff = Infinity,
      index;
  // this could be shortened as a CS exercise, but it takes 0 ms over an array of
  // 10,000 so it's not really worth it...
  for (var i = 0, ii = array.length; i < ii; i++){
    var diff = isComplex ? Math.abs(array[i].real - actual) : Math.abs(array[i] - actual);
    if (diff < minDiff){
      minDiff = diff;
      index = i;
    }
  }
  return index;
};

// YUI-style inheritance
util.extend = function(Child, Parent, properties) {
  var F = function() {};
  F.prototype = Parent.prototype;
  Child.prototype = new F();
  if (properties) {
      for (var k in properties) {
          Child.prototype[k] = properties[k];
      }
  }
  Child.prototype.constructor = Child;
  Child.parentConstructor = Parent;
  Child.uber = Parent.prototype;
};

module.exports = util;


// Shim to add ECMA262-5 Array methods if not supported natively
if ( !Array.prototype.indexOf ) {
  Array.prototype.indexOf= function(find, i /*opt*/) {
      if (i===undefined) i= 0;
      if (i<0) i+= this.length;
      if (i<0) i= 0;
      for (var n= this.length; i<n; i++)
          if (i in this && this[i]===find)
              return i;
      return -1;
  };
}
if ( !Array.prototype.forEach ) {
  Array.prototype.forEach = function(fn, scope) {
    for(var i = 0, len = this.length; i < len; ++i) {
      fn.call(scope, this[i], i, this);
    }
  }
}

},{}],31:[function(require,module,exports){
require('../bower_components/jquery/jquery');
require('../lib/jquery/jquery-ui-1.8.24.custom.min');
require('../lib/jquery/plugins/jquery.event.drag-2.0.min');
require('../bower_components/jquery-nearest/src/jquery.nearest.min');
require('../bower_components/circuit-solver/dist/circuitSolver.min');

var workbenchController = require('./controllers/workbench-controller'),
    sound               = require('./helpers/sound'),

    scripts             = document.getElementsByTagName('script'),
    path                = scripts[scripts.length-1].src.split('?')[0],      // remove any ?query
    packageRoot         = path.split('/').slice(0, -2).join('/')+'/',

    soundFiles          = {click: packageRoot + "/common/sounds/click.ogg"};

loadSounds = function () {
  var soundName, audio;

  for (soundName in soundFiles) {
    if (!!window.Audio) {
      audio = new Audio();
      audio.src = soundFiles[soundName];
      sound[soundName] = audio;
    }
  }
};

$(document).ready(function () {
    loadSounds();
});

var sparks = {};

sparks.createWorkbench = function(props, elId) {
  workbenchController.createWorkbench(props, elId);
}

// this is probably too much access for an API, but doing it now for simplicity
sparks.workbenchController = workbenchController;
sparks.logController = workbenchController.logController;

sparks.packageRoot = packageRoot;


module.exports = sparks;

},{"../bower_components/circuit-solver/dist/circuitSolver.min":1,"../bower_components/jquery-nearest/src/jquery.nearest.min":2,"../bower_components/jquery/jquery":3,"../lib/jquery/jquery-ui-1.8.24.custom.min":6,"../lib/jquery/plugins/jquery.event.drag-2.0.min":7,"./controllers/workbench-controller":25,"./helpers/sound":27}],32:[function(require,module,exports){
/* Copyright (C) 1999 Masanao Izumo <iz@onicos.co.jp>
 * Version: 1.0
 * LastModified: Dec 25 1999
 * This library is free.  You can redistribute it and/or modify it.
 */

/*
 * Interfaces:
 * b64 = base64encode(data);
 * data = base64decode(b64);
 */

(function() {

var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var base64DecodeChars = new Array(
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
    52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
    -1,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14,
    15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
    -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);

function base64encode(str) {
    var out, i, len;
    var c1, c2, c3;

    len = str.length;
    i = 0;
    out = "";
    while(i < len) {
  c1 = str.charCodeAt(i++) & 0xff;
  if(i == len)
  {
      out += base64EncodeChars.charAt(c1 >> 2);
      out += base64EncodeChars.charAt((c1 & 0x3) << 4);
      out += "==";
      break;
  }
  c2 = str.charCodeAt(i++);
  if(i == len)
  {
      out += base64EncodeChars.charAt(c1 >> 2);
      out += base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
      out += base64EncodeChars.charAt((c2 & 0xF) << 2);
      out += "=";
      break;
  }
  c3 = str.charCodeAt(i++);
  out += base64EncodeChars.charAt(c1 >> 2);
  out += base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
  out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >>6));
  out += base64EncodeChars.charAt(c3 & 0x3F);
    }
    return out;
}

function base64decode(str) {
    var c1, c2, c3, c4;
    var i, len, out;

    len = str.length;
    i = 0;
    out = "";
    while(i < len) {
  /* c1 */
  do {
      c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
  } while(i < len && c1 == -1);
  if(c1 == -1)
      break;

  /* c2 */
  do {
      c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
  } while(i < len && c2 == -1);
  if(c2 == -1)
      break;

  out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));

  /* c3 */
  do {
      c3 = str.charCodeAt(i++) & 0xff;
      if(c3 == 61)
    return out;
      c3 = base64DecodeChars[c3];
  } while(i < len && c3 == -1);
  if(c3 == -1)
      break;

  out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));

  /* c4 */
  do {
      c4 = str.charCodeAt(i++) & 0xff;
      if(c4 == 61)
    return out;
      c4 = base64DecodeChars[c4];
  } while(i < len && c4 == -1);
  if(c4 == -1)
      break;
  out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
    }
    return out;
}

if (!window.btoa) window.btoa = base64encode;
if (!window.atob) window.atob = base64decode;

})();
},{}],33:[function(require,module,exports){
/*
 * canvg.js - Javascript SVG parser and renderer on Canvas
 * MIT Licensed
 * Gabe Lerner (gabelerner@gmail.com)
 * http://code.google.com/p/canvg/
 *
 */
(function(){

	var RGBColor = require('./rgbcolor');

	// canvg(target, s)
	// empty parameters: replace all 'svg' elements on page with 'canvas' elements
	// target: canvas element or the id of a canvas element
	// s: svg string, url to svg file, or xml document
	// opts: optional hash of options
	//		 ignoreMouse: true => ignore mouse events
	//		 ignoreAnimation: true => ignore animations
	//		 ignoreDimensions: true => does not try to resize canvas
	//		 ignoreClear: true => does not clear canvas
	//		 offsetX: int => draws at a x offset
	//		 offsetY: int => draws at a y offset
	//		 scaleWidth: int => scales horizontally to width
	//		 scaleHeight: int => scales vertically to height
	//		 renderCallback: function => will call the function after the first render is completed
	//		 forceRedraw: function => will call the function on every frame, if it returns true, will redraw
	this.canvg = function (target, s, opts) {
		// no parameters
		if (target == null && s == null && opts == null) {
			var svgTags = document.getElementsByTagName('svg');
			for (var i=0; i<svgTags.length; i++) {
				var svgTag = svgTags[i];
				var c = document.createElement('canvas');
				c.width = svgTag.clientWidth;
				c.height = svgTag.clientHeight;
				svgTag.parentNode.insertBefore(c, svgTag);
				svgTag.parentNode.removeChild(svgTag);
				var div = document.createElement('div');
				div.appendChild(svgTag);
				canvg(c, div.innerHTML);
			}
			return;
		}
		opts = opts || {};

		if (typeof target == 'string') {
			target = document.getElementById(target);
		}

		// store class on canvas
		if (target.svg != null) target.svg.stop();
		target.svg = svg = build();
		svg.opts = opts;

		var ctx = target.getContext('2d');
		if (typeof(s.documentElement) != 'undefined') {
			// load from xml doc
			svg.loadXmlDoc(ctx, s);
		}
		else if (s.substr(0,1) == '<') {
			// load from xml string
			svg.loadXml(ctx, s);
		}
		else {
			// load from url
			svg.load(ctx, s);
		}
	}

	function build() {
		var svg = { };

		svg.FRAMERATE = 30;
		svg.MAX_VIRTUAL_PIXELS = 30000;

		// globals
		svg.init = function(ctx) {
			svg.Definitions = {};
			svg.Styles = {};
			svg.Animations = [];
			svg.Images = [];
			svg.ctx = ctx;
			svg.ViewPort = new (function () {
				this.viewPorts = [];
				this.Clear = function() { this.viewPorts = []; }
				this.SetCurrent = function(width, height) { this.viewPorts.push({ width: width, height: height }); }
				this.RemoveCurrent = function() { this.viewPorts.pop(); }
				this.Current = function() { return this.viewPorts[this.viewPorts.length - 1]; }
				this.width = function() { return this.Current().width; }
				this.height = function() { return this.Current().height; }
				this.ComputeSize = function(d) {
					if (d != null && typeof(d) == 'number') return d;
					if (d == 'x') return this.width();
					if (d == 'y') return this.height();
					return Math.sqrt(Math.pow(this.width(), 2) + Math.pow(this.height(), 2)) / Math.sqrt(2);
				}
			});
		}
		svg.init();

		// images loaded
		svg.ImagesLoaded = function() {
			for (var i=0; i<svg.Images.length; i++) {
				if (!svg.Images[i].loaded) return false;
			}
			return true;
		}

		// trim
		svg.trim = function(s) { return s.replace(/^\s+|\s+$/g, ''); }

		// compress spaces
		svg.compressSpaces = function(s) { return s.replace(/[\s\r\t\n]+/gm,' '); }

		// ajax
		svg.ajax = function(url) {
			var AJAX;
			if(window.XMLHttpRequest){AJAX=new XMLHttpRequest();}
			else{AJAX=new ActiveXObject('Microsoft.XMLHTTP');}
			if(AJAX){
			   AJAX.open('GET',url,false);
			   AJAX.send(null);
			   return AJAX.responseText;
			}
			return null;
		}

		// parse xml
		svg.parseXml = function(xml) {
			if (window.DOMParser)
			{
				var parser = new DOMParser();
				return parser.parseFromString(xml, 'text/xml');
			}
			else
			{
				xml = xml.replace(/<!DOCTYPE svg[^>]*>/, '');
				var xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
				xmlDoc.async = 'false';
				xmlDoc.loadXML(xml);
				return xmlDoc;
			}
		}

		svg.Property = function(name, value) {
			this.name = name;
			this.value = value;
		}
			svg.Property.prototype.getValue = function() {
				return this.value;
			}

			svg.Property.prototype.hasValue = function() {
				return (this.value != null && this.value !== '');
			}

			// return the numerical value of the property
			svg.Property.prototype.numValue = function() {
				if (!this.hasValue()) return 0;

				var n = parseFloat(this.value);
				if ((this.value + '').match(/%$/)) {
					n = n / 100.0;
				}
				return n;
			}

			svg.Property.prototype.valueOrDefault = function(def) {
				if (this.hasValue()) return this.value;
				return def;
			}

			svg.Property.prototype.numValueOrDefault = function(def) {
				if (this.hasValue()) return this.numValue();
				return def;
			}

			// color extensions
				// augment the current color value with the opacity
				svg.Property.prototype.addOpacity = function(opacity) {
					var newValue = this.value;
					if (opacity != null && opacity != '' && typeof(this.value)=='string') { // can only add opacity to colors, not patterns
						var color = new RGBColor(this.value);
						if (color.ok) {
							newValue = 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ', ' + opacity + ')';
						}
					}
					return new svg.Property(this.name, newValue);
				}

			// definition extensions
				// get the definition from the definitions table
				svg.Property.prototype.getDefinition = function() {
					var name = this.value.replace(/^(url\()?#([^\)]+)\)?$/, '$2');
					return svg.Definitions[name];
				}

				svg.Property.prototype.isUrlDefinition = function() {
					return this.value.indexOf('url(') == 0
				}

				svg.Property.prototype.getFillStyleDefinition = function(e) {
					var def = this.getDefinition();

					// gradient
					if (def != null && def.createGradient) {
						return def.createGradient(svg.ctx, e);
					}

					// pattern
					if (def != null && def.createPattern) {
						return def.createPattern(svg.ctx, e);
					}

					return null;
				}

			// length extensions
				svg.Property.prototype.getDPI = function(viewPort) {
					return 96.0; // TODO: compute?
				}

				svg.Property.prototype.getEM = function(viewPort) {
					var em = 12;

					var fontSize = new svg.Property('fontSize', svg.Font.Parse(svg.ctx.font).fontSize);
					if (fontSize.hasValue()) em = fontSize.toPixels(viewPort);

					return em;
				}

				svg.Property.prototype.getUnits = function() {
					var s = this.value+'';
					return s.replace(/[0-9\.\-]/g,'');
				}

				// get the length as pixels
				svg.Property.prototype.toPixels = function(viewPort) {
					if (!this.hasValue()) return 0;
					var s = this.value+'';
					if (s.match(/em$/)) return this.numValue() * this.getEM(viewPort);
					if (s.match(/ex$/)) return this.numValue() * this.getEM(viewPort) / 2.0;
					if (s.match(/px$/)) return this.numValue();
					if (s.match(/pt$/)) return this.numValue() * this.getDPI(viewPort) * (1.0 / 72.0);
					if (s.match(/pc$/)) return this.numValue() * 15;
					if (s.match(/cm$/)) return this.numValue() * this.getDPI(viewPort) / 2.54;
					if (s.match(/mm$/)) return this.numValue() * this.getDPI(viewPort) / 25.4;
					if (s.match(/in$/)) return this.numValue() * this.getDPI(viewPort);
					if (s.match(/%$/)) return this.numValue() * svg.ViewPort.ComputeSize(viewPort);
					return this.numValue();
				}

			// time extensions
				// get the time as milliseconds
				svg.Property.prototype.toMilliseconds = function() {
					if (!this.hasValue()) return 0;
					var s = this.value+'';
					if (s.match(/s$/)) return this.numValue() * 1000;
					if (s.match(/ms$/)) return this.numValue();
					return this.numValue();
				}

			// angle extensions
				// get the angle as radians
				svg.Property.prototype.toRadians = function() {
					if (!this.hasValue()) return 0;
					var s = this.value+'';
					if (s.match(/deg$/)) return this.numValue() * (Math.PI / 180.0);
					if (s.match(/grad$/)) return this.numValue() * (Math.PI / 200.0);
					if (s.match(/rad$/)) return this.numValue();
					return this.numValue() * (Math.PI / 180.0);
				}

		// fonts
		svg.Font = new (function() {
			this.Styles = 'normal|italic|oblique|inherit';
			this.Variants = 'normal|small-caps|inherit';
			this.Weights = 'normal|bold|bolder|lighter|100|200|300|400|500|600|700|800|900|inherit';

			this.CreateFont = function(fontStyle, fontVariant, fontWeight, fontSize, fontFamily, inherit) {
				var f = inherit != null ? this.Parse(inherit) : this.CreateFont('', '', '', '', '', svg.ctx.font);
				return {
					fontFamily: fontFamily || f.fontFamily,
					fontSize: fontSize || f.fontSize,
					fontStyle: fontStyle || f.fontStyle,
					fontWeight: fontWeight || f.fontWeight,
					fontVariant: fontVariant || f.fontVariant,
					toString: function () { return [this.fontStyle, this.fontVariant, this.fontWeight, this.fontSize, this.fontFamily].join(' ') }
				}
			}

			var that = this;
			this.Parse = function(s) {
				var f = {};
				var d = svg.trim(svg.compressSpaces(s || '')).split(' ');
				var set = { fontSize: false, fontStyle: false, fontWeight: false, fontVariant: false }
				var ff = '';
				for (var i=0; i<d.length; i++) {
					if (!set.fontStyle && that.Styles.indexOf(d[i]) != -1) { if (d[i] != 'inherit') f.fontStyle = d[i]; set.fontStyle = true; }
					else if (!set.fontVariant && that.Variants.indexOf(d[i]) != -1) { if (d[i] != 'inherit') f.fontVariant = d[i]; set.fontStyle = set.fontVariant = true;	}
					else if (!set.fontWeight && that.Weights.indexOf(d[i]) != -1) {	if (d[i] != 'inherit') f.fontWeight = d[i]; set.fontStyle = set.fontVariant = set.fontWeight = true; }
					else if (!set.fontSize) { if (d[i] != 'inherit') f.fontSize = d[i].split('/')[0]; set.fontStyle = set.fontVariant = set.fontWeight = set.fontSize = true; }
					else { if (d[i] != 'inherit') ff += d[i]; }
				} if (ff != '') f.fontFamily = ff;
				return f;
			}
		});

		// points and paths
		svg.ToNumberArray = function(s) {
			var a = svg.trim(svg.compressSpaces((s || '').replace(/,/g, ' '))).split(' ');
			for (var i=0; i<a.length; i++) {
				a[i] = parseFloat(a[i]);
			}
			return a;
		}
		svg.Point = function(x, y) {
			this.x = x;
			this.y = y;
		}
			svg.Point.prototype.angleTo = function(p) {
				return Math.atan2(p.y - this.y, p.x - this.x);
			}

			svg.Point.prototype.applyTransform = function(v) {
				var xp = this.x * v[0] + this.y * v[2] + v[4];
				var yp = this.x * v[1] + this.y * v[3] + v[5];
				this.x = xp;
				this.y = yp;
			}

		svg.CreatePoint = function(s) {
			var a = svg.ToNumberArray(s);
			return new svg.Point(a[0], a[1]);
		}
		svg.CreatePath = function(s) {
			var a = svg.ToNumberArray(s);
			var path = [];
			for (var i=0; i<a.length; i+=2) {
				path.push(new svg.Point(a[i], a[i+1]));
			}
			return path;
		}

		// bounding box
		svg.BoundingBox = function(x1, y1, x2, y2) { // pass in initial points if you want
			this.x1 = Number.NaN;
			this.y1 = Number.NaN;
			this.x2 = Number.NaN;
			this.y2 = Number.NaN;

			this.x = function() { return this.x1; }
			this.y = function() { return this.y1; }
			this.width = function() { return this.x2 - this.x1; }
			this.height = function() { return this.y2 - this.y1; }

			this.addPoint = function(x, y) {
				if (x != null) {
					if (isNaN(this.x1) || isNaN(this.x2)) {
						this.x1 = x;
						this.x2 = x;
					}
					if (x < this.x1) this.x1 = x;
					if (x > this.x2) this.x2 = x;
				}

				if (y != null) {
					if (isNaN(this.y1) || isNaN(this.y2)) {
						this.y1 = y;
						this.y2 = y;
					}
					if (y < this.y1) this.y1 = y;
					if (y > this.y2) this.y2 = y;
				}
			}
			this.addX = function(x) { this.addPoint(x, null); }
			this.addY = function(y) { this.addPoint(null, y); }

			this.addBoundingBox = function(bb) {
				this.addPoint(bb.x1, bb.y1);
				this.addPoint(bb.x2, bb.y2);
			}

			this.addQuadraticCurve = function(p0x, p0y, p1x, p1y, p2x, p2y) {
				var cp1x = p0x + 2/3 * (p1x - p0x); // CP1 = QP0 + 2/3 *(QP1-QP0)
				var cp1y = p0y + 2/3 * (p1y - p0y); // CP1 = QP0 + 2/3 *(QP1-QP0)
				var cp2x = cp1x + 1/3 * (p2x - p0x); // CP2 = CP1 + 1/3 *(QP2-QP0)
				var cp2y = cp1y + 1/3 * (p2y - p0y); // CP2 = CP1 + 1/3 *(QP2-QP0)
				this.addBezierCurve(p0x, p0y, cp1x, cp2x, cp1y,	cp2y, p2x, p2y);
			}

			this.addBezierCurve = function(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) {
				// from http://blog.hackers-cafe.net/2009/06/how-to-calculate-bezier-curves-bounding.html
				var p0 = [p0x, p0y], p1 = [p1x, p1y], p2 = [p2x, p2y], p3 = [p3x, p3y];
				this.addPoint(p0[0], p0[1]);
				this.addPoint(p3[0], p3[1]);

				for (i=0; i<=1; i++) {
					var f = function(t) {
						return Math.pow(1-t, 3) * p0[i]
						+ 3 * Math.pow(1-t, 2) * t * p1[i]
						+ 3 * (1-t) * Math.pow(t, 2) * p2[i]
						+ Math.pow(t, 3) * p3[i];
					}

					var b = 6 * p0[i] - 12 * p1[i] + 6 * p2[i];
					var a = -3 * p0[i] + 9 * p1[i] - 9 * p2[i] + 3 * p3[i];
					var c = 3 * p1[i] - 3 * p0[i];

					if (a == 0) {
						if (b == 0) continue;
						var t = -c / b;
						if (0 < t && t < 1) {
							if (i == 0) this.addX(f(t));
							if (i == 1) this.addY(f(t));
						}
						continue;
					}

					var b2ac = Math.pow(b, 2) - 4 * c * a;
					if (b2ac < 0) continue;
					var t1 = (-b + Math.sqrt(b2ac)) / (2 * a);
					if (0 < t1 && t1 < 1) {
						if (i == 0) this.addX(f(t1));
						if (i == 1) this.addY(f(t1));
					}
					var t2 = (-b - Math.sqrt(b2ac)) / (2 * a);
					if (0 < t2 && t2 < 1) {
						if (i == 0) this.addX(f(t2));
						if (i == 1) this.addY(f(t2));
					}
				}
			}

			this.isPointInBox = function(x, y) {
				return (this.x1 <= x && x <= this.x2 && this.y1 <= y && y <= this.y2);
			}

			this.addPoint(x1, y1);
			this.addPoint(x2, y2);
		}

		// transforms
		svg.Transform = function(v) {
			var that = this;
			this.Type = {}

			// translate
			this.Type.translate = function(s) {
				this.p = svg.CreatePoint(s);
				this.apply = function(ctx) {
					ctx.translate(this.p.x || 0.0, this.p.y || 0.0);
				}
				this.applyToPoint = function(p) {
					p.applyTransform([1, 0, 0, 1, this.p.x || 0.0, this.p.y || 0.0]);
				}
			}

			// rotate
			this.Type.rotate = function(s) {
				var a = svg.ToNumberArray(s);
				this.angle = new svg.Property('angle', a[0]);
				this.cx = a[1] || 0;
				this.cy = a[2] || 0;
				this.apply = function(ctx) {
					ctx.translate(this.cx, this.cy);
					ctx.rotate(this.angle.toRadians());
					ctx.translate(-this.cx, -this.cy);
				}
				this.applyToPoint = function(p) {
					var a = this.angle.toRadians();
					p.applyTransform([1, 0, 0, 1, this.p.x || 0.0, this.p.y || 0.0]);
					p.applyTransform([Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), 0, 0]);
					p.applyTransform([1, 0, 0, 1, -this.p.x || 0.0, -this.p.y || 0.0]);
				}
			}

			this.Type.scale = function(s) {
				this.p = svg.CreatePoint(s);
				this.apply = function(ctx) {
					ctx.scale(this.p.x || 1.0, this.p.y || this.p.x || 1.0);
				}
				this.applyToPoint = function(p) {
					p.applyTransform([this.p.x || 0.0, 0, 0, this.p.y || 0.0, 0, 0]);
				}
			}

			this.Type.matrix = function(s) {
				this.m = svg.ToNumberArray(s);
				this.apply = function(ctx) {
					ctx.transform(this.m[0], this.m[1], this.m[2], this.m[3], this.m[4], this.m[5]);
				}
				this.applyToPoint = function(p) {
					p.applyTransform(this.m);
				}
			}

			this.Type.SkewBase = function(s) {
				this.base = that.Type.matrix;
				this.base(s);
				this.angle = new svg.Property('angle', s);
			}
			this.Type.SkewBase.prototype = new this.Type.matrix;

			this.Type.skewX = function(s) {
				this.base = that.Type.SkewBase;
				this.base(s);
				this.m = [1, 0, Math.tan(this.angle.toRadians()), 1, 0, 0];
			}
			this.Type.skewX.prototype = new this.Type.SkewBase;

			this.Type.skewY = function(s) {
				this.base = that.Type.SkewBase;
				this.base(s);
				this.m = [1, Math.tan(this.angle.toRadians()), 0, 1, 0, 0];
			}
			this.Type.skewY.prototype = new this.Type.SkewBase;

			this.transforms = [];

			this.apply = function(ctx) {
				for (var i=0; i<this.transforms.length; i++) {
					this.transforms[i].apply(ctx);
				}
			}

			this.applyToPoint = function(p) {
				for (var i=0; i<this.transforms.length; i++) {
					this.transforms[i].applyToPoint(p);
				}
			}

			var data = svg.trim(svg.compressSpaces(v)).split(/\s(?=[a-z])/);
			for (var i=0; i<data.length; i++) {
				var type = data[i].split('(')[0];
				var s = data[i].split('(')[1].replace(')','');
				var transform = new this.Type[type](s);
				this.transforms.push(transform);
			}
		}

		// aspect ratio
		svg.AspectRatio = function(ctx, aspectRatio, width, desiredWidth, height, desiredHeight, minX, minY, refX, refY) {
			// aspect ratio - http://www.w3.org/TR/SVG/coords.html#PreserveAspectRatioAttribute
			aspectRatio = svg.compressSpaces(aspectRatio);
			aspectRatio = aspectRatio.replace(/^defer\s/,''); // ignore defer
			var align = aspectRatio.split(' ')[0] || 'xMidYMid';
			var meetOrSlice = aspectRatio.split(' ')[1] || 'meet';

			// calculate scale
			var scaleX = width / desiredWidth;
			var scaleY = height / desiredHeight;
			var scaleMin = Math.min(scaleX, scaleY);
			var scaleMax = Math.max(scaleX, scaleY);
			if (meetOrSlice == 'meet') { desiredWidth *= scaleMin; desiredHeight *= scaleMin; }
			if (meetOrSlice == 'slice') { desiredWidth *= scaleMax; desiredHeight *= scaleMax; }

			refX = new svg.Property('refX', refX);
			refY = new svg.Property('refY', refY);
			if (refX.hasValue() && refY.hasValue()) {
				ctx.translate(-scaleMin * refX.toPixels('x'), -scaleMin * refY.toPixels('y'));
			}
			else {
				// align
				if (align.match(/^xMid/) && ((meetOrSlice == 'meet' && scaleMin == scaleY) || (meetOrSlice == 'slice' && scaleMax == scaleY))) ctx.translate(width / 2.0 - desiredWidth / 2.0, 0);
				if (align.match(/YMid$/) && ((meetOrSlice == 'meet' && scaleMin == scaleX) || (meetOrSlice == 'slice' && scaleMax == scaleX))) ctx.translate(0, height / 2.0 - desiredHeight / 2.0);
				if (align.match(/^xMax/) && ((meetOrSlice == 'meet' && scaleMin == scaleY) || (meetOrSlice == 'slice' && scaleMax == scaleY))) ctx.translate(width - desiredWidth, 0);
				if (align.match(/YMax$/) && ((meetOrSlice == 'meet' && scaleMin == scaleX) || (meetOrSlice == 'slice' && scaleMax == scaleX))) ctx.translate(0, height - desiredHeight);
			}

			// scale
			if (align == 'none') ctx.scale(scaleX, scaleY);
			else if (meetOrSlice == 'meet') ctx.scale(scaleMin, scaleMin);
			else if (meetOrSlice == 'slice') ctx.scale(scaleMax, scaleMax);

			// translate
			ctx.translate(minX == null ? 0 : -minX, minY == null ? 0 : -minY);
		}

		// elements
		svg.Element = {}

		svg.EmptyProperty = new svg.Property('EMPTY', '');

		svg.Element.ElementBase = function(node) {
			this.attributes = {};
			this.styles = {};
			this.children = [];

			// get or create attribute
			this.attribute = function(name, createIfNotExists) {
				var a = this.attributes[name];
				if (a != null) return a;

				if (createIfNotExists == true) { a = new svg.Property(name, ''); this.attributes[name] = a; }
				return a || svg.EmptyProperty;
			}

			// get or create style, crawls up node tree
			this.style = function(name, createIfNotExists) {
				var s = this.styles[name];
				if (s != null) return s;

				var a = this.attribute(name);
				if (a != null && a.hasValue()) {
					this.styles[name] = a; // move up to me to cache
					return a;
				}

				var p = this.parent;
				if (p != null) {
					var ps = p.style(name);
					if (ps != null && ps.hasValue()) {
						return ps;
					}
				}

				if (createIfNotExists == true) { s = new svg.Property(name, ''); this.styles[name] = s; }
				return s || svg.EmptyProperty;
			}

			// base render
			this.render = function(ctx) {
				// don't render display=none
				if (this.style('display').value == 'none') return;

				// don't render visibility=hidden
				if (this.attribute('visibility').value == 'hidden') return;

				ctx.save();
					this.setContext(ctx);
						// mask
						if (this.attribute('mask').hasValue()) {
							var mask = this.attribute('mask').getDefinition();
							if (mask != null) mask.apply(ctx, this);
						}
						else if (this.style('filter').hasValue()) {
							var filter = this.style('filter').getDefinition();
							if (filter != null) filter.apply(ctx, this);
						}
						else this.renderChildren(ctx);
					this.clearContext(ctx);
				ctx.restore();
			}

			// base set context
			this.setContext = function(ctx) {
				// OVERRIDE ME!
			}

			// base clear context
			this.clearContext = function(ctx) {
				// OVERRIDE ME!
			}

			// base render children
			this.renderChildren = function(ctx) {
				for (var i=0; i<this.children.length; i++) {
					this.children[i].render(ctx);
				}
			}

			this.addChild = function(childNode, create) {
				var child = childNode;
				if (create) child = svg.CreateElement(childNode);
				child.parent = this;
				this.children.push(child);
			}

			if (node != null && node.nodeType == 1) { //ELEMENT_NODE
				// add children
				for (var i=0; i<node.childNodes.length; i++) {
					var childNode = node.childNodes[i];
					if (childNode.nodeType == 1) this.addChild(childNode, true); //ELEMENT_NODE
				}

				// add attributes
				for (var i=0; i<node.attributes.length; i++) {
					var attribute = node.attributes[i];
					this.attributes[attribute.nodeName] = new svg.Property(attribute.nodeName, attribute.nodeValue);
				}

				// add tag styles
				var styles = svg.Styles[node.nodeName];
				if (styles != null) {
					for (var name in styles) {
						this.styles[name] = styles[name];
					}
				}

				// add class styles
				if (this.attribute('class').hasValue()) {
					var classes = svg.compressSpaces(this.attribute('class').value).split(' ');
					for (var j=0; j<classes.length; j++) {
						styles = svg.Styles['.'+classes[j]];
						if (styles != null) {
							for (var name in styles) {
								this.styles[name] = styles[name];
							}
						}
						styles = svg.Styles[node.nodeName+'.'+classes[j]];
						if (styles != null) {
							for (var name in styles) {
								this.styles[name] = styles[name];
							}
						}
					}
				}

				// add id styles
				if (this.attribute('id').hasValue()) {
					var styles = svg.Styles['#' + this.attribute('id').value];
					if (styles != null) {
						for (var name in styles) {
							this.styles[name] = styles[name];
						}
					}
				}

				// add inline styles
				if (this.attribute('style').hasValue()) {
					var styles = this.attribute('style').value.split(';');
					for (var i=0; i<styles.length; i++) {
						if (svg.trim(styles[i]) != '') {
							var style = styles[i].split(':');
							var name = svg.trim(style[0]);
							var value = svg.trim(style[1]);
							this.styles[name] = new svg.Property(name, value);
						}
					}
				}

				// add id
				if (this.attribute('id').hasValue()) {
					if (svg.Definitions[this.attribute('id').value] == null) {
						svg.Definitions[this.attribute('id').value] = this;
					}
				}
			}
		}

		svg.Element.RenderedElementBase = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			this.setContext = function(ctx) {
				// fill
				if (this.style('fill').isUrlDefinition()) {
					var fs = this.style('fill').getFillStyleDefinition(this);
					if (fs != null) ctx.fillStyle = fs;
				}
				else if (this.style('fill').hasValue()) {
					var fillStyle = this.style('fill');
					if (fillStyle.value == 'currentColor') fillStyle.value = this.style('color').value;
					ctx.fillStyle = (fillStyle.value == 'none' ? 'rgba(0,0,0,0)' : fillStyle.value);
				}
				if (this.style('fill-opacity').hasValue()) {
					var fillStyle = new svg.Property('fill', ctx.fillStyle);
					fillStyle = fillStyle.addOpacity(this.style('fill-opacity').value);
					ctx.fillStyle = fillStyle.value;
				}

				// stroke
				if (this.style('stroke').isUrlDefinition()) {
					var fs = this.style('stroke').getFillStyleDefinition(this);
					if (fs != null) ctx.strokeStyle = fs;
				}
				else if (this.style('stroke').hasValue()) {
					var strokeStyle = this.style('stroke');
					if (strokeStyle.value == 'currentColor') strokeStyle.value = this.style('color').value;
					ctx.strokeStyle = (strokeStyle.value == 'none' ? 'rgba(0,0,0,0)' : strokeStyle.value);
				}
				if (this.style('stroke-opacity').hasValue()) {
					var strokeStyle = new svg.Property('stroke', ctx.strokeStyle);
					strokeStyle = strokeStyle.addOpacity(this.style('stroke-opacity').value);
					ctx.strokeStyle = strokeStyle.value;
				}
				if (this.style('stroke-width').hasValue()) ctx.lineWidth = this.style('stroke-width').toPixels();
				if (this.style('stroke-linecap').hasValue()) ctx.lineCap = this.style('stroke-linecap').value;
				if (this.style('stroke-linejoin').hasValue()) ctx.lineJoin = this.style('stroke-linejoin').value;
				if (this.style('stroke-miterlimit').hasValue()) ctx.miterLimit = this.style('stroke-miterlimit').value;

				// font
				if (typeof(ctx.font) != 'undefined') {
					ctx.font = svg.Font.CreateFont(
						this.style('font-style').value,
						this.style('font-variant').value,
						this.style('font-weight').value,
						this.style('font-size').hasValue() ? this.style('font-size').toPixels() + 'px' : '',
						this.style('font-family').value).toString();
				}

				// transform
				if (this.attribute('transform').hasValue()) {
					var transform = new svg.Transform(this.attribute('transform').value);
					transform.apply(ctx);
				}

				// clip
				if (this.attribute('clip-path').hasValue()) {
					var clip = this.attribute('clip-path').getDefinition();
					if (clip != null) clip.apply(ctx);
				}

				// opacity
				if (this.style('opacity').hasValue()) {
					ctx.globalAlpha = this.style('opacity').numValue();
				}
			}
		}
		svg.Element.RenderedElementBase.prototype = new svg.Element.ElementBase;

		svg.Element.PathElementBase = function(node) {
			this.base = svg.Element.RenderedElementBase;
			this.base(node);

			this.path = function(ctx) {
				if (ctx != null) ctx.beginPath();
				return new svg.BoundingBox();
			}

			this.renderChildren = function(ctx) {
				this.path(ctx);
				svg.Mouse.checkPath(this, ctx);
				if (ctx.fillStyle != '') ctx.fill();
				if (ctx.strokeStyle != '') ctx.stroke();

				var markers = this.getMarkers();
				if (markers != null) {
					if (this.style('marker-start').isUrlDefinition()) {
						var marker = this.style('marker-start').getDefinition();
						marker.render(ctx, markers[0][0], markers[0][1]);
					}
					if (this.style('marker-mid').isUrlDefinition()) {
						var marker = this.style('marker-mid').getDefinition();
						for (var i=1;i<markers.length-1;i++) {
							marker.render(ctx, markers[i][0], markers[i][1]);
						}
					}
					if (this.style('marker-end').isUrlDefinition()) {
						var marker = this.style('marker-end').getDefinition();
						marker.render(ctx, markers[markers.length-1][0], markers[markers.length-1][1]);
					}
				}
			}

			this.getBoundingBox = function() {
				return this.path();
			}

			this.getMarkers = function() {
				return null;
			}
		}
		svg.Element.PathElementBase.prototype = new svg.Element.RenderedElementBase;

		// svg element
		svg.Element.svg = function(node) {
			this.base = svg.Element.RenderedElementBase;
			this.base(node);

			this.baseClearContext = this.clearContext;
			this.clearContext = function(ctx) {
				this.baseClearContext(ctx);
				svg.ViewPort.RemoveCurrent();
			}

			this.baseSetContext = this.setContext;
			this.setContext = function(ctx) {
				// initial values
				ctx.strokeStyle = 'rgba(0,0,0,0)';
				ctx.lineCap = 'butt';
				ctx.lineJoin = 'miter';
				ctx.miterLimit = 4;

				this.baseSetContext(ctx);

				// create new view port
				if (!this.attribute('x').hasValue()) this.attribute('x', true).value = 0;
				if (!this.attribute('y').hasValue()) this.attribute('y', true).value = 0;
				ctx.translate(this.attribute('x').toPixels('x'), this.attribute('y').toPixels('y'));

				var width = svg.ViewPort.width();
				var height = svg.ViewPort.height();

				if (!this.attribute('width').hasValue()) this.attribute('width', true).value = '100%';
				if (!this.attribute('height').hasValue()) this.attribute('height', true).value = '100%';
				if (typeof(this.root) == 'undefined') {
					width = this.attribute('width').toPixels('x');
					height = this.attribute('height').toPixels('y');

					var x = 0;
					var y = 0;
					if (this.attribute('refX').hasValue() && this.attribute('refY').hasValue()) {
						x = -this.attribute('refX').toPixels('x');
						y = -this.attribute('refY').toPixels('y');
					}

					ctx.beginPath();
					ctx.moveTo(x, y);
					ctx.lineTo(width, y);
					ctx.lineTo(width, height);
					ctx.lineTo(x, height);
					ctx.closePath();
					ctx.clip();
				}
				svg.ViewPort.SetCurrent(width, height);

				// viewbox
				if (this.attribute('viewBox').hasValue()) {
					var viewBox = svg.ToNumberArray(this.attribute('viewBox').value);
					var minX = viewBox[0];
					var minY = viewBox[1];
					width = viewBox[2];
					height = viewBox[3];

					svg.AspectRatio(ctx,
									this.attribute('preserveAspectRatio').value,
									svg.ViewPort.width(),
									width,
									svg.ViewPort.height(),
									height,
									minX,
									minY,
									this.attribute('refX').value,
									this.attribute('refY').value);

					svg.ViewPort.RemoveCurrent();
					svg.ViewPort.SetCurrent(viewBox[2], viewBox[3]);
				}
			}
		}
		svg.Element.svg.prototype = new svg.Element.RenderedElementBase;

		// rect element
		svg.Element.rect = function(node) {
			this.base = svg.Element.PathElementBase;
			this.base(node);

			this.path = function(ctx) {
				var x = this.attribute('x').toPixels('x');
				var y = this.attribute('y').toPixels('y');
				var width = this.attribute('width').toPixels('x');
				var height = this.attribute('height').toPixels('y');
				var rx = this.attribute('rx').toPixels('x');
				var ry = this.attribute('ry').toPixels('y');
				if (this.attribute('rx').hasValue() && !this.attribute('ry').hasValue()) ry = rx;
				if (this.attribute('ry').hasValue() && !this.attribute('rx').hasValue()) rx = ry;

				if (ctx != null) {
					ctx.beginPath();
					ctx.moveTo(x + rx, y);
					ctx.lineTo(x + width - rx, y);
					ctx.quadraticCurveTo(x + width, y, x + width, y + ry)
					ctx.lineTo(x + width, y + height - ry);
					ctx.quadraticCurveTo(x + width, y + height, x + width - rx, y + height)
					ctx.lineTo(x + rx, y + height);
					ctx.quadraticCurveTo(x, y + height, x, y + height - ry)
					ctx.lineTo(x, y + ry);
					ctx.quadraticCurveTo(x, y, x + rx, y)
					ctx.closePath();
				}

				return new svg.BoundingBox(x, y, x + width, y + height);
			}
		}
		svg.Element.rect.prototype = new svg.Element.PathElementBase;

		// circle element
		svg.Element.circle = function(node) {
			this.base = svg.Element.PathElementBase;
			this.base(node);

			this.path = function(ctx) {
				var cx = this.attribute('cx').toPixels('x');
				var cy = this.attribute('cy').toPixels('y');
				var r = this.attribute('r').toPixels();

				if (ctx != null) {
					ctx.beginPath();
					ctx.arc(cx, cy, r, 0, Math.PI * 2, true);
					ctx.closePath();
				}

				return new svg.BoundingBox(cx - r, cy - r, cx + r, cy + r);
			}
		}
		svg.Element.circle.prototype = new svg.Element.PathElementBase;

		// ellipse element
		svg.Element.ellipse = function(node) {
			this.base = svg.Element.PathElementBase;
			this.base(node);

			this.path = function(ctx) {
				var KAPPA = 4 * ((Math.sqrt(2) - 1) / 3);
				var rx = this.attribute('rx').toPixels('x');
				var ry = this.attribute('ry').toPixels('y');
				var cx = this.attribute('cx').toPixels('x');
				var cy = this.attribute('cy').toPixels('y');

				if (ctx != null) {
					ctx.beginPath();
					ctx.moveTo(cx, cy - ry);
					ctx.bezierCurveTo(cx + (KAPPA * rx), cy - ry,  cx + rx, cy - (KAPPA * ry), cx + rx, cy);
					ctx.bezierCurveTo(cx + rx, cy + (KAPPA * ry), cx + (KAPPA * rx), cy + ry, cx, cy + ry);
					ctx.bezierCurveTo(cx - (KAPPA * rx), cy + ry, cx - rx, cy + (KAPPA * ry), cx - rx, cy);
					ctx.bezierCurveTo(cx - rx, cy - (KAPPA * ry), cx - (KAPPA * rx), cy - ry, cx, cy - ry);
					ctx.closePath();
				}

				return new svg.BoundingBox(cx - rx, cy - ry, cx + rx, cy + ry);
			}
		}
		svg.Element.ellipse.prototype = new svg.Element.PathElementBase;

		// line element
		svg.Element.line = function(node) {
			this.base = svg.Element.PathElementBase;
			this.base(node);

			this.getPoints = function() {
				return [
					new svg.Point(this.attribute('x1').toPixels('x'), this.attribute('y1').toPixels('y')),
					new svg.Point(this.attribute('x2').toPixels('x'), this.attribute('y2').toPixels('y'))];
			}

			this.path = function(ctx) {
				var points = this.getPoints();

				if (ctx != null) {
					ctx.beginPath();
					ctx.moveTo(points[0].x, points[0].y);
					ctx.lineTo(points[1].x, points[1].y);
				}

				return new svg.BoundingBox(points[0].x, points[0].y, points[1].x, points[1].y);
			}

			this.getMarkers = function() {
				var points = this.getPoints();
				var a = points[0].angleTo(points[1]);
				return [[points[0], a], [points[1], a]];
			}
		}
		svg.Element.line.prototype = new svg.Element.PathElementBase;

		// polyline element
		svg.Element.polyline = function(node) {
			this.base = svg.Element.PathElementBase;
			this.base(node);

			this.points = svg.CreatePath(this.attribute('points').value);
			this.path = function(ctx) {
				var bb = new svg.BoundingBox(this.points[0].x, this.points[0].y);
				if (ctx != null) {
					ctx.beginPath();
					ctx.moveTo(this.points[0].x, this.points[0].y);
				}
				for (var i=1; i<this.points.length; i++) {
					bb.addPoint(this.points[i].x, this.points[i].y);
					if (ctx != null) ctx.lineTo(this.points[i].x, this.points[i].y);
				}
				return bb;
			}

			this.getMarkers = function() {
				var markers = [];
				for (var i=0; i<this.points.length - 1; i++) {
					markers.push([this.points[i], this.points[i].angleTo(this.points[i+1])]);
				}
				markers.push([this.points[this.points.length-1], markers[markers.length-1][1]]);
				return markers;
			}
		}
		svg.Element.polyline.prototype = new svg.Element.PathElementBase;

		// polygon element
		svg.Element.polygon = function(node) {
			this.base = svg.Element.polyline;
			this.base(node);

			this.basePath = this.path;
			this.path = function(ctx) {
				var bb = this.basePath(ctx);
				if (ctx != null) {
					ctx.lineTo(this.points[0].x, this.points[0].y);
					ctx.closePath();
				}
				return bb;
			}
		}
		svg.Element.polygon.prototype = new svg.Element.polyline;

		// path element
		svg.Element.path = function(node) {
			this.base = svg.Element.PathElementBase;
			this.base(node);

			var d = this.attribute('d').value;
			// TODO: convert to real lexer based on http://www.w3.org/TR/SVG11/paths.html#PathDataBNF
			d = d.replace(/,/gm,' '); // get rid of all commas
			d = d.replace(/([MmZzLlHhVvCcSsQqTtAa])([MmZzLlHhVvCcSsQqTtAa])/gm,'$1 $2'); // separate commands from commands
			d = d.replace(/([MmZzLlHhVvCcSsQqTtAa])([MmZzLlHhVvCcSsQqTtAa])/gm,'$1 $2'); // separate commands from commands
			d = d.replace(/([MmZzLlHhVvCcSsQqTtAa])([^\s])/gm,'$1 $2'); // separate commands from points
			d = d.replace(/([^\s])([MmZzLlHhVvCcSsQqTtAa])/gm,'$1 $2'); // separate commands from points
			d = d.replace(/([0-9])([+\-])/gm,'$1 $2'); // separate digits when no comma
			d = d.replace(/(\.[0-9]*)(\.)/gm,'$1 $2'); // separate digits when no comma
			d = d.replace(/([Aa](\s+[0-9]+){3})\s+([01])\s*([01])/gm,'$1 $3 $4 '); // shorthand elliptical arc path syntax
			d = svg.compressSpaces(d); // compress multiple spaces
			d = svg.trim(d);
			this.PathParser = new (function(d) {
				this.tokens = d.split(' ');

				this.reset = function() {
					this.i = -1;
					this.command = '';
					this.previousCommand = '';
					this.start = new svg.Point(0, 0);
					this.control = new svg.Point(0, 0);
					this.current = new svg.Point(0, 0);
					this.points = [];
					this.angles = [];
				}

				this.isEnd = function() {
					return this.i >= this.tokens.length - 1;
				}

				this.isCommandOrEnd = function() {
					if (this.isEnd()) return true;
					return this.tokens[this.i + 1].match(/^[A-Za-z]$/) != null;
				}

				this.isRelativeCommand = function() {
					switch(this.command)
					{
						case 'm':
						case 'l':
						case 'h':
						case 'v':
						case 'c':
						case 's':
						case 'q':
						case 't':
						case 'a':
						case 'z':
							return true;
							break;
					}
					return false;
				}

				this.getToken = function() {
					this.i++;
					return this.tokens[this.i];
				}

				this.getScalar = function() {
					return parseFloat(this.getToken());
				}

				this.nextCommand = function() {
					this.previousCommand = this.command;
					this.command = this.getToken();
				}

				this.getPoint = function() {
					var p = new svg.Point(this.getScalar(), this.getScalar());
					return this.makeAbsolute(p);
				}

				this.getAsControlPoint = function() {
					var p = this.getPoint();
					this.control = p;
					return p;
				}

				this.getAsCurrentPoint = function() {
					var p = this.getPoint();
					this.current = p;
					return p;
				}

				this.getReflectedControlPoint = function() {
					if (this.previousCommand.toLowerCase() != 'c' && this.previousCommand.toLowerCase() != 's') {
						return this.current;
					}

					// reflect point
					var p = new svg.Point(2 * this.current.x - this.control.x, 2 * this.current.y - this.control.y);
					return p;
				}

				this.makeAbsolute = function(p) {
					if (this.isRelativeCommand()) {
						p.x += this.current.x;
						p.y += this.current.y;
					}
					return p;
				}

				this.addMarker = function(p, from, priorTo) {
					// if the last angle isn't filled in because we didn't have this point yet ...
					if (priorTo != null && this.angles.length > 0 && this.angles[this.angles.length-1] == null) {
						this.angles[this.angles.length-1] = this.points[this.points.length-1].angleTo(priorTo);
					}
					this.addMarkerAngle(p, from == null ? null : from.angleTo(p));
				}

				this.addMarkerAngle = function(p, a) {
					this.points.push(p);
					this.angles.push(a);
				}

				this.getMarkerPoints = function() { return this.points; }
				this.getMarkerAngles = function() {
					for (var i=0; i<this.angles.length; i++) {
						if (this.angles[i] == null) {
							for (var j=i+1; j<this.angles.length; j++) {
								if (this.angles[j] != null) {
									this.angles[i] = this.angles[j];
									break;
								}
							}
						}
					}
					return this.angles;
				}
			})(d);

			this.path = function(ctx) {
				var pp = this.PathParser;
				pp.reset();

				var bb = new svg.BoundingBox();
				if (ctx != null) ctx.beginPath();
				while (!pp.isEnd()) {
					pp.nextCommand();
					switch (pp.command) {
					case 'M':
					case 'm':
						var p = pp.getAsCurrentPoint();
						pp.addMarker(p);
						bb.addPoint(p.x, p.y);
						if (ctx != null) ctx.moveTo(p.x, p.y);
						pp.start = pp.current;
						while (!pp.isCommandOrEnd()) {
							var p = pp.getAsCurrentPoint();
							pp.addMarker(p, pp.start);
							bb.addPoint(p.x, p.y);
							if (ctx != null) ctx.lineTo(p.x, p.y);
						}
						break;
					case 'L':
					case 'l':
						while (!pp.isCommandOrEnd()) {
							var c = pp.current;
							var p = pp.getAsCurrentPoint();
							pp.addMarker(p, c);
							bb.addPoint(p.x, p.y);
							if (ctx != null) ctx.lineTo(p.x, p.y);
						}
						break;
					case 'H':
					case 'h':
						while (!pp.isCommandOrEnd()) {
							var newP = new svg.Point((pp.isRelativeCommand() ? pp.current.x : 0) + pp.getScalar(), pp.current.y);
							pp.addMarker(newP, pp.current);
							pp.current = newP;
							bb.addPoint(pp.current.x, pp.current.y);
							if (ctx != null) ctx.lineTo(pp.current.x, pp.current.y);
						}
						break;
					case 'V':
					case 'v':
						while (!pp.isCommandOrEnd()) {
							var newP = new svg.Point(pp.current.x, (pp.isRelativeCommand() ? pp.current.y : 0) + pp.getScalar());
							pp.addMarker(newP, pp.current);
							pp.current = newP;
							bb.addPoint(pp.current.x, pp.current.y);
							if (ctx != null) ctx.lineTo(pp.current.x, pp.current.y);
						}
						break;
					case 'C':
					case 'c':
						while (!pp.isCommandOrEnd()) {
							var curr = pp.current;
							var p1 = pp.getPoint();
							var cntrl = pp.getAsControlPoint();
							var cp = pp.getAsCurrentPoint();
							pp.addMarker(cp, cntrl, p1);
							bb.addBezierCurve(curr.x, curr.y, p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
							if (ctx != null) ctx.bezierCurveTo(p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
						}
						break;
					case 'S':
					case 's':
						while (!pp.isCommandOrEnd()) {
							var curr = pp.current;
							var p1 = pp.getReflectedControlPoint();
							var cntrl = pp.getAsControlPoint();
							var cp = pp.getAsCurrentPoint();
							pp.addMarker(cp, cntrl, p1);
							bb.addBezierCurve(curr.x, curr.y, p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
							if (ctx != null) ctx.bezierCurveTo(p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
						}
						break;
					case 'Q':
					case 'q':
						while (!pp.isCommandOrEnd()) {
							var curr = pp.current;
							var cntrl = pp.getAsControlPoint();
							var cp = pp.getAsCurrentPoint();
							pp.addMarker(cp, cntrl, cntrl);
							bb.addQuadraticCurve(curr.x, curr.y, cntrl.x, cntrl.y, cp.x, cp.y);
							if (ctx != null) ctx.quadraticCurveTo(cntrl.x, cntrl.y, cp.x, cp.y);
						}
						break;
					case 'T':
					case 't':
						while (!pp.isCommandOrEnd()) {
							var curr = pp.current;
							var cntrl = pp.getReflectedControlPoint();
							pp.control = cntrl;
							var cp = pp.getAsCurrentPoint();
							pp.addMarker(cp, cntrl, cntrl);
							bb.addQuadraticCurve(curr.x, curr.y, cntrl.x, cntrl.y, cp.x, cp.y);
							if (ctx != null) ctx.quadraticCurveTo(cntrl.x, cntrl.y, cp.x, cp.y);
						}
						break;
					case 'A':
					case 'a':
						while (!pp.isCommandOrEnd()) {
						    var curr = pp.current;
							var rx = pp.getScalar();
							var ry = pp.getScalar();
							var xAxisRotation = pp.getScalar() * (Math.PI / 180.0);
							var largeArcFlag = pp.getScalar();
							var sweepFlag = pp.getScalar();
							var cp = pp.getAsCurrentPoint();

							// Conversion from endpoint to center parameterization
							// http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
							// x1', y1'
							var currp = new svg.Point(
								Math.cos(xAxisRotation) * (curr.x - cp.x) / 2.0 + Math.sin(xAxisRotation) * (curr.y - cp.y) / 2.0,
								-Math.sin(xAxisRotation) * (curr.x - cp.x) / 2.0 + Math.cos(xAxisRotation) * (curr.y - cp.y) / 2.0
							);
							// adjust radii
							var l = Math.pow(currp.x,2)/Math.pow(rx,2)+Math.pow(currp.y,2)/Math.pow(ry,2);
							if (l > 1) {
								rx *= Math.sqrt(l);
								ry *= Math.sqrt(l);
							}
							// cx', cy'
							var s = (largeArcFlag == sweepFlag ? -1 : 1) * Math.sqrt(
								((Math.pow(rx,2)*Math.pow(ry,2))-(Math.pow(rx,2)*Math.pow(currp.y,2))-(Math.pow(ry,2)*Math.pow(currp.x,2))) /
								(Math.pow(rx,2)*Math.pow(currp.y,2)+Math.pow(ry,2)*Math.pow(currp.x,2))
							);
							if (isNaN(s)) s = 0;
							var cpp = new svg.Point(s * rx * currp.y / ry, s * -ry * currp.x / rx);
							// cx, cy
							var centp = new svg.Point(
								(curr.x + cp.x) / 2.0 + Math.cos(xAxisRotation) * cpp.x - Math.sin(xAxisRotation) * cpp.y,
								(curr.y + cp.y) / 2.0 + Math.sin(xAxisRotation) * cpp.x + Math.cos(xAxisRotation) * cpp.y
							);
							// vector magnitude
							var m = function(v) { return Math.sqrt(Math.pow(v[0],2) + Math.pow(v[1],2)); }
							// ratio between two vectors
							var r = function(u, v) { return (u[0]*v[0]+u[1]*v[1]) / (m(u)*m(v)) }
							// angle between two vectors
							var a = function(u, v) { return (u[0]*v[1] < u[1]*v[0] ? -1 : 1) * Math.acos(r(u,v)); }
							// initial angle
							var a1 = a([1,0], [(currp.x-cpp.x)/rx,(currp.y-cpp.y)/ry]);
							// angle delta
							var u = [(currp.x-cpp.x)/rx,(currp.y-cpp.y)/ry];
							var v = [(-currp.x-cpp.x)/rx,(-currp.y-cpp.y)/ry];
							var ad = a(u, v);
							if (r(u,v) <= -1) ad = Math.PI;
							if (r(u,v) >= 1) ad = 0;

							if (sweepFlag == 0 && ad > 0) ad = ad - 2 * Math.PI;
							if (sweepFlag == 1 && ad < 0) ad = ad + 2 * Math.PI;

							// for markers
							var halfWay = new svg.Point(
								centp.x + rx * Math.cos((a1 + (a1 + ad)) / 2),
								centp.y + ry * Math.sin((a1 + (a1 + ad)) / 2)
							);
							pp.addMarkerAngle(halfWay, (a1 + (a1 + ad)) / 2 + (sweepFlag == 0 ? -1 : 1) * Math.PI / 2);
							pp.addMarkerAngle(cp, (a1 + ad) + (sweepFlag == 0 ? -1 : 1) * Math.PI / 2);

							bb.addPoint(cp.x, cp.y); // TODO: this is too naive, make it better
							if (ctx != null) {
								var r = rx > ry ? rx : ry;
								var sx = rx > ry ? 1 : rx / ry;
								var sy = rx > ry ? ry / rx : 1;

								ctx.translate(centp.x, centp.y);
								ctx.rotate(xAxisRotation);
								ctx.scale(sx, sy);
								ctx.arc(0, 0, r, a1, a1 + ad, 1 - sweepFlag);
								ctx.scale(1/sx, 1/sy);
								ctx.rotate(-xAxisRotation);
								ctx.translate(-centp.x, -centp.y);
							}
						}
						break;
					case 'Z':
					case 'z':
						if (ctx != null) ctx.closePath();
						pp.current = pp.start;
					}
				}

				return bb;
			}

			this.getMarkers = function() {
				var points = this.PathParser.getMarkerPoints();
				var angles = this.PathParser.getMarkerAngles();

				var markers = [];
				for (var i=0; i<points.length; i++) {
					markers.push([points[i], angles[i]]);
				}
				return markers;
			}
		}
		svg.Element.path.prototype = new svg.Element.PathElementBase;

		// pattern element
		svg.Element.pattern = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			this.createPattern = function(ctx, element) {
				// render me using a temporary svg element
				var tempSvg = new svg.Element.svg();
				tempSvg.attributes['viewBox'] = new svg.Property('viewBox', this.attribute('viewBox').value);
				tempSvg.attributes['x'] = new svg.Property('x', this.attribute('x').value);
				tempSvg.attributes['y'] = new svg.Property('y', this.attribute('y').value);
				tempSvg.attributes['width'] = new svg.Property('width', this.attribute('width').value);
				tempSvg.attributes['height'] = new svg.Property('height', this.attribute('height').value);
				tempSvg.children = this.children;

				var c = document.createElement('canvas');
				document.body.appendChild(c);
				c.width = this.attribute('width').toPixels('x') + this.attribute('x').toPixels('x');
				c.height = this.attribute('height').toPixels('y')  + this.attribute('y').toPixels('y');
				tempSvg.render(c.getContext('2d'));
				return ctx.createPattern(c, 'repeat');
			}
		}
		svg.Element.pattern.prototype = new svg.Element.ElementBase;

		// marker element
		svg.Element.marker = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			this.baseRender = this.render;
			this.render = function(ctx, point, angle) {
				ctx.translate(point.x, point.y);
				if (this.attribute('orient').valueOrDefault('auto') == 'auto') ctx.rotate(angle);
				if (this.attribute('markerUnits').valueOrDefault('strokeWidth') == 'strokeWidth') ctx.scale(ctx.lineWidth, ctx.lineWidth);
				ctx.save();

				// render me using a temporary svg element
				var tempSvg = new svg.Element.svg();
				tempSvg.attributes['viewBox'] = new svg.Property('viewBox', this.attribute('viewBox').value);
				tempSvg.attributes['refX'] = new svg.Property('refX', this.attribute('refX').value);
				tempSvg.attributes['refY'] = new svg.Property('refY', this.attribute('refY').value);
				tempSvg.attributes['width'] = new svg.Property('width', this.attribute('markerWidth').value);
				tempSvg.attributes['height'] = new svg.Property('height', this.attribute('markerHeight').value);
				tempSvg.attributes['fill'] = new svg.Property('fill', this.attribute('fill').valueOrDefault('black'));
				tempSvg.attributes['stroke'] = new svg.Property('stroke', this.attribute('stroke').valueOrDefault('none'));
				tempSvg.children = this.children;
				tempSvg.render(ctx);

				ctx.restore();
				if (this.attribute('markerUnits').valueOrDefault('strokeWidth') == 'strokeWidth') ctx.scale(1/ctx.lineWidth, 1/ctx.lineWidth);
				if (this.attribute('orient').valueOrDefault('auto') == 'auto') ctx.rotate(-angle);
				ctx.translate(-point.x, -point.y);
			}
		}
		svg.Element.marker.prototype = new svg.Element.ElementBase;

		// definitions element
		svg.Element.defs = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			this.render = function(ctx) {
				// NOOP
			}
		}
		svg.Element.defs.prototype = new svg.Element.ElementBase;

		// base for gradients
		svg.Element.GradientBase = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			this.gradientUnits = this.attribute('gradientUnits').valueOrDefault('objectBoundingBox');

			this.stops = [];
			for (var i=0; i<this.children.length; i++) {
				var child = this.children[i];
				this.stops.push(child);
			}

			this.getGradient = function() {
				// OVERRIDE ME!
			}

			this.createGradient = function(ctx, element) {
				var stopsContainer = this;
				if (this.attribute('xlink:href').hasValue()) {
					stopsContainer = this.attribute('xlink:href').getDefinition();
				}

				var g = this.getGradient(ctx, element);
				if (g == null) return stopsContainer.stops[stopsContainer.stops.length - 1].color;
				for (var i=0; i<stopsContainer.stops.length; i++) {
					g.addColorStop(stopsContainer.stops[i].offset, stopsContainer.stops[i].color);
				}

				if (this.attribute('gradientTransform').hasValue()) {
					// render as transformed pattern on temporary canvas
					var rootView = svg.ViewPort.viewPorts[0];

					var rect = new svg.Element.rect();
					rect.attributes['x'] = new svg.Property('x', -svg.MAX_VIRTUAL_PIXELS/3.0);
					rect.attributes['y'] = new svg.Property('y', -svg.MAX_VIRTUAL_PIXELS/3.0);
					rect.attributes['width'] = new svg.Property('width', svg.MAX_VIRTUAL_PIXELS);
					rect.attributes['height'] = new svg.Property('height', svg.MAX_VIRTUAL_PIXELS);

					var group = new svg.Element.g();
					group.attributes['transform'] = new svg.Property('transform', this.attribute('gradientTransform').value);
					group.children = [ rect ];

					var tempSvg = new svg.Element.svg();
					tempSvg.attributes['x'] = new svg.Property('x', 0);
					tempSvg.attributes['y'] = new svg.Property('y', 0);
					tempSvg.attributes['width'] = new svg.Property('width', rootView.width);
					tempSvg.attributes['height'] = new svg.Property('height', rootView.height);
					tempSvg.children = [ group ];

					var c = document.createElement('canvas');
					c.width = rootView.width;
					c.height = rootView.height;
					var tempCtx = c.getContext('2d');
					tempCtx.fillStyle = g;
					tempSvg.render(tempCtx);
					return tempCtx.createPattern(c, 'no-repeat');
				}

				return g;
			}
		}
		svg.Element.GradientBase.prototype = new svg.Element.ElementBase;

		// linear gradient element
		svg.Element.linearGradient = function(node) {
			this.base = svg.Element.GradientBase;
			this.base(node);

			this.getGradient = function(ctx, element) {
				var bb = element.getBoundingBox();

				var x1 = (this.gradientUnits == 'objectBoundingBox'
					? bb.x() + bb.width() * this.attribute('x1').numValue()
					: this.attribute('x1').toPixels('x'));
				var y1 = (this.gradientUnits == 'objectBoundingBox'
					? bb.y() + bb.height() * this.attribute('y1').numValue()
					: this.attribute('y1').toPixels('y'));
				var x2 = (this.gradientUnits == 'objectBoundingBox'
					? bb.x() + bb.width() * this.attribute('x2').numValue()
					: this.attribute('x2').toPixels('x'));
				var y2 = (this.gradientUnits == 'objectBoundingBox'
					? bb.y() + bb.height() * this.attribute('y2').numValue()
					: this.attribute('y2').toPixels('y'));

				if (x1 == x2 && y1 == y2) return null;
				return ctx.createLinearGradient(x1, y1, x2, y2);
			}
		}
		svg.Element.linearGradient.prototype = new svg.Element.GradientBase;

		// radial gradient element
		svg.Element.radialGradient = function(node) {
			this.base = svg.Element.GradientBase;
			this.base(node);

			this.getGradient = function(ctx, element) {
				var bb = element.getBoundingBox();

				if (!this.attribute('cx').hasValue()) this.attribute('cx', true).value = '50%';
				if (!this.attribute('cy').hasValue()) this.attribute('cy', true).value = '50%';
				if (!this.attribute('r').hasValue()) this.attribute('r', true).value = '50%';

				var cx = (this.gradientUnits == 'objectBoundingBox'
					? bb.x() + bb.width() * this.attribute('cx').numValue()
					: this.attribute('cx').toPixels('x'));
				var cy = (this.gradientUnits == 'objectBoundingBox'
					? bb.y() + bb.height() * this.attribute('cy').numValue()
					: this.attribute('cy').toPixels('y'));

				var fx = cx;
				var fy = cy;
				if (this.attribute('fx').hasValue()) {
					fx = (this.gradientUnits == 'objectBoundingBox'
					? bb.x() + bb.width() * this.attribute('fx').numValue()
					: this.attribute('fx').toPixels('x'));
				}
				if (this.attribute('fy').hasValue()) {
					fy = (this.gradientUnits == 'objectBoundingBox'
					? bb.y() + bb.height() * this.attribute('fy').numValue()
					: this.attribute('fy').toPixels('y'));
				}

				var r = (this.gradientUnits == 'objectBoundingBox'
					? (bb.width() + bb.height()) / 2.0 * this.attribute('r').numValue()
					: this.attribute('r').toPixels());

				return ctx.createRadialGradient(fx, fy, 0, cx, cy, r);
			}
		}
		svg.Element.radialGradient.prototype = new svg.Element.GradientBase;

		// gradient stop element
		svg.Element.stop = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			this.offset = this.attribute('offset').numValue();

			var stopColor = this.style('stop-color');
			if (this.style('stop-opacity').hasValue()) stopColor = stopColor.addOpacity(this.style('stop-opacity').value);
			this.color = stopColor.value;
		}
		svg.Element.stop.prototype = new svg.Element.ElementBase;

		// animation base element
		svg.Element.AnimateBase = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			svg.Animations.push(this);

			this.duration = 0.0;
			this.begin = this.attribute('begin').toMilliseconds();
			this.maxDuration = this.begin + this.attribute('dur').toMilliseconds();

			this.getProperty = function() {
				var attributeType = this.attribute('attributeType').value;
				var attributeName = this.attribute('attributeName').value;

				if (attributeType == 'CSS') {
					return this.parent.style(attributeName, true);
				}
				return this.parent.attribute(attributeName, true);
			};

			this.initialValue = null;
			this.initialUnits = '';
			this.removed = false;

			this.calcValue = function() {
				// OVERRIDE ME!
				return '';
			}

			this.update = function(delta) {
				// set initial value
				if (this.initialValue == null) {
					this.initialValue = this.getProperty().value;
					this.initialUnits = this.getProperty().getUnits();
				}

				// if we're past the end time
				if (this.duration > this.maxDuration) {
					// loop for indefinitely repeating animations
					if (this.attribute('repeatCount').value == 'indefinite') {
						this.duration = 0.0
					}
					else if (this.attribute('fill').valueOrDefault('remove') == 'remove' && !this.removed) {
						this.removed = true;
						this.getProperty().value = this.initialValue;
						return true;
					}
					else {
						return false; // no updates made
					}
				}
				this.duration = this.duration + delta;

				// if we're past the begin time
				var updated = false;
				if (this.begin < this.duration) {
					var newValue = this.calcValue(); // tween

					if (this.attribute('type').hasValue()) {
						// for transform, etc.
						var type = this.attribute('type').value;
						newValue = type + '(' + newValue + ')';
					}

					this.getProperty().value = newValue;
					updated = true;
				}

				return updated;
			}

			this.from = this.attribute('from');
			this.to = this.attribute('to');
			this.values = this.attribute('values');
			if (this.values.hasValue()) this.values.value = this.values.value.split(';');

			// fraction of duration we've covered
			this.progress = function() {
				var ret = { progress: (this.duration - this.begin) / (this.maxDuration - this.begin) };
				if (this.values.hasValue()) {
					var p = ret.progress * (this.values.value.length - 1);
					var lb = Math.floor(p), ub = Math.ceil(p);
					ret.from = new svg.Property('from', parseFloat(this.values.value[lb]));
					ret.to = new svg.Property('to', parseFloat(this.values.value[ub]));
					ret.progress = (p - lb) / (ub - lb);
				}
				else {
					ret.from = this.from;
					ret.to = this.to;
				}
				return ret;
			}
		}
		svg.Element.AnimateBase.prototype = new svg.Element.ElementBase;

		// animate element
		svg.Element.animate = function(node) {
			this.base = svg.Element.AnimateBase;
			this.base(node);

			this.calcValue = function() {
				var p = this.progress();

				// tween value linearly
				var newValue = p.from.numValue() + (p.to.numValue() - p.from.numValue()) * p.progress;
				return newValue + this.initialUnits;
			};
		}
		svg.Element.animate.prototype = new svg.Element.AnimateBase;

		// animate color element
		svg.Element.animateColor = function(node) {
			this.base = svg.Element.AnimateBase;
			this.base(node);

			this.calcValue = function() {
				var p = this.progress();
				var from = new RGBColor(p.from.value);
				var to = new RGBColor(p.to.value);

				if (from.ok && to.ok) {
					// tween color linearly
					var r = from.r + (to.r - from.r) * p.progress;
					var g = from.g + (to.g - from.g) * p.progress;
					var b = from.b + (to.b - from.b) * p.progress;
					return 'rgb('+parseInt(r,10)+','+parseInt(g,10)+','+parseInt(b,10)+')';
				}
				return this.attribute('from').value;
			};
		}
		svg.Element.animateColor.prototype = new svg.Element.AnimateBase;

		// animate transform element
		svg.Element.animateTransform = function(node) {
			this.base = svg.Element.animate;
			this.base(node);
		}
		svg.Element.animateTransform.prototype = new svg.Element.animate;

		// font element
		svg.Element.font = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			this.horizAdvX = this.attribute('horiz-adv-x').numValue();

			this.isRTL = false;
			this.isArabic = false;
			this.fontFace = null;
			this.missingGlyph = null;
			this.glyphs = [];
			for (var i=0; i<this.children.length; i++) {
				var child = this.children[i];
				if (child.type == 'font-face') {
					this.fontFace = child;
					if (child.style('font-family').hasValue()) {
						svg.Definitions[child.style('font-family').value] = this;
					}
				}
				else if (child.type == 'missing-glyph') this.missingGlyph = child;
				else if (child.type == 'glyph') {
					if (child.arabicForm != '') {
						this.isRTL = true;
						this.isArabic = true;
						if (typeof(this.glyphs[child.unicode]) == 'undefined') this.glyphs[child.unicode] = [];
						this.glyphs[child.unicode][child.arabicForm] = child;
					}
					else {
						this.glyphs[child.unicode] = child;
					}
				}
			}
		}
		svg.Element.font.prototype = new svg.Element.ElementBase;

		// font-face element
		svg.Element.fontface = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			this.ascent = this.attribute('ascent').value;
			this.descent = this.attribute('descent').value;
			this.unitsPerEm = this.attribute('units-per-em').numValue();
		}
		svg.Element.fontface.prototype = new svg.Element.ElementBase;

		// missing-glyph element
		svg.Element.missingglyph = function(node) {
			this.base = svg.Element.path;
			this.base(node);

			this.horizAdvX = 0;
		}
		svg.Element.missingglyph.prototype = new svg.Element.path;

		// glyph element
		svg.Element.glyph = function(node) {
			this.base = svg.Element.path;
			this.base(node);

			this.horizAdvX = this.attribute('horiz-adv-x').numValue();
			this.unicode = this.attribute('unicode').value;
			this.arabicForm = this.attribute('arabic-form').value;
		}
		svg.Element.glyph.prototype = new svg.Element.path;

		// text element
		svg.Element.text = function(node) {
			this.base = svg.Element.RenderedElementBase;
			this.base(node);

			if (node != null) {
				// add children
				this.children = [];
				for (var i=0; i<node.childNodes.length; i++) {
					var childNode = node.childNodes[i];
					if (childNode.nodeType == 1) { // capture tspan and tref nodes
						this.addChild(childNode, true);
					}
					else if (childNode.nodeType == 3) { // capture text
						this.addChild(new svg.Element.tspan(childNode), false);
					}
				}
			}

			this.baseSetContext = this.setContext;
			this.setContext = function(ctx) {
				this.baseSetContext(ctx);
				if (this.style('dominant-baseline').hasValue()) ctx.textBaseline = this.style('dominant-baseline').value;
				if (this.style('alignment-baseline').hasValue()) ctx.textBaseline = this.style('alignment-baseline').value;
			}

			this.renderChildren = function(ctx) {
				var textAnchor = this.style('text-anchor').valueOrDefault('start');
				var x = this.attribute('x').toPixels('x');
				var y = this.attribute('y').toPixels('y');
				for (var i=0; i<this.children.length; i++) {
					var child = this.children[i];

					if (child.attribute('x').hasValue()) {
						child.x = child.attribute('x').toPixels('x');
					}
					else {
						if (this.attribute('dx').hasValue()) y += this.attribute('dx').toPixels('x');
						if (child.attribute('dx').hasValue()) x += child.attribute('dx').toPixels('x');
						child.x = x;
					}

					var childLength = child.measureText(ctx);
					if (textAnchor != 'start' && (i==0 || child.attribute('x').hasValue())) { // new group?
						// loop through rest of children
						var groupLength = childLength;
						for (var j=i+1; j<this.children.length; j++) {
							var childInGroup = this.children[j];
							if (childInGroup.attribute('x').hasValue()) break; // new group
							groupLength += childInGroup.measureText(ctx);
						}
						child.x -= (textAnchor == 'end' ? groupLength : groupLength / 2.0);
					}
					x = child.x + childLength;

					if (child.attribute('y').hasValue()) {
						child.y = child.attribute('y').toPixels('y');
					}
					else {
						if (this.attribute('dy').hasValue()) y += this.attribute('dy').toPixels('y');
						if (child.attribute('dy').hasValue()) y += child.attribute('dy').toPixels('y');
						child.y = y;
					}
					y = child.y;

					child.render(ctx);
				}
			}
		}
		svg.Element.text.prototype = new svg.Element.RenderedElementBase;

		// text base
		svg.Element.TextElementBase = function(node) {
			this.base = svg.Element.RenderedElementBase;
			this.base(node);

			this.getGlyph = function(font, text, i) {
				var c = text[i];
				var glyph = null;
				if (font.isArabic) {
					var arabicForm = 'isolated';
					if ((i==0 || text[i-1]==' ') && i<text.length-2 && text[i+1]!=' ') arabicForm = 'terminal';
					if (i>0 && text[i-1]!=' ' && i<text.length-2 && text[i+1]!=' ') arabicForm = 'medial';
					if (i>0 && text[i-1]!=' ' && (i == text.length-1 || text[i+1]==' ')) arabicForm = 'initial';
					if (typeof(font.glyphs[c]) != 'undefined') {
						glyph = font.glyphs[c][arabicForm];
						if (glyph == null && font.glyphs[c].type == 'glyph') glyph = font.glyphs[c];
					}
				}
				else {
					glyph = font.glyphs[c];
				}
				if (glyph == null) glyph = font.missingGlyph;
				return glyph;
			}

			this.renderChildren = function(ctx) {
				var customFont = this.parent.style('font-family').getDefinition();
				if (customFont != null) {
					var fontSize = this.parent.style('font-size').numValueOrDefault(svg.Font.Parse(svg.ctx.font).fontSize);
					var fontStyle = this.parent.style('font-style').valueOrDefault(svg.Font.Parse(svg.ctx.font).fontStyle);
					var text = this.getText();
					if (customFont.isRTL) text = text.split("").reverse().join("");

					var dx = svg.ToNumberArray(this.parent.attribute('dx').value);
					for (var i=0; i<text.length; i++) {
						var glyph = this.getGlyph(customFont, text, i);
						var scale = fontSize / customFont.fontFace.unitsPerEm;
						ctx.translate(this.x, this.y);
						ctx.scale(scale, -scale);
						var lw = ctx.lineWidth;
						ctx.lineWidth = ctx.lineWidth * customFont.fontFace.unitsPerEm / fontSize;
						if (fontStyle == 'italic') ctx.transform(1, 0, .4, 1, 0, 0);
						glyph.render(ctx);
						if (fontStyle == 'italic') ctx.transform(1, 0, -.4, 1, 0, 0);
						ctx.lineWidth = lw;
						ctx.scale(1/scale, -1/scale);
						ctx.translate(-this.x, -this.y);

						this.x += fontSize * (glyph.horizAdvX || customFont.horizAdvX) / customFont.fontFace.unitsPerEm;
						if (typeof(dx[i]) != 'undefined' && !isNaN(dx[i])) {
							this.x += dx[i];
						}
					}
					return;
				}

				if (ctx.strokeStyle != '') ctx.strokeText(svg.compressSpaces(this.getText()), this.x, this.y);
				if (ctx.fillStyle != '') ctx.fillText(svg.compressSpaces(this.getText()), this.x, this.y);
			}

			this.getText = function() {
				// OVERRIDE ME
			}

			this.measureText = function(ctx) {
				var customFont = this.parent.style('font-family').getDefinition();
				if (customFont != null) {
					var fontSize = this.parent.style('font-size').numValueOrDefault(svg.Font.Parse(svg.ctx.font).fontSize);
					var measure = 0;
					var text = this.getText();
					if (customFont.isRTL) text = text.split("").reverse().join("");
					var dx = svg.ToNumberArray(this.parent.attribute('dx').value);
					for (var i=0; i<text.length; i++) {
						var glyph = this.getGlyph(customFont, text, i);
						measure += (glyph.horizAdvX || customFont.horizAdvX) * fontSize / customFont.fontFace.unitsPerEm;
						if (typeof(dx[i]) != 'undefined' && !isNaN(dx[i])) {
							measure += dx[i];
						}
					}
					return measure;
				}

				var textToMeasure = svg.compressSpaces(this.getText());
				if (!ctx.measureText) return textToMeasure.length * 10;

				ctx.save();
				this.setContext(ctx);
				var width = ctx.measureText(textToMeasure).width;
				ctx.restore();
				return width;
			}
		}
		svg.Element.TextElementBase.prototype = new svg.Element.RenderedElementBase;

		// tspan
		svg.Element.tspan = function(node) {
			this.base = svg.Element.TextElementBase;
			this.base(node);

			this.text = node.nodeType == 3 ? node.nodeValue : // text
						node.childNodes.length > 0 ? node.childNodes[0].nodeValue : // element
						node.text;
			this.getText = function() {
				return this.text;
			}
		}
		svg.Element.tspan.prototype = new svg.Element.TextElementBase;

		// tref
		svg.Element.tref = function(node) {
			this.base = svg.Element.TextElementBase;
			this.base(node);

			this.getText = function() {
				var element = this.attribute('xlink:href').getDefinition();
				if (element != null) return element.children[0].getText();
			}
		}
		svg.Element.tref.prototype = new svg.Element.TextElementBase;

		// a element
		svg.Element.a = function(node) {
			this.base = svg.Element.TextElementBase;
			this.base(node);

			this.hasText = true;
			for (var i=0; i<node.childNodes.length; i++) {
				if (node.childNodes[i].nodeType != 3) this.hasText = false;
			}

			// this might contain text
			this.text = this.hasText ? node.childNodes[0].nodeValue : '';
			this.getText = function() {
				return this.text;
			}

			this.baseRenderChildren = this.renderChildren;
			this.renderChildren = function(ctx) {
				if (this.hasText) {
					// render as text element
					this.baseRenderChildren(ctx);
					var fontSize = new svg.Property('fontSize', svg.Font.Parse(svg.ctx.font).fontSize);
					svg.Mouse.checkBoundingBox(this, new svg.BoundingBox(this.x, this.y - fontSize.toPixels('y'), this.x + this.measureText(ctx), this.y));
				}
				else {
					// render as temporary group
					var g = new svg.Element.g();
					g.children = this.children;
					g.parent = this;
					g.render(ctx);
				}
			}

			this.onclick = function() {
				window.open(this.attribute('xlink:href').value);
			}

			this.onmousemove = function() {
				svg.ctx.canvas.style.cursor = 'pointer';
			}
		}
		svg.Element.a.prototype = new svg.Element.TextElementBase;

		// image element
		svg.Element.image = function(node) {
			this.base = svg.Element.RenderedElementBase;
			this.base(node);

			var href = this.attribute('xlink:href').value;
			var isSvg = href.match(/\.svg$/)

			svg.Images.push(this);
			this.loaded = false;
			if (!isSvg) {
				this.img = document.createElement('img');
				var self = this;
				this.img.onload = function() { self.loaded = true; }
				this.img.onerror = function() { if (console) console.log('ERROR: image "' + href + '" not found'); self.loaded = true; }
				this.img.src = href;
			}
			else {
				this.img = svg.ajax(href);
				this.loaded = true;
			}

			this.renderChildren = function(ctx) {
				var x = this.attribute('x').toPixels('x');
				var y = this.attribute('y').toPixels('y');

				var width = this.attribute('width').toPixels('x');
				var height = this.attribute('height').toPixels('y');
				if (width == 0 || height == 0) return;

				ctx.save();
				if (isSvg) {
					ctx.drawSvg(this.img, x, y, width, height);
				}
				else {
					ctx.translate(x, y);
					svg.AspectRatio(ctx,
									this.attribute('preserveAspectRatio').value,
									width,
									this.img.width,
									height,
									this.img.height,
									0,
									0);
					ctx.drawImage(this.img, 0, 0);
				}
				ctx.restore();
			}
		}
		svg.Element.image.prototype = new svg.Element.RenderedElementBase;

		// group element
		svg.Element.g = function(node) {
			this.base = svg.Element.RenderedElementBase;
			this.base(node);

			this.getBoundingBox = function() {
				var bb = new svg.BoundingBox();
				for (var i=0; i<this.children.length; i++) {
					bb.addBoundingBox(this.children[i].getBoundingBox());
				}
				return bb;
			};
		}
		svg.Element.g.prototype = new svg.Element.RenderedElementBase;

		// symbol element
		svg.Element.symbol = function(node) {
			this.base = svg.Element.RenderedElementBase;
			this.base(node);

			this.baseSetContext = this.setContext;
			this.setContext = function(ctx) {
				this.baseSetContext(ctx);

				// viewbox
				if (this.attribute('viewBox').hasValue()) {
					var viewBox = svg.ToNumberArray(this.attribute('viewBox').value);
					var minX = viewBox[0];
					var minY = viewBox[1];
					width = viewBox[2];
					height = viewBox[3];

					svg.AspectRatio(ctx,
									this.attribute('preserveAspectRatio').value,
									this.attribute('width').toPixels('x'),
									width,
									this.attribute('height').toPixels('y'),
									height,
									minX,
									minY);

					svg.ViewPort.SetCurrent(viewBox[2], viewBox[3]);
				}
			}
		}
		svg.Element.symbol.prototype = new svg.Element.RenderedElementBase;

		// style element
		svg.Element.style = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			// text, or spaces then CDATA
			var css = node.childNodes[0].nodeValue + (node.childNodes.length > 1 ? node.childNodes[1].nodeValue : '');
			css = css.replace(/(\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\/)|(^[\s]*\/\/.*)/gm, ''); // remove comments
			css = svg.compressSpaces(css); // replace whitespace
			var cssDefs = css.split('}');
			for (var i=0; i<cssDefs.length; i++) {
				if (svg.trim(cssDefs[i]) != '') {
					var cssDef = cssDefs[i].split('{');
					var cssClasses = cssDef[0].split(',');
					var cssProps = cssDef[1].split(';');
					for (var j=0; j<cssClasses.length; j++) {
						var cssClass = svg.trim(cssClasses[j]);
						if (cssClass != '') {
							var props = {};
							for (var k=0; k<cssProps.length; k++) {
								var prop = cssProps[k].indexOf(':');
								var name = cssProps[k].substr(0, prop);
								var value = cssProps[k].substr(prop + 1, cssProps[k].length - prop);
								if (name != null && value != null) {
									props[svg.trim(name)] = new svg.Property(svg.trim(name), svg.trim(value));
								}
							}
							svg.Styles[cssClass] = props;
							if (cssClass == '@font-face') {
								var fontFamily = props['font-family'].value.replace(/"/g,'');
								var srcs = props['src'].value.split(',');
								for (var s=0; s<srcs.length; s++) {
									if (srcs[s].indexOf('format("svg")') > 0) {
										var urlStart = srcs[s].indexOf('url');
										var urlEnd = srcs[s].indexOf(')', urlStart);
										var url = srcs[s].substr(urlStart + 5, urlEnd - urlStart - 6);
										var doc = svg.parseXml(svg.ajax(url));
										var fonts = doc.getElementsByTagName('font');
										for (var f=0; f<fonts.length; f++) {
											var font = svg.CreateElement(fonts[f]);
											svg.Definitions[fontFamily] = font;
										}
									}
								}
							}
						}
					}
				}
			}
		}
		svg.Element.style.prototype = new svg.Element.ElementBase;

		// use element
		svg.Element.use = function(node) {
			this.base = svg.Element.RenderedElementBase;
			this.base(node);

			this.baseSetContext = this.setContext;
			this.setContext = function(ctx) {
				this.baseSetContext(ctx);
				if (this.attribute('x').hasValue()) ctx.translate(this.attribute('x').toPixels('x'), 0);
				if (this.attribute('y').hasValue()) ctx.translate(0, this.attribute('y').toPixels('y'));
			}

			this.getDefinition = function() {
				var element = this.attribute('xlink:href').getDefinition();
				if (this.attribute('width').hasValue()) element.attribute('width', true).value = this.attribute('width').value;
				if (this.attribute('height').hasValue()) element.attribute('height', true).value = this.attribute('height').value;
				return element;
			}

			this.path = function(ctx) {
				var element = this.getDefinition();
				if (element != null) element.path(ctx);
			}

			this.renderChildren = function(ctx) {
				var element = this.getDefinition();
				if (element != null) {
					// temporarily detach from parent and render
					var oldParent = element.parent;
					element.parent = null;
					element.render(ctx);
					element.parent = oldParent;
				}
			}
		}
		svg.Element.use.prototype = new svg.Element.RenderedElementBase;

		// mask element
		svg.Element.mask = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			this.apply = function(ctx, element) {
				// render as temp svg
				var x = this.attribute('x').toPixels('x');
				var y = this.attribute('y').toPixels('y');
				var width = this.attribute('width').toPixels('x');
				var height = this.attribute('height').toPixels('y');

				// temporarily remove mask to avoid recursion
				var mask = element.attribute('mask').value;
				element.attribute('mask').value = '';

					var cMask = document.createElement('canvas');
					cMask.width = x + width;
					cMask.height = y + height;
					var maskCtx = cMask.getContext('2d');
					this.renderChildren(maskCtx);

					var c = document.createElement('canvas');
					c.width = x + width;
					c.height = y + height;
					var tempCtx = c.getContext('2d');
					element.render(tempCtx);
					tempCtx.globalCompositeOperation = 'destination-in';
					tempCtx.fillStyle = maskCtx.createPattern(cMask, 'no-repeat');
					tempCtx.fillRect(0, 0, x + width, y + height);

					ctx.fillStyle = tempCtx.createPattern(c, 'no-repeat');
					ctx.fillRect(0, 0, x + width, y + height);

				// reassign mask
				element.attribute('mask').value = mask;
			}

			this.render = function(ctx) {
				// NO RENDER
			}
		}
		svg.Element.mask.prototype = new svg.Element.ElementBase;

		// clip element
		svg.Element.clipPath = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			this.apply = function(ctx) {
				for (var i=0; i<this.children.length; i++) {
					if (this.children[i].path) {
						this.children[i].path(ctx);
						ctx.clip();
					}
				}
			}

			this.render = function(ctx) {
				// NO RENDER
			}
		}
		svg.Element.clipPath.prototype = new svg.Element.ElementBase;

		// filters
		svg.Element.filter = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			this.apply = function(ctx, element) {
				// render as temp svg
				var bb = element.getBoundingBox();
				var x = this.attribute('x').toPixels('x');
				var y = this.attribute('y').toPixels('y');
				if (x == 0 || y == 0) {
					x = bb.x1;
					y = bb.y1;
				}
				var width = this.attribute('width').toPixels('x');
				var height = this.attribute('height').toPixels('y');
				if (width == 0 || height == 0) {
					width = bb.width();
					height = bb.height();
				}

				// temporarily remove filter to avoid recursion
				var filter = element.style('filter').value;
				element.style('filter').value = '';

				// max filter distance
				var extraPercent = .20;
				var px = extraPercent * width;
				var py = extraPercent * height;

				var c = document.createElement('canvas');
				c.width = width + 2*px;
				c.height = height + 2*py;
				var tempCtx = c.getContext('2d');
				tempCtx.translate(-x + px, -y + py);
				element.render(tempCtx);

				// apply filters
				for (var i=0; i<this.children.length; i++) {
					this.children[i].apply(tempCtx, 0, 0, width + 2*px, height + 2*py);
				}

				// render on me
				ctx.drawImage(c, 0, 0, width + 2*px, height + 2*py, x - px, y - py, width + 2*px, height + 2*py);

				// reassign filter
				element.style('filter', true).value = filter;
			}

			this.render = function(ctx) {
				// NO RENDER
			}
		}
		svg.Element.filter.prototype = new svg.Element.ElementBase;

		svg.Element.feGaussianBlur = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			function make_fgauss(sigma) {
				sigma = Math.max(sigma, 0.01);
				var len = Math.ceil(sigma * 4.0) + 1;
				mask = [];
				for (var i = 0; i < len; i++) {
					mask[i] = Math.exp(-0.5 * (i / sigma) * (i / sigma));
				}
				return mask;
			}

			function normalize(mask) {
				var sum = 0;
				for (var i = 1; i < mask.length; i++) {
					sum += Math.abs(mask[i]);
				}
				sum = 2 * sum + Math.abs(mask[0]);
				for (var i = 0; i < mask.length; i++) {
					mask[i] /= sum;
				}
				return mask;
			}

			function convolve_even(src, dst, mask, width, height) {
			  for (var y = 0; y < height; y++) {
				for (var x = 0; x < width; x++) {
				  var a = imGet(src, x, y, width, height, 3)/255;
				  for (var rgba = 0; rgba < 4; rgba++) {
					  var sum = mask[0] * (a==0?255:imGet(src, x, y, width, height, rgba)) * (a==0||rgba==3?1:a);
					  for (var i = 1; i < mask.length; i++) {
						var a1 = imGet(src, Math.max(x-i,0), y, width, height, 3)/255;
					    var a2 = imGet(src, Math.min(x+i, width-1), y, width, height, 3)/255;
						sum += mask[i] *
						  ((a1==0?255:imGet(src, Math.max(x-i,0), y, width, height, rgba)) * (a1==0||rgba==3?1:a1) +
						   (a2==0?255:imGet(src, Math.min(x+i, width-1), y, width, height, rgba)) * (a2==0||rgba==3?1:a2));
					  }
					  imSet(dst, y, x, height, width, rgba, sum);
				  }
				}
			  }
			}

			function imGet(img, x, y, width, height, rgba) {
				return img[y*width*4 + x*4 + rgba];
			}

			function imSet(img, x, y, width, height, rgba, val) {
				img[y*width*4 + x*4 + rgba] = val;
			}

			function blur(ctx, width, height, sigma)
			{
				var srcData = ctx.getImageData(0, 0, width, height);
				var mask = make_fgauss(sigma);
				mask = normalize(mask);
				tmp = [];
				convolve_even(srcData.data, tmp, mask, width, height);
				convolve_even(tmp, srcData.data, mask, height, width);
				ctx.clearRect(0, 0, width, height);
				ctx.putImageData(srcData, 0, 0);
			}

			this.apply = function(ctx, x, y, width, height) {
				// assuming x==0 && y==0 for now
				blur(ctx, width, height, this.attribute('stdDeviation').numValue());
			}
		}
		svg.Element.filter.prototype = new svg.Element.feGaussianBlur;

		// title element, do nothing
		svg.Element.title = function(node) {
		}
		svg.Element.title.prototype = new svg.Element.ElementBase;

		// desc element, do nothing
		svg.Element.desc = function(node) {
		}
		svg.Element.desc.prototype = new svg.Element.ElementBase;

		svg.Element.MISSING = function(node) {
			if (console) console.log('ERROR: Element \'' + node.nodeName + '\' not yet implemented.');
		}
		svg.Element.MISSING.prototype = new svg.Element.ElementBase;

		// element factory
		svg.CreateElement = function(node) {
			var className = node.nodeName.replace(/^[^:]+:/,''); // remove namespace
			className = className.replace(/\-/g,''); // remove dashes
			var e = null;
			if (typeof(svg.Element[className]) != 'undefined') {
				e = new svg.Element[className](node);
			}
			else {
				e = new svg.Element.MISSING(node);
			}

			e.type = node.nodeName;
			return e;
		}

		// load from url
		svg.load = function(ctx, url) {
			svg.loadXml(ctx, svg.ajax(url));
		}

		// load from xml
		svg.loadXml = function(ctx, xml) {
			svg.loadXmlDoc(ctx, svg.parseXml(xml));
		}

		svg.loadXmlDoc = function(ctx, dom) {
			svg.init(ctx);

			var mapXY = function(p) {
				var e = ctx.canvas;
				while (e) {
					p.x -= e.offsetLeft;
					p.y -= e.offsetTop;
					e = e.offsetParent;
				}
				if (window.scrollX) p.x += window.scrollX;
				if (window.scrollY) p.y += window.scrollY;
				return p;
			}

			// bind mouse
			if (svg.opts['ignoreMouse'] != true) {
				ctx.canvas.onclick = function(e) {
					var p = mapXY(new svg.Point(e != null ? e.clientX : event.clientX, e != null ? e.clientY : event.clientY));
					svg.Mouse.onclick(p.x, p.y);
				};
				ctx.canvas.onmousemove = function(e) {
					var p = mapXY(new svg.Point(e != null ? e.clientX : event.clientX, e != null ? e.clientY : event.clientY));
					svg.Mouse.onmousemove(p.x, p.y);
				};
			}

			var e = svg.CreateElement(dom.documentElement);
			e.root = true;

			// render loop
			var isFirstRender = true;
			var draw = function() {
				svg.ViewPort.Clear();
				if (ctx.canvas.parentNode) svg.ViewPort.SetCurrent(ctx.canvas.parentNode.clientWidth, ctx.canvas.parentNode.clientHeight);

				if (svg.opts['ignoreDimensions'] != true) {
					// set canvas size
					if (e.style('width').hasValue()) {
						ctx.canvas.width = e.style('width').toPixels('x');
						ctx.canvas.style.width = ctx.canvas.width + 'px';
					}
					if (e.style('height').hasValue()) {
						ctx.canvas.height = e.style('height').toPixels('y');
						ctx.canvas.style.height = ctx.canvas.height + 'px';
					}
				}
				var cWidth = ctx.canvas.clientWidth || ctx.canvas.width;
				var cHeight = ctx.canvas.clientHeight || ctx.canvas.height;
				if (svg.opts['ignoreDimensions'] == true && e.style('width').hasValue() && e.style('height').hasValue()) {
					cWidth = e.style('width').toPixels('x');
					cHeight = e.style('height').toPixels('y');
				}
				svg.ViewPort.SetCurrent(cWidth, cHeight);

				if (svg.opts['offsetX'] != null) e.attribute('x', true).value = svg.opts['offsetX'];
				if (svg.opts['offsetY'] != null) e.attribute('y', true).value = svg.opts['offsetY'];
				if (svg.opts['scaleWidth'] != null && svg.opts['scaleHeight'] != null) {
					var xRatio = 1, yRatio = 1, viewBox = svg.ToNumberArray(e.attribute('viewBox').value);
					if (e.attribute('width').hasValue()) xRatio = e.attribute('width').toPixels('x') / svg.opts['scaleWidth'];
					else if (!isNaN(viewBox[2])) xRatio = viewBox[2] / svg.opts['scaleWidth'];
					if (e.attribute('height').hasValue()) yRatio = e.attribute('height').toPixels('y') / svg.opts['scaleHeight'];
					else if (!isNaN(viewBox[3])) yRatio = viewBox[3] / svg.opts['scaleHeight'];

					e.attribute('width', true).value = svg.opts['scaleWidth'];
					e.attribute('height', true).value = svg.opts['scaleHeight'];
					e.attribute('viewBox', true).value = '0 0 ' + (cWidth * xRatio) + ' ' + (cHeight * yRatio);
					e.attribute('preserveAspectRatio', true).value = 'none';
				}

				// clear and render
				if (svg.opts['ignoreClear'] != true) {
					ctx.clearRect(0, 0, cWidth, cHeight);
				}
				e.render(ctx);
				if (isFirstRender) {
					isFirstRender = false;
					if (typeof(svg.opts['renderCallback']) == 'function') svg.opts['renderCallback']();
				}
			}

			var waitingForImages = true;
			if (svg.ImagesLoaded()) {
				waitingForImages = false;
				draw();
			}
			svg.intervalID = setInterval(function() {
				var needUpdate = false;

				if (waitingForImages && svg.ImagesLoaded()) {
					waitingForImages = false;
					needUpdate = true;
				}

				// need update from mouse events?
				if (svg.opts['ignoreMouse'] != true) {
					needUpdate = needUpdate | svg.Mouse.hasEvents();
				}

				// need update from animations?
				if (svg.opts['ignoreAnimation'] != true) {
					for (var i=0; i<svg.Animations.length; i++) {
						needUpdate = needUpdate | svg.Animations[i].update(1000 / svg.FRAMERATE);
					}
				}

				// need update from redraw?
				if (typeof(svg.opts['forceRedraw']) == 'function') {
					if (svg.opts['forceRedraw']() == true) needUpdate = true;
				}

				// render if needed
				if (needUpdate) {
					draw();
					svg.Mouse.runEvents(); // run and clear our events
				}
			}, 1000 / svg.FRAMERATE);
		}

		svg.stop = function() {
			if (svg.intervalID) {
				clearInterval(svg.intervalID);
			}
		}

		svg.Mouse = new (function() {
			this.events = [];
			this.hasEvents = function() { return this.events.length != 0; }

			this.onclick = function(x, y) {
				this.events.push({ type: 'onclick', x: x, y: y,
					run: function(e) { if (e.onclick) e.onclick(); }
				});
			}

			this.onmousemove = function(x, y) {
				this.events.push({ type: 'onmousemove', x: x, y: y,
					run: function(e) { if (e.onmousemove) e.onmousemove(); }
				});
			}

			this.eventElements = [];

			this.checkPath = function(element, ctx) {
				for (var i=0; i<this.events.length; i++) {
					var e = this.events[i];
					if (ctx.isPointInPath && ctx.isPointInPath(e.x, e.y)) this.eventElements[i] = element;
				}
			}

			this.checkBoundingBox = function(element, bb) {
				for (var i=0; i<this.events.length; i++) {
					var e = this.events[i];
					if (bb.isPointInBox(e.x, e.y)) this.eventElements[i] = element;
				}
			}

			this.runEvents = function() {
				svg.ctx.canvas.style.cursor = '';

				for (var i=0; i<this.events.length; i++) {
					var e = this.events[i];
					var element = this.eventElements[i];
					while (element) {
						e.run(element);
						element = element.parent;
					}
				}

				// done running, clear
				this.events = [];
				this.eventElements = [];
			}
		});

		return svg;
	}
})();

if (CanvasRenderingContext2D) {
	CanvasRenderingContext2D.prototype.drawSvg = function(s, dx, dy, dw, dh) {
		canvg(this.canvas, s, {
			ignoreMouse: true,
			ignoreAnimation: true,
			ignoreDimensions: true,
			ignoreClear: true,
			offsetX: dx,
			offsetY: dy,
			scaleWidth: dw,
			scaleHeight: dh
		});
	}
}

},{"./rgbcolor":34}],34:[function(require,module,exports){
/**
 * A class to parse color values
 * @author Stoyan Stefanov <sstoo@gmail.com>
 * @link   http://www.phpied.com/rgb-color-parser-in-javascript/
 * @license Use it if you like it
 */
function RGBColor(color_string)
{
    this.ok = false;

    // strip any leading #
    if (color_string.charAt(0) == '#') { // remove # if any
        color_string = color_string.substr(1,6);
    }

    color_string = color_string.replace(/ /g,'');
    color_string = color_string.toLowerCase();

    // before getting into regexps, try simple matches
    // and overwrite the input
    var simple_colors = {
        aliceblue: 'f0f8ff',
        antiquewhite: 'faebd7',
        aqua: '00ffff',
        aquamarine: '7fffd4',
        azure: 'f0ffff',
        beige: 'f5f5dc',
        bisque: 'ffe4c4',
        black: '000000',
        blanchedalmond: 'ffebcd',
        blue: '0000ff',
        blueviolet: '8a2be2',
        brown: 'a52a2a',
        burlywood: 'deb887',
        cadetblue: '5f9ea0',
        chartreuse: '7fff00',
        chocolate: 'd2691e',
        coral: 'ff7f50',
        cornflowerblue: '6495ed',
        cornsilk: 'fff8dc',
        crimson: 'dc143c',
        cyan: '00ffff',
        darkblue: '00008b',
        darkcyan: '008b8b',
        darkgoldenrod: 'b8860b',
        darkgray: 'a9a9a9',
        darkgreen: '006400',
        darkkhaki: 'bdb76b',
        darkmagenta: '8b008b',
        darkolivegreen: '556b2f',
        darkorange: 'ff8c00',
        darkorchid: '9932cc',
        darkred: '8b0000',
        darksalmon: 'e9967a',
        darkseagreen: '8fbc8f',
        darkslateblue: '483d8b',
        darkslategray: '2f4f4f',
        darkturquoise: '00ced1',
        darkviolet: '9400d3',
        deeppink: 'ff1493',
        deepskyblue: '00bfff',
        dimgray: '696969',
        dodgerblue: '1e90ff',
        feldspar: 'd19275',
        firebrick: 'b22222',
        floralwhite: 'fffaf0',
        forestgreen: '228b22',
        fuchsia: 'ff00ff',
        gainsboro: 'dcdcdc',
        ghostwhite: 'f8f8ff',
        gold: 'ffd700',
        goldenrod: 'daa520',
        gray: '808080',
        green: '008000',
        greenyellow: 'adff2f',
        honeydew: 'f0fff0',
        hotpink: 'ff69b4',
        indianred : 'cd5c5c',
        indigo : '4b0082',
        ivory: 'fffff0',
        khaki: 'f0e68c',
        lavender: 'e6e6fa',
        lavenderblush: 'fff0f5',
        lawngreen: '7cfc00',
        lemonchiffon: 'fffacd',
        lightblue: 'add8e6',
        lightcoral: 'f08080',
        lightcyan: 'e0ffff',
        lightgoldenrodyellow: 'fafad2',
        lightgrey: 'd3d3d3',
        lightgreen: '90ee90',
        lightpink: 'ffb6c1',
        lightsalmon: 'ffa07a',
        lightseagreen: '20b2aa',
        lightskyblue: '87cefa',
        lightslateblue: '8470ff',
        lightslategray: '778899',
        lightsteelblue: 'b0c4de',
        lightyellow: 'ffffe0',
        lime: '00ff00',
        limegreen: '32cd32',
        linen: 'faf0e6',
        magenta: 'ff00ff',
        maroon: '800000',
        mediumaquamarine: '66cdaa',
        mediumblue: '0000cd',
        mediumorchid: 'ba55d3',
        mediumpurple: '9370d8',
        mediumseagreen: '3cb371',
        mediumslateblue: '7b68ee',
        mediumspringgreen: '00fa9a',
        mediumturquoise: '48d1cc',
        mediumvioletred: 'c71585',
        midnightblue: '191970',
        mintcream: 'f5fffa',
        mistyrose: 'ffe4e1',
        moccasin: 'ffe4b5',
        navajowhite: 'ffdead',
        navy: '000080',
        oldlace: 'fdf5e6',
        olive: '808000',
        olivedrab: '6b8e23',
        orange: 'ffa500',
        orangered: 'ff4500',
        orchid: 'da70d6',
        palegoldenrod: 'eee8aa',
        palegreen: '98fb98',
        paleturquoise: 'afeeee',
        palevioletred: 'd87093',
        papayawhip: 'ffefd5',
        peachpuff: 'ffdab9',
        peru: 'cd853f',
        pink: 'ffc0cb',
        plum: 'dda0dd',
        powderblue: 'b0e0e6',
        purple: '800080',
        red: 'ff0000',
        rosybrown: 'bc8f8f',
        royalblue: '4169e1',
        saddlebrown: '8b4513',
        salmon: 'fa8072',
        sandybrown: 'f4a460',
        seagreen: '2e8b57',
        seashell: 'fff5ee',
        sienna: 'a0522d',
        silver: 'c0c0c0',
        skyblue: '87ceeb',
        slateblue: '6a5acd',
        slategray: '708090',
        snow: 'fffafa',
        springgreen: '00ff7f',
        steelblue: '4682b4',
        tan: 'd2b48c',
        teal: '008080',
        thistle: 'd8bfd8',
        tomato: 'ff6347',
        turquoise: '40e0d0',
        violet: 'ee82ee',
        violetred: 'd02090',
        wheat: 'f5deb3',
        white: 'ffffff',
        whitesmoke: 'f5f5f5',
        yellow: 'ffff00',
        yellowgreen: '9acd32'
    };
    for (var key in simple_colors) {
        if (color_string == key) {
            color_string = simple_colors[key];
        }
    }
    // emd of simple type-in colors

    // array of color definition objects
    var color_defs = [
        {
            re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
            example: ['rgb(123, 234, 45)', 'rgb(255,234,245)'],
            process: function (bits){
                return [
                    parseInt(bits[1]),
                    parseInt(bits[2]),
                    parseInt(bits[3])
                ];
            }
        },
        {
            re: /^(\w{2})(\w{2})(\w{2})$/,
            example: ['#00ff00', '336699'],
            process: function (bits){
                return [
                    parseInt(bits[1], 16),
                    parseInt(bits[2], 16),
                    parseInt(bits[3], 16)
                ];
            }
        },
        {
            re: /^(\w{1})(\w{1})(\w{1})$/,
            example: ['#fb0', 'f0f'],
            process: function (bits){
                return [
                    parseInt(bits[1] + bits[1], 16),
                    parseInt(bits[2] + bits[2], 16),
                    parseInt(bits[3] + bits[3], 16)
                ];
            }
        }
    ];

    // search through the definitions to find a match
    for (var i = 0; i < color_defs.length; i++) {
        var re = color_defs[i].re;
        var processor = color_defs[i].process;
        var bits = re.exec(color_string);
        if (bits) {
            channels = processor(bits);
            this.r = channels[0];
            this.g = channels[1];
            this.b = channels[2];
            this.ok = true;
        }

    }

    // validate/cleanup values
    this.r = (this.r < 0 || isNaN(this.r)) ? 0 : ((this.r > 255) ? 255 : this.r);
    this.g = (this.g < 0 || isNaN(this.g)) ? 0 : ((this.g > 255) ? 255 : this.g);
    this.b = (this.b < 0 || isNaN(this.b)) ? 0 : ((this.b > 255) ? 255 : this.b);

    // some getters
    this.toRGB = function () {
        return 'rgb(' + this.r + ', ' + this.g + ', ' + this.b + ')';
    }
    this.toHex = function () {
        var r = this.r.toString(16);
        var g = this.g.toString(16);
        var b = this.b.toString(16);
        if (r.length == 1) r = '0' + r;
        if (g.length == 1) g = '0' + g;
        if (b.length == 1) b = '0' + b;
        return '#' + r + g + b;
    }

    // help
    this.getHelpXML = function () {

        var examples = new Array();
        // add regexps
        for (var i = 0; i < color_defs.length; i++) {
            var example = color_defs[i].example;
            for (var j = 0; j < example.length; j++) {
                examples[examples.length] = example[j];
            }
        }
        // add type-in colors
        for (var sc in simple_colors) {
            examples[examples.length] = sc;
        }

        var xml = document.createElement('ul');
        xml.setAttribute('id', 'rgbcolor-examples');
        for (var i = 0; i < examples.length; i++) {
            try {
                var list_item = document.createElement('li');
                var list_color = new RGBColor(examples[i]);
                var example_div = document.createElement('div');
                example_div.style.cssText =
                        'margin: 3px; '
                        + 'border: 1px solid black; '
                        + 'background:' + list_color.toHex() + '; '
                        + 'color:' + list_color.toHex()
                ;
                example_div.appendChild(document.createTextNode('test'));
                var list_item_value = document.createTextNode(
                    ' ' + examples[i] + ' -> ' + list_color.toRGB() + ' -> ' + list_color.toHex()
                );
                list_item.appendChild(example_div);
                list_item.appendChild(list_item_value);
                xml.appendChild(list_item);

            } catch(e){}
        }
        return xml;

    }

}

module.exports = RGBColor;

},{}],35:[function(require,module,exports){
LogEvent = function(name, value, time){
  this.name = name;
  this.value = value;
  this.time = time;
};

LogEvent.CLICKED_TUTORIAL = "Clicked tutorial";
LogEvent.CHANGED_TUTORIAL = "Changed tutorial";
LogEvent.BLEW_FUSE = "Blew fuse";
LogEvent.DMM_MEASUREMENT = "DMM measurement";
LogEvent.CHANGED_CIRCUIT = "Changed circuit";
LogEvent.ATTACHED_PROBE = "Attached probe";
LogEvent.DETACHED_PROBE = "Detached probe";
LogEvent.MOVED_DMM_DIAL = "Moved DMM dial";
LogEvent.OSCOPE_MEASUREMENT = "OScope measurement";
LogEvent.OSCOPE_V1_SCALE_CHANGED = "OScope V1 scale changed";
LogEvent.OSCOPE_V2_SCALE_CHANGED = "OScope V2 scale changed";
LogEvent.OSCOPE_T_SCALE_CHANGED = "OScope T scale changed";

module.exports = LogEvent;

},{}],36:[function(require,module,exports){
/*global sparks $ */

Meter = function() {};

Meter.prototype = {
  dmm: null,
  oscope: null,

  setProbeLocation: function (probe, loc) {
    if (this.oscope) {
      this.oscope.setProbeLocation(probe, loc);
    }
    if (this.dmm) {
      this.dmm.setProbeLocation(probe, loc);
    }
  },

  // moves any and all probes from oldLoc to newLoc
  // useful for when a lead with connected probes is moved
  moveProbe: function (oldLoc, newLoc) {
    if (this.oscope) {
      this.oscope.moveProbe(oldLoc, newLoc);
    }
    if (this.dmm) {
      this.dmm.moveProbe(oldLoc, newLoc);
    }
  },

  update: function () {
    if (this.oscope) {
      this.oscope.update();
    }
    if (this.dmm) {
      this.dmm.update();
    }
  },

  reset: function() {
    if (this.oscope && this.oscope.reset) {
      this.oscope.reset();
    }
    if (this.dmm && this.dmm.reset) {
      this.dmm.reset();
    }
  }
};

module.exports = Meter;

},{}],37:[function(require,module,exports){
/*global sparks getBreadBoard breadModel */
/* FILE oscilloscope.js */

var LogEvent      = require('./log'),
    logController = require('../controllers/log-controller');

Oscilloscope = function (breadboardController) {
  this.breadboardController = breadboardController;
  this.probeLocation = [];
  this.probeLocation[0] = null;     // pink probe
  this.probeLocation[1] = null;     // yellow probe
  this.view = null;
  this.signals = [];
  var initVerticalScale   = this.INITIAL_VERTICAL_SCALE,
      initHorizontalScale = this.INITIAL_HORIZONTAL_SCALE;
  this._verticalScale = [initVerticalScale, initVerticalScale, initVerticalScale];
  this._horizontalScale = initHorizontalScale;
  this.showAminusB = false;
  this.showAplusB = false;
  this.AminusBwasOn = false;  // whether A-B was turned on during current question
  this.AplusBwasOn = false;
};

Oscilloscope.prototype = {

  N_CHANNELS:     2,
  PROBE_CHANNEL:  [1, 2],

  HORIZONTAL_SCALES: [1e-3, 5e-4, 2.5e-4, 1e-4, 5e-5, 2.5e-5, 1e-5, 5e-6, 2.5e-6, 1e-6],  // sec/div
  VERTICAL_SCALES:   [100,  50,   25,     10,   5,    2.5,    1,    0.5,  0.25,    0.1],  // V/div

  INITIAL_HORIZONTAL_SCALE: 1e-5,
  INITIAL_VERTICAL_SCALE:   5,

  reset: function() {
    this.probeLocation[0] = "left_positive21";      // yellow probe
    this.probeLocation[1] = null;                   // pink probe
    this.signals = [];
    var initVerticalScale   = this.INITIAL_VERTICAL_SCALE,
        initHorizontalScale = this.INITIAL_HORIZONTAL_SCALE;
    this._verticalScale = [initVerticalScale, initVerticalScale, initVerticalScale];
    this._horizontalScale = initHorizontalScale;
    this.showAminusB = false;
    this.showAplusB = false;
    this.AminusBwasOn = false;  // whether A-B was turned on during current question
    this.AplusBwasOn = false;
  },

  setView: function(view) {
    this.view = view;
    this.view.setModel(this);
    this.update();         // we can update view immediately with the source trace
  },

  // @probe Name of probe being attached. We ignore everything but "red"
  // @location Hole name, like 'a1' or can be null if probe is lifted
  setProbeLocation: function(probe, location) {
    if (probe === "probe_yellow" || probe === "probe_pink") {
      var probeIndex = probe === "probe_yellow" ? 0 : 1;
      if (this.probeLocation[probeIndex] !== location) {
        this.probeLocation[probeIndex] = location;
        this.update();
      }
    }
  },

  moveProbe: function(oldLoc, newLoc) {
    for (var i = 0; i < 2; i++) {
      if (this.probeLocation[i] === oldLoc) {
        this.probeLocation[i] = newLoc;
      }
    }
    this.update();
  },

  update: function() {
    var source     = this.breadboardController.getComponents().source,
        probeIndex,
        sourceSignal,
        probeNode;

    if (!source || !source.frequency || !source.amplitude) {
      return;                                     // we must have a source with a freq and an amplitude
    }

    for (probeIndex = 0; probeIndex < 2; probeIndex++) {
      if (this.probeLocation[probeIndex]) {
        probeNode = this.breadboardController.getHole(this.probeLocation[probeIndex]).nodeName();
        if (probeNode === 'gnd') {
          // short-circuit this operation and just return a flat trace
          this.setSignal(this.PROBE_CHANNEL[probeIndex], {amplitude: 0, frequency: 0, phase: 0});
          continue;
        } else if (~probeNode.indexOf('powerPos')) {
          // just return the source
          sourceSignal = {
            amplitude: source.amplitude * source.amplitudeScaleFactor,
            frequency: source.frequency,
            phase: 0
          };
          this.setSignal(this.PROBE_CHANNEL[probeIndex], sourceSignal);
          continue;
        }
        this.breadboardController.query("oscope", probeNode, this.updateWithData, this, [probeNode, probeIndex]);
      } else {
        this.clearSignal(this.PROBE_CHANNEL[probeIndex]);
      }
    }
  },

  updateWithData: function(ciso, probeInfo) {

    var source     = this.breadboardController.getComponents().source,
        probeNode  = probeInfo[0],
        probeIndex = probeInfo[1],
        result,
        probeSignal;

    result = ciso.getVoltageAt(probeInfo[0]);

    if (result) {
      probeSignal = {
        amplitude: result.magnitude * source.amplitudeScaleFactor,
        frequency: source.frequency,
        phase:     result.angle
      };

      this.setSignal(this.PROBE_CHANNEL[probeIndex], probeSignal);

      logController.addEvent(LogEvent.OSCOPE_MEASUREMENT, {
          "probe": probeNode
        });
    } else {
      this.clearSignal(this.PROBE_CHANNEL[probeIndex]);
    }
  },

  setSignal: function(channel, signal) {
    if (!this.view) return;
    this.signals[channel] = signal;
    this.view.renderSignal(channel);
  },

  getSignal: function(channel) {
    return this.signals[channel];
  },

  clearSignal: function(channel) {
    delete this.signals[channel];
    if (this.view) {
      this.view.removeTrace(channel);
    }
  },

  setHorizontalScale: function(scale) {
    this._horizontalScale = scale;
    if (this.view) {
      this.view.horizontalScaleChanged();
    }

    logController.addEvent(LogEvent.OSCOPE_T_SCALE_CHANGED, {
        "scale": scale,
        "goodnessOfScale": this.getGoodnessOfScale()
      });
  },

  getHorizontalScale: function() {
    if (!this._horizontalScale) {
      // if you want to randomize the scales, hook something in here
      this.setHorizontalScale(this.INITIAL_HORIZONTAL_SCALE);
    }
    return this._horizontalScale;
  },

  setVerticalScale: function(channel, scale) {
    if (this.showAminusB || this.showAplusB){
      if (channel === 1) {
        this._verticalScale[2] = scale;
      } else {
        return;
      }
    }

    this._verticalScale[channel] = scale;
    if (this.view) {
      this.view.verticalScaleChanged(1);
      this.view.verticalScaleChanged(2);
    }

    var logEvent = channel == 1 ? LogEvent.OSCOPE_V1_SCALE_CHANGED : LogEvent.OSCOPE_V2_SCALE_CHANGED;
    logController.addEvent(logEvent, {
      "scale": scale,
      "goodnessOfScale": this.getGoodnessOfScale()
    });
  },

  getVerticalScale: function(channel) {
    if (!this._verticalScale[channel]) {
      // if you want to randomize the scales, hook something in here
      this.setVerticalScale(channel, this.INITIAL_VERTICAL_SCALE);
    }
    return this._verticalScale[channel];
  },

  bumpHorizontalScale: function(direction) {
    var currentScale = this.getHorizontalScale(),
        newScale     = this._getNextScaleFromList(currentScale, this.HORIZONTAL_SCALES, direction);

    if (newScale !== currentScale) {
      this.setHorizontalScale(newScale);
    }
  },

  bumpVerticalScale: function(channel, direction) {
    var currentScale = this.getVerticalScale(channel),
        newScale     = this._getNextScaleFromList(currentScale, this.VERTICAL_SCALES, direction);

    if (newScale !== currentScale) {
      this.setVerticalScale(channel, newScale);
    }
  },

  toggleShowAminusB: function() {
    this.showAminusB = !this.showAminusB;
    if (this.showAminusB) {
      this.AminusBwasOn = true;
      this.showAplusB = false;
      this.setVerticalScale(1, this._verticalScale[1]);
    }
  },

  toggleShowAplusB: function() {
    this.showAplusB = !this.showAplusB;
    if (this.showAplusB) {
      this.AplusBwasOn = true;
      this.showAminusB = false;
      this.setVerticalScale(1, this._verticalScale[1]);
    }
  },

  /**
    if A-B or A+B is off right now, set AminusBwasOn and/or
    AplusBwasOn to false now.
  */
  resetABforQuestion: function() {
    if (!this.showAminusB) {
      this.AminusBwasOn = false;
    }
    if (!this.showAplusB) {
      this.AplusBwasOn = false;
    }
  },

  _getNextScaleFromList: function(scale, scales, direction) {
    var i, len, prevIndex;

    for (i = 0, len = scales.length; i < len; i++) {
      if (scales[i] < scale) {
        break;
      }
    }
    prevIndex = (i > 0) ? i - 1 : 0;

    if (direction === 1 && prevIndex - 1 >= 0) {
      return scales[prevIndex - 1];
    } else if (direction === -1 && prevIndex + 1 < scales.length) {
      return scales[prevIndex + 1];
    } else {
      return scale;
    }
  },

  // returns how "good" the current scale is, from 0-1.
  // For a single trace, a perfect scale is 1 full wave across the screen and an amplitude
  // that is exactly the screen's height. This will return a 1.0 if the scale is within 20%
  // of these parameters, and 0.0 if it's 200% away from the perfect scale (i.e. if it's 3 times
  // as big or 1/3 as big).
  // There are two scale factors per trace. The goodness ranking for the entire trace is the average
  // of the two with the lower value weighted three times as much.
  // If there are two traces showing, this will return the lower of the two values.
  //
  getGoodnessOfScale: function() {
    var self = this,

        goodnessOfScale = function(channel) {
          var timeScale  = self.signals[channel].frequency * (self._horizontalScale * 10),            // 0-inf, best is 1
              ampScale   = (self.signals[channel].amplitude * 2) / (self._verticalScale[channel] * 8),
              timeGoodness  = timeScale > 1 ? 1/timeScale : timeScale,                                // 0-1, best is 1
              ampGoodness   = ampScale > 1 ? 1/ampScale : ampScale,
              timeScore  = (timeGoodness - 0.3) / 0.5,                                                // scaled such that 0.3 = 0 and 0.8 = 1
              ampScore   = (ampGoodness - 0.3) / 0.5,
              minScore = Math.max(0,Math.min(timeScore, ampScore, 1)),                                // smallest of the two, no less than 0
              maxScore = Math.min(1,Math.max(timeScore, ampScore, 0));                                // largest of the two, no greater than 1
          return ((minScore * 3) + maxScore) / 4;
        },

        goodnesses = [null, null];

    if (this.signals[1]) {
      goodnesses[0] = goodnessOfScale([1]);
    }

    if (this.signals[2]) {
      goodnesses[1] = goodnessOfScale([2]);
    }
    return goodnesses;
  }

};

module.exports = Oscilloscope;

},{"../controllers/log-controller":24,"./log":35}],38:[function(require,module,exports){
var Meter         = require('./meter'),
    WorkbenchView = require('../views/workbench-view');

Workbench = function(props, breadboardController){
  this.circuit = null;
  this.meter = new Meter();

  this.show_multimeter          = false;
  this.show_oscilloscope        = false;
  this.allow_move_yellow_probe  = false;
  this.hide_pink_probe          = false;
  this.showComponentDrawer      = false;

  this.view = new WorkbenchView(this, breadboardController);
};

Workbench.prototype = {

  toJSON: function () {
    var json = {};
    return json;
  }

};

module.exports = Workbench;

},{"../views/workbench-view":45,"./meter":36}],39:[function(require,module,exports){
var LogEvent            = require('../models/log'),
    logController       = require('../controllers/log-controller'),
    workbenchController;

embeddableComponents = {
  resistor: {
    property: "resistance",
    initialValue: 100
  },
  capacitor: {
    property: "capacitance",
    initialValue: 1e-6
  },
  inductor: {
    property: "inductance",
    initialValue: 1e-6
  },
  wire: {
    leadDistance: 5
  }
}

AddComponentsView = function(workbenchController, breadboardController){
  this.breadboardController = breadboardController;

  var self = this,
      component;

  this.$drawer = $(".component_drawer").empty();

  this.lastHighlightedHole = null;

  // create drawer
  for (componentName in embeddableComponents) {
    if (!embeddableComponents.hasOwnProperty(componentName)) continue;

    component = embeddableComponents[componentName];

    this.$drawer.append(
     $("<div class='add_"+componentName+" add_component'></div>")
      .data("type", componentName)
      .draggable({
        containment: "#breadboard_wrapper",
        helper: "clone",
        start: function(evt, ui) {
          $(ui.helper.context).hide().fadeIn(1200);
        },
        drag: function(evt, ui) {
          if (self.lastHighlightedHole) {
            self.lastHighlightedHole.attr("xlink:href", "#$:hole_not_connected");
          }
          loc = {x: ui.offset.left, y: ui.offset.top+(ui.helper.height()/2)};
          var nearestHole = $($.nearest(loc, "use[hole]")[0]);
          nearestHole.attr("xlink:href", "#$:hole_highlighted");
          self.lastHighlightedHole = nearestHole;
        }
      })
    );
  }

  // todo: don't add this twice
  $(".breadboard").droppable({
    drop: function(evt, ui) {
      var type = ui.draggable.data("type"),
          embeddableComponent = embeddableComponents[type],
          hole = self.lastHighlightedHole.attr("hole"),
          loc = hole + "," + hole,
          possibleValues,
          $propertyEditor = null,
          propertyName,
          initialValue, initialValueEng, initialValueText,
          $editor, props, uid, comp;

      if (embeddableComponent.leadDistance) {
        var num = /\d*$/.exec(hole)[0] * 1;
        num = Math.max(num-embeddableComponent.leadDistance, 1);
        loc = loc.replace(/(\d*)$/, num);
      }

      // insert component into highlighted hole
      props = {
       "type": type,
       "draggable": true,
       "connections": loc
      };
      props[embeddableComponent.property] = embeddableComponent.initialValue;
      uid = self.breadboardController.insertComponent(type, props);

      comp = self.breadboardController.getComponents()[uid];

      // move leads to correct width
      self.breadboardController.checkLocation(comp);

      logController.addEvent(LogEvent.CHANGED_CIRCUIT, {
        "type": "added new component",
        "component_type": comp.type,
        "UID": comp.UID,
        "location": comp.getLocation()
      });

      // update meters
      workbenchController.workbench.meter.update();

      // show editor
      workbenchController.workbench.view.showComponentEditor(uid);
    }
  })
};

AddComponentsView.prototype = {

  openPane: function() {
    $(".component_drawer").animate({left: 0}, 300, function(){
      $(".add_components").css("overflow", "visible");
    });
  }

};

module.exports = AddComponentsView;

},{"../controllers/log-controller":24,"../models/log":35}],40:[function(require,module,exports){
/**
 * @author Mobile.Lab (http://mlearner.com)
 **/

require('../libs/base64');
require('../libs/canvg');

var breadboardComm      = require('./svg_view_comm');

window["breadboardSVGView"] = {
  "options" : {
    "rootpath" : "",
    "magnifier" : {
      "time": 400,
      "size": 60,
      "zoom": 2,
      "offset": {
        "x": 80,
        "y": 80
      }
    }
  },
  "util" : {}
};


// window["breadboardSVGView"].connectionMade = function(component, location) {
//   console.log('Received: connect, component|' + component + '|' + location);
// };

// window["breadboardSVGView"].connectionBroken = function(component, location) {
//   console.log('Received: disconnect, component|' + component + '|' + location);
// };

// window["breadboardSVGView"].probeAdded = function(meter, color, location) {
//   console.log('Received: connect, ' + meter + '|probe|' + color + '|' + location);
// };

// window["breadboardSVGView"].probeRemoved = function(meter, color) {
//   console.log('Received: disconnect, ' + meter + '|probe|' + color);
// };

// window["breadboardSVGView"].dmmDialMoved = function(value) {
//   console.log('Received: multimeter_dial >> ' + value);
// };

/**
 * breadboard # util # require
 * >> loading required resources
 **/

(function($, board) {

  board.util.require = function(files, callback) {
    return new LoadingStack(files, callback).load();
  };

  var LoadingStack = function(files, callback) {
    // callback function
    this.callback = callback;
    // downloaded resources
    this.resources = {};
    // main stack of loading files
    this.stack = files;
    // counter of loaded files
    this.loaded = 0;
  };

  LoadingStack.prototype.success = function() {
    if (++this.loaded == this.stack.length) {
      this.callback(this.resources);
    }
  };

  LoadingStack.prototype.attachData = function(file, data) {
    file = file.substring(file.lastIndexOf('\/') + 1, file.lastIndexOf('.'));
    this.resources[file] = data;
  };

  LoadingStack.prototype.load = function() {
    var f;
    for (var i = this.stack.length; i--; ) {
      f = this.stack[i];
      this["load" + f.toUpperCase().substring( f.lastIndexOf('.') + 1 )](f);
    }
  };

  LoadingStack.prototype.loadJS = function(file) {
    file = board.options.rootpath + file;

    $.getScript(file, function(stack) {
      return function() {
        stack.success();
      };
    }(this)).fail(function() {
      console.log("# [error] (while requiring) failed load/compile javascript file: " + file);
    });
  };

  LoadingStack.prototype.loadCSS = function(file) {
    file = board.options.rootpath + file;

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = file;
    document.head.appendChild(link);

    this.success();
  };

  LoadingStack.prototype.loadSVG = function(file) {
    this.loadResource(file);
  };

  LoadingStack.prototype.loadResource = function(file) {
    file = board.options.rootpath + file;

    $.ajax({
      "url" : file,
      "type" : "GET",
      "dataType" : "html",
      "success" : function(stack) {
        return function(data) {
          stack.attachData(file, data);
          stack.success();
        };
      }(this),
      "error" : function() {
        console.log("# [error] (while requiring) failed load resource file: " + file);
      }
    });
  };

})(jQuery, window["breadboardSVGView"]);

/**
 * breadboardView # board
 * >> create board object with API
 **/

(function($, board) {

  // global link to common SVG-jQuery object
  var paper = null;

  // global event model
  var touch = !!('ontouchstart' in document.documentElement);

  var _mousedown = (touch ) ? 'touchstart' : 'mousedown';
  var _mousemove = (touch ) ? 'touchmove' : 'mousemove';
  var _mouseup = (touch ) ? 'touchend' : 'mouseup';
  var _mouseover = (touch ) ? 'xxx' : 'mouseover';
  var _mouseout = (touch ) ? 'xxx' : 'mouseout';

  // object contains electronic and test equipment
  var equipment = function() {
  };
  // object contains components added to breadboard
  var component = function() {
  };
  // parts of more complex components on breadboard(need only for building)
  var primitive = function() {
  };
  // board constructor
  var CircuitBoard = function(id) {
    this.workbenchController = require('../controllers/workbench-controller')

    var self = this;
    // link to main holder
    this.holder = $('.' + id).html('').append(
      SVGStorage.create('board')
    ).addClass('circuit-board');
    this.holder.h = this.holder.height();
    this.holder.w = this.holder.width();

    this.workspace = this.holder.find("[item=components]");
    this.holes = {
      'row' : {}
    };
    // model of links to components by id and as the array
    this.component = {};
    this.itemslist = [];

    // create model of holes
    var p = SVGStorage.point(), bbox, matrix, elem, name;
    this.holder.find("[hole]").first().each(function() {
      bbox = this.getBBox();
      p.x = bbox.x + bbox.width / 2;
      p.y = bbox.y + bbox.height / 2;
    }).end().each(function() {
      matrix = this.getCTM();
      elem = $(this), name = elem.attr("hole");
      elem = new CircuitBoardHole(elem);
      elem.center = p.matrixTransform(matrix);
      if (!self.holes.row[elem.y]) {
        self.holes.row[elem.y] = {};
      }
      self.holes.row[elem.y][elem.x] = elem;
      self.holes[name] = elem;
    });
    this.holes.find = findNearestHole;

    // multimeter (DMM)
    this.multimeter = null;
    // battery
    this.battery = null;
    // probes
    this.probes = [];

    // init all leads draggable
    primitive.prototype.initLeadDraggable(this);
    // init all probes draggable
    primitive.prototype.initProbeDraggable(this);
    // init all components draggable
    primitive.prototype.initComponentDraggable(this);
  };

  CircuitBoard.prototype.sendEventToModel = function(evName, params) {
    breadboardComm[evName](this.workbenchController, params[0], params[1], params[2]);
  };

  CircuitBoard.prototype.addComponent = function(elem) {
    this.component[elem["UID"]] = new component[ elem["type"] ](elem, this.holes, this);
    this.component[elem["UID"]]["type"] = elem["type"];
    this.component[elem["UID"]]["id"] = elem["UID"];
    this.itemslist.push(this.component[elem["UID"]]);
    this.workspace.append(this.component[elem["UID"]].view);
    this.component[elem["UID"]]["image"] = new SVGImage(this, elem["UID"]);

    if (this.rightClickFunction) {
      var rightClickObj = this.rightClickObj,
          func = this.rightClickFunction;

      this.component[elem["UID"]].view.bind("contextmenu dblclick", function(evt) {
        rightClickObj[func]($(this).attr("uid"));
        evt.preventDefault();
        return false;
      });
    }
  };

  CircuitBoard.prototype.changeResistorColors = function(id, colors) {
    this.component[id].changeColors(colors);
  };

  CircuitBoard.prototype.removeComponent = function(id) {
    if (!this.component[id]) return;
    this.component[id].hole[0].disconnected();
    this.component[id].hole[1].disconnected();
    this.component[id].view.remove();
    this.component[id] = null;
    for (var i = this.itemslist.length; i--; ) {
      if (this.itemslist[i].id === id) {
        this.itemslist.splice(i, 1);
      }
    }
  };

  CircuitBoard.prototype.setRightClickFunction = function(obj, func) {
    this.rightClickObj = obj;
    this.rightClickFunction = func;
    for (uid in this.component) {
      this.component[uid].view.bind("contextmenu dblclick", function(evt) {
        obj[func]($(this).attr("uid"));
        evt.preventDefault();
        return false;
      });
    }
  };

  CircuitBoard.prototype.addDMM = function(params) {
    if (!this.multimeter) {
      this.multimeter = new equipment.multimeter(this, params);
      this.probes.push(this.multimeter.probe['black']);
      this.probes.push(this.multimeter.probe['red']);
    }
    this.multimeter.probe['black'].view.show();
    this.multimeter.probe['red'].view.show();
    this.multimeter.mmbox.view.show();
    this.setDMMText('  0.0 0');
  };

  CircuitBoard.prototype.setDMMText = function(text) {
    if (this.multimeter) {
      for (var i = text.length; i--; ) {
        var val = '#:dmm-digit-' + text.charAt(i);
        this.multimeter.mmbox.screen[i].setAttribute('xlink:href', val);
      }
    }
  };

  CircuitBoard.prototype.removeDMM = function() {
    if (this.multimeter) {
      this.multimeter.probe['black'].view.hide();
      this.multimeter.probe['red'].view.hide();
      this.multimeter.mmbox.view.hide();
    }
  };

  CircuitBoard.prototype.addBattery = function(connections) {
    var type = "battery";

    if (!this.battery) {
      this.battery = new equipment.battery(this, connections);
      this.workspace.append(this.battery.view);
      this.itemslist.push(this.battery);

      this.component[type] = this.battery;
      this.battery["type"] = type;
      this.battery["image"] = new SVGImage(this, type);
    }

    this.battery.btbox.view.show();

    this.battery.pts[0].connected();
    this.battery.pts[1].connected();
  };

  CircuitBoard.prototype.removeBattery = function() {
    if (this.battery) {
      this.battery.btbox.view.hide();
      // this.battery.blackWire.hide();
      // this.battery.redWire.hide();

      this.battery.pts[0].disconnected();
      this.battery.pts[1].disconnected();
    }
  };

  CircuitBoard.prototype.addOScope = function(params) {
    if (!this.oscope) {
      this.oscope = new equipment.oscope(this, params);
      this.probes.push(this.oscope.probe['yellow']);
      this.probes.push(this.oscope.probe['pink']);
    }
    this.oscope.probe['yellow'].view.show();
    this.oscope.probe['pink'].view.show();
  };

  CircuitBoard.prototype.removeOScope = function() {
    if (this.oscope) {
      this.oscope.probe['yellow'].view.hide();
      this.oscope.probe['pink'].view.hide();
    }
  };

  CircuitBoard.prototype.toFront = function(component) {
    var self = this, redrawId;
    // resolve crash in Google Chrome by changing environment
    setTimeout(function() {
      var i = component.view.index();
      if (component.view[0].ownerSVGElement.suspendRedraw) { // IE9 out
        redrawId = component.view[0].ownerSVGElement.suspendRedraw(50);
      }
      // use prepend to avoid crash in iOS
      self.workspace.prepend(component.view.parent().children(':gt(' + i + ')'));
      if (component.view[0].ownerSVGElement.unsuspendRedraw) { // IE9 out
        component.view[0].ownerSVGElement.unsuspendRedraw(redrawId);
      }
    }, 50);
  };

  CircuitBoard.prototype.initMagnifier = function() {
    var brd = this, x, y, t, hole, show_magnifier = false, time;

    var holder = brd.holder[0], active = false, svghead;
    var dx, dy, z, r, pi2, wm, hm, wb, hb, sh, pos, old;

    time = board.options.magnifier.time;
    hole = SVGStorage.hole;
    svghead = SVGStorage.info.svghead;
    dx = board.options.magnifier.offset.x;
    dy = board.options.magnifier.offset.y;
    z = board.options.magnifier.zoom;
    r = board.options.magnifier.size;
    hm = brd.holder.h * z;
    wm = brd.holder.w * z;
    sh = 60 * z;
    hb = hm - sh;
    wb = wm;

    // not active components buffer
    var comp = context2d();
    comp.canvas.height = hm;
    comp.canvas.width = wm;

    pi2 = Math.PI * 2;
    z--; // for event;

    var magnifier = $('<canvas class="magnifier">').attr({
      'height': brd.holder.h + 'px',
      'width': brd.holder.w + 'px'
    }).appendTo(brd.holder);

    var ctx = magnifier[0].getContext('2d'), buff, lead, elem;

    // create buff image of background and holes
    buff = context2d();
    buff.canvas.height = hm;
    buff.canvas.width = wm;
    buff.fillStyle = '#999181';
    buff.rect(0, 0, wb, sh), buff.fill();
    buff.drawImage(SVGStorage.defs[':bg-green-board'], 0, sh, wb, hb);
    buff.drawSvg( SVGStorage.info.svghole, 0, 0, wm, hm );
    buff.fill();
    //window.document.body.appendChild(ctx.canvas);

    // set default style for canvas context2d object

    holder.addEventListener( _mousedown, function(evt) {
      lead = $(evt.target).data('primitive-lead') || null;
      if (lead) {
        elem = brd.component[lead.name];
        comp.update(elem);
        old = pos = getCoords(evt, brd.holder);
        magnifier.draw();
        active = true;
        show_magnifier = true;
        setTimeout(function() {
          if (show_magnifier) {
            magnifier.show();
          }
        }, time);
      }
      evt.preventDefault();
    }, false);

    holder.addEventListener( _mousemove, function(evt) {
      pos = getCoords(evt, brd.holder);
      if (active && ((pos.x != old.x) || (pos.y != old.y))) {
        magnifier.show();
        magnifier.draw();
        old = pos;
      }
    }, false);

    holder.addEventListener( _mouseup, function(evt) {
      if (active) {
        show_magnifier = false;
        magnifier.hide();
        active = false;
        lead = null;
        elem = null;
      }
    }, false);

    ctx.font = "bold 16px Arial";

    magnifier.draw = function() {
      ctx.save();
      ctx.clearRect(0, 0, brd.holder.w, brd.holder.h);

      ctx.beginPath();
      ctx.arc(pos.x-dx, pos.y-dy, r, 0, pi2, false);
      ctx.closePath();
      ctx.fill();
      ctx.clip();

      x = -z*pos.x - dx;
      y = -z*pos.y - dy;

      ctx.drawImage(buff.canvas, x, y, wm, hm);
      if (brd.hole_target) {
        ctx.save();
        t = brd.hole_target.view[0].getCTM();
        ctx.translate(x, y);
        ctx.scale(z + 1, z + 1);
        ctx.transform(t.a, t.b, t.c, t.d, t.e, t.f);
        for (var i = 0, l = hole.length; i < l; i++) {
          ctx.fillStyle = hole[i].c;
          ctx.beginPath();
          ctx.arc(hole[i].x, hole[i].y, hole[i].r, 0, pi2, false);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
      ctx.drawImage(comp.canvas, x, y, wm, hm);
      ctx.drawImage(elem.image.update(), x, y, wm, hm);

      ctx.restore();
      ctx.save();
      ctx.strokeStyle = '#3c3c3c';
      ctx.shadowColor = '#000000';
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 8;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(pos.x-dx, pos.y-dy, r, 0, pi2, false);
      ctx.closePath();
      ctx.stroke();
      if (brd.hole_target) {
        ctx.save();
        ctx.fillStyle = "#00ff00";
        ctx.fillText(brd.hole_target.name, pos.x - r - dx, pos.y - r - dy);
        ctx.restore();
      }
      ctx.restore();

    };

    comp.update = function(elem) {
      this.clearRect(0, 0, wm, hm);
      for (var i = 0, l = brd.itemslist.length; i < l; i++) {
        if (brd.itemslist[i] != elem ) {
          this.drawImage(brd.itemslist[i].image.cnv.canvas, 0, 0, wm, hm);
        }
      }
      for (var p = 0, d = brd.probes.length; p < d; p++ ) {
        this.drawImage(brd.probes[p].image.cnv.canvas, 0, 0, wm, hm);
      }
    };

    // debugging
    //comp.update();
    //comp.canvas.style.border = '1p solir red';
    //document.body.appendChild(comp.canvas);
  };

  CircuitBoard.prototype.showTooltip = function(uid, $tipPane) {
    var $comp      = this.component[uid].view,
        pos        = $comp.position(),
        rect       = $comp[0].getBoundingClientRect(),
        compWidth  = rect.width,
        compHeight = rect.height,
        tipWidth   = $tipPane.width(),
        yOffset,
        left,
        tipHeight,
        $tooltip;

    if (compWidth > 300) {    // weird bug
      compWidth = 120;
    }

    // wrap pane in bubble pane and then empty pane (for mousout)
    $tooltip = $("<div>").append(
      $("<div class='speech-bubble'>").append($tipPane)
    );

    // FIXME: We need a better cross-browser solution for this
    if(typeof InstallTrigger !== 'undefined'){    // Firefox
      yOffset = 180;
      left = pos.left - (2.5*tipWidth)+ (compWidth*0.4);
    } else {
      yOffset = 50;
      left = pos.left - (tipWidth/2)+ (compWidth*0.4);
    }

    this.holder.append($tooltip);

    tipHeight = $tipPane.height();

    $tooltip.css({
      position: "absolute",
      left:     left,
      top:      pos.top - tipHeight - yOffset,
      height:   tipHeight + compHeight + yOffset,
      zIndex:   1000
    });

    // delete on mouseout
    $tooltip.mouseleave(function(){
      $tooltip.fadeOut( function() { $(this).remove(); });
    });
  };

  var SVGImage = function(brd, uid) {
    this.comp = brd.component[uid];
    this.brd = brd;
    // main model
    this.view = this.comp.element.view;
    this.cnv = context2d();
    this.ctx = context2d();

    // calc most used variables
    this.ozoom = 1 / board.options.magnifier.zoom;
    this.zoom = board.options.magnifier.zoom;
    this.w = this.brd.holder.w * this.zoom;
    this.h = this.brd.holder.h * this.zoom;

    // set dimention (w * h) for canvas
    this.cnv.canvas.height = this.ctx.canvas.height = this.h;
    this.cnv.canvas.width = this.ctx.canvas.width = this.w;

    // add pattern image of element
    SVGImage[this.comp.type].call(this);

    this.update();
  };

  SVGImage.prototype.update = function() {
    var ctx = this.cnv, elem = this.comp, path, trns, p, l, i;

  // clear context, common part
    this.cnv.clearRect(0, 0, this.w, this.h);
    this.cnv.save();
  // set zoom transform, common part
    this.cnv.scale(this.zoom, this.zoom);

  // draw leads, common part
    for (i = elem.leads.length; i--; ) {
      path = elem.leads[i].state.path;
      trns = path[0].getCTM();
      for (p = 0, l = path.length; p < l; p++) {
        SVGImage.draw_path.call(this, ctx, path[p], trns);
      }
    }

  // draw connector, common part
    path = elem.connector.view.path;
    for (p = 0, l = path.length; p < l; p++) {
      trns =  path[p].getCTM();
      SVGImage.draw_path.call(this, ctx, path[p], trns);
    }

  // draw pattern, spetial part
    this.cnv.save();
    // set reversed transforms
    this.cnv.transform(0.05, 0, 0, 0.05, 0, -50);
    this.cnv.transform(0.8, 0, 0, 0.8, 0, 0);
    // set real transform

    var t = this.view.attr('transform');
    // fix bug in IE with transforms
    t = t.replace(/\) rotate/g,')#rotate')
      .replace(/ /g,',').replace(/#/, ' ');
    t = t.split(' ');
    var t1 = getTransform(t[0]);
    var t2 = getTransform(t[1]);
    this.cnv.translate(t1[0], t1[1]);
    this.cnv.translate(t2[1], t2[2]);
    this.cnv.rotate(t2[0]*Math.PI/180);
    this.cnv.translate(-t2[1], -t2[2]);
    // set reversed spetial transform
    this.cnv.translate(-5000, -5000);
    // set other reversed transforms
    this.cnv.transform(1.25, 0, 0, 1.25, 0, 0);
    this.cnv.transform(20, 0, 0, 20, 0, 1000);
    this.cnv.scale(this.ozoom, this.ozoom);
    // draw pattern element
    this.cnv.drawImage(this.ctx.canvas, 0, 0, this.w, this.h);
    // restore context
    this.cnv.restore();

    // debugging
    //this.cnv.canvas.style.border = "1px solid blue";
    //document.body.appendChild(this.cnv.canvas);

    this.cnv.restore();
    return this.cnv.canvas;
  };

  SVGImage.wire = function(elem) {
    // Nothing to do
  };

  SVGImage.battery = function(elem) {
    // Nothing to do
  };

  SVGImage.capacitor = function(elem) {
    var path = this.comp.element.view.path;

    // set zoom transform
    this.ctx.scale(this.zoom, this.zoom);
    // set transform from svg (just copy by hand)
    this.ctx.transform(0.05, 0, 0, 0.05, 0, -50);
    this.ctx.transform(0.8, 0, 0, 0.8, 0, 0);
    // set spetial transform, to make element visible on canvas
    this.ctx.translate(5000, 5000);
    // set this element group transform
    var t = getTransform(this.view.children().first().attr('transform'));
    this.ctx.transform(t[0], t[1], t[2], t[3], t[4], t[5]);

    path = this.view.path;
    for (var p = 0, l = path.length; p < l; p++) {
      SVGImage.draw_path.call(this, this.ctx, path[p]);
    }

    // debugging
    //this.ctx.canvas.style.border = "1px solid red";
    //document.body.appendChild(this.ctx.canvas);
  };

  SVGImage.inductor = function(elem) {
    var path = this.comp.element.view.path, g, t;

    // set zoom transform
    this.ctx.scale(this.zoom, this.zoom);
    // set transform from svg (just copy by hand)
    this.ctx.transform(0.05, 0, 0, 0.05, 0, -50);
    this.ctx.transform(0.8, 0, 0, 0.8, 0, 0);
    // set spetial transform, to make element visible on canvas
    this.ctx.translate(5000, 5000);
    // set this element group transform

    g = this.view.children();
    t = getTransform(g.attr('transform'));
    this.ctx.transform(t[0], t[1], t[2], t[3], t[4], t[5]);

    g = this.view.children().children().not('[type="label"]');
    for (var i = 0, l = g.length; i< l; i++) {
      t = getTransform(g[i].getAttribute('transform'));
      this.ctx.save();
      this.ctx.transform(t[0], t[1], t[2], t[3], t[4], t[5]);
      path = $(g[i]).children()[0];
      SVGImage.draw_path.call(this, this.ctx, path);
      this.ctx.restore();
    }

    // debugging
    //this.ctx.canvas.style.border = "1px solid red";
    //document.body.appendChild(this.ctx.canvas);
  };

  SVGImage.resistor = function(elem) {
    var g, u, t, i, l;

    // set zoom transform
    this.ctx.scale(this.zoom, this.zoom);
    // set transform from svg (just copy by hand)
    this.ctx.transform(0.05, 0, 0, 0.05, 0, -50);
    this.ctx.transform(0.8, 0, 0, 0.8, 0, 0);
    // set spetial transform, to make element visible on canvas
    this.ctx.translate(5000, 5000);
    // set this element group transform

    this.ctx.transform(15, 0, 0, 15, 0, 150);
    this.ctx.scale(0.6, 0.6);

    g = this.view.children().children().not('[type="label"]');

    u = g.children('use').not('[type="hint"]');
    this.ctx.save();
    this.ctx.translate(-94, -32);
    for (i = 0, l = u.length; i< l; i++) {
      SVGImage.draw_use.call(this, this.ctx, u[i]);
    }
    this.ctx.restore();

    g = g.children('g');
    for (i = 0, l = g.length; i< l; i++) {
      this.ctx.save();

      g[i] = $(g[i]);

      t = g[i].attr('transform');
      // fix bug in IE with transforms
      t = t.replace(/\) rotate/g,')#rotate')
        .replace(/ /g,',').replace(/#/, ' ');
      t = t.split(' ');
      var t1 = getTransform(t[0]);
      this.ctx.translate(t1[0], t1[1]);
      if (t[1]) {
        var t2 = getTransform(t[1]);
        this.ctx.scale(t2[0], t2[1]);
      }
      u = g[i].children()[0];
      SVGImage.draw_use.call(this, this.ctx, u);
      this.ctx.restore();
    }

    // debugging
    //this.ctx.canvas.style.border = "1px solid red";
    //document.body.appendChild(this.ctx.canvas);
  };

  SVGImage.probe = function(brd, elem) {
    // main model
    this.view = elem.view;
    this.cnv = context2d();
    this.ctx = context2d();

    // calc most used variables
    this.ozoom = 1 / board.options.magnifier.zoom;
    this.zoom = board.options.magnifier.zoom;
    this.w = brd.holder.w * this.zoom;
    this.h = brd.holder.h * this.zoom;

    // set dimention (w * h) for canvas
    this.cnv.canvas.height = this.ctx.canvas.height = this.h;
    this.cnv.canvas.width = this.ctx.canvas.width = this.w;

    // add pattern image of element
    SVGImage.probe.template.call(this);

    // update
    this.update();
  };

  SVGImage.probe.prototype.update = function() {
    // clear context, common part
    this.cnv.clearRect(0, 0, this.w, this.h);
    this.cnv.save();

    // set real transforms
    this.cnv.scale(this.zoom, this.zoom);
    this.cnv.transform(0.05, 0, 0, 0.05, 0, -100);
    var t = this.view.attr('transform');
    if (t) {
      t = getTransform(t);
      this.cnv.translate(t[0], t[1]);
    }

    t = this.view.children().attr('transform');
    if (t) {
      t = getTransform(t);
      this.cnv.translate(t[0], t[1]);
    }

    t = this.view.children().children().attr('transform');
    t = getTransform(t);

    // set reversed transforms
    this.cnv.translate(this.rt[0], this.rt[1]);
    this.cnv.transform(20, 0, 0, 20, 0, 2000);
    this.cnv.scale(this.ozoom, this.ozoom);

    // draw template image
    this.cnv.drawImage(this.ctx.canvas, 0, 0, this.w, this.h);

    // debugging
    //this.cnv.canvas.style.border = "1px solid blue";
    //document.body.appendChild(this.cnv.canvas);

    this.cnv.restore();
    return this.cnv.canvas;
  };

  SVGImage.probe.template = function() {
    var t = this.view.attr('transform-full-visibility');
    t = getTransform(t);

    this.ctx.save();
    // add pattern image of element
    this.ctx.scale(this.zoom, this.zoom);
    this.ctx.transform(0.05, 0, 0, 0.05, 0, -100);
    this.ctx.translate(t[0], t[1]);

    // draw all elements, skip type="initial". used as (0, 0)
    this.view.children().children().each(
      SVGImage.probe.template_draw(this.ctx)
    );
    this.ctx.restore();

    // save reversed transform, for update
    this.rt = [-t[0], -t[1]];

    // debugging
    //this.ctx.canvas.style.border = "1px solid blue";
    //document.body.appendChild(this.ctx.canvas);
  };

  SVGImage.probe.template_draw = function(ctx) {
    return function() {
      var elem = $(this), name = this.nodeName.toLowerCase();
      if (name == 'g') {
        ctx.save();
        var t = this.getAttribute('transform');
        if (t) {

          t = getTransform(t);
          ctx.transform(t[0], t[1], t[2], t[3], t[4], t[5]);
        }
        //console.log('g >> ', this.getAttribute('transform'));
        elem.children().each(
          SVGImage.probe.template_draw(ctx)
        );
        ctx.restore();
      } else
      if (name == 'path') {
        //console.log('path >> ', this.getAttribute('transform'))
        SVGImage.draw_path(ctx, this);
      }
    };
  };

  SVGImage.draw_use = function(ctx, use, trn) {
    ctx.save();

    if (trn) {
      ctx.transform(trn.a, trn.b, trn.c, trn.d, trn.e, trn.f);
    }

    var xlink = use.getAttribute('xlink:href').replace('#','');
    var img = SVGStorage.defs[xlink];
    var x = parseInt(use.getAttribute('x'), 10);
    var y = parseInt(use.getAttribute('y'), 10);
    var ox = parseInt(img.ox, 10);
    var oy = parseInt(img.oy, 10);

    ctx.drawImage(img, x + ox, y + oy, img.width, img.height);

    ctx.restore();
  };

  SVGImage.draw_path = function(ctx, path, trn) {
    ctx.save();

    if (trn) {
      ctx.transform(trn.a, trn.b, trn.c, trn.d, trn.e, trn.f);
    }

    var str_lj = path.getAttribute('stroke-linejoin') || false;
    var str_lc = path.getAttribute('stroke-linecap') || false;
    var str_w = parseInt(path.getAttribute('stroke-width'), 10);
    var str_c = path.getAttribute('stroke');
    var fill = path.getAttribute('fill'), f;

    if (str_c) {ctx.strokeStyle = str_c;}
    if (str_w) {ctx.lineWidth = str_w;}
    if (str_lj) {ctx.lineJoin = str_lj;}
    if (str_lc) {ctx.lineCap = str_lc;}

    ctx.beginPath();

    var segs = path.pathSegList;
    for (var i = 0, len = segs.numberOfItems; i < len; i++) {
      var seg = segs.getItem(i), c = seg.pathSegTypeAsLetter;
      if (c == "M") {
        ctx.moveTo(seg.x, seg.y);
      } else
      if (c == "L") {
        ctx.lineTo(seg.x, seg.y);
      } else
      if (c == "Q") {
        ctx.quadraticCurveTo(seg.x1, seg.y1, seg.x, seg.y);
      } else
      if (c == "A") {
       ctx.arc(seg.x - seg.r1, seg.y, seg.r1, 0, Math.PI * 2, true);
      } else
      if (c == "Z") {
        ctx.closePath();
      }
    }

    if (str_c) {ctx.stroke();}

    if (fill && fill != 'none') {
      if (fill.substring(0,3) == 'url') {
        fill = fill.replace(/url\(/gm,'');
        fill = fill.replace(/\)/gm,'');
        f = this.brd.holder.find(fill);
        SVGImage["draw_"+ f[0].nodeName.toLowerCase()](ctx, f);
      } else {
        ctx.fillStyle = fill;
        ctx.fill();
      }
    }

    ctx.restore();
  };

  SVGImage.draw_lineargradient = function(ctx, f) {
    var x1 = parseFloat(f.attr('x1'), 10);
    var y1 = parseFloat(f.attr('y1'), 10);
    var x2 = parseFloat(f.attr('x2'), 10);
    var y2 = parseFloat(f.attr('y2'), 10);

    var trn = (f[0].getAttribute('gradientTransform') || '')
         .replace(/\)/,'').replace(/matrix\(/,'').split(' ');

    ctx.save();

    if (trn) {
      ctx.transform(
        parseFloat(trn[0], 10), parseFloat(trn[1], 10),
        parseFloat(trn[2], 10), parseFloat(trn[3], 10),
        parseFloat(trn[4], 10), parseFloat(trn[5], 10)
      );
    }

    var grad = ctx.createLinearGradient(x1, y1, x2, y2);

    var s = f.children('stop'), i, l;
    for (i = 0, l = s.length; i < l; i++) {
      grad.addColorStop(
        parseFloat(s[i].getAttribute('offset'), 10) ,
        s[i].getAttribute('stop-color-rgba')
      );
    }

    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  };

  SVGImage.draw_radialgradient = function(ctx, f) {
    var fx = parseFloat(f.attr('fx'), 10);
    var fy = parseFloat(f.attr('fy'), 10);
    var cx = parseFloat(f.attr('cx'), 10);
    var cy = parseFloat(f.attr('cy'), 10);
    var r = parseFloat(f.attr('r'), 10);
    var trn = (f[0].getAttribute('gradientTransform') || '')
         .replace(/\)/,'').replace(/matrix\(/,'').split(' ');

    ctx.save();

    if (trn) {
      ctx.transform(
        parseFloat(trn[0], 10), parseFloat(trn[1], 10),
        parseFloat(trn[2], 10), parseFloat(trn[3], 10),
        parseFloat(trn[4], 10), parseFloat(trn[5], 10)
      );
    }

    var grad = ctx.createRadialGradient(fx, fy, 0, cx, cy, r);

    var s = f.children('stop'), i, l;
    for (i = 0, l = s.length; i < l; i++) {
      grad.addColorStop(
        parseFloat(s[i].getAttribute('offset'), 10) ,
        s[i].getAttribute('stop-color-rgba')
      );
    }

    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  };

  // holes constructor

  var CircuitBoardHole = function(elem) {
    this.name = elem.attr('hole');
    this.x = parseInt(elem.attr("transform").match(/(-?\d+\.\d+)|-?\d+/g)[4], 10);
    this.y = parseInt(elem.attr("transform").match(/(-?\d+\.\d+)|-?\d+/g)[5], 10);
    this.num = (elem.attr("xlink:href") == "#$:hole_connected") ? 1 : 0;
    this.view = elem;
  };

  CircuitBoardHole.prototype.connected = function() {
    this.num++;
    this.view.attr("xlink:href", "#$:hole_connected");
    return this;
  };

  CircuitBoardHole.prototype.disconnected = function() {
    if (--this.num === 0) {
      this.view.attr("xlink:href", "#$:hole_not_connected");
    }
    return this;
  };

  CircuitBoardHole.prototype.highlight = function() {
    this.view.attr("xlink:href", "#$:hole_highlighted");
    return this;
  };

  CircuitBoardHole.prototype.unhighlight = function() {
    var pref = (this.num) ? '' : '_not';
    this.view.attr("xlink:href", "#$:hole" + pref + "_connected");
    return this;
  };

  /* === #equipments begin === */

  equipment.multimeter = function(board, params) {
    this.mmbox = new primitive.mmbox(board, params);
    this.probe = {
      "black" : new primitive.probe(board, {
        'connection' : (params['black']) ? params.black.connection : false,
        'draggable' : (params['black']) ? params.black.draggable : false,
        'color' : 'black',
        'name' : 'dmm'
      }),
      "red" : new primitive.probe(board, {
        'connection' : (params['red']) ? params.red.connection : false,
        'draggable' : (params['red']) ? params.red.draggable : false,
        'color' : 'red',
        'name' : 'dmm'
      })
    };
  };

  equipment.oscope = function(board, params) {
    this.probe = {
      "yellow" : new primitive.probe(board, {
        'connection' : (params['yellow']) ? params.yellow.connection : false,
        'draggable' : (params['yellow']) ? params.yellow.draggable : false,
        'color' : 'yellow',
        'name' : 'oscope'
      }),
      "pink" : new primitive.probe(board, {
        'connection' : (params['pink']) ? params.pink.connection : false,
        'draggable' : (params['pink']) ? params.pink.draggable : false,
        'color' : 'pink',
        'name' : 'oscope'
      })
    };
  };

  equipment.battery = function(board, connections) {
    this.view = SVGStorage.create('group').attr({
      'component' : 'battery'
    });

    // main model
    this.btbox = new primitive.btbox(board);

    var loc = connections.split(',');
    this.pts = [board.holes[loc[0]], board.holes[loc[1]]];

    // create leads

    this.leads = addLeads(this.pts, [300, 45], loc, 'battery', false, board);

    // create wires
    this.wires = [
      new primitive.battery_wire('black', this.pts[0]),
      new primitive.battery_wire('red', this.pts[1])
    ];

    this.view.append(this.wires[0].view, this.wires[1].view);
    this.view.append(this.leads[0].view, this.leads[1].view);

    // model for SVGImage
    this.connector = {"view": this.wires[0].view};
    this.element = {"view": this.wires[0].view};
    this.connector.view.path = this.view.children('g:lt(2)').find('path');

  };

  /* === #equipments end === */

  /* === #components begin === */

  component.prototype.init = function(params, holes, board) {
    var loc = params["connections"].split(',');
    this.pts = [holes[loc[0]], holes[loc[1]]];
    this.angle = getAngleBetwPoints(this.pts);
    this.leads = addLeads(this.pts, getDegsFromRad(this.angle), loc, params.UID, params.draggable, board);
    this.view = SVGStorage.create('group').attr({
      'component' : params.type,
      'uid' : params.UID
    });
    this.hole = [this.pts[0].connected(), this.pts[1].connected()];
  };

  component.wire = function(params, holes, board) {
    component.prototype.init.call(this, params, holes, board);
    var color = params.color || "rgb(173,1,1)";
    this.element = new primitive.connector(this.pts, this.angle, [color, color]);
    this.connector = this.element;
    this.view.append(this.element.view, this.leads[0].view, this.leads[1].view);
    // add event handler for draggable
    component.prototype.drag.call(this, params.draggable, params.type);
  };

  component.inductor = function(params, holes, board) {
    component.prototype.init.call(this, params, holes, board);
    this.connector = new primitive.connector(this.pts, this.angle, ['rgb(108,27,13)', 'rgb(185,77,42)']);
    this.element = new primitive.inductor(this.pts, this.angle, params.label);
    this.view.append(this.connector.view, this.leads[0].view, this.leads[1].view, this.element.view);
    // add event handler for draggable
    component.prototype.drag.call(this, params.draggable);
  };

  component.resistor = function(params, holes, board) {
    component.prototype.init.call(this, params, holes, board);
    this.connector = new primitive.connector(this.pts, this.angle);
    this.element = new primitive.resistor(this.pts, this.angle, params.label, params.color);
    this.view.append(this.leads[0].view, this.leads[1].view, this.connector.view, this.element.view);
    // add event handler for draggable
    component.prototype.drag.call(this, params.draggable);

    this.changeColors = function(colors) {
      bands = this.view.find('[type^=band]');
      bands.each(function(i) {
        if (i != (colors.length - 1)) {
          $(this).attr('xlink:href', '#:$:band-s-' + colors[i]);
        } else {
          $(this).attr('xlink:href', '#:$:band-b-' + colors[i]);
        }
      });
      tooltips = this.view.find('[tooltip^=band]');
      tooltips.each(function(i) {
        $(this).attr('xlink:href', '#:$:resistor-hint-' + colors[i]);
      });
    }
  };

  component.capacitor = function(params, holes, board) {
    component.prototype.init.call(this, params, holes, board);
    var color = params.color || "rgb(255,0,0)";
    this.connector = new primitive.connector(this.pts, this.angle);
    this.element = new primitive.capacitor(this.pts, this.angle, params.label, color);
    this.view.append(this.leads[0].view, this.leads[1].view, this.connector.view, this.element.view);
    // add event handler for draggable
    component.prototype.drag.call(this, params.draggable);
  };

  component.prototype.drag = function(draggable, type) {
    if (draggable) {
      var self = this;
      this.x = 0;
      this.y = 0;
      if (type == 'wire') {
        this.view.find('[drag=area]').attr('display', 'inline');
      }
      this.element.view[0].addEventListener(_mousedown, function(evt) {
        self.element.view.data('component', self);
        evt._target = this;
      }, false);
    }
  };

  /* === #components end === */

  /* === #primitive begin === */

  primitive.prototype.initComponentDraggable = function(board) {
    var component, s_pos, c_pos, x = 0, y = 0, coeff = 25, dx, dy;
    var l1, l2, ho1, ho2, hn1, hn2, c, deg, angle;
    var hi1, hi2;
    var p1 = {
      x : 0,
      y : 0
    }, p2 = {
      x : 0,
      y : 0
    }, pts = [p2, p1];

    board.holder[0].addEventListener(_mousedown, function(evt) {
      if (!evt.touches || evt.touches.length == 1) {
        component = $(evt._target).data('component') || null;
        if (component) {
          s_pos = getCoords(evt, board.holder);

          l1 = component.leads[0];
          l2 = component.leads[1];

          p1.x = l1.x;
          p1.y = l1.y;
          p2.x = l2.x;
          p2.y = l2.y;

          ho1 = component.hole[0].highlight();
          ho2 = component.hole[1].highlight();
          hi1 = hn1 = ho1;
          hi2 = hn2 = ho2;

          board.toFront(component);
          evt.preventDefault();
        }
      }
    }, false);

    board.holder[0].addEventListener(_mousemove, function(evt) {
      if (!evt.touches || evt.touches.length == 1) {
        if (component) {
          c_pos = getCoords(evt, board.holder);
          dx = c_pos.x - s_pos.x;
          dy = c_pos.y - s_pos.y;
          x = component.x + dx * coeff;
          y = component.y + dy * coeff;
          // update view of component
          component.view.attr('transform', 'translate(' + x + ',' + y + ')');
          // highlight nearest holes
          p1.x = l1.x + dx * coeff;
          p1.y = l1.y + dy * coeff;
          p2.x = l2.x + dx * coeff;
          p2.y = l2.y + dy * coeff;
          hn1 = board.holes.find(p1);
          hn2 = board.holes.find(p2);
          if (hi1 || hi2) {
            hi1.disconnected().highlight();
            hi2.disconnected().highlight();
            hi1 = hi2 = null;
            // sent event to model
            if (l1.state != l1.view_d) {
              l1.board.sendEventToModel("connectionBroken", [l1.name, l1.hole]);
            }
            if (l2.state != l2.view_d) {
              l2.board.sendEventToModel("connectionBroken", [l2.name, l2.hole]);
            }
          }
          if (hn1 != ho1) {
            ho1.unhighlight();
            ho1 = hn1.highlight();
          }
          if (hn2 != ho2) {
            ho2.unhighlight();
            ho2 = hn2.highlight();
          }
        }
      }
    }, false);

    board.holder[0].addEventListener(_mouseup, function(evt) {
      if (!evt.touches || evt.touches.length === 0) {
        if (component) {
          // snap to nearest holes
          component.hole[0] = hn1;
          component.hole[1] = hn2;
          l1.hole = hn1.name;
          l2.hole = hn2.name;
          component.x = 0;
          component.y = 0;
          // update all primitives
          p1.x = l1.x = hn1.x;
          p1.y = l1.y = hn1.y;
          p2.x = l2.x = hn2.x;
          p2.y = l2.y = hn2.y;
          // update view
          hn1.unhighlight();
          hn2.unhighlight();
          if (!hi1) {
            hn1.connected();
            l1.connect();
          }
          if (!hi2) {
            hn2.connected();
            l2.connect();
          }
          updateComponentView();
          // reset temp variables
          component = null;
          hn1 = null;
          hn2 = null;
        }
      }
    }, false);

    var updateComponentView = function() {
      c = {
        x : (p1.x + p2.x) / 2,
        y : (p1.y + p2.y) / 2
      };
      angle = getDegsFromRad(getAngleBetwPoints(pts));
      deg = (angle > 90 || angle < -90) ? (angle + 180) : angle;
      // update view of primitives
      component.view.removeAttr('transform');
      l1.view.attr('transform', 'translate(' + l1.x + ',' + l1.y + ') rotate(' + angle + ',130,130)');
      l2.view.attr('transform', 'translate(' + l2.x + ',' + l2.y + ') rotate(' + angle + ',130,130)');
      component.element.view.attr('transform', 'translate(' + c.x + ',' + c.y + ') rotate(' + deg + ',132.5,132.5)');
      setConnectorView(component.connector.view, pts, angle);
      component.image.update();
    };

  };

  primitive.prototype.initLeadDraggable = function(board) {
    var lead_this, lead_pair, component, coeff = 25;
    // coeff = 1 / (0.05*0.8)
    var s_pos, c_pos, dx, dy, pts, angle, c;
    var p1 = {
      x : 0,
      y : 0
    }, p2 = {
      x : 0,
      y : 0
    }, deg, hi, ho, hn;

    board.holder[0].addEventListener(_mousedown, function(evt) {
      if (!evt.touches || evt.touches.length == 1) {
        lead_this = $(evt.target).data('primitive-lead') || null;
        if (lead_this) {
          component = board.component[lead_this.name];
          lead_pair = findLeadPair(component, lead_this);
          hi = board.holes.find(lead_this).highlight();
          hn = ho = hi;
          s_pos = getCoords(evt, board.holder);
          p2.x = lead_pair.x;
          p2.y = lead_pair.y;
          pts = (lead_this.orientation == 1) ? [p1, p2] : [p2, p1];
          evt.preventDefault();
        }
      }
    }, false);

    board.holder[0].addEventListener(_mousemove, function(evt) {
      if (!evt.touches || evt.touches.length == 1) {
        if (lead_this) {
          // calc move params
          c_pos = getCoords(evt, board.holder);
          dx = c_pos.x - s_pos.x;
          dy = c_pos.y - s_pos.y;
          p1.x = lead_this.x + dx * coeff;
          p1.y = lead_this.y + dy * coeff;
          // update view of component
          updateComponentView();
          // update flag for hover events
          lead_this.isDragged = true;
          // find the nearest hole
          hn = board.holes.find(p1);
          board.hole_target = hn;
          if (hi) {
            hi.disconnected().highlight();
            hi = null;
            // sent event to model
            if (lead_this.state != lead_this.view_d) {
              lead_this.board.sendEventToModel("connectionBroken", [lead_this.name, lead_this.hole]);
            }
          }
          if (hn != ho) {
            ho.unhighlight();
            ho = hn.highlight();
          }
        }
      }
    }, false);

    board.holder[0].addEventListener(_mouseup, function(evt) {
      if (!evt.touches || evt.touches.length === 0) {
        if (lead_this) {
          lead_this.isDragged = false;
          lead_this.x = p1.x = hn.x;
          lead_this.y = p1.y = hn.y;
          lead_this.hole = hn.name;
          component.hole[0] = board.holes[lead_this.hole];
          component.hole[1] = board.holes[lead_pair.hole];
          updateComponentView();
          hn.unhighlight();
          if (!hi) {
            lead_this.connect();
            hn.connected();
          }
          // reset temp links
          hn = null;
          ho = null;
          lead_this = null;
          lead_pair = null;
        }
        if ($(evt.target).data('component-lead')) {
          var name = $(evt.target).data('component-lead');
          board.component[name].image.update();
        }
      }
    }, false);

    var updateComponentView = function() {
      lead_this.arrow.hide();
      c = {
        x : (p1.x + p2.x) / 2,
        y : (p1.y + p2.y) / 2
      };
      angle = getDegsFromRad(getAngleBetwPoints(pts));
      deg = (angle > 90 || angle < -90) ? (angle + 180) : angle;
      // update view of primitives
      lead_this.view.attr('transform', 'translate(' + p1.x + ',' + p1.y + ') rotate(' + angle + ',130,130)');
      lead_pair.view.attr('transform', 'translate(' + p2.x + ',' + p2.y + ') rotate(' + angle + ',130,130)');
      component.element.view.attr('transform', 'translate(' + c.x + ',' + c.y + ') rotate(' + deg + ',132.5,132.5)');
      setConnectorView(component.connector.view, pts, angle);
    };

  };

  primitive.lead = function(type, pos, angle, draggable) {
    var lead = SVGStorage.create('lead').clone(), self = this;
    this.view_d = lead.find('[type="disconnected"]').hide();
    this.view_d.path = this.view_d.find('[type="wire"]>path');
    this.view_c = lead.find('[type="connected"]').show();
    this.view_c.path = this.view_c.find('[type="wire"]>path');

    // name of component
    this.name = pos.name;
    // name of hole
    this.hole = pos.hole;
    // link to change colors
    this.wire = lead.find('[type="wire"] path');
    // link to current visible lead
    this.state = this.view_c;
    // link to probe;
    this.probe = false;

    // set the right direction
    this.orientation = (type == 'left') ? 1 : -1;
    lead.find('[type="orientation"]').attr({
      "transform" : 'matrix(' + self.orientation + ' 0 0 1 0 0)'
    });

    // set the position
    lead.attr("transform", "matrix(1 0 0 1 " + pos.x + " " + pos.y + ") rotate(" + (180 + angle) + ",130,130)");
    this.x = pos.x;
    this.y = pos.y;

    this.arrow = lead.find('.arrow').hide();
    // bind hover events
    var action = lead.find("[type=action]");
    if (!touch) {
      action.bind('mouseover', function() {
        self.arrow.show();
      });
      action.bind('mouseout', function() {
        self.arrow.hide();
      });
    }
    if (draggable) {
      action.data('primitive-lead', this);
    }
    action.data('component-lead', this.name);

    // bind onclick events
    action[0].addEventListener(_mouseup, function(l) {
      var f = false;
      return function() {
        if (!l.isDragged) {
          l[ (f = !f) ? 'disconnect' : 'connect' ]();
        }
      };
    }(this), false);

    this.view = lead;
  };

  primitive.lead.prototype.connect = function() {
    this.state = this.view_c;
    this.view_d.hide();
    this.view_c.show();
    this.snapProbe();
    this.board.sendEventToModel("connectionMade", [this.name, this.hole]);
  };

  primitive.lead.prototype.disconnect = function() {
    this.state = this.view_d;
    this.view_c.hide();
    this.view_d.show();
    this.snapProbe();
    this.board.sendEventToModel("connectionBroken", [this.name, this.hole]);
  };

  primitive.lead.prototype.highlight = function(m) {
    var colors = {// colors for each path
      '0' : ['51, 51, 51', '160,160,160', '229,229,229'],
      '1' : [' 51, 51,255', '160,160,255', '229,229,255'],
      '2' : ['130,110,150', '240,220,160', '255,255,255']
    };

    for (var i = 3; i--; ) {
      this.wire[i + 0].setAttribute('stroke', 'rgb(' + colors[m][i] + ')');
      this.wire[i + 3].setAttribute('stroke', 'rgb(' + colors[m][i] + ')');
    }
  };

  primitive.lead.prototype.calcbbox = function() {
    var matrix = this.state[0].getCTM();
    var bbox = this.state[0].getBBox();
    var p = [SVGStorage.point(), SVGStorage.point(), SVGStorage.point(), SVGStorage.point()];
    // top left point
    p[0].x = bbox.x;
    p[0].y = bbox.y;
    // top right point
    p[1].x = bbox.x + bbox.width;
    p[1].y = bbox.y;
    // bottom right point
    p[2].x = bbox.x + bbox.width;
    p[2].y = bbox.y + bbox.height;
    // bottom left point
    p[3].x = bbox.x;
    p[3].y = bbox.y + bbox.height;
    // apply matrix transform to all points
    for (var i = p.length; i--; ) {
      p[i] = p[i].matrixTransform(matrix);
    }
    // return result
    this.state.bbox = p;
  };

  primitive.lead.prototype.hasPoint = function(p) {
    var a, b, c, sa, sb, sc;
    a = this.state.bbox[0];
    b = this.state.bbox[2];
    // first triangle
    c = this.state.bbox[1];
    sa = (a.x - p.x) * (b.y - a.y) - (b.x - a.x) * (a.y - p.y);
    sb = (b.x - p.x) * (c.y - b.y) - (c.x - b.x) * (b.y - p.y);
    sc = (c.x - p.x) * (a.y - c.y) - (a.x - c.x) * (c.y - p.y);
    if ((sa >= 0 && sb >= 0 && sc >= 0) || (sa <= 0 && sb <= 0 && sc <= 0)) {
      return true;
    }
    //second triangle
    c = this.state.bbox[3];
    sa = (a.x - p.x) * (b.y - a.y) - (b.x - a.x) * (a.y - p.y);
    sb = (b.x - p.x) * (c.y - b.y) - (c.x - b.x) * (b.y - p.y);
    sc = (c.x - p.x) * (a.y - c.y) - (a.x - c.x) * (c.y - p.y);
    if ((sa >= 0 && sb >= 0 && sc >= 0) || (sa <= 0 && sb <= 0 && sc <= 0)) {
      return true;
    }
    // return false if no
    return false;
  };

  primitive.lead.prototype.snapProbe = function() {
    if (this.probe) {
      this.probe.snap();
    }
  };

  primitive.connector = function(pts, angle, color) {
    var connector = SVGStorage.create('connector').clone();
    connector.path = connector.find('path');
    angle = getDegsFromRad(angle) + 180;

    setConnectorView(connector, [pts[1], pts[0]], angle);

    if (color !== undefined) {
      connector.find('[type=line]').eq(1).attr('stroke', color[0]);
      connector.find('[type=line]').eq(2).attr('stroke', color[1]);
    }
    this.view = connector;
  };

  primitive.inductor = function(pts, angle, labelText, draggable) {
    var inductor = SVGStorage.create('inductor').clone();
    angle = getDegsFromRad(angle);

    inductor.path = inductor.find('path').not('[type="label-bg"]');

    if (angle > 90 || angle < -90) {
      angle += 180;
    }
    inductor.attr('transform', 'translate(' + parseInt((pts[0].x + pts[1].x) / 2, 10) + ',' + parseInt((pts[0].y + pts[1].y) / 2, 10) + ') rotate(' + angle + ',132.5,132.5)');

    var label = inductor.find('[type=label]');
    if (!touch && labelText) {
      inductor.bind('mouseover', function() {
        label.show();
      });
      inductor.bind('mouseout', function() {
        label.hide();
      });
    } else if (labelText) {
      label.show();
    }
    inductor.find('[type=label_text]').append(labelText);

    this.view = inductor;
  };

  primitive.capacitor = function(pts, angle, labelText, color) {
    var capacitor = SVGStorage.create('capacitor').clone();
    var label = capacitor.find('[type=label]');
    angle = getDegsFromRad(angle);

    capacitor.path = capacitor.find('path');

    if (angle > 90 || angle < -90) {
      angle += 180;
    }
    capacitor.attr('transform', 'translate('+parseInt((pts[0].x + pts[1].x) / 2, 10) + ',' + parseInt((pts[0].y + pts[1].y) / 2, 10) + ') rotate(' + angle + ',132.5,132.5)');

    if (!touch && labelText) {
      capacitor.bind('mouseover', function() {
        label.show();
      });
      capacitor.bind('mouseout', function() {
        label.hide();
      });
    } else if (labelText) {
      label.show();
    }
    capacitor.find('[type=label_text]').append(labelText);
    if (color !== undefined) {
      capacitor.find('[type=cap]').eq(0).attr('fill', color);
    }
    this.view = capacitor;
  };

  primitive.resistor = function(pts, angle, labelText, colors) {
    var resistor = SVGStorage.create('resistor' + colors.length + 'band').clone();
    var tooltip = {};
    var label = resistor.find('[type=label]');
    var band = resistor.find('[type^=band]');
    angle = getDegsFromRad(angle);

    resistor.path = resistor.find('use')
               .not('[type="label-bg"]')
                  .not('[type="hint"]');

    if (angle > 90 || angle < -90) {
      angle += 180;
    }
    resistor.attr('transform', 'translate(' + parseInt((pts[0].x + pts[1].x) / 2, 10) + ',' + parseInt((pts[0].y + pts[1].y) / 2, 10) + ') rotate(' + angle + ',132.5,132.5)');

    band.each(function(i) {
      if (i != (colors.length - 1)) {
        $(this).attr('xlink:href', '#:$:band-s-' + colors[i]);
      } else {
        $(this).attr('xlink:href', '#:$:band-b-' + colors[i]);
      }
    });
    if (!touch) {
      if (labelText) {
        resistor.bind('mouseover', function() {
          label.show();
        });
        resistor.bind('mouseout', function() {
          label.hide();
        });
      }

      band.each(function(i) {
        tooltip[$(this).attr('type')] = resistor.find('[tooltip=' + $(this).attr('type') + ']').attr('xlink:href', '#:$:resistor-hint-' + colors[i]);

        $(this).bind('mouseover', function() {
          $(this).attr('transform', 'scale(1.6)');
          tooltip[$(this).attr('type')].show();
        });
        $(this).bind('mouseout', function() {
          $(this).attr('transform', 'scale(1)');
          tooltip[$(this).attr('type')].hide();
        });
      });
    } else if (labelText) {
      label.show();
    }

    resistor.find('[type=label_text]').append(labelText);

    this.view = resistor;
  };

  primitive.prototype.initProbeDraggable = function(board) {
    var active, lead_new, lead_old, lead_init, point;
    var s_pos, c_pos, x, y, dx, dy, coeff = 20;

    board.holder.find('[info=probe]').each(function() {
      this.addEventListener(_mousedown, function(evt) {
        if (!evt.touches || evt.touches.length == 1) {
          active = $(this).data('primitive-probe') || {};
          if (active.draggable) {
            active.z.attr('transform', active.z.zoom);
            s_pos = getCoords(evt, board.holder);
            calcLeadsBBox.call(board);
            lead_init = active.lead;
            evt.stopPropagation();
            evt.preventDefault();
            // hack to avoid errors if mousedown+mouseup-mousemove
            x = active.dx;
            y = active.dy;
            dx = dy = 0;
          } else {
            active = null;
          }
        }
      }, false);
    });

    board.holder[0].addEventListener(_mousemove, function(evt) {
      if (!evt.touches || evt.touches.length == 1) {
        if (active) {
          c_pos = getCoords(evt, board.holder);
          dx = c_pos.x - s_pos.x;
          dy = c_pos.y - s_pos.y;
          //coord for view translations
          x = active.dx + dx * coeff;
          y = active.dy + dy * coeff;
          active.view.attr('transform', 'translate(' + x + ',' + y + ')');
          //coord for real probe coords
          point = {
            'x' : (active.x + dx),
            'y' : (active.y + dy)
          };
          lead_new = findLeadUnderProbe(board, point);
          if (lead_init) {
            board.sendEventToModel("probeRemoved", [active.name, active.color]);
            lead_init = null;
          }
          if (lead_new) {
            lead_new.highlight(1);
            lead_old = lead_new;
            //active.lead = lead_new;
          } else {
            if (lead_old) {
              lead_old.highlight(0);
              lead_old = null;
            }
          }
        }
      }
    }, false);

    board.holder[0].addEventListener(_mouseup, function(evt) {
      if (!evt.touches || evt.touches.length === 0) {
        if (active) {
          active.z.attr('transform', active.z.init);
          active.x += dx;
          active.y += dy;
          active.dx = x;
          active.dy = y;
          if (lead_new) {
            active.setState(lead_new);
          } else if (active.lead) {
            active.lead = null;
          }
          active.image.update();
          active = null;
        }
      }
    }, false);
  };

  primitive.probe = function(board, params) {
    // shortcats
    var self = this;
    // temp vars
    var point, coeff = 1.25, lead;

    var elem = board.holder.find('[info=probe][name=' + params.color + ']');
    var initial = elem.find('[type=initial]');

    if (params.connection) {// move to this position
      initial.attr('transform', 'translate(' + (board.holes[params.connection].x / coeff) + ',' + (board.holes[params.connection].y / coeff) + ')');
    }

    this.z = elem.find('[type="zooming"]');
    this.z.zoom = this.z.attr('transform-zoomed');
    this.z.init = this.z.attr('transform');

    // make object
    point = getAttractionPoint(elem);
    this.draggable = params.draggable;
    this.color = params.color;
    this.name = params.name;
    this.x = point.x;
    this.y = point.y;
    this.lead = null;
    this.dx = 0;
    this.dy = 0;
    this.view = elem;
    this.view.show = self.show;
    this.view.hide = self.hide;
    this.view.data('primitive-probe', this);
    this.image = new SVGImage.probe(board, this);

    if (params.connection) {// snap to lead
      calcLeadsBBox.call(board);
      lead = findLeadUnderProbe(board, {
        'x' : this.x,
        'y' : this.y
      });
      if (lead) {
        this.setState(lead);
      }
    }

  };

  primitive.probe.prototype.setState = function(lead) {
    this.lead = lead;
    this.lead.probe = this;
    this.lead.highlight(2);
    this.snap();
    lead.board.sendEventToModel("probeAdded", [this.name, this.color, this.lead.hole]);
  };

  primitive.probe.prototype.snap = function() {
    if (this.lead) {
      var p = getAttractionPoint(this.lead.state);
      var coeff = 20;
      var dx = p.x - this.x;
      var dy = p.y - this.y;
      var x = this.dx + dx * coeff;
      var y = this.dy + dy * coeff;
      this.view.attr('transform', 'translate(' + x + ',' + y + ')');
      //coord for real probe coords
      this.x += dx;
      this.y += dy;
      this.dx = x;
      this.dy = y;
    }
  };

  primitive.probe.prototype.show = function() {
    this.css('visibility', 'visible');
  };

  primitive.probe.prototype.hide = function() {
    this.css('visibility', 'hidden');
  };

  primitive.mmbox = function(board, params) {
    this.view = board.holder.find('[info="multimeter"]');
    this.bttn = this.view.find('[info="dmm-bttn"]');
    this.over = this.view.find('[info="dmm-zoom"]');
    this.item = this.view.find('[info="dmm-box"]');
    this.help = this.view.find('[info="zoom-in"]');
    this.board = board;
    this.zoom = 0;
    // 0-normal view, not zoomed, 1-zoomed
    this.state = null;

    this.screen = this.view.find('[type="dmm-screen-digits"]').children('use');

    this.setState(this.model(params.dial || 0));

    var self = this;

    if (!touch) {
      this.view.bind('mouseenter', function() {
        if (!self.zoom) {
          self.help.show();
        }
      });
      this.view.bind('mouseleave', function() {
        self.help.hide();
        //self.zoomOut();
      });
    }

    // hover helps
    this.view.find('.help').each(function() {
      var elem = $(this);
      var usual = elem.find('.usual').show();
      var hover = elem.find('.hover').hide();
      var bttn = elem.find('.event');

      if (!touch) {
        bttn.bind('mouseenter', function() {
          usual.hide();
          hover.show();
        });
        bttn.bind('mouseleave', function() {
          hover.hide();
          usual.show();
        });
      }
    });

    this.view[0].addEventListener(_mousedown, function(evt) {
      if (!self.zoom) {
        self.zoomIn();
      }
      evt.stopPropagation();
      evt.preventDefault();
    }, false);
    board.holder[0].addEventListener(_mousedown, function(evt) {
      if (self.zoom) {
        self.zoomOut();
      }
    }, false);

    // bind events for bttn (tumbler)
    this.point_center = null;
    this.point_calibr = null;
    var tumbler_on = false;

    this.bttn[0].addEventListener(_mousedown, function(evt) {
      self.point_center = getAttractionPoint(self.view, 'point-center');
      self.point_calibr = getAttractionPoint(self.view, 'point-calibr');
      self.rotate(getCoords(evt, board.holder));
      tumbler_on = true;
    }, false);
    this.bttn[0].addEventListener(_mousemove, function(evt) {
      if (tumbler_on) {
        self.rotate(getCoords(evt, board.holder));
      }
    }, false);
    board.holder[0].addEventListener(_mouseup, function(evt) {
      self.point_center = null;
      self.point_calibr = null;
      tumbler_on = false;
    }, false);
  };

  primitive.mmbox.prototype.model = function(v) {
    var n = isNaN(parseInt(v, 10)) ? 1 : 0;
    var k, i, d, md = 360;
    var stack = [[0, 'acv_750'], [17, 'acv_200'], [35, 'p_9v'], [52, 'dca_200mc'], [70, 'dca_2000mc'], [88, 'dca_20m'], [105, 'dca_200m'], [122, 'c_10a'], [140, 'hfe'], [159, 'diode'], [178, 'r_200'], [196, 'r_2000'], [215, 'r_20k'], [233, 'r_200k'], [252, 'r_2000k'], [270, 'dcv_200m'], [288, 'dcv_2000m'], [306, 'dcv_20'], [324, 'dcv_200'], [342, 'dcv_1000']];
    if (!n) {
      v = parseInt(v, 10);
      for ( i = stack.length; i--; ) {
        d = Math.abs(stack[i][n] - v);
        if (d > 180) {
          d = 360 - d;
        }
        if (d < md) {
          md = d;
          k = i;
        }
      }
      v = stack[k][n];
    }
    for ( i = stack.length; i--; ) {
      if (stack[i][n] == v) {
        return stack[i];
      }
    }
  };

  primitive.mmbox.prototype.rotate = function(p) {
    var p1 = {
      'x' : (this.point_calibr.x - this.point_center.x),
      'y' : (this.point_calibr.y - this.point_center.y)
    };
    var p2 = {
      'x' : (p.x - this.point_center.x),
      'y' : (p.y - this.point_center.y)
    };
    var l1 = Math.sqrt(p1.x * p1.x + p1.y * p1.y);
    var l2 = Math.sqrt(p2.x * p2.x + p2.y * p2.y);

    var angle = getDegsFromRad(Math.acos((p1.x * p2.x + p1.y * p2.y) / (l1 * l2)));

    if (p2.x < 0) {
      angle = 360 - angle;
    }

    var model = this.model(angle);

    if (this.state != model[1]) {
      this.setState(model);
    }
  };

  primitive.mmbox.prototype.setState = function(state) {
    this.bttn.attr('transform', 'rotate(' + state[0] + ')');
    this.state = state[1];
    this.board.sendEventToModel("dmmDialMoved", [this.state]);
  };

  primitive.mmbox.prototype.zoomOut = function() {
    this.item.attr('transform', 'scale(0.50)');
    this.over.show();
    this.zoom = 0;
  };

  primitive.mmbox.prototype.zoomIn = function() {
    this.item.attr('transform', 'scale(1.00)');
    this.help.hide();
    this.over.hide();
    this.zoom = 1;
  };

  primitive.btbox = function(board) {
    var self = this;

    this.view = board.holder.find('[info="battery"]');

    this.view[0].addEventListener(_mouseup, function() {
      self.view.attr('transform', 'scale(1.5)');
      if (touch) {
        setTimeout(function() {
          self.view.attr('transform', 'scale(1)');
        }, 3000);
      }
    });
    this.view[0].addEventListener(_mouseout, function() {
      self.view.attr('transform', 'scale(1)');
    });
  };

  primitive.battery_wire = function(name, point) {
    this.view = SVGStorage.create('battery_wire_' + name).clone();
    this.view.attr('transform', 'translate('+ point.x +','+ point.y +') rotate(0,0,0)');
  };

  /* === #primitive end === */

  /* === #utils start === */

  var context2d = function() {
    return document.createElement('canvas').getContext('2d');
  };
  var addLeads = function(pts, angle, loc, name, drag, board) {
    var leads = ["right", "left"], angles = [];
    angles = ($.isArray(angle)) ? [angle[0], angle[1]] : [angle, angle];

    for (var i = 0; i < leads.length; i++) {
      leads[i] = new primitive.lead(leads[i], {
        x : pts[i].x,
        y : pts[i].y,
        hole : loc[i],
        name : name
      }, angles[i], drag);
      leads[i].board = board;
      leads[i].connect();
    }
    return leads;
  };
  var setConnectorView = function(elem, pts, deg) {
    // calc transforms
    var trn = 'translate(' + parseInt(pts[0].x, 10) + ',' + parseInt(pts[0].y, 10) + ') rotate(' + deg + ',130,130)';
    // calc path
    var leadLenght = 560, coeff = 0.6;
    var dx = pts[0].x - pts[1].x, dy = pts[0].y - pts[1].y;
    var l = Math.sqrt(dx * dx + dy * dy) - leadLenght * 2;
    var path = 'M 0 0 L ' + l / coeff + ' 0';
    if (l > 0) {
      elem.find('[drag=area]').attr('width', l / coeff);
    }
    // set view
    elem.attr('transform', trn);
    elem.find('[type=line]').each(function() {
      this.setAttribute('d', path);
    });
  };
  var calcLeadsBBox = function() {
    for (var i = this.itemslist.length; i--; ) {
      for (var j = this.itemslist[i].leads.length; j--; ) {
        this.itemslist[i].leads[j].calcbbox();
      }
    }
  };
  var findLeadUnderProbe = function(self, point) {
    for (var i = self.itemslist.length; i--; ) {
      for (var j = self.itemslist[i].leads.length; j--; ) {
        var lead = self.itemslist[i].leads[j];
        if (lead.hasPoint(point)) {
          return lead;
        }
      }
    }
    return false;
  };
  var findLeadPair = function(elem, lead) {
    return (elem.leads[0] === lead) ? elem.leads[1] : elem.leads[0];
  };
  var findNearestHole = function(p) {
    p.y = Math.round(p.y / 50) * 50;
    p.x = Math.round(p.x / 50) * 50;
    var yd, yu, xd, xu, x, y;
    yd = yu = p.y, xd = xu = p.x;
    // first, find neares row
    while (true) {
      if (this.row[yd]) {
        y = yd;
        break;
      }
      if (this.row[yu]) {
        y = yu;
        break;
      }
      yd += 50, yu -= 50;
    }
    // second, find nearest cell
    while (true) {
      if (this.row[y][xd]) {
        x = xd;
        break;
      }
      if (this.row[y][xu]) {
        x = xu;
        break;
      }
      xd += 50, xu -= 50;
    }
    // return result
    return this.row[y][x];
  };
  var getAttractionPoint = function(elem, name) {
    name = name || 'attraction';
    var point = elem.find('[type="'+name+'"]')[0];
    var matrix = point.getCTM();
    var bbox = point.getBBox();
    var p = SVGStorage.point();
    p.x = bbox.x + bbox.width / 2;
    p.y = bbox.y + bbox.height / 2;
    return p.matrixTransform(matrix);
  };
  var getAngleBetwPoints = function(pts) {
    return Math.atan2((pts[1].y - pts[0].y), (pts[1].x - pts[0].x));
  };
  var getDegsFromRad = function(rad) {
    return (180 / Math.PI) * rad;
  };
  var getCoords = function(evt, area) {
    evt = evt || window.event;
    var offset = area.offset();

    var posx = 0, posy = 0;

    if (evt.pageX || evt.pageY) {
      posx = evt.pageX;
      posy = evt.pageY;
    } else if (evt.clientX || evt.clientY) {
      posx = evt.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      posy = evt.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    if (evt.changedTouches) {
      posx = evt.changedTouches[0].pageX;
      posy = evt.changedTouches[0].pageY;
    }

    return {
      x : (parseInt(posx, 10) - offset.left),
      y : (parseInt(posy, 10) - offset.top)
    };
  };
  var getTransform = function(trns) {
    trns = trns.replace(/,/g, ' ');
    var name = trns.match(/^[^\(]*/)[0];
    trns = trns.match(/\([^\)]*\)/)[0];
    trns = trns.replace(/\(|\)/g, '');
    trns = trns.split(' ');
    for (var i = trns.length; i--; ) {
      trns[i] = parseFloat(trns[i], 10);
    }
    trns.name = name;
    return trns;
  };
  /* === #utils stop === */

  var SVGStorage = function(data) {
    var h = "data:image/svg+xml;base64,";
    var self = this, svg, a, b;

    // create all image data resources
    this.info = {
      'svghead': data.match(/<svg[^>]*>/)[0] ,
      'boardhl': new Image(),
      'svghole': ''
    };
    // board with holes
    a = data.search('<!-- breadboard start -->');
    b = data.search('<!-- breadboard end -->');
    svg += data.substring( (a + 25), b);
    a = data.search('<!-- breadboard defs holes start -->');
    b = data.search('<!-- breadboard defs holes end -->');
    svg += data.substring( (a + 36), b);
    svg = this.info.svghead + svg + '</svg>';
    this.info.boardhl.src = h + btoa(svg);
    this.info.svghole = svg;

    // create all jQuery DOM resources
    data = $(data);
    this.defs = {};
    this.view = {'board': data};
    data.find('[primitive]').each(function() {
      var elem = $(this), name = elem.attr('primitive');
      elem.removeAttr('primitive');
      self.view[name] = elem.remove();
    });
    // add info about holes
    this.hole = [];
    data.find('[id="$:hole_highlighted"]').each(function(){
      var c = $(this).children('circle');
      for (var i = 0, l = c.length; i < l; i++) {
        self.hole.push({
          'x': parseInt(c[i].getAttribute('cx'), 10),
          'y': parseInt(c[i].getAttribute('cy'), 10),
          'r': parseInt(c[i].getAttribute('r'), 10),
          'c': c[i].getAttribute('fill')
        });
      }
    });
    // set paper value
    paper = this.view.board;
  };

  SVGStorage.prototype.create = function(name) {
    return this.view[name].clone();
  };

  SVGStorage.prototype.point = function() {
    return this.view.board[0].createSVGPoint();
  };

  /* board object */

  var $ready = false;
  // flag, all critical objects built
  var $stack = [];
  // stack of callback functions

  // hack-ish to get sparks.js directory, and assume that common is at ../common from it
  var scripts = document.getElementsByTagName('script');
  var path = scripts[scripts.length-1].src.split('?')[0];      // remove any ?query
  var packageRoot = path.split('/').slice(0, -2).join('/')+'/';  // remove last folder and filename part of path

  board.util.require([packageRoot+"/common/images/sparks.breadboard.svg"], function(data) {
    // create base element
    SVGStorage = new SVGStorage(data["sparks.breadboard"]);
    // pre-cache all needed images
    var stack = SVGStorage.view.board.find('image[pre-cache]'), all = stack.length;
    // console.log('try cache '+all+' images');
    var cache = function(image) {
      var img = new Image();
      img.onload = function() {
        var opt = {
          'id': image.getAttribute('id'),
          'x': image.getAttribute('x'),
          'y': image.getAttribute('y')
        };
        check(img, opt);
      };
      img.src = image.getAttribute('xlink:href');
    };
    for (var i = 0; i < all; i++) {
      cache(stack[i]);
    }
    var check = function(img, opt) {
      var ctx = document.createElement('canvas').getContext('2d');
      ctx.canvas.height = img.height;
      ctx.canvas.width = img.width;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      SVGStorage.defs[opt.id] = ctx.canvas;
      SVGStorage.defs[opt.id].ox = opt.x;
      SVGStorage.defs[opt.id].oy = opt.y;
      if (!--all) {start_activity();}
    };

    // run callbacks, if have been signed
    var start_activity = function() {
      $ready = true;
      for (var i = 0, l = $stack.length; i < l; i++) {
        $stack[i]();
      }
    };

  });

  board.create = function(id) {
    return new CircuitBoard(id);
  };

  board.ready = function(callback) {
    if ($ready) {
      callback();
    } else {
      $stack.push(callback);
    }
  };

  board.clear = function(circuitBoard) {
    for (c in circuitBoard.component) {
      if (c == "battery") continue;
      circuitBoard.removeComponent(c);
    }
    circuitBoard.removeBattery();
    circuitBoard.removeDMM();
    circuitBoard.removeOScope();
  };

})(jQuery, window["breadboardSVGView"]);

},{"../controllers/workbench-controller":25,"../libs/base64":32,"../libs/canvg":33,"./svg_view_comm":44}],41:[function(require,module,exports){
var LogEvent      = require('../models/log'),
    logController = require('../controllers/log-controller'),
    unit          = require('../helpers/unit');

EditComponentsView = function(workbenchController, breadboardController){
  this.workbenchController = workbenchController;
  this.breadboardController = breadboardController;

  if (workbenchController.breadboardView) {
    workbenchController.breadboardView.setRightClickFunction(this, "showEditor");
  } else {  // queue it up
    workbenchController.workbench.view.setRightClickFunction(this, "showEditor");
  }
};

EditComponentsView.prototype = {

  showEditor: function(uid) {
    var comp = this.breadboardController.getComponents()[uid],
        section = this.workbenchController.workbench,
        $propertyEditor = null,
        self = this;
    // create editor tooltip
    possibleValues = comp.getEditablePropertyValues();

    componentValueChanged = function (evt, ui) {
      var val = possibleValues[ui.value],
          eng = unit.toEngineering(val, comp.editableProperty.units);
      $(".prop_value_"+uid).text(eng.value + eng.units);
      comp.changeEditableValue(val);
      logController.addEvent(LogEvent.CHANGED_CIRCUIT, {
        "type": "changed component value",
        "UID": comp.UID,
        "value": val,
        "via": evt.originalEvent ? evt.originalEvent.type || 'n/a' : 'n/a'
      });
      section.meter.update();
    }

    componentValueFinished = function (evt, ui) {
      if (evt.originalEvent && (evt.originalEvent.type == 'mouseup')) {
        logController.addEvent(LogEvent.CHANGED_CIRCUIT, {
          "type": "changed component value",
          "UID": comp.UID,
          "value": possibleValues[ui.value],
          "via": evt.originalEvent.type
        });
      }
    }

    if (comp.isEditable) {
      propertyName = comp.editableProperty.name.charAt(0).toUpperCase() + comp.editableProperty.name.slice(1);
      initialValue = comp[comp.editableProperty.name];
      initialValueEng = unit.toEngineering(initialValue, comp.editableProperty.units);
      initialValueText = initialValueEng.value + initialValueEng.units;
      $propertyEditor = $("<div>").append(
        $("<div>").slider({
          max: possibleValues.length-1,
          slide: componentValueChanged,
          stop: componentValueFinished,
          value: possibleValues.indexOf(initialValue)
        })
      ).append(
        $("<div>").html(
          propertyName + ": <span class='prop_value_"+uid+"'>"+initialValueText+"</span>"
          )
      );
    }

    $editor = $("<div class='editor'>").append(
      $("<h3>").text("Edit "+comp.componentTypeName)
    ).append(
      $propertyEditor
    ).css( { width: 130, textAlign: "right" } );

    // only allow removes when the components can be added back
    if (this.workbenchController.workbench.showComponentDrawer) {
      $editor.append(
        $("<button>").text("Remove").on('click', function() {
          self.breadboardController.removeComponent(comp);
          section.meter.update();
          $(".speech-bubble").trigger('mouseleave');
        })
      )
    }

    this.workbenchController.breadboardView.showTooltip(uid, $editor);
  }

};

module.exports = EditComponentsView;

},{"../controllers/log-controller":24,"../helpers/unit":29,"../models/log":35}],42:[function(require,module,exports){
/*globals sparks Raphael*/

var mathParser  = require('../helpers/math-parser'),
    unit        = require('../helpers/unit'),
    util        = require('../helpers/util');

FunctionGeneratorView = function (functionGenerator) {
  this.$view          = null;
  this.model          = functionGenerator;
  this.frequencies    = [];
  this.currentFreqString = "";
  this.freqValueViews = [];
  this.popup = null;
};

FunctionGeneratorView.prototype = {

  width:    200,
  height:   100,
  nMinorTicks:      5,

  faceplateColor:   '#EEEEEE',

  getView: function () {
    this.$view = $('<div>');

    $("#fg_value").remove();
    $freq_value = $("<span class='fg_value'></span").appendTo(this.$view);
    this.freqValueViews.push($freq_value);

    this.frequencies = this.model.getPossibleFrequencies();
    this.setFrequency(this.model.frequency);

    $overlayDiv = $('<div class="fg_mini_overlay"></div>').appendTo(this.$view);
    var self = this;
    $overlayDiv.click(function(){
      self.openPopup();
    })

    return this.$view;
  },

  openPopup: function () {
    if (!this.popup) {
      $view = this.getLargeView();
      this.popup = $view.dialog({
        width: this.width + 10,
        height: this.height+49,
        dialogClass: 'tools-dialog fg_popup',
        title: "Function Generator",
        closeOnEscape: false,
        resizable: false,
        autoOpen: false
      });
    }

    var self = this;
    this.popup.bind('remove', function() {
      self.popup = null;
    });

    var scrollPosition = [
      self.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
      self.pageYOffset || document.documentElement.scrollTop  || document.body.scrollTop
    ];

    this.popup.dialog('open').dialog("widget").position({
       my: 'left top',
       at: 'left top',
       offset: '5, 5',
       of: $(".breadboard")
    });

    window.scrollTo(scrollPosition[0], scrollPosition[1]);
  },

  getLargeView: function () {
    var $canvasHolder,
        self = this;

    this.$view = $('<div>');
    this.$view.css({
      position: 'relative',
      width: this.width,
      height: this.height
    });

    // 'faceplate'
    this.$faceplate = $('<div class="function_generator">').css({
      position: 'absolute',
      left: 0,
      right: 0,
      height: this.height
    }).appendTo(this.$view);

    $freq_value = $('<p class="freq_value">'+this.currentFreqString+'</p>').css({
      position:  'absolute',
      top:       15,
      left:      15,
      height:    20,
      textAlign: 'center'
    }).appendTo(this.$faceplate);

    this.freqValueViews.push($freq_value);

    this.$controls = $('<div class="controls">').css({
      position: 'absolute',
      top:      28,
      left:     0,
      height:   70
    }).appendTo(this.$faceplate);

    this.$frequency = $('<div>').css({
      position:  'absolute',
      top:       12,
      left:      10,
      width:     150,
      height:    55
    }).appendTo(this.$controls);

    var freqs = this.frequencies;
    var initialStep = util.getClosestIndex(freqs, this.model.frequency, false);
    this._addSliderControl(this.$frequency, freqs.length, initialStep, function (evt, ui) {
      var i = ui.value;
      if (i < 0) i = 0;
      if (i > freqs.length-1) i = freqs.length-1;
      var freq = freqs[i];
      self.model.setFrequency(freq);
      self.setFrequency(freq);
    });

    $('<span>Frequency</span>').css({
      position:  'absolute',
      top:       43,
      left:      45,
      width:     100,
      height:    15
    }).appendTo(this.$controls);

    if (this.model.maxAmplitude){
      this.$amplitude = $('<div>').css({
        position: 'absolute',
        top:      35,
        left:     10,
        width:    150,
        height:   55
      }).appendTo(this.$controls);

      var minAmp = this.model.minAmplitude,
          maxAmp = this.model.maxAmplitude,
          amplitude = this.model.amplitude,
          range = maxAmp - minAmp,
          steps = 30,
          value = ((amplitude - minAmp) / range) * steps;
      this._addSliderControl(this.$amplitude, steps, value, function (evt, ui) {
        var i = ui.value;
        if (i < 0) i = 0;
        if (i > steps) i = steps;
        var amp = ((i / steps) * range) + minAmp;
        self.model.setAmplitude(amp);
      });

      $('<span>Amplitude</span>').css({
        position: 'absolute',
        top:    66,
        left:   45,
        right:  100,
        height: 15,
        textAlign: 'center'
      }).appendTo(this.$controls);
    }

    return this.$view;
  },

  setFrequency: function (freq) {
    currentFreqString = this.currentFreqString = mathParser.standardizeUnits(unit.convertMeasurement(freq + " Hz"));
    this.freqValueViews.forEach(function($view){$view.text(currentFreqString);});
    return this.currentFreqString;
  },

  _addSliderControl: function ($el, steps, value, callback) {
    $slider = $("<div class='fg_slider'>").css({
      position: 'absolute',
      top:   25,
      left:  10,
      right: 10
    }).slider({ max: steps, slide: callback, value: value }).appendTo($el);
  }
};

module.exports = FunctionGeneratorView;

},{"../helpers/math-parser":26,"../helpers/unit":29,"../helpers/util":30}],43:[function(require,module,exports){
require('../../bower_components/raphael/raphael-min');
var sparksMath = require('../helpers/sparks-math');

OscilloscopeView = function () {
  this.$view         = null;
  this.miniRaphaelCanvas = null;
  this.raphaelCanvas = null;
  this.miniTraces    = [];
  this.traces        = [];
  this.model         = null;
  this.popup         = null;
};

OscilloscopeView.prototype = {

  // Note that sizing and placement of the various elements of the view are handled ad-hoc in the getView() method;
  // however, this.width and this.height indicate the dimensions of the gridded area where traces are drawn.
  miniViewConfig: {
    width: 132,
    height: 100,
    tickSize: 2
  },

  largeViewConfig: {
    width:    400,
    height:   320,
    tickSize: 3
  },

  // These define the grid aka 'graticule'. This is pretty standard for scopes.
  nVerticalMarks:   8,
  nHorizontalMarks: 10,
  nMinorTicks:      5,

  faceplateColor:   '#EEEEEE',
  displayAreaColor: '#324569',
  traceBgColor:     '#324569',
  tickColor:        '#9EBDDE',
  textColor:        '#D8E1EB',
  traceOuterColors: ['#FFFF4A', '#FF5C4A', '#33FF33'],
  traceInnerColors: ['#FFFFFF', '#FFD3CF', '#EEFFEE'],
  traceLabelColors: ['#FFFF99', '#FC8F85', '#99FC7B'],
  // The famed "MV" pattern...
  setModel: function (model) {
    this.model = model;
  },

  getView: function () {
    var $canvasHolder,
        self = this,
        conf = this.miniViewConfig;

    this.$view = $('<div>');
    this.$view.css({
      position: 'relative',
      width: conf.width+160,
      height: conf.height+40
    });


    // display area (could split this out into separate method, though not a separate view
    this.$displayArea = $('<div class="display-area">').css({
      position: 'absolute',
      top: 14,
      left: 19,
      width:    conf.width,
      height:   conf.height,
      backgroundColor: this.displayAreaColor
    }).appendTo(this.$view);

    $canvasHolder = $('<div class="raphael-holder">').css({
      position: 'absolute',
      top:  0,
      left: 0,
      backgroundColor: this.traceBgColor
    }).appendTo(this.$displayArea);

    this.miniRaphaelCanvas = Raphael($canvasHolder[0], conf.width, conf.height);

    this.drawGrid(this.miniRaphaelCanvas, conf);

    $overlayDiv = $('<div class="oscope_mini_overlay"></div>').appendTo(this.$view);

    $overlayDiv.click(function(){
      self.openPopup();
    });
    return this.$view;
  },

  openPopup: function () {
    if (!this.popup) {
      $view = this.getLargeView();
      this.renderSignal(1, true);
      this.renderSignal(2, true);
      this.popup = $view.dialog({
        width: this.largeViewConfig.width + 149,
        height: this.largeViewConfig.height + 97,
        dialogClass: 'tools-dialog oscope_popup',
        title: "Oscilloscope",
        closeOnEscape: false,
        resizable: false,
        autoOpen: false
      });
    }

    var self = this;

    var scrollPosition = [
      self.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
      self.pageYOffset || document.documentElement.scrollTop  || document.body.scrollTop
    ];

    this.popup.dialog('open').dialog("widget").position({
       my: 'left top',
       at: 'center top',
       of: $(".breadboard")
    });

    window.scrollTo(scrollPosition[0], scrollPosition[1]);

    $('.ui-dialog').bind('remove', function() {
      self.popup = null;
    });
  },

  /**
    @returns $view A jQuery object containing a Raphael canvas displaying the oscilloscope traces.

    Sets this.$view to be the returned jQuery object.
  */
  getLargeView: function () {
    var $canvasHolder,
        self = this,
        conf = this.largeViewConfig;

    this.$view = $('<div>');
    this.$view.css({
      position: 'relative',
      width: conf.width,
      height: conf.height
    });


    // display area (could split this out into separate method, though not a separate view
    this.$displayArea = $('<div class="display-area">').css({
      position: 'absolute',
      top: 25,
      left: 18,
      width:    conf.width + 6,
      height:   conf.height + 30,
      backgroundColor: this.displayAreaColor
    }).appendTo(this.$view);

    $canvasHolder = $('<div class="raphael-holder">').css({
      position: 'absolute',
      top:  5,
      left: 7,
      width:    conf.width,
      height:   conf.height,
      backgroundColor: this.traceBgColor
    }).appendTo(this.$displayArea);

    // add drag handler to canvasHolder
    $canvasHolder
      .drag(function( ev, dd ){
        var viewWidth   = this.getBoundingClientRect().width,
            perc        = dd.deltaX / viewWidth,
            phaseOffset = (-2*Math.PI) * perc;

        self.renderSignal(1, false, phaseOffset);
        self.renderSignal(2, false, phaseOffset);
      })
      .drag("dragend", function (ev, dd) {
        var viewWidth   = this.getBoundingClientRect().width,
            perc        = dd.deltaX / viewWidth,
            phaseOffset = (-2*Math.PI) * perc;

        self.previousPhaseOffset += phaseOffset;
      });

    this.raphaelCanvas = Raphael($canvasHolder[0], conf.width, conf.height);

    this.drawGrid(this.raphaelCanvas, conf);

    $('<p id="cha"><span class="chname">CHA</span> <span class="vscale channel1"></span>V</p>').css({
      position: 'absolute',
      top:   10 + conf.height,
      left:  5,
      color: this.traceLabelColors[0]
    }).appendTo(this.$displayArea);

    $('<p id="chb"><span class="chname">CHB</span> <span class="vscale channel2"></span>V</p>').css({
      position: 'absolute',
      top:   10 + conf.height,
      left:  5 + conf.width / 4,
      color: this.traceLabelColors[1]
    }).appendTo(this.$displayArea);

    $('<p>M <span class="hscale"></span>s</p>').css({
      position: 'absolute',
      top:   10 + conf.height,
      left:  5 + (conf.width*3)/4,
      color: this.textColor
    }).appendTo(this.$displayArea);


    // 'faceplate'
    this.$faceplate = $('<div class="faceplate">').css({
      position: 'absolute',
      left:   conf.width + 27,
      top: 15,
      backgroundColor: 'none',
      width: 122,
      height: 364,
      overflow: 'hidden'
    }).appendTo(this.$view);

    this.$controls = $('<div>').css({
      position: 'absolute',
      top:      30,
      left:     0,
      right:    0,
      height:   200
    }).appendTo(this.$faceplate);

    $('<p class="oscope-label">volts/div</p>').css({
      top:       -33,
      left:      14,
      right:     0,
      height:    20,
      position: 'absolute'
    }).appendTo(this.$controls);

    this.$channel1 = $('<div class="channelA">').css({
      position:  'absolute',
      top:       19,
      left:      11,
      width:     122,
      height:    100
    }).appendTo(this.$controls);

    $('<p>CH A</p>').css({
      top:       -2,
      left:      -2,
      right:     0,
      height:    20,
      textAlign: 'center',
      position:  'absolute'
    }).appendTo(this.$channel1);

    this._addScaleControl(this.$channel1, function () {
      self.model.bumpVerticalScale(1, -1);
    }, function () {
      self.model.bumpVerticalScale(1, 1);
    });

    this.$channel2 = $('<div>').css({
      position: 'absolute',
      top:      121,
      left:     11,
      width:    122,
      height:   100
    }).appendTo(this.$controls);

    $('<p>CH B</p>').css({
      top:    -2,
      left:   -2,
      right:  0,
      height: 20,
      textAlign: 'center',
  position: 'absolute'
    }).appendTo(this.$channel2);

    this._addScaleControl(this.$channel2, function () {
      self.model.bumpVerticalScale(2, -1);
    }, function () {
      self.model.bumpVerticalScale(2, 1);
    });

    $('<p class="oscope-label">time/div</p>').css({
      top:       179,
      left:      16,
      right:     0,
      height:    20,
      position:  'absolute'
    }).appendTo(this.$controls);

    this.$horizontal = $('<div>').css({
      position:  'absolute',
      top:       229,
      left:      11,
      width:     122,
      height:    100
    }).appendTo(this.$controls);

    this._addScaleControl(this.$horizontal, function () {
      self.model.bumpHorizontalScale(-1);
    }, function () {
      self.model.bumpHorizontalScale(1);
    });

    this.horizontalScaleChanged();
    for (i = 1; i <= this.model.N_CHANNELS; i++) {
      this.verticalScaleChanged(i);
    }

    $('<button id="AminusB" class="comboButton">A-B</button>').css({
      top:       298,
      left:      33,
      height:    23,
      width:     36,
      fontSize:  12,
      position:  'absolute'
    }).click(function(){
      self._toggleComboButton(true);
    }).appendTo(this.$controls);

    $('<button id="AplusB" class="comboButton">A+B</button>').css({
      top:       298,
      left:      74,
      height:    23,
      width:     36,
      fontSize:  12,
      position:  'absolute'
    }).click(function(){
      self._toggleComboButton(false);
    }).appendTo(this.$controls);



    // for testing the goodnessOfScale measurement
    $('<p class="goodnessOfScale"></p>').css({
      top:       229,
      left:      55,
      right:     0,
      height:    20,
      position:  'absolute'
    }).appendTo(this.$controls);

    return this.$view;
  },

_toggleComboButton: function (isAminusB) {
  if (isAminusB) {
      this.model.toggleShowAminusB();
  } else {
      this.model.toggleShowAplusB();
  }

  // force-render both signals to make them dim/brighten. Rendering these will
  // automatically call the rendering of the combo trace if applicable
  this.renderSignal(1, true, this.previousPhaseOffset);
  this.renderSignal(2, true, this.previousPhaseOffset);


  $('.comboButton').removeClass('active');

  $('.channelA button').addClass('active')

  if (this.model.showAminusB) {
    $('#AminusB').addClass('active');
  } else if (this.model.showAplusB) {
    $('#AplusB').addClass('active');
  } else {
    $('.channelA button').removeClass('active');
  }
},

  _addScaleControl: function ($el, minusCallback, plusCallback) {
    $('<button>+</button>').css({
      position: 'absolute',
      top:   25,
      left:  25,
      width: 30
    }).click(plusCallback).appendTo($el);

    $('<button>&mdash;</button>').css({
      position: 'absolute',
      top:   25,
      right: 25,
      width: 30
    }).click(minusCallback).appendTo($el);
  },

  previousPhaseOffset: 0,

  renderSignal: function (channel, forced, _phaseOffset) {
    var s = this.model.getSignal(channel),
        t = this.traces[channel],
        horizontalScale,
        verticalScale,
        phaseOffset = (_phaseOffset || 0) + this.previousPhaseOffset,
        isComboActive = (this.model.showAminusB || this.model.showAplusB);

    if (s) {
      horizontalScale = this.model.getHorizontalScale();
      verticalScale   = isComboActive? this.model.getVerticalScale(1) : this.model.getVerticalScale(channel);

      // don't render the signal if we've already drawn it at the same scale
      if (!t || forced || (t.amplitude !== s.amplitude || t.frequency !== s.frequency || t.phase !== (s.phase + phaseOffset) ||
                 t.horizontalScale !== horizontalScale || t.verticalScale !== verticalScale)) {
        this.removeTrace(channel);
        this.traces[channel] = {
          amplitude:          s.amplitude,
          frequency:          s.frequency,
          phase:              (s.phase + phaseOffset),
          horizontalScale:    horizontalScale,
          verticalScale:      verticalScale,
          raphaelObjectMini:  this.drawTrace(this.miniRaphaelCanvas, this.miniViewConfig, s, channel, horizontalScale, verticalScale, phaseOffset, isComboActive),
          raphaelObject:      this.drawTrace(this.raphaelCanvas, this.largeViewConfig, s, channel, horizontalScale, verticalScale, phaseOffset, isComboActive)
        };
      }

      // Make sure channel 2 is always in front
      if (channel === 1 && this.traces[2]) {
        if (!!this.traces[2].raphaelObjectMini) this.traces[2].raphaelObjectMini.toFront();
        if (!!this.traces[2].raphaelObject) this.traces[2].raphaelObject.toFront();
      }

      // testing goodness of scale
      if (sparks.testOscopeScaleQuality) {
        var g = this.model.getGoodnessOfScale();
        console.log(g)
        var g0 = sparksMath.roundToSigDigits(g[0] ? g[0] : -1,4),
            g1 = sparksMath.roundToSigDigits(g[1] ? g[1] : -1,4)
        $(".goodnessOfScale").html("["+g0+","+g1+"]");
      }
    }
    else {
      this.removeTrace(channel);
    }
    this.renderComboTrace(phaseOffset);
  },

  renderComboTrace: function (phaseOffset) {
    this.removeTrace(3);
    if ((this.model.showAminusB || this.model.showAplusB) && this.model.getSignal(1) && this.model.getSignal(2)) {
      var a  = this.model.getSignal(1),
          b  = this.model.getSignal(2),
          bPhase = this.model.showAplusB ? b.phase : (b.phase + Math.PI),     // offset b's phase by Pi if we're subtracting
          rA = a.amplitude * Math.sin(a.phase),
          iA = a.amplitude * Math.cos(a.phase),
          rB = b.amplitude * Math.sin(bPhase),
          iB = b.amplitude * Math.cos(bPhase),
          combo = {
              amplitude: Math.sqrt(Math.pow(rA+rB, 2) + Math.pow(iA+iB, 2)),
              phase: Math.atan((rA+rB) / (iA+iB)) + phaseOffset + ((iA+iB) < 0 ? Math.PI : 0),
              frequency: a.frequency
          };
      this.traces[3] = {
          raphaelObjectMini: this.drawTrace(this.miniRaphaelCanvas, this.miniViewConfig, combo, 3, this.model.getHorizontalScale(), this.model.getVerticalScale(1), 0),
          raphaelObject: this.drawTrace(this.raphaelCanvas, this.largeViewConfig, combo, 3, this.model.getHorizontalScale(), this.model.getVerticalScale(1), 0)
      };
      $('#cha .chname').html(this.model.showAminusB? "A-B" : "A+B");
      $('#cha').css({color: this.traceLabelColors[2]});
    } else {
      $('#cha .chname').html("CHA");
      $('#cha').css({color: this.traceLabelColors[0]});
    }
  },

  removeTrace: function (channel) {
    if (this.traces[channel]) {
      if (this.traces[channel].raphaelObjectMini) this.traces[channel].raphaelObjectMini.remove();
      if (this.traces[channel].raphaelObject) this.traces[channel].raphaelObject.remove();
      delete this.traces[channel];
    }
    if (channel !== 3) {
      this.renderComboTrace(this.previousPhaseOffset);
    }
  },

  // Not moved to sparksMath because it's somewhat specialized for scope display
  humanizeUnits: function (val) {
    var prefixes  = ['M', 'k', '', 'm', 'μ', 'n', 'p'],
        order     = Math.floor(Math.log10(val) + 0.01),    // accounts for: Math.log10(1e-6) = -5.999999999999999
        rank      = Math.ceil(-1 * order / 3),
        prefix    = prefixes[rank+2],
        scaledVal = val * Math.pow(10, rank * 3),

        // Make sure the result has sensible digits ... values in range 1.00 .. 5.00 of whatever unit
        // (e.g, s, ms, μs, or ns) get 2 digits after the decimal point; values in range 10.0 .. 50.0 get 1 digit

        decimalPlaces = order % 3 >= 0 ? 2 - (order % 3) : -1 * ((order + 1) % 3);

    return scaledVal.toFixed(decimalPlaces) + prefix;
  },

  horizontalScaleChanged: function () {
    var scale = this.model.getHorizontalScale(),
        channel;

    // TODO make the units a little more sophisticated.
    this.$view.find('.hscale').html(this.humanizeUnits(scale));

    for (channel = 1; channel <= this.model.N_CHANNELS; channel++) {
      if (this.traces[channel]) this.renderSignal(channel);
    }
  },

  verticalScaleChanged: function (channel) {
    var scale = this.model.getVerticalScale(channel);

    this.$view.find('.vscale.channel'+channel).html(this.humanizeUnits(scale));
    if (this.traces[channel]) this.renderSignal(channel);
  },

  drawGrid: function (r, conf) {
    var path = [],
        x, dx, y, dy;

    for (x = dx = conf.width / this.nHorizontalMarks; x <= conf.width - dx; x += dx) {
      path.push('M');
      path.push(x);
      path.push(0);

      path.push('L');
      path.push(x);
      path.push(conf.height);
    }

    for (y = dy = conf.height / this.nVerticalMarks; y <= conf.height - dy; y += dy) {
      path.push('M');
      path.push(0);
      path.push(y);

      path.push('L');
      path.push(conf.width);
      path.push(y);
    }

    y = conf.height / 2;

    for (x = dx = conf.width / (this.nHorizontalMarks * this.nMinorTicks); x <= conf.width - dx; x += dx) {
      path.push('M');
      path.push(x);
      path.push(y-conf.tickSize);

      path.push('L');
      path.push(x);
      path.push(y+conf.tickSize);
    }

    x = conf.width / 2;

    for (y = dy = conf.height / (this.nVerticalMarks * this.nMinorTicks); y <= conf.height - dy; y += dy) {
      path.push('M');
      path.push(x-conf.tickSize);
      path.push(y);

      path.push('L');
      path.push(x+conf.tickSize);
      path.push(y);
    }

    return r.path(path.join(' ')).attr({stroke: this.tickColor, opacity: 0.5});
  },

  drawTrace: function (r, conf, signal, channel, horizontalScale, verticalScale, phaseOffset, _isFaint) {
    if (!r) return;
    var path         = [],
        height       = conf.height,
        h            = height / 2,

        overscan     = 5,                       // how many pixels to overscan on either side (see below)
        triggerStart = conf.width / 2,          // horizontal position at which the rising edge of a 0-phase signal should cross zero

        // (radians/sec * sec/div) / pixels/div  => radians / pixel
        radiansPerPixel = (2 * Math.PI * signal.frequency * horizontalScale) / (conf.width / this.nHorizontalMarks),

        // pixels/div / volts/div => pixels/volt
        pixelsPerVolt = (conf.height / this.nVerticalMarks) / verticalScale,

        isFaint = _isFaint || false,
        opacity = isFaint ? 0.3 : 1,

        x,
        raphaelObject,
        paths,
        i;

    // if we try and display too many waves on the screen (high radiansPerPixel) we end up with strange effects,
    // like beats or flat lines. Cap radiansPerPixel to Pi/2, which displays a solid block.
    if (radiansPerPixel > Math.PI / 2) radiansPerPixel = Math.PI / 2;

    function clip(y) {
      return y < 0 ? 0 : y > height ? height : y;
    }

    for (x = 0; x < conf.width + overscan * 2; x++) {
      path.push(x ===  0 ? 'M' : 'L');
      path.push(x);

      // Avoid worrying about the odd appearance of the left and right edges of the trace by "overscanning" the trace
      // a few pixels to either side of the scope window; we will translate the path the same # of pixels to the
      // left later. (Done this way we don't have negative, i.e., invalid, x-coords in the path string.)
      path.push(clip(h - signal.amplitude * pixelsPerVolt * Math.sin((x - overscan - triggerStart) * radiansPerPixel + (signal.phase + phaseOffset))));
    }
    path = path.join(' ');

    // slight 3d effect (inspired by CRT scopes) by overlaying a thin, oversaturated line over a fatter colored line
    paths = [];
    paths.push(r.path(path).attr({stroke: this.traceOuterColors[channel-1], 'stroke-width': 4.5, opacity: opacity}));
    paths.push(r.path(path).attr({stroke: this.traceInnerColors[channel-1], 'stroke-width': 2, opacity: opacity}));

    raphaelObject = r.set.apply(r, paths);

    // translate the path to the left to accomodate the overscan
    raphaelObject.translate(-1 * overscan, 0);

    return raphaelObject;
  }

};

module.exports = OscilloscopeView;


},{"../../bower_components/raphael/raphael-min":4,"../helpers/sparks-math":28}],44:[function(require,module,exports){
/*globals console sparks $ document window alert navigator*/
var LogEvent            = require('../models/log'),
    util                = require('../helpers/util'),
    sound               = require('../helpers/sound'),
    logController       = require('../controllers/log-controller');

breadboardComm = {};

breadboardComm.openConnections = {};

breadboardComm.connectionMade = function(workbenchController, component, hole) {
  var workbench = workbenchController.workbench,
      breadboardController = workbenchController.breadboardController,
      comp, openConnections, openConnectionsArr, connectionReturning, connection;

  if (!!hole){
    openConnections = breadboardComm.openConnections[component];
    if (!openConnections) return; // shouldn't happen

    if (openConnections[hole]) {        // if we're just replacing a lead
      breadboardController.unmapHole(hole);
      delete openConnections[hole];
    } else {                            // if we're putting lead in new hole
      comp = breadboardController.getComponents()[component];
      // transform to array
      openConnectionsArr = util.getKeys(openConnections);
      // pick first open lead
      connectionReturning = openConnectionsArr[0];
      breadboardController.unmapHole(connectionReturning);
      //swap
      for (var i = 0; i < comp.connections.length; i++) {
        connection = comp.connections[i].getName();
        if (connection === connectionReturning) {
          comp.connections[i] = breadboardController.getHole(hole);
          delete openConnections[connection];
          workbench.meter.moveProbe(connection, hole);
          break;
        }
      }

      // check that we don't have two leads to close together
      breadboardController.checkLocation(comp);
    }

  }
  logController.addEvent(LogEvent.CHANGED_CIRCUIT, {
    "type": "connect lead",
    "location": hole
  });
  workbench.meter.update();
};

breadboardComm.connectionBroken = function(workbenchController, component, hole) {
  var workbench = workbenchController.workbench,
      breadboardController = workbenchController.breadboardController;
  if (!breadboardComm.openConnections[component]) {
    breadboardComm.openConnections[component] = {}
  }
  breadboardComm.openConnections[component][hole] = true;

  var newHole = breadboardController.getGhostHole(hole+"ghost");

  breadboardController.mapHole(hole, newHole.nodeName());
  logController.addEvent(LogEvent.CHANGED_CIRCUIT, {
    "type": "disconnect lead",
    "location": hole});
  workbench.meter.update();
};

breadboardComm.probeAdded = function(workbenchController, meter, color, location) {
  workbenchController.workbench.meter.setProbeLocation("probe_"+color, location);
  sound.play(sound.click)
  logController.addEvent(LogEvent.ATTACHED_PROBE, {
    "color": color,
    "location": location
  });
};

breadboardComm.probeRemoved = function(workbenchController, meter, color) {
  workbenchController.workbench.meter.setProbeLocation("probe_"+color, null);
  logController.addEvent(LogEvent.DETACHED_PROBE, {
    "color": color,
    "location": location
  });
};

breadboardComm.dmmDialMoved = function(workbenchController, value) {
  workbenchController.workbench.meter.dmm.dialPosition = value;
  workbenchController.workbench.meter.update();
  logController.addEvent(LogEvent.MOVED_DMM_DIAL, {
    "value": value
  });
};

module.exports = breadboardComm;

},{"../controllers/log-controller":24,"../helpers/sound":27,"../helpers/util":30,"../models/log":35}],45:[function(require,module,exports){
require('./breadboard-svg-view');

var AddComponentsView     = require('./add-components-view'),
    EditComponentsView    = require('./edit-components-view'),
    FunctionGeneratorView = require('./function-generator-view'),
    OscilloscopeView      = require('./oscilloscope-view'),
    sound                 = require('../helpers/sound'),
    workbenchController;

WorkbenchView = function(workbench, breadboardController){
  workbenchController   = require('../controllers/workbench-controller');     // grrr
  this.breadboardController = breadboardController;
  this.workbench = workbench;
};

WorkbenchView.prototype = {
  layout: function(elId) {
    this.container = document.getElementById(elId);

    if (!this.container) {
      throw new Error("No DOM element found with the id "+elId);
    }

    if (this.container.classList)
      this.container.classList.add("breadboard_container");
    else
      this.container.className += ' ' + "breadboard_container";

    this.divs = {
      breadboard:       this.getOrCreateDiv('breadboard'),
      scope:            this.getOrCreateDiv('oscope_mini'),
      fg:               this.getOrCreateDiv('fg_mini', true),
      addCompsWrapper:  this.getOrCreateDiv('add_components')
    };

    var self = this;
    breadboardSVGView.ready(function() {
      if (workbenchController.breadboardView) {
        breadboardSVGView.clear(workbenchController.breadboardView);
      } else {
        self.divs.breadboard.html('');
        workbenchController.breadboardView = breadboardSVGView.create("breadboard");
      }

      // pass queued-up component right-click function to breadboard view
      if (self.rightClickFunction) {
        workbenchController.breadboardView.setRightClickFunction(self.rightClickObj, self.rightClickFunction);
      }

      self.breadboardController.updateView();

      sound.mute = true;

      self.showDMM(self.workbench.show_multimeter);
      self.showOScope(self.workbench.show_oscilloscope);
      // self.allowMoveYellowProbe(self.workbench.allow_move_yellow_probe);
      // self.hidePinkProbe(self.workbench.hide_pink_probe);

      sound.mute = false;

      self.workbench.meter.update();
    });

    var source = this.breadboardController.getComponents().source;
    if (source && source.frequency && !source.hidden) {
      var fgView = new FunctionGeneratorView(source);
      var $fg = fgView.getView();
      this.divs.fg.append($fg);
      this.divs.fg.show();
    }
    this.workbench.meter.reset();

    if (this.workbench.showComponentDrawer || this.workbench.showComponentEditor) {
      this.editComponentsView = new EditComponentsView(workbenchController, this.breadboardController);
    }

    if (this.workbench.showComponentDrawer) {
      var drawer = $('<div class="component_drawer retracted"></div>'),
          button = $('<button class="add_components_btn">Add a new Component</button>');

      this.divs.addCompsWrapper.append(drawer);
      this.divs.addCompsWrapper.append(button);

      var addComponentsView = new AddComponentsView(workbenchController, this.breadboardController);

      if (this.workbench.showComponentDrawer) {
        this.divs.addCompsWrapper.show();
        button.off();
        button.on('click', addComponentsView.openPane);
      }
    }
  },

  showOScope: function(visible) {
    this.divs.scope.html('');

    if (visible) {
     var scopeView = new OscilloscopeView();
     var $scope = scopeView.getView();
     this.divs.scope.append($scope);
     this.divs.scope.show();
     this.workbench.meter.oscope.setView(scopeView);

     workbenchController.breadboardView.addOScope({
          "yellow":{
          "connection": "left_positive21",
          "draggable": true
        },"pink": {
          "connection": "f22",
          "draggable": true
        }
      });
    }
  },

  showDMM: function(visible) {
    if (visible) {
      workbenchController.breadboardView.addDMM({
          "dial": "dcv_20",
          "black":{
          "connection": "g12",
          "draggable": true
        },"red": {
          "connection": "f3",
          "draggable": true
        }
      });
    }
  },

  allowMoveYellowProbe: function() {
  },

  hidePinkProbe: function() {
  },

  setRightClickFunction: function(obj, func) {
    this.rightClickObj = obj;
    this.rightClickFunction = func;
  },

  getOrCreateDiv: function(clazz, hide) {
    $el = $(this.container).find('.'+clazz);
    if (!$el.length)
      $el = $('<div class="'+clazz+'"></div>').appendTo(this.container);
    if (hide) $el.hide();
    return $el;
  },

  showComponentEditor: function(id) {
    this.editComponentsView.showEditor(id);
  }
}

module.exports = WorkbenchView;

},{"../controllers/workbench-controller":25,"../helpers/sound":27,"./add-components-view":39,"./breadboard-svg-view":40,"./edit-components-view":41,"./function-generator-view":42,"./oscilloscope-view":43}]},{},[31])(31)
});