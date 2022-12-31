import { useContext } from 'react';
import { AuthContext } from '../components/auth-context';
import { Header, Table, Segment, Button, Label } from 'semantic-ui-react';

const RightTable = ({data, changeData, setStats, stats}) => {

  const colors = [
    'red',
    'orange',
    'yellow',
    'olive',
    'green',
    'teal',
    'blue',
    'violet',
    'purple',
    'pink',
    'brown',
    'grey',
    'black',
  ];
      const addTask = (user_id, tache_id) => {
        changeData(user_id, tache_id, 1);
        setStats(user_id, tache_id, 1);
      }

      const getStats = (tache_id, nom) => {
        if(!stats[tache_id] || !stats[tache_id]?.length) return (<Label color='red'>Aucun.</Label>);
        return stats[tache_id].map((item,index) => {
                if(item === nom) return;
                const firstName = item.substr(0, item.indexOf(' ')) || item;
                return (<Label size='tiny' key={index} color={colors[index % 13]}>{firstName}</Label>);
              });
      }

    const tab = data.tache.map((item, index) => {
        if(item.done === 0){
          return (
          <Table.Row key={index + 100}>
            <Table.Cell><Button onClick={() => addTask(data.id, item.tache_id)} circular inverted icon='check circle outline' color='green'/></Table.Cell>
            <Table.Cell>{item.nom}</Table.Cell>
            <Table.Cell>{item.temps}</Table.Cell>          
            <Table.Cell>{getStats(item.tache_id, data.nom)}</Table.Cell>  
          </Table.Row>)
        }else{
          return;
        }
    });

    console.log(tab);

    return ( 
        <Table collapsing color='green' >
        <Table.Header >
          <Table.Row>
            <Table.HeaderCell colSpan='3'  textAlign='center'>{data.nom}<span>, Taches restantes</span></Table.HeaderCell>
            <Table.HeaderCell colSpan='1'  textAlign='center'>Qui fait cette tache aussi?</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
    
        <Table.Body>
          {data && tab}
        </Table.Body>
      </Table>
    );
}

export default RightTable;