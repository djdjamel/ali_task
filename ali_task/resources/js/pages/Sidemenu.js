import { useContext } from 'react';
import { AuthContext } from '../components/auth-context';
import { Header, Icon, Image, Menu, Segment, Sidebar } from 'semantic-ui-react';
import { useNavigate } from "react-router-dom";

const Sidemenu = () => {

    const ctx = useContext(AuthContext);
    ctx.checkLogAlive();
    let navigate = useNavigate();

    const logoutClick = (e) => {
        ctx.logout();
    };

    const adminMenu = (<>
                        <Menu.Item as='a'
                            onClick={(e) => navigate("plan", { replace: true })}>
                            <Icon name='calendar alternate outline' />
                            Plan
                        </Menu.Item>
                        <Menu.Item as='a'
                            onClick={(e) => navigate("evaluation", { replace: true })}>
                            <Icon name='edit outline' />
                            Evaluation
                        </Menu.Item>                        
    </>);

    return (!ctx.isLoggedIn ? <h1>You are not allowed to be here! please login first.</h1>
        :

        <Sidebar
            as={Menu}
            animation='uncover'
            icon='labeled'
            inverted
            vertical
            visible
            width='thin'
            
        >
            <Menu.Item as='a'
                onClick={(e) => navigate("/", { replace: true })}>
                <Icon name='home' />
                Accueil
            </Menu.Item>            
            <Menu.Item as='a'
                onClick={(e) => navigate("tache", { replace: true })}>
                <Icon name='tasks' />
                Taches
            </Menu.Item>
            <Menu.Item as='a'
                onClick={(e) => navigate("feedback", { replace: true })}>
                <Icon name='bullhorn' />
                Rapport
            </Menu.Item>
            {console.log('userInfo:', ctx.userInfo)}
            {!!ctx.userInfo  &&  (ctx.userInfo.type == 'admin') && adminMenu}

            <Menu.Item as='a'
                onClick={(e)=> logoutClick(e)}>
                <Icon name='sign out' />
                Déconnexion
            </Menu.Item>
        </Sidebar>

    );
}

export default Sidemenu;