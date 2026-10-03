export const COSTUME_PROMPT = `You are given two images:
- THE PHOTO (image 1, the first image): a real photograph taken by the user. This is the only image you edit.
- THE REFERENCE (image 2, the second image): an illustrated parrot character, used ONLY as a reference for clothing and wearable accessory designs. Never edit or return it.
If the order is ever unclear, treat the real photograph as THE PHOTO and the illustration as THE REFERENCE.

STEP 1: FIND THE BIRD IN THE PHOTO
The costume recipient is a real, living bird in the photo. Any living bird species is eligible, including parrots, ducks, chickens, geese, and pigeons.
A toy bird, plush bird, figurine, statue, sculpture, model, ornament, drawing, painting, printed or on-screen image, decoy, or taxidermy specimen is not a living bird and is not eligible.
If the photo contains no living bird, return the photo unchanged with no edits. Never add a bird, and never turn another animal, toy, plant, person, or object into a bird. A bird in the reference does not count as a bird in the photo.
If there are several birds, dress only the largest bird in the foreground. If a person, hand, or non-bird animal is present, leave it unchanged. Never put the costume on a person, their clothes, or a non-bird animal.

STEP 2: DRESS ONLY THAT BIRD
Fit a physically plausible miniature version of the garments and wearable accessories that the character in the reference is wearing onto the bird's existing body and pose, without changing its anatomy.
Transfer only the garment colors and types, wearable accessories, and the trim, fasteners, and motifs visibly attached to those items. Adapt only the fit and placement to the photographed bird's species, size, and shape. Interpret any illustrated or polygonal costume as real material, without transferring its drawing style to the photo.
If the costume in the reference has a hood, wear the hood up over the head, leaving the face, eyes, and beak uncovered. If it has no hood, do not add a hood, cowl, or any other head covering.
Render only materials and construction details supported by the costume in the reference. Do not introduce extra seams, metal parts, gemstones, or ornamentation. Never add chains, brooches, badges, pins, medals, buttons, jewelry, or any other hardware unless that exact item is clearly visible on the reference costume; when unsure, leave it out. Match the photo's lighting, color temperature, perspective, focus, and grain, with small contact shadows only where the costume touches the bird.
Ignore every handheld or non-wearable object in the reference. Do not copy it, attach it to the costume, or add straps, clips, pockets, or holders to carry it. Ignore all surrounding symbols, effects, and decorations in the reference, such as hearts, stars, sparkles, music notes, speech bubbles, motion marks, furniture, floors, containers, and scenery. Do not create human hands or limbs.

STEP 3: KEEP EVERYTHING ELSE EXACTLY AS IT IS
- The bird: keep the exact photographed bird from the photo, never the character in the reference. Keep its species, facial anatomy, eye size, shape, position and gaze, iris and pupil appearance, the exact diameter, thickness, contour and color of each eye ring and surrounding bare skin, beak, exposed skin, feather colors and texture, natural head shape, crest or lack of crest, wings, feet, tail, body proportions, pose, and expression. Do not straighten, rotate, reposition, resize, or restyle the bird, replace feathers, invent missing body parts, or transform it into a mascot.
- The eyes: do not redraw, enlarge, round, beautify, recolor, or reposition the eyes or eye rings. Do not magnify them through lenses. Only eyewear worn by the character in the reference may newly occlude the eyes; preserve all remaining visible eye and eye-ring details exactly. Do not newly cover the beak or reveal anatomy that was hidden or outside the original frame.
- Position and scale: the bird must stay at exactly the same pixel position and size as in the photo. If the bird is small, off-center, or cut off by an edge of the photo, leave it exactly like that. Do not move it toward the center, enlarge it, or reveal parts outside the frame.
- The rest of the photo: keep its people, hands, other animals, objects, background, existing text, lighting, camera angle, depth of field, aspect ratio, composition, and framing. Do not crop, zoom, extend, recompose, or replace the background. Limit edits to the costume, its necessary occlusion, and small contact shadows on the bird.

Do not add text, letters, numbers, labels, frames, stickers, or watermarks. No polygon rendering, paper-cut style, cartoon, chibi proportions, mascot redesign, painted feathers, extra birds, collage, or recreation of the reference.

Before returning, check: if the photo contains no living bird, return the photo unchanged. Otherwise, verify that the same bird remains in the same place, size, and pose, that only garments and wearable accessories from the reference were added, and that all other content of the photo is unchanged. Return only the resulting photograph.`;
