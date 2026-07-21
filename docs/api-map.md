# Public API map

This repository uses endpoints documented by The Wolfsonian Digital Labs.

| Purpose | Pattern |
|---|---|
| Search results | `/engine/search/results/json?t={term}&p={page}&f={field}` |
| Search statistics | `/engine/search/stats/json?t={term}&f={field}` |
| Citation | `/engine/items/citation/json/{BibID}` |
| Citation + files | `/engine/items/brief/json/{BibID}` |
| Dublin Core XML | `/engine/items/xml/dc/{BibID}` |
| MODS XML | `/engine/items/xml/mods/{BibID}` |
| MARCXML | `/engine/items/xml/marc/{BibID}` |
| RDF/XML | `/engine/items/xml/rdf/{BibID}` |
| Random public item | `/engine/items/random` |

The official documentation notes that descriptive metadata may contain errors or omissions because many collection objects still await detailed research. This repository therefore treats metadata as a source record, not as a complete historical account.
