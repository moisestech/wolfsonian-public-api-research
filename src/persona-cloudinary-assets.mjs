/**
 * Versioned Cloudinary delivery for the 11 artist-authored persona symbols.
 * Only public original vector artwork; never museum collection imagery.
 * Generated from docs/design/persona-cloudinary-manifest.json.
 */
const VERSION = Object.freeze({
  "family": {
    "full": {
      "white": 1795048530,
      "ink": 1795048817
    },
    "compact": {
      "white": 1795048533,
      "ink": 1795048821
    }
  },
  "tourist": {
    "full": {
      "white": 1795048537,
      "ink": 1795048826
    },
    "compact": {
      "white": 1795048542,
      "ink": 1795048830
    }
  },
  "novice": {
    "full": {
      "white": 1795048546,
      "ink": 1795048834
    },
    "compact": {
      "white": 1795048551,
      "ink": 1795048838
    }
  },
  "connoisseur": {
    "full": {
      "white": 1795048556,
      "ink": 1795048842
    },
    "compact": {
      "white": 1795048561,
      "ink": 1795048845
    }
  },
  "worker": {
    "full": {
      "white": 1795048566,
      "ink": 1795048849
    },
    "compact": {
      "white": 1795048570,
      "ink": 1795048853
    }
  },
  "archivist": {
    "full": {
      "white": 1795048481,
      "ink": 1795048857
    },
    "compact": {
      "white": 1795048574,
      "ink": 1795048861
    }
  },
  "futurist": {
    "full": {
      "white": 1795048578,
      "ink": 1795048872
    },
    "compact": {
      "white": 1795048582,
      "ink": 1795048876
    }
  },
  "mourner": {
    "full": {
      "white": 1795048585,
      "ink": 1795048881
    },
    "compact": {
      "white": 1795048589,
      "ink": 1795048886
    }
  },
  "propagandist": {
    "full": {
      "white": 1795048592,
      "ink": 1795048889
    },
    "compact": {
      "white": 1795048598,
      "ink": 1795048893
    }
  },
  "counterfeit": {
    "full": {
      "white": 1795048602,
      "ink": 1795048897
    },
    "compact": {
      "white": 1795048606,
      "ink": 1795048900
    }
  },
  "museum": {
    "full": {
      "white": 1795048630,
      "ink": 1795048905
    },
    "compact": {
      "white": 1795048634,
      "ink": 1795048909
    }
  }
});
const CLOUD='https://res.cloudinary.com/dck5rzi4h/image/upload/';
const FOLDER='archive-dreams/brand/personas/';
export const PERSONA_ASSET_IDS=Object.freeze(Object.keys(VERSION));
// Artwork studies. They are not speaking identities and never enter the lens list.
const DECO_STUDIES=Object.freeze({
  'aperture-mask':1795048670,
  'guardian-emblem':1795048675,
  'mask-emblem':1795048679
});
export const DECO_STUDY_IDS=Object.freeze(Object.keys(DECO_STUDIES));
export function decoStudyUrl(id,{format='svg'}={}){
  if(!Object.hasOwn(DECO_STUDIES,id))throw new Error('Unknown deco study');
  if(!['svg','png'].includes(format))throw new Error('Unsupported persona asset');
  const transformation=format==='png'?'c_scale,w_512/f_png/':'';
  return CLOUD+transformation+'v'+DECO_STUDIES[id]+'/'+FOLDER+'deco-'+id+'-white-v1.'+format;
}
export function personaAssetUrl(id,{tone='white',variant='full',format='svg'}={}){
  if(!Object.hasOwn(VERSION,id))throw new Error('Unknown persona symbol');
  if(!['white','ink'].includes(tone)||!['full','compact'].includes(variant)||!['svg','png'].includes(format))
    throw new Error('Unsupported persona asset');
  const version=VERSION[id][variant][tone];
  if(!version)throw new Error('Persona asset not uploaded');
  const transformation=format==='png'?'c_scale,w_'+(variant==='compact'?128:512)+'/f_png/':'';
  return CLOUD+transformation+'v'+version+'/'+FOLDER+id+'-'+tone+'-'+variant+'-v1.'+format;
}
