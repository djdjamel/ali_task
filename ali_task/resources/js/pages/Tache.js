import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../components/auth-context';
import { Header, Segment, Sidebar, Message, Divider, Icon } from 'semantic-ui-react';
import apiClient from '../components/api';
import StaticTacheTable from './StaticTacheTable';

const Tache = () => {

    const [tacheTable, setTacheTable] = useState(null);
    const ctx = useContext(AuthContext);
    ctx.checkLogAlive();

    const doWeHaveAPlan = () => {
        const headers = ctx.getBearerHeader();
        console.log('headers:', headers.Authorization);
        return apiClient.get('/api/get_todays_program_for_user', headers).then(response => {
            if (response.status === 200) {
                if (response.data.data.length !== 0) {
                    console.log('user_program:', response.data.data);
                    setTacheTable(response.data.data[0]);
                }
            }
        })
            .catch(response => {
                console.log('erreur:', response);
            });
    }

    useEffect(() => {
        doWeHaveAPlan();        
    }, [])

    return (!ctx.isLoggedIn ? <h1>You are not allowed to be here! please login first.</h1>
        :
        <Sidebar.Pusher>
            <Segment basic>
                <Divider horizontal>
                    <Header as='h4'>
                        <Icon name='calendar' />
                        Taches d'aujourd'hui
                    </Header>
                </Divider>

                {!tacheTable && <Message compact content='Pas de taches affectées pour le moment'/>}
                {!!tacheTable && <StaticTacheTable data={tacheTable} />}
            </Segment>
        </Sidebar.Pusher>
    );
}

export default Tache;