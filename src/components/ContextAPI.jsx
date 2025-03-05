import { createContext, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Context = createContext();

export const ContextProvider = ({ children }) => {
    const [value, setValue] = useState('Hello World');
    const [netAvail, setNetAvail] = useState();
    const navigate = useNavigate();

    const onlinePathsOnly = ["/call", "/message", "/contact"];
    const pathname = useLocation().pathname;
    const isOfflineRestrictedPage = onlinePathsOnly.includes(pathname);

    useEffect(() => {
        const handleOnline = () => setNetAvail(true);
        const handleOffline = () => setNetAvail(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        const checkInternet = () => {
            return fetch("https://api.ipify.org?format=json")
                .then(response => response.ok ? true : false)
                .catch(() => false);
        };

        // Promise that resolves as soon as any method (API call or event) confirms status
        const detectNetwork = () => {
            return Promise.race([
                new Promise(resolve => {
                    window.addEventListener('online', () => resolve(true), { once: true });
                    window.addEventListener('offline', () => resolve(false), { once: true });
                }),
                checkInternet()
            ]);
        };

        detectNetwork().then(isOnline => {
            setNetAvail(isOnline);
            if (!isOnline && isOfflineRestrictedPage) {
                navigate("/offline");
            }
        });

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [navigate, pathname, isOfflineRestrictedPage]);

    return (
        <Context.Provider value={{ netAvail, value, setValue }}>
            {children}
        </Context.Provider>
    );
};

export const useContextAPI = () => {
    return useContext(Context);
};
