import { useEffect, useRef } from 'react';
import { BackHandler, ToastAndroid } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function useAdvancedBackHandler() {
  const navigation = useNavigation();
  const backPressStep = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const backAction = () => {
      if (navigation.canGoBack()) {
        // Smooth transition to previous screen
        navigation.goBack();
        return true;
      }

      // Root screen: handle double back to exit
      if (backPressStep.current === 0) {
        backPressStep.current = 1;
        ToastAndroid.showWithGravity(
          'Press back again to exit',
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM
        );

        timerRef.current = setTimeout(() => {
          backPressStep.current = 0; // reset after 2 sec
        }, 2000);

        return true;
      } else if (backPressStep.current === 1) {
        BackHandler.exitApp(); // exit on second press
        return true;
      }

      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => {
      backHandler.remove();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [navigation]);
}
