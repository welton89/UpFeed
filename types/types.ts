import { ReactNode } from "react";



export type Channel = {
    id:string;
    name:string;
    url:string;
    descricao?:string;
    img?:string;
    category:Category | undefined

}



export interface FormData {
  nome: string;
  descricao: string;
  urlDoSite: string;
  urlDaImagem: string;
  fullScreen:boolean;
  horizontal:boolean;
}


export interface Category {
  id:string;
  name: string;
}


export interface ItemRSS {
  canal: Channel ;
  id: string;
  dataPublicacao: string | null; // ISO String
  titulo: string;
  tags: string | null;
  body: string;
  img: string | null;
  mark: boolean | false;
}


export type ApiResponse = {
    timestamp: string;
    totalRows: number;
    data: Channel[];
};