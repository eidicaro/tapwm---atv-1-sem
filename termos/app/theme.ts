export type AppColors = {
  background: string; backgroundSoft: string; surface: string; surfaceRaised: string;
  primary: string; primaryHover: string; primaryText: string; blue: string;
  text: string; textSecondary: string; textMuted: string; border: string;
  danger: string; dangerSoft: string; warning: string; warningSoft: string;
  successSoft: string; overlay: string;
};

export const darkColors: AppColors = {
  background: '#08111D', backgroundSoft: '#0D1928', surface: '#111F30', surfaceRaised: '#17283B',
  primary: '#42D6A4', primaryHover: '#67E3B8', primaryText: '#05251B', blue: '#7CB2FF',
  text: '#F5F8FC', textSecondary: '#B7C5D5', textMuted: '#879AAF', border: 'rgba(178, 202, 226, 0.18)',
  danger: '#FF7A8B', dangerSoft: 'rgba(255, 122, 139, 0.12)', warning: '#F8C96C',
  warningSoft: 'rgba(248, 201, 108, 0.12)', successSoft: 'rgba(66, 214, 164, 0.12)', overlay: 'rgba(2, 8, 16, 0.72)',
};

export const lightColors: AppColors = {
  background: '#F4F7F9', backgroundSoft: '#EAF0F3', surface: '#FFFFFF', surfaceRaised: '#F8FBFC',
  primary: '#087B60', primaryHover: '#06644F', primaryText: '#FFFFFF', blue: '#2563A8',
  text: '#142332', textSecondary: '#42566A', textMuted: '#607488', border: 'rgba(30, 62, 86, 0.16)',
  danger: '#B4233B', dangerSoft: 'rgba(180, 35, 59, 0.09)', warning: '#9A6500',
  warningSoft: 'rgba(154, 101, 0, 0.09)', successSoft: 'rgba(8, 123, 96, 0.09)', overlay: 'rgba(15, 28, 40, 0.48)',
};

export const colors = darkColors;
