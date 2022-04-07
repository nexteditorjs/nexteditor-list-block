import { numberToAlpha } from './alpha';
import { numberToRomanNumeral } from './roman-numerals';

function numberToNumber(num: number): string {
  return `${num}`;
}

function toNumberMarker(num: number) {
  return `${numberToNumber(num)}.`;
}

function toAlphaMarker(num: number) {
  return `${numberToAlpha(num)}.`;
}

function toRomanMarker(num: number) {
  return `${numberToRomanNumeral(num)}.`;
}

//
const converter = [
  toNumberMarker,
  toAlphaMarker,
  toRomanMarker,
];

export function startToMarker(level: number, start: number): string {
  if (level < 1) return `${start}.`;
  //
  const fun = converter[(level - 1) % converter.length];
  return fun(start);
}
