
import Toast, { BaseToast, BaseToastProps } from 'react-native-toast-message';



export const toastConfig = {

  success: (props: React.JSX.IntrinsicAttributes & BaseToastProps) => (
    <BaseToast
      {...props}
      style={{ 
        marginTop:50,
        height:90,
        padding:15,
        width:'95%',
        backgroundColor:'#2f2f2fff',
        borderLeftColor: '#7cff85ff',
        borderColor: '#7cff85ff',
        borderLeftWidth:40,
        borderWidth:1,
        borderRadius:26,
        opacity:0.9

    }} 
    text2NumberOfLines={3}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 20,
        color:'#c9c9c9ff',
        fontWeight: '200',
        textAlign:'center'
      }}
      text2Style={{
        fontSize: 16,
        color:'#d3d3d3ff',
        fontWeight: '200',
        

      }}
    />
  ),
  info: (props: React.JSX.IntrinsicAttributes & BaseToastProps) => (
    <BaseToast
      {...props}
      style={{ 
        marginTop:50,
        height:90,
        padding:15,
        width:'95%',
        backgroundColor:'#2f2f2fff',
        borderLeftColor: '#7caaffff',
        borderColor: '#7caaffff',
        borderLeftWidth:40,
        borderWidth:1,
        borderRadius:26,
        opacity:0.9

    }} 
    text2NumberOfLines={3}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 20,
        color:'#c9c9c9ff',
        fontWeight: '200',
        textAlign:'center'
      }}
      text2Style={{
        fontSize: 16,
        color:'#d3d3d3ff',
        fontWeight: '200',
        

      }}
    />
  ),
  error: (props: React.JSX.IntrinsicAttributes & BaseToastProps) => (
    <BaseToast
      {...props}
      style={{ 
        marginTop:50,
        height:90,
        padding:15,
        width:'95%',
        backgroundColor:'#2f2f2fff',
        borderLeftColor: '#f84141ff',
        borderColor: '#f84141ff',
        borderLeftWidth:40,
        borderWidth:1,
        borderRadius:26,
        opacity:0.9

    }} 
    text2NumberOfLines={3}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 20,
        color:'#c9c9c9ff',
        fontWeight: '200',
        textAlign:'center'
      }}
      text2Style={{
        fontSize: 16,
        color:'#d3d3d3ff',
        fontWeight: '200',
        

      }}
    />
  ),

  
}