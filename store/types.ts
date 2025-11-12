import { ReactNode } from "react";


export type AppId = string;

export type AppType = {
    id:AppId;
    name:string;
    descricao:string;
    url:string;
    img:string;
    fullScreen:boolean;
    horizontal:boolean;
}



export interface AppCardProps {
    app: AppType;
    onEdit: (app: AppType) => void;
    onDelete: (appId: string) => void;
}



export interface CustomModalProps {
  id?:string;
  isVisible: boolean;
  onClose: () => void;

}



export interface FormData {
  nome: string;
  descricao: string;
  urlDoSite: string;
  urlDaImagem: string;
  fullScreen:boolean;
  horizontal:boolean;
}



export type RootStackParamList = {
  // Rotas da sua aplicação:
  Home: undefined; // Não aceita parâmetros
  Settings: undefined;
  
  // A rota que você está tentando usar para abrir a URL
  WebView: { url: string; }; 
  
  // Adicione outras rotas do seu app aqui...
};