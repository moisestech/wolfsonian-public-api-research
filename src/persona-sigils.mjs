/**
 * Original visual experiments for eleven fictional interpretive personas.
 * Aperture is derived from the existing Archive Dreams mark; all inner
 * pictograms are new. This is NOT the museum's brand or staff insignia.
 */
export const APERTURE_PATH='M136,609L135,926L340,926L340,750Z M635,465L649,486L660,509L669,538L672,560L672,926L888,926L888,628Z M553,390L593,406L653,433L734,473L813,515L888,558L888,488L886,462L879,419L870,384L852,336L833,299L807,260L784,232Z M291,179L253,216L220,257L193,299L171,343L156,383L142,439L137,478L136,547L340,686L341,562L348,530L359,505L328,363Z M750,194L739,182L711,158L692,145L669,132L637,118L616,111L593,105L558,99L536,97L492,97L440,104L412,111L386,120L365,129L330,148L385,457L411,432L430,417L626,283Z';
const motifs={
  family:'<path d="M406 715 L512 617 L618 715" fill="none" stroke="currentColor" stroke-width="53" stroke-linejoin="round"/><path d="M442 728V847H582V728M496 847V764H532V847" fill="none" stroke="currentColor" stroke-width="45" stroke-linejoin="round"/>',
  tourist:'<circle cx="512" cy="740" r="96" fill="none" stroke="currentColor" stroke-width="42"/><path d="M552 676 478 783 497 716Z" fill="currentColor"/><circle cx="512" cy="740" r="22" fill="currentColor"/>',
  novice:'<path d="M396 741Q512 623 628 741Q512 854 396 741Z" fill="none" stroke="currentColor" stroke-width="43" stroke-linejoin="round"/><circle cx="512" cy="741" r="37" fill="currentColor"/>',
  connoisseur:'<path d="M512 614 629 730 512 849 396 730Z" fill="none" stroke="currentColor" stroke-width="47" stroke-linejoin="round"/><path d="M512 622V839M410 730H615" stroke="currentColor" stroke-width="34"/>',
  worker:'<path d="M425 664H588V718H548V852H478V718H425Z" fill="currentColor"/><path d="M580 628 631 680" stroke="currentColor" stroke-width="42" stroke-linecap="square"/>',
  archivist:'<path d="M408 644H615V845H408Z" fill="none" stroke="currentColor" stroke-width="46"/><path d="M412 712H612M452 784H571" fill="none" stroke="currentColor" stroke-width="40"/>',
  futurist:'<path d="M513 607 626 757H551V849H477V757H398Z" fill="currentColor"/><path d="M381 657H426M601 657H642" stroke="currentColor" stroke-width="35"/>',
  mourner:'<path d="M511 611Q494 667 447 723Q418 756 430 796Q446 855 511 863Q587 851 594 790Q595 754 572 721Q534 670 511 611Z" fill="currentColor"/>',
  propagandist:'<path d="M394 701H456L582 637V828L456 765H394Z" fill="currentColor"/><path d="M601 691Q647 740 601 784" fill="none" stroke="currentColor" stroke-width="33"/>',
  counterfeit:'<path d="M413 663H564V813H413Z" fill="none" stroke="currentColor" stroke-width="45"/><path d="M480 627H628V785H480" fill="none" stroke="currentColor" stroke-width="39"/><path d="M430 834 611 649" stroke="currentColor" stroke-width="43"/>',
  museum:'<path d="M512 607 633 673H393Z" fill="currentColor"/><path d="M415 694H463V814H415ZM489 694H537V814H489ZM562 694H610V814H562ZM395 825H633V866H395Z" fill="currentColor"/>'
};
export const PERSONA_SIGIL_IDS=Object.freeze(Object.keys(motifs));
export function personaSigilSvg(id,{mode='ink',variant='full'}={}){
  if(!Object.hasOwn(motifs,id))throw Error('Unknown persona emblem');
  if(!['ink','paper'].includes(mode)||!['full','compact'].includes(variant))
    throw Error('Invalid emblem variant');
  const color=mode==='ink'?'#142523':'#ffffff';
  const label=id==='museum'?'fictional museum perspective':id+' fictional perspective';
  const viewBox=variant==='compact'?'352 564 325 327':'0 0 1024 1024';
  const mark=variant==='compact'?'':'<path d="'+APERTURE_PATH+'"/>';
  return '<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="'+viewBox+'" role="img" aria-label="'+label+'"><g fill="'+color+'" style="color:'+color+'">'+mark+motifs[id]+'</g></svg>';
}
export function personaSigilUrl(id,options){
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(personaSigilSvg(id,options));
}
