import { useContext, useEffect } from 'react';
import { AuthContext } from '../components/auth-context';
import { Header, Icon, Image, Menu, Segment, Sidebar } from 'semantic-ui-react';
import { Navigate, Outlet, useNavigate, Route, Routes, Link } from "react-router-dom";

import Sidemenu from './Sidemenu';


const SharedDashboard = () => {

    const ctx = useContext(AuthContext);
    let navigate = useNavigate();

    useEffect(() => {
        ctx.checkLogAlive();
    }, [ctx.isLoggedIn])

    return (!ctx.isLoggedIn ? <Navigate to="/api/login" />
        :
        <>


            <Sidebar.Pushable as={Segment} style={{minHeight: '100vh'}} >
                <Sidemenu/>

                <Sidebar.Pusher>
                    <Segment basic>
                        <Outlet/>
                    </Segment>
                </Sidebar.Pusher>

            </Sidebar.Pushable>


        </>
    );
}

export default SharedDashboard;