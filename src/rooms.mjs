export const rooms=[
 {id:'oak',title:'Warm oak',region:'Signature',description:'Natural, quiet, inviting.',image:'closet-room.webp'},
 {id:'gallery',title:'Gallery light',region:'Signature',description:'An airy wardrobe gallery.',image:'closet-gallery.webp'},
 {id:'midnight',title:'After hours',region:'Signature',description:'Dark cabinetry, warm illumination.',image:'closet-midnight.webp'},
 {id:'streetwear',title:'Brooklyn loft',region:'North America · Streetwear',description:'Concrete, steel and a sneaker wall.',image:'rooms/streetwear.webp'},
 {id:'london',title:'London townhouse',region:'Europe · England',description:'Sage cabinetry and herringbone oak.',image:'rooms/london.webp'},
 {id:'kyoto',title:'Kyoto studio',region:'Asia · Japan',description:'Cedar, soft daylight and quiet lines.',image:'rooms/kyoto.webp'},
 {id:'marrakech',title:'Marrakech atelier',region:'Africa · Morocco',description:'Clay plaster, arches and woven texture.',image:'rooms/marrakech.webp'},
 {id:'saopaulo',title:'São Paulo modern',region:'South America · Brazil',description:'Concrete, rich timber and tropical greenery.',image:'rooms/saopaulo.webp'},
 {id:'sydney',title:'Sydney coastal',region:'Oceania · Australia',description:'Pale oak, linen and ocean light.',image:'rooms/sydney.webp'},
 {id:'polar',title:'Polar cabin',region:'Antarctica · Inspired retreat',description:'Warm timber with an icy horizon.',image:'rooms/polar.webp'}
];
export function roomById(id){return rooms.find(r=>r.id===id)||rooms[0]}
export function roomSettings(value={}){return {light:['day','golden','evening'].includes(value.light)?value.light:'day',accent:['sand','sage','clay','ink'].includes(value.accent)?value.accent:'sand',decor:['bench','plant','rail','none'].includes(value.decor)?value.decor:'none',position:['left','center','right'].includes(value.position)?value.position:'right'}}
