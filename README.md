<a name="top"></a>


  <h1>Coddoc</h1>

<h2> Description</h2>
<p>
    coddoc is a jsdoc parsing library. Coddoc is different in that it is easily extensible by allowing users to
    add tag and code parsers through the use of <a href='# coddoc_addTagHandler'> coddoc.addTagHandler</a> and <a href='# coddoc_addCodeHandler'> coddoc.addCodeHandler</a>.
    coddoc also parses source code to be used in APIs.
</p>

<p>
    Coddoc also supports the generation of markdown and html through the use of different templates. Currently
    the templates use <a href="http://handlebarsjs.com/">Handlebars</a> but you may use any templating engine
    you wish
</p>
<h3>JSDOC Tags</h3>
<p>
    JSDoc tags currently supported are:
    <ul>
         <li>augments|extends : extend an object</li>
         <li>lends : document all members of an anonymous object as members of a declared symbol</li>
         <li>namespace : document a namespace</li>
         <li>parameter|param|arg|argument : parameters of a function</li>
         <li>return|returns : return value of a function</li>
         <li>memberof|memberOf : explicitly document a cod block as a member of an object</li>
         <li>name : explicitly document the name of a symbol</li>
         <li>constructor|constructs : document a symbol as a constructor for a class</li>
         <li>class : documents a symbol as a class</li>
         <li>classdesc : alternate way to add a description to a class</li>
         <li>example : document an example/s of a symbol</li>
         <li>private : document a symbol as private.</li>
         <li>ignore : allows you to document a symbol but ignore it in parsing</li>
         <li>method|function : explicily document a symbol as a method</li>
         <li>field : explicily document a symbol as a field</li>
         <li>type : document the type of a field</li>
         <li>default : document the default value of a field</li>
         <li>throws|throw|exception : document any exception thrown by a method</li>
         <li>property : document a property in the constructor declaration of a class</li>
         <li>borrows : document any filed/methods borrowed from a class</li>
         <li>constant|const : document a field as a constant</li>
         <li>desc|description : alternate way to explicitly document the description of a symbol</li>
         <li>public:explicitly document a symbol as public</li>
    </ul>

<h3>Coddoc Tags</h3>
    Coddoc also has a few additional tags.
    <ul>
         <li>ignoreCode : ignore the parsed code in the output</li>
         <li>projectName : document the projectName</li>
         <li>header : allows you to document a header that should appear before
         generated documentation</li>
         <li>footer : allows you to document a footer that should come after the generated documentation</li>
         <li>protected : allows you to document a field as protected</li>
    </ul>
</p>

<h2>Installation</h2>
Locally
```javascript
 npm install coddoc
```
Globally

```javascript
 npm install -g coddoc
```

<h2>Usage</h2>
Down doc does not currently create multi file docs instead will output to a single file. You may however implement
your own formatter to create multiple files.

Command line options

<ul>
    <li>-d --directory : the directory that contains your code</li>
    <li>[-f --formatter] : optional formatter to use, if not specified then a JSON object of the symbols will
    be output</li>
    <li>[-p --pattern] : optional file pattern to use when searching for files</li>
</ul>

Examples

JSON output
```javascript
 coddoc -d ./lib > symbols.json
```

To use the markdown formatter
```javascript
 coddoc -d ./lib -f markdown > README.md
```

To use the HTML formatter
```javascript
 coddoc -d ./lib -f html > index.html
```

To use pragmatically

```javascript

var coddoc = require("coddoc");
var tree = coddoc.parse({directory : __dirname + "/lib"});
var classes = tree.classes, namespaces = tree.namespaces;
//do something

```




<h2>API</h2>

##Namespaces



  * [coddoc](#coddoc)



##Classes



  * [coddoc.Context](#coddoc_Context)

  * [coddoc.Symbol](#coddoc_Symbol)

  * [coddoc.Tree](#coddoc_Tree)


<a name="coddoc"></a>
##coddoc

[Top](#top)


Entry point for parsing code.


  * [addCodeHandler](#coddoc_addCodeHandler)

  * [addTagHandler](#coddoc_addTagHandler)

  * [getTagRegexp](#coddoc_getTagRegexp)

  * [parse](#coddoc_parse)

  * [parseCode](#coddoc_parseCode)

  * [parseTag](#coddoc_parseTag)


  
<a name="coddoc_addCodeHandler"></a>
###addCodeHandler
 _static_  function public


---
*Defined * [Top](#top)


Adds a handler for a particular code regular expression. Useful if you want to
match a specific type of code not handled by default. When inside of of the parse function
you can use the <code>RegExp.$</code> properties to access match sub expressions.

By Default code blocks of the following form are parsed.

<pre>
// /^function (\w+) *\{/
function(){}

// /^var *(\w+) *= *function/
var x = function(){};

// /^(\w+(?:\.\w+)*)\.prototype\.(\w+(?:\.\w+)?) *= *function/
MyObject.prototype.testFunction = function(){};

// /^(\w+(?:\.\w+)*)\.prototype\.(\w+(?:\.\w+)?) *= *([^\n;]+)/
MyObject.prototype.testProperty = "property";

// /^(\w+(?:\.\w+)+) *= *function/
some.object.testFunction = function(){}

// /^(\w+(?:\.\w+)+) *= *([^\n;]+)/
some.object.testFunction = ["some", "property"];

// /^var +(\w+) *= *([^\n;]+)/
var testProperty = {my : "property"};

var myObject = {
   // /^\"?(\w+)\"? *\: *function/
   testFunction : function(){},

   // /^\"?(\w+)\"? *\: *([^,\n]+)/
   testProperty : "some property"
}
</pre>


        
*Example*

```javascript
var util = require("coddoc").util;
//parse code in the format of var myLocal = name.space.myFunction = function(){};
//give it a high priority to allow it to override current handlers.
addHandler(/^var *\w+ *= * (\w+(?:\.\w+)*) = *function/, 20, function (str, symbol, context) {
     var splitName = util.splitName(RegExp.$1), name = splitName.name, activeScope = splitName.memberof, params = util.getParamList(str);
     return {
         type:'function',
         isFunction:true,
         memberof:activeScope,
         isStatic:activeScope ? !activeScope.match(".prototype") : false,
         isPrivate:name.match(/^_/) != null,
         name:name,
         params:params,
         code:['function (', params.map(
             function (n) {
                 return n.name.name;
             }).join(","), '){\n   ', util.getCode(str, "{").split("\n").join("\n   "), "\n}"].join("")
    };
});
```

     
*Arguments*

        
 * _regexp_  : the regular expression used to match code blocks.
        
 * _[priority=0]_  : the priority to give this code handler if not provided
it is defaulted to 0.
        
 * _parse_  : a function that returns an object. The object will be set as the <code>codeObject</code> on the <a href='# coddoc_Symbol'> coddoc.Symbol</a>. The properties of the object will be added to the <a href='# coddoc_Symbol'> coddoc.Symbol</a> for processing later.
        
     
     


    
*Source*

```javascript
function (regexp,priority,parse){
   if (util.isFunction(priority)) {
       parse = priority;
       priority = 0;
   }
   handlers.push({
       priority:priority,
       match:function (str) {
           return regexp.exec(str);
       },
       parse:parse
   });
   handlers.sort(sortHandlers);
       
}
```
    
    
  
<a name="coddoc_addTagHandler"></a>
###addTagHandler
 _static_  function public


---
*Defined * [Top](#top)


Adds a new tag to be parsed. You can use this to add custom tags. <a href='# coddoc'> coddoc</a> will
not do anything with the new tag by default, however you can add functionality to handle the
new tag in the template.


        
*Example*

```javascript
//if a tag is contains a '|' character then each variation will resolve the the same parser function.
coddoc.addTagHandler("void|VOID|Void", function(comment, symbol, context){
   //do something with the tag or add properties to the symbol.
   symbol.isVoid = true;
   symbol.tags.push({tag : "void", props : {}});
});
//in the template you can add functionality to handle the new tag. For example:
//in the html symbol.tmpl you could add a new label to the name header
<h3>
{{name}}
{{#if isStatic}}
<span class="label label-info">Static</span>
{{/if}}
{{#if isFunction}}
<span class="label label-label">Function</span>
{{/if}}
{{#if isPrivate}}
<span class="label label-important">Private</span>
{{else}}
     {{#if isProtected}}
<span class="label label-warning">Protected</span>
     {{else}}
<span class="label label-success">Public</span>
     {{/if}}
{{/if}}
{{#if isVoid}}
<span class="label label-label">Void</span>
{{/if}}
</h3>
```

     
*Arguments*

        
 * _tag_  : the tag to parse, if a tag is contains a '|' character then the string will be split and each variation will resolve to the same parse function. If the tag already exists then the old implementation will be replaced by the new one.
        
 * _parse_  : a parser function to invoke when a tag that matches the name is encountered.
        
     
     


    
*Source*

```javascript
function (tag,parse){
   tag.split("|").forEach(function (tag) {
       tags[tag] = {
           parse:parse || function () {
               return {tag:tag, props:{}};
           }};
   });
       
}
```
    
    
  
<a name="coddoc_getTagRegexp"></a>
###getTagRegexp
 _static_  function __protected__ 


---
*Defined * [Top](#top)


Returns a regular expression that can be used to parse tags


        
     
     
*Returns*
        
 * <code>RegExp</code> a regular expression to parse valid tags.
        
     


    
*Source*

```javascript
function (){
   return new RegExp("@(" + Object.keys(tags).join("|") + ")");
       
}
```
    
    
  
<a name="coddoc_parse"></a>
###parse
 _static_  function __protected__ 


---
*Defined * [Top](#top)


Parses a string of code into <a href='# coddoc_Symbol'> coddoc.Symbol</a>s. All processed symbols are added to the <a href='# coddoc_Tree'> coddoc.Tree</a>.
This method is not intended to be used directly by user code.


        
     
*Arguments*

        
 * _str_  : the source code to parse
        
 * _filepath_  : the relative filepath where the source is located. This is set on the symbol during parsing.
        
 * _tree_  : the tree which contains all symbols.
        
 * _context_  : the context which holds information about the current parsing job.
        
 * _emitter_  : 
        
     
     
*Returns*
        
 * <code>Object</code> 
        
     


    
*Source*

```javascript
function (str,filepath,tree,context,emitter){
   var l = str.length;
   var symbols = [];
   for (var i = 0; i &lt; l; i++) {
       var tags = [];
       var comment = "", c = str[i], startIndex = i, endIndex, ret = [];
       var startCIndex = str.indexOf("/**", i);
       if (startCIndex !== -1) {
           i = startCIndex + 2;
           var endCIndex = str.indexOf("*/", i);
           if (endCIndex !== -1) {
               comment = str.substr(startCIndex + 2, endCIndex - (startCIndex + 2)).split("\n").map(joinAndReplace).join("\n");
               emitter.emit("comment", comment);
               i = endCIndex + 1;
               //console.log(str.substr(startCIndex, endCIndex - startCIndex));
               //console.log(comment);
               var res = parseTags({comment:comment, start:startCIndex, end:endCIndex + 2}, str, filepath, context),
                   sym = res.symbol;
               symbols.push(sym);
               emitter.emit("symbol", sym);
               var memberof = sym.memberof;
               if (!sym.ignore && !sym.lends) {
                   tree.addSymbol(sym);
               }
           }
       } else {
           i++;
       }
   }
   return {symbols:symbols, code:str};
       
}
```
    
    
  
<a name="coddoc_parseCode"></a>
###parseCode
 _static_  function __protected__ 


---
*Defined * [Top](#top)


Uses Registered handlers to parse the next block of code from a code fragment. This function is
used by <a href='# coddoc_parse'> coddoc.parse</a> to parse code for comments.


        
     
*Arguments*

        
 * _str_  : the source string to parse
        
 * _symbol_  : the symbol to add parsed properties from.
        
 * _context_  : the current context
        
     
     


    
*Source*

```javascript
function (str,symbol,context){
   var l = handlers.length, ret = {};
   for (var i = 0; i &lt; l; i++) {
       var h = handlers[i];
       if (h.match(str)) {
           ret = h.parse(str, symbol, context);
           break;
       }
   }
   if (ret) {
       symbol.codeObject = ret;
       Object.keys(ret).forEach(function (i) {
           symbol[i] = ret[i];
       });
   }
       
}
```
    
    
  
<a name="coddoc_parseTag"></a>
###parseTag
 _static_  function __protected__ 


---
*Defined * [Top](#top)


Parses a tag and the coresponding comment using a matching tag handler. Each parsed tag
could add a new property to the <a href='# coddoc_Symbol'> coddoc.Symbol</a>. The parsed tag will be added the the
<a href='# coddoc_Symbol_prototype_tags'> coddoc.Symbol#tags</a> array.


        
*Example*

```javascript
coddoc.parseTag("someTag", "@someTag props...", sym, src, index, context);
//would add a new tag to the symbols property
{
     tag : "tagname",
     props : {...}
}

//the props value would also be added to the symbols params array.
```

     
*Arguments*

        
 * _comment_  : the comment fragment being parsed
        
 * _sym_  : the symbol that the comment corresponds to. The code object and values will have already been set.
        
 * _context_  : the currect context object. The context allows tags to set new scopes and namespaces.
        
 * _tag_ <code>String</code> : the tag name being parsed from the comment
        
     
     


    
*Source*

```javascript
function (comment,sym,context){
   var tag = comment.match(TAG_REGEXP), ret = {};
   if (tag && tag.length === 2) {
       var t = tags[tag[1]];
       if (t) {
           t.parse(comment, sym, context);
       } else {
           throw new Error("Invalid tag " + tag);
       }
   }
       
}
```
    
    
  



<a name="coddoc_Context"></a>
##coddoc.Context

[Top](#top)


A Context object used to keep state when parsing symbols.
The context should not be used directly by user code.



        









*Instance*

  * [activateScope](#coddoc_Context_prototype_activateScope)

  * [addNamespace](#coddoc_Context_prototype_addNamespace)

  * [addScope](#coddoc_Context_prototype_addScope)

  * [getActiveScope](#coddoc_Context_prototype_getActiveScope)

  * [getActiveScopeName](#coddoc_Context_prototype_getActiveScopeName)

  * [getNamespace](#coddoc_Context_prototype_getNamespace)

  * [getScope](#coddoc_Context_prototype_getScope)


###Constructor

*Defined * [Top](#top)
     


    
*Source*

```javascript
function (){
   this.scopes = {};
   this.nameSpaces = {global:[]};
   this.aliases = {};
   this.activateScope("global");
       
}
```
      


  
  
<a name="coddoc_Context_prototype_activateScope"></a>
###activateScope
 function public


---
*Defined * [Top](#top)


Activates a scope for.

        
     
*Arguments*

        
 * _name_  : the name of the scope.
        
     
     
*Returns*
        
 * <code>Object</code> the activated scope object.
        
     


    
*Source*

```javascript
function (name){
   this.activeScope = name;
   return this.addScope(name);
       
}
```
    
    
  
<a name="coddoc_Context_prototype_addNamespace"></a>
###addNamespace
 function public


---
*Defined * [Top](#top)


Adds a namespace the the context object.

        
     
*Arguments*

        
 * _name_  : the name of the namespace
        
     
     
*Returns*
        
 * <code>Object</code> the object for the namespace.
        
     


    
*Source*

```javascript
function (name){
   if ("undefined" === typeof this.nameSpaces[name]) {
       this.nameSpaces[name] = {};
   }
   return this.nameSpaces[name];
       
}
```
    
    
  
<a name="coddoc_Context_prototype_addScope"></a>
###addScope
 function public


---
*Defined * [Top](#top)


Adds a scope to the context


        
     
*Arguments*

        
 * _name_  : the name of the scope to add,
        
     
     
*Returns*
        
 * <code>Object</code> the object for the namespace.
        
     


    
*Source*

```javascript
function (name){
   if ("undefined" === typeof this.scopes[name]) {
       this.scopes[name] = {};
   }
   return this.scopes[name];
       
}
```
    
    
  
<a name="coddoc_Context_prototype_getActiveScope"></a>
###getActiveScope
 function public


---
*Defined * [Top](#top)


Returns the active scope.


        
     
     
*Returns*
        
 * <code>Object</code> the scope object
        
     


    
*Source*

```javascript
function (){
   return this.getScope(this.activeScope);
       
}
```
    
    
  
<a name="coddoc_Context_prototype_getActiveScopeName"></a>
###getActiveScopeName
 function public


---
*Defined * [Top](#top)


Returns the name of the active scope.


        
     
     
*Returns*
        
 * <code>String</code> the active scope name.
        
     


    
*Source*

```javascript
function (){
   return this.activeScope;
       
}
```
    
    
  
<a name="coddoc_Context_prototype_getNamespace"></a>
###getNamespace
 function public


---
*Defined * [Top](#top)


Gets a namespace, creating it if it does not exist.


        
     
*Arguments*

        
 * _name_  : the name of the context
        
     
     
*Returns*
        
 * <code>Object</code> the object for the namespace.
        
     


    
*Source*

```javascript
function (name){
   return this.addNamespace(name);
       
}
```
    
    
  
<a name="coddoc_Context_prototype_getScope"></a>
###getScope
 function public


---
*Defined * [Top](#top)


Gets a scope creating it if it does not exist.


        
     
*Arguments*

        
 * _name_  : the name of the scope to get,
        
     
     
*Returns*
        
 * <code>Object</code> the object for the namespace.
        
     


    
*Source*

```javascript
function (name){
   return this.addScope(name);
       
}
```
    
    
  

<a name="coddoc_Symbol"></a>
##coddoc.Symbol

[Top](#top)


A Symbol represents a comment and code pair. Each code handler added through <a href='# coddoc_addCodeHandler'> coddoc.addCodeHandler</a> and
tag handler added through <a href='# coddoc_addTagHandler'> coddoc.addTagHandler</a> adds/removes properties from a the symbol. Each symbol is
added to the <a href='# coddoc_Tree'> coddoc.Tree</a> which is either returned from <a href='# coddoc'> coddoc</a> or passed into a template handler.

<b>NOTE: This object should not be instantiated by user code</b>




        





*Instance Properties*
<table class='table table-bordered table-striped'><tr><td>Property</td><td>Type</td><td>Default Value</td><td>Description</td></tr><tr><td>augments</td><td>{Array}</td><td><code>
[]
     </code></td><td>
Any symbols this symbol augments
</td><tr><tr><td>borrows</td><td>{Array}</td><td><code>
[]
     </code></td><td>
Any properties this symbol borrows
</td><tr><tr><td>codeObject</td><td>{Object}</td><td><code>null</code></td><td>
The codeObject of this symbol
</td><tr><tr><td>description</td><td>{String}</td><td><code>""</code></td><td>
The description of this symbol.
</td><tr><tr><td>examples</td><td>{Array}</td><td><code>
[]
     </code></td><td>
The examples for this symbol
</td><tr><tr><td>file</td><td>{String}</td><td><code>""</code></td><td>
The file where the symbol was found.
</td><tr><tr><td>fullname</td><td>{String}</td><td><code>""</code></td><td>
The fullname i.e ({memberof}.{name})
</td><tr><tr><td>ignore</td><td>{Boolean}</td><td><code>false</code></td><td>
Set to true if the symbol should be ignored and not put into <a href='# coddoc_Tree'> coddoc.Tree</a>
</td><tr><tr><td>ignoreCode</td><td>{Boolean}</td><td><code>false</code></td><td>
Set to true if the code object from this symbol should be ignored.
</td><tr><tr><td>isConstant</td><td>{Boolean}</td><td><code>false</code></td><td>
Set to true if this symbol is a constant.
</td><tr><tr><td>isConstructor</td><td>{Boolean}</td><td><code>false</code></td><td>
Set to true is this symbol is a constructor
</td><tr><tr><td>isFunction</td><td>{Boolean}</td><td><code>false</code></td><td>
Set to true if this symbol is a function.
</td><tr><tr><td>isPrivate</td><td>{Boolean}</td><td><code>false</code></td><td>
Set to true if this symbol is private.
</td><tr><tr><td>isProtected</td><td>{Boolean}</td><td><code>false</code></td><td>
Set to true if this symbol is protected.
</td><tr><tr><td>isStatic</td><td>{Boolean}</td><td><code>false</code></td><td>
Set to true if this symbol is static
</td><tr><tr><td>memberof</td><td>{String}</td><td><code>""</code></td><td>
Who this symbol belongs to.
</td><tr><tr><td>name</td><td>{String}</td><td><code>""</code></td><td>
The name of this symbol
</td><tr><tr><td>params</td><td>{Array}</td><td><code>
[]
     </code></td><td>
The associated params for this symbol if it is a funciton.
</td><tr><tr><td>properties</td><td>{Array}</td><td><code>
[]
     </code></td><td>
The associated properties for this symbol
</td><tr><tr><td>returns</td><td>{Array}</td><td><code>
[]
     </code></td><td>
Array of return types for this symbol
</td><tr><tr><td>see</td><td>{Array}</td><td><code>
[]
     </code></td><td>
Any link for this symbol
</td><tr><tr><td>tags</td><td>{Array}</td><td><code>
[]
     </code></td><td>
The associated tags for this symbol
</td><tr><tr><td>throws</td><td>{Array}</td><td><code>
[]
     </code></td><td>
Exceptions thrown by this symbol
</td><tr><tr><td>type</td><td>{*}</td><td><code>null</code></td><td>
The type that is symbol represents.
</td><tr></table>





###Constructor

*Defined * [Top](#top)
     
*Arguments*

        
 * _options_  : an object or symbol whos properties will be added to this symbol. Note a deep copy of paraemeters will not be made, so if you pass an array the array will not be cloned.
        
     


    
*Source*

```javascript
function (options){
   this.tags = [];
   this.params = [];
   this.properties = [];
   this.examples = [];
   this.borrows = [];
   this.augments = [];
   this.see = [];
   this.throws = [];
   this.returns = [];
   options = options || {};
   for (var i in options) {
       if (this.hasOwnProperty(i)) {
           this[i] = options[i];
       }
   }
       
}
```
      


  
  

<a name="coddoc_Tree"></a>
##coddoc.Tree

[Top](#top)


A Tree object which contains symbols.



        









*Instance*

  * [_addSymbol](#coddoc_Tree_prototype__addSymbol)

  * [addSymbol](#coddoc_Tree_prototype_addSymbol)

  * [getClasses](#coddoc_Tree_prototype_getClasses)

  * [getMembers](#coddoc_Tree_prototype_getMembers)

  * [getNamespaces](#coddoc_Tree_prototype_getNamespaces)

  * [getSymbol](#coddoc_Tree_prototype_getSymbol)

  * [hasSymbol](#coddoc_Tree_prototype_hasSymbol)


###Constructor

*Defined * [Top](#top)
     


    
*Source*

```javascript
function (){
   this.symbols = {global:[]};
       
}
```
      


  
  
<a name="coddoc_Tree_prototype__addSymbol"></a>
###_addSymbol
 function __private__


---
*Defined * [Top](#top)


Adds a symbol to this tree.

        
     
*Arguments*

        
 * _name_  : the name of the symbol to add.
        
     
     
*Returns*
        
 * <code>Array</code> 
        
     


    
*Source*

```javascript
function (name){
   var ret = this.symbols[name];
   if (!ret) {
       ret = this.symbols[name] = [];
   }
   return ret;
       
}
```
    
    
  
<a name="coddoc_Tree_prototype_addSymbol"></a>
###addSymbol
 function public


---
*Defined * [Top](#top)


Entry point to add the symbol

        
     
*Arguments*

        
 * _symbol_  : 
        
 * _path_ <code>String</code> : the path of the symbol. i.e the memberof property of a symbol
        
 * _name_  : 
        
 * _obj_  : 
        
     
     


    
*Source*

```javascript
function (symbol){
   var nameParts = utils.splitName(symbol.fullName);
   var path = nameParts.memberof, name = nameParts.name;
   if (path === "global") {
       path = name;
   }
   var sym = this.getSymbol(path);
   sym.push(symbol);
       
}
```
    
    
  
<a name="coddoc_Tree_prototype_getClasses"></a>
###getClasses
 function public


---
*Defined * [Top](#top)


Returns all classes in the tree. The following properties are added to each class symbol.

<ul>
    <li>staticMethods : all static methods for the class</li>
    <li>staticProperties : all static properties for the class</li>
    <li>instanceMethods : all isntance methods for the class</li>
    <li>instanceProperties : all instance properties for a class</li>
</ul>


        
     
     
*Returns*
        
 * <code>Array</code> 
        
     


    
*Source*

```javascript
function (){
   var symbols = this.symbols,
       objects = [],
       keys = Object.keys(this.symbols);
   keys.forEach(function (k) {
       objects = objects.concat(symbols[k].filter(function (s) {
           return s.isConstructor;
       }));
   });
   return objects.map(function (s) {
       var name = s.fullName;
       var statics = symbols[name] || [];
       var instance = symbols[name + ".prototype"] || [];
       var borrowedMethods = [], borrowedProperties = [], staticBorrowedMethods = [], staticBorrowedProperties = [];
       s.borrows.map(function (b) {
           var borrows = b.borrows;
           var symbol = symbols[borrows.memberof || "global"].filter(function (s) {
               return s.name === borrows.name;
           });
           if (symbol.length) {
               symbol = symbol[0];
               var memberof = b.isStatic ? name : name + ".prototype";
               var newSymb = new Symbol(utils.merge({}, symbol, {name:b.as, isStatic:b.isStatic, fullName:memberof + "." + b.as, memberof:memberof}));
               if (b.isStatic) {
                   if (s.isFunction) {
                       staticBorrowedMethods.push(newSymb);
                   } else {
                       staticBorrowedProperties.push(newSymb);
                   }
               } else {
                   if (s.isFunction) {
                       borrowedMethods.push(newSymb);
                   } else {
                       borrowedProperties.push(newSymb);
                   }
               }
           }
       });
       s.name = name;
       s.staticMethods = statics.filter(
           function (s) {
               return s.isFunction && !s.isConstructor;
           }).concat(staticBorrowedMethods);
       s.staticProperties = statics.filter(
           function (s) {
               return !s.isFunction && !s.isNamespace;
           }).concat(staticBorrowedProperties);
       s.instanceMethods = instance.filter(
           function (s) {
               return s.isFunction && !s.isConstructor;
           }).concat(borrowedMethods);
       s.instanceProperties = instance.filter(
           function (s) {
               return !s.isFunction && !s.isNamespace;
           }).concat(s.properties || []).concat(borrowedProperties);
       return s;
   });
       
}
```
    
    
  
<a name="coddoc_Tree_prototype_getMembers"></a>
###getMembers
 function public


---
*Defined * [Top](#top)


Gets all members(<a href='# coddoc_Symbol'> coddoc.Symbol</a>) for a particular path.

        
     
*Arguments*

        
 * _path_  : the path to look up.
        
     
     
*Returns*
        
 * <code>Array</code> and array of symbols.
        
     


    
*Source*

```javascript
function (path){
   var symbols = this.symbols,
       namespaces = [],
       keys = Object.keys(this.symbols);
   keys.forEach(function (k) {
       namespaces = namespaces.concat(symbols[k].filter(function (s) {
           return !s.isNamespace && !s.isConstructor && s.memberof === path;
       }));
   });
   return namespaces;
       
}
```
    
    
  
<a name="coddoc_Tree_prototype_getNamespaces"></a>
###getNamespaces
 function public


---
*Defined * [Top](#top)


Returns all namespaces in this tree. This method also adds the following values to the namespace.

<ul>
    <li>properties : all properties that belong to the namespace</li>
    <li>methods : all methods that belong to the namespace</li>
</ul>


        
     
     
*Returns*
        
 * <code>Array</code> array of namespaces
        
     


    
*Source*

```javascript
function (){
   var symbols = this.symbols,
       namespaces = [],
       keys = Object.keys(this.symbols);
   keys.forEach(function (k) {
       namespaces = namespaces.concat(symbols[k].filter(function (s) {
           return s.isNamespace;
       }));
   });
   return namespaces.map(function (s) {
       var realName = s.memberof && s.memberof !== "global" ? [s.memberof, s.name].join(".") : s.name;
       var members = this.getMembers(realName);
       s.name = realName;
       s.properties = s.properties.concat(members.filter(function (m) {
           return !m.isFunction;
       }));
       s.methods = members.filter(function (m) {
           return m.isFunction;
       });
       return s;
   }, this);
       
}
```
    
    
  
<a name="coddoc_Tree_prototype_getSymbol"></a>
###getSymbol
 function public


---
*Defined * [Top](#top)


Returns a symbol from this tree. The Tree will create the symbol if it does not exist.


        
     
*Arguments*

        
 * _name_  : the name of the symbol to get
        
     
     
*Returns*
        
 * <code>Array</code> the array for the symbol.
        
     


    
*Source*

```javascript
function (name){
   return this._addSymbol(name);
       
}
```
    
    
  
<a name="coddoc_Tree_prototype_hasSymbol"></a>
###hasSymbol
 function public


---
*Defined * [Top](#top)


Returns true if this tree contains a symbol.


        
     
*Arguments*

        
 * _name_  : the name to test if the tree contains the symbol
        
     
     
*Returns*
        
 * <code>Boolean</code> true if the tree contains the symbol.
        
     


    
*Source*

```javascript
function (name){
   var parts = name.split(".");
   return !!this.symbols[name];
       
}
```
    
    
  


  <h2>License</h2>

<p>MIT <a href = https://github.com/Pollenware/downdoc/raw/master/LICENSE>LICENSE</a><p>

<h2>Meta</h2>
<hr>
<p>Code: <code>git clone git://github.com/pollenware/downdoc.git</code></br></p>



