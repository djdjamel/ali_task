import { useState, useContext, useEffect, createContext } from 'react';
import apiClient from './api';
import {checkCookieExp, calculateRemainingTime} from './cookieHelper';

let logoutTimer;

export const AuthContext = createContext({
    isLoggedIn: false,
    login: () => { },
    logout: () => { },
    userInfo: {},
    checkLogAlive: () => {},
    getBearerHeader: () => {},
});

const AuthProvider = (props) => {
    const [isLoggedIn, setLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState(null);

    const login = (email, password, setMessage) => {
        /*return apiClient.get('/sanctum/csrf-cookie')
            .then(response => {*/
                
                return apiClient.post('/api/login', {
                    email: email,
                    password: password
                }).then(response => {
                    if (response.status === 200) {
                        //console.log('userifo:', JSON.stringify(response))
                        sessionStorage.setItem('userinfo', JSON.stringify(response.data.data));
                        setLoggedIn(true);
                        setUserInfo(response.data.data);
                    }
                })
                .catch(response => {
                    setMessage(response.data);
                });
            //});
    }

    /*const login = (email, password, setMessage) => {
        return apiClient.post('/login', {
                    email: email,
                    password: password
                }).then(response => {
                    if (response.status === 200) {
                        console.log('userifo:', JSON.stringify(response))
                        sessionStorage.setItem('userinfo', JSON.stringify(response.data.data));
                        setLoggedIn(true);
                        setUserInfo(response.data.data);
                    }
                })
                .catch(response => {
                    setMessage(response.data);
                });
    }*/

    const logout = () => {
        apiClient.post('/api/logout').then(response => {
            if (response.status === 204) {
                sessionStorage.removeItem('userinfo');
                setLoggedIn(false);
                setUserInfo({});
            }
        })
        .catch(response => {
            if (response.response.status === 404 || response.response.status === 419) {
                sessionStorage.removeItem('userinfo');
                console.log('erreur:', response);
                setLoggedIn(false);
                setUserInfo({});
            }
        });
    }

    const checkLogAlive = () => {
        let result = false;
        const storageValue = JSON.parse(sessionStorage.getItem('userinfo'));
        if(!!storageValue) result = true;
        if (isLoggedIn !== result) {
            setLoggedIn(result);
            setUserInfo(storageValue);
        }
    }

    const getBearerHeader = () => {
        const storageValue = JSON.parse(sessionStorage.getItem('userinfo'));
        if(!!storageValue) {
            const headers = {
                               headers: {
                                          accept: 'application/json',
                                          Authorization: 'Bearer ' + storageValue.token
                                        }
                            };
            //console.log('bearer:', headers.Authorization);
            return headers;
        }else{
            return null;
        }
    }

    useEffect(() => {
        checkLogAlive();
    }, []);

    


    return <AuthContext.Provider value={{
        isLoggedIn: isLoggedIn,
        login: login,
        logout: logout,
        userInfo: userInfo,
        checkLogAlive: checkLogAlive,
        getBearerHeader: getBearerHeader,
    }}>
        {props.children}
    </AuthContext.Provider>;
}

export default AuthProvider;