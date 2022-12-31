<?php
   
namespace App\Http\Controllers\API;

use Illuminate\Support\Facades\DB;
   
class TaskStruct
{
    public $journee;
    public $left_time;
    public $taches;
    public $historic;
    public $level;
    public $matin;
    public $nom;
    public $id;

    public function __construct($user) {

        $this->journee = $user->temps;
        $this->left_time = $user->temps;
        $this->taches = array();
        $this->historic = array();
        $this->level = $user->level;
        $this->matin = $user->matin;
        $this->nom = $user->name;
        $this->id = $user->id;
    }
/*
    public function tache_exist($tacheId)
    {
        if(count($this->historic) == 0)
        {
            return false;
        }
        $x = 0;
        $len = count($this->historic['tache']);
        $cmp = -1;
        while($x < $len && $cmp !== 0)
        {
            $cmp = $this->historic['tache'][$x]['tache_id'] - $tacheId;
            $x++;
        }
        if($x === $len)
        {
            return 0;
        }else{
            return 1;
        }
    }
*/
    /*public function add_tache($tacheId)
    {
        if($this->tache_exist($tacheId))
        {
            return false;
        }
        $this->taches[] = $tacheId;
    }*/
/*
    public function batch_add_tache($taches)
    {
        $temp = json_decode(json_encode($taches), true);
        foreach ($temp as $row) {
            $this->add_tache($row['tache_id']);
        }
        // order users by level from high to low (4 to 1)
        usort($this->taches,function($first,$second){
            return $first->level < $second->level;
        });
    }
*/
    //ajouter les taches possible pour cet user classé par level asc, matin desc, priorité asc
    public function batch_add_historic($taches)
    {
        $temp = json_decode(json_encode($taches), true);
        foreach ($temp as $row) {
            $this->historic['done'][] = 0;
            $this->historic['tache'][] = $row;
        }
    }

    public function get_index(&$tache, $tache_id)
    {
        $len = count($tache);
        $x = 0;
        $cmp = -1;
        while ($x < $len && $cmp !== 0) {
            $cmp = $tache[$x]['tache_id'] - $tache_id;
            //echo 'x='.$x.' cmp='.$cmp.' unique_tache_id='.$tache[$x]['tache_id'].' tache_id='.$tache_id.' ';
            $x++;
        }
        if($x === $len)
        {
            return -1;
        }else{
            return $x - 1;
        }
    }

    public function batch_add_fix_to_historic($taches)
    {
        $temp = json_decode(json_encode($taches), true);
        foreach ($temp as $row) {
            //$this->add_tache($row['tache_id']);
            for ($x = 0; $x < count($this->historic['tache']); $x++) {
                if($this->historic['tache'][$x]['tache_id'] == $row['tache_id'])
                {
                    $this->historic['done'][$x] = 1;
                    $this->left_time -= $this->historic['tache'][$x]['temps_estime'];
                }
            }            
        }
        // order users by level from high to low (4 to 1)
        usort($this->taches,function($first,$second){
            return $first->level < $second->level;
        });
    }
    // pour l'historique (taches possibles) marquer celles choisies par done=1 et continuer à itérer en respectant les règles
    // this function is to mark done tasks from historic and let the others know about this (mark done) via marking taches_list
    // NB: this is (taches_list) useless in case of non unique tasks(we dont care to let the others know about it)
    public function assign_taches(&$taches_list, $done = true)
    {
        $changed = 0;
        for ($x = 0; $x < count($this->historic['tache']); $x++) {
            if($this->left_time <= 0)   break;
            if($this->historic['tache'][$x]['unique'] === 1) continue; // ne pas assiger les taches uniques pr le moment
            if($this->historic['done'][$x] == 0)
            {
                    $temp = $this->historic['tache'][$x]['temps_estime'];
                    if(($temp * 8 / 10) <= $this->left_time)
                    {
                        $index = $this->get_index($taches_list, $this->historic['tache'][$x]['tache_id']);
                        if($index == -1)
                        {
                            //non trouve
                        }else{
                            $this->historic['done'][$x] = 1;
                            $this->left_time -= $temp;
                            $changed = 1;
                            if($done == true) $taches_list[$index]['done'] = 1;
                        }
                    }
                
            }
        }
        return $changed;
    }

    public function assign_une_tache($taches_id)
    {
        if($this->left_time <= 0)   return -1;
        $index = $this->get_index($this->historic['tache'], $taches_id);
        if($index === - 1)
        {
            return - 1; // tache non presente dans les taches possibles
        }
        $temp = $this->historic['tache'][$index]['temps_estime'];
        if(($temp * 8 / 10) <= $this->left_time)
        {
            $this->historic['done'][$index] = 1;
            $this->left_time -= $temp;
            //$taches_list[$index]['done'] = 1; 
            return $index;           
        }
        return -1;
    }

    public function print_message()
    {
        $output = array();
        $output['nom'] = $this->nom;
        $output['id'] = $this->id;
        $output['left_time'] = $this->left_time;

        for ($x = 0; $x < count($this->historic['tache']); $x++) {
            //if($this->historic['done'][$x] == 1)
            //{
                $une_tache['nom'] = $this->historic['tache'][$x]['nom'];
                $une_tache['description'] = $this->historic['tache'][$x]['description'];
                $une_tache['tache_id'] = $this->historic['tache'][$x]['tache_id'];
                $une_tache['level'] = $this->historic['tache'][$x]['level'];
                $une_tache['done'] = $this->historic['done'][$x];
                $une_tache['temps'] = $this->historic['tache'][$x]['temps_estime'];
                $output['tache'][] = $une_tache;
            //}
        }
        return $output;        
    }

    public function save_tasks()
    {    
        $error  = 0;
        $message = '';

        DB::beginTransaction();

        for ($x = 0; $x < count($this->historic['tache']); $x++) {
            if($this->historic['done'][$x] == 1)
            {
                try {
    
                    DB::insert('insert into plan(user_id, tache_id, date_plan, created_at)
                                        values (?, ?, ?, ?)', [$this->id, $this->historic['tache'][$x]['tache_id'], date('Y-m-d H:i:s'), date('Y-m-d H:i:s')]);
                } catch (\Exception $e) {
                    $error += 1;
                    $message .= $e->getMessage() . PHP_EOL;
                }
            }

        }

        if ($error > 0) {
            DB::rollback();
            return $message;
        } else {
            DB::commit();
            return '';
        }
    }
}