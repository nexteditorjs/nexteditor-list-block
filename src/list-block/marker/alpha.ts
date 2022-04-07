const CharCodeALowerCase = 97;

// convert number to alphabet
export function numberToAlpha(num: number): string {
  if (num <= 0) {
    return `${num}`;
  }
  const mod = (num - 1) % 26;
  const pow = Math.floor((num - 1) / 26);
  const out = String.fromCharCode(CharCodeALowerCase + mod);
  return pow ? numberToAlpha(pow) + out : out;
}
