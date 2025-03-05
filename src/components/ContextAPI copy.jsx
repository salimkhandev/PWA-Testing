import { createContext, useContext,useEffect,useState } from 'react';
import { useNavigate ,useLocation} from 'react-router-dom';


const Context = createContext();

export const ContextProvider = ({ children }) => {
    const [value,setValue] = useState('Hello World');
    const [netAvail, setNetAvail] = useState()
    const navigate = useNavigate();

    const onlinePathsOnly = ["/call", "/message", "/contact"];
    const pathname = useLocation().pathname;
    const isOfflineRestrictedPage = onlinePathsOnly.includes(pathname);

    useEffect(() => {

        console.log('netAvail',netAvail,'isOfflineRoute',isOfflineRestrictedPage);
        window.addEventListener('online', () => {
setNetAvail(true)
        })
        window.addEventListener('offline', () => {
setNetAvail(false)
        })
       
        if (!netAvail && isOfflineRestrictedPage){
            navigate("/offline");
        }
    }, [netAvail, navigate, pathname]);
   

    return (
        <Context.Provider value={{netAvail ,value,setValue}}>
            {children}
        </Context.Provider>
    );
};

export const useContextAPI = () => {
    return useContext(Context);
};
