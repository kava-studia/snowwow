/* Only public campaign metadata. No user identifier, GPS or itinerary is sent. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SnowReferral=api})(typeof globalThis!=='undefined'?globalThis:this,()=>{
'use strict';
function url(raw,resort='catalog',campaign='resort-guide'){
 try{const u=new URL(raw);if(u.protocol!=='https:')return raw;u.searchParams.set('utm_source','snowwow');u.searchParams.set('utm_medium','referral');u.searchParams.set('utm_campaign',campaign);u.searchParams.set('utm_content',resort);return u.href}catch{return raw}
}
function activeOffer(affiliate,now=Date.now()){
 const o=affiliate?.offer;if(affiliate?.status!=='active'||!o||o.status!=='confirmed'||!o.code||!o.label||!o.termsUrl||!o.url)return null;
 const from=Date.parse(o.validFrom),to=Date.parse(o.validUntil);if(!Number.isFinite(from)||!Number.isFinite(to)||now<from||now>to)return null;
 try{if(new URL(o.termsUrl).protocol!=='https:'||new URL(o.url).protocol!=='https:')return null}catch{return null}
 return o;
}
return {url,activeOffer};
});
