import React from 'react';

const getCookie = (cname) => {
    let name = cname + "=";
    
    let decodedCookie = decodeURIComponent(document.cookie);
    console.log("decodedCookie=",decodedCookie);
    let ca = decodedCookie.split(';');
    console.log('ca=', ca);
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

export const checkCookieExp = (name = "XSRF-TOKEN") => {
    let result = "";
    let XSRF = getCookie(name);
    if (XSRF === "") {
        return result;
    }

    console.log('XSRF=',XSRF);

    const expIndex = XSRF.indexOf('expires=');
    if (expIndex === -1) {
        return result;
    }

    const semiColonIndex = XSRF.indexOf(";", expIndex + 8);
    if (semiColonIndex === - 1) {
        return result
    }

    result = XSRF.substring(expIndex + 8, semiColonIndex - (expIndex + 8));
    console.log('remaining time=', result);
    return result;
}

export const calculateRemainingTime = (expirationTime) => {
    const currentTime = new Date().getTime();
    const adjustedExpirationTime = new Date(expirationTime).getTime();

    const remainingDuration = adjustedExpirationTime - currentTime;
    console.log('remaining duration=', remainingDuration);
    return remainingDuration
}

export default checkCookieExp;