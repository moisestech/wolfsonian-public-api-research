from pathlib import Path
import sys
ROOT=Path(sys.argv[1]) if len(sys.argv)>1 else Path('flat-persona-kit-v1')
ROOT.mkdir(parents=True,exist_ok=True)
ring='<circle cx="256" cy="256" r="222" fill="none" stroke="currentColor" stroke-width="24"/>'
shapes={
'family':'''<path d="M91 226Q256 49 421 226Q256 114 91 226Z"/><path d="M107 409V347Q119 313 156 305V277Q129 260 130 227Q130 180 173 180Q211 180 215 221L229 241L212 250Q208 277 185 280V305Q226 322 249 409Z"/><path d="M268 409Q281 343 324 329V308Q303 300 301 279L289 271L301 256Q305 221 337 221Q376 221 376 259Q377 294 351 309V329Q394 342 406 409Z"/>''',
'tourist':'''<path fill-rule="evenodd" d="M98 246Q198 150 298 246Q198 342 98 246ZM133 246Q198 187 263 246Q198 305 133 246Z"/><circle cx="198" cy="246" r="30"/><path d="M225 199L349 104L323 189L298 175L242 236Z"/><path d="M98 350H414V374H98Z"/><path d="M301 350A47 47 0 0 1 395 350Z"/><path d="M130 421L242 374H267L222 421ZM280 374H300L386 421H315Z"/>''',
'novice':'''<path d="M108 410V362Q116 326 153 314V293Q128 284 125 258Q116 223 132 204Q151 181 178 192Q203 201 207 232L220 250L206 259Q202 289 181 295V314Q226 335 238 410Z"/><path fill-rule="evenodd" d="M260 130H407V313H260ZM283 153V290H384V153Z"/><path d="M333 176Q339 212 365 222Q339 230 333 267Q327 230 301 222Q327 212 333 176Z"/><path d="M208 164L231 151L249 190ZM222 217L250 213V236ZM227 264L249 251L251 282Z"/>''',
'connoisseur':'''<path fill-rule="evenodd" d="M228 189Q320 109 412 189Q320 268 228 189ZM261 189Q320 143 379 189Q320 235 261 189Z"/><circle cx="320" cy="189" r="28"/><path d="M99 402V370H123L148 338V310Q123 294 126 265Q110 259 123 242Q118 217 138 207Q137 183 163 181Q179 164 198 179Q224 174 233 199Q243 211 233 229L247 251L233 263Q230 291 207 304V338L239 370H260V402Z"/><path d="M111 158Q198 75 301 108Q190 99 111 180Z"/>''',
'worker':'''<path d="M103 313A140 140 0 0 1 239 115V148A107 107 0 0 0 135 306Z"/><path d="M91 249H126V282H91ZM105 178L138 192L126 222L93 208ZM147 126L171 151L148 174L124 149ZM208 96H241V135H208Z"/><path d="M139 381L290 180L318 201L168 403Z"/><path d="M269 169L306 119L377 173L339 223Z"/><path d="M241 410L223 350Q210 330 226 309L252 276Q262 264 274 274L283 283L309 247Q318 234 330 244Q342 252 335 267L300 320Q298 341 276 359L282 410Z"/><path d="M219 281Q211 272 220 261L244 231Q253 221 263 230Q272 238 263 250L239 280Q230 290 219 281ZM201 305Q191 297 200 285L214 267L233 282L221 300Q212 315 201 305Z"/>''',
'archivist':'''<path fill-rule="evenodd" d="M100 222Q256 83 412 222Q256 360 100 222ZM143 222Q256 123 369 222Q256 321 143 222Z"/><circle cx="256" cy="222" r="45"/><path d="M238 80H274V133H238ZM186 110H214V148H186ZM298 110H326V148H298Z"/><path d="M110 332Q177 307 246 347V418Q177 378 110 402ZM266 347Q335 307 402 332V402Q335 378 266 418Z"/>''',
'futurist':'''<path d="M226 416V363Q245 340 256 309Q243 284 244 259Q229 242 247 227L253 202Q259 163 295 153Q336 145 359 176Q373 194 373 218L393 241Q400 249 387 254L375 257L379 278Q375 285 365 286L374 297Q375 306 363 309L346 309Q332 314 313 304V357L351 416Z"/><path d="M102 146L235 178L259 152L135 110ZM86 214L235 223L242 193L96 181ZM102 292L242 263L235 238L90 256Z"/>''',
'mourner':'''<path d="M113 410Q118 326 142 267Q125 235 140 203Q161 149 213 157Q252 162 286 153Q314 145 333 122Q333 158 305 187Q288 203 266 206L282 225Q287 233 274 239L260 242Q259 262 243 271L229 278Q206 280 189 263Q165 326 166 410Z"/><path d="M316 266Q292 306 292 320A24 24 0 0 0 340 320Q340 306 316 266Z"/><path d="M182 409Q276 341 377 409L391 429Q281 376 182 429Z"/>''',
'propagandist':'''<path d="M97 411V348Q109 319 147 310V286Q125 272 125 252Q117 238 131 227L131 203Q142 177 166 185Q185 191 192 212L211 232Q218 241 206 246L194 249Q196 269 178 281V310Q225 336 238 411Z"/><path fill-rule="evenodd" d="M216 224L340 168V313L216 258ZM317 202L243 236L317 269Z"/><path d="M239 278L271 292L256 346H227Z"/><path d="M357 173L410 137L425 167L357 199ZM357 224H425V253H357ZM357 278L423 302L410 333L357 305Z"/>''',
'counterfeit':'''<path fill-rule="evenodd" d="M139 145Q187 112 243 133L260 157L230 226L242 254L216 282L210 338L170 365Q120 337 110 297L124 274L105 257L123 231Q118 186 139 145ZM139 212Q166 187 194 209Q171 230 139 212Z"/><path fill-rule="evenodd" d="M283 147Q341 124 381 159Q408 188 393 233L410 257L390 272L396 296Q382 335 345 352L345 410H259V361L242 333L249 291L267 261L252 235ZM300 215Q326 191 356 211Q333 234 300 215Z"/>''',
'museum':'''<path d="M106 165H406V190H106ZM143 139H369V158H143ZM181 113H331V134H181ZM224 88H288V108H224Z"/><path d="M126 201H153V388H126ZM359 201H386V388H359ZM109 398H403V420H109Z"/><path d="M176 388V261Q176 181 256 181Q336 181 336 261V388H313V261Q313 206 256 206Q199 206 199 261V388Z"/><path d="M232 246H280V265Q270 274 276 286Q299 305 291 333Q287 351 271 359H241Q225 351 221 333Q213 305 236 286Q242 274 232 265Z"/><path d="M230 368H282V388H230ZM215 389H297V401H215Z"/>''',
}
labels={'family':'Family','tourist':'Tourist','novice':'Art Novice','connoisseur':'Art Connoisseur','worker':'Worker','archivist':'Archivist','futurist':'Futurist','mourner':'Mourner','propagandist':'Propagandist','counterfeit':'Counterfeit','museum':'Museum'}
def svg(body,color):return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" style="color:{color}"><g fill="currentColor">{ring}{body}</g></svg>'
import cairosvg
for ident,body in shapes.items():
 for tone,color in [('white','#ffffff'),('ink','#142523')]:
  folder=ROOT/ident;folder.mkdir(exist_ok=True)
  src=svg(body,color);(folder/f'{ident}-{tone}.svg').write_text(src)
  for size in [32,48,128,512]:cairosvg.svg2png(bytestring=src.encode(),write_to=str(folder/f'{ident}-{tone}-{size}.png'),output_width=size,output_height=size)
rows=['<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1160" viewBox="0 0 1200 1160"><rect width="1200" height="1160" fill="#f6f4eb"/><rect x="240" y="70" width="460" height="1080" fill="#142523"/><g font-family="sans-serif" fill="#142523"><text x="25" y="32" font-size="22">Archive Society — clean circular symbol masters</text><text x="25" y="56" font-size="13">Native-size checks at 32 and 48 pixels • larger 80px reference • white and ink</text></g>']
for i,(ident,body) in enumerate(shapes.items()):
 y=90+i*94
 rows.append(f'<text x="25" y="{y+43}" font-family="sans-serif" font-size="17" fill="#142523">{labels[ident]}</text>')
 for start,color in [(260,'#fff'),(750,'#142523')]:
  for offset,size in [(0,80),(150,48),(290,32)]:
   rows.append(f'<g transform="translate({start+offset},{y+(80-size)/2}) scale({size/512})" style="color:{color}" fill="currentColor">{ring}{body}</g>')
rows.append('</svg>');review=''.join(rows)
(ROOT/'size-review.svg').write_text(review);cairosvg.svg2png(bytestring=review.encode(),write_to=str(ROOT/'size-review.png'))
(ROOT/'README.txt').write_text('Archive Society flat circular persona symbols v1.\n11 individual vector redraws based on the approved 21 November concept family.\nTransparent SVG masters and PNG exports at 32, 48, 128 and 512 pixels in white and ink.\nAll rings share center 256,256, radius 222 and stroke width 24 within a 512px viewBox.\nApproved by Moises Sanabria on 21 November 2026. Rebuilding exports does not publish or change the live app. Museum is a fictional artist-authored viewpoint.\n')
print(ROOT)
