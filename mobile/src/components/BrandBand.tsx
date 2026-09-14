import { Image, StyleSheet, View } from 'react-native'
import { tokens } from '@rotatrucks/back/tokens'

export function BrandBand() {
  return (
    <View style={styles.band}>
      <Image
        source={require('../../assets/images/logo.png')}
        style={styles.logo}
        accessibilityLabel="RotaTrucks"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  band: {
    backgroundColor: tokens.color.brand,
    marginHorizontal: -tokens.space[5],
    paddingHorizontal: tokens.space[5],
    paddingBottom: tokens.space[4],
    paddingTop: tokens.space[2],
  },
  logo: {
    width: 144,
    height: 144,
  },
})
