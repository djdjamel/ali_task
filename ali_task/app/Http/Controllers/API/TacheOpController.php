<?php
   
namespace App\Http\Controllers\API;
   
use Illuminate\Http\Request;
use App\Http\Controllers\API\BaseController as BaseController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\API\TaskStruct;
   
class TacheOpController extends BaseController
{

    /** input: 1-present users(ids)
     *         2-date (for which we want the plan)
     * 
     * output: list of users with list of task for each one
     * return: true if success or false if fail
    */
    public function get_program(Request $request)
    {
        $validator = Validator::make($request->all(),[
            'ids' => 'required|array',
            'ids.*' => 'exists:users,id'
        ]);

        if ($validator->fails()) {
            return $this->sendError('Erreur  de validation', $validator->errors());
        }

        $usersIds = $request->input('ids');
        // order users by level from high to low (4 to 1) in order that the the simplest agent takes more basic tasks
        // so they will not be availble for the high order agent
        $usersIds = User::select("*")->whereIn('id', $usersIds)
                                     ->orderBy('level', 'desc')
                                     ->get();

        return $this->program_commun_root($usersIds, true);
    }

    public function program_commun_root(&$usersIds, $nouveau)
    {
        $program = array();

        //1- get the list of must do tasks
        $x = 0;
        foreach ($usersIds as $user)
        {
            $program[$x] = new TaskStruct($user);

            //ajouter les taches posssibles avec champs de last done date(score_date)
            $taches_avec_historic = DB::select('CALL user_task_last_done_diff(' . $user->id . ')');
            $program[$x]->batch_add_historic($taches_avec_historic);

            //marquer les taches par done = 1 (celles fixes trouvées)
            $fix_taches = DB::select('CALL user_fix_last_done_diff(' . $user->id . ')');
            $program[$x]->batch_add_fix_to_historic($fix_taches);
            $x++;
        }
        $l = $x;

        if($nouveau)
        {
            //s'il n'y a pas de program pré-établie pour ajourdh'huit.. proposer un
            $this->distribuer_les_taches($program, $l);
        }else{
            if($l === 1){
                $this->add_todays_program_one_user($program,$l);
            }else{
                $this->add_todays_program($program,$l);
            }     
        }
        // ici on prépare le retour de la fonction(tableau des users et leurs taches possibles et assignées)
        $output = array();
        $message = '';
        for ($x = 0; $x < $l; $x++)
        {
            $output[] = $program[$x]->print_message();
            $msg = '';//$program[$x]->save_tasks();
            if($msg !== ''){
                $message.= 'error at '.$x.', msg: '.$msg.PHP_EOL;
            }
        }

        return $this->sendResponse($output, $message);
    }

    // voir s'il ya un programme pré-établie: marquer alors les taches du $program (done = 1)
    // return: 0 si pas de programme, > 0 ($len) s'il y 'en a un
    public function add_todays_program(&$program, $l)
    {
        $plan = DB::select('CALL get_todays_plan()');
        if(empty($plan))
        {
            return 0;
        }
        
        $plan = json_decode(json_encode($plan), true);
        $len = count($plan);
        $x = 0;
        while ($x < $len)
        {
            $user_index = $this->get_user_index_in_program($program, $l, $plan[$x]['user_id']);
            $current_user = $plan[$x]['user_id'];
            while($plan[$x]['user_id'] == $current_user )
            {
                $program[$user_index]->assign_une_tache($plan[$x]['tache_id']);
                $x++;
                if($x === $len) break;
            }
        }

        return $len;
    }

    public function add_todays_program_one_user(&$program, $l)
    {
        $plan = DB::select('CALL get_todays_plan_one_user('.$program[0]->id.')');
        if(empty($plan))
        {
            return 0;
        }
        
        $plan = json_decode(json_encode($plan), true);
        $len = count($plan);
        $x = 0;
        while ($x < $len)
        {
            $program[0]->assign_une_tache($plan[$x]['tache_id']);
            $x++;
            if($x === $len) break;
        }

        return $len;
    }

    // rechercher l'index du user_id dans le tableau program 
    public function get_user_index_in_program($program, $l, $user_id){
        for($x = 0; $x < $l; $x++){
            if($program[$x]->id == $user_id){
                return $x;
            }
        }
    }

    public function distribuer_les_taches(&$program, $l)
    {
        // à partir d'ici on commence à remplir(distribuer) les taches (unique tout d'abord puis le reste)
        $taches_unique = DB::select('CALL tache_ids_unique()');
        $taches_unique = json_decode(json_encode($taches_unique), true);
        $unique_len = count($taches_unique);
        $start = 0;
        $x = 0;

        //var_dump($taches_unique);
        for ($i = $start; $i < $unique_len; $i++)
        {
            //echo ' ********* tache_id='.$taches_unique[$i]['tache_id'].PHP_EOL;
            $changed = 0;
            for ($x = 0; $x < $l; $x++)
            {
                //echo 'x='.$x.PHP_EOL;
                $index = $program[$x]->assign_une_tache($taches_unique[$i]['tache_id']);
                //echo ' index='.$index;
                if($index > -1) //affecté
                {
                    $taches_unique[$i]['done'] = 1; // zayda
                    //echo ' done by:'.$program[$x]->nom.PHP_EOL;
                    usort($program, function($a, $b) {
                        if($a->level == $b->level){
                            if($a->left_time == $b->left_time){
                                return 0;
                            }else{
                                return $a->left_time < $b->left_time ? 1 : -1;
                            }
                        };
                        return $a->level < $b->level ? 1 : -1;
                    });
                    $changed = 1;
                    break;
                }
                //echo PHP_EOL;
            }
        }   
 
        $taches_non_unique = DB::select('CALL tache_ids_non_unique()');
        $taches_non_unique = json_decode(json_encode($taches_non_unique), true);

        for ($x = 0; $x < $l; $x++)
        {
            $program[$x]->assign_taches($taches_non_unique);
        }
        
        
    }

    /**
     * at this moment the user is logged in
     * this function returns user's tasks for today
     */

    public function get_todays_program_for_user()
    {
        $output = array();
        $usersIds = DB::select('CALL get_todays_plan_user('.Auth::user()->id.')');
        if(empty($usersIds))
        {
            // retourner une reponse vide pour que le frontend affiche(demande) la liste des emloyées pour leur faire un nouveau program
            $output['success'] = true;
            $output['data'] = [];
            return $this->sendResponse($output, 'vide');
        }
        
        return $this->program_commun_root($usersIds, false);

        /*
        $output = array();
        $plan = DB::select('CALL get_todays_plan_user('.Auth::user()->id.')');
        if(empty($plan))
        {
            $output['success'] = true;
            $output['data'] = [];
            return $this->sendResponse($output, 'vide');
        }
        
        $plan = json_decode(json_encode($plan), true);
        $len = count($plan);
        $output = array();
        $output['nom'] = $plan[0]['nom'];
        $output['id'] = $plan[0]['user_id'];

        $x = 0;
        while ($x < $len)
        {
            $une_tache['nom'] = $plan[$x]['tache_nom'];
            $une_tache['tache_id'] = $plan[$x]['tache_id'];
            $output['tache'][] = $une_tache;
            $x++;
        }

        return $this->sendResponse($output, 'plein');*/
    }

    public function get_todays_program()
    {
        $output = array();
        $usersIds = DB::select('CALL get_todays_plan_user_ids()');
        if(empty($usersIds))
        {
            // retourner une reponse vide pour que le frontend affiche(demande) la liste des emloyées pour leur faire un nouveau program
            $output['success'] = true;
            $output['data'] = [];
            return $this->sendResponse($output, 'vide');
        }
        
        return $this->program_commun_root($usersIds, false);
    }

    public function get_users()
    {
        $table = User::select('id', 'name')->orderBy('name', 'asc')->get();
        return $this->sendResponse($table, 'liste des utilisateurs.');
    }

    public function save_program(Request $request)
    {
        //$data = json_decode($request->program, true);
        $validator = Validator::make($request->all(),[
            'program' => 'required|array',
            'program.*.user' => 'exists:users,id',
            'program.*.tache_id' => 'exists:tache,id',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Erreur  de validation', $validator->errors());
        }

        $data = $request->input('program');
        $l = count($data);
        $error  = 0;
        $message = '';

        DB::beginTransaction();
        DB::select('CALL delete_todays_program()');
        // attention il faut tout d'abord supprimer l'ancien(du meme jour s'il existe) avant d'insérer le nouveau
        for ($x = 0; $x < $l; $x++) {
            $obj = $data[$x];
                try {                
                    DB::insert('insert into plan(user_id, tache_id, date_plan, created_at)
                                        values (?, ?, ?, ?)', [$obj['user'], $obj['tache_id'], date('Y-m-d H:i:s'), date('Y-m-d H:i:s')]);
                } catch (\Exception $e) {
                    $error += 1;
                    $message .= $e->getMessage() . PHP_EOL;
                }
        }

        if ($error > 0) {
            DB::rollback();
            return $this->sendError('Erreur  lors d\'enregistrement', $message);
        } else {
            DB::commit();
            return $this->sendResponse('Nombre:'.$x, 'Enregistré.');
        }
        //return $this->sendResponse($data[0]['user'], 'Enregistré.');
    }
}