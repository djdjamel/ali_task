<?php
   
namespace App\Http\Controllers\API;
   
use Illuminate\Http\Request;
use App\Http\Controllers\API\BaseController as BaseController;
use Illuminate\Support\Facades\Validator;
use App\Models\Tache;
use App\Http\Resources\Tache as TacheResource;
   
class TacheController extends BaseController
{

    public function index()
    {
        $Taches = Tache::all();
        return $this->sendResponse(TacheResource::collection($Taches), 'Posts fetched.');
    }
    
    public function store(Request $request)
    {
        $input = $request->all();
        $validator = Validator::make($input, [
            'nom' => 'required',
            'description' => 'required'
        ]);
        if($validator->fails()){
            return $this->sendError($validator->errors());       
        }
        $Tache = Tache::create($input);
        return $this->sendResponse(new TacheResource($Tache), 'Post created.');
    }
   
    public function show($id)
    {
        $Tache = Tache::find($id);
        if (is_null($Tache)) {
            return $this->sendError('Post does not exist.');
        }
        return $this->sendResponse(new TacheResource($Tache), 'Post fetched.');
    }
 
    public function update(Request $request, Tache $Tache)
    {
        $input = $request->all();

        $validator = Validator::make($input, [
            'nom' => 'required',
            'description' => 'required'
        ]);

        if($validator->fails()){
            return $this->sendError($validator->errors());       
        }

        $Tache->title = $input['nom'];
        $Tache->description = $input['description'];
        // ajouter les autres champs
        $Tache->save();
        
        return $this->sendResponse(new TacheResource($Tache), 'Post updated.');
    }
   
    public function destroy(Tache $Tache)
    {
        $Tache->delete();
        return $this->sendResponse([], 'Post deleted.');
    }
}