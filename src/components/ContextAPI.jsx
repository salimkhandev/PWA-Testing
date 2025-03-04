import { createContext, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNetwork } from 'react-use';

const Context = createContext();

export const ContextProvider = ({ children }) => {
    const {online} = useNetwork();
    console.log('isOnline',online);
    const [value,setValue] = useState('Hello World');
    // const [netAvail, setNetAvail] = useState()
    const navigate = useNavigate();

    const onlinePathsOnly = ['/call','/message','/contact'];
    // window.location.pathname use this
    const pathname = useLocation().pathname;    
    const offlinePaths = onlinePathsOnly.includes(pathname);


    useEffect(() => {
//         console.log('netAvail',netAvail,'isOfflineRoute',isOnline);
//         window.addEventListener('online', () => {
// setNetAvail(true)
//         })
//         window.addEventListener('offline', () => {
// setNetAvail(false)
//         })
            if (offlinePaths && !online){
            navigate("/offline");
        }
        const checkInternet = async () => {
            // try {
            //     const response = await fetch("https://www.google.com", { mode: "no-cors" });
            //     setNetAvail(true);
            // } catch (error) {
            //     setNetAvail(false);
            // }
        };
        checkInternet()
    }, [online, navigate, pathname]);
   

    return (
        <Context.Provider value={{online ,value,setValue}}>
            {children}
        </Context.Provider>
    );
};

export const useContextAPI = () => {
    return useContext(Context);
};