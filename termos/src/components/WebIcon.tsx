import glyphMap from '@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/Ionicons.json';
import type { Term } from '../lib/dictionary';

export type IconName = keyof typeof glyphMap;
export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  // The official icon font stays inline, including inside server-rendered paragraphs.
  return <span className="tech-icon" aria-hidden="true" style={{ fontSize: size }}>{String.fromCodePoint(glyphMap[name])}</span>;
}
export function TermIcon({ term, large = false }: { term: Term; large?: boolean }) {
  const mapping: [RegExp, IconName, string][] = [
    [/api|rede|network|internet/, 'git-network-outline', 'blue'], [/seguran|antiv|security/, 'shield-checkmark-outline', 'blue'],
    [/algorit|process/, 'flash-outline', 'green'], [/backup|armazen/, 'save-outline', 'purple'],
    [/bug|erro/, 'bug-outline', 'rose'], [/data|dados|sql|banco/, 'server-outline', 'orange'],
    [/front|back|código|code|program/, 'code-slash-outline', 'orange'], [/cloud|nuvem/, 'cloud-outline', 'blue'],
    [/ia|intelig|machine/, 'hardware-chip-outline', 'purple'], [/b\.i|business/, 'bar-chart-outline', 'orange'],
  ];
  const found = mapping.find(([pattern]) => pattern.test(term.termo.toLowerCase()));
  return <span className={`term-icon tone-${found?.[2] ?? 'green'} ${large ? 'large' : ''}`}><Icon name={found?.[1] ?? 'terminal-outline'} size={large ? 35 : 23} /></span>;
}
