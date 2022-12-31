import { useContext } from 'react';
import { AuthContext } from '../components/auth-context';
import { Header, Icon, Image, Menu, Segment, Sidebar } from 'semantic-ui-react';

const Program = ({data}) => {

    const ctx = useContext(AuthContext);
    ctx.checkLogAlive();
    //first get employees list
    

    return ( <>
    </>
    );
}

export default Program;