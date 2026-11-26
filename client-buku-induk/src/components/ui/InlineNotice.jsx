import {useEffect,useRef} from 'react';
import {useLocation} from 'react-router-dom';
import {X} from 'lucide-react';

/** Menampilkan notifikasi halaman yang tertutup otomatis dan direset saat rute berubah. @param {{message:string,onClose:function}} props Isi notifikasi dan handler tutup. @returns {JSX.Element|null} Alert lokal halaman. */
export default function InlineNotice({message,onClose}){
  const {pathname}=useLocation();
  const onCloseRef=useRef(onClose);
  const prevPathRef=useRef(pathname);
  onCloseRef.current=onClose;
  useEffect(()=>{
    if(prevPathRef.current!==pathname){
      prevPathRef.current=pathname;
      onCloseRef.current('');
    }
  },[pathname]);
  useEffect(()=>{
    if(!message)return undefined;
    const timer=setTimeout(()=>onCloseRef.current(''),3500);
    return()=>clearTimeout(timer);
  },[message,pathname]);
  if(!message)return null;
  return <div className="inline-message" role="status"><span>{message}</span><button type="button" className="notice-close" aria-label="Tutup notifikasi" onClick={()=>onCloseRef.current('')}><X size={15}/></button></div>;
}
