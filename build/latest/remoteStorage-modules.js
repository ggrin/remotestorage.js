/**
 * vCardJS - a vCard 4.0 implementation in JavaScript
 *
 * (c) 2012 - Niklas Cathor
 *
 * Latest source: https://github.com/nilclass/vcardjs
 **/

/*!
Math.uuid.js (v1.4)
http://www.broofa.com
mailto:robert@broofa.com

Copyright (c) 2010 Robert Kieffer
Dual licensed under the MIT and GPL licenses.
*/

(function(){function define(name,relDeps,code){name=String(name),exports[name]=code;var dir=name.substring(0,name.lastIndexOf("/")+1);deps[name]=[];for(var i=0;i<relDeps.length;i++){relDeps[i].substring(0,2)=="./"&&(relDeps[i]=relDeps[i].substring(2));if(relDeps[i].substring(0,3)=="../"){relDeps[i]=relDeps[i].substring(3);var dirParts=dir.split("/");dirParts.pop(),dirParts.pop(),dir=dirParts.join("/"),dir.length&&(dir+="/")}deps[name].push(dir+relDeps[i])}}function _loadModule(name){if(name=="require")return function(){};var modNames=deps[name];for(var i=0;i<modNames.length;i++)mods[modNames[i]]||(mods[modNames[i]]=_loadModule(modNames[i]));var modList=[];for(var i=0;i<modNames.length;i++)modList.push(mods[modNames[i]]);return exports[name].apply({},modList)}var exports={},deps={},mods={};remoteStorage.defineModule("calendar",function(privateBaseClient){function getEventsForDay(day){var ids=privateBaseClient.getListing(day+"/"),list=[];for(var i=0;i<ids.length;i++){var obj=privateBaseClient.getObject(day+"/"+ids[i]);list.push({itemId:ids[i],itemValue:obj.text})}return list}function addEvent(itemId,day,value){privateBaseClient.storeObject("event",day+"/"+itemId,{text:value})}function removeEvent(itemId,day){privateBaseClient.remove(day+"/"+itemId)}return privateBaseClient.sync("/"),{exports:{getEventsForDay:getEventsForDay,addEvent:addEvent,removeEvent:removeEvent}}}),define("modules/calendar",function(){}),function(){var CHARS="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");Math.uuid=function(len,radix){var chars=CHARS,uuid=[],i;radix=radix||chars.length;if(len)for(i=0;i<len;i++)uuid[i]=chars[0|Math.random()*radix];else{var r;uuid[8]=uuid[13]=uuid[18]=uuid[23]="-",uuid[14]="4";for(i=0;i<36;i++)uuid[i]||(r=0|Math.random()*16,uuid[i]=chars[i==19?r&3|8:r])}return uuid.join("")},Math.uuidFast=function(){var chars=CHARS,uuid=new Array(36),rnd=0,r;for(var i=0;i<36;i++)i==8||i==13||i==18||i==23?uuid[i]="-":i==14?uuid[i]="4":(rnd<=2&&(rnd=33554432+Math.random()*16777216|0),r=rnd&15,rnd>>=4,uuid[i]=chars[i==19?r&3|8:r]);return uuid.join("")},Math.uuidCompact=function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(c){var r=Math.random()*16|0,v=c=="x"?r:r&3|8;return v.toString(16)})}}();var VCard;(function(){VCard=function(attributes){this.changed=!1;if(typeof attributes=="object")for(var key in attributes)this[key]=attributes[key],this.changed=!0},VCard.prototype={validate:function(){function addError(attribute,type){errors.push([attribute,type])}function validateCompoundWithType(attribute,values){for(var i in values){var value=values[i];typeof value!="object"?errors.push([attribute+"-"+i,"not-an-object"]):value.type?value.value||errors.push([attribute+"-"+i,"missing-value"]):errors.push([attribute+"-"+i,"missing-type"])}}var errors=[];this.fn||addError("fn","required");for(var key in VCard.multivaluedKeys)this[key]&&!(this[key]instanceof Array)&&(this[key]=[this[key]]);return this.email&&validateCompoundWithType("email",this.email),this.tel&&validateCompoundWithType("email",this.tel),this.uid||this.addAttribute("uid",this.generateUID()),this.rev||this.addAttribute("rev",this.generateRev()),this.errors=errors,!(errors.length>0)},generateUID:function(){return"uuid:"+Math.uuid()},generateRev:function(){return(new Date).toISOString().replace(/[\.\:\-]/g,"")},setAttribute:function(key,value){this[key]=value,this.changed=!0},addAttribute:function(key,value){console.log("add attribute",key,value);if(!value)return;VCard.multivaluedKeys[key]?this[key]?(console.log("multivalued push"),this[key].push(value)):(console.log("multivalued set"),this.setAttribute(key,[value])):this.setAttribute(key,value)},toJSON:function(){return JSON.stringify(this.toJCard())},toJCard:function(){var jcard={};for(var k in VCard.allKeys){var key=VCard.allKeys[k];this[key]&&(jcard[key]=this[key])}return jcard},merge:function(other){function mergeProperty(key){other[key]?other[key]==this[key]?result.setAttribute(this[key]):(result.addAttribute(this[key]),result.addAttribute(other[key])):result[key]=this[key]}if(typeof other.uid!="undefined"&&typeof this.uid!="undefined"&&other.uid!==this.uid)throw"Won't merge vcards without matching UIDs.";var result=new VCard;for(key in this)mergeProperty(key);for(key in other)result[key]||mergeProperty(key)}},VCard.enums={telType:["text","voice","fax","cell","video","pager","textphone"],relatedType:["contact","acquaintance","friend","met","co-worker","colleague","co-resident","neighbor","child","parent","sibling","spouse","kin","muse","crush","date","sweetheart","me","agent","emergency"],emailType:["work","home","internet"],langType:["work","home"]},VCard.allKeys=["fn","n","nickname","photo","bday","anniversary","gender","tel","email","impp","lang","tz","geo","title","role","logo","org","member","related","categories","note","prodid","rev","sound","uid"],VCard.multivaluedKeys={email:!0,tel:!0,geo:!0,title:!0,role:!0,logo:!0,org:!0,member:!0,related:!0,categories:!0,note:!0}})();var VCF;(function(){VCF={simpleKeys:["VERSION","FN","PHOTO","GEO","TITLE","ROLE","LOGO","MEMBER","NOTE","PRODID","SOUND","UID"],csvKeys:["NICKNAME","CATEGORIES"],dateAndOrTimeKeys:["BDAY","ANNIVERSARY","REV"],parse:function(input,callback,context){var vcard=null;context||(context=this),this.lex(input,function(key,value,attrs){function setAttr(val){vcard&&vcard.addAttribute(key.toLowerCase(),val)}if(key=="BEGIN")vcard=new VCard;else if(key=="END")vcard&&(callback.apply(context,[vcard]),vcard=null);else if(this.simpleKeys.indexOf(key)!=-1)setAttr(value);else if(this.csvKeys.indexOf(key)!=-1)setAttr(value.split(","));else if(this.dateAndOrTimeKeys.indexOf(key)!=-1)attrs.VALUE=="text"?setAttr(value):(!attrs.CALSCALE||attrs.CALSCALE=="gregorian")&&setAttr(this.parseDateAndOrTime(value));else if(key=="N")setAttr(this.parseName(value));else if(key=="GENDER")setAttr(this.parseGender(value));else if(key=="TEL")setAttr({type:attrs.TYPE||"voice",pref:attrs.PREF,value:value});else if(key=="EMAIL")setAttr({type:attrs.TYPE,pref:attrs.PREF,value:value});else if(key=="IMPP")setAttr({value:value});else if(key=="LANG")setAttr({type:attrs.TYPE,pref:attrs.PREF,value:value});else if(key=="TZ")attrs.VALUE=="utc-offset"?setAttr({"utc-offset":this.parseTimezone(value)}):setAttr({name:value});else if(key=="ORG"){var parts=value.split(";");setAttr({"organization-name":parts[0],"organization-unit":parts[1]})}else key=="RELATED"?setAttr({type:attrs.TYPE,pref:attrs.PREF,value:attrs.VALUE}):console.log("WARNING: unhandled key: ",key)})},nameParts:["family-name","given-name","additional-name","honorific-prefix","honorific-suffix"],parseName:function(name){var parts=name.split(";"),n={};for(var i in parts)parts[i]&&(n[this.nameParts[i]]=parts[i].split(","));return n},parseGender:function(value){var gender={},parts=value.split(";");switch(parts[0]){case"M":gender.sex="male";break;case"F":gender.sex="female";break;case"O":gender.sex="other"}return parts[1]&&(gender.identity=parts[1]),gender},dateRE:/^(\d{4})(\d{2})(\d{2})$/,dateReducedARE:/^(\d{4})\-(\d{2})$/,dateReducedBRE:/^(\d{4})$/,dateTruncatedMDRE:/^\-{2}(\d{2})(\d{2})$/,dateTruncatedDRE:/^\-{3}(\d{2})$/,timeRE:/^(\d{2})(\d{2})(\d{2})([+\-]\d+|Z|)$/,timeReducedARE:/^(\d{2})(\d{2})([+\-]\d+|Z|)$/,timeReducedBRE:/^(\d{2})([+\-]\d+|Z|)$/,timeTruncatedMSRE:/^\-{2}(\d{2})(\d{2})([+\-]\d+|Z|)$/,timeTruncatedSRE:/^\-{3}(\d{2})([+\-]\d+|Z|)$/,parseDate:function(data){var md,y,m,d;if(md=data.match(this.dateRE))y=md[1],m=md[2],d=md[3];else if(md=data.match(this.dateReducedARE))y=md[1],m=md[2];else if(md=data.match(this.dateReducedBRE))y=md[1];else if(md=data.match(this.dateTruncatedMDRE))m=md[1],d=md[2];else{if(!(md=data.match(this.dateTruncatedDRE)))return console.error("WARNING: failed to parse date: ",data),null;d=md[1]}var dt=new Date(0);return typeof y!="undefined"&&dt.setUTCFullYear(y),typeof m!="undefined"&&dt.setUTCMonth(m-1),typeof d!="undefined"&&dt.setUTCDate(d),dt},parseTime:function(data){var md,h,m,s,tz;if(md=data.match(this.timeRE))h=md[1],m=md[2],s=md[3],tz=md[4];else if(md=data.match(this.timeReducedARE))h=md[1],m=md[2],tz=md[3];else if(md=data.match(this.timeReducedBRE))h=md[1],tz=md[2];else if(md=data.match(this.timeTruncatedMSRE))m=md[1],s=md[2],tz=md[3];else{if(!(md=data.match(this.timeTruncatedSRE)))return console.error("WARNING: failed to parse time: ",data),null;s=md[1],tz=md[2]}var dt=new Date(0);return typeof h!="undefined"&&dt.setUTCHours(h),typeof m!="undefined"&&dt.setUTCMinutes(m),typeof s!="undefined"&&dt.setUTCSeconds(s),tz&&(dt=this.applyTimezone(dt,tz)),dt},addDates:function(aDate,bDate,addSub){typeof addSub=="undefined"&&(addSub=!0);if(!aDate)return bDate;if(!bDate)return aDate;var a=Number(aDate),b=Number(bDate),c=addSub?a+b:a-b;return new Date(c)},parseTimezone:function(tz){var md;if(md=tz.match(/^([+\-])(\d{2})(\d{2})?/)){var offset=new Date(0);return offset.setUTCHours(md[2]),offset.setUTCMinutes(md[3]||0),Number(offset)*(md[1]=="+"?1:-1)}return null},applyTimezone:function(date,tz){var offset=this.parseTimezone(tz);return offset?new Date(Number(date)+offset):date},parseDateTime:function(data){var parts=data.split("T"),t=this.parseDate(parts[0]),d=this.parseTime(parts[1]);return this.addDates(t,d)},parseDateAndOrTime:function(data){switch(data.indexOf("T")){case 0:return this.parseTime(data.slice(1));case-1:return this.parseDate(data);default:return this.parseDateTime(data)}},lineRE:/^([^\s].*)(?:\r?\n|$)/,foldedLineRE:/^\s(.+)(?:\r?\n|$)/,lex:function(input,callback){var md,line=null,length=0;for(;;){(md=input.match(this.lineRE))?(line&&this.lexLine(line,callback),line=md[1],length=md[0].length):(md=input.match(this.foldedLineRE))?line&&(line+=md[1],length=md[0].length):console.error("Unmatched line: "+line),input=input.slice(length);if(!input)break}line&&this.lexLine(line,callback),line=null},lexLine:function(line,callback){function finalizeKeyOrAttr(){if(key){if(!attrKey){console.error("Invalid attribute: ",tmp,"Line dropped.");return}attrs[attrKey]=tmp}else key=tmp}var tmp="",key=null,attrs={},value=null,attrKey=null;for(var i in line){var c=line[i];switch(c){case":":finalizeKeyOrAttr(),value=line.slice(Number(i)+1),callback.apply(this,[key,value,attrs]);return;case";":finalizeKeyOrAttr(),tmp="";break;case"=":attrKey=tmp,tmp="";break;default:tmp+=c}}}}})(),define("modules/deps/vcardjs-0.2.js",function(){}),remoteStorage.defineModule("contacts",function(base){function extend(destination,source){var keys=Object.keys(source);for(var i=0;i<keys.length;i++){var key=keys[i];destination[key]=source[key]}return destination}function bindContext(cb,context){return context?function(){return cb.apply(context,arguments)}:cb}var DEBUG=!0;if(typeof VCard=="undefined")return console.error("remoteStorage.contacts requires vCardJS from https://github.com/nilclass/vcardjs"),{exports:{}};var debug=DEBUG?bindContext(console.log,console):function(){},Contact=function(){VCard.apply(this,arguments)};Contact.prototype=extend({isNew:!0,save:function(){return this.validate(),this.errors&&this.errors.length>0?!1:(base.storeObject("vcard",this.uid,this.toJCard()),this.markSaved(),!0)},markSaved:function(){return this.isNew=!1,this.changed=!1,this}},VCard.prototype);var contacts={Contact:Contact,on:base.on,list:function(limit,offset){var list=base.getListing("");offset||(offset=0),limit||(limit=list.length-offset);for(var i=0;i<limit;i++)list[i+offset]=this.get(list[i+offset]);return list},get:function(uid,cb,context){if(!cb)return this._load(base.getObject(uid));base.getObject(uid,function(data){bindContext(cb,context)(this._load(data))},this)},build:function(attributes){return this._wrap(attributes)},create:function(attributes){var instance=this.build(attributes);return instance.save(),instance},filter:function(cb,context){var list=this.list(),results=[],item;for(var i=0;i<list.length;i++)item=bindContext(cb,context)(list[i]),item&&results.push(item);return results},search:function(filter){var keys=Object.keys(filter);return this.filter(function(item){for(var i=0;i<keys.length;i++){var k=keys[i],v=filter[k];debug("check ",k," == ",v," in ",item,"(",item[k],")");if(typeof v=="string"&&v.length===0)continue;if(v instanceof RegExp){if(!v.test(item[k]))return!1}else if(item[k]!==v)return!1}return debug("success"),item},this)},_load:function(data){return this._wrap(data).markSaved()},_wrap:function(data){return data instanceof Contact?data:new Contact(data)}};return{exports:contacts}}),define("modules/contacts",function(){}),remoteStorage.defineModule("documents",function(myBaseClient){function fire(eventType,eventObj){if(eventType=="error")for(var i=0;i<errorHandlers.length;i++)errorHandlers[i](eventObj)}function getUuid(){var uuid="",i,random;for(i=0;i<32;i++){random=Math.random()*16|0;if(i===8||i===12||i===16||i===20)uuid+="-";uuid+=(i===12?4:i===16?random&3|8:random).toString(16)}return uuid}function getPrivateList(listName){function getIds(){return myBaseClient.getListing(listName+"/")}function getContent(id){var obj=myBaseClient.getObject(listName+"/"+id);return obj?obj.content:""}function getTitle(id){return getContent(id).slice(0,50)}function setContent(id,content){content==""?myBaseClient.remove(listName+"/"+id):myBaseClient.storeObject("text",listName+"/"+id,{content:content})}function add(content){var id=getUuid();return myBaseClient.storeObject("text",listName+"/"+id,{content:content}),id}function on(eventType,cb){myBaseClient.on(eventType,cb),eventType=="error"&&errorHandlers.push(cb)}return myBaseClient.sync(listName+"/"),{getIds:getIds,getContent:getContent,getTitle:getTitle,setContent:setContent,add:add,on:on}}var errorHandlers=[];return{name:"documents",dataHints:{module:"documents can be text documents, or etherpad-lite documents or pdfs or whatever people consider a (text) document. But spreadsheets and diagrams probably not","objectType text":"a human-readable plain-text document in utf-8. No html or markdown etc, they should have their own object types","string text#content":"the content of the text document","directory documents/notes/":"used by litewrite for quick notes","item documents/notes/calendar":"used by docrastinate for the 'calendar' pane","item documents/notes/projects":"used by docrastinate for the 'projects' pane","item documents/notes/personal":"used by docrastinate for the 'personal' pane"},exports:{getPrivateList:getPrivateList}}}),define("modules/documents",function(){}),remoteStorage.defineModule("money",function(myBaseClient){function genUuid(){var uuid="",i,random;for(i=0;i<32;i++){random=Math.random()*16|0;if(i===8||i===12||i===16||i===20)uuid+="-";uuid+=(i===12?4:i===16?random&3|8:random).toString(16)}return uuid}function addIOU(tag,thing,amount,currency,owee,ower){var uuid=genUuid();myBaseClient.storeObject("IOU","IOUs/"+ower+"/"+owee+"/"+currency+"/"+uuid,{tag:tag,thing:thing,amount:-amount}),myBaseClient.storeObject("IOU","IOUs/"+owee+"/"+ower+"/"+currency+"/"+uuid,{tag:tag,thing:thing,amount:amount})}function addDeclaration(owee,ower,comment,date,amount,currency){addIOU(date,comment,amount,currency,owee,ower)}function reportTransfer(from,to,date,amount,currency){addIOU(date,"transfer",amount,currency,from,to)}function groupPayment(box,id,payers,beneficiaries,date,comment){for(var payer in payers){var euros=payers[payer];remoteStorage.money.addIOU(id,comment,euros,"EUR",payer,box);var perPerson=euros/beneficiaries.length;for(var i=0;i<beneficiaries.length;i++)remoteStorage.money.addIOU(id,comment,perPerson,"EUR",box,beneficiaries[i])}}function getBalance(personName,currency){var peers=myBaseClient.getListing("IOUs/"+personName+"/"),balance=0;for(var i=0;i<peers.length;i++){var thisPeerBalance=0,thisPeerIOUs=myBaseClient.getListing("IOUs/"+personName+"/"+peers[i]+currency+"/");for(var j=0;j<thisPeerIOUs.length;j++){var thisIOU=myBaseClient.getObject("IOUs/"+personName+"/"+peers[i]+currency+"/"+thisPeerIOUs[j]);thisPeerBalance+=thisIOU.amount}balance+=thisPeerBalance}return balance}function getBalances2(currency){var peers=myBaseClient.getListing("IOUs/"),balances={};for(var i=0;i<peers.length;i++){var peerName=peers[i].substring(0,peers[i].length-1);balances[peerName]=getBalance(peerName,currency)}return balances}function setBalance(date,peer,amount,currency){var obj={};obj[currency]=amount,myBaseClient.storeObject("balance",date+"/0/"+peer+"/balance",obj)}return{name:"money",dataVersion:"0.1",dataHints:{module:"Peer-to-peer bookkeeping based on IOUs (writing down who owes who how much)"},codeVersion:"0.1.0",exports:{reportTransfer:reportTransfer,addIOU:addIOU,addDeclaration:addDeclaration,groupPayment:groupPayment,getBalances2:getBalances2,setBalance:setBalance}}}),define("modules/money",function(){}),remoteStorage.defineModule("tasks",function(myPrivateBaseClient,myPublicBaseClient){function fire(eventType,eventObj){if(eventType=="error")for(var i=0;i<errorHandlers.length;i++)errorHandlers[i](eventObj)}function getUuid(){var uuid="",i,random;for(i=0;i<32;i++){random=Math.random()*16|0;if(i===8||i===12||i===16||i===20)uuid+="-";uuid+=(i===12?4:i===16?random&3|8:random).toString(16)}return uuid}function getPrivateList(listName){function getIds(){return myPrivateBaseClient.getListing(listName+"/")}function get(id){return myPrivateBaseClient.getObject(listName+"/"+id)}function set(id,title){var obj=myPrivateBaseClient.getObject(listName+"/"+id);obj.title=title,myPrivateBaseClient.storeObject("task",listName+"/"+id,obj)}function add(title){var id=getUuid();return myPrivateBaseClient.storeObject("task",listName+"/"+id,{title:title,completed:!1}),id}function markCompleted(id,completedVal){typeof completedVal=="undefined"&&(completedVal=!0);var obj=myPrivateBaseClient.getObject(listName+"/"+id);obj&&obj.completed!=completedVal&&(obj.completed=completedVal,myPrivateBaseClient.storeObject("task",listName+"/"+id,obj))}function isCompleted(id){var obj=get(id);return obj&&obj.completed}function getStats(){var ids=getIds(),stat={todoCompleted:0,totalTodo:ids.length};for(var i=0;i<stat.totalTodo;i++)isCompleted(ids[i])&&(stat.todoCompleted+=1);return stat.todoLeft=stat.totalTodo-stat.todoCompleted,stat}function remove(id){myPrivateBaseClient.remove(listName+"/"+id)}function on(eventType,cb){myPrivateBaseClient.on(eventType,cb),eventType=="error"&&errorHandlers.push(cb)}return myPrivateBaseClient.sync(listName+"/"),{getIds:getIds,get:get,set:set,add:add,remove:remove,markCompleted:markCompleted,getStats:getStats,on:on}}var errorHandlers=[];return{name:"tasks",dataHints:{module:"tasks are things that need doing; items on your todo list","objectType task":"something that needs doing, like cleaning the windows or fixing a specific bug in a program","string task#title":"describes what it is that needs doing","boolean task#completed":"whether the task has already been completed or not (yet)","directory tasks/todos/":"default private todo list","directory tasks/:year/":"tasks that need doing during year :year","directory public/tasks/:hash/":"tasks list shared to for instance a team"},exports:{getPrivateList:getPrivateList}}}),define("modules/tasks",function(){}),define("remoteStorage-modules",["./modules/calendar","./modules/deps/vcardjs-0.2.js","./modules/contacts","./modules/documents","./modules/money","./modules/tasks"],function(){return{}})})()