import { View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { Link, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from './theme';
export default function Header() {
  const { width } = useWindowDimensions(); const path = usePathname(); const mobile = width < 640;
  const Item = ({ href, label, icon }: { href: '/' | '/sugestao'; label: string; icon: keyof typeof Ionicons.glyphMap }) => {
    const active = href === '/' ? path === '/' : path.startsWith(href);
    return <Link href={href} asChild><Pressable style={({ hovered, pressed }) => [s.item, active && s.active, hovered && s.hover, pressed && s.pressed]}>
      {mobile ? <Ionicons name={icon} size={18} color={active ? colors.primary : colors.textSecondary} /> : <Text style={[s.link, active && s.linkActive]}>{label}</Text>}
    </Pressable></Link>;
  };
  return <View style={s.shell}><View style={s.inner}><Link href="/" asChild><Pressable style={s.brand}><View style={s.mark}><Text style={s.code}>{'<>'}</Text></View><View><Text style={s.name}>Dicionário Tech</Text>{!mobile && <Text style={s.by}>POR LAR SÃO FRANCISCO</Text>}</View></Pressable></Link><View style={s.nav}><Item href="/" label="Início" icon="home-outline" /><Item href="/sugestao" label="Sugerir termo" icon="bulb-outline" /></View></View></View>;
}
const s = StyleSheet.create({
  shell: { width: '100%', backgroundColor: 'rgba(7,17,31,.96)', borderBottomWidth: 1, borderBottomColor: colors.border, zIndex: 20 },
  inner: { width: '100%', maxWidth: 1180, height: 76, alignSelf: 'center', paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 11 }, mark: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOpacity: .25, shadowRadius: 12 },
  code: { color: '#06251B', fontSize: 14, fontWeight: '900' }, name: { color: colors.text, fontSize: 16, fontWeight: '800' }, by: { color: colors.textMuted, fontSize: 8, fontWeight: '700', letterSpacing: 1.2, marginTop: 2 },
  nav: { flexDirection: 'row', gap: 6 }, item: { minWidth: 42, height: 42, paddingHorizontal: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, active: { backgroundColor: 'rgba(50,214,160,.1)' }, hover: { backgroundColor: 'rgba(255,255,255,.06)' }, pressed: { opacity: .7 }, link: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' }, linkActive: { color: colors.primary },
});
