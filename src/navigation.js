import React from 'react';
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs'; // <-- Import BottomTabBar
import { StyleSheet, View, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Home from './pages/home';
import Favourite from './pages/favourite';
import Addtocart from './pages/addtocart';
import Profile from './pages/Profile';

const Tab = createBottomTabNavigator();
const { height } = Dimensions.get('window');

// Define a fixed base height for the tab content (icons, labels, etc.)
// This height is where your icons will be perfectly centered.
const TAB_BAR_CONTENT_HEIGHT = 48; // Adjust as needed

// ----------------------------------------------------------------------
// 1. Custom Tab Bar Wrapper (Handles Dynamic Height & Centering)
// ----------------------------------------------------------------------

function CustomTabBarWrapper(props) {
    // Get the safe area insets (bottom value is the navigation bar height)
    const insets = useSafeAreaInsets(); 
    
    // Calculate the total height: Base Content Height + Navigation Bar Height
    const totalHeight = TAB_BAR_CONTENT_HEIGHT + insets.bottom;

    return (
        // The outer View dictates the overall position and total height
        <View style={[styles.tabBarContainer, { height: totalHeight }]}>
            {/* The standard BottomTabBar component is rendered here. 
                We force its height to only be the content height.
            */}
            <BottomTabBar 
                {...props} 
                style={[
                    props.style, 
                    // This is key: We override the outer 'tabBarStyle' padding/height 
                    // to ensure the inner bar only occupies the content height area.
                    styles.tabBarBase, 
                    { height: TAB_BAR_CONTENT_HEIGHT } 
                ]} 
            />
            
            {/* This View absorbs the system navigation bar space below the icons, 
                ensuring the icons are vertically centered in the safe area. */}
            <View style={{ height: insets.bottom, backgroundColor: '#fdfdfdff' }} /> 
        </View>
    );
}

// ----------------------------------------------------------------------
// 2. Main Tabs Navigator
// ----------------------------------------------------------------------

const Tabs = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarShowLabel: false,
                headerShown: false,
                tabBarHideOnKeyboard: true,
            }}
            // Use the custom component wrapper
            tabBar={(props) => <CustomTabBarWrapper {...props} />} 
        >
            <Tab.Screen
                name="Home"
                component={Home}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <Ionicons
                            name={focused ? 'home' : 'home-outline'}
                            size={26}
                            color={focused ? '#92400e' : '#92400e'}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Favourite"
                component={Favourite}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <Ionicons
                            name={focused ? 'heart' : 'heart-outline'}
                            size={26}
                            color={focused ? '#92400e' : '#92400e'}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Addtocart"
                component={Addtocart}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <Ionicons
                            name={focused ? 'cart' : 'cart-outline'}
                            size={26}
                            color={focused ? '#92400e' : '#92400e'}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={Profile}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <Ionicons
                            name={focused ? 'person' : 'person-outline'}
                            size={26}
                            color={focused ? '#92400e' : '#92400e'}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

// ----------------------------------------------------------------------
// 3. Styles
// ----------------------------------------------------------------------

const styles = StyleSheet.create({
    tabBarContainer: {
        // This is the outer container that spans the whole bottom screen area
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        // No background or border here, to prevent double borders
    },
    tabBarBase: {
        // These styles are applied to the inner BottomTabBar component
        position: 'absolute', 
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fdfdfdff',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        elevation: 4,
        // Crucially, the icons themselves are designed to be centered 
        // within the height set for the BottomTabBar component.
    },
});

export default Tabs;