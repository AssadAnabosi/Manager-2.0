/** The only place money is converted: JSON uses major units, D1 stores integer minor units. */
export const toMinor = (major: number): number => Math.round(major * 100);
export const toMajor = (minor: number): number => minor / 100;
