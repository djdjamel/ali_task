import { useContext, useState } from 'react';
import { AuthContext } from '../components/auth-context';
import { Header, Table, Segment, Button, Label } from 'semantic-ui-react';

const StaticTacheTable = ({data}) => {

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


    /*const getStats = (tache_id, nom) => {
      if(!stats[tache_id]) return (<Label color='red'>Aucun.</Label>);
      return stats[tache_id].map((item,index) => {
              if(item === nom) return;
              const firstName = item.substr(0, item.indexOf(' ')) || item;
              return (<Label size='tiny' key={index} color={colors[index % 13]}>{firstName}</Label>);
            });
    }*/
      
    const tab = data.tache.map((item, index) => {
      if(item.done === 1){
        return (
            <Table.Row key={index + 100}>
                <Table.Cell>{item.nom}</Table.Cell>
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
            </Table.HeaderCell>
          </Table.Row>
          <Table.Row>
            <Table.HeaderCell colSpan='1'  textAlign='center'>Tache</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
    
        <Table.Body>
          {!!data && tab}
        </Table.Body>
      </Table>

      </>
    );
}

export default StaticTacheTable;