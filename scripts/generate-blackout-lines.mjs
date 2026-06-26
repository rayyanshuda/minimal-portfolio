/**
 * Blackout poem line generator — every character is placed at its index in base.
 * Run: node scripts/generate-blackout-lines.mjs
 */

const base = "There is a space in me shaped exactly like you and nothing else fits";
const L = base.length;

/** Named column anchors in the base sentence */
const col = {
  T: 0,
  i_is: 6,
  a_9: 9,
  space: 11,
  c_space: 14,
  in: 17,
  me: 20,
  shaped: 23,
  h_shaped: 24,
  exactly: 30,
  a_exactly: 32,
  t_exactly: 34,
  like: 38,
  you: 43,
  and: 47,
  nothing: 51,
  else: 59,
  fits: 64,
};

function blank() {
  return Array(L).fill(" ");
}

function put(row, index, char) {
  if (index < 0 || index >= L) {
    throw new Error(`Index ${index} out of range for "${char}"`);
  }
  const expected = base[index];
  if (char !== expected && char !== ".") {
    throw new Error(
      `Column ${index}: placed "${char}" but base has "${expected}" (context: ...${base.slice(Math.max(0, index - 3), index + 4)}...)`,
    );
  }
  row[index] = char;
}

function fromPairs(pairs) {
  const row = blank();
  for (const [index, char] of pairs) put(row, index, char);
  return row.join("");
}

function fromText(start, text) {
  const row = blank();
  for (let i = 0; i < text.length; i++) put(row, start + i, text[i]);
  return row.join("");
}

function merge(...parts) {
  const row = blank();
  for (const part of parts) {
    for (let i = 0; i < L; i++) {
      if (part[i] !== " ") row[i] = part[i];
    }
  }
  return row.join("");
}

const likeYouDot = () =>
  merge(fromText(col.like, "like "), fromText(col.you, "you"), fromPairs([[46, "."]]));

const lines = [
  base,
  // i ache all
  fromPairs([
    [col.i_is, "i"],
    [col.a_9, "a"],
    [col.c_space, "c"],
    [col.h_shaped, "h"],
    [27, "e"],
    [col.a_exactly, "a"],
    [35, "l"],
    [col.like, "l"],
  ]),
  // alone.
  fromPairs([
    [col.a_exactly, "a"],
    [35, "l"],
    [44, "o"],
    [48, "n"],
    [col.else, "e"],
    [60, "."],
  ]),
  fromText(col.you, "you"),
  // eat
  fromPairs([
    [2, "e"],
    [25, "a"],
    [col.t_exactly, "t"],
  ]),
  merge(fromText(col.me, "me"), fromPairs([[22, "."]])),
  merge(fromText(0, "There is a space in me "), likeYouDot()),
  merge(fromText(col.a_9, "a space in me "), fromText(col.exactly, "exactly "), likeYouDot()),
  merge(fromText(col.you, "you"), fromPairs([[46, "."]])),
  fromText(col.nothing, "nothing else fits"),
  fromText(col.in, "in"),
  merge(fromText(col.a_9, "a "), fromText(col.shaped, "shape"), likeYouDot()),
  merge(
    fromPairs([
      [col.i_is, "i"],
      [col.a_9, "a"],
      [col.c_space, "c"],
      [col.t_exactly, "t"],
    ]),
    likeYouDot(),
  ),
  merge(fromPairs([[col.i_is, "i"]]), likeYouDot()),
  // i lost
  fromPairs([
    [col.i_is, "i"],
    [col.like, "l"],
    [44, "o"],
    [61, "s"],
    [66, "t"],
  ]),
  fromText(col.you, "you"),
  // my angel.
  merge(
    fromPairs([
      [col.me, "m"],
      [col.you, "y"],
    ]),
    fromText(col.and, "an"),
    fromPairs([[57, "g"]]),
    fromText(59, "el"),
    fromPairs([[61, "."]]),
  ),
];

for (const [i, line] of lines.entries()) {
  if (line.length !== L) {
    console.error(`Line ${i + 1}: length ${line.length}, expected ${L}`);
    process.exit(1);
  }
}

console.log(lines.join("\n"));
