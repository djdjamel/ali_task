import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../components/auth-context';
import { Header, Checkbox, Message, List, Segment, Sidebar, Button, Divider, Icon } from 'semantic-ui-react';
import apiClient from '../components/api';
import TacheTable from './TacheTable';
import StaticTacheTable from './StaticTacheTable';

const Plan = () => {

    const [users, setUsers] = useState([]);
    const [tacheTable, setTacheTable] = useState([]);
    const [editing, setEditing] = useState({ edit: false, id: -1 });
    const [taskStats, setTaskStats] = useState({});
    const [saved, setSaved] = useState({etat: 0, message: '' });


    const ctx = useContext(AuthContext);
    ctx.checkLogAlive();

    // create an array of tache_id ---->  employee doing it now (done = 1)
    const fillTaskStats = (data) => {
        console.log('filling: ', data.length)
        if (data.length === 0) return;
        let temp = {};
        for (let i = 0; i < data.length; i++) {
            for (let x = 0; x < data[i].tache.length; x++) {
                const current_tache = data[i].tache[x];
                if (current_tache.done === 1) {
                    if (!temp[current_tache.tache_id]) temp[current_tache.tache_id] = [];
                    temp[current_tache.tache_id].push(data[i].nom);
                }
            }
        }
        setTaskStats(temp);
    }

    // get todays program(if there is one)
    const doWeHaveAPlan = () => {
        const headers = ctx.getBearerHeader();
        return apiClient.get('/api/get_todays_program', headers).then(response => {
            if (response.status === 200) {
                getUsersList();//en tout cas elle est nécessaire
                if (response.data.message === 'vide') {
                    //retour au zero, afficher la liste des employés(parceque tacheTable.length serait 0)              
                } else {
                    fillTaskStats(response.data.data);
                    setTacheTable(response.data.data);
                }
            }
        })
            .catch(response => {
                console.log('erreur:', response);
            });
    }

    // create a program for today (after buttton click)
    const listClicked = () => {
        if (users.length === 0) {
            console.log('liste users vide!');
            return;
        }

        const createObjReducer = (accum, [key, value]) => {
            if (value.checked) accum.push(value.id);
            return accum;
        }
        let idsArr = Object.entries(users).reduce(createObjReducer, []);

        const headers = ctx.getBearerHeader();
        return apiClient.post('/api/program', { ids: idsArr }, headers).then(response => {
            if (response.status === 200) {
                console.log('program:', response.data.data);
                fillTaskStats(response.data.data);
                setTacheTable(response.data.data);
            }
        })
            .catch(response => {
                console.log('erreur:', response);
            });
    }

    // get users list and choose those who are present today(check them)
    const getUsersList = () => {
        const headers = ctx.getBearerHeader();
        console.log('headers:', headers.Authorization);
        return apiClient.get('/api/get_users', headers).then(response => {
            if (response.status === 200) {
                const tempUsers = response.data.data.map((item) => {
                    return { ...item, checked: true };
                })
                setUsers(tempUsers);
            }
        })
            .catch(response => {
                console.log('erreur:', response);
            });
    }

    const userChecked = (data, id) => {
        const tempUsers = users.map(item => {
            if (item.id === id) item.checked = data.checked;
            return item;
        })
        setUsers(tempUsers);
    }
    // a component to display a decorated users list
    const printUsersList = () => {
        if (users.length === 0) {
            return;
        }
        const programButton = <Button positive onClick={() => listClicked()}>Liste des Taches</Button>
        const usersList = users.map((item) => (<li key={item.id}><Checkbox onChange={(e, data) => userChecked(data, item.id)} label={item.name} checked={item.checked} /></li>))
        return (
            <>
                {usersList}
                {programButton}
            </>
        );
    }

    const changeTaskStatus = (user_id, tache_id, done) => {
        //console.log(user_id, tache_id, done);
        let newArr = tacheTable.map((item) => {
            if (item.id === user_id) {
                const taches = item.tache.map((sItem) => {
                    if (sItem.tache_id === tache_id) sItem.done = done;
                    return sItem;
                })
                item.tache = taches;
            }
            return item;
        });
        setTacheTable(newArr);
    }

    const getUserNameAndChangeLeftTime = (user_id, tache_id, done) => {
        let nom;
        let newArr = tacheTable.map((item) => {
            if (item.id === user_id) {
                nom = item.nom;
                const taches = item.tache.map((sItem) => {
                    if (sItem.tache_id === tache_id) {
                        sItem.done = done;
                        done === 1 ? item.left_time -= sItem.temps : item.left_time += sItem.temps;
                    }
                    return sItem;
                })
                item.tache = taches;
            }
            return item;
        });
        setTacheTable(newArr);
        return nom;
    }

    const changeTaskStats = (user_id, tache_id, done) => {
        console.log(user_id, tache_id, done);
        const nom = getUserNameAndChangeLeftTime(user_id, tache_id, done);
        tache_id = tache_id.toString();
        const createObjReducer = (accum, [key, value]) => {
            accum[key] = value;
            return accum;
        }
        // 1- get emplyee name, time_left and current_task_time

        if (!nom) {
            console.log('could not found the name of user_id=', user_id);
            return;
        }
        // 3- if done === 0 then remove that name from stats using task_id key
        let newStats;
        if (done === 1) {
            // add username to the array
            newStats = Object.entries(taskStats).map(([key, value]) => {
                if (key === tache_id) {
                    console.log('added name:', nom);
                    return [key, [...value, nom]]; ///////////// changer ça
                }
                return [key, value];
            })
                .reduce(createObjReducer, {});

            // if this task doesn't exist before we add it to stats
            if (!newStats.hasOwnProperty(tache_id)) {
                newStats[tache_id] = [nom];
            }

        } else {
            // remove username from array
            newStats = Object.entries(taskStats).map(([key, value]) => {
                if (key === tache_id) {
                    const modified = value.filter(item => {
                        return item !== nom;
                    });
                    return [key, modified];
                }
                return [key, value];
            })
                .reduce(createObjReducer, {});
        }
        setTaskStats(newStats);
    }

    //returns an object of users ids, each one includes an array of his tasks ids
    const getDoneTasks = () => {
        // taskStats already contains only done tasks but it can contain also those with empty emplayees(removed all)
        // so let's remove them
        const usersMap = new Map();
        for (let [key, value] of Object.entries(users)) {
            usersMap.set(value.name, value.id);
        }
        const createObjReducer = (accum, [key, value]) => {
            if (value) {
                for (let nom of value) {
                    const id = usersMap.get(nom);
                    accum.push({user: id, tache_id: key, fix: false})
                }
            }
            return accum;
        }
        return Object.entries(taskStats).reduce(createObjReducer, []);
    }

    const sendProgram = () => {
        // 1- envoyer uniquement les taches avec done=1
        const doneTasks = getDoneTasks();
        console.log('done:', doneTasks);
        const headers = ctx.getBearerHeader();
        return apiClient.post('/api/save_program', { program: doneTasks }, headers).then(response => {
            if (response.status === 200) {
                console.log('enregistré:', response.data.data);
                setSaved({...saved, etat:1});
            }
        })
            .catch(response => {
                console.log('erreur:', response);
                setSaved({etat:-1, message: response});
            });
    }
    // a componnent to print users tasks in tables
    const printTables = () => {
        if (tacheTable.length === 0) {
            return;
        }
        const msg = <Message success={saved.etat === 1} negative={saved.etat === -1} content={saved.message} header='Enregistrement'/>;
        const saveButton = <Button primary onClick={() => sendProgram()}>Enregistrer</Button>;
        const tabs = tacheTable.map((item) => {
            if (editing.edit === false || (editing.edit === true && item.id === editing.id)) {
                    return (<div key={item.id}>
                                <Divider horizontal></Divider>
                                <TacheTable stats={taskStats} setStats={changeTaskStats} setEditing={setEditing} 
                                changeData={changeTaskStatus} data={item} />
                            </div>);
                
            }
        });
        return (<>{tabs} {saveButton} {saved.etat ? msg : ''}</>)
    }

    // start checking program after all ui were loaded
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
                        Liste des employés concernés
                    </Header>
                </Divider>
                {tacheTable.length > 0 ? printTables() : printUsersList()}
            </Segment>
        </Sidebar.Pusher>
    );
}

export default Plan;