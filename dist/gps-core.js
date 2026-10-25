(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.SnowGPS=factory()})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const radians=x=>x*Math.PI/180;
function distance(a,b){const lat=radians(b.lat-a.lat),lon=radians(b.lon-a.lon),n=Math.sin(lat/2)**2+Math.cos(radians(a.lat))*Math.cos(radians(b.lat))*Math.sin(lon/2)**2;return 6371000*2*Math.atan2(Math.sqrt(n),Math.sqrt(Math.max(0,1-n)))}
function fresh(){return {points:[],meters:0,maxSpeed:null,descent:0,hasAltitude:false,altAnchor:null,segment:0,rejected:0}}
function split(state){state.segment++;state.altAnchor=null}
function accept(state,fix,now=Date.now()){
const {lat,lon,accuracy,time}=fix;
if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180||!Number.isFinite(accuracy)||accuracy<0||accuracy>40||!Number.isFinite(time)||time>now+5000||now-time>60000){state.rejected++;return {accepted:false,reason:'accuracy'}}
let prev=state.points.at(-1),delta=prev?(time-prev.time)/1000:0;
if(prev&&time<=prev.time){state.rejected++;return {accepted:false,reason:'timestamp'}}
if(prev&&delta>45){split(state)}
const same=prev&&prev.segment===state.segment;
const meters=same?distance(prev,fix):0;
if(same&&delta>0&&meters/delta>55){state.rejected++;return {accepted:false,reason:'jump'}}
if(same&&meters<Math.max(4,Math.min(10,accuracy*.25)))return {accepted:false,reason:'stationary'};
const point={lat,lon,accuracy,time,segment:state.segment,altitude:Number.isFinite(fix.altitude)?fix.altitude:null,altitudeAccuracy:Number.isFinite(fix.altitudeAccuracy)?fix.altitudeAccuracy:null,speed:Number.isFinite(fix.speed)&&fix.speed>=0&&fix.speed<=55?fix.speed:null};
state.points.push(point);state.meters+=meters;
if(accuracy<=25){const speed=point.speed!==null?point.speed:(same&&delta>=1?meters/delta:null);if(speed!==null&&speed<=55)state.maxSpeed=Math.max(state.maxSpeed??0,speed)}
if(point.altitude!==null&&point.altitudeAccuracy!==null&&point.altitudeAccuracy<=15){state.hasAltitude=true;if(state.altAnchor===null)state.altAnchor=point.altitude;else{const dz=point.altitude-state.altAnchor;if(Math.abs(dz)>=Math.max(3,point.altitudeAccuracy*.5)){if(dz<0)state.descent-=dz;state.altAnchor=point.altitude}}}else state.altAnchor=null;
return {accepted:true,point};
}
function gpx(s){const groups=[];for(const p of s.points){let a=groups.at(-1);if(!a||a[0].segment!==p.segment){a=[];groups.push(a)}a.push(p)}return '<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="SnowWow" xmlns="http://www.topografix.com/GPX/1/1"><trk><name>SnowWow ride</name>'+groups.map(a=>'<trkseg>'+a.map(p=>'<trkpt lat="'+p.lat+'" lon="'+p.lon+'">'+(p.altitude!==null?'<ele>'+p.altitude+'</ele>':'')+'<time>'+new Date(p.time).toISOString()+'</time></trkpt>').join('')+'</trkseg>').join('')+'</trk></gpx>'}
return {distance,fresh,split,accept,gpx};
});
