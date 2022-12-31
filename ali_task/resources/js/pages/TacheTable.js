import { useContext, useState } from 'react';
import { AuthContext } from '../components/auth-context';
import { Header, Table, Segment, Button, Label } from 'semantic-ui-react';
import RightTable from './RightTable';

const TacheTable = ({data, changeData, setEditing, setStats, stats}) => {

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

    const [isOpen, setIsOpen] = useState(false);

    const deleteTask = (user_id, tache_id) => {
      changeData(user_id, tache_id, 0);
      setStats(user_id, tache_id, 0);
    }

    const getStats = (tache_id, nom) => {
      if(!stats[tache_id]) return (<Label color='red'>Aucun.</Label>);
      return stats[tache_id].map((item,index) => {
              if(item === nom) return;
              const firstName = item.substr(0, item.indexOf(' ')) || item;
              return (<Label size='tiny' key={index} color={colors[index % 13]}>{firstName}</Label>);
            });
    }
      
    const tab = data.tache.map((item, index) => {
      if(item.done === 1){
        return (
            <Table.Row key={index + 100}>
                <Table.Cell>{item.nom}</Table.Cell>
                <Table.Cell>{item.temps}</Table.Cell>
                <Table.Cell><Button onClick={() => deleteTask(data.id, item.tache_id)} circular inverted icon='delete' color='red'/></Table.Cell>
                <Table.Cell>{getStats(item.tache_id, data.nom)}</Table.Cell>
            </Table.Row>
        );
      }else{
        return;
      }
    });

    return ( 
      <>
        <Table collapsing color={colors[data.id % 13]} >
        <Table.Header >
          <Table.Row>
            <Table.HeaderCell colSpan='5'  textAlign='center' >
              {data.nom + '.     '} <Label pointing='left' size='tiny' color='orange'>{data.left_time} min libres.</Label>
              <Button onClick={() => {setIsOpen(!isOpen); setEditing({edit: !isOpen, id: data.id});}} icon='edit outline' inverted color='green' floated='right'/>
            </Table.HeaderCell>
          </Table.Row>
          <Table.Row>
            <Table.HeaderCell colSpan='1'  textAlign='center'>Tache</Table.HeaderCell>
            <Table.HeaderCell colSpan='2'  textAlign='center'>Temps(min.)</Table.HeaderCell>
            <Table.HeaderCell colSpan='1'  textAlign='center'>Qui fait cette tache aussi?</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
    
        <Table.Body>
          {!!data && tab}
        </Table.Body>
      </Table>

      {isOpen && <RightTable data={data} changeData={changeData} setStats={setStats} stats={stats} />}
      </>
    );
}

export default TacheTable;