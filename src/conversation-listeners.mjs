// Each scene has a spoken detail, an evidence lead to explore, and a Family question.
// Perspective wording is independent of the object dialogue and playback.
const rooms = new Map([
  ["opening-skilled-work-lottery",["a lottery ticket beside the title Skilled Work","an exhibition checklist","Who could buy a ticket, and whose work would the ticket leave out?"]],
  ["opening-skilled-work-woman-exhibition",["a century in the exhibition title beside one working day","an exhibition caption","If you could show one day of work from the munitions print, what would you put in the exhibition?",["mourner","Which worker in the munitions print would you try to find in the exhibition checklist, and what if the checklist gives you only dates?"]]],
  ["opening-skilled-work-engine",["the word skilled beside an engine that gets named","a worker’s account","Which part of making the engine would a worker name that neither title tells us?"]],
  ["opening-skilled-work-workers-vote",["the invitation to notice skilled work beside the call to vote","a circulation record","What would you need in order to act on the call to vote after noticing the work?"]],
  ["opening-skilled-work-1939",["1917 and 1939 beside the word progress","an account from a worker in either period","How might you hear the word progress differently if your work supplied a war?"]],
  ["opening-skilled-work-aircraft",["the workshop in Skilled Work and the aircraft named above the Colosseum","the aircraft photograph and its caption","If you looked up at the aircraft first, which part of somebody’s working day could you miss?"]],
  ["machines-engine-safety",["the engine in one title and the splinter in the other","a workshop safety instruction or a worker’s account","What would make the warning useful to the person who actually had to do the grinding?",["worker","Whose account could tell you what the person grinding the metal was expected to do when one splinter could cost an eye?"]]],
  ["machines-vote-engine",["the engine print beside an invitation to vote","a record of who received the voting poster","What would the voting poster let the people pictured at work do, if they could act on it?"]],
  ["politics-1939-atlantic-wall",["the two dates on Atlantic Wall beside the title 1939 A.D.","a record of the Atlantic Wall poster’s audience","What would you already have to know about 1918 for the poster’s comparison to make sense?"]],
  ["politics-uboats-1939",["the word ‘our’ in the U-boats title beside the year 1939","a publisher or distribution record","Who could hear themselves included in the word ‘our’, and who might hear it differently?",["counterfeit","If someone said both posters addressed the same public, what would their publishers or distribution records have to show?"]]],
  ["challenge-robeson-architectural-fantasy",["the name Emperor Jones beside a hillside house under a Trees tag","a close view or caption for each work","If you hid the Trees tag, what would make you want to keep the portrait and the house together?"]],
  ["commerce-biennale-dye",["an invitation to look at art beside an ad for dye","a legible image of both printed designs","How would you tell whether the image was inviting you into an exhibition or asking you to buy dye?"]],
  ["politics-east-indies-1939",["the call to work and fight beside the title 1939 A.D.","a publisher’s credit or a record of circulation","Who could answer the poster’s demand, and what would you learn from finding its publisher?",["propagandist","Who is being asked to work and fight, and whose name in the publisher’s credit might change how you hear that command?"]]],
  ["challenge-utrecht-living-rise",["the number in the Utrecht Fair title and the word ‘let’ in the poster title","a close view of the two works","What could you tell from the two titles if you had never seen the Water tag?"]],
  ["politics-invader-1939",["the warning about an invader beside the dated title","an account from the public the warning addressed","Whose account would let you hear what the threatened future felt like?"]],
  ["commerce-heels-biennale",["a heel advertisement and an exhibition notice tagged with mythological figures","a close view of both visuals","What catches your eye before you know which image is selling a pair of heels?"]],
  ["TD1989.317.66::TD1990.340.141",["the lottery ticket beside a title that spans a century","a checklist or an installation record","Whose work might appear in an installation record but disappear from a list of prizes?"]],
  ["XX1990.2907::XX1990.3843",["the years 1943 and 1918 beside the ‘our’ of the U-boats poster","distribution records for the two posters","How does being asked to remember a date differ from being asked to join the word ‘our’?"]],
  ["XX1990.3275::XX1990.3277",["a dye swatch and a picture of a heel","a full view of both advertisements","Which promise could you test yourself before buying, and what would you have to take on trust?"]],
  ["TD1990.340.146::XX1990.2880",["the commands and pronouns in two posters linked by a Flags tag","accounts from readers or people depicted","Whose words would you put beside these posters to hear an answer to their appeals?"]],
  ["who-narrates-tomorrow",["the Futurama book spread beside the invitation that names Harlem","the leaflet itinerary or a visitor’s own account","If you started with the Harlem leaflet, what would you look for on a fair map that the Futurama spread leaves open?",["tourist","If you followed the Harlem leaflet’s itinerary, where could your route differ from the future city laid out in the Futurama spread?"]]],
  ["which-future-is-refused",["the unexecuted warning beside the built fair emblem","the checklist and a record of the decision","What would you want a label to say if all you knew was that one work was built and the other was refused?"]],
  ["who-builds-the-future",["the sculpted hands raising iron and the print’s use of ‘skilled’","a record that names a person and their task","What can you find out about the people doing the work from the sculpture and from the print’s title?",["worker","Which tasks can you make out in the ironworkers’ sculpture, and what does the munitions print make you infer from the word ‘skilled’?"]]],
  ["cost-of-iron",["the distance from the tower to the word ‘eye’ on the warning","a closer view of the sculpture and the poster","When you move closer, does the splinter change what you think the tower owes its workers?"]],
  ["room-for-a-warning",["a warning that stayed unbuilt beside a printed instruction to grind safely","a record of a display decision or a posted warning","Where would you have to encounter each warning for it to tell you what to do?"]],
  ["city-from-a-window",["the hillside doorstep under a city viewed from above","a street plan or the house drawing","If both your hands were full, what would you need to know about getting from the street to that door?"]],
  ["terms-of-entry",["an invitation to travel and a ticket that offers a chance","a visitor itinerary or an admission record","What would an invitation have to offer besides a destination to make the trip possible?"]],
  ["date-on-tomorrow",["a proposed date on a future city’s entrance and the title 1939 A.D.","a reader’s own record from 1939","How would the entrance sign read to someone living in 1939 and to someone looking back at it?",["futurist","What would you look for in the 1939 object to tell what a reader might already have known that the future city on the Futurama page leaves open?"]]],
  ["fair-counts",["the address to Harlem beside the number in Tenth Utrecht Fair","an invitation list or a record of attendance","Who would you miss if you counted only the people who got through the gate?"]],
  ["heel-and-working-day",["an imagined worn heel beside the Women’s Labor lottery","an account of wearing or making the shoe","What could wear tell you about a working day, and what would you still ask the wearer?"]],
  ["permission-to-rise",["the word ‘let’ beside the model of a warning that was refused","a decision record or an exhibition label","Who would you expect to be able to say ‘let’, and could you tell from the works alone?"]],
  ["catalogue-meets-engine",["the words ‘Machine Age’ beside the act of making one engine","a catalogue page or a record of a manufacturing task","What do you get to see when you name an engine somebody makes instead of naming an age?"]],
  ["radio-meets-futurama",["a radio dial beside a future city laid out across a book spread","the spread and a contemporary account of listening or visiting","Where could you change what happens next when turning the dial and when opening the book?",["novice","Point to one place where someone can make a choice with the radio, and one place where the printed page leaves the choice to its reader. What can you actually see?"]]],
  ["globe-and-theme-center",["a world held in clay and a fair’s buildings reduced to a model","a map or scale drawing showing what lies beyond the model","When you hold a little world in front of you, what tells you where its edges are?"]],
  ["catalogue-and-globe",["the catalogue’s broad title beside separate design credits for a vase","the vase’s catalogue record or a credited catalogue entry","What would disappear from the vase’s story if you kept the title and removed the names?"]],
  ["poster-and-theme-center",["an invitation to a future fair beside a model that gives it a shape","a fair itinerary, ticket or known visitor photograph","What could you plan from the poster and model, and what would tell you somebody actually made the trip?"]],
  ["radio-and-television",["the difference between a dial and a room looking at one screen","a household account of listening or viewing","Who got to decide what the household heard or watched, and what would a visitor’s account tell us about that?",["archivist","Would a repair record tell you who sat by the dial, or would you need a different kind of household account to find out who chose what to watch?"]]],
  ["poster-and-program",["a poster calling to a crowd beside a program that says ‘your’","an itinerary or admission record","What would you need to get to the fair after the program called its future yours?"]],
  ["television-and-booklet",["a screen that goes dark beside a booklet you can reopen","an account of watching the set or keeping the booklet","What might you remember from the television that you could never find again simply by opening a booklet?",["futurist","What does a booklet put in your hands that a picture on a screen can only put in front of you?"]]],
  ["program-and-booklet",["the ‘your’ on a fair program beside a booklet you could take home","a reader’s account or a surviving itinerary","If somebody saved the booklet, what would you ask them about the promise on the program?"]],
]);

const perspectiveQuestions = {
  tourist: detail => `Start with ${detail}. Where would you go to see what each work is asking you to notice?`,
  novice: detail => `Looking at ${detail}, what could you point to that someone else might have missed?`,
  connoisseur: detail => `With ${detail} in view, where would you look for a choice of wording, material, or composition that changes the comparison?`,
  worker: detail => `Thinking about ${detail}, whose work would you need to see to understand how the two objects came to be used?`,
  archivist: (detail, lead) => `What could ${lead} establish about ${detail}, and what would it still leave open?`,
  futurist: detail => `Looking at ${detail}, what possibility does one work seem to open that the other makes harder to imagine?`,
  mourner: detail => `Thinking of ${detail}, whose experience is hardest to recover, and what might still let you hear from them?`,
  propagandist: detail => `Looking at ${detail}, which words or choices ask you to take a side, and who might push back?`,
  counterfeit: (detail, lead) => `If you treated ${detail} as proof of a shared story, what would ${lead} need to show before you believed it?`,
  museum: detail => `If you built a display around ${detail}, what should the label say so a visitor can tell where the comparison begins?`,
};

export function conversationListenerQuestion(sceneId, perspectiveId) {
  const room = rooms.get(sceneId);
  if (!room) return undefined;
  const [detail, lead, family, featured] = room;
  if (featured?.[0] === perspectiveId) return featured[1];
  return Object.hasOwn(perspectiveQuestions, perspectiveId) ? perspectiveQuestions[perspectiveId](detail, lead) : family;
}
