import { View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { Link, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../src/context/ThemeContext';
import { AppColors } from './theme';
export default function Header() {
  const { width } = useWindowDimensions(); const path = usePathname(); const mobile = width < 680;
  const { colors, isDark, toggleTheme } = useAppTheme(); const s = makeStyles(colors);
  const Item = ({ href, label, icon }: { href: '/' | '/sugestao'; label: string; icon: keyof typeof Ionicons.glyphMap }) => {
    const active = href === '/' ? path === '/' : path.startsWith(href);
    return <Link href={href} asChild><Pressable accessibilityLabel={label} style={({ hovered, pressed }) => [s.item, active && s.active, hovered && s.hover, pressed && s.pressed]}>
      <Ionicons name={icon} size={19} color={active ? colors.primary : colors.textSecondary} />{!mobile && <Text style={[s.link, active && s.linkActive]}>{label}</Text>}
    </Pressable></Link>;
  };
  return <View style={s.shell}><View style={s.inner}><Link href="/" asChild><Pressable style={s.brand}><View style={s.mark}><Ionicons name="code-slash" size={21} color={colors.primaryText}/></View><View><Text style={s.name}>Dicionário Tech</Text>{!mobile && <Text style={s.by}>LAR SÃO FRANCISCO</Text>}</View></Pressable></Link><View style={s.nav}><Item href="/" label="Início" icon="home-outline" /><Item href="/sugestao" label="Sugerir termo" icon="bulb-outline" /><Pressable accessibilityLabel={`Ativar modo ${isDark?'claro':'escuro'}`} onPress={toggleTheme} style={({hovered,pressed})=>[s.themeButton,hovered&&s.hover,pressed&&s.pressed]}><Ionicons name={isDark?'sunny-outline':'moon-outline'} size={21} color={colors.text}/>{!mobile&&<Text style={s.themeText}>{isDark?'Claro':'Escuro'}</Text>}</Pressable></View></View></View>;
}
const makeStyles = (colors: AppColors) => StyleSheet.create({
  shell: { width: '100%', backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, zIndex: 20 },
  inner: { width: '100%', maxWidth: 1180, height: 76, alignSelf: 'center', paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 11 }, mark: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  code: { color: colors.primaryText, fontSize: 14, fontWeight: '900' }, name: { color: colors.text, fontSize: 17, fontWeight: '800' }, by: { color: colors.textMuted, fontSize: 14, fontWeight: '700', letterSpacing: .5, marginTop: 1 },
  nav: { flexDirection: 'row', alignItems:'center', gap: 6 }, item: { minWidth: 44, height: 44, paddingHorizontal: 13, borderRadius: 12, flexDirection:'row', gap:7, alignItems: 'center', justifyContent: 'center' }, active: { backgroundColor: colors.successSoft }, hover: { backgroundColor: colors.backgroundSoft }, pressed: { opacity: .7 }, link: { color: colors.textSecondary, fontSize: 14, fontWeight: '700' }, linkActive: { color: colors.primary },
  themeButton:{minWidth:44,height:44,paddingHorizontal:12,borderRadius:12,borderWidth:1,borderColor:colors.border,flexDirection:'row',gap:7,alignItems:'center',justifyContent:'center'},themeText:{color:colors.text,fontSize:14,fontWeight:'700'},
});
