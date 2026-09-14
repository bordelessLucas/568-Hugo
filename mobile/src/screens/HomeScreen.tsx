import { useRouter } from 'expo-router'
import { Image, StyleSheet, Text, View } from 'react-native'
import { tokens } from '@rotatrucks/back/tokens'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { Caption, Heading } from '@/components/Typography'

const previewName = 'Hugo'

export function HomeScreen() {
  const router = useRouter()
  const handleOpenMap = () => {}
  const handleReport = () => {}
  const handleOpenProfile = () => {}
  const handleLeave = () => {
    router.replace('/login')
  }

  return (
    <Container scroll={false}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          accessibilityLabel="RotaTrucks"
        />
        <Heading tone="inverse">Olá, {previewName}</Heading>
        <Caption tone="line">Truck · dimensões ainda não cadastradas</Caption>
      </View>
      <View style={styles.mapWrap}>
        <View style={styles.map}>
          <View style={styles.lane} />
          <View style={styles.marks}>
            <Text style={styles.pass}>Passa</Text>
            <Text style={styles.blocked}>Não passa</Text>
          </View>
          <Caption tone="line">Marcações da região aparecem aqui.</Caption>
        </View>
      </View>
      <View style={styles.actions}>
        <Button label="Marcar ocorrência" onPress={handleReport} />
        <View style={styles.nav}>
          <View style={styles.navItem}>
            <Button label="Mapa" variant="secondary" onPress={handleOpenMap} />
          </View>
          <View style={styles.navItem}>
            <Button label="Marcar" variant="outline" onPress={handleReport} />
          </View>
          <View style={styles.navItem}>
            <Button label="Perfil" variant="outline" onPress={handleOpenProfile} />
          </View>
        </View>
        <Button label="Sair" variant="outline" onPress={handleLeave} />
      </View>
    </Container>
  )
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: tokens.color.brand,
    paddingHorizontal: tokens.space[5],
    paddingBottom: tokens.space[5],
    gap: tokens.space[2],
    marginHorizontal: -tokens.space[5],
  },
  logo: {
    width: 72,
    height: 72,
  },
  mapWrap: {
    flex: 1,
    paddingTop: tokens.space[5],
  },
  map: {
    flex: 1,
    borderRadius: tokens.radius.button,
    backgroundColor: tokens.color.brand,
    padding: tokens.space[4],
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  lane: {
    position: 'absolute',
    top: tokens.space[6],
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: tokens.color.accent,
  },
  marks: {
    flexDirection: 'row',
    gap: tokens.space[2],
    marginBottom: tokens.space[4],
  },
  pass: {
    backgroundColor: tokens.color.pass,
    color: tokens.color.surface,
    fontFamily: tokens.font.label,
    fontSize: tokens.size.caption,
    paddingHorizontal: tokens.space[3],
    paddingVertical: tokens.space[1],
    borderRadius: 999,
    overflow: 'hidden',
  },
  blocked: {
    backgroundColor: tokens.color.danger,
    color: tokens.color.surface,
    fontFamily: tokens.font.label,
    fontSize: tokens.size.caption,
    paddingHorizontal: tokens.space[3],
    paddingVertical: tokens.space[1],
    borderRadius: 999,
    overflow: 'hidden',
  },
  actions: {
    gap: tokens.space[3],
    paddingTop: tokens.space[4],
  },
  nav: {
    flexDirection: 'row',
    gap: tokens.space[2],
  },
  navItem: {
    flex: 1,
  },
})
