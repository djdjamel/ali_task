import { useContext } from 'react';
import { AuthContext } from '../components/auth-context';
import { Header, Icon, Image, Menu, Segment, Sidebar } from 'semantic-ui-react';

const FeedBack = () => {

    const ctx = useContext(AuthContext);
    ctx.checkLogAlive();

    return ( !ctx.isLoggedIn ? <h1>You are not allowed to be here! please login first.</h1>
                            :
                            <Sidebar.Pusher>
                                <Segment basic>
                                    <Header as='h3'>FeedBack</Header>
                                    <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
                                </Segment>
                            </Sidebar.Pusher>
    );
}

export default FeedBack;