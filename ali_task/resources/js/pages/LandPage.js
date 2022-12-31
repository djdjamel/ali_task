import { useContext, useEffect } from 'react';
import { AuthContext } from '../components/auth-context';
import { Button, Form, Grid, Header, Image, Message, Segment } from 'semantic-ui-react'
import { useNavigate } from "react-router-dom";

const LandPage = () => {

    const ctx = useContext(AuthContext);
    let navigate = useNavigate();
    useEffect(() => {
        ctx.checkLogAlive();
    }, [ctx.isLoggedIn])
    

    const logoutClick = (e) => {
        ctx.logout();
    };


    const logout = <Button color='red' fluid size='large' onClick={(e)=> logoutClick(e)}>Logout</Button>;
    const dashboard = <Button color='green' fluid size='large' onClick={(e)=> navigate("api/dashboard", { replace: true })}>Dashboard</Button>;
    const login = <Button color='blue' fluid size='large' onClick={(e)=> navigate("api/login", { replace: true })}>Login</Button>;
    return (
        <>
            <h1>LandPage</h1>
            <h3>This page is shown for non logged-in/new users to suggest login with a link</h3>
            <h1>It describes also the application and what is it made for.</h1>
            {ctx.isLoggedIn &&  dashboard}
            {ctx.isLoggedIn &&  logout}
            {!ctx.isLoggedIn &&  login}
        </>
    );
}

export default LandPage;