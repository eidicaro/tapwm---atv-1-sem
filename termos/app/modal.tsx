import { Redirect } from 'expo-router';
// Preserve the old URL while moving full dictionary exploration into the catalog.
export default function DictionaryRoute() { return <Redirect href="/?catalogo=1" />; }