import { Drawer } from 'expo-router/drawer';
import React from 'react';
import CustomDrawerContent from '@/components/CustomDrawer';
import { StyleSheet } from 'react-native';
import { Icon } from 'react-native-paper';
import {COLORS} from '../../themes/colors'



export default function DrawerLayout() {

  return (
    <Drawer
    drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle:styles.drawer,
        headerShown: true, 
        drawerActiveTintColor: '#000000ff',
        swipeEnabled: true,
        swipeEdgeWidth:300,
        drawerType:'slide',
        drawerInactiveTintColor:  '#3b3b3bff',//Colors[colorScheme ?? 'light'].text,
        
      }}
    >

      <Drawer.Screen
        name="index"

        options={{
          headerTransparent:true,
          title: 'UpFeed',
          drawerLabel:'UpFeed',
          drawerItemStyle:{alignSelf:'center',
            flex:1,
             width:'100%', 
             backgroundColor:'#61AFEF',
             borderRadius:16,
             marginHorizontal: 10,
            
            },
          drawerLabelStyle: {
            color:'#ffff',
            fontSize: 18,
            fontWeight: 'bold',
            alignSelf:'center',
           
            // marginLeft: -15,
        },
        // drawerActiveTintColor: '#3498db', 
        // drawerInactiveTintColor: '#7f8c8d',
        // drawerActiveBackgroundColor: 'rgba(119, 119, 119, 0.71)',
          headerTintColor:'#ffff',
          headerStyle: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)', 
            shadowOpacity: 0, 
            elevation: 0,
          },
          drawerIcon: ({ color }) => <Icon size={28} source={'post'}  />,
        }}
      />
      <Drawer.Screen
        name="config"
        options={{
          title: 'Configurações',
          headerTitleStyle:{color:'red'},
           drawerItemStyle:styles.hidden,
          // drawerIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />



    <Drawer.Screen 
        name="channel/[id]" 
        options={{ 
            drawerLabel: 'Feeds Salvos', 
            drawerItemStyle:styles.hidden

  
        }}
    />

    </Drawer>
  );
}


const styles = StyleSheet.create({
    drawer: {
        backgroundColor: COLORS.background,
        paddingTop:30,
    },
    list: {
        padding: 10,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        margin:50
    },
    // config: {
      // alignSelf:'flex-end',
      // justifyContent:'flex-end',
      // position:'absolute',
      // bottom:0,
        // fontSize: 20,
        // fontWeight: 'bold',
        // marginBottom: 15,
        // textAlign: 'center',
        // color: '#2c3e50',
    // },
    itemContainer: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.text,
        marginBottom: 10,
        backgroundColor: COLORS.text,
        borderRadius: 8,
        elevation: 3, // Sombra para Android
        shadowColor: '#000', // Sombra para iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },

    hidden: {
      display: 'none',
      fontSize: 26,
        
    },

});

