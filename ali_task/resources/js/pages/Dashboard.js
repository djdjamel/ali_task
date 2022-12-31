import { useContext, useEffect } from 'react';
import { AuthContext } from '../components/auth-context';
import { Header, Icon, Image, Menu, Segment, Sidebar } from 'semantic-ui-react';
import { Navigate, Outlet, useNavigate, Route, Routes, Link } from "react-router-dom";

import Content from './Content';

const Dashboard = () => {

    const ctx = useContext(AuthContext);
    let navigate = useNavigate();

    useEffect(() => {
        ctx.checkLogAlive();
    }, [ctx.isLoggedIn])

    return (!ctx.isLoggedIn ? <Navigate to="/api/login" />
        :
        <>


            <Content/>


        </>
    );
}

export default Dashboard;